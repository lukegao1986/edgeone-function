const fs = require('fs');

function parseMarkdown(content) {
  const lines = content.split('\n');
  const items = [];
  let currentItem = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match headers
    let match = line.match(/^(?:### Q|## 基本例題\s*|##\s*)(\d+)(.*)/);
    
    if (match && !line.match(/^## .*解答/)) {
      // Is it really a new question? Check if it's just a number
      if (currentItem) {
        items.push(currentItem);
      }
      
      let qType = 'B'; // default
      if (line.includes('### Q')) qType = 'C';
      else if (line.includes('基本例題')) qType = 'E';
      else {
        // Find previous section header to determine type
        for (let j = i - 1; j >= 0; j--) {
          if (lines[j].includes('基本問題')) { qType = 'B'; break; }
          if (lines[j].includes('リード C')) { qType = 'B'; break; }
          if (lines[j].includes('応用問題')) { qType = 'A'; break; }
        }
      }
      
      currentItem = {
        num: match[1],
        type: qType,
        title: line,
        content: []
      };
    } else if (currentItem) {
      if (!line.match(/^## .*解答/) && !line.startsWith('## 基本問題') && !line.startsWith('## リード C') && !line.startsWith('## 応用問題')) {
        currentItem.content.push(line);
      }
    }
  }
  if (currentItem) {
    items.push(currentItem);
  }
  return items;
}

const qContent = fs.readFileSync('/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/charpter 2-10/charpter4_MD/charpter4_题目.md', 'utf8');
const aContent = fs.readFileSync('/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/charpter 2-10/charpter4_MD/charpter4_解析.md', 'utf8');

const qItems = parseMarkdown(qContent);
const aItems = parseMarkdown(aContent);

console.log(`Parsed ${qItems.length} questions and ${aItems.length} answers.`);

for (let i=0; i<3; i++) {
  console.log(`Q${qItems[i].num} (${qItems[i].type}): ${qItems[i].content[0]}`);
  console.log(`A${aItems[i].num}: ${aItems[i].content[0]}`);
}
