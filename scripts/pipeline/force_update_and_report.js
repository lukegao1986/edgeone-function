const fs = require('fs');
const path = require('path');

const validSubtopics = [
  "phy_4_1_1_01", "phy_4_1_2_01", "phy_4_1_3_01", "phy_4_1_4_01", "phy_4_1_5_01",
  "phy_4_2_1_01", "phy_4_2_2_01", "phy_4_2_3_01", "phy_4_3_1_01", "phy_4_3_2_01",
  "phy_4_3_3_01", "phy_4_3_3_02", "phy_4_3_4_01", "phy_4_4_1_01", "phy_4_4_2_01",
  "phy_4_4_3_01", "phy_4_4_4_01", "phy_4_4_5_01", "phy_5_1_1_01", "phy_5_1_1_02",
  "phy_5_1_2_01", "phy_5_1_2_02", "phy_5_1_2_03", "phy_5_2_1_01", "phy_5_2_2_01",
  "phy_5_2_2_02", "phy_5_2_2_03", "phy_5_2_3_01", "phy_5_2_3_02"
];

let manualTopics = [];
try {
  manualTopics = JSON.parse(fs.readFileSync('manual_topics.json', 'utf8'));
} catch(e) {}

const manualMap = {};
manualTopics.forEach(m => manualMap[m.businessCode] = m.topicCode);

const chapters = [21, 22, 23, 24, 25, 26, 27, 28, 29];
const results = [];
results.push('businessCode,概要,topicCode,人工意见,subtopicCodes,options检查结果,explanation检查结果');

const hasDuplicateOptions = (options) => {
  if (!options || !Array.isArray(options)) return true;
  return new Set(options).size !== options.length;
};
const checkTyporaRender = (text) => {
  if (!text) return true;
  if (/\\\\\(/g.test(text) || /\\\\\[/g.test(text)) return false;
  if (/\\\(/g.test(text) || /\\\[/g.test(text)) return false;
  return true;
};

let jsonUpdateCount = 0;

for (const ch of chapters) {
  const prefix = (ch >= 28) ? 'phy_5' : 'phy_4';
  const jsonPath = path.join(process.cwd(), `docs/0 数据准备/Charpter 1-30/charpter${ch}/${prefix}_chapter${ch}_questions.json`);
  if (!fs.existsSync(jsonPath)) continue;
  
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let modified = false;

  data.forEach(q => {
    // 1. 强制将 topicCode 替换为 人工意见 (如果存在)
    const manual = manualMap[q.businessCode] || '';
    if (manual && q.topicCode !== manual) {
      q.topicCode = manual;
      modified = true;
    }
    
    // 2. 校验 subtopicCodes，如果不匹配则用默认合法值填补
    let validCurrentSubs = [];
    if (q.subtopicCodes && Array.isArray(q.subtopicCodes)) {
       validCurrentSubs = q.subtopicCodes.filter(s => s.startsWith(q.topicCode));
    }
    
    if (validCurrentSubs.length === 0) {
       const allowedSubs = validSubtopics.filter(s => s.startsWith(q.topicCode));
       q.subtopicCodes = allowedSubs.length > 0 ? [allowedSubs[0]] : [`${q.topicCode}_01`];
       modified = true;
    } else if (JSON.stringify(q.subtopicCodes) !== JSON.stringify(validCurrentSubs)) {
       q.subtopicCodes = validCurrentSubs;
       modified = true;
    }

    if (modified) jsonUpdateCount++;

    // 3. 准备 CSV 行，确保把人工意见栏的值输出，不再留空
    let optStatus = hasDuplicateOptions(q.options) ? '存在重复选项' : '正常';
    let expStatus = !checkTyporaRender(q.explanation) ? '存在Typora不支持格式' : '正常';
    const stemSnippet = q.stem ? q.stem.substring(0, 50).replace(/,/g, '，').replace(/\n/g, '') : '';
    const topic = q.topicCode || '';
    const subtopics = (q.subtopicCodes || []).join(';');
    
    results.push(`${q.businessCode},"${stemSnippet}",${topic},${manual},${subtopics},${optStatus},${expStatus}`);
  });

  if (modified) {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  }
}

console.log(`Updated JSON logic for ${jsonUpdateCount} records.`);

// 将带有 人工意见 的结果写回 CSV
const csvPath = path.join(process.cwd(), 'docs/Topic_Review_Reports/Chapter21_29_Topics_Review_Detailed.csv');
fs.writeFileSync(csvPath, results.join('\n'), 'utf8');
console.log('✅ CSV Generated with manual opinions fully preserved.');
