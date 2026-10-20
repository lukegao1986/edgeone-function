const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

async function main() {
  const jsonPath = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30/charpter17/phy_3_chapter17_questions.json");
  let data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  
  // 1. 过滤掉 junk
  data = data.filter(q => !q.stem.includes("上位科目「物理」の内容を含む問題"));
  
  // 2. 重新排列 A 类型的 businessCode
  let aCount = 1;
  for (let q of data) {
    if (q.businessCode.includes("-qA")) {
      q.businessCode = `phy-17-qA${aCount++}`;
    }
  }
  
  const qSrc = `314 気柱の振動 ■ 次の文章中の□に当てはまる数値を有効数字3桁で答えよ。 

図のように，円筒形のガラス管を空気中で鉛直に立て，その中に水を入れる。ガラス管の底と水だめはゴム管によりつながれており，水だめを上下することにより管内の水位を調整できる。いま，管口近くにスピーカーを置き，振動数が450Hzの音を出し続ける。 

この状態で管内の水面を管口近くまで上げ、そこから水面を徐々に下げていくと、管口から水面までの距離が17.0cmのときに音が最も大きく聞こえ、距離が55.0cmのときに再び音が最も大きく聞こえた。このとき、スピーカーから出ている音の波長はアcm, 音の速さはイm/sである。 

![image](https://shuati-images-1317494834.cos.ap-shanghai.myqcloud.com/mineru-images/4a35924a6bddc2d82a81305ebf238f0b5e7cf954c94c910caf2deeea7cb642c6.jpg)

ここで、管口から水面までの距離を 55.0cm に固定する。このと き，管内の空気の密度が時間的に変化しないのは管口からウcmの位置である。また水面の位置をそのままにして，スピーカーから出る音の振動数を450Hzから徐々に大きくすると，次に音が最も大きく聞こえるのは，振動数がエHzのときである。ただし，開口端補正は音の振動数によらず一定とする。 [18 千葉工大]`;

  const aSrc = `314 

## -↓ここがポイント

気柱共鳴の実験では，ガラス管内の空気柱がスピーカーの音に共鳴したときに大きな音が聞こえる。管口に最も近い共鳴点から水面を下げていくと，半波長の整数倍だけ下の位置でも共鳴する。この水面の差から波長が求められる。管口から少し外に出たところが定在波の腹になっている（開口端補正）ことに注意すること。 

解答 (ア) 音が最も大きく聞こえるとき, ガラス管内には図 a のような定在波ができている。音の波長を $\\lambda$ とすると, 定在波の節と節の間隔は半波長 $\\frac{\\lambda}{2}$ であるから, 図 a より 

$$
\\frac {\\lambda}{2} = 5 5. 0 - 1 7. 0 = 3 8. 0 \\mathrm{cm}
$$

![](https://shuati-images-1317494834.cos.ap-shanghai.myqcloud.com/mineru-images/7532ac3e3b2d3e219cd0642cb1f1a075e01b95e5b155f64f9474908931fa1bc4.jpg)

图 a

$$
\\text { よって } \\quad \\lambda = 2 \\times 3 8. 0 = 7 6. 0 \\mathrm{cm}
$$

(イ) 音の速さを V とすると, $V=f\\lambda$ より 
$$
V = 4 5 0 \\times ( 7 6. 0 \\times 1 0 ^ { - 2 } ) = 3 4 2 \\mathrm{m/s}
$$

(ウ) 密度が時間的に変化しないのは, 定在波の腹の位置である。
開口端補正を $\\Delta l$ とすると, 図 a より $\\frac{\\lambda}{4} = 17.0 + \\Delta l$
$$
\\Delta l = \\frac{76.0}{4} - 17.0 = 2.0 \\mathrm{cm}
$$
管口から腹の位置までの距離は, $\\Delta l$, $\\frac{\\lambda}{2} - \\Delta l$, $\\lambda - \\Delta l \\dots$ である。
腹の位置は管口から上方に $2.0 \\mathrm{cm}$ の位置と，下方に $38.0 - 2.0 = 36.0 \\mathrm{cm}$ の位置である。管内の位置は $36.0 \\mathrm{cm}$ となる。

(エ) 水面の位置を 55.0cm に固定して振動数を大きくしていくと, 次の共鳴では定在波の波長が短くなり，図 b のように節が 1 つ増える。
このときの波長を $\\lambda'$ とすると, 図 b より 
$$
\\frac{3}{4}\\lambda' = 55.0 + 2.0 = 57.0 \\mathrm{cm}
$$
よって $\\lambda' = 76.0 \\mathrm{cm}$
振動数 $f'$ は, $V = f'\\lambda'$ より
$$
f' = \\frac{V}{\\lambda'} = \\frac{342}{76.0 \\times 10^{-2}} = 450 \\times \\frac{3}{2} = 675 \\mathrm{Hz}
$$`;

  const prompt = `你是一个 EJU（日本留学試験）物理题库编辑专家。
请将以下给定的【题目块】转换为标准 JSON 题库格式。

【全局配置】
- 目标章节：phy_17
- 属于 波 这一章，请匹配合适的 topicCode 和 subtopicCodes（如 phy_3_3_1 或其他相关）。

【待处理题目（共 1 题）】
【题目块 1，难度类型: A】
${qSrc}

【整章解析参考】
${aSrc}

【JSON 字段说明与规则】
请返回一个 JSON 对象，必须包含一个 \`questions\` 数组字段。数组中的每个对象包含以下字段：
- businessCode (string): 暂填 "phy-17-qA5"
- topicCode (string): 根据题干和 Syllabus 动态匹配最合适的考点。绝对不能为空！
- questionType (int): 固定为 1
- difficultyLevel (int): A=3
- score (int): 5
- stem (string): 题干原文，保留日文原文。所有的 LaTeX 公式必须严格使用 $ ... $（行内公式）或 $$ ... $$（行间公式）包裹。保留原图 URL。
- options (string[]): 选项数组。
  - **选项数量规则（2N+2）**：题干中有 ア, イ, ウ, エ 4个空，所以相当于 N=4。选项数应为 2(4)+2 = 10。
  - **内容规则**：每个选项必须是一个组合（如：ア: 76.0, イ: 342, ウ: 36.0, エ: 675）。所有选项必须互异。选项绝对不能包含 干扰项 等字眼！
- correctIndex (int): 正确答案的索引。请务必在生成干扰项后通过洗牌算法随机分布正确答案的位置。
- explanation (string): 格式："【参考答案】: {正确选项}\\n\\n【详细解析】: {详细过程}"。解析尽量使用中文。公式必须使用 $ ... $ 或 $$ ... $$。
- subtopicCodes (string[]): 挑选 1-3 个最相关的分考点代码。

请返回符合要求的 JSON 格式。`;

  console.log("Generating for question 314...");
  const res = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: "You are a strict JSON output assistant. Output ONLY valid JSON array." },
      { role: "user", content: prompt }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }
  });
  
  const content = res.choices[0].message.content;
  const parsed = JSON.parse(content);
  const q = parsed.questions[0];
  
  // 修正 LaTeX
  const replaceLatex = (text) => {
    if (!text) return text;
    let fixedText = text.replace(/\\\\\\\[/g, '$$$$').replace(/\\\\\\\]/g, '$$$$');
    fixedText = fixedText.replace(/\\\\\(/g, '$').replace(/\\\\\)/g, '$');
    fixedText = fixedText.replace(/\\\[/g, '$$$$').replace(/\\\]/g, '$$$$');
    fixedText = fixedText.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
    return fixedText;
  };
  q.stem = replaceLatex(q.stem);
  q.options = q.options.map(replaceLatex);
  q.explanation = replaceLatex(q.explanation);
  
  // 插入到数组的倒数第二个（即 315 前面）
  const lastQ = data.pop(); // 取出 315
  lastQ.businessCode = "phy-17-qA6"; // 更新 315 的 businessCode
  
  data.push(q);     // 放入 314
  data.push(lastQ); // 放入 315
  
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
  console.log(`Successfully fixed and updated JSON. Total questions: ${data.length}`);
  
  // Regenerate preview
  let previewMd = `# phy_3 Chapter 17 题目预览\n\n总题数: ${data.length}\n\n`;
  for (const qItem of data) {
    previewMd += `## [难度 ${qItem.difficultyLevel}] ${qItem.businessCode} (选项数: ${qItem.options ? qItem.options.length : 0})\n\n`;
    previewMd += `**考点**: ${qItem.topicCode} | ${qItem.subtopicCodes ? qItem.subtopicCodes.join(", ") : "未标注"}\n\n`;
    previewMd += `**题干**:\n${qItem.stem}\n\n`;
    previewMd += `**选项**:\n`;
    if (qItem.options) {
      qItem.options.forEach((opt, idx) => {
        previewMd += `${idx === qItem.correctIndex ? "✅" : "❌"} ${idx}. ${opt}\n`;
      });
    }
    previewMd += `\n**解析**:\n${qItem.explanation}\n\n---\n\n`;
  }
  const previewPath = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30/charpter17/phy_3_chapter17_questions_preview.md");
  fs.writeFileSync(previewPath, previewMd, "utf8");
  console.log("Preview MD updated.");
}

main().catch(console.error);
