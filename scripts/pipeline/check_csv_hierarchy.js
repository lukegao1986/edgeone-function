const fs = require("fs");
const path = require("path");

const csvPath = path.join(
  process.cwd(),
  "docs/Topic_Review_Reports/Chapter2_7_Topics_Review.csv",
);
let rawCsv = fs.readFileSync(csvPath, "utf8");

const lines = rawCsv.split("\n");
let hasMismatch = false;

console.log("Checking for mismatches between topicCode and subtopicCodes...");

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
      const subtopicCodes = subtopicCodesStr.split(";");
      for (const subCode of subtopicCodes) {
        // subCode 格式应该形如 "phy_1_1_1_02"
        // 它的前缀应该等于 topicCode，即 "phy_1_1_1"
        const expectedPrefix = topicCode;
        if (!subCode.startsWith(expectedPrefix)) {
          console.log(
            `Mismatch found in ${bCode}: topicCode=${topicCode}, subtopicCodes=${subtopicCodesStr}`,
          );
          hasMismatch = true;
          break; // 只打印一次
        }
      }
    }
  }
}

if (!hasMismatch) {
  console.log("All records are consistent!");
}
