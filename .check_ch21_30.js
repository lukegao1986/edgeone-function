const fs = require('fs');
const ROOT = 'docs/0 数据准备/Chapter 21-30';
const EXPECT = {
  21: { hen: '第4編 電気と磁気', title: '静電気力と電場・電位',  mark: '物' },
  22: { hen: '第4編 電気と磁気', title: 'コンデンサー',         mark: '物' },
  23: { hen: '第4編 電気と磁気', title: '電流',                 mark: '基' },
  24: { hen: '第4編 電気と磁気', title: '直流回路',             mark: '物' },
  25: { hen: '第4編 電気と磁気', title: '電流と磁場',           mark: '物' },
  26: { hen: '第4編 電気と磁気', title: '電磁誘導',             mark: '物' },
  27: { hen: '第4編 電気と磁気', title: '交流と電気振動',       mark: '物' },
  28: { hen: '第5編 原子',       title: '電子と光',             mark: '物' },
  29: { hen: '第5編 原子',       title: '原子と原子核',         mark: '物' },
  30: { hen: '第6編 物理学と社会', title: 'エネルギーの利用',   mark: '基' },
};
function extractHeadings(md) {
  const heads = [];
  for (const m of md.matchAll(/^(#{1,6})\s*(.+?)\s*$/gm)) heads.push(m[2].replace(/\s+/g,' ').trim());
  return heads;
}
function countAnchors(md) {
  return {
    '基礎CHECK': (md.match(/^##\s*基礎\s*CHECK/m) ? 1 : 0),
    '解答':      (md.match(/^##\s*解答/m) ? 1 : 0),
    '基本例題':  (md.match(/^##\s*基本例題/gm) || []).length,
    '基本問題':  (md.match(/^##\s*基本問題/m) ? 1 : 0),
    '応用問題':  (md.match(/^##\s*応用問題/m) ? 1 : 0),
    'ここがポイント': (md.match(/ここがポイント/g) || []).length,
    '画像数':    (md.match(/!\[[^\]]*\]\(/g) || []).length,
    '行数':      md.split(/\r?\n/).length,
  };
}
const rows = [];
for (let ch = 21; ch <= 30; ch++) {
  const dir = `${ROOT}/chapter${ch}`;
  const pPath = `${dir}/chapter${ch}题目.md`;
  const aPath = `${dir}/chapter${ch}解析.md`;
  const kPath = `${dir}/chapter${ch}知识点.md`;
  const exist = fs.existsSync(dir) && fs.existsSync(pPath) && fs.existsSync(aPath) && fs.existsSync(kPath);
  const p = exist ? fs.readFileSync(pPath,'utf8') : '';
  const a = exist ? fs.readFileSync(aPath,'utf8') : '';
  const k = exist ? fs.readFileSync(kPath,'utf8') : '';
  const kHeads = extractHeadings(k);
  const pHeads = extractHeadings(p);
  // 检测"章级标题吻合"：第一个 H1 或 第二个标题（如果第1个是"第XX章"）
  const chapterTitleCandidates = [...pHeads.slice(0,6), ...kHeads.slice(0,6)];
  const exactMatch = chapterTitleCandidates.includes(EXPECT[ch].title);
  // 部分匹配：截图标题长名 vs 文件标题短名
  let partialInfo = '';
  if (!exactMatch) {
    const t = EXPECT[ch].title;
    const firstFileTitle = pHeads[0] || kHeads[0] || '(空)';
    // 判断是"文件标题比截图多后缀"还是"截图比文件多后缀"
    const fileInScreenshot = t.includes(firstFileTitle) && firstFileTitle.length>1;
    const screenshotInFile = firstFileTitle.includes(t) && t.length>1;
    if (fileInScreenshot) partialInfo = `文件标题"${firstFileTitle}"是截图"${t}"的子串（缺前缀）`;
    else if (screenshotInFile) partialInfo = `文件标题"${firstFileTitle}"比截图"${t}"更具体（多后缀）`;
    else partialInfo = `不匹配：文件首标题="${firstFileTitle}" vs 截图="${t}"`;
  }
  rows.push({
    章号: ch,
    編: EXPECT[ch].hen,
    标记: EXPECT[ch].mark,
    文件夹: exist ? '✅':'❌',
    '3文件齐': exist ? '✅':'❌',
    '截图章标题': EXPECT[ch].title,
    '章标题吻合': exactMatch ? '✅完全一致' : `⚠️部分：${partialInfo}`,
    '题目前6标题': pHeads.slice(0,6).join(' / '),
    '知识点前6标题': kHeads.slice(0,6).join(' / '),
    '题型锚点': JSON.stringify(countAnchors(p)),
    '解析锚点': JSON.stringify(countAnchors(a)),
    '知识点锚点': JSON.stringify(countAnchors(k)),
  });
}
// Markdown 输出
const cols = Object.keys(rows[0]);
console.log('| ' + cols.join(' | ') + ' |');
console.log('|' + cols.map(()=>'---').join('|') + '|');
for (const r of rows) {
  const cells = cols.map(c => String(r[c]).replace(/\|/g,'／').replace(/\n/g,' '));
  console.log('| ' + cells.join(' | ') + ' |');
}
