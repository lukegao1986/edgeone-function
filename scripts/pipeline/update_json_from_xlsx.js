const fs = require('fs');
const path = require('path');

const overrides = JSON.parse(fs.readFileSync('manual_topics_xlsx.json', 'utf8'));
const chapters = [21, 22, 23, 24, 25, 26, 27, 28, 29];

function getPhyChapterId(num) {
  if (num >= 21 && num <= 27) return 'phy_4';
  if (num >= 28 && num <= 30) return 'phy_5';
  return 'phy_1';
}

let totalUpdated = 0;

for (const ch of chapters) {
  const prefix = getPhyChapterId(ch);
  const jsonPath = path.join(process.cwd(), `docs/0 数据准备/Charpter 1-30/charpter${ch}/${prefix}_chapter${ch}_questions.json`);
  
  if (!fs.existsSync(jsonPath)) continue;
  
  let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let modified = false;
  
  overrides.forEach(ov => {
    const q = data.find(item => item.businessCode === ov.businessCode);
    if (q) {
      console.log(`Updating ${q.businessCode} to ${ov.topicCode}`);
      q.topicCode = ov.topicCode;
      q.subtopicCodes = [`${ov.topicCode}_01`];
      modified = true;
      totalUpdated++;
    }
  });
  
  if (modified) {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  }
}

console.log(`Total updated in JSON files: ${totalUpdated}`);