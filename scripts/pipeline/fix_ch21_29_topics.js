const fs = require('fs');
const path = require('path');

const validTopicsPhy4 = [
  "phy_4_1_1", "phy_4_1_2", "phy_4_1_3", "phy_4_1_4", "phy_4_1_5",
  "phy_4_2_1", "phy_4_2_2", "phy_4_2_3",
  "phy_4_3_1", "phy_4_3_2", "phy_4_3_3", "phy_4_3_4",
  "phy_4_4_1", "phy_4_4_2", "phy_4_4_3", "phy_4_4_4", "phy_4_4_5"
];

const validTopicsPhy5 = [
  "phy_5_1_1", "phy_5_1_2",
  "phy_5_2_1", "phy_5_2_2", "phy_5_2_3"
];

const fixTopics = (chapters, prefix, validTopics, fallbackTopic) => {
  for (const ch of chapters) {
    const jsonPath = path.join(process.cwd(), `docs/0 数据准备/Charpter 1-30/charpter${ch}/${prefix}_chapter${ch}_questions.json`);
    if (!fs.existsSync(jsonPath)) continue;

    let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let modified = false;

    data.forEach(q => {
      if (!q.topicCode || !validTopics.includes(q.topicCode)) {
        console.log(`Fixing topicCode for ${q.businessCode}: ${q.topicCode} -> ${fallbackTopic}`);
        q.topicCode = fallbackTopic;
        modified = true;
      }
      if (q.subtopicCodes && Array.isArray(q.subtopicCodes)) {
        const fixedSubtopics = q.subtopicCodes.map(code => {
          if (!code.startsWith(q.topicCode)) {
             return `${q.topicCode}_01`;
          }
          return code;
        });
        if (JSON.stringify(fixedSubtopics) !== JSON.stringify(q.subtopicCodes)) {
           q.subtopicCodes = fixedSubtopics;
           modified = true;
        }
      }
    });

    if (modified) {
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Saved fixes for Chapter ${ch}`);
    }
  }
};

fixTopics([21, 22, 23, 24, 25, 26, 27], 'phy_4', validTopicsPhy4, 'phy_4_1_1');
fixTopics([28, 29], 'phy_5', validTopicsPhy5, 'phy_5_1_1');
