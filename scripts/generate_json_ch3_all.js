const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

async function getMaxIndexes(chapterStr) {
  let connection;
  const maxIndexes = { C: 0, E: 0, B: 0, A: 0 };
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      `SELECT business_code FROM questions WHERE business_code LIKE ?`,
      [`phy-${chapterStr}-q%`]
    );
    rows.forEach(row => {
      const code = row.business_code;
      const match = code.match(/q([CEBA])(\d+)$/);
      if (match) {
        const type = match[1];
        const num = parseInt(match[2], 10);
        if (num > maxIndexes[type]) maxIndexes[type] = num;
      }
    });
  } catch (err) {
    console.error('获取最大编号失败:', err.message);
  } finally {
    if (connection) await connection.end();
  }
  return maxIndexes;
}

function safeChunkContent(content, partsCount) {
  const lines = content.split('\n');
  const safeBreaks = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^\d+\s/.test(lines[i]) || /^##\s/.test(lines[i])) {
      safeBreaks.push(i);
    }
  }
  const chunks = [];
  const step = Math.floor(safeBreaks.length / partsCount);
  let lastIdx = 0;
  for (let i = 1; i < partsCount; i++) {
    const breakLine = safeBreaks[i * step];
    chunks.push(lines.slice(lastIdx, breakLine).join('\n'));
    lastIdx = breakLine;
  }
  chunks.push(lines.slice(lastIdx).join('\n'));
  return chunks;
}

