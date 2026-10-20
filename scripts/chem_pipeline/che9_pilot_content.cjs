#!/usr/bin/env node
/**
 * che9 Step6 试点内容定义
 *
 * 数据源唯一为基础题块 che9 blocks（来源 SHA-256 与 che1~che8 同一 lock 文件）。
 * 每题定义：答案(源自 che9_解析.md)、选项(语义成立、正确唯一)、中文解析、考点、状态。
 * 策略沿用 che1~che8：作图/记述题 → 语言描述图特征 / 参考答案要点作选项；多空题 → D1 组合。
 *
 * che9 整章 = 「第9章 周期表と非金属元素」（典型元素・非金属の単体と化合物・工業的製法）
 *  - 周期表と各族元素（1族～18族の代表元素）：chem_3_1_1（以下 _01~_08）
 *  - 工業的製法（ハーバー・ボッシュ法/オストワルト法/接触式硫酸製造法）：chem_3_1_3_01
 *  - 無機材料（ガラス・セメント・セラミックス・ケイ酸塩）：chem_3_1_5_02
 */
const path = require('path');

const CANDIDATE = '/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/Chem/_meta/chem_question_blocks_candidate_2026-10-12_v2.json';
const blocksPayload = require(CANDIDATE);
const blocks = blocksPayload.blocks.filter((b) => b.unitCode === 'che9');
const byCode = new Map(blocks.map((b) => [b.businessCode, b]));

const T_FAM = 'chem_3_1_1';          // 典型元素（主要族元素）
const S_ALL = ['chem_3_1_1_01', 'chem_3_1_1_02', 'chem_3_1_1_03', 'chem_3_1_1_04', 'chem_3_1_1_05', 'chem_3_1_1_06', 'chem_3_1_1_07', 'chem_3_1_1_08'];
const S_1 = ['chem_3_1_1_01'];        // 1族（アルカリ金属・水素）
const S_2 = ['chem_3_1_1_02'];        // 2族
const S_3 = ['chem_3_1_1_03'];        // 13族
const S_4 = ['chem_3_1_1_04'];        // 14族（炭素・ケイ素）
const S_5 = ['chem_3_1_1_05'];        // 15族（窒素・リン）
const S_6 = ['chem_3_1_1_06'];        // 16族（酸素・硫黄）
const S_7 = ['chem_3_1_1_07'];        // 17族（ハロゲン）
const S_8 = ['chem_3_1_1_08'];        // 18族（希ガス）
const S_5_6_7 = ['chem_3_1_1_05', 'chem_3_1_1_06', 'chem_3_1_1_07'];
const S_2_3_6 = ['chem_3_1_1_02', 'chem_3_1_1_03', 'chem_3_1_1_06'];
const S_4_5_6 = ['chem_3_1_1_04', 'chem_3_1_1_05', 'chem_3_1_1_06'];
const S_1_4_5 = ['chem_3_1_1_01', 'chem_3_1_1_04', 'chem_3_1_1_05'];
const T_IND = 'chem_3_1_3';          // 無機物質の工業的製法
const S_IND = ['chem_3_1_3_01'];
const T_MAT = 'chem_3_1_5';          // 広く利用されている無機化合物
const S_MAT = ['chem_3_1_5_02'];

