#!/usr/bin/env node
/**
 * che14_pilot_content.cjs — che14（第14章 アルコールと関連化合物）内容定义
 *
 * 源：che14_题目.md + che14_解析.md（仅此两文件，其余为过程文件）
 * 考纲：ejuSyllabus.ts（官能基をもつ脂肪族化合物 chem_4_1_2 下的 4 个子节点）
 *  - アルコール・エーテル（分類・エタノール・メタノール・アルコールの酸化・脱水）→ chem_4_1_2_01
 *  - アルデヒド・ケトン（銀鏡反応・フェーリング液・ヨードホルム反応・還元性）→ chem_4_1_2_02
 *  - カルボン酸・エステル（酢酸・ギ酸・エステル構造・加水分解・けん化）→ chem_4_1_2_03
 *  - 油脂・セッケン・合成洗剤（けん化価・ヨウ素価・ミセル・乳化）→ chem_4_1_2_04
 *
 * 变通：
 *  - qB10(304 判別操作)、qB12(311 正誤選択)、qA5(316 正誤選択) → 把答案要点/記号組合せ作為槽位；
 *  - qB11(307)、qA12(323)、qA14(325) 等推定题 → 把構造式・物質名・記号組合せ按"语言描述"作槽，
 *    记述/作图内容统一以要点文字纳入，不要求作图。
 */
'use strict';

const T_FUNG = 'chem_4_1_2';    // 官能基をもつ脂肪族化合物
const S_AE = ['chem_4_1_2_01']; // アルコール・エーテル
const S_ADK = ['chem_4_1_2_02']; // アルデヒド・ケトン
const S_CAC = ['chem_4_1_2_03']; // カルボン酸・エステル
const S_OIL = ['chem_4_1_2_04']; // 油脂・セッケン
const S_AE_ADK = ['chem_4_1_2_01', 'chem_4_1_2_02'];
const S_AE_CAC = ['chem_4_1_2_01', 'chem_4_1_2_03'];
const S_ALL3 = ['chem_4_1_2_01', 'chem_4_1_2_02', 'chem_4_1_2_03'];

