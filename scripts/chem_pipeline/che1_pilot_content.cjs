#!/usr/bin/env node
/**
 * che1 Step6 试点内容定义
 *
 * 数据源唯一为基础题块 che1 blocks（来源 SHA-256 与 che2 同一 lock 文件）。
 * 每题定义：答案(源自 che1_解析.md)、选项(语义成立、正确唯一)、中文解析、考点、状态。
 * 策略沿用于 che2：构图/记述题 → 语言描述图特征 / 参考答案要点作选项；多空题 → D1 组合。
 */
const path = require('path');

const CANDIDATE = '/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/Chem/_meta/chem_question_blocks_candidate_2026-10-12_v2.json';
const blocksPayload = require(CANDIDATE);
const blocks = blocksPayload.blocks.filter((b) => b.unitCode === 'che1');
const byCode = new Map(blocks.map((b) => [b.businessCode, b]));

// che1 整章为「第1章 固体の構造」（EJU 第6单元 化学2 2.2(5)固体の構造）
const TOPIC = 'chem_2_2_5';
const SUBTOPICS = ['chem_2_2_5_01'];

const CONTENT = [
  // ---- 基礎 CHECK ----
  {
    code: 'chem-che1-qC1', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'simple', Q: '結晶格子の最小のくり返し構造を何というか。',
    options: ['単位格子', '結晶格子', '結晶構造', '体心立方格子'], correctIndex: 0,
    answerJp: '単位格子',
    explCn: '结晶中粒子的规则排列叫结晶格子，其最小重复单元称为"单位格子"。',
    issues: [],
  },
  {
    code: 'chem-che1-qC2', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'simple', Q: '固体において，構成単位の配列に規則性がなく，結晶化していない状態を何というか。',
    options: ['アモルファス（無定形）', '結晶', '単結晶', '多結晶'], correctIndex: 0,
    answerJp: 'アモルファス（無定形）',
    explCn: '构成单元排列无规则性、未结晶化的固体称为"无定形（アモルファス）"固体，如玻璃。',
    issues: [],
  },
  {
    code: 'chem-che1-qC3', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: '次の(1)～(4)の結晶はそれぞれ何とよばれるか。(1)多数の原子が自由電子を共有 (2)陽イオンと陰イオンが静電気力で結合 (3)多数の原子が共有結合で連結 (4)分子が分子間力で配列。',
    answerVector: ['金属結晶', 'イオン結晶', '共有結合の結晶', '分子結晶'], N: 4,
    answerJp: '（1）金属結晶 （2）イオン結晶 （3）共有結合の結晶 （4）分子結晶',
    explCn: '（1）金属原子失去部分电子成为阳离子，阳离子沉浸在自由电子海中靠金属键结合→金属结晶。（2）阳离子与阴离子靠库仑静电引力结合→离子结晶。（3）原子间全部由共价键连接成网络→共价结合结晶（如金刚石）。（4）分子间靠分子间力（范德华力、氢键）整齐排列→分子结晶。',
    issues: [],
  },
  {
    code: 'chem-che1-qC4', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: '（1）金属のおもな結晶格子3種類の名称。（2）そのうち単位格子が立方体であるもの。（3）配位数が最も多いもの。（4）最密構造なもの。',
    answerVector: ['体心立方格子・面心立方格子・六方最密構造', '体心立方格子・面心立方格子', '面心立方格子・六方最密構造', '面心立方格子・六方最密構造'], N: 4,
    answerJp: '（1）体心立方格子・面心立方格子・六方最密構造 （2）体心立方格子・面心立方格子 （3）面心立方格子・六方最密構造 （4）面心立方格子・六方最密構造',
    explCn: '（1）金属常见三种晶格：体心立方（bcc）、面心立方（fcc，即立方最密）、六方最密（hcp）。（2）单位格子为立方体的只有 bcc 与 fcc；hcp 为正六角柱。（3）配位数：fcc 与 hcp 均为 12（最密），bcc 为 8。（4）最密结构为 fcc 和 hcp（堆积率均为 74%）。',
    issues: [],
  },
  {
    code: 'chem-che1-qC5', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: '次の(1)～(6)の結晶を (ア)イオン結晶 (イ)分子結晶 (ウ)共有結合の結晶 (エ)金属結晶 から選べ。(1)ダイヤモンド (2)塩化カリウム (3)亜鉛 (4)二酸化炭素 (5)黒鉛 (6)水。',
    answerVector: ['ウ', 'ア', 'エ', 'イ', 'ウ', 'イ'], N: 6,
    answerJp: '（1）ウ （2）ア （3）エ （4）イ （5）ウ （6）イ',
    explCn: '（1）金刚石：C 原子共价键网络→共价结合结晶（ウ）。（2）KCl 为金属与非金属→离子结晶（ア）。（3）Zn 为金属→金属结晶（エ）。（4）CO₂ 以分子存在→分子结晶（イ）。（5）石墨层内 C 以共价键连接→共价结合结晶（ウ）。（6）水为分子结晶（イ）。',
    issues: [],
  },

  // ---- 基本例題 ----
  {
    code: 'chem-che1-qE1', category: '基本例題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: '4種の結晶 (1)金属結晶 (2)イオン結晶 (3)共有結合の結晶 (4)分子結晶 について (A)構成粒子 (B)結合の種類 (C)特徴 (D)例2つ を語群から選べ。',
    answerVector: ['ウ・オ・コ・ソ・チ', 'エ・カ・サ・セ・タ', 'ア・キ・ケ・ツ・ト', 'イ・ク・シ・ス・テ'], N: 4,
    answerJp: '（1）ウ,オ,コ,ソ,チ （2）エ,カ,サ,セ,タ （3）ア,キ,ケ,ツ,ト （4）イ,ク,シ,ス,テ',
    explCn: '（1）金属结晶：构成粒子为原子与自由电子（ウ），靠金属键（オ），具展性延性可导电（コ），例如钠（ソ）、铜（チ）。（2）离子结晶：阳离子与阴离子（エ），离子键（カ），固态不导电、水溶液或液态导电（サ），例如氯化铁Ⅲ（セ）、溴化钾（タ）。（3）共价结合结晶：原子（ア），共价键（キ），极硬且熔点极高（ケ），例如二氧化硅（ツ）、金刚石（ト）。（4）分子结晶：分子（イ），分子间力（ク），一般质软熔点低、其中可升华（シ），例如碘（ス）、干冰（テ）。',
    issues: [],
  },
  {
    code: 'chem-che1-qE2', category: '基本例題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: 'NaCl の結晶の単位格子。(1)単位格子に含まれる Na⁺・Cl⁻ の数 (2)最寄りの Na⁺ の最寄り Cl⁻ 数と中心間距離 (3)最寄りの Na⁺ 数と中心間距離 (4)1mol の結晶の体積 (5)密度。',
    answerVector: ['Na⁺4個・Cl⁻4個', '6個・0.28nm', '12個・0.39nm', '26cm³', '2.2g/cm³'], N: 5,
    answerJp: '（1）Na⁺:4個, Cl⁻:4個 （2）6個, 0.28nm （3）12個, 0.39nm （4）26cm³ （5）2.2g/cm³',
    explCn: '（1）Na⁺位于棱心(12×1/4)+体心(1)=4，Cl⁻位于顶点(8×1/8)+面心(6×1/2)=4。（2）体心 Na⁺ 的上、下、左、右、前、后各有 1 个 Cl⁻，共 6 个；距离为边长一半 0.28nm（a=0.56nm）。（3）体心 Na⁺ 至各棱心 Na⁺ 共 12 个，距离为面对角线一半：0.56×√2/2≈0.39nm（≈0.40）。（4）单位格子（4 对离子）体积 (0.56nm)³，1mol 对应 6.0×10²³/4 个格子：1.76×10⁻²²×(6.0×10²³/4)=26.4≈26cm³。（5）密度=(23+35.5)/26.4≈2.2g/cm³。',
    issues: [],
  },

  // ---- 基本問題 ----
  {
    code: 'chem-che1-qB1', category: '基本問題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: '金属A（一辺 4.05×10⁻⁸cm の立方体結晶、密度 2.7g/cm³）。(1)結晶格子の名称 (2)1cm³ 中の原子数 (3)原子量。',
    answerVector: ['面心立方格子', '6.1×10^22個', '27'], N: 3,
    answerJp: '（1）面心立方格子 （2）6.1×10²²個 （3）27',
    explCn: '（1）由面心位置存在原子可判定为面心立方格子。（2）1 个单位格子含原子 8×1/8+6×1/2=4 個，单位格子体积 (4.05×10⁻⁸)³=66×10⁻²⁴cm³，故 1cm³ 中有 4/（66×10⁻²⁴）≈6.1×10²² 個。（3）1cm³（6.1×10²²個）质量 2.7g，则 1mol（6.0×10²³）质量≈2.7×6.0×10²³/6.1×10²²≈27，即原子量 27（Al）。',
    issues: [],
  },
  {
    code: 'chem-che1-qB2', category: '基本問題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: '金属B（一辺 0.29nm の立方体結晶、密度 7.2g/cm³）。(1)結晶格子の名称 (2)原子半径 (3)原子量。',
    answerVector: ['体心立方格子', '0.12nm', '52'], N: 3,
    answerJp: '（1）体心立方格子 （2）0.12nm （3）52',
    explCn: '（1）体心有原子→体心立方格子。（2）体心立方中，体对角线长 = √3×0.29 = 4r，故 r=0.29×√3/4≈0.123≈0.12nm。（3）单位格子含原子 8×1/8+1=2 個，单位格子体积 (2.9×10⁻⁸)³=24×10⁻²⁴cm³，质量 7.2×24×10⁻²⁴=1.73×10⁻²²g 对应 2 个原子，则 1mol 质量 = 1.73×10⁻²²×(6.0×10²³/2)≈51.8≈52（Cr）。',
    issues: [],
  },
  {
    code: 'chem-che1-qB11', category: '基本問題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: '鉄・銅・亜鉛の結晶構造(図)。(1)それぞれの結晶格子名 (2a)鉄の頂点の原子の共有個数と割合 (2b)銅の面中心原子の共有個数と割合 (3)亜鉛A～Dの割合 (4)単位格子中の原子総数 (5)1個の原子を取り囲む原子数。',
    answerVector: ['鉄：体心立方格子・銅：面心立方格子・亜鉛：六方最密構造', '8個・1/8個', '2個・1/2個', 'A,C：1/12個・B,D：1/6個', '鉄2個・銅4個・亜鉛2個', '鉄8個・銅12個・亜鉛12個'], N: 6,
    answerJp: '（1）鉄：体心立方格子 銅：面心立方格子 亜鉛：六方最密構造 （2a）頂点の原子：8個・1/8個 （2b）面の中心の原子：2個・1/2個 （3）A,C：1/12個 B,D：1/6個 （4）鉄2個・銅4個・亜鉛2個 （5）鉄8個・銅12個・亜鉛12個',
    explCn: '（1）铁为体心立方、铜为面心立方、锌为六方最密（hcp）。（2a）顶点原子被 8 个单位格子共有→每格 1/8 個。（2b）面中心原子被相邻 2 格共有→每格 1/2 個。（3）hcp 单位格子是正六角柱的 1/3，A、C（60° 角）占半球的 1/6 原子=1/12 個，B、D（120° 角）占 1/3=1/6 個。（4）每格原子数：bcc 2、fcc 4、hcp 2。（5）配位数：bcc 8、fcc 12、hcp 12。',
    issues: [],
  },
  {
    code: 'chem-che1-qB3', category: '基本問題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: '次の元素の単体や化合物から (a)分子からなる物質 (b)イオンからなる物質 を選び，それぞれ分子式・組成式で答えよ。①Al ②Ar ③C ④O ⑤AlとO ⑥CとCl ⑦CとO ⑧CaとCl ⑨HとN ⑩HとS ⑪SiとO。',
    answerVector: ['②④⑥⑦⑨⑩', '⑤⑧'], N: 2,
    answerJp: '（a）②④⑥⑦⑨⑩（Ar, O₂, CCl₄, CO₂, NH₃, H₂S：分子式） （b）⑤⑧（Al₂O₃, CaCl₂：組成式）',
    explCn: '非金属元素间形成共价键：②Ar 为单原子分子、④O₂、⑥CCl₄、⑦CO₂、⑨NH₃、⑩H₂S 均为分子，写分子式；金属元素与非金属元素形成离子键：⑤Al 与 O→Al₂O₃、⑧Ca 与 Cl→CaCl₂ 为离子晶体，写组成式（①②?①③⑪为金属或共价结合结晶，非分子也非离子型）。',
    issues: [],
  },
  {
    code: 'chem-che1-qB4', category: '基本問題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: '分子 H₂・N₂・CH₄・CO₂・CH₃Cl・HF・H₂O・NH₃ のうち (1)全原子が同一直線上 (2)分子間で水素結合 (3)結合に極性があるが分子全体では無極性 のものはそれぞれいくつか。',
    answerVector: ['4個', '3個', '2個'], N: 3,
    answerJp: '（1）4個 （2）3個 （3）2個',
    explCn: '（1）直线上原子：双原子分子 H₂・N₂・HF 与直线形 CO₂，共 4 个。（2）能形成分子间氢键的需含 N-H・O-H・F-H 强极性键：HF・H₂O・NH₃，共 3 个。（3）化学键有极性但分子对称抵消为无极性：CH₄（正四面体）与 CO₂（直线对称），共 2 个；H₂O、NH₃ 因不对称仍有极性，CH₃Cl 亦为极性分子。',
    issues: [],
  },
  {
    code: 'chem-che1-qB5', category: '基本問題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'simple', Q: '図Ⅰは NaCl の単位格子，図Ⅱは単位格子でない。その理由を，立方体の面の原子の配列に着目して説明せよ。',
    options: [
      '図Ⅱの構造では，上下の面，左右の面，前後の面の原子の配列がそれぞれ異なり，繰り返すことができないから。',
      '図Ⅱの構造では，面の中心に原子がなく，繰り返すことができないから。',
      '図Ⅱは斜め下方向にのみ繰り返せる構造だから。',
      '図Ⅱの原子の配列は図Ⅰと同じだが，原子の数が異なるから。',
    ],
    correctIndex: 0,
    answerJp: '図Ⅱの構造では，上下の面，左右の面，前後の面の原子の配列がそれぞれ異なり，繰り返すことができないから。',
    explCn: '单位格子是能沿上下、左右、前后无间隙重复的最小单元，因此其三个方向对应的两面原子排列必须一致。图Ⅱ中上下、左右、前后各两面原子排列互不相同，无法无限重复，故不是单位格子。',
    issues: [],
  },
  {
    code: 'chem-che1-qB6', category: '基本問題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: 'NaCl の結晶の単位格子。(1)Na⁺ の周りの Cl⁻、Cl⁻ の周りの Na⁺ の数 (2)単位格子中の Na⁺・Cl⁻ の数 (3)単位格子中のイオンの質量合計 (4)Na⁺ の半径 (5)単位格子の体積 (6)密度。',
    answerVector: ['6個・6個', '4個・4個', '3.9×10^-22g', '0.11nm', '1.8×10^-22cm³', '2.2g/cm³'], N: 6,
    answerJp: '（1）6個・6個 （2）4個・4個 （3）3.9×10⁻²²g （4）0.11nm （5）1.8×10⁻²²cm³ （6）2.2g/cm³',
    explCn: '（1）NaCl 型中每个 Na⁺（或 Cl⁻）都被 6 个异号离子包围，配位数 6。（2）每格 Na⁺=棱心12×1/4+体心1=4，Cl⁻=顶点8×1/8+面心6×1/2=4。（3）每格质量=58.5×(4/6.0×10²³)≈3.9×10⁻²²g。（4）Na⁺ 与 Cl⁻ 沿棱接触，a=2(r₊+r₋)=0.56nm，r₊=0.28−0.17=0.11nm。（5）体积=(5.6×10⁻⁸)³≈1.8×10⁻²²cm³。（6）密度=3.9×10⁻²²/1.8×10⁻²²≈2.2g/cm³。',
    issues: [],
  },
  {
    code: 'chem-che1-qB7', category: '基本問題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: 'CsCl の結晶の単位格子。(1)Cs⁺ の周りの Cl⁻、Cl⁻ の周りの Cs⁺ の数 (2)単位格子中の Cs⁺・Cl⁻ の数 (3)Cs⁺ の半径 (4)1mol の結晶の体積 (5)密度。',
    answerVector: ['8個・8個', '1個・1個', '0.18nm', '41cm³', '4.1g/cm³'], N: 5,
    answerJp: '（1）8個・8個 （2）1個・1個 （3）0.18nm （4）41cm³ （5）4.1g/cm³',
    explCn: '（1）CsCl 型中每个 Cs⁺ 位于由 8 个 Cl⁻ 构成的正方体中心，配位数 8（反之亦然）。（2）每格 Cs⁺=体心 1 個、Cl⁻=顶点 8×1/8=1 個。（3）离子沿体对角线接触：2(r₊+r₋)=√3×a，a=0.41nm，r₊=0.41×√3/2−0.17≈0.18nm。（4）每格体积 (4.1×10⁻⁸)³=69×10⁻²⁴cm³，1mol（6.0×10²³ 格）=69×10⁻²⁴×6.0×10²³=41.4≈41cm³。（5）密度=168.4/41≈4.1g/cm³。',
    issues: [],
  },
  {
    code: 'chem-che1-qB8', category: '基本問題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: 'ヨウ素分子の結晶（直方体 4.8×7.3×9.8×10⁻⁸cm、頂点 8 と面心 6 に分子）。(1)単位格子中のヨウ素原子の数 (2)密度。',
    answerVector: ['8個', '4.9g/cm³'], N: 2,
    answerJp: '（1）8個 （2）4.9g/cm³',
    explCn: '（1）顶点 8 分子×1/8 + 面心 6 分子×1/2 = 4 个 I₂ 分子，故 I 原子 = 4×2 = 8 個。（2）密度=(254×4/6.0×10²³)/(343×10⁻²⁴)=1.69×10⁻²¹/3.43×10⁻²²≈4.9g/cm³。',
    issues: [],
  },
  {
    code: 'chem-che1-qB9', category: '基本問題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'simple', Q: '氷の密度が液体の水より小さい理由を，氷での水分子の配列に着目して説明せよ。',
    options: [
      '氷の結晶中の水分子は，分子間にはたらく水素結合により，液体の水よりもすき間の多い構造で配列しているから。',
      '氷は固体のため，液体の水よりも密度が小さくなるから。',
      '氷では水分子が液体の水よりも密に詰まって配列しているから。',
      '氷は共有結合の結晶で，水分子が共有結合で結ばれているから。',
    ],
    correctIndex: 0,
    answerJp: '氷の結晶中の水分子は，分子間にはたらく水素結合により，液体の水よりもすき間の多い構造で配列しているから。',
    explCn: '水分子之间有强极性 O-H 键，形成氢键。冰中每个氧原子以 2 个共价键+2 个氢键连接 4 个水分子，呈金刚石型开放骨架排列，分子间隙很大；液态水中氢键部分断裂、分子堆积更紧密，故冰的密度（0.92）小于水（1.0），冰浮于水面。',
    issues: [],
  },
  {
    code: 'chem-che1-qB10', category: '基本問題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: '二酸化ケイ素の結晶に関する空欄 (a)～(k) の語句・数値を入れよ。（a）結晶をつくる。Si は（b）の中心から（c）個の頂点方向へ結合し（d）個の O と共有結合。O は（e）個の Si にはさまれる。天然には（f）（g）けい砂。融解後冷却で石英（h）。無配列状態を（i）。急冷で（j）金属。水素取込み（k）。',
    answerVector: ['共有結合の', '正四面体', '4', '4', '2', '水晶', '石英', 'ガラス', 'アモルファス（無定形）', 'アモルファス', 'アモルファスシリコン'], N: 11,
    answerJp: '（a）共有結合の （b）正四面体 （c）4 （d）4 （e）2 （f）水晶 （g）石英 （h）ガラス （i）アモルファス（無定形） （j）アモルファス （k）アモルファスシリコン',
    explCn: '（a）SiO₂ 为共价结合结晶。（b）Si 位于正四面体中心。（c）（d）Si 向 4 个顶点方向伸出 4 条键，与 4 个 O 共价结合（SiO₄ 四面体）。（e）O 被 2 个 Si 夹住桥联。（f）（g）天然有水晶、石英、硅砂。（h）熔融后冷却得配列不规则的玻璃。（i）这种无规则配列状态叫无定形（アモルファス）。（j）金属高温熔融急冷得到无定形（非晶质）金属。（k）无定形硅中引入氢成为非晶硅，用于半导体、太阳能电池。',
    issues: [],
  },

  // ---- 応用例題 ----
  {
    code: 'chem-che1-qA1', category: '応用例題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: 'Al の面心立方格子（原子半径 r、一辺 a、π=3.14）。(1)単位格子中の原子の数 (2) r を a で表す (3)充填率(%)。',
    answerVector: ['4個', 'r=(√2/4)a', '74%'], N: 3,
    answerJp: '（1）4個 （2）r＝(√2/4)a （3）74%',
    explCn: '（1）面心立方每格原子 = 8×1/8+6×1/2 = 4 個。（2）面对角线上 4r=√2·a，故 r=√2·a/4。（3）充填率=4×(4/3)πr³/a³=4×(4/3)π(√2a/4)³/a³=√2π/6≈0.74，即 74%。',
    issues: [],
  },

  // ---- 応用問題 ----
  {
    code: 'chem-che1-qA2', category: '応用問題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: '充填率。(1)Na(体心)・Cu(面心)の充填率(%) (2)半径の大きい K(体心)・Ag(面心)はそれぞれ Na・Cu と比べて大きいか小さいか同じか (3)Zn(六方最密、a=2r、c=2√6/3・a)の充填率(%)。',
    answerVector: ['Na68%・Cu74%', 'K：同じ・Ag：同じ', '74%'], N: 3,
    answerJp: '（1）Na 68%・Cu 74% （2）K：Na と同じ・Ag：Cu と同じ （3）74%',
    explCn: '（1）充填率只由堆积方式决定：体心立方为 √3π/8≈68%，面心立方为 √2π/6≈74%。（2）同一堆积方式下充填率与原子半径无关，故 K、Ag 与各自同型金属充填率相同。（3）六方最密与面心立方同为最密堆积，充填率均为 74%。',
    issues: [],
  },
  {
    code: 'chem-che1-qA3', category: '応用問題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: '(1)～(5)の A(●)・B(○) からなる結晶構造の組成式を A₂B₃ の形で答えよ。',
    answerVector: ['AB', 'AB₂', 'AB₂', 'AB₃', 'AB'], N: 5,
    answerJp: '（1）AB （2）AB₂ （3）AB₂ （4）AB₃ （5）AB',
    explCn: '计数规则：顶点 1/8、棱心 1/4、面心 1/2、体内 1。（1）A=8×1/8=1、B=1 → AB。（2）A=1、B=面心 6×1/2?（依图中配位）→ AB₂。（3）萤石型 A:B=1:2 → AB₂。（4）A=8×1/8=1、B=棱心 12×1/4=3 → AB₃（氧化铼型）。（5）食盐型 A=B=4 → AB。',
    issues: ['(2)(3) 需依图中原子配位确认 A 位于面心/体内，A:B 均为 1:2'],
  },
  {
    code: 'chem-che1-qA5', category: '応用問題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: 'NaCl 型構造の安定性。(1)R>r で陰イオンどうしも接するとき r/R（√2=1.41） (2)NaCl 型が不安定になるのは r/R が (1) より小さいときか大きいときか (3)CaS が 2000℃ でも融けない理由 (4)KBr の融点は NaCl より高いか低いか、理由とともに。',
    answerVector: ['0.41', '小さいとき', 'Ca²⁺とS²⁻の間の静電気力が1価のNa⁺・Cl⁻間より強いから', '低い。KBr はイオン間の距離が大きく静電気力が弱いから'], N: 4,
    answerJp: '（1）0.41 （2）小さいとき （3）2価の Ca²⁺ と S²⁻ 間の静電気力が1価の Na⁺・Cl⁻ 間より強いから （4）低い。KBr はイオン間距離が大きく、静電気力が弱いから',
    explCn: '（1）阳离子与阴离子接触且阴离子相互接触时，直角等腰三角形中 (R+r):2R=1:√2，故 r/R=√2−1≈0.41。（2）r/R 小于该值时，阳离子与阴离子分离、引力削弱，结构不稳定。（3）CaS 中离子电荷为 ±2，库仑力（∝q₁q₂/r²）约为 ±1 离子的 4 倍，故熔点远高。（4）KBr 离子半径大、离子间距大，库仑力弱，熔点低于 NaCl。',
    issues: [],
  },
  {
    code: 'chem-che1-qA4', category: '応用問題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: 'ZnS の結晶（S²⁻ が頂点と面心）。(1)ある S²⁻ に最も近い Zn²⁺ の数と最も近い S²⁻ の数 (2)一辺 5.4×10⁻⁸cm のときの密度。',
    answerVector: ['Zn²⁺4個・S²⁻12個', '4.0g/cm³'], N: 2,
    answerJp: '（1）Zn²⁺ 4個・S²⁻ 12個 （2）4.0g/cm³',
    explCn: '（1）S²⁻ 位于 Zn²⁺ 正四面体空隙中心，最邻近 Zn²⁺ 为 4 個；S²⁻ 自身构成面心立方排列，最邻近 S²⁻ 数即 fcc 配位数 12 個。（2）每格 Zn²⁺=体内 4、S²⁻=8×1/8+6×1/2=4，质量=97.4×4/6.0×10²³=6.5×10⁻²²g，体积=(5.4×10⁻⁸)³=1.6×10⁻²²cm³，密度≈4.0g/cm³。',
    issues: [],
  },
  {
    code: 'chem-che1-qA6', category: '応用問題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'simple', Q: 'フラーレン C₆₀ の結晶は立方体形単位格子に最密充填され，分子中心間距離 1.0nm。この結晶の密度は何 g/cm³ か。',
    options: ['1.7', '0.85', '0.43', '4.8'], correctIndex: 0,
    answerJp: '1.7g/cm³',
    explCn: '最密填充即面心立方：单位格子中 4 个 C₆₀，面心到顶点中心距 1.0nm → 面对角线 2.0nm → a=√2nm=1.41×10⁻⁷cm。1 个 C₆₀ 质量=(12×60)/6.0×10²³=1.2×10⁻²¹g，密度=4×1.2×10⁻²¹/(1.41×10⁻⁷)³≈1.7g/cm³。',
    issues: [],
  },
  {
    code: 'chem-che1-qA7', category: '応用問題', topic: TOPIC, subtopics: SUBTOPICS,
    optMode: 'multi', Q: 'ダイヤモンドの結晶（面心立方＋対角線 1/4 移動）。(1)単位格子中の炭素原子数 (2)小さな立方体 1 個で結合補助線（作図） (3)結合距離 (4)密度。',
    answerVector: ['8個', '小さな立方体の内部の4個のC原子から頂点の4個のC原子へ、補助線を引く', '1.5×10^-8cm', '3.4g/cm³'], N: 4,
    answerJp: '（1）8個 （2）小さな立方体 1 個（単位格子の 1/8）をとり出し、内部の 4 個の C 原子から頂点の 4 個の C 原子へ補助線を引く （3）1.5×10⁻⁸cm （4）3.4g/cm³',
    explCn: '（1）金刚石单位格子含 8×1/8+6×1/2+体内 4=8 個 C。（2）作图题转化为语言描述：取单位格子的 1/8 小立方体，将内部 4 个 C 原子与所在顶点(另 4 个 C)连线补全键。（3）结合距离=体对角线长的 1/4=3.6×10⁻⁸×√3/4≈1.5×10⁻⁸cm。（4）密度=12×8/(6.0×10²³×3.6³×10⁻²⁴)=96×10⁻²⁴/3.47...≈3.4.../cm³≈3.4g/cm³（3.6³=47）：12×8/6.0×10²³÷(47×10⁻²⁴)=96/6.0×10⁻²³÷4.7×10⁻²³≈3.4。',
    issues: [],
  },
];

