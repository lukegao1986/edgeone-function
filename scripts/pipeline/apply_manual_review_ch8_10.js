const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const updatesPath = path.join(
  process.cwd(),
  "docs/manual_review_updates_ch8_10.json",
);
if (!fs.existsSync(updatesPath)) {
  console.log("No updates found.");
  process.exit(0);
}
const updates = JSON.parse(fs.readFileSync(updatesPath, "utf8"));
if (updates.length === 0) {
  console.log("No manual updates to apply.");
  process.exit(0);
}

// Read syllabus
const syllabusPath = path.join(process.cwd(), "src/data/ejuSyllabus.ts");
let syllabusContent = fs.readFileSync(syllabusPath, "utf8");
const match = syllabusContent.match(
  /export const EJU_SYLLABUS[^=]*=\s*(\[[\s\S]*?\]);/,
);
let EJU_SYLLABUS = [];
if (match) {
  EJU_SYLLABUS = eval(match[1]);
}

function getSubtopicsForTopic(topicCode) {
  let subtopics = [];
  EJU_SYLLABUS.forEach((subject) => {
    if (subject.chapters) {
      subject.chapters.forEach((chapter) => {
        if (chapter.topics) {
          chapter.topics.forEach((topic) => {
            if (topic.id === topicCode && topic.subtopics) {
              subtopics = topic.subtopics;
            }
          });
        }
      });
    }
  });
  return subtopics;
}

async function processUpdates() {
  const baseDir = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30");

  const chapters = [8, 9, 10];
  for (const ch of chapters) {
    const jsonPath = path.join(
      baseDir,
      `charpter${ch}`,
      `phy_1_chapter${ch}_questions.json`,
    );
    if (!fs.existsSync(jsonPath)) continue;

    let data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    let changed = false;

    for (const update of updates) {
      const q = data.find((item) => item.businessCode === update.businessCode);
      if (q) {
        console.log(
          `Processing ${q.businessCode}, new topicCode: ${update.topicCode}`,
        );
        q.topicCode = update.topicCode;
        const subtopics = getSubtopicsForTopic(update.topicCode);

        if (subtopics.length === 0) {
          console.log(
            `No subtopics found for ${update.topicCode}, setting to []`,
          );
          q.subtopicCodes = [];
          changed = true;
          continue;
        }

        const prompt = `你是一个 EJU 物理专家。
题目概要：${update.stem}
主考点编码：${update.topicCode}
该主考点下有以下子考点：
${JSON.stringify(
  subtopics.map((s) => ({ id: s.id, title: s.title, content: s.content })),
  null,
  2,
)}

请根据题目概要，选出最相关的 1~3 个子考点编码（id）。
返回 JSON 格式：{ "subtopicCodes": ["id1", "id2"] }`;

        try {
          const response = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
          });
          const resJson = JSON.parse(response.choices[0].message.content);
          q.subtopicCodes = resJson.subtopicCodes || [];
          console.log(
            `Updated ${q.businessCode} subtopicCodes:`,
            q.subtopicCodes,
          );
          changed = true;
        } catch (err) {
          console.error(
            `Failed to infer subtopics for ${q.businessCode}:`,
            err.message,
          );
        }
      }
    }

    if (changed) {
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
      console.log(`Saved Chapter ${ch} JSON`);
    }
  }
}

processUpdates();
