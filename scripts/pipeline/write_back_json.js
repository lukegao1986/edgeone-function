const fs = require("fs");
const path = require("path");

const csvPath = path.join(
  process.cwd(),
  "docs/Topic_Review_Reports/Chapter2_7_Topics_Review_extracted.csv",
);
let rawCsv = fs.readFileSync(csvPath, "utf8");

const lines = rawCsv.split("\n");
const corrections = {};

for (let i = 1; i < lines.length; i++) {
  let line = lines[i];
  if (!line.trim()) continue;

  const parts = line.split('","');
  if (parts.length >= 5) {
    const bCode = parts[0].replace('"', "");
    const topicCode = parts[2];
    const subtopicCodesStr = parts[4].replace('"', "").trim();

    corrections[bCode] = {
      topicCode: topicCode,
      subtopicCodes: subtopicCodesStr ? subtopicCodesStr.split(";") : [],
    };
  }
}

const chapters = [2, 3, 4, 5, 6, 7];
let totalUpdated = 0;

for (const ch of chapters) {
  const jsonPath = path.join(
    process.cwd(),
    `docs/0 数据准备/Charpter 1-30/charpter${ch}/phy_1_chapter${ch}_questions.json`,
  );
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    let chapterUpdated = false;

    for (const q of data) {
      const correction = corrections[q.businessCode];
      if (correction) {
        if (
          q.topicCode !== correction.topicCode ||
          JSON.stringify(q.subtopicCodes) !==
            JSON.stringify(correction.subtopicCodes)
        ) {
          q.topicCode = correction.topicCode;
          q.subtopicCodes = correction.subtopicCodes;
          chapterUpdated = true;
          totalUpdated++;
        }
      }
    }

    if (chapterUpdated) {
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
      console.log(`Updated Chapter ${ch} JSON.`);
    }
  }
}

console.log(`Total ${totalUpdated} questions updated in JSON files.`);
