const fs = require('fs');
const path = require('path');
const chapters = [21, 22, 23, 24, 25, 26, 27, 28, 29];

for (const ch of chapters) {
  const prefix = (ch >= 28) ? 'phy_5' : 'phy_4';
  const jsonPath = path.join(process.cwd(), `docs/0 数据准备/Charpter 1-30/charpter${ch}/${prefix}_chapter${ch}_questions.json`);
  if (!fs.existsSync(jsonPath)) continue;
  
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let previewMd = `# ${prefix} Chapter ${ch} 题目预览\n\n总题数: ${data.length}\n\n`;
  
  for (const qItem of data) {
    previewMd += `## [难度 ${qItem.difficultyLevel}] ${qItem.businessCode} (选项数: ${qItem.options ? qItem.options.length : 0})\n\n`;
    previewMd += `**考点**: ${qItem.topicCode} | ${qItem.subtopicCodes ? qItem.subtopicCodes.join(', ') : '未标注'}\n\n`;
    previewMd += `**题干**:\n${qItem.stem}\n\n`;
    previewMd += `**选项**:\n`;
    if (qItem.options) {
      qItem.options.forEach((opt, idx) => {
        previewMd += `${idx === qItem.correctIndex ? '✅' : '❌'} ${idx}. ${opt}\n`;
      });
    }
    previewMd += `\n**解析**:\n${qItem.explanation}\n\n---\n\n`;
  }
  
  const previewPath = path.join(process.cwd(), `docs/0 数据准备/Charpter 1-30/charpter${ch}/${prefix}_chapter${ch}_questions_preview.md`);
  fs.writeFileSync(previewPath, previewMd, 'utf8');
  console.log(`Regenerated preview for Chapter ${ch}`);
}