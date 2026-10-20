#!/usr/bin/env node
/**
 * che11_pilot_content.cjs — che11（第11章 金属元素（Ⅱ）遷移元素 +
 * 金属イオンの分離・分析 + 金属材料・無機材料）内容定义
 *
 * 源：che11_题目.md + che11_解析.md（仅此两文件，其余为过程文件）
 * 考纲：ejuSyllabus.ts
 *  - 遷移元素（クロム・マンガン・鉄・銅・亜鉛・銀等）→ chem_3_1_2
 *     _01 遷移元素単体 / _02 化合物の性質と反応 / _03 用途
 *  - 金属イオンの分離･分析 → chem_3_1_4（_01 分離 / _02 分析）
 *  - 広く利用されている金属と無機化合物 → chem_3_1_5（_01 金属材料 / _02 無機材料）
 *
 * 变通：记述题（ブリキ/トタン理由、H₂S還元の説明、炎色反応確認等）已把
 * 参考答案要点作为一个槽位纳入多空构造；计算题（定量倍率）同样一个槽位。
 */
'use strict';

const T_TR = 'chem_3_1_2';                    // 遷移元素
const T_SEP = 'chem_3_1_4';                   // 金属イオンの分離・分析
const T_MAT = 'chem_3_1_5';                   // 広く利用されている金属と無機化合物
const S_TR1 = ['chem_3_1_2_01'];              // 遷移元素・単体の性質
const S_TR2 = ['chem_3_1_2_02'];              // 遷移元素・化合物の性質と反応
const S_TR12 = ['chem_3_1_2_01', 'chem_3_1_2_02'];
const S_SEP1 = ['chem_3_1_4_01'];             // 分離
const S_SEP2 = ['chem_3_1_4_02'];             // 分析（確認・同定・検出）
const S_SEP12 = ['chem_3_1_4_01', 'chem_3_1_4_02'];
const S_MAT = ['chem_3_1_5_01'];              // 金属材料
const S_MAT12 = ['chem_3_1_5_01', 'chem_3_1_5_02'];