const CONTENT = [
  // ---- 基礎 CHECK ----
  {
    code: 'chem-che9-qC1', category: '基礎 CHECK', topic: T_FAM, subtopics: S_ALL,
    optMode: 'simple', Q: '门捷列夫按原子量顺序制成周期表，现在的周期表按什么顺序排列？',
    options: ['陽子の数（原子番号）', '原子量', '電子の数', '質量数'], correctIndex: 0,
    answerJp: '陽子の数（原子番号）',
    explCn: '现代周期表按原子序数（质子数）递增排列，原子量顺序存在倒置（如 Ar/K、Co/Ni），已被淘汰。',
    issues: [],
  },
  {
    code: 'chem-che9-qC2', category: '基礎 CHECK', topic: T_FAM, subtopics: S_ALL,
    optMode: 'multi', Q: '(1)1族（除氢）(2)17族 (3)18族 的元素分别统称什么？',
    answerVector: ['アルカリ金属元素', 'ハロゲン元素', '貴ガス元素（希ガス元素）'], N: 3,
    answerJp: '(1)アルカリ金属元素 (2)ハロゲン元素 (3)貴ガス元素（希ガス元素）',
    explCn: '1族除氢为碱金属（1 价阳离子）；17 族卤素（1 价阴离子）；18 族稀有气体（化合极不活泼）。',
    issues: [],
  },
  {
    code: 'chem-che9-qC3', category: '基礎 CHECK', topic: T_FAM, subtopics: S_7,
    optMode: 'multi', Q: '卤素单质中，(1)常温为液体的 (2)氧化力最强的 各是什么？',
    answerVector: ['臭素', 'フッ素'], N: 2,
    answerJp: '(1)臭素 (2)フッ素',
    explCn: 'Br₂ 是唯一常温液体的非金属单质；卤素氧化力 F₂>Cl₂>Br₂>I₂，F₂ 最强。',
    issues: [],
  },
  {
    code: 'chem-che9-qC4', category: '基礎 CHECK', topic: T_FAM, subtopics: S_7,
    optMode: 'multi', Q: '下列叙述是针对 (ア)HF 还是 (イ)HCl？(1)强酸 (2)侵蚀玻璃',
    answerVector: ['イ', 'ア'], N: 2,
    answerJp: '(1)イ（HCl） (2)ア（HF）',
    explCn: 'HF 为弱酸、会与 SiO₂ 反应而侵蚀玻璃（保存于聚乙烯瓶）；HCl 是强酸，不侵蚀玻璃。',
    issues: [],
  },
  {
    code: 'chem-che9-qC5', category: '基礎 CHECK', topic: T_FAM, subtopics: S_2_3_6,
    optMode: 'multi', Q: '(1)MgO (2)SO₃ (3)Al₂O₃ 各是酸性氧化物、碱性氧化物、两性氧化物中的哪一种？',
    answerVector: ['塩基性酸化物', '酸性酸化物', '両性酸化物'], N: 3,
    answerJp: '(1)MgO 塩基性酸化物 (2)SO₃ 酸性酸化物 (3)Al₂O₃ 両性酸化物',
    explCn: '第 3 周期从左到右氧化物由碱性（Na₂O、MgO）→两性（Al₂O₃）→酸性（SiO₂、P₄O₁₀、SO₃、Cl₂O₇）变化。',
    issues: [],
  },
  {
    code: 'chem-che9-qC6', category: '基礎 CHECK', topic: T_FAM, subtopics: S_6,
    optMode: 'multi', Q: '希硫酸 (1) 与 濃硫酸 (2) 各符合哪些性质？(ア)与锌剧烈反应 (イ)脱水作用 (ウ)加热时与铜反应',
    answerVector: ['ア', 'イ、ウ'], N: 2,
    answerJp: '(1)希硫酸：ア (2)濃硫酸：イ、ウ',
    explCn: '稀硫酸靠 H⁺ 与活泼金属反应放 H₂；浓硫酸有强脱水作用，加热时具氧化性可与 Cu 反应放出 SO₂。',
    issues: [],
  },
  {
    code: 'chem-che9-qC7', category: '基礎 CHECK', topic: T_IND, subtopics: S_IND,
    optMode: 'multi', Q: '(1)氨的工业制法叫什么？(2)硝酸的工业制法叫什么？',
    answerVector: ['ハーバー・ボッシュ法', 'オストワルト法'], N: 2,
    answerJp: '(1)ハーバー・ボッシュ法 (2)オストワルト法',
    explCn: '合成氨（哈伯-博施法）N₂＋3H₂⇌2NH₃；硝酸（奥斯特瓦尔德法）由 NH₃ 催化氧化成 NO→NO₂→HNO₃。',
    issues: [],
  },
  {
    code: 'chem-che9-qC8', category: '基礎 CHECK', topic: T_FAM, subtopics: S_5_6_7,
    optMode: 'multi', Q: '下列酸分类为强酸 (1) 与弱酸 (2)：(ア)氯化氢 (イ)硫酸 (ウ)硫化氢 (エ)硝酸 (オ)二氧化碳',
    answerVector: ['ア、イ、エ', 'ウ、オ'], N: 2,
    answerJp: '(1)強酸：ア、イ、エ (2)弱酸：ウ、オ',
    explCn: 'HCl、H₂SO₄、HNO₃ 为强酸；H₂S、CO₂（碳酸）为弱酸。',
    issues: [],
  },
  {
    code: 'chem-che9-qC9', category: '基礎 CHECK', topic: T_FAM, subtopics: S_5,
    optMode: 'multi', Q: 'Cu 与 (1)稀硝酸 (2)浓硝酸 反应时产生的气体分子式各是什么？',
    answerVector: ['NO', 'NO₂'], N: 2,
    answerJp: '(1)NO (2)NO₂',
    explCn: '3Cu＋8HNO₃(稀)→3Cu(NO₃)₂＋4H₂O＋2NO；Cu＋4HNO₃(濃)→Cu(NO₃)₂＋2H₂O＋2NO₂。',
    issues: [],
  },
  {
    code: 'chem-che9-qC10', category: '基礎 CHECK', topic: T_FAM, subtopics: S_5,
    optMode: 'simple', Q: '写出含 +5 价磷的酸的化学式。',
    options: ['H₃PO₄', 'H₃PO₃', 'HPO₃', 'H₄P₂O₇'], correctIndex: 0,
    answerJp: 'H₃PO₄',
    explCn: '磷酸（オルトリン酸）中 P 为 +5 价；H₃PO₃ 为亚磷酸（P+3），HPO₃ 为偏磷酸，H₄P₂O₇ 为焦磷酸。',
    issues: [],
  },
  {
    code: 'chem-che9-qC11', category: '基礎 CHECK', topic: T_FAM, subtopics: S_4_5_6,
    optMode: 'multi', Q: '写出各元素( )内的同素体名称：(1)氧(2) (2)硫黄(3) (3)磷(2) (4)碳(3)',
    answerVector: ['酸素、オゾン', '斜方硫黄、単斜硫黄、ゴム状硫黄', '黄リン、赤リン', 'ダイヤモンド、黒鉛、フラーレン'], N: 4,
    answerJp: '(1)酸素・オゾン (2)斜方硫黄・単斜硫黄・ゴム状硫黄 (3)黄リン・赤リン (4)ダイヤモンド・黒鉛・フラーレン',
    explCn: '同素体：O₂/O₃；斜方硫黄/単斜硫黄/ゴム状硫黄；黄リン/赤リン；ダイヤモンド/黒鉛/フラーレン（無定形炭素）。',
    issues: [],
  },
  {
    code: 'chem-che9-qC12', category: '基礎 CHECK', topic: T_FAM, subtopics: S_4,
    optMode: 'multi', Q: 'CO₂ (1) 与 CO (2) 各自符合哪些性质？(ア)石灰石与盐酸反应生成 (イ)空气中燃烧 (ウ)使石灰水变白浊 (エ)有毒',
    answerVector: ['ア、ウ', 'イ、エ'], N: 2,
    answerJp: '(1)CO₂：ア、ウ (2)CO：イ、エ',
    explCn: 'CO₂ 可由石灰石＋盐酸制得、使石灰水白浊；CO 可燃、剧毒（与血红蛋白结合）。',
    issues: [],
  },
  {
    code: 'chem-che9-qC13', category: '基礎 CHECK', topic: T_MAT, subtopics: S_MAT,
    optMode: 'simple', Q: '岩石、水泥、陶瓷等的主要成分的统称是什么？',
    options: ['ケイ酸塩', '炭酸塩', '硫酸塩', '酸化物'], correctIndex: 0,
    answerJp: 'ケイ酸塩',
    explCn: '岩石・セメント・陶磁器主成分均为硅酸盐（SiO₄ 四面体结构）。',
    issues: [],
  },

  // ---- 基本例題 ----
  {
    code: 'chem-che9-qE1', category: '基本例題', topic: T_FAM, subtopics: S_ALL,
    optMode: 'multi', Q: '根据给出的周期表部分（第 2、3 周期）。(1)金属元素有几种？(2)常温常压为气体的单质有几种？(3)(a)金属性最强 (b)非金属性最强的元素？(4)第 3 周期中最高氧化数最大的元素符号？(5)(a)与水反应生成强碱性溶液 (b)两性氧化物 的化学式？',
    answerVector: ['5種類', '6種類', 'Na', 'F', 'Cl', 'Na₂O', 'Al₂O₃'], N: 7,
    answerJp: '(1)5種類（Li,Be,Na,Mg,Al） (2)6種類（N,O,F,Ne,Cl,Ar） (3)(a)Na (b)F (4)Cl (5)(a)Na₂O (b)Al₂O₃',
    explCn: '第2、3周期金属：Li/Be/Na/Mg/Al 共5种；常温常压气体单质：N/O/F/Ne/Cl/Ar 共6种。Na 金属性最强（第1族）、F 非金属性最强。Cl 最高氧化数+7为第3周期最大。Na₂O 与水成强碱，Al₂O₃ 两性。',
    issues: [],
  },
  {
    code: 'chem-che9-qE2', category: '基本例題', topic: T_FAM, subtopics: S_7,
    optMode: 'multi', Q: '(1)(a)常温为液体的卤素单质 (b)与氢反应最剧烈的卤素单质，化学式？(2)②二原子分子、③卤化物 中的原子分别以何种化学键结合？(3)水溶液呈弱酸性的卤化氢？(4)卤化银的化学式（卤素记 X）？',
    answerVector: ['Br₂', 'F₂', '共有結合', 'イオン結合', 'HF', 'AgX'], N: 6,
    answerJp: '(1)(a)Br₂ (b)F₂ (2)②共有結合 ③イオン結合 (3)HF (4)AgX',
    explCn: '卤素单质为双原子分子（共价键）；与金属形成卤化物时为离子键（1 价阴离子）。HF 水溶液弱酸、不生成 AgF 沉淀；AgX 表示卤化银。',
    issues: [],
  },
  {
    code: 'chem-che9-qE3', category: '基本例題', topic: T_FAM, subtopics: S_6,
    optMode: 'multi', Q: '用化学方程式表示硫酸下列反应，并说明利用的硫酸性质：(1)(a)NaCl＋浓H₂SO₄加热→HCl (b)蔗糖加浓硫酸变黑 (c)锌加稀硫酸放 H₂ (d)Cu 加浓硫酸加热放 SO₂；(2)(a)～(d)分别属于 (ア)不挥发性 (イ)强酸性 (ウ)氧化作用 (エ)脱水作用 中的哪一种？',
    answerVector: ['NaCl＋H₂SO₄→NaHSO₄＋HCl', 'C₁₂H₂₂O₁₁→12C＋11H₂O', 'Zn＋H₂SO₄→ZnSO₄＋H₂', 'Cu＋2H₂SO₄→CuSO₄＋2H₂O＋SO₂', 'ア', 'エ', 'イ', 'ウ'], N: 8,
    answerJp: '(1)(a)NaCl＋H₂SO₄→NaHSO₄＋HCl (b)C₁₂H₂₂O₁₁→12C＋11H₂O (c)Zn＋H₂SO₄→ZnSO₄＋H₂ (d)Cu＋2H₂SO₄→CuSO₄＋2H₂O＋SO₂ (2)(a)ア (b)エ (c)イ (d)ウ',
    explCn: '浓硫酸不挥发性使 HCl 游离（(a)ア）；脱水作用使蔗糖碳化（(b)エ）；稀硫酸强酸性放 H₂（(c)イ）；热浓硫酸氧化性使 Cu 溶解放 SO₂（(d)ウ）。',
    issues: [],
  },
  {
    code: 'chem-che9-qE4', category: '基本例題', topic: T_IND, subtopics: S_IND,
    optMode: 'multi', Q: '填空：氨工业上用催化剂使空气中的(ア)在高压高温下与(イ)反应合成，此法称(ウ)法。氨与硫酸反应生成的(エ)、氨与 CO₂ 反应生成的(オ)用作氮肥。氨催化氧化（催化剂(カ)）生成(キ)，(キ)常温与氧反应变成(ク)色的(ケ)，溶于水得硝酸，此硝酸制法称(コ)法。',
    answerVector: ['窒素', '水素', 'ハーバー・ボッシュ', '硫酸アンモニウム', '尿素', '白金', '一酸化窒素', '赤褐', '二酸化窒素', 'オストワルト'], N: 10,
    answerJp: '(ア)窒素 (イ)水素 (ウ)ハーバー・ボッシュ (エ)硫酸アンモニウム (オ)尿素 (カ)白金 (キ)一酸化窒素 (ク)赤褐 (ケ)二酸化窒素 (コ)オストワルト',
    explCn: '哈伯-博施法 N₂＋3H₂⇌2NH₃；氮肥：硫酸铵(硫安)、尿素。奥斯特瓦尔德法：4NH₃＋5O₂→4NO＋6H₂O（Pt 催化），2NO＋O₂→2NO₂（赤褐），3NO₂＋H₂O→2HNO₃＋NO。',
    issues: [],
  },

  // ---- 基本問題 ----
  {
    code: 'chem-che9-qB1', category: '基本問題', topic: T_FAM, subtopics: S_ALL,
    optMode: 'multi', Q: '第 6 周期周期表填空。(1)元素按(a)顺序排列，横行为(b)，竖列为(c)，性质相似属于同一(d)。最左端(ア)是(e)(称)，易成(f)价(g)离子；最右端(キ)称(h)不活泼；(キ)左侧(カ)称(i)，易成(j)价(k)离子。(2)(a)金属元素 (b)迁移元素 (c)碱土金属 各属于(ア)～(キ)何处？(3)(a)Kr (b)Fe (c)P (d)Pb 各属于(ア)～(キ)何处？',
    answerVector: ['陽子の数（原子番号）', '周期', '族', '族', 'アルカリ金属元素', '1', '陽', '貴ガス元素（希ガス元素）', 'ハロゲン元素', '1', '陰', 'ア、イ、ウ、エ', 'ウ', 'イ', 'キ', 'ウ', 'オ', 'エ'], N: 18,
    answerJp: '(1)(a)陽子の数（原子番号） (b)周期 (c)族 (d)族 (e)アルカリ金属元素 (f)1 (g)陽 (h)貴ガス元素 (i)ハロゲン元素 (j)1 (k)陰 (2)(a)ア,イ,ウ,エ (b)ウ (c)イ (3)(a)キ (b)ウ (c)オ (d)エ',
    explCn: '碱金属易成 1 价阳离子；贵气体惰性；卤素易成 1 价阴离子。周期表：1族侧为金属(アイウエ)、3~12 族中(ウ)为过渡元素、2 族为碱土金属(イ)。Kr 在第 4 周期 18 族(キ)、Fe 为过渡元素(ウ)、P 为 15 族(オ)、Pb 为 14 族金属(エ)。',
    issues: [],
  },
  {
    code: 'chem-che9-qB2', category: '基本問題', topic: T_FAM, subtopics: S_ALL,
    optMode: 'multi', Q: '从第 3 周期元素中选出符合下列叙述的全部元素（元素符号）：(1)价电子数 5 (2)电离能最小 (3)单质为金属 (4)单质为双原子分子气体 (5)最大氧化数 +6 (6)氧化物为碱性氧化物 (7)氢化物显酸性',
    answerVector: ['P', 'Na', 'Na、Mg、Al', 'Cl', 'S', 'Na、Mg', 'S、Cl'], N: 7,
    answerJp: '(1)P (2)Na (3)Na、Mg、Al (4)Cl (5)S (6)Na、Mg (7)S、Cl',
    explCn: '价电子数=族序号：P(5)。Na 电离能最小（碱金属）。金属只有 Na/Mg/Al。Cl₂ 为双原子分子气体。S 最高+6。Na₂O/MgO 碱性。H₂S、HCl 酸性。',
    issues: [],
  },
  {
    code: 'chem-che9-qB3', category: '基本問題', topic: T_FAM, subtopics: S_1,
    optMode: 'multi', Q: '填空：实验室中氢气用比氢( a )高的金属（锌或铁）与酸反应、或水的( b )制得；工业上用( c )与水蒸气反应制氢。氢是最( d )的气体，分子量 2.0。热氧化铜(Ⅱ)中通氢，氢起( e )作用，生成铜与( f )。',
    answerVector: ['イオン化傾向', '電気分解', '炭化水素', '軽', '還元', '水'], N: 6,
    answerJp: '(a)イオン化傾向 (b)電気分解 (c)炭化水素 (d)軽 (e)還元 (f)水',
    explCn: '比 H 活泼的金属（Zn/Fe）置换酸中 H⁺ 放出 H₂，或用 NaOH 电解水；工业 CH₄＋H₂O→CO＋3H₂。H₂ 密度最小。CuO＋H₂→Cu＋H₂O（H₂ 作还原剂）。',
    issues: [],
  },
  {
    code: 'chem-che9-qB4', category: '基本問題', topic: T_FAM, subtopics: S_8,
    optMode: 'multi', Q: '填空/选择：He、Ne、Ar、Kr 属周期表(a)族，(b)元素。He 最外层电子(c)个，Ne/Ar/Kr 最外层(d)个，价电子(e)个，反应性{f：高・低}，与其他元素{g：易化合・几乎不化合}。单质作为{h：双原子分子・单原子分子}微量存在。',
    answerVector: ['18', '貴ガス', '2', '8', '0', '低く', 'ほとんどつくらない', '単原子分子'], N: 8,
    answerJp: '(a)18 (b)貴ガス（希ガス） (c)2 (d)8 (e)0 (f)低く (g)ほとんどつくらない (h)単原子分子',
    explCn: 'He 为 K 层 2 电子（密闭壳），其余最外层 8 电子（类密闭），价电子计 0、反应性低；单质为单原子分子。',
    issues: [],
  },
  {
    code: 'chem-che9-qB5', category: '基本問題', topic: T_FAM, subtopics: S_7,
    optMode: 'multi', Q: '(1)填空：卤素属(a)族，易成(b)价(c)离子，单质由(d)原子分子组成且都有色。(2)写出 F₂、Cl₂、Br₂、I₂ 常温的状态与颜色。',
    answerVector: ['17', '1', '陰', '二', '気体・淡黄色', '気体・黄緑色', '液体・赤褐色', '固体・黒紫色'], N: 8,
    answerJp: '(1)(a)17 (b)1 (c)陰 (d)二 (2)F₂ 気体・淡黄色、Cl₂ 気体・黄緑色、Br₂ 液体・赤褐色、I₂ 固体・黒紫色',
    explCn: '卤素 17 族、得 1 电子成 1 价阴离子、单质为双原子分子。F₂ 气淡黄、Cl₂ 气黄绿、Br₂ 液赤褐、I₂ 固黑紫。',
    issues: [],
  },
  {
    code: 'chem-che9-qB12', category: '基本問題', topic: T_FAM, subtopics: S_7,
    optMode: 'multi', Q: '氯气发生装置。(1)MnO₂ 加浓盐酸加热制 Cl₂ 的化学方程式。(2)此时 MnO₂ 起什么作用？(3)洗气瓶(A)、(B)分别装什么液体、各起什么作用？(4)(C)处捕集 Cl₂ 的方法名称及理由。',
    answerVector: ['MnO₂＋4HCl→MnCl₂＋2H₂O＋Cl₂', '酸化剤として（酸化作用）', '水・未反応の塩化水素を除く', '濃硫酸・水蒸気を除く', '下方置換', '塩素は水に溶け空気より重いから'], N: 6,
    answerJp: '(1)MnO₂＋4HCl→MnCl₂＋2H₂O＋Cl₂ (2)酸化剤 (3)(A)水・未反応の塩化水素を除く、(B)濃硫酸・水蒸気を除く (4)下方置換・塩素は水に溶け空気より重いから',
    explCn: 'MnO₂ 为氧化剂（Mn 由+4 降为+2，HCl 氧化成 Cl₂）。先通水除去 HCl，再过浓硫酸吸水。Cl₂ 溶于水且比空气重，用向下排气法（下方置換）。',
    issues: [],
  },
  {
    code: 'chem-che9-qB13', category: '基本問題', topic: T_FAM, subtopics: S_7,
    optMode: 'multi', Q: '填空/选择：(a)族与氢的化合物 HF、HCl、HBr、HI 均{b：无臭・刺激臭}的{c：无色・有色}的{d：固体・液体・气体}。HCl、HBr、HI 分子量增大沸点{e：变低・变高}，但 HF 沸点比 HCl 等{f：低・高}，因 HF 分子间形成(g)键。其中(h)溶液仅呈弱酸性，其他为强酸；(i)侵蚀玻璃，用聚乙烯瓶保存。',
    answerVector: ['17', '刺激臭', '無色', '気体', '高くなる', '高い', '水素', 'HF', 'HF'], N: 9,
    answerJp: '(a)17 (b)刺激臭 (c)無色 (d)気体 (e)高くなる (f)高い (g)水素 (h)HF (i)HF',
    explCn: 'HF 因氢键沸点异常高（20℃）；氟化氢是唯一弱酸且侵蚀玻璃。卤化氢均无色、刺激臭气体。',
    issues: [],
  },
  {
    code: 'chem-che9-qB14', category: '基本問題', topic: T_FAM, subtopics: S_6,
    optMode: 'multi', Q: '填空/写式：氧工业上由(a)分馏制得，实验室用 H₂O₂＋MnO₂ 或 KClO₃＋MnO₂ 加热。①②中 MnO₂ 为(b)。平流层上部吸收太阳(c)线使氧气生成臭氧，臭氧是氧的(d)，具特异臭的(e)色气体，分解性强，氧化作用(f)强，使湿润 KI-淀粉试纸变(g)色。写出①②③的反应式。',
    answerVector: ['液体空気', '触媒', '紫外', '同素体', '淡青', '酸化', '青', '2H₂O₂→2H₂O＋O₂', '2KClO₃→2KCl＋3O₂', '3O₂→2O₃'], N: 10,
    answerJp: '(a)液体空気 (b)触媒 (c)紫外 (d)同素体 (e)淡青 (f)酸化 (g)青 ①2H₂O₂→2H₂O＋O₂ ②2KClO₃→2KCl＋3O₂ ③3O₂→2O₃',
    explCn: 'O₂ 由液态空气分馏。H₂O₂、KClO₃ 均靠 MnO₂ 催化分解。臭氧为氢的同素体、淡青色、强氧化性使 KI 中的 I⁻ 氧化成 I₂ 而淀粉变蓝。',
    issues: [],
  },
  {
    code: 'chem-che9-qB15', category: '基本問題', topic: T_FAM, subtopics: S_6,
    optMode: 'multi', Q: '填空/写式：SO₂ 为(a)色、刺激臭的(b)毒气体。实验室由①亚硫酸钠＋硫酸②铜＋热浓硫酸制得。SO₂ (c)作用强具漂白性；④与碘液反应生成 HI；⑤对 H₂S 作(d)剂生成黄白固体。写出①～⑤反应式（③为离子式）。',
    answerVector: ['無', '有', '還元', '酸化', 'Na₂SO₃＋H₂SO₄→Na₂SO₄＋H₂O＋SO₂', 'Cu＋2H₂SO₄→CuSO₄＋2H₂O＋SO₂', 'SO₂＋H₂O⇌H⁺＋HSO₃⁻', 'SO₂＋I₂＋2H₂O→2HI＋H₂SO₄', 'SO₂＋2H₂S→3S＋2H₂O'], N: 9,
    answerJp: '(a)無 (b)有 (c)還元 (d)酸化 ①Na₂SO₃＋H₂SO₄→Na₂SO₄＋H₂O＋SO₂ ②Cu＋2H₂SO₄→CuSO₄＋2H₂O＋SO₂ ③SO₂＋H₂O⇌H⁺＋HSO₃⁻ ④SO₂＋I₂＋2H₂O→2HI＋H₂SO₄ ⑤SO₂＋2H₂S→3S＋2H₂O',
    explCn: 'SO₂ 无色刺激臭气体、有毒性。与 I₂（被还原）反应时 SO₂ 作还原剂；对强还原剂 H₂S 则 SO₂ 作氧化剂。',
    issues: [],
  },
  {
    code: 'chem-che9-qB16', category: '基本問題', topic: T_FAM, subtopics: S_6,
    optMode: 'multi', Q: 'A～D 是稀硫酸还是浓硫酸？(1)A 用作干燥剂。(2)蔗糖中加 B 会碳化。(3)锌或铁溶于 C 并放(a)气体。(4)铜或银溶于加热的 D 并放(b)气体。',
    answerVector: ['濃硫酸', '濃硫酸', '希硫酸', '濃硫酸', '水素', '二酸化硫黄'], N: 6,
    answerJp: '(1)A 濃硫酸 (2)B 濃硫酸 (3)C 希硫酸・(a)水素 (4)D 濃硫酸・(b)二酸化硫黄',
    explCn: '吸湿性/脱水使浓硫酸作干燥剂并碳化蔗糖；稀硫酸强酸性与活泼金属放 H₂；热浓硫酸氧化性与 Cu/Ag 反应放 SO₂。',
    issues: [],
  },
  {
    code: 'chem-che9-qB17', category: '基本問題', topic: T_FAM, subtopics: S_5,
    optMode: 'multi', Q: '制氨装置（NH₄Cl＋Ca(OH)₂）。(1)试管内反应的化学方程式。(2)氨用向上排气法捕集的理由（约25字）。(3)碱石灰管的作用。(4)确认氨的 2 种方法及现象（各约25字）。',
    answerVector: ['2NH₄Cl＋Ca(OH)₂→2NH₃＋CaCl₂＋2H₂O', 'アンモニアは水によく溶け，空気よりも軽いため', '発生した気体に含まれる水分を吸収する', '濡らした赤色リトマス紙が青く変化する', '濃塩酸をつけたガラス棒で白煙が生じる'], N: 5,
    answerJp: '(1)2NH₄Cl＋Ca(OH)₂→2NH₃＋CaCl₂＋2H₂O (2)アンモニアは水によく溶け，空気よりも軽いため (3)発生した気体に含まれる水分を吸収する (4)濡らした赤色リトマス紙が青く変化する（濃塩酸のガラス棒で白煙）',
    explCn: '强碱与铵盐共热使弱碱 NH₃ 游离。NH₃ 极易溶于水不能用排水法、比空气轻用向上排气。碱石灰除水（NH₃ 不能与 CaCl₂、P₄O₁₀、浓硫酸接触）。NH₃ 显碱性使红石蕊变蓝；与 HCl 生成 NH₄Cl 白烟。',
    issues: [],
  },
  {
    code: 'chem-che9-qB18', category: '基本問題', topic: T_FAM, subtopics: S_5,
    optMode: 'simple', Q: '下列叙述含错误的是 2 项，选出：(ア)浓硝酸有氧化作用但稀硝酸没有 (イ)Fe、Al、Ni 溶于稀硝酸、不溶于浓硝酸 (ウ)一氧化氮由铜与稀硝酸作用产生 (エ)一氧化氮呈红褐色，接触空气立即氧化成无色二氧化氮与红褐色四氧化二氮',
    options: ['ア、エ', 'イ、ウ', 'ア、ウ', 'エ、ウ'], correctIndex: 0,
    answerJp: 'ア、エ',
    explCn: '(ア)错：稀硝酸也有氧化作用；生成的 N 氧化物：稀 HNO₃→NO、浓 HNO₃→NO₂。(ウ)对。Fe/Al/Ni 因钝化不溶于浓硝酸（对）。(エ)错：NO 无色，接触空气成红褐色 NO₂（NO₂ 部分二聚成无色 N₂O₄）。',
    issues: [],
  },
  {
    code: 'chem-che9-qB19', category: '基本問題', topic: T_FAM, subtopics: S_5,
    optMode: 'multi', Q: '填空/写式：磷蒸气隔绝空气通入水中得(a)。(a)为(b)毒，空气中易自燃故存于(c)中。(a)在密闭容器中长时间加热得空气稳定的(d)。(a)(d)互为(e)。①磷燃烧生成(f)色粉末的(g)；②(g)与热水反应生成(h)。写出①②反应式。',
    answerVector: ['黄リン', '有（猛毒）', '水', '赤リン', '同素体', '白', '十酸化四リン', 'リン酸', '4P＋5O₂→P₄O₁₀', 'P₄O₁₀＋6H₂O→4H₃PO₄'], N: 10,
    answerJp: '(a)黄リン (b)有（猛毒） (c)水 (d)赤リン (e)同素体 (f)白 (g)十酸化四リン (h)リン酸 ①4P＋5O₂→P₄O₁₀ ②P₄O₁₀＋6H₂O→4H₃PO₄',
    explCn: '黄リン P₄ 正四面体、剧毒、燃点 34℃ 自燃故水中保存；长时间加热变稳定红リン；两者为同素体。燃烧生成白色 P₄O₁₀（酸性氧化物），热水中生成 H₃PO₄。',
    issues: [],
  },
  {
    code: 'chem-che9-qB6', category: '基本問題', topic: T_FAM, subtopics: S_5,
    optMode: 'multi', Q: '(1)肥料三要素的元素名。(2)(a)果实・种子生育 (b)根发育与抵抗力 (c)叶茎茂盛 各与三要素中哪个相关？(3)三要素各以何种离子被根吸收？各举 1 例。',
    answerVector: ['窒素、リン、カリウム', 'リン', 'カリウム', '窒素', 'NH₄⁺', 'H₂PO₄⁻', 'K⁺'], N: 7,
    answerJp: '(1)窒素、リン、カリウム (2)(a)リン (b)カリウム (c)窒素 (3)窒素 NH₄⁺、リン H₂PO₄⁻、カリウム K⁺',
    explCn: 'N 促叶茎、P 促果实种子（核酸）、K 促根与抗病。吸收形态：NH₄⁺/NO₃⁻、H₂PO₄⁻、K⁺。',
    issues: [],
  },
  {
    code: 'chem-che9-qB7', category: '基本問題', topic: T_FAM, subtopics: S_4,
    optMode: 'multi', Q: '填空/选图/说明：碳的(a)中，极硬的(b)色结晶(c)、良导热导(d)的(e)色结晶(f)。无结晶结构的烟灰(g)、球形分子式 C₆₀ 等的(h)，以及(f)一层卷成圆筒的(i)。(2)(c)(f)(h)(i)的结构图各是(ア)～(エ)中哪个？(3)说明(c)与(f)电导性的差异（结合共价键电子数）。',
    answerVector: ['同素体', '無', 'ダイヤモンド', '電気', '黒', '黒鉛', '無定形炭素', 'フラーレン', 'カーボンナノチューブ', 'イ', 'ア', 'ウ', 'エ', 'ダイヤモンドは4個の価電子すべてを共有結合に使い電気を通さないが，黒鉛は3個を共有結合に使い残り1個が自由に動くため電気を通す'], N: 14,
    answerJp: '(1)(a)同素体 (b)無 (c)ダイヤモンド (d)電気 (e)黒 (f)黒鉛 (g)無定形炭素 (h)フラーレン (i)カーボンナノチューブ (2)(c)イ (f)ア (h)ウ (i)エ (3)ダイヤモンドは4個の価電子すべてを共有結合に使い電気を通さない。黒鉛は4個中3個を共有結合に使い，残り1個が結晶内を自由に動くため電気を通す',
    explCn: '金刚石 sp³ 全共价键、绝缘且极硬；黑铅笔 4 电子中 3 个成键、1 个自由电子导电。富勒烯球形（C₆₀）、碳纳米管圆柱形。',
    issues: [],
  },
  {
    code: 'chem-che9-qB20', category: '基本問題', topic: T_FAM, subtopics: S_4,
    optMode: 'multi', Q: '填空/写式：①CO₂ 实验室常用石灰石加(a)制取，含(b)杂质，通 NaHCO₃ 溶液除去。CO 实验室用(c)加(d)加热制得。CO₂ 无色无臭，CO 为(e)色(f)臭；CO₂ 捕集用(g)，CO 用(h)。②(i)水中通 CO₂ 变白浊，继续通又变透明。写出①②反应式。',
    answerVector: ['塩酸', '塩化水素', 'ギ酸', '濃硫酸', '無', '無', '下方置換', '水上置換', '石灰', 'CaCO₃＋2HCl→CaCl₂＋H₂O＋CO₂', 'Ca(OH)₂＋CO₂→CaCO₃＋H₂O'], N: 11,
    answerJp: '(a)塩酸 (b)塩化水素 (c)ギ酸 (d)濃硫酸 (e)無 (f)無 (g)下方置換 (h)水上置換 (i)石灰 ①CaCO₃＋2HCl→CaCl₂＋H₂O＋CO₂ ②Ca(OH)₂＋CO₂→CaCO₃＋H₂O',
    explCn: 'CO₂ 溶于水且比空气重→下方置换；CO 难溶于水→水上置换；用 NaHCO₃ 除 HCl。CO₂ 使石灰水白浊（CaCO₃），过量再溶成 Ca(HCO₃)₂ 复清。',
    issues: [],
  },
  {
    code: 'chem-che9-qB8', category: '基本問題', topic: T_FAM, subtopics: S_4,
    optMode: 'multi', Q: '填空：Si 单质为(a)结晶；氧化物(b)亦为(a)结晶，天然以(c)、石英、硅砂产出。(b)与 NaOH、Na₂CO₃ 共热得(d)；再加水加热成粘稠液体称(e)。',
    answerVector: ['共有結合', '二酸化ケイ素', '水晶', 'ケイ酸ナトリウム', '水ガラス'], N: 5,
    answerJp: '(a)共有結合 (b)二酸化ケイ素 (c)水晶 (d)ケイ酸ナトリウム (e)水ガラス',
    explCn: 'Si 与 SiO₂ 均为共价晶体。SiO₂＋2NaOH→Na₂SiO₃＋H₂O；Na₂SiO₃ 水溶液为水玻璃。',
    issues: [],
  },
  {
    code: 'chem-che9-qB9', category: '基本問題', topic: T_MAT, subtopics: S_MAT,
    optMode: 'multi', Q: '填空/选择：粘土成型 700～1000℃ 烧成物称(a)，空隙多渗水，用主成分(b)的釉料涂面防渗。陶土（粘土＋硅砂＋长石）1150～1300℃ 烧成(c)；增长石 1300～1450℃ 烧成(d)，含 SiO₂ 结晶，敲击声清脆。石灰石・粘土・石膏高温处理成粉末(e)，加砂石・水・砂固化得(f)。(f)难与{g：酸・碱}反应、易与{h：酸・碱}反应。',
    answerVector: ['土器', 'ガラス', '陶器', '磁器', 'セメント', 'コンクリート', '塩基', '酸'], N: 8,
    answerJp: '(a)土器 (b)ガラス (c)陶器 (d)磁器 (e)セメント (f)コンクリート (g)塩基 (h)酸',
    explCn: '陶土→陶器→磁器温度递增；水泥加砂石水成混凝土。混凝土含 Ca(OH)₂ 等碱性，耐碱不耐酸（酸雨侵蚀）。',
    issues: [],
  },
  {
    code: 'chem-che9-qB10', category: '基本問題', topic: T_FAM, subtopics: S_ALL,
    optMode: 'multi', Q: '下列(1)～(7)操作产生气体的分子式，及反应分类（氧化还原 A／非氧化还原（弱酸游离）B／非氧化还原（弱碱游离）C）：(1)Cu＋浓HNO₃ (2)Cu＋稀HNO₃ (3)MnO₂＋浓HCl 加热 (4)FeS＋稀HCl (5)Cu＋浓H₂SO₄ 加热 (6)NH₄Cl＋Ca(OH)₂ 加热 (7)CaCO₃＋HCl',
    answerVector: ['NO₂・A', 'NO・A', 'Cl₂・A', 'H₂S・B', 'SO₂・A', 'NH₃・C', 'CO₂・B'], N: 7,
    answerJp: '(1)NO₂・A (2)NO・A (3)Cl₂・A (4)H₂S・B (5)SO₂・A (6)NH₃・C (7)CO₂・B',
    explCn: '(1)～(3)(5) 金属/氯系氧化还原产生 NO₂、NO、Cl₂、SO₂；(4)(7) 弱酸游离出 H₂S、CO₂（B）；(6) 弱碱 NH₃ 游离（C）。',
    issues: [],
  },
  {
    code: 'chem-che9-qB11', category: '基本問題', topic: T_FAM, subtopics: S_ALL,
    optMode: 'multi', Q: '(1)从(ア)CO(イ)HCl(ウ)N₂(エ)NH₃(オ)H₂S(カ)SO₂ 中选出符合的：(a)刺激臭、水溶液碱性、红石蕊变蓝 (b)腐卵臭、水溶液酸性、有还原性 (c)无臭、难溶于水、点火青焰燃烧。(2)各气体最适捕集法（①下方置换②上方置换③水上置换）？',
    answerVector: ['エ', 'オ', 'ア', '③', '①', '③', '②', '①', '①'], N: 9,
    answerJp: '(1)(a)エ(NH₃) (b)オ(H₂S) (c)ア(CO) (2)(ア)CO→③ (イ)HCl→① (ウ)N₂→③ (エ)NH₃→② (オ)H₂S→① (カ)SO₂→①',
    explCn: 'NH₃ 溶于水呈碱性（红→蓝）；H₂S 腐卵臭、酸性还原；CO 可燃且难溶（水上置换）。捕集：难溶→水上；溶且比空气轻→上方；溶且比空气重→下方。',
    issues: [],
  },

  // ---- 応用例題 ----
  {
    code: 'chem-che9-qA1', category: '応用例題', topic: T_FAM, subtopics: S_ALL,
    optMode: 'multi', Q: '判断下列气体（CO、CO₂、N₂、NH₃、H₂S、NO、NO₂）：(1)可用水上置换捕集 (2)有色 (3)使湿红石蕊变蓝 (4)通石灰水产生白沉淀 (5)加入含 Ag⁺ 的酸性溶液中产生黑色沉淀。',
    answerVector: ['CO、N₂、NO', 'NO₂', 'NH₃', 'CO₂', 'H₂S'], N: 5,
    answerJp: '(1)CO、N₂、NO (2)NO₂ (3)NH₃ (4)CO₂ (5)H₂S',
    explCn: '水上置换需难溶：CO/N₂/NO。有色气体仅 NO₂（红褐）。NH₃ 碱性。CO₂＋Ca(OH)₂→CaCO₃ 白沉淀。H₂S＋Ag⁺→Ag₂S 黑沉淀。',
    issues: [],
  },

  // ---- 応用問題 ----
  {
    code: 'chem-che9-qA2', category: '応用問題', topic: T_FAM, subtopics: S_ALL,
    optMode: 'multi', Q: 'N、O、F、Ne、Al、Si、P、S、Cl、Ar：(1)分子式 X₂、X₃、X₄ 表示的单体的名称与化学式。(2)(a)单质熔点最高的元素 (b)形成 +1,+3,+5,+7 含氧酸的元素 (c)有同素体且氧化物为酸雨主因的元素 (d)地壳中质量存在率前 3 的元素。(3)Ga、In（13 族，第 4、5 周期）的原子序数。',
    answerVector: ['窒素N₂・酸素O₂・フッ素F₂・塩素Cl₂', 'オゾンO₃', '黄リンP₄', 'ケイ素', '塩素', '硫黄', '酸素・ケイ素・アルミニウム', '31', '49'], N: 9,
    answerJp: '(1)X₂：N₂、O₂、F₂、Cl₂ X₃：O₃ X₄：P₄ (2)(a)ケイ素 (b)塩素 (c)硫黄 (d)酸素・ケイ素・アルミニウム (3)Ga 31、In 49',
    explCn: '双原子单质：N₂/O₂/F₂/Cl₂；三原子 O₃；四原子 P₄。Si 共价晶体熔点最高。Cl 含氧酸 HClO(+1)~HClO₄(+7)。硫的 SOx 是酸雨主因。地壳丰度前 3：O、Si、Al。Ga=Al(13)＋18=31，In=31＋18=49。',
    issues: [],
  },
  {
    code: 'chem-che9-qA8', category: '応用問題', topic: T_FAM, subtopics: S_6,
    optMode: 'multi', Q: '酸素と硫黄：(1)O、S 属(a)族，各有价电子(b)个，得(c)电子成(c)价阴离子。O 的同素体 O₂ 与(d)，S 有斜方硫黄与(f)等。(2)水沸点 100℃ 而 H₂S 为 -61℃，高的理由（约20字）。(3)②硫酸的工业制法名称。(4)S 9.6kg 全变 H₂SO₄ 时 98% 硫酸得多少 kg？',
    answerVector: ['16', '6', '2', 'オゾン', '同素体', '単斜硫黄（ゴム状硫黄）', '三酸化硫黄', '分子間に水素結合が生じているから', '接触式硫酸製造法（接触法）', '30kg'], N: 10,
    answerJp: '(1)(a)16 (b)6 (c)2 (d)オゾン (e)同素体 (f)単斜硫黄（ゴム状硫黄） (g)三酸化硫黄 (2)分子間に水素結合が生じているから (3)接触式硫酸製造法（接触法） (4)30kg',
    explCn: 'O/S 为 16 族、价电子 6、得 2 电子成 2 价阴离子。水因氢键沸点异常高。硫酸经 V₂O₅ 催化 SO₂→SO₃→H₂SO₄。n(S)=9.6×10³/32=300mol→H₂SO₄ 300mol×98g=29.4kg→98% 硫酸 30kg。',
    issues: [],
  },
  {
    code: 'chem-che9-qA3', category: '応用問題', topic: T_FAM, subtopics: S_5_6_7,
    optMode: 'multi', Q: '填空：洁雨水 pH 约 5.6，因空气中约 0.04% 的(a)溶于水。酸雨主因为(b)与(c)。(b)由(d)及煤炭中少量(e)燃烧产生，(d)精制时限制(e)≤0.01g/kg 即(f)ppm。(c)由燃料高温燃烧时(g)与 O₂ 反应生成，尾气用催化剂使 CO 与(c)反应生成(a)与(g)。(b)(c)在空气中氧化成强酸(h)(i)，若酸雨全由(h)造成、pH=4 时其浓度为(j)mol/L。',
    answerVector: ['二酸化炭素', '硫黄酸化物', '窒素酸化物', '石油', '硫黄', '10', '窒素', '硫酸', '硝酸', '5×10⁻⁵'], N: 10,
    answerJp: '(a)二酸化炭素 (b)硫黄酸化物 (c)窒素酸化物 (d)石油 (e)硫黄 (f)10 (g)窒素 (h)硫酸 (i)硝酸 (j)5×10⁻⁵ mol/L',
    explCn: 'CO₂ 使雨水略呈酸性（pH5.6）。酸雨主因 SOx、NOx：SOx 来自含硫燃料，NOx 来自 N₂ 高温氧化。尾气 2CO＋2NO→2CO₂＋N₂。SOx→H₂SO₄、NOx→HNO₃。pH=4→[H⁺]=10⁻⁴，二元强酸 H₂SO₄ 浓度=10⁻⁴/2=5×10⁻⁵ mol/L。',
    issues: [],
  },
  {
    code: 'chem-che9-qA9', category: '応用問題', topic: T_FAM, subtopics: S_1_4_5,
    optMode: 'multi', Q: 'H₂、CO、NH₃ 混合气：通水充分吸收后，水溶液用 0.010 mol/L HCl 中和需 20mL；剩余气体干燥后完全燃烧，CaCl₂ 管增重 1.8mg，石灰水产生白沉淀 20mg。求各气体物质的量与混合气平均分子量。',
    answerVector: ['水素 1.0×10⁻⁴ mol', '一酸化炭素 2.0×10⁻⁴ mol', 'アンモニア 2.0×10⁻⁴ mol', '平均分子量 18'], N: 4,
    answerJp: '水素 1.0×10⁻⁴ mol、一酸化炭素 2.0×10⁻⁴ mol、アンモニア 2.0×10⁻⁴ mol、平均分子量 18',
    explCn: 'NH₃ 全溶：n=0.010×20/1000=2.0×10⁻⁴。燃烧后 H₂O 1.8mg→H₂ 1.0×10⁻⁴；CaCO₃ 20mg→CO 2.0×10⁻⁴。x:y:z=1:2:2→平均分子量=2×1/5＋28×2/5＋17×2/5=18。',
    issues: [],
  },
  {
    code: 'chem-che9-qA4', category: '応用問題', topic: T_MAT, subtopics: S_MAT,
    optMode: 'multi', Q: 'ガラス：(1)特定结晶结构不存在的(a)状态。(2)(b)含 Na 多(ウソーダ石灰)、(c)含 K(アカリ)、(d)含 B(オホウケイ酸)、(e)SiO₂ 高纯度(イ石英)、(f)高透明度屈折率(エ鉛)、(g)含金属氧化物着色剂(カ色)。(3)光ファイバー中心部用哪个？(4)实验器具常用哪个？(5)(a)不能用玻璃瓶存氢氟酸的理由 (b)不能用玻璃塞瓶存 NaOH 水溶液的理由。',
    answerVector: ['アモルファス（非晶質）', 'ウ', 'ア', 'オ', 'イ', 'エ', 'カ', 'イ', 'オ', 'フッ化水素酸がガラスを侵すため', '栓と瓶が固着してしまうため'], N: 11,
    answerJp: '(1)アモルファス（非晶質） (2)(b)ウ (c)ア (d)オ (e)イ (f)エ (g)カ (3)イ (4)オ (5)(a)フッ化水素酸がガラスを侵すため (b)栓と瓶が固着してしまうため',
    explCn: '玻璃为无定形硅酸盐。石英玻璃（SiO₂ 纯）耐热与低膨胀；光导纤维用高纯石英玻璃（イ）；实验器具常用耐热耐蚀的硼硅玻璃（オ）。HF 与 SiO₂ 反应侵蚀玻璃；NaOH 与 SiO₂ 成 Na₂SiO₃ 使磨砂塞与瓶固着。',
    issues: [],
  },
  {
    code: 'chem-che9-qA5', category: '応用問題', topic: T_FAM, subtopics: S_ALL,
    optMode: 'multi', Q: '(1)常温常压下双原子分子气体单质 A、B、C，A 与 B 混合即爆炸生成双原子分子化合物 D；B 与 C 混合点火爆炸生成三原子分子 E；A 与液体 E 剧烈反应生成 C 与 D。求 A～E 分子式。(2)判断 a～j 正误：(a)Ar 不燃用于飞艇 (b)NaClO 加盐酸生 Cl₂ (c)氯的含氧酸中 HClO₄ 氧化力与酸性都最强 (d)单斜硫黄常温放置变斜方硫黄 (e)KNO₃ 与浓硫酸不反应 (f)黄リン与水反应故密封保藏 (g)纯硅加微量磷电导变小 (h)SiO₂ 中 Si 1 原子结合 2 个 O 原子 (i)尿素水解呈酸是不良肥料 (j)磷酸钙直接作肥料有效。',
    answerVector: ['F₂', 'H₂', 'O₂', 'HF', 'H₂O', '誤', '正', '誤', '正', '誤', '誤', '誤', '誤', '誤', '誤'], N: 15,
    answerJp: '(1)A F₂、B H₂、C O₂、D HF、E H₂O (2)(a)誤 (b)正 (c)誤 (d)正 (e)誤 (f)誤 (g)誤 (h)誤 (i)誤 (j)誤',
    explCn: 'H₂＋F₂ 混合即爆→D=HF；2H₂＋O₂ 点火爆→E=H₂O；2F₂＋2H₂O→O₂＋4HF。正误：(b)ClO⁻ 氧化 Cl⁻→Cl₂ 正；(d)斜方硫黄常温最稳正；余皆误（Ar 比空气重不用于气艇；HNO₃ 挥发故 HNO₃ 盐与浓硫酸反应；SiO₂ 组成 Si:O=1:2 但为 SiO₄ 四面体；尿素不水解中性；Ca₃(PO₄)₂ 难溶不可直接作肥料）。',
    issues: [],
  },
  {
    code: 'chem-che9-qA6', category: '応用問題', topic: T_FAM, subtopics: S_1,
    optMode: 'multi', Q: 'キップ装置制氢。(1)锌粒与稀硫酸反应的化学方程式。(2)可替代锌的是 Fe、Pb、Cu 中哪个？(3)关旋塞停止发生氢气时，装置内稀硫酸的移动方向（如 A→B→C）？(4)(b)试管（ふたまた試験管）中锌粒与稀硫酸分别放入 E、F 的哪个？',
    answerVector: ['Zn＋H₂SO₄→ZnSO₄＋H₂', 'Fe', 'B→C→A', '亜鉛粒 F・希硫酸 E'], N: 4,
    answerJp: '(1)Zn＋H₂SO₄→ZnSO₄＋H₂ (2)Fe (3)B→C→A (4)亜鉛粒 F・希硫酸 E',
    explCn: '活泼金属置换 H⁺：Zn/Fe 均可，Pb 表面生成难溶 PbSO₄ 反应停止，Cu 不反应。关旋塞→B 内 H₂ 压升→稀硫酸被压回 A（B→C→A）。ふたまた試験管固体（锌粒）放凹槽侧 F、液体放 E 侧。',
    issues: [],
  },
  {
    code: 'chem-che9-qA7', category: '応用問題', topic: T_FAM, subtopics: S_ALL,
    optMode: 'multi', Q: '表中 5 种气体：(1)①～④试剂（NaCl、FeS、MnO₂、Na₂SO₃ 中选）。(2)FeS＋稀硫酸、MnO₂＋浓盐酸 的反应式。(3)各气体特征 (a)～(g) 的对应气体：(a)无色刺激臭、强酸 (b)无色难溶、空气接触变红褐 (c)无色无臭、与氧混合点火爆炸 (d)黄绿色刺激臭 (e)无色腐卵臭 (f)红褐刺激臭、酸性 (g)无色刺激臭、硫酸原料。(4)Zn＋稀硫酸反应式；标准态 1.12L 氢气需 2.0mol/L 稀硫酸多少 mL？',
    answerVector: ['FeS', 'NaCl', 'Na₂SO₃', 'MnO₂', 'FeS＋H₂SO₄→FeSO₄＋H₂S', 'MnO₂＋4HCl→MnCl₂＋2H₂O＋Cl₂', '塩化水素', '一酸化窒素', '水素', '塩素', '硫化水素', '二酸化窒素', '二酸化硫黄', 'Zn＋H₂SO₄→ZnSO₄＋H₂', '25mL'], N: 15,
    answerJp: '(1)①FeS ②NaCl ③Na₂SO₃ ④MnO₂ (2)FeS＋H₂SO₄→FeSO₄＋H₂S、MnO₂＋4HCl→MnCl₂＋2H₂O＋Cl₂ (3)(a)塩化水素 (b)一酸化窒素 (c)水素 (d)塩素 (e)硫化水素 (f)二酸化窒素 (g)二酸化硫黄 (4)Zn＋H₂SO₄→ZnSO₄＋H₂、25mL',
    explCn: 'H₂S 用 FeS＋稀硫酸（弱酸游离）；HCl 用 NaCl＋浓硫酸（不挥发酸游离）；SO₂ 用 Na₂SO₃＋稀硫酸；Cl₂ 用 MnO₂＋浓盐酸。特征：强酸→HCl；接触空气红褐→NO；爆鸣气→H₂；黄绿→Cl₂；腐卵→H₂S；红褐→NO₂；硫酸原料→SO₂。n(H₂)=1.12/22.4=0.05mol→V=0.05/2.0=0.025L=25mL。',
    issues: [],
  },
];

function build() {
  const labels = ['(a)', '(b)', '(c)', '(d)', '(e)', '(f)', '(g)', '(h)', '(i)', '(j)', '(k)', '(l)', '(m)', '(n)', '(o)', '(p)', '(q)', '(r)'];
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
  console.log('che9 drafts:', d.length);
  const s = new Map();
  d.forEach((x) => s.set(x.generationStatus, (s.get(x.generationStatus) || 0) + 1));
  console.log('status:', Object.fromEntries(s));
  const nat = d.filter((x) => x.options.length > 0 && x.correctIndex !== null);
  console.log('有选项+答案的题:', nat.map((x) => `${x.businessCode}(idx=${x.correctIndex})`).join(', '));
}