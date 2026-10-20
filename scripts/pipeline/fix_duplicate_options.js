const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const baseDir = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30");
const chapters = [2, 3, 4, 5, 6, 7];

async function regenerateOptions(q) {
  const numOptions = q.options.length;
  const correctOption = q.options[q.correctIndex];

  const prompt = `你是一个 EJU 物理专家。以下题目原有的选项存在重复，请重新生成 ${numOptions} 个完全互异的选项。
要求：
1. 必须包含正确的选项："${correctOption}"。
2. 其它 ${numOptions - 1} 个选项必须是具有迷惑性的错误选项（例如正负号错误、漏乘系数、公式记忆混淆等），且绝对不能与正确选项或彼此重复。
3. 选项格式请保持与原选项风格一致（使用 LaTeX $...$ 包裹数学公式）。如果原选项有标号，请不要在选项开头加上 A/B/C/D 或 1/2/3/4 的标号前缀，保持纯净。如果是多空题，请使用与正确选项相同的分号分隔格式。
4. 仅返回一个 JSON 对象，格式为：{"options": ["选项1", "选项2", ...]}

【题干】
${q.stem}

【正确选项】
${correctOption}
`;

  let retry = 0;
  while (retry < 3) {
    try {
      const response = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });
      const result = JSON.parse(response.choices[0].message.content);
      if (result.options && Array.isArray(result.options)) {
        // Adjust length if necessary
        let opts = result.options.slice(0, numOptions);
        while (opts.length < numOptions) {
          opts.push(correctOption + " (补" + opts.length + ")");
        }

        // Ensure correct option is included
        if (!opts.includes(correctOption)) {
          opts[0] = correctOption;
        }

        // Check uniqueness
        const uniqueSet = new Set(opts);
        if (uniqueSet.size === numOptions) {
          return opts;
        } else {
          console.warn(`[Retry ${retry}] 仍然生成了重复选项，重试...`);
        }
      }
    } catch (e) {
      console.warn(`[Retry ${retry}] Error: ${e.message}`);
    }
    retry++;
  }
  return null;
}

function shuffleOptions(q) {
  if (q.options && q.options.length > 0 && q.correctIndex !== undefined) {
    const opts = q.options.map((opt, idx) => ({
      text: opt,
      isCorrect: idx === q.correctIndex,
    }));
    for (let k = opts.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [opts[k], opts[j]] = [opts[j], opts[k]];
    }
    q.options = opts.map((o) => o.text);
    q.correctIndex = opts.findIndex((o) => o.isCorrect);
  }
}

async function processChapters() {
  for (const ch of chapters) {
    const jsonPath = path.join(
      baseDir,
      `charpter${ch}`,
      `phy_1_chapter${ch}_questions.json`,
    );
    const previewPath = path.join(
      baseDir,
      `charpter${ch}`,
      `phy_1_chapter${ch}_questions_preview.md`,
    );
    if (!fs.existsSync(jsonPath)) continue;

    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    let chapterChanged = false;
    let dupCount = 0;

    for (const q of data) {
      if (q.options && Array.isArray(q.options)) {
        const uniqueOptions = new Set(q.options);
        if (uniqueOptions.size !== q.options.length) {
          console.log(`\n[${q.businessCode}] 发现重复选项，开始重新生成...`);
          const correctOption = q.options[q.correctIndex];
          const newOptions = await regenerateOptions(q);

          if (newOptions) {
            q.options = newOptions;
            q.correctIndex = q.options.indexOf(correctOption);
            shuffleOptions(q);
            chapterChanged = true;
            dupCount++;
            console.log(
              `[${q.businessCode}] 成功更新。新正确选项位置: ${q.correctIndex}`,
            );
          } else {
            console.error(`[${q.businessCode}] 重新生成失败，保留原样。`);
          }
        }
      }
    }

    if (chapterChanged) {
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
      console.log(`\n保存更新后的 Chapter ${ch} JSON. (修复 ${dupCount} 题)`);

      // 生成 Preview MD
      let previewMd = `# phy_1 Chapter ${ch} 题目预览\n\n总题数: ${data.length}\n\n`;
      for (const q of data) {
        previewMd += `## [难度 ${q.difficultyLevel}] ${q.businessCode} (选项数: ${q.options ? q.options.length : 0})\n\n`;
        let subtopicsStr = "未标注";
        if (Array.isArray(q.subtopicCodes)) {
          subtopicsStr = q.subtopicCodes.join(", ");
        } else if (typeof q.subtopicCodes === "string") {
          subtopicsStr = q.subtopicCodes.replace(/;/g, ", ");
        }
        previewMd += `**考点**: ${q.topicCode} | ${subtopicsStr}\n\n`;
        previewMd += `**题干**:\n${q.stem}\n\n`;
        previewMd += `**选项**:\n`;
        if (q.options) {
          q.options.forEach((opt, idx) => {
            previewMd += `${idx === q.correctIndex ? "✅" : "❌"} ${idx}. ${opt}\n`;
          });
        }
        previewMd += `\n**解析**:\n${q.explanation}\n\n---\n\n`;
      }
      fs.writeFileSync(previewPath, previewMd, "utf8");
      console.log(`已同步 Chapter ${ch} Markdown Preview.`);
    } else {
      console.log(`\nChapter ${ch} 无重复选项需要修复。`);
    }
  }
}

processChapters();
