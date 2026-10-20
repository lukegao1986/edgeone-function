const fs = require('fs');
const path = require('path');

const jsonFile = path.join(__dirname, 'docs/0 数据准备/Charpter 1-30/charpter3/phy_1_chapter3_questions.json');
const previewFile = path.join(__dirname, 'docs/0 数据准备/Charpter 1-30/charpter3/phy_1_chapter3_questions_preview.md');

function fixExplanation() {
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  const q = data.find(q => q.businessCode === 'phy-03-qA4');
  if (q) {
    q.explanation = `【参考答案】: (1) $\\frac{3mg}{k}$ ; (2) $\\frac{5mg}{2k}$

【详细解析】: 
(ア) 图1中，下方的弹簧连接一个质量为 $m$ 的小球，受重力 $mg$，伸长 $x_1 = \\frac{mg}{k}$。上方的弹簧连接两个小球（总质量 $2m$），受拉力 $2mg$（下方小球重力+上方小球重力），伸长 $x_2 = \\frac{2mg}{k}$。总伸长 $x_1 + x_2 = \\frac{mg}{k} + \\frac{2mg}{k} = \\frac{3mg}{k}$。所以全长为 $2l + \\frac{3mg}{k}$。

(イ) 图2中，下方的弹簧连接一个质量为 $m$ 的小球，伸长 $x_2 = \\frac{mg}{k}$。上方两根弹簧并联，它们共同悬挂一个轻棒。我们分析轻棒的受力：棒受上方两根弹簧的拉力 $2F$（向上），下方弹簧的拉力 $kx_2 = mg$（向下），以及悬挂在棒两端的两个小球的重力 $2mg$（向下）。由受力平衡可知：$2F = 2mg + mg = 3mg$，所以每根弹簧的拉力 $F = \\frac{3mg}{2}$，每根弹簧伸长 $x_2' = \\frac{F}{k} = \\frac{3mg}{2k}$。所以总伸长为 $x_2 + x_2' = \\frac{mg}{k} + \\frac{3mg}{2k} = \\frac{5mg}{2k}$。`;
    fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2), 'utf8');
    
    let previewMd = `# phy_1 Chapter 3 题目预览\n\n总题数: ${data.length}\n\n`;
    for (const q of data) {
      previewMd += `## [难度 ${q.difficultyLevel}] ${q.businessCode} (选项数: ${q.options.length})\n\n`;
      previewMd += `**考点**: ${q.topicCode} | ${q.subtopicCodes ? q.subtopicCodes.join(', ') : '未标注'}\n\n`;
      previewMd += `**题干**:\n${q.stem}\n\n`;
      previewMd += `**选项**:\n`;
      q.options.forEach((opt, idx) => {
        previewMd += `${idx === q.correctIndex ? '✅' : '❌'} ${idx}. ${opt}\n`;
      });
      previewMd += `\n**解析**:\n${q.explanation}\n\n---\n\n`;
    }
    fs.writeFileSync(previewFile, previewMd, 'utf8');
    console.log('Fixed explanation for phy-03-qA4');
  }
}

fixExplanation();