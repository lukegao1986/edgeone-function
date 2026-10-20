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
    const topicCode = parts[2];
    let newTopicCode = topicCode;
    let newSubtopicCodes = parts[3].replace('"', ""); // 去掉尾部的引号

    let changed = false;

    if (topicCode === "phy_1_3_1" || topicCode === "phy_1_3_2") {
      newTopicCode = "phy_1_2_4";
      newSubtopicCodes = "phy_1_2_4_01";
      changed = true;
    } else if (topicCode === "phy_1_3_3") {
      newTopicCode = "phy_1_2_5";
      newSubtopicCodes = "phy_1_2_5_01";
      changed = true;
    }

    if (changed) {
      // 重新拼装
      lines[i] =
        `${parts[0]}","${parts[1]}","${newTopicCode}","${newSubtopicCodes}"`;
      updatedCount++;
    }
  }
}

fs.writeFileSync(csvPath, lines.join("\n"), "utf8");
console.log(`Successfully updated ${updatedCount} records in CSV.`);
