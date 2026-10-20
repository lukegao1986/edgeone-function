const fs = require("fs");
const path = require("path");

const baseDir = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30");
const chapters = [8, 9, 10];
const outMdPath = path.join(
  process.cwd(),
  "docs/Duplicate_Options_Report_Ch8_10.md",
);

let mdContent = "# 题目选项重复检查报告 (Chapter 8-10)\n\n";
let totalDuplicates = 0;

for (const ch of chapters) {
  const jsonPath = path.join(
    baseDir,
    `charpter${ch}`,
    `phy_1_chapter${ch}_questions.json`,
  );
  if (!fs.existsSync(jsonPath)) {
    console.log(`JSON file not found for Chapter ${ch}, skipping...`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  let hasDupInCh = false;
  let chMd = `## Chapter ${ch}\n\n`;

  for (const q of data) {
    if (q.options && Array.isArray(q.options)) {
      const counts = {};
      q.options.forEach((opt) => {
        counts[opt] = (counts[opt] || 0) + 1;
      });

      const dups = Object.entries(counts).filter(([opt, count]) => count > 1);

      if (dups.length > 0) {
        hasDupInCh = true;
        totalDuplicates++;

        const dupStrs = dups
          .map(([opt, count]) => `"${opt}" (出现 ${count} 次)`)
          .join(", ");
        chMd += `- **${q.businessCode}**: 存在重复选项: ${dupStrs}\n`;
      }
    }
  }

  if (hasDupInCh) {
    mdContent += chMd + "\n";
  } else {
    mdContent += `## Chapter ${ch}\n\n本章未发现重复选项。\n\n`;
  }
}

mdContent += `\n**总计发现 ${totalDuplicates} 道题目存在选项重复问题。**\n`;

fs.writeFileSync(outMdPath, mdContent, "utf8");
console.log(`Duplicate options report written to ${outMdPath}`);
