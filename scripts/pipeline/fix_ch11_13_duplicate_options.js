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
  const baseDir = path.join(process.cwd(), 'docs/0 数据准备/Charpter 1-30');
  const chapters = [11, 12, 13];

  for (const ch of chapters) {
    const jsonPath = path.join(baseDir, `charpter${ch}`, `phy_2_chapter${ch}_questions.json`);
    if (!fs.existsSync(jsonPath)) continue;

    let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let changed = false;

    for (let q of data) {
      if (q.options && Array.isArray(q.options) && q.options.length > 1) {
        const uniqueOpts = new Set(q.options);
        if (uniqueOpts.size < q.options.length) {
          console.log(`Fixing duplicate options for ${q.businessCode}`);
          
          let correctOption = q.options[q.correctIndex || 0];
          const targetCount = q.options.length;

          const prompt = `你是一个 EJU 物理专家。
题目：${q.stem}
解析：${q.explanation}
当前正确答案是：${correctOption}

请生成一组互异的选项。
要求：
1. 总共返回 ${targetCount} 个互异的选项。
2. 必须包含正确答案。
3. 错误选项必须有物理迷惑性。
4. 返回 JSON 格式：{ "options": ["opt1", "opt2", ...] }`;

          try {
            const res = await openai.chat.completions.create({
              model: "deepseek-chat",
              messages: [{ role: "user", content: prompt }],
              response_format: { type: "json_object" }
            });
            const resJson = JSON.parse(res.choices[0].message.content);
            let newOptions = resJson.options;

            if (newOptions && Array.isArray(newOptions)) {
              newOptions = Array.from(new Set(newOptions));
              
              // 确保有正确答案，补齐数量
              if (!newOptions.includes(correctOption)) {
                newOptions[0] = correctOption;
              }
              while (newOptions.length < targetCount) {
                  newOptions.push(correctOption + ` (干扰项 ${newOptions.length})`);
              }
              newOptions = newOptions.slice(0, targetCount);

              let optsWithFlag = newOptions.map(opt => ({
                text: opt,
                isCorrect: opt === correctOption
              }));
              
              // 如果刚好没有匹配上 isCorrect，强制第一个为 true
              if (!optsWithFlag.some(o => o.isCorrect)) {
                  optsWithFlag[0].isCorrect = true;
                  optsWithFlag[0].text = correctOption;
              }

              shuffleArray(optsWithFlag);
              q.options = optsWithFlag.map(o => o.text);
              q.correctIndex = optsWithFlag.findIndex(o => o.isCorrect);
              
              changed = true;
              console.log(`  -> Fixed.`);
            }
          } catch (e) {
            console.error(`  -> Failed:`, e.message);
          }
        }
      }
    }

    if (changed) {
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Saved duplicate options fixes for Chapter ${ch}`);
    }
  }
}

run();