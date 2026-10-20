const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(process.cwd(), 'docs/0 数据准备/Charpter 1-30');
const OUTPUT_CSV = path.join(process.cwd(), 'docs/Topic_Review_Reports/Chapter21_29_Topics_Review_Detailed.csv');

const chapters = [21, 22, 23, 24, 25, 26, 27, 28, 29];
const results = [];

// CSV Header
results.push('businessCode,概要,topicCode,人工意见,subtopicCodes,options检查结果,explanation检查结果');

function getPhyChapterId(num) {
  const n = parseInt(num, 10);
  if (n >= 21 && n <= 27) return "phy_4";
  if (n >= 28 && n <= 30) return "phy_5";
  return "phy_1";
}

const hasDuplicateOptions = (options) => {
  if (!options || !Array.isArray(options)) return true;
  const s = new Set(options);
  return s.size !== options.length;
};

const checkTyporaRender = (text) => {
  if (!text) return true;
  if (/\\\\\(/g.test(text) || /\\\\\[/g.test(text)) return false;
  if (/\\\(/g.test(text) || /\\\[/g.test(text)) return false;
  return true;
};

for (const ch of chapters) {
  const phyX = getPhyChapterId(ch);
  const jsonPath = path.join(BASE_DIR, `charpter${ch}`, `${phyX}_chapter${ch}_questions.json`);
  if (!fs.existsSync(jsonPath)) {
    console.log(`Skipping Chapter ${ch}, file not found.`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  data.forEach(q => {
    let optStatus = '正常';
    if (hasDuplicateOptions(q.options)) {
      optStatus = '存在重复选项';
    }

    let expStatus = '正常';
    if (!checkTyporaRender(q.explanation)) {
      expStatus = '存在Typora不支持格式';
    }

    const bCode = q.businessCode || '';
    const stemSnippet = q.stem ? q.stem.substring(0, 50).replace(/,/g, '，').replace(/\n/g, '') : '';
    const topic = q.topicCode || '';
    const subtopics = (q.subtopicCodes || []).join(';');

    results.push(`${bCode},"${stemSnippet}",${topic},,${subtopics},${optStatus},${expStatus}`);
  });
}

try {
  fs.writeFileSync(OUTPUT_CSV, results.join('\n'), 'utf8');
  console.log(`✅ 已生成报表: ${OUTPUT_CSV}，共 ${results.length - 1} 条记录`);
} catch (err) {
  console.error('❌ 生成 CSV 失败:', err);
}
