const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const OpenAI = require("openai");
require("dotenv").config();

const chapterNum = process.argv[2];
if (!chapterNum) {
  console.error("请提供章节号，例如: node 3_generate_json.js 2");
  process.exit(1);
}

// 动态映射 Syllabus
function getPhyChapterId(num) {
  const n = parseInt(num, 10);
  if (n >= 1 && n <= 10) return "phy_1";
  if (n >= 11 && n <= 13) return "phy_2";
  if (n >= 14 && n <= 20) return "phy_3";
  if (n >= 21 && n <= 27) return "phy_4";
  if (n >= 28 && n <= 30) return "phy_5";
  return "phy_1";
}

const phyX = getPhyChapterId(chapterNum);
const CH_PADDED = chapterNum.toString().padStart(2, "0");

const IN_DIR = `docs/0 数据准备/Charpter 1-30/charpter${chapterNum}`;
const QUEST_FILE = path.join(
  process.cwd(),
  IN_DIR,
  `charpter${chapterNum}_题目.md`,
);
const ANS_FILE = path.join(
  process.cwd(),
  IN_DIR,
  `charpter${chapterNum}_解析.md`,
);
const OUT_JSON = path.join(
  process.cwd(),
  IN_DIR,
  `${phyX}_chapter${chapterNum}_questions.json`,
);
const OUT_PREVIEW = path.join(
  process.cwd(),
  IN_DIR,
  `${phyX}_chapter${chapterNum}_questions_preview.md`,
);

if (!fs.existsSync(QUEST_FILE) || !fs.existsSync(ANS_FILE)) {
  console.error(`题目或解析文件不存在: ${QUEST_FILE}`);
  process.exit(1);
}

const qSrc = fs.readFileSync(QUEST_FILE, "utf8");
const aSrc = fs.readFileSync(ANS_FILE, "utf8");

// 读取 syllabus
let syllabusText = "";
try {
  const syllabusPath = path.join(process.cwd(), "src/data/ejuSyllabus.ts");
  const syllabusRaw = fs.readFileSync(syllabusPath, "utf8");
  // 粗略提取目标 phy_X 的内容作为上下文
  const regex = new RegExp(
    `"id":\\s*"${phyX}"[\\s\\S]*?(?="id":\\s*"phy_\\d+"|$)`,
  );
  const match = syllabusRaw.match(regex);
  if (match) {
    syllabusText = match[0];
  } else {
    syllabusText = "未能提取到 Syllabus 内容，请根据物理常识判断。";
  }
} catch (e) {
  console.warn("警告：无法读取 ejuSyllabus.ts", e.message);
}

// 提取题目
const questionsList = []; // { type: 'C'|'E'|'B'|'A', text: string }
let currentType = "C"; // 默认 C
const lines = qSrc.split("\n");
let buffer = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (/^##\s*基礎CHECK/.test(line)) {
    currentType = "C";
    continue;
  }
  if (/^##\s*例題/.test(line)) {
    if (buffer.length > 0 && buffer.join("").trim()) {
      questionsList.push({ type: currentType, text: buffer.join("\n").trim() });
      buffer = [];
    }
    currentType = "E";
    buffer.push(line); // 例题标题也算入题目中
    continue;
  }
  if (/^##\s*基本問題/.test(line)) {
    if (buffer.length > 0 && buffer.join("").trim()) {
      questionsList.push({ type: currentType, text: buffer.join("\n").trim() });
      buffer = [];
    }
    currentType = "B";
    continue;
  }
  if (/^##\s*応用問題/.test(line)) {
    if (buffer.length > 0 && buffer.join("").trim()) {
      questionsList.push({ type: currentType, text: buffer.join("\n").trim() });
      buffer = [];
    }
    currentType = "A";
    continue;
  }

  // 判断新题目的开始 (### Qn, 或数字开头)
  if (currentType === "C" && /^###\s*Q\d+/.test(line)) {
    if (buffer.length > 0 && buffer.join("").trim()) {
      questionsList.push({ type: currentType, text: buffer.join("\n").trim() });
      buffer = [];
    }
    buffer.push(line);
  } else if (
    (currentType === "B" || currentType === "A") &&
    /^[✿◆]?\s*(\d{1,3})\s+\S/.test(line)
  ) {
    if (buffer.length > 0 && buffer.join("").trim()) {
      questionsList.push({ type: currentType, text: buffer.join("\n").trim() });
      buffer = [];
    }
    buffer.push(line);
  } else {
    // 例题是通过下一个 例題 或 基本問題 分割的
    buffer.push(line);
  }
}
if (buffer.length > 0 && buffer.join("").trim()) {
  questionsList.push({ type: currentType, text: buffer.join("\n").trim() });
}

