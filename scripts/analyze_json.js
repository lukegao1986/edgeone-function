const fs = require('fs');
const data = JSON.parse(fs.readFileSync('docs/0 数据准备/charpter 2-10/charpter4_MD/phy_1_chapter04_questions.json', 'utf8'));

let issueCount = 0;
data.forEach(q => {
  // calculate N
  let N = 1;
  if (q.stem.includes('(4)')) N = 4;
  else if (q.stem.includes('(3)')) N = 3;
  else if (q.stem.includes('(2)')) N = 2;
  
  const expectedOptions = 2 * N + 2;
  const actualOptions = q.options.length;
  
  let hasJoined = q.options[0] && q.options[0].includes(' | ');
  let hasPrefix = q.options[0] && /^[A-Z][:.]\s/.test(q.options[0]);
  
  if (expectedOptions !== actualOptions || hasJoined || hasPrefix) {
    console.log(`${q.businessCode}: N=${N}, expected=${expectedOptions}, actual=${actualOptions}, joined=${hasJoined}, prefix=${hasPrefix}`);
    issueCount++;
  }
});
console.log(`Total issues: ${issueCount}`);
