const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

const jsonPath = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter4_MD/phy_1_chapter04_questions.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

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

async function fixTopics(questions) {
  const prompt = `你是一个 EJU 物理题库编辑专家。
以下是一批题目的 JSON 数据。它们的 topicCode 为空或不准确。
请阅读每道题的 stem（题干）和 explanation（解析），并参考以下 EJU Syllabus，为每道题重新分配最合适的 topicCode（如 "phy_1_1_5" 或 "phy_1_1_6" 等，必须是 topic 级别的 ID，如 phy_1_1_1, phy_1_1_2, phy_1_1_3, phy_1_1_4, phy_1_1_5, phy_1_1_6）。

【Syllabus 参考】
${phy1Syllabus}

【严格要求】
1. 只需要返回一个 JSON 数组，格式为：[{"businessCode": "phy-04-qC1", "topicCode": "phy_1_1_5"}, ...]
2. 只返回这两个字段，不要其他任何字段！这样可以避免内容过长被截断。
3. 不要输出任何 markdown 标记。

【输入 JSON 数组】
${JSON.stringify(questions.map(q => ({businessCode: q.businessCode, stem: q.stem.substring(0, 100), explanation: q.explanation.substring(0, 100)})), null, 2)}
`;

  const response = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'You are an expert EJU physics question converter. Output strictly valid JSON array.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 4096
  });

  let content = response.choices[0].message.content.trim();
  if (content.startsWith('```json')) content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
  else if (content.startsWith('```')) content = content.replace(/^```\n/, '').replace(/\n```$/, '');
  
  return JSON.parse(content);
}

async function main() {
  let fixedMappings = [];
  const chunkSize = 15;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    console.log(`Processing questions ${i+1} to ${Math.min(i + chunkSize, data.length)}...`);
    let retries = 3;
    while(retries > 0) {
      try {
        const mappings = await fixTopics(chunk);
        fixedMappings = fixedMappings.concat(mappings);
        console.log(`Successfully processed ${mappings.length} questions.`);
        break;
      } catch (e) {
        console.error(`Error processing chunk: ${e.message}`);
        retries--;
        if (retries === 0) throw e;
        console.log(`Retrying... (${retries} left)`);
      }
    }
  }

  // Apply mappings
  fixedMappings.forEach(mapping => {
    const q = data.find(x => x.businessCode === mapping.businessCode);
    if (q) {
      q.topicCode = mapping.topicCode;
      q.mainSubjectId = 3;
      q.subSubjectId = 2;
      q.chapterId = 1;
      q.sectionId = 1; 
      if (q.topicCode === 'phy_1_1_6') q.sectionId = 2; 
    }
  });

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Saved fixed questions to ${jsonPath}`);
}

main().catch(console.error);