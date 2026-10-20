// ===== .scan_ch1_blocks.js =====
// 目的：切分四档题型（C/E/B/A）+ 逐题抽题号-关键词-前 80 字 + 图片数，供 LLM 精准喂料
const fs = require('fs');
const ROOT = 'docs/0 数据准备/Charpter 1-30/charpter1';
const P = fs.readFileSync(`${ROOT}/charpter1题目.md`, 'utf8');
const A = fs.readFileSync(`${ROOT}/charpter1解析.md`, 'utf8');

function L(text){ return (text||'').split(/\r?\n/).length; }
function I(text){ return ((text||'').match(/!\[[^\]]*\]\(/g)||[]).length; }

// ===== 1. 切四档 BLOCK =====
function sliceBetween(text, startRe, endRe, label, forceMultiline=true) {
  function addM(re){ if (forceMultiline && !re.multiline) return new RegExp(re.source, re.flags + 'm'); return re; }
  const s = addM(startRe).exec(text);
  if (!s) return { ok:false, block:'', startOffset:-1 };
  let from = s.index;
  let to = text.length;
  if (endRe) {
    const rest = text.slice(from + s[0].length);
    const e = addM(endRe).exec(rest);
    if (e) to = from + s[0].length + e.index;
  }
  return { ok:true, block: text.slice(from, to).trim(), startOffset: from };
}
const C = sliceBetween(P, /^##\s*基礎\s*CHECK\s*$/, /^##\s*解答\s*$/, 'C');
const E = sliceBetween(P, /^##\s*解答\s*$/, /^##\s*基本例題\s*\d+/, 'E解答前半'); // 不要
// 基本例題：多个锚（每道例題独立 ## 基本例題 N 标题）
const B = sliceBetween(P, /^##\s*基本問題\s*$/, /^##\s*応用問題\s*$/, 'B');
const APP = sliceBetween(P, /^##\s*応用問題\s*$/, null, 'A');

// ===== 2. 逐题提取：基础 CHECK 每道题 (C1-C5) =====
function pickQuestions(block, prefix, numberRe) {
  const lines = block.split(/\r?\n/);
  const qs = []; let cur = null;
  for (let i=0; i<lines.length; i++) {
    const l = lines[i];
    const m = l.match(numberRe);
    if (m) {
      if (cur) qs.push(cur);
      cur = { id: prefix + m[1], startLine: i, title: m[2] ? m[2].trim() : '', lines: [l] };
    } else {
      if (cur) cur.lines.push(l);
    }
  }
  if (cur) qs.push(cur);
  return qs;
}
// 基础 CHECK: 题号一般是 1 2 3 4 5 或 C1 C2... 开头，后面接关键词
const cBlock = C.block;
// 先看基础 CHECK 段实际 1-5 题号格式
const C_LINES = cBlock.split(/\r?\n/).slice(0, 40);
console.log('\n=== [C 基础 CHECK 段前 40 行 预览] ===');
C_LINES.forEach((l,i)=>console.log(String(i+1).padStart(2,' ')+': '+l));

// 基本例題: ## 基本例題 N 标题关键词
const ALL_EX_HEADS = [...P.matchAll(/^##\s*基本例題\s+(\d+)\s+(.+)$/gm)].map(m=>({n:+m[1], title:m[2].trim()}));
console.log('\n=== [E 基本例題 标题关键词表] ===');
ALL_EX_HEADS.forEach(e => console.log(`E${e.n}  ${e.title}`));

// 基本問題 B: 题号 12/13/14/... (两位或多位数 + 关键词)
console.log('\n=== [B 基本問題 锚点后前 80 行] ===');
B.block.split(/\r?\n/).slice(0, 80).forEach((l,i)=>console.log(String(i+1).padStart(2,' ')+': '+l));

// 応用問題 A: 18 19 20 21... 题号
console.log('\n=== [A 応用問題 段前 120 行] ===');
APP.block.split(/\r?\n/).slice(0, 120).forEach((l,i)=>console.log(String(i+1).padStart(2,' ')+': '+l));

// ===== 3. 解析文件切分：对应各题的解析 =====
console.log('\n=== [解析.md 前 80 行预览] ===');
A.split(/\r?\n/).slice(0, 80).forEach((l,i)=>console.log(String(i+1).padStart(2,' ')+': '+l));
console.log(`\n=== 总体信息 ===`);
console.log(`题目: L=${L(P)} Img=${I(P)}`);
console.log(`解析: L=${L(A)} Img=${I(A)}`);
console.log(`C 基础CHECK 长度: L=${L(C.block)} Img=${I(C.block)}  起于 offset=${C.startOffset}`);
console.log(`B 基本問題 长度: L=${L(B.block)} Img=${I(B.block)}`);
console.log(`A 応用問題 长度: L=${L(APP.block)} Img=${I(APP.block)}`);
