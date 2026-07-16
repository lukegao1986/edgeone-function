const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter5_MD/MinerU_markdown_リードα_物理_charpter5_cleaned.md');
const ansPath = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter5_MD/MinerU_markdown_リードα_物理物理_charpter5_解析_cleaned.md');

const outQuestionsPath = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter5_MD/charpter5_题目.md');
const outAnswersPath = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter5_MD/charpter5_解析.md');

const mainContent = fs.readFileSync(mainPath, 'utf8');
const ansContent = fs.readFileSync(ansPath, 'utf8');

let questionsOut = '';
let answersOut = '';

// --- State Machine for Main Content ---
const lines = mainContent.split('\n');
let currentSection = ''; // 基礎 CHECK, 基本例題, 基本問題...
let currentQuestionNum = '';
let inAnswerBlock = false;

let currentQuestionText = [];
let currentAnswerText = [];

const allQuestions = []; // { section, num, text, answer }

function flushQuestion() {
    if (currentQuestionNum) {
        allQuestions.push({
            section: currentSection,
            num: currentQuestionNum,
            text: currentQuestionText.join('\n').trim(),
            answer: currentAnswerText.join('\n').trim()
        });
    }
    currentQuestionText = [];
    currentAnswerText = [];
    inAnswerBlock = false;
    currentQuestionNum = '';
}

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Section
    if (line.match(/^##\s+(基礎 CHECK|基本例題|基本問題|応用問題|発展問題)/)) {
        flushQuestion();
        currentSection = line.replace(/^##\s+/, '').trim();
        questionsOut += `\n## ${currentSection}\n\n`;
        // In some cases, "基本例題 20" is on the same line.
        const match = currentSection.match(/^(基本例題|発展例題|例題)\s+(\d+)(.*)/);
        if (match) {
            currentSection = match[1];
            currentQuestionNum = match[2];
            currentQuestionText.push(`## ${match[1]} ${match[2]}${match[3]}`);
            inAnswerBlock = false;
        }
        continue;
    }

    // Detect "## 解答" for 基礎 CHECK
    if (line.match(/^##\s+解答/)) {
        inAnswerBlock = true;
        continue;
    }

    // Detect "指針" or "解答" for 基本例題
    if (line.match(/^(指針|解答|別解|ここがポイント)/) && (currentSection.includes('例題') || currentSection === '基礎 CHECK')) {
        inAnswerBlock = true;
        currentAnswerText.push(line);
        continue;
    }

    // Detect Question Number (e.g. "## 1", "## 94")
    const qMatch = line.match(/^##\s+(\d+)\s*(.*)/);
    if (qMatch && !line.match(/^##\s+(解答)/)) {
        flushQuestion();
        currentQuestionNum = qMatch[1];
        if (currentSection === '基礎 CHECK') {
            currentQuestionText.push(`### Q${currentQuestionNum} ${qMatch[2]}`);
        } else {
            currentQuestionText.push(`## ${currentQuestionNum} ${qMatch[2]}`);
        }
        inAnswerBlock = false;
        continue;
    }

    // Accumulate lines
    if (currentQuestionNum) {
        if (inAnswerBlock) {
            currentAnswerText.push(line);
        } else {
            currentQuestionText.push(line);
        }
    } else {
        // Global text before any question
        if (line.startsWith('# ')) {
             questionsOut += line + '\n\n';
             answersOut += line + '\n\n';
        }
    }
}
flushQuestion();

// --- Build Question Output ---
allQuestions.forEach(q => {
    questionsOut += q.text + '\n\n';
});

// --- Parse Answers Content ---
// The ansContent contains answers for 基本問題 and 応用問題
let ansQuestions = []; // { num, text }
let currentAnsNum = '';
let currentAnsText = [];

function flushAns() {
    if (currentAnsNum) {
        ansQuestions.push({
            num: currentAnsNum,
            text: currentAnsText.join('\n').trim()
        });
    }
    currentAnsText = [];
    currentAnsNum = '';
}

const ansLines = ansContent.split('\n');
for (let i = 0; i < ansLines.length; i++) {
    const line = ansLines[i];
    const qMatch = line.match(/^##\s+(\d+)/);
    if (qMatch) {
        flushAns();
        currentAnsNum = qMatch[1];
        currentAnsText.push(line);
        continue;
    }
    if (currentAnsNum) {
        currentAnsText.push(line);
    }
}
flushAns();

// --- Build Answer Output ---
let lastSection = '';
allQuestions.forEach(q => {
    if (q.section !== lastSection) {
        answersOut += `\n## ${q.section} 解答\n\n`;
        lastSection = q.section;
    }

    if (q.section === '基礎 CHECK' || q.section.includes('例題')) {
        answersOut += `## ${q.num} 解答\n${q.answer}\n\n`;
    } else {
        // Find answer in ansQuestions
        const foundAns = ansQuestions.find(a => a.num === q.num);
        if (foundAns) {
            answersOut += foundAns.text + '\n\n';
        } else {
            answersOut += `## ${q.num} 解答\n(未找到解析)\n\n`;
        }
    }
});

fs.writeFileSync(outQuestionsPath, questionsOut.replace(/\n{3,}/g, '\n\n'), 'utf8');
fs.writeFileSync(outAnswersPath, answersOut.replace(/\n{3,}/g, '\n\n'), 'utf8');

console.log("Separation complete.");
console.log(`Questions saved to: ${outQuestionsPath}`);
console.log(`Answers saved to: ${outAnswersPath}`);
