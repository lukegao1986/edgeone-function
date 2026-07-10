const fs = require('fs');
const path = require('path');

function cleanMarkdown(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  let cleanedLines = [];
  let qType = '';
  
  let stats = { questions: [] };
  let isAnswerSection = filePath.includes('解析');

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trimRight();
    
    // 1. 压缩多余空行
    if (line === '' && cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] === '') continue;

    // 8. 移除无关辅导元素
    if (line.match(/→\s*[\d,\s]+\s*解説動画/i) || line.match(/解\s*說\s*動\s*画/i)) {
      let nextIdx = i + 1;
      while (nextIdx < lines.length && lines[nextIdx].trim() === '') nextIdx++;
      if (nextIdx < lines.length && lines[nextIdx].match(/^!\[image\]/)) i = nextIdx;
      continue;
    }
    
    if (line.match(/^→\s*[\d,\s]+$/)) continue;

    // 2. 统一标题层级
    let chapMatch = line.match(/^#+\s*第([0-9]+)章(.*)/);
    if (chapMatch) {
      line = `# 第${chapMatch[1]}章${chapMatch[2]}`;
      cleanedLines.push(line);
      continue;
    }
    
    let secMatch = line.match(/^(##\s*)?(基礎\s*CHECK|基本例題|基本問題|応用問題|リード\s*C)\s*$/);
    if (secMatch) {
      qType = secMatch[2].replace(/\s+/g, '');
      line = `## ${qType}`;
      cleanedLines.push(line);
      continue;
    }
    
    let qMatch = line.match(/^(?:##\s*)?(?:✿|考|◆|★)?\s*(\d+)\s+(.*)/);
    if (!qMatch) qMatch = line.match(/^(?:##\s*)?(基本例題|例題)\s*(\d+)\s+(.*)/);
    
    if (qMatch && !line.startsWith('###')) {
      let num, text;
      if (qMatch.length === 4) {
        num = qMatch[2]; text = qMatch[3]; qType = '基本例題';
      } else {
        num = qMatch[1]; text = qMatch[2];
        if (!qType) qType = '基本問題';
      }
      
      if (!text.startsWith('つの') && !text.startsWith('目盛り')) {
        line = `## ${qType} ${num} ${text}`;
        stats.questions.push({ type: qType, num: num });
        cleanedLines.push(line);
        continue;
      }
    }
    
    if (isAnswerSection) {
      let ansMatch = line.match(/^(?:##\s*)?(\d+)\s*(.*)/);
      if (ansMatch && !line.startsWith('###') && ansMatch[2].indexOf('つの') === -1) {
        let num = ansMatch[1];
        let text = ansMatch[2];
        if (text.startsWith('(1)')) {
          line = `## ${num}\n\n### (1) ${text.substring(3).trim()}`;
        } else {
          line = `## ${num} ${text}`;
        }
        cleanedLines.push(line);
        continue;
      }
    }

    let subQMatch = line.match(/^(?:###\s*)?\(([0-9]+)\)\s*(.*)/);
    if (subQMatch) {
      line = `### (${subQMatch[1]}) ${subQMatch[2]}`;
      cleanedLines.push(line);
      continue;
    }
    
    // 3. LaTeX 公式标准化
    line = line.replace(/\$\s+([^$]+?)\s+\$/g, '$$$1$$');
    
    cleanedLines.push(line);
  }

  const parsedPath = path.parse(filePath);
  const outPath = path.join(parsedPath.dir, parsedPath.name + '_cleaned' + parsedPath.ext);
  fs.writeFileSync(outPath, cleanedLines.join('\n'), 'utf8');
  
  return { outPath, stats };
}

const dir = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter3_MD');
const qFile = path.join(dir, 'MinerU_markdown_リードα_物理_charpter3.md');
const aFile = path.join(dir, 'MinerU_markdown_リードα_物理物理_charpter3_解析.md');

const qResult = cleanMarkdown(qFile);
const aResult = cleanMarkdown(aFile);

console.log('--- 清洗结果报告 ---');
console.log('1. 压缩了多余空行，统一了标题层级（章用 #，题号用 ##，小问用 ###）。');
console.log('2. 清理了 "→XX 解說動画" 等无关辅导元素。');
console.log('3. 优化了 LaTeX 行内公式前后的多余空格。');
console.log('4. 将题号提取并标准化（例如 "45 力の成分" 统一为 "## 基本問題 45 力の成分"）。');

console.log(`\n统计清洗后的原文中有 ${qResult.stats.questions.length} 道题目：`);
qResult.stats.questions.forEach(q => console.log(`- [${q.type}] 第 ${q.num} 题`));
