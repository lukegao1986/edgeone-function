const fs = require('fs');
const path = require('path');
const OpenAI = require("openai");
require("dotenv").config();

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

async function run() {
  const jsonPath = path.join(process.cwd(), 'docs/0 数据准备/Charpter 1-30/charpter13/phy_2_chapter13_questions.json');
  let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let changed = false;

  const targetCodes = ['phy-13-qB3', 'phy-13-qA4', 'phy-13-qA7'];

  for (let q of data) {
    if (targetCodes.includes(q.businessCode)) {
      console.log(`Fixing options coverage for ${q.businessCode}`);
      
      const prompt = `你是一个 EJU 物理题库生成专家。
这是一道包含多个小问的题目，但是当前生成的选项没有覆盖全部小问的答案。

【题目信息】
题目：${q.stem}
原解析：${q.explanation}

请根据解析推断出每个小问的正确答案，然后将它们拼接成一个完整的正确选项，并生成对应的几个干扰选项。
要求：
1. 选项格式必须包含所有小问的答案（例如：(1) $2.0\\mathrm{m/s}$ (2) $5.0\\mathrm{J}$ (3) $10\\mathrm{N}$）。
2. 生成 1 个完全正确的选项和 3 个干扰选项，总共 4 个选项，放入 options 数组中。
3. 确保所有的数学公式都用 LaTeX $ 包裹。
4. 返回 JSON 格式：{ "options": ["...", "...", "...", "..."] }，不要包含其他解释。`;

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
            let optsWithFlag = newOptions.map((opt, idx) => ({
              text: opt,
              isCorrect: idx === 0 // 假设大模型生成的第一个是正确选项
            }));
            
            shuffleArray(optsWithFlag);
            q.options = optsWithFlag.map(o => o.text);
            q.correctIndex = optsWithFlag.findIndex(o => o.isCorrect);
            
            changed = true;
            console.log(`  -> Done. Options length: ${q.options.length}`);
        }
      } catch (e) {
        console.error(`  -> Failed:`, e.message);
      }
    }
  }

  if (changed) {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Saved options coverage fixes for Chapter 13`);
  }
}

run();