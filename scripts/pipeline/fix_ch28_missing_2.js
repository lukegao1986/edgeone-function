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

  const processQuestion = async (qNum, bCode, diffLevel) => {
    let qEndStr = qNum === 498 ? "## 5" : (qNum + 1).toString();
    let qStart = qText.indexOf(qNum.toString());
    let qEnd = qText.indexOf(qEndStr, qStart + 10);
    if (qEnd === -1) qEnd = qText.length;
    
    let aStart = aText.indexOf(qNum.toString());
    let aEnd = aText.indexOf((qNum + 1).toString(), aStart + 10);
    if (aEnd === -1) aEnd = aText.indexOf("## -↓ここがポイント", aStart + 10);
    if (aEnd === -1) aEnd = aText.length;

    const prompt = `你是一个 EJU 物理题库编辑专家。请将以下【题目块】转换为标准 JSON 题库格式。

【全局配置】
- 目标章节：phy_28 (属于 phy_5)
- 考点：phy_5_1_1

题目 ${qNum}:
${qText.substring(qStart, qEnd)}

解析:
${aText.substring(aStart, aEnd)}

请返回一个 JSON 对象，必须包含一个 \`questions\` 数组字段。数组中的每个对象包含以下字段：
- businessCode: "${bCode}"
- topicCode: "phy_5_1_1"
- questionType: 1
- difficultyLevel: ${diffLevel}
- score: 5
- stem: 题干原文，保留日文。LaTeX 使用 $ ... $ 或 $$ ... $$。
- options: 数组。数量限制为 2N+2（N为小问或填空数，最高限制16）。每个选项是一个完整组合，互异。绝对不包含 干扰项 等字眼！
- correctIndex: 正确答案的索引。随机分布。
- explanation: "【参考答案】: {正确选项}\\n\\n【详细解析】: {详细过程}"。解析尽量精简（最多100字），公式使用 $ ... $ 或 $$ ... $$。
- subtopicCodes: ["phy_5_1_1_01", "phy_5_1_1_02"] 等相关。`;

    console.log(`Generating for ${qNum}...`);
    const res = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a strict JSON output assistant. Output ONLY valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(res.choices[0].message.content).questions[0];
  };

  const newQs = [];
  try {
    for (let i = 485; i <= 491; i++) {
       newQs.push(await processQuestion(i, `phy-28-qB${i - 469}`, 2));
    }
    for (let i = 492; i <= 498; i++) {
       newQs.push(await processQuestion(i, `phy-28-qA${i - 491}`, 3));
    }
  } catch (err) {
    console.error(err);
  }

  const replaceLatex = (text) => {
    if (!text || typeof text !== 'string') return text;
    let fixedText = text.replace(/\\\\\\\[/g, '$$$$').replace(/\\\\\\\]/g, '$$$$');
    fixedText = fixedText.replace(/\\\\\(/g, '$').replace(/\\\\\)/g, '$');
    fixedText = fixedText.replace(/\\\[/g, '$$$$').replace(/\\\]/g, '$$$$');
    fixedText = fixedText.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
    return fixedText;
  };

  newQs.filter(Boolean).forEach(q => {
    q.stem = replaceLatex(q.stem);
    if (q.options && Array.isArray(q.options)) {
        q.options = q.options.map(replaceLatex);
    }
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
  
  // Regenerate preview
  let previewMd = `# phy_5 Chapter 28 题目预览\n\n总题数: ${data.length}\n\n`;
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
  const previewPath = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30/charpter28/phy_5_chapter28_questions_preview.md");
  fs.writeFileSync(previewPath, previewMd, "utf8");
  console.log("Preview MD updated.");
}

main().catch(console.error);