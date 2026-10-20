const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

const topicsList = `
[
  { "id": "phy_1_1_1", "title": "(1)運動の表し方", "content": "位置,変位,速度,加速度,相対運動,落体の運動,水平投射,斜方投射" },
  { "id": "phy_1_1_2", "title": "(2)さまざまな力", "content": "力,重力,摩擦力,抗力,張力,弾性力,液体や気体から受ける力" },
  { "id": "phy_1_1_3", "title": "(3)力のつり合い", "content": "力の合成･分解,力のつり合い" },
  { "id": "phy_1_1_4", "title": "(4)剛体にはたらく力のつり合い", "content": "力のモーメント,合力,偶力,剛体のつり合い,重心" },
  { "id": "phy_1_1_5", "title": "(5)運動の法則", "content": "ニュートンの運動の3法則,力の単位,運動方程式,単位系と次元" },
  { "id": "phy_1_1_6", "title": "(6)摩擦や空気の抵抗を受ける運動", "content": "静止摩擦力,動摩擦力,空気の抵抗,終端速度" },
  { "id": "phy_1_2_1", "title": "(1)仕事と運動エネルギー", "content": "仕事の原理,仕事率,運動エネルギー" },
  { "id": "phy_1_2_2", "title": "(2)位置エネルギー", "content": "重力による位置エネルギー,弾性力による位置エネルギー" },
  { "id": "phy_1_2_3", "title": "(3)力学的エネルギーの保存", "content": "力学的エネルギーの保存,保存力と非保存力" },
  { "id": "phy_1_3_1", "title": "(1)運動量と力積", "content": "運動量と力積の関係" },
  { "id": "phy_1_3_2", "title": "(2)運動量保存の法則", "content": "運動量保存の法則,分裂,合体" },
  { "id": "phy_1_3_3", "title": "(3)衝突", "content": "反発係数(はねかえり係数),弾性衝突,非弾性衝突" }
]
`;

function shuffleOptions(q) {
  if (!q.options || q.options.length === 0 || q.correctIndex === undefined) return;
  const opts = q.options.map((opt, idx) => ({ text: opt, isCorrect: idx === q.correctIndex }));
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  q.options = opts.map(o => o.text);
  q.correctIndex = opts.findIndex(o => o.isCorrect);
}

async function classifyBatch(questions) {
  const prompt = `你是一个 EJU 物理题目分类专家。
请根据以下给定的 EJU 物理题目（题干），从大纲 Topics 中找出与题干最关联的 content，返回其对应的 id 作为 topicCode。

【大纲 Topics 参考】
${topicsList}

【待分类题目】
${questions.map((q, i) => `[ID: ${i}] 题干: ${q.stem.substring(0, 500)}`).join('\n\n')}

请返回一个 JSON 对象，必须包含 "results" 数组，格式如下：
{
  "results": [
    { "id": 0, "topicCode": "phy_1_x_x" },
    ...
  ]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });
    return JSON.parse(response.choices[0].message.content).results;
  } catch (err) {
    console.error('Classification error:', err.message);
    return null;
  }
}

async function processChapter(chapterNum) {
  console.log(`\n=== Processing Chapter ${chapterNum} ===`);
  const dir = path.join(process.cwd(), `docs/0 数据准备/Charpter 1-30/charpter${chapterNum}`);
  const jsonPath = path.join(dir, `phy_1_chapter${chapterNum}_questions.json`);
  const previewPath = path.join(dir, `phy_1_chapter${chapterNum}_questions_preview.md`);
  
  if (!fs.existsSync(jsonPath)) {
    console.log(`Skip Chapter ${chapterNum}, file not found.`);
    return;
  }
  
  let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  // 1. Shuffle options
  data.forEach(q => shuffleOptions(q));
  
  // 2. Batch classify topicCode
  const BATCH_SIZE = 10;
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    console.log(`  Classifying ${i + 1} to ${i + batch.length} of ${data.length}...`);
    const results = await classifyBatch(batch);
    if (results) {
      results.forEach(res => {
        if (data[i + res.id]) {
          data[i + res.id].topicCode = res.topicCode;
        }
      });
    }
  }
  
  // 3. Save JSON
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Saved updated JSON for Chapter ${chapterNum}`);
  
  // 4. Generate Preview
  let previewMd = `# phy_1 Chapter ${chapterNum} 题目预览\n\n总题数: ${data.length}\n\n`;
  for (const q of data) {
    previewMd += `## [难度 ${q.difficultyLevel}] ${q.businessCode} (选项数: ${q.options ? q.options.length : 0})\n\n`;
    previewMd += `**考点**: ${q.topicCode} | ${q.subtopicCodes ? q.subtopicCodes.join(', ') : '未标注'}\n\n`;
    previewMd += `**题干**:\n${q.stem}\n\n`;
    previewMd += `**选项**:\n`;
    if (q.options) {
      q.options.forEach((opt, idx) => {
        previewMd += `${idx === q.correctIndex ? '✅' : '❌'} ${idx}. ${opt}\n`;
      });
    }
    previewMd += `\n**解析**:\n${q.explanation}\n\n---\n\n`;
  }
  fs.writeFileSync(previewPath, previewMd, 'utf8');
  console.log(`Preview updated: ${previewPath}`);
}

async function run() {
  for (let ch = 2; ch <= 7; ch++) {
    await processChapter(ch);
  }
  console.log('All done!');
}

run();
