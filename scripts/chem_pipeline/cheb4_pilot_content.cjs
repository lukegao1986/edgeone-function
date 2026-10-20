#!/usr/bin/env node
/**
 * cheb4_pilot_content.cjs — cheb4（第4章 物質量と化学反応式）内容定义
 *
 * 源：cheb4_题目.md + cheb4_解析.md（仅此两文件，其余为过程文件）
 * 考纲：ejuSyllabus.ts
 *  - chem_1_4_1（物質量など）：chem_1_4_1_01 原子量・分子量・式量 / chem_1_4_1_02 物質量と濃度
 *  - chem_2_1_1（化学反応）：chem_2_1_1_01 化学反応式 / chem_2_1_1_02 化学反応の量的関係
 *
 * 变通（沿用 che2~che17 规则）：
 *  - 記述/理由题（qB7 イオンの式量、qB18 溶解度差の説明・再結晶手順）→「参考答案要点」整体作槽位；
 *  - 图形選択题（qB19 水素発生量グラフ）→「記号＋図の特徴（傾き・原点通過）描述」作 simple 选项；
 *  - 原书选项题（qB6 気体の分子量）→ optMode=multi、Q 中引用原选项、answerVector 用選択肢記号「工」「ア」「ウ」；
 *  - OCR 字形（「工」=エ、「才」=オ、「÷」=≒、标题「基本例题」=基本例題、「S^{1+}」）按項目规则保留原样并在 issues 标注。
 */
'use strict';

const T_MASS = 'chem_1_4_1';   // 物質量など
const S_REL = ['chem_1_4_1_01'];  // 原子量・分子量・式量
const S_AMT = ['chem_1_4_1_02'];  // 物質量と濃度
const T_RXN = 'chem_2_1_1';   // 化学反応
const S_EQ = ['chem_2_1_1_01'];   // 化学反応式
const S_QT = ['chem_2_1_1_02'];   // 化学反応の量的関係

