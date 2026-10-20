#!/usr/bin/env node
/**
 * cheb2_pilot_content.cjs — cheb2（第2章 物質の構成粒子）内容定义
 *
 * 源：cheb2_题目.md + cheb2_解析.md（仅此两文件，其余为过程文件）
 * 考纲：ejuSyllabus.ts chem_1_2（原子の構造と化学結合）
 *  - 原子の構造・同位体 → topic chem_1_2_1，subtopic chem_1_2_1_01（原子の構成と同位体）
 *  - 電子配置・電子殻・周期表の族・イオンと電子配置 → topic chem_1_2_2，subtopic chem_1_2_2_01（電子殻と周期表）
 *
 * 变通（沿用 che1~che17/cheb1 规则）：
 *  - qB11/qB14 記述理由問題 → 「参考答案要点」整体作槽位；
 *  - 单选保留原卷选项（qB3/qB4/qA3/qA5 用 native）；
 *  - OCR 字形（「殼」「才」「(1)→(l)」「→35」残留）按項目规则保留原样，在 issues 标注，不改原文。
 */
'use strict';

const T_ATOM = 'chem_1_2_1';   // 原子の構造と元素
const S_ISO = ['chem_1_2_1_01'];  // 原子の構成と同位体
const T_SHELL = 'chem_1_2_2';  // 電子配置と周期律
const S_SHELL = ['chem_1_2_2_01']; // 電子殻と周期表