async function main() {
  const chapterStr = '03';
  const topicCode = 'phy_1_1_3'; // Since it's chapter 3
  
  const qFile = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter3_MD/MinerU_markdown_リードα_物理_charpter3.md');
  const aFile = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter3_MD/MinerU_markdown_リードα_物理物理_charpter3_解析.md');
  const sampleFile = path.join(__dirname, '../docs/0 数据准备/charpter 1/sample.json');
  
  const qContent = fs.readFileSync(qFile, 'utf8');
  const aContent = fs.readFileSync(aFile, 'utf8');
  const sampleContent = fs.readFileSync(sampleFile, 'utf8');

  // To avoid truncation, let's split into 5 parts.
  const qChunks = safeChunkContent(qContent, 5);
  const aChunks = safeChunkContent(aContent, 5);

  const parts = [];
  for (let i = 0; i < 5; i++) {
    parts.push({ q: qChunks[i], a: aChunks[i], suffix: 'part' + (i+1) });
  }

  console.log(`🔍 正在检查数据库以避免 business_code 重复 (chapter: ${chapterStr})...`);
  const maxIndexes = await getMaxIndexes(chapterStr);
  console.log(`📊 当前最大编号: C:${maxIndexes.C}, E:${maxIndexes.E}, B:${maxIndexes.B}, A:${maxIndexes.A}`);

  let allParsed = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    console.log(`🚀 Calling DeepSeek API for ${part.suffix}...`);

    const startC = maxIndexes.C + 1;
    const startE = maxIndexes.E + 1;
    const startB = maxIndexes.B + 1;
    const startA = maxIndexes.A + 1;

    const prompt = `你是一个 EJU（日本留学試験）物理题库编辑专家。

请阅读以下输入文件，将教材中的练习题转换为标准 JSON 题库格式。由于题目较多，这是第 ${i+1} 批数据。请确保返回格式是完整的 JSON 数组！

【输入信息】
1. 教材原文（含题目）：
${part.q}

2. 教材答案（含解析）：
${part.a}

3. JSON 格式模板（参考字段结构）：
${sampleContent}

4. 分考点标注参考范围：请参考 /Users/wanglimin/Desktop/edgeone-ex/src/data/ejuSyllabus.ts 中 { chapter_id: phy_1 } 下的所有 subtopics 及其 code。

【目标 topic 信息】
- topicCode: ${topicCode}
- 章号: ${chapterStr}

【JSON 字段说明】
每道题为一个 JSON 对象，所有题目组成一个 JSON 数组：
| 字段 | 类型 | 说明 |
|------|------|------|
| businessCode | string | 业务编码，格式：phy-{章号}-q{难度首字母}{序号} |
| topicCode | string | 考点代码，如 "${topicCode}" |
| questionType | int | 题型，固定为 1（单选题） |
| difficultyLevel | int | 难度：1=基础, 2=进阶, 3=挑战 |
| score | int | 分值，固定为 5 |
| stem | string | 题干，保留 LaTeX 公式和图片 URL |
| options | string[] | 选项数组，数量 = 2N+2（见下方规则） |
| correctIndex | int | 正确选项的索引（0-based），取值 0 ~ 2N+1 |
| explanation | string | 解析，格式见下方 |
| subtopicCodes | string[]? | 可选，分考点代码数组 |

【businessCode 命名规则】
- 格式：phy-${chapterStr}-q{难度首字母}{序号}
- 难度首字母：C(基礎CHECK), E(基本例題), B(基本問題/リード C), A(応用問題)
- 本次录入必须严格从以下序号开始递增：
  - C: 从 ${startC} 开始
  - E: 从 ${startE} 开始
  - B: 从 ${startB} 开始
  - A: 从 ${startA} 开始

【options 生成规则】
1. 选项数量 = 2N+2 (N=小问数/填空数)
2. 必须包含正确答案
3. 多问题选项各小问用逗号/分号分隔
4. correctIndex 必须随机分布
5. 必须保留图片 URL

【explanation 格式要求】
"explanation": "【参考答案】: {正确答案}\\n\\n【详细解析】: {详细解题过程}"
- 解析解说必须以中文为主撰写
- 必须保留所有相关的图片 URL

【stem 格式要求】
- 保持日文原文，保留 LaTeX 公式
- 必须保留所有图片 URL

【subtopicCodes 字段】
从 chapter_id: phy_1 的 subtopics 中挑选出最相关、最核心的 1~3 个 subtopicCodes。

请严格返回 JSON 数组（不要包装在其他对象中），不要输出其他内容。`;

    try {
      const response = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0,
        max_tokens: 8192,
        response_format: { type: 'json_object' }
      });

      let jsonStr = response.choices[0].message.content;
      let parsed = [];
      try {
        let rawParsed;
        const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          rawParsed = JSON.parse(arrayMatch[0]);
        } else {
          rawParsed = JSON.parse(jsonStr);
        }
        if (rawParsed.questions) rawParsed = rawParsed.questions;
        
        parsed = rawParsed.map(q => {
          const originalOptions = q.options;
          const correctOption = originalOptions[q.correctIndex];
          let indexedOptions = originalOptions.map((opt, index) => ({ opt, index }));
          for (let j = indexedOptions.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [indexedOptions[j], indexedOptions[k]] = [indexedOptions[k], indexedOptions[j]];
          }
          const shuffledOptions = indexedOptions.map(item => item.opt);
          const newCorrectIndex = shuffledOptions.indexOf(correctOption);
          return { ...q, options: shuffledOptions, correctIndex: newCorrectIndex };
        });
        
        // Update maxIndexes for the next iteration
        parsed.forEach(q => {
          const code = q.businessCode;
          const match = code.match(/q([CEBA])(\d+)$/);
          if (match) {
            const type = match[1];
            const num = parseInt(match[2], 10);
            if (num > maxIndexes[type]) maxIndexes[type] = num;
          }
        });
        allParsed = allParsed.concat(parsed);
        console.log(`✅ Extracted ${parsed.length} questions from ${part.suffix}`);
        
      } catch (e) {
        console.error(`❌ Failed to parse JSON for ${part.suffix}:`, e);
        fs.writeFileSync(path.join(__dirname, `../docs/0 数据准备/charpter 2-10/charpter3_MD/${topicCode}_questions_${part.suffix}.raw`), jsonStr);
      }
    } catch (apiErr) {
      console.error(`❌ API error for ${part.suffix}:`, apiErr.message);
    }
  }

  const outputFile = path.join(__dirname, `../docs/0 数据准备/charpter 2-10/charpter3_MD/${topicCode}_questions.json`);
  const previewFile = path.join(__dirname, `../docs/0 数据准备/charpter 2-10/charpter3_MD/${topicCode}_questions_preview.md`);

  fs.writeFileSync(outputFile, JSON.stringify(allParsed, null, 2), 'utf8');
  console.log(`✅ Generated total ${allParsed.length} questions to ${outputFile}`);
  
  let previewMd = `# ${topicCode} 题目预览\n\n总题数: ${allParsed.length}\n\n`;
  for (const q of allParsed) {
    previewMd += `## [难度:${q.difficultyLevel}] ${q.businessCode} (选项数: ${q.options.length})\n\n`;
    previewMd += `**题干**:\n${q.stem}\n\n`;
    previewMd += `**选项**:\n`;
    q.options.forEach((opt, idx) => {
      previewMd += `${idx === q.correctIndex ? '✅' : '❌'} ${idx}. ${opt}\n`;
    });
    previewMd += `\n**解析**:\n${q.explanation}\n\n`;
    previewMd += `**考点**: ${q.subtopicCodes ? q.subtopicCodes.join(', ') : '未标注'}\n\n---\n\n`;
  }
  
  fs.writeFileSync(previewFile, previewMd, 'utf8');
  console.log(`✅ Generated preview to ${previewFile}`);
}

main().catch(console.error);