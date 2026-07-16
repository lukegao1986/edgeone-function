const fs = require('fs');
const path = require('path');

function cleanMarkdown(content) {
  let text = content;

  // 1. Compress blank lines
  text = text.replace(/\n{3,}/g, '\n\n');

  // 2. Unify heading levels
  // Chapter heading
  text = text.replace(/^#\s+(第?\d+章.*)/gm, '# $1');
  
  // Convert standalone numbers to ## (like "65" or "1 質量")
  // Only if they are at the beginning of a line and followed by space or newline
  // We need to be careful not to match numbered lists inside text, but typically questions start at the line.
  text = text.replace(/^(\d+)\s+([^\n]+)$/gm, '## $1 $2');
  text = text.replace(/^(\d+)$/gm, '## $1');

  // Sub-questions
  text = text.replace(/^\((\d+)\)/gm, '### ($1)');
  
  // For basic examples
  text = text.replace(/^基本例題\s*(\d+)\s*(.*)/gm, '## 基本例題 $1 $2');
  text = text.replace(/^基本問題/gm, '## 基本問題');
  text = text.replace(/^リード\s*C/gm, '## リード C');
  
  // 3. LaTeX formatting
  // Remove spaces inside $ ... $
  text = text.replace(/\$\s+([^\$]+?)\s+\$/g, '$$$1$$');

  // 4. Image labels (usually already correct, but just ensure no weird breaks)
  // 8. Remove unwanted tutorial elements
  text = text.replace(/→\s*\d+\s*解説動画/g, '');
  text = text.replace(/→\s*例題\s*[\d,\s]+/g, '');
  text = text.replace(/→\s*[\d,\s]+/g, '');

  return text;
}

const qFile = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter4_MD/MinerU_markdown_リードα_物理_charpter4.md');
const aFile = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter4_MD/MinerU_markdown_リードα_物理物理_charpter4_解析.md');

const qOut = qFile.replace('.md', '_cleaned.md');
const aOut = aFile.replace('.md', '_cleaned.md');

const qContent = fs.readFileSync(qFile, 'utf8');
const aContent = fs.readFileSync(aFile, 'utf8');

const qCleaned = cleanMarkdown(qContent);
const aCleaned = cleanMarkdown(aContent);

fs.writeFileSync(qOut, qCleaned, 'utf8');
fs.writeFileSync(aOut, aCleaned, 'utf8');

console.log('Regex cleaning done.');
