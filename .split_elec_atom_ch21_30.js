// ===== split_elec_atom_ch21_30.js =====
const fs = require('fs');
const ROOT = 'docs/0 数据准备';
const SRC_PROB = `${ROOT}/MinerU_电磁-原子_cos.md`;
const SRC_ANS  = `${ROOT}/MinerU_电磁-原子_解析_cos.md`;
const DST_ROOT = `${ROOT}/Charpter 1-30`;

function kansuujiToNum(s) {
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  const M = {一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10,百:100,零:0,〇:0};
  if (s === '十') return 10;
  if (s.startsWith('十')) return 10 + M[s[1]];
  if (s.endsWith('十')) return M[s[0]] * 10;
  if (s.includes('十')) { const [a,b] = s.split('十'); return (M[a]||1)*10 + (M[b]||0); }
  if (s.includes('百')) { const [a,b] = s.split('百'); return (M[a]||1)*100 + (b?kansuujiToNum(b):0); }
  if (s.length === 1 && M[s] != null) return M[s];
  throw new Error('kansuuji parse fail: ' + s);
}
function splitByChapter(text, minCh=21, maxCh=30) {
  const lines = text.split(/\r?\n/);
  const b = {}; let cur = null; let buf = [];
  for (const l of lines) {
    const m = l.match(/^##\s*第([一二三四五六七八九十百0-9]+)\s*章/);
    if (m) {
      if (cur != null) b[cur] = buf.join('\n');
      cur = kansuujiToNum(m[1]);
      if (cur < minCh || cur > maxCh) { buf = []; continue; } // 只保留 21-30
      buf = [l];
    } else {
      if (cur != null && cur >= minCh && cur <= maxCh) buf.push(l);
    }
  }
  if (cur != null && cur >= minCh && cur <= maxCh) b[cur] = buf.join('\n');
  return b;
}
// 二级拆分：基础CHECK
const SPLIT_ANCHORS = [
  /^##\s*基礎\s*CHECK/m,
  /^##\s*基本例題/m,
  /^##\s*解答/m,
  /^##\s*基本問題/m,
  /^\s*基礎\s*CHECK/m,
];
function splitKP(chapterText) {
  for (const re of SPLIT_ANCHORS) {
    const re2 = new RegExp(re.source, (re.multiline ? 'm' : '') + (re.ignoreCase ? 'i' : '') + 'g');
    const m = re2.exec(chapterText);
    if (m) return {
      know: chapterText.slice(0, m.index).trim(),
      prob: chapterText.slice(m.index).trim(),
      anchor: String(re).replace(/^\/|\/[gimsuy]*$/g,''),
    };
  }
  return { know: '', prob: chapterText, anchor: '(NONE - all to prob)' };
}
function L(t){ return (t||'').split(/\r?\n/).length; }
function I(t){ return ((t||'').match(/!\[[^\]]*\]\(/g)||[]).length; }
function C(t,re){ return ((t||'').match(re)||[]).length; }

// ============ MAIN ============
if (!fs.existsSync(SRC_PROB)) throw Error('missing: '+SRC_PROB);
if (!fs.existsSync(SRC_ANS))  throw Error('missing: '+SRC_ANS);
fs.mkdirSync(DST_ROOT, { recursive: true });

const probText = fs.readFileSync(SRC_PROB, 'utf8');
const ansText  = fs.readFileSync(SRC_ANS,  'utf8');
const probBuck = splitByChapter(probText, 21, 30);
const ansBuck  = splitByChapter(ansText,  21, 30);
console.log(`题目源切出: ${Object.keys(probBuck).length} 章 (期望10)`);
console.log(`解析源切出: ${Object.keys(ansBuck).length} 章 (期望10)`);

const rep = [];
for (let ch = 21; ch <= 30; ch++) {
  const pRaw = probBuck[ch] || '';
  const aRaw = ansBuck[ch]  || '';
  if (!pRaw) console.warn(`⚠️  ch${ch} prob empty`);
  if (!aRaw)  console.warn(`⚠️  ch${ch} ans empty`);

  const { know, prob, anchor } = splitKP(pRaw);
  const d = `${DST_ROOT}/charpter${ch}`;
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(`${d}/charpter${ch}知识点.md`, know, 'utf8');
  fs.writeFileSync(`${d}/charpter${ch}题目.md`,   prob, 'utf8');
  fs.writeFileSync(`${d}/charpter${ch}解析.md`,   aRaw, 'utf8');

  rep.push({ ch,
    命中: `P=${pRaw?'✅':'❌'} / A=${aRaw?'✅':'❌'}`,
    锚点: anchor,
    K_L: L(know), K_I: I(know),
    P_L: L(prob), P_I: I(prob),
    A_L: L(aRaw),A_I: I(aRaw),
    srcP_L: L(pRaw), srcP_I: I(pRaw),
    srcA_L: L(aRaw), srcA_I: I(aRaw),
  });
}
console.log('\n| ch | 命中 | 拆分锚点 | 知 L/Img | 题 L/Img | 解 L/Img | 源题目 L/Img | 源解析 L/Img |');
console.log('|:-:|:-:|:--|:-:|:-:|:-:|:-:|:-:|');
let t={KL:0,KI:0,PL:0,PI:0,AL:0,AI:0,SPL:0,SPI:0,SAL:0,SAI:0};
for (const r of rep) {
  t.KL+=r.K_L; t.KI+=r.K_I; t.PL+=r.P_L; t.PI+=r.P_I; t.AL+=r.A_L; t.AI+=r.A_I;
  t.SPL+=r.srcP_L; t.SPI+=r.srcP_I; t.SAL+=r.srcA_L; t.SAI+=r.srcA_I;
  console.log(`|${String(r.ch).padStart(2,'0')}|${r.命中}|${r.锚点.slice(0,30)}|${r.K_L}/${r.K_I}|${r.P_L}/${r.P_I}|${r.A_L}/${r.A_I}|${r.srcP_L}/${r.srcP_I}|${r.srcA_L}/${r.srcA_I}|`);
}
console.log(`|合计|—|—|${t.KL}/${t.KI}|${t.PL}/${t.PI}|${t.AL}/${t.AI}|${t.SPL}/${t.SPI}|${t.SAL}/${t.SAI}|`);
console.log(`\n题目源 total L=${L(probText)} vs 拆分后(知+题)=${t.KL+t.PL}  diff=${(t.KL+t.PL)-L(probText)}`);
console.log(`解析源 total L=${L(ansText)}  vs 拆分后      =${t.AL}       diff=${t.AL-L(ansText)}`);
console.log(`图片：源题目(${I(probText)}) + 源解析(${I(ansText)}) = ${I(probText)+I(ansText)} vs 拆分后合计 = ${t.KI+t.PI+t.AI}  diff = ${(t.KI+t.PI+t.AI)-(I(probText)+I(ansText))}`);
console.log(`\n基礎CHECK：源正文总${C(probText,/基礎\s*CHECK/g)} ； 拆分后 题目+知识点 总 ${
  (()=>{let s=0;for(let ch=21;ch<=30;ch++){
    const p=fs.readFileSync(`${DST_ROOT}/charpter${ch}/charpter${ch}题目.md`,'utf8');
    const k=fs.readFileSync(`${DST_ROOT}/charpter${ch}/charpter${ch}知识点.md`,'utf8');
    s += C(p,/基礎\s*CHECK/g)+C(k,/基礎\s*CHECK/g);
  }return s;})()
}`);
