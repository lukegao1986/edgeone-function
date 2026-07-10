const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

// 提取原始内容
function extractRawContent(markdownPath, subjectPrefix) {
  if (!fs.existsSync(markdownPath)) return {};
  
  const content = fs.readFileSync(markdownPath, 'utf8');
  const lines = content.split('\n');
  
  const mapping = {};
  
  let currentChapter = 0;
  let currentSection = 0;
  let currentTopic = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.match(/^##\s+[IVX]+\s+/)) {
      currentChapter++;
      currentSection = 0;
      currentTopic = 0;
      continue;
    }
    
    if (line.match(/^###\s+\d+\./)) {
      currentSection++;
      currentTopic = 0;
      continue;
    }
    
    if (line.match(/^####\s+\(\d+\)/)) {
      currentTopic++;
      
      let nextLineIdx = i + 1;
      let topicContent = [];
      while (nextLineIdx < lines.length && !lines[nextLineIdx].trim().startsWith('#')) {
        if (lines[nextLineIdx].trim()) {
          topicContent.push(lines[nextLineIdx].trim());
        }
        nextLineIdx++;
      }
      
      const topicId = `${subjectPrefix}_${currentChapter}_${currentSection}_${currentTopic}`;
      if (topicContent.length > 0) {
        mapping[topicId] = topicContent.join(' ');
      } else {
        // 如果连一行内容都没有，把标题作为默认 content
        const titleMatch = line.match(/^####\s+\(\d+\)(.*)/);
        if (titleMatch) {
          mapping[topicId] = titleMatch[1].trim();
        }
      }
      i = nextLineIdx - 1;
    }
  }
  
  return mapping;
}

const phyPath = path.join(__dirname, '../docs/考试大纲/理综大纲/2026_syllabus_phy.md');
const chemPath = path.join(__dirname, '../docs/考试大纲/理综大纲/2026_syllabus_chem.md');
const bioPath = path.join(__dirname, '../docs/考试大纲/理综大纲/2026_syllabus_bio.md');

const phyContent = extractRawContent(phyPath, 'phy');
const chemContent = extractRawContent(chemPath, 'chem');
const bioContent = extractRawContent(bioPath, 'bio');

const allContent = { ...phyContent, ...chemContent, ...bioContent };

async function processSubtopicsWithLLM(contentMap) {
  const prompt = `你是一个 EJU（日本留学試験）理科（物理、化学、生物）题库的知识点分类专家。
我现在有一批各个 Topic（主题）下的原始内容（通常是用逗号分隔的关键词），请你根据这些关键词的内在逻辑关系，将它们重新组合、提炼为更合理、更有概括性的 Subtopic（分考点）。

【划分原则】
1. 必须提供分类，**绝对不能返回空数组**。如果内容非常短，就直接将内容本身作为一个唯一的 Subtopic 返回。
2. **同名合并**：确保返回的 Subtopic 数组中，**name 必须唯一**。如果有几个词最终都指向同一个概括性名称，请把它们合并成一个 Subtopic，将其各自的关键词放进 aliases 数组里。
3. 不要死板地按逗号分割。例如：“クロム,マンガン,鉄,銅,亜鉛,銀,水銀,及びそれらの化合物の性質や反応,及び用途” 不应被切分为 9 个，而应提炼为如：“遷移元素（クロム・マンガン・鉄・銅など）”、“遷移元素の化合物とその性質”、“金属の用途”等具有独立考查意义的分考点。
4. 关系密切的概念应合并。例如：“位置,変位,速度,加速度,相対運動” 可分为：“位置と変位”、“速度と加速度”、“相対運動” 3 个分考点。
5. 每个 Subtopic 需要有：
   - name: 分考点的名称（简明扼要，如“速度と加速度”）
   - aliases: 包含的具体关键词别名数组（如 ["速度", "加速度", "初速度"]）
   - description: 简短描述（如 "速度と加速度に関する問題"）
6. 返回格式必须是严格的 JSON 对象，键为传入的 topicId，值为该 topic 下划分出的 Subtopic 数组。

【输入数据】
${JSON.stringify(contentMap, null, 2)}

【输出格式示例】
{
  "phy_1_1_1": [
    {
      "name": "位置と変位",
      "aliases": ["位置", "変位"],
      "description": "物体の位置や変位に関する問題"
    },
    {
      "name": "速度と加速度",
      "aliases": ["速度", "加速度", "相対運動"],
      "description": "速度、加速度、相対運動に関する問題"
    }
  ],
  "phy_1_2_3": [
    {
      "name": "力学的エネルギーの保存",
      "aliases": ["力学的エネルギーの保存"],
      "description": "力学的エネルギーの保存に関する問題"
    }
  ]
}

请直接返回 JSON 数据，不要包含任何 markdown 代码块标记或其他说明文字。`;

  console.log('Calling DeepSeek API to refine subtopics...');
  
  const response = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that outputs raw JSON only.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 8192,
    response_format: { type: 'json_object' }
  });

  const jsonStr = response.choices[0].message.content;
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse JSON from LLM:', e);
    return {};
  }
}

