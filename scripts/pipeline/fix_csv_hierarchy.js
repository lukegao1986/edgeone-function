const fs = require("fs");
const path = require("path");

const csvPath = path.join(
  process.cwd(),
  "docs/Topic_Review_Reports/Chapter2_7_Topics_Review.csv",
);
let rawCsv = fs.readFileSync(csvPath, "utf8");
const lines = rawCsv.split("\n");

let updatedCount = 0;

for (let i = 1; i < lines.length; i++) {
  let line = lines[i];
  if (!line.trim()) continue;

  // line 格式: "businessCode","概要","topicCode","subtopicCodes"
  const parts = line.split('","');
  if (parts.length >= 4) {
    const bCode = parts[0].replace('"', "");
    const topicCode = parts[2];
    const subtopicCodesStr = parts[3].replace('"', "").trim();

    if (subtopicCodesStr) {
      const primarySubtopic = subtopicCodesStr.split(";")[0];
      // 从正确的 primarySubtopic 提取 topicCode (例如 phy_1_1_2_01 -> phy_1_1_2)
      const correctTopicCode = primarySubtopic.substring(
        0,
        primarySubtopic.lastIndexOf("_"),
      );

      if (topicCode !== correctTopicCode) {
        console.log(
          `Fixing ${bCode}: topicCode updated from ${topicCode} to ${correctTopicCode} (based on ${primarySubtopic})`,
        );

        // 重新组装该行
        lines[i] =
          `"${bCode}","${parts[1]}","${correctTopicCode}","${subtopicCodesStr}"`;
        updatedCount++;
      }
    }
  }
}

fs.writeFileSync(csvPath, lines.join("\n"), "utf8");
console.log(`Successfully fixed ${updatedCount} records in CSV.`);
