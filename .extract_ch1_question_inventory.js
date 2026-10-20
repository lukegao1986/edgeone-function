// ===== .extract_ch1_question_inventory.js =====
// 精确切分：C/E/B/A 各档逐题
const fs = require('fs');
const ROOT = 'docs/0 数据准备/Charpter 1-30/charpter1';
const PMD = fs.readFileSync(`${ROOT}/charpter1题目.md`, 'utf8');
const AMD = fs.readFileSync(`${ROOT}/charpter1解析.md`, 'utf8');

function sliceAfter(text, startRe, forceM=true, endRe=null) {
  function addM(re){ if(forceM && !re.multiline) return new RegExp(re.source, re.flags+'m'); return re; }
  const s = addM(startRe).exec(text);
  if(!s) return '';
  let from = s.index + s[0].length;
  let to = text.length;
  if(endRe) {
    const e = addM(endRe).exec(text.slice(from));
    if(e) to = from + e.index;
  }
  return text.slice(from, to).trim();
}
const C_BLOCK = sliceAfter(PMD, /^##\s*基礎\s*CHECK\s*$/, true, /^##\s*解答\s*$/);
const E_BLOCK = PMD.slice(PMD.indexOf('## 解答'), PMD.indexOf('## 基本問題')); // 含解答 + 基本例題
// 基本例題: 单独提取每个 ## 基本例題 N 标题后的块
const B_BLOCK = sliceAfter(PMD, /^##\s*基本問題\s*$/, true, /^##\s*応用問題\s*$/);
const A_BLOCK = sliceAfter(PMD, /^##\s*応用問題\s*$/);

function splitIntoQs(block, qRe, sortByStart=true) {
  // qRe 必须带捕获组 g，如 /^\s*(\d+)\s+(.+)$/gm
  const m = [...block.matchAll(qRe)];
  const qs = [];
  for(let i=0;i<m.length;i++){
    const from = m[i].index + m[i][0].length;
    const to = (i<m.length-1) ? m[i+1].index : block.length;
    const txt = block.slice(from, to).trim();
    qs.push({
      idTag: m[i][0].trim(),
      idNum: m[i][1] ? m[i][1].trim() : '',
      titleKey: m[i][2] ? m[i][2].trim() : '',
      full: (m[i][0] + '\n' + txt).trim(),
      N: ([...txt.matchAll(/^\s*\((\d+)\)/gm)].length + [...txt.matchAll(/[アイウエオカキクケコ]/g)].length) || 1,
      subQCount: [...txt.matchAll(/^\s*\((\d+)\)/gm)].length,
      blankCount: [...txt.matchAll(/[アイウエオカキクケコ]/g)].length,
      L: txt.split(/\r?\n/).length,
      I: (txt.match(/!\[[^\]]*\]\(/g)||[]).length,
    });
  }
  return qs;
}

// C 档 切分: 行首 1 2 3... 或 "✿5" 这种
const C_QRE = /^\s*[✿◆]?\s*(\d+)\s+(.+)$/gm;
const C_QS = splitIntoQs(C_BLOCK, C_QRE);

// E 档 切分: ## 基本例題 N 标题
const E_QRE = /^##\s*基本例題\s+(\d+)\s+(.+)$/gm;
const E_QS = splitIntoQs(PMD, E_QRE); // 用整个 PMD 切（基本例題在解答块后）

// B 档 切分: 行首 1,2,3 两位数字 + 关键词 + ■/☐
const B_QRE = /^\s*[✿◆]?\s*(\d{1,2})\s+([^■\n]+)[■☐□]/gm;
// 注 B 段标题格式：`1 平均の速さ ■ ...` → 捕获 1 和 平均の速さ
const B_QS = splitIntoQs(B_BLOCK, B_QRE);

// A 档 切分: 行首 18,19,20,21 数字 + 关键词 ■
const A_QRE = /^\s*[✿◆]?\s*(\d{2})\s+([^■\n]+)[■☐□]/gm;
const A_QS = splitIntoQs(A_BLOCK, A_QRE);

// 解析块: ## -↓ ここがポイント
const P_BLOCKS = [...AMD.matchAll(/^##\s*-↓\s*ここがポイント\s*$/gm)].length;
// OCR 误识别: ここがパイシ
const P_BLOCKS2 = [...AMD.matchAll(/ここがパイシ/g)].length;
const P_BLOCKS3 = [...AMD.matchAll(/ここが\s*ポイント/g)].length;
console.log(`解析.md 中「ここがポイント」段数（切分参考）: ${P_BLOCKS}（误识别パイシ:${P_BLOCKS2}，含空格:${P_BLOCKS3}）`);

function table(section, qs, startFrom, prefixLetter, diffLevel, bizStart) {
  console.log(`\n====== ${section} 档（共 ${qs.length} 道） diff=${diffLevel} 首字母=${prefixLetter} biz 起点 q${bizStart}=${section}${startFrom} ======`);
  console.log('| 原No | 提取关键词 | 小问(1)(2) 数 | 填空数(アイウ) | N(总) | 图片 | 业务Code | 建议 topic/sub |');
  console.log('|:-:|:-|:-:|:-:|:-:|:-:|:-|:-|');
  qs.forEach((q,i) => {
    const sub = q.subQCount, blk = q.blankCount;
    const N = Math.max(1, (sub || 0) + (blk || 0));  // 没 (1) 没填 => N=1
    const bc = `phy-01-q${prefixLetter}${bizStart-0 + i}`;
    // 粗略 topic 建议
    let tp = 'phy_1_1_1 (運動の表し方，默认)';
    const t = (q.titleKey||'') + ' ' + q.full.slice(0,300);
    if (/相対|から見た|対する/.test(t)) tp = 'phy_1_1_1 / sub 03 (相対運動)';
    else if (/合成|分解|成分|vx|vy|三平方/.test(t)) tp = 'phy_1_1_1 / sub 02 + phy_1_1_3_01 (合成·分解)';
    else if (/等加速度|v-t|x-t|v=v0\+at|v²|½at²|グラフ|傾き|面積|平均の加速度|瞬間の速さ|平均の速さ|加速度/.test(t)) tp = 'phy_1_1_1 / sub 02 (速度・加速度・等加速度)';
    else if (/変位|位置|座標/.test(t)) tp = 'phy_1_1_1 / sub 01 (位置・変位)';
    const key = (q.titleKey||'').slice(0, 40);
    console.log(`| ${q.idNum} | ${key} | ${sub} | ${blk} | ${N} | ${q.I} | ${bc} | ${tp} |`);
  });
}

console.log('\n========== charpter1 题目 结构明细表 ==========');
console.log(`题目.md 行数 ${PMD.split(/\r?\n/).length} 图片 ${(PMD.match(/!\[[^\]]*\]\(/g)||[]).length}`);
console.log(`解析.md 行数 ${AMD.split(/\r?\n/).length} 图片 ${(AMD.match(/!\[[^\]]*\]\(/g)||[]).length}`);
console.log(`C 基礎 CHECK 块图片: ${(C_BLOCK.match(/!\[[^\]]*\]\(/g)||[]).length}`);
console.log(`B 基本問題 块图片: ${(B_BLOCK.match(/!\[[^\]]*\]\(/g)||[]).length}`);
console.log(`A 応用問題 块图片: ${(A_BLOCK.match(/!\[[^\]]*\]\(/g)||[]).length}`);

table('C (基礎CHECK)', C_QS, 1, 'C', 1, 9);   // 9 = §1 查重起点
table('E (基本例題)', E_QS, 1, 'E', 2, 6);   // 6 = 起号
table('B (基本問題)', B_QS, 1, 'B', 2, 18);  // 18 = 起号
table('A (応用問題)', A_QS, 18, 'A', 3, 5);  // 5 = 起号

// 总计
const TOTAL = C_QS.length + E_QS.length + B_QS.length + A_QS.length;
console.log(`\n合计 ${TOTAL} 道题（C ${C_QS.length} / E ${E_QS.length} / B ${B_QS.length} / A ${A_QS.length}）`);
// N 分布
const ALL=[...C_QS,...E_QS,...B_QS,...A_QS].map(q=>({N: Math.max(1,q.subQCount+q.blankCount), I:q.I}));
const ND={}; ALL.forEach(q=>ND[q.N]=(ND[q.N]||0)+1);
console.log(`N 分布（2N+2=选项数）: ${JSON.stringify(ND)}`);
const TOT_I=ALL.reduce((a,q)=>a+q.I,0);
console.log(`题目.md 内部分布图片合计: ${TOT_I}`);
