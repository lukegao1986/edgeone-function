const fs = require("fs");
const path = require("path");

const chapters = [3, 4, 5];
let totalJsonFixed = 0;
let totalMdFixed = 0;

for (const ch of chapters) {
  console.log(`\n--- 处理 Chapter ${ch} ---`);
  const jsonPath = path.join(
    process.cwd(),
    `docs/0 数据准备/Charpter 1-30/charpter${ch}/phy_1_chapter${ch}_questions.json`,
  );
  const mdPath = path.join(
    process.cwd(),
    `docs/0 数据准备/Charpter 1-30/charpter${ch}/phy_1_chapter${ch}_questions_preview.md`,
  );

  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    console.error(`Missing files for chapter ${ch}`);
    continue;
  }

  let questions = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  let mdContent = fs.readFileSync(mdPath, "utf8");
  let jsonChangedCount = 0;
  let mdChangedCount = 0;

  for (let q of questions) {
    if (q.subtopicCodes && q.subtopicCodes.length > 0) {
      // 提取第一个 subtopicCode 的前 9 位作为正确的 topicCode
      const expectedTopicCode = q.subtopicCodes[0].substring(0, 9);

      if (q.topicCode !== expectedTopicCode) {
        console.log(
          `[${q.businessCode}] topicCode 纠正: ${q.topicCode} -> ${expectedTopicCode}`,
        );
        const oldTopicCode = q.topicCode;

        // 1. 修复 JSON
        q.topicCode = expectedTopicCode;
        jsonChangedCount++;

        // 2. 修复 Markdown
        // Markdown 中的考点格式通常是: **考点**: oldTopicCode | ...
        // 但为了安全起见，只替换该 businessCode 下的考点行

        // 查找类似 `## [难度 1] phy-03-qC1 ... \n\n**考点**: phy_1_1_2 | ...`
        // 我们使用正则表达式精准匹配该 businessCode 的块
        const escapeRegex = (string) =>
          string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const blockPattern = new RegExp(
          `(phy-${ch < 10 ? "0" + ch : ch}-q[A-Z]\\d+[\\s\\S]*?\\*\\*考点\\*\\*:\\s*)${escapeRegex(oldTopicCode)}`,
          "g",
        );

        if (blockPattern.test(mdContent)) {
          mdContent = mdContent.replace(blockPattern, `$1${expectedTopicCode}`);
          mdChangedCount++;
        } else {
          console.warn(
            `[${q.businessCode}] 警告: 在 Markdown 中未找到匹配的旧 topicCode (${oldTopicCode})`,
          );
          // 尝试更宽松的替换，仅针对此文件的全部 oldTopicCode？不，可能误伤。
          // 其实 markdown 里可能是直接的 topicCode，如果找不到，手动找找
        }
      }
    }
  }

  // 保存 JSON
  fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2), "utf8");
  console.log(`Chapter ${ch}: JSON 修复了 ${jsonChangedCount} 个 topicCode.`);
  totalJsonFixed += jsonChangedCount;

  // 保存 Markdown
  fs.writeFileSync(mdPath, mdContent, "utf8");
  console.log(`Chapter ${ch}: Markdown 修复了 ${mdChangedCount} 个 topicCode.`);
  totalMdFixed += mdChangedCount;
}

console.log(
  `\n🎉 全部修复完成！共修复 JSON: ${totalJsonFixed} 处，Markdown: ${totalMdFixed} 处。`,
);
