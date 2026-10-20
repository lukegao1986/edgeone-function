const fs = require("fs");
const path = require("path");

function shuffleOptions(q) {
  if (!q.options || q.options.length === 0 || q.correctIndex === undefined)
    return;

  // 保留旧的正确选项字符串
  const correctOptText = q.options[q.correctIndex];

  // 组装对象数组
  let opts = q.options.map((opt, idx) => ({
    text: opt,
    isCorrect: idx === q.correctIndex,
  }));

  // Fisher-Yates 洗牌算法
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }

  // 重新赋值
  q.options = opts.map((o) => o.text);
  q.correctIndex = opts.findIndex((o) => o.isCorrect);
}

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return null;
  }
  let data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let changed = 0;
  data.forEach((q) => {
    shuffleOptions(q);
    changed++;
  });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  console.log(`Processed ${filePath}, shuffled ${changed} questions.`);
  return data;
}

const dir = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30/charpter1");
const file1 = path.join(dir, "phy_1_chapter1_questions.json");
const file2 = path.join(dir, "phy_1_chapter1_questions.json.error.raw");

const data1 = processFile(file1);
// processFile(file2); // skip error.raw as it's invalid JSON

if (data1) {
  const previewPath = path.join(dir, "phy_1_chapter1_questions_preview.md");
  let previewMd = `# phy_1 Chapter 1 题目预览\n\n总题数: ${data1.length}\n\n`;
  for (const q of data1) {
    previewMd += `## [难度 ${q.difficultyLevel}] ${q.businessCode} (选项数: ${q.options ? q.options.length : 0})\n\n`;
    previewMd += `**考点**: ${q.topicCode} | ${q.subtopicCodes ? q.subtopicCodes.join(", ") : "未标注"}\n\n`;
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
  console.log(`Preview updated: ${previewPath}`);
}
