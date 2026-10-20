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
      console.log(`Deep fixing explanation for ${q.businessCode}`);
      
      const prompt = `这是一道物理题的解析。当前解析在 Markdown 渲染器（如 Typora）中渲染失败，可能是因为使用了 \\( \\) 或 \\[ \\] 来包裹公式，或者存在多余的换行导致公式断裂。
题目：${q.stem}
当前解析：${q.explanation}

请修复并重新输出这段解析。
**强制格式要求（极度重要）：**
1. **绝对禁止**使用 \\\(\` 和 \`\\)\`，也**绝对禁止**使用 \\\\[\` 和 \`\\]\`。
2. 所有的行内数学公式、字母变量，**必须严格使用单美元符号** \`$\` 包裹。例如：\`$v = \\frac{s}{t}$\`。
3. 所有的独立公式块，**必须严格使用双美元符号** \`$$\` 包裹。例如：
$$
v = \\frac{s}{t}
$$
4. 不要在公式内部随意换行。
5. 请只返回修复后的纯解析文本，不要加任何前缀和废话。`;

      try {
        const res = await openai.chat.completions.create({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }]
        });
        let fixedText = res.choices[0].message.content.trim();
        // Fallback replacement just in case
        fixedText = fixedText.replace(/\\\(\s*/g, '$').replace(/\s*\\\)/g, '$');
        fixedText = fixedText.replace(/\\\[\s*/g, '$$\n').replace(/\s*\\\]/g, '\n$$');
        
        q.explanation = fixedText;
        changed = true;
        console.log(`  -> Done.`);
      } catch (e) {
        console.error(`  -> Failed:`, e.message);
      }
    }
  }

  if (changed) {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Saved deep explanation fixes for Chapter 13`);
  }
}

run();