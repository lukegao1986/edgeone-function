const fs = require('fs');
const path = require('path');

const chapterNum = process.argv[2];
if (!chapterNum) {
  console.error('请提供章节号，例如: node 2_split.js 2');
  process.exit(1);
}

const IN_DIR = `docs/0 数据准备/Charpter 1-30/charpter${chapterNum}`;
const QUEST = path.join(process.cwd(), IN_DIR, `charpter${chapterNum}题目_cleaned.md`);
const ANS = path.join(process.cwd(), IN_DIR, `charpter${chapterNum}解析_cleaned.md`);
const OUT_Q = path.join(process.cwd(), IN_DIR, `charpter${chapterNum}_题目.md`);
const OUT_A = path.join(process.cwd(), IN_DIR, `charpter${chapterNum}_解析.md`);

if (!fs.existsSync(QUEST) || !fs.existsSync(ANS)) {
  console.error(`请先运行 1_clean.js，文件不存在: ${QUEST} 或 ${ANS}`);
  process.exit(1);
}

let qSrc = fs.readFileSync(QUEST, 'utf8').replace(/\r\n/g, '\n');
let aSrc = fs.readFileSync(ANS, 'utf8').replace(/\r\n/g, '\n');

const qLines = qSrc.split('\n');

function findLineIdx(pattern, from = 0) {
  for (let i = from; i < qLines.length; i++) if (pattern.test(qLines[i])) return i;
  return -1;
}

