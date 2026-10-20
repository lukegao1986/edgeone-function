#!/usr/bin/env node
/**
 * che10_pilot_content.cjs — che10（第10章 金属元素（Ⅰ）典型元素：1族・2族・13族・14族）内容定义
 *
 * 源：che10_题目.md + che10_解析.md（仅此两文件，其余为过程文件）
 * 考纲：ejuSyllabus.ts
 *  - 1族（アルカリ金属）→ chem_3_1_1_01；2族（アルカリ土類金属,Mg/Ca/Ba/Sr）→ chem_3_1_1_02
 *  - 13族（Al）→ chem_3_1_1_03；14族（Sn/Pb）→ chem_3_1_1_04
 *  - ソルベー法（炭酸ナトリウム工業製法）→ chem_3_1_3_01
 *
 * 变通：作图题（图特征）与记述题（参考答案要点作选项）已并入选项/槽位。
 */
'use strict';

const T_1GR = 'chem_3_1_1';                     // 典型元素（各族）
const T_1_2 = 'chem_3_1_1';                     // 1・2族
const T_AL = 'chem_3_1_1';                      // 13族
const T_SN = 'chem_3_1_1';                      // 14族
const T_IND = 'chem_3_1_3';                     // 工業的製法
const S_1 = ['chem_3_1_1_01'];
const S_2 = ['chem_3_1_1_02'];
const S_3 = ['chem_3_1_1_03'];
const S_4 = ['chem_3_1_1_04'];
const S_1_2 = ['chem_3_1_1_01', 'chem_3_1_1_02'];
const S_1_2_3 = ['chem_3_1_1_01', 'chem_3_1_1_02', 'chem_3_1_1_03'];
const S_1_2_4 = ['chem_3_1_1_01', 'chem_3_1_1_02', 'chem_3_1_1_04'];
const S_3_4 = ['chem_3_1_1_03', 'chem_3_1_1_04'];
const S_1_2_3_4 = ['chem_3_1_1_01', 'chem_3_1_1_02', 'chem_3_1_1_03', 'chem_3_1_1_04'];
const S_IND = ['chem_3_1_3_01'];

