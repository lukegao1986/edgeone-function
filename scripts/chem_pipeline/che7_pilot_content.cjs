#!/usr/bin/env node
/**
 * che7 Step6 试点内容定义
 *
 * 数据源唯一为基础题块 che7 blocks（来源 SHA-256 与 che1~che6 同一 lock 文件）。
 * 每题定义：答案(源自 che7_解析.md)、选项(语义成立、正确唯一)、中文解析、考点、状态。
 * 策略沿用 che1~che6：作图/记述题 → 语言描述图特征 / 参考答案要点作选项；多空题 → D1 组合。
 *
 * che7 整章 = 第7章 化学反応の速さとしくみ（反応速度とエネルギー）→ chem_2_3_4_01（反応速度）
 * 本章全部为题围绕反応速度/速度式/活性化エネルギー/触媒（无化学平衡内容）。
 */
const path = require('path');

const CANDIDATE = '/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/Chem/_meta/chem_question_blocks_candidate_2026-10-12_v2.json';
const blocksPayload = require(CANDIDATE);
const blocks = blocksPayload.blocks.filter((b) => b.unitCode === 'che7');
const byCode = new Map(blocks.map((b) => [b.businessCode, b]));

const TOPIC = 'chem_2_3_4';
const SUBTOPIC = ['chem_2_3_4_01'];