const idxBaseCheckHead = findLineIdx(/^##\s*基礎CHECK$/);
const idxBaseCheckAns = findLineIdx(/^##\s*解答$/);
const idxFund = findLineIdx(/^##\s*基本問題\s*$/);
const idxApp = findLineIdx(/^##\s*応用問題\s*$/);

// 动态找出所有例题
const exIdxs = [];
for (let i = 0; i < qLines.length; i++) {
  if (/^##\s*例題\d+/.test(qLines[i])) {
    exIdxs.push({ idx: i, title: qLines[i] });
  }
}
const numExamples = exIdxs.length;

const section = (a, b) => qLines.slice(a, b).join('\n').replace(/\n{3,}/g, '\n\n').trim();

// ============== PART 1: 纯题目 ==============
const outQ = [];

// 1. 章头 (章头 L1-3：## 基礎 CHECK + 说明行)
const chHeaderMatch = qSrc.match(/^#\s+(.*)$/m);
const chapterTitle = chHeaderMatch ? chHeaderMatch[1] : `第${chapterNum}章`;
outQ.push(`# ${chapterTitle}\n`);

if (idxBaseCheckHead !== -1) {
  outQ.push(qLines[idxBaseCheckHead]);
  outQ.push('');
  const noteLine = qLines[idxBaseCheckHead + 2];
  if (noteLine && /上位科目/.test(noteLine)) outQ.push(noteLine.trim()), outQ.push('');

  // 2. 基礎 CHECK 题目
  const endIdx = idxBaseCheckAns !== -1 ? idxBaseCheckAns : (exIdxs.length > 0 ? exIdxs[0].idx : idxFund);
  const baseRaw = section(idxBaseCheckHead + 2, endIdx);
  const baseQLines = baseRaw.split('\n').filter(l => !/^\s*$/.test(l) || true);
  let q8Buffer = [];
  let qNo = 0;
  for (let i = 0; i < baseQLines.length; i++) {
    const l = baseQLines[i];
    const m = l.match(/^[✿◆]?\s*(\d{1,2})\s+\S/);
    if (m) {
      if (qNo > 0) { outQ.push(...q8Buffer, ''); }
      qNo++;
      outQ.push(`### Q${qNo}`);
      outQ.push('');
      outQ.push(l.replace(/^[✿◆]\s*/, ''));
      q8Buffer = [];
    } else {
      if (qNo > 0) q8Buffer.push(l);
    }
  }
  if (q8Buffer.length && qNo) { outQ.push(...q8Buffer); }
  outQ.push('');
}

// 3. 例題：题目 = 例題标题行 ... 到第一个「指針」或「解答」前一行
for (let k = 0; k < numExamples; k++) {
  const from = exIdxs[k].idx;
  const to = k + 1 < numExamples ? exIdxs[k + 1].idx : (idxFund !== -1 ? idxFund : (idxApp !== -1 ? idxApp : qLines.length));
  outQ.push(qLines[from]); // ## 例題X
  outQ.push('');
  let cut = to;
  for (let i = from + 1; i < to; i++) {
    if (/^\s*指針\s/.test(qLines[i]) || /^\s*解答\s/.test(qLines[i]) || /^\s*POINT\s*$/.test(qLines[i])) { cut = i; break; }
  }
  const qChunk = section(from + 1, cut);
  if (qChunk) outQ.push(qChunk), outQ.push('');
}

// 4. 基本問題
let bStart = -1, bEnd = -1;
if (idxFund !== -1) {
  outQ.push(qLines[idxFund]); // ## 基本問題
  outQ.push('');
  const noteLine2 = qLines[idxFund + 2];
  let bCursor = idxFund + 2;
  if (noteLine2 && /上位科目|◆：/.test(noteLine2)) {
    outQ.push(noteLine2.trim()), outQ.push('');
    bCursor = idxFund + 3;
  }
  bStart = bCursor;
  bEnd = idxApp !== -1 ? idxApp : qLines.length;
  const bChunk = section(bCursor, bEnd);
  if (bChunk) outQ.push(bChunk.trim()), outQ.push('');
}

// 5. 応用問題
let aStart = -1, aEnd = -1;
if (idxApp !== -1) {
  outQ.push(qLines[idxApp]); // ## 応用問題
  outQ.push('');
  aStart = idxApp + 1;
  aEnd = qLines.length;
  const aChunk = section(idxApp + 1, qLines.length);
  if (aChunk) outQ.push(aChunk.trim());
  outQ.push('');
}

// 统计题目中的基本问题和应用问题数量，以便切分解析
function countQuestions(start, end) {
  if (start === -1) return 0;
  const text = section(start, end);
  const m = text.match(/^[✿◆]?\s*(\d{1,3})\s+\S/gm);
  return m ? m.length : 0;
}
const numFund = countQuestions(bStart, bEnd);
const numApp = countQuestions(aStart, aEnd);

// 题目 md 输出：最后压缩多余空行
const finalQ = outQ.join('\n').replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '\n');
fs.writeFileSync(OUT_Q, finalQ, 'utf8');
console.log(`>>> 纯题目 写入 ${OUT_Q}：${finalQ.split('\n').length} 行`);


// ============== PART 2: 纯解析 ==============
const outA = [];
outA.push(`# ${chapterTitle} 解答・解説\n`);

// 1. 基礎 CHECK 解答
if (idxBaseCheckAns !== -1) {
  const toIdx = exIdxs.length > 0 ? exIdxs[0].idx : (idxFund !== -1 ? idxFund : (idxApp !== -1 ? idxApp : qLines.length));
  const baseAnsChunk = section(idxBaseCheckAns + 1, toIdx);
  outA.push('## 基礎CHECK 解答');
  outA.push('');
  if (baseAnsChunk) outA.push(baseAnsChunk.trim()), outA.push('');
}

// 2. 例題解答
for (let k = 0; k < numExamples; k++) {
  const from = exIdxs[k].idx;
  const to = k + 1 < numExamples ? exIdxs[k + 1].idx : (idxFund !== -1 ? idxFund : (idxApp !== -1 ? idxApp : qLines.length));
  let start = -1;
  for (let i = from + 1; i < to; i++) {
    if (/^\s*指針\s/.test(qLines[i]) || /^\s*解答\s/.test(qLines[i]) || /^\s*POINT\s*$/.test(qLines[i])) { start = i; break; }
  }
  if (start > 0) {
    const chunk = section(start, to);
    outA.push(`## 例題${k + 1} 解答`);
    outA.push('');
    if (chunk) outA.push(chunk.trim()), outA.push('');
  }
}

// 3. 基本問題 + 応用問題：从解析 md 切片
const aLines = aSrc.split('\n');
const aHdIdx = [];
for (let i = 0; i < aLines.length; i++) {
  if (/^##\s*-?↓?\s*ここがポイント\s*$/.test(aLines[i]) && aLines[i - 1] !== undefined) aHdIdx.push(i);
}
const segBodies = [];
for (let s = 0; s < aHdIdx.length; s++) {
  const from = aHdIdx[s];
  const to = (s + 1 < aHdIdx.length) ? aHdIdx[s + 1] : aLines.length;
  segBodies.push(aLines.slice(from, to).join('\n').trim());
}

console.log(`>>> 解析分区段数：${segBodies.length}（预期：基本问题 ${numFund} + 应用问题 ${numApp} = ${numFund + numApp}）`);

if (numFund > 0) {
  outA.push('## 基本問題 解答');
  outA.push('');
  for (let i = 0; i < numFund && i < segBodies.length; i++) {
    outA.push(`### B${i + 1}`);
    outA.push('');
    outA.push(segBodies[i]);
    outA.push('');
  }
}

if (numApp > 0) {
  outA.push('## 応用問題 解答');
  outA.push('');
  for (let i = numFund; i < numFund + numApp && i < segBodies.length; i++) {
    outA.push(`### A${i + 1}`);
    outA.push('');
    outA.push(segBodies[i]);
    outA.push('');
  }
}

const finalA = outA.join('\n').replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '\n');
fs.writeFileSync(OUT_A, finalA, 'utf8');
console.log(`>>> 纯解析 写入 ${OUT_A}：${finalA.split('\n').length} 行`);

// ============== 校验 ==============
const countImg = (s) => ((s.match(/!\[image\]\(/g) || []).length);
console.log('\n=== 图片计数 ===');
console.log(`题目_cleaned 原图：${countImg(qSrc)} → 题目 md：${countImg(finalQ)}`);
console.log(`解析_cleaned 原图：${countImg(aSrc)} → 解析 md：${countImg(finalA)}`);
const totalQ = countImg(qSrc);
const totalA = countImg(aSrc);
const oQ = countImg(finalQ), oA = countImg(finalA);
console.log(`合计：原 ${totalQ + totalA} → 输出 ${oQ + oA}（${oQ + oA === totalQ + totalA ? '✅ 一致' : '❌ 差 ' + ((oQ + oA) - (totalQ + totalA))} 张）`);
