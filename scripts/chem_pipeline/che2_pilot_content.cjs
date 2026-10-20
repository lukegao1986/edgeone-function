#!/usr/bin/env node
/**
 * che2 Step6 试点内容定义
 *
 * 数据源唯一为基础题块 che2 blocks（来源 SHA-256 已锁定 4c942a4f…）。
 * 每题定义：答案(源自解析)、选项(语义成立、正确唯一)、中文解析、考点、状态。
 * 不编造缺失答案；作图/开放描述留待审(needs_review)或阻断(blocked)。
 */
const path = require('path');

const CANDIDATE = '/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/Chem/_meta/chem_question_blocks_candidate_2026-10-12_v2.json';
const blocksPayload = require(CANDIDATE);
const blocks = blocksPayload.blocks.filter((b) => b.unitCode === 'che2');
const byCode = new Map(blocks.map((b) => [b.businessCode, b]));

/**
 * 每题内容。字段：
 *  code      businessCode
 *  category  原书分类
 *  optMode   native(原生选项单题) | simple(单答构造) | multi(多空组合需审) | blocked(作图/描述)
 *  topicCode, subtopicCodes
 *  options, correctIndex   (optMode native/simple 提供；multi 提供 answerVector 与代表性选项或留待审)
 *  answerJp  参考答案(日文)
 *  explCn    中文解析
 *  issues    待审项
 */
