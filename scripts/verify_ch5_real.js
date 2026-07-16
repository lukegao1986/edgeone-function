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

for (let i = 0; i < mainLines.length; i++) {
    const line = mainLines[i].trim();
    if (!line) continue;

    if (line.match(/^##\s*(基礎 CHECK|基本例題|基本例题|基本問題|応用問題|発展問題)/)) {
        currentSection = line.replace(/^##\s*/, '').trim();
        const match = currentSection.match(/^(基本例題|基本例题|発展例題|例題)\s+(\d+)(.*)/);
        if (match) {
            currentSection = match[1] === '基本例题' ? '基本例題' : match[1];
            mainQuestions.push({ id: match[2], section: currentSection });
        }
        continue;
    }

    const qMatch = line.match(/^##\s+(\d+)\s*(.*)/) || line.match(/^(\d+)\s*(.*)/);
    // Be careful with numbers that are just pure numbers but not questions.
    // Usually questions are at least followed by some text, but sometimes it's just "102".
    if (qMatch && !line.match(/^##\s*(解答|指針)/) && !line.match(/^(解答|指針)/)) {
        const num = qMatch[1];
        // avoid matching random single numbers unless they are explicitly expected
        // Check if previous lines were empty or section headers
        if (num.length > 0 && num.length < 4) { // typical question IDs are 1 to 3 digits
            // We check if it's already added to avoid duplicates if there's text wrapping
            if (!mainQuestions.find(q => q.id === num && q.section === currentSection)) {
                // If it's a pure number with no text, we still add it
                mainQuestions.push({ id: num, section: currentSection });
            }
        }
    }
}

// Parse Answer File
const ansLines = ansContent.split('\n');
const ansQuestions = [];
let currentAnsSection = '';

for (let i = 0; i < ansLines.length; i++) {
    const line = ansLines[i].trim();
    if (!line) continue;

    if (line.match(/^##\s*(基礎 CHECK|基本例題|基本例题|基本問題|応用問題|発展問題)/)) {
        currentAnsSection = line.replace(/^##\s*/, '').trim();
        const match = currentAnsSection.match(/^(基本例題|基本例题|発展例題|例題)\s+(\d+)(.*)/);
        if (match) {
            currentAnsSection = match[1] === '基本例题' ? '基本例題' : match[1];
            if (!ansQuestions.find(q => q.id === match[2])) {
                ansQuestions.push({ id: match[2], section: currentAnsSection });
            }
        }
        continue;
    }

    const qMatch = line.match(/^#*\s*(\d+)\s*(.*)/);
    if (qMatch && !line.match(/^(解答|指針)/) && !line.match(/^#*\s*(解答|指針)/)) {
        const num = qMatch[1];
        if (num.length > 0 && num.length < 4) {
            if (!ansQuestions.find(q => q.id === num)) {
                ansQuestions.push({ id: num, section: currentAnsSection });
            }
        }
    }
}

// Filter out noise like "1" or "2" that might be just lists inside a question
// The actual questions should be in a certain range.
// Main file has standard questions. We can use main file to filter the valid IDs.
const allIds = new Set();
mainQuestions.forEach(q => {
    // If an ID is very large or obviously wrong, we can filter it, but let's trust the regex for now.
    // Real questions: 1-4, 19-22, 94-106.
    // Wait, are there other sections?
    if (parseInt(q.id) >= 1 && parseInt(q.id) <= 200) {
        allIds.add(q.id);
    }
});
ansQuestions.forEach(q => {
    if (parseInt(q.id) >= 1 && parseInt(q.id) <= 200) {
        allIds.add(q.id);
    }
});

const sortedIds = Array.from(allIds).sort((a, b) => parseInt(a) - parseInt(b));

console.log("| 题号 | 题型分类 | 题目是否存在 (主文件) | 解析是否存在 (解析文件) |");
console.log("|---|---|---|---|");

sortedIds.forEach(id => {
    const mq = mainQuestions.find(q => q.id === id);
    const aq = ansQuestions.find(q => q.id === id);
    
    let section = mq ? mq.section : (aq ? aq.section : '未知');
    if (!section || section === '未知') {
        if (parseInt(id) <= 4) section = '基礎 CHECK';
        else if (parseInt(id) <= 90) section = '基本例題';
        else section = '基本問題';
    }

    // Only output if at least one exists and it's a recognized EJU question section
    // Actually we'll just print them all, but let's see.
    console.log(`| ${id} | ${section} | ${mq ? '✅' : '❌'} | ${aq ? '✅' : '❌'} |`);
});
