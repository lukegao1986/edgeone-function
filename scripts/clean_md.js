const fs = require('fs');

function cleanMarkdown(filePath, outPath) {
    if (!fs.existsSync(filePath)) {
        console.error("File not found: " + filePath);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Compress multiple empty lines
    content = content.replace(/\n{3,}/g, '\n\n');

    // 3. LaTeX standard
    // Replace $ ... $ with spaces inside
    content = content.replace(/\$\s+([^$]+?)\s+\$/g, '$$$1$$');
    // Ensure $$...$$ is on separate lines if needed, or just standard
    
    // 8. Remove irrelevant elements
    // Remove "→XX 解説動画" or similar
    content = content.replace(/→\s*\d+(,\s*\d+)*\s*解説動画/g, '');
    // Remove "→ 例題 8,39,40" or "→ 31, 32, 33"
    content = content.replace(/→\s*(例題\s*)?[\d,\s]+/g, '');
    // Remove "[16 愛知工大]" etc
    content = content.replace(/\[\d{2}\s+[^\]]+\]/g, '');

    // 2. Titles
    // # 第5章
    content = content.replace(/^## 第(\d+)章/gm, '# 第$1章');
    // ## 基礎 CHECK
    // ## 基本例題 20 ...
    // ## 基本問題
    // Numbers without ## (like "1 図に示すように...") -> "## 1 図に示すように..."
    // Wait, let's just make sure question numbers start with ##
    content = content.replace(/^(基礎 CHECK|基本問題|応用問題|発展問題)\s*$/gm, '## $1');
    
    // Let's find question numbers at the start of a line
    content = content.replace(/^(\d+)\s+([^\n]+)/gm, '## $1 $2');
    
    // Sub-questions (1) (2) -> ### (1)
    content = content.replace(/^\((\d+)\)/gm, '### ($1)');

    fs.writeFileSync(outPath, content, 'utf8');
    console.log(`Cleaned: ${outPath}`);
}

const mainIn = 'docs/0 数据准备/charpter 2-10/charpter5_MD/MinerU_markdown_リードα_物理_charpter5.md';
const mainOut = 'docs/0 数据准备/charpter 2-10/charpter5_MD/MinerU_markdown_リードα_物理_charpter5_cleaned.md';
const ansIn = 'docs/0 数据准备/charpter 2-10/charpter5_MD/MinerU_markdown_リードα_物理物理_charpter5_解析.md';
const ansOut = 'docs/0 数据准备/charpter 2-10/charpter5_MD/MinerU_markdown_リードα_物理物理_charpter5_解析_cleaned.md';

cleanMarkdown(mainIn, mainOut);
cleanMarkdown(ansIn, ansOut);