async function main() {
  const entries = Object.entries(allContent);
  const refinedSubtopics = {};
  
  const filteredEntries = entries.filter(([id]) => id !== 'phy_1_1_1');
  
  const batchSize = 15;
  for (let i = 0; i < filteredEntries.length; i += batchSize) {
    const batch = Object.fromEntries(filteredEntries.slice(i, i + batchSize));
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(filteredEntries.length / batchSize)}...`);
    
    try {
      const result = await processSubtopicsWithLLM(batch);
      // 容错处理：确保合并后的数组按 name 去重合并
      for (const key in result) {
        let subs = result[key];
        if (!subs || subs.length === 0) {
          // 如果大模型依然返回空数组，强行以 content 本身作为一个 subtopic
          subs = [{
            name: batch[key].split(',')[0] || "基本概念",
            aliases: [batch[key]],
            description: `${batch[key]}に関する問題`
          }];
        }
        
        // 按 name 去重并合并 aliases
        const mergedSubsMap = new Map();
        for (const st of subs) {
          if (!mergedSubsMap.has(st.name)) {
            mergedSubsMap.set(st.name, { ...st });
          } else {
            const existing = mergedSubsMap.get(st.name);
            existing.aliases = [...new Set([...(existing.aliases || []), ...(st.aliases || [])])];
          }
        }
        refinedSubtopics[key] = Array.from(mergedSubsMap.values());
      }
    } catch (err) {
      console.error('Error processing batch', err);
    }
  }
  
  console.log('Updating ejuSyllabus.ts...');
  const syllabusPath = path.join(__dirname, '../src/data/ejuSyllabus.ts');
  let syllabusContent = fs.readFileSync(syllabusPath, 'utf8');
  
  // 第一步：清空文件中所有的 subtopics（除了 phy_1_1_1），以便重新生成
  // 由于简单的正则很难匹配包含嵌套结构的代码块，我们采取更强力的方式。
  // 我们已经在外部执行过 deep_clean.js 彻底清理了文件。
  // 在此脚本里，我们直接定位每个 Topic 并在其 content 之后插入。
  let updatedContent = syllabusContent;

  for (const [topicId, subtopics] of Object.entries(refinedSubtopics)) {
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
    
    // 定位并替换：匹配 "id": "topicId" 到 "content": "..." 的部分
    const regexStr = `(\\"id\\"\\s*:\\s*\\"${topicId}\\"\\s*,\\s*\\"title\\"\\s*:\\s*\\"[^\\"]+\\"\\s*,\\s*\\"content\\"\\s*:\\s*\\"[^\\"]+\\")`;
    const regex = new RegExp(regexStr, 'g');
    
    // 如果已经包含 subtopics（可能是之前残留的），就不能直接盲目替换。
    // 但是由于我们刚用 deep_clean.js 彻底清理了，所以这里一定是干净的。
    updatedContent = updatedContent.replace(regex, `$1${subtopicsStr}`);
  }

  fs.writeFileSync(syllabusPath, updatedContent, 'utf8');
  console.log('Successfully updated ejuSyllabus.ts with LLM-refined subtopics.');
}

main().catch(console.error);

