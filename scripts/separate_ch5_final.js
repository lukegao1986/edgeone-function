const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter5_MD/MinerU_markdown_リードα_物理_charpter5_cleaned.md');
const ansPath = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter5_MD/MinerU_markdown_リードα_物理物理_charpter5_解析_cleaned.md');

const outQuestionsPath = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter5_MD/charpter5_题目.md');
const outAnswersPath = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter5_MD/charpter5_解析.md');

const mainContent = fs.readFileSync(mainPath, 'utf8');
const ansContent = fs.readFileSync(ansPath, 'utf8');

const lines = mainContent.split('\n');
const questions = [];
let currentSection = '';
let currentQ = null;
let inAnswerBlock = false;
let globalText = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^##\s+(基礎 CHECK|基本例題|基本問題|応用問題|発展問題)/)) {
        currentSection = line.replace(/^##\s+/, '').trim();
        const match = currentSection.match(/^(基本例題|発展例題|例題)\s+(\d+)(.*)/);
        if (match) {
            currentSection = match[1];
            currentQ = {
                id: match[2],
                section: currentSection,
                text: [`## ${match[1]} ${match[2]}${match[3]}`],
                answer: []
            };
            questions.push(currentQ);
            inAnswerBlock = false;
        } else {
            currentQ = null;
        }
        continue;
    }

    if (line.match(/^##\s+解答/)) {
        inAnswerBlock = true;
        currentQ = null; 
        continue;
    }

    if (line.match(/^(指針|解答|別解|ここがポイント)/) && currentSection.includes('例題')) {
        inAnswerBlock = true;
        if (currentQ) currentQ.answer.push(line);
        continue;
    }

    const qMatch = line.match(/^##\s+(\d+)\s*(.*)/) || line.match(/^(\d+)\s*(.*)/);
    if (qMatch && !line.match(/^##\s+(解答)/)) {
        const num = qMatch[1];
        
        if (inAnswerBlock && currentSection === '基礎 CHECK') {
            const existingQ = questions.find(q => q.id === num && q.section === '基礎 CHECK');
            if (existingQ) {
                currentQ = existingQ;
                if (qMatch[2].trim()) {
                    currentQ.answer.push(qMatch[2].trim());
                }
                continue;
            }
        } else {
            let qTitle = currentSection === '基礎 CHECK' ? `### Q${num} ${qMatch[2]}` : `## ${num} ${qMatch[2]}`;
            currentQ = {
                id: num,
                section: currentSection,
                text: [qTitle],
                answer: []
            };
            questions.push(currentQ);
            inAnswerBlock = false;
            continue;
        }
    }

    if (currentQ) {
        if (inAnswerBlock) {
            currentQ.answer.push(line);
        } else {
            currentQ.text.push(line);
        }
    } else {
        globalText.push(line);
    }
}

let ansQuestions = [];
let currentAns = null;
const ansLines = ansContent.split('\n');
for (let i = 0; i < ansLines.length; i++) {
    const line = ansLines[i];
    const qMatch = line.match(/^##\s+(\d+)/);
    if (qMatch) {
        currentAns = { id: qMatch[1], text: [line] };
        ansQuestions.push(currentAns);
        continue;
    }
    if (currentAns) currentAns.text.push(line);
}

let questionsOut = globalText.join('\n') + '\n\n';
let answersOut = globalText.join('\n') + '\n\n';
let lastQSection = '', lastASection = '';

questions.forEach(q => {
    if (q.section !== lastQSection) {
        questionsOut += `\n## ${q.section}\n\n`;
        lastQSection = q.section;
    }
    questionsOut += q.text.join('\n').trim() + '\n\n';

    if (q.section !== lastASection) {
        answersOut += `\n## ${q.section} 解答\n\n`;
        lastASection = q.section;
    }

    if (q.section === '基礎 CHECK' || q.section.includes('例題')) {
        answersOut += `## ${q.id} 解答\n${q.answer.join('\n').trim()}\n\n`;
    } else {
        const foundAns = ansQuestions.find(a => a.id === q.id);
        if (foundAns) {
            answersOut += foundAns.text.join('\n').trim() + '\n\n';
        } else {
            answersOut += `## ${q.id} 解答\n(未找到解析)\n\n`;
        }
    }
});

fs.writeFileSync(outQuestionsPath, questionsOut.replace(/\n{3,}/g, '\n\n'), 'utf8');
fs.writeFileSync(outAnswersPath, answersOut.replace(/\n{3,}/g, '\n\n'), 'utf8');

console.log("Final separation complete.");