// 过滤掉只有 # 第X章 之类无意义的 chunk
const validQuestions = questionsList.filter(
  (q) => q.text.length > 10 && !/^#\s*第\d+章\s*$/.test(q.text.trim()),
);

console.log(`共解析出 ${validQuestions.length} 道题目块`);

const dbConfig = {
  host: "sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com",
  port: 24547,
  user: "root",
  password: "2199wlmm!",
  database: "shuati_db",
};

async function getMaxIndices() {
  let startIndices = { C: 1, E: 1, B: 1, A: 1 };
  try {
    const pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query(
      `SELECT business_code FROM questions WHERE business_code LIKE ?`,
      [`phy-${CH_PADDED}-q%`],
    );
    function maxNum(prefix) {
      let mx = 0;
      const re = new RegExp(`^phy-${CH_PADDED}-${prefix}(\\d+)$`);
      for (const r of rows) {
        const m = re.exec(r.business_code);
        if (m) mx = Math.max(mx, +m[1]);
      }
      return mx;
    }
    startIndices = {
      C: maxNum("qC") + 1,
      E: maxNum("qE") + 1,
      B: maxNum("qB") + 1,
      A: maxNum("qA") + 1,
    };
    await pool.end();
  } catch (e) {
    console.warn("数据库查重失败，默认从 1 开始:", e.message);
  }
  return startIndices;
}

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

async function generateBatch(questionsBatch, startIndexMap) {
  const questionsText = questionsBatch
    .map((q, i) => `【题目块 ${i + 1}，难度类型: ${q.type}】\n${q.text}\n`)
    .join("\n---\n");

  const prompt = `你是一个 EJU（日本留学試験）物理题库编辑专家。
请将以下给定的【题目块】转换为标准 JSON 题库格式。

【全局配置】
- 目标章节：phy_${CH_PADDED}
- Syllabus 考点范围参考：
${syllabusText.slice(0, 3000)} // 截断部分以防过长

【待处理题目（共 ${questionsBatch.length} 题）】
${questionsText}

【整章解析参考（请从中自行匹配提取详细解析）】
${aSrc}

【JSON 字段说明与规则】
请返回一个 JSON 对象，必须包含一个 \`questions\` 数组字段。数组中的每个对象包含以下字段：
- businessCode (string): phy-${CH_PADDED}-q{难度首字母}{序号}。请根据传入的【题目块难度类型】（C/E/B/A）分配。
- topicCode (string): 根据题干和 Syllabus 动态匹配最合适的考点。绝对不能为空！
- questionType (int): 固定为 1
- difficultyLevel (int): C=1, E=2, B=2, A=3
- score (int): 5
- stem (string): 题干原文，保留日文和 LaTeX $...$。如果有图，保留 ![image](url) 在题干末尾。去除 # 等标题层级符号。
- options (string[]): 【极度重要】选项数量优先严格等于 2N+2（N为小问/填空数）。但是，一旦算出的选项总数超过16个，必须进行熔断，强制将最大选项数限制为16个。多空必须用分号分隔如 "(1) $x$ ; (2) $y$"。所有选项互不相同，数值/公式用 $...$ 包裹。绝对不能有 A: B: 前缀！尽量设置有意义的陷阱选项（如基于易错点、符号错误、漏乘系数等设计的干扰项），严禁简单随机替换数字。
- correctIndex (int): 正确答案的索引（0 到 2N+1）。请务必随机分布，不要全放 0。
- explanation (string): 格式："【参考答案】: {正确选项}\\n\\n【详细解析】: {详细过程}"。解析尽量使用中文（重点专用名词可保留日文），保留公式 $...$ 和原图 URL ![image](url)。必须剔除解析中的废话（如自我纠错、"这道题不难"等），严格保持专业、简洁。如果判断某段内容为纯知识点而非题目，请主动丢弃不生成。
- subtopicCodes (string[]): 挑选 1-3 个最相关的分考点代码。

请仔细匹配【题目块】与【整章解析参考】中的解答内容，生成完整无误的 JSON 数组。
`;

  let retry = 0;
  while (retry < 3) {
    try {
      const response = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are a strict JSON output assistant. Output ONLY valid JSON array.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      const result = parsed.questions || [];

      // 分配 businessCode 并打乱 correctIndex (二次保障)
      const validResult = [];
      for (let i = 0; i < result.length; i++) {
        if (!questionsBatch[i]) {
          console.warn(
            `[Warning] LLM 返回了多余的题目，忽略第 ${i + 1} 个结果`,
          );
          continue;
        }
        const q = result[i];
        const type = questionsBatch[i].type;
        q.businessCode = `phy-${CH_PADDED}-q${type}${startIndexMap[type]++}`;
        q.difficultyLevel = type === "C" ? 1 : type === "A" ? 3 : 2;
        q.questionType = 1;
        q.score = 5;
        if (q.topicCode && typeof q.topicCode === "string") {
          q.topicCode = q.topicCode.substring(0, 9);
        }
        validResult.push(q);
      }

      if (validResult.length < questionsBatch.length) {
        console.warn(
          `[Warning] LLM 返回的题目数 (${validResult.length}) 少于请求数 (${questionsBatch.length})`,
        );
      }

      return validResult;
    } catch (err) {
      retry++;
      console.log(`[Batch Retry ${retry}] failed: ${err.message}`);
    }
  }
  return [];
}

async function main() {
  console.log(`准备处理 Chapter ${chapterNum} ...`);
  const startIndexMap = await getMaxIndices();

  let allResults = [];
  if (fs.existsSync(OUT_JSON)) {
    allResults = JSON.parse(fs.readFileSync(OUT_JSON, "utf8"));
    for (const q of allResults) {
      const match = q.businessCode.match(/^phy-\d+-q([CEBA])(\d+)$/);
      if (match) {
        const type = match[1];
        const num = parseInt(match[2], 10);
        if (num >= startIndexMap[type]) {
          startIndexMap[type] = num + 1;
        }
      }
    }
  }

  console.log("起始序号:", startIndexMap);

  const BATCH_SIZE = 1;

  for (let i = 25; i < validQuestions.length; i += BATCH_SIZE) {
    const batch = validQuestions.slice(i, i + BATCH_SIZE);
    console.log(
      `[Progress] Processing ${i + 1} to ${i + batch.length} of ${validQuestions.length} ...`,
    );
    const batchResult = await generateBatch(batch, startIndexMap);
    if (batchResult.length === 0) {
      console.warn(
        `[Warning] Batch ${i + 1}-${i + batch.length} 生成失败，请后续手动重试`,
      );
    }
    allResults.push(...batchResult);
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(allResults, null, 2), "utf8");
  console.log(`[Done] 已生成 ${allResults.length} 道题，写入 ${OUT_JSON}`);

  // 生成 Preview MD
  let previewMd = `# ${phyX} Chapter ${chapterNum} 题目预览\n\n总题数: ${allResults.length}\n\n`;
  for (const q of allResults) {
    previewMd += `## [难度 ${q.difficultyLevel}] ${q.businessCode} (选项数: ${q.options ? q.options.length : 0})\n\n`;
    previewMd += `**考点**: ${q.topicCode} | ${q.subtopicCodes ? q.subtopicCodes.join(", ") : "未标注"}\n\n`;
    previewMd += `**题干**:\n${q.stem}\n\n`;
    previewMd += `**选项**:\n`;
    if (q.options) {
      q.options.forEach((opt, idx) => {
        previewMd += `${idx === q.correctIndex ? "✅" : "❌"} ${idx}. ${opt}\n`;
      });
    }
    previewMd += `\n**解析**:\n${q.explanation}\n\n---\n\n`;
  }
  fs.writeFileSync(OUT_PREVIEW, previewMd, "utf8");
  console.log(`[Done] Preview MD 写入 ${OUT_PREVIEW}`);
}

main();