const CONTENT = [
  // ---- 基礎 CHECK ----
  {
    code: 'chem-cheb2-qC1', category: '基礎 CHECK', topic: T_ATOM, subtopics: S_ISO,
    optMode: 'multi', Q: '(1) 中性子の質量にほぼ等しい粒子 (2) 陽子と同量で正・負が逆の電荷をもつ粒子 (3) 原子番号に等しい原子核中の粒子の数 (4) 質量数＝陽子の数＋（ ）の数。',
    answerVector: ['陽子', '電子', '陽子', '中性子'], N: 4,
    answerJp: '(1) 陽子 (2) 電子 (3) 陽子 (4) 中性子',
    explCn: '(1) 陽子と中性子の質量はほぼ等しい（電子は約1/1840）。(2) 電子は陽子と同量で符号が逆の電荷をもつ。(3) 原子番号＝原子核中の陽子の数。(4) 質量数＝陽子の数＋中性子の数。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qC2', category: '基礎 CHECK', topic: T_ATOM, subtopics: S_ISO,
    optMode: 'multi', Q: '(1) ¹²₆C (2) ¹³₆C (3) ³⁵₁₇Cl (4) ⁴⁰₂₀Ca (5) ⁵⁶₂₆Fe を構成する陽子，中性子，電子の数。',
    answerVector: ['6，6，6', '6，7，6', '17，18，17', '20，20，20', '26，30，26'], N: 5,
    answerJp: '(1) 6,6,6 (2) 6,7,6 (3) 17,18,17 (4) 20,20,20 (5) 26,30,26',
    explCn: '陽子数＝原子番号、電子数＝陽子数（中性原子）、中性子数＝質量数−原子番号。(1)6,6,6 (2)6,7,6 (3)17,18,17 (4)20,20,20 (5)26,30,26。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qC3', category: '基礎 CHECK', topic: T_ATOM, subtopics: S_ISO,
    optMode: 'simple', Q: '原子核中の陽子の数が等しく，中性子の数が異なる原子どうしを何というか。',
    options: ['同位体', '同素体', '同族体', '同量体'], correctIndex: 0,
    answerJp: '同位体',
    explCn: '原子番号（陽子の数）が同じで中性子の数が異なる原子どうしを互いに同位体という。同素体は同じ元素の単体で性質の異なるものどうし。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qC8', category: '基礎 CHECK', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: '(1) ₇N (2) ₁₉K の電子配置を例（Li: K(2)L(1)）のように記せ。',
    answerVector: ['K(2)L(5)', 'K(2)L(8)M(8)N(1)'], N: 2,
    answerJp: 'N：K(2)L(5) ／ K：K(2)L(8)M(8)N(1)',
    explCn: 'N（原子番号7）は K殻に2個，L殻に5個。K（原子番号19）は K(2)L(8)M(8)N(1)。K殻2個・L殻8個・M殻18個まで入るが，最外殻に8個を超えて入ることはない。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qC4', category: '基礎 CHECK', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: '(1) H (2) N (3) Ne (4) K の最外殻電子の数と価電子の数をそれぞれ答えよ（最外殻電子数，価電子数の順）。',
    answerVector: ['1，1', '5，5', '8，0', '1，1'], N: 4,
    answerJp: '(1) 1,1 (2) 5,5 (3) 8,0 (4) 1,1',
    explCn: '最外殻電子の数：H 1，N 5，Ne 8，K 1。価電子は結合に関与する最外殻電子のうち1〜7個で，貴ガス（Ne）の価電子数は0とみなす。',
    issues: ['解析原文「最外殼電子」の「殼」はOCR字形（殻），按項目规则保留原样不改动'],
  },
  {
    code: 'chem-cheb2-qC5', category: '基礎 CHECK', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: 'Cl，Mg，K から生じるイオンの化学式 (a)〜(c) と，それぞれ同じ電子配置をもつ貴ガスの名称 (d)〜(f)。',
    answerVector: ['Cl⁻', 'アルゴン', 'Mg²⁺', 'ネオン', 'K⁺', 'アルゴン'], N: 6,
    answerJp: '(a) Cl⁻ (b) アルゴン (c) Mg²⁺ (d) ネオン (e) K⁺ (f) アルゴン',
    explCn: 'Cl（17e⁻）は電子1個を受け取り Cl⁻（18e⁻＝Ar），Mg（12e⁻）は電子2個失い Mg²⁺（10e⁻＝Ne），K（19e⁻）は電子1個失い K⁺（18e⁻＝Ar）。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qC6', category: '基礎 CHECK', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: '周期表の (1) 横の行 (2) 縦の列 の名称と数。',
    answerVector: ['周期，7', '族，18'], N: 2,
    answerJp: '(1) 周期，7 (2) 族，18',
    explCn: '周期表の横の行を周期（第1〜第7周期の7つ），縦の列を族（1〜18族の18列）という。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qC7', category: '基礎 CHECK', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: '(1) アルカリ金属元素 (2) アルカリ土類金属元素 (3) ハロゲン元素 (4) 貴ガス元素 はそれぞれ周期表の何族に属するか。',
    answerVector: ['1族', '2族', '17族', '18族'], N: 4,
    answerJp: '(1) 1族 (2) 2族 (3) 17族 (4) 18族',
    explCn: 'アルカリ金属＝Hを除く1族，アルカリ土類金属＝2族，ハロゲン＝17族，貴ガス＝18族。',
    issues: [],
  },
  // ---- 基本例題 ----
  {
    code: 'chem-cheb2-qE1', category: '基本例題', topic: T_ATOM, subtopics: S_ISO,
    optMode: 'multi', Q: '塩素原子 ³⁵₁₇Cl・³⁷₁₇Cl について：(1) 35 と 17 が表すもの (2) ³⁷₁₇Cl の陽子・中性子・電子の数 (3) 2種類の塩素原子の関係と，数が異なる粒子 (4) (1)の原子の電子配置 (5) (2)の原子がなるイオンの化学式 (6) ³⁹₁₉K がイオンになったとき (5) のイオンと同じ数になる粒子とその数。',
    answerVector: [
      '35：質量数，17：原子番号',
      '陽子：17，中性子：20，電子：17',
      '同位体，中性子',
      'K(2)L(8)M(7)',
      'Cl⁻',
      '中性子：20，電子：18',
    ], N: 6,
    answerJp: '(1) 35：質量数，17：原子番号 (2) 陽子：17，中性子：20，電子：17 (3) 同位体，中性子 (4) K(2)L(8)M(7) (5) Cl⁻ (6) 中性子：20，電子：18',
    explCn: '(1) 質量数＝陽子＋中性子，原子番号＝陽子の数。(2) 中性子＝37−17＝20，中性原子で電子＝17。(3) 陽子数が同じで中性子数が異なるので同位体，異なるのは中性子の数。(4) 17個の電子を K(2)L(8)M(7) と配置。(5) 価電子7個なので電子1個を受け取り Cl⁻。(6) K⁺ は中性子20，電子18（Kは19e⁻）。Cl⁻ も中性子20（³⁷Cl），電子18なので，同じなのは中性子と電子の数。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qE2', category: '基本例題', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: '周期表の概略を (ア)〜(ク) の領域に区切った図について：(1) 元素を何の順に並べてあるか (2) (ウ) の領域，(キ) の領域の元素の電子配置の特徴と生じるイオンの価数・種類 (3) (a)アルカリ金属元素 (b)貴ガス元素 (c)非金属元素 (d)典型元素 が該当する領域を (ア)〜(ク) からすべて選べ。',
    answerVector: [
      '原子番号（陽子の数）',
      '(ウ)：最外殻電子2個（価電子2個），2価の陽イオン ／ (キ)：最外殻電子7個（価電子7個），1価の陰イオン',
      '(a) イ',
      '(b) ク',
      '(c) ア，カ，キ，ク',
      '(d) ア，イ，ウ，オ，カ，キ，ク',
    ], N: 6,
    answerJp: '(1) 原子番号（陽子の数） (2) (ウ)最外殻電子2個→2価の陽イオン，(キ)最外殻電子7個→1価の陰イオン (3) (a)イ (b)ク (c)ア，カ，キ，ク (d)ア，イ，ウ，オ，カ，キ，ク',
    explCn: '周期表は元素を原子番号順に並べる。(ウ)は2族（最外殻電子2個，2価の陽イオン），(キ)は17族（最外殻電子7個，1価の陰イオン）。(a)アルカリ金属＝1族のイ，(b)貴ガス＝18族のク。(c)非金属元素は金属元素の領域（イ，ウ，エ，オ）以外のア，カ，キ，ク。(d)典型元素は遷移元素（エ）を除くア，イ，ウ，オ，カ，キ，ク。',
    issues: [],
  },
  // ---- 基本問題 ----
  {
    code: 'chem-cheb2-qB1', category: '基本問題', topic: T_ATOM, subtopics: S_ISO,
    optMode: 'multi', Q: '原子の構造についての文の（a）〜（j）に適当な語句を入れよ。',
    answerVector: ['原子核', '電子', '陽子', '中性子', '原子番号', '質量数', '質量数', '陽子', '陽イオン', '陰イオン'], N: 10,
    answerJp: '(a) 原子核 (b) 電子 (c) 陽子 (d) 中性子 (e) 原子番号 (f) 質量数 (g) 質量数 (h) 陽子 (i) 陽イオン (j) 陰イオン',
    explCn: '(a)原子の中心の原子核 (b)それを取り巻く電子 (c)正の電気を帯びる陽子 (d)電気的に中性な中性子 (e)陽子の数＝原子番号 (f)陽子と中性子の数の和＝質量数 (g)原子の質量は陽子＋中性子（電子は約1/1840）でほぼ決まるので質量数 (h)原子では電子の数＝陽子の数 (i)電子を失うと陽イオン (j)電子を得ると陰イオン。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qB2', category: '基本問題', topic: T_ATOM, subtopics: S_ISO,
    optMode: 'multi', Q: '各原子の原子番号，陽子の数，中性子の数，電子の数，質量数の表（a）〜（o）に適当な元素記号または数値を入れよ。',
    answerVector: ['He', '2', '2', '2', '4', '5', '4', 'O', '8', '8', '16', 'K', '19', '19', '39'], N: 15,
    answerJp: '(a) He (b) 2 (c) 2 (d) 2 (e) 4 (f) 5 (g) 4 (h) O (i) 8 (j) 8 (k) 16 (l) K (m) 19 (n) 19 (o) 39',
    explCn: '原子番号＝陽子の数＝電子の数，質量数＝陽子の数＋中性子の数。1行目：He(Z=2,質量数4)で陽子2・中性子2・電子2。2行目：Be(Z=4,質量数9)で中性子5・電子4。3行目：中性子8・電子8で原子番号8のO，質量数16。4行目：陽子19・中性子20で原子番号19のK，質量数39。',
    issues: ['題表4段目の元素記号マスと解析の「K_{(1)}」の(1)はOCR誤字（正しくは行ラベル(l)），stem は原文のまま保留'],
  },
  {
    code: 'chem-cheb2-qB3', category: '基本問題', topic: T_ATOM, subtopics: S_ISO,
    optMode: 'native', Q: '同位体に関する記述のうち，誤りを含むものを1つ選べ。',
    options: [
      '（ア）陽子の数が等しく質量数が異なる2つの原子は、互いに同位体である。',
      '（イ）中性子の数が等しく質量数が異なる2つの原子は、互いに同位体である。',
      '（ウ）電子の数が等しく質量数が異なる2つの原子は、互いに同位体である。',
      '（エ）原子番号が等しく質量数が異なる2つの原子は、互いに同位体である。',
    ], correctIndex: 1,
    answerJp: 'イ',
    explCn: '同位体は中性子の数が異なる同じ元素の原子なので，原子番号・陽子の数・電子の数は同じ。(イ)は中性子の数が等しく質量数が異なる＝陽子の数が異なるので，別の元素の原子となり誤り。',
    issues: ['題面 (エ) の文末に OCR 残留「→35」があり，stem 中は原文のまま保留；选项列表未收录该残留'],
  },
  {
    code: 'chem-cheb2-qB4', category: '基本問題', topic: T_ATOM, subtopics: S_ISO,
    optMode: 'native', Q: '塩素分子 Cl₂ の取りうる存在比を質量の小さなものから順に表した比は次のどれか（³⁵Cl：³⁷Cl＝3:1）。',
    options: ['（ア）3:2:1', '（イ）6:3:1', '（ウ）9:3:1', '（エ）9:6:1', '（オ）4:2:1', '（カ）8:4:1', '（キ）8:2:1'], correctIndex: 3,
    answerJp: 'エ（9:6:1）',
    explCn: 'Cl₂ の同位体組成は ³⁵Cl₂，³⁵Cl³⁷Cl，³⁷Cl₂ の3種類。³⁵Cl：³⁷Cl＝3:1 なので，①9/16，②6/16，③1/16。よって比は 9:6:1。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qB5', category: '基本問題', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: '(1) 最も内側にある電子殻に収容できる電子の最大数 (2) 収容できる電子の最大数が8個である電子殻の名称。',
    answerVector: ['2個', 'L殻'], N: 2,
    answerJp: '(1) 2個 (2) L殻',
    explCn: '内側から n 番目の電子殻に入る電子の最大数は 2n² 個。(1) 2×1²＝2個。(2) 2×n²＝8 より n＝2，L殻。',
    issues: ['解析原文「L 殼」の「殼」はOCR字形（殻），按項目规则保留原样不改动'],
  },
  {
    code: 'chem-cheb2-qB6', category: '基本問題', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: 'Ca，Cl のイオン生成についての文の（a）〜（k）に適当な数値，語句，元素名，化学式を入れよ。',
    answerVector: ['2', '2', '陽', 'Ca²⁺', 'アルゴン', '7', '1', '1', '陰', 'Cl⁻', 'アルゴン'], N: 11,
    answerJp: '(a) 2 (b) 2 (c) 陽 (d) Ca²⁺ (e) アルゴン (f) 7 (g) 1 (h) 1 (i) 陰 (j) Cl⁻ (k) アルゴン',
    explCn: 'Ca は価電子2個（2族）をすべて放出して 2価の陽イオン Ca²⁺ になり，Ar（18e⁻）と同じ電子配置。Cl は価電子7個（17族），電子1個受け取って 1価の陰イオン Cl⁻ になり，Ar と同じ電子配置になる。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qB7', category: '基本問題', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: '電子配置の模式図 (a)〜(e) について：(1) それぞれの元素記号 (2) それぞれの価電子の数 (3) 化学的性質の似ている原子 (4) 陽イオンになりやすいもの (5) 2価の陰イオンになるもの (6) 電子配置が安定でふつう化合物をつくらないもの。',
    answerVector: [
      '(a) Na，(b) O，(c) He，(d) Mg，(e) S',
      '(a) 1，(b) 6，(c) 0，(d) 2，(e) 6',
      'bとe',
      'a，d',
      'b，e',
      'c',
    ], N: 6,
    answerJp: '(1) (a)Na (b)O (c)He (d)Mg (e)S (2) (a)1 (b)6 (c)0 (d)2 (e)6 (3) bとe (4) a，d (5) b，e (6) c',
    explCn: '図の黒丸（電子）の数を数えると原子番号がわかる：(a)Na(11)，(b)O(8)，(c)He(2)，(d)Mg(12)，(e)S(16)。価電子は結合に関与する1〜7個（貴ガスは0）。価電子数の同じ O と S は化学的性質が似る。価電子の少ない Na，Mg は陽イオンに，O，S は（8−6＝）2個受け取り 2価の陰イオンになる。He は安定で化合物をつくらない（C は実際には C⁴⁺・C⁴⁻ にならない注釈に注意）。',
    issues: ['題面の模式図は画像リンク5枚（a〜e），stem にて原文のまま保留'],
  },
  {
    code: 'chem-cheb2-qB8', category: '基本問題', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: '(1) 電子配置が Ne 原子と同じであるイオン (2) 電子配置が Ar 原子と同じであるイオン を (ア)〜(ケ) からすべて選べ。',
    answerVector: ['ア，エ，キ，ク，ケ', 'イ，ウ，才'], N: 2,
    answerJp: '(1) ア，エ，キ，ク，ケ (2) イ，ウ，才',
    explCn: '電子数＝原子の電子数−イオンの電荷。（1）Ne＝10個：Al³⁺(13−3)，F⁻(9+1)，Mg²⁺(12−2)，Na⁺(11−1)，O²⁻(8+2)。（2）Ar＝18個：Ca²⁺(20−2)，Cl⁻(17+1)，K⁺(19−1)。',
    issues: ['解析原文 (2) の「才」はOCR字形（正しくは オ＝K⁺），按項目规则保留原样不改动'],
  },
  {
    code: 'chem-cheb2-qB9', category: '基本問題', topic: T_ATOM, subtopics: S_ISO,
    optMode: 'multi', Q: '次のイオンに含まれる電子の総数（Fe の原子番号26，Br の原子番号35）：(a) Fe²⁺ (b) Br⁻ (c) H₃O⁺ (d) OH⁻ (e) CO₃²⁻。',
    answerVector: ['24', '36', '10', '10', '32'], N: 5,
    answerJp: '(a) 24 (b) 36 (c) 10 (d) 10 (e) 32',
    explCn: 'イオンの電子の数＝構成原子の原子番号の和−イオンの電荷。(a)26−2＝24 (b)35−(−1)＝36 (c)1×3＋8−1＝10 (d)8＋1−(−1)＝10 (e)6＋8×3−(−2)＝32。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qB10', category: '基本問題', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: 'イオン化工ネルギー・電子親和力についての文の（a）〜（o）に適当な語句，数値を入れよ。',
    answerVector: ['陽イオン', '（第一）イオン化工ネルギー', '1', '2', '小さ', 'やす', '17', '0', '大き', 'にく', '陰イオン', '電子親和力', '大き', '18', 'やす'], N: 15,
    answerJp: '(a) 陽イオン (b)（第一）イオン化工ネルギー (c) 1 (d) 2 (e) 小さ (f) やす (g) 17 (h) 0 (i) 大き (j) にく (k) 陰イオン (l) 電子親和力 (m) 大き (n) 18 (o) やす',
    explCn: 'イオン化工ネルギー：価電子の少ない1族・2族の原子で小さく陽イオンになりやすく，価電子7個の17族や価電子0個の貴ガスの原子で大きくなり陽イオンになりにくい。電子親和力：17族の原子で大きく，電子1個を得て18族と同じ電子配置になり，陰イオンになりやすい。',
    issues: ['題文の「取りさって」「にく」「やす」（解析原文）の表記は原样保留'],
  },
  {
    code: 'chem-cheb2-qB11', category: '基本問題', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: '(1) He，Ne，Ar のイオン化工ネルギーが前後の元素より大きい理由を「電子配置」という用語を用いて説明せよ。(2) 同族元素では原子番号の大きい元素ほどイオン化工ネルギーが小さい理由を最外殻電子と原子核の距離に着目して説明せよ。',
    answerVector: [
      'He は最外殻（K殻）に2個，Ne・Ar は最外殻の電子殻に8個の電子が入った非常に安定な電子配置をもつため，そこから電子を取りさるのに大きなエネルギーが必要だから。',
      '同族元素どうしでは，原子番号が大きい元素ほど最外殻電子が原子核から遠くなり，引き合う力が小さくなるため，電子を取りさるのに必要なエネルギーが小さくなるから。',
    ], N: 2,
    answerJp: '(1) 最外殻の電子殻に8個（He は2個）の電子が入った安定な電子配置のため，電子を取り去るのに大きなエネルギーが必要。(2) 原子番号が大きいほど最外殻電子が原子核から遠く引き合う力が小さくなるため，必要なエネルギーが小さくなる。',
    explCn: '(1) 貴ガス He，Ne，Ar は最外殻電子殻が閉殻（He はK殻2個，Ne・Ar は8個）の安定な電子配置で，そこから電子を取り去るには大きなエネルギーが必要。(2) 同族で原子番号が大きい元素は最外殻電子が原子核から遠く，正電荷との引力が弱いので，電子を取り去るエネルギーが小さい。',
    issues: ['(1)(2) 記述問題：参考答案要点整体作槽位；題面は図（イオン化工ネルギーの概略グラフ）を含む'],
  },
  {
    code: 'chem-cheb2-qB12', category: '基本問題', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: '元素の周期表とイオンについての文の（a）〜（o）に適当な語句，数値を入れよ。',
    answerVector: ['原子番号', '族', '周期', '2', '8', '価電子', '化学', '1', 'アルカリ金属', '2', 'アルカリ土類金属', '17', 'ハロゲン', '貴ガス（希ガス）', '安定'], N: 15,
    answerJp: '(a) 原子番号 (b) 族 (c) 周期 (d) 2 (e) 8 (f) 価電子 (g) 化学 (h) 1 (i) アルカリ金属 (j) 2 (k) アルカリ土類金属 (l) 17 (m) ハロゲン (n) 貴ガス（希ガス） (o) 安定',
    explCn: '周期表は元素を原子番号の順に並べ，縦の列を族，横の行を周期といい，第1周期に2種類，第2・第3周期に8種類。典型元素では同じ族の原子の価電子の数が同じで化学的性質が似る。1族＝アルカリ金属，2族＝アルカリ土類金属，17族＝ハロゲン，18族＝貴ガス。貴ガスの電子配置は安定で，ふつう陽陰イオンにならない。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qB13', category: '基本問題', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: 'Ar，Ba，Ca，Cl，F，K，Na，Ne の8元素を最外殻電子の数の少ない順に①〜④の4つの元素群に分け：(1) 各群の元素と最外殻電子の数 (2) 各群の属する族 (3) 固有の名称 (4) 各群の示す性質（ア〜エから選べ）。',
    answerVector: [
      '①K，Na：1個 ②Ba，Ca：2個 ③Cl，F：7個 ④Ar，Ne：8個',
      '①1族 ②2族 ③17族 ④18族',
      '①アルカリ金属元素 ②アルカリ土類金属元素 ③ハロゲン元素 ④貴ガス元素',
      '①ア ②イ ③ウ ④エ',
    ], N: 4,
    answerJp: '(1) ①K,Na：1個 ②Ba,Ca：2個 ③Cl,F：7個 ④Ar,Ne：8個 (2) ①1族 ②2族 ③17族 ④18族 (3) ①アルカリ金属 ②アルカリ土類金属 ③ハロゲン ④貴ガス (4) ①ア ②イ ③ウ ④エ',
    explCn: '電子配置：K(2)L(8)M(8)N(1)，Na(2)L(8)M(1) は最外殻電子1個（1族，アルカリ金属，電子1個失い1価の陽イオン＝ア）。Ba，Ca は2個（2族，アルカリ土類金属＝イ）。Cl，F は7個（17族，ハロゲン，1個受け取り1価の陰イオン＝ウ）。Ar，Ne は8個（18族，貴ガス，電子配置安定で化合物をつくらない＝エ）。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qB14', category: '基本問題', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: '典型元素（1,2,13〜18族）は族ごとの化学的性質の違いが顕著だが，遷移元素（3〜12族）はそれほど顕著ではない理由を，第4周期の元素について化学的性質と最外殻電子の数の関係に着目して説明せよ。',
    answerVector: [
      '典型元素では，原子番号が大きくなるにつれて最外殻電子の数が増えて化学的な性質が大きく変化するが，遷移元素では，原子番号が大きくなるにつれて最外殻電子の数が2個または1個に保たれ，化学的な性質があまり変化しないから。',
    ], N: 1,
    answerJp: '典型元素では原子番号とともに最外殻電子が増えて性質が大きく変化するが，遷移元素では最外殻電子が2個または1個に保たれ，性質があまり変化しないから。',
    explCn: '元素の化学的性質は最外殻電子の数に強く影響される。第4周期の遷移元素では，原子番号が大きくなっても内側の電子殻に電子が入っていくため最外殻電子の数はおおむね2個または1個のままで，性質の違いが典型元素ほど顕著ではない。',
    issues: ['(記述問題)参考答案要点整体作槽位；題面は周期表の図を含む'],
  },
  // ---- 応用例題 / 応用問題 ----
  {
    code: 'chem-cheb2-qA1', category: '応用例題', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: 'a〜h は順に原子番号2,6,8,10,11,16,17,19 の元素。(1)(i) a と同族の元素 (ii) b と同周期の元素 (2) 価電子の数が6個の元素 (3) イオン化工ネルギーの最も大きい原子と最も小さい原子 (4) e と g では電子親和力の大きい方 (5) f と g では原子の大きい方 (6) c と e のイオンの電子数の比較 (7) g と h ではイオンの大きい方。',
    answerVector: [
      '(i) d，(ii) c，d',
      'c，f',
      '最も大きい：a ／ 最も小さい：h',
      'g',
      'f',
      '同じ',
      'g',
    ], N: 7,
    answerJp: '(1) (i)d (ii)c，d (2) c，f (3) 最も大きい：a 最も小さい：h (4) g (5) f (6) 同じ (7) g',
    explCn: 'a＝He(1周期)，b＝C，c＝O，d＝Ne（以上2周期），e＝Na，f＝S，g＝Cl（以上3周期），h＝K(4周期)。(1)(i)He と同族は Ne(d)，(ii)C と同周期は O(c)，Ne(d)。(2)16族の O(c)，S(f)。(3)イオン化工ネルギーは周期表で右上ほど大：He(a)最大，K(h)最小。(4)電子親和力は17族の Cl(g)。(5)同周期では原子番号の大きい元素ほど小さく，S(f)＞Cl(g)。(6)O²⁻ も Na⁺ も10個で同じ。(7)Cl⁻(18e⁻) と K⁺(18e⁻) は同じ電子配置で原子番号の小さい Cl⁻(g) の方が大きい。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qA2', category: '応用問題', topic: T_ATOM, subtopics: S_ISO,
    optMode: 'multi', Q: '放射性同位体・放射線についての文と表の（a）〜（l）に適当な語句，数値を入れよ。',
    answerVector: ['放射性同位体', '放射能', '2', '2', '中性子', '陽子', '7', '4', '2減少', '2減少', '変わらない', '変わらない'], N: 12,
    answerJp: '(a) 放射性同位体 (b) 放射能 (c) 2 (d) 2 (e) 中性子 (f) 陽子 (g) 7 (h) 4 (i) 2減少 (j) 2減少 (k) 変わらない (l) 変わらない',
    explCn: '(a)不安定で放射線を出す同位体を放射性同位体，(b)放射線を出す性質を放射能という。α線は ⁴He 原子核（陽子2・中性子2）。(e)(f)β線は原子核内の中性子が陽子に変化した際に放出される電子。(g)(h)質量数 235→207 は28減少，α崩壊（質量数4減少）が7回。原子番号はαで14減少するところ10減少なのでβ崩壊が4回。表：α崩壊は質量数4減少・陽子2減少・原子番号2減少，β崩壊は質量数変わらず・陽子1増加・原子番号1増加，γ崩壊はすべて変わらない。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qA3', category: '応用問題', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'native', Q: '最外殻電子の数が同じでない原子やイオンの組合せを1つ選べ。',
    options: [
      '（ア）H と Li',
      '（イ）He と Ne',
      '（ウ）O と S',
      '（エ）Ar と K⁺',
      '（オ）F⁻ と Na⁺',
      '（カ）S²⁻ と Cl⁻',
    ], correctIndex: 1,
    answerJp: 'イ（He と Ne）',
    explCn: '(ア)H・Li はともに1個，(イ)He は2個（K殻）で Ne は8個（L殻）→ 異なる，(ウ)O・S はともに6個，(エ)Ar と K⁺ はともに8個，(オ)F⁻ と Na⁺ はともに8個（Neと同じ），(カ)S²⁻ と Cl⁻ はともに8個（Arと同じ）。',
    issues: ['題面 (カ) は LaTeX 表示のため解析との突合事項（S²⁻ と Cl⁻，内容一致）'],
  },
  {
    code: 'chem-cheb2-qA4', category: '応用問題', topic: T_ATOM, subtopics: S_ISO,
    optMode: 'multi', Q: 'AとBはある元素の同位体。Aの原子番号はZ，AとBの質量数の和は2m，Aの中性子の数はBより2n大きい。(1) B の電子の数と A の中性子の数を Z, m, n を用いて表せ。(2) m＝36，n＝1，中性子の数の和が38 のときの元素は何か。',
    answerVector: ['Bの電子の数：Z', 'Aの中性子の数：m＋n−Z', '塩素'], N: 3,
    answerJp: '(1) Bの電子の数：Z ／ Aの中性子の数：m＋n−Z (2) 塩素',
    explCn: '(1) AとBは同位体で原子番号は同じZ，中性原子のBの電子の数はZ。質量数を a，b とすると a＋b＝2m，中性子の数の差は質量数の差なので a−b＝2n より a＝m＋n。よってAの中性子の数＝a−Z＝m＋n−Z。(2) Bの中性子の数＝b−Z＝m−n−Z，和＝(m＋n−Z)＋(m−n−Z)＝2m−2Z＝38。m＝36 より 2×36−2Z＝38，Z＝17 → 塩素。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qA5', category: '応用問題', topic: T_ATOM, subtopics: S_ISO,
    optMode: 'native', Q: '2価の陽イオンになったとき，26個の電子と30個の中性子をもつ原子は次のどれか。',
    options: [
      '（ア）⁵²₂₄Cr',
      '（イ）⁵⁵₂₅Mn',
      '（ウ）⁵⁶₂₆Fe',
      '（エ）⁵⁹₂₇Co',
      '（オ）⁵⁸₂₈Ni',
    ], correctIndex: 4,
    answerJp: 'オ（⁵⁸₂₈Ni）',
    explCn: '2価の陽イオン（X²⁺）の電子の数＝陽子の数−2＝26 より，陽子の数＝28，原子番号28。質量数＝陽子の数＋中性子の数＝28＋30＝58 → ⁵⁸₂₈Ni。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qA6', category: '応用問題', topic: T_ATOM, subtopics: S_ISO,
    optMode: 'multi', Q: '次の水分子（ア）〜（カ）のうち，中性子の数が同じである組合せを2つ答えよ。',
    answerVector: ['ウとカ，エとオ'], N: 1,
    answerJp: 'ウとカ，エとオ',
    explCn: '中性子の数：¹H＝0，²H＝1，¹⁶O＝8，¹⁷O＝9，¹⁸O＝10。(ア)0×2＋10＝12 (イ)0＋1＋10＝11 (ウ)1×2＋8＝10 (エ)0×2＋9＝9 (オ)0＋1＋8＝9 (カ)0＋1＋9＝10。よってウとカ（10個），エとオ（9個）。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qA7', category: '応用問題', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: '次の記述(1)〜(5)の正誤を答えよ。',
    answerVector: ['誤', '誤', '誤', '誤', '正'], N: 5,
    answerJp: '(1) 誤 (2) 誤 (3) 誤 (4) 誤 (5) 正',
    explCn: '(1)誤：原子核は原子の1万分の1〜10万分の1程度の大きさで，電子は核から離れている。(2)誤：電子はエネルギーの低いK殻から順に入る。(3)誤：He の最外殻電子は2個（K殻）なので「どれも8個」は誤り。(4)誤：イオン化工ネルギーが大きい原子は陽イオンになりにくい。(5)正：電子親和力の大きい原子は電子を得て安定な電子配置になりやすく陰イオンになりやすい。',
    issues: [],
  },
  {
    code: 'chem-cheb2-qA8', category: '応用問題', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: '次の記述(ア)〜(オ)のうち，正しいものをすべて選べ。',
    answerVector: ['エ，オ'], N: 1,
    answerJp: '正しいもの：エ，オ',
    explCn: '(ア)誤：イオン化工ネルギーは17族の F の方が 1族の Na より大きい。(イ)誤：電子親和力も17族の F の方が Na より大きい。(ウ)誤：同じ電子配置のイオンでは原子番号の大きい方が小さいので，F⁻ の方が Na⁺ より大きい。(エ)正：K⁺ は Na⁺ より電子殻が多く大きい。(オ)正：Na の第二イオン化工ネルギー（Na⁺→Na²⁺）は第一よりずっと大きい。',
    issues: ['解析に図2枚（2390717c…，11717259…）を含む，stem/解析は原文のまま保留'],
  },
  {
    code: 'chem-cheb2-qA9', category: '応用問題', topic: T_SHELL, subtopics: S_SHELL,
    optMode: 'multi', Q: '周期表の一部 a〜q について：(1) アルカリ金属元素 (2) 遷移元素 (3) M殻の電子が6個 (4) 中性子をもたない同位体がある (5) 2価の陰イオンになる (6) a〜q のうちイオン化工ネルギーが最も小さい (7) h〜j のうち原子が最も小さい (8) e と同じ電子配置のイオンのうち最も小さいものをつくる。',
    answerVector: ['f，l', 'n', 'i', 'a', 'd，i', 'l', 'j', 'h'], N: 8,
    answerJp: '(1) f，l (2) n (3) i (4) a (5) d，i (6) l (7) j (8) h',
    explCn: '(1)Hを除く1族：f(Na)，l(K)。(2)3〜12族：n（第4周期の遷移元素）。(3)K(2)L(8)M(6) で原子番号16の S → i。(4)¹H は中性子をもたない → a。(5)16族の O(d)，S(i)。(6)与えられた表中で最も左下の l(K)。(7)同一周期では17族元素が最も小さい：j(Cl)。(8)e(Ne)と同じ電子配置のイオンをつくるのは d(O²⁻)，f(Na⁺)，g(Mg²⁺)，h(Al³⁺) で，原子番号の大きい h(Al³⁺) が最も小さい。',
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
  console.log('cheb2 drafts:', d.length);
  const s = new Map();
  d.forEach((x) => s.set(x.generationStatus, (s.get(x.generationStatus) || 0) + 1));
  console.log('status:', Object.fromEntries(s));
}