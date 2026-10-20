#!/usr/bin/env node
/**
 * che8 Step6 试点内容定义
 *
 * 数据源唯一为基础题块 che8 blocks（来源 SHA-256 与 che1~che7 同一 lock 文件）。
 * 每题定义：答案(源自 che8_解析.md)、选项(语义成立、正确唯一)、中文解析、考点、状态。
 * 策略沿用 che1~che7：作图/记述题 → 语言描述图特征 / 参考答案要点作选项；多空题 → D1 组合。
 *
 * che8 整章 = 第8章 化学平衡と電離平衡 → 化学平衡 chem_2_3_4_02 + 電離平衡 chem_2_3_5
 *  - 化学平衡（平衡定数・平衡移動・ルシャトリエ・圧平衡定数）：chem_2_3_4_02
 *  - 電離平衡（酸塩基の強弱・水のイオン積pH・塩の加水分解・緩衝液）：chem_2_3_5 之 _01/_02/_03
 *  - 溶解度積・沈殿の生成：化学平衡の応用 → chem_2_3_4_02（平衡定数応用）
 */
const path = require('path');

const CANDIDATE = '/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/Chem/_meta/chem_question_blocks_candidate_2026-10-12_v2.json';
const blocksPayload = require(CANDIDATE);
const blocks = blocksPayload.blocks.filter((b) => b.unitCode === 'che8');
const byCode = new Map(blocks.map((b) => [b.businessCode, b]));

const T_BAL = 'chem_2_3_4';        // 化学平衡トピック
const S_BAL = ['chem_2_3_4_02'];   // 化学平衡
const T_ION = 'chem_2_3_5';        // 電離平衡トピック
const S_STRONG = ['chem_2_3_5_01']; // 酸・塩基の強弱と電離平衡
const S_PH = ['chem_2_3_5_02'];    // 水のイオン積とpH
const S_SALT = ['chem_2_3_5_03'];  // 塩の加水分解と緩衝液

