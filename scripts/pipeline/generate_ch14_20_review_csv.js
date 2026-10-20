const fs = require('fs');
const path = require('path');

const outputCsvPath = path.join(
  process.cwd(),
  'docs/Topic_Review_Reports/Chapter14_20_Topics_Review_Detailed.csv'
);

const results = [];
// CSV Header
results.push('businessCode,概要,topicCode,人工意见,subtopicCodes,options检查结果,explanation检查结果');

const hasDuplicateOptions = (options) => {
  if (!options || !Array.isArray(options)) return true;
  const s = new Set(options);
  return s.size !== options.length;
};

const checkTyporaRender = (text) => {
  if (!text) return true;
  // 如果存在 \( 或者 \[，则在 Typora 中可能渲染失败，应当统一替换为 $ 或者 $$
  if (/\\\\\(/g.test(text) || /\\\\\[/g.test(text)) return false;
  if (/\\\(/g.test(text) || /\\\[/g.test(text)) return false;
  return true;
};

for (let i = 14; i <= 20; i++) {
  const jsonPath = path.join(
    process.cwd(),
    `docs/0 数据准备/Charpter 1-30/charpter${i}/phy_3_chapter${i}_questions.json`
  );
  if (!fs.existsSync(jsonPath)) {
    console.log(`Skipping Chapter ${i}, file not found.`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  for (const q of data) {
    const bCode = q.businessCode || '';
    const stemSnippet = q.stem ? q.stem.substring(0, 50).replace(/,/g, '，').replace(/\n/g, '') : '';
    const topic = q.topicCode || '';
    const subtopics = (q.subtopicCodes || []).join(';');
    
    let optCheck = '正常';
    if (hasDuplicateOptions(q.options)) {
      optCheck = '存在重复选项';
    }
    
    let expCheck = '正常';
    if (!checkTyporaRender(q.explanation)) {
      expCheck = '渲染格式失败';
    }
    
    results.push(`${bCode},"${stemSnippet}",${topic},,${subtopics},${optCheck},${expCheck}`);
  }
}

fs.writeFileSync(outputCsvPath, results.join('\n'), 'utf8');
console.log(`Review CSV generated at ${outputCsvPath}`);
