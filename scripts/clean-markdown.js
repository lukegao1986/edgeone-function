const fs = require('fs');
const path = require('path');

const inputQFile = path.join(__dirname, '../docs/0 数据准备/phy-charpter2/MinerU_markdown_リードα_物理 charpter 2.md');
const inputAFile = path.join(__dirname, '../docs/0 数据准备/phy-charpter2/MinerU_markdown_リードα_物理物理 charpter 2解析.md');

function cleanMarkdown(content) {
  // 2. 统一标题层级 & 5. 保持原教材的题目编号和顺序
  let currentSection = '';
  const lines = content.split('\n');
  const processedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trimEnd();
    
    // 章节标题
    if (line.match(/^#+\s*(第\d+章.*)/)) {
      line = line.replace(/^#+\s*/, '# ');
    }
    // 处理题型分类，例如 "## 基礎 CHECK" 或 "## 基本例題" -> "## 基礎CHECK"
    // 或者答案文件里可能是 "## 第2章 落体の運動" 或 "22" 这种纯数字行
    if (line.match(/^#+\s*(基礎\s*CHECK|基本例題|基本問題|応用問題|リード\s*C)/i)) {
      line = line.replace(/^#+\s*/, '## ');
      currentSection = line.replace('## ', '').trim();
    }
    // 处理答案文件特殊的纯数字编号 "22 " 等
    else if (line.match(/^(\d+)\s*$/)) {
      const qNum = line.trim();
      const sectionPrefix = currentSection ? `${currentSection} ` : '解答 ';
      line = `## ${sectionPrefix}${qNum}`;
    }
    // 匹配行首数字（可能带特殊符号），并将其转换为 `## [当前模块] [题号]`
    else if (line.match(/^(✿|考|◆|★)?\s*(\d+)\s+(.+)/) && !line.startsWith('#')) {
      const match = line.match(/^(✿|考|◆|★)?\s*(\d+)\s+(.+)/);
      // 为了防止把公式行里的数字当成题号，判断行不包含太多等号且不是纯数字加单位
      if (!line.match(/^\d+\s*(m|s|kg|N|J|\=)/) && line.length > 5) {
        const symbol = match[1] ? match[1] + ' ' : '';
        const qNum = match[2];
        const qText = match[3];
        const sectionPrefix = currentSection ? `${currentSection} ` : '解答 ';
        line = `## ${sectionPrefix}${symbol}${qNum}\n\n${qText}`;
      }
    }
    // 小问修正：(1) (2) -> ### (1)
    else if (line.match(/^\(\d+\)\s/)) {
      line = line.replace(/^(\(\d+\))\s/, '### $1 ');
    }
    
    processedLines.push(line);
  }
  
  content = processedLines.join('\n');

  // 1. 压缩多余空行
  content = content.replace(/\n{3,}/g, '\n\n');
  
  // 3. LaTeX 公式标准化
  // 将 \left[ ... \right] 或类似的不规范包裹，或含有多余空格的 $ 修复
  content = content.replace(/\$\s+/g, '$');
  content = content.replace(/\s+\$/g, '$');
  
  // 4. 图片标签修正
  content = content.replace(/!\[image\]\(\s*(.*?)\s*\)/g, '![image]($1)');
  
  // 7. 清除 MinerU 可能残留的页眉页脚、水印文字 (如果有)
  content = content.replace(/基物/g, '');
  content = content.replace(/POINT/g, '');
  
  // 统计题目数量
  let qCount = 0;
  let qList = [];
  const finalLines = content.split('\n');
  for (const l of finalLines) {
    const match = l.match(/^##\s+(基礎\s*CHECK|基本例題|基本問題|応用問題|リード\s*C|解答)\s+(✿|考|◆)?\s*(\d+)/);
    if (match) {
      qCount++;
      qList.push(`${match[1]} - 题号: ${match[2] ? match[2] : ''}${match[3]}`);
    }
  }

  return { content: content.trim(), qCount, qList };
}

const qContent = fs.readFileSync(inputQFile, 'utf8');
const aContent = fs.readFileSync(inputAFile, 'utf8');

const cleanedQ = cleanMarkdown(qContent);
const cleanedA = cleanMarkdown(aContent);

fs.writeFileSync(inputQFile.replace('.md', '_cleaned.md'), cleanedQ.content, 'utf8');
fs.writeFileSync(inputAFile.replace('.md', '_cleaned.md'), cleanedA.content, 'utf8');

console.log(`\n=== 清洗报告 ===`);
console.log(`1. 压缩了多余空行`);
console.log(`2. 统一了 Markdown 标题层级（章节用 #，题型/题号用 ##，小问用 ###）`);
console.log(`3. 移除了多余的 "基物", "POINT" 等无关标记`);
console.log(`4. 清理了行内/块级 LaTeX 公式两侧的多余空格`);
console.log(`5. 修复了部分错误的图片 Markdown 语法`);
console.log(`\n=== 题目统计 ===`);
console.log(`原题文件共提取到 ${cleanedQ.qCount} 道题目：`);
cleanedQ.qList.forEach(q => console.log(`  - ${q}`));
console.log(`\n答案文件共提取到 ${cleanedA.qCount} 道题目解析：`);
cleanedA.qList.forEach(q => console.log(`  - ${q}`));