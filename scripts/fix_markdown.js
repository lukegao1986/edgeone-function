const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/(.)(##\s*(?:\d+|基本例題|基礎 CHECK|解答|基本問題|リード C|応用問題)|###\s*\(\d+\))/g, '$1\n\n$2');
  fs.writeFileSync(file, content);
}

fixFile('/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/charpter 2-10/charpter4_MD/MinerU_markdown_リードα_物理_charpter4_cleaned.md');
fixFile('/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/charpter 2-10/charpter4_MD/MinerU_markdown_リードα_物理物理_charpter4_解析_cleaned.md');
console.log('Fixed markdown files');
