const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

const mdPath = path.join(__dirname, '../docs/3 分考点标识问题/EJU理科Syllabus_topics梳理.md');
const mdContent = fs.readFileSync(mdPath, 'utf8');
const lines = mdContent.split('\n');

const topicsToSplit = {};
let inPart2 = false;

for (const line of lines) {
  if (line.includes('## Part 2 — 单 subtopic topic 待手动划分清单')) {
    inPart2 = true;
    continue;
  }
  if (inPart2 && (line.startsWith('| phy_') || line.startsWith('| chem_') || line.startsWith('| bio_'))) {
    const parts = line.split('|').map(p => p.trim());
    const topicId = parts[1];
    const content = parts[3];
    const isMultiple = parts[5] === '是';
    const suggestion = parts[6];
    if (isMultiple) {
      topicsToSplit[topicId] = { content, suggestion };
    }
  }
}

async function main() {
  const syllabusPath = path.join(__dirname, '../src/data/ejuSyllabus.ts');
  let updatedContent = fs.readFileSync(syllabusPath, 'utf8');

  for (const [topicId, data] of Object.entries(topicsToSplit)) {
    console.log(`Processing ${topicId}...`);
    
    const prompt = `你是一个 EJU（日本留学試験）理科题库的知识点分类专家。
我现在有一个 Topic（主题）下的原始内容（content），它目前只被划分成了一个粗略的 Subtopic，但这不够精确。
请你根据我提供的【拆分建议】和内容的逻辑关系，将它们拆分为多个合理、有独立考查意义的 Subtopic（分考点）。

【输入信息】
- Topic ID: ${topicId}
- 原始内容: ${data.content}
- 拆分建议: ${data.suggestion}

【要求】
1. 请把它们拆分成多个 Subtopic（至少2个）。
2. 每个 Subtopic 需要有：
   - name: 分考点的名称（简明扼要）
   - aliases: 包含的具体关键词别名数组
   - description: 简短描述（如 "xxxに関する問題"）
3. 返回格式必须是严格的 JSON 对象，键为 "subtopics"，值为数组。

请直接返回 JSON 对象，不要包含任何 markdown 代码块标记或其他说明文字。`;

    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that outputs raw JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    });

    let jsonStr = response.choices[0].message.content;
    let subtopics = [];
    try {
      subtopics = JSON.parse(jsonStr).subtopics;
    } catch (e) {
      console.error(`Failed to parse ${topicId}`);
      continue;
    }

    if (!subtopics || subtopics.length === 0) continue;

    const subtopicsArray = subtopics.map((st, index) => {
      const codeIndex = String(index + 1).padStart(2, '0');
      const aliasesStr = st.aliases ? st.aliases.map(a => `"${a.trim()}"`).join(', ') : `"${st.name}"`;
      return `                      {
                        "code": "${topicId}_${codeIndex}",
                        "name": "${st.name.trim()}",
                        "aliases": [${aliasesStr}],
                        "description": "${(st.description || st.name + 'に関する問題').trim()}"
                      }`;
    });
    
    const subtopicsStr = `,\n                    "subtopics": [\n${subtopicsArray.join(',\n')}\n                    ]`;
    
    // SAFE REPLACEMENT
    const parts = updatedContent.split(`"id": "${topicId}"`);
    if (parts.length === 2) {
      const before = parts[0];
      const after = parts[1];
      
      const contentMatch = after.match(/"content"\s*:\s*"[^"]+"/);
      if (contentMatch) {
        const contentEnd = contentMatch.index + contentMatch[0].length;
        const topicEndMatch = after.substring(contentEnd).match(/\n\s{18}\}/);
        
        if (topicEndMatch) {
          const originalSubtopicsStart = contentEnd;
          const originalSubtopicsEnd = contentEnd + topicEndMatch.index;
          
          const cleanAfter = after.substring(0, originalSubtopicsStart) + subtopicsStr + after.substring(originalSubtopicsEnd);
          updatedContent = before + `"id": "${topicId}"` + cleanAfter;
        }
      }
    }
  }

  fs.writeFileSync(syllabusPath, updatedContent, 'utf8');
  console.log('Successfully updated ejuSyllabus.ts!');
}

main().catch(console.error);
