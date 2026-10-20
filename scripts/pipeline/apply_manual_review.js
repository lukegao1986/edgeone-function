const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// 读取 ejuSyllabus 以便获取全量子考点，供 LLM 参考
const syllabusPath = path.join(process.cwd(), "src/data/ejuSyllabus.ts");
let tsContent = fs.readFileSync(syllabusPath, "utf8");
const match = tsContent.match(
  /export const EJU_SYLLABUS[^=]*=\s*(\[[\s\S]+\]);?/,
);
let syllabus = [];
if (match) {
  try {
    syllabus = eval("(" + match[1] + ")");
  } catch (e) {
    console.error("Eval error", e);
  }
}
const physics = syllabus
  .find((s) => s.code === "science")
  ?.subSubjects.find((ss) => ss.code === "physics");
const subtopicsData = {};
if (physics) {
  physics.chapters.forEach((ch) => {
    ch.sections.forEach((sec) => {
      sec.topics.forEach((top) => {
        subtopicsData[top.id] = top.subtopics || [];
      });
    });
  });
}

const csvPath = path.join(
  process.cwd(),
  "docs/Topic_Review_Reports/Chapter2_7_Topics_Review_extracted.csv",
);
let rawCsv = fs.readFileSync(csvPath, "utf8");
if (rawCsv.charCodeAt(0) === 0xfeff) {
  rawCsv = rawCsv.slice(1);
}

const lines = rawCsv.split("\n").filter((line) => line.trim() !== "");
const header = lines[0].split(",").map((h) => h.replace(/^"|"$/g, ""));
const records = [];

for (let i = 1; i < lines.length; i++) {
  // A simple CSV split that handles quotes
  // We know the structure is "bCode","summary","tCode","manual","subCodes"
  const rowStr = lines[i];
  // Regex to split by comma, ignoring commas inside quotes
  const rowMatches = rowStr.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];

  // Or simply using split since the text might have commas inside the summary:
  let parts = [];
  let current = "";
  let inQuotes = false;
  for (let char of rowStr) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current);

  // Fallback to simpler method if the above logic gives unexpected column counts
  if (parts.length < header.length) {
    parts = rowStr.split('","').map((p) => p.replace(/^"|"$/g, ""));
  }

  if (parts.length >= 5) {
    records.push({
      businessCode: parts[0].replace(/^"|"$/g, ""),
      "概要(100字内)": parts[1].replace(/^"|"$/g, ""),
      topicCode: parts[2].replace(/^"|"$/g, ""),
      人工意见: parts[3].replace(/^"|"$/g, ""),
      subtopicCodes: parts[4].replace(/^"|"$/g, ""),
    });
  }
}

async function processManualReviews() {
  const tasks = [];

  // 找出所有填了人工意见的行
  for (const record of records) {
    const manualOpinion = record["人工意见"] ? record["人工意见"].trim() : "";
    if (manualOpinion) {
      console.log(
        `Found manual opinion for ${record.businessCode}: ${manualOpinion}`,
      );
      tasks.push(record);
    }
  }

  if (tasks.length === 0) {
    console.log("没有检测到任何非空的『人工意见』。");
    return;
  }

  // 对每一个任务调用 LLM
  for (const record of tasks) {
    const manualTopicCode = record["人工意见"];
    const stemSummary = record["概要(100字内)"];

    // 替换 topicCode
    console.log(
      `\n[${record.businessCode}] Replacing topicCode: ${record.topicCode} -> ${manualTopicCode}`,
    );
    record.topicCode = manualTopicCode;

    // 提取该 topicCode 下的所有 subtopics 供 LLM 选择
    const availableSubtopics = subtopicsData[manualTopicCode];
    if (!availableSubtopics || availableSubtopics.length === 0) {
      console.log(
        `Warning: No subtopics found for topicCode ${manualTopicCode}.`,
      );
      continue;
    }

    const subtopicsJsonStr = JSON.stringify(
      availableSubtopics.map((s) => ({
        code: s.code,
        name: s.name,
        description: s.description,
      })),
      null,
      2,
    );

    const prompt = `你是一个 EJU 物理题库考点分类专家。
我现在需要为一道题目重新分配分考点 (subtopicCodes)。
该题目已被人工指定为主考点 (topicCode): ${manualTopicCode}。

【题目概要】
${stemSummary}

【可选的分考点列表】
${subtopicsJsonStr}

请根据题目概要，从上面的【可选的分考点列表】中，挑选出最相关、最核心的 1~3 个 code（允许多选）。
请返回 JSON 格式，必须包含 "subtopicCodes" 数组，如：
{ "subtopicCodes": ["phy_1_1_1_02", "phy_1_1_1_04"] }
`;

    try {
      console.log(`  Asking LLM for new subtopicCodes...`);
      const response = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      const result = JSON.parse(response.choices[0].message.content);
      if (result && result.subtopicCodes) {
        console.log(`  -> Old subtopicCodes: ${record.subtopicCodes}`);
        console.log(
          `  -> New subtopicCodes: ${result.subtopicCodes.join(";")}`,
        );
        record.subtopicCodes = result.subtopicCodes.join(";");
      }
    } catch (err) {
      console.error(`  LLM Error for ${record.businessCode}:`, err.message);
    }
  }

  // 保存回 CSV
  const headerLine = `"businessCode","概要(100字内)","topicCode","人工意见","subtopicCodes"`;
  const csvLines = [headerLine];
  for (const record of records) {
    csvLines.push(
      `"${record.businessCode}","${record["概要(100字内)"]}","${record.topicCode}","${record["人工意见"]}","${record.subtopicCodes}"`,
    );
  }
  const outputStr = "\uFEFF" + csvLines.join("\n");
  fs.writeFileSync(csvPath, outputStr, "utf8");
  console.log(
    `\n已将更新后的记录写回 CSV。接下来您可以运行 write_back_json.js 等脚本。`,
  );
}

processManualReviews();
