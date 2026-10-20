const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

async function main() {
  const chapters = [21, 22, 23, 24, 25, 26, 27, 28, 29];
  
  for (const ch of chapters) {
    const prefix = (ch >= 28) ? 'phy_5' : 'phy_4';
    const jsonPath = path.join(process.cwd(), `docs/0 数据准备/Charpter 1-30/charpter${ch}/${prefix}_chapter${ch}_questions.json`);
    if (!fs.existsSync(jsonPath)) continue;
    
    let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let modified = false;

    for (let q of data) {
      if (q.options && q.options.length === 1) {
        console.log(`Fixing single option for ${q.businessCode}`);
        const correctOpt = q.options[0];
        
        const prompt = `你是一个 EJU 物理考试命题专家。
当前有一道物理题只有 1 个选项（即正确答案）。请你根据题干和正确答案，生成 3 个合理的、互不相同且与正确答案不同的错误选项（干扰项），使得总共有 4 个选项。

题干:
${q.stem}

正确答案:
${correctOpt}

请严格返回一个 JSON 对象，格式如下：
{
  "distractors": ["干扰项1", "干扰项2", "干扰项3"]
}

注意：
1. 选项内容请保留原始语言（通常是日文或包含公式）。
2. 若公式，必须使用 $$...$$ 或 $...$ 格式。
3. 确保干扰项有物理意义且不重复。`;

        try {
          const res = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: "Output ONLY valid JSON." },
              { role: "user", content: prompt }
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
          });
          const content = JSON.parse(res.choices[0].message.content);
          
          if (content.distractors && content.distractors.length >= 3) {
            // Combine correct option with 3 distractors
            q.options = [correctOpt, ...content.distractors.slice(0, 3)];
            // Reset correct index to 0 for now, shuffle will handle it later
            q.correctIndex = 0;
            modified = true;
            console.log(` -> Fixed ${q.businessCode}. New options length: ${q.options.length}`);
          }
        } catch (e) {
          console.error(`Failed to generate options for ${q.businessCode}`, e);
        }
      }
    }

    if (modified) {
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Saved fixes for Chapter ${ch}.`);
    }
  }
}

main().catch(console.error);