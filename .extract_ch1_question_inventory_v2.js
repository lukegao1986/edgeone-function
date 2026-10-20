// ===== .extract_ch1_question_inventory_v2.js =====
const fs = require('fs');
const ROOT = 'docs/0 数据准备/Charpter 1-30/charpter1';
const PMD = fs.readFileSync(`${ROOT}/charpter1题目.md`, 'utf8');
const AMD = fs.readFileSync(`${ROOT}/charpter1解析.md`, 'utf8');

function I(t){ return ((t||'').match(/!\[[^\]]*\]\(/g)||[]).length; }
function countSubQs(text) {
  // N = max of  (1)(2)(3)... 数字编号
  let max=0;
  for (const m of text.matchAll(/^\s*\(\s*(\d+)\s*\)/gm)) max = Math.max(max, parseInt(m[1],10));
  // 加上 カタカナ填空（アイウエオカキクケコサシスセソタチツテト）去重个数
  const blankSet = new Set();
  for (const m of text.matchAll(/[アイウエオカキクケコサシスセソタチツテト]/g)) blankSet.add(m[0]);
  return { subNum: max, blanks: [...blankSet], N: Math.max(1, max + blankSet.size) };
}

function sliceBw(text, startRe, endRe=null, FM=true) {
  function addM(r){if(FM && !r.multiline) return new RegExp(r.source, r.flags+'m'); return r;}
  const s = addM(startRe).exec(text); if (!s) return '';
  let from = s.index+s[0].length, to = text.length;
  if (endRe) { const e = addM(endRe).exec(text.slice(from)); if (e) to = from+e.index; }
  return text.slice(from,to).trim();
}
const C_BLOCK = sliceBw(PMD, /^##\s*基礎\s*CHECK\s*$/, /^##\s*解答\s*$/);
const B_BLOCK = sliceBw(PMD, /^##\s*基本問題\s*$/, /^##\s*応用問題\s*$/);
const A_BLOCK = sliceBw(PMD, /^##\s*応用問題\s*$/);

// E 档: 单独每个 ## 基本例題 N 标题 后的块 → 下一个 ## 基本例題 或 ## 基本問題
function extractBlocksByHead(text, headRe) {
  const heads = [...text.matchAll(headRe)];
  const arr = [];
  for (let i=0; i<heads.length; i++) {
    const from = heads[i].index + heads[i][0].length;
    const to = (i < heads.length-1) ? heads[i+1].index
             : text.indexOf('## 基本問題', from) > -1 ? text.indexOf('## 基本問題', from)
             : text.length;
    const body = text.slice(from, to).trim();
    arr.push({ head: heads[i][0].trim(), num: heads[i][1].trim(), key: heads[i][2] ? heads[i][2].trim() : '', body });
  }
  return arr;
}
const E_RAW = extractBlocksByHead(PMD, /^##\s*基本例題\s+(\d+)\s+(.+)$/gm);

// 通用 切题: 通用 题号正则，先找全部 match，然后每个 match 下一个 match 前是 body
function cutQs(block, qNumRe, headSnippetLen=150) {
  const ms = [...block.matchAll(qNumRe)];
  const qs = [];
  for (let i=0; i<ms.length; i++) {
    const from = ms[i].index + ms[i][0].length;
    const to = (i<ms.length-1) ? ms[i+1].index : block.length;
    const body = block.slice(from, to).trim();
    const {N, subNum, blanks} = countSubQs(body);
    const fullHead = ms[i][0].replace(/\s+/g,' ').trim();
    const keyRaw = ms[i][2] ? ms[i][2].replace(/\s+/g,' ').trim() : '';
    const snip = (fullHead + ' ' + body).replace(/\s+/g,' ').slice(0, headSnippetLen);
    qs.push({
      idNum: ms[i][1].trim(),
      keyRaw,
      N, subNum, blanks,
      I: I(body),
      snip,
      fullBlock: ms[i][0] + '\n' + body,
    });
  }
  return qs;
}

// C 档题号: 行首 1 2 3 4 ...（可附 ✿/◆ 前缀）
const C_QS = cutQs(C_BLOCK, /^\s*[✿◆]?\s*(\d+)\s+(.+?)(?:[■☐□▪]|$)/gm);
// B 档题号: 1 平均の速さ ■ ...  / 或 4 速度の合成 ▪ 流水の速さ... 任意方块
const B_QS = cutQs(B_BLOCK, /^\s*[✿◆]?\s*(\d{1,2})\s+([^■☐□▪\n]+?)[■☐□▪]/gm);
// A 档: 18 速度の分解 ■ ...  / 或 19 等加速度直線運動のグラフ ■ 以下の文章を読み
const A_QS = cutQs(A_BLOCK, /^\s*[✿◆]?\s*(\d{2})\s+([^■☐□▪\n]+?)[■☐□▪]/gm);

console.log(`C BLOCK 行数 ${C_BLOCK.split(/\r?\n/).length}  首200字: ${C_BLOCK.slice(0,200).replace(/\n/g,' / ')}`);
console.log(`\nB BLOCK 首300字: ${B_BLOCK.slice(0,300).replace(/\n/g,' / ')}`);
console.log(`\nA BLOCK 首300字: ${A_BLOCK.slice(0,300).replace(/\n/g,' / ')}`);

// 建议 topic （§2 上下文包的 aliases 精确判定）
function suggestTopic(snip) {
  const t = snip;
  // 1. 相対（关键词 Aから見た / に対する）
  if (/相対|から見た|対する|視点|見かけの/.test(t))   return { tp: 'phy_1_1_1', sb: ['phy_1_1_1_03'] };
  // 2. 落体（本章少见，但保留）
  if (/自由落下|落下|鉛直|投げ(上|下)ろし/.test(t))  return { tp: 'phy_1_1_1', sb: ['phy_1_1_1_04'] };
  // 3. 水平投射 / 斜方投射
  if (/水平投射|水平.*投げ/.test(t))                  return { tp: 'phy_1_1_1', sb: ['phy_1_1_1_05'] };
  if (/斜方|放物線|斜め.*投射|投(げ|出).*(角度|θ)/.test(t)) return { tp: 'phy_1_1_1', sb: ['phy_1_1_1_06'] };
  // 4. 合成/分解（速度成分・ベクトル合成三平方・vx,vy・分解）
  if (/合成|分解|成分|vx|vy|三平方|ベクトル|√\(|\((\d+\.?\d*).*\)²\s*\+\s*\((\d+\.?\d*).*\)²/.test(t))
                                                          return { tp: 'phy_1_1_1', sb: ['phy_1_1_1_02','phy_1_1_3_01'] };
  // 5. 位置/変位/座標系（本章少见）
  if (/位置|変位|座標系|原点/.test(t) && !/速度|加速度|速さ|グラフ|移動距離/.test(t))
                                                          return { tp: 'phy_1_1_1', sb: ['phy_1_1_1_01'] };
  // 6. 默认：速度/加速度/等加速度 3 公式
  return { tp: 'phy_1_1_1', sb: ['phy_1_1_1_02'] };
}

function printTable(section, qs, prefixLetter, diffLevel, startIdx) {
  console.log(`\n====== ${section} 档（共 ${qs.length} 道） difficulty=${diffLevel} 首字母=${prefixLetter} 起号 phy-01-q${prefixLetter}${startIdx} ======`);
  console.log('| No | 关键词/前100字摘要 | 子问数(1..N) | 填空(カタカナ) | N | 2N+2=选项数 | Img | 业务Code（自动递增） | topic / subtopicCodes 建议 |');
  console.log('|:-:|:-|:-:|:-:|:-:|:-:|:-:|:-|:--|');
  qs.forEach((q,i) => {
    const key = (q.keyRaw || '').slice(0, 35) || q.snip.slice(0, 35);
    const bc = `phy-01-q${prefixLetter}${(+startIdx)+i}`;
    const { tp, sb } = suggestTopic(q.snip);
    const subs = Array.from(new Set(q.blanks)).length ? ` +填空:${q.blanks.join('')}` : '';
    console.log(`|${q.idNum.padStart(2,' ')}| ${key.slice(0,80)} | ${q.subNum}${subs} | ${q.blanks.length} | **${q.N}** | ${2*q.N+2} | ${q.I} | ${bc} | ${tp} / [${sb.join(', ')}] |`);
  });
}

console.log('\n');
console.log('解析块「ここがポイント」段数（与最终题数对比用，允许±2）:', [...AMD.matchAll(/ここが\s*(ポイント|パイシ)/g)].length);
printTable('C 基礎CHECK',   C_QS, 'C', 1, 9);
// E 档 手工组装
console.log(`\n====== E 基本例題（共 ${E_RAW.length} 道） difficulty=2 首字母=E 起号 qE6 ======`);
console.log('| No | 关键词（## 基本例題 N 标题） | 子问(1..N) | 填空 | N | 2N+2 | Img | 业务Code | 建议 topic |');
console.log('|:-:|:-|:-:|:-:|:-:|:-:|:-:|:-|:--|');
E_RAW.forEach((e,i) => {
  const qN = countSubQs(e.body);
  const bc = `phy-01-qE${6+i}`;
  const sbt = suggestTopic(e.head + ' ' + e.body.slice(0,200));
  console.log(`|${e.num}|${e.key}|${qN.subNum}${qN.blanks.length?' 填空:'+qN.blanks.join(''):''}|${qN.blanks.length}|**${qN.N}**|${2*qN.N+2}|${I(e.body)}|${bc}|${sbt.tp}/[${sbt.sb.join(',')}]|`);
});
printTable('B 基本問題',   B_QS, 'B', 2, 18);
printTable('A 応用問題',   A_QS, 'A', 3, 5);

// 总计
const eQN = E_RAW.map(e => countSubQs(e.body));
const ALL = [...C_QS.map(q=>({N:q.N, I:q.I})),
             ...eQN.map(q=>({N:q.N, I:0})),
             ...B_QS.map(q=>({N:q.N, I:q.I})),
             ...A_QS.map(q=>({N:q.N, I:q.I}))];
const ND={}; ALL.forEach(q=>ND[q.N]=(ND[q.N]||0)+1);
const TOT_I=ALL.reduce((s,q)=>s+q.I,0) + E_RAW.reduce((s,e)=>s+I(e.body),0);
const TOTAL_Q = C_QS.length + E_RAW.length + B_QS.length + A_QS.length;
console.log(`\n\n====== 合计 ${TOTAL_Q} 道题（C${C_QS.length} + E${E_RAW.length} + B${B_QS.length} + A${A_QS.length}） ======`);
console.log(`N 分布: ${JSON.stringify(ND)}  → 各档选项数对应 2N+2：`);
Object.keys(ND).sort((a,b)=>+a-b).forEach(n=>console.log(`  N=${n} 共 ${ND[n]} 题 → 选项长度固定 ${2*+n+2}`));
console.log(`题目 MD 内部图片（各题块合计去重前）: ${TOT_I} 张；题目.md 原图数 ${I(PMD)}；解析.md 图片数 ${I(AMD)}`);
