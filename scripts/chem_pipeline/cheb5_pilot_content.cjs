#!/usr/bin/env node
/**
 * cheb5_pilot_content.cjs — cheb5（第5章 酸と塩基）内容定义
 *
 * 源：cheb5_题目.md + cheb5_解析.md（仅此两文件，其余为过程文件）
 * 考纲：ejuSyllabus.ts chem_2_1_2（(2)酸･塩基）
 *  - 酸・塩基の定義と強弱 chem_2_1_2_01
 *  - 水素イオン濃度とpH chem_2_1_2_02
 *  - 中和反応と中和滴定 chem_2_1_2_03（别名含「塩」）
 *
 * 变通（沿用 che2~che17/cheb1 规则）：
 *  - 作図問題（qA9(2) イオン物質量グラフ）→ 「グラフの形状・傾き・終点の数値」を语言描述で槽位化；
 *  - 記述・理由問題（qB7(4) 純水の電気伝導、qA5 正誤の理由、qA11(2) 電気伝導度の理由、qA13(3) 水上置換の不適）→
 *    参考答案要点を整体作槽位；
 *  - 図選択問題（qE4 滴定曲線・qB15 グラフ・qB19 滴定曲線・qA11 電気伝導度）→ 「記号＋特徴説明」を槽値化し，題図との対照を抽检項目に含めた。
 *  - OCR 字形（解析中の「工」「才」「力」「倃」「藥」）按項目规则保留原样，答案槽は正字を使用し issues 标注。
 */
'use strict';

const T_ACID = 'chem_2_1_2';        // (2)酸･塩基
const S_DEF = ['chem_2_1_2_01'];    // 酸・塩基の定義と強弱
const S_PH = ['chem_2_1_2_02'];     // 水素イオン濃度とpH
const S_CHU = ['chem_2_1_2_03'];    // 中和反応と中和滴定

