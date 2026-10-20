const fs = require('fs');
const path = require('path');

const IN_DIR = 'docs/0 数据准备/Charpter 1-30/charpter1';
const QUEST = path.join(IN_DIR, 'charpter1题目_cleaned.md');
const ANS = path.join(IN_DIR, 'charpter1解析_cleaned.md');
const OUT_Q = path.join(IN_DIR, 'charpter1_题目.md');
const OUT_A = path.join(IN_DIR, 'charpter1_解析.md');

let qSrc = fs.readFileSync(QUEST, 'utf8').replace(/\r\n/g, '\n');
let aSrc = fs.readFileSync(ANS, 'utf8').replace(/\r\n/g, '\n');

const qLines = qSrc.split('\n');

function findLineIdx(pattern, from = 0) {
  for (let i = from; i < qLines.length; i++) if (pattern.test(qLines[i])) return i;
  return -1;
}

const idxBaseCheckHead = findLineIdx(/^##\s*基礎CHECK$/);
const idxBaseCheckAns = findLineIdx(/^##\s*解答$/);
const idxEx1 = findLineIdx(/^##\s*例題1\b/);
const idxEx2 = findLineIdx(/^##\s*例題2\b/);
const idxEx3 = findLineIdx(/^##\s*例題3\b/);
const idxEx4 = findLineIdx(/^##\s*例題4\b/);
const idxEx5 = findLineIdx(/^##\s*例題5\b/);
const idxFund = findLineIdx(/^##\s*基本問題\s*$/);
const idxLeadC = findLineIdx(/^##\s*リード\s*C/);
const idxApp = findLineIdx(/^##\s*応用問題\s*$/);
const exIdxs = [idxEx1, idxEx2, idxEx3, idxEx4, idxEx5, idxFund];

const section = (a, b) => qLines.slice(a, b).join('\n').replace(/\n{3,}/g, '\n\n').trim();

// ============== PART 1: 纯题目 ==============
const outQ = [];

// 1. 章头 (章头 L1-3：## 基礎 CHECK + 说明行)
outQ.push('# 第1章 運動の表し方\n');
outQ.push(qLines[idxBaseCheckHead]);
outQ.push('');
const noteLine = qLines[idxBaseCheckHead + 2];
if (noteLine && /上位科目/.test(noteLine)) outQ.push(noteLine.trim()), outQ.push('');

// 2. 基礎 CHECK 题目（L3+1 到 idxBaseCheckAns 之前；8 道 标记 ### Qn）
const baseRaw = section(idxBaseCheckHead + 2, idxBaseCheckAns);
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

// 3. 例題 1-5：题目 = 例題标题行 ... 到第一个「指針」或「解答」前一行
for (let k = 0; k < 5; k++) {
  const from = exIdxs[k];
  const to = exIdxs[k + 1];
  outQ.push(qLines[from]); // ## 例題X
  outQ.push('');
  let cut = to;
  for (let i = from + 1; i < to; i++) {
    if (/^\s*指針\s/.test(qLines[i]) || /^\s*解答\s/.test(qLines[i]) || /^\s*POINT\s*$/.test(qLines[i])) { cut = i; break; }
  }
  const qChunk = section(from + 1, cut);
  if (qChunk) outQ.push(qChunk), outQ.push('');
}

// 4. 基本問題（含 リード C） B1-B17
outQ.push(qLines[idxFund]); // ## 基本問題
outQ.push('');
const noteLine2 = qLines[idxFund + 2];
if (noteLine2 && /上位科目|◆：/.test(noteLine2)) outQ.push(noteLine2.trim()), outQ.push('');
let bCursor = idxFund + 2;
if (noteLine2 && /上位科目|◆：/.test(noteLine2)) bCursor = idxFund + 3;
const bChunk = section(bCursor, idxApp);
if (bChunk) outQ.push(bChunk.trim()), outQ.push('');

// 5. 応用問題 A18-A21
outQ.push(qLines[idxApp]); // ## 応用問題
outQ.push('');
const aChunk = section(idxApp + 1, qLines.length);
if (aChunk) outQ.push(aChunk.trim());
outQ.push('');

// 题目 md 输出：最后压缩多余空行
const finalQ = outQ.join('\n').replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '\n');
fs.writeFileSync(OUT_Q, finalQ, 'utf8');
console.log(`>>> 纯题目 写入 ${OUT_Q}：${finalQ.split('\n').length} 行`);

// ============== PART 2: 纯解析 ==============
const outA = [];
outA.push('# 第1章 運動の表し方 解答・解説\n');

// 1. 基礎 CHECK 解答
const baseAnsChunk = section(idxBaseCheckAns + 1, idxEx1);
outA.push('## 基礎CHECK 解答');
outA.push('');
if (baseAnsChunk) outA.push(baseAnsChunk.trim()), outA.push('');

// 2. 例題 1-5 解答（指針+解答+POINT/注 全打包）
for (let k = 0; k < 5; k++) {
  const from = exIdxs[k];
  const to = exIdxs[k + 1];
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

// 3. 基本問題 B1-B17 + 応用 A18-A21：从解析 md 切片
// 解析 md 按 「## -↓ ここがポイント」或 「## ここがポイント」 切 21 段
const aLines = aSrc.split('\n');
const aHdIdx = [];
for (let i = 0; i < aLines.length; i++) {
  if (/^##\s*-?↓?\s*ここがポイント\s*$/.test(aLines[i]) && aLines[i - 1] !== undefined) aHdIdx.push(i);
}
// 最后一段末尾就是 EOF
const segBodies = [];
for (let s = 0; s < aHdIdx.length; s++) {
  const from = aHdIdx[s];
  const to = (s + 1 < aHdIdx.length) ? aHdIdx[s + 1] : aLines.length;
  segBodies.push(aLines.slice(from, to).join('\n').trim());
}
// 校正应为 21 段
console.log(`>>> 解析分区段数：${segBodies.length}（期望 21）`);

outA.push('## 基本問題 解答');
outA.push('');
// B1-B17
for (let i = 0; i < 17; i++) {
  outA.push(`### B${i + 1}`);
  outA.push('');
  outA.push(segBodies[i]);
  outA.push('');
}
outA.push('## 応用問題 解答');
outA.push('');
for (let i = 17; i < 21; i++) {
  outA.push(`### A${i + 1}`);
  outA.push('');
  outA.push(segBodies[i]);
  outA.push('');
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

// 解答关键字在题目 md：必须 0
const solKeys = ['解答', '指針', '別解', 'POINT', 'ここがポイント', '\\bPOINT\\b'];
const bad = [];
for (const k of solKeys) {
  const re = new RegExp(k);
  let found = 0;
  for (const l of finalQ.split('\n')) if (re.test(l.replace(/「[^」]*」/g, '')) && !/解答\s*\(/g.test(l.replace(/「[^」]*」/g, ''))) {
    // 忽略 「式「x=vt」より解答 ~ 这种在公式引用
    const l2 = l.replace(/「[^」]*」/g, '');
    if (/解答\s*[（(]?\s*\d/.test(l2) || /^\s*解答\s/.test(l2) || /^\s*指針\s/.test(l2) || /^\s*POINT\s*$/.test(l2) || /ここがポイント/.test(l2) || /^\s*別解\s/.test(l2)) found++;
  }
  if (found) bad.push(`${k}:${found}`);
}
console.log('\n=== 题目 md 解答关键字残留 ===', bad.length ? '❌ ' + bad.join('，') : '✅ 0 残留');

// 解析 md 不含题目正文（即不应出现 "■ 金沢駅" 这种题干典型句；此处用 基本問題 1 题干首句在解析里不应完整出现作校验）
const stemSample = '金沢駅で新幹線に乗り';
console.log(`=== 解析 md 题干正文残留？：${finalA.includes(stemSample) ? '❌ 含B1题干片段' : '✅ OK'}`);

// 题号对应：34 题 × 解析 34 段
const aSections = (finalA.match(/^##\s+基礎CHECK\s+解答/m) ? 8 : 0) +
                  (finalA.match(/^##\s+例題\d+\s+解答/gm) || []).length +
                  (finalA.match(/^###\s+B\d+/gm) || []).length +
                  (finalA.match(/^###\s+A\d+/gm) || []).length;
console.log(`=== 题号对应：解析 34 段？（基础8+例5+基17+応4=34）实际：${aSections} / ${aSections === 34 ? '✅' : '❌'}`);
