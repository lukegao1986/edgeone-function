import * as mysql from 'mysql2/promise';
import { EJU_SYLLABUS, SubtopicNode } from '../src/data/ejuSyllabus';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI client for DeepSeek API
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

// Call DeepSeek LLM
async function callLLM(prompt: string, options: any): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "deepseek-chat", // DeepSeek's main model
      temperature: options.temperature || 0,
      response_format: { type: 'json_object' } // Ensure JSON output
    });

    return completion.choices[0].message.content || '{}';
  } catch (error) {
    console.error("LLM API Call failed:", error);
    throw error;
  }
}

// 1. 构建分考点查找索引：topic_code → SubtopicNode[]
const SUBTOPICS_BY_TOPIC_CODE: Record<string, SubtopicNode[]> = {};
function buildIndex() {
  for (const mainSubject of EJU_SYLLABUS) {
    for (const subSubject of mainSubject.subSubjects || []) {
      for (const chapter of subSubject.chapters || []) {
        for (const section of chapter.sections || []) {
          for (const topic of section.topics || []) {
            if (topic.subtopics && topic.subtopics.length > 0) {
              SUBTOPICS_BY_TOPIC_CODE[topic.id] = topic.subtopics; // Use topic.id which holds the code
            }
          }
        }
      }
    }
  }
}

// Helper to get topic name
function getTopicName(topicCode: string): string {
  for (const mainSubject of EJU_SYLLABUS) {
    for (const subSubject of mainSubject.subSubjects || []) {
      for (const chapter of subSubject.chapters || []) {
        for (const section of chapter.sections || []) {
          for (const topic of section.topics || []) {
            if (topic.id === topicCode) {
              return topic.title;
            }
          }
        }
      }
    }
  }
  return topicCode;
}

// 2. 构建 topic_code → topic DB id 的映射
let TOPIC_CODE_TO_ID: Record<string, number> = {};
async function loadTopicCodeMap(pool: any) {
  const [rows] = await pool.query('SELECT id, code FROM topics');
  for (const row of rows) {
    TOPIC_CODE_TO_ID[row.code] = row.id;
  }
}

// 3. 反向映射：topic DB id → topic code
let TOPIC_ID_TO_CODE: Record<number, string> = {};
function buildReverseMap() {
  for (const [code, id] of Object.entries(TOPIC_CODE_TO_ID)) {
    TOPIC_ID_TO_CODE[id as any] = code;
  }
}

