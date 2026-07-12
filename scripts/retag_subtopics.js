const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

const syllabusContext = `
【候选考点（Topic）及分考点（Subtopic）参考范围 (chapter_id: phy_1)】
- phy_1_1_1: (1)運動の表し方
  - phy_1_1_1_01: 位置と変位
  - phy_1_1_1_02: 速度と加速度
  - phy_1_1_1_03: 相対運動
  - phy_1_1_1_04: 落体の運動
  - phy_1_1_1_05: 水平投射
  - phy_1_1_1_06: 斜方投射
- phy_1_1_2: (2)さまざまな力
  - phy_1_1_2_01: 重力・摩擦力・抗力・張力・弾性力
  - phy_1_1_2_02: 液体や気体から受ける力
- phy_1_1_3: (3)力のつり合い
  - phy_1_1_3_01: 力の合成・分解
  - phy_1_1_3_02: 力のつり合い
- phy_1_1_4: (4)剛体にはたらく力のつり合い
  - phy_1_1_4_01: 剛体のつり合い
- phy_1_1_5: (5)運動の法則
  - phy_1_1_5_01: ニュートンの運動法則と運動方程式
- phy_1_1_6: (6)摩擦や空気の抵抗を受ける運動
  - phy_1_1_6_01: 摩擦力と抵抗
`;

async function retagFile(filePath) {
  console.log(`\n🚀 处理文件: ${path.basename(filePath)}`);
  const content = fs.readFileSync(filePath, 'utf8');
  let questions = JSON.parse(content);

  const prompt = `你是一个 EJU（日本留学試験）物理题库编辑专家。
我有一批物理题目，需要你根据提供的考纲（Syllabus）为每道题重新标注 \`subtopicCodes\`。

【考纲范围】
${syllabusContext}

【标注规则】
1. 阅读每道题的 \`stem\`（题干）和 \`explanation\`（解析）。
2. 从考纲中挑选出最相关、最核心的 1~3 个 \`subtopicCodes\`（注意是末级的 code，如 phy_1_1_3_02）。
3. 如果题目涉及力的合成/分解，标注 phy_1_1_3_01；如果明确涉及力的平衡（つり合い），标注 phy_1_1_3_02。可以同时标注。

【输入题目数据】
${JSON.stringify(questions.map(q => ({ businessCode: q.businessCode, topicCode: q.topicCode, stem: q.stem, explanation: q.explanation })), null, 2)}

【输出格式】
请返回一个 JSON 对象，键为 \`businessCode\`，值为 \`subtopicCodes\` 的字符串数组。
例如：
{
  "phy-03-qC1": ["phy_1_1_2_01", "phy_1_1_3_02"],
  "phy-03-qC2": ["phy_1_1_2_01"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Please response strictly in JSON format.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // 更新原数据
    let changedCount = 0;
    for (const q of questions) {
      if (result[q.businessCode]) {
        const oldTags = q.subtopicCodes ? q.subtopicCodes.join(',') : '无';
        const newTags = result[q.businessCode].join(',');
        q.subtopicCodes = result[q.businessCode];
        console.log(`  - [${q.businessCode}] 更新: [${oldTags}] -> [${newTags}]`);
        changedCount++;
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`✅ 文件保存成功！更新了 ${changedCount} 道题目的标签。`);
  } catch (error) {
    console.error(`❌ 处理失败:`, error);
  }
}

async function main() {
  const dir = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter3_MD');
  const files = [
    'phy_1_questions_part1.json',
    'phy_1_questions_part2.json',
    'phy_1_questions_part3.json',
    'phy_1_questions_part4.json',
    'phy_1_questions_part5.json'
  ];

  for (const file of files) {
    await retagFile(path.join(dir, file));
  }
  
  console.log('\n🎉 所有文件处理完成！');
}

main();
