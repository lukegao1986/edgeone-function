const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

async function main() {
  const jsonPath = path.join(process.cwd(), 'docs/0 数据准备/Charpter 1-30/charpter28/phy_5_chapter28_questions.json');
  let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const replaceLatex = (text) => {
    if (!text) return text;
    let fixedText = text.replace(/\\\\\\\[/g, '$$$$').replace(/\\\\\\\]/g, '$$$$');
    fixedText = fixedText.replace(/\\\\\(/g, '$').replace(/\\\\\)/g, '$');
    fixedText = fixedText.replace(/\\\[/g, '$$$$').replace(/\\\]/g, '$$$$');
    fixedText = fixedText.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
    return fixedText;
  };

  let modified = false;

  for (let q of data) {
    if (q.options && Array.isArray(q.options) && new Set(q.options).size !== q.options.length) {
      console.log(`Fixing duplicate options for ${q.businessCode}...`);
      
      const prompt = `你是一个 EJU（日本留学試験）物理题库编辑专家。
以下题目的选项存在重复项，违反了规则。请根据题干和解析重新生成选项。

题目 ID: ${q.businessCode}
题干:
${q.stem}

原始解析:
${q.explanation}

【选项生成规则】
1. **选项数量（2N+2）**：如果题干有 N 个空(如 (1), (2)...) 或小问，选项数应为 2N+2 (最高限制为16个)。
2. **内容互异**：所有选项必须完全互异，不能有任何重复！
3. **正确选项**：生成选项后，指出正确选项的索引（0-based）。正确答案不能总是 A（即 0），请随机放在某个位置。
4. **格式**：每个选项必须是一个完整的组合，不要出现“干扰项”等提示文字。LaTeX 公式必须使用 $ ... $ 或 $$ ... $$。

请返回一个 JSON 对象：
{
  "options": ["选项1", "选项2", ...],
  "correctIndex": 2,
  "explanation": "【参考答案】: 选项3\\n\\n【详细解析】: ..."
}`;

      try {
        const res = await openai.chat.completions.create({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are a strict JSON output assistant. Output ONLY valid JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }
        });

        const content = JSON.parse(res.choices[0].message.content);
        
        q.options = content.options.map(replaceLatex);
        q.correctIndex = content.correctIndex;
        // Optionally update explanation if the format was adjusted
        q.explanation = replaceLatex(content.explanation);
        
        modified = true;
        console.log(`Fixed ${q.businessCode}, options length: ${q.options.length}`);
      } catch (e) {
        console.error(`Failed to fix ${q.businessCode}`, e);
      }
    }
  }

  if (modified) {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Saved fixes for Chapter 28.');
  }
}

main().catch(console.error);