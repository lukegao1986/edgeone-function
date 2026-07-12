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

// 简单的内容分块函数，防止超出上下文截断
function safeChunkContent(content, partsCount) {
  const lines = content.split('\n');
  const safeBreaks = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^###\s+/.test(lines[i]) || /^##\s+/.test(lines[i])) {
      safeBreaks.push(i);
    }
  }
  const chunks = [];
  const step = Math.floor(safeBreaks.length / partsCount);
  let lastIdx = 0;
  for (let i = 1; i < partsCount; i++) {
    const breakLine = safeBreaks[i * step];
    chunks.push(lines.slice(lastIdx, breakLine).join('\n'));
    lastIdx = breakLine;
  }
  chunks.push(lines.slice(lastIdx).join('\n'));
  return chunks;
}

async function main() {
  const chapterStr = '03'; // 第3章
  const chapterId = 'phy_1'; // 用于Syllabus提取
  
  const qFile = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter3_MD/charpter3_题目.md');
  const aFile = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter3_MD/charpter3_解析.md');
  const sampleFile = path.join(__dirname, '../docs/0 数据准备/charpter 1/sample.json');
  
  const qContent = fs.readFileSync(qFile, 'utf8');
  const aContent = fs.readFileSync(aFile, 'utf8');
  const sampleContent = fs.readFileSync(sampleFile, 'utf8');

  // 为了演示和防止大文件截断，这里我们只取第1部分（可以按需增加分块数量）
  const partsCount = 3;
  const qChunks = safeChunkContent(qContent, partsCount);
  const aChunks = safeChunkContent(aContent, partsCount);
  
  // 这里我们处理 part1 作为示例，你可以后续循环处理所有 part
  const partIndex = 0;
  const partQ = qChunks[partIndex];
  const partA = aChunks[partIndex];

  const outputFile = path.join(__dirname, `../docs/0 数据准备/charpter 2-10/charpter3_MD/${chapterId}_questions_part${partIndex+1}.json`);
  const previewFile = path.join(__dirname, `../docs/0 数据准备/charpter 2-10/charpter3_MD/${chapterId}_questions_part${partIndex+1}_preview.md`);

  console.log(`🔍 正在检查数据库以避免 business_code 重复 (chapter: ${chapterStr})...`);
  const maxIndexes = await getMaxIndexes(chapterStr);
  console.log(`📊 当前最大编号: C:${maxIndexes.C}, E:${maxIndexes.E}, B:${maxIndexes.B}, A:${maxIndexes.A}`);

  const startC = maxIndexes.C + 1;
  const startE = maxIndexes.E + 1;
  const startB = maxIndexes.B + 1;
  const startA = maxIndexes.A + 1;

  // 提取 ejuSyllabus 中 phy_1 的 Topics 和 Subtopics 作为上下文
  const syllabusContext = `
【候选考点（Topic）及分考点（Subtopic）参考范围 (chapter_id: phy_1)】
- phy_1_1_1: (1)運動の表し方 (位置,変位,速度,加速度,相対運動,落体の運動,水平投射,斜方投射)
  - phy_1_1_1_01: 位置と変位
  - phy_1_1_1_02: 速度と加速度
  - phy_1_1_1_03: 相対運動
  - phy_1_1_1_04: 落体の運動
  - phy_1_1_1_05: 水平投射
  - phy_1_1_1_06: 斜方投射
- phy_1_1_2: (2)さまざまな力 (力,重力,摩擦力,抗力,張力,弾性力,液体や気体から受ける力)
  - phy_1_1_2_01: 重力・摩擦力・抗力・張力・弾性力
  - phy_1_1_2_02: 液体や気体から受ける力
- phy_1_1_3: (3)力のつり合い (力の合成･分解,力のつり合い)
  - phy_1_1_3_01: 力の合成・分解とつり合い
- phy_1_1_4: (4)剛体にはたらく力のつり合い (力のモーメント,合力,偶力,剛体のつり合い,重心)
  - phy_1_1_4_01: 力のモーメント・合力・偶力
  - phy_1_1_4_02: 剛体のつり合いと重心
- phy_1_1_5: (5)運動の法則 (ニュートンの運動の3法則,力の単位と運動方程式,単位系と次元)
  - phy_1_1_5_01: ニュートンの運動の3法則
  - phy_1_1_5_02: 力の単位と運動方程式・単位系と次元
- phy_1_1_6: (6)摩擦や空気の抵抗を受ける運動 (静止摩擦力,動摩擦力,空気の抵抗と終端速度)
  - phy_1_1_6_01: 静止摩擦力・動摩擦力
  - phy_1_1_6_02: 空気の抵抗と終端速度
  `;

  const prompt = `你是一个 EJU（日本留学試験）物理题库编辑专家。

请阅读以下输入文件，将教材中的练习题转换为标准 JSON 题库格式。由于题目较多，这是第一批数据。请确保返回格式是完整的 JSON 数组！

【输入信息】
1. 教材原文（含题目）：
${partQ}

2. 教材答案（含解析）：
${partA}

3. JSON 格式模板（参考字段结构）：
${sampleContent}

4. 候选考点（Topic）及分考点（Subtopic）参考范围：
${syllabusContext}

【目标章节 信息】
- 章号: ${chapterStr}

【JSON 字段说明】
每道题为一个 JSON 对象，所有题目组成一个 JSON 数组：

| 字段 | 类型 | 说明 |
|------|------|------|
| businessCode | string | 业务编码，格式：phy-{章号}-q{难度首字母}{序号} |
| topicCode | string | 考点代码，由 LLM 根据题目内容动态匹配（见下方归类规则） |
| questionType | int | 题型，固定为 1（单选题） |
| difficultyLevel | int | 难度：1=基础, 2=进阶, 3=挑战 |
| score | int | 分值，固定为 5 |
| stem | string | 题干，保留 LaTeX 公式和图片 URL |
| options | string[] | 选项数组，数量 = 2N+2（见下方规则） |
| correctIndex | int | 正确选项的索引（0-based），取值 0 ~ 2N+1 |
| explanation | string | 解析，格式见下方 |
| subtopicCodes | string[]? | 可选，分考点代码数组（如不需要可省略此字段） |

【topicCode 动态归类规则】
请不要为所有题目使用统一的 topicCode。你需要为每一道题单独判断最合适的 \`topicCode\`：
1. **优先提取关键字**：观察教材原文中题号后面紧接着的标题或关键字（例如：“48 垂直抗力”中的“垂直抗力”，“49 弾性力”中的“弾性力”）。
2. **匹配 Syllabus 内容**：将提取到的关键字与提供的 Syllabus 列表的 \`title\` 或 \`content\` 进行比对。例如“垂直抗力”对应 \`phy_1_1_2\` 中包含的“抗力”。
3. **题干兜底判断**：如果题号后没有明确的关键字，请通过阅读题干的物理情景和求解目标（如求合力、张力等），结合物理本质进行合理归类。

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
1. 选项数量 = 2N+2，其中 N = 本题の問題数（小问数或填空数）
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
   - 示例（N=2）："5.0 m/s, 9.0 m" 表示 (1)の答案=5.0, (2)の答案=9.0
   - 组合策略：为每问设置 2-3 个候选值（1 正确 + 1~2 干扰），交叉组合出 2N+2 个选项
5. correctIndex 为单个整数，指向正确组合选项的索引（0-based）。请务必**随机打乱**选项顺序，并确保 correctIndex 的取值是随机分布在 0 到 2N+1 之间，绝对不要让所有的题目的 correctIndex 都是 0！
6. **必须保留图片**：如果原题选项中包含图片，必须在生成的 options 字符串中完整保留对应的图片 URL（\`![image](url)\` 格式）。

【explanation 格式】
"explanation": "【参考答案】: {正确答案}\\n\\n【详细解析】: {详细解题过程，包含公式推导和物理概念说明}"

解析要求：
- 【参考答案】简明给出答案
- 【详细解析】包含完整的公式推导过程，解释物理概念
- 保留 LaTeX 公式格式
- **解析解说必须以中文为主撰写**（题干保持日文原文）
- **必须保留所有相关的图片 URL**（\`![image](url)\` 格式）。如果教材答案中有关键图片（如图表、受力分析图等），必须在解析中完整保留。

【stem 格式要求】
1. 保持日文原文，不翻译
2. 保留所有 LaTeX 公式（$...$ 格式）
3. **必须保留所有图片 URL**（\`![image](url)\` 格式）。如果原 Markdown 中有图片链接，必须完整无误地将其保留在题干（stem）或解析（explanation）中，**绝对不能丢弃图片链接**！
4. 如果题目有多个小问，保留 (1)(2)(3) 等编号
5. 题干中的图示 URL 放在题干末尾

【subtopicCodes 字段】
请为每道题判断其涉及的分考点：
1. 参考提供的 Syllabus 列表。
2. 阅读题干和解析，基于题目实际考查的本质知识点判断。
3. 挑选出**最相关、最核心的 1~3 个 subtopicCodes**。

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
  
  let previewMd = `# phy_1_chapter3 题目预览 (Part ${partIndex+1})\n\n总题数: ${parsed.length}\n\n`;
  for (const q of parsed) {
    previewMd += `## [${q.difficultyLevel}] ${q.businessCode} | 考点: ${q.topicCode} (选项数: ${q.options.length})\n\n`;
    previewMd += `**题干**:\n${q.stem}\n\n`;
    previewMd += `**选项**:\n`;
    q.options.forEach((opt, idx) => {
      previewMd += `${idx === q.correctIndex ? '✅' : '❌'} ${idx}. ${opt}\n`;
    });
    previewMd += `\n**解析**:\n${q.explanation}\n\n`;
    previewMd += `**分考点(Subtopics)**: ${q.subtopicCodes ? q.subtopicCodes.join(', ') : '未标注'}\n\n---\n\n`;
  }
  
  fs.writeFileSync(previewFile, previewMd, 'utf8');
  console.log(`✅ Generated preview to ${previewFile}`);
}

main().catch(console.error);
