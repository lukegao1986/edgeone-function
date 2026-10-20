const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

console.log("Script started");
const openai = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

let syllabusRaw = "";
try {
  syllabusRaw = fs.readFileSync(path.join(process.cwd(), "src/data/ejuSyllabus.ts"), "utf8");
} catch(e) {}

async function applyFixes() {
  console.log("applyFixes called");
  const updatesFile = path.join(process.cwd(), "docs/manual_review_updates_ch11_13.json");
  if (!fs.existsSync(updatesFile)) {
    console.log("No manual updates found.");
    return;
  }
  const updates = JSON.parse(fs.readFileSync(updatesFile, "utf8"));
  console.log("Loaded", updates.length, "updates");
  
  const baseDir = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30");
  const chapters = [11, 12, 13];

  for (const ch of chapters) {
    const jsonPath = path.join(baseDir, `charpter${ch}`, `phy_2_chapter${ch}_questions.json`);
    if (!fs.existsSync(jsonPath)) continue;

    console.log("Processing chapter", ch);
    let data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    let changed = false;

    for (let q of data) {
      const update = updates.find(u => u.businessCode === q.businessCode);
      if (!update) continue;

      console.log(`\nProcessing ${q.businessCode}...`);
      
      // 1. Re-infer subtopicCodes
      if (update.manual_review) {
        console.log(`- Re-inferring subtopicCodes for topicCode: ${update.manual_review}`);
        const prompt = `你是一个 EJU 物理题库分类专家。
请根据以下力学/热学/电磁学的 Syllabus 范围，为给定题目匹配 1~3 个最相关的 \`subtopicCodes\`。

【Syllabus 范围片段】
${syllabusRaw.substring(0, 15000)}

【题目信息】
编号: ${q.businessCode}
概要: ${update.stem}
目标 topicCode: ${update.manual_review}

【匹配规则】
1. 必须强制从指定的目标 topicCode (${update.manual_review}) 下挑选 subtopicCodes。
2. 返回 1~3 个最贴切的 subtopicCode。
3. 请只返回 JSON 数组，不包含任何 Markdown 格式或额外说明，例如：["phy_2_2_2_01"]`;

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

      // 2. Fix Options
      if (update.options_issue) {
        console.log(`- Fixing options: ${update.options_issue}`);
        
        let correctOption = q.options && q.options[q.correctIndex] ? q.options[q.correctIndex] : null;
        if (!correctOption && q.options && q.options.length === 1 && q.options[0].includes(';')) {
           correctOption = q.options[0].split(';')[0].trim();
        } else if (!correctOption && q.options && q.options.length > 0) {
           correctOption = q.options[0];
        }

        const prompt = `你是一个 EJU 物理专家。
有一道题目：${q.stem}
解析是：${q.explanation || ''}
当前的正确答案选项内容是：
${correctOption || '请根据解析推断正确答案'}

请你重新生成一组选项（包含正确选项和若干干扰选项，总数在4到8个之间），要求：
1. 如果原来的选项中包含分号被拼接在了一起，请将它们拆分成互异的数组元素。
2. 错误选项必须具有迷惑性。
3. 必须确保每一个选项的 LaTeX 语法合法（所有的数学公式都必须用 $ 包裹，不能漏掉）。
4. 必须包含正确答案！
5. 请返回 JSON 格式：{ "options": ["opt1", "opt2", ...] }`;

        try {
          const res = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
          });
          const resJson = JSON.parse(res.choices[0].message.content);
          let newOptions = resJson.options;

          if (newOptions && Array.isArray(newOptions) && newOptions.length > 1) {
            newOptions = Array.from(new Set(newOptions));
            
            let newCorrectIndex = 0;
            if (correctOption) {
              const idx = newOptions.findIndex(o => o.includes(correctOption) || correctOption.includes(o));
              if (idx !== -1) {
                newCorrectIndex = idx;
              } else {
                newOptions[0] = correctOption;
              }
            }

            let optsWithFlag = newOptions.map((opt, idx) => ({
              text: opt,
              isCorrect: idx === newCorrectIndex
            }));
            shuffleArray(optsWithFlag);

            q.options = optsWithFlag.map((o) => o.text);
            q.correctIndex = optsWithFlag.findIndex((o) => o.isCorrect);
            console.log(`  -> Fixed options. New count: ${q.options.length}`);
            changed = true;
          }
        } catch (e) {
          console.error(`  -> Failed to fix options:`, e.message);
        }
      }

      // 3. Fix Explanation
      if (update.explanation_issue) {
        console.log(`- Fixing explanation: ${update.explanation_issue}`);
        const prompt = `这是一道物理题的解析，其中可能存在 LaTeX 符号 $ 未闭合、缺失，或者是 undefined。
题目：${q.stem}
原解析：${q.explanation || '（缺失解析，请直接重新写一段100字左右的物理分析）'}

请你修复这段解析。
1. 确保所有公式、字母变量都用 LaTeX $...$ 包裹并且闭合。
2. 剔除多余的提示语。
3. 只返回修复后的解析纯文本，不要带有 "解析：" 等前缀。`;

        try {
          const res = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }]
          });
          q.explanation = res.choices[0].message.content.trim();
          console.log(`  -> Fixed explanation.`);
          changed = true;
        } catch (e) {
          console.error(`  -> Failed to fix explanation:`, e.message);
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