const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const mysql = require('mysql2/promise');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

async function getMaxIndexes(chapterStr) {
  let connection;
  const maxIndexes = { C: 0, E: 0, B: 0, A: 0 };
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      `SELECT business_code FROM questions WHERE business_code LIKE ?`,
      [`phy-${chapterStr}-q%`]
    );
    
    rows.forEach(row => {
      const code = row.business_code;
      const match = code.match(/q([CEBA])(\d+)$/);
      if (match) {
        const type = match[1];
        const num = parseInt(match[2], 10);
        if (num > maxIndexes[type]) {
          maxIndexes[type] = num;
        }
      }
    });
  } catch (err) {
    console.error('获取最大编号失败，将默认从 1 开始:', err.message);
  } finally {
    if (connection) await connection.end();
  }
  return maxIndexes;
}

async function main() {
  const chapterStr = '03'; // 第3章
  const topicCode = 'phy_1_1_3'; // 假设第3章对应 phy_1_1_3 (力のつりあい)
  
  const qFile = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter3_MD/MinerU_markdown_リードα_物理_charpter3_cleaned.md');
  const aFile = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter3_MD/MinerU_markdown_リードα_物理物理_charpter3_解析_cleaned.md');
  const sampleFile = path.join(__dirname, '../docs/0 数据准备/charpter 1/sample.json');
  
  const qContent = fs.readFileSync(qFile, 'utf8');
  const aContent = fs.readFileSync(aFile, 'utf8');
  const sampleContent = fs.readFileSync(sampleFile, 'utf8');

  const qLines = qContent.split('\n');
  const part4Q = qLines.slice(Math.floor(qLines.length * 5 / 6)).join('\n');
  
  const aLines = aContent.split('\n');
  const part4A = aLines.slice(Math.floor(aLines.length * 5 / 6)).join('\n');

  // 分批次输出
  const outputFile = path.join(__dirname, `../docs/0 数据准备/charpter 2-10/charpter3_MD/${topicCode}_questions_part4.json`);
  const previewFile = path.join(__dirname, `../docs/0 数据准备/charpter 2-10/charpter3_MD/${topicCode}_questions_part4_preview.md`);

  console.log(`🔍 正在检查数据库以避免 business_code 重复 (chapter: ${chapterStr})...`);
  const maxIndexes = await getMaxIndexes(chapterStr);
  console.log(`📊 当前最大编号: C:${maxIndexes.C}, E:${maxIndexes.E}, B:${maxIndexes.B}, A:${maxIndexes.A}`);

  const startC = maxIndexes.C + 1;
  const startE = maxIndexes.E + 1;
  const startB = maxIndexes.B + 1;
  const startA = maxIndexes.A + 1;

  const prompt = `你是一个 EJU（日本留学試験）物理题库编辑专家。

请阅读以下输入文件，将教材中的练习题转换为标准 JSON 题库格式。由于题目较多，这是第一批数据。请确保返回格式是完整的 JSON 数组！

【输入文件1：教材原文（含题目）】
${part4Q}

【输入文件2：教材答案（含解析）】
${part4A}

【输入文件3：JSON 格式模板（参考字段结构）】
${sampleContent}

【目标 topic 信息】
- topicCode: ${topicCode}
- 章号: ${chapterStr}
- 该 topic 下的分考点列表（如不需要 subtopicCodes，留空即可，后续由 tag-subtopics.ts 补标）：
  (留空)

【JSON 字段说明】
每道题为一个 JSON 对象，所有题目组成一个 JSON 数组：

| 字段 | 类型 | 说明 |
|------|------|------|
| businessCode | string | 业务编码，格式：phy-{章号}-q{难度首字母}{序号} |
| topicCode | string | 考点代码，如 "${topicCode}" |
| questionType | int | 题型，固定为 1（单选题） |
| difficultyLevel | int | 难度：1=基础, 2=进阶, 3=挑战 |
| score | int | 分值，固定为 5 |
| stem | string | 题干，保留 LaTeX 公式和图片 URL |
| options | string[] | 选项数组，数量 = 2N+2（见下方规则） |
| correctIndex | int | 正确选项的索引（0-based），取值 0 ~ 2N+1 |
| explanation | string | 解析，格式见下方 |
| subtopicCodes | string[]? | 可选，分考点代码数组（如不需要可省略此字段） |

【businessCode 命名规则】
- 格式：phy-${chapterStr}-q{难度首字母}{序号}
- 难度首字母：
  - C = 基礎CHECK（difficultyLevel=1）
  - E = 基本例題（difficultyLevel=2）
  - B = 基本問題（difficultyLevel=2）
  - A = 応用問題（difficultyLevel=3）
- 极其重要：为了防止 business_code 重复，本次录入必须严格从以下序号开始递增：
  - 基礎CHECK (C)：从 ${startC} 开始（即 phy-${chapterStr}-qC${startC}, phy-${chapterStr}-qC${startC + 1}...）
  - 基本例題 (E)：从 ${startE} 开始（即 phy-${chapterStr}-qE${startE}, phy-${chapterStr}-qE${startE + 1}...）
  - 基本問題/リード C (B)：从 ${startB} 开始（即 phy-${chapterStr}-qB${startB}, phy-${chapterStr}-qB${startB + 1}...）
  - 応用問題 (A)：从 ${startA} 开始（即 phy-${chapterStr}-qA${startA}, phy-${chapterStr}-qA${startA + 1}...）

【difficultyLevel 映射规则】
- 基礎 CHECK → 1
- 基本例題 → 2
- 基本問題 → 2
- リード C → 2
- 応用問題 → 3

【options 生成规则（核心规则）】
1. 选项数量 = 2N+2，其中 N = 本题的问题数（小问数或填空数）
   - N=1（单问）→ 4 个选项
   - N=2（两问）→ 6 个选项
   - N=3（三问）→ 8 个选项
   - N=4（四问/四空）→ 10 个选项
2. 正确答案必须是 options 中的一个选项，由 correctIndex 指向
3. 干扰选项的生成策略：
   - 基于物理常见易错点：单位换算错误、正负号搞反、漏乘系数、重力加速度取值错误等
   - 干扰选项应具有强迷惑性，数值合理，不要太离谱
   - 不要用"以上都不对"之类的选项
4. 多问题（N≥2）の选项是各小问答案的组合
   - 每个选项包含所有小问的答案，用逗号或分号分隔
   - 示例（N=2）："5.0 m/s, 9.0 m" 表示 (1)的答案=5.0, (2)的答案=9.0
   - 组合策略：为每问设置 2-3 个候选值（1 正确 + 1~2 干扰），交叉组合出 2N+2 个选项
5. correctIndex 为单个整数，指向正确组合选项的索引（0-based）。请务必**随机打乱**选项顺序，并确保 correctIndex 的取值是随机分布在 0 到 2N+1 之间，绝对不要让所有的题目的 correctIndex 都是 0！

【explanation 格式】
"explanation": "【参考答案】: {正确答案}\\n\\n【详细解析】: {详细解题过程，包含公式推导和物理概念说明}"

解析要求：
- 【参考答案】简明给出答案
- 【详细解析】包含完整的公式推导过程，解释物理概念
- 保留 LaTeX 公式格式
- 解析用中文撰写（题干保持日文原文）
- 如果教材答案中有关键图片，在解析中保留 ![image](url) 标签

【stem 格式要求】
1. 保持日文原文，不翻译
2. 保留所有 LaTeX 公式（$...$ 格式）
3. **必须保留所有图片 URL**（\`![image](url)\` 格式）。如果原 Markdown 中有图片链接，必须完整无误地将其保留在题干（stem）或解析（explanation）中，**绝对不能丢弃图片链接**！这是因为物理和数学题目高度依赖图表，如果丢弃图片将导致题目无法解答。
4. 如果题目有多个小问，保留 (1)(2)(3) 等编号
5. 题干中的图示 URL 放在题干末尾

请返回严格的 JSON 数组格式。`;

  console.log('🚀 Calling DeepSeek API...');
  
  const response = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0,
    max_tokens: 8192,
    response_format: { type: 'json_object' }
  });

  let jsonStr = response.choices[0].message.content;
  
  let parsed;
  try {
    let rawParsed;
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      rawParsed = JSON.parse(arrayMatch[0]);
    } else {
      rawParsed = JSON.parse(jsonStr);
    }
    
    if (rawParsed.questions) {
      rawParsed = rawParsed.questions;
    }

    parsed = rawParsed.map(q => {
      const originalOptions = q.options;
      const correctOption = originalOptions[q.correctIndex];
      
      let indexedOptions = originalOptions.map((opt, index) => ({ opt, index }));
      
      for (let i = indexedOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indexedOptions[i], indexedOptions[j]] = [indexedOptions[j], indexedOptions[i]];
      }
      
      const shuffledOptions = indexedOptions.map(item => item.opt);
      const newCorrectIndex = shuffledOptions.indexOf(correctOption);
      
      return {
        ...q,
        options: shuffledOptions,
        correctIndex: newCorrectIndex
      };
    });

  } catch (e) {
    console.error('❌ Failed to parse JSON:', e);
    fs.writeFileSync(outputFile + '.raw', jsonStr);
    return;
  }

  fs.writeFileSync(outputFile, JSON.stringify(parsed, null, 2), 'utf8');
  console.log(`✅ Generated ${parsed.length} questions to ${outputFile}`);
  
  let previewMd = `# ${topicCode} 题目预览\n\n总题数: ${parsed.length}\n\n`;
  for (const q of parsed) {
    previewMd += `## [${q.difficultyLevel}] ${q.businessCode} (选项数: ${q.options.length})\n\n`;
    previewMd += `**题干**:\n${q.stem}\n\n`;
    previewMd += `**选项**:\n`;
    q.options.forEach((opt, idx) => {
      previewMd += `${idx === q.correctIndex ? '✅' : '❌'} ${idx}. ${opt}\n`;
    });
    previewMd += `\n**解析**:\n${q.explanation}\n\n`;
    previewMd += `**考点**: ${q.subtopicCodes ? q.subtopicCodes.join(', ') : '未标注'}\n\n---\n\n`;
  }
  
  fs.writeFileSync(previewFile, previewMd, 'utf8');
  console.log(`✅ Generated preview to ${previewFile}`);
}

main().catch(console.error);