const CONTENT = [
  // ---- 基礎 CHECK ----
  {
    code: 'chem-cheb5-qC1', category: '基礎 CHECK', topic: T_ACID, subtopics: S_DEF,
    optMode: 'simple', Q: 'アレニウスの定義によると，水溶液中でどのようなイオンを生じる物質を酸というか。',
    options: ['水素イオン H⁺（またはオキソニウムイオン H₃O⁺）', '水酸化物イオン OH⁻', 'ナトリウムイオン Na⁺', '塩化物イオン Cl⁻'], correctIndex: 0,
    answerJp: '水素イオン H⁺（またはオキソニウムイオン H₃O⁺）',
    explCn: 'アレニウスの定義：酸とは水溶液中で電離して水素イオン H⁺（実際には水と結合してオキソニウムイオン H₃O⁺）を生じる物質。塩基とは水酸化物イオン OH⁻ を生じる物質。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qC2', category: '基礎 CHECK', topic: T_ACID, subtopics: S_DEF,
    optMode: 'multi', Q: '(a) 強酸 (b) 弱酸 はどれか。（(ア) CH₃COOH (イ) H₂SO₄ (ウ) HCl (エ) H₂S）',
    answerVector: ['イ，ウ（H₂SO₄，HCl）', 'ア，エ（CH₃COOH，H₂S）'], N: 2,
    answerJp: '(a) イ，ウ（H₂SO₄，HCl） (b) ア，エ（CH₃COOH，H₂S）',
    explCn: '強酸：塩酸 HCl・硫酸 H₂SO₄・硝酸 HNO₃ など水溶液中ではぼすべて電離する酸。弱酸：酢酸 CH₃COOH・硫化水素 H₂S・炭酸など電離度の小さい酸。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qC3', category: '基礎 CHECK', topic: T_ACID, subtopics: S_DEF,
    optMode: 'multi', Q: '(a) 強塩基 (b) 弱塩基 はどれか。（(ア) NaOH (イ) Ca(OH)₂ (ウ) NH₃）',
    answerVector: ['ア，イ（NaOH，Ca(OH)₂）', 'ウ（NH₃）'], N: 2,
    answerJp: '(a) ア，イ（NaOH，Ca(OH)₂） (b) ウ（NH₃）',
    explCn: '強塩基：アルカリ金属・アルカリ土類金属の水酸化物（NaOH，Ca(OH)₂ など）。NH₃ は水と反応して一部が OH⁻ を生じるだけの弱塩基。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qC4', category: '基礎 CHECK', topic: T_ACID, subtopics: S_DEF,
    optMode: 'multi', Q: '(1) 酸としてはたらく酸化物を何というか。(2) 塩基としてはたらく酸化物を何というか。',
    answerVector: ['酸性酸化物', '塩基性酸化物'], N: 2,
    answerJp: '(1) 酸性酸化物 (2) 塩基性酸化物',
    explCn: '酸性酸化物：非金属元素の酸化物が多く，水と反応して酸（CO₂→H₂CO₃）を生じる。塩基性酸化物：金属元素の酸化物が多く，水と反応して塩基（CaO→Ca(OH)₂）を生じる。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qC10', category: '基礎 CHECK', topic: T_ACID, subtopics: S_PH,
    optMode: 'simple', Q: '0.10 mol/L の塩酸 50 mL 中に含まれる H⁺ は何 mol か。',
    options: ['5.0×10⁻³ mol', '1.0×10⁻³ mol', '2.5×10⁻² mol', '5.0×10⁻² mol'], correctIndex: 0,
    answerJp: '5.0×10⁻³ mol',
    explCn: 'HCl は 1 価の強酸で完全に電離する。H⁺ の物質量＝1×0.10 mol/L×(50/1000) L＝5.0×10⁻³ mol。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qC5', category: '基礎 CHECK', topic: T_ACID, subtopics: S_CHU,
    optMode: 'simple', Q: '酸と塩基が反応して，塩と水が生じる反応を何というか。',
    options: ['中和反応（中和）', '酸化還元反応', '加水分解', '複分解'], correctIndex: 0,
    answerJp: '中和反応（中和）',
    explCn: '酸の H⁺ と塩基の OH⁻ が結合して H₂O になり，残りの陽イオンと陰イオンが結合して塩を生じる反応を中和という。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qC6', category: '基礎 CHECK', topic: T_ACID, subtopics: S_DEF,
    optMode: 'multi', Q: 'ブレンステッド・ローリーの定義によると，次の反応式中の下線を引いた物質は酸・塩基のどちらとしてはたらいているか。(1) NH₃+HCl→NH₄Cl の HCl (2) CH₃COOH+H₂O→CH₃COO⁻+H₃O⁺ の H₂O (3) Cu(OH)₂+2H⁺→Cu²⁺+2H₂O の Cu(OH)₂ (4) Fe₂O₃+6H⁺→2Fe³⁺+3H₂O の Fe₂O₃',
    answerVector: ['酸', '塩基', '塩基', '塩基'], N: 4,
    answerJp: '(1) 酸 (2) 塩基 (3) 塩基 (4) 塩基',
    explCn: 'ブレンステッド・ローリー定義：H⁺ を他に与える物質が酸，他から受け取る物質が塩基。(1) HCl は NH₃ に H⁺ を与える。(2) H₂O は CH₃COOH から H⁺ を受け取り H₃O⁺ になる。(3)(4) Cu(OH)₂・Fe₂O₃ は H⁺ を受け取って陽イオンになる。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qC7', category: '基礎 CHECK', topic: T_ACID, subtopics: S_CHU,
    optMode: 'simple', Q: '酸に由来する H も塩基に由来する OH も残っていない塩を何というか。',
    options: ['正塩', '酸性塩', '塩基性塩', '複塩'], correctIndex: 0,
    answerJp: '正塩',
    explCn: '正塩：酸の H も塩基の OH も残っていない塩（NaCl，Na₂SO₄，NH₄Cl など）。酸性塩：H が残る塩（NaHCO₃ など）。塩基性塩：OH が残る塩（CaCl(OH) など）。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qC8', category: '基礎 CHECK', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '次の塩について，もとの酸と塩基を化学式で答えよ。(1) NaCl (2) KNO₃ (3) CH₃COONa (4) NH₄Cl',
    answerVector: ['酸：HCl，塩基：NaOH', '酸：HNO₃，塩基：KOH', '酸：CH₃COOH，塩基：NaOH', '酸：HCl，塩基：NH₃'], N: 4,
    answerJp: '(1) HCl，NaOH (2) HNO₃，KOH (3) CH₃COOH，NaOH (4) HCl，NH₃',
    explCn: '塩は酸の陰イオンと塩基の陽イオンからなる。(1) NaCl→HCl+NaOH (2) KNO₃→HNO₃+KOH (3) CH₃COONa→CH₃COOH+NaOH (4) NH₄Cl→HCl+NH₃。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qC11', category: '基礎 CHECK', topic: T_ACID, subtopics: S_CHU,
    optMode: 'simple', Q: '0.10 mol の硫酸 H₂SO₄ を中和するには，水酸化ナトリウム NaOH は何 mol 必要か。',
    options: ['0.20 mol', '0.10 mol', '0.40 mol', '0.050 mol'], correctIndex: 0,
    answerJp: '0.20 mol',
    explCn: 'H₂SO₄ は 2 価の酸，NaOH は 1 価の塩基。0.10 mol×2/1＝0.20 mol。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qC9', category: '基礎 CHECK', topic: T_ACID, subtopics: S_CHU,
    optMode: 'simple', Q: '中和滴定で中和点を知るために用いる試薬を何というか。',
    options: ['pH指示薬', '緩衝液', '標準液', '金属指示薬'], correctIndex: 0,
    answerJp: 'pH指示薬（指示薬）',
    explCn: '中和点では pH が急変するので，メチルオレンジ・フェノールフタレインなどの pH 指示薬の色の変化で中和点を検出する。',
    issues: ['解析原文「pH 指示藥」の「藥」が OCR 字形（应为薬），答案槽は正字（pH指示薬）とし原文は保留'],
  },
  // ---- 基本例題 ----
  {
    code: 'chem-cheb5-qE1', category: '基本例題', topic: T_ACID, subtopics: S_DEF,
    optMode: 'multi', Q: '(1) 次の文の（）に適当な語句を，[ ]に化学式を入れよ。アレニウスの定義：酸＝水溶液中で電離して (a) イオン [b] またはオキソニウムイオン [c] を生じる物質，塩基＝(d) イオン [e] を生じる物質。ブレンステッド・ローリーの定義：(f) とは (g) イオン [h] を他の物質に与える物質，(i) とは (j) イオン [k] を他の物質から受け取る物質。(2) 反応① HCl+NaOH→NaCl+H₂O ② H₂SO₄+2H₂O→2H₃O⁺+SO₄²⁻ で，酸・塩基としてはたらいているものをそれぞれ答えよ。',
    answerVector: [
      '水素', 'H⁺', 'H₃O⁺', '水酸化物', 'OH⁻', '酸', '水素', 'H⁺', '塩基', '水素', 'H⁺',
      '酸：HCl，塩基：NaOH', '酸：H₂SO₄，塩基：H₂O',
    ], N: 13,
    answerJp: '(1)(a)水素 (b)H⁺ (c)H₃O⁺ (d)水酸化物 (e)OH⁻ (f)酸 (g)水素 (h)H⁺ (i)塩基 (j)水素 (k)H⁺ (2)①酸：HCl，塩基：NaOH ②酸：H₂SO₄，塩基：H₂O',
    explCn: 'アレニウスの定義は水溶液中の電離で酸・塩基を定義（狭義）。ブレンステッド・ローリーの定義は H⁺ の授受（与える＝酸，受け取る＝塩基）で定義し，水溶液以外の反応にも適用できる（広義）。②では H₂SO₄ が H₂O に H⁺ を与えるので酸，H₂O は H⁺ を受け取るので塩基。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qE2', category: '基本例題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'simple', Q: '0.050 mol/L の硫酸 10.0 mL を中和するのに，ある濃度の水酸化ナトリウム水溶液 12.5 mL が必要であった。この水酸化ナトリウム水溶液のモル濃度を求めよ。',
    options: ['0.080 mol/L', '0.040 mol/L', '0.16 mol/L', '0.020 mol/L'], correctIndex: 0,
    answerJp: '0.080 mol/L',
    explCn: '中和の関係式（酸の価数×濃度×体積＝塩基の価数×濃度×体積）：2×0.050×(10.0/1000)=1×x×(12.5/1000) より x=0.080 mol/L。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qE3', category: '基本例題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: 'シュウ酸二水和物 (COOH)₂·2H₂O の結晶 0.630 g を水に溶かして (a)100 mL にした。このシュウ酸水溶液 (b)10.0 mL をとり，水酸化ナトリウム水溶液を (c)滴下したところ，中和点までに 20.0 mL 必要だった。(1) 操作 (a)〜(c) に用いる器具の名称を記せ。(2) 指示薬として適当なのはメチルオレンジ・フェノールフタレインのどちらか。(3) 水酸化ナトリウム水溶液のモル濃度を求めよ。',
    answerVector: ['メスフラスコ', 'ホールピペット', 'ビュレット', 'フェノールフタレイン', '0.0500 mol/L'], N: 5,
    answerJp: '(1)(a)メスフラスコ (b)ホールピペット (c)ビュレット (2)フェノールフタレイン (3)0.0500 mol/L',
    explCn: '溶液の調製＝メスフラスコ，一定量の採取＝ホールピペット，滴下＝ビュレット。(COOH)₂·2H₂O＝126 より 0.630g＝0.00500mol，100mL で 0.0500mol/L。弱酸（シュウ酸）と強塩基の滴定はフェノールフタレイン。2×0.0500×(10.0/1000)=1×x×(20.0/1000) より x=0.0500mol/L。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qE4', category: '基本例題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '次の図は 0.1 mol/L の酸の水溶液に 0.1 mol/L の塩基の水溶液を加えていったときの滴定曲線である（chebjl22.png）。(1)〜(4) の酸－塩基の組合せを (ア)〜(エ) より選べ。',
    answerVector: ['(1) ア', '(2) エ', '(3) イ', '(4) ウ'], N: 4,
    answerJp: '(1) ア (2) エ (3) イ (4) ウ',
    explCn: '滴定曲線の概形（滴定前の pH，中和点の pH，垂直部の pH 範囲など）から酸と塩基の組合せを判断する。答案は解析より (1)ア (2)エ (3)イ (4)ウ。',
    issues: ['(1)〜(4) と選択肢 (ア)〜(エ) の対応リストが題図 chebjl22.png 内にあるため，図との対照を抽检で確認'],
  },
  // ---- 基本問題 ----
  {
    code: 'chem-cheb5-qB1', category: '基本問題', topic: T_ACID, subtopics: S_DEF,
    optMode: 'multi', Q: '次の文の（）に適当なイオン名，語句を入れよ。アレニウスの定義によると，酸とは，水溶液中で電離して (a) を生じる物質，塩基とは水溶液中で (b) を生じる物質である。ブレンステッド・ローリーの定義によると，H⁺ を他に与える物質が (c)，H⁺ を他から受け取る物質が (d) である。したがって，HCl+NH₃→NH₄Cl では HCl が (e)，NH₃ が (f) としてはたらいている。',
    answerVector: ['水素イオン（またはオキソニウムイオン）', '水酸化物イオン', '酸', '塩基', '酸', '塩基'], N: 6,
    answerJp: '(a) 水素イオン（またはオキソニウムイオン） (b) 水酸化物イオン (c) 酸 (d) 塩基 (e) 酸 (f) 塩基',
    explCn: 'アレニウスの定義：水溶液中で電離して H⁺（H₃O⁺）を生じる＝酸，OH⁻ を生じる＝塩基。ブレンステッド・ローリーの定義：H⁺ を与える＝酸，H⁺ を受け取る＝塩基。気体どうしの HCl+NH₃→NH₄Cl でも HCl は H⁺ を与えるので酸，NH₃ は H⁺ を受け取るので塩基。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qB2', category: '基本問題', topic: T_ACID, subtopics: S_DEF,
    optMode: 'multi', Q: '次の反応で，酸・塩基としてはたらいているものはそれぞれ何か。(1) HCl+KOH→KCl+H₂O (2) 2NH₃+H₂SO₄→(NH₄)₂SO₄ (3) HCl+H₂O→H₃O⁺+Cl⁻ (4) NH₃+H₂O→NH₄⁺+OH⁻ (5) CH₃COO⁻+H₂O→CH₃COOH+OH⁻',
    answerVector: ['酸：HCl，塩基：KOH', '酸：H₂SO₄，塩基：NH₃', '酸：HCl，塩基：H₂O', '酸：H₂O，塩基：NH₃', '酸：H₂O，塩基：CH₃COO⁻'], N: 5,
    answerJp: '(1) 酸：HCl，塩基：KOH (2) 酸：H₂SO₄，塩基：NH₃ (3) 酸：HCl，塩基：H₂O (4) 酸：H₂O，塩基：NH₃ (5) 酸：H₂O，塩基：CH₃COO⁻',
    explCn: 'ブレンステッド・ローリーの定義では H⁺ の移動方向で酸・塩基を判別する。(3) の H₂O は塩基，(4) の H₂O は酸にはたらく点に注意。(5) は塩の加水分解とよばれる反応で，H₂O が CH₃COO⁻ に H⁺ を与えるので酸。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qB3', category: '基本問題', topic: T_ACID, subtopics: S_DEF,
    optMode: 'multi', Q: '「溶かした酸（または塩基）の物質量」に対する「電離した酸（または塩基）の物質量」の割合を (a) という。塩化水素や水酸化ナトリウムのように，水溶液中でほとんどすべて電離する酸や塩基を (b)・(c) という。また，酢酸やアンモニアのように，ごく一部しか電離しない酸や塩基を (d)・(e) という。酸や塩基の強弱は，それらの価数の大小と関係が (f)。',
    answerVector: ['電離度', '強酸', '強塩基', '弱酸', '弱塩基', 'ない'], N: 6,
    answerJp: '(a) 電離度 (b) 強酸 (c) 強塩基 (d) 弱酸 (e) 弱塩基 (f) ない',
    explCn: '電離度 α＝電離した酸（塩基）の物質量／溶かした酸（塩基）の物質量（0＜α≤1）。α が 1 に近いほど強酸・強塩基，α が小さいほど弱酸・弱塩基。電離度は同じ物質でも濃度や温度により異なり（濃度が小さいほど大きい），価数の大小とは無関係。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qB4', category: '基本問題', topic: T_ACID, subtopics: S_DEF,
    optMode: 'multi', Q: '(1) 次の強酸・強塩基が水中で電離するときの反応を，例（H₂SO₄→2H⁺+SO₄²⁻）のようなイオンを含む化学反応式で書け。(a) HCl (b) NaOH (c) Ca(OH)₂。(2) 次の弱酸・弱塩基が水中で電離するときの反応を書け。(a) H₃PO₄ (b) Mg(OH)₂ (c) NH₃。',
    answerVector: ['HCl → H⁺ + Cl⁻', 'NaOH → Na⁺ + OH⁻', 'Ca(OH)₂ → Ca²⁺ + 2OH⁻', 'H₃PO₄ ⇌ 3H⁺ + PO₄³⁻', 'Mg(OH)₂ ⇌ Mg²⁺ + 2OH⁻', 'NH₃ + H₂O ⇌ NH₄⁺ + OH⁻'], N: 6,
    answerJp: '(1)(a) HCl→H⁺+Cl⁻ (b) NaOH→Na⁺+OH⁻ (c) Ca(OH)₂→Ca²⁺+2OH⁻ (2)(a) H₃PO₄⇌3H⁺+PO₄³⁻ (b) Mg(OH)₂⇌Mg²⁺+2OH⁻ (c) NH₃+H₂O⇌NH₄⁺+OH⁻',
    explCn: '強酸・強塩基の電離は一方的なので → で表す。弱酸・弱塩基は電離して生じたイオンが結びついてもとに戻る反応も同時に起こるため ⇌ で表す。NH₃ は化学式に OH⁻ を含まないが，水と反応して OH⁻ を生じるので塩基。',
    issues: ['解析 (2)(a) 中「PO₄³⁻」の後に OCR の杂符「3-2」が付く（应为 PO₄³⁻），按項目规则保留原样，answerVector 用正式'],
  },
  {
    code: 'chem-cheb5-qB5', category: '基本問題', topic: T_ACID, subtopics: S_PH,
    optMode: 'multi', Q: '(1) 0.10 mol の酢酸を溶かした水溶液（電離度 0.0052）中の酢酸イオン・水素イオンはそれぞれ何 mol か。(2) 1.0 mol のアンモニアを溶かした水溶液（電離度 0.0042）で，電離により何イオンが何 mol ずつ生じるか。(3) 0.0010 mol の硫酸（電離度 1.0）中の水素イオン・硫酸イオンはそれぞれ何 mol か。(4) 0.010 mol/L の酢酸水溶液の [H⁺] が 5.0×10⁻⁴ mol/L のとき，酢酸の電離度はいくらか。',
    answerVector: ['酢酸イオン：5.2×10⁻⁴ mol', '水素イオン：5.2×10⁻⁴ mol', 'アンモニウムイオン：4.2×10⁻³ mol', '水酸化物イオン：4.2×10⁻³ mol', '水素イオン：2.0×10⁻³ mol', '硫酸イオン：1.0×10⁻³ mol', '0.050'], N: 7,
    answerJp: '(1) 酢酸イオン・水素イオン：各 5.2×10⁻⁴ mol (2) アンモニウムイオン・水酸化物イオン：各 4.2×10⁻³ mol (3) 水素イオン：2.0×10⁻³ mol，硫酸イオン：1.0×10⁻³ mol (4) 電離度 0.050',
    explCn: '電離で生じるイオンの物質量＝価数×物質量×電離度。(1) 0.10×0.0052＝5.2×10⁻⁴ mol（1価の酢酸は CH₃COO⁻ と H⁺ が同量）。(2) 1.0×0.0042＝4.2×10⁻³ mol。(3) H₂SO₄ は 2 価：H⁺＝2×0.0010＝2.0×10⁻³ mol，SO₄²⁻＝1.0×10⁻³ mol。(4) α＝[H⁺]/c＝5.0×10⁻⁴/0.010＝0.050。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qB6', category: '基本問題', topic: T_ACID, subtopics: S_DEF,
    optMode: 'multi', Q: '(1) (ア)CO₂ (イ)CaO (ウ)Na₂O (エ)SO₂ (オ)Fe₂O₃ を (a) 酸性酸化物 (b) 塩基性酸化物 に分けよ。(2) (1) のうち (a) 塩酸 (b) 水酸化ナトリウム水溶液 と反応するものをそれぞれ選び，化学反応式とともに答えよ。(3) 酸とも強塩基とも反応する酸化物を何というか。',
    answerVector: ['ア，エ（CO₂，SO₂）', 'イ，ウ，オ（CaO，Na₂O，Fe₂O₃）', 'イ，ウ，オ；CaO+2HCl→CaCl₂+H₂O，Na₂O+2HCl→2NaCl+H₂O，Fe₂O₃+6HCl→2FeCl₃+3H₂O', 'ア，エ；CO₂+2NaOH→Na₂CO₃+H₂O，SO₂+2NaOH→Na₂SO₃+H₂O', '両性酸化物'], N: 5,
    answerJp: '(1)(a) ア，エ（CO₂，SO₂） (b) イ，ウ，オ（CaO，Na₂O，Fe₂O₃） (2)(a) イ,ウ,オ（塩基性酸化物）＋反応式 (b) ア,エ（酸性酸化物）＋反応式 (3) 両性酸化物',
    explCn: '酸性酸化物：おもに非金属元素の酸化物で，水と反応して酸，塩基と反応して水を生じる。塩基性酸化物：おもに金属元素の酸化物で，酸と反応して水を生じる。両性酸化物（Al₂O₃，ZnO，SnO₂，PbO など）は酸とも強塩基とも反応する。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qB7', category: '基本問題', topic: T_ACID, subtopics: S_PH,
    optMode: 'multi', Q: '(1) 純水ではわずかに電離し，25℃で [H⁺]=[OH⁻]=(a) mol/L。 [H⁺]=1.0×10⁻ⁿ mol/L のとき pH=(b) なので，純水の pH は (c)。(2) 酸の水溶液では pH (d) (c) であり，0.10 mol/L の塩酸の pH は (e)。塩基の水溶液では pH (f) (c)。(3) K_w=[H⁺][OH⁻]=1.0×10⁻¹⁴ mol²/L²（25℃）を (g) という。0.010 mol/L の水酸化ナトリウム水溶液では [OH⁻]=(h) mol/L，[H⁺]=(i) mol/L，pH=(j)。(4) 電解質の水溶液は電気を通すが，純水は電気をほとんど通さない。その理由を説明せよ。',
    answerVector: ['1.0×10⁻⁷', 'n', '7', '<', '1', '>', '水のイオン積', '1.0×10⁻²', '1.0×10⁻¹²', '12', '電解質の水溶液には多くのイオンが存在するが，純水にはイオンがわずかしか存在しないから。'], N: 11,
    answerJp: '(1)(a)1.0×10⁻⁷ (b)n (c)7 (2)(d)< (e)1 (f)> (3)(g)水のイオン積 (h)1.0×10⁻² (i)1.0×10⁻¹² (j)12 (4) 電解質の水溶液には多くのイオンが存在するが，純水にはイオンがわずかしか存在しないから。',
    explCn: '酸性：pH<7，中性：pH=7，塩基性：pH>7。NaOH は完全に電離し [OH⁻]=0.010 mol/L＝1.0×10⁻² mol/L。K_w より [H⁺]=1.0×10⁻¹⁴/1.0×10⁻²＝1.0×10⁻¹² mol/L，pH=12。溶液が電気を通すにはイオンが必要で，純水は水の電離によるわずかな H⁺，OH⁻ しかないためほとんど通さない。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qB8', category: '基本問題', topic: T_ACID, subtopics: S_PH,
    optMode: 'multi', Q: '水とすべての水溶液の密度を 1.0 g/cm³ として答えよ。(1) pH=2 の希塩酸の [H⁺] は pH=5 の希塩酸の何倍か。(2) pH=1，pH=6 の希塩酸を水で 100 倍に薄めた溶液の pH はそれぞれいくらか。(3) pH=1 の希塩酸 1.0 L を水で薄めて pH=3 の希塩酸とするとき，必要な水は何 L か。(4) 0.040 mol/L の酢酸水溶液の pH は 3 である。このときの酢酸の電離度はいくらか。(5) pH=13 の水酸化ナトリウム水溶液を水で 100 倍に薄めた溶液の pH はいくらか。(6) 2.0×10⁻² mol/L の硫酸（電離度 1.0）の [OH⁻] は何 mol/L か。',
    answerVector: ['1000 倍', 'pH=1 の溶液：3', 'pH=6 の溶液：7', '99 L', '0.025', '11', '2.5×10⁻¹³ mol/L'], N: 7,
    answerJp: '(1) 1000 倍 (2) pH=1 の溶液→3，pH=6 の溶液→7 (3) 99 L (4) 0.025 (5) 11 (6) 2.5×10⁻¹³ mol/L',
    explCn: '(1) [H⁺]=10⁻ᵖᴴ より 10⁻²/10⁻⁵＝10³ 倍。(2) pH=1 は [H⁺]=10⁻¹，100 倍希釈で 10⁻³→pH=3。pH=6 は 10⁻⁶→100 倍で 10⁻⁸ に見えるが酸性が塩基性になることはなく pH=7 に近づくだけ（水の電離が無視できない）。(3) 100 倍希釈で 1.0 L→100 L，必要な水は 99 L。(4) α＝[H⁺]/c＝10⁻³/0.040＝0.025。(5) pH=13 は [OH⁻]=10⁻¹，100 倍で 10⁻³→[H⁺]=10⁻¹¹，pH=11。(6) [H⁺]=2×2.0×10⁻²＝4.0×10⁻²，[OH⁻]=10⁻¹⁴/4.0×10⁻²＝2.5×10⁻¹³ mol/L。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qB9', category: '基本問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '次の酸と塩基が中和するときの化学反応式を書け。(1) 硫酸と水酸化カリウム (2) 塩化水素と水酸化カルシウム (3) 塩化水素とアンモニア (4) 酢酸と水酸化ナトリウム',
    answerVector: ['H₂SO₄ + 2KOH → K₂SO₄ + 2H₂O', '2HCl + Ca(OH)₂ → CaCl₂ + 2H₂O', 'HCl + NH₃ → NH₄Cl', 'CH₃COOH + NaOH → CH₃COONa + H₂O'], N: 4,
    answerJp: '(1) H₂SO₄+2KOH→K₂SO₄+2H₂O (2) 2HCl+Ca(OH)₂→CaCl₂+2H₂O (3) HCl+NH₃→NH₄Cl (4) CH₃COOH+NaOH→CH₃COONa+H₂O',
    explCn: '酸から生じる H⁺ と塩基から生じる OH⁻ が過不足なく結合して H₂O，残りの陽イオンと陰イオンが塩を生じる。(3) は塩基 NH₃ が H⁺ と結合して NH₄⁺ になる（H₂O は生成しない）。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qB10', category: '基本問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '(ア)NaHCO₃ (イ)Na₂SO₄ (ウ)NaHSO₄ (エ)K₂SO₄ (オ)CaCl(OH) (カ)NH₄Cl について，(1) (a) 正塩 (b) 酸性塩 (c) 塩基性塩 に分類せよ。(2) (ア)～(カ) の塩の水溶液の性質を (a) 酸性 (b) 塩基性 (c) 中性 に分類せよ。',
    answerVector: ['イ，エ（Na₂SO₄，K₂SO₄）', 'ア，ウ（NaHCO₃，NaHSO₄）', 'オ（CaCl(OH)）', 'ウ，カ（NaHSO₄，NH₄Cl）', 'ア，オ（NaHCO₃，CaCl(OH)）', 'イ，エ（Na₂SO₄，K₂SO₄）'], N: 6,
    answerJp: '(1)(a) イ，エ（Na₂SO₄，K₂SO₄） (b) ア，ウ（NaHCO₃，NaHSO₄） (c) オ（CaCl(OH)） (2)(a) ウ，カ（NaHSO₄，NH₄Cl） (b) ア，オ（NaHCO₃，CaCl(OH)） (c) イ，エ（Na₂SO₄，K₂SO₄）',
    explCn: '(1) 正塩＝H も OH も残らない塩，酸性塩＝酸由来の H が残る塩（NaHCO₃，NaHSO₄），塩基性塩＝塩基由来の OH が残る塩（CaCl(OH)）。(2) 強酸と強塩基の正塩は中性，強酸と弱塩基の正塩（NH₄Cl）と強酸・強塩基の酸性塩（NaHSO₄）は酸性，弱酸と強塩基の酸性塩（NaHCO₃）と強酸・強塩基の塩基性塩（CaCl(OH)）は塩基性。',
    issues: ['解析中で K₂SO₄ の選択肢記号が「工」（应为エ），CaCl(OH) が「才」（应为オ）のOCR字形，按項目规则保留原样，answerVector 用正字'],
  },
  {
    code: 'chem-cheb5-qB11', category: '基本問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '(1) 同じ濃度の酢酸水溶液と水酸化ナトリウム水溶液を同量混合すると，pH は 7 より (a) 値となり，水溶液は (b) 性を示す。これは，水溶液中の (c) は水と反応しないが，(d) の一部が水と反応し，(e) が生じるためである。このような反応を塩の (f) という。(f) により，強酸と弱塩基からなる塩の水溶液は (g) 性，弱酸と強塩基からなる塩の水溶液は (h) 性，強酸と強塩基からなる塩の正塩の水溶液は (i) 性を示す。(2) (1) の下線部の反応をイオンを含む化学反応式で示せ。',
    answerVector: ['大きな', '塩基', 'ナトリウムイオン', '酢酸イオン', '水酸化物イオン', '加水分解', '酸', '塩基', '中', 'CH₃COO⁻ + H₂O → CH₃COOH + OH⁻'], N: 10,
    answerJp: '(1)(a)大きな (b)塩基 (c)ナトリウムイオン (d)酢酸イオン (e)水酸化物イオン (f)加水分解 (g)酸 (h)塩基 (i)中 (2) CH₃COO⁻+H₂O→CH₃COOH+OH⁻',
    explCn: '酢酸ナトリウムは強塩基（NaOH）と弱酸（CH₃COOH）からなる塩で，CH₃COO⁻ の一部が水と反応して CH₃COOH と OH⁻ を生じるため水溶液は塩基性（pH>7）。この反応を塩の加水分解という。弱酸由来の陰イオンや弱塩基由来の陽イオンを含む正塩は中性にならない。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qB12', category: '基本問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '一般に，弱酸の塩に強酸を加えると，(a) 酸が遊離し (b) 酸の塩が生じる。これは，(a) 酸に由来する陰イオンが (b) 酸から生じる (c) と反応するためである。また，弱塩基の塩に強塩基を加えると，(d) 塩基が遊離し (e) 塩基の塩が生じる。これは，(d) 塩基に由来する陽イオンが (e) 塩基から生じる (f) と反応するためである。酢酸ナトリウムに塩酸を加えると (g) が生じ，塩化アンモニウムに水酸化ナトリウム水溶液を加えると (h) が生じる反応はその例である。',
    answerVector: ['弱', '強', '水素イオン', '弱', '強', '水酸化物イオン', '酢酸', 'アンモニア'], N: 8,
    answerJp: '(a)弱 (b)強 (c)水素イオン (d)弱 (e)強 (f)水酸化物イオン (g)酢酸 (h)アンモニア',
    explCn: '弱酸の塩＋強酸 → 弱酸＋強酸の塩（例：CH₃COONa+HCl→CH₃COOH+NaCl）。弱塩基の塩＋強塩基 → 弱塩基＋強塩基の塩（例：NH₄Cl+NaOH→NH₃+H₂O+NaCl）。遊離した弱酸・弱塩基は分子として存在する。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qB13', category: '基本問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '(1) 0.25 mol/L の硫酸 20 mL を中和するのに必要な 0.20 mol/L の水酸化ナトリウム水溶液は何 mL か。(2) ある濃度の塩酸 10 mL は，0.10 mol/L の水酸化ナトリウム水溶液 12 mL とちょうど中和した。この塩酸の濃度は何 mol/L か。',
    answerVector: ['50 mL', '0.12 mol/L'], N: 2,
    answerJp: '(1) 50 mL (2) 0.12 mol/L',
    explCn: '中和の関係式 acV=bc′V′。(1) 2×0.25×(20/1000)=1×0.20×x → x=0.050 L=50 mL。(2) 1×x×(10/1000)=1×0.10×(12/1000) → x=0.12 mol/L。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qB14', category: '基本問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '(1) 水酸化カルシウム 3.7 g（式量 74）を水 50 mL に加えたのち，2.0 mol/L の塩酸で中和するには塩酸何 mL が必要か。(2) 標準状態で 1.12 L のアンモニアを水に溶かして 100 mL とした。このアンモニア水 10 mL を中和するには，0.10 mol/L の塩酸が何 mL 必要か。',
    answerVector: ['50 mL', '50 mL'], N: 2,
    answerJp: '(1) 50 mL (2) 50 mL',
    explCn: '中和では酸の価数×物質量＝塩基の価数×物質量。(1) 1×2.0×(x/1000)=2×(3.7/74) → x=0.050 L=50 mL（溶かす水の量には無関係）。(2) NH₃ は 1.12/22.4=0.0500 mol。10.0 mL 分は 0.00500 mol。1×0.10×y=1×0.00500 → y=0.050 L=50 mL。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qB15', category: '基本問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: 'コニカルビーカーに 0.10 mol/L の酢酸水溶液 100 mL を入れ，0.10 mol/L の水酸化ナトリウム水溶液を滴下した。水溶液中の酢酸イオン CH₃COO⁻ と水酸化物イオン OH⁻ の変化を表すグラフを (ア)～(オ) からそれぞれ選べ（題図 cheb5-118.png）。',
    answerVector: ['ウ（中和点まで増加し，以降一定）', 'エ（中和点まではぼ 0，以降増加）'], N: 2,
    answerJp: '酢酸イオン：ウ（中和点まで増加し，以降一定） 水酸化物イオン：エ（中和点まではぼ 0，以降増加）',
    explCn: '酢酸は 1 価の弱酸，NaOH は 1 価の強塩基で同濃度なので中和点は 100 mL 滴下時。酢酸イオンは中和が進むにつれてでき，中和点で全酢酸量 0.010 mol になり以降は一定＝(ウ)。水酸化物イオンは中和点まで中和で消費されてほぼ 0，中和点以降は過剰の NaOH により増加＝(エ)。',
    issues: ['グラフ選択問題（題图 cheb5-118.png）。槽値以「記号＋増減の説明」表述，図との対照を抽检で確認'],
  },
  {
    code: 'chem-cheb5-qB16', category: '基本問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: 'シュウ酸二水和物 (COOH)₂·2H₂O（式量 126）の結晶 1.89 g を水に溶かして (a) 250 mL の溶液にした。このシュウ酸水溶液 (b) 10.0 mL をとり，水酸化ナトリウム水溶液を (c) 滴下したところ，中和までに 12.5 mL 必要だった。(1) シュウ酸水溶液の濃度は何 mol/L か。(2) 操作 (a)～(c) に用いる器具の名称を記せ。(3) 操作 (c) で用いる器具の目盛りの読み方として正しいものを (ア)～(ウ) から選べ。(4) シュウ酸と水酸化ナトリウムの中和反応の化学反応式を記せ。(5) 水酸化ナトリウム水溶液の濃度は何 mol/L か。',
    answerVector: ['0.0600 mol/L', 'メスフラスコ', 'ホールピペット', 'ビュレット', 'イ', '(COOH)₂ + 2NaOH → (COONa)₂ + 2H₂O', '0.0960 mol/L'], N: 7,
    answerJp: '(1) 0.0600 mol/L (2)(a)メスフラスコ (b)ホールピペット (c)ビュレット (3) イ (4) (COOH)₂+2NaOH→(COONa)₂+2H₂O (5) 0.0960 mol/L',
    explCn: '(1) 1.89/126=0.0150 mol，0.0150/0.250=0.0600 mol/L。(2) 一定濃度の溶液の調製＝メスフラスコ，一定体積の採取＝ホールピペット，滴下量の測定＝ビュレット。(3) ビュレットは液面の最下部の目盛りを読む（水銀は逆に最上部）。(5) 2×0.0600×(10.0/1000)=1×x×(12.5/1000) → x=0.0960 mol/L。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qB17', category: '基本問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '食酢を水で正確に 5 倍に薄めた溶液（A 液）10.0 mL をとり，0.120 mol/L の水酸化ナトリウム水溶液で中和滴定したところ 12.5 mL 必要だった。食酢の密度は 1.02 g/cm³ で，食酢中の酸は酢酸のみとする。(1) A 液の酢酸の濃度は何 mol/L か。(2) 食酢中の酢酸の質量パーセント濃度は何%か。',
    answerVector: ['0.150 mol/L', '4.4%'], N: 2,
    answerJp: '(1) 0.150 mol/L (2) 4.4%',
    explCn: '(1) 1×x×(10.0/1000)=1×0.120×(12.5/1000) → x=0.150 mol/L。(2) 食酢は A 液の 5 倍で 0.750 mol/L。食酢 1 L（1020 g）中に酢酸 60×0.750=45 g。質量パーセント濃度＝45/1020×100＝4.4%。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qB20', category: '基本問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'simple', Q: '水酸化ナトリウムに少量の塩化ナトリウムが混ざった固体 5.0 g を水に溶かして 200 mL にした。このうち 10.0 mL を 0.50 mol/L の塩酸で中和するために 12.0 mL が必要であった。この水酸化ナトリウムの純度は何%か。',
    options: ['96%', '48%', '9.6%', '4.8%'], correctIndex: 0,
    answerJp: '96%',
    explCn: '中和の関係式より 1×0.50×(12.0/1000)=1×x×(10.0/1000) → x=0.60 mol/L。10.0 mL 中の NaOH は 40×0.60×(10.0/1000)=0.24 g。200 mL 全体では 0.24×20＝4.8 g。純度＝4.8/5.0×100＝96%。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qB18', category: '基本問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '(1) 酢酸水溶液 A の濃度を知るため，その 10.0 mL を器具 (a) を用いてとり，器具 (b) に入れ，器具 (c) に入れた水酸化ナトリウム水溶液 B を滴下して中和滴定をしたい。器具 (a)～(c) を (ア)～(カ) から選び，器具の名称も答えよ（題図 cheb-122.png）。(2) 器具 (a)～(c) が水でぬれている場合の使用法を (ア)～(カ) から選べ。',
    answerVector: ['ウ（ホールピペット）', 'エ（コニカルビーカー）', 'オ（ビュレット）', 'イ', 'カ', 'エ'], N: 6,
    answerJp: '(1)(a) ウ，ホールピペット (b) エ，コニカルビーカー (c) オ，ビュレット (2)(a) イ (b) カ (c) エ',
    explCn: '(1) (ア)メスシリンダー (イ)こまごめピペット (ウ)ホールピペット (エ)コニカルビーカー (オ)ビュレット (カ)メスフラスコ。(2) ホールピペット・ビュレットは入れる溶液（A または B）で共洗いしてから用い，メスフラスコ・コニカルビーカーは純水でぬれたまま用いてよい。',
    issues: ['器具の図（cheb-122.png）中の (ア)～(カ) 記号との対応を抽检で確認'],
  },
  {
    code: 'chem-cheb5-qB19', category: '基本問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '図 (A)～(E) は，0.1 mol/L の酸の水溶液に 0.1 mol/L の塩基の水溶液を加えていったときの滴定曲線である（題図 cheb5-123.png）。該当する酸と塩基の組合せを [I] 欄から，指示薬の用い方として正しいものを [II] 欄からそれぞれ選べ。[I] (ア)HCl–NH₃ (イ)HCl–NaOH (ウ)CH₃COOH–NH₃ (エ)H₂C₂O₄–NaOH (オ)HCl–Ba(OH)₂ (カ)CH₃COOH–NaOH [II] (a)メチルオレンジ (b)フェノールフタレイン (c)どちらでもよい (d)どちらも使えない',
    answerVector: ['ア（HCl–NH₃）', 'ウ（CH₃COOH–NH₃）', 'カ（CH₃COOH–NaOH）', 'イ（HCl–NaOH）', 'オ（HCl–Ba(OH)₂）', 'a（メチルオレンジ）', 'd（どちらも使えない）', 'b（フェノールフタレイン）', 'c（どちらでもよい）', 'c（どちらでもよい）'], N: 10,
    answerJp: '[I] (A)ア (B)ウ (C)カ (D)イ (E)オ（解析の「才」=オ） [II] (A)a (B)d (C)b (D)c (E)c',
    explCn: '[I] 滴定前の pH・中和点の pH・中和に必要な塩基の量から判断する。強酸・弱酸・強塩基・弱塩基の組合せで曲線の形が決まり，(A)HCl–NH₃ (B)CH₃COOH–NH₃ (C)CH₃COOH–NaOH (D)HCl–NaOH (E)HCl–Ba(OH)₂（塩基は現れる曲線 2 mol 分の誤差に注意）。[II] 弱酸–強塩基はフェノールフタレイン，強酸–弱塩基はメチルオレンジ，強酸–強塩基はどちらも可，弱酸–弱塩基はどちらも不可。',
    issues: ['解析 [I] (E) の選択肢記号「才」（应为オ）为OCR字形，按項目规则保留原样；題图 cheb5-123.png との対応を抽检で確認'],
  },
  // ---- 応用例題 ----
  {
    code: 'chem-cheb5-qA1', category: '応用例題', topic: T_ACID, subtopics: S_PH,
    optMode: 'simple', Q: '0.125 mol/L の硫酸 100 mL と 0.150 mol/L の水酸化ナトリウム水溶液 150 mL を混ぜあわせた溶液の pH を求めよ。混合の前後で水溶液の体積の総和は変わらないものとする。（題図 chebyl23.png）',
    options: ['2', '1', '3', '4'], correctIndex: 0,
    answerJp: 'pH=2',
    explCn: 'H₂SO₄ から生じる H⁺＝2×0.125×(100/1000)＝2.50×10⁻² mol。NaOH から生じる OH⁻＝0.150×(150/1000)＝2.25×10⁻² mol。残る H⁺＝2.50×10⁻³ mol，体積 0.250 L なので [H⁺]＝1.0×10⁻² mol/L，pH=2。',
    issues: ['題图 chebyl23.png（混合後 pH 求値の図）を参照'],
  },
  {
    code: 'chem-cheb5-qA2', category: '応用例題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'simple', Q: 'ある濃度のアンモニア水 100 mL に 0.50 mol/L の硫酸 100 mL を加えたところ，溶液は酸性になった。この過剰の硫酸を 1.0 mol/L の水酸化ナトリウム水溶液で中和するのに 50 mL が必要であった。最初のアンモニア水の濃度は何 mol/L か。（逆滴定）',
    options: ['0.50 mol/L', '1.0 mol/L', '0.25 mol/L', '0.75 mol/L'], correctIndex: 0,
    answerJp: '0.50 mol/L',
    explCn: '硫酸全体の H⁺＝2×0.50×(100/1000)＝0.100 mol。NaOH で中和された分＝1.0×(50/1000)＝0.050 mol。NH₃ で中和された分＝0.100−0.050＝0.050 mol。アンモニア水の濃度＝0.050/0.100＝0.50 mol/L。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qA3', category: '応用例題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '水酸化ナトリウムと炭酸ナトリウムを含む水溶液がある。この水溶液をフェノールフタレインを指示薬として 0.10 mol/L の塩酸で滴定したところ，20.0 mL で変色した。続いてメチルオレンジを指示薬として加え同じ塩酸で滴定したところ，5.0 mL で変色した。最初の水溶液中の水酸化ナトリウムと炭酸ナトリウムの物質量を求めよ。',
    answerVector: ['水酸化ナトリウム：1.5×10⁻³ mol', '炭酸ナトリウム：5.0×10⁻⁴ mol'], N: 2,
    answerJp: '水酸化ナトリウム：1.5×10⁻³ mol，炭酸ナトリウム：5.0×10⁻⁴ mol',
    explCn: 'フェノールフタレインの変色までに HCl 20.0 mL：NaOH の中和（x mol）＋Na₂CO₃→NaHCO₃（y mol）に 1:1 で反応。メチルオレンジ追加分 5.0 mL は NaHCO₃→NaCl で y mol と等しい。0.10×5.0/1000＝5.0×10⁻⁴ mol＝y。x＝0.10×20.0/1000−y＝2.0×10⁻³−5.0×10⁻⁴＝1.5×10⁻³ mol。',
    issues: [],
  },
  // ---- 応用問題 ----
  {
    code: 'chem-cheb5-qA4', category: '応用問題', topic: T_ACID, subtopics: S_DEF,
    optMode: 'native', Q: '次の記述のうち誤りを含むものを 1 つ選べ。(ア) 非金属元素の酸化物には，酸性酸化物が多い。(イ) ブレンステッド・ローリーの定義によれば，アンモニウムイオンは水と反応するときに酸としてはたらく。(ウ) 弱酸である酢酸の電離度は，その濃度が薄くなるほど大きくなる。(エ) 強酸と強塩基からなる塩は，水溶液中で水と反応する。(オ) CO₃²⁻ は HCO₃⁻ より塩基性が強い。',
    options: ['(ア)', '(イ)', '(ウ)', '(エ)', '(オ)'], correctIndex: 3,
    answerJp: 'エ',
    explCn: '(エ) 誤り：強酸と強塩基からなる塩は水溶液中で水と反応（加水分解）しない。電離するだけである。(ア) 正：金属元素の酸化物には塩基性酸化物が多い。(イ) 正：NH₄⁺+H₂O→NH₃+H₃O⁺ で NH₄⁺ は H⁺ を与えるので酸。(ウ) 正：弱酸の電離度は濃度が薄いほど大きい。(オ) 正：2 価の弱酸 H₂CO₃ の第二電離は第一電離より電離度が小さく，CO₃²⁻ の方が H⁺ を奪いやすい。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qA5', category: '応用問題', topic: T_ACID, subtopics: S_PH,
    optMode: 'multi', Q: '次の記述の正誤を示せ。また，誤りの場合はその理由を説明せよ。(1) 水の電離度は 1×10⁻⁷ で，pH は 7 である。(2) pH=3 の塩酸を純水で 10 万倍に薄めると，pH は 8 になる。(3) pH=1 の塩酸と pH=3 の塩酸を同体積混合して得られる塩酸の pH は 2 である。',
    answerVector: ['誤り。水の電離度は 1×10⁻⁷ ではないから（電離度は約 1.8×10⁻⁹）。', '誤り。酸の水溶液の pH は 7 を超えないから（薄めても pH=7 に近づくだけ）。', '誤り。混合液の pH は混合前の pH の平均になるわけではないから（pH は 1 と 2 の間になる）。'], N: 3,
    answerJp: '(1) 誤り：水の電離度は 1×10⁻⁷ ではない（＝約 1.8×10⁻⁹） (2) 誤り：酸の水溶液の pH は 7 を超えない (3) 誤り：混合液の pH は混合前の pH の平均になるわけではない',
    explCn: '(1) 純水では [H⁺]=1.0×10⁻⁷ mol/L で，これは電離した H⁺ のモル濃度であって電離度ではない。電離度＝1.0×10⁻⁷/(1000/18)＝1.8×10⁻⁹。(2) 10 万倍希釈で [H⁺]=1.0×10⁻⁸ mol/L に見えるが，水自身の電離による H⁺ を無視できない。酸の水溶液を薄めても塩基性にはならず pH=7 に近づくだけ。(3) [H⁺] は 10⁻¹ と 10⁻³ の平均ではなく (10⁻¹+10⁻³)/2＝5.05×10⁻² mol/L となり pH は 1 と 2 の間。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qA6', category: '応用問題', topic: T_ACID, subtopics: S_PH,
    optMode: 'native', Q: '濃度 1.0×10⁻³ mol/L の酢酸水溶液中の酢酸の電離度は 0.15 である。この酢酸水溶液の pH として適当なものを次から選べ。(ア) 1.8 (イ) 2.8 (ウ) 3.8 (エ) 4.8 (オ) 5.8 (カ) 6.8',
    options: ['(ア) 1.8', '(イ) 2.8', '(ウ) 3.8', '(エ) 4.8', '(オ) 5.8', '(カ) 6.8'], correctIndex: 2,
    answerJp: 'ウ（pH=3.8）',
    explCn: '[H⁺]=acα＝1×1.0×10⁻³×0.15＝1.5×10⁻⁴ mol/L。pH=−log₁₀(1.5×10⁻⁴)＝−(log₁₀1.5−4)＝4−0.18＝3.82≒3.8。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qA7', category: '応用問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: 'x mol/L の塩酸 50.0 mL を中和するのに y mol/L の水酸化ナトリウム水溶液 37.5 mL を要した。また，x mol/L の塩酸 1.00 L に，y mol/L の水酸化ナトリウム水溶液 0.500 L を加えた混合溶液から塩化ナトリウムが 11.7 g 得られた。塩酸と水酸化ナトリウム水溶液のモル濃度をそれぞれ求めよ。',
    answerVector: ['塩酸：0.300 mol/L', '水酸化ナトリウム：0.400 mol/L'], N: 2,
    answerJp: '塩酸：0.300 mol/L，水酸化ナトリウム水溶液：0.400 mol/L',
    explCn: '塩酸 1.00 L の中和に必要な NaOH 水溶液は 37.5×(1000/50.0)＝0.750 L。加えたのは 0.500 L なので塩酸が過剰で，NaCl 11.7 g＝0.200 mol は NaOH 全量と等量。y＝0.200/0.500＝0.400 mol/L。x×(50.0/1000)＝0.400×(37.5/1000) → x=0.300 mol/L。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qA8', category: '応用問題', topic: T_ACID, subtopics: S_PH,
    optMode: 'multi', Q: '混合溶液の体積が混合前の溶液の体積の和に等しいものとして答えよ。(1) 0.30 mol/L の塩酸 1.0 L と 0.10 mol/L の水酸化ナトリウム水溶液 1.0 L の混合溶液の水素イオン濃度を求めよ。(2) 濃度未知の水酸化ナトリウム水溶液 20 mL と 0.050 mol/L の硫酸 100 mL の混合溶液の pH は 2.0 であった。この水酸化ナトリウム水溶液の濃度は何 mol/L か。(3) 0.20 mol/L の水酸化ナトリウム水溶液 500 mL に塩化水素 0.050 mol を吸収させた水溶液の水素イオン濃度を求めよ。',
    answerVector: ['0.10 mol/L', '0.44 mol/L', '1.0×10⁻¹³ mol/L'], N: 3,
    answerJp: '(1) 0.10 mol/L (2) 0.44 mol/L (3) 1.0×10⁻¹³ mol/L',
    explCn: '(1) H⁺＝0.30×1.0＝0.30 mol，OH⁻＝0.10×1.0＝0.10 mol，残り H⁺＝0.20 mol，[H⁺]=0.20/2.0＝0.10 mol/L。(2) 硫酸の H⁺＝2×0.050×(100/1000)＝1.0×10⁻² mol。pH=2 より過剰 H⁺＝0.010 mol/L。1.0×10⁻²−x×(20/1000)＝0.120×0.010 → x=0.44 mol/L。(3) OH⁻＝0.20×(500/1000)＝0.10 mol，H⁺＝0.050 mol，残り OH⁻＝0.050 mol，[OH⁻]=0.10 mol/L → [H⁺]=1.0×10⁻¹⁴/0.10＝1.0×10⁻¹³ mol/L。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qA19', category: '応用問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'simple', Q: '10.0% の水酸化ナトリウム水溶液を 36.5% の塩酸でちょうど中和したとき，得られる塩化ナトリウム水溶液の質量パーセント濃度は何%か。（NaOH+HCl→NaCl+H₂O）',
    options: ['11.7%', '5.85%', '23.4%', '17.6%'], correctIndex: 0,
    answerJp: '11.7%',
    explCn: 'NaOH 水溶液 a g，HCl 水溶液 b g とすると，NaOH：0.0025a mol，HCl：0.0100b mol。ちょうど中和より 0.0025a＝0.0100b → a=4b。生じる NaCl は 0.0100b mol＝0.585b g。質量パーセント濃度＝0.585b/(4b+b)×100＝11.7%。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qA9', category: '応用問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '(1) ある酢酸水溶液 10.0 mL に 0.100 mol/L 水酸化ナトリウム水溶液を滴下したところ，15.0 mL で中和点に達した。この酢酸のモル濃度を求めよ。(2) (1) の滴定終了後，さらに水酸化ナトリウム水溶液を 15.0 mL 滴下した。滴下を開始してから合計 30.0 mL 滴下する間に，① Na⁺ ② CH₃COO⁻ ③ OH⁻ の物質量はどのように変化するか。横軸に滴下量 [mL]，縦軸にイオンの物質量をとってグラフで表せ。',
    answerVector: ['0.150 mol/L', 'Na⁺：滴下量に比例して増加し，30.0 mL で 3.00×10⁻³ mol（原点を通る右上がりの直線）', 'CH₃COO⁻：中和点（15.0 mL）まで増加し，以降 1.50×10⁻³ mol のまま一定', 'OH⁻：中和点まで 0 mol，以降滴下量に比例して増加し，30.0 mL で 1.50×10⁻³ mol'], N: 4,
    answerJp: '(1) 0.150 mol/L (2) ① Na⁺：滴下量に比例して増加（30.0 mL で 3.00×10⁻³ mol） ② CH₃COO⁻：中和点まで増加し以降一定（1.50×10⁻³ mol） ③ OH⁻：中和点まで 0，以降増加（30.0 mL で 1.50×10⁻³ mol）',
    explCn: '(1) 1×x×(10.0/1000)=1×0.100×(15.0/1000) → x=0.150 mol/L。(2) ① Na⁺ は反応せず滴下量に比例：0.100×(30.0/1000)=3.00×10⁻³ mol。② CH₃COO⁻ は中和点まで増え，中和点で酢酸全量と同量 0.150×(10.0/1000)=1.50×10⁻³ mol になり以降一定。③ OH⁻ は中和点まで 0，以降 0.100×(30.0−15.0)/1000=1.50×10⁻³ mol まで増加。',
    issues: ['(2) 作図問題（解析は 3 枚の图）→ グラフの形状・起点・終点の数値を语言描述で槽位化'],
  },
  {
    code: 'chem-cheb5-qA10', category: '応用問題', topic: T_ACID, subtopics: S_PH,
    optMode: 'simple', Q: '次の (a)～(c) の水溶液を pH の小さい順に並べよ。(a) 0.01 mol/L の酢酸水溶液（電離度 0.04） (b) pH=2 の塩酸を水で 10 倍に薄めた水溶液 (c) 0.01 mol/L の塩酸 10 mL と 0.005 mol/L の水酸化ナトリウム水溶液 10 mL の混合溶液',
    options: ['(c) < (b) < (a)', '(a) < (b) < (c)', '(b) < (c) < (a)', '(c) < (a) < (b)'], correctIndex: 0,
    answerJp: '(c) < (b) < (a)',
    explCn: '(a) [H⁺]=1×0.01×0.04＝4×10⁻⁴ mol/L。(b) pH=2 の [H⁺]=10⁻²，10 倍希釈で 10⁻³ mol/L。(c) H⁺＝0.01×(10/1000)＝10⁻⁴ mol，OH⁻＝0.005×(10/1000)＝5×10⁻⁵ mol，残り H⁺＝5×10⁻⁵ mol，[H⁺]=5×10⁻⁵/0.020＝2.5×10⁻³ mol/L。[H⁺] の大きい順に (c)>(b)>(a) なので pH は (c)<(b)<(a)。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qA11', category: '応用問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '0.05 mol/L の水酸化ナトリウム水溶液 100 mL を容器に入れ，電極を浸した。これに (a) 0.1 mol/L の塩酸 または (b) 0.1 mol/L の酢酸水溶液を滴下して，温度を 25℃ に保って電気伝導度の変化を調べた。このときの変化を表すグラフとして最も近いものを (a)，(b) それぞれについて図（cheb5-132.png）から選び，その理由を述べよ。',
    answerVector: ['イ；理由：中和点までは失われる OH⁻（電気伝導度大）と増える Cl⁻（電気伝導度小）で電気伝導度が減少し，中和点以降は Cl⁻ と電気伝導度の大きい H⁺ が増えるため増加する。', 'オ；理由：中和点までは電気伝導度が減少するが，中和点以降は CH₃COOH が増えるものの電離度が小さいためイオンの増加が少なく，電気伝導度はほとんど変わらない。'], N: 2,
    answerJp: '(a) イ（中和点まで減少し以降増加）。理由：失われる OH⁻ は増える Cl⁻ より電気伝導度が大きく，中和点以降は電気伝導度の大きい H⁺ が増えるため。(b) オ（中和点まで減少し以降ほぼ一定）。理由：中和点以降は CH₃COOH が増えるが電離度が小さくイオンの増加が少ないため。',
    explCn: '電気の通しやすさはイオンの数だけでなく種類にも関係し，H⁺ と OH⁻ は特に電気伝導度が大きい。(a) 塩酸の中和点までは OH⁻（大）が Cl⁻（小）に置き換わって減少，以降は H⁺（大）が増えて増加。(b) 酢酸の中和点以降は CH₃COOH が増えるが弱酸で電離度が小さく，伝導度はほぼ一定。',
    issues: ['解析 (b) の選択肢記号「力」（应为オ）为OCR字形，按項目规则保留原样；記述理由は应答要点を槽位化'],
  },
  {
    code: 'chem-cheb5-qA20', category: '応用問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'simple', Q: '1.0 mol/L の酢酸水溶液 15.0 mL に，2.0 mol/L の水酸化ナトリウム水溶液 12.0 mL を加えた。この混合溶液中の水酸化ナトリウムを中和するには，0.60 mol/L の硫酸が何 mL 必要か。',
    options: ['7.5 mL', '15 mL', '5.0 mL', '10 mL'], correctIndex: 0,
    answerJp: '7.5 mL',
    explCn: 'CH₃COOH の H⁺＝1.0×15.0/1000＝0.015 mol。NaOH の OH⁻＝2.0×12.0/1000＝0.024 mol。残る OH⁻＝0.009 mol。硫酸（2 価）の H⁺＝2×0.60×x＝0.009 → x=0.0075 L＝7.5 mL。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qA12', category: '応用問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '(1) 0.10 mol/L の塩酸と 0.10 mol/L の硫酸を合計 35 mL とり，0.10 mol/L の水酸化ナトリウム水溶液で中和したところ 45 mL を要した。最初にとった塩酸，硫酸はそれぞれ何 mL か。(2) 水酸化ナトリウムと水酸化カリウムの混合物 2.32 g を水に溶かし，1.00 mol/L の塩酸で中和するのに 50.0 mL が必要だった。混合物中の水酸化ナトリウムは何 g か（NaOH=40.0，KOH=56.0）。',
    answerVector: ['塩酸：25 mL', '硫酸：10 mL', '1.2 g'], N: 3,
    answerJp: '(1) 塩酸 25 mL，硫酸 10 mL (2) 1.2 g',
    explCn: '(1) 塩酸を x L とすると 1×0.10×x＋2×0.10×(0.035−x)＝1×0.10×(45/1000) → x=0.025 L＝25 mL，硫酸は 10 mL。(2) NaOH を x mol，KOH を y mol とすると 40.0x＋56.0y＝2.32，x＋y＝0.050 → x=0.030 mol，質量 1.2 g。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qA13', category: '応用問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: 'ある食品 17.5 mg に含まれる窒素をすべてアンモニアとして発生させ，そのすべてを 0.025 mol/L の硫酸 15.0 mL に吸収させた。この溶液を 0.050 mol/L の水酸化ナトリウム水溶液で滴定したところ 13.0 mL が必要だった。(1) 硫酸に吸収されたアンモニアは何 mg か。(2) この食品 100 g に含まれる窒素は何 g か。(3) アンモニアの発生量を測定する際，水上置換で捕集して直接体積を測定するのではなく，上記のように中和滴定を用いて測定するのはなぜか，説明せよ。',
    answerVector: ['1.7 mg', '8.0 g', 'アンモニアは水に溶けやすい気体なので，水上置換で捕集して体積を正確に測定することができないから。'], N: 3,
    answerJp: '(1) 1.7 mg (2) 8.0 g (3) アンモニアは水に溶けやすい気体なので，水上置換で捕集して体積を正確に測定することができないから。',
    explCn: '(1) 酸の価数×物質量の総和＝塩基の価数×物質量の総和：2×0.025×(15.0/1000)＝1×x＋1×0.050×(13.0/1000) → x=1.0×10⁻⁴ mol。NH₃ の質量＝17×1.0×10⁻⁴＝1.7×10⁻³ g＝1.7 mg。(2) N は 1.7×14/17＝1.4 mg（食品 17.5 mg 中）。100 g では 1.4×100/0.0175…＝1.4 mg×(100000/17.5)＝8.0 g。(3) NH₃ は水に溶けやすいので水上置換では正確な体積が測れない。酸に吸収させて中和滴定すれば全量を捕集・定量できる。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qA14', category: '応用問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '濃度 x mol/L の炭酸ナトリウム水溶液 25 mL を，フェノールフタレインを指示薬として 0.10 mol/L の塩酸で滴定したところ y mL で (a) 溶液の色が変わった。これにメチルオレンジを加えてさらに滴定を続けたところ，(b) 溶液の色が変わるまでに要した塩酸の量は最初から通算して 30 mL だった。(1) この滴定の反応の化学反応式を記せ。(2) 下線部 (a)，(b) の溶液の色の変化を記せ。(3) x，y の値を求めよ。',
    answerVector: ['Na₂CO₃ + HCl → NaCl + NaHCO₃', 'NaHCO₃ + HCl → NaCl + H₂O + CO₂', '赤色 → 無色', '黄色 → 赤色', 'x = 0.060 mol/L', 'y = 15 mL'], N: 6,
    answerJp: '(1) ① Na₂CO₃+HCl→NaCl+NaHCO₃ ② NaHCO₃+HCl→NaCl+H₂O+CO₂ (2)(a) 赤色→無色 (b) 黄色→赤色 (3) x=0.060 mol/L，y=15 mL',
    explCn: '(2) フェノールフタレインは塩基性で赤色で，Na₂CO₃ が NaHCO₃ になると無色になる。メチルオレンジは酸性側で変色し，NaHCO₃ が NaCl になると（黄色→赤色）。(3) 第一段階と第二段階の HCl 量は等しいので y=15 mL。x＝0.10×(15/1000)/(25/1000)＝0.060 mol/L。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qA15', category: '応用問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '炭酸ナトリウムと炭酸水素ナトリウムの混合溶液 200 mL から 10.0 mL をとり，フェノールフタレインを指示薬として 1.00 mol/L の塩酸を続けて滴下したところ，第 1 中和点（pH=8.3）までに 4.00 mL が必要だった。さらにメチルオレンジを指示薬として塩酸を滴下したところ，第 1 中和点から第 2 中和点（pH=3.6）までに 6.00 mL の塩酸が必要だった。最初の混合溶液 200 mL に含まれていた炭酸水素ナトリウムの質量 [g] と，塩酸滴下時に発生した気体の標準状態での体積 [mL] を求めよ。',
    answerVector: ['炭酸水素ナトリウム：3.4 g', '気体（CO₂）の体積：134 mL'], N: 2,
    answerJp: '炭酸水素ナトリウム：3.4 g，気体（CO₂）の標準状態での体積：134 mL',
    explCn: '第 1 中和点：Na₂CO₃→NaHCO₃ に HCl 4.00 mL，Na₂CO₃＝1.00×4.00/1000＝4.00×10⁻³ mol。第 1→第 2 中和点：反応する NaHCO₃ は Na₂CO₃ 由来分 x ともともとの分 y の和で 1.00×6.00/1000＝6.00×10⁻³ mol → y＝2.00×10⁻³ mol（いずれも 10.0 mL 中の値）。もとの溶液 200 mL 全体では ×20 で NaHCO₃＝4.00×10⁻² mol，質量＝84×4.00×10⁻²＝3.36≒3.4 g。発生する CO₂ は第 1→第 2 中和点で反応した NaHCO₃（6.00×10⁻³ mol）と等量で，体積＝22.4×6.00×10⁻³＝134.4×10⁻³ L≒134 mL（解析に同じ）。',
    issues: ['気体の体積 134 mL は採取した 10.0 mL の滴定における発生量（解析の計算に対応），質量は 200 mL 全体に換算した値——記述の差異を抽检で確認'],
  },
  {
    code: 'chem-cheb5-qA16', category: '応用問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '塩化水素と酢酸を含む水溶液 A 10.0 mL に 0.15 mol/L の水酸化バリウム水溶液を滴下し，滴定曲線を得た。中和点 V₁，V₂ までの滴下量はそれぞれ 5.0 mL，15.0 mL である。水溶液 A 中の塩化水素と酢酸のモル濃度を求めよ。',
    answerVector: ['塩化水素：0.15 mol/L', '酢酸：0.30 mol/L'], N: 2,
    answerJp: '塩化水素：0.15 mol/L，酢酸：0.30 mol/L',
    explCn: '強酸 HCl が先に中和され，第 1 中和点が V₁=5.0 mL。1×x×(10.0/1000)＝2×0.15×(5.0/1000) → x=0.15 mol/L。CH₃COOH の中和には 15.0−5.0＝10.0 mL。1×y×(10.0/1000)＝2×0.15×(10.0/1000) → y=0.30 mol/L。',
    issues: [],
  },
  {
    code: 'chem-cheb5-qA17', category: '応用問題', topic: T_ACID, subtopics: S_PH,
    optMode: 'multi', Q: '1.0 km² の土地で，2000 台の自動車がそれぞれ 4.0 L のガソリンを燃焼させた。ガソリン 1.0 L の質量は 0.75 kg，硫黄の含有率（質量パーセント）は 0.0080% とする。この硫黄のすべてが大気中で硫酸に変化して降水量 1.0 mm の小雨に溶けこみ，この面積に降ったとする。また，希薄な水溶液中では硫酸は完全に電離しているものとする。(1) 生成した硫酸の物質量 [mol] を求めよ。(2) この雨の水素イオン濃度を求めよ。',
    answerVector: ['15 mol', '3.0×10⁻⁵ mol/L'], N: 2,
    answerJp: '(1) 15 mol (2) 3.0×10⁻⁵ mol/L',
    explCn: '(1) 硫黄の質量＝0.75 kg/L×4.0 L×0.0080/100×2000 台＝0.48 kg＝480 g。S の物質量＝480/32＝15 mol。S 1 原子から H₂SO₄ 1 分子なので硫酸は 15 mol。(2) 雨の体積＝1.0×10⁶ m²×1.0×10⁻³ m＝1.0×10³ m³＝1.0×10⁶ L。[H₂SO₄]=15/1.0×10⁶＝1.5×10⁻⁵ mol/L。硫酸は 2 価の強酸なので [H⁺]=2×1.5×10⁻⁵＝3.0×10⁻⁵ mol/L。',
    issues: ['解析中の「2倃の強酸」（倃=価）为OCR字形，按項目规则保留原样'],
  },
  {
    code: 'chem-cheb5-qA18', category: '応用問題', topic: T_ACID, subtopics: S_CHU,
    optMode: 'multi', Q: '27℃，1.013×10⁵ Pa の乾燥空気 5.00 L と，0.00500 mol/L の水酸化バリウム水溶液 100 mL を容器に入れて密封し，よく振ったところ，炭酸バリウムの白色沈殿が生じた。放置後，溶液をろ過し，ろ液 20.0 mL を 0.0100 mol/L の塩酸で中和滴定したところ 16.96 mL 必要だった。(1) 下線部の反応の化学反応式を記せ。(2) 乾燥空気 5.00 L に含まれていた二酸化炭素の体積百分率は何%か（27℃，1.013×10⁵ Pa の気体 1 mol の体積は 24.6 L）。',
    answerVector: ['Ba(OH)₂ + CO₂ → BaCO₃ + H₂O', '0.037%'], N: 2,
    answerJp: '(1) Ba(OH)₂+CO₂→BaCO₃+H₂O (2) 0.037%',
    explCn: '(2) ろ液全体（100 mL）の中和に必要な HCl は 16.96×(100/20.0)＝84.8 mL。CO₂ を x mol とすると 2×x＋1×0.0100×(84.8/1000)＝2×0.00500×(100/1000) → x=7.6×10⁻⁵ mol。体積＝24.6×7.6×10⁻⁵＝1.87×10⁻³ L。百分率＝1.87×10⁻³/5.00×100＝0.037%。',
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
  console.log('cheb5 drafts:', d.length);
  const s = new Map();
  d.forEach((x) => s.set(x.generationStatus, (s.get(x.generationStatus) || 0) + 1));
  console.log('status:', Object.fromEntries(s));
}