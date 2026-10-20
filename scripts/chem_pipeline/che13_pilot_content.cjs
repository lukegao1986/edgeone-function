#!/usr/bin/env node
/**
 * che13_pilot_content.cjs — che13（第13章 脂肪族炭化水素）内容定义
 *
 * 源：che13_题目.md + che13_解析.md（仅此两文件，其余为过程文件）
 * 考纲：ejuSyllabus.ts
 *  - アルカン・アルケン・アルキンの構造・性質・反応・製法・燃焼 → chem_4_1_1_01
 *  - 石油の成分と利用（原油の分留）→ chem_4_1_1_02
 *  - 異性体（構造異性体・シス-トランス・不斉炭素原子・異性体の数）→ chem_4_1_1_03
 *
 * 变通：
 *  - qB10（すす・理由 40字）、qB11（原油の分留説明）→ 把答案要点作为槽位纳入多空构造；
 *  - qA2(2)（沸点が低い順の列挙）、qA4(1)（m/n の反応式）、qA5(298)、qA6(299)（構造式推定 A~I/A~G）
 *    按"语言描述（示性式・名称・要点）"作槽，不要求作图。
 */
'use strict';

const T_ALI = 'chem_4_1_1';                  // 脂肪族炭化水素
const S_ALK = ['chem_4_1_1_01'];             // アルカン・アルケン・アルキン
const S_OIL = ['chem_4_1_1_02'];             // 石油の成分と利用
const S_ISO = ['chem_4_1_1_03'];             // 異性体
const S_01_03 = ['chem_4_1_1_01', 'chem_4_1_1_03'];

