const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const validSubtopics = [
  'phy_4_1_1_01', 'phy_4_1_2_01', 'phy_4_1_3_01', 'phy_4_1_4_01', 'phy_4_1_5_01',
  'phy_4_2_1_01', 'phy_4_2_2_01', 'phy_4_2_3_01', 'phy_4_3_1_01', 'phy_4_3_2_01',
  'phy_4_3_3_01', 'phy_4_3_3_02', 'phy_4_3_4_01', 'phy_4_4_1_01', 'phy_4_4_2_01',
  'phy_4_4_3_01', 'phy_4_4_4_01', 'phy_4_4_5_01', 'phy_5_1_1_01', 'phy_5_1_1_02',
  'phy_5_1_2_01', 'phy_5_1_2_02', 'phy_5_1_2_03', 'phy_5_2_1_01', 'phy_5_2_2_01',
  'phy_5_2_2_02', 'phy_5_2_2_03', 'phy_5_2_3_01', 'phy_5_2_3_02'
];

async function main() {
  const chapters = [21, 22, 23, 24, 25, 26, 27, 28, 29];
  let fixedCount = 0;

  for (const ch of chapters) {
    const prefix = (ch >= 28) ? 'phy_5' : 'phy_4';
    const jsonPath = path.join(process.cwd(), `docs/0 数据准备/Charpter 1-30/charpter${ch}/${prefix}_chapter${ch}_questions.json`);
    if (!fs.existsSync(jsonPath)) continue;
    
    let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let modified = false;

    for (let q of data) {
      let isInvalid = false;
      if (!q.subtopicCodes || q.subtopicCodes.length === 0) isInvalid = true;
      else {
        for (const s of q.subtopicCodes) {
          if (!validSubtopics.includes(s) || !s.startsWith(q.topicCode)) {
            isInvalid = true;
            break;
          }
        }
      }

      if (isInvalid) {
        console.log(`Fixing ${q.businessCode}, current topic: ${q.topicCode}, subtopics: ${q.subtopicCodes}`);
        const allowedSubs = validSubtopics.filter(s => s.startsWith(prefix)); // All valid subs for this domain
        
        const prompt = `你是一个 EJU 物理题库编辑专家。请根据题目题干，从给定的备选 subtopicCodes 中挑选 1 个最贴切的考点。

题目题干:
${q.stem}

备选考点:
${allowedSubs.join(", ")}

请只返回一个 JSON 对象：
{
  "subtopicCode": "选择的考点"
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
          let picked = content.subtopicCode;
          if (!allowedSubs.includes(picked)) {
             picked = allowedSubs[0]; // fallback
          }
          
          q.subtopicCodes = [picked];
          // Update topicCode to match the first 9 chars of subtopicCode (e.g. phy_4_1_1)
          q.topicCode = picked.substring(0, 9);
          modified = true;
          fixedCount++;
          console.log(` -> Assigned topicCode: ${q.topicCode}, subtopicCodes: ${q.subtopicCodes}`);
        } catch (e) {
          console.error(`Failed LLM for ${q.businessCode}`, e);
          const fb = allowedSubs[0];
          q.subtopicCodes = [fb];
          q.topicCode = fb.substring(0, 9);
          modified = true;
          fixedCount++;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Saved fixes for Chapter ${ch}.`);
    }
  }
  
  console.log(`Total invalid items fixed: ${fixedCount}`);
}

main().catch(console.error);