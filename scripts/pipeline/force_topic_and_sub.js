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

async function main() {
  const overrides = JSON.parse(fs.readFileSync('manual_topics_force.json', 'utf8'));
  const overrideMap = {};
  overrides.forEach(o => {
    overrideMap[o.businessCode] = o.topicCode;
  });

  const chapters = [21, 22, 23, 24, 25, 26, 27, 28, 29];
  let fixedCount = 0;

  for (const ch of chapters) {
    const prefix = (ch >= 28) ? 'phy_5' : 'phy_4';
    const jsonPath = path.join(process.cwd(), `docs/0 数据准备/Charpter 1-30/charpter${ch}/${prefix}_chapter${ch}_questions.json`);
    if (!fs.existsSync(jsonPath)) continue;
    
    let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let modified = false;

    for (let q of data) {
      if (overrideMap[q.businessCode]) {
        const manual = overrideMap[q.businessCode];
        
        // 1. FORCE UPDATE topicCode
        if (q.topicCode !== manual) {
           q.topicCode = manual;
           modified = true;
           console.log(`Forced topicCode for ${q.businessCode} -> ${q.topicCode}`);
        }
        
        // 2. Fix subtopicCodes without changing topicCode
        let currentSubs = q.subtopicCodes || [];
        let validSubs = currentSubs.filter(s => s.startsWith(q.topicCode) && validSubtopics.includes(s));
        
        if (validSubs.length === 0) {
           // We must pick a valid subtopic that starts with manual
           const candidates = validSubtopics.filter(s => s.startsWith(q.topicCode));
           if (candidates.length > 0) {
              q.subtopicCodes = [candidates[0]];
           } else {
              // If none perfectly matches, fallback to something reasonable
              q.subtopicCodes = [`${q.topicCode}_01`];
           }
           modified = true;
           console.log(`  -> Fixed subtopicCodes for ${q.businessCode} -> ${q.subtopicCodes}`);
        } else {
           if (JSON.stringify(currentSubs) !== JSON.stringify(validSubs)) {
              q.subtopicCodes = validSubs;
              modified = true;
           }
        }
        
        if (modified) fixedCount++;
      }
    }

    if (modified) {
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Saved fixes for Chapter ${ch}.`);
    }
  }
  
  console.log(`Total items forced to manual opinion: ${fixedCount}`);
}

main().catch(console.error);