const CONTENT = [
  // ---- 基礎 CHECK ----
  {
    code: 'chem-che13-qC1', category: '基礎 CHECK', topic: T_ALI, subtopics: S_ALK,
    optMode: 'multi', Q: '(1)一般式 CₙH₂ₙ₊₂ の炭化水素 (2)一般式 CₙH₂ₙ で二重結合1個 (3)一般式 CₙH₂ₙ で環状構造 (4)一般式 CₙH₂ₙ₋₂ で三重結合1個 をそれぞれ何というか。',
    answerVector: ['アルカン', 'アルケン', 'シクロアルカン', 'アルキン'], N: 4,
    answerJp: '(1)アルカン (2)アルケン (3)シクロアルカン (4)アルキン',
    explCn: '一般式 CₙH₂ₙ₊₂（飽和）＝アルカン、CₙH₂ₙ（不飽和二重結合1個）＝アルケン、CₙH₂ₙ で環状＝シクロアルカン、CₙH₂ₙ₋₂（三重結合1個）＝アルキン。',
    issues: [],
  },
  {
    code: 'chem-che13-qC2', category: '基礎 CHECK', topic: T_ALI, subtopics: S_ALK,
    optMode: 'multi', Q: '同じ一般式で表される化合物で，分子式が CH₂ ずつ違う化合物群を何というか。',
    answerVector: ['同族体'], N: 1,
    answerJp: '同族体',
    explCn: '同じ一般式で表され、隣り合うものが CH₂ だけ異なる化合物群を同族体（同族列）という。',
    issues: [],
  },
  {
    code: 'chem-che13-qC3', category: '基礎 CHECK', topic: T_ALI, subtopics: S_ALK,
    optMode: 'multi', Q: '(1)CH₂=CH₂ (2)CH₃-C≡CH (3)CH₃-CH(CH₃)-CH₃ (4)環状構造（シクロアルカン）はアルカン・シクロアルカン・アルケン・アルキンのどれか。',
    answerVector: ['アルケン', 'アルキン', 'アルカン', 'シクロアルカン'], N: 4,
    answerJp: '(1)アルケン (2)アルキン (3)アルカン (4)シクロアルカン',
    explCn: '(1)エチレン C=C 1個→アルケン。(2)プロピン C≡C→アルキン。(3)全て単結合の鎖状→アルカン（2-メチルプロパン）。(4)環状＋単結合のみ→シクロアルカン。',
    issues: [],
  },
  {
    code: 'chem-che13-qC4', category: '基礎 CHECK', topic: T_ALI, subtopics: S_ALK,
    optMode: 'multi', Q: '(1)分子中の原子が他の原子や基に置き換わる反応 (2)不飽和結合の原子に他の原子が結合する反応 を何というか。また(3)(a)アルカンは(1)(2)のどちらが起こりやすいか、(b)アルキンはどちらか。',
    answerVector: ['置換反応', '付加反応', '(1)の置換反応', '(2)の付加反応'], N: 4,
    answerJp: '(1)置換反応 (2)付加反応 (3)(a)アルカン→置換反応 (b)アルキン→付加反応',
    explCn: '置換反応＝分子中の原子が他の原子や原子団に置き換わる反応。付加反応＝不飽和結合に他の原子が結合する反応。アルカンは付加反応を起こさず安定だが、光を当てるとハロゲンと置換反応を起こす。アルケン・アルキンは付加反応を起こしやすい。',
    issues: [],
  },
  {
    code: 'chem-che13-qC5', category: '基礎 CHECK', topic: T_ALI, subtopics: S_ALK,
    optMode: 'multi', Q: '多数の分子が次々と付加して鎖状に結合する反応を何というか。',
    answerVector: ['付加重合'], N: 1,
    answerJp: '付加重合',
    explCn: '多数の分子が次々と付加し、鎖状の高分子化合物をつくる反応を付加重合という（例：エチレン→ポリエチレン）。',
    issues: [],
  },

  // ---- 基本例題 ----
  {
    code: 'chem-che13-qE1', category: '基本例題', topic: T_ALI, subtopics: S_ALK,
    optMode: 'multi', Q: '炭化水素の反応系統図：(A)~(E) は示性式、(ア)~(ウ) は反応名を答えよ（CH₄→CH₃Cl…→CCl₄ 系列、CH₂=CH₂+HCl→CH₃-CH₂-Cl 系列、nCH₂=CH₂→重合）。',
    answerVector: ['CH₃-CH₃', 'CH₂=CH₂', 'CH≡CH', 'CH₃-CHO', 'CH₃-CH₂-Cl', '置換反応', '付加反応', '付加重合'], N: 8,
    answerJp: '(A)CH₃-CH₃ (B)CH₂=CH₂ (C)CH≡CH (D)CH₃-CHO (E)CH₃-CH₂-Cl、(ア)置換反応 (イ)付加反応 (ウ)付加重合',
    explCn: 'アルカンは光の下でハロゲンと置換反応（CH₄→CH₃Cl→…→CCl₄）。C=C・C≡C は付加反応（CH₂=CH₂+HCl→CH₃-CH₂-Cl）。多数分子の付加で鎖状高分子になるのが付加重合（nCH₂=CH₂→[CH₂-CH₂]ₙ）。',
    issues: [],
  },

  // ---- 基本問題 ----
  {
    code: 'chem-che13-qB1', category: '基本問題', topic: T_ALI, subtopics: S_01_03,
    optMode: 'multi', Q: '鎖式飽和炭化水素：(a)総称 (b)一般式 (c)ブタンの次 (d)ペンタンの次 (e)構造異性体が現れる炭素数 (f)異性体の名称 (g)ペンタンの異性体数 (h)メタンの立体構造 (i)C-C-C の結合角（50°/70°/90°/110°/130°の選択）。',
    answerVector: ['アルカン', 'CₙH₂ₙ₊₂', 'ブタン', 'ペンタン', '4', '構造異性体', '3', '正四面体', '110°'], N: 9,
    answerJp: '(a)アルカン (b)CₙH₂ₙ₊₂ (c)ブタン (d)ペンタン (e)4 (f)構造異性体 (g)3 (h)正四面体 (i)約110°',
    explCn: '不飽和結合をもたない鎖式炭化水素はアルカン（CₙH₂ₙ₊₂）。炭素数 4 個以上で構造異性体が存在（ブタンは2種、ペンタンは3種）。メタンは正四面体形で H-C-H 結合角は約109.5°≒110°。プロパンの結合角もほぼ同じ。',
    issues: [],
  },
  {
    code: 'chem-che13-qB2', category: '基本問題', topic: T_ALI, subtopics: S_ALK,
    optMode: 'multi', Q: '炭化水素の分類表：(a)エチレンの分類 (b)アセチレンの分類 (c)アルカンの一般式 (d)アルキンの一般式 (e)メタンの立体構造 (f)エチレンの立体構造。(g)(h)(i)には実験室的製法を(ア)~(エ)から選べ（(エ)=酢酸Na+NaOH 加熱、(イ)=濃硫酸170℃でエタノール、(ア)=CaC₂に水）。',
    answerVector: ['アルケン', 'アルキン', 'CₙH₂ₙ₊₂', 'CₙH₂ₙ₋₂', '正四面体形', '平面形（長方形）', 'エ', 'イ', 'ア'], N: 9,
    answerJp: '(a)アルケン (b)アルキン (c)CₙH₂ₙ₊₂ (d)CₙH₂ₙ₋₂ (e)正四面体形 (f)平面形（長方形） (g)エ (h)イ (i)ア',
    explCn: 'エチレンはアルケン（CₙH₂ₙ）、アセチレンはアルキン（CₙH₂ₙ₋₂）。メタンは正四面体形、エチレンは二重結合の6原子が同一平面（長方形）。メタン＝酢酸ナトリウムとソーダ石灰加熱(エ)、エチレン＝濃硫酸170℃でエタノール脱水(イ)、アセチレン＝CaC₂+H₂O(ア)。',
    issues: [],
  },
  {
    code: 'chem-che13-qB3', category: '基本問題', topic: T_ALI, subtopics: S_01_03,
    optMode: 'multi', Q: '(1) 2-メチルペンタンの分子式 (2) 2-メチルペンタンを含む C₆H₁₄ の構造異性体（名称列挙） (3) 2-メチルペンタン 1.0L（密度0.645g/cm³）の完全燃焼に必要な空気量（空気中 O₂ 20%、標準状態）。',
    answerVector: ['C₆H₁₄', '5種類', '8.0×10³L'], N: 3,
    answerJp: '(1)C₆H₁₄ (2)ヘキサン、2-メチルペンタン、3-メチルペンタン、2,2-ジメチルブタン、2,3-ジメチルブタンの5種類 (3)8.0×10³L',
    explCn: '(1)2-メチルペンタンは C₆H₁₄（ヘキサン類）。(2)ヘキサンの構造異性体は5種。(3)2C₆H₁₄+19O₂→12CO₂+14H₂O。1.0L の C₆H₁₄=645g/86≈7.5mol。O₂ 必要量=7.5×19/2≈71.3mol、空気=その5倍=22.4×71.3×5≈8.0×10³L。',
    issues: [],
  },
  {
    code: 'chem-che13-qB4', category: '基本問題', topic: T_ALI, subtopics: S_ALK,
    optMode: 'multi', Q: '(1)メタンの塩素化：(a)反応名 (b)(ア)(イ)は化学式、(ウ)は物質名（CH₄→CH₃Cl→(ウ)→(ア)クロロホルム→(イ)テトラクロロメタン）。(2)エチレン・アセチレンの水素添加：(a)反応名 (b)次々と付加して長く鎖状になる反応名。(3)右辺：(a)CH₂=CH₂+Br₂→ (b)CH₂=CH₂+H₂O→。',
    answerVector: ['置換反応', 'CHCl₃', 'CCl₄', 'ジクロロメタン', '付加反応', '付加重合', 'CH₂Br-CH₂Br', 'CH₃-CH₂-OH'], N: 8,
    answerJp: '(1a)置換反応 (b)(ア)CHCl₃ (イ)CCl₄ (ウ)ジクロロメタン (2a)付加反応 (2b)付加重合 (3a)CH₂Br-CH₂Br (3b)CH₃-CH₂-OH',
    explCn: '(1)アルカンの H が光の下でハロゲンに置き換わる＝置換反応。(2)不飽和結合に原子が付く＝付加反応、多数分子の付加で鎖状になる＝付加重合。(3a)Br₂ が C=C に付加→CH₂Br-CH₂Br。(3b)H₂O が付加→CH₃-CH₂-OH（エタノール）。',
    issues: [],
  },
  {
    code: 'chem-che13-qB5', category: '基本問題', topic: T_ALI, subtopics: S_ISO,
    optMode: 'multi', Q: '(1)(A)CH₃-CH=CH-CH₃（cis-2-ブテン）と構造異性体の関係にある物質を(B)～(G)からすべて選べ。(2)(A)とシス-トランス異性体の関係にある物質を選べ。(B)CH₂=CH-CH₂-CH₃ (C)trans-2-ブテン (D)CH₃-C(CH₃)=CH₂ (E)シクロブタン (F)CH₃-CH=CH-CH=CH₂ (G)2-ブテンの書き替え（上下逆）などの対応。',
    answerVector: ['B，D，E', 'C'], N: 2,
    answerJp: '(1)B，D，E (2)C',
    explCn: '(A)~(G) のうち (A)(C)(G) は C₄H₈ で (A) と (C) はシス-トランス異性体、(G) は (A) と同じ物質（書き表し方の向き違い）。構造異性体＝結合の順序が異なる (B)(D)(E)。(F) は C₄H₆ で (A) と異なり異性体ではない。',
    issues: [],
  },
  {
    code: 'chem-che13-qB6', category: '基本問題', topic: T_ALI, subtopics: S_ISO,
    optMode: 'multi', Q: 'エタンの H2 個を Cl に置換（(ア)種類、(イ)異性体名）。C₂H₂Cl₂ は(ウ)種類で HCIC=CHCl の2つは(エ)異性体。C₃H₆Cl₂ のうち不斉炭素原子をもたないのは(オ)種類、もつものの構造式（不斉炭素を C* として）は(カ)。',
    answerVector: ['2', '構造', '3', 'シス-トランス', '3', 'CH₂Cl-CH(Cl)-CH₃（中央のCがC*）'], N: 6,
    answerJp: '(ア)2 (イ)構造 (ウ)3 (エ)シス-トランス (オ)3 (カ)CH₂Cl-CH*Cl-CH₃',
    explCn: 'C₂H₄Cl₂ は CHCl₂-CH₃ と CH₂Cl-CH₂Cl の2種（構造異性体）。C₂H₂Cl₂ は3種（a:同じCにCl2個、b/c:シス・トランス）。C₃H₆Cl₂ は4種（CHCl₂CH₂CH₃、CH₂Cl-CHCl-CH₃、CH₂Cl-CH₂-CH₂Cl、CH₃-CCl₂-CH₃）、不斉炭素は CH₂Cl-CH*Cl-CH₃ のみで、残り3種は不斉をもたない。',
    issues: [],
  },
  {
    code: 'chem-che13-qB7', category: '基本問題', topic: T_ALI, subtopics: S_01_03,
    optMode: 'multi', Q: 'アルケンA に臭素を付加すると生成物の分子量はA の約3.3倍。(1)A の分子式。(2)Aと同じ分子式になりうる炭化水素を(ア)アルカン(イ)アルキン(ウ)シクロアルカン(エ)シクロアルケンからすべて選べ。(3)水素付加で得られるアルカンB の構造異性体はB を含めて何種類か。',
    answerVector: ['C₅H₁₀', 'ウ', '3種類'], N: 3,
    answerJp: '(1)C₅H₁₀ (2)ウ (3)B(C₅H₁₂)の構造異性体は3種類',
    explCn: '(1)12n+2n+160=(12n+2n)×3.3 → n≈5 → C₅H₁₀。(2)シクロアルカンも CₙH₂ₙ（n≧3）。(3)C₅H₁₀+H₂→C₅H₁₂（ペンタン類）の構造異性体はペンタン・2-メチルブタン・2,2-ジメチルプロパンの3種。',
    issues: [],
  },
  {
    code: 'chem-che13-qB8', category: '基本問題', topic: T_ALI, subtopics: S_ALK,
    optMode: 'multi', Q: '(1)気体の炭化水素A 1.0g が標準状態で 0.40L。A はアルカン・アルケン・アルキンのどれか。(2)二重結合1個のB 7.0g に触媒で水素を作用させ、反応した水素が 2.24L～2.35L。B として考えられる分子式と分類名をすべて記せ。',
    answerVector: ['アルケン', 'C₅H₁₀', 'C₅H₈'], N: 3,
    answerJp: '(1)アルケン（A=C₄H₈） (2)C₅H₁₀アルケン と C₅H₈シクロアルケン',
    explCn: '(1)M×0.40=22.4 → M=56 → CₓHᵧ で 12x+y=56、H 最大数 2x+2 より x=4,y=8 → C₄H₈（アルケン）。(2)M=22.4×7.0/2.24=70、M′=22.4×7.0/2.35≈67 より分子量67～70。二重結合1個で C₅H₁₀（70・アルケン）と C₅H₈（68・シクロアルケン）。',
    issues: [],
  },
  {
    code: 'chem-che13-qB9', category: '基本問題', topic: T_ALI, subtopics: S_ALK,
    optMode: 'multi', Q: 'C₂H₄, C₂H₂ の関連化合物の系統図：(A)の組成式と物質名、(B)の分子式と物質名、(C)~(H)の構造式と物質名（CaC₂→アセチレン→ベンゼン/ポリエチレン/エタン/アセトアルデヒド/塩化ビニル/1,2-ジクロロエタン/エタノール）。',
    answerVector: ['CaC₂', 'C₆H₆', 'ポリエチレン', 'CH₃-CH₃', 'CH₃-CHO', 'CH₂=CH-Cl', 'CH₂Cl-CH₂Cl', 'CH₃-CH₂-OH'], N: 8,
    answerJp: '(A)CaC₂：炭化カルシウム (B)ベンゼンC₆H₆ (C)ポリエチレン (D)エタンCH₃-CH₃ (E)アセトアルデヒドCH₃-CHO (F)塩化ビニルCH₂=CH-Cl (G)1,2-ジクロロエタンCH₂Cl-CH₂Cl (H)エタノールCH₃-CH₂-OH',
    explCn: '(A)CaC₂+2H₂O→CH≡CH+Ca(OH)₂（アセチレンの実験室的製法）。(B)3CH≡CH→C₆H₆（ベンゼン、触媒・加熱で重合）。(C)エチレンの付加重合でポリエチレン。(D)エチレン+H₂→エタン。(E)アセチレン+H₂O→ビニルアルコール→アセトアルデヒド。(F)アセチレン+HCl→塩化ビニル。(G)エチレン+Cl₂→1,2-ジクロロエタン（工業的にはこれの熱分解で塩化ビニル）。(H)エチレン+H₂O→エタノール。',
    issues: [],
  },
  {
    code: 'chem-che13-qB10', category: '基本問題', topic: T_ALI, subtopics: S_ALK,
    optMode: 'multi', Q: 'エタン・エチレン・アセチレンを空気中で燃焼させたとき、最も炎が明るく多くのすすを出すものはどれか。考え方とともに答えよ（40字程度）。',
    answerVector: ['アセチレン', '炭素の含有率（質量比）が最も高いから'], N: 2,
    answerJp: 'アセチレン（炭素の含有率が最も高いから）',
    explCn: '炭素の含有率は C₂H₆:80%、C₂H₄:86%、C₂H₂:92%。炭素の割合が大きい炭化水素ほど不完全燃焼を起こしやすく、多量のすすを伴って明るく燃える。',
    issues: [],
  },
  {
    code: 'chem-che13-qB11', category: '基本問題', topic: T_ALI, subtopics: S_OIL,
    optMode: 'multi', Q: '精留塔の内部の温度は上部ほど低い。このことに着目して、精留塔の上のほうと下のほうで取り出される成分にどのような違いがあるか説明せよ。',
    answerVector: ['上のほうでは沸点の低い成分、下のほうでは沸点の高い成分が取り出される'], N: 1,
    answerJp: '上のほうでは沸点の低い成分、下のほうでは沸点の高い成分が取り出される',
    explCn: '原油は沸点の違いを利用した分留で成分ごとに分離する。上部ほど温度が低いので、低い温度でも気体として存在する（沸点の低い）成分が上部で取り出され、沸点の高い成分は下部で取り出される。',
    issues: [],
  },

  // ---- 応用例題 ----
  {
    code: 'chem-che13-qA1', category: '応用例題', topic: T_ALI, subtopics: S_ALK,
    optMode: 'multi', Q: '気体の炭化水素A は臭素水を脱色し、A 2.00L=3.75g、完全燃焼に O₂ 9.00L、環状構造なし。(1)A の分子式 (2)A の物質名。',
    answerVector: ['C₃H₆', 'プロペン'], N: 2,
    answerJp: '(1)C₃H₆ (2)プロペン',
    explCn: '(1)A は CₓHᵧ、燃焼式で x+y/4=9.00/2.00=4.50。M=3.75×22.4/2.00=42.0 → 12x+1.0y=42.0。連立で x=3,y=6 → C₃H₆。(2)一般式 CₙH₂ₙ・環状でないのでアルケン → プロペン。',
    issues: [],
  },

  // ---- 応用問題 ----
  {
    code: 'chem-che13-qA2', category: '応用問題', topic: T_ALI, subtopics: S_ALK,
    optMode: 'multi', Q: 'アルカンの沸点：(1)(a)アルコールと比べ高い・低い、(b)極性は大きい・小さい、(c)枝分かれしたアルカンの沸点は直鎖より高い・低い。(2)炭素数5のアルカンの異性体を沸点が低い順に述べよ。',
    answerVector: ['低い', '小さい', '低い', '2,2-ジメチルプロパン、2-メチルブタン、ペンタンの順'], N: 4,
    answerJp: '(1)(a)低い (b)小さい (c)低い (2)2,2-ジメチルプロパン → 2-メチルブタン → ペンタンの順に沸点が高い',
    explCn: 'アルカンは極性が小さく分子間力が弱いので、同じ分子量のアルコールより沸点が低い。分子鎖が枝分かれして球状に近いほど表面積が小さく分子間力が弱いので沸点が低い。C₅H₁₂ では 2,2-ジメチルプロパン(10℃)＜2-メチルブタン(28℃)＜ペンタン(36℃)。',
    issues: [],
  },
  {
    code: 'chem-che13-qA3', category: '応用問題', topic: T_ALI, subtopics: S_ISO,
    optMode: 'multi', Q: 'ブタンと塩素の置換反応で光学異性体を同じ化合物と考える：(a)一置換体は何種類 (b)二置換体は何種類 (c)二置換体のうち不斉炭素を含まないものは何種類。(一置換体から脱離で生じるブテン)：(d)シス-トランスを区別するとアルケンは何種類 (e)シス-トランス異性体は何組。',
    answerVector: ['2', '6', '3', '3', '1'], N: 5,
    answerJp: '(a)2 (b)6 (c)3 (d)3 (e)1',
    explCn: '(a)1-クロロブタン・2-クロロブタンの2種。(b)2個のCl置換は主鎖端から列挙して6種（不斉炭素を含むもの複数）。(c)不斉炭素を含まないのは3種。(d)一置換体2種の脱離で 1-ブテン（①②で同一）と2-ブテン（cis/trans）→ 計3種。(e)2-ブテンのシス-トランスは1組。',
    issues: [],
  },
  {
    code: 'chem-che13-qA4', category: '応用問題', topic: T_ALI, subtopics: S_ALK,
    optMode: 'multi', Q: '炭素数 m のアルカン1.0mol と n のアルカン2.0mol (m＜n) を O₂15.0mol と混合して完全燃焼、127℃ で P=6.640×10⁵Pa、V=100L。(1)反応式（m、n で） (2)完全燃焼後の物質量の合計 (3)2種類のアルカンの名称。',
    answerVector: ['CₘH₂ₘ₊₂+(3m+1)/2 O₂→mCO₂+(m+1)H₂O', 'CₙH₂ₙ₊₂+(3n+1)/2 O₂→nCO₂+(n+1)H₂O', '20mol', 'メタン', 'プロパン'], N: 5,
    answerJp: '(1)CₘH₂ₘ₊₂+(3m+1)/2 O₂→mCO₂+(m+1)H₂O、CₙH₂ₙ₊₂+(3n+1)/2 O₂→nCO₂+(n+1)H₂O (2)20mol (3)メタンとプロパン',
    explCn: '(1)アルカン一般式より反応式 2 本。(2)pV=nRT：6.640×10⁵×100=n×8.3×10³×400 → n=20.0mol。(3)燃焼後の総mol={(m+2n)+(m+1)+2(n+1)+(15-(3m+1)/2-(3n+1))}=(m+2n+33)/2=20 → m+2n=7。m＜n の自然数で m=1(メタン)、n=3(プロパン)。',
    issues: [],
  },
  {
    code: 'chem-che13-qA5', category: '応用問題', topic: T_ALI, subtopics: S_01_03,
    optMode: 'multi', Q: 'エチレンのH原子を n 個(n=1～4)のメチル基で置換：A(n=1)、B(n=2)、C(n=2・トランス形)、D(n=2)、E(n=3)、F(n=4)。B に H₂ 付加でG、C・D に H₂ 付加でH。E に HBr 付加でメチル基2個側に Br の付いた I が主生成。A～I の構造式（示性式で）を答えよ。',
    answerVector: ['CH₃-CH=CH₂', '(CH₃)₂C=CH₂', 'trans-CH₃-CH=CH-CH₃', 'cis-CH₃-CH=CH-CH₃', '(CH₃)₂C=CH-CH₃', '(CH₃)₂C=C(CH₃)₂', 'CH₃-CH(CH₃)-CH₃', 'CH₃-CH₂-CH₂-CH₃', 'CH₃-CH₂-CBr(CH₃)-CH₃'], N: 9,
    answerJp: 'A:プロペンCH₃-CH=CH₂ B:2-メチルプロペン(CH₃)₂C=CH₂ C:trans-2-ブテン D:cis-2-ブテン E:2-メチル-2-ブテン F:2,3-ジメチル-2-ブテン G:2-メチルプロパン H:n-ブタン I:2-ブロモ-2-メチルブタン',
    explCn: 'A(n=1)はプロペン。B/C/D(n=2)：C はトランス形、D はシス形（C,D+H₂ で同じ H=n-ブタン）、B は2-メチルプロペン。E(n=3)は2-メチル-2-ブテン、F(n=4)は2,3-ジメチル-2-ブテン。G=2-メチルプロパン（B+H₂）。H=n-ブタン。I：マルコフニコフ則によりメチル基2個側（二次・三級C*）に Br → 2-ブロモ-2-メチルブタン。',
    issues: [],
  },
  {
    code: 'chem-che13-qA6', category: '応用問題', topic: T_ALI, subtopics: S_ALK,
    optMode: 'multi', Q: '実験1：A(C₇H₁₂)は水素添加で直鎖 C₇H₁₆、B はシクロアルカン C₇H₁₄ を生じる。実験2：A のオゾン分解で C₃H₆O(C)・C₃H₄O₂(D)・ホルムアルデヒド。実験3：B のオゾン分解で C₂H₄O(E)・C₅H₈O(F)、F の還元でシクロペンタンに -OH の付いた G。A～G を構造式（または名称・示性式）で答えよ。',
    answerVector: ['CH₂=CH-CH₂-CH₂-CH=CH-CH₃', '1-メチルシクロヘキセン', 'CH₃-CH₂-CHO', 'OHC-CH₂-CHO', 'CH₃-CHO', 'シクロペンタノン', 'シクロペンタノール'], N: 7,
    answerJp: 'A:ヘプタ-1,4-ジエン（CH₂=CH-CH₂-CH₂-CH=CH-CH₃） B:1-メチルシクロヘキセン C:プロパナールCH₃-CH₂-CHO D:プロパンジアールOHC-CH₂-CHO E:アセトアルデヒドCH₃-CHO F:シクロペンタノン G:シクロペンタノール',
    explCn: 'オゾン分解は C=C が切れてカルボニル化。D が -CHO を2個もつ C₃H₄O₂ なので A は2個の C=C をもつジエン。HCHO(C1)+D(C3)+C(C3)=7C より A=ヘプタ-1,4-ジエン。E=アセトアルデヒド、F は還元でシクロペンタノールになるのでシクロペンタノン、B は C₇H₁₂ のシクロアルケンでオゾン分解で CH₃CHO と C₅ 環をもつ→1-メチルシクロヘキセン。',
    issues: [],
  },
  {
    code: 'chem-che13-qA7', category: '応用問題', topic: T_ALI, subtopics: S_ALK,
    optMode: 'multi', Q: 'メタン・エチレン・プロペンの混合気体100mL を濃硫酸に通すと58mL になった。また100mL の完全燃焼に O₂ 278mL 必要。各成分の体積百分率は何%か。',
    answerVector: ['メタン58%', 'エチレン18%', 'プロペン24%'], N: 3,
    answerJp: 'メタン58%、エチレン18%、プロペン24%',
    explCn: 'アルケンは濃硫酸に吸収されるので残り58mL がメタン。エチレンx、プロペンy とすると x+y=42、3x+(9/2)y=278-2×58=162 → x=18、y=24。よってメタン58%、エチレン18%、プロペン24%。',
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
  console.log('che13 drafts:', d.length);
  const s = new Map();
  d.forEach((x) => s.set(x.generationStatus, (s.get(x.generationStatus) || 0) + 1));
  console.log('status:', Object.fromEntries(s));
}