const CONTENT = [
  // ---- 基礎 CHECK ----
  {
    code: 'chem-che2-qC1', category: '基礎 CHECK', topic: 'chem_2_2_2', subtopics: ['chem_2_2_2_01'],
    optMode: 'simple', Q: '物質が自然に広がっていく現象を何というか。',
    options: ['蒸発', '拡散', '沸騰', '蒸留'], correctIndex: 1,
    answerJp: '拡散',
    explCn: '物质由构成粒子（分子）不断运动，会自然地向周围扩散开，这一现象称为"扩散"。扩散的本质是分子的热运动；只针对单一物质均匀散开的是扩散，区别于蒸发的相变。',
  },
  {
    code: 'chem-che2-qC2', category: '基礎 CHECK', topic: 'chem_2_2_2', subtopics: ['chem_2_2_2_01'],
    optMode: 'simple', Q: '物質を構成する粒子が、温度に応じた運動エネルギーをもって絶えず行っている運動を何というか。',
    options: ['並進運動', '熱運動', '振動運動', '回転運動'], correctIndex: 1,
    answerJp: '熱運動',
    explCn: '构成物质的微粒随温度高低具有相应的运动动能，从而不间断地进行无规则运动，这种运动称为"热运动"。温度越高，热运动越剧烈。',
  },
  {
    code: 'chem-che2-qC3', category: '基礎 CHECK', topic: 'chem_2_2_1', subtopics: ['chem_2_2_1_01'],
    optMode: 'multi', Q: '（1）固体→液体，（2）液体→固体，（3）液体→気体，（4）気体→液体，（5）固体→気体，（6）気体→固体 の状態変化の名称。',
    answerVector: ['融解', '凝固', '蒸発', '凝縮', '昇華', '凝華'], N: 6,
    answerJp: '（1）融解 （2）凝固 （3）蒸発 （4）凝縮 （5）昇華 （6）凝華',
    explCn: '（1）固→液 为"融解（熔化）"；（2）液→固 为"凝固"；（3）液→气 为"蒸发/汽化"；（4）气→液 为"凝结（凝缩）"；（5）固→气 为"升华"；（6）气→固 为"凝华"。六类统称为状态变化。',
    issues: ['多空(N=6)完整组合选项留待人工按 D1 审批后生成，本步仅给参考答案向量'],
  },
  {
    code: 'chem-che2-qC4', category: '基礎 CHECK', topic: 'chem_2_2_1', subtopics: ['chem_2_2_1_01'],
    optMode: 'simple', Q: '（1）物質 1 mol が融解するとき吸収する熱量を何というか。（2）固体 1 mol が昇華するとき吸収する熱量を何というか。',
    options: ['（1）融解熱 （2）昇華熱', '（1）蒸発熱 （2）融解熱', '（1）融解熱 （2）凝固熱', '（1）昇華熱 （2）蒸発熱'],
    correctIndex: 0, answerJp: '（1）融解熱 （2）昇華熱',
    explCn: '（1）1 mol 物质熔化时吸收的热量称为"融解热（熔化热）"（kJ/mol）；（2）1 mol 固→气（升华）时吸收的热量称为"升华热"。注意与汽化热、凝固热区分。',
  },
  {
    code: 'chem-che2-qC9', category: '基礎 CHECK', topic: 'chem_1_3_4', subtopics: ['chem_1_3_4_01'],
    optMode: 'simple', Q: 'HF の沸点は HCl や HBr より高い。HF 分子間に何という結合が生じているためか。',
    options: ['イオン結合', '共有結合', '水素結合', '金属結合'], correctIndex: 2,
    answerJp: '水素結合',
    explCn: 'F 的电负性很大，HF 分子间形成"氢键"。氢键使 HF 分子间引力显著增强，因此其沸点比 HCl、HBr 高（正常应随分子量增大）。',
  },
  {
    code: 'chem-che2-qC5', category: '基礎 CHECK', topic: 'chem_1_3_5', subtopics: ['chem_1_3_5_01'],
    optMode: 'simple', Q: '分子結晶と共有結合の結晶では、どちらの融点が高いか。',
    options: ['分子結晶', '共有結合の結晶'], correctIndex: 1,
    answerJp: '共有結合の結晶',
    explCn: '共有结合晶体（如金刚石）中原子间以共价键强连接成空间网络，破坏需断裂共价键，故融点极高；分子晶体仅靠分子间力结合，融点低。',
  },
  {
    code: 'chem-che2-qC6', category: '基礎 CHECK', topic: 'chem_2_2_3', subtopics: ['chem_2_2_3_01'],
    optMode: 'simple', Q: '飽和蒸気圧と温度の関係を表す曲線を何というか。',
    options: ['融解曲線', '沸点曲線', '蒸気圧曲線', '状態曲線'], correctIndex: 2,
    answerJp: '蒸気圧曲線',
    explCn: '表示饱和蒸气压随温度变化关系的曲线称为"蒸气压曲线"。温度升高，饱和蒸气压增大。',
  },
  {
    code: 'chem-che2-qC7', category: '基礎 CHECK', topic: 'chem_2_2_3', subtopics: ['chem_2_2_3_01'],
    optMode: 'simple', Q: '飽和蒸気圧は、温度が高いと大きいか、小さいか。',
    options: ['大きい', '小さい'], correctIndex: 0,
    answerJp: '大きい',
    explCn: '升高温度，液体分子热运动加剧、逸出气相的分子增多，因此饱和蒸气压随温度升高而增大。',
  },
  {
    code: 'chem-che2-qC8', category: '基礎 CHECK', topic: 'chem_2_2_3', subtopics: ['chem_2_2_3_01'],
    optMode: 'simple', Q: '蒸気圧が大気圧と同じときに液体に起こる現象を何というか。',
    options: ['蒸発', '凝縮', '沸騰', '昇華'], correctIndex: 2,
    answerJp: '沸騰',
    explCn: '当液体的饱和蒸气压等于外界大气压时，液体内部也开始产生气泡并翻滚，这一现象称为"沸腾"。此时的温度即沸点。',
  },

  // ---- 基本例題 ----
  {
    code: 'chem-che2-qE1', category: '基本例題', topic: 'chem_2_2_1', subtopics: ['chem_2_2_1_01'],
    optMode: 'multi', Q: '三態の変化(加熱曲線)。(1)BC間・DE間の現象 (2)b,cの温度名 (3)液体が存在する区間 (4)BC・DEで熱の使われ方 (5)BC・DEの熱量名と大小。',
    answerVector: ['融解・沸騰', '融点・沸点', 'BE間', '配列を崩す・結合を切る', '融解熱・蒸発熱，蒸発熱が大'], N: 5,
    answerJp: '（1）BC:融解 DE:沸騰 （2）b:融点 c:沸点 （3）BE間 （4）BC:粒子の配列を崩す DE:粒子間の結合を切る （5）BC:融解熱 DE:蒸発熱。蒸発熱のほうが大きい。',
    explCn: '加热曲线中温度平台对应相变点。BC 为固液共存（融解），DE 为液气共存（沸腾）。b 为熔点、c 为沸点，液体存在于 BE 之间。平台期加的热用于克服粒子间作用：BC 破坏晶格排列（融解热），DE 切断分子间结合（蒸发/汽化热）。蒸发散热通常大于融解热，故 DE 平台更长。',
    issues: ['多空(N=5)组合选项留待人工按 D1 审批生成；本题含图(f85b7d…)需在题面展示'],
  },
  {
    code: 'chem-che2-qB1', category: '基本問題', topic: 'chem_2_2_2', subtopics: ['chem_2_2_2_01'],
    optMode: 'multi', Q: '気体の運動(a)-(e)五空(語句・数値)。',
    answerVector: ['熱運動', '拡散', '圧力', '760', '10^5'], N: 5,
    answerJp: '（a）熱運動 （b）拡散 （c）圧力 （d）760 （e）10^5',
    explCn: '物质因粒子热运动(a)而自然扩散(b)。气体分子热运动撞击容器壁形成压力(c)。1 大气压下水银柱高 760 mm；1 atm = 1.013×10^5 Pa，故(e)为 10^5。',
    issues: ['多空(N=5)组合选项留待人工审批；题干长文与压力单位换算需确认'],
  },
  {
    code: 'chem-che2-qB2', category: '基本問題', topic: 'chem_2_2_2', subtopics: ['chem_2_2_2_01'],
    optMode: 'native', Q: '気体の混合(図)。コックを開き放置後、気体はどうなるか。(ア)~(エ)から選べ。',
    options: ['（ア）IもIIもそのまま変化しない。', '（イ）IもIIも質量が同じになるまで酸素が水素の方へ入っていく。', '（ウ）IもIIも均一に混合する。', '（エ）Iでは均一に混合、IIでは変化しない。'],
    correctIndex: 2, answerJp: 'ウ',
    explCn: '气体分子间距大、可自由运动，长时间放置会扩散并均匀混合，方向与重力无关。故选（ウ）。注：原题(イ)涉及浓度扩散会出错，但(ウ)为正确结论。',
  },
  {
    code: 'chem-che2-qB3', category: '基本問題', topic: 'chem_2_2_2', subtopics: ['chem_2_2_2_01'],
    optMode: 'multi', Q: '気体分子の運動(a)-(c)三空。',
    answerVector: ['温度', '大き', '大き'], N: 3,
    answerJp: '（a）温度 （b）大き （c）大き',
    explCn: '气体内分子速率分布由温度(a)决定。温度升高，高速分子比例增大，速率峰值向高速移动、曲线变平(Maxwell分布)，整体平均速率变大。故(b)(c)均为"大/快"。',
    issues: ['多空(N=3)组合选项留待人工审批'],
  },
  {
    code: 'chem-che2-qB4', category: '基本問題', topic: 'chem_2_2_1', subtopics: ['chem_2_2_1_01'],
    optMode: 'multi', Q: '気体分子の熱運動。(1)低温での分布曲線の特徴 (2)水素分子と酸素分子の平均の速さの比較。',
    answerVector: ['低温ほど分布が低速度側に偏りピークが高くなる', '水素分子（H₂）'], N: 2,
    answerJp: '（1）低温ほど分布が低い速度側に偏り、ピークが高くなる（図で点線は実線の左側の狭い山） （2）水素分子',
    explCn: '（1）同温下分子速率服从麦克斯韦分布；温度越低平均速率越小、分布越集中在低速区且峰越高，故低温曲线整体偏向速率小的一侧、更加陡峭狭窄。（2）同温下气体分子平均动能相同，分子量越小平均速率越大；H₂(2) < O₂(32)，故 H₂ 平均速率更大（约为 O₂ 的 4 倍）。',
    issues: ['D1 组合；（1）作图题已转为语言描述图特征选项'],
  },
  {
    code: 'chem-che2-qB5', category: '基本問題', topic: 'chem_2_2_1', subtopics: ['chem_2_2_1_01'],
    optMode: 'multi', Q: '三態の比較。(1)固体のほうが大きい値を選べ(エ)。(2)酸素固体→気体で体積は何倍(1.0×10^3倍)。',
    answerVector: ['エ(密度)', '1.0×10^3倍'], N: 2,
    answerJp: '（1）エ（密度） （2）1.0×10^3倍',
    explCn: '（1）分子间距、mol 体积、能量、蒸气压均液体>固体，仅密度固体更大（密度=质量÷体积）。故选(エ)。（2）O₂ 摩尔质量 32 g/mol，固体 1 mol 体积=32/1.43 cm³/mol；标准状态气体 1 mol=22.4 L=22400 cm³/mol；体积比≈22400/(32/1.43)≈1.0×10³ 倍。',
    issues: ['(1)原生多选需逐条正误；本题按组合答案向量待人工 D1 审批'],
  },
  {
    code: 'chem-che2-qB8', category: '基本問題', topic: 'chem_2_2_1', subtopics: ['chem_2_2_1_01'],
    optMode: 'simple', Q: '物質の三態を分子間力の強さ・分子の集合・分子の運動に着目した説明として最も適するものを選べ。',
    options: [
      '固体：分子が密に規則配列し、振動・回転のみで位置を変えない。液体：密だが分子が移動する。気体：間隔が大きく自由に飛びまわる。分子間力は固体＞液体≫気体',
      '液体：分子が密に規則配列し位置を変えない。固体：間隔が大きく自由に飛びまわる。気体：密に規則配列。分子間力は気体＞液体≫固体',
      '固体：間隔が大きく自由に飛びまわる。気体：密に規則配列し位置を固定。液体：間隔は中程度。分子間力は固体≪液体＜気体',
      '三態はいずれも分子間力がほぼ等しく、分子の集合・運動だけが異なる。固体でも分子は自由に飛びまわれる',
    ],
    correctIndex: 0, answerJp: '固体：構成粒子が密に規則配列し、振動・回転のみで位置を変えない。液体：密だが熱運動で移動する。気体：間隔が大きく自由に飛びまわる。',
    explCn: '固体：分子堆积紧密、规则排列，热运动仅为振动/转动，不离固定位置；液体：分子密集且能移动，但保留相互接触；气体：分子间距大、分子间力几乎不计，高速自由运动（分子间力：固体>液体≫气）。正确表述为第 1 项。',
    issues: ['说明题已将参考答案要点作为正确选项，其余为分子间力/集合/运动的近似或反义错误描述'],
  },
  {
    code: 'chem-che2-qB9', category: '基本問題', topic: 'chem_2_2_1', subtopics: ['chem_2_2_1_01'],
    optMode: 'multi', Q: '三態変化と熱量(45g水)。(1)(a)C-D(b)D-E(c)A-F の熱量(kJ)。(2)B-C・D-E で加えた熱の使われ方(記述)。',
    answerVector: ['19 kJ', '1.0×10^2 kJ', '1.4×10^2 kJ', '記述:配列崩す/分子間力切る'], N: 4,
    answerJp: '（1）(a)19kJ (b)1.0×10^2kJ (c)1.4×10^2kJ （2）BC:結晶中の水分子の配列を崩す DE:分子間力を切る',
    explCn: '（1a）Q_CD = 45g×4.2×(100−0)=18900 J≈19 kJ；（1b）Q_DE=41 kJ/mol×(45/18)mol=102.5≈1.0×10² kJ；（1c）合计 Q_AF=0.90+15+18.9+102.5+1.89≈1.4×10² kJ。（2）BC 段加热破坏晶体排列（融解吸热），DE 段切断水分子间分子间力（汽化吸热）。',
    issues: ['(1)热能计算多空组合留人工审批；(2)为记述，标记 NON_EQUIVALENT 待审'],
  },
  {
    code: 'chem-che2-qB10', category: '基本問題', topic: 'chem_2_2_3', subtopics: ['chem_2_2_3_01'],
    optMode: 'multi', Q: '三態の変化(正誤判断)(1)~(5)。',
    answerVector: ['誤', '誤', '誤', '誤', '誤'], N: 5,
    answerJp: '（1）誤 （2）誤 （3）誤 （4）誤 （5）誤',
    explCn: '（1）错：气压越低沸点越低，题述相反。（2）错：固→液吸热，非放热。（3）错：处于气液平衡，分子仍在双向移动，只是速率相等。（4）错：水蒸气压力不可能高于该温度饱和蒸气压。（5）错：降低气压时 70℃ 水可沸腾。',
    issues: ['正误判断为集合型多空，需人工 D1 审批合并为完整组合选项'],
  },
  {
    code: 'chem-che2-qB6', category: '基本問題', topic: 'chem_1_3_5', subtopics: ['chem_1_3_5_01'],
    optMode: 'multi', Q: '融点・沸点の高低。(1)NaCl とスクロースで融点の高い方とその理由 (2)プロパンとオクタンで沸点の高い方とその理由。',
    answerVector: ['食塩', 'イオン結合で強く結合するから', 'オクタン', '分子量が大きくファンデルワールス力が強いから'], N: 4,
    answerJp: '（1）高い方:食塩（NaCl）。理由:イオン結晶で、イオン結合により強く結合しているため。（2）高い方:オクタン。理由:同族アルカンで分子量が大きく、ファンデルワールス力が強いため。',
    explCn: '（1）NaCl 为离子晶体，靠静电引力的离子键结合，破坏需断裂离子键，熔融点高；蔗糖（スクロース）为分子晶体，仅靠分子间力结合，熔点远低。（2）同为链状烷烃，分子量越大分子间（范德华）力越强，沸点越高；C₈H₁₈(114) > C₃H₈(44)。',
    issues: ['D1 多问（选谁+理由）组合选项，理由槽干扰按正确内容反义/近似改写'],
  },
  {
    code: 'chem-che2-qB11', category: '基本問題', topic: 'chem_2_2_3', subtopics: ['chem_2_2_3_01'],
    optMode: 'native', Q: '水蒸気圧。気液平衡の容器で容積変化と水蒸気圧の関係は(ア)~(オ)のどれか。',
    options: ['（ア）', '（イ）', '（ウ）', '（エ）', '（オ）'],
    correctIndex: 2, answerJp: 'ウ',
    explCn: '有液体存在时，一定温度下饱和蒸气压为定值，与容器容积无关。故水蒸气压随容积变化保持水平（ウ）。',
    issues: ['原生(ア)~(オ)选项为图选项，正文仅列标签；结合图(b)曲线核验(ウ)为水平线形态(heating时)，本步按解析记录答案ウ，语义核验依赖图(b)'],
  },
  {
    code: 'chem-che2-qB12', category: '基本問題', topic: 'chem_2_2_3', subtopics: ['chem_2_2_3_01'],
    optMode: 'multi', Q: '蒸気圧(長填空 a)~(l)。',
    answerVector: ['分子間力', '熱運動', '(c)(d)蒸発・凝縮', '気液平衡', '蒸気圧', '温度', '液体の種類', '蒸気圧曲線', '沸騰', '沸点', '低'], N: 11,
    answerJp: '（a）分子間力 （b）熱運動 （c）蒸発 （d）凝縮 （e）気液平衡 （f）蒸気圧 （g）温度 （h）液体の種類 （i）蒸気圧曲線 （j）沸騰 （k）沸点 （l）低',
    explCn: '密闭容器中液体分子挣脱分子间力(a)逸出，因热运动(b)部分返回；达平衡时单位时间蒸发(c)与凝缩(d)分子数相等，称为气液平衡(e)，此压力即饱和蒸气压(f)。饱和蒸气压随温度(g)、液体种类(h)变化。其曲线为蒸气压曲线(i)。当蒸气压达外压(大/沸点条件)时液内起泡，为沸腾(j)，此时外压对应温度即沸点(k)；气压越低沸点越低(l)。',
    issues: ['多空(N≥6, K=12)需凑 12 个可行组合，留待人工 D1 审批；若凑不齐 12 项则 INSUFFICIENT_DISTRACTORS 阻断'],
  },
  {
    code: 'chem-che2-qB13', category: '基本問題', topic: 'chem_2_2_3', subtopics: ['chem_2_2_3_01'],
    optMode: 'multi', Q: '蒸気圧曲線(図)。(1)t0,p0で液体/気体 (2)沸点tを図でどこ(g) (3)状態変化させる方法2つ (4)Yの蒸気圧曲線の位置(図の特徴)。',
    answerVector: ['液体', '外圧 p0 と蒸気圧が等しくなる温度', '温度一定で圧力を下げる／圧力一定で温度を上げる', 'X の左上側（同温で蒸気圧が高い）'], N: 4,
    answerJp: '（1）液体 （2）p0の水平線と蒸気圧曲線の交点の温度 （3）温度一定で圧力を下げる/圧力一定で温度を上げる （4）Xの左上側',
    explCn: '（1）蒸气压曲线以上为液体区域，p0 高于 t0 时饱和蒸气压，故为液体。（2）沸点为外压与蒸气压相等之温度，即 p0 水平线与曲线的交点。（3）越过曲线移到另一侧即可：等温降压或等压升温。（4）更易挥发则同温蒸气压更高、曲线在 X 的左上侧。',
    issues: ['D1 组合；（2)(4)作图题已转为语言描述图特征选项，(3)已把参考答案要点作为选项'],
  },
  {
    code: 'chem-che2-qB7', category: '基本問題', topic: 'chem_2_2_3', subtopics: ['chem_2_2_3_01'],
    optMode: 'multi', Q: '蒸気圧曲線(図)。(1)A,B,Cの沸点 (2)90℃で水が沸騰する大気圧 (3)40℃,5.0×10^4PaでのA,B,Cの状態 (4)Aを10℃,3.0×10^4→昇圧の状態変化 (5)分子間力最大の物質。',
    answerVector: ['A34 °C・B78 °C・C100 °C', '7.0×10^4 Pa', 'A気体・B液体・C液体', '凝縮', 'C'], N: 5,
    answerJp: '（1）A:34℃ B:78℃ C:100℃ （2）7.0×10^4Pa （3）A:気体 B:液体 C:液体 （4）凝縮 （5）C',
    explCn: '（1）读蒸气压=1.0×10^5 Pa 时各曲线交点温度。（2）90℃ 水饱和蒸气压≈7.0×10^4 Pa，此即沸腾点外压。（3）40℃、5.0×10^4 Pa 时，压力低于 A 饱和蒸气压→气体，高于 B、C→液体。（4）气体区升至压力超过该温度饱和蒸气压则液化，为凝缩。（5）分子间力强则蒸汽压小、沸点高，为 C（水）。',
    issues: ['多空(N=5)组合选项待人工 D1 审批；需结合图中曲线读值核验'],
  },

  // ---- 応用例題 ----
  {
    code: 'chem-che2-qA1', category: '応用例題', topic: 'chem_1_3_5', subtopics: ['chem_1_3_5_01'],
    optMode: 'multi', Q: '融点・沸点の高低(応用例題5)。(a)~(m)語句・化学式・元素記号。',
    answerVector: ['共有結合', 'イオン', '分子', '大き', '分子間', 'Cl2', '極性', 'HCl', 'N,O,F', '水素', '水(H2O)'], N: 11,
    answerJp: '（a）共有結合 （b）イオン （c）分子 （d）大き （e）分子間 （f）Cl2 （g）極性 （h）HCl （i)(j)(k)N,O,F （l）水素 （m）水',
    explCn: '粒子间力强弱：共有结合>离子/金属>氢键>范德华力。故熔沸点顺序：共有结合晶体(a)、离子晶体(b)、金属晶体、分子晶体(c)。分子量大则分子间力强(d)(e)。F₂、Cl₂ 中 Cl₂ 分子量大沸点高(f)。F₂、HCl 分子量相近，极性分子 HCl 沸点高(g)(h)。含 H-N/O/F 键形成氢键(l)，如 16 族中水的沸点特高(m)。',
    issues: ['多空(N≥6,K=12)组合选项待人工 D1 审批；16族水素结合与氢键元素需确认'],
  },
  {
    code: 'chem-che2-qA3', category: '応用問題', topic: 'chem_1_3_5', subtopics: ['chem_1_3_5_01'],
    optMode: 'multi', Q: '沸点の高低(図)。(1)(a)14族(b)16族(c)17族水素化合物のグラフ判別 (2)第2周期が突出する理由 (3)全体的な沸点の傾向。',
    answerVector: ['(a)ウ (b)ア (c)イ', '第2周期の水素化物で水素結合が生じるから', '分子量が大きいほどファンデルワールス力が強く沸点が高くなる'], N: 3,
    answerJp: '（1）(a)ウ (b)ア (c)イ （2）第2周期に水素結合が生じる （3）分子量が大きいとファンデルワールス力が強い',
    explCn: '（1）第2周期特殊(氢键)使 14、16 族在图中第2周期处突出（17族左上高），据此匹配曲线 (a)ウ (b)ア (c)イ。（2）N-H、O-H 形成氢键使相应水素化物沸点异常高。（3）去除氢键异常点后，分子量增大→范德华力增强→沸点升高。',
    issues: ['D1 组合；（2)(3)记述题已把参考答案要点作为选项，(1)原生选择转为槽'],
  },
  {
    code: 'chem-che2-qA2', category: '応用問題', topic: 'chem_1_3_5', subtopics: ['chem_1_3_5_01'],
    optMode: 'multi', Q: '融点・沸点の高低(32)。(1)-(4)選択・語句。',
    answerVector: ['(1a)エヨウ素 (1b)ウフッ素', '(2a)エ二酸化ケイ素 (2b)イナフタレン', '(3) N2・HCl・HF・SiO2', '(4)ア水'], N: 4,
    answerJp: '（1）(a)エ(ヨウ素) (b)ウ(フッ素) （2）(a)エ(二酸化ケイ素) (b)イ(ナフタレン) （3）(a)N2 (b)HCl (c)HF (d)SiO2 （4）ア(水)',
    explCn: '（1）卤素单质熔沸点随分子量：I₂ 最高、F₂ 最低。（2）融点：共有结合晶体(SiO₂)最高，分子晶体(萘)最低。（3）(a)H₂< N₂否，N₂ 分子量大沸点高；(b)F₂<HCl(极性+)；(c)HF>HCl(氢键)；(d)CO₂(分子晶体)<SiO₂(共有结合)。（4）16族水素化物中水因氢键沸点最高。',
    issues: ['多空(N=4)组合选项待人工 D1 审批'],
  },
  {
    code: 'chem-che2-qA4', category: '応用問題', topic: 'chem_2_2_1', subtopics: ['chem_2_2_1_01'],
    optMode: 'multi', Q: '物質の状態変化(温度-熱流図)。(1)①c-d間②d-e間の状態を(ア)~(キ)から選べ (2)tb\',tbの大小 (3)凝縮熱・凝固熱。',
    // (1)①②共用原生(ア)~(キ)选项；参考选项集保留供人工核验，correctIndex=null 表示需组合审批
    options: ['（ア）気体のみ', '（イ）液体のみ', '（ウ）固体のみ', '（エ）気体と液体', '（オ）気体と固体', '（カ）液体と固体', '（キ）気体と液体と固体'],
    correctIndex: null,
    answerVector: ['イ(①c→d：液体のみ)', 'カ(②d→e：液体と固体)', "tb' > tb", '凝縮熱4.8・凝固熱2.4 kJ/mol'], N: 4,
    answerJp: '（1）①イ ②カ （2）tb\' > tb （3）凝縮熱:4.8kJ/mol, 凝固熱:2.4kJ/mol',
    explCn: '（1）取走热量时，c→d 为凝结平台(气液共存期末)，c点起已全为液体(①イ)；d→e 为凝固平台(液固共存)(②カ)，e 后全为固体。（2）t_b 为压力 p₀ 下的沸点，t_b\'\' 为 1.5p₀ 下的沸点；沸点随外压升高而升高，故 t_b\'\' > t_b。（3）凝缩热=夺去热量/摩尔数=(3.6kJ/时×2时)/1.5mol=4.8kJ/mol；凝固热=(3.6kJ/时×1时)/1.5mol=2.4kJ/mol。',
    issues: ['(1)①②共用原生(ア)~(キ)选项、需结合原图温度平台核验；(2)(3)为数值/比较，与(1)一并组合为选项，需人工 D1 审批'],
  },
  {
    code: 'chem-che2-qA5', category: '応用問題', topic: 'chem_2_2_3', subtopics: ['chem_2_2_3_01'],
    optMode: 'multi', Q: '飽和蒸気圧(水銀柱実験)。(1)真空とみなせる理由(記述) (2)エタノール状態 (3)飽和蒸気圧(Pa) (4)ジエチルエーテルで水銀柱高さ(cm)。',
    answerVector: ['水銀の飽和蒸気圧が極めて低いから', '気液平衡', '8.0×10^3 Pa', '26 cm'], N: 4,
    answerJp: '（1）水銀の飽和蒸気圧が極めて低いから （2）気液平衡 （3）8.0×10^3Pa （4）26cm',
    explCn: '（1）水银饱和蒸气压极低(25℃约0.25Pa)可视为真空。（2）液滴仍存留，处于气液平衡。（3）水银柱由76.0降至70.0cm，降6.0cm对应乙醇饱和蒸气压：(6.0/76.0)×1.01×10⁵≈8.0×10³Pa。（4）h=76.0×(1.01×10⁵−6.6×10⁴)/1.01×10⁵≈26cm。',
    issues: ['(1)为记述、其余为数值；N=4组合待人工 D1 审批'],
  },
  {
    code: 'chem-che2-qA6', category: '応用問題', topic: 'chem_2_2_1', subtopics: ['chem_2_2_1_01'],
    optMode: 'multi', Q: '状態図。(1)I,II,IIIの物質 (2)(a)-(d)状態変化 (3)TB,TCの名称 (4)TB右上がりで圧力↑融点 (5)水の状態図の相違 (6)T点の名称と安定状態。',
    answerVector: ['I固体・II液体・III気体', '(a)融解(b)昇華(c)凝縮(d)蒸発', '融解曲線・蒸気圧曲線', '高くなる', 'TBが右下がり', '三重点；三態共存'], N: 6,
    answerJp: '（1）I:固体 II:液体 III:気体 （2）a:融解 b:昇華 c:凝縮 d:蒸発 （3）TB:融解曲線 TC:蒸気圧曲線 （4）高くなる （5）TBが右下がり （6）三重点。固体・液体・気体が共存安定',
    explCn: '（1）随温度升高同压三相依次固→液→气，故 I 固 II 液 III 气。（2）对应四类相变。（3）TB 为固液分界(融解曲线)，TC 为液气分界(蒸气压曲线)。（4）TB 右上斜则升压融点升。（5）水 TB 右下斜，升压融点反而降。（6）交点 T 为三相点，三态共存稳定。',
    issues: ['多空(N=6,K=12)组合选项待人工 D1 审批；(5)涉及相图朝向需结合图确认'],
  },
];

// 汇总
function build() {
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
        slotId: `${c.optMode === 'multi' ? String(i + 1) : 'a'}`,
        sourceLabel: `${c.optMode === 'multi' ? (() => { const labels=['(a)','(b)','(c)','(d)','(e)','(f)','(g)','(h)','(i)','(j)','(k)','(l)']; return labels[i]; })() : ''}`,
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
  console.log('che2 drafts:', d.length);
  const s = new Map();
  d.forEach((x) => s.set(x.generationStatus, (s.get(x.generationStatus) || 0) + 1));
  console.log('status:', Object.fromEntries(s));
  const nat = d.filter((x) => x.options.length > 0 && x.correctIndex !== null);
  console.log('有选项+答案的题:', nat.map((x) => `${x.businessCode}(idx=${x.correctIndex})`).join(', '));
}