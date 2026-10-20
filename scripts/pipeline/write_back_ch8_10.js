const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const csvPath = path.join(process.cwd(), 'docs/Chapter8_10_Topics_Review.csv');
const records = parse(fs.readFileSync(csvPath, 'utf8'), {
  columns: true,
  skip_empty_lines: true,
  bom: true
});

const updates = {};
for (const row of records) {
  updates[row.businessCode] = {
    topicCode: row.topicCode,
    subtopicCodes: row.subtopicCodes ? row.subtopicCodes.split(';').map(s => s.trim()).filter(Boolean) : []
  };
}

const chapters = [8, 9, 10];
for (const ch of chapters) {
  const jsonPath = path.join(process.cwd(), `docs/0 数据准备/Charpter 1-30/charpter${ch}/phy_1_chapter${ch}_questions.json`);
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let modified = false;
    for (const q of data) {
      if (updates[q.businessCode]) {
        q.topicCode = updates[q.businessCode].topicCode;
        q.subtopicCodes = updates[q.businessCode].subtopicCodes;
        modified = true;
      }
    }
    if (modified) {
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Updated JSON: ${jsonPath}`);
    }
  }
}
