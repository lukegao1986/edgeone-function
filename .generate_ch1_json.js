const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

// 我们把 34 道题分批发送给大模型，每批 10 道题左右
async function main() {
  const qFile = path.join(__dirname, 'docs/0 数据准备/Charpter 1-30/charpter1/charpter1_题目.md');
  const aFile = path.join(__dirname, 'docs/0 数据准备/Charpter 1-30/charpter1/charpter1_解析.md');
  const sampleFile = path.join(__dirname, 'docs/0 数据准备/charpter 1/sample.json');
  const syllabusFile = path.join(__dirname, 'src/data/ejuSyllabus.ts');
  const outputFile = path.join(__dirname, 'docs/0 数据准备/Charpter 1-30/charpter1/phy_1_chapter1_questions.json');
  const previewFile = path.join(__dirname, 'docs/0 数据准备/Charpter 1-30/charpter1/phy_1_chapter1_questions_preview.md');

  const qContent = fs.readFileSync(qFile, 'utf8');
  const aContent = fs.readFileSync(aFile, 'utf8');
  const sampleContent = fs.readFileSync(sampleFile, 'utf8');
  
  // 简单提取 phy_1 下的 syllabus 作为文本参考
  const syllabusText = fs.readFileSync(syllabusFile, 'utf8');
  const phy1Match = syllabusText.match(/"id": "phy_1"[\s\S]*?"id": "phy_2"/);
  const phy1Syllabus = phy1Match ? phy1Match[0].replace(/"id": "phy_2"/, '') : '';

  // 解析题目文本，按题拆分
  // 以 ### Q, ## 例題, 纯数字开头的基本/応用問題 为界
  const qLines = qContent.split('\n');
  const questions = [];
  let currentQ = [];
  
  for (let i = 0; i < qLines.length; i++) {
    const line = qLines[i];
    if (line.match(/^### Q\d+/) || line.match(/^## 例題\d+/) || line.match(/^\d+\s+[^■▪☐]+[■▪☐]/) || line.match(/^✿?\d+\s+[^■▪☐]+[■▪☐]/)) {
      if (currentQ.length > 0) {
        questions.push(currentQ.join('\n'));
      }
      currentQ = [line];
    } else if (line.match(/^## 基礎CHECK/) || line.match(/^## 基本問題/) || line.match(/^## 応用問題/) || line.match(/^## リード C/) || line.match(/^## : 上位科目/) || line.match(/^◆：上位科目/)) {
      if (currentQ.length === 0) {
        currentQ.push(line);
      } else {
        currentQ.push(line);
      }
    } else {
      currentQ.push(line);
    }
  }
  if (currentQ.length > 0) {
    questions.push(currentQ.join('\n'));
  }

  const validQuestions = questions.filter(q => {
    return q.match(/### Q\d+/) || q.match(/## 例題\d+/) || q.match(/\d+\s+[^■▪☐]+[■▪☐]/) || q.match(/✿?\d+\s+[^■▪☐]+[■▪☐]/);
  });
  
  console.log(`Parsed ${validQuestions.length} questions from markdown.`);

  const BATCH_SIZE = 5;
  let allParsedQuestions = [];
  
  // 前置查重已知都是 0，所以起始都是 1
  let nextIndex = {
    'C': 1,
    'E': 1,
    'B': 1,
    'A': 1
  };

  for (let i = 0; i < validQuestions.length; i += BATCH_SIZE) {
    const batch = validQuestions.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${i / BATCH_SIZE + 1} (${batch.length} questions)...`);
    
    const batchQContent = batch.join('\n\n---\n\n');
    
    const prompt = `你是一个 EJU（日本留学試験）物理题库编辑专家。

请阅读以下输入文件，将教材中的练习题转换为标准 JSON 题库格式。
本次批次共传入了 ${batch.length} 道题，请严格返回一个包含 ${batch.length} 个 JSON 对象的数组，每个对象对应一道题。不要拆分题目，如果一题有多个小问，请将它们合并在 stem 和 explanation 中。

【输入文件1：教材原文（当前批次题目）】
${batchQContent}

【输入文件2：教材答案（含解析，请从中自行匹配对应题号的解析）】
${aContent}

【输入文件3：JSON 格式模板】
${sampleContent}

【候选考点（Topic）及分考点（Subtopic）参考范围】
${phy1Syllabus}

【目标章节 信息】
- 章号: 01

【businessCode 命名规则】
- 格式：phy-01-q{难度首字母}{序号}
- 难度首字母：
  - C = 基礎CHECK（difficultyLevel=1）
  - E = 基本例題（difficultyLevel=2）
  - B = 基本問題 或 リード C（difficultyLevel=2）
  - A = 応用問題（difficultyLevel=3）
- 请为你生成的题目根据以下起始序号递增：
  - C 题型从 ${nextIndex['C']} 开始
  - E 题型从 ${nextIndex['E']} 开始
  - B 题型从 ${nextIndex['B']} 开始
  - A 题型从 ${nextIndex['A']} 开始

【options 生成规则（核心规则）】
1. 选项数量严格等于 2N+2（N为小问数/空数）。
2. 多问题的选项是各小问答案的组合。每个选项只用逗号或分号分隔各小问答案，绝对不要在前面加 "(1)"、"A:" 等小问前缀，如直接输出 "$4.0 m/s$, $-6.0 m/s$"。
3. 选项中严禁包含表示选项序号的 "A: ", "B: " 等前缀。
4. **所有公式、数值、变量和单位符号必须被 $ ... $ 包裹**（中文文本除外）。如："$4.0 m/s$"。
5. 必须保留图片。

【explanation 格式】
"explanation": "【参考答案】: {正确答案}\\n\\n【详细解析】: {详细解题过程，包含公式推导和物理概念说明}"
- 必须将原解析文件中的解题步骤完整提取！
- **【极其重要：强制中文】**：解析（包括“详细解析”四个字、解题思路、步骤、公式推导的说明文字等）必须全程使用【纯中文】撰写。绝对不能输出日文！（专有名词除外）。你需要将教材答案中的日文解析翻译为中文。
- 解析中的公式也必须用 $ ... $ 包裹。
- **必须保留所有图片 URL**。

【stem 格式要求】
1. 保持日文原文，保留 LaTeX 公式和图片 URL。
2. 严禁包含 Markdown 标题符号（如 ### Q1 等），只保留题干文本。

【topicCode 和 subtopicCodes 字段】
- 必须根据题干或关键字合理归类到最匹配的 topicCode（如 phy_1_1_1）
- 并标注 1~3 个最相关的 subtopicCodes。

【JSON 转义要求】
在输出 JSON 时，所有的 LaTeX 反斜杠必须转义为双反斜杠。例如：写成 "\\\\frac{1}{2}" 而不是 "\\frac{1}{2}"。

请返回严格的 JSON 数组格式。
`;

    let retryCount = 0;
    let success = false;
    
    while (!success && retryCount < 3) {
      try {
        const response = await openai.chat.completions.create({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 8192,
          response_format: { type: 'json_object' }
        });

        let jsonStr = response.choices[0].message.content;
        let parsed;
        
        const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          parsed = JSON.parse(arrayMatch[0]);
        } else {
          parsed = JSON.parse(jsonStr);
        }
        if (parsed.questions) {
          parsed = parsed.questions;
        }
        
        if (!Array.isArray(parsed)) {
          throw new Error('Parsed result is not an array');
        }
        if (parsed.length !== batch.length) {
          throw new Error(`Expected ${batch.length} questions, but got ${parsed.length}`);
        }
        
        // 更新 nextIndex
        parsed.forEach(q => {
          const match = q.businessCode.match(/q([CEBA])(\d+)/);
          if (match) {
            const type = match[1];
            const num = parseInt(match[2], 10);
            if (num >= nextIndex[type]) {
              nextIndex[type] = num + 1;
            }
          }
        });
        
        allParsedQuestions.push(...parsed);
        success = true;
      } catch (e) {
        retryCount++;
        console.error(`Failed to parse JSON for batch (Attempt ${retryCount}):`, e.message);
        if (retryCount >= 3) {
          console.error('Max retries reached. Skipping this batch.');
        }
      }
    }
  }
  
  // 后处理：打乱 options，并重新设定 correctIndex，以及质量检查
  const finalQuestions = allParsedQuestions.map(q => {
    const originalOptions = q.options;
    const correctOption = originalOptions[q.correctIndex];
    
    let indexedOptions = originalOptions.map((opt, index) => ({ opt, index }));
    
    // 稳定随机种子打乱
    let seed = 0;
    for (let i = 0; i < q.businessCode.length; i++) {
      seed += q.businessCode.charCodeAt(i);
    }
    
    for (let i = indexedOptions.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const random = seed / 233280;
      const j = Math.floor(random * (i + 1));
      [indexedOptions[i], indexedOptions[j]] = [indexedOptions[j], indexedOptions[i]];
    }
    
    const shuffledOptions = indexedOptions.map(item => item.opt);
    const newCorrectIndex = shuffledOptions.indexOf(correctOption);
    
    // 强制清除题干中的 Markdown 标题符号
    let cleanStem = q.stem.replace(/^#+\s+/gm, '');
    
    return {
      ...q,
      stem: cleanStem,
      options: shuffledOptions,
      correctIndex: newCorrectIndex
    };
  });

  fs.writeFileSync(outputFile, JSON.stringify(finalQuestions, null, 2), 'utf8');
  console.log(`Generated ${finalQuestions.length} questions to ${outputFile}`);
  
  // 生成 preview md
  let previewMd = `# phy_1 章 题目预览\n\n总题数: ${finalQuestions.length}\n\n`;
  
  let typeCount = {1:0, 2:0, 3:0};
  let optCount = {};
  
  for (const q of finalQuestions) {
    typeCount[q.difficultyLevel] = (typeCount[q.difficultyLevel] || 0) + 1;
    optCount[q.options.length] = (optCount[q.options.length] || 0) + 1;
    
    previewMd += `## [难度 ${q.difficultyLevel}] ${q.businessCode} (选项数: ${q.options.length})\n\n`;
    previewMd += `**考点**: ${q.topicCode} | ${q.subtopicCodes ? q.subtopicCodes.join(', ') : '未标注'}\n\n`;
    previewMd += `**题干**:\n${q.stem}\n\n`;
    previewMd += `**选项**:\n`;
    q.options.forEach((opt, idx) => {
      previewMd += `${idx === q.correctIndex ? '✅' : '❌'} ${idx}. ${opt}\n`;
    });
    previewMd += `\n**解析**:\n${q.explanation}\n\n---\n\n`;
  }
  
  console.log('--- 生成结果统计 ---');
  console.log(`总题数: ${finalQuestions.length}`);
  console.log(`难度分布: 基础=${typeCount[1]}, 进阶=${typeCount[2]}, 挑战=${typeCount[3]}`);
  console.log(`选项数分布:`, optCount);
  
  fs.writeFileSync(previewFile, previewMd, 'utf8');
  console.log(`Generated preview to ${previewFile}`);
}

main().catch(console.error);
