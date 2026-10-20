const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function fixDuplicates() {
  const baseDir = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30");
  const chapters = [8, 9, 10];

  for (const ch of chapters) {
    const jsonPath = path.join(
      baseDir,
      `charpter${ch}`,
      `phy_1_chapter${ch}_questions.json`,
    );
    if (!fs.existsSync(jsonPath)) continue;

    let data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    let changed = false;

    for (const q of data) {
      if (!q.options || !Array.isArray(q.options)) continue;

      const uniqueOpts = new Set(q.options);
      if (uniqueOpts.size < q.options.length) {
        console.log(`Fixing duplicate options for ${q.businessCode}`);
        const correctOption = q.options[q.correctIndex];
        const targetCount = Math.min(16, q.options.length);

        const prompt = `你是一个 EJU 物理专家。
我有一道题目，它的正确答案选项是：
${correctOption}

但是生成的其他选项出现了重复。请你重新生成总共 ${targetCount} 个完全互异的选项（必须包含这个正确选项）。
要求：
1. 错误选项必须具有迷惑性（如符号错误、漏乘系数、分母分子颠倒等）。
2. 格式和正确答案必须完全一致（如果正确答案是用 $...$ 包裹的 LaTeX 公式，或者是 "(1) xxx ; (2) xxx" 格式，错误选项也必须一模一样）。
3. 请确保每一个选项的 LaTeX 语法合法。

请返回 JSON 格式，包含 "options" 数组：
{ "options": ["opt1", "opt2", ...] }`;

        try {
          const response = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
          });
          const resJson = JSON.parse(response.choices[0].message.content);
          let newOptions = resJson.options;

          if (
            newOptions &&
            Array.isArray(newOptions) &&
            newOptions.length > 0
          ) {
            // Ensure correct option is exactly in there
            if (!newOptions.includes(correctOption)) {
              newOptions[0] = correctOption; // Force include if LLM missed it
            }

            // Unique
            newOptions = Array.from(new Set(newOptions));
            // Fill if short
            let extra = 1;
            while (newOptions.length < targetCount) {
              newOptions.push(correctOption + " (干扰项" + extra + ")");
              extra++;
            }
            if (newOptions.length > targetCount) {
              newOptions = newOptions.slice(0, targetCount);
            }
            if (!newOptions.includes(correctOption)) {
              newOptions[0] = correctOption;
            }

            // Shuffle
            let optsWithFlag = newOptions.map((opt) => ({
              text: opt,
              isCorrect: opt === correctOption,
            }));
            shuffleArray(optsWithFlag);

            q.options = optsWithFlag.map((o) => o.text);
            q.correctIndex = optsWithFlag.findIndex((o) => o.isCorrect);

            console.log(
              `Fixed ${q.businessCode}, new correctIndex: ${q.correctIndex}`,
            );
            changed = true;
          }
        } catch (err) {
          console.error(
            `Failed to fix options for ${q.businessCode}:`,
            err.message,
          );
        }
      }
    }

    if (changed) {
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
      console.log(`Saved fixed options for Chapter ${ch} JSON`);
    }
  }
}

fixDuplicates();
