const fs = require('fs');
// ---- 扫描 Chapter 4~20 三维度（题目/解析/知识点）的锚点/题量/结构统计 ----
console.log('| 章号 | 题目.md(L) | 题型锚点(grep counts) | 解析.md(L) | 知识点.md(L) | 知识点关键词(前60字) |');
console.log('|---|---|---|---|---|---|');
for (let ch = 4; ch <= 20; ch++) {
  const cdir = `docs/0 数据准备/Chapter 1-20/chapter${ch}`;
  const pPath = `${cdir}/chapter${ch}题目.md`;
  const aPath = `${cdir}/chapter${ch}解析.md`;
  const kPath = `${cdir}/chapter${ch}知识点.md`;
  const p = fs.existsSync(pPath) ? fs.readFileSync(pPath, 'utf8') : '';
  const a = fs.existsSync(aPath) ? fs.readFileSync(aPath, 'utf8') : '';
  const k = fs.existsSync(kPath) ? fs.readFileSync(kPath, 'utf8') : '';
  const pL = p.split(/\r?\n/).length;
  const aL = a.split(/\r?\n/).length;
  const kL = k.split(/\r?\n/).length;
  const anchors = {
    '基礎CHECK': (p.match(/^##\s*基礎\s*CHECK/m) ? 1 : 0) +
                 (p.match(/^##\s*解答/m) ? 1 : 0),
    '基本例題': (p.match(/^##\s*基本例題/gm) || []).length,
    '基本問題': (p.match(/^##\s*基本問題/m) ? 1 : 0),
    '応用問題': (p.match(/^##\s*応用問題/m) ? 1 : 0),
    'ここがポイント': (a.match(/ここがポイント/g) || []).length,
  };
  const kw = k.replace(/[#\-*>\s`$!\[\]()（）。、,\.]+/g,' ').trim().slice(0, 60);
  console.log(`| ch${String(ch).padStart(2,'0')} | ${pL} | 基礎=${anchors['基礎CHECK']}/例題=${anchors['基本例題']}/基本=${anchors['基本問題']}/応用=${anchors['応用問題']} /解析-ポイント=${anchors['ここがポイント']} | ${aL} | ${kL} | ${kw} |`);
}
