const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");
require("dotenv").config();

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const csvPath = path.join(process.cwd(), "docs/Chapter8_10_Topics_Review.csv");
const syllabusPath = path.join(process.cwd(), "phy_1_syllabus.json");
const reportPath = path.join(
  process.cwd(),
  "docs/Chapter8_10_Subtopics_Update_Report.md",
);

// // const syllabusData

// 提取精简版的 syllabus 字符串
function buildSyllabusPrompt(syllabusObj) {
  let prompt = "【力学 Syllabus】\n";
  for (const topic of syllabusObj.topics) {
    prompt += `- ${topic.id} ${topic.title}\n`;
    for (const sub of topic.subtopics || []) {
      prompt += `  - ${sub.code} ${sub.name} (aliases: ${sub.aliases.join(", ")})\n`;
    }
  }
  return prompt;
}

// const syllabusText

async function main() {
  const records = parse(fs.readFileSync(csvPath, "utf8"), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });

  // Since phy_1_syllabus.json might have nested children, let's just pass the raw JSON string if it's not too big.
  const syllabusRaw = fs.readFileSync(syllabusPath, "utf8");

  let processedCount = 0;
  let changedCount = 0;
  const distribution = {};
  const unassigned = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const code = record.businessCode;
    const summary = record["概要(100字内)"];
    const oldSubtopics = record.subtopicCodes;

    console.log(`Processing [${i + 1}/${records.length}] ${code}...`);

    const prompt = `
你是一个 EJU 物理题库分类专家。
请根据以下力学(Mechanics)的 Syllabus 范围，为给定题目匹配 1~3 个最相关的 \`subtopicCodes\`。

【Syllabus 范围】
${syllabusRaw}

【题目信息】
编号: ${code}
概要: ${summary}

【匹配规则】
1. 请认真阅读题干，判断考查的核心物理知识点。
2. Chapter 8 主要涉及等速円運動(phy_1_3_1)和慣性力(phy_1_3_2)及相关综合。
3. Chapter 9 主要涉及単振動(phy_1_3_3)。
4. Chapter 10 主要涉及万有引力(phy_1_3_4)。
5. 若综合了受力分析、能量守恒等，也可加上对应的其它章节 code（如 phy_1_1_... 或 phy_1_2_...）。
6. 返回 1~3 个最贴切的 subtopicCode。
7. 请只返回 JSON 数组，不包含任何 Markdown 格式或额外说明，例如：["phy_1_3_1_01", "phy_1_1_3_02"]
`;

    try {
      const response = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      });

      let resText = response.choices[0].message.content.trim();
      resText = resText
        .replace(/^```json\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      const newSubtopicsArr = JSON.parse(resText);

      if (!Array.isArray(newSubtopicsArr) || newSubtopicsArr.length === 0) {
        unassigned.push(code);
      } else {
        const newSubtopicsStr = newSubtopicsArr.join(";");
        if (oldSubtopics !== newSubtopicsStr) {
          changedCount++;
        }

        // 更新记录
        record.subtopicCodes = newSubtopicsStr;
        record.topicCode = newSubtopicsArr[0].substring(0, 9); // e.g. phy_1_3_1

        // 统计分布
        for (const c of newSubtopicsArr) {
          distribution[c] = (distribution[c] || 0) + 1;
        }
      }
      processedCount++;
    } catch (e) {
      console.error(`Error processing ${code}: ${e.message}`);
      unassigned.push(code);
    }
  }

  // 写回 CSV
  const outCsv = stringify(records, { header: true });
  fs.writeFileSync(csvPath, outCsv, "utf8");
  console.log(`Updated CSV saved to ${csvPath}`);

  // 生成 Markdown 报告
  let report = `# Chapter 8-10 subtopicCodes 更新统计报告\n\n`;
  report += `- **配置完成的总题数**: ${processedCount}\n`;
  report += `- **发生 subtopicCodes 变更的题量**: ${changedCount}\n\n`;

  report += `## subtopicCodes 分布情况\n`;
  report += `| subtopicCode | 对应题目数量 |\n|---|---|\n`;
  const sortedDist = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  for (const [code, count] of sortedDist) {
    report += `| \`${code}\` | ${count} |\n`;
  }

  report += `\n## 未成功匹配的题目清单\n`;
  if (unassigned.length > 0) {
    for (const code of unassigned) {
      report += `- ${code}\n`;
    }
  } else {
    report += `*(无，所有题目均成功匹配)*\n`;
  }

  fs.writeFileSync(reportPath, report, "utf8");
  console.log(`Report saved to ${reportPath}`);
}

main();
