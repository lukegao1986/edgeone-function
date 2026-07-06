const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

async function main() {
  const qFile = path.join(__dirname, '../docs/0 数据准备/phy-charpter2/物理 charpter 2_cleaned.md');
  const aFile = path.join(__dirname, '../docs/0 数据准备/phy-charpter2/物理 charpter 2解析_cleaned.md');
  const sampleFile = path.join(__dirname, '../docs/0 数据准备/charpter 1/sample.json');
  const outputFile = path.join(__dirname, '../docs/0 数据准备/phy-charpter2/phy_1_1_2_questions.json');
  const previewFile = path.join(__dirname, '../docs/0 数据准备/phy-charpter2/phy_1_1_2_questions_preview.md');

  const qContent = fs.readFileSync(qFile, 'utf8');
  const aContent = fs.readFileSync(aFile, 'utf8');
  const sampleContent = fs.readFileSync(sampleFile, 'utf8');

  const prompt = `你是一个 EJU（日本留学試験）物理题库编辑专家。

请阅读以下输入文件，将教材中的练习题转换为标准 JSON 题库格式。由于题目较多，请确保返回格式极其严格。如果文本太长，你可以一次只处理 10 道题，不过我希望你尽可能处理完所有题目。

【输入文件1：教材原文（含题目）】
${qContent}

【输入文件2：教材答案（含解析）】
${aContent}

【输入文件3：JSON 格式模板（参考字段结构）】
${sampleContent}

【目标 topic 信息】
- topicCode: phy_1_1_2
- 章号: 02
- 该 topic 下的分考点列表（用于可选的 subtopicCodes 标注）：
  phy_1_1_2_01 | 自由落下 | 别名: 自由落下, 落下運動
  phy_1_1_2_02 | 鉛直投げ下ろし | 别名: 投げ下ろし
  phy_1_1_2_03 | 鉛直投げ上げ | 别名: 投げ上げ
  phy_1_1_2_04 | 水平投射 | 别名: 水平投射
  phy_1_1_2_05 | 斜方投射 | 别名: 斜方投射

【JSON 字段说明】
每道题为一个 JSON 对象，所有题目组成一个 JSON 数组：

| 字段 | 类型 | 说明 |
|------|------|------|
| businessCode | string | 业务编码，格式：phy-{章号}-q{难度首字母}{序号} |
| topicCode | string | 考点代码，如 "phy_1_1_2" |
| questionType | int | 题型，固定为 1（单选题） |
| difficultyLevel | int | 难度：1=基础, 2=进阶, 3=挑战 |
| score | int | 分值，固定为 5 |
| stem | string | 题干，保留 LaTeX 公式和图片 URL |
| options | string[] | 选项数组，数量 = 2N+2（见下方规则） |
| correctIndex | int | 正确选项的索引（0-based），取值 0 ~ 2N+1 |
| explanation | string | 解析，格式见下方 |
| subtopicCodes | string[]? | 可选，分考点代码数组（如不需要可省略此字段） |

【businessCode 命名规则】
- 格式：phy-02-q{难度首字母}{序号}
- 难度首字母：
  - C = 基礎CHECK（difficultyLevel=1），序号从 1 开始
  - E = 基本例題（difficultyLevel=2），序号从 1 开始
  - B = 基本問題（difficultyLevel=2），序号从 1 开始
  - A = 応用問題（difficultyLevel=3），序号从 1 开始
- 示例：phy-02-qC1, phy-02-qE1, phy-02-qB1, phy-02-qA1
- 同一难度类型内序号连续递增

【difficultyLevel 映射规则】
- 基礎 CHECK → 1
- 基本例題 → 2
- 基本問題 → 2
- 応用問題 → 3
- リード C → 2

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
4. 多问题（N≥2）的选项是各小问答案的组合
   - 每个选项包含所有小问的答案，用逗号或分号分隔
   - 示例（N=2）："5.0 m/s, 9.0 m" 表示 (1)的答案=5.0, (2)的答案=9.0
   - 组合策略：为每问设置 2-3 个候选值（1 正确 + 1~2 干扰），交叉组合出 2N+2 个选项
5. correctIndex 为单个整数，指向正确组合选项的索引（0-based）

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
3. 保留所有图片 URL（![image](url) 格式）
4. 如果题目有多个小问，保留 (1)(2)(3) 等编号
5. 题干中的图示 URL 放在题干末尾

【subtopicCodes 字段（可选）】
如果上方提供了分考点列表，请为每道题判断其涉及的分考点：
1. 阅读题干和解析，判断该题考查了哪些知识点
2. 从分考点列表中选择所有相关的 code（1~5 个）

请返回严格的 JSON 数组格式。`;

  console.log('Calling DeepSeek API...');
  
  const response = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0,
    max_tokens: 8192, // 确保足够长以返回完整的 JSON 数组
    response_format: { type: 'json_object' }
  });

  let jsonStr = response.choices[0].message.content;
  
  // 简单处理如果大模型返回了包在 { "questions": [...] } 的情况
  let parsed;
  try {
    // 处理可能的 JSON.parse 错误，尝试提取 [] 之间的内容
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      parsed = JSON.parse(arrayMatch[0]);
    } else {
      parsed = JSON.parse(jsonStr);
    }
    
    if (parsed.questions) {
      parsed = parsed.questions;
    }
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    fs.writeFileSync(outputFile + '.raw', jsonStr);
    return;
  }

  fs.writeFileSync(outputFile, JSON.stringify(parsed, null, 2), 'utf8');
  console.log(`Generated ${parsed.length} questions to ${outputFile}`);
  
  // 生成 preview md
  let previewMd = `# phy_1_1_2 题目预览\n\n总题数: ${parsed.length}\n\n`;
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
  console.log(`Generated preview to ${previewFile}`);
}

main().catch(console.error);