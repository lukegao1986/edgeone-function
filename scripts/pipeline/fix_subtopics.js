const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const validSubtopics = [
  "phy_4_1_1_01", "phy_4_1_2_01", "phy_4_1_3_01", "phy_4_1_4_01", "phy_4_1_5_01",
  "phy_4_2_1_01", "phy_4_2_2_01", "phy_4_2_3_01", "phy_4_3_1_01", "phy_4_3_2_01",
  "phy_4_3_3_01", "phy_4_3_3_02", "phy_4_3_4_01", "phy_4_4_1_01", "phy_4_4_2_01",
  "phy_4_4_3_01", "phy_4_4_4_01", "phy_4_4_5_01", "phy_5_1_1_01", "phy_5_1_1_02",
  "phy_5_1_2_01", "phy_5_1_2_02", "phy_5_1_2_03", "phy_5_2_1_01", "phy_5_2_2_01",
  "phy_5_2_2_02", "phy_5_2_2_03", "phy_5_2_3_01", "phy_5_2_3_02"
];

async function main() {
  const overrides = JSON.parse(fs.readFileSync('manual_topics.json', 'utf8'));
  const chapters = [21, 22, 23, 24, 25, 26, 27, 28, 29];

  for (const ch of chapters) {
    const prefix = (ch >= 28) ? 'phy_5' : 'phy_4';
    const jsonPath = path.join(process.cwd(), `docs/0 数据准备/Charpter 1-30/charpter${ch}/${prefix}_chapter${ch}_questions.json`);
    if (!fs.existsSync(jsonPath)) continue;
    
    let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let modified = false;

    for (let q of data) {
      // Find if this question was manually overridden
      const ov = overrides.find(o => o.businessCode === q.businessCode);
      if (ov) {
        if (q.topicCode !== ov.topicCode) {
            q.topicCode = ov.topicCode;
            modified = true;
        }
      }

      // Check subtopicCodes: they must not be empty and must start with topicCode
      let validCurrentSubs = [];
      if (q.subtopicCodes && Array.isArray(q.subtopicCodes)) {
         validCurrentSubs = q.subtopicCodes.filter(s => s.startsWith(q.topicCode));
      }

      if (validCurrentSubs.length === 0) {
        // Need to fill subtopicCodes
        const allowedSubs = validSubtopics.filter(s => s.startsWith(q.topicCode));
        
        if (allowedSubs.length === 1) {
             q.subtopicCodes = allowedSubs;
             modified = true;
             continue;
        } else if (allowedSubs.length === 0) {
          console.warn(`No valid subtopics found for ${q.topicCode} (${q.businessCode})`);
          q.subtopicCodes = [];
          continue;
        }
        
        // Use LLM to pick the best from allowedSubs
        console.log(`Analyzing subtopicCodes for ${q.businessCode} (Topic: ${q.topicCode})...`);
        const prompt = `你是一个 EJU 物理题库编辑专家。
请根据题目题干，从给定的备选 subtopicCodes 中挑选 1-3 个最贴切的考点。

题目题干:
${q.stem}

备选考点:
${allowedSubs.join(", ")}

请只返回一个 JSON 对象：
{
  "subtopicCodes": ["选择的考点1", "选择的考点2"]
}`;

        try {
          const res = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: "Output ONLY valid JSON." },
              { role: "user", content: prompt }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
          });
          const content = JSON.parse(res.choices[0].message.content);
          q.subtopicCodes = content.subtopicCodes.filter(c => allowedSubs.includes(c));
          if (q.subtopicCodes.length === 0) q.subtopicCodes = [allowedSubs[0]]; // fallback
          modified = true;
        } catch (e) {
          console.error(`Failed to analyze ${q.businessCode}`, e);
          q.subtopicCodes = [allowedSubs[0]]; // fallback
          modified = true;
        }
      } else {
         if (JSON.stringify(q.subtopicCodes) !== JSON.stringify(validCurrentSubs)) {
            q.subtopicCodes = validCurrentSubs;
            modified = true;
         }
      }
    }

    if (modified) {
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Saved subtopic fixes for Chapter ${ch}.`);
    }
  }
}

main().catch(console.error);