const CONTENT = [
  // ---- 基礎 CHECK ----
  {
    code: 'chem-che14-qC1', category: '基礎 CHECK', topic: T_FUNG, subtopics: S_AE,
    optMode: 'multi', Q: '炭化水素の水素原子が -OH に置き換わった構造の化合物を何というか。',
    answerVector: ['アルコール'], N: 1,
    answerJp: 'アルコール',
    explCn: '炭化水素の水素原子が -OH（ヒドロキシ基）に置き換わった構造の化合物をアルコールという。',
    issues: [],
  },
  {
    code: 'chem-che14-qC2', category: '基礎 CHECK', topic: T_FUNG, subtopics: S_AE,
    optMode: 'multi', Q: '1価アルコールと構造異性体の関係にあり，一般式 R-O-R\' で表される化合物を何というか。',
    answerVector: ['エーテル'], N: 1,
    answerJp: 'エーテル',
    explCn: '一般式 R-O-R\' で表され、1価アルコール R-OH と構造異性体の関係にあるのがエーテルである。',
    issues: [],
  },
  {
    code: 'chem-che14-qC3', category: '基礎 CHECK', topic: T_FUNG, subtopics: S_ADK,
    optMode: 'multi', Q: '第1級アルコールの酸化で得られ、一般式 R-CHO で表される化合物を何というか。',
    answerVector: ['アルデヒド'], N: 1,
    answerJp: 'アルデヒド',
    explCn: '第1級アルコール R-CH₂OH は酸化（-2H）されてアルデヒド R-CHO になる。',
    issues: [],
  },
  {
    code: 'chem-che14-qC4', category: '基礎 CHECK', topic: T_FUNG, subtopics: S_ADK,
    optMode: 'multi', Q: 'アルデヒドと構造異性体の関係にあり, 一般式 R-CO-R\' で表される化合物を何というか。',
    answerVector: ['ケトン'], N: 1,
    answerJp: 'ケトン',
    explCn: '一般式 R-CO-R\'（カルボニル基 C=O に2個の炭化水素基）で表され、アルデヒド R-CHO と構造異性体の関係にあるのがケトンである。',
    issues: [],
  },
  {
    code: 'chem-che14-qC5', category: '基礎 CHECK', topic: T_FUNG, subtopics: S_CAC,
    optMode: 'multi', Q: 'アルデヒドの酸化で得られ, 一般式 R-COOH で表される化合物を何というか。',
    answerVector: ['カルボン酸'], N: 1,
    answerJp: 'カルボン酸',
    explCn: 'アルデヒド R-CHO がさらに酸化（+O）されると、カルボキシ基 -COOH をもつカルボン酸 R-COOH になる。',
    issues: [],
  },
  {
    code: 'chem-che14-qC6', category: '基礎 CHECK', topic: T_FUNG, subtopics: S_ADK,
    optMode: 'multi', Q: '硝酸銀水溶液にアンモニア水を加えた溶液に、アルデヒドを加えて温めると、試験管の内壁に銀が析出した。この反応を何というか。',
    answerVector: ['銀鏡反応'], N: 1,
    answerJp: '銀鏡反応',
    explCn: 'アンモニア性硝酸銀水溶液をアルデヒドで還元すると銀が析出して試験管内壁に鏡ができる。これを銀鏡反応という。',
    issues: [],
  },
  {
    code: 'chem-che14-qC7', category: '基礎 CHECK', topic: T_FUNG, subtopics: S_ADK,
    optMode: 'multi', Q: 'フェーリング液にホルムアルデヒドを加えて加熱すると, 赤色の沈殿が生じた。生じた沈殿は何か。',
    answerVector: ['酸化銅（I）'], N: 1,
    answerJp: '酸化銅（I）',
    explCn: 'フェーリング液の銅（Ⅱ）イオンがアルデヒドに還元され、赤色の酸化銅（I）Cu₂O が沈殿する。',
    issues: [],
  },
  {
    code: 'chem-che14-qC8', category: '基礎 CHECK', topic: T_FUNG, subtopics: S_ADK,
    optMode: 'multi', Q: 'アセトンにヨウ素と水酸化ナトリウム水溶液を加えて反応させると、黄色の沈殿が生じた。この反応を何というか。',
    answerVector: ['ヨードホルム反応'], N: 1,
    answerJp: 'ヨードホルム反応',
    explCn: 'CH₃-CO- または CH₃-CH(OH)- の構造をもつ化合物にヨウ素と NaOH 水溶液を加えると、黄色のヨードホルム CHI₃ が沈殿する。これをヨードホルム反応という。',
    issues: [],
  },
  {
    code: 'chem-che14-qC9', category: '基礎 CHECK', topic: T_FUNG, subtopics: S_CAC,
    optMode: 'multi', Q: 'カルボン酸とアルコールの脱水縮合で得られ、一般式 R-COO-R\' で表される化合物を何というか。',
    answerVector: ['エステル'], N: 1,
    answerJp: 'エステル',
    explCn: 'カルボン酸 R-COOH とアルコール R\'-OH が脱水縮合して生じる R-COO-R\' をエステルという。',
    issues: [],
  },
  {
    code: 'chem-che14-qC10', category: '基礎 CHECK', topic: T_FUNG, subtopics: S_OIL,
    optMode: 'multi', Q: '(1)グリセリンと脂肪酸のエステルを何というか。(2)セッケンは、(1)の物質からどのような反応によってつくられるか。',
    answerVector: ['油脂', 'けん化'], N: 2,
    answerJp: '(1)油脂 (2)けん化',
    explCn: '(1)グリセリン（3価アルコール）と脂肪酸のトリエステルを油脂という。(2)油脂を水酸化ナトリウム水溶液と加熱して加水分解し、脂肪酸のナトリウム塩（セッケン）を得る反応をけん化という。',
    issues: [],
  },

  // ---- 基本例題 ----
  {
    code: 'chem-che14-qE1', category: '基本例題', topic: T_FUNG, subtopics: S_AE,
    optMode: 'multi', Q: 'アルコールの分類：(a)-OH が結合している C 原子が何個の基と結合しているかによる分類の対象 (b)ニクロム酸カリウム（硫酸酸性）による反応 (c)第1級アルコールから経て生じるもの (d)第1級アルコールの酸化の最終生成物 (e)第2級アルコールから生じるもの (f)分子中の基の数による分類に用いる基 (g)メタノール (h)エチレングリコール (i)グリセリン。',
    answerVector: ['炭化水素', '酸化', 'アルデヒド', 'カルボン酸', 'ケトン', 'ヒドロキシ', '1価アルコール', '2価アルコール', '3価アルコール'], N: 9,
    answerJp: '(a)炭化水素 (b)酸化 (c)アルデヒド (d)カルボン酸 (e)ケトン (f)ヒドロキシ (g)1価アルコール (h)2価アルコール (i)3価アルコール',
    explCn: 'アルコールの分類：①級数＝-OH が結合する C に結合した炭化水素基（アルキル基）の数（第1級・第2級・第3級）。②価数＝分子中の -OH（ヒドロキシ基）の数（1価・2価・3価）。第1級アルコールは酸化でアルデヒドを経てカルボン酸に、第2級アルコールはケトンになるが、第3級アルコールはこの条件では酸化されない。メタノール＝1価、エチレングリコール＝2価、グリセリン＝3価。',
    issues: [],
  },
  {
    code: 'chem-che14-qE2', category: '基本例題', topic: T_FUNG, subtopics: S_ALL3,
    optMode: 'multi', Q: 'エタノールの反応系統図：(A)~(F) は物質名、(ア)~(オ) は反応名。（エタノールから 130℃脱水で(A)、170℃脱水で(B)、酸化で(E)を経て(F)、Na と反応し(D)、I₂+NaOH で(C)、酢酸と反応して(G) に対応。）',
    answerVector: ['ジエチルエーテル', 'エチレン', 'ヨードホルム', 'ナトリウムエトキシド', 'アセトアルデヒド', '酢酸', '脱水反応', '付加反応', '置換反応', '酸化', 'エステル化'], N: 11,
    answerJp: '(A)ジエチルエーテル (B)エチレン (C)ヨードホルム (D)ナトリウムエトキシド (E)アセトアルデヒド (F)酢酸、(ア)脱水反応 (イ)付加反応 (ウ)置換反応 (エ)酸化 (オ)エステル化',
    explCn: 'エタノール 2分子は濃硫酸・約130℃で分子間脱水しジエチルエーテル CH₃-CH₂-O-CH₂-CH₃（(ア)脱水反応）、1分子は濃硫酸・約170℃で分子内脱水しエチレン CH₂=CH₂（(ア)脱水反応）。エタノールは酸化（(エ)）でアセトアルデヒド(CH₃-CHO)を経て酢酸(CH₃-COOH)に。Na と置換反応（(ウ)）でナトリウムエトキシド CH₃-CH₂-ONa＋H₂。I₂＋NaOH でヨードホルム反応（CH₃-CH(OH)-構造）。酢酸と脱水縮合（(オ)エステル化）で酢酸エチル。エチレンへの水の付加反応（(イ)）でエタノールに戻る。',
    issues: [],
  },
  {
    code: 'chem-che14-qE3', category: '基本例題', topic: T_FUNG, subtopics: S_ALL3,
    optMode: 'multi', Q: 'C,H,O からなり C3個・C=C,C≡C・環状構造なし・O を含む官能基1つの化合物：(1)フェーリング液と煮沸で赤色沈殿 (2)(1)の構造異性体でフェーリング液と反応しない (3)Na と反応し中性、酸化で(2)になる (4)(3)の構造異性体で Na と反応しない (5)水溶液は弱酸性、NaHCO₃ と反応し気体発生。それぞれの構造式を答えよ。',
    answerVector: ['CH₃-CH₂-CHO', 'CH₃-CO-CH₃', 'CH₃-CH(OH)-CH₃', 'CH₃-CH₂-O-CH₃', 'CH₃-CH₂-COOH'], N: 5,
    answerJp: '(1)CH₃-CH₂-CHO（プロピオンアルデヒド） (2)CH₃-CO-CH₃（アセトン） (3)CH₃-CH(OH)-CH₃（2-プロパノール） (4)CH₃-CH₂-O-CH₃（エチルメチルエーテル） (5)CH₃-CH₂-COOH（プロピオン酸）',
    explCn: 'C₃ の鎖式化合物で官能基1個。(1)フェーリング液を還元するのはアルデヒド → プロピオンアルデヒド CH₃-CH₂-CHO。(2)ケトンは C=O をもつが還元性を示さない → アセトン CH₃-CO-CH₃。(3)アルコールは Na と反応し、第2級アルコールは酸化でケトン(2)になる → 2-プロパノール CH₃-CH(OH)-CH₃。(4)エーテルは Na と反応しない → エチルメチルエーテル CH₃-CH₂-O-CH₃。(5)カルボン酸の酸性は炭酸より強く NaHCO₃ と CO₂ を発生 → プロピオン酸 CH₃-CH₂-COOH。',
    issues: [],
  },
  {
    code: 'chem-che14-qE4', category: '基本例題', topic: T_FUNG, subtopics: S_CAC,
    optMode: 'multi', Q: '分子量 102 のエステル A（R-COO-R\'）の元素分析で C:H=1:2。(1)エステルAの分子式 (2)構造異性体は何種類か (3)不斉炭素原子をもつアルコールから生じるエステルの構造式。',
    answerVector: ['C₅H₁₀O₂', '9種類', 'H-COO-CH(CH₃)-CH₂-CH₃'], N: 3,
    answerJp: '(1)C₅H₁₀O₂ (2)9種類 (3)H-COO-CH(CH₃)-CH₂-CH₃',
    explCn: '(1)C:H=1:2 より CₓH₂ₓO₂、分子量 12x+2x+32=102 → x=5 → C₅H₁₀O₂。(2)R+R\'=C₄H₉ となる組合せ：①R=H,R\'=C₄H₉（4種）②R=CH₃,R\'=C₃H₇（2種）③R=R\'=C₂H₅（1種）④R=C₃H₇,R\'=CH₃（2種）。計 4+2+1+2=9種類（R\'=H はカルボン酸になるので不適）。(3)C₄H₉ のアルコール基で不斉炭素をもつのは 2-ブチル基 CH(CH₃)CH₂CH₃ → H-COO-CH(CH₃)-CH₂-CH₃（ギ酸2-ブチル）。',
    issues: [],
  },

  // ---- 基本問題 ----
  {
    code: 'chem-che14-qB1', category: '基本問題', topic: T_FUNG, subtopics: S_AE,
    optMode: 'multi', Q: '(ア)CH₃-CH₂-CH₂-OH (イ)HO-CH₂-CH₂-CH₂-OH (ウ)HO-CH₂-CH(OH)-CH₂-OH (エ)CH₃-CH₂-CH(OH)-CH₃ (オ)CH₃-C(CH₃)₂-OH (カ)（エと同じ級数の異性体）。このうち (1)2価アルコール (2)第3級アルコール をそれぞれ選べ。',
    answerVector: ['イ', 'オ'], N: 2,
    answerJp: '(1)イ (2)オ',
    explCn: '価数は -OH の数：イは HO-CH₂-CH₂-CH₂-OH で2価、ウは3価（グリセリン）。(1)2価アルコール＝イ。級数は -OH 結合 C のアルキル基の数：オの CH₃-C(CH₃)₂-OH は -OH が結合する C が3個のアルキル基と結合 → 第3級アルコール。(2)オ。',
    issues: [],
  },
  {
    code: 'chem-che14-qB2', category: '基本問題', topic: T_FUNG, subtopics: S_AE,
    optMode: 'multi', Q: 'エタノール：(a)糖類の何発酵で得られるか (b)工業的に水を付加させる物質 (c)Na と反応して発生する気体 (d)濃硫酸と約130℃でおもに得られるもの (e)約170℃でおもに得られるもの (f)エタノールと酢酸の混合物に少量加えて加熱するもの (g)果実の芳香をもつ生成物 (h)脱水縮合反応の名称 (i)エタノール酸化の中間生成物 (j)エタノール酸化の最終生成物 (k)第1級アルコール酸化で経るもの (l)第1級アルコール酸化の最終生成物 (m)第2級アルコール酸化の生成物。',
    answerVector: ['アルコール', 'エチレン', '水素', 'ジエチルエーテル', 'エチレン', '濃硫酸', '酢酸エチル', 'エステル化', 'アセトアルデヒド', '酢酸', 'アルデヒド', 'カルボン酸', 'ケトン'], N: 13,
    answerJp: '(a)アルコール (b)エチレン (c)水素 (d)ジエチルエーテル (e)エチレン (f)濃硫酸 (g)酢酸エチル (h)エステル化 (i)アセトアルデヒド (j)酢酸 (k)アルデヒド (l)カルボン酸 (m)ケトン',
    explCn: 'エタノールは糖類のアルコール発酵で得られ、工業的にはエチレンに水を付加させて合成（CH₂=CH₂+H₂O→C₂H₅OH）。Na と反応し水素を発生（置換）。濃硫酸：約130℃で分子間脱水しジエチルエーテル、約170℃で分子内脱水しエチレン。酢酸と少量の濃硫酸で加熱すると酢酸エチルが生じる脱水縮合＝エステル化。第1級アルコールは酸化でアルデヒド(R-CHO)を経てカルボン酸(R-COOH)、第2級アルコールはケトン。',
    issues: [],
  },
  {
    code: 'chem-che14-qB3', category: '基本問題', topic: T_FUNG, subtopics: S_AE,
    optMode: 'multi', Q: 'あるアルコール CₓHᵧ-OH 1.5g を Na と反応させると標準状態で 280mL の水素が発生。(1)x の値 (2)y の値 (3)(4)アルコールとして可能な構造式（2種類）。',
    answerVector: ['3', '7', 'CH₃-CH₂-CH₂-OH', 'CH₃-CH(OH)-CH₃'], N: 4,
    answerJp: 'x=3, y=7、構造式は CH₃-CH₂-CH₂-OH（1-プロパノール）と CH₃-CH(OH)-CH₃（2-プロパノール）',
    explCn: '2R-OH+2Na→2R-ONa+H₂。アルコール2mol から H₂ 1mol。1.5g/M ×1/2 = 0.280/22.4 → M=60。CₓHᵧOH=60 より 12x+y+17=60。x=3,y=7 が自然数解（他は y が不自然）。C₃H₇OH の構造異性体は 1-プロパノールと 2-プロパノールの2種。',
    issues: [],
  },
  {
    code: 'chem-che14-qB4', category: '基本問題', topic: T_FUNG, subtopics: S_AE,
    optMode: 'multi', Q: '分子式 C₄H₁₀O のアルコール A,B,C,D（鏡像異性体は区別しない）。適当な酸化剤で A,B からはアルデヒド、C からはケトン、D は反応せず。A から生じるアルデヒドは直鎖状。A,B,C,D の構造式を答えよ。',
    answerVector: ['CH₃-CH₂-CH₂-CH₂-OH', 'CH₃-CH(CH₃)-CH₂-OH', 'CH₃-CH₂-CH(OH)-CH₃', '(CH₃)₃C-OH'], N: 4,
    answerJp: 'A:CH₃-CH₂-CH₂-CH₂-OH（1-ブタノール） B:CH₃-CH(CH₃)-CH₂-OH（2-メチル-1-プロパノール） C:CH₃-CH₂-CH(OH)-CH₃（2-ブタノール） D:(CH₃)₃C-OH（2-メチル-2-プロパノール）',
    explCn: 'C₄H₁₀O のアルコールは4種。酸化でアルデヒドになる A,B は第1級、ケトンになる C は第2級（2-ブタノール）、D は第3級（2-メチル-2-プロパノール）で酸化されない。A の酸化生成アルデヒドが直鎖（n-ブタナール）なので A=1-ブタノール、B=2-メチル-1-プロパノール。',
    issues: [],
  },
  {
    code: 'chem-che14-qB5', category: '基本問題', topic: T_FUNG, subtopics: S_ADK,
    optMode: 'multi', Q: '銅線を赤熱（①で黒色に変色）後、メタノール蒸気に近づける（②でもとの色に戻る）操作で刺激臭の化合物 A を得た。(1)(a)Aの性質 (b)フェーリング液中の沈殿の色 (c)沈殿の物質名 (d)アンモニア性硝酸銀水溶液でみられる反応。',
    answerVector: ['還元', '赤', '酸化銅（I）', '銀鏡'], N: 4,
    answerJp: '(1)(a)還元 (b)赤 (c)酸化銅（I） (d)銀鏡',
    explCn: 'アルデヒドは還元性を示す（(a)）。フェーリング液の Cu²⁺ を還元し赤色の酸化銅（I）Cu₂O を沈殿（(b)赤、(c)酸化銅（I））。アンモニア性硝酸銀水溶液を還元して銀鏡反応を示す（(d)）。',
    issues: [],
  },
  {
    code: 'chem-che14-qB6', category: '基本問題', topic: T_FUNG, subtopics: S_ADK,
    optMode: 'multi', Q: '305 続き：(2)下線部①で銅線は何色に変化したか、表面に生成した物質は何か。(3)化合物Aの構造式と名称。(4)②③の変化を1つの化学反応式で表せ。',
    answerVector: ['黒色、酸化銅（Ⅱ）', 'H-CHO、ホルムアルデヒド', 'CH₃-OH + CuO → H-CHO + H₂O + Cu'], N: 3,
    answerJp: '(2)黒色の酸化銅（Ⅱ） (3)H-CHO（ホルムアルデヒド） (4)CH₃-OH+CuO→H-CHO+H₂O+Cu',
    explCn: '(2)銅は空気中の酸素で酸化され黒色の酸化銅（Ⅱ）CuO になる。(3)メタノール（第1級アルコール）の酸化でホルムアルデヒド H-CHO が生じる。(4)赤熱した CuO がメタノールを酸化し、CuO は銅に戻る（脱水素化）：CH₃-OH+CuO→H-CHO+H₂O+Cu。',
    issues: [],
  },
  {
    code: 'chem-che14-qB7', category: '基本問題', topic: T_FUNG, subtopics: S_CAC,
    optMode: 'multi', Q: 'カルボン酸：(a)食酢の主成分 (b)アセトアルデヒドからの反応 (c)炭酸との酸性の強さ (d)炭酸水素ナトリウムと反応して発生する気体 (e)凝固する純粋な酢酸の別名 (f)酢酸の脱水で生じる分類 (g)生じる物質 (h)ギ酸が含む（カルボキシ基のほかの）基 (i)ギ酸の性質 (j)アンモニア性硝酸銀水溶液から析出するもの (k)鎖式モノカルボン酸の総称 (l)パルミチン酸の飽和・不飽和 (m)リノール酸の飽和・不飽和 (n)炭素数2の飽和ジカルボン酸 (o)マレイン酸・フマル酸の関係 (p)シス形 (q)トランス形 (r)乳酸が含む基 (s)乳酸に存在する炭素原子（の種類） (t)その異性体の種類。',
    answerVector: ['酢酸', '酸化', '強', '二酸化炭素', '水酢酸', '酸無水物', '無水酢酸', 'ホルミル（アルデヒド）', '還元', '銀', '脂肪酸', '飽和', '不飽和', 'シュウ酸', 'シス-トランス異性体（幾何異性体）', 'マレイン酸', 'フマル酸', 'ヒドロキシ', '不斉', '鏡像（光学）'], N: 20,
    answerJp: '(a)酢酸 (b)酸化 (c)強 (d)二酸化炭素 (e)水酢酸 (f)酸無水物 (g)無水酢酸 (h)ホルミル（アルデヒド） (i)還元 (j)銀 (k)脂肪酸 (l)飽和 (m)不飽和 (n)シュウ酸 (o)シス-トランス異性体（幾何異性体） (p)マレイン酸 (q)フマル酸 (r)ヒドロキシ (s)不斉 (t)鏡像（光学）',
    explCn: '(a)酢酸は食酢の主成分、(b)アセトアルデヒドの酸化で生成。カルボン酸の酸性は炭酸より強く（(c)強）、NaHCO₃ と反応し CO₂（(d)二酸化炭素）。(e)純粋な酢酸（凝固）を水酢酸という。酢酸2分子の脱水縮合で酸無水物（(f)）の無水酢酸（(g)）。(h)ギ酸はホルミル基 H-C(=O)- を含み還元性（(i)）を示し、アンモニア性硝酸銀から銀（(j)）を析出。(k)鎖式モノカルボン酸＝脂肪酸。パルミチン酸 C₁₅H₃₁-COOH は飽和（(l)）、リノール酸 C₁₇H₃₁-COOH は不飽和（C=C2個）(m)。(n)シュウ酸 HOOC-COOH。(o)マレイン酸(シス)とフマル酸(トランス)はシス-トランス（幾何）異性体。(p)マレイン酸 (q)フマル酸。(r)乳酸はカルボキシ基とヒドロキシ基をもち、(s)不斉炭素原子があるので (t)鏡像（光学）異性体が存在する。',
    issues: [],
  },
  {
    code: 'chem-che14-qB8', category: '基本問題', topic: T_FUNG, subtopics: S_CAC,
    optMode: 'multi', Q: '酢酸とエタノールの混合物に少量の濃硫酸を加えて温めると (a) が生じる。[b]+[c]⇔[d]+H₂O（この反応を(e)といい、生じる水の酸素原子は[b]から）。(a)は水より軽く水に溶け(f)液体で芳香がある。(1)文中の語句・構造式 (2)(a)に塩酸を加えて加熱すると生じる物質 (3)(a)にNaOH水溶液を加えて加熱すると生じる物質 (4)(2)(3)の反応名。',
    answerVector: ['酢酸エチル', 'CH₃-COOH', 'CH₃-CH₂-OH', 'CH₃-COO-CH₂-CH₃', 'エステル化', 'にく', '酢酸', 'エタノール', '酢酸ナトリウム', 'エタノール', '加水分解', 'けん化'], N: 12,
    answerJp: '(1)(a)酢酸エチル [b]CH₃-COOH [c]CH₃-CH₂-OH [d]CH₃-COO-CH₂-CH₃ (e)エステル化 (f)にくい (2)酢酸とエタノール (3)酢酸ナトリウムとエタノール (4)(2)加水分解 (3)けん化',
    explCn: '(1)酢酸 CH₃-COOH＋エタノール CH₃-CH₂-OH が脱水縮合（エステル化(e)）して酢酸エチル CH₃-COO-CH₂-CH₃(a,d)が生じる。水の酸素はカルボン酸側 [b] 由来。酢酸エチルは水に溶けにくく(f)芳香をもつ。(2)希塩酸で加熱するとエステルは加水分解され酢酸とエタノールに戻る。(3)NaOH 水溶液で加熱（けん化）すると酢酸ナトリウム CH₃-COONa とエタノールが生じる。',
    issues: [],
  },
  {
    code: 'chem-che14-qB9', category: '基本問題', topic: T_FUNG, subtopics: S_OIL,
    optMode: 'multi', Q: '油脂：(a)3つの-OHをもつ物質 (b)油脂を構成する酸 (c)常温で液体の油脂 (d)液体油脂にする結合が多いもの (e)油脂がよく溶ける物質の分類 (f)けん化で生じるナトリウム塩 (g)水中で炭化水素基を内側に集めてできるもの (h)油脂を細かい粒子として分散させる作用。',
    answerVector: ['グリセリン', '脂肪酸', '脂肪油', '不飽和（二重）', '有機溶媒', 'セッケン', 'ミセル', '乳化'], N: 8,
    answerJp: '(a)グリセリン (b)脂肪酸 (c)脂肪油 (d)不飽和（二重） (e)有機溶媒 (f)セッケン (g)ミセル (h)乳化',
    explCn: '油脂はグリセリン C₃H₅(OH)₃（(a)）と脂肪酸 R-COOH（(b)）のトリエステル。常温で液体のものを脂肪油（(c)）といい、構成脂肪酸の C=C（不飽和（二重）結合(d)）が多いほど液体になる。油脂は水に溶けず有機溶媒（(e)）に溶ける。けん化で脂肪酸のナトリウム塩＝セッケン（(f)）ができる。セッケンは水中で炭化水素基を内側に、イオン部を外側にして集合しミセル（(g)）をつくる。セッケンが油脂を細かい粒子にし一様な乳濁液にする作用を乳化（(h)）という。',
    issues: [],
  },
  {
    code: 'chem-che14-qB10', category: '基本問題', topic: T_FUNG, subtopics: S_AE,
    optMode: 'multi', Q: 'メタノールとエタノールは性質がよく似ている。これらを判別する操作を1つあげよ。',
    answerVector: ['ヨウ素とNaOH水溶液を加え、ヨードホルムの黄色沈殿が生じるかどうかを調べる（エタノールのみ生じる）'], N: 1,
    answerJp: 'ヨウ素と水酸化ナトリウム水溶液を加える。エタノール CH₃-CH₂OH は CH₃-CH(OH)- 構造をもつのでヨードホルム反応を示し黄色沈殿が生じるが、メタノール CH₃OH は示さない。',
    explCn: 'エタノールは CH₃-CH₂-OH で、-OH が結合した炭素に CH₃ 基が結合しているため CH₃-CH(OH)- 構造をもち、I₂ と NaOH 水溶液でヨードホルム反応を示す（黄色沈殿）。メタノールは CH₃-OH で出ないため判別できる。',
    issues: [],
  },
  {
    code: 'chem-che14-qB11', category: '基本問題', topic: T_FUNG, subtopics: S_AE_ADK,
    optMode: 'multi', Q: '分子式 C₃H₈O の化合物 A,B,C。A,B は Na と反応し気体発生、C は反応しない。A,B を酸化すると A→D、B→E で、銀鏡反応を示すのは E のみ。(1)A,B,Cの分類名（Aについて考える根拠） (2)A〜Eの構造式 (3)濃硫酸と加熱でプロペンを生じるもの (4)ヨウ素とNaOHで黄色沈殿を生じるもの (5)フェーリング液で赤色沈殿を生じるもの。',
    answerVector: ['アルコール', 'エーテル', 'CH₃-CH(OH)-CH₃', 'CH₃-CH₂-CH₂-OH', 'CH₃-O-CH₂-CH₃', 'CH₃-CO-CH₃', 'CH₃-CH₂-CHO', 'A，B', 'A，D', 'E'], N: 10,
    answerJp: '(1)A,Bはアルコール、Cはエーテル（Naと反応して気体を発生するかどうか） (2)A:CH₃-CH(OH)-CH₃ B:CH₃-CH₂-CH₂-OH C:CH₃-O-CH₂-CH₃ D:CH₃-CO-CH₃ E:CH₃-CH₂-CHO (3)A，B (4)A，D (5)E',
    explCn: 'C₃H₈O の鎖式化合物はアルコールかエーテル。Na と反応し水素を発生するのはアルコール（A,B）、しないのがエーテル（C）。アルコールの酸化生成物はアルデヒドかケトンで、銀鏡反応を示すのはアルデヒド（E=プロピオンアルデヒド CH₃-CH₂-CHO、B=1-プロパノール）。D はケトン（アセトン）、A は2-プロパノール CH₃-CH(OH)-CH₃。(3)脱水でプロペンになるのは第1級・第2級アルコールの A,B。(4)CH₃-CH(OH)- または CH₃-CO- 構造をもつ A（2-プロパノール）と D（アセトン）がヨードホルム反応を示す。(5)還元性を示すアルデヒド E がフェーリング液を還元して Cu₂O を析出。',
    issues: [],
  },
  {
    code: 'chem-che14-qB12', category: '基本問題', topic: T_FUNG, subtopics: S_OIL,
    optMode: 'multi', Q: '合成洗剤について正しいものをすべて選べ：(ア)主成分は強酸のナトリウム塩である (イ)陽イオンの構造の中に疎水性の炭化水素基と親水性のイオンの部分をもつ (ウ)硬水や海水中では泡立ちが悪い (エ)水の表面張力を小さくするので界面活性剤である。',
    answerVector: ['ア，エ'], N: 1,
    answerJp: 'ア，エ',
    explCn: '合成洗剤は強酸（硫酸系・スルホン酸系）と強塩基の塩で水溶液は中性（(ア)正）。陰イオン界面活性剤で、疎水性炭化水素基と親水性イオン部をもつ（(イ)は「陽イオン」が誤り）。Ca²⁺・Mg²⁺ 塩も水に溶けるので硬水・海水でも使える（(ウ)誤）。水の表面張力を小さくする界面活性剤である（(エ)正）。',
    issues: [],
  },
  {
    code: 'chem-che14-qB13', category: '基本問題', topic: T_FUNG, subtopics: S_CAC,
    optMode: 'multi', Q: '質量百分率 C 54.5%、H 9.1%、分子量 88.0 のエステルA。(1)加水分解で生じるカルボン酸が銀鏡反応を示すとき、考えられるAの構造異性体は何種類か。(2)加水分解で生じるアルコールの酸化生成物が銀鏡反応を示すとき、考えられるAの構造異性体は何種類か。',
    answerVector: ['2種類', '3種類'], N: 2,
    answerJp: '(1)2種類 (2)3種類',
    explCn: 'O は 36.4% より組成式は C₂H₄O（式量44）、分子量88 で n=2 → 分子式 C₄H₈O₂。エステル R-COO-R\' で R+R\'=C₃H₇（R\'=H は不適）。組合せ：①R=H,R\'=C₃H₇（nプロピル・イソプロピルの2種）②R=CH₃,R\'=C₂H₅（1種）③R=C₂H₅,R\'=CH₃（1種）。(1)銀鏡反応を示すカルボン酸はギ酸 H-COOH → ①の2種。(2)酸化生成物が銀鏡反応＝アルデヒドになる第1級アルコール（R\'=n-プロピル・エチル・メチルのうち酸化でアルデヒドに）→ ①の1種＋②＋③＝3種。',
    issues: [],
  },

  // ---- 応用例題 ----
  {
    code: 'chem-che14-qA1', category: '応用例題', topic: T_FUNG, subtopics: S_OIL,
    optMode: 'multi', Q: 'リノール酸 C₁₇H₃₁-COOH のみを構成脂肪酸とする油脂の (1)分子量 (2)けん化価 (3)ヨウ素価 を整数値で求めよ。',
    answerVector: ['878', '191', '174'], N: 3,
    answerJp: '(1)878 (2)191 (3)174',
    explCn: 'リノール酸(C₁₇H₃₁COOH、C=C2個)×3のトリグリセリドは C₅₇H₉₈O₆、分子量=12×57+98+96=878。(2)けん化価＝油脂1gに必要なKOH(mg)＝(1/878)×3×56×1000≈191。(3)ヨウ素価＝油脂100gに付加するI₂(g)。C=C6個で (100/878)×6×254≈173.5→174。',
    issues: [],
  },

  // ---- 応用問題 ----
  {
    code: 'chem-che14-qA2', category: '応用問題', topic: T_FUNG, subtopics: S_ALL3,
    optMode: 'multi', Q: 'エタノール関連の反応系統図（313）：(A)〜(O) の物質名と構造式（アセチレン→(C)、エチレン→(M)、酢酸→(G),(H),(I)、塩化ビニル→(O) など）。(2)(a)(M)→(D)、(b)(E)→(G) の変化名 (3)(A)〜(L)のうちエステルであるもの2つ (4)(F)と(O)に共通する官能基。',
    answerVector: ['ジエチルエーテル、CH₃-CH₂-O-CH₂-CH₃', 'ナトリウムエトキシド、CH₃-CH₂-ONa', 'アセチレン、CH≡CH', 'アセトアルデヒド、CH₃-CHO', '酢酸、CH₃-COOH', '酢酸ビニル、CH₂=CH-OCO-CH₃', '酢酸エチル、CH₃-COO-CH₂-CH₃', '無水酢酸、CH₃-CO-O-CO-CH₃', '酢酸カルシウム、(CH₃-COO)₂Ca', 'アセトン、CH₃-CO-CH₃', '2-プロパノール、CH₃-CH(OH)-CH₃', 'ヨードホルム、CHI₃', 'エチレン、CH₂=CH₂', '1,2-ジクロロエタン、CH₂Cl-CH₂Cl', '塩化ビニル、CH₂=CHCl', '酸化', 'エステル化', 'F，G', 'ビニル基'], N: 19,
    answerJp: '(1)(A)ジエチルエーテルCH₃-CH₂-O-CH₂-CH₃ (B)ナトリウムエトキシドCH₃-CH₂-ONa (C)アセチレンCH≡CH (D)アセトアルデヒドCH₃-CHO (E)酢酸CH₃-COOH (F)酢酸ビニルCH₂=CH-OCO-CH₃ (G)酢酸エチルCH₃-COO-CH₂-CH₃ (H)無水酢酸CH₃-CO-O-CO-CH₃ (I)酢酸カルシウム(CH₃-COO)₂Ca (J)アセトンCH₃-CO-CH₃ (K)2-プロパノールCH₃-CH(OH)-CH₃ (L)ヨードホルムCHI₃ (M)エチレンCH₂=CH₂ (N)1,2-ジクロロエタンCH₂Cl-CH₂Cl (O)塩化ビニルCH₂=CHCl (2)(a)酸化 (b)エステル化 (3)F，G (4)ビニル基',
    explCn: '(1)エタノール→(A)ジエチルエーテル（分子間脱水）、→(B)ナトリウムエトキシド（Na置換）、→(C)アセチレン（脱水/ハロゲン化処理後）、→(D)アセトアルデヒド（酸化）、→(E)酢酸（酸化）、→(F)酢酸ビニル、→(G)酢酸エチル（エステル化）、→(H)無水酢酸、→(I)酢酸カルシウム、→(J)アセトン、→(K)2-プロパノール、→(L)ヨードホルム、→(M)エチレン、→(N)1,2-ジクロロエタン、→(O)塩化ビニル（脱塩化水素）。(2)(a)2CH₂=CH₂+O₂→2CH₃-CHO（酸化）、(b)酢酸とエタノールから酢酸エチル（エステル化）。(3)エステルは(F)酢酸ビニルと(G)酢酸エチル。(4)CH₂=CH- はビニル基（付加重合する）。',
    issues: [],
  },
  {
    code: 'chem-che14-qA3', category: '応用問題', topic: T_FUNG, subtopics: S_AE,
    optMode: 'multi', Q: '分子式 C₄H₁₀O の異性体 A を酸化すると B（銀鏡反応を示す）。濃硫酸で加熱すると C が得られ、C+Br₂ で不斉炭素を含まない D。C に酸触媒で水付加すると A と異なる E。一方 C の異性体 F に Br₂ 付加すると不斉炭素1個の G。A〜G の構造式を記せ。',
    answerVector: ['(CH₃)₂CH-CH₂-OH', '(CH₃)₂CH-CHO', '(CH₃)₂C=CH₂', '(CH₃)₂C(Br)-CH₂Br', '(CH₃)₃C-OH', 'CH₃-CH₂-CH=CH₂', 'CH₃-CH₂-CH(Br)-CH₂Br'], N: 7,
    answerJp: 'A:2-メチル-1-プロパノール(CH₃)₂CH-CH₂-OH B:2-メチルプロパナール(CH₃)₂CH-CHO C:2-メチルプロペン(CH₃)₂C=CH₂ D:1,2-ジブロモ-2-メチルプロパン(CH₃)₂C(Br)-CH₂Br E:2-メチル-2-プロパノール(CH₃)₃C-OH F:1-ブテンCH₃-CH₂-CH=CH₂ G:1,2-ジブロモブタンCH₃-CH₂-CH(Br)-CH₂Br',
    explCn: 'A の酸化生成物 B が銀鏡反応を示すので A は第1級アルコール。A の脱水生成物 C が Br₂ 付加できるのでアルケン。A が (CH₃)₂CH-CH₂-OH のとき、脱水で (CH₃)₂C=CH₂（2-メチルプロペン）、+Br₂ で (CH₃)₂C(Br)-CH₂Br は不斉炭素なし（D）。n-ブタノールの場合は D に不斉炭素が残るので不適。C への水付加（マルコフニコフ則）で (CH₃)₃C-OH（E、Aと異なる）。C の異性体 F は 1-ブテン、+Br₂ で CH₃-CH₂-CH(Br)-CH₂Br（2個目のCが不斉炭素、G）。',
    issues: [],
  },
  {
    code: 'chem-che14-qA4', category: '応用問題', topic: T_FUNG, subtopics: S_AE,
    optMode: 'multi', Q: '分子式 C₄H₁₀O₂ の X は2価アルコール。X をニクロム酸カリウム希硫酸溶液で穏やかに酸化すると C₄H₈O₂ の Y が生じ、Y はフェーリング液を還元。Y をさらに酸化すると C₄H₈O₃ の Z が生じ、Z は NaHCO₃ 水溶液に発泡して溶解。X と Y の構造式を記せ。',
    answerVector: ['CH₃-C(CH₃)(OH)-CH₂-OH', 'CH₃-C(CH₃)(OH)-CHO'], N: 2,
    answerJp: 'X:CH₃-C(CH₃)(OH)-CH₂-OH（2-メチルプロパン-1,2-ジオール） Y:CH₃-C(CH₃)(OH)-CHO',
    explCn: 'Y がフェーリング液を還元するのでアルデヒド、したがって X は第1級アルコールを含む2価アルコール。Z が NaHCO₃ と気体（CO₂）を発生するのでカルボン酸。-CH₂OH が -CHO に酸化されても pH 原子の減少が2個なので、もう1つの -OH は酸化されない（第3級）。よって X=CH₃-C(CH₃)(OH)-CH₂-OH、Y=CH₃-C(CH₃)(OH)-CHO（第1級のみ酸化）。',
    issues: [],
  },
  {
    code: 'chem-che14-qA5', category: '応用問題', topic: T_FUNG, subtopics: S_AE_ADK,
    optMode: 'multi', Q: '分子式 C₄H₈O の化合物について正しい記述をすべて選べ：(ア)シス-トランス異性体をもつ化合物はない (イ)ケトンは1種類である (ウ)アルデヒドは2種類ある (エ)アルコールは3種類以上ある (オ)エーテルは3種類以上ある。',
    answerVector: ['イ，ウ，エ，オ'], N: 1,
    answerJp: 'イ，ウ，エ，オ',
    explCn: 'C₄H₈O は C₄H₁₀O（飽和）より H が2個少なく C=C をもてる。(ア)誤：CH₃-CH=CH-CH₂-OH などシス-トランスをもつ化合物がある。(イ)正：ケトンは2-ブタノンの1種。(ウ)正：1-ブタナールと2-メチルプロパナールの2種。(エ)正：C₄H₈O のアルコール（C=C/環含む）は3種以上。(オ)正：エーテル（C=C/環を含むもの）も3種以上存在。',
    issues: [],
  },
  {
    code: 'chem-che14-qA6', category: '応用問題', topic: T_FUNG, subtopics: S_CAC,
    optMode: 'multi', Q: '不飽和カルボン酸 56.0g に臭素を完全付加すると 152.0g。同じ 56.0g に水素を完全付加し飽和カルボン酸を得た。(1)得られた飽和カルボン酸の質量 [g] (2)消費された水素の標準状態での体積 [L]。',
    answerVector: ['57.2g', '13.4L'], N: 2,
    answerJp: '(1)57.2g (2)13.4L',
    explCn: '付加した Br₂（分子量160）は (152.0-56.0)/160=0.600mol。C=C への Br₂ と H₂ の付加は同物質量なので H₂ 0.600mol。体積=22.4×0.600=13.44→13.4L。飽和カルボン酸の質量=56.0+2.0×0.600=57.2g。',
    issues: [],
  },
  {
    code: 'chem-che14-qA7', category: '応用問題', topic: T_FUNG, subtopics: S_CAC,
    optMode: 'multi', Q: 'エステルA 2.60g を加水分解すると直鎖状モノカルボン酸B 1.76g と1価アルコールC 1.20g。C を穏やかに酸化した生成物はフェーリング液を還元せず、ヨードホルム反応を示した。A,B,C の構造式を記せ。',
    answerVector: ['CH₃-CH₂-CH₂-COO-CH(CH₃)-CH₃', 'CH₃-CH₂-CH₂-COOH', 'CH₃-CH(OH)-CH₃'], N: 3,
    answerJp: 'A:CH₃-CH₂-CH₂-COO-CH(CH₃)-CH₃（酪酸イソプロピル） B:CH₃-CH₂-CH₂-COOH（酪酸） C:CH₃-CH(OH)-CH₃（2-プロパノール）',
    explCn: '反応した H₂O は 2.60-(1.76+1.20)=0.36g=0.020mol。A,B,C の物質量は各0.020mol。B のモル質量=1.76/0.020=88 → C₃H₇-COOH（分子量88）で直鎖なので n-酪酸 CH₃-CH₂-CH₂-COOH。C のモル質量=1.20/0.020=60 → C₃H₇-OH。C の酸化生成物がフェーリング液を還元せずヨードホルム反応を示すのはアセトン → C は2-プロパノール CH₃-CH(OH)-CH₃。A=CH₃-CH₂-CH₂-COO-CH(CH₃)-CH₃。',
    issues: [],
  },
  {
    code: 'chem-che14-qA8', category: '応用問題', topic: T_FUNG, subtopics: S_OIL,
    optMode: 'multi', Q: '油脂（R,R\',R\'\'は炭化水素基）。鏡像異性体を含めると何種類の構造が考えられるか。(1)R,R\',R\'\'がすべて異なる (2)2つが同じ (3)構成脂肪酸がオレイン酸またはリノール酸のみである油脂。',
    answerVector: ['6種類', '3種類', '8種類'], N: 3,
    answerJp: '(1)6種類 (2)3種類 (3)8種類',
    explCn: 'グリセリンの中央 C が不斉炭素になりうる。(1)R,R\',R\'\'がすべて異なるとき、結合のしかたが3種×鏡像2=6種類。(2)2つが同じ（R=R\'\'）とき結合のしかた2種のうち一方（中央 C が不斉）のみ鏡像をもつ：1+2=3種類。(3)3つの脂肪酸がすべてオレイン酸またはすべてリノール酸＝各1種（計2種）。オレイン1・リノール2＝(2)より3種、オレイン2・リノール1＝3種。計 2+3+3=8種類。',
    issues: [],
  },
  {
    code: 'chem-che14-qA9', category: '応用問題', topic: T_FUNG, subtopics: S_OIL,
    optMode: 'multi', Q: '(1)1種類の脂肪酸からなる油脂1gをけん化するのに KOH 190mg が必要。この油脂の分子量を求めよ。(2)(1)の油脂100gにヨウ素86.2gが付加。構成脂肪酸1分子中の C=C の数は何個か。',
    answerVector: ['884', '1個'], N: 2,
    answerJp: '(1)884 (2)1個',
    explCn: '(1)けん化価 s=(1/M)×3×56×1000 → 190=(1/M)×168000 → M=884.2→884。(2)ヨウ素価 i=(100/M)×n×254 → 86.2=(100/884)×n×254 → n=3.00 個（油脂1分子）。構成脂肪酸は1種類×3分子なので 1分子あたり 3/3=1個。',
    issues: [],
  },
  {
    code: 'chem-che14-qA10', category: '応用問題', topic: T_FUNG, subtopics: S_OIL,
    optMode: 'multi', Q: 'パルミチン酸2分子とリノール酸1分子からなる油脂 A。(1)油脂A 100g に NaOH 水溶液を作用させてセッケンをつくると何g生じるか。(2)A 100g に水素を完全付加するのに必要な体積は 27℃・1.013×10⁵Pa で何Lか。',
    answerVector: ['103g', '5.93L'], N: 2,
    answerJp: '(1)103g (2)5.93L',
    explCn: '(1)A=C₃H₅(OCO-C₁₅H₃₁)₂(OCO-C₁₇H₃₁)、分子量830。セッケンは C₁₅H₃₁-COONa（式量278）×2 と C₁₇H₃₁-COONa（式量302）×1、合計858g/mol。100g なら 858×100/830=103.3→103g。(2)A 1mol にリノール酸（C=C2個）が1つ → H₂ 2mol 付加。100g=0.1205mol → H₂ 0.241mol。V=0.241×8.31×300/(1.013×10⁵)=5.93L（シャルルの法則から 22.4×(100/830)×2×300/273）。',
    issues: [],
  },
  {
    code: 'chem-che14-qA11', category: '応用問題', topic: T_FUNG, subtopics: S_AE,
    optMode: 'multi', Q: '分子式 C₅H₁₂O のアルコールで不斉炭素原子をもたない A を濃硫酸で加熱すると、シス-トランス異性体でない C₅H₁₀ の化合物 B と C が生じた。B,C に水付加するとどちらも A が主生成物。A,B,C の構造式を記せ。',
    answerVector: ['CH₃-C(CH₃)(OH)-CH₂-CH₃', 'CH₂=C(CH₃)-CH₂-CH₃', 'CH₃-C(CH₃)=CH-CH₃'], N: 3,
    answerJp: 'A:2-メチル-2-ブタノール CH₃-C(CH₃)(OH)-CH₂-CH₃ B:2-メチル-1-ブテン CH₂=C(CH₃)-CH₂-CH₃ C:2-メチル-2-ブテン CH₃-C(CH₃)=CH-CH₃',
    explCn: 'C₅H₁₂O のアルコール8種のうち不斉炭素をもたないものは①1-ペンタノール④3-メチル-1-ブタノール⑥2-メチル-2-ブタノール⑧2,2-ジメチル-1-プロパノール。脱水でアルケン2種を生じ（しかもシス-トランス異性体をもたない2種）、かつ水付加で1種のアルコール主生成となるのは⑥2-メチル-2-ブタノール。脱水で 2-メチル-1-ブテン(B)と2-メチル-2-ブテン(C)（どちらも C=C 末端/メチル置換でシス-トランスなし）。水付加（マルコフニコフ則）でどちらも 2-メチル-2-ブタノール（A）に戻る。',
    issues: [],
  },
  {
    code: 'chem-che14-qA12', category: '応用問題', topic: T_FUNG, subtopics: S_AE_CAC,
    optMode: 'multi', Q: '分子式 C₃H₆O₂ の化合物 A（水溶液は酸性）と、エステル結合をもつ B,C。(1)A,B,C,E,G の構造式。(2)A〜Fのうち酸化されるとアルデヒドになるもの2つ。(3)A〜Fのうちヨードホルム反応を示すもの1つ。',
    answerVector: ['CH₃-CH₂-COOH', 'CH₃-COO-CH₃', 'H-COO-CH₂-CH₃', 'CH₃-COOH', 'H-COOH', 'D，F', 'F'], N: 7,
    answerJp: '(1)A:CH₃-CH₂-COOH B:CH₃-COO-CH₃ C:H-COO-CH₂-CH₃ E:CH₃-COOH G:H-COOH (2)D，F (3)F',
    explCn: 'A の水溶液が酸性 → プロピオン酸 CH₃-CH₂-COOH。B,C はエステル：B=酢酸メチル（加水分解で CH₃-COOH(E)と CH₃-OH(D)）、C=ギ酸エチル（加水分解で H-COOH(G)と C₂H₅OH(F)）。銀鏡反応を示すのはギ酸(G)だけなので G がギ酸、C がギ酸エチル。(2)酸化でアルデヒドになるのは第1級アルコール D（メタノール）とF（エタノール）。(3)ヨードホルム反応を示すのは CH₃-CH(OH)- 構造をもつ F（エタノール）。',
    issues: [],
  },
  {
    code: 'chem-che14-qA13', category: '応用問題', topic: T_FUNG, subtopics: S_CAC,
    optMode: 'multi', Q: 'ヒドロキシ酸A：完全燃焼で CO₂ 17.6mg・H₂O 5.4mg、分子量150、メタノールとのエステル化で B(89mg)、B と無水酢酸で C(131mg)、A には不斉炭素あり。(1)Aの分子式 (2)カルボキシ基・ヒドロキシ基はそれぞれいくつか (3)Aの構造式（不斉炭素に*）。',
    answerVector: ['C₄H₆O₆', 'カルボキシ基2個', 'ヒドロキシ基2個', 'HOOC-CH(OH)-CH(OH)-COOH'], N: 4,
    answerJp: '(1)C₄H₆O₆ (2)カルボキシ基2個、ヒドロキシ基2個 (3)HOOC-C*H(OH)-C*H(OH)-COOH（酒石酸）',
    explCn: '(1)C:4.8mg(17.6×12/44)、H:0.60mg(5.4×2/18)、O:15.0-5.4=9.6mg → モル比 C:H:O=2:3:3、組成式 C₂H₃O₃(式量75)、分子量150=75×2 → C₄H₆O₆。(2)メタノールとのエステル化で -COOH→-COOCH₃（+14/mol）なので 150+14x=178 → x=2（カルボキシ基2個）。無水酢酸で -OH→-OCOCH₃（+42/mol）なので 178+42y=262 → y=2（ヒドロキシ基2個）。(3)不斉炭素をもち -COOH と -OH が別々の C に結合 → 酒石酸 HOOC-CH(OH)-CH(OH)-COOH（中央2個の C が不斉炭素）。',
    issues: [],
  },
  {
    code: 'chem-che14-qA14', category: '応用問題', topic: T_FUNG, subtopics: S_AE_CAC,
    optMode: 'multi', Q: 'C₈H₁₆O₂ の異性体 A,B を加水分解すると酸とアルコールに分かれ、A₂,B₂ は異性体で酸化で互いの酸に変わる。C,D はほかのアルコールで、C の脱水はアルケン混合物、D は1種類（A₂ の脱水でも得られる）。(1)アルコールの分子式 (2)C の脱水で得られるアルケンの異性体数 (3)D（=A₂）から得られるアルケンの構造式 (4)酸A₁ の構造式。',
    answerVector: ['C₄H₁₀O', '3種類', 'CH₃-C(CH₃)=CH₂', 'CH₃-CH₂-CH₂-COOH'], N: 4,
    answerJp: '(1)C₄H₁₀O (2)3種類 (3)CH₃-C(CH₃)=CH₂（2-メチルプロペン） (4)CH₃-CH₂-CH₂-COOH（n-酪酸）',
    explCn: '(1)A₂ 酸化→B₁、B₂ 酸化→A₁ より A₁,A₂,B₁,B₂ はすべて C4。アルコールは C₄H₁₀O。(2)A₂,B₂ 以外のアルコール C,D は 2-ブタノールまたは2-メチル-1-プロパノール・1-ブタノールのいずれかだが、D の脱水が1種類のアルケン（A₂ の脱水でも得られる）から D=2-メチル-1-プロパノール。C の脱水は 1-ブテン＋cis/trans-2-ブテンの3種類。(3)(CH₃)₂C=CH₂（2-メチルプロペン）。(4)A₂ の酸化で A₁ が生じ、A₂=2-メチル-1-プロパノールを酸化すると 2-メチルプロパナール（アルデヒド）だが、さらに酸化でカルボン酸、(4)の要求は「酸A₁」＝A の加水分解の酸で直鎖 n-酪酸 CH₃-CH₂-CH₂-COOH（A₂=n-ブタノール、B₁=2-メチルプロパナール…の組）より。',
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
  console.log('che14 drafts:', d.length);
  const s = new Map();
  d.forEach((x) => s.set(x.generationStatus, (s.get(x.generationStatus) || 0) + 1));
  console.log('status:', Object.fromEntries(s));
}