const CONTENT = [
  // ---- 基礎 CHECK ----
  {
    code: 'chem-che8-qC1', category: '基礎 CHECK', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: '化学反应式中，(1)从左到右的反应 (2)从右到左的反应分别称为什么？',
    answerVector: ['正反応', '逆反応'], N: 2,
    answerJp: '(1)正反応 (2)逆反応',
    explCn: '可逆反应中，方程式中正向箭头方向（左→右）的反应称正反应，逆向（右→左）称逆反应。',
    issues: [],
  },
  {
    code: 'chem-che8-qC2', category: '基礎 CHECK', topic: T_BAL, subtopics: S_BAL,
    optMode: 'simple', Q: '可逆反应中，正反应速率与逆反应速率相等（宏观上似乎停止）的状态称为什么？',
    options: ['化学平衡（の状態）', '反応が完全に止まった状態', '正反応だけが進行する状態', '逆反応だけが進行する状態'], correctIndex: 0,
    answerJp: '化学平衡（の状態）',
    explCn: '正逆反应速率相等、浓度不再随时间变化，称为化学平衡状态（动态平衡，并非反应停止）。',
    issues: [],
  },
  {
    code: 'chem-che8-qC3', category: '基礎 CHECK', topic: T_BAL, subtopics: S_BAL,
    optMode: 'simple', Q: '写反应 H₂＋I₂⇌2HI 的平衡常数 K 的表达式。',
    options: ['K=[HI]²/([H₂][I₂])', 'K=[H₂][I₂]/[HI]²', 'K=[HI]/([H₂][I₂])', 'K=2[HI]/([H₂][I₂])'], correctIndex: 0,
    answerJp: 'K=[HI]²/([H₂][I₂])',
    explCn: '平衡常数＝生成物浓度系数次幂之积/反应物浓度系数次幂之积，HI 系数 2 故为 [HI]²。',
    issues: [],
  },
  {
    code: 'chem-che8-qC4', category: '基礎 CHECK', topic: T_BAL, subtopics: S_BAL,
    optMode: 'simple', Q: '3 的反应平衡时 [H₂]=[I₂]=0.10 mol/L、[HI]=0.70 mol/L，平衡常数是多少？',
    options: ['49', '7.0', '0.020', '0.14'], correctIndex: 0,
    answerJp: '49',
    explCn: 'K=0.70²/(0.10×0.10)=0.49/0.01=49（无单位）。',
    issues: [],
  },
  {
    code: 'chem-che8-qC5', category: '基礎 CHECK', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: 'N₂＋3H₂⇌2NH₃（ΔH=－92kJ）平衡时，改变条件平衡如何移动（左/右）？(1)升温 (2)加压 (3)移走 NH₃',
    answerVector: ['左', '右', '右'], N: 3,
    answerJp: '(1)左 (2)右 (3)右',
    explCn: '(1)放热反应升温→向吸热方向（左）移动。(2)加压→向气体分子数减少方向（2mol<4mol，右）移动。(3)移走产物→向右补充方向移动。',
    issues: [],
  },
  {
    code: 'chem-che8-qC6', category: '基礎 CHECK', topic: T_ION, subtopics: S_PH,
    optMode: 'multi', Q: '写出水离子积 Kw 的表达式及 25℃ 时的值。',
    answerVector: ['Kw=[H⁺][OH⁻]', '1.0×10⁻¹⁴ mol²/L²'], N: 2,
    answerJp: 'Kw=[H⁺][OH⁻]＝1.0×10⁻¹⁴ mol²/L²',
    explCn: '水离子积为 [H⁺] 与 [OH⁻] 之积，25℃ 时为 1.0×10⁻¹⁴，随温度升高而增大。',
    issues: [],
  },
  {
    code: 'chem-che8-qC7', category: '基礎 CHECK', topic: T_ION, subtopics: S_STRONG,
    optMode: 'multi', Q: '温度不变，将醋酸水溶液浓度变小时，(1)电离度 (2)电离常数分别如何变化？',
    answerVector: ['大きくなる', '変わらない'], N: 2,
    answerJp: '(1)大きくなる (2)変わらない',
    explCn: '弱酸溶液稀释时电离度增大（稀释促进电离）；电离常数只与温度有关，浓度改变不影响。',
    issues: [],
  },
  {
    code: 'chem-che8-qC8', category: '基礎 CHECK', topic: T_ION, subtopics: S_SALT,
    optMode: 'simple', Q: '盐的水溶液中，弱酸的阴离子或弱碱的阳离子与水反应生成原来的弱酸或弱碱的变化称为什么？',
    options: ['塩の加水分解', '塩の電離', '中和', '酸化還元'], correctIndex: 0,
    answerJp: '塩の加水分解',
    explCn: '弱酸/弱碱生成的盐溶于水，离子与水反应生成弱酸或弱碱并产生 H⁺ 或 OH⁻，称为盐的水解。',
    issues: [],
  },
  {
    code: 'chem-che8-qC9', category: '基礎 CHECK', topic: T_ION, subtopics: S_SALT,
    optMode: 'simple', Q: '加入少量酸或碱时 pH 几乎不变的溶液称为什么？',
    options: ['緩衝液', '酸性溶液', '塩基性溶液', '飽和溶液'], correctIndex: 0,
    answerJp: '緩衝液',
    explCn: '弱酸与其盐（或弱碱与其盐）的混合溶液对少量酸/碱具有缓冲作用，pH 几乎不变，称缓冲液。',
    issues: [],
  },

  // ---- 基本例題 ----
  {
    code: 'chem-che8-qE4', category: '基本例題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'simple', Q: 'H₂(气)＋I₂(气)⇌2HI(气) 在某温度下 K=49。0.90 mol H₂ 与 0.90 mol I₂ 反应，生成的 HI 为多少 mol？',
    options: ['1.4 mol', '0.90 mol', '0.60 mol', '1.8 mol'], correctIndex: 0,
    answerJp: '1.4 mol',
    explCn: '设生成 x mol HI，平衡时 H₂=I₂=(0.90－x/2) mol。K=(x)²/(0.90－x/2)²=49 → x/(0.90－x/2)=7 → x=1.4 mol。',
    issues: [],
  },
  {
    code: 'chem-che8-qE1', category: '基本例題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: '下列反应平衡时，条件改变使平衡如何移动（(ア)右 (イ)左 (ウ)不变）？(1)NH₃＋H₂O⇌NH₄⁺＋OH⁻（加 NaOH）(2)2SO₂＋O₂⇌2SO₃（加压）(3)H₂＋I₂⇌2HI（减压）(4)3O₂⇌2O₃ ΔH=285kJ（冷却）(5)CO＋2H₂⇌CH₃OH（加催化剂）',
    answerVector: ['イ', 'ア', 'ウ', 'イ', 'ウ'], N: 5,
    answerJp: '(1)イ (2)ア (3)ウ (4)イ (5)ウ',
    explCn: '(1)加 NaOH→OH⁻ 增→左移。(2)加压→分子数减少方向（3→2，右移）。(3)减压但 gas 分子数不变→不动。(4)吸热反应冷却→向放热方向（左）移动。(5)催化剂不影响平衡移动。',
    issues: [],
  },
  {
    code: 'chem-che8-qE2', category: '基本例題', topic: T_ION, subtopics: S_PH,
    optMode: 'simple', Q: '25℃ 时 Kw=1.0×10⁻¹⁴ mol²/L²。0.020 mol/L NaOH 水溶液的 [H⁺] 为多少 mol/L？（强酸强碱电离度 1.0）',
    options: ['5.0×10⁻¹³ mol/L', '5.0×10⁻¹² mol/L', '2.0×10⁻¹² mol/L', '5.0×10⁻¹⁴ mol/L'], correctIndex: 0,
    answerJp: '5.0×10⁻¹³ mol/L',
    explCn: '[OH⁻]=0.020，[H⁺]=Kw/[OH⁻]=1.0×10⁻¹⁴/0.020=5.0×10⁻¹³ mol/L。',
    issues: [],
  },
  {
    code: 'chem-che8-qE3', category: '基本例題', topic: T_ION, subtopics: S_STRONG,
    optMode: 'multi', Q: '填空：c mol/L 醋酸电离度 α，Ka=(a)(用 c、α)；α≪1 时近似 (b)；α=(c)、[H⁺]=(d)（用 Ka、c）。Ka=2.8×10⁻⁵，0.10 mol/L 时 α=(e)、[H⁺]=(f)、pH=(g)。√2.8=1.7，log₁₀1.7=0.23。',
    answerVector: ['Ka=cα²/(1－α)', 'Ka≈cα²', '√(Ka/c)', '√(cKa)', '1.7×10⁻²', '1.7×10⁻³ mol/L', '2.8'], N: 7,
    answerJp: '(a)Ka=cα²/(1－α) (b)Ka≈cα² (c)α=√(Ka/c) (d)[H⁺]=√(cKa) (e)1.7×10⁻² (f)1.7×10⁻³ mol/L (g)2.8',
    explCn: 'Ka=[H⁺][CH₃COO⁻]/[CH₃COOH]=cα²/(1－α)；α≪1 时 Ka≈cα²。α=√(2.8×10⁻⁵/0.10)=1.7×10⁻²，[H⁺]=0.10×1.7×10⁻²=1.7×10⁻³，pH=3－0.23=2.77≈2.8。',
    issues: [],
  },

  // ---- 基本問題 ----
  {
    code: 'chem-che8-qB1', category: '基本問題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: '填空：H₂ 与 I₂ 加热生成 HI。正反应速度 v 初始最(a)，随时间 (b)；逆反应速度 v\' 初始最(c)，随时间 (d)。充分时间后正逆速度(e)，即 v=(f)，呈现(g)的状態。该状態下 K=(h)=一定，K 称(i)，此关系称(j)的法则。',
    answerVector: ['大き', '小さ', '小さ', '大き', '同じ', 'v\u0027', '化学平衡', '[HI]²/([H₂][I₂])', '平衡定数', '質量作用の法則'], N: 10,
    answerJp: '(a)大き (b)小さ (c)小さ (d)大き (e)同じ (f)v\' (g)化学平衡 (h)[HI]²/([H₂][I₂]) (i)平衡定数 (j)質量作用の法則',
    explCn: '初始反应物浓度大→正反应快；随反应进行正反应变慢、逆反应加快，最终 v=v\' 达化学平衡。K=[HI]²/([H₂][I₂]) 称平衡常数，该式关系称质量作用定律。',
    issues: [],
  },
  {
    code: 'chem-che8-qB2', category: '基本問題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: 'H₂1.75mol、I₂1.50mol 加热达平衡，H₂ 减至 0.50mol。(1)从反应速度角度约 40 字说明平衡状态。(2)平衡时 I₂、HI 各多少 mol？(3)写 K 的表达式并求值（带单位）。(4)温度、压力不变时加入 H₂，K 值如何变化？',
    answerVector: ['正反応と逆反応の速度が等しくなり，反応が止まったように見える状態', '0.25 mol', '2.50 mol', 'K=[HI]²/([H₂][I₂])＝50（単位なし）', '変わらない'], N: 5,
    answerJp: '(1)正反応と逆反応の速度が等しくなり，反応が止まったように見える状態 (2)I₂ 0.25 mol、HI 2.50 mol (3)K=[HI]²/([H₂][I₂])＝50（単位なし） (4)変わらない',
    explCn: '(2)反应消耗 H₂1.25mol，同时消耗 I₂1.25mol→I₂ 剩 0.25mol，生成 HI2.50mol。(3)K=2.50²/(0.50×0.25)=50。(4)K 只与温度有关，加 H₂ 不改变 K（平衡右移但 K 不变）。',
    issues: [],
  },
  {
    code: 'chem-che8-qB3', category: '基本問題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: 'CO₂3.00mol 与 H₂1.50mol 高温平衡生成 CO 与水蒸气，K=0.100。CO 与水蒸气各多少 mol？（小数第 2 位）',
    answerVector: ['0.50 mol', '0.50 mol'], N: 2,
    answerJp: 'CO 0.50 mol、水（水蒸気）0.50 mol',
    explCn: 'CO₂＋H₂⇌CO＋H₂O，设生成 x mol：K=x²/((3.00－x)(1.50－x))=0.100，解得 x=0.50 mol。',
    issues: [],
  },
  {
    code: 'chem-che8-qB4', category: '基本問題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: '(1)CH₃COOH 与 C₂H₅OH 各 3.0mol，生成 CH₃COOC₂H₅ 与 H₂O 各 2.0mol 时平衡，求 K。(2)该平衡溶液再加入醋酸 1.0mol、醋酸乙酯 1.0mol，平衡向哪边移动？',
    answerVector: ['4.0', '右へ（酢酸エチル生成の方向）'], N: 2,
    answerJp: '(1)4.0 (2)右へ（酢酸エチル生成の方向）',
    explCn: '(1)平衡时各 1.0、1.0、2.0、2.0 mol：K=(2.0×2.0)/(1.0×1.0)=4.0。(2)加后 Q=(3.0×2.0)/(2.0×1.0)=3.0<K→向右（生成酯的方向）移动。',
    issues: [],
  },
  {
    code: 'chem-che8-qB5', category: '基本問題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: 'N₂O₄⇌2NO₂。容器保持 1.0×10⁵ Pa，40% 的 N₂O₄ 反应达平衡。(1)求 N₂O₄、NO₂ 的分压。(2)求 Kp。',
    answerVector: ['4.3×10⁴ Pa', '5.7×10⁴ Pa', '7.6×10⁴ Pa'], N: 3,
    answerJp: '(1)N₂O₄ 4.3×10⁴ Pa、NO₂ 5.7×10⁴ Pa (2)Kp=7.6×10⁴ Pa',
    explCn: '设初始 1mol，解離 0.4：平衡时 0.6、0.8 mol，总 1.4mol。分压=全压×摩尔分数：N₂O₄=1.0×10⁵×0.6/1.4=4.3×10⁴，NO₂=1.0×10⁵×0.8/1.4=5.7×10⁴。Kp=(5.7×10⁴)²/(4.3×10⁴)=7.6×10⁴ Pa。',
    issues: [],
  },
  {
    code: 'chem-che8-qB6', category: '基本問題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: '下列平衡条件改变时向哪边移动？(1)N₂O₄⇌2NO₂ ΔH=57kJ（加热）(2)CO＋H₂O⇌CO₂＋H₂（加压）(3)NaCl(固)＋aq⇌Na⁺＋Cl⁻（通 HCl）(4)N₂＋3H₂⇌2NH₃（全压恒定加 Ar）(5)N₂＋3H₂⇌2NH₃（体积恒定加 Ar）(6)C(固)＋H₂O⇌CO＋H₂（加压）',
    answerVector: ['右', '移動しない', '左', '左', '移動しない', '左'], N: 6,
    answerJp: '(1)右 (2)移動しない (3)左 (4)左 (5)移動しない (6)左',
    explCn: '(1)吸热反应加热→右。平衡常数为气体分子数：H₂O(气)→CO＋H₂ 为 1→2，加压向左。',
    issues: [],
  },
  {
    code: 'chem-che8-qB8', category: '基本問題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'simple', Q: 'aA(气)＋bB(气)⇌cC(气) ΔH=Q。加热与加压均使平衡时 C 的浓度增大的是哪项？',
    options: ['(エ) a＋b>c，Q>0', '(ア) a＋b<c，Q>0', '(イ) a＋b<c，Q<0', '(ウ) a＋b=c，Q<0'], correctIndex: 0,
    answerJp: '(エ) a＋b>c，Q>0',
    explCn: '升温使 C 增→吸热 Q>0；加压使 C 增→气体分子数减小方向即 c<a＋b（a＋b>c）。两者同时满足为(エ)。',
    issues: [],
  },
  {
    code: 'chem-che8-qB9', category: '基本問題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: '哈伯法 N₂＋3H₂⇌2NH₃ ΔH=－92kJ。(1)4×10⁷Pa、低于 500℃ 时生成率-时间曲线为图中哪条？(2)4×10⁷Pa、500℃ 加催化剂时为哪条？(3)哈伯法催化剂主成分的化学式？',
    answerVector: ['工', 'ア', 'Fe₃O₄（またはFe）'], N: 3,
    answerJp: '(1)工 (2)ア (3)Fe₃O₄（またはFe）',
    explCn: '(1)低温达平衡慢但(放热)生成率高→曲线终值最高、到达慢，为(工)。(2)触媒只加快速度、生成率不变→(ア)。(3)主成分为四氧化三铁（Fe₃O₄，还原后含 Fe）。',
    issues: [],
  },
  {
    code: 'chem-che8-qB10', category: '基本問題', topic: T_ION, subtopics: S_PH,
    optMode: 'multi', Q: '求 25℃ 下列溶液的 pH（小数第 1 位）：(1)0.0050 mol/L 盐酸 (2)0.10 mol/L 醋酸（电离度 0.016）(3)0.050 mol/L NaOH (4)0.30 mol/L 盐酸 1.0L 与 0.20 mol/L NaOH 1.0L 的混合液',
    answerVector: ['2.3', '2.8', '12.7', '1.3'], N: 4,
    answerJp: '(1)2.3 (2)2.8 (3)12.7 (4)1.3',
    explCn: '(1)pH=3－log5=2.3。(2)[H⁺]=0.10×0.016=1.6×10⁻³→pH=3－log1.6=2.8。(3)pOH=2－log5=1.3→pH=12.7。(4)剩余 H⁺0.10mol/2L=0.05→pH=2－log5=1.3。',
    issues: [],
  },
  {
    code: 'chem-che8-qB11', category: '基本問題', topic: T_ION, subtopics: S_PH,
    optMode: 'multi', Q: '25℃ 下水的电离 H₂O⇌H⁺＋OH⁻。(1)写 [H⁺] 与 [OH⁻] 的关系式。(2)[H⁺]=0.010 mol/L 时 [OH⁻]？(3)0.010 mol/L Ca(OH)₂ 中的 [H⁺]？(4)纯水（密度 1.0g/cm³）的电离度？(5)加酸后水的电离度如何变化？',
    answerVector: ['[H⁺][OH⁻]=1.0×10⁻¹⁴', '1.0×10⁻¹² mol/L', '5.0×10⁻¹³ mol/L', '1.8×10⁻⁹', '小さくなる'], N: 5,
    answerJp: '(1)[H⁺][OH⁻]=1.0×10⁻¹⁴ (2)1.0×10⁻¹² mol/L (3)5.0×10⁻¹³ mol/L (4)1.8×10⁻⁹ (5)小さくなる',
    explCn: '(2)[OH⁻]=1.0×10⁻¹⁴/0.010=1.0×10⁻¹²。(3)[OH⁻]=0.020→[H⁺]=5.0×10⁻¹³。(4)α=1.0×10⁻⁷/(1000/18)=1.8×10⁻⁹。(5)同离子效应使水的电离平衡向左、电离度减小。',
    issues: [],
  },
  {
    code: 'chem-che8-qB12', category: '基本問題', topic: T_ION, subtopics: S_PH,
    optMode: 'multi', Q: '求 25℃ 下列碱性溶液 pH：(1)0.010 mol/L NaOH (2)0.050 mol/L Ba(OH)₂ (3)0.050 mol/L 氨水（电离度 0.020）',
    answerVector: ['12', '13', '11'], N: 3,
    answerJp: '(1)12 (2)13 (3)11',
    explCn: '(1)pOH=2→pH=12。(2)[OH⁻]=0.10→pOH=1→pH=13。(3)[OH⁻]=0.050×0.020=1.0×10⁻³→pOH=3→pH=11。',
    issues: [],
  },
  {
    code: 'chem-che8-qB13', category: '基本問題', topic: T_ION, subtopics: S_PH,
    optMode: 'simple', Q: '某酸雨 pH=3.7，若酸性成分全为硝酸，相当于多少 mol/L 的硝酸？（10^0.3=2.0）',
    options: ['2.0×10⁻⁴ mol/L', '2.0×10⁻³ mol/L', '5.0×10⁻⁴ mol/L', '3.7×10⁻³ mol/L'], correctIndex: 0,
    answerJp: '2.0×10⁻⁴ mol/L',
    explCn: '[H⁺]=10⁻³·⁷=10⁻⁴×10⁰·³=2.0×10⁻⁴ mol/L，一元强酸浓度即 [H⁺]。',
    issues: [],
  },
  {
    code: 'chem-che8-qB14', category: '基本問題', topic: T_ION, subtopics: S_PH,
    optMode: 'multi', Q: '求 25℃ 下列 pH：(1)pH=1.0 盐酸 1.0L 与 pH=3.0 盐酸 1.0L 混合（第 1 位）(2)pH=11.0 的 NaOH 稀释 100 倍（第 1 位）(3)pH=5.0 盐酸稀释 1000 倍（整数）。log₁₀5.05=0.70。',
    answerVector: ['1.3', '9.0', '約7'], N: 3,
    answerJp: '(1)1.3 (2)9.0 (3)約7',
    explCn: '(1)总 H⁺=(0.10+0.001)mol/2L=0.0505→pH=2－log5.05=1.3。(2)[OH⁻]=10⁻³→10⁻⁵→pH=9。(3)稀释后接近纯水，pH 趋近 7 但不大于等于 7，为约 7。',
    issues: [],
  },
  {
    code: 'chem-che8-qB15', category: '基本問題', topic: T_ION, subtopics: S_STRONG,
    optMode: 'multi', Q: '1.0 mol/L 醋酸电离度 5.3×10⁻³。(1)醋酸分子、醋酸根、氢离子浓度各多少 mol/L？(2)pH（第 1 位）(3)写 Ka 的表达式(4)用 Ka、c 表示 α≪1 时 α 与 [H⁺] 的近似式，并求 Ka。(5)0.20 mol/L 时 α、[H⁺]、pH。log₁₀5.3=0.72，√1.4=1.2，√5.6=2.4。',
    answerVector: ['0.99 mol/L', '5.3×10⁻³ mol/L', '5.3×10⁻³ mol/L', '2.3', 'Ka=[CH₃COO⁻][H⁺]/[CH₃COOH]', 'α=√(Ka/c)', '[H⁺]=√(cKa)', 'Ka=2.8×10⁻⁵ mol/L', '1.2×10⁻²', '2.4×10⁻³ mol/L', '2.6'], N: 11,
    answerJp: '(1)0.99 mol/L、5.3×10⁻³ mol/L、5.3×10⁻³ mol/L (2)2.3 (3)Ka=[CH₃COO⁻][H⁺]/[CH₃COOH] (4)α=√(Ka/c)、[H⁺]=√(cKa)、Ka=2.8×10⁻⁵ (5)1.2×10⁻²、2.4×10⁻³ mol/L、2.6',
    explCn: '(1)[CH₃COOH]=1.0×(1－5.3×10⁻³)≈0.99，[CH₃COO⁻]=[H⁺]=5.3×10⁻³。(2)pH=3－log5.3=2.3。(4)Ka=1.0×(5.3×10⁻³)²=2.8×10⁻⁵。(5)α=√(2.8×10⁻⁵/0.20)=1.2×10⁻²，[H⁺]=√(0.20×2.8×10⁻⁵)=2.4×10⁻³，pH=3－log2.4=2.6。',
    issues: [],
  },
  {
    code: 'chem-che8-qB16', category: '基本問題', topic: T_ION, subtopics: S_STRONG,
    optMode: 'multi', Q: '25℃ 氨水的电离常数 2.3×10⁻⁵ mol/L。(1)写 Kb 的表达式。(2)用 Kb、c 表示 α≪1 时 α 与 [OH⁻] 的近似式。(3)0.10 mol/L 时 α、[OH⁻]？(√2.3=1.5)(4)pH（第 1 位）。',
    answerVector: ['Kb=[NH₄⁺][OH⁻]/[NH₃]', 'α=√(Kb/c)', '[OH⁻]=√(cKb)', '1.5×10⁻²', '1.5×10⁻³ mol/L', '11.2'], N: 6,
    answerJp: '(1)Kb=[NH₄⁺][OH⁻]/[NH₃] (2)α=√(Kb/c)、[OH⁻]=√(cKb) (3)1.5×10⁻²、1.5×10⁻³ mol/L (4)11.2',
    explCn: 'α=√(2.3×10⁻⁵/0.10)=1.5×10⁻²，[OH⁻]=0.10×1.5×10⁻²=1.5×10⁻³，pOH=3－log1.5=2.82→pH≈11.2。',
    issues: [],
  },
  {
    code: 'chem-che8-qB17', category: '基本問題', topic: T_ION, subtopics: S_STRONG,
    optMode: 'multi', Q: '甲酸 HCOOH⇌HCOO⁻＋H⁺，25℃ pH=3.0 的甲酸 20.0 mL 中和需 0.010 mol/L NaOH 9.0 mL。求(1)甲酸浓度 (2)电离度 (3)电离常数。',
    answerVector: ['4.5×10⁻³ mol/L', '0.22', '2.9×10⁻⁴ mol/L'], N: 3,
    answerJp: '(1)4.5×10⁻³ mol/L (2)0.22 (3)2.9×10⁻⁴ mol/L',
    explCn: '(1)c×20.0=0.010×9.0→c=4.5×10⁻³。(2)α=[H⁺]/c=1.0×10⁻³/4.5×10⁻³=0.22。(3)[HCOOH]≈c(1－α)=3.5×10⁻³，Ka=(1.0×10⁻³)²/3.5×10⁻³=2.9×10⁻⁴。',
    issues: [],
  },
  {
    code: 'chem-che8-qB18', category: '基本問題', topic: T_ION, subtopics: S_SALT,
    optMode: 'multi', Q: '(NH₄)₂CO₃ 水溶液加 A 产生气体 B（通入石灰水变白浊）；别份加 C 产生刺激性气体 D（湿红石蕊应变蓝）。(1)选 A、C 的溶质（(ア)NaCl (イ)H₂SO₄ (ウ)K₂SO₄ (エ)NaOH）。(2)B、D 分别是什么（名称+化学式）？(3)(NH₄)₂CO₃ 水溶液加石灰水时生成 D，写化学方程式。',
    answerVector: ['イ', 'エ', '二酸化炭素 CO₂', 'アンモニア NH₃', '(NH₄)₂CO₃＋Ca(OH)₂→CaCO₃＋2NH₃＋2H₂O'], N: 5,
    answerJp: '(1)A：イ（H₂SO₄）、C：エ（NaOH） (2)B：二酸化炭素、CO₂ D：アンモニア、NH₃ (3)(NH₄)₂CO₃＋Ca(OH)₂→CaCO₃＋2NH₃＋2H₂O',
    explCn: '(NH₄)₂CO₃ 是弱酸弱碱盐：加强酸→游离弱酸（CO₂，使石灰水白浊）；加强碱→游离弱碱（NH₃，使红石蕊变蓝）。加 Ca(OH)₂ 也游离 NH₃。',
    issues: [],
  },
  {
    code: 'chem-che8-qB19', category: '基本問題', topic: T_ION, subtopics: S_SALT,
    optMode: 'multi', Q: '填空：等浓度醋酸与 NaOH 等量混合得 CH₃COONa 水溶液，该溶液呈(a)性、pH 比 7(b)。因溶液中(c)的一部分与水反应产生(d)。此类反应称盐的(e)。',
    answerVector: ['塩基', '大き', '酢酸イオン', '水酸化物イオン', '加水分解'], N: 5,
    answerJp: '(a)塩基 (b)大きい (c)酢酸イオン (d)水酸化物イオン (e)加水分解',
    explCn: 'CH₃COO⁻＋H₂O⇌CH₃COOH＋OH⁻：弱酸根水解产生 OH⁻→溶液显碱性、pH>7，该反应称盐的水解。',
    issues: [],
  },
  {
    code: 'chem-che8-qB20', category: '基本問題', topic: T_ION, subtopics: S_SALT,
    optMode: 'multi', Q: '下列盐的水溶液呈酸性/中性/碱性？(1)CaCl₂ (2)(NH₄)₂SO₄ (3)NaHCO₃ (4)KNO₃ (5)CH₃COONa (6)NaHSO₄',
    answerVector: ['中性', '酸性', '塩基性', '中性', '塩基性', '酸性'], N: 6,
    answerJp: '(1)中性 (2)酸性 (3)塩基性 (4)中性 (5)塩基性 (6)酸性',
    explCn: '强酸强碱正盐不水解→中性；弱碱盐(NH₄⁺)水解→酸性；弱酸盐(HCO₃⁻、CH₃COO⁻)水解→碱性；酸性盐 NaHSO₄ 电离出 H⁺→酸性。',
    issues: [],
  },
  {
    code: 'chem-che8-qB21', category: '基本問題', topic: T_ION, subtopics: S_SALT,
    optMode: 'multi', Q: '填空：CH₃COOH 与 CH₃COONa 混合溶液，加少量酸则发生[a]反应，加少量碱则发生[b]反应，[H⁺] 几乎不变，此类溶液称(c)。',
    answerVector: ['CH₃COO⁻＋H⁺→CH₃COOH', 'CH₃COOH＋OH⁻→CH₃COO⁻＋H₂O', '緩衝液'], N: 3,
    answerJp: '[a]CH₃COO⁻＋H⁺→CH₃COOH [b]CH₃COOH＋OH⁻→CH₃COO⁻＋H₂O (c)緩衝液',
    explCn: '加酸时醋酸根结合 H⁺、加碱时醋酸提供 H⁺，c(CH₃COO⁻)/c(CH₃COOH) 几乎不变→[H⁺] 不变，此即缓冲作用。',
    issues: [],
  },
  {
    code: 'chem-che8-qB22', category: '基本問題', topic: T_ION, subtopics: S_SALT,
    optMode: 'simple', Q: '下列等物质的量配成的溶液中，能成缓冲液的有？（多选）',
    options: ['ア，エ，オ', 'ア，イ，ウ', 'イ，ウ，エ', 'ア，ウ，オ'], correctIndex: 0,
    answerJp: 'ア，エ，オ',
    explCn: '缓冲液=弱酸与其盐、或弱碱与其盐的组合：(ア)CH₃COOH/CH₃COONa、(エ)NH₃/NH₄Cl、(オ)CO₂水溶液/NaHCO₃ 均满足。',
    issues: [],
  },
  {
    code: 'chem-che8-qB7', category: '基本問題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: 'AgCl 在 25℃ 水 1L 中溶 1.9mg。(a)饱和溶液中 [Ag⁺]？(b)AgCl 的溶解度积？(c)1.0×10⁻³ mol/L AgNO₃ 100mL 中加入 NaCl，沉淀生成需加多少 mg 以上？(2)Ag₂CrO₄（式量332）1L 溶 3.32×10⁻²g，求其溶解度积。',
    answerVector: ['1.3×10⁻⁵ mol/L', '1.7×10⁻¹⁰ mol²/L²', '1.0×10⁻³ mg', '4.00×10⁻¹² mol³/L³'], N: 4,
    answerJp: '(a)1.3×10⁻⁵ mol/L (b)1.7×10⁻¹⁰ mol²/L² (c)1.0×10⁻³ mg (2)4.00×10⁻¹² mol³/L³',
    explCn: '(a)1.9×10⁻³/143.5=1.3×10⁻⁵。(b)Ksp=1.3×10⁻⁵×1.3×10⁻⁵=1.7×10⁻¹⁰。(c)[Cl⁻]>1.74×10⁻⁷→100mL 需 NaCl 1.0×10⁻³mg。(2)溶度积 Ksp=[Ag⁺]²[CrO₄²⁻]=(2.00×10⁻⁴)²×1.00×10⁻⁴=4.00×10⁻¹²。',
    issues: [],
  },

  // ---- 応用例題 ----
  {
    code: 'chem-che8-qA1', category: '応用例題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: '容積 V L 容器中 C₂H₆ a mol 在 T K 分解达平衡，H₂ 为 x mol。填空：(ア)C₂H₆ 的物质量 (イ)C₂H₄ 的物质量 (ウ)Kc (エ)(オ)(カ)各 gas 的分压（pV=nRT 用 R）(キ)Kp (ク)Kp 与 Kc 的关系式。',
    answerVector: ['a－x', 'x', 'x²/((a－x)V)', '(a－x)RT/V', 'xRT/V', 'xRT/V', 'x²RT/((a－x)V)', 'RT'], N: 8,
    answerJp: '(ア)a－x (イ)x (ウ)Kc=x²/((a－x)V) (エ)(a－x)RT/V (オ)xRT/V (カ)xRT/V (キ)Kp=x²RT/((a－x)V) (ク)RT',
    explCn: 'C₂H₆⇌C₂H₄＋H₂。Kc=x²/((a－x)V)；分压=浓度×RT；Kp=(xRT/V)²/((a－x)RT/V)=x²RT/((a－x)V)=Kc×RT。',
    issues: [],
  },
  {
    code: 'chem-che8-qA2', category: '応用例題', topic: T_ION, subtopics: S_SALT,
    optMode: 'multi', Q: '1.0L 中含醋酸 0.25mol、醋酸钠 0.070mol 的缓冲液，Ka=2.8×10⁻⁵ mol/L。求 [H⁺] 与 pH。',
    answerVector: ['1.0×10⁻⁴ mol/L', '4.0'], N: 2,
    answerJp: '[H⁺]=1.0×10⁻⁴ mol/L、pH=4.0',
    explCn: '[CH₃COOH]≈0.25、[CH₃COO⁻]≈0.070：Ka=0.070×[H⁺]/0.25=2.8×10⁻⁵→[H⁺]=1.0×10⁻⁴，pH=4.0。',
    issues: [],
  },

  // ---- 応用問題 ----
  {
    code: 'chem-che8-qA4', category: '応用問題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'simple', Q: '40% 醋酸水溶液 300g 与乙醇 46g 反应，K=4.0 时平衡生成多少 g 醋酸乙酯？（√97=9.8，有效数字 2 位）',
    options: ['35 g', '28 g', '40 g', '44 g'], correctIndex: 0,
    answerJp: '35 g',
    explCn: '反应前：醋酸 2.0、乙醇 1.0、水 10 mol。设生成 x：K=x(10＋x)/((2.0－x)(1.0－x))=4.0→3x²－22x＋8=0→x=0.40mol。质量=88×0.40=35.2≈35g。',
    issues: [],
  },
  {
    code: 'chem-che8-qA3', category: '応用問題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: 'HI 在 448℃ 时 22% 解离达平衡。(1)求该反应 2HI⇌H₂＋I₂ 的平衡常数。(2)1.0mol H₂ 与 2.0mol I₂ 混合达平衡时 HI 为多少 mol？（√1.64=1.28）',
    answerVector: ['0.020', '1.9 mol'], N: 2,
    answerJp: '(1)0.020 (2)1.9 mol',
    explCn: '(1)K=(0.11n/V)²/(0.78n/V)²=0.020。(2)知正反应 K=1/0.020=50，x²=50(1.0－x/2)(2.0－x/2)→x=1.9mol。',
    issues: [],
  },
  {
    code: 'chem-che8-qA5', category: '応用問題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: 'N₂O₄ 0.90mol 置入 8.0L 容器 27℃ 达平衡，总物质量 1.00mol。(1)求平衡常数 Kc。(2)求 Kp。',
    answerVector: ['6.3×10⁻³ mol/L', '1.6×10⁴ Pa'], N: 2,
    answerJp: '(1)6.3×10⁻³ mol/L (2)1.6×10⁴ Pa',
    explCn: '解离 x=0.10：平衡 0.80、0.20mol→[N₂O₄]=0.10、[NO₂]=0.025。Kc=0.025²/0.10=6.3×10⁻³。Kp=KcRT=6.3×10⁻³×8.3×10³×300=1.6×10⁴ Pa。',
    issues: [],
  },
  {
    code: 'chem-che8-qA6', category: '応用問題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: 'C₂H₄ 1.0mol 与 H₂ 1.0mol 混合，C₂H₄＋H₂⇌C₂H₆ 平衡时全压 1.0×10⁵Pa、各 gas 摩尔分数均 1/3。(1)求 Kp。(2)2.0mol C₂H₄ 与 1.0mol H₂ 同温平衡、C₂H₆ 摩尔分数 1/3 时全压为多少 Pa？',
    answerVector: ['3.0×10⁻⁵ /Pa', '1.8×10⁵ Pa'], N: 2,
    answerJp: '(1)3.0×10⁻⁵ /Pa (2)1.8×10⁵ Pa',
    explCn: '(1)分压均 1/3×10⁵：Kp=(1/3×10⁵)/((1/3×10⁵)²)=27/(5×10⁵)=3.0×10⁻⁵。(2)x=0.75mol：摩尔分数 C₂H₆=1/3，Kp 不变→P=1.8×10⁵ Pa。',
    issues: [],
  },
  {
    code: 'chem-che8-qA7', category: '応用問題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: '727℃ 时 C(石墨)＋CO₂⇌2CO 平衡，CO₂ 分压 1.1×10⁶ Pa、CO 分压 2.0×10⁵ Pa。(1)求 Kp。(2)求 Kc。',
    answerVector: ['3.6×10⁴ Pa', '4.4×10⁻³ mol/L'], N: 2,
    answerJp: '(1)3.6×10⁴ Pa (2)4.4×10⁻³ mol/L',
    explCn: '(1)Kp=(2.0×10⁵)²/(1.1×10⁶)=3.6×10⁴ Pa。(2)Kc=Kp/RT=3.6×10⁴/(8.3×10³×1000)=4.4×10⁻³ mol/L。',
    issues: [],
  },
  {
    code: 'chem-che8-qA8', category: '応用問題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: '选择图形（T₁<T₂）：(1)2SO₂＋O₂⇌2SO₃ ΔH=－198kJ (2)N₂＋O₂⇌2NO ΔH=181kJ (3)H₂＋I₂⇌2HI ΔH=－10kJ (4)C(固)＋CO₂⇌2CO ΔH=172kJ。各选哪个图？',
    answerVector: ['ア', '力', '才', 'エ'], N: 4,
    answerJp: '(1)ア (2)力 (3)才 (4)エ',
    explCn: '(1)放热、分子数减少：低温高压生成率高。(2)吸热、分子数不变：高温高，压力无关。(3)放热、分子数不变。(4)吸热、C 为固体系数不计，分子数增加：高温高压。',
    issues: [],
  },
  {
    code: 'chem-che8-qA9', category: '応用問題', topic: T_ION, subtopics: S_PH,
    optMode: 'simple', Q: '0.010 mol/L NaOH 100.0mL 用 0.10 mol/L 盐酸滴定，滴下量 9.9mL→10.1mL 间 pH 变化量为多少（整数）？（log₁₀1.1=0.04）',
    options: ['6', '5', '4', '7'], correctIndex: 0,
    answerJp: '6',
    explCn: '9.9mL 时过量 OH⁻1.1×10⁻⁴→pH=10－log1.1=9.96；10.1mL 时过量 H⁺→pH=4.04。变化量 9.96－4.04≈6。',
    issues: [],
  },
  {
    code: 'chem-che8-qA10', category: '応用問題', topic: T_ION, subtopics: S_PH,
    optMode: 'multi', Q: '水的电离 H₂O⇌H⁺＋OH⁻。(1)Kw 随温度如何变化？(2)60℃ 时 Kw=1.0×10⁻¹³，水的 pH？（第 1 位）(3)25℃ 时 [OH⁻]:[H⁺]=400:1 的溶液 pH？（第 1 位）(4)25℃ pH=4.0 盐酸稀释 10000 倍后 pH？（第 2 位，log₁₀1.05=0.02）',
    answerVector: ['温度が高いと大きくなる', '6.5', '5.7', '6.98'], N: 4,
    answerJp: '(1)温度が高いと大きくなる (2)6.5 (3)5.7 (4)6.98',
    explCn: '(1)水的电离吸热，升温 Kw 增大。(2)[H⁺]=√(1.0×10⁻¹³)=10⁻⁶·⁵→pH=6.5。(3)[H⁺]=√(1.0×10⁻¹⁴/400)=2.0×10⁻⁶→pH=6－log2=5.7。(4)稀释后盐酸[H⁺]=10⁻⁸ 与水电离合计 1.05×10⁻⁷→pH=6.98。',
    issues: [],
  },
  {
    code: 'chem-che8-qA11', category: '応用問題', topic: T_ION, subtopics: S_STRONG,
    optMode: 'multi', Q: '多价酸分步电离。(1)(a)写磷酸三阶段电离的离子方程式。(b)用 [H⁺] 等表示 K₁。(c)pH=7.2 时 [H₂PO₄⁻]=[HPO₄²⁻]，求 K₂（10^0.8=6.3）。(2)(a)硫酸二段电离常数 K₂ 的表达式。(b)0.10 mol/L 硫酸 pH（第 2 位，√14=3.74，log₁₀1.148=0.06）。',
    answerVector: ['H₃PO₄⇌H⁺＋H₂PO₄⁻；H₂PO₄⁻⇌H⁺＋HPO₄²⁻；HPO₄²⁻⇌H⁺＋PO₄³⁻', 'K1=[H⁺][H₂PO₄⁻]/[H₃PO₄]', '6.3×10⁻⁸ mol/L', 'K2=[H⁺][SO₄²⁻]/[HSO₄⁻]', '0.94'], N: 5,
    answerJp: '(1)(a)三式 (b)K1=[H⁺][H₂PO₄⁻]/[H₃PO₄] (c)6.3×10⁻⁸ mol/L (2)(a)K2=[H⁺][SO₄²⁻]/[HSO₄⁻] (b)0.94',
    explCn: '(1c)[H₂PO₄⁻]=[HPO₄²⁻] 时 K₂=[H⁺]=10⁻⁷·²=6.3×10⁻⁸。(2b)0.10mol/L 硫酸：二段电离度 α=0.148，[H⁺]=0.10(1＋0.148)=0.1148→pH=1－log1.148=0.94。',
    issues: [],
  },
  {
    code: 'chem-che8-qA12', category: '応用問題', topic: T_ION, subtopics: S_PH,
    optMode: 'multi', Q: 'CO₂ 在 10℃、1.01×10⁵Pa 下 1L 水溶 0.054mol。含 CO₂ 体积 0.037% 的空气平衡接触时，(a)溶入 1L 水的 CO₂ 为多少 mol？(b)碳酸一段电离常数 3.4×10⁻⁷、α≪1，求 [H⁺]？(c)pH？（√6.8=2.6，log₁₀2.6=0.41）',
    answerVector: ['2.0×10⁻⁵ mol', '2.6×10⁻⁶ mol/L', '5.6'], N: 3,
    answerJp: '(a)2.0×10⁻⁵ mol (b)2.6×10⁻⁶ mol/L (c)5.6',
    explCn: '(a)0.054×0.037/100=2.0×10⁻⁵。(b)[H⁺]=√(3.4×10⁻⁷×2.0×10⁻⁵)=2.6×10⁻⁶。(c)pH=6－0.41=5.59≈5.6（酸雨示例）。',
    issues: [],
  },
  {
    code: 'chem-che8-qA13', category: '応用問題', topic: T_ION, subtopics: S_STRONG,
    optMode: 'multi', Q: 'c mol/L 醋酸的电离度 α≪1。(1)用 Ka、c 表示 α 与 [H⁺] 的近似式。(2)浓度变为 1/10 时 α 变几倍？(√10=3.2)(3)此时 pH 增大还是减小、变化多少？',
    answerVector: ['α=√(Ka/c)', '[H⁺]=√(cKa)', '3.2倍', '0.5大きくなる'], N: 4,
    answerJp: '(1)α=√(Ka/c)、[H⁺]=√(cKa) (2)3.2倍 (3)0.5大きくなる',
    explCn: '(2)α\'=√(Ka/(c/10))=√10·α=3.2 倍。(3)pH\'=－½(log c／10＋logKa)=pH＋0.5，pH 增大 0.5。',
    issues: [],
  },
  {
    code: 'chem-che8-qA14', category: '応用問題', topic: T_ION, subtopics: S_SALT,
    optMode: 'multi', Q: '入浴剂主要成分为 NaHCO₃ 与富马酸 H₄C₄O₄（弱酸，H₄C₄O₄→2H⁺＋H₂C₄O₄²⁻）。(1)写反应化学方程式。(2)用「遊離」说明碳酸与富马酸哪个更强。(3)常温固体混合几乎不反应，写出使固体反应进行的办法。',
    answerVector: ['2NaHCO₃＋H₄C₄O₄→Na₂H₂C₄O₄＋2H₂O＋2CO₂', 'フマル酸のほうが炭酸よりも強い酸であるから，炭酸塩から二酸化炭素が遊離する', '加熱する'], N: 3,
    answerJp: '(1)2NaHCO₃＋H₄C₄O₄→Na₂H₂C₄O₄＋2H₂O＋2CO₂ (2)フマル酸のほうが炭酸よりも強い酸（炭酸塩から二酸化炭素が遊離） (3)加熱する',
    explCn: '(1)弱酸盐+较强酸→2mol CO₂ 游离。(2)靠游离出 CO₂ 说明富马酸酸性强于碳酸。(3)固体反应缓慢，加热提高反应速率使其进行。',
    issues: [],
  },
  {
    code: 'chem-che8-qA15', category: '応用問題', topic: T_ION, subtopics: S_SALT,
    optMode: 'multi', Q: 'c mol/L CH₃COONa 水溶液。(1)写水解的离子方程式。(2)视 [H₂O] 恒定，写水解常数 Kh 的表达式。(3)Kh=Kw/Ka，Ka=2.8×10⁻⁵ 时 0.070 mol/L 溶液的 pH（第 1 位）。',
    answerVector: ['CH₃COO⁻＋H₂O⇌CH₃COOH＋OH⁻', 'Kh=[CH₃COOH][OH⁻]/[CH₃COO⁻]', '8.7'], N: 3,
    answerJp: '(1)CH₃COO⁻＋H₂O⇌CH₃COOH＋OH⁻ (2)Kh=[CH₃COOH][OH⁻]/[CH₃COO⁻] (3)8.7',
    explCn: '[OH⁻]=√(cKw/Ka)=√(0.070×1.0×10⁻¹⁴/2.8×10⁻⁵)=5.0×10⁻⁶→pH=9－log5=8.7。',
    issues: [],
  },
  {
    code: 'chem-che8-qA16', category: '応用問題', topic: T_ION, subtopics: S_SALT,
    optMode: 'simple', Q: 'NH₄Cl 水解常数 Kh=[H⁺]²/c，Kh=Kw/Kb，Kb=2.0×10⁻⁵ mol/L。求 0.050 mol/L NH₄Cl 水溶液的 pH（第 1 位）。',
    options: ['5.3', '8.7', '4.7', '6.3'], correctIndex: 0,
    answerJp: '5.3',
    explCn: '[H⁺]=√(cKw/Kb)=√(0.050×1.0×10⁻¹⁴/2.0×10⁻⁵)=5.0×10⁻⁶→pH=6－log5=5.30。',
    issues: [],
  },
  {
    code: 'chem-che8-qA17', category: '応用問題', topic: T_ION, subtopics: S_SALT,
    optMode: 'multi', Q: '填空：醋酸与醋酸钠混合溶液，浓度分别为 cA（酸）、cS（盐）mol/L。CH₃COO⁻≈(a)、CH₃COOH≈(b)，代入 Ka 表达式得 [H⁺]=(c)。',
    answerVector: ['cS', 'cA', '(cA/cS)Ka'], N: 3,
    answerJp: '(a)cS (b)cA (c)(cA/cS)Ka',
    explCn: '同离子效应使 CH₃COOH 电离被抑制：[CH₃COO⁻]≈cS、[CH₃COOH]≈cA，Ka=cS[H⁺]/cA→[H⁺]=(cA/cS)Ka（缓冲液公式）。',
    issues: [],
  },
  {
    code: 'chem-che8-qA18', category: '応用問題', topic: T_ION, subtopics: S_SALT,
    optMode: 'multi', Q: '100mL 中含醋酸 0.050mol、醋酸钠 0.014mol，Ka=2.8×10⁻⁵。(1)[H⁺]？(2)加 0.50 mol/L 盐酸 1.0mL 后 [H⁺]？(3)同 pH 的稀盐酸 100mL 加 0.50 mol/L 盐酸 1.0mL 后 [H⁺]？',
    answerVector: ['1.0×10⁻⁴ mol/L', '1.0×10⁻⁴ mol/L', '5.0×10⁻³ mol/L'], N: 3,
    answerJp: '(1)1.0×10⁻⁴ mol/L (2)1.0×10⁻⁴ mol/L (3)5.0×10⁻³ mol/L',
    explCn: '(1)浓度 0.50/0.14，[H⁺]=2.8×10⁻⁵×0.50/0.14=1.0×10⁻⁴。(2)缓冲液加少量酸 pH 几乎不变≈1.0×10⁻⁴。(3)稀盐酸无缓冲作用，[H⁺]≈1.0×10⁻⁵+5.0×10⁻⁴ 合计/101mL≈5.0×10⁻³。',
    issues: [],
  },
  {
    code: 'chem-che8-qA19', category: '応用問題', topic: T_ION, subtopics: S_SALT,
    optMode: 'simple', Q: '0.10 mol/L 醋酸 10.0mL 加 0.10 mol/L NaOH 7.0mL，Ka=2.8×10⁻⁵，求该溶液 pH（第 1 位）。',
    options: ['4.9', '3.7', '5.6', '4.1'], correctIndex: 0,
    answerJp: '4.9',
    explCn: '反应后 CH₃COOH 3.0×10⁻⁴、CH₃COO⁻7.0×10⁻⁴ mol，[H⁺]=Ka×cA/cS=2.8×10⁻⁵×3/7=1.2×10⁻⁵→pH=5－log1.2×10⁻¹=4.9。',
    issues: [],
  },
  {
    code: 'chem-che8-qA20', category: '応用問題', topic: T_ION, subtopics: S_PH,
    optMode: 'multi', Q: '酪酸 C₃H₇COOH（Ka=1.6×10⁻⁵ mol/L）0.16 mol/L 50mL 滴加 0.25 mol/L NaOH。滴下量为(1)0mL (2)16mL (3)32mL (4)40mL 时 pH 各为多少？（√1.64=1.28，log₁₀1.28=0.11）',
    answerVector: ['2.8', '4.8', '8.9', '12.3'], N: 4,
    answerJp: '(1)2.8 (2)4.8 (3)8.9 (4)12.3',
    explCn: '(1)[H⁺]=√(0.16×1.6×10⁻⁵)=1.6×10⁻³→pH=3－log1.6=2.8。(2)半中和后 pH=pKa=4.8。(3)恰中和→弱酸盐 [H⁺]=√(KaKw/c)=1.28×10⁻⁹→pH=8.9。(4)碱过量 pH=12.3。',
    issues: [],
  },
  {
    code: 'chem-che8-qA21', category: '応用問題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: 'AgCl 溶解度积 1.0×10⁻¹⁰、Ag₂CrO₄ 1.0×10⁻¹²。(1)pH=5.0 盐酸 100mL 中能溶 AgCl 多少 g？（√5=2.24）(2)Cl⁻ 与 CrO₄²⁻ 各 0.010 mol/L 的混合液，滴加 0.010 mol/L AgNO₃，最先沉淀的是哪种（化学式）？再滴加多少 mL 以上？',
    answerVector: ['8.9×10⁻⁵ g', 'AgCl', '1.0×10⁻⁴ mL'], N: 3,
    answerJp: '(1)8.9×10⁻⁵ g (2)AgCl、1.0×10⁻⁴ mL',
    explCn: '(1)[Cl⁻]=1.0×10⁻⁵＋10x，Ksp=10x(1.0×10⁻⁵＋10x)=1.0×10⁻¹⁰→x=6.2×10⁻⁷mol→8.9×10⁻⁵g。(2)开始沉淀所需[Ag⁺]：AgCl 为 1.0×10⁻⁸<Ag₂CrO₄ 的 1.0×10⁻⁵，故 AgCl 先沉淀，需 1.0×10⁻⁴ mL。',
    issues: [],
  },
  {
    code: 'chem-che8-qA22', category: '応用問題', topic: T_BAL, subtopics: S_BAL,
    optMode: 'multi', Q: 'H₂S⇌2H⁺＋S²⁻。(1)H⁺ 的增减使平衡移动的现象称什么效应？(2)pH=1.0 时 [H⁺]？(3)pH=1.0、H₂S 饱和 0.10 mol/L、电离常数 9.6×10⁻²² 时 [S²⁻]？(4)0.010 mol/L Cu²⁺ 与 0.060 mol/L Fe²⁺ 的溶液 pH=1.0 通 H₂S 饱和，哪个沉淀（Ksp：CuS 6.0×10⁻³⁶、FeS 6.0×10⁻¹⁸）？(5)要使 (4) 中未沉淀的离子也沉淀，[S²⁻] 需大于多少 mol/L？',
    answerVector: ['共通イオン効果', '0.10 mol/L', '9.6×10⁻²¹ mol/L', 'Cu²⁺', '1.0×10⁻¹⁶ mol/L'], N: 5,
    answerJp: '(1)共通イオン効果 (2)0.10 mol/L (3)9.6×10⁻²¹ mol/L (4)Cu²⁺ (5)1.0×10⁻¹⁶ mol/L',
    explCn: '(1)H⁺ 浓度增加使 S²⁻ 浓度减小、平衡向生成 H₂S 方向移动，称共通离子效应。(2)[H⁺]=10⁻¹·⁰=0.10 mol/L。(3)K＝[H⁺]²[S²⁻]/[H₂S]=9.6×10⁻²²，故 [S²⁻]=K[H₂S]/[H⁺]²=9.6×10⁻²²×0.10/0.10²=9.6×10⁻²¹ mol/L。(4)CuS 与 FeS 均由所需的 [S²⁻] 决定：CuS 只需 [S²⁻]＞Ksp(CuS)/[Cu²⁺]=6.0×10⁻³⁴，FeS 需 [S²⁻]＞6.0×10⁻¹⁸/0.060=1.0×10⁻¹⁶，故 Cu²⁺ 先沉淀。(5)未沉淀的是 Fe²⁺，需 [S²⁻]＞Ksp(FeS)/[Fe²⁺]=6.0×10⁻¹⁸/0.060=1.0×10⁻¹⁶ mol/L。',
    issues: [],
  },
];

function build() {
  const labels = ['(a)', '(b)', '(c)', '(d)', '(e)', '(f)', '(g)', '(h)', '(i)', '(j)', '(k)', '(l)', '(m)', '(n)', '(o)', '(p)', '(q)', '(r)', '(s)', '(t)'];
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
  console.log('che8 drafts:', d.length);
  const s = new Map();
  d.forEach((x) => s.set(x.generationStatus, (s.get(x.generationStatus) || 0) + 1));
  console.log('status:', Object.fromEntries(s));
  const nat = d.filter((x) => x.options.length > 0 && x.correctIndex !== null);
  console.log('有选项+答案的题:', nat.map((x) => `${x.businessCode}(idx=${x.correctIndex})`).join(', '));
}