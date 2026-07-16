const fs = require('fs');
const path = require('path');

const qFile = path.resolve(__dirname, '../docs/0 数据准备/charpter 2-10/charpter4_MD/MinerU_markdown_リードα_物理_charpter4_cleaned.md');
const aFile = path.resolve(__dirname, '../docs/0 数据准备/charpter 2-10/charpter4_MD/MinerU_markdown_リードα_物理物理_charpter4_解析_cleaned.md');

const qLines = fs.readFileSync(qFile, 'utf8').split('\n');
const aLines = fs.readFileSync(aFile, 'utf8').split('\n');

let questionsOut = [];
let answersOut = [];

let state = 'START';
let currentSection = '';
const questionToSection = {};

for (let i = 0; i < qLines.length; i++) {
  const line = qLines[i];
  
  if (line.startsWith('## 基礎 CHECK')) {
    state = 'KISO_CHECK_Q';
    questionsOut.push(line);
    continue;
  }
  
  if (state === 'KISO_CHECK_Q' && line.startsWith('## 解答')) {
    state = 'KISO_CHECK_A';
    answersOut.push('## 基礎 CHECK 解答');
    continue;
  }
  
  if (line.match(/^## 基本例題\s*\d+/)) {
    state = 'REIDAI_Q';
    questionsOut.push(line);
    answersOut.push(line + ' 解答');
    continue;
  }
  
  if (line.match(/^## (基本問題|リード C|応用問題)/)) {
    state = 'NORMAL_Q';
    currentSection = line.replace('## ', '').trim();
    questionsOut.push(line);
    continue;
  }
  
  if (state === 'KISO_CHECK_Q') {
    let m = line.match(/^##\s*(\d+)(.*)/);
    if (m) {
      questionsOut.push(`### Q${m[1]}${m[2]}`);
    } else {
      questionsOut.push(line);
    }
  } else if (state === 'KISO_CHECK_A') {
    let m = line.match(/^##\s*(\d+)(.*)/);
    if (m) {
      answersOut.push(`### Q${m[1]}${m[2]}`);
    } else {
      answersOut.push(line);
    }
  } else if (state === 'REIDAI_Q') {
    if (line.trim().match(/^(指針|解答|別解|ここがポイント)/)) {
      state = 'REIDAI_A';
      answersOut.push(line);
    } else {
      questionsOut.push(line);
    }
  } else if (state === 'REIDAI_A') {
    answersOut.push(line);
  } else if (state === 'NORMAL_Q') {
    let m = line.match(/^##\s*(\d+)(.*)/);
    if (m) {
      questionToSection[m[1]] = currentSection;
    }
    questionsOut.push(line);
  } else {
    questionsOut.push(line);
  }
}

let lastSection = '';

for (let i = 0; i < aLines.length; i++) {
  const line = aLines[i];
  let m = line.match(/^##\s*(\d+)(.*)/);
  if (m) {
    let qNum = m[1];
    let section = questionToSection[qNum] || '未知分区';
    if (section !== lastSection) {
      answersOut.push(`\n## ${section} 解答\n`);
      lastSection = section;
    }
    answersOut.push(line);
  } else {
    if (lastSection !== '') {
      answersOut.push(line);
    }
  }
}

// Prefix answersOut with Chapter title if needed
answersOut.unshift('# 第4章 解析\n');

const outQFile = path.join(path.dirname(qFile), 'charpter4_题目.md');
const outAFile = path.join(path.dirname(aFile), 'charpter4_解析.md');

// Write and compress empty lines
fs.writeFileSync(outQFile, questionsOut.join('\n').replace(/\n{3,}/g, '\n\n'));
fs.writeFileSync(outAFile, answersOut.join('\n').replace(/\n{3,}/g, '\n\n'));

console.log('Successfully separated files:');
console.log('1.', outQFile);
console.log('2.', outAFile);
