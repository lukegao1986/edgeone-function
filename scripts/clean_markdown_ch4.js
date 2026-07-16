const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

async function cleanMarkdown(inputFile, outputFile) {
  const content = fs.readFileSync(inputFile, 'utf8');
  
  // We'll split the content into 2 chunks to avoid output token limits
  const lines = content.split('\n');
  const chunks = [];
  const midPoint = Math.floor(lines.length / 2);
  let splitIndex = midPoint;
  
  // Find a good split point (e.g. before a heading)
  while (splitIndex < lines.length && !lines[splitIndex].startsWith('## ')) {
    splitIndex++;
  }
  if (splitIndex === lines.length) splitIndex = midPoint;
  
  chunks.push(lines.slice(0, splitIndex).join('\n'));
  chunks.push(lines.slice(splitIndex).join('\n'));

  let cleanedContent = '';
  
  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processing chunk ${i + 1}/${chunks.length} of ${path.basename(inputFile)}...`);
    const prompt = `你是一个 EJU（日本留学試験）教材数据处理助手。
请对以下 MinerU 扫描生成的 Markdown 内容进行格式清洗。

【清洗规则】
1. 压缩多余空行：连续多个空行压缩为 1 个空行
2. 统一标题层级：
   - 章节标题用 #（如 "# 4章 ..."）
   - 题目编号用 ##（如 "## 基礎CHECK 1", "## 例題1", "## 58", "## 59"）。注意：在原文件中类似 "1 質量 2.0kg の..." 或者单独占一行的数字（如 "65", "66" 紧接在解析前面）**都是题号**，必须将它们转换为 \`##\` 级别的标题（例如 "## 1", "## 65"）。绝对不可将这些题号当做无意义数字删除！
   - 小问用 ###（如 "### (1)"）
3. LaTeX 公式标准化：
   - 行内公式用 $...$（美元符号内侧无多余空格）
   - 独立公式用 $$...$$
   - 确保所有数学符号、上下标、分数等 LaTeX 语法正确
4. 图片标签修正：
   - 确保格式为 ![image](完整URL)
   - URL 不断行、不缺失
5. 保持原教材的题目编号和顺序，不重新编号。对于解析文件，如果遇到 "## -↓ ここがポイント"，请将其作为普通加粗或保留，但前面的题号（如 65）必须转换为 "## 65"。
6. 不翻译日文内容，保持原文
7. 清除 MinerU 可能残留的页眉页脚、水印文字
8. 移除无关辅导元素：主动删除类似 "→XX 解說動画" 等指向外部视频或教程的提示文本，及其紧邻的二维码图片。同时删除题目末尾类似 "→ 31, 32, 33" 或 "→ 例題 8,39,40" 等无意义的纯数字引用。
9. 净化解析区冗余图片：在答案解析中，如果图片不是关键的受力分析图、图像图表（如 v-t 图）或几何推导图，仅为原书排版残留（如卡通人物、装饰图标、“解答”字样的题头图等），一并清理。
10. **极其重要：绝对不要自己编造或增加任何题目！原文件有多少题，就输出多少题！禁止续写！**

请直接返回清洗后的 Markdown 文本，不要加任何其他多余的话。

【输入内容】：
\n\${chunks[i]}\n
`;

    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful markdown formatting assistant. Never hallucinate or add extra content.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0,
      max_tokens: 8192
    });
    
    let resContent = response.choices[0].message.content;
    if (resContent.startsWith('\`\`\`markdown')) {
      resContent = resContent.replace(/^\`\`\`markdown\n/, '').replace(/\n\`\`\`$/, '');
    }
    cleanedContent += resContent + '\n\n';
  }
  
  fs.writeFileSync(outputFile, cleanedContent.trim() + '\n', 'utf8');
  console.log(`Saved cleaned file to ${outputFile}`);
}

async function main() {
  const qFile = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter4_MD/MinerU_markdown_リードα_物理_charpter4.md');
  const aFile = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter4_MD/MinerU_markdown_リードα_物理物理_charpter4_解析.md');
  
  const qOut = qFile.replace('.md', '_cleaned.md');
  const aOut = aFile.replace('.md', '_cleaned.md');
  
  await cleanMarkdown(qFile, qOut);
  await cleanMarkdown(aFile, aOut);
}

main().catch(console.error);