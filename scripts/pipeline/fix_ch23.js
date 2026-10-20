const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

async function main() {
  const jsonPath = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30/charpter23/phy_4_chapter23_questions.json");
  let data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  
  // Clean up previous fixes if any duplicate businessCode exists
  const existingCodes = new Set(data.map(q => q.businessCode));

  const questions = [
    { num: 395, bCode: "phy-23-qC11" },
    { num: 396, bCode: "phy-23-qC12" },
    { num: 397, bCode: "phy-23-qC13" },
    { num: 398, bCode: "phy-23-qC14" },
    { num: 399, bCode: "phy-23-qC15" },
    { num: 400, bCode: "phy-23-qC16" },
    { num: 401, bCode: "phy-23-qC17" },
    { num: 402, bCode: "phy-23-qC18" }
  ];

  const qText = fs.readFileSync(path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30/charpter23/charpter23题目_cleaned.md"), "utf8");
  const aText = fs.readFileSync(path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30/charpter23/charpter23解析_cleaned.md"), "utf8");

  const prompt = `你是一个 EJU（日本留学試験）物理题库编辑专家。
请将以下给定的【题目块】转换为标准 JSON 题库格式。

【全局配置】
- 目标章节：phy_23 (属于 phy_4)
- 属于 電流 这一章，请匹配合适的 topicCode 和 subtopicCodes（如 phy_4_2_1 等）。

【待处理题目（共 8 题）】
从 395 到 402，均为基础题目，难度级别为 C (difficultyLevel=1)。
题目文本:
${qText.substring(qText.indexOf("395 電流"), qText.indexOf("403 ") !== -1 ? qText.indexOf("403 ") : qText.length)}

解析文本:
${aText.substring(aText.indexOf("395"), aText.indexOf("403") !== -1 ? aText.indexOf("403") : aText.length)}

【JSON 字段说明与规则】
请返回一个 JSON 对象，必须包含一个 \`questions\` 数组字段。数组中的每个对象包含以下字段：
- businessCode (string): 依次填入 "phy-23-qC11" 到 "phy-23-qC18"
- topicCode (string): 根据题干和 Syllabus 动态匹配最合适的考点。绝对不能为空！
- questionType (int): 固定为 1
- difficultyLevel (int): C=1
- score (int): 5
- stem (string): 题干原文，保留日文原文。所有的 LaTeX 公式必须严格使用 $ ... $（行内公式）或 $$ ... $$（行间公式）包裹。保留原图 URL。
- options (string[]): 选项数组。
  - **选项数量规则（2N+2）**：题干中有 N 个小问。选项数应为 2N+2 (最高限制为16个)。
  - **内容规则**：每个选项必须是一个组合（如：(1) xxx (2) xxx (3) xxx）。所有选项必须互异。选项绝对不能包含 干扰项 等字眼！
- correctIndex (int): 正确答案的索引。请务必随机分布正确答案的位置。
- explanation (string): 格式："【参考答案】: {正确选项}\\n\\n【详细解析】: {详细过程}"。解析尽量使用中文。公式必须使用 $ ... $ 或 $$ ... $$。
- subtopicCodes (string[]): 挑选 1-3 个最相关的分考点代码。

请返回符合要求的 JSON 格式。`;

  console.log("Generating for missing questions 395-402...");
  const res = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: "You are a strict JSON output assistant. Output ONLY valid JSON array." },
      { role: "user", content: prompt }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }
  });
  
  const content = res.choices[0].message.content;
  const parsed = JSON.parse(content);
  
  const replaceLatex = (text) => {
    if (!text) return text;
    let fixedText = text.replace(/\\\\\\\[/g, '$$$$').replace(/\\\\\\\]/g, '$$$$');
    fixedText = fixedText.replace(/\\\\\(/g, '$').replace(/\\\\\)/g, '$');
    fixedText = fixedText.replace(/\\\[/g, '$$$$').replace(/\\\]/g, '$$$$');
    fixedText = fixedText.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
    return fixedText;
  };

  parsed.questions.forEach(q => {
    q.stem = replaceLatex(q.stem);
    q.options = q.options.map(replaceLatex);
    q.explanation = replaceLatex(q.explanation);
    
    // Only push if not exists
    if (!existingCodes.has(q.businessCode)) {
      data.push(q);
      existingCodes.add(q.businessCode);
    } else {
      const idx = data.findIndex(d => d.businessCode === q.businessCode);
      if (idx !== -1) data[idx] = q;
    }
  });
  
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
  console.log(`Successfully fixed and updated JSON. Total questions: ${data.length}`);
  
  // Regenerate preview
  let previewMd = `# phy_4 Chapter 23 题目预览\n\n总题数: ${data.length}\n\n`;
  for (const qItem of data) {
    previewMd += `## [难度 ${qItem.difficultyLevel}] ${qItem.businessCode} (选项数: ${qItem.options ? qItem.options.length : 0})\n\n`;
    previewMd += `**考点**: ${qItem.topicCode} | ${qItem.subtopicCodes ? qItem.subtopicCodes.join(", ") : "未标注"}\n\n`;
    previewMd += `**题干**:\n${qItem.stem}\n\n`;
    previewMd += `**选项**:\n`;
    if (qItem.options) {
      qItem.options.forEach((opt, idx) => {
        previewMd += `${idx === qItem.correctIndex ? "✅" : "❌"} ${idx}. ${opt}\n`;
      });
    }
    previewMd += `\n**解析**:\n${qItem.explanation}\n\n---\n\n`;
  }
  const previewPath = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30/charpter23/phy_4_chapter23_questions_preview.md");
  fs.writeFileSync(previewPath, previewMd, "utf8");
  console.log("Preview MD updated.");
}

main().catch(console.error);