const CONTENT = [
  // ---- 基礎 CHECK ----
  {
    code: 'chem-cheb4-qC1', category: '基礎 CHECK', topic: T_MASS, subtopics: S_REL,
    optMode: 'simple', Q: '同位体の相対質量と自然界における存在比から求められる，各元素の原子の相対質量の平均値を何というか。',
    options: ['原子量', '質量数', '式量', 'モル質量'], correctIndex: 0,
    answerJp: '原子量',
    explCn: '各元素について「同位体の相対質量×存在比」の和で求められる平均の相対質量を原子量という。質量数は陽子と中性子の数の和，式量は組成式から求まる相対質量，モル質量は 1 mol 当たりの質量（g/mol）である。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qC2', category: '基礎 CHECK', topic: T_MASS, subtopics: S_AMT,
    optMode: 'simple', Q: '物質を構成する粒子 1 mol 当たりの質量を何というか。',
    options: ['モル質量', '原子量', '分子量', '密度'], correctIndex: 0,
    answerJp: 'モル質量',
    explCn: '物質 1 mol 当たりの質量をモル質量（単位 g/mol）という。モル質量は数値として原子量・分子量・式量に等しい。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qC3', category: '基礎 CHECK', topic: T_MASS, subtopics: S_AMT,
    optMode: 'multi', Q: '(1) 標準状態とはどんな温度・圧力の状態のことか。(2) 気体分子 1 mol が標準状態で占める体積は何 L か。',
    answerVector: ['0℃，1.013×10⁵Pa', '22.4L'], N: 2,
    answerJp: '(1) 0℃，1.013×10⁵Pa (2) 22.4L',
    explCn: '標準状態は 0℃（273 K），1.013×10⁵Pa（1 気圧）。気体の種類によらず，標準状態での気体 1 mol の体積（モル体積）はほぼ 22.4 L である。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qC4', category: '基礎 CHECK', topic: T_MASS, subtopics: S_AMT,
    optMode: 'simple', Q: '濃度 c [mol/L] の水溶液 V [L] 中に含まれる溶質の物質量はいくらか。文字式で表せ。',
    options: ['cV', 'c/V', 'V/c', 'cV の 100 分の 1'], correctIndex: 0,
    answerJp: 'cV',
    explCn: 'モル濃度×体積＝物質量。c [mol/L]×V [L]＝cV [mol]。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qC5', category: '基礎 CHECK', topic: T_RXN, subtopics: S_QT,
    optMode: 'multi', Q: 'アンモニアは窒素と水素から合成される（H=1.0，N=14）。(1) aN₂+bH₂→cNH₃ の係数 (a, b, c)。(2) 窒素 1.4 g から得られるアンモニアは何 g か。(3) 窒素 1.0 L から得られるアンモニアは何 L か。',
    answerVector: ['a=1, b=3, c=2', '1.7g', '2.0L'], N: 3,
    answerJp: '(1) a=1, b=3, c=2 (2) 1.7g (3) 2.0L',
    explCn: '(1) N₂+3H₂→2NH₃ の係数は a=1, b=3, c=2。(2) N₂ 1.4g＝1.4/28＝0.050mol → NH₃ は 0.10mol → 17×0.10＝1.7g。(3) 係数比 N₂:NH₃＝1:2 より，1.0 L×2＝2.0 L。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qC6', category: '基礎 CHECK', topic: T_RXN, subtopics: S_QT,
    optMode: 'simple', Q: '「水に含まれている酸素は，常に 89%（質量%）である。」ということを表している法則を何というか。',
    options: ['定比例の法則', '倍数比例の法則', '質量保存の法則', '気体反応の法則'], correctIndex: 0,
    answerJp: '定比例の法則',
    explCn: '1 つの化合物を構成する成分元素の質量比（質量組成）は，製法・起源・場所によらず常に一定であるという法則を定比例の法則（プルースト）という。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qC7', category: '基礎 CHECK', topic: T_MASS, subtopics: S_AMT,
    optMode: 'simple', Q: '¹²C 原子 1 個の質量は 2.0×10⁻²³ g である。¹²C 原子が何個集まると 12 g になるか。',
    options: ['6.0×10²³個', '6.0×10²²個', '1.2×10²³個', '2.4×10²³個'], correctIndex: 0,
    answerJp: '6.0×10²³個',
    explCn: '12 g÷(2.0×10⁻²³ g/個)＝6.0×10²³ 個。この値がアボガドロ定数である。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qC8', category: '基礎 CHECK', topic: T_MASS, subtopics: S_REL,
    optMode: 'multi', Q: '塩素の原子量を求める式 35.0×(a)＋37.0×(b)＝(c) の空欄を埋めよ。(a) ³⁵Cl の存在比，(b) ³⁷Cl の存在比，(c) 塩素の原子量。',
    answerVector: ['75.0/100', '25.0/100', '35.5'], N: 3,
    answerJp: '(a) 75.0/100 (b) 25.0/100 (c) 35.5',
    explCn: '原子量＝「同位体の相対質量×存在比」の和。35.0×75.0/100＋37.0×25.0/100＝26.25＋9.25＝35.5。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qC9', category: '基礎 CHECK', topic: T_MASS, subtopics: S_AMT,
    optMode: 'simple', Q: 'mol を単位記号に用いる物質の量を何というか。',
    options: ['物質量', '質量', '粒子数', '体積'], correctIndex: 0,
    answerJp: '物質量',
    explCn: '物質の量をモル（mol）という単位で表したものを物質量という。1 mol は 6.0×10²³ 個（アボガドロ定数個）の粒子の集合である。',
    issues: [],
  },
  // ---- 基本例題 ----
  {
    code: 'chem-cheb4-qE1', category: '基本例題', topic: T_MASS, subtopics: S_REL,
    optMode: 'multi', Q: '(1) A 原子 1 個の質量は 9.3×10⁻²³ g，¹²C 原子 1 個の質量は 2.0×10⁻²³ g である。¹²C の質量を 12 とすると，A 原子の相対質量はいくらか。(2) ³⁵Cl（相対質量 35.0）と ³⁷Cl（相対質量 37.0）の存在比がちょうど 3:1 であるとして，塩素の原子量を求めよ。',
    answerVector: ['56', '35.5'], N: 2,
    answerJp: '(1) 56 (2) 35.5',
    explCn: '(1) 12×9.3×10⁻²³/2.0×10⁻²³＝55.8≒56。(2) 35.0×3/4＋37.0×1/4＝26.25＋9.25＝35.5。',
    issues: ['OCR 字形：解析内「55.8÷56」の「÷」是 ≒ 的误读，答 56 正しい。'],
  },
  {
    code: 'chem-cheb4-qE2', category: '基本例題', topic: T_MASS, subtopics: S_REL,
    optMode: 'multi', Q: '次の(1)～(3)の気体の分子量を求めよ。(1) ある気体 2.40 g の体積は標準状態で 1.12 L。(2) 標準状態での密度が 0.900 g/L の気体。(3) 標準状態での密度が水素（分子量 2.00）の 8.00 倍である気体。',
    answerVector: ['48.0', '20.2', '16.0'], N: 3,
    answerJp: '(1) 48.0 (2) 20.2 (3) 16.0',
    explCn: '(1) 1.12L＝0.0500mol → 2.40/0.0500＝48.0。(2) モル質量＝密度×モル体積＝0.900×22.4＝20.16≒20.2。(3) 2.00×8.00＝16.0。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qE3', category: '基本例題', topic: T_MASS, subtopics: S_AMT,
    optMode: 'multi', Q: '硝酸カリウム KNO₃ の水 100 g 当たりの溶解度と温度のグラフを参照し，(1) 50℃ の水 400 g に KNO₃ は何 g まで溶けるか。(2) 30℃ の水 50 g に KNO₃ を 11 g 溶かした水溶液を冷やしていくと何℃で結晶が析出し始めるか。(3) 60℃ の水 100 g に KNO₃ を 80 g 溶かした水溶液を 20℃ に冷却すると結晶は何 g 析出するか。',
    answerVector: ['3.4×10²g', '10℃', '48g'], N: 3,
    answerJp: '(1) 3.4×10²g (2) 10℃ (3) 48g',
    explCn: '(1) 50℃ の溶解度 85 g より，85×400/100＝340g＝3.4×10²g。(2) 水 100g 当たり 22g 相当の濃度はグラフ上 10℃ で飽和 → 10℃ を下回ると析出。(3) 60℃ 溶解度 110，20℃ 溶解度 32 より 80−32＝48g。',
    issues: ['OCR 字形：标题「基本例题」应为「基本例題」（stem 保留原样，不改动）。'],
  },
  {
    code: 'chem-cheb4-qE4', category: '基本例題', topic: T_RXN, subtopics: S_EQ,
    optMode: 'multi', Q: '次の反応を化学反応式で表せ。(1) エタン C₂H₆ が完全燃焼すると二酸化炭素と水が生じる。(2) 水酸化カルシウム Ca(OH)₂ に塩化アンモニウム NH₄Cl を加えて加熱すると，塩化カルシウム CaCl₂ とアンモニアと水が生じる。',
    answerVector: ['2C₂H₆+7O₂→4CO₂+6H₂O', 'Ca(OH)₂+2NH₄Cl→CaCl₂+2NH₃+2H₂O'], N: 2,
    answerJp: '(1) 2C₂H₆+7O₂→4CO₂+6H₂O (2) Ca(OH)₂+2NH₄Cl→CaCl₂+2NH₃+2H₂O',
    explCn: '(1) C₂H₆ の係数を 1 とすると C 2，H 6→H₂O 3。右辺 O は 4＋3＝7 → O₂ 7/2 → 全体を 2 倍して 2,7,4,6。(2) Ca(OH)₂+2NH₄Cl→CaCl₂+2NH₃+2H₂O。',
    issues: ['OCR 字形：标题「基本例题」应为「基本例題」（stem 保留原样，不改动）。'],
  },
  {
    code: 'chem-cheb4-qE5', category: '基本例題', topic: T_RXN, subtopics: S_QT,
    optMode: 'multi', Q: 'マグネシウム 4.8 g を燃焼させると酸化マグネシウムが生じる（O=16, Mg=24）。(1) 燃焼を化学反応式で表せ。(2) 完全燃焼に必要な酸素は何 mol か。(3) 生じた酸化マグネシウムは何 g か。(4) マグネシウム 4.8 g と酸素 2.4 g の反応で生じる酸化マグネシウムは何 g か。',
    answerVector: ['2Mg+O₂→2MgO', '0.10mol', '8.0g', '6.0g'], N: 4,
    answerJp: '(1) 2Mg+O₂→2MgO (2) 0.10mol (3) 8.0g (4) 6.0g',
    explCn: '(1) 2Mg+O₂→2MgO。(2) Mg 4.8g＝0.20mol，係数比 Mg:O₂＝2:1 → 0.10mol。(3) MgO 40g/mol×0.20mol＝8.0g。(4) O₂ 2.4g＝0.075mol ↔ Mg 0.15mol が反応（残り 0.05mol）→ MgO 40×0.15＝6.0g。',
    issues: [],
  },
  // ---- 基本問題 ----
  {
    code: 'chem-cheb4-qB1', category: '基本問題', topic: T_MASS, subtopics: S_REL,
    optMode: 'multi', Q: '原子の質量に関する文章の空欄 (a)～(d) に適当な数値・語句を入れよ。¹²C 原子 1 個の質量を (a) と定める。¹H 原子の相対質量は (b)（小数第3位まで）。多くの元素は 2 種類以上の (c) の混合物であるから，その平均の相対質量を計算し，その値をその元素の (d) という。',
    answerVector: ['12', '1.008', '同位体', '原子量'], N: 4,
    answerJp: '(a) 12 (b) 1.008 (c) 同位体 (d) 原子量',
    explCn: '相対質量は ¹²C＝12 を基準とする。¹H の相対質量＝12×1.674×10⁻²⁴/1.993×10⁻²³＝1.0079…≒1.008。多くの元素は同位体の混合物で，その（相対質量×存在比）の平均を原子量という。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qB2', category: '基本問題', topic: T_MASS, subtopics: S_REL,
    optMode: 'multi', Q: '(1) 臭素の同位体組成が ⁷⁹Br（相対質量 79）51% と ⁸¹Br（相対質量 81）49% であるとき，臭素の原子量を求めよ。(2) 天然のホウ素は ¹⁰B（10.0）と ¹¹B（11.0）からなり原子量は 10.8 である。¹⁰B の存在比は何 % か。整数値で答えよ。',
    answerVector: ['80', '20%'], N: 2,
    answerJp: '(1) 80 (2) 20%',
    explCn: '(1) 79×51/100＋81×49/100＝79.98≒80。(2) ¹⁰B の存在比を x% とすると 10.0x/100＋11.0(100−x)/100＝10.8 → x＝20。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qB3', category: '基本問題', topic: T_MASS, subtopics: S_REL,
    optMode: 'multi', Q: '次の物質の分子量・式量と，（）内の元素の質量%を求めよ（質量%は四捨五入して整数値）。(1) 水 H₂O（水素）(2) 二酸化炭素 CO₂（炭素）(3) エタノール C₂H₅OH（炭素）(4) 硝酸銀 AgNO₃（銀）(5) 酸化鉄(Ⅲ) Fe₂O₃（鉄）(6) 硫酸アンモニウム (NH₄)₂SO₄（窒素）',
    answerVector: ['18，11%', '44，27%', '46，52%', '170，64%', '160，70%', '132，21%'], N: 6,
    answerJp: '(1) 18，11% (2) 44，27% (3) 46，52% (4) 170，64% (5) 160，70% (6) 132，21%',
    explCn: '(1) H₂O＝18，2/18×100≒11%。(2) CO₂＝44，12/44×100≒27%。(3) C₂H₅OH＝46，24/46×100≒52%。(4) AgNO₃＝170，108/170×100≒64%。(5) Fe₂O₃＝160，112/160×100＝70%。(6) (NH₄)₂SO₄＝132，28/132×100≒21%。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qB4', category: '基本問題', topic: T_MASS, subtopics: S_AMT,
    optMode: 'multi', Q: '「物質の量」の文章の（）に適当な数値，元素名，語句を入れよ。1 mol の物質は (a) 個の粒子から構成される。この 1 mol 当たりの粒子の数 (a)/mol を (b) 定数という。粒子 1 mol 当たりの質量を (c) といい，単位粒子が原子・分子・イオンの場合はそれぞれ (d)・(e)・(f) に単位 g/mol をつけた量である。銀原子 1 mol は (g) 個で質量 108 g。メタン CH₄ 分子 1 mol の質量は (h) g。気体の場合は種類によらず 1 mol の体積は標準状態でほぼ (i) L である。',
    answerVector: ['6.0×10²³', 'アボガドロ', 'モル質量', '原子量', '分子量', '式量', '6.0×10²³', '16', '22.4'], N: 9,
    answerJp: '(a) 6.0×10²³ (b) アボガドロ (c) モル質量 (d) 原子量 (e) 分子量 (f) 式量 (g) 6.0×10²³ (h) 16 (i) 22.4',
    explCn: '1 mol は 6.0×10²³ 個（アボガドロ定数）の粒子の集合。1 mol 当たりの質量をモル質量といい，原子・分子・イオンではそれぞれ原子量・分子量・式量に g/mol をつけた値。CH₄ の分子量は 16 なので 1 mol は 16 g。気体のモル体積は標準状態で 22.4 L/mol。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qB5', category: '基本問題', topic: T_MASS, subtopics: S_AMT,
    optMode: 'multi', Q: '(1) 原子 1 個の質量の平均が 6.7×10⁻²³ g である元素の原子量はいくらか。(2) 次の物質を 1.0 g とるとき，含まれる原子の数が最も多いのはどれか。(ア)ナトリウム (イ)カルシウム (ウ)アルミニウム (エ)ヘリウム (オ)鉄。(3) 分子 1 個の質量の平均が 7.0×10⁻²³ g である分子の分子量はいくらか。(4) 水とスクロース C₁₂H₂₂O₁₁ を同質量ずつとると，水分子の数はスクロース分子の数の何倍になるか。(5) 空気を窒素（28.0）と酸素（32.0）の体積比 4:1 の混合気体とすると，標準状態で 22.4 L の空気の質量は何 g か。',
    answerVector: ['40', '工', '42', '19倍', '28.8g'], N: 5,
    answerJp: '(1) 40 (2) 工 (3) 42 (4) 19倍 (5) 28.8g',
    explCn: '(1) 6.7×10⁻²³×6.0×10²³≒40。(2) 原子数は 1.0g/モル質量 に比例し，原子量最小のヘリウム（He＝4.0，選択肢エ）が最多。解析の選択肢記号「工」は OCR 字形（エ）。(3) 7.0×10⁻²³×6.0×10²³≒42。(4) スクロース 342，水 18 → 342/18＝19倍。(5) 28.0×4/5＋32.0×1/5＝28.8g。',
    issues: ['OCR 字形：(2) 解析中の選択肢記号「工」应为「エ」（ヘリウム），按項目规则保留原样。'],
  },
  {
    code: 'chem-cheb4-qB6', category: '基本問題', topic: T_MASS, subtopics: S_REL,
    optMode: 'multi', Q: '次の(1)～(3)の気体は，それぞれ選択肢(ア)～(オ)のうちのどれか。(ア)C₄H₁₀ (イ)CO₂ (ウ)SO₂ (エ)Cl₂ (オ)HCl。(1) ある気体 0.355 g の体積は標準状態で 112 mL。(2) ある気体の密度は標準状態で 2.59 g/L。(3) ある気体の質量は，同温・同圧で同体積の酸素の質量の 2 倍。',
    answerVector: ['工', 'ア', 'ウ'], N: 3,
    answerJp: '(1) 工（Cl₂） (2) ア（C₄H₁₀） (3) ウ（SO₂）',
    explCn: '各分子量は (ア)58 (イ)44 (ウ)64 (エ)71.0 (オ)36.5。(1) 0.112L＝0.00500mol → 0.355/0.00500＝71.0 → エ（解析では「工」）。(2) 2.59×22.4≒58.0 → ア。(3) 32.0×2＝64 → ウ。',
    issues: ['OCR 字形：(1) 解析中の選択肢記号「工」应为「エ」（Cl₂），按項目规则保留原样。'],
  },
  {
    code: 'chem-cheb4-qB7', category: '基本問題', topic: T_MASS, subtopics: S_REL,
    optMode: 'multi', Q: 'ナトリウムイオン Na⁺ はナトリウム原子 Na が電子を 1 つ失ったものであるが，Na⁺ の式量と Na の原子量はともに 23 であり，計算の際は同じ値を用いることができる。その理由を説明せよ。',
    answerVector: ['電子の質量が，ナトリウム原子の質量と比べて無視できるほど小さいから。'], N: 1,
    answerJp: '電子の質量が，Na 原子の質量と比べて無視できるほど小さいから。',
    explCn: 'Na⁺ は Na から電子 1 個を失ったイオン。電子の質量は陽子・中性子の約 1840 分の 1 で，原子（陽子＋中性子＋電子）全体の質量と比べて無視できるほど小さいため，計算上 Na⁺ の式量と Na の原子量は同じ値 23 を用いてよい。',
    issues: ['記述問題：参考答案要点整体作槽位，请抽检语义。'],
  },
  {
    code: 'chem-cheb4-qB8', category: '基本問題', topic: T_MASS, subtopics: S_AMT,
    optMode: 'multi', Q: '(1) 水酸化ナトリウム 0.10 mol を水 16 g に溶かした溶液の質量パーセント濃度は何 % か。(2) 質量パーセント濃度が 2.0% の塩化亜鉛水溶液を 200 g つくるには，塩化亜鉛と水はそれぞれ何 g 必要か。(3) 0.40 mol/L の塩化ナトリウム水溶液 25 mL 中の塩化ナトリウムは何 g か。',
    answerVector: ['20%', '塩化亜鉛 4.0g，水 196g', '0.59g'], N: 3,
    answerJp: '(1) 20% (2) 塩化亜鉛 4.0g，水 196g (3) 0.59g',
    explCn: '(1) NaOH 0.10mol＝4.0g，溶液 4.0＋16＝20g → 4/20×100＝20%。(2) 200×2/100＝4.0g が塩化亜鉛，水 200−4＝196g。(3) 0.40×0.025＝0.010mol → NaCl 58.5×0.010＝0.585≒0.59g。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qB9', category: '基本問題', topic: T_MASS, subtopics: S_AMT,
    optMode: 'multi', Q: '塩化カリウム KCl の水 100 g 当たりの溶解度と温度の関係を図に示した。(1) 40℃ の水 150 g に KCl は何 g まで溶けるか。(2) 60℃ の水 50 g に KCl を 20 g 溶かした水溶液を冷やしていくと，何℃で結晶が析出し始めるか。(3) 80℃ の水 100 g に KCl を 45 g 溶かした水溶液を 10℃ に冷却すると，結晶は何 g 析出するか。',
    answerVector: ['60g', '40℃', '14g'], N: 3,
    answerJp: '(1) 60g (2) 40℃ (3) 14g',
    explCn: '(1) 40℃ の溶解度 40 g → 150g の水には 40×150/100＝60g。(2) 水 100g 当たり 40g の濃度＝グラフ上 40℃ で飽和。(3) 80℃ 溶解度 51，10℃ 溶解度 31 → 45−31＝14g。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qB10', category: '基本問題', topic: T_MASS, subtopics: S_AMT,
    optMode: 'multi', Q: '硝酸カリウムの水に対する溶解度を，20℃ 32g，60℃ 110g，80℃ 169g（g/100g 水）とする。(1) 60℃ の飽和溶液 42 g を 20℃ に冷却すると，結晶は何 g 析出するか。(2) 80℃ の飽和溶液 100 g を 40℃ に冷却すると 39 g の結晶が析出した。40℃ の水 100 g に KNO₃ は何 g まで溶けるか。',
    answerVector: ['16g', '64g'], N: 2,
    answerJp: '(1) 16g (2) 64g',
    explCn: '(1) 析出量/飽和溶液＝(110−32)/(100＋110)＝78/210 → 42×78/210＝15.6≒16g。(2) 39/100＝(169−S)/(100＋169) → S≒64.1≒64g。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qB11', category: '基本問題', topic: T_RXN, subtopics: S_EQ,
    optMode: 'multi', Q: '次の化学反応式の係数 (a, b, c, d) を求めよ。(1) aH₂+bN₂→cNH₃ (2) aC₃H₈+bO₂→cCO₂+dH₂O (3) aNH₃+bO₂→cNO+dH₂O (4) aFeS₂+bO₂→cFe₂O₃+dSO₂ (5) aAl+bH⁺→cAl³⁺+dH₂ (6) aAg⁺+bZn→cAg+dZn²⁺',
    answerVector: ['a=3, b=1, c=2', 'a=1, b=5, c=3, d=4', 'a=4, b=5, c=4, d=6', 'a=4, b=11, c=2, d=8', 'a=2, b=6, c=2, d=3', 'a=2, b=1, c=2, d=1'], N: 6,
    answerJp: '(1) a=3, b=1, c=2 (2) a=1, b=5, c=3, d=4 (3) a=4, b=5, c=4, d=6 (4) a=4, b=11, c=2, d=8 (5) a=2, b=6, c=2, d=3 (6) a=2, b=1, c=2, d=1',
    explCn: '(1) 3H₂+N₂→2NH₃。(2) C₃H₈+5O₂→3CO₂+4H₂O。(3) 4NH₃+5O₂→4NO+6H₂O。(4) 4FeS₂+11O₂→2Fe₂O₃+8SO₂。(5) 2Al+6H⁺→2Al³⁺+3H₂。(6) 2Ag⁺+Zn→2Ag+Zn²⁺。',
    issues: ['原书题面为 (1)(2)(3)(5)(4)(6) 顺序，解析按 (1)～(6) 编号；槽位按解析顺序 (1)～(6) 排列，(4) 为 4FeS₂+11O₂→2Fe₂O₃+8SO₂，(5) 为 2Al+6H⁺→2Al³⁺+3H₂，请抽检对应。'],
  },
  {
    code: 'chem-cheb4-qB12', category: '基本問題', topic: T_RXN, subtopics: S_EQ,
    optMode: 'multi', Q: '次の化学変化を表す化学反応式を書け。(1) 炭酸カルシウムに塩酸を加えると，塩化カルシウムと二酸化炭素と水が生じる。(2) 水酸化カルシウム水溶液に二酸化炭素を通すと，炭酸カルシウムと水が生じる。(3) 炭酸水素ナトリウムを加熱すると，炭酸ナトリウムと二酸化炭素と水が生じる。(4) 酸化マンガン(Ⅳ)と塩酸が反応すると，塩化マンガン(Ⅱ)と水と塩素が生じる。(5) 過酸化水素と硫化水素が反応すると，硫黄と水が生じる。',
    answerVector: ['CaCO₃+2HCl→CaCl₂+CO₂+H₂O', 'Ca(OH)₂+CO₂→CaCO₃+H₂O', '2NaHCO₃→Na₂CO₃+CO₂+H₂O', 'MnO₂+4HCl→MnCl₂+2H₂O+Cl₂', 'H₂O₂+H₂S→S+2H₂O'], N: 5,
    answerJp: '(1) CaCO₃+2HCl→CaCl₂+CO₂+H₂O (2) Ca(OH)₂+CO₂→CaCO₃+H₂O (3) 2NaHCO₃→Na₂CO₃+CO₂+H₂O (4) MnO₂+4HCl→MnCl₂+2H₂O+Cl₂ (5) H₂O₂+H₂S→S+2H₂O',
    explCn: '(4) MnO₂ は酸化剤として HCl を酸化し塩素 Cl₂ を発生させる。(5) 過酸化水素は酸化剤として H₂S の S²⁻ を酸化し，硫黄単体 S を遊離する。',
    issues: ['OCR 字形：(5) 解析中の「S^{1+}」是 OCR 誤読，正しくは生成物は硫黄単体 S（H₂O₂+H₂S→S+2H₂O），CONTENT 采用 S。'],
  },
  {
    code: 'chem-cheb4-qB13', category: '基本問題', topic: T_RXN, subtopics: S_QT,
    optMode: 'multi', Q: '(1) 黒鉛 2.7 g の完全燃焼により，二酸化炭素は何 g 生成するか。(2) 標準状態の酸素 2.8 L を十分な量の水素と反応させると，水は何 g 生成するか。(3) 純度 90% の石灰石（主成分は炭酸カルシウム）25 g を十分な量の希塩酸に入れて溶かすと，標準状態で何 L の二酸化炭素が生成するか。',
    answerVector: ['9.9g', '4.5g', '5.0L'], N: 3,
    answerJp: '(1) 9.9g (2) 4.5g (3) 5.0L',
    explCn: '(1) C 2.7g＝0.225mol → CO₂ 0.225mol → 44×0.225＝9.9g。(2) O₂ 2.8L＝0.125mol，2H₂+O₂→2H₂O より水 0.25mol → 18×0.25＝4.5g。(3) CaCO₃ 25×0.90＝22.5g＝0.225mol → CO₂ 0.225mol → 22.4×0.225＝5.04≒5.0L。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qB14', category: '基本問題', topic: T_RXN, subtopics: S_QT,
    optMode: 'multi', Q: 'エタン C₂H₆ の燃焼について，(1) 燃焼して二酸化炭素と水が生じる反応の化学反応式を書け。(2) 標準状態でエタン 5.6 L の燃焼に必要な酸素は何 L か。また，このとき生じる二酸化炭素と水はそれぞれ何 g か。',
    answerVector: ['2C₂H₆+7O₂→4CO₂+6H₂O', '酸素 20L，二酸化炭素 22g，水 14g'], N: 2,
    answerJp: '(1) 2C₂H₆+7O₂→4CO₂+6H₂O (2) 酸素 20L，二酸化炭素 22g，水 14g',
    explCn: '(1) 2C₂H₆+7O₂→4CO₂+6H₂O。(2) エタン 5.6L＝0.25mol。O₂ は 0.25×7/2＝0.875mol → 19.6≒20L。CO₂ 0.25×2＝0.50mol → 44×0.50＝22g。H₂O 0.25×3＝0.75mol → 18×0.75≈13.5≒14g。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qB15', category: '基本問題', topic: T_RXN, subtopics: S_QT,
    optMode: 'multi', Q: 'プロパノール C₃H₈O の燃焼について，(1) 燃焼して二酸化炭素と水が生じる反応の化学反応式を書け。(2) プロパノール 6.0 g の燃焼に必要な空気は標準状態で何 L か。ただし，空気は体積で 20% の酸素を含むものとする。',
    answerVector: ['2C₃H₈O+9O₂→6CO₂+8H₂O', '50L'], N: 2,
    answerJp: '(1) 2C₃H₈O+9O₂→6CO₂+8H₂O (2) 50L',
    explCn: '(1) C₃H₈O（分子量 60）を 1 とすると，O の収支から O₂ は 9/2 → 2 倍して 2,9,6,8。(2) 6.0g＝0.10mol → O₂ 0.10×9/2＝0.45mol → 22.4×0.45＝10.1L。空気では 10.1/0.20≒50L。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qB16', category: '基本問題', topic: T_RXN, subtopics: S_QT,
    optMode: 'multi', Q: '0.10 mol/L の塩化マグネシウム水溶液 20 mL に 0.20 mol/L の水酸化ナトリウム水溶液 x [mL] を加えたところ過不足なく反応し，水酸化マグネシウム y [g] が沈殿し，水中には塩化ナトリウムが z [g] 溶けていると考えられる。(x) 加えた NaOH 水溶液の体積。(y) 沈殿する Mg(OH)₂ の質量。(z) 溶けている NaCl の質量。',
    answerVector: ['20mL', '0.12g', '0.23g'], N: 3,
    answerJp: 'x＝20mL，y＝0.12g，z＝0.23g',
    explCn: 'MgCl₂+2NaOH→Mg(OH)₂+2NaCl。MgCl₂ 0.10×0.020＝0.0020mol，NaOH は 2 倍の 0.0040mol → 0.0040/0.20＝0.020L＝20mL。Mg(OH)₂ 58×0.0020＝0.116≒0.12g。NaCl 58.5×0.0040＝0.234≒0.23g。',
    issues: ['OCR 字形：原书标题「溶液の反応者」应为「溶液の反応」（stem 保留原样，不改动）。'],
  },
  {
    code: 'chem-cheb4-qB17', category: '基本問題', topic: T_RXN, subtopics: S_QT,
    optMode: 'multi', Q: '次の各法則について，発見した人物を (ア)～(エ)，関連が深い事項を (オ)～(ク) からそれぞれ 1 つ選べ。(ア)アボガドロ (イ)ドルトン (ウ)ラボアジエ (エ)プルースト／(オ)同温・同圧で同体積の気体には同数の分子が含まれる (カ)化学変化に関係する物質の質量の総和は変化の前後で変わらない (キ)1 つの化合物を構成する成分元素の質量組成は一定である (ク)A, B の 2 種類の元素からなる化合物が 2 種類以上あるとき，A の一定量と結合している B の量は簡単な整数比となる。(1) 質量保存の法則 (2) 倍数比例の法則 (3) 定比例の法則 (4) アボガドロの法則',
    answerVector: ['ウ，カ', 'イ，ク', 'エ，キ', 'ア，才'], N: 4,
    answerJp: '(1) ウ，カ (2) イ，ク (3) エ，キ (4) ア，才',
    explCn: '(1) 質量保存の法則→ラボアジエ（ウ）＋質量総和不変（カ）。(2) 倍数比例の法則→ドルトン（イ）＋整数比（ク）。(3) 定比例の法則→プルースト（エ）＋質量組成一定（キ）。(4) アボガドロの法則→アボガドロ（ア）＋同温・同圧で同体積の気体は同数の分子（オ）。解析の「才」は OCR 字形（オ）。',
    issues: ['OCR 字形：(4) 解析中の「才」应为「オ」（アボガドロの法則の内容），按項目规则保留原样。'],
  },
  {
    code: 'chem-cheb4-qB18', category: '基本問題', topic: T_MASS, subtopics: S_AMT,
    optMode: 'multi', Q: '硝酸カリウムと塩化ナトリウムの混合物を再結晶により分離することを考える（図は両者の溶解度曲線）。(1) 再結晶で分離できる理由を説明せよ。(2) 再結晶で硝酸カリウムと塩化ナトリウムを分離する手順を簡潔に説明せよ。',
    answerVector: ['KNO₃ は温度による溶解度の差が大きいが，NaCl はその差がほとんどないから。', '加熱して水をすべて蒸発させる。加熱して水を一部蒸発させたのち，析出した結晶をろ過で取り除く。'], N: 2,
    answerJp: '(1) KNO₃ は温度による溶解度の差が大きいが，NaCl はその差がほとんどないから。(2) 加熱して水をすべて蒸発させる。／加熱して水を一部蒸発させたのち，析出した結晶をろ過で取り除く。',
    explCn: '再結晶は温度による溶解度の差を利用する分離法。KNO₃ は溶解度の温度変化が大きく冷却で結晶が析出しやすいが，NaCl は温度変化が小さいためその差で分離できる。(2) は熱水溶液の全量蒸発，または水の一部蒸発後に結晶をろ過で取り除く手順。',
    issues: ['記述問題：(1)(2) ともに参考答案要点整体作槽位，请抽检语义。'],
  },
  {
    code: 'chem-cheb4-qB19', category: '基本問題', topic: T_RXN, subtopics: S_QT,
    optMode: 'simple', Q: '十分な量の水にナトリウムを加えたところ，水酸化ナトリウムと水素が生じた。反応したナトリウムの質量と発生した水素の物質量の関係を表す直線は，図の (ア)～(エ) のどれになるか。図は「ナトリウムの質量 [g]」を横軸，「水素の物質量」を縦軸にした直線グラフ。',
    options: [
      'ア：Na 0.4 g のとき H₂ 約 0.0043 mol になる直線（傾きが正解の約半分）',
      'イ：Na 0.4 g のとき H₂ 約 0.0087 mol になるが原点を通らない直線',
      'ウ：Na 0.4 g のとき H₂ 約 0.0087 mol になる原点を通る直線',
      'エ：Na 0.4 g のとき H₂ 約 0.017 mol になる直線（傾きが正解の約 2 倍）',
    ], correctIndex: 2,
    answerJp: 'ウ',
    explCn: '2Na+2H₂O→2NaOH+H₂。Na（原子量 23）2 mol＝46 g に対して H₂ 1 mol が発生する。Na 0.4 g では H₂ 1×0.4/46≒0.0087 mol。原点を通り，Na 0.4 g で約 0.0087 mol を示す直線 (ウ) が正しい。',
    issues: ['原书为图形選択（(ア)～(エ)），已按「記号＋図の特徴（傾きの大小・原点通過）」语言描述化构筑选项。'],
  },
  {
    code: 'chem-cheb4-qB20', category: '基本問題', topic: T_RXN, subtopics: S_QT,
    optMode: 'simple', Q: 'ある温度・圧力で，一酸化炭素 1.0 L に酸素 2.0 L を加えて点火し，一酸化炭素を完全燃焼させたあとに気体を前と同じ温度・圧力にもどすと，体積は何 L になるか。',
    options: ['2.5L', '3.0L', '2.0L', '1.5L'], correctIndex: 0,
    answerJp: '2.5L',
    explCn: '2CO+O₂→2CO₂。CO 1.0L には O₂ 0.5L が必要で，CO₂ 1.0L が生成。残った O₂ は 2.0−0.5＝1.5L。合計 1.0＋1.5＝2.5L。',
    issues: [],
  },
  // ---- 応用例題 ----
  {
    code: 'chem-cheb4-qA1', category: '応用例題', topic: T_MASS, subtopics: S_AMT,
    optMode: 'multi', Q: '(1) 質量パーセント濃度 36.5%，密度 1.2 g/cm³ の濃塩酸のモル濃度は何 mol/L か（HCl=36.5）。(2) 3.5% の希塩酸 1.0 L（密度 1.0 g/cm³）をつくるには，この濃塩酸が何 mL 必要か。',
    answerVector: ['12mol/L', '80mL'], N: 2,
    answerJp: '(1) 12mol/L (2) 80mL',
    explCn: '(1) 1L の質量 1.2×1000＝1200g，HCl は 1200×0.365＝438g → 438/36.5＝12mol → 12mol/L。(2) 希塩酸中 HCl は 1000×0.035＝35g＝0.959mol → 0.959/12＝0.0799L≒80mL。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA2', category: '応用例題', topic: T_MASS, subtopics: S_AMT,
    optMode: 'multi', Q: '硫酸銅(Ⅱ) CuSO₄ は 20℃ の水 100 g に 20 g 溶ける（CuSO₄=160, H₂O=18）。(1) 20℃ の水 100 g に硫酸銅(Ⅱ)五水和物 CuSO₄·5H₂O は何 g 溶けるか。(2) 20℃ の CuSO₄ 飽和溶液を 60 g つくるには，CuSO₄·5H₂O は何 g 必要か。',
    answerVector: ['35g', '16g'], N: 2,
    answerJp: '(1) 35g (2) 16g',
    explCn: '(1) 五水和物 x g 中 CuSO₄ は 160/250·x，水は 90/250·x。(160/250·x)/(100＋90/250·x)＝20/100 → x≒35.2≒35g。(2) 飽和溶液 60g 中 CuSO₄ は 20×60/120＝10g → 五水和物 10×250/160＝15.6≒16g。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA3', category: '応用例題', topic: T_RXN, subtopics: S_QT,
    optMode: 'multi', Q: '0.327 g の亜鉛にある濃度の塩酸を少しずつ加え，加えた塩酸の体積と発生した気体の標準状態での体積を調べたところグラフが得られた（Zn=65.4）。(1) a の値は何 mL か。(2) 使用した塩酸のモル濃度は何 mol/L か。',
    answerVector: ['112mL', '0.500mol/L'], N: 2,
    answerJp: '(1) 112mL (2) 0.500mol/L',
    explCn: 'Zn+2HCl→ZnCl₂+H₂。Zn 0.327g＝0.00500mol → H₂ 0.00500mol → 22400×0.00500＝112mL。(2) HCl は 0.0100mol。グラフで反応が止まる塩酸 20.0mL＝0.0200L → 0.0100/0.0200＝0.500mol/L。',
    issues: [],
  },
  // ---- 応用問題 ----
  {
    code: 'chem-cheb4-qA4', category: '応用問題', topic: T_MASS, subtopics: S_REL,
    optMode: 'multi', Q: 'ある金属 M 4.0 g を酸化したところ，化学式 MO で表される酸化物が 5.0 g 生じた。(1) 反応した酸素は標準状態で何 mL か。(2) 生じた酸化物の元素組成（質量%）を求めよ。(3) 金属 M の原子量を求めよ。',
    answerVector: ['7.0×10²mL', 'M 80%，O 20%', '64'], N: 3,
    answerJp: '(1) 7.0×10²mL (2) M 80%，O 20% (3) 64',
    explCn: '(1) 反応した O₂ は 5.0−4.0＝1.0g → 22.4×1.0/32＝0.70L＝7.0×10²mL。(2) M 4.0/5.0＝80%，O 1.0/5.0＝20%。(3) O 原子 1.0/16＝0.0625mol ↔ M も 0.0625mol → 4.0/0.0625＝64。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA5', category: '応用問題', topic: T_MASS, subtopics: S_REL,
    optMode: 'simple', Q: '原子量は ¹²C＝12 を基準に決められている。天然の炭素はおもに ¹²C と ¹³C からなり，炭素の原子量が C=12.011 と記されている。炭素原子 1000 個中には ¹³C は何個存在していることになるか。ただし ¹³C の相対質量は 13 として計算してよい。',
    options: ['11個', '12個', '10個', '13個'], correctIndex: 0,
    answerJp: '11個',
    explCn: '¹³C を x 個とすると (12×(1000−x)＋13x)/1000＝12.011 → 12＋x/1000＝12.011 → x＝11。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA6', category: '応用問題', topic: T_MASS, subtopics: S_AMT,
    optMode: 'multi', Q: '0.0142 g のステアリン酸 C₁₈H₃₆O₂ をシクロヘキサンに溶かし正確に 250 mL の溶液にした。この溶液 0.100 mL を水面に滴下すると，単分子膜（面積 26.4 cm²）をつくった。(1) この溶液のモル濃度は何 mol/L か。(2) ステアリン酸 1 mol 中の分子の数は何個か。',
    answerVector: ['2.00×10⁻⁴mol/L', '6.0×10²³個'], N: 2,
    answerJp: '(1) 2.00×10⁻⁴mol/L (2) 6.0×10²³個',
    explCn: '(1) 0.0142g/284（ステアリン酸の分子量）＝5.00×10⁻⁵mol → 5.00×10⁻⁵/0.250＝2.00×10⁻⁴mol/L。(2) 単分子膜の面積と 1 分子の断面積から分子数を求めると 1 mol あたり 6.0×10²³ 個（アボガドロ定数）に相当。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA7', category: '応用問題', topic: T_MASS, subtopics: S_AMT,
    optMode: 'simple', Q: '窒素とアルゴンの混合気体がある。この気体の密度は標準状態で 1.43 g/L である。この混合気体中の窒素とアルゴンの物質量の比を簡単な整数比で表せ。',
    options: ['窒素：アルゴン＝2:1', '窒素：アルゴン＝1:2', '窒素：アルゴン＝4:1', '窒素：アルゴン＝3:2'], correctIndex: 0,
    answerJp: '窒素：アルゴン＝2:1',
    explCn: '平均分子量＝1.43×22.4≒32.0。窒素の存在比を x とすると 28x＋40(1−x)＝32 → x＝2/3 → 窒素：アルゴン＝2/3:1/3＝2:1。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA8', category: '応用問題', topic: T_MASS, subtopics: S_AMT,
    optMode: 'multi', Q: '質量パーセント濃度 98%，密度 1.84 g/cm³ の濃硫酸がある。(1) この濃硫酸のモル濃度は何 mol/L か。(2) この濃硫酸を用いて 3.0 mol/L の希硫酸 500 mL を調製したい。濃硫酸は何 mL 必要か。(3) 濃硫酸 100 mL を水（密度 1.00 g/cm³）で薄めて質量パーセント濃度 50.0% の希硫酸にするには何 mL の水に加えればよいか。整数値で答えよ。',
    answerVector: ['18mol/L', '82mL', '177mL'], N: 3,
    answerJp: '(1) 18mol/L (2) 82mL (3) 177mL',
    explCn: '(1) 1L 中の H₂SO₄ は 1840×0.98＝1803g → 1803/98≒18.4≒18mol/L。(2) 3.0×0.5＝1.5mol → 1.5/18.4≒0.0815L≒82mL。(3) 濃硫酸 100mL 中 H₂SO₄ 184×0.98＝180.3g。50% にするには溶液 360.6g → 水 360.6−184＝176.6≒177mL。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA9', category: '応用問題', topic: T_MASS, subtopics: S_AMT,
    optMode: 'multi', Q: '塩化カリウムの溶解度は 20℃ で 34.0 g，80℃ で 51.0 g（g/100g 水）。KCl 70.0 g をある量の水に溶かしたところ 80℃ でちょうど溶け (a) g の水溶液となった。これを 20℃ に冷却すると (b) g の KCl が析出した。(a)(b) を有効数字 3 桁で求めよ。',
    answerVector: ['207', '23.3'], N: 2,
    answerJp: '(a) 207 (b) 23.3',
    explCn: '(a) 水の質量を x とすると 70.0/(x＋70.0)＝51.0/151.0 → x＝137.3g → 溶液 137.3＋70.0＝207.3≒207g。(b) 20℃ で溶けている KCl は 34.0×137.3/100＝46.7g → 析出 70.0−46.7＝23.3g。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA10', category: '応用問題', topic: T_MASS, subtopics: S_AMT,
    optMode: 'multi', Q: '硫酸銅(Ⅱ)の溶解度は 20℃ で 20 g，60℃ で 40 g（g/100g 水）である（CuSO₄=160，H₂O=18）。(1) 20℃ の水 150 g に硫酸銅(Ⅱ)五水和物は何 g 溶けるか。(2) 硫酸銅(Ⅱ)五水和物 100 g を 60℃ の水何 g に溶かすと飽和溶液になるか。(3) (2) の飽和溶液を 20℃ に冷却すると，析出する硫酸銅(Ⅱ)五水和物は何 g か。',
    answerVector: ['53g', '124g', '56g'], N: 3,
    answerJp: '(1) 53g (2) 124g (3) 56g',
    explCn: 'CuSO₄·5H₂O＝250。(1) 五水和物 x g 中 CuSO₄ 160/250x，水 90/250x。(160/250x)/(150＋90/250x)＝20/120 → x≒52.8≒53g。(2) 五水和物 100g 中 CuSO₄ 64g・水 36g。64/(y＋36)＝40/100 → y＝124g。(3) 析出する無水物を z g とし，水和水分の溶媒減少を考慮して (64−z)/(160−0.5625z)＝20/100 → z≒36.1g → 五水和物 36.1×250/160≒56g。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA11', category: '応用問題', topic: T_RXN, subtopics: S_EQ,
    optMode: 'multi', Q: '次の化学反応式の係数 (a, b, c, d, e) を求めよ。(1) aCH₃OH+bO₂→cCO₂+dH₂O (2) aCu+bHNO₃(希)→cCu(NO₃)₂+dNO+eH₂O (3) aN₂+bH₂→cNH₃',
    answerVector: ['a=2, b=3, c=2, d=4', 'a=3, b=8, c=3, d=2, e=4', 'a=3, b=1, c=2'], N: 3,
    answerJp: '(1) a=2, b=3, c=2, d=4 (2) a=3, b=8, c=3, d=2, e=4 (3) a=3, b=1, c=2',
    explCn: '(1) 2CH₃OH+3O₂→2CO₂+4H₂O。(2) 3Cu+8HNO₃(希)→3Cu(NO₃)₂+2NO+4H₂O。(3) 3H₂+N₂→2NH₃（aN₂+bH₂→cNH₃ の a=1 でなく，解析は a=3, b=1, c=2）。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA12', category: '応用問題', topic: T_RXN, subtopics: S_QT,
    optMode: 'simple', Q: '炭素と水素のみからなる化合物 5.8 mg を完全燃焼させたところ，水 9.0 mg が生じた。このとき標準状態で何 mL の二酸化炭素が生成したか。',
    options: ['9.0mL', '4.5mL', '13.4mL', '18mL'], correctIndex: 0,
    answerJp: '9.0mL',
    explCn: '水 9.0mg 中の水素は 9.0×2/18＝1.0mg → 炭素は 5.8−1.0＝4.8mg＝4.8×10⁻³g → 4.8×10⁻³/12＝4.0×10⁻⁴mol。C→CO₂ 1:1 より CO₂ 4.0×10⁻⁴mol → 22400×4.0×10⁻⁴＝9.0mL。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA13', category: '応用問題', topic: T_RXN, subtopics: S_QT,
    optMode: 'multi', Q: 'ある質量のアルミニウムに濃度未知の希塩酸を少しずつ加え，加えた塩酸の体積と発生した気体の標準状態での体積を調べたところ，次のグラフが得られた。(1) このときの変化を化学反応式で書け。(2) 用いたアルミニウムは何 g か。(3) 希塩酸のモル濃度は何 mol/L か。',
    answerVector: ['2Al+6HCl→3H₂+2AlCl₃', '0.540g', '0.750mol/L'], N: 3,
    answerJp: '(1) 2Al+6HCl→3H₂+2AlCl₃ (2) 0.540g (3) 0.750mol/L',
    explCn: '(1) 2Al+6HCl→3H₂+2AlCl₃。(2) 水素 672mL＝0.0300mol → Al は 2/3×0.0300＝0.0200mol → 27×0.0200＝0.540g。(3) HCl は 6/2×0.0300＝0.0900… ではなく 0.0200mol Al×3＝0.0600mol。グラフで反応が止まる塩酸 80mL＝0.0800L → 0.0600/0.0800＝0.750mol/L。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA14', category: '応用問題', topic: T_RXN, subtopics: S_QT,
    optMode: 'simple', Q: 'カーバイド（炭化カルシウム）CaC₂ が水と反応するとアセチレン C₂H₂ と水酸化カルシウムが生じる。不純物を含むカーバイド 2.5 g と水との反応で標準状態のアセチレン 0.70 L が発生した。このカーバイドの純度は何 % か。',
    options: ['80%', '70%', '90%', '60%'], correctIndex: 0,
    answerJp: '80%',
    explCn: 'CaC₂+2H₂O→Ca(OH)₂+C₂H₂。アセチレン 0.70L＝0.03125mol → CaC₂ も 0.03125mol → 64×0.03125＝2.0g → 純度 2.0/2.5＝80%。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA15', category: '応用問題', topic: T_RXN, subtopics: S_QT,
    optMode: 'simple', Q: '窒素 3.0 L と水素 5.0 L を混合して触媒を加えたところ一部が反応してアンモニアが生じ，反応前と同温・同圧で体積は 7.0 L になった。反応後の気体の物質量の比（窒素：水素：アンモニア）を簡単な整数比で答えよ。',
    options: ['窒素：水素：アンモニア＝5:7:2', '窒素：水素：アンモニア＝2:3:1', '窒素：水素：アンモニア＝3:5:2', '窒素：水素：アンモニア＝7:5:2'], correctIndex: 0,
    answerJp: '窒素：水素：アンモニア＝5:7:2',
    explCn: 'N₂+3H₂→2NH₃。体積減少 8.0−7.0＝1.0L は反応による減少（4 体積→2 体積）に対応 → 反応した N₂ 0.5L・H₂ 1.5L，生成 NH₃ 1.0L。残り N₂ 2.5L・H₂ 3.5L・NH₃ 1.0L → 2.5:3.5:1.0＝5:7:2。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA16', category: '応用問題', topic: T_RXN, subtopics: S_QT,
    optMode: 'multi', Q: 'マグネシウム 0.12 g と塩酸の反応について，加えた塩酸の体積 [mL] と発生した水素の標準状態における体積 [mL] の関係を下表にまとめた（表：塩酸 50.0→水素 44.8，100→89.6，150→112，200→112）。(1) マグネシウム 0.12 g と過不足なく反応する塩酸は何 mL か。(2) 加えた塩酸のモル濃度は何 mol/L か。',
    answerVector: ['125mL', '0.080mol/L'], N: 2,
    answerJp: '(1) 125mL (2) 0.080mol/L',
    explCn: '(1) Mg が残っている間は塩酸の体積と水素の体積は比例 → 44.8×x/50.0＝112 → x＝125mL。(2) Mg+2HCl→MgCl₂+H₂。Mg 0.12g＝0.0050mol → HCl 0.010mol → 0.010/0.125＝0.080mol/L。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA17', category: '応用問題', topic: T_RXN, subtopics: S_QT,
    optMode: 'simple', Q: '水素，メタンおよび酸素の混合気体 120 mL に点火し完全燃焼させ，十酸化四リンで水を吸収したところ気体は 42 mL になった。残った気体を水酸化ナトリウム水溶液に通じると二酸化炭素が吸収され，酸素のみが 30 mL 残った。最初の水素とメタンの物質量の比を簡単な整数比で答えよ。',
    options: ['水素：メタン＝3:1', '水素：メタン＝1:3', '水素：メタン＝2:1', '水素：メタン＝1:1'], correctIndex: 0,
    answerJp: '水素：メタン＝3:1',
    explCn: 'CO₂ は 42−30＝12mL で，CH₄→CO₂ 比 1:1 よりメタン 12mL。水素を x mL とすると，燃焼の O₂ 必要量 x/2＋12×2，残 O₂ 30 → x＋12＋(x/2＋24)＋30＝120 → x＝36mL。水素：メタン＝36:12＝3:1。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA18', category: '応用問題', topic: T_RXN, subtopics: S_QT,
    optMode: 'multi', Q: '硫酸と塩酸の混合溶液がある。これに 0.0200 mol の塩化バリウムを含む水溶液を加えたところ硫酸バリウムの沈殿 2.33 g が生じた。この沈殿を除いたろ液に 0.0800 mol の硝酸銀を含む水溶液を加えたところ塩化銀の沈殿 8.61 g が生じた。最初の混合溶液中の硫酸と塩化水素はそれぞれ何 mol か。',
    answerVector: ['0.0100mol', '0.0200mol'], N: 2,
    answerJp: '硫酸 0.0100 mol，塩化水素 0.0200 mol',
    explCn: 'BaSO₄（式量 233）2.33g＝0.0100mol → 硫酸 0.0100mol。AgCl（143.5）8.61g＝0.0600mol のうち，BaCl₂ 由来の Cl⁻ 0.0200×2＝0.0400mol を除くと，最初の溶液の Cl⁻ は 0.0200mol → 塩化水素 0.0200mol。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA19', category: '応用問題', topic: T_RXN, subtopics: S_QT,
    optMode: 'multi', Q: '(1)(a) 亜鉛 Zn 1.3 g を十分な量の希硫酸と反応させたときに発生する水素は標準状態で何 L か。(1)(b) アルミニウム Al 1.8 g の場合。(2) 亜鉛とアルミニウムの混合物 1.57 g を十分な量の希硫酸と反応させたところ 0.035 mol の水素が発生した。混合物 1.57 g 中の亜鉛の質量は何 g か。',
    answerVector: ['0.45L', '2.2L', '1.3g'], N: 3,
    answerJp: '(1)(a) 0.45L (1)(b) 2.2L (2) 1.3g',
    explCn: '(1)(a) Zn 1.3/65＝0.0200mol → H₂ 0.0200mol → 22.4×0.0200＝0.45L。(1)(b) 2Al+3H₂SO₄→Al₂(SO₄)₃+3H₂。Al 1.8/27＝0.0667mol → H₂ 0.100mol → 22.4×0.100＝2.24≒2.2L。(2) Zn を x g とすると x/65＋1.5(1.57−x)/27＝0.035 → x≒1.3g。',
    issues: [],
  },
  {
    code: 'chem-cheb4-qA20', category: '応用問題', topic: T_RXN, subtopics: S_QT,
    optMode: 'multi', Q: '次の文の（）に適当な数値を入れ，それぞれの内容に関連している基礎法則の名称を答えよ。(1) 一酸化炭素と酸素から二酸化炭素が生じる反応で，各気体の体積の比は同温・同圧で（: :）である。(2) 酸化鉄(Ⅱ)と酸化鉄(Ⅲ)で，鉄 1 g と結合している酸素の質量は（:）と簡単な整数比になっている。(3) 水に含まれる酸素は質量比で（）% と常に一定である。(4) プロパン C₃H₈ 2.2 g の燃焼で二酸化炭素 6.6 g，水 3.6 g が生じるから，燃焼に用いられた酸素は（）g である。(5) 標準状態で 5.6 L の酸素，水素に含まれる分子の数はどちらも（）個である。',
    answerVector: ['2:1:2，気体反応の法則', '2:3，倍数比例の法則', '89，定比例の法則', '8.0，質量保存の法則', '1.5×10²³，アボガドロの法則'], N: 5,
    answerJp: '(1) 2:1:2，気体反応の法則 (2) 2:3，倍数比例の法則 (3) 89，定比例の法則 (4) 8.0，質量保存の法則 (5) 1.5×10²³，アボガドロの法則',
    explCn: '(1) 2CO+O₂→2CO₂ より体積比 2:1:2（気体反応の法則）。(2) FeO と Fe₂O₃ で鉄 1g 当たりの酸素 16/56：24/56＝2:3（倍数比例の法則）。(3) 16/18×100≒89%（定比例の法則）。(4) 2.2＋x＝6.6＋3.6 → x＝8.0g（質量保存の法則）。(5) 5.6L は 22.4L の 1/4 → 6.0×10²³×1/4＝1.5×10²³個（アボガドロの法則）。',
    issues: [],
  },
];

function build() {
  const labels = ['(a)', '(b)', '(c)', '(d)', '(e)', '(f)', '(g)', '(h)', '(i)', '(j)', '(k)', '(l)', '(m)', '(n)', '(o)', '(p)', '(q)', '(r)', '(s)', '(t)', '(u)', '(v)', '(w)', '(x)', '(y)', '(z)'];
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

const blocksRaw = (() => {
  const fs = require('fs');
  const p = '/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/Chem/_meta/chem_question_blocks_candidate_2026-10-12_v2.json';
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  return Array.isArray(data) ? data : (data.blocks || data.data || []);
})();
const byCode = new Map(blocksRaw.filter((x) => x.businessCode).map((x) => [x.businessCode, x]));

module.exports = { CONTENT, build, byCode };

if (require.main === module) {
  const d = build();
  console.log('cheb4 drafts:', d.length);
  const s = new Map();
  d.forEach((x) => s.set(x.generationStatus, (s.get(x.generationStatus) || 0) + 1));
  console.log('status:', Object.fromEntries(s));
}