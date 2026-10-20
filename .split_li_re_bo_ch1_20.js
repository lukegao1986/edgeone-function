// ===== split_li_re_bo_ch1_20.js =====
// 输入: MinerU_力热波_cos.md（题目+知识点） / MinerU_力热波_解析_cos.md（解析）
// 流程:
//   1. 按 ^## 第[X]章 正则切成 20 段（X=1~20，阿拉伯+漢数字混合匹配）
//   2. 每段 → docs/0 数据准备/Charpter 1-30/charpterX/  （目录名按用户拼写）
//        - charpterX题目.md  (初版: 包含知识点+题目全部)
//        - charpterX解析.md
//   3. 对 charpterX题目.md 做二次切分:
//        - 「基礎CHECK」锚点以前 (不包含锚点) → charpterX知识点.md
//        - 「基礎CHECK」锚点以后 (包含锚点) → 覆盖写回 charpterX题目.md
//        - 回退锚点: 若未找到「基礎CHECK」，用「## 基本例題」或「## 解答」或「## 基本問題」分隔
//        - 全部未找到 → 整段保留到题目，知识点留空（告警）
const fs = require('fs');
const path = require('path');

const ROOT = 'docs/0 数据准备';
const SRC_PROB = `${ROOT}/MinerU_力热波_cos.md`;
const SRC_ANS  = `${ROOT}/MinerU_力热波_解析_cos.md`;
const DST_ROOT = `${ROOT}/Charpter 1-30`;

