const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

async function main() {
  const jsonPath = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30/charpter24/phy_4_chapter24_questions.json");
  let data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  
  const qSrc = `426 電流計と電圧計の内部抵抗 ■ 未知の抵抗の値を測定するために、未知抵抗に起電力Eの電池と電流計⑨と電圧計⑦をつないで、図1と図2の回路をつくった。未知抵抗の抵抗値をR、⑨の内部抵抗を $r_{A}$ 、⑨の内部抵抗を $r_{V}$ とし、電池の内部抵抗は無視する。

<img src="https://shuati-images-1317494834.cos.ap-shanghai.myqcloud.com/ch24-426.png">

(1) 図1の回路のとき, ⑤が示す電圧 $V_{1}$ と⑨が示す電流 $I_{1}$ の比 $\\frac{V_{1}}{I_{1}}$ として得られる抵抗の測定値 $R_{1}$ を, E, R, $r_{A}$ , $r_{V}$ のうち必要な文字を用いて表せ。

(2) 図 2 の回路のとき, 電圧 $V_{2}$ と電流 $I_{2}$ の比 $\\frac{V_{2}}{I_{2}}$ として得られる抵抗の測定値 $R_{2}$ を, E, R, $r_{A}$ , $r_{V}$ のうち必要な文字を用いて表せ。

(3) どちらも真の測定値を与えないことがわかった。⑨や⑰の内部抵抗値に比べ、未知抵抗の抵抗値が小さいと予想されるとき、どちらの回路で測定したほうがよりよい近似値を与えるか。

(4) 図1の回路では, ⑤は2.20V, ④は20.0mAを示し, 図2の回路では, ⑤は1.98V, ④は22.0mAを示した。 $r_{A}$ , $r_{V}$ , Rを有効数字2桁で求めよ。

427 ダイオードを含む回路 ☑ 図のように，内部抵抗が無視できる起電力 12V の電池 E と，抵抗値がそれぞれ，6.0Ω，6.0Ω，3.0Ω である抵抗 R₁，R₂，R₃ と，抵抗値が 0 ではない抵抗 Rₓ と，ダイオード D からなる回路がある。電位は高いほうを正とし，電流は図に示した矢印の向きを正とする。ダイオードは，順方向に電圧が

![image](https://shuati-images-1317494834.cos.ap-shanghai.myqcloud.com/mineru-images/957721405f9819e1f6b6e8af30740f75b3eaaefe007f2f3149f003bdb4f0cb99.jpg)

加わったとき電流を流し，そのときの抵抗値は0である。また，逆方向の電圧に対してはまったく電流を流さないものとする。なお，解答の数値は有効数字2桁で示せ。

$R_{x}$ の抵抗値が 1.0Ω であったとき,

(1) 点 a を基準とした点 b の電位 V [V] を, 符号も考慮して求めよ。

(2) 電池Eから流れ出る電流 $I_{\\mathrm{E}}[\\mathrm{A}]$ を求めよ。$R_{x}$ の抵抗値が可変であったとき,

(3) $R_{x}$ の抵抗値を $r[\\Omega]$ として, D に電流が流れない r の範囲を示せ。

$R_{x}$ の抵抗値が 12Ω であったとき,

(4) D に流れる電流 $I_{D}[A]$ を求めよ。`;

  const aSrc = `## 426
(1) 図1の回路のとき
$$ \\left| R _ {1} - R \\right| = \\left| \\left(R + r _ {\\mathrm{A}}\\right) - R \\right| = r _ {\\mathrm{A}} $$
(2) 図 2 は, R と $r_{V}$ の並列接続の回路で, 加わる電圧が $V_{2}$ , 流れる電流の和が $I_{2}$ であるから
$$ \\frac {V _ {2}}{R} + \\frac {V _ {2}}{r _ {\\mathrm{V}}} = \\left(\\frac {R + r _ {\\mathrm{V}}}{R r _ {\\mathrm{V}}}\\right) V _ {2} = I _ {2} $$
$$ \\text { よって } \\quad R _ {2} = \\frac {V _ {2}}{I _ {2}} = \\frac {R r _ {\\mathrm{v}}}{R + r _ {\\mathrm{v}}} $$
(3) 抵抗の測定値と真の抵抗値との誤差は
図1の回路のとき
$$ \\left| R _ {1} - R \\right| = r _ {\\mathrm{A}} $$
$r_{A}>R$ の条件より $|R_{1}-R|>R$
図2の回路のとき
$$ \\left| R _ {2} - R \\right| = \\frac {R}{R + r _ {\\mathrm{v}}} R < R $$
誤差の小さい図2の回路のほうがよい近似値を与える。
(4) 図1の回路において $E = V_{1} = 2.20$ 
図2の回路において $E = r_{A} I_{2} + V_{2} = r_{A} \\times (22.0 \\times 10^{-3}) + 1.98$ 
$2.20 = r_{A} \\times (22.0 \\times 10^{-3}) + 1.98$
よって $r_{A} = 10 \\Omega$
また $\\frac{2.20}{20.0 \\times 10^{-3}} = R + r_{A}$ より $R = 1.0 \\times 10^{2} \\Omega$
$\\frac{1.98}{22.0 \\times 10^{-3}} = \\frac{R r_{V}}{R + r_{V}}$ より $r_{V} = 9.0 \\times 10^{2} \\Omega$

## 427
(1) ダイオード D を取り去って考える。このとき $R_{1}$ と $R_{2}$ に流れる電流を $I_{1}[A]$ , $R_{3}$ と $R_{X}$ に流れる電流を $I_{2}[A]$ とすると
$I _ {1} = \\frac {1 2}{6 . 0 + 6 . 0} = 1. 0 \\mathrm{A}$
$I _ {2} = \\frac {1 2}{3 . 0 + 1 . 0} = 3. 0 \\mathrm{A}$
電池Eの負極の電位を基準(0V)として, 点 a, 点 b の電位 $V_{\\mathrm{a}}[\\mathrm{V}]$ , $V_{\\mathrm{b}}[\\mathrm{V}]$ を求める。
$V _ {\mathrm{a}} = 6. 0 \\times 1. 0 = 6. 0 \\mathrm{V}, V _ {\\mathrm{b}} = 1. 0 \\times 3. 0 = 3. 0 \\mathrm{V}$
$V_{a}>V_{b}$ だから, ab 間にダイオード D を入れても D に電流が流れない。点 a を基準とした点 b の電位 V[V] は
$V = V _ {\\mathrm{b}} - V _ {\\mathrm{a}} = 3. 0 - 6. 0 = - 3. 0 \\mathrm{V}$
(2) 図 a は右の図 b のように置きかえることができる。12Ωと4.0Ωの抵抗を並列接続した合成抵抗を R [Ω] とすると
$\\frac {1}{R} = \\frac {1}{1 2} + \\frac {1}{4 . 0} = \\frac {4}{1 2}$
ゆえに $R=\\frac{12}{4}=3.0\\Omega$
よって，オームの法則「 $I=\\frac{V}{R}$ 」より $I_{E}=\\frac{12}{3.0}=4.0A$
(3) 図 a において $R_{X}$ の抵抗値を r[Ω] とすると
$I _ {1} = 1. 0 \\mathrm{A}, I _ {2} = \\frac {1 2}{3 . 0 + r} [ \\mathrm{A} ]$
$V _ {\\mathrm{a}} = 6. 0 \\mathrm{V}, V _ {\\mathrm{b}} = r \\times \\frac {1 2}{3 . 0 + r} = \\frac {1 2 r}{3 . 0 + r} [ \\mathrm{V} ]$
$V_{a} \\geqq V_{b}$ のときは D に電流が流れないので
$6. 0 \\geq \\frac {1 2 r}{3 . 0 + r} \\quad \\text { よって } \\quad 6. 0 r \\leq 1 8$
よって, r の範囲は $r \\leq 3.0 \\Omega$
(4) r=12Ω > 3.0Ω なので電流が流れる。
各抵抗とダイオードDを流れる電流を図cのようにおくと, キルヒホッフの法則Ⅰより
点 a: $I_{3}=I_{1}+I_{D}$
点 b: $I_{4}=I_{2}-I_{D}$
閉回路にキルヒホッフの法則Ⅱを適用し、解くと
$I _ {\\mathrm{D}} = \\frac {2}{3} = 0. 6 6 6 \\dots \\approx 0. 6 7 \\mathrm{A}$`;

  const prompt = `你是一个 EJU（日本留学試験）物理题库编辑专家。
请将以下给定的【题目块】转换为标准 JSON 题库格式。

【全局配置】
- 目标章节：phy_24 (属于 phy_4)
- 属于 電流 这一章，请匹配合适的 topicCode 和 subtopicCodes（如 phy_4_1_1 等）。

【待处理题目（共 2 题，包含 426 和 427）】
【题目块】
\${qSrc}

【解析参考】
\${aSrc}

【JSON 字段说明与规则】
请返回一个 JSON 对象，必须包含一个 \`questions\` 数组字段。数组中的每个对象包含以下字段：
- businessCode (string): 填 "phy-24-qC1" 和 "phy-24-qC2"
- topicCode (string): 根据题干和 Syllabus 动态匹配最合适的考点。绝对不能为空！
- questionType (int): 固定为 1
- difficultyLevel (int): C=1
- score (int): 5
- stem (string): 题干原文，保留日文原文。所有的 LaTeX 公式必须严格使用 $ ... $（行内公式）或 $$ ... $$（行间公式）包裹。保留原图 URL。将题目的问答选项挖空。
- options (string[]): 选项数组。
  - **选项数量规则（2N+2）**：题干中有 N 个小问，选项数应为 2N+2。如果选项总数超过16个，需进行熔断，最高限制为16个。
  - **内容规则**：每个选项必须是一个组合。所有选项必须互异。选项绝对不能包含 干扰项 等字眼！
- correctIndex (int): 正确答案的索引。请务必在生成干扰项后通过洗牌算法随机分布正确答案的位置。
- explanation (string): 格式："【参考答案】: {正确选项}\\n\\n【详细解析】: {详细过程}"。解析尽量使用中文。公式必须使用 $ ... $ 或 $$ ... $$。
- subtopicCodes (string[]): 挑选 1-3 个最相关的分考点代码。

请返回符合要求的 JSON 格式。`;

  console.log("Generating for questions 426 and 427...");
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
  
  // 修正 LaTeX
  const replaceLatex = (text) => {
    if (!text) return text;
    let fixedText = text.replace(/\\\\\\\\/g, '\\\\');
    fixedText = fixedText.replace(/\\\\\\[/g, '$$$$').replace(/\\\\\\]/g, '$$$$');
    fixedText = fixedText.replace(/\\\\\(/g, '$').replace(/\\\\\)/g, '$');
    return fixedText;
  };
  
  parsed.questions.forEach(q => {
    q.stem = replaceLatex(q.stem);
    q.options = q.options.map(replaceLatex);
    q.explanation = replaceLatex(q.explanation);
    data.push(q);
  });
  
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
  console.log(`Successfully fixed and updated JSON. Total questions: ${data.length}`);
  
  // Regenerate preview
  let previewMd = `# phy_4 Chapter 24 题目预览\n\n总题数: ${data.length}\n\n`;
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
  const previewPath = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30/charpter24/phy_4_chapter24_questions_preview.md");
  fs.writeFileSync(previewPath, previewMd, "utf8");
  console.log("Preview MD updated.");
}

main().catch(console.error);