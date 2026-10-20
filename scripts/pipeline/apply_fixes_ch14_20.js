const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

console.log("Script started");
const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

let syllabusRaw = "";
try {
  syllabusRaw = fs.readFileSync(path.join(process.cwd(), "src/data/ejuSyllabus.ts"), "utf8");
} catch(e) {}

async function applyFixes() {
  console.log("applyFixes called");
  const updatesFile = path.join(process.cwd(), "docs/manual_review_updates_ch14_20.json");
  if (!fs.existsSync(updatesFile)) {
    console.log("No manual updates found.");
    return;
  }
  const updates = JSON.parse(fs.readFileSync(updatesFile, "utf8"));
  console.log("Loaded", updates.length, "updates");
  
  const baseDir = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30");
  const chapters = [14, 15, 16, 17, 18, 19, 20];

  for (const ch of chapters) {
    const jsonPath = path.join(baseDir, `charpter${ch}`, `phy_3_chapter${ch}_questions.json`);
    if (!fs.existsSync(jsonPath)) continue;

    console.log("Processing chapter", ch);
    let data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    let changed = false;

    for (let q of data) {
      const update = updates.find(u => u.businessCode === q.businessCode);
      if (!update) continue;
      
      // 1. Re-infer subtopicCodes
      if (update.manual_review) {
        console.log(`\nProcessing ${q.businessCode}...`);
        console.log(`- Re-inferring subtopicCodes for topicCode: ${update.manual_review}`);
        const prompt = `你是一个 EJU 物理题库分类专家。
请根据以下波学的 Syllabus 范围，为给定题目匹配 1~3 个最相关的 \`subtopicCodes\`。

【Syllabus 范围片段】
${syllabusRaw.substring(0, 15000)}

【题目信息】
编号: ${q.businessCode}
概要: ${update.stem}
目标 topicCode: ${update.manual_review}

【匹配规则】
1. 必须强制从指定的目标 topicCode (${update.manual_review}) 下挑选 subtopicCodes。
2. 返回 1~3 个最贴切的 subtopicCode。
3. 请只返回 JSON 数组，不包含任何 Markdown 格式或额外说明，例如：["phy_3_2_2_01"]`;

        try {
          const res = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
          });
          let resText = res.choices[0].message.content.trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
          const newSubtopicsArr = JSON.parse(resText);
          if (Array.isArray(newSubtopicsArr) && newSubtopicsArr.length > 0) {
            q.subtopicCodes = newSubtopicsArr;
            q.topicCode = newSubtopicsArr[0].substring(0, 9);
            console.log(`  -> new subtopicCodes: ${q.subtopicCodes}`);
            changed = true;
          }
        } catch (e) {
          console.error(`  -> Failed to infer subtopicCodes:`, e.message);
        }
      }
    }

    if (changed) {
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
      console.log(`[SUCCESS] Saved updates to ${jsonPath}`);
    }
  }
}

applyFixes();