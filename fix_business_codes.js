const fs = require('fs');
const path = require('path');

const jsonFile = path.join(__dirname, 'docs/0 数据准备/Charpter 1-30/charpter1/phy_1_chapter1_questions.json');
const previewFile = path.join(__dirname, 'docs/0 数据准备/Charpter 1-30/charpter1/phy_1_chapter1_questions_preview.md');
const qFile = path.join(__dirname, 'docs/0 数据准备/Charpter 1-30/charpter1/charpter1_题目.md');

const qContent = fs.readFileSync(qFile, 'utf8');
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

// Determine correct businessCode for each validQuestion
let cIndex = 1;
let eIndex = 1;
let bIndex = 1;
let aIndex = 1;

const correctCodes = validQuestions.map(q => {
  if (q.match(/^### Q\d+/)) {
    return `phy-01-qC${cIndex++}`;
  } else if (q.match(/^## 例題\d+/)) {
    return `phy-01-qE${eIndex++}`;
  } else if (q.match(/^\d+\s+/) || q.match(/^✿?\d+\s+/)) {
    // Need to distinguish B (基本問題/リードC) and A (応用問題)
    // 応用問題 starts at 18
    const numMatch = q.match(/^✿?(\d+)\s+/);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      if (num >= 18) {
        return `phy-01-qA${aIndex++}`;
      } else {
        return `phy-01-qB${bIndex++}`;
      }
    }
  }
  return 'unknown';
});

console.log('Correct codes:', correctCodes);

const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

if (data.length === correctCodes.length) {
  data.forEach((q, i) => {
    q.businessCode = correctCodes[i];
    // Fix option formatting if there are "A:", "B:" in options
    q.options = q.options.map(opt => opt.replace(/^[A-Z][:.]\s*/, ''));
  });
  
  fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2), 'utf8');
  console.log('Fixed businessCodes in JSON');
  
  // Re-generate preview
  let previewMd = `# phy_1 章 题目预览\n\n总题数: ${data.length}\n\n`;
  for (const q of data) {
    previewMd += `## [难度 ${q.difficultyLevel}] ${q.businessCode} (选项数: ${q.options.length})\n\n`;
    previewMd += `**考点**: ${q.topicCode} | ${q.subtopicCodes ? q.subtopicCodes.join(', ') : '未标注'}\n\n`;
    previewMd += `**题干**:\n${q.stem}\n\n`;
    previewMd += `**选项**:\n`;
    q.options.forEach((opt, idx) => {
      previewMd += `${idx === q.correctIndex ? '✅' : '❌'} ${idx}. ${opt}\n`;
    });
    previewMd += `\n**解析**:\n${q.explanation}\n\n---\n\n`;
  }
  fs.writeFileSync(previewFile, previewMd, 'utf8');
  console.log('Fixed preview markdown');
} else {
  console.error(`Length mismatch! JSON has ${data.length}, validQuestions has ${correctCodes.length}`);
}
