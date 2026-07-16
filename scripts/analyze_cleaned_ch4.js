const fs = require('fs');
const path = require('path');

function analyze(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const questions = [];
  
  for (const line of lines) {
    if (line.startsWith('## ')) {
      // It's a heading for a question
      questions.push(line.substring(3).trim());
    }
  }
  
  return questions;
}

const qFile = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter4_MD/MinerU_markdown_リードα_物理_charpter4_cleaned.md');
const aFile = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter4_MD/MinerU_markdown_リードα_物理物理_charpter4_解析_cleaned.md');

const qList = analyze(qFile);
const aList = analyze(aFile);

console.log('--- Questions File ---');
console.log('Count:', qList.length);
qList.forEach(q => console.log(q));

console.log('\n--- Answers File ---');
console.log('Count:', aList.length);
aList.forEach(a => console.log(a));
