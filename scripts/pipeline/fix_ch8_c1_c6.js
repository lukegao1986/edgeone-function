const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY
});

const ch8JsonPath = path.join(process.cwd(), 'docs/0 数据准备/Charpter 1-30/charpter8/phy_1_chapter8_questions.json');
const data = JSON.parse(fs.readFileSync(ch8JsonPath, 'utf8'));

// 需要修复的题目列表
const targetCodes = ['phy-08-qC1', 'phy-08-qC2', 'phy-08-qC3', 'phy-08-qC4', 'phy-08-qC5', 'phy-08-qC6'];

// 洗牌算法
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
    
    // 当前错误合并的选项字符串
    const wrongOptionStr = q.options[0];

    const prompt = `
你是一个 EJU 物理题库数据修复专家。
下面有一道题的选项被错误地合并成了一个很长的字符串。你需要帮我把它们重新拆分开，并生成干扰选项，最后返回符合要求的 JSON 格式。

【题目信息】
题干：${q.stem}
解析：${q.explanation}
原始错误选项字符串：${wrongOptionStr}

【任务要求】
1. 从“原始错误选项字符串”和“解析”中，提取出这道题的**真正正确答案**。
2. 根据这道题的知识点，生成若干个**具有迷惑性的错误选项**。
3. 选项总数必须严格等于 2N+2（N为小问数量，如果题干没有小问，则 N=1，即 4 个选项）。
4. **所有选项必须完全互异，不能有任何重复**。
5. 所有选项格式必须统一，如果包含公式，必须用 LaTeX \`$\` 包裹。

【输出格式要求】
必须严格输出一个 JSON 格式，不包含任何 Markdown 代码块包裹（即不要有 \`\`\`json），格式如下：
{
  "correctOption": "这里是正确答案的完整文本",
  "wrongOptions": ["错误选项1", "错误选项2", "错误选项3"]
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
      if (uniqueOpts.length < allOptions.length) {
         console.warn(`[警告] ${q.businessCode} 仍有重复选项，强制去重...`);
      }
      
      // 强制补充至 4 个（如果是单问的话）或者更多，这里简单处理，如果去重后不足，则用随机数补充
      while(uniqueOpts.length < 4) {
          uniqueOpts.push(uniqueOpts[0] + " + " + Math.floor(Math.random()*10));
          uniqueOpts = Array.from(new Set(uniqueOpts));
      }

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

  fs.writeFileSync(ch8JsonPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('修复结果已写回 JSON 文件。');
}

fixOptions();