const CONTENT = [
  // ---- 基礎 CHECK ----
  {
    code: 'chem-che11-qC1', category: '基礎 CHECK', topic: T_TR, subtopics: S_TR2,
    optMode: 'multi', Q: '鉄鉱石を還元すると得られる、炭素を約4%含む硬くてもろい鉄の名称。',
    answerVector: ['銑鉄'], N: 1,
    answerJp: '銑鉄',
    explCn: '鉄鉱石をコークスで還元して得られる、炭素を約4%含む硬くてもろい鉄を銑鉄（pig iron）という。銑鉄の炭素含有率を2～0.02%に下げたものを鋼という。',
    issues: [],
  },
  {
    code: 'chem-che11-qC2', category: '基礎 CHECK', topic: T_TR, subtopics: S_TR1,
    optMode: 'multi', Q: '単体の金属の中で電気や熱を最もよく通す金属の名称。',
    answerVector: ['銀'], N: 1,
    answerJp: '銀',
    explCn: '単体の金属のうち電気や熱の伝導性が最も大きいのは銀（Ag）である。',
    issues: [],
  },
  {
    code: 'chem-che11-qC3', category: '基礎 CHECK', topic: T_TR, subtopics: S_TR2,
    optMode: 'multi', Q: 'Cu²⁺・Fe²⁺・Fe³⁺・Ag⁺ を含む水溶液の色をそれぞれ答えよ。',
    answerVector: ['青', '淡緑', '黄褐', '無色'], N: 4,
    answerJp: '(1) Cu²⁺:青 (2) Fe²⁺:淡緑 (3) Fe³⁺:黄褐 (4) Ag⁺:無色',
    explCn: '遷移元素の水溶液中のイオンは特有の色を示す：Cu²⁺ 青、Fe²⁺ 淡緑、Fe³⁺ 黄褐、Ag⁺ 無色。',
    issues: [],
  },
  {
    code: 'chem-che11-qC4', category: '基礎 CHECK', topic: T_SEP, subtopics: S_SEP2,
    optMode: 'multi', Q: '金属イオン(Ag⁺,Pb²⁺,Cu²⁺,Al³⁺,Zn²⁺)×試薬(塩酸,硫化水素(酸性),アンモニア水(少量),NaOH水溶液(少量))で沈殿を生じるものを選び、沈殿の化学式と色を答えよ（沈殿しない欄は対象外）。',
    answerVector: [
      'AgCl、白', 'PbCl₂、白', 'Ag₂S、黒', 'PbS、黒', 'CuS、黒',
      'Ag₂O、褐', 'Pb(OH)₂、白', 'Cu(OH)₂、青白', 'Al(OH)₃、白', 'Zn(OH)₂、白',
      'Ag₂O、褐', 'Pb(OH)₂、白', 'Cu(OH)₂、青白', 'Al(OH)₃、白', 'Zn(OH)₂、白',
    ], N: 15,
    answerJp: '(ア)AgCl,白 (イ)PbCl₂,白 (カ)Ag₂S,黒 (キ)PbS,黒 (ク)CuS,黒 (サ)Ag₂O,褐 (シ)Pb(OH)₂,白 (ス)Cu(OH)₂,青白 (セ)Al(OH)₃,白 (ソ)Zn(OH)₂,白 (タ)Ag₂O,褐 (チ)Pb(OH)₂,白 (ツ)Cu(OH)₂,青白 (テ)Al(OH)₃,白 (ト)Zn(OH)₂,白',
    explCn: '塩酸では AgCl・PbCl₂（白色）が沈殿（Cu²⁺・Al³⁺・Zn²⁺ は沈殿しない）。酸性で H₂S では Ag₂S(黒)・PbS(黒)・CuS(黒) が沈殿（Al³⁺・Zn²⁺ はしない）。アンモニア水少量・NaOH少量では両者とも水酸化物（Ag は Ag₂O 褐色）が沈殿する。',
    issues: [],
  },
  {
    code: 'chem-che11-qC6', category: '基礎 CHECK', topic: T_SEP, subtopics: S_SEP1,
    optMode: 'multi', Q: '酸性溶液中では硫化物の沈殿が生じないが、塩基性にすると硫化物の沈殿が生じるものを (カ)～(コ) から選べ。',
    answerVector: ['コ'], N: 1,
    answerJp: 'コ',
    explCn: 'Zn²⁺ は酸性では H₂S と反応せず硫化物沈殿をつくらないが、塩基性にすると ZnS（白色）が沈殿する。イオン化傾向が中程度の Zn、Fe、Ni は酸性では硫化物沈殿を生じず、中性～塩基性で生じる。',
    issues: [],
  },
  {
    code: 'chem-che11-qC7', category: '基礎 CHECK', topic: T_SEP, subtopics: S_SEP1,
    optMode: 'multi', Q: '生じた沈殿が多量のアンモニア水により溶解するものを (サ)～(ソ) からすべて選べ。',
    answerVector: ['サ、ス、ソ'], N: 1,
    answerJp: 'サ、ス、ソ',
    explCn: 'NH₃ と錯イオンをつくって溶けるのは Ag₂O（[Ag(NH₃)₂]⁺）、Cu(OH)₂（[Cu(NH₃)₄]²⁺）、Zn(OH)₂（[Zn(NH₃)₄]²⁺）で、Al(OH)₃・Pb(OH)₂ は溶けない。',
    issues: [],
  },
  {
    code: 'chem-che11-qC8', category: '基礎 CHECK', topic: T_SEP, subtopics: S_SEP1,
    optMode: 'multi', Q: '生じた沈殿が多量の水酸化ナトリウム水溶液により溶解するものを (タ)～(ト) からすべて選べ。',
    answerVector: ['チ、テ、ト'], N: 1,
    answerJp: 'チ、テ、ト',
    explCn: '過剰の NaOH に溶ける（両性水酸化物）のは Pb(OH)₂（[Pb(OH)₄]²⁻）、Al(OH)₃（[Al(OH)₄]⁻）、Zn(OH)₂（[Zn(OH)₄]²⁻）。Ag₂O・Cu(OH)₂ は溶けない。',
    issues: [],
  },
  {
    code: 'chem-che11-qC5', category: '基礎 CHECK', topic: T_MAT, subtopics: S_MAT,
    optMode: 'multi', Q: '(1)鉄板に亜鉛をめっきしたもの (2)鉄板にスズをめっきしたもの の名称。',
    answerVector: ['トタン', 'ブリキ'], N: 2,
    answerJp: '(1)トタン (2)ブリキ',
    explCn: '鉄板に Zn をめっきしたものをトタン、Sn をめっきしたものをブリキという。Zn は Fe よりイオン化傾向が大きく、Sn は小さい。',
    issues: [],
  },

  // ---- 基本例題 ----
  {
    code: 'chem-che11-qE1', category: '基本例題', topic: T_TR, subtopics: S_TR2,
    optMode: 'multi', Q: '鉄イオンの反応：文中の (ア)～(キ) に当てはまる色を答えよ。',
    answerVector: ['淡緑', '黄褐', '緑白', '濃青', '赤褐', '濃青', '血赤'], N: 7,
    answerJp: '(ア)淡緑 (イ)黄褐 (ウ)緑白 (エ)濃青 (オ)赤褐 (カ)濃青 (キ)血赤',
    explCn: 'Fe²⁺ 淡緑、Fe³⁺ 黄褐。NaOH で Fe(OH)₂ 緑白沈殿・Fe(OH)₃ 赤褐色沈殿。K₃[Fe(CN)₆]（フェリシアン化カリ）で Fe²⁺ がターンブルブルー濃青沈殿、K₄[Fe(CN)₆]（フェロシアン化カリ）で Fe³⁺ がベルリンブルー濃青沈殿。KSCN で Fe³⁺ が血赤色。',
    issues: [],
  },
  {
    code: 'chem-che11-qE2', category: '基本例題', topic: T_TR, subtopics: S_TR2,
    optMode: 'multi', Q: '銅とその化合物：文中の (ア)～(ケ) に適当な語句・色を入れ、①・②をイオン反応式で表せ。',
    answerVector: [
      '電解精錬', '小さい', '青', '赤', '黒', '青', '白', '青白', '深青',
      'Cu²⁺＋2OH⁻→Cu(OH)₂',
      'Cu(OH)₂＋4NH₃→[Cu(NH₃)₄]²⁺＋2OH⁻',
    ], N: 11,
    answerJp: '(ア)電解精錬 (イ)小さい (ウ)青 (エ)赤 (オ)黒 (カ)青 (キ)白 (ク)青白 (ケ)深青 ①Cu²⁺＋2OH⁻→Cu(OH)₂ ②Cu(OH)₂＋4NH₃→[Cu(NH₃)₄]²⁺＋2OH⁻',
    explCn: '粗銅は電解精錬で純銅に。Cu はイオン化傾向が H より小さいので希塩酸や希硫酸に溶けないが、硝酸・熱濃硫酸には溶け Cu²⁺(青)。Cu₂O 赤色、CuO 黒色。CuSO₄·5H₂O 青色結晶、加熱で無水物(白)。CuSO₄ 水溶液にアンモニア水少量で Cu(OH)₂ 青白沈殿、多量で [Cu(NH₃)₄]²⁺ 深青色の溶液。',
    issues: [],
  },
  {
    code: 'chem-che11-qE3', category: '基本例題', topic: T_SEP, subtopics: S_SEP12,
    optMode: 'multi', Q: '各組の2種類のイオンを含む混合溶液から、下線を付したイオンだけを沈殿させる方法を (ア)～(キ) から1つ選び、そのとき生じる沈殿の化学式を記せ。',
    answerVector: ['イ、AgCl', 'カ、Fe(OH)₂', 'ア、BaSO₄', 'オ、CuS', 'キ、Fe(OH)₂'], N: 5,
    answerJp: '(1)イ、AgCl (2)カ、Fe(OH)₂ (3)ア、BaSO₄ (4)オ、CuS (5)キ、Fe(OH)₂',
    explCn: '希塩酸で Ag⁺ のみ AgCl 沈殿；過剰 NaOH で Fe²⁺ のみ Fe(OH)₂（Cu²⁺ は [Cu(OH)₄]²⁻ で溶解）；希硫酸で Ba²⁺ のみ BaSO₄；希塩酸酸性→H₂S で Cu²⁺ のみ CuS（黒）；過剰アンモニア水で Fe²⁺ のみ Fe(OH)₂（他の金属は錯イオン化または沈殿なし）。',
    issues: [],
  },

  // ---- 基本問題 ----
  {
    code: 'chem-che11-qB1', category: '基本問題', topic: T_TR, subtopics: S_TR1,
    optMode: 'multi', Q: '元素の周期表：(a)1,2,13～18族の元素・(b)3～12族の元素 の称、遷移元素が初めて出現する (c)周期・(d)元素名・(e)原子番号・(f)元素記号、(g)最外殻の名称、(h)~(k) 遷移元素の性質。',
    answerVector: ['典型', '遷移', '4', 'スカンジウム', '21', 'Sc', 'N', '硬く', '高く', '高い', '有色'], N: 11,
    answerJp: '(a)典型 (b)遷移 (c)4 (d)スカンジウム (e)21 (f)Sc (g)N (h)硬く (i)高く (j)高い (k)有色',
    explCn: '1,2,13～18族を典型元素、3～12族を遷移元素という。遷移元素の初出は第4周期のスカンジウム(₂₁Sc)。遷移元素は最外殻(N殻)の電子数がほぼ2個または1個で、内側の電子殻に電子が入る。単体は硬く、密度・融点が高く、イオンや化合物は有色のものが多い。',
    issues: [],
  },
  {
    code: 'chem-che11-qB2', category: '基本問題', topic: T_TR, subtopics: S_TR2,
    optMode: 'multi', Q: '鉄の製造：溶鉱炉に鉄鉱石・コークス・(a)を入れて反応させると (b) により酸化鉄が還元され (c) が得られる。(c) を (d) に入れて酸素を吹き込み (e) が得られる。(2)赤鉄鉱の主成分の化学式。',
    answerVector: ['石灰石', '一酸化炭素', '銑鉄', '転炉', '鋼', 'Fe₂O₃'], N: 6,
    answerJp: '(1)(a)石灰石 (b)一酸化炭素 (c)銑鉄 (d)転炉 (e)鋼 (2)Fe₂O₃',
    explCn: '製鉄はコークスの燃焼で生じる CO による酸化鉄の還元：Fe₂O₃＋3CO→2Fe＋3CO₂。石灰石はスラグ形成に使われる。銑鉄（C約4%）を転炉で酸素を吹き込み脱炭して鋼（C 2～0.02%）を得る。赤鉄鉱の主成分は Fe₂O₃（磁鉄鉱は Fe₃O₄）。',
    issues: [],
  },
  {
    code: 'chem-che11-qB3', category: '基本問題', topic: T_TR, subtopics: S_TR2,
    optMode: 'multi', Q: '鉄イオンの反応経路図：(1)Fe²⁺・Fe³⁺ を含む水溶液の色 (2)(A)(B)の沈殿の物質名と色 (3)(C)(D)(E)に該当する試薬(ア KSCN / イ K₄[Fe(CN)₆] / ウ KCl / エ K₃[Fe(CN)₆])。',
    answerVector: ['淡緑', '黄褐', '水酸化鉄(Ⅱ)、緑白', '水酸化鉄(Ⅲ)、赤褐', 'エ', 'イ', 'ア'], N: 7,
    answerJp: '(1)Fe²⁺:淡緑 Fe³⁺:黄褐 (2)A:水酸化鉄(Ⅱ)、緑白 B:水酸化鉄(Ⅲ)、赤褐 (3)C:エ D:イ E:ア',
    explCn: 'Fe²⁺ 淡緑色、Fe³⁺ 黄褐色。Fe²⁺＋2OH⁻→Fe(OH)₂(緑白)、Fe³⁺＋3OH⁻→Fe(OH)₃(赤褐)。Fe²⁺ の検出に K₃[Fe(CN)₆]（ターンブルブルー濃青）、Fe³⁺ の検出に K₄[Fe(CN)₆]（ベルリンブルー濃青）、KSCN は Fe³⁺ で血赤色。',
    issues: [],
  },
  {
    code: 'chem-che11-qB4', category: '基本問題', topic: T_TR, subtopics: S_TR2,
    optMode: 'multi', Q: '銅の反応経路図：(1)(A)～(C)の化合物の化学式と色 (2)(D)の水溶液に含まれる錯イオンの名称・化学式・色。',
    answerVector: ['CuO、黒', 'CuS、黒', 'Cu(OH)₂、青白', 'テトラアンミン銅(Ⅱ)イオン', '[Cu(NH₃)₄]²⁺', '深青'], N: 6,
    answerJp: '(1)A:CuO、黒 B:CuS、黒 C:Cu(OH)₂、青白 (2)テトラアンミン銅(Ⅱ)イオン、[Cu(NH₃)₄]²⁺、深青',
    explCn: 'Cu²⁺＋S²⁻→CuS(黒)；Cu²⁺＋2OH⁻→Cu(OH)₂(青白)、加熱で CuO(黒)。Cu(OH)₂ に NH₃ を加えると [Cu(NH₃)₄]²⁺（深青色）の錯イオンになる。酸化銅(Ⅰ)Cu₂O は赤色。',
    issues: [],
  },
  {
    code: 'chem-che11-qB5', category: '基本問題', topic: T_TR, subtopics: S_TR2,
    optMode: 'multi', Q: '銀の反応経路図：(1)(A)～(C)の化合物の化学式と色 (2)(D)に含まれる錯イオンの名称・化学式・色 (3)銀が濃硝酸に溶ける反応の化学反応式。',
    answerVector: ['Ag₂S、黒', 'AgCl、白', 'Ag₂O、褐', 'ジアンミン銀(Ⅰ)イオン', '[Ag(NH₃)₂]⁺', '無色', 'Ag＋2HNO₃→AgNO₃＋H₂O＋NO₂'], N: 7,
    answerJp: '(1)A:Ag₂S、黒 B:AgCl、白 C:Ag₂O、褐 (2)ジアンミン銀(Ⅰ)イオン、[Ag(NH₃)₂]⁺、無色 (3)Ag＋2HNO₃→AgNO₃＋H₂O＋NO₂',
    explCn: '2Ag⁺＋S²⁻→Ag₂S(黒)；Ag⁺＋Cl⁻→AgCl(白・感光性)；2Ag⁺＋2OH⁻→Ag₂O(褐)＋H₂O。Ag₂O に NH₃ 水で [Ag(NH₃)₂]⁺（無色）。銀は濃硝酸で Ag＋2HNO₃→AgNO₃＋H₂O＋NO₂（希硝酸なら NO）。',
    issues: [],
  },
  {
    code: 'chem-che11-qB6', category: '基本問題', topic: T_TR, subtopics: S_TR12,
    optMode: 'multi', Q: '亜鉛：周期表第(a)周期(b)族、N殻の電子(c)個。空気中で強熱(d)、単体は(e)金属、希硫酸(f)、濃NaOH水溶液(g)、アンモニア水少量で(h)式・(i)色沈殿、さらに加えると(j)式・沈殿が溶けて(k)色。',
    answerVector: [
      '4', '12', '2',
      '2Zn＋O₂→2ZnO',
      '両性',
      'Zn＋H₂SO₄→ZnSO₄＋H₂',
      'Zn＋2NaOH＋2H₂O→Na₂[Zn(OH)₄]＋H₂',
      'Zn²⁺＋2OH⁻→Zn(OH)₂',
      '白',
      'Zn(OH)₂＋4NH₃→[Zn(NH₃)₄]²⁺＋2OH⁻',
      '無',
    ], N: 11,
    answerJp: '(a)4 (b)12 (c)2 (d)2Zn＋O₂→2ZnO (e)両性 (f)Zn＋H₂SO₄→ZnSO₄＋H₂ (g)Zn＋2NaOH＋2H₂O→Na₂[Zn(OH)₄]＋H₂ (h)Zn²⁺＋2OH⁻→Zn(OH)₂ (i)白 (j)Zn(OH)₂＋4NH₃→[Zn(NH₃)₄]²⁺＋2OH⁻ (k)無',
    explCn: 'Zn は第4周期12族、2価の陽イオンになりやすい、両性金属。空気中で強熱すると 2ZnO。酸・強塩基とも反応し H₂ 発生。アンモニア水少量で Zn(OH)₂ 白色沈殿が生じ、多量では [Zn(NH₃)₄]²⁺ 錯イオンで溶解する。',
    issues: [],
  },
  {
    code: 'chem-che11-qB7', category: '基本問題', topic: T_MAT, subtopics: S_MAT,
    optMode: 'multi', Q: '記述：ブリキ・トタンに傷がついて水にぬれたとき先に溶ける金属の名称と理由を説明せよ。',
    answerVector: [
      '鉄', '鉄とスズでは鉄のほうがイオン化傾向が大きいから',
      '亜鉛', '鉄と亜鉛では亜鉛のほうがイオン化傾向が大きいから',
    ], N: 4,
    answerJp: '(1)鉄。鉄とスズでは鉄のほうがイオン化傾向が大きいから。(2)亜鉛。鉄と亜鉛では亜鉛のほうがイオン化傾向が大きいから。',
    explCn: 'ブリキは Fe よりイオン化傾向が小さい Sn で、トタンは Fe より大きい Zn で鉄板をめっきしたもの。傷で鉄板が露出すると、接している2種類の金属のうちイオン化傾向の大きいほうが先に溶ける：ブリキは Fe、トタンは Zn。',
    issues: [],
  },
  {
    code: 'chem-che11-qB8', category: '基本問題', topic: T_TR, subtopics: S_TR2,
    optMode: 'multi', Q: 'クロム酸塩：(1)クロム酸カリウム水溶液を加えたとき (a)赤褐色～暗赤色沈殿 (b)黄色沈殿 を生じるもの（ア硝酸銀/イ塩化ナトリウム/ウ硝酸鉛(Ⅱ)/エ塩化バリウム）。(2)(a)CrO₄²⁻にH⁺(b)Cr₂O₇²⁻にOH⁻ のイオン反応式と変化後の色。',
    answerVector: [
      'ア', 'ウ、エ',
      '2CrO₄²⁻＋2H⁺→Cr₂O₇²⁻＋H₂O、赤橙',
      'Cr₂O₇²⁻＋2OH⁻→2CrO₄²⁻＋H₂O、黄',
    ], N: 4,
    answerJp: '(1)(a)ア (b)ウ、エ (2)(a)2CrO₄²⁻＋2H⁺→Cr₂O₇²⁻＋H₂O、赤橙色 (b)Cr₂O₇²⁻＋2OH⁻→2CrO₄²⁻＋H₂O、黄色',
    explCn: 'Ag⁺＋CrO₄²⁻→Ag₂CrO₄(赤褐)、Pb²⁺・Ba²⁺＋CrO₄²⁻→PbCrO₄・BaCrO₄(黄)。CrO₄²⁻(黄)は酸性で Cr₂O₇²⁻(赤橙) に、塩基性で逆反応。どちらの Cr の酸化数も +6。',
    issues: [],
  },
  {
    code: 'chem-che11-qB9', category: '基本問題', topic: T_TR, subtopics: S_TR2,
    optMode: 'multi', Q: '過マンガン酸カリウム：結晶の色(a)、水溶液の過マンガン酸イオンの色(b)、Mnの酸化数(c)。酸性溶液中では酸化数(d)の(e)色 Mn²⁺ に、塩基性・中性では酸化数(f)の黒色(g)になる。',
    answerVector: ['黒紫', '赤紫', '+7', '+2', '淡桃', '+4', 'MnO₂'], N: 7,
    answerJp: '(a)黒紫 (b)赤紫 (c)+7 (d)+2 (e)淡桃 (f)+4 (g)MnO₂',
    explCn: 'KMnO₄ は黒紫色結晶で水溶液は赤紫色、Mn の酸化数 +7 の強酸化剤。酸性：MnO₄⁻→Mn²⁺(淡桃色,酸化数+2)；塩基性・中性：MnO₄⁻→MnO₂(黒,酸化数+4)。',
    issues: [],
  },
  {
    code: 'chem-che11-qB14', category: '基本問題', topic: T_MAT, subtopics: S_MAT12,
    optMode: 'multi', Q: 'チタン・ニッケル：(a)軽く硬くさびにくい金属、(b)その酸化物の光触媒作用を示す物質の称、(c)白銅・ステンレス鋼に用いる金属、(d)ステンレス鋼の成分、(e)ハイブリッド自動車に用いる二次電池。',
    answerVector: ['チタン', '光触媒', 'ニッケル', 'クロム', 'ニッケル-水素'], N: 5,
    answerJp: '(a)チタン (b)光触媒 (c)ニッケル (d)クロム (e)ニッケル-水素',
    explCn: 'チタンは軽く硬く表面に酸化被膜でさびにくく、TiO₂ は光触媒（セルフクリーニング等）。白銅は Cu-Ni 合金、ステンレス鋼は Fe-Cr-Ni 合金。ニッケル-水素電池はハイブリッド自動車に利用。',
    issues: [],
  },
  {
    code: 'chem-che11-qB10', category: '基本問題', topic: T_MAT, subtopics: S_MAT,
    optMode: 'multi', Q: '合金：(1)合金は a{化合物・混合物} ではなく b{化合物・混合物} とみなす。(2)(a)銅・スズの合金 (b)アルミニウム・銅・マグネシウムの合金 (c)鉄・クロム・ニッケルの合金 (d)銅・亜鉛の合金 の名称。',
    answerVector: ['化合物', '混合物', '青銅', 'ジュラルミン', 'ステンレス鋼', '黄銅'], N: 6,
    answerJp: '(1)(a)化合物 (b)混合物 (2)(a)青銅(ブロンズ) (b)ジュラルミン (c)ステンレス鋼 (d)黄銅(しんちゅう)',
    explCn: '合金は成分の割合を任意に変えられる混合物。青銅=Cu-Sn（鋳造品・美術工芸品）、ジュラルミン=Al-Cu-Mg（航空機）、ステンレス鋼=Fe-Cr-Ni（台所用品）、黄銅=Cu-Zn（楽器）。',
    issues: [],
  },
  {
    code: 'chem-che11-qB15', category: '基本問題', topic: T_SEP, subtopics: S_SEP1,
    optMode: 'multi', Q: 'Ag⁺,Ca²⁺,Cu²⁺,Fe²⁺,K⁺,Zn²⁺ の酸性水溶液に H₂S を通じた：(1)硫化物沈殿を生じるものを化学式と色 (2)酸性では生じず塩基性で生じるものを化学式と色。',
    answerVector: ['Ag₂S、黒', 'CuS、黒', 'FeS、黒', 'ZnS、白'], N: 4,
    answerJp: '(1)Ag₂S・黒、CuS・黒 (2)FeS・黒、ZnS・白',
    explCn: 'イオン化傾向が小さい Ag⁺・Cu²⁺ は酸性でも硫化物沈殿（Ag₂S 黒、CuS 黒）。Zn²⁺・Fe²⁺ は酸性では沈殿せず塩基性で ZnS(白)・FeS(黒)。イオン化傾向の大きい Ca²⁺・K⁺ は硫化物沈殿を生じない。',
    issues: [],
  },
  {
    code: 'chem-che11-qB16', category: '基本問題', topic: T_SEP, subtopics: S_SEP2,
    optMode: 'multi', Q: '次の反応を示す水溶液中のイオンを (ア)Ag⁺(イ)Al³⁺(ウ)Cu²⁺(エ)Fe²⁺(オ)Fe³⁺(カ)Pb²⁺(キ)Zn²⁺ から選べ。',
    answerVector: ['ウ', 'ア', 'キ', 'オ', 'カ'], N: 5,
    answerJp: '(1)ウ (2)ア (3)キ (4)オ (5)カ',
    explCn: '(1)アンモニア水で青白沈殿→過剰で深青溶解は Cu²⁺。(2)希塩酸で白沈殿、光で黒変は AgCl（Ag⁺）。(3)アンモニア水で白沈殿→過剰で無色溶解は Zn²⁺。(4)K₄[Fe(CN)₆] で濃青は Fe³⁺。(5)HCl で白・K₂CrO₄ で黄は Pb²⁺。',
    issues: [],
  },
  {
    code: 'chem-che11-qB11', category: '基本問題', topic: T_TR, subtopics: S_TR1,
    optMode: 'multi', Q: '遷移金属の推定：記述(a)～(d)より金属 A～E（銀・鉄・金・マンガン・銅）を元素記号で答えよ。',
    answerVector: ['Cu', 'Mn', 'Au', 'Fe', 'Ag'], N: 5,
    answerJp: 'A:Cu B:Mn C:Au D:Fe E:Ag',
    explCn: '有色の A,C は銅(赤)と金(黄)。希硫酸に溶ける B,D は Fe と Mn（H よりイオン化傾向大）。希硫酸に溶けず硝酸に溶ける A,E は Cu と Ag。+4 の酸化物 BO₂ が黒色の B は Mn（MnO₂）、D₃O₄ が黒色の D は Fe（Fe₃O₄）。',
    issues: [],
  },
  {
    code: 'chem-che11-qB17', category: '基本問題', topic: T_SEP, subtopics: S_SEP1,
    optMode: 'multi', Q: '次のイオンの混合溶液から一方のみを沈殿させる試薬を (ア)～(エ) から選び、沈殿の化学式を記せ（試薬は十分量）。',
    answerVector: ['イ、AgCl', 'ウ、Pb(OH)₂', 'エ、Fe(OH)₂', 'エ、Cu(OH)₂', 'エ、Ag₂O'], N: 5,
    answerJp: '(1)イ(塩酸)、AgCl (2)ウ(アンモニア水)、Pb(OH)₂ (3)エ(NaOH)、Fe(OH)₂ (4)エ(NaOH)、Cu(OH)₂ (5)エ(NaOH)、Ag₂O',
    explCn: '(1)Cu²⁺・Ag⁺：塩酸で AgCl のみ沈殿。(2)Ba²⁺・Pb²⁺：アンモニア水で Pb(OH)₂ のみ（Ba²⁺ は沈殿しない）。(3)Al³⁺・Fe²⁺：NaOH で Fe(OH)₂ のみ（Al³⁺ は [Al(OH)₄]⁻）。(4)K⁺・Cu²⁺：NaOH で Cu(OH)₂ のみ。(5)Zn²⁺・Ag⁺：NaOH で Ag₂O のみ（Zn²⁺ は [Zn(OH)₄]²⁻）。',
    issues: [],
  },
  {
    code: 'chem-che11-qB12', category: '基本問題', topic: T_SEP, subtopics: S_SEP1,
    optMode: 'multi', Q: 'Ag⁺,Ba²⁺,Cu²⁺,Al³⁺ を含む水溶液の系統分離：試薬(a)～(c)を (ア)希硝酸(イ)希塩酸(ウ)アンモニア水(エ)硫酸アンモニウム水溶液(オ)水酸化ナトリウム水溶液 から選べ。',
    answerVector: ['イ', 'エ', 'ウ'], N: 3,
    answerJp: '(a)イ (b)エ (c)ウ',
    explCn: '(a)Ag⁺ のみ沈殿させるのは Cl⁻ を含む希塩酸(イ)：AgCl(白)。(b)Ba²⁺ のみ沈殿させるのは SO₄²⁻ を含む硫酸アンモニウム(エ)：BaSO₄(白)。(c)残る Cu²⁺・Al³⁺ は OH⁻ で沈殿するがアンモニア水(ウ)：Cu(OH)₂(青白)・Al(OH)₃、さらに過剰 NH₃ で Cu(OH)₂ のみ [Cu(NH₃)₄]²⁺ に溶解。',
    issues: [],
  },
  {
    code: 'chem-che11-qB13', category: '基本問題', topic: T_SEP, subtopics: S_SEP12,
    optMode: 'multi', Q: 'Na⁺,Fe³⁺,Cu²⁺,Pb²⁺ を含む水溶液の系統分離：(1)沈殿A,Bの化学式 (2)操作3で希硝酸を加える理由 (3)溶液Dに含まれる金属イオンとその確認操作。',
    answerVector: [
      'PbCl₂', 'CuS',
      '硫化水素で還元されて生じた鉄(Ⅱ)イオンを酸化して鉄(Ⅲ)イオンにもどすため',
      'ナトリウムイオン',
      '白金線につけて外炎の中に入れ、黄色の炎色反応を示すことを確かめる',
    ], N: 5,
    answerJp: '(1)A:PbCl₂ B:CuS (2)硫化水素で還元されて生じた鉄(Ⅱ)イオンを酸化して鉄(Ⅲ)イオンにもどすため (3)ナトリウムイオン。溶液Dを白金線につけて外炎の中に入れ、黄色の炎色反応を示すことを確かめる。',
    explCn: '操作1の塩酸で PbCl₂(白)、ろ液は酸性なので操作2の H₂S で CuS(黒) が沈殿。H₂S により Fe³⁺ は Fe²⁺ に還元されるので、操作3で煮沸して H₂S を追い出したのち希硝酸で Fe²⁺ を Fe³⁺ にもどす（Fe(OH)₃ のほうが沈殿させやすい）。残った Na⁺ は炎色反応（黄）で確認。',
    issues: [],
  },

  // ---- 応用例題 ----
  {
    code: 'chem-che11-qA1', category: '応用例題', topic: T_SEP, subtopics: S_SEP12,
    optMode: 'multi', Q: 'Ag⁺,Pb²⁺,Cu²⁺,Na⁺,Ba²⁺ の混合溶液の分離：(1)操作(ア)の試薬 (2)沈殿A～Cの化学式 (3)溶液D,Eの金属イオン (4)溶液Eの確認操作と結果。',
    answerVector: [
      'イ',
      'AgCl', 'CuS', 'BaCO₃',
      'Pb²⁺', 'Na⁺',
      '白金線につけてガスバーナーの外炎の中に入れると、炎が黄色を呈する',
    ], N: 7,
    answerJp: '(1)イ (2)A:AgCl B:CuS C:BaCO₃ (3)D:Pb²⁺ E:Na⁺ (4)溶液Eを白金線につけて外炎の中に入れると炎が黄色を呈する',
    explCn: '希塩酸(イ)で Ag⁺・Pb²⁺ が沈殿（AgCl・PbCl₂）。PbCl₂ は熱水に溶けるので D は Pb²⁺。酸性で H₂S により Cu²⁺ のみ CuS 沈殿。Ba²⁺ は CO₃²⁻ で BaCO₃ 沈殿、Na⁺ は残る（炎色反応で黄色に確認）。',
    issues: [],
  },

  // ---- 応用問題 ----
  {
    code: 'chem-che11-qA2', category: '応用問題', topic: T_TR, subtopics: S_TR2,
    optMode: 'multi', Q: '鉄くぎと銅線/亜鉛板の腐食実験：(1)シャーレAで青と赤に変化した部分に生じたイオン (2)シャーレBの亜鉛板の表面と鉄くぎの表面のイオン反応式 (3)シャーレBで色が変化した部分の色(ア～オ)。',
    answerVector: ['Fe²⁺', 'OH⁻', 'Zn→Zn²⁺＋2e⁻', 'O₂＋2H₂O＋4e⁻→4OH⁻', 'ア'], N: 5,
    answerJp: '(1)青:Fe²⁺ 赤:OH⁻ (2)亜鉛板:Zn→Zn²⁺＋2e⁻ 鉄くぎ:O₂＋2H₂O＋4e⁻→4OH⁻ (3)ア(赤)',
    explCn: 'Fe がイオン化して Fe²⁺ が K₃[Fe(CN)₆] と濃青（ターンブルブルー）。O₂ の還元で OH⁻ が生じフェノールフタレインで赤色。シャーレBでは Zn＞Fe なので Zn が溶け、電子が鉄くぎへ移動し O₂＋2H₂O＋4e⁻→4OH⁻。（3）答：ア（赤）。',
    issues: [],
  },
  {
    code: 'chem-che11-qA3', category: '応用問題', topic: T_TR, subtopics: S_TR1,
    optMode: 'multi', Q: '元素の推定：Aは亜鉛・アルミニウム・水銀・スズのいずれか、B～Eは金・銀・鉄・銅・ニッケル・白金のいずれか。A～Eの元素記号。',
    answerVector: ['Hg', 'Au', 'Fe', 'Cu', 'Ag'], N: 5,
    answerJp: 'A:Hg B:Au C:Fe D:Cu E:Ag',
    explCn: '融点-39℃ で単体が液体の金属は Hg のみ。B は有色光沢・酸や塩基に安定で Au（黄金色）。ヘキサシアニド鉄(Ⅲ)酸カリウムで濃青沈殿は Fe²⁺ の確認（C=Fe）。水溶液が青色は Cu²⁺（D=Cu）。塩化物が水に溶けないのは AgCl（E=Ag）。',
    issues: [],
  },
  {
    code: 'chem-che11-qA4', category: '応用問題', topic: T_SEP, subtopics: S_SEP2,
    optMode: 'multi', Q: '塩の推定：(1)酸性の過マンガン酸カリウム水溶液の赤紫色を消し酸素を発生するもの (2)酸性で硫化水素で黒色沈殿 (3)亜鉛を入れると金属が析出し、この金属が塩酸・希硫酸と反応して水素を発生する化合物（ア NH₄Cl/イ FeSO₄/ウ Na₂CO₃/エ H₂C₂O₄/オ AlCl₃/カ (CH₃COO)₂Cu/キ AgNO₃/ク Na₂SiO₃）。',
    answerVector: ['なし', 'カ、キ', 'イ'], N: 3,
    answerJp: '(1)なし (2)カ、キ (3)イ',
    explCn: '(1)還元剤で O₂ を発生するのは H₂O₂ のみで、選択肢にない。(2)酸性で硫化物沈殿をする Ag⁺・Cu²⁺・Pb²⁺ を含むのは (CH₃COO)₂Cu と AgNO₃（CuS黒・Ag₂S黒）。(3)Zn で金属析出は Fe・Cu・Ag を含むもので、塩酸と水素発生は Fe のみ → FeSO₄。',
    issues: [],
  },
  {
    code: 'chem-che11-qA5', category: '応用問題', topic: T_SEP, subtopics: S_SEP2,
    optMode: 'multi', Q: '定量：KI と NaCl の混合物0.600g の水溶液に HNO₃ 酸性で過剰の硝酸銀を加え、生じた沈殿に過剰のアンモニア水を加えて溶けずに残った AgI 0.235g。KI の質量は NaCl の質量の何倍か。Na=23,Cl=35.5,K=39,Ag=108,I=127。',
    answerVector: ['0.382倍'], N: 1,
    answerJp: '0.382倍',
    explCn: 'AgI 0.235g 中の I⁻ は 0.235×(127/235)=0.127g。KI の質量=0.127×(166/127)=0.166g。NaCl=0.600-0.166=0.434g。よって 0.166/0.434≈0.382（倍）。',
    issues: [],
  },
  {
    code: 'chem-che11-qA6', category: '応用問題', topic: T_SEP, subtopics: S_SEP2,
    optMode: 'multi', Q: '塩の推定：5種類の水溶液A～E（KI,FeCl₂,FeCl₃,Cu(NO₃)₂,CuSO₄,ZnSO₄,AgNO₃,BaCl₂ のいずれか）を実験1～5から推定せよ。',
    answerVector: ['ZnSO₄', 'FeCl₃', 'KI', 'BaCl₂', 'AgNO₃'], N: 5,
    answerJp: 'A:ZnSO₄ B:FeCl₃ C:KI D:BaCl₂ E:AgNO₃',
    explCn: '実験1(アンモニア水で沈殿→過剰で無色溶解)：Zn²⁺ は [Zn(NH₃)₄]²⁺（A=ZnSO₄）。実験2で過剰アンモニア水で溶けない沈殿：Fe³⁺（B=FeCl₃）。実験3でデンプン青紫色は I₂：C=KI。実験5で B・D とアンモニア水に溶ける白色沈殿：Ag⁺（E=AgNO₃）。実験4で A と白沈殿：D=BaCl₂（BaSO₄）。',
    issues: [],
  },
  {
    code: 'chem-che11-qA7', category: '応用問題', topic: T_SEP, subtopics: S_SEP2,
    optMode: 'multi', Q: '沈殿の生成：次の試薬で沈殿を生じるものを選び、沈殿の化学式と色（[白色 黒色 赤褐色 褐色 黄色 緑白色 青白色]から）を答えよ。(1)HCl水溶液 (2)H₂SO₄水溶液 (3)過剰のNaOH水溶液 (4)K₂CrO₄水溶液。',
    answerVector: [
      'AgCl、白', 'PbCl₂、白',
      'CaSO₄、白', 'BaSO₄、白', 'PbSO₄、白',
      'Mg(OH)₂、白', 'Fe(OH)₂、緑白', 'Cu(OH)₂、青白', 'Ag₂O、褐',
      'Ag₂CrO₄、赤褐', 'BaCrO₄、黄', 'PbCrO₄、黄',
    ], N: 12,
    answerJp: '(1)AgCl(白)、PbCl₂(白) (2)CaSO₄(白)、BaSO₄(白)、PbSO₄(白) (3)Mg(OH)₂(白)、Fe(OH)₂(緑白)、Cu(OH)₂(青白)、Ag₂O(褐) (4)Ag₂CrO₄(赤褐)、BaCrO₄(黄)、PbCrO₄(黄)',
    explCn: '(1)Cl⁻ で沈殿するのは Ag⁺・Pb²⁺。(2)SO₄²⁻ で沈殿するのは Ca²⁺・Ba²⁺・Pb²⁺。(3)OH⁻ で沈殿するが過剰の NaOH に溶けない（両性でない）もの：Mg²⁺・Fe²⁺・Cu²⁺・Ag⁺（Ag は Ag₂O 褐）。(4)CrO₄²⁻ で沈殿：Ag⁺(Ag₂CrO₄ 赤褐)・Ba²⁺(BaCrO₄ 黄)・Pb²⁺(PbCrO₄ 黄)。',
    issues: [],
  },
  {
    code: 'chem-che11-qA8', category: '応用問題', topic: T_TR, subtopics: S_TR2,
    optMode: 'multi', Q: '錯イオンに関する記述(a)～(d)のうち正しいものをすべて選べ。',
    answerVector: ['a、b、c'], N: 1,
    answerJp: 'a、b、c',
    explCn: '(a)正：[Al(OH)₄]⁻ など典型元素イオンの錯イオンもある。(b)正：[Ag(NH₃)₂]⁺ は配位数2。(c)正：水分子を配位子とするアクア錯イオン [Cu(H₂O)₄]²⁺ が存在。(d)誤：[Fe(CN)₆]³⁻ は3価の陰イオン。',
    issues: [],
  },
  {
    code: 'chem-che11-qA9', category: '応用問題', topic: T_SEP, subtopics: S_SEP12,
    optMode: 'multi', Q: 'Ag⁺,K⁺,Pb²⁺,Ca²⁺,Zn²⁺,Cu²⁺,Al³⁺ を含む水溶液の系統的分離：(a)～(i)の金属を含む沈殿またはイオンの化学式。',
    answerVector: [
      'AgCl', '[Ag(NH₃)₂]⁺', 'Pb²⁺', 'CuS',
      '[Cu(NH₃)₄]²⁺', '[Al(OH)₄]⁻', 'ZnS', 'CaCO₃', 'K⁺',
    ], N: 9,
    answerJp: '(a)AgCl (b)[Ag(NH₃)₂]⁺ (c)Pb²⁺ (d)CuS (e)[Cu(NH₃)₄]²⁺ (f)[Al(OH)₄]⁻ (g)ZnS (h)CaCO₃ (i)K⁺',
    explCn: '①塩酸：AgCl・PbCl₂(白)沈殿。AgCl は NH₃ 水で [Ag(NH₃)₂]⁺、PbCl₂ は熱水で Pb²⁺ に。②ろ液酸性で H₂S：CuS(黒)沈殿、熱硝酸+過剰 NH₃ で [Cu(NH₃)₄]²⁺(深青)。③NH₃ 水で Al(OH)₃、過剰 NaOH で [Al(OH)₄]⁻。④塩基性で H₂S：ZnS(白)。⑤(NH₄)₂CO₃：CaCO₃(白)。⑥残る K⁺ は炎色反応。',
    issues: [],
  },
  {
    code: 'chem-che11-qA10', category: '応用問題', topic: T_SEP, subtopics: S_SEP12,
    optMode: 'multi', Q: '陰イオンの分離：Ca(OH)₂ で白色沈殿A、ろ液に硝酸銀で黄色沈殿B、沈殿Aに塩酸で一部溶け気体C、CをBa(OH)₂に吸収し白色沈殿D。(1)沈殿Aに含まれる化合物2種と沈殿B,D (2)気体C (3)試料溶液に含まれていた陰イオン3種。',
    answerVector: ['CaSO₄・CaCO₃', 'AgI', 'BaCO₃', 'CO₂', 'CO₃²⁻、SO₄²⁻、I⁻'], N: 5,
    answerJp: '(1)A:CaSO₄・CaCO₃ B:AgI D:BaCO₃ (2)CO₂ (3)CO₃²⁻、SO₄²⁻、I⁻',
    explCn: '白色で難溶性のカルシウム塩は CaCO₃（塩酸に溶けて CO₂）と CaSO₄（溶けない）。ろ液の I⁻ と Ag⁺ で黄色 AgI 沈殿。CO₂ を Ba(OH)₂ に吸収すると BaCO₃ 白沈殿。よって陰イオンは CO₃²⁻・SO₄²⁻・I⁻。',
    issues: [],
  },
];

function build() {
  const labels = ['(a)', '(b)', '(c)', '(d)', '(e)', '(f)', '(g)', '(h)', '(i)', '(j)', '(k)', '(l)', '(m)', '(n)', '(o)', '(p)'];
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
  console.log('che11 drafts:', d.length);
  const s = new Map();
  d.forEach((x) => s.set(x.generationStatus, (s.get(x.generationStatus) || 0) + 1));
  console.log('status:', Object.fromEntries(s));
  const nat = d.filter((x) => x.options.length > 0 && x.correctIndex !== null);
  console.log('有选项+答案的题:', nat.map((x) => `${x.businessCode}(idx=${x.correctIndex})`).join(', '));
}