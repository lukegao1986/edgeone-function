const fs = require("fs");
const path = require("path");

function generatePreview(chapterNum) {
  const baseDir = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30");
  const jsonPath = path.join(
    baseDir,
    `charpter${chapterNum}`,
    `phy_1_chapter${chapterNum}_questions.json`,
  );
  const mdPath = path.join(
    baseDir,
    `charpter${chapterNum}`,
    `phy_1_chapter${chapterNum}_questions_preview.md`,
  );

  if (!fs.existsSync(jsonPath)) return;
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  let mdContent = `# Chapter ${chapterNum} 题库预览\n\n共 ${data.length} 题\n\n---\n\n`;

  data.forEach((q, i) => {
    mdContent += `### ${i + 1}. [${q.businessCode}] \n`;
    mdContent += `**考点**: \`${q.topicCode}\` -> \`${(q.subtopicCodes || []).join(", ")}\`\n\n`;
    mdContent += `**题干**:\n${q.stem}\n\n`;
    mdContent += `**选项**:\n`;
    q.options.forEach((opt, idx) => {
      const isCorrect = idx === q.correctIndex ? "✅" : "❌";
      mdContent += `- ${String.fromCharCode(65 + idx)}. ${opt} ${isCorrect}\n`;
    });
    mdContent += `\n**解析**:\n${q.explanation}\n\n---\n\n`;
  });

  fs.writeFileSync(mdPath, mdContent, "utf8");
  console.log(`Generated preview for Chapter ${chapterNum}`);
}

[8, 9, 10].forEach(generatePreview);