const CONTENT = [
  // ---- 基礎 CHECK ----
  {
    code: 'chem-che10-qC1', category: '基礎 CHECK', topic: T_1GR, subtopics: S_1_2_3,
    optMode: 'multi', Q: 'Al、Ba、Ca、K、Mg、Na 中：(1)碱金属 (2)易成 2 价阳离子 (3)单质显示两性 的元素各是哪些？',
    answerVector: ['K、Na', 'Ba、Ca、Mg', 'Al'], N: 3,
    answerJp: '(1)K、Na (2)Ba、Ca、Mg (3)Al',
    explCn: 'K/Na 为 1 族碱金属（1 价阳离子）；Ba/Ca/Mg 为 2 族（2 价阳离子）；单质呈两性的是 Al（与酸碱均反应）。',
    issues: [],
  },
  {
    code: 'chem-che10-qC2', category: '基礎 CHECK', topic: T_1GR, subtopics: S_1_2,
    optMode: 'multi', Q: '焰色反应颜色：Li、Na、K、Ca、Sr、Ba 分别是什么色？',
    answerVector: ['赤', '黄', '赤紫', '橙赤', '紅', '黄緑'], N: 6,
    answerJp: 'Li:赤 Na:黄 K:赤紫 Ca:橙赤 Sr:紅 Ba:黄緑',
    explCn: '焰色反应是元素特有识别法：Li 赤、Na 黄、K 赤紫（透过钴玻璃看）、Ca 橙赤、Sr 红、Ba 黄绿。',
    issues: [],
  },
  {
    code: 'chem-che10-qC3', category: '基礎 CHECK', topic: T_1GR, subtopics: S_1_2,
    optMode: 'multi', Q: '(1)NaOH 固体放置于空气中吸潮表面溶解 (2)碳酸钠水合物结晶在空气中失去结晶水而粉末化，各称什么现象？',
    answerVector: ['潮解', '風解'], N: 2,
    answerJp: '(1)潮解 (2)風解',
    explCn: '潮解=固体吸水溶解（NaOH、CaCl₂ 等）；风解=结晶水合物失去结晶水而崩解（Na₂CO₃·10H₂O、芒硝等）。',
    issues: [],
  },

  // ---- 基本例題 ----
  {
    code: 'chem-che10-qE1', category: '基本例題', topic: T_1GR, subtopics: S_1_2,
    optMode: 'multi', Q: '①碱金属 ②Ca、Ba ③Mg 各符合哪些描述（ア~ク）？',
    answerVector: ['ア、ウ、オ、カ、キ', 'イ、ウ、オ、カ、キ、ク', 'イ、キ'], N: 3,
    answerJp: '①ア、ウ、オ、カ、キ ②イ、ウ、オ、カ、キ、ク ③イ、キ',
    explCn: '碱金属成 1 价阳离子、常温与水反应、焰色、氢氧化物强碱溶性、氧化物与盐酸反应；Ca/Ba 还有硫酸盐碳酸盐难溶；Mg 常温不与水反应、无焰色、氢氧化物难溶、硫酸盐可溶。',
    issues: [],
  },
  {
    code: 'chem-che10-qE2', category: '基本例題', topic: T_AL, subtopics: S_3,
    optMode: 'multi', Q: '填空/化学式：Al 属(a)族，与盐酸反应放 H₂ 成[b]；[b]加氨水沉淀[c]；[c]加盐酸成[d]；[c]加 NaOH 成[e]；[c]这类两性氢氧化物称(f)。',
    answerVector: ['13', 'AlCl₃', 'Al(OH)₃', 'AlCl₃', 'Na[Al(OH)₄]', '両性水酸化物'], N: 6,
    answerJp: '(a)13 (b)AlCl₃ (c)Al(OH)₃ (d)AlCl₃ (e)Na[Al(OH)₄] (f)両性水酸化物',
    explCn: 'Al 是 3 周期 13 族元素，2Al＋6HCl→2AlCl₃＋3H₂；Al³⁺＋3OH⁻→Al(OH)₃↓；Al(OH)₃ 溶于盐酸与强碱（两性），与 NaOH 生成 Na[Al(OH)₄]。',
    issues: [],
  },

  // ---- 基本問題 ----
  {
    code: 'chem-che10-qB1', category: '基本問題', topic: T_1_2, subtopics: S_1,
    optMode: 'multi', Q: '填空：碱金属属(a)族，价电子(b)个，电离能(c)，易成(d)价(e)离子。单质(f)色金属，熔点(g)，密度(h)。常温与水反应放(i)成(j)。化合物多(k)色、一般溶于水为(l)。',
    answerVector: ['1', '1', '小さ', '1', '陽', '銀白（銀）', '低', '小さ', '水素', '水酸化物', '白（無）', 'やす'], N: 12,
    answerJp: '(a)1 (b)1 (c)小さ (d)1 (e)陽 (f)銀白（銀） (g)低 (h)小さ (i)水素 (j)水酸化物 (k)白（無） (l)やす',
    explCn: '碱金属 1 族、价电子 1 个，金属键弱→熔点低、密度小、质软；与水反应生成 MOH 与 H₂；热分解生成碳酸盐等白色。',
    issues: [],
  },
  {
    code: 'chem-che10-qB2', category: '基本問題', topic: T_1_2, subtopics: S_1_2,
    optMode: 'multi', Q: '周期表局部（Li/Be,Na/Mg,K/Ca 等）：(1)(a)元素群称？(2)(b)与(c)合称？(3)焰色反应元素群？(4)同周期(a)与(c)哪个金属性强？(5)①(a)与(c)共同性质 ②Mg 与(c)共同性质（ア~カ选）',
    answerVector: ['アルカリ金属元素', 'アルカリ土類金属元素', 'a、c', 'a', 'イ、ウ、エ', 'ア、エ、カ'], N: 6,
    answerJp: '(1)アルカリ金属元素 (2)アルカリ土類金属元素 (3)a、c (4)a (5)①イ、ウ、エ ②ア、エ、カ',
    explCn: '1 族除 H 为碱金属，2 族全为碱土金属。K、Ca 有焰色（Mg 无）。同周期原子序数小者金属性强：K>Ca。碱金属与 Ca 均氢氧化物溶、单质与水反应、氧化物与水成氢氧化物；Mg 与 Ca 均 2 价阳离子、氧化物成氢氧化物、碳酸盐难溶（Mg 与 Ca 的不同处：氢氧化物难溶、硫酸盐可溶）。',
    issues: [],
  },
  {
    code: 'chem-che10-qB3', category: '基本問題', topic: T_IND, subtopics: S_IND,
    optMode: 'multi', Q: '填空（ソルベー法）：①NaCl 饱和溶液吸收(a)后通(b)，溶解度较小的(c)沉淀，同时生成 NH₄Cl；②(c)加热得 Na₂CO₃，放出的(b)回收再用；③CaCO₃ 热分解得(b)与(d)；④(d)与水反应成(e)；⑤(e)与 NH₄Cl 反应得(f)与(a)。此制法的名称是(g)。',
    answerVector: ['アンモニア', '二酸化炭素', '炭酸水素ナトリウム', '酸化カルシウム', '水酸化カルシウム', '塩化カルシウム', 'アンモニアソーダ法（ソルベー法）'], N: 7,
    answerJp: '(a)アンモニア (b)二酸化炭素 (c)炭酸水素ナトリウム (d)酸化カルシウム (e)水酸化カルシウム (f)塩化カルシウム (g)アンモニアソーダ法（ソルベー法）',
    explCn: '氨碱法（Solvay）：NaCl＋NH₃＋CO₂＋H₂O→NaHCO₃↓＋NH₄Cl；NaHCO₃ 热分解→Na₂CO₃；CaCO₃→CaO＋CO₂；CaO→Ca(OH)₂ 与 NH₄Cl 再生 NH₃。NH₃ 与 CO₂ 循环利用。',
    issues: [],
  },
  {
    code: 'chem-che10-qB5', category: '基本問題', topic: T_1_2, subtopics: S_2,
    optMode: 'multi', Q: '钙及化合物 A~D：(1)A~D 的化学式（A Ca(OH)₂、B CaCO₃、C Ca(HCO₃)₂、D CaO）。(2)反应(a)~(e)的化学方程式。',
    answerVector: ['Ca(OH)₂', 'CaCO₃', 'Ca(HCO₃)₂', 'CaO', 'Ca＋2H₂O→Ca(OH)₂＋H₂', 'Ca(OH)₂＋CO₂→CaCO₃＋H₂O', 'CaCO₃＋CO₂＋H₂O→Ca(HCO₃)₂', 'CaCO₃→CaO＋CO₂', 'CaO＋H₂O→Ca(OH)₂'], N: 9,
    answerJp: '(1)A Ca(OH)₂ B CaCO₃ C Ca(HCO₃)₂ D CaO (2)(a)Ca＋2H₂O→Ca(OH)₂＋H₂ (b)Ca(OH)₂＋CO₂→CaCO₃＋H₂O (c)CaCO₃＋CO₂＋H₂O→Ca(HCO₃)₂ (d)CaCO₃→CaO＋CO₂ (e)CaO＋H₂O→Ca(OH)₂',
    explCn: 'Ca 常温与水反应；石灰水通 CO₂ 白浊成 CaCO₃，过量再溶成 Ca(HCO₃)₂（钟乳石原理）；CaCO₃ 热分解得生石灰 CaO（消石灰 Ca(OH)₂）。',
    issues: [],
  },
  {
    code: 'chem-che10-qB4', category: '基本問題', topic: T_AL, subtopics: S_3,
    optMode: 'multi', Q: '(1)填空：Al 属第(a)周期(b)族，易成(c)价(d)离子；单质与酸碱均反应，是(e)金属；离子化倾向(f)故不能水溶液电解；工业上从(g)矿制(h)，溶于(i)的熔融液电解。(2)此操作名称。(3)叙述 Al 不溶于浓硝酸的理由。',
    answerVector: ['3', '13', '3', '陽', '両性', '大き', 'ボーキサイト', '酸化アルミニウム（アルミナ）', '氷晶石', '溶融塩電解（融解塩電解）', '表面がち密な酸化被膜におおわれて反応が進まなくなるから'], N: 11,
    answerJp: '(1)(a)3 (b)13 (c)3 (d)陽 (e)両性 (f)大き (g)ボーキサイト (h)酸化アルミニウム（アルミナ） (i)氷晶石 (2)溶融塩電解（融解塩電解） (3)表面がち密な酸化被膜におおわれて反応が進まなくなるから',
    explCn: 'Al 为第 3 周期 13 族，3 价阳离子，两性金属。离子化倾向大→用熔融盐电解（霍尔-埃鲁法）：Al₂O₃ 溶于熔融冰晶石 Na₃AlF₆ 降低熔点后电解。浓硝酸中表面致密氧化膜（钝态）阻碍反应。',
    issues: [],
  },
  {
    code: 'chem-che10-qB6', category: '基本問題', topic: T_SN, subtopics: S_4,
    optMode: 'multi', Q: '填空+说明：Sn、Pb 属(a)族，价电子(b)个，氧化数(c)、(d)的化合物。Sn 空气中(d)氧化数化合物稳定，故 SnCl₂ 有(e)作用。Sn 用于(f)（青铜等），Pb 用于(g)电池。单质均为(h)金属。说明：铅难溶于盐酸、常温硫酸的理由。',
    answerVector: ['14', '4', '+2', '+4', '還元', '合金', '鉛蓄', '両性', '鉛の表面が，水に溶けにくい塩化鉛(Ⅱ)や硫酸鉛(Ⅱ)におおわれて，反応が進まなくなるから'], N: 9,
    answerJp: '(a)14 (b)4 (c)+2 (d)+4 (e)還元 (f)合金 (g)鉛蓄 (h)両性 下線：鉛の表面が，水に溶けにくい塩化鉛(Ⅱ)や硫酸鉛(Ⅱ)におおわれて，反応が進まなくなるから',
    explCn: 'Sn/Pb 为 14 族、价电子 4，化合物氧化数 +2/+4。Sn(Ⅱ) 是还原剂（Sn²⁺→Sn⁴⁺）；Sn 用于青铜合金、Pb 用于铅蓄电池；均为两性金属。Pb 与盐酸/H₂SO₄ 生成难溶 PbCl₂/PbSO₄ 覆盖表面使反应停止。',
    issues: [],
  },

  // ---- 応用例題 ----
  {
    code: 'chem-che10-qA1', category: '応用例題', topic: T_1GR, subtopics: S_1_2_3,
    optMode: 'multi', Q: 'A~D 是 Na₂CO₃、CaCO₃、MgSO₄、Al(OH)₃。(1)A~D 溶于水的：B、C，不溶的：A、D。(2)B 的溶液才有焰色反应。(3)A 与盐酸反应放气。求 A~D。',
    answerVector: ['CaCO₃', 'Na₂CO₃', 'MgSO₄', 'Al(OH)₃'], N: 4,
    answerJp: 'A CaCO₃ B Na₂CO₃ C MgSO₄ D Al(OH)₃',
    explCn: '碱金属碳酸盐可溶（B=Na₂CO₃ 且有焰色）；碱土碳酸盐难溶（A=CaCO₃，与盐酸放 CO₂）；Al(OH)₃ 不溶且不与盐酸放气（D），C=MgSO₄。',
    issues: [],
  },

  // ---- 応用問題 ----
  {
    code: 'chem-che10-qA2', category: '応用問題', topic: T_1GR, subtopics: S_1_2_3,
    optMode: 'multi', Q: 'Na 的化合物转化 A~D（NaCl、NaOH、Na₂CO₃、NaHCO₃ 中一种）。(1)写反应(a)~(d)的化学方程式（(a)除去食盐水中的 NaHCO₃ →(b)电解 NaCl 水溶液 →(c)NaOH 吸收 CO₂ →(d)Na₂CO₃ 与盐酸）。(2)A 的分类与溶液酸碱性。',
    answerVector: ['NaHCO₃＋HCl→NaCl＋H₂O＋CO₂', '2NaCl＋2H₂O→2NaOH＋H₂＋Cl₂', '2NaOH＋CO₂→Na₂CO₃＋H₂O', 'Na₂CO₃＋2HCl→2NaCl＋H₂O＋CO₂', '酸性塩', '弱塩基性'], N: 6,
    answerJp: '(1)(a)NaHCO₃＋HCl→NaCl＋H₂O＋CO₂ (b)2NaCl＋2H₂O→2NaOH＋H₂＋Cl₂ (c)2NaOH＋CO₂→Na₂CO₃＋H₂O (d)Na₂CO₃＋2HCl→2NaCl＋H₂O＋CO₂ (2)酸性塩、弱塩基性',
    explCn: 'NaHCO₃ 是弱酸 H₂CO₃ 的含 H 盐=酸性盐；因强碱弱酸盐，HCO₃⁻ 水解使溶液呈弱碱性。NaCl 水溶液电解阳离子交换膜法得 NaOH＋Cl₂＋H₂。',
    issues: [],
  },
  {
    code: 'chem-che10-qA3', category: '応用問題', topic: T_AL, subtopics: S_3,
    optMode: 'multi', Q: '铝热反应：(1)(ア)(イ)填词。(2)Al＋Fe₂O₃ 反应式。(3)可替代 Al 的金属（Ag Au Cu Mg Pb）及其理由（25 字）。(4)Al 与 NaOH 水溶液反应式。',
    answerVector: ['テルミット', '両性', '2Al＋Fe₂O₃→Al₂O₃＋2Fe', 'Mg', 'イオン化傾向が大きく，単体に強い還元力があるから', '2Al＋2NaOH＋6H₂O→2Na[Al(OH)₄]＋3H₂'], N: 6,
    answerJp: '(1)(ア)テルミット (イ)両性 (2)2Al＋Fe₂O₃→Al₂O₃＋2Fe (3)Mg；イオン化傾向が大きく，単体に強い還元力があるから (4)2Al＋2NaOH＋6H₂O→2Na[Al(OH)₄]＋3H₂',
    explCn: '铝热反应放大量热还原 Fe₂O₃。可选 Mg（比 Fe 离子化倾向大、还原力强）。Al 是两性金属，与强碱反应生成 [Al(OH)₄]⁻ 并放 H₂。',
    issues: [],
  },
  {
    code: 'chem-che10-qA4', category: '応用問題', topic: T_1GR, subtopics: S_1_2_3_4,
    optMode: 'multi', Q: 'A~D 水溶液含 Mg²⁺、Ca²⁺、Pb²⁺、Al³⁺ 之一：(1)加 NaOH 均生沉淀。(2)过量 NaOH：A、B 的沉淀消失。(3)加盐酸：A 生沉淀。(4)C 橙赤色焰色。求 A~D 离子。',
    answerVector: ['Pb²⁺', 'Al³⁺', 'Ca²⁺', 'Mg²⁺'], N: 4,
    answerJp: 'A:Pb²⁺ B:Al³⁺ C:Ca²⁺ D:Mg²⁺',
    explCn: '溶于过量 NaOH 者两性氢氧化物：Pb(OH)₂ 与 Al(OH)₃（A、B）。Pb²⁺ 与 Cl⁻ 生成 PbCl₂ 白色沉淀（A）。Ca²⁺ 橙赤焰色（C），剩 D=Mg²⁺。',
    issues: [],
  },
  {
    code: 'chem-che10-qA5', category: '応用問題', topic: T_1GR, subtopics: S_1_2_3,
    optMode: 'multi', Q: 'A~F 水溶液分别为 H₂SO₄、HCl、Al(NO₃)₃、NaHCO₃、NaOH、CaCl₂ 之一：(a)A 与 B、B 与 D 混合均产生相同气体。(b)E 与 F 混合生白沉淀，多量 F 则沉淀溶解。(c)A 与 C 混合生白沉淀。求 A~F。',
    answerVector: ['H₂SO₄', 'NaHCO₃', 'CaCl₂', 'HCl', 'Al(NO₃)₃', 'NaOH'], N: 6,
    answerJp: 'A:H₂SO₄ B:NaHCO₃ C:CaCl₂ D:HCl E:Al(NO₃)₃ F:NaOH',
    explCn: '(a)NaHCO₃ 与强酸 H₂SO₄/HCl 均放 CO₂，故 A=H₂SO₄、D=HCl、B=NaHCO₃。(b)Al(NO₃)₃＋NaOH→Al(OH)₃↓，过量溶解为[Al(OH)₄]⁻，故 E=Al(NO₃)₃、F=NaOH。(c)剩 C=CaCl₂（与 H₂SO₄ 生 CaSO₄ 沉淀）。',
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
  console.log('che10 drafts:', d.length);
  const s = new Map();
  d.forEach((x) => s.set(x.generationStatus, (s.get(x.generationStatus) || 0) + 1));
  console.log('status:', Object.fromEntries(s));
  const nat = d.filter((x) => x.options.length > 0 && x.correctIndex !== null);
  console.log('有选项+答案的题:', nat.map((x) => `${x.businessCode}(idx=${x.correctIndex})`).join(', '));
}