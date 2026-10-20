const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY
});

const ch10JsonPath = path.join(process.cwd(), 'docs/0 数据准备/Charpter 1-30/charpter10/phy_1_chapter10_questions.json');
const data = JSON.parse(fs.readFileSync(ch10JsonPath, 'utf8'));

// 需要修复的题目列表
const targetCodes = ['phy-10-qA4', 'phy-10-qB10'];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function fixOptions() {
  for (let q of data) {
    if (!targetCodes.includes(q.businessCode)) continue;

    console.log(`正在修复: ${q.businessCode}`);

    const prompt = `
你是一个 EJU 物理题库数据修复专家。
下面有一道题目的选项存在严重问题。
对于 phy-10-qA4：大模型生成的选项中遗漏了部分小问的答案。题目题干中一共有 6 个小问，即 [A] 的 (1)(2)(3) 和 [B] 的 (1)(2)(3)。所以完整正确答案应该包含这 6 个小问的全部解答。
对于 phy-10-qB10：大模型生成的选项中缺少了 LaTeX 的包裹符号 \`$\`，导致渲染乱码。

【题目信息】
题干：${q.stem}
解析：${q.explanation}

【任务要求】
1. 仔细阅读“解析”和“题干”，归纳出所有小问的正确答案，拼接成一个完整的字符串。
   - 小问的标号可以用 "(1) xxx ; (2) xxx ; (3) xxx" 这种形式拼接。
   - 所有的数学公式都必须用 LaTeX \`$\` 包裹！比如 \`$\\sqrt{\\frac{GM}{r}}$\`。绝对不允许遗漏 \`$\`。
2. 根据知识点，生成若干个**具有迷惑性的错误选项**。
3. 选项总数必须严格等于 2N+2（N为小问数量，如果 N=6，那就是 14 个选项，如果太多的话，我们规定上限熔断机制，选项总数不超过 8 个即可）。
4. **所有选项必须完全互异，不能有任何重复**。
5. 所有选项格式必须统一，小问序号和答案要一一对应。

【输出格式要求】
必须严格输出一个 JSON 格式，不包含任何 Markdown 代码块包裹（即不要有 \`\`\`json），格式如下：
{
  "correctOption": "这里是正确答案的完整文本",
  "wrongOptions": ["错误选项1", "错误选项2", "错误选项3", ...]
}
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      });

      let resText = completion.choices[0].message.content.trim();
      resText = resText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      
      const resJson = JSON.parse(resText);
      const { correctOption, wrongOptions } = resJson;

      let allOptions = [correctOption, ...wrongOptions];
      
      // 去重逻辑
      let uniqueOpts = Array.from(new Set(allOptions));
      
      // 洗牌
      let optsWithFlag = uniqueOpts.map(opt => ({ text: opt, isCorrect: opt === correctOption }));
      shuffleArray(optsWithFlag);
      
      q.options = optsWithFlag.map(o => o.text);
      q.correctIndex = optsWithFlag.findIndex(o => o.isCorrect);

      console.log(`  修复完成，当前选项数量: ${q.options.length}, 正确答案索引: ${q.correctIndex}`);
    } catch (e) {
      console.error(`修复 ${q.businessCode} 失败:`, e.message);
    }
  }

  fs.writeFileSync(ch10JsonPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('修复结果已写回 JSON 文件。');
}

fixOptions();
