const fs = require("fs");
const path = require("path");

const outDir = path.join(process.cwd(), "docs", "Topic_Review_Reports");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const csvLines = ["businessCode,概要(20字内),topicCode,subtopicCodes"];
const chapters = [2, 3, 4, 5, 6, 7];

for (const ch of chapters) {
  const jsonPath = path.join(
    process.cwd(),
    `docs/0 数据准备/Charpter 1-30/charpter${ch}/phy_1_chapter${ch}_questions.json`,
  );
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    for (const q of data) {
      let summary = q.stem.replace(/\n/g, " ").substring(0, 20);
      summary = summary.replace(/"/g, '""'); // CSV 中双引号需要转义
      const bCode = q.businessCode || "";
      const tCode = q.topicCode || "";
      const subCodes = (q.subtopicCodes || []).join(";");
      csvLines.push(`"${bCode}","${summary}","${tCode}","${subCodes}"`);
    }
  }
}

const outCsv = path.join(outDir, "Chapter2_7_Topics_Review.csv");
// 写入带有 UTF-8 BOM 的文件，保证 Excel 打开时不会出现日文/中文乱码
fs.writeFileSync(outCsv, "\uFEFF" + csvLines.join("\n"), "utf8");
console.log(`CSV Generated at: ${outCsv}`);
