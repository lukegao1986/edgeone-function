const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

// Max indexes initialized to 0
let maxC = 0;
let maxE = 0;
let maxB = 0;
let maxA = 0;

function parseMarkdown(content) {
  const lines = content.split('\n');
  const items = [];
  let currentItem = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match headers
    let match = line.match(/^(?:### Q|## 基本例題\s*|##\s*)(\d+)(.*)/);
    
    if (match && !line.match(/^## .*解答/)) {
      if (currentItem) {
        items.push(currentItem);
      }
      
      let qType = 'B';
      let diff = 2;
      if (line.includes('### Q')) { qType = 'C'; diff = 1; }
      else if (line.includes('基本例題')) { qType = 'E'; diff = 2; }
      else {
        for (let j = i - 1; j >= 0; j--) {
          if (lines[j].includes('基本問題')) { qType = 'B'; diff = 2; break; }
          if (lines[j].includes('リード C')) { qType = 'B'; diff = 2; break; }
          if (lines[j].includes('応用問題')) { qType = 'A'; diff = 3; break; }
        }
      }
      
      let bCode = '';
      if (qType === 'C') { maxC++; bCode = `phy-04-qC${maxC}`; }
      else if (qType === 'E') { maxE++; bCode = `phy-04-qE${maxE}`; }
      else if (qType === 'B') { maxB++; bCode = `phy-04-qB${maxB}`; }
      else if (qType === 'A') { maxA++; bCode = `phy-04-qA${maxA}`; }
      
      currentItem = {
        num: match[1],
        type: qType,
        difficultyLevel: diff,
        businessCode: bCode,
        title: line,
        content: []
      };
    } else if (currentItem) {
      if (!line.match(/^## .*解答/) && !line.startsWith('## 基本問題') && !line.startsWith('## リード C') && !line.startsWith('## 応用問題')) {
        currentItem.content.push(line);
      }
    }
  }
  if (currentItem) items.push(currentItem);
  return items;
}

const qContent = fs.readFileSync(path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter4_MD/charpter4_题目.md'), 'utf8');
const aContent = fs.readFileSync(path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter4_MD/charpter4_解析.md'), 'utf8');

const qItems = parseMarkdown(qContent);
const aItems = parseMarkdown(aContent);

// Pair them up
const pairs = [];
for (const q of qItems) {
  const a = aItems.find(x => x.num === q.num);
  pairs.push({
    businessCode: q.businessCode,
    difficultyLevel: q.difficultyLevel,
    questionText: q.title + '\n' + q.content.join('\n'),
    answerText: a ? a.content.join('\n') : ''
  });
}

const syllabusContent = fs.readFileSync(path.join(__dirname, '../src/data/ejuSyllabus.ts'), 'utf8');
const syllabusLines = syllabusContent.split('\n');
const phy1Lines = [];
let inPhy1 = false;
for (const line of syllabusLines) {
  if (line.includes('"id": "phy_1"')) inPhy1 = true;
  if (inPhy1) phy1Lines.push(line);
  if (inPhy1 && line.includes('"id": "phy_2"')) break;
}
const phy1Syllabus = phy1Lines.join('\n');

async function processChunk(chunkPairs) {
  const prompt = `你是一个 EJU 物理题库生成专家。请将以下 ${chunkPairs.length} 道题目转换为 JSON 数组。

【Syllabus 参考范围】
以下是可用的 Topic 和 Subtopic：
${phy1Syllabus}

【严格要求】
1. 输出必须是一个纯 JSON 数组，形如 \`[ { ... }, { ... } ]\`，不要输出 \`\`\`json 标记或任何其他文本。
2. JSON 字段：businessCode, topicCode, questionType (1), difficultyLevel, score (5), stem, options, correctIndex, explanation, subtopicCodes。
3. options 数量 = 2N+2（N 为小问数）。多问的答案合并成一个字符串选项。必须打乱正确答案的位置，不能总是在 0。如果题目/选项中有图片，必须在选项字符串里保留 \`![image](url)\`。
4. stem：保留日文原文、公式和图片 URL。如果有多个小问，请保留 (1)(2) 等编号在 stem 中。
5. explanation："【参考答案】: xxx\\n\\n【詳細な解説】: xxx"（解析强制使用纯中文！只保留必须的专有名词）。保留关键图片。
6. topicCode & subtopicCodes：请仔细阅读 syllabus，选择最匹配的考点（如力的平衡是 phy_1_1_3_02）。注意区分力的合成/分解(01)和力的平衡(02)。

【题目数据】
${JSON.stringify(chunkPairs, null, 2)}
`;

  const response = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'You are an expert EJU physics question converter. Output strictly valid JSON array without any markdown wrapper or explanation.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 8192
  });

  let content = response.choices[0].message.content.trim();
  if (content.startsWith('```json')) content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
  else if (content.startsWith('```')) content = content.replace(/^```\n/, '').replace(/\n```$/, '');
  
  return JSON.parse(content);
}

async function main() {
  let allJson = [];
  const chunkSize = 5;
  for (let i = 0; i < pairs.length; i += chunkSize) {
    const chunk = pairs.slice(i, i + chunkSize);
    console.log(`Processing questions ${i+1} to ${i + chunk.length}...`);
    let retries = 3;
    while(retries > 0) {
      try {
        const jsonArr = await processChunk(chunk);
        allJson = allJson.concat(jsonArr);
        console.log(`Successfully processed ${jsonArr.length} questions.`);
        break;
      } catch (e) {
        console.error(`Error processing chunk: ${e.message}`);
        retries--;
        if (retries === 0) throw e;
        console.log(`Retrying... (${retries} left)`);
      }
    }
  }

  const outFile = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter4_MD/phy_1_chapter04_questions.json');
  fs.writeFileSync(outFile, JSON.stringify(allJson, null, 2), 'utf8');
  console.log(`Saved ${allJson.length} questions to ${outFile}`);
  
  // Generate preview markdown
  let md = `# 第4章 题目预览 (共 ${allJson.length} 题)\n\n`;
  for (const q of allJson) {
    md += `## ${q.businessCode}\n`;
    md += `- 考点: ${q.topicCode} | 分考点: ${q.subtopicCodes?.join(', ')}\n`;
    md += `- 难度: ${q.difficultyLevel} | 选项数: ${q.options?.length} | 正确索引: ${q.correctIndex}\n\n`;
    md += `**题干**:\n${q.stem}\n\n`;
    md += `**选项**:\n`;
    q.options?.forEach((opt, idx) => {
      md += `${idx === q.correctIndex ? '✅' : '⚪'} [${idx}] ${opt}\n`;
    });
    md += `\n**解析**:\n${q.explanation}\n\n---\n\n`;
  }
  
  fs.writeFileSync(outFile.replace('.json', '_preview.md'), md, 'utf8');
}

main().catch(console.error);