function buildTaggingPrompt(question: any, topicName: string, subtopicList: SubtopicNode[]) {
  const optionsStr = typeof question.options === 'string' 
    ? JSON.parse(question.options).map((opt: string, i: number) => `${i + 1}. ${opt}`).join('\n')
    : (question.options || []).map((opt: string, i: number) => `${i + 1}. ${opt}`).join('\n');
    
  return `你是一个 EJU（日本留学試験）物理考试专家。

请分析以下题目，从给定的分考点列表中选择所有与该题目相关的分考点 code。

重要规则：
1. 一道题可以对应多个分考点，请选择所有涉及的分考点
2. 基于题目实际考查的知识点判断，不要仅凭关键词匹配
3. 如果题目涉及计算或应用，请选择解题所需的所有相关知识分考点
4. 至少选择 1 个分考点，最多不超过 5 个
5. 只从下方列表中选择 code，不要自行生成
6. 分考点列表中的 aliases 是同义/近义表达，帮助理解范围

该题目所属考点（topic）：${topicName}

可选分考点列表（JSON 格式）：
${JSON.stringify(
  subtopicList.map(st => ({
    code: st.code,
    name: st.name,
    aliases: st.aliases,
    description: st.description
  })), null, 2
)}

题目题干：
${question.stem}

选项：
${optionsStr}

正确答案：${question.correct_index}

请返回严格的 JSON 格式（不要包含其他文字）：
{"subtopic_codes": ["phy_1_1_1_04", "phy_1_1_1_02"]}`;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 4. 标注单题
async function tagQuestion(
  pool: any,
  question: any,
  isDryRun: boolean
): Promise<void> {
  const topicCode = TOPIC_ID_TO_CODE[question.topic_id];
  if (!topicCode) {
    console.warn(`[Skip] Topic id ${question.topic_id} not found in code map, skipping question ${question.id}`);
    return;
  }

  const subtopicNodes = SUBTOPICS_BY_TOPIC_CODE[topicCode] || [];
  if (subtopicNodes.length === 0) {
    console.warn(`[Skip] No subtopics defined for topic ${topicCode}, skipping question ${question.id}`);
    return;
  }

  const topicName = getTopicName(topicCode);
  const prompt = buildTaggingPrompt(question, topicName, subtopicNodes);
  
  if (isDryRun) {
    console.log(`\n[Dry Run] Would call LLM for question ${question.id} (topic: ${topicCode})`);
    console.log(`[Dry Run] Available subtopics: ${subtopicNodes.map(st => st.code).join(', ')}`);
    // Mock the LLM call
    const response = await callLLM(prompt, { temperature: 0 });
    const parsed = JSON.parse(response);
    console.log(`[Dry Run] LLM would return: ${parsed.subtopic_codes.join(', ')}`);
    return;
  }

  const response = await callLLM(prompt, { temperature: 0 });

  let subtopicCodes: string[];
  try {
    const parsed = JSON.parse(response);
    subtopicCodes = parsed.subtopic_codes;
  } catch {
    console.error(`❌ Failed to parse LLM response for question ${question.id}`);
    return;
  }

  const validCodes = new Set(subtopicNodes.map(st => st.code));
  const validSubtopicCodes = subtopicCodes.filter((c: string) => validCodes.has(c));

  if (validSubtopicCodes.length === 0) {
    console.warn(`⚠️ No valid subtopics returned for question ${question.id}`);
    return;
  }

  const placeholders = validSubtopicCodes.map(() => '?').join(',');
  const [subtopicRows] = await pool.execute(
    `SELECT id, code FROM subtopics WHERE code IN (${placeholders}) AND topic_id = ?`,
    [...validSubtopicCodes, question.topic_id]
  );

  for (const row of subtopicRows) {
    await pool.execute(
      `INSERT IGNORE INTO question_subtopics (question_id, subtopic_id) VALUES (?, ?)`,
      [question.id, row.id]
    );
  }

  console.log(`✅ Tagged question ${question.id}: ${validSubtopicCodes.join(', ')}`);
}

// 5. 批量标注
async function batchTagQuestions(pool: any, options: { force?: boolean, questionId?: number, limit?: number, dryRun?: boolean }) {
  let query = `SELECT q.* FROM questions q`;
  const params: any[] = [];

  if (options.questionId) {
    query += ` WHERE q.id = ?`;
    params.push(options.questionId);
  } else if (!options.force) {
    query += `
      LEFT JOIN question_subtopics qs ON q.id = qs.question_id
      WHERE qs.question_id IS NULL
    `;
  }
  
  query += ` ORDER BY q.id`;
  
  if (options.limit) {
    query += ` LIMIT ?`;
    params.push(options.limit);
  }

  if (options.force && !options.questionId && !options.dryRun) {
    console.log('⚠️ Force mode: Deleting all existing question_subtopics...');
    await pool.execute('DELETE FROM question_subtopics');
  } else if (options.force && options.questionId && !options.dryRun) {
    console.log(`⚠️ Force mode: Deleting existing question_subtopics for question ${options.questionId}...`);
    await pool.execute('DELETE FROM question_subtopics WHERE question_id = ?', [options.questionId]);
  }

  const [questions] = await pool.query(query, params);
  console.log(`Found ${questions.length} questions to tag`);

  for (const question of questions) {
    await tagQuestion(pool, question, !!options.dryRun);
    await sleep(500);
  }
}

// 入口
async function main() {
  const args = process.argv.slice(2);
  const options = {
    force: args.includes('--force'),
    dryRun: args.includes('--dry-run'),
    limit: args.find(a => a.startsWith('--limit=')) ? parseInt(args.find(a => a.startsWith('--limit='))!.split('=')[1]) : undefined,
    questionId: args.find(a => a.startsWith('--question-id=')) ? parseInt(args.find(a => a.startsWith('--question-id='))!.split('=')[1]) : undefined,
  };

  console.log('Starting tag-subtopics script with options:', options);

  buildIndex();
  
  const dbConfig = {
    host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
    port: 24547,
    user: 'root',
    password: '2199wlmm!',
    database: 'shuati_db'
  };
  const pool = mysql.createPool(dbConfig);
  
  await loadTopicCodeMap(pool);
  buildReverseMap();
  
  await batchTagQuestions(pool, options);
  
  await pool.end();
}

main();