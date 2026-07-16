const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter5_MD/MinerU_markdown_リードα_物理_charpter5.md');
const ansPath = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter5_MD/MinerU_markdown_リードα_物理物理_charpter5_解析.md');

const mainContent = fs.readFileSync(mainPath, 'utf8');
const ansContent = fs.readFileSync(ansPath, 'utf8');

// Parse Main File
const mainLines = mainContent.split('\n');
const mainQuestions = [];
let currentSection = '';
let inAnswerBlock = false;

for (let i = 0; i < mainLines.length; i++) {
    const line = mainLines[i];

    if (line.match(/^##\s+(基礎 CHECK|基本例題|基本問題|応用問題|発展問題)/)) {
        currentSection = line.replace(/^##\s+/, '').trim();
        const match = currentSection.match(/^(基本例題|発展例題|例題)\s+(\d+)(.*)/);
        if (match) {
            currentSection = match[1];
            mainQuestions.push({ id: match[2], section: currentSection, source: '主文件' });
            inAnswerBlock = false;
        }
        continue;
    }

    if (line.match(/^##\s+解答/)) {
        inAnswerBlock = true;
        continue;
    }

    if (line.match(/^(指針|解答|別解|ここがポイント)/) && currentSection.includes('例題')) {
        inAnswerBlock = true;
        continue;
    }

    const qMatch = line.match(/^##\s+(\d+)\s*(.*)/) || line.match(/^(\d+)\s+(.*)/);
    if (qMatch && !line.match(/^##\s+(解答)/)) {
        const num = qMatch[1];
        if (inAnswerBlock && currentSection === '基礎 CHECK') {
            const existingQ = mainQuestions.find(q => q.id === num && q.section === '基礎 CHECK');
            if (existingQ) existingQ.hasAnswerInMain = true;
        } else {
            mainQuestions.push({ id: num, section: currentSection, source: '主文件' });
            inAnswerBlock = false;
        }
    }
}

// Parse Answer File
const ansLines = ansContent.split('\n');
const ansQuestions = [];

for (let i = 0; i < ansLines.length; i++) {
    const line = ansLines[i];
    const qMatch = line.match(/^##\s+(\d+)/);
    if (qMatch) {
        ansQuestions.push({ id: qMatch[1], source: '解析文件' });
    }
}

console.log("| 题号 | 题型分类 (主文件) | 题目在主文件 | 答案在主文件 | 答案在解析文件 |");
console.log("|---|---|---|---|---|");

mainQuestions.forEach(mq => {
    const hasAnsInAnsFile = ansQuestions.some(aq => aq.id === mq.id);
    console.log(`| ${mq.id} | ${mq.section} | ✅ | ${mq.hasAnswerInMain || mq.section.includes('例題') ? '✅' : '❌'} | ${hasAnsInAnsFile ? '✅' : '❌'} |`);
});

ansQuestions.forEach(aq => {
    if (!mainQuestions.some(mq => mq.id === aq.id)) {
        console.log(`| ${aq.id} | (仅在解析文件) | ❌ | ❌ | ✅ |`);
    }
});
