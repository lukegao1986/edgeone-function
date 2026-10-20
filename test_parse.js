const fs = require('fs');
const qContent = fs.readFileSync('docs/0 数据准备/Charpter 1-30/charpter1/charpter1_题目.md', 'utf8');
const qLines = qContent.split('\n');
const questions = [];
let currentQ = [];
for (let i = 0; i < qLines.length; i++) {
  const line = qLines[i];
  if (line.match(/^### Q\d+/) || line.match(/^## 例題\d+/) || line.match(/^\d+\s+[^■▪☐]+[■▪☐]/) || line.match(/^✿?\d+\s+[^■▪☐]+[■▪☐]/)) {
    if (currentQ.length > 0) questions.push(currentQ.join('\n'));
    currentQ = [line];
  } else if (line.match(/^## 基礎CHECK/) || line.match(/^## 基本問題/) || line.match(/^## 応用問題/) || line.match(/^## リード C/) || line.match(/^## : 上位科目/) || line.match(/^◆：上位科目/)) {
    if (currentQ.length === 0) currentQ.push(line);
    else currentQ.push(line);
  } else {
    currentQ.push(line);
  }
}
if (currentQ.length > 0) questions.push(currentQ.join('\n'));
const validQuestions = questions.filter(q => q.match(/### Q\d+/) || q.match(/## 例題\d+/) || q.match(/\d+\s+[^■▪☐]+[■▪☐]/) || q.match(/✿?\d+\s+[^■▪☐]+[■▪☐]/));
console.log('Parsed valid questions:', validQuestions.length);
validQuestions.forEach((q, i) => console.log((i+1) + ': ' + q.split('\n')[0]));