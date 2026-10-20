const fs = require('fs');
const path = require('path');
const validSubtopics = [
  'phy_4_1_1_01', 'phy_4_1_2_01', 'phy_4_1_3_01', 'phy_4_1_4_01', 'phy_4_1_5_01',
  'phy_4_2_1_01', 'phy_4_2_2_01', 'phy_4_2_3_01', 'phy_4_3_1_01', 'phy_4_3_2_01',
  'phy_4_3_3_01', 'phy_4_3_3_02', 'phy_4_3_4_01', 'phy_4_4_1_01', 'phy_4_4_2_01',
  'phy_4_4_3_01', 'phy_4_4_4_01', 'phy_4_4_5_01', 'phy_5_1_1_01', 'phy_5_1_1_02',
  'phy_5_1_2_01', 'phy_5_1_2_02', 'phy_5_1_2_03', 'phy_5_2_1_01', 'phy_5_2_2_01',
  'phy_5_2_2_02', 'phy_5_2_2_03', 'phy_5_2_3_01', 'phy_5_2_3_02'
];
const chapters = [21, 22, 23, 24, 25, 26, 27, 28, 29];
let invalids = [];
for (const ch of chapters) {
  const prefix = (ch >= 28) ? 'phy_5' : 'phy_4';
  const jsonPath = path.join(process.cwd(), `docs/0 数据准备/Charpter 1-30/charpter${ch}/${prefix}_chapter${ch}_questions.json`);
  if (!fs.existsSync(jsonPath)) continue;
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  data.forEach(q => {
    if (q.subtopicCodes) {
      q.subtopicCodes.forEach(s => {
        if (!validSubtopics.includes(s)) {
          invalids.push({id: q.businessCode, t: q.topicCode, invalid_sub: s});
        }
      });
    }
  });
}
console.log('Total invalid subtopics:', invalids.length);
if (invalids.length > 0) {
  console.log(invalids);
}