// 汇总（与 che2 build() 同构）
function build() {
  const labels = ['(a)', '(b)', '(c)', '(d)', '(e)', '(f)', '(g)', '(h)', '(i)', '(j)', '(k)', '(l)', '(m)'];
  const drafts = CONTENT.map((c) => {
    const block = byCode.get(c.code);
    if (!block) {
      throw new Error(`候选缺少 businessCode ${c.code}`);
    }
    const status = c.optMode === 'blocked' ? 'blocked'
      : (c.optMode === 'native' || c.optMode === 'simple') ? 'draft'
      : 'needs_review';
    return {
      businessCode: c.code,
      matchKey: block.matchKey,
      unitCode: block.unitCode,
      originalCategory: c.category,
      blockType: block.blockType,
      sourceNumber: block.sourceNumber,
      matchNumber: block.matchNumber,
      sourceHeading: block.sourceHeading,
      analysisSourceHeading: block.analysisSourceHeading,
      topicCode: c.topic,
      subtopicCodes: c.subtopics,
      questionType: 1,
      score: 5,
      difficultyLevel: block.difficultyLevel,
      stem: (block.stemWithContextRaw || '').trim(),
      answerPrompt: c.Q,
      options: c.options || [],
      correctIndex: (typeof c.correctIndex === 'number') ? c.correctIndex : null,
      answerSlots: c.answerVector ? c.answerVector.map((v, i) => ({
        slotId: c.optMode === 'multi' ? String(i + 1) : 'a',
        sourceLabel: c.optMode === 'multi' ? labels[i] : '',
        value: v,
        state: 'derived_from_analysis',
      })) : [],
      N: c.answerVector ? c.answerVector.length : null,
      answerJp: c.answerJp,
      explanation: `【参考答案】: ${c.answerJp}\n\n【详细解析】: ${c.explCn}`,
      optionMode: c.optMode,
      generationStatus: status,
      reviewIssues: c.issues || [],
      resources: collectResources(block),
      questionSource: block.questionSource,
      analysisSource: block.analysisSource,
      questionContextIds: block.questionContextIds || [],
      analysisContextIds: block.analysisContextIds || [],
      generatorVersion: '1.0.0',
    };
  });
  return drafts;
}

function collectResources(block) {
  const text = `${block.stemWithContextRaw || ''}\n${block.analysisWithContextRaw || ''}`;
  const imgs = (text.match(/!\[[^\]]*]\(([^)]+)\)/g) || []).map((m) => (m.match(/]\(([^)]+)\)/) || [])[1]);
  const htmlTables = (text.match(/<table[\s\S]*?<\/table>/g) || []).length;
  return { images: imgs.filter(Boolean), htmlTables };
}

module.exports = { CONTENT, build, byCode };

if (require.main === module) {
  const d = build();
  console.log('che1 drafts:', d.length);
  const s = new Map();
  d.forEach((x) => s.set(x.generationStatus, (s.get(x.generationStatus) || 0) + 1));
  console.log('status:', Object.fromEntries(s));
  const nat = d.filter((x) => x.options.length > 0 && x.correctIndex !== null);
  console.log('有选项+答案的题:', nat.map((x) => `${x.businessCode}(idx=${x.correctIndex})`).join(', '));
}