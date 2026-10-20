const fs = require("fs");
const path = require("path");

const baseDir = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30");
const chapters = [8, 9, 10];
const outCsvPath = path.join(
  process.cwd(),
  "docs/Chapter8_10_Topics_Review.csv",
);

let csvContent = "\uFEFF"; // BOM for Excel
csvContent += "businessCode,概要(100字内),topicCode,人工意见,subtopicCodes\n";

for (const ch of chapters) {
  const jsonPath = path.join(
    baseDir,
    `charpter${ch}`,
    `phy_1_chapter${ch}_questions.json`,
  );
  if (!fs.existsSync(jsonPath)) continue;

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  for (const q of data) {
    const bCode = q.businessCode || "";
    const tCode = q.topicCode || "";
    let subCodes = "";
    if (Array.isArray(q.subtopicCodes)) {
      subCodes = q.subtopicCodes.join(";");
    } else if (typeof q.subtopicCodes === "string") {
      subCodes = q.subtopicCodes;
    }

    // Process stem to be a single line summary (up to 100 chars)
    let summary = "";
    if (q.stem) {
      summary = q.stem
        .replace(/\\r\\n/g, " ")
        .replace(/\\n/g, " ")
        .replace(/"/g, '""');
      if (summary.length > 100) {
        summary = summary.substring(0, 100) + "...";
      }
    }

    csvContent += `"${bCode}","${summary}","${tCode}","","${subCodes}"\n`;
  }
}

fs.writeFileSync(outCsvPath, csvContent, "utf8");
console.log(`CSV report written to ${outCsvPath}`);
