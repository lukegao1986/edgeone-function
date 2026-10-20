const fs = require('fs');
const path = require('path');
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

async function run() {
  const jsonPath = path.join(process.cwd(), 'docs/0 数据准备/Charpter 1-30/charpter13/phy_2_chapter13_questions.json');
  let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let changed = false;

  const targetCodes = ['phy-13-qE1', 'phy-13-qE2', 'phy-13-qE5', 'phy-13-qA5', 'phy-13-qA8'];

  for (let q of data) {
    if (targetCodes.includes(q.businessCode)) {
      console.log(`Fixing explanation for ${q.businessCode}`);
      
      const prompt = `这是一道物理题的解析，在 Typora 等 Markdown 渲染器中出现了格式错误或 LaTeX 无法正常渲染的问题。
题目：${q.stem}
当前解析：${q.explanation || '无'}

请修复并重新输出这段解析：
1. 所有的数学公式、字母变量都必须用 $ 包裹并正确闭合。例如 $v = \\frac{s}{t}$。
2. 保持换行和段落清晰，不要有乱码。
3. 请只返回修复后的纯解析文本，不要加多余的废话和前缀。`;

      try {
        const res = await openai.chat.completions.create({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }]
        });
        q.explanation = res.choices[0].message.content.trim();
        changed = true;
        console.log(`  -> Done.`);
      } catch (e) {
        console.error(`  -> Failed:`, e.message);
      }
    }
  }

  if (changed) {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Saved explanation fixes for Chapter 13`);
  }
}

run();