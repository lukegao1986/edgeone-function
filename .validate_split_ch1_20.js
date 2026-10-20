// ===== validate_split_ch1_20.js =====
const fs = require('fs');
const ROOT = 'docs/0 数据准备';
const SRC_PROB = `${ROOT}/MinerU_力热波_cos.md`;
const SRC_ANS  = `${ROOT}/MinerU_力热波_解析_cos.md`;
const DST = `${ROOT}/Charpter 1-30`;

function countAll(p, re) {
  const t = fs.existsSync(p) ? fs.readFileSync(p,'utf8') : '';
  return (t.match(re) || []).length;
}
// 1. 图片（全局聚合）
const srcImgProb = countAll(SRC_PROB, /!\[[^\]]*\]\(/g);
const srcImgAns  = countAll(SRC_ANS,  /!\[[^\]]*\]\(/g);
let dstAll=0;
for (let ch=1;ch<=20;ch++) {
  dstAll += countAll(`${DST}/charpter${ch}/charpter${ch}知识点.md`,/!\[[^\]]*\]\(/g);
  dstAll += countAll(`${DST}/charpter${ch}/charpter${ch}题目.md`,/!\[[^\]]*\]\(/g);
  dstAll += countAll(`${DST}/charpter${ch}/charpter${ch}解析.md`,/!\[[^\]]*\]\(/g);
}
console.log(`[IMG] 源:题目${srcImgProb} + 解析${srcImgAns} = ${srcImgProb+srcImgAns} ； 拆分后合计: ${dstAll} ； 差异: ${dstAll-(srcImgProb+srcImgAns)}`);

// 2. 按章查图片（差1张的章列出来）
console.log('\n[按章图片对比]');
const SRC_RE_CHAP = /^##\s*第([一二三四五六七八九十百0-9]+)\s*章/m;
function kansuujiToNum(s){
  if (/^\d+$/.test(s)) return +s;
  const M={一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10};
  if(s==='十')return 10;
  if(s.startsWith('十'))return 10+M[s[1]];
  if(s.endsWith('十'))return M[s[0]]*10;
  if(s.includes('十')){const [a,b]=s.split('十');return (M[a]||1)*10+(M[b]||0);}
  return M[s]||NaN;
}
function chapBuckets(text){
  const lines = text.split(/\r?\n/); const b={}; let cur=null;let buf=[];
  for(const l of lines){
    const m=l.match(/^##\s*第([一二三四五六七八九十百0-9]+)\s*章/);
    if(m){ if(cur!=null) b[cur]=buf.join('\n'); cur=kansuujiToNum(m[1]); buf=[l]; }
    else if(cur!=null) buf.push(l);
  }
  if(cur!=null) b[cur]=buf.join('\n'); return b;
}
const pB = chapBuckets(fs.readFileSync(SRC_PROB,'utf8'));
const aB = chapBuckets(fs.readFileSync(SRC_ANS,'utf8'));
for (let ch=1;ch<=20;ch++){
  const sp = (pB[ch]||'').match(/!\[[^\]]*\]\(/g)||[];
  const sa = (aB[ch]||'').match(/!\[[^\]]*\]\(/g)||[];
  const k = countAll(`${DST}/charpter${ch}/charpter${ch}知识点.md`,/!\[[^\]]*\]\(/g);
  const p = countAll(`${DST}/charpter${ch}/charpter${ch}题目.md`,/!\[[^\]]*\]\(/g);
  const a = countAll(`${DST}/charpter${ch}/charpter${ch}解析.md`,/!\[[^\]]*\]\(/g);
  const src = sp.length+sa.length;
  const dst = k+p+a;
  const mark = (src===dst)?'✅': (src<dst?'▲多':'▼少');
  console.log(`ch${String(ch).padStart(2,'0')}  src=${src} (题目:${sp.length}+解析:${sa.length})  dst=${dst} (知:${k}+题:${p}+解:${a})  ${mark}${src!==dst?' 差 '+(dst-src):''}`);
}

// 3. 基础CHECK
console.log('\n[基礎CHECK 源vs拆分]');
const srcChk = (fs.readFileSync(SRC_PROB,'utf8').match(/基礎\s*CHECK/g)||[]).length;
let dstChk = 0;
for (let ch=1;ch<=20;ch++){
  const p = countAll(`${DST}/charpter${ch}/charpter${ch}题目.md`,/基礎\s*CHECK/g);
  const k = countAll(`${DST}/charpter${ch}/charpter${ch}知识点.md`,/基礎\s*CHECK/g);
  dstChk += p+k;
  if(!p) console.log(`  ch${ch} 题目/知识点 无基礎CHECK → 用回退锚点? (p=${p} k=${k})`);
}
console.log(`源基础CHECK=${srcChk} ； 拆分后合计(题目+知识点)=${dstChk}`);

// 4. 行差异
function lines(p){ return fs.existsSync(p) ? fs.readFileSync(p,'utf8').split(/\r?\n/).length : 0; }
const srcProbLines = lines(SRC_PROB);
let dstKnowProb=0;
for (let ch=1;ch<=20;ch++) dstKnowProb += lines(`${DST}/charpter${ch}/charpter${ch}知识点.md`) + lines(`${DST}/charpter${ch}/charpter${ch}题目.md`);
console.log(`\n[行差] 源题目 ${srcProbLines} ； 拆分后知+题 ${dstKnowProb} ； 差 ${dstKnowProb - srcProbLines}（trim 前后空行损耗属正常）`);