const CONTENT = [
  // ---- 基礎 CHECK ----
  {
    code: 'chem-che7-qC1', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: '某物质在化学反应中，浓度由 c₁[mol/L] 减少到 c₂[mol/L]（t₁→t₂）时，反应速度用怎样的式子表示？',
    options: ['－(c₂－c₁)/(t₂－t₁)　[mol/(L·s)]', '(c₂－c₁)/(t₂－t₁)　[mol/(L·s)]', '(t₂－t₁)/(c₂－c₁)　[mol/(L·s)]', '－(c₂－c₁)/(t₂－t₁)　[mol/s]'], correctIndex: 0,
    answerJp: '－(c₂－c₁)/(t₂－t₁)　[mol/(L·s)]',
    explCn: '反应速度＝反应物浓度在单位时间内的减少量（取负号保证速度为正值），单位 mol/(L·s)。',
    issues: [],
  },
  {
    code: 'chem-che7-qC2', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '下列情况反应变快还是变慢？(1)增大反应物浓度。(2)降低温度。(3)加入催化剂。',
    answerVector: ['速くなる', '遅くなる', '速くなる'], N: 3,
    answerJp: '(1)速くなる (2)遅くなる (3)速くなる',
    explCn: '浓度增大→碰撞次数增多→加快；温度降低→活化分子减少→变慢；催化剂提供低活化能路径→加快。',
    issues: [],
  },
  {
    code: 'chem-che7-qC3', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: '增大反应物浓度反应会加快，为什么？',
    options: ['反応物の粒子の衝突回数が増えるから。', '反応物の粒子の運動エネルギーが大きくなるから。', '反応物の粒子どうしがくっつきやすくなるから。', '反応物のモル濃度が反応熱に直接関係するから。'], correctIndex: 0,
    answerJp: '反応物の粒子の衝突回数が増えるから。',
    explCn: '浓度增大使单位体积内粒子数增多，单位时间内碰撞次数增加，反应速度增大。',
    issues: [],
  },
  {
    code: 'chem-che7-qC4', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '(1)反应物粒子碰撞后生成的能量高的中间状态叫什么？(2)该状态的能量比反应物高还是低？(3)达到该状态所需能量叫什么？',
    answerVector: ['遷移状態（活性化状態）', '高い', '活性化工ネルギー'], N: 3,
    answerJp: '(1)遷移状態（活性化状態） (2)高い (3)活性化工ネルギー',
    explCn: '碰撞生成的高能中间状态为过渡态（活化态），其能量高于反应物，形成过渡态所需最小能量为活化能。',
    issues: [],
  },
  {
    code: 'chem-che7-qC5', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: '催化剂使 qC4(3) 中的活化能（活化能量）变大还是变小？',
    options: ['小さくする', '大きくする', '変わらない', '反応エンタルピーを小さくする'], correctIndex: 0,
    answerJp: '小さくする',
    explCn: '催化剂提供活化能更小的新反应路径，使更多反应物分子能够反应，从而加快反应。',
    issues: [],
  },

  // ---- 基本例題 ----
  {
    code: 'chem-che7-qE1', category: '基本例題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '反应 A＋B→C 中，改变 [A]、[B] 测得生成速度 v 如表所示。(1)v 与 [A]、[B] 的关系用哪个式子表示（ア v=k[A][B] イ v=k[A]²[B] ウ v=k[A][B]² エ v=k[A]²[B]²）？(2)比例常数 k 叫什么？(3)k 的值是多少（带单位）？',
    answerVector: ['ウ', '速度定数', '0.083 L²/(mol²·s)'], N: 3,
    answerJp: '(1)ウ：v=k[A][B]² (2)速度定数 (3)0.083 L²/(mol²·s)',
    explCn: '实验①②B浓度2倍→v 4倍，故 v∝[B]²；实验①③A浓度2倍→v 2倍，故 v∝[A]。速度式 v=k[A][B]²。k：0.0090÷(0.30×0.60²)=0.083 L²/(mol²·s)。',
    issues: [],
  },
  {
    code: 'chem-che7-qE2', category: '基本例題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: 'H₂＋I₂→2HI 反应的进行度-能量图如题图。(a)该反应是吸/放热？(b)用图中 x～z 表示反应焓。(c)使 H₂、I₂ 达到中间状态 A 所需能量是？(d)用 x～z 表示这个能量。(e)加入铂时该值变大还是变小？',
    answerVector: ['発', 'z－x', '活性化工ネルギー', 'y－x', '小さ'], N: 5,
    answerJp: '(a)発 (b)z－x (c)活性化工ネルギー (d)y－x (e)小さ',
    explCn: '生成物 2HI 能量低于反应物→放热反应，反应焓＝生成物－反应物＝z－x；过渡态与反应物能量差为活化能＝y－x；铂作催化剂使活化能变小。',
    issues: [],
  },

  // ---- 基本問題 ----
  {
    code: 'chem-che7-qB1', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '关于反应速度的填空：(a)反应速度用单位时间内减少的（反应物浓度）或单位时间内增加的（生成物浓度）表示。(c)反应发生必须粒子相互碰撞。(d)浓度增大→碰撞次数增多→速度变快。气体反应中压力越高浓度越（e）速度越（f）。',
    answerVector: ['減少', '生成物', '衝突', '大き', '大き', '大き'], N: 6,
    answerJp: '(a)減少 (b)生成物 (c)衝突 (d)大き (e)大き (f)大き',
    explCn: '反应速度＝单位时间内反应物浓度的减少量或生成物浓度的增加量。浓度/压力增大→单位时间碰撞次数增加→速度变大。',
    issues: [],
  },
  {
    code: 'chem-che7-qB2', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '反应 A＋2B→2C。(1)当 C 的生成速度为 1.2×10⁻³ mol/(L·s) 时，A 的减少速度和 B 的减少速度各为多少？(2)C 的生成速度与 [A] 和 [B]² 成正比。保持 [A] 不变，[B] 增大为 3 倍时 C 的生成速度变为多少？',
    answerVector: ['6.0×10⁻⁴ mol/(L·s)', '1.2×10⁻³ mol/(L·s)', '1.1×10⁻² mol/(L·s)'], N: 3,
    answerJp: '(1)A：6.0×10⁻⁴ mol/(L·s)，B：1.2×10⁻³ mol/(L·s) (2)1.1×10⁻² mol/(L·s)',
    explCn: '(1)由系数比：A 的减少速度为 C 的 1/2，B 的减少速度与 C 相同。(2)v∝[B]²，[B] 3 倍→v 9 倍：1.2×10⁻³×9=1.08×10⁻²≈1.1×10⁻²。',
    issues: [],
  },
  {
    code: 'chem-che7-qB8', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '容积 10L 容器中 HI 在 5.0 秒内分解 0.20 mol，生成 H₂ 与 I₂。(a)HI 的分解速度？(b)H₂ 的生成速度？',
    answerVector: ['4.0×10⁻³ mol/(L·s)', '2.0×10⁻³ mol/(L·s)'], N: 2,
    answerJp: '(a)4.0×10⁻³ mol/(L·s) (b)2.0×10⁻³ mol/(L·s)',
    explCn: 'HI 减少浓度＝0.20/10=0.020 mol/L，÷5.0s＝4.0×10⁻³。2HI→H₂＋I₂，H₂ 生成速度为分解速度的 1/2。',
    issues: [],
  },
  {
    code: 'chem-che7-qB3', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '0.35 mol/L 的过氧化氢水 100mL 中加入催化剂，5.0 分钟后浓度变为 0.20 mol/L。(1)过氧化氢平均分解速度？(2)氧气平均生成速度？',
    answerVector: ['5.0×10⁻⁴ mol/(L·s)', '2.5×10⁻⁵ mol/s'], N: 2,
    answerJp: '(1)5.0×10⁻⁴ mol/(L·s) (2)2.5×10⁻⁵ mol/s',
    explCn: '(1)Δ[H₂O₂]=0.15，÷300s=5.0×10⁻⁴ mol/(L·s)。(2)2H₂O₂→2H₂O＋O₂：O₂ 生成量＝0.15×0.1×1/2＝7.5×10⁻³ mol，÷300s=2.5×10⁻⁵ mol/s。',
    issues: [],
  },
  {
    code: 'chem-che7-qB9', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '反应 2A＋B→2C 的速度式为 v=k[A]²[B]（k＝5.0×10⁻² L²/(mol²·s)）。(1)[A] 0.5 倍、[B] 2 倍时 v 变为几倍？(2)比例常数 k 叫什么？(3)[A]=0.30、[B]=0.40 mol/L 时 v 是多少？(4)往容器中加入某物质后 k 变大了，该物质称为什么？',
    answerVector: ['0.5倍', '（反応）速度定数', '1.8×10⁻³ mol/(L·s)', '触媒'], N: 4,
    answerJp: '(1)0.5倍 (2)（反応）速度定数 (3)1.8×10⁻³ mol/(L·s) (4)触媒',
    explCn: '(1)0.5²×2=0.5 倍。(3)v=5.0×10⁻²×0.30²×0.40=1.8×10⁻³。(4)速度定数只随反应种类与温度变化，不受浓度影响，使 k 增大的物质是催化剂。',
    issues: [],
  },
  {
    code: 'chem-che7-qB4', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '反应 X＋Y→Z。表中为不同 [X]、[Y] 下的 Z 生成速度。设 v=k[X]^a[Y]^b。(1)求 a、b 的值。(2)求速度常数 k。(3)求表中空格 (c) 的 Z 生成速度。',
    answerVector: ['2', '1', '60 L²/(mol²·s)', '0.75'], N: 4,
    answerJp: '(1)a=2，b=1 (2)60 L²/(mol²·s) (3)0.75 mol/(L·s)',
    explCn: '[Y] 一定时 [X] 2、3 倍→v 4、9 倍，故 a=2；[X] 一定时 [Y] 2、3 倍→v 2、3 倍，故 b=1。k=0.060÷(0.10²×0.10)=60。(c)=60×0.25²×0.20=0.75。',
    issues: [],
  },
  {
    code: 'chem-che7-qB5', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '关于反应速度与能量的填空：(a)分子需具有一定能量以上才能反应，该能量称活化能。温度升高→(a)以上能量的分子比例增大→速度增大。(b)加入催化剂速度也增大，因催化剂提供比(a)更（c）的路径。此时反应焓与加催化剂前相比（d）。',
    answerVector: ['活性化工ネルギー', '触媒', '小さ', '変わらない（同じである）'], N: 4,
    answerJp: '(a)活性化工ネルギー (b)触媒 (c)小さ (d)変わらない（同じである）',
    explCn: '反应需活化能以上能量的分子碰撞；催化剂提供活化能更小的路径；反应焓只由始态与终态决定，加催化剂前后不变（Hess 定律）。',
    issues: [],
  },
  {
    code: 'chem-che7-qB6', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '图中曲线(ア)～(ウ)为某物质在 3 个不同温度下分解时的浓度变化。(1)从反应开始到一定时间内的平均分解速度最大的是哪条曲线？(2)温度最高的是哪条曲线？',
    answerVector: ['ウ', 'ウ'], N: 2,
    answerJp: '(1)ウ (2)ウ',
    explCn: '分解速度大→一定时间内浓度下降多→曲线斜率陡；(2)温度最高→反应最快→相同时间浓度最低，均对应曲线(ウ)。',
    issues: [],
  },
  {
    code: 'chem-che7-qB7', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '分子 A₂ 与 B₂ 生成 AB 的反应如题图进行。(1)图中的Ⅱ状态叫什么？(2)达到Ⅱ状态所需最小能量叫什么？(3)从Ⅱ状态到Ⅲ时能量吸收还是放出？(4)从Ⅱ状态回到Ⅰ状态是否会发生？',
    answerVector: ['遷移状態（活性化状態）', '活性化工ネルギー', '放出する', 'ある'], N: 4,
    answerJp: '(1)遷移状態（活性化状態） (2)活性化工ネルギー (3)放出する (4)ある',
    explCn: '过渡态为高能中间状态；达到过渡态所需最小能量为活化能；过渡态→生成物时放出能量；过渡态也可能回到反应物。',
    issues: [],
  },
  {
    code: 'chem-che7-qB10', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '题图为反应 2SO₂＋O₂→2SO₃（A）与其逆反应 2SO₃→2SO₂＋O₂（B）的反应路径图。(1)反应(A)的反应焓？(2)反应(A)的活化能？(3)反应(B)的活化能？(4)反应(B)的反应焓？(5)反应(A)用铂作催化剂（活化能变为 60kJ）时，反应路径如何在图中表示？',
    answerVector: ['－200 kJ/mol', '300 kJ', '500 kJ', '200 kJ/mol', '遷移状態のエネルギーが260kJになるように破線で記入する（活性化エネルギー60kJの経路）'], N: 5,
    answerJp: '(1)－200 kJ/mol (2)300 kJ (3)500 kJ (4)200 kJ/mol (5)遷移状態のエネルギーを260kJとして破線で記入',
    explCn: 'ΔH(生成物－反応物)：(A)0－200=－200；(B)200－0=+200。活化能(过渡态－反应物)：(A)500－200=300；(B)500－0=500。催化剂后过渡态能量＝反应物 200＋60＝260 kJ，以破线表示。',
    issues: [],
  },
  {
    code: 'chem-che7-qB11', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '题图为反应路径图（纵轴 1 格＝20kJ，含(ア)～(ク) 8 幅图，Q₁ 为正反应活化能、Q₂ 为逆反应活化能）。(1)表示吸热反应的是哪幅图？(2)图(ア)所示反应的活化能？(3)(ア)～(ク)中发热量最大的是哪幅？(4)其中互为正逆反应的 1 组是哪两幅？(5)对图(ア)的反应用催化剂后反应速度变大，用哪幅图表示？',
    answerVector: ['オ', '120kJ', 'イ', 'オとク', 'ウ'], N: 5,
    answerJp: '(1)オ (2)120kJ (3)イ (4)オとク (5)ウ',
    explCn: '(2)Q₁=120kJ（1 格 20kJ×6 格）。(3)发热量＝Q₂－Q₁ 最大为(イ)＝160－80=80kJ。(4)(オ)Q₁=80,Q₂=60 与(ク)Q₁=60,Q₂=80 活化能互换即互为逆反应。(5)催化剂使活化能减小而始态终态不变，为(ウ)。',
    issues: [],
  },
  {
    code: 'chem-che7-qB12', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '存在温度每上升 10K 速度变为 3 倍的反应。(1)除高温下分子运动加快、碰撞次数增加外，以分子能量为切入点，用约 30 字说明温度升高反应变快的另一原因。(2)该反应 60℃ 时 10 分钟完成，则 20℃ 时完成需多少分钟？',
    answerVector: ['活性化エネルギー以上のエネルギーをもつ分子の数が増加するため。', '8.1×10²分'], N: 2,
    answerJp: '(1)活性化エネルギー以上のエネルギーをもつ分子の数が増加するため。(2)8.1×10²分',
    explCn: '(1)温度升高使活化能以上能量的分子比例增大。(2)低 40K→速度 1/3⁴=1/81，所需时间×81＝810 分＝8.1×10² 分。',
    issues: [],
  },

  // ---- 応用例題 ----
  {
    code: 'chem-che7-qA1', category: '応用例題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: 'N₂O₅ 分解反应 2N₂O₅→4NO₂＋O₂ 的实验数据如表（v 为平均分解速度，[N₂O₅] 为平均浓度）。(1)求表中 (a)(b)(c)。(2)由 v/[N₂O₅] 的值说明 v 与 [N₂O₅] 的关系。',
    answerVector: ['0.205 mol/(L·min)', '3.86 mol/L', '4.42×10⁻²/min', 'v/[N₂O₅]がほぼ一定であるため，vは[N₂O₅]に比例する'], N: 4,
    answerJp: '(1)(a)0.205 mol/(L·min) (b)3.86 mol/L (c)4.42×10⁻²/min (2)v/[N₂O₅]はほぼ一定であるから，vは[N₂O₅]に比例する',
    explCn: '(a)(5.02－4.20)÷4=0.205。(b)(4.20+3.52)÷2=3.86。(c)0.140÷3.17=4.42×10⁻²。v/[N₂O₅] 近似恒定→一次反应，v∝[N₂O₅]。',
    issues: [],
  },

  // ---- 応用問題 ----
  {
    code: 'chem-che7-qA2', category: '応用問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '气体 A、B 反应 A＋B→2C。(1)10.0L 容器中各放入 A、B 1.00 mol，50 秒内 C 的平均生成速度 6.0×10⁻⁴ mol/(L·s)，50 秒后 C 的生成量是多少 mol？(2)(a)50 秒内 A 的平均反应速度？(b)50 秒后 A 的摩尔浓度？',
    answerVector: ['0.30 mol', '3.0×10⁻⁴ mol/(L·s)', '0.085 mol/L'], N: 3,
    answerJp: '(1)0.30 mol (2)(a)3.0×10⁻⁴ mol/(L·s) (b)0.085 mol/L',
    explCn: '(1)6.0×10⁻⁴×10.0×50＝0.30 mol。(2a)A 为 C 的 1/2：3.0×10⁻⁴。(2b)A 初浓度 0.100，减少 3.0×10⁻⁴×50＝0.015，0.100－0.015＝0.085 mol/L。',
    issues: [],
  },
  {
    code: 'chem-che7-qA3', category: '応用問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '0.62 mol/L 的过氧化氢水加催化剂，浓度按比例分解，2.0 分钟后变为 0.38 mol/L。(1)由 2.0 分钟内的平均分解速度求该反应的（一次反应）速度常数。(2)过氧化氢摩尔浓度变为一半所需的时间，与其摩尔浓度有什么样的关系？',
    answerVector: ['0.24/min', 'モル濃度によらず一定である'], N: 2,
    answerJp: '(1)0.24/min (2)モル濃度によらず一定である',
    explCn: '(1)平均速度 0.12，平均浓度 0.50，k＝0.12/0.50＝0.24/min。(2)一次反应的半衰期 t＝2/(3k) 与浓度无关，恒定。',
    issues: [],
  },
  {
    code: 'chem-che7-qA4', category: '応用問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: 'MnO₂ 催化 1.000 mol/L 的过氧化氢水 10.0 mL 分解，数据如表。(1)0～30 秒 [H₂O₂] 的减少量 (a)？(2)30～60 秒生成的 O₂ 是多少 mol？(3)60～90 秒 [H₂O₂] 的平均浓度 (b)？(4)90～120 秒 [H₂O₂] 的平均分解速度 (c)？',
    answerVector: ['0.187 mol/L', '7.65×10⁻⁴ mol', '0.599 mol/L', '3.40×10⁻³ mol/(L·s)'], N: 4,
    answerJp: '(1)0.187 mol/L (2)7.65×10⁻⁴ mol (3)0.599 mol/L (4)3.40×10⁻³ mol/(L·s)',
    explCn: '(1)1.000－0.813＝0.187。(2)0.153×0.010×1/2＝7.65×10⁻⁴ mol。(3)(0.660+0.538)/2＝0.599。(4)0.102÷30＝3.40×10⁻³。',
    issues: [],
  },
  {
    code: 'chem-che7-qA5', category: '応用問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: 'A→B 的反应满足 v=k[A]（一次反应）。将温度从 T₁ 依次变到 T₅ 时浓度-时间关系如图 1（初浓度 1.0 mol/L）。将初浓度改为图 1 的 60%（0.6 mol/L）并在 T₁～T₅ 中某一温度下反应时，浓度-时间关系如图 2。图 2 对应的温度是 T₁～T₅ 中的哪一个？',
    options: ['T₁', 'T₂', 'T₃', 'T₄', 'T₅'], correctIndex: 1,
    answerJp: 'T₂',
    explCn: '一次反应半衰期恒定。图 2 初浓度 0.6→0.3 mol/L 用时 80 分钟；图 1 中半衰期（0.6→0.3）为 80 分钟的是 T₂ 曲线。',
    issues: [],
  },
  {
    code: 'chem-che7-qA6', category: '応用問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '用约 50 字说明下列下划线处的理由。(1)某反应加入催化剂后反应速度变大。(2)X＋Y→Z 的反应速度 v=k[X]^x[Y]^y 中，指数 x、y 不能只由化学反応式简单确定，而须由实验决定。',
    answerVector: ['活性化工ネルギーのより小さな反応経路ができて，活性化工ネルギー以上のエネルギーをもつ分子の数が増加するため。', '化学反応は複数の段階を経て進行する場合が多く，化学反応式通りの段階を経るとは限らないため。'], N: 2,
    answerJp: '(1)活性化工ネルギーのより小さな反応経路ができて，活性化工ネルギー以上のエネルギーをもつ分子の数が増加するため。(2)化学反応は複数の段階を経て進行する場合が多く，化学反応式通りの段階を経るとは限らないため。',
    explCn: '(1)催化剂提供更小活化能的新路径，使活化能以上能量的分子增多。(2)多数反应经过多个基元步骤（多段反应），速度由速率决定步骤决定，不能仅由总反应式系数确定。',
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
  console.log('che7 drafts:', d.length);
  const s = new Map();
  d.forEach((x) => s.set(x.generationStatus, (s.get(x.generationStatus) || 0) + 1));
  console.log('status:', Object.fromEntries(s));
  const nat = d.filter((x) => x.options.length > 0 && x.correctIndex !== null);
  console.log('有选项+答案的题:', nat.map((x) => `${x.businessCode}(idx=${x.correctIndex})`).join(', '));
}