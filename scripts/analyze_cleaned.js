const fs = require('fs');

const mainOut = 'docs/0 数据准备/charpter 2-10/charpter5_MD/MinerU_markdown_リードα_物理_charpter5_cleaned.md';
let content = fs.readFileSync(mainOut, 'utf8');

// match "## 1 " or "## 基本例題 20"
const regex = /^##\s+(?:(基本例題|発展例題|例題)\s*)?(\d+)[^\n]*/gm;
let match;
let count = 0;
let questions = [];

while ((match = regex.exec(content)) !== null) {
    count++;
    let type = match[1] ? match[1] : '基礎CHECK/基本問題/応用問題'; // Can't easily tell CHECK vs 問題 without state
    let num = match[2];
    questions.push(`- 题目 ${num} (${type})`);
}

console.log(`Total questions in main file: ${count}`);
console.log(questions.join('\n'));

