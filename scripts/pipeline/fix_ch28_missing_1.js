const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

async function main() {
  const jsonPath = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30/charpter28/phy_5_chapter28_questions.json");
  let data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  
  const existingCodes = new Set(data.map(q => q.businessCode));

  const qText = fs.readFileSync(path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30/charpter28/charpter28题目_cleaned.md"), "utf8");
  const aText = fs.readFileSync(path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30/charpter28/charpter28解析_cleaned.md"), "utf8");

  const prompt = `你是一个 EJU（日本留学試験）物理题库编辑专家。
请将以下给定的【题目块】转换为标准 JSON 题库格式。

【全局配置】
- 目标章节：phy_28 (属于 phy_5)
- 属于 電子 这一章，请匹配合适的 topicCode 和 subtopicCodes（如 phy_5_1_1 等）。

【待处理题目】
题目 475 到 492 (基本問題)，以及 492 到 496 (応用問題)。
- 基本問題 (475-492) 难度级别为 B (difficultyLevel=2)，对应 "phy-28-qB6" 到 "phy-28-qB23"
- 応用問題 (492-496) 难度级别为 A (difficultyLevel=3)，对应 "phy-28-qA1" 到 "phy-28-qA5"

题目文本:
${qText.substring(qText.indexOf("475 放電"), qText.length)}

解析文本:
${aText.substring(aText.indexOf("475"), aText.length)}

【JSON 字段说明与规则】
请返回一个 JSON 对象，必须包含一个 \`questions\` 数组字段。数组中的每个对象包含以下字段：
- businessCode (string): 按要求填入
- topicCode (string): 动态匹配最合适的考点。绝对不能为空！
- questionType (int): 固定为 1
- difficultyLevel (int): B=2 或 A=3
- score (int): 5
- stem (string): 题干原文，保留日文。LaTeX 公式必须使用 $ ... $ 或 $$ ... $$ 包裹。
- options (string[]): 选项数组。
  - **选项数量规则（2N+2）**：题干中有 N 个空或小问。选项数最高限制为16个。
  - **内容规则**：所有选项必须互异。绝对不能包含 干扰项 等字眼！
- correctIndex (int): 正确答案的索引。请务必随机分布。
- explanation (string): 格式："【参考答案】: {正确选项}\\n\\n【详细解析】: {详细过程}"。解析尽量使用中文。公式必须使用 $ ... $ 或 $$ ... $$。
- subtopicCodes (string[]): 挑选 1-3 个最相关的分考点代码。

请返回符合要求的 JSON 格式。由于内容较长，可以分批处理，这次请处理前 10 题 (475 - 484)。`;

  console.log("Generating for missing questions 475-484...");
  const res = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: "You are a strict JSON output assistant. Output ONLY valid JSON." },
      { role: "user", content: prompt }
    ],
    temperature: 0.2,
    response_format: { type: "json_object" }
  });
  
  const content = res.choices[0].message.content;
  fs.writeFileSync("temp_ch28_1.json", content);
  
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    console.error("JSON parse error", e);
    return;
  }
  
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
}

main().catch(console.error);