const fs = require("fs");
const path = require("path");

const chapters = [2, 3, 4, 5, 6, 7];
let totalFixedJson = 0;
let totalFixedMd = 0;

for (const ch of chapters) {
  console.log(`\n--- 检查并同步 Chapter ${ch} ---`);
  const jsonPath = path.join(
    process.cwd(),
    `docs/0 数据准备/Charpter 1-30/charpter${ch}/phy_1_chapter${ch}_questions.json`,
  );
  const mdPath = path.join(
    process.cwd(),
    `docs/0 数据准备/Charpter 1-30/charpter${ch}/phy_1_chapter${ch}_questions_preview.md`,
  );

  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    console.error(`缺少文件 Chapter ${ch}`);
    continue;
  }

  let questions = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  let jsonChanged = false;

  // 注释掉强制覆盖，因为现在 JSON 已经被 write_back_json 更新好了
  /*
  for (let q of questions) {
    if (q.subtopicCodes && q.subtopicCodes.length > 0) {
      const expectedTopicCode = q.subtopicCodes[0].substring(0, 9);
      if (q.topicCode !== expectedTopicCode) {
        console.log(
          `[${q.businessCode}] JSON topicCode 修正: ${q.topicCode} -> ${expectedTopicCode}`,
        );
        q.topicCode = expectedTopicCode;
        jsonChanged = true;
        totalFixedJson++;
      }
    }
  }

  if (jsonChanged) {
    fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2), "utf8");
  }
  */

  // 2. 重新生成/同步 Markdown 文件的 `**考点**:` 行
  let mdContent = fs.readFileSync(mdPath, "utf8");

  // 按 `## [难度` 分割
  let blocks = mdContent.split("## [难度");
  let newBlocks = [blocks[0]]; // 第一部分是头部

  for (let i = 1; i < blocks.length; i++) {
    let block = blocks[i];

    // 找出 businessCode，例如 ` 1] phy-03-qC1 (选项数: 6)`
    const match = block.match(/^\s*\d+\]\s*(phy-\d{2}-q[A-Z]\d+)/);
    if (match) {
      const bCode = match[1];
      const q = questions.find((x) => x.businessCode === bCode);
      if (q) {
        let subtopicsStr = "未标注";
        if (Array.isArray(q.subtopicCodes)) {
          subtopicsStr = q.subtopicCodes.join(", ");
        } else if (typeof q.subtopicCodes === "string") {
          subtopicsStr = q.subtopicCodes.replace(/;/g, ", ");
        }
        const expectedLine = `**考点**: ${q.topicCode} | ${subtopicsStr}`;

        // 替换块内的 `**考点**: ...`
        const replacedBlock = block.replace(/\*\*考点\*\*:.*/, expectedLine);
        if (replacedBlock !== block) {
          totalFixedMd++;
        }
        block = replacedBlock;
      }
    }
    newBlocks.push(block);
  }

  const newMdContent = newBlocks.join("## [难度");
  fs.writeFileSync(mdPath, newMdContent, "utf8");
  console.log(`Chapter ${ch} 处理完毕.`);
}

console.log(
  `\n🎉 全部校验同步完成！修复 JSON 遗漏: ${totalFixedJson} 处，同步 Markdown 考点行: ${totalFixedMd} 处。`,
);