// --------- 工具 ---------
const CHAPTER_RE = /^##\s*第([一二三四五六七八九十百0-9]+)\s*章\b/m;  // 捕获章号
// 汉字数字→阿拉伯
function kansuujiToNum(s) {
  if (/^\d+$/.test(s)) return parseInt(s,10);
  const MAP = {一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10,百:100,零:0,〇:0};
  // 简单情况: 只覆盖 1~20 范围
  if (s === '十') return 10;
  if (s.startsWith('十')) return 10 + MAP[s[1]];
  if (s.endsWith('十')) return MAP[s[0]] * 10;
  if (s.includes('十')) {
    const [a,b] = s.split('十');
    return (MAP[a]||1) * 10 + (MAP[b]||0);
  }
  if (s.includes('百')) {
    const [a,b] = s.split('百');
    return (MAP[a]||1) * 100 + (b ? kansuujiToNum(b) : 0);
  }
  // 单个汉字
  if (s.length===1 && MAP[s]!=null) return MAP[s];
  throw new Error('无法解析章号: ' + s);
}
function splitByChapter(text) {
  // 返回 { [章号数字]: 段文本 }
  const lines = text.split(/\r?\n/);
  const buckets = {};
  let cur = null;
  let buf = [];
  for (const line of lines) {
    const m = line.match(/^##\s*第([一二三四五六七八九十百0-9]+)\s*章/);
    if (m) {
      if (cur !== null) buckets[cur] = buf.join('\n');
      cur = kansuujiToNum(m[1]);
      buf = [line];
    } else {
      if (cur !== null) buf.push(line);
    }
  }
  if (cur !== null) buckets[cur] = buf.join('\n');
  return buckets;
}
// 二次拆分: 知识点 vs 题目
// 基础CHECK 前后；找不到时回退
const SPLIT_ANCHORS = [
  // (a) 正規形
  /^##\s*基礎\s*CHECK/m,
  // (b) 回退1: ## 基本例題
  /^##\s*基本例題/m,
  // (c) 回退2: ## 解答
  /^##\s*解答/m,
  // (d) 回退3: ## 基本問題
  /^##\s*基本問題/m,
  // (e) 回退4: 任意行开头的"基礎 CHECK"（非 ##）
  /^\s*基礎\s*CHECK/m,
];
function splitKnowledgeAndProblem(chapterText) {
  // try each anchor in order
  for (const re of SPLIT_ANCHORS) {
    // 在整段文本上找第一个匹配
    const flags = (re.multiline ? '' : 'm') + re.ignoreCase ? 'i' : '';
    const re2 = new RegExp(re.source, (re.multiline ? 'm' : '') + (re.ignoreCase ? 'i' : '') + 'g');
    const m = re2.exec(chapterText);
    if (m) {
      return {
        know: chapterText.slice(0, m.index).trim(),
        prob: chapterText.slice(m.index).trim(),
        anchorUsed: String(re).replace(/^\/|\/[gimsuy]*$/g,''),
      };
    }
  }
  return { know: '', prob: chapterText, anchorUsed: '(NONE - all to prob)' };
}
function countImg(text) { return (text.match(/!\[[^\]]*\]\(/g) || []).length; }
function countLine(text) { return text.split(/\r?\n/).length; }

// ========== MAIN ==========
if (!fs.existsSync(SRC_PROB)) throw new Error('源文件不存在: '+SRC_PROB);
if (!fs.existsSync(SRC_ANS))  throw new Error('源文件不存在: '+SRC_ANS);
fs.mkdirSync(DST_ROOT, { recursive: true });

const probText = fs.readFileSync(SRC_PROB, 'utf8');
const ansText  = fs.readFileSync(SRC_ANS, 'utf8');
const probBuck = splitByChapter(probText);
const ansBuck  = splitByChapter(ansText);

console.log(`题目源切出章节数: ${Object.keys(probBuck).length}`);
console.log(`解析源切出章节数: ${Object.keys(ansBuck).length}`);

const report = [];
for (let ch = 1; ch <= 20; ch++) {
  const probRaw = probBuck[ch] || '';
  const ansRaw  = ansBuck[ch] || '';
  if (!probRaw) { console.warn(`⚠️  ch${ch} 题目源无内容`); }
  if (!ansRaw)  { console.warn(`⚠️  ch${ch} 解析源无内容`); }

  // 2次拆分 题目源
  const { know, prob, anchorUsed } = splitKnowledgeAndProblem(probRaw);

  // 写入目录
  const d = `${DST_ROOT}/charpter${ch}`;
  fs.mkdirSync(d, { recursive: true });
  const fKnow = `${d}/charpter${ch}知识点.md`;
  const fProb = `${d}/charpter${ch}题目.md`;
  const fAns  = `${d}/charpter${ch}解析.md`;
  fs.writeFileSync(fKnow, know, 'utf8');
  fs.writeFileSync(fProb, prob, 'utf8');
  fs.writeFileSync(fAns,  ansRaw, 'utf8');

  report.push({
    ch,
    章号Hits: `prob=${probRaw?'✅':'❌'} / ans=${ansRaw?'✅':'❌'}`,
    拆分锚点: anchorUsed,
    知识点L: countLine(know), 知识点Img: countImg(know),
    题目L:   countLine(prob), 题目Img:   countImg(prob),
    解析L:   countLine(ansRaw), 解析Img:   countImg(ansRaw),
  });
}

// 打印报告
console.log('\n| ch | 源命中 | 拆分锚点 | 知识点(L/Img) | 题目(L/Img) | 解析(L/Img) |');
console.log('|:-:|:-:|:-|:-:|:-:|:-:|');
for (const r of report) {
  console.log(`| ${String(r.ch).padStart(2,'0')} | ${r.章号Hits} | ${r.拆分锚点.slice(0,30)} | ${r.知识点L}/${r.知识点Img} | ${r.题目L}/${r.题目Img} | ${r.解析L}/${r.解析Img} |`);
}
// 合计
const s = report.reduce((a,r)=>{
  a.kL+=r.知识点L; a.kI+=r.知识点Img; a.pL+=r.题目L; a.pI+=r.题目Img; a.aL+=r.解析L; a.aI+=r.解析Img; return a;
},{kL:0,kI:0,pL:0,pI:0,aL:0,aI:0});
console.log(`|合计| — | — | ${s.kL}/${s.kI} | ${s.pL}/${s.pI} | ${s.aL}/${s.aI} |`);

// 源文件总数对比
console.log(`\n题目源总行: ${countLine(probText)}  vs  拆分后题目+知识点行数和: ${s.kL+s.pL} (差异=${(s.kL+s.pL)-countLine(probText)})`);
console.log(`解析源总行: ${countLine(ansText)}  vs  拆分后解析行数和:       ${s.aL}    (差异=${s.aL-countLine(ansText)})`);
