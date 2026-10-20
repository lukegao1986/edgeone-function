#!/usr/bin/env node
/**
 * che6 Step6 试点内容定义
 *
 * 数据源唯一为基础题块 che6 blocks（来源 SHA-256 与 che1~che5 同一 lock 文件）。
 * 每题定义：答案(源自 che6_解析.md)、选项(语义成立、正确唯一)、中文解析、考点、状态。
 * 策略沿用 che1~che5：作图/记述题 → 语言描述图特征 / 参考答案要点作选项；多空题 → D1 组合。
 *
 * che6 整章 = 第6章 電池と電気分解：
 *   电池类 → chem_2_3_2（電池，一級 topic）+ chem_2_3_2_01（電池）
 *   电解类 → chem_2_3_3（電気分解）+ chem_2_3_3_01（電気分解）
 */
const path = require('path');

const CANDIDATE = '/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/Chem/_meta/chem_question_blocks_candidate_2026-10-12_v2.json';
const blocksPayload = require(CANDIDATE);
const blocks = blocksPayload.blocks.filter((b) => b.unitCode === 'che6');
const byCode = new Map(blocks.map((b) => [b.businessCode, b]));

const TOPIC = 'chem_2_3_2';
const SUBTOPIC = ['chem_2_3_2_01'];
const TOPIC_E = 'chem_2_3_3';
const SUBTOPIC_E = ['chem_2_3_3_01'];

const CONTENT = [
  // ---- 基礎 CHECK ----
  {
    code: 'chem-che6-qC1', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '次の記述に当てはまる語句を(ア)～(エ)から選べ。(1)電池で導線に電子が流れ出る電極はどれか（(ア)陽極 (イ)正極 (ウ)陰極 (エ)負極）。(2)電池で導線から電子が流れこむ電極はどれか。',
    answerVector: ['負極', '正極'], N: 2,
    answerJp: '(1)エ（負極） (2)イ（正極）',
    explCn: '電池では電子が流れ出る電極が負極，流れこむ電極が正極。負極では酸化，正極では還元が起こる。',
    issues: [],
  },
  {
    code: 'chem-che6-qC2', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '(1)電池の負極で起こる反応は，酸化・還元のどちらか。(2)電池の正極で起こる反応は，酸化・還元のどちらか。',
    answerVector: ['酸化', '還元'], N: 2,
    answerJp: '(1)酸化 (2)還元',
    explCn: '負極では電子を放出する酸化反応，正極では電子を受け取る還元反応が起こる。',
    issues: [],
  },
  {
    code: 'chem-che6-qC3', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '(1)充電によりくり返し使える電池を何というか。(2)充電による再使用ができない電池を何というか。',
    answerVector: ['二次電池（蓄電池）', '一次電池'], N: 2,
    answerJp: '(1)二次電池（蓄電池） (2)一次電池',
    explCn: '充電してくり返し使える電池を二次電池（蓄電池），一度使ったら再利用できない電池を一次電池という。',
    issues: [],
  },
  {
    code: 'chem-che6-qC4', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '(1)鉛蓄電池の正極に用いられる物質は何か。同じく負極に用いられる物質は何か。(2)鉛蓄電池の電解質水溶液は何か。',
    answerVector: ['酸化鉛(Ⅳ)PbO₂', '鉛Pb', '希硫酸'], N: 3,
    answerJp: '(1)正極：酸化鉛(Ⅳ)PbO₂，負極：鉛Pb (2)希硫酸',
    explCn: '鉛蓄電池は正極に酸化鉛(Ⅳ)，負極に鉛を用い，電解質に希硫酸を用いる。',
    issues: [],
  },
  {
    code: 'chem-che6-qC5', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: 'リン酸形燃料電池全体で起こる反応を化学反応式で表せ。',
    options: ['2H₂＋O₂→2H₂O', 'H₂＋O₂→2H₂O', '2H₂＋O₂→H₂O₂', '2H₂O→2H₂＋O₂'], correctIndex: 0,
    answerJp: '2H₂＋O₂→2H₂O',
    explCn: '燃料電池全体では水素の燃焼と同じ反応 2H₂＋O₂→2H₂O が起こる。',
    issues: [],
  },
  {
    code: 'chem-che6-qC6', category: '基礎 CHECK', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '電気分解で，電源の正極につないだ電極を何というか。また，その電極で起こる反応は酸化・還元のどちらか。同じく，電源の負極につないだ電極を何というか。また，その電極で起こる反応は酸化・還元のどちらか。',
    answerVector: ['陽極', '酸化', '陰極', '還元'], N: 4,
    answerJp: '(1)陽極，酸化 (2)陰極，還元',
    explCn: '陽極＝電源の正極側の電極で酸化反応，陰極＝電源の負極側の電極で還元反応が起こる。',
    issues: [],
  },
  {
    code: 'chem-che6-qC7', category: '基礎 CHECK', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '白金電極を用いて次の水溶液を電気分解するときに生じる気体や金属を化学式ですべて記せ。(1)水酸化ナトリウム水溶液（気体）。(2)塩化銅(Ⅱ)水溶液（気体と金属）。',
    answerVector: ['O₂，H₂', 'Cl₂，Cu'], N: 2,
    answerJp: '(1)O₂，H₂ (2)Cl₂，Cu',
    explCn: 'NaOH水溶液の電解では陽極にO₂，陰極にH₂が生じる。CuCl₂水溶液では陽極にCl₂，陰極にCuが析出する。',
    issues: [],
  },
  {
    code: 'chem-che6-qC8', category: '基礎 CHECK', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'simple', Q: '2Aの電流が3秒間流れたときの電気量は何Cか。',
    options: ['6C', '2C', '3C', '5C'], correctIndex: 0,
    answerJp: '6C',
    explCn: 'Q=i×t＝2A×3s＝6C。',
    issues: [],
  },
  {
    code: 'chem-che6-qC9', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '回路(1)は電池の直列接続，回路(2)は並列接続を表す。各回路における電流I₁～I₃の関係および電圧V₁～V₃の関係を，それぞれ式で表せ。また，電池の正極は(ア)，(イ)のどちらか。',
    answerVector: ['I₁＝I₂＝I₃', 'V₁＝V₂＋V₃', 'ア', 'I₁＝I₂＋I₃', 'V₁＝V₂＝V₃'], N: 5,
    answerJp: '(1)I₁=I₂=I₃，V₁=V₂+V₃，正極は(ア) (2)I₁=I₂+I₃，V₁=V₂=V₃',
    explCn: '直列接続ではどこも同じ電流が流れ起電力（電圧）は加算される。並列接続では各素子の電圧が等しく，幹線電流は枝に分流する。',
    issues: [],
  },
  {
    code: 'chem-che6-qC10', category: '基礎 CHECK', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'simple', Q: '鉱物から金属の単体を取り出すことを何というか。',
    options: ['製錬', '精錬', '還元', '溶解'], correctIndex: 0,
    answerJp: '製錬',
    explCn: '鉱石（酸化物や硫化物など）から金属の単体を取り出す操作を製錬という。',
    issues: [],
  },
  {
    code: 'chem-che6-qC11', category: '基礎 CHECK', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '鉄の製錬で，溶鉱炉から得られる炭素を約4%含んだ鉄を何というか。また，この鉄から炭素の割合を下げたものを何というか。',
    answerVector: ['銑鉄', '鋼'], N: 2,
    answerJp: '銑鉄，鋼',
    explCn: '銑鉄は炭素を約4%含み硬くてもろい。転炉で炭素を下げたものを鋼という。',
    issues: [],
  },

  // ---- 基本例題 ----
  {
    code: 'chem-che6-qE1', category: '基本例題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '次の文の( )に適当な語句を入れよ。(a)反応により発生する化学エネルギーを，直流の電気エネルギーとして取り出す装置のことを(b)という。2種類の金属を導線で結んで電解質の水溶液に浸すと(b)ができる。このとき電子が導線に向かって流れ出る電極を(c)極，導線から電子が流れこむ電極を(d)極という。(b)では，イオン化傾向の大きいほうの金属が(e)極，小さいほうの金属が(f)極になり，負極では(g)反応が，正極では(h)反応が起こる。',
    answerVector: ['酸化還元', '電池', '負', '正', '負', '正', '酸化', '還元'], N: 8,
    answerJp: '(a)酸化還元 (b)電池 (c)負 (d)正 (e)負 (f)正 (g)酸化 (h)還元',
    explCn: '電池は酸化還元反応の化学エネルギーを電気エネルギーに変換する装置。イオン化傾向の大きい金属は負極（酸化），小さい金属は正極（還元）。',
    issues: [],
  },
  {
    code: 'chem-che6-qE2', category: '基本例題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '硫酸銅(Ⅱ)CuSO₄水溶液の電気分解について，(1)両極に炭素棒を用いたときの陽極と陰極での反応を，それぞれe⁻を含むイオン反応式で表し，酸化反応か還元反応かも答えよ。(2)両極に銅板を用いたときの陽極と陰極での反応を，それぞれe⁻を含むイオン反応式で表し，酸化反応か還元反応かも答えよ。',
    answerVector: ['2H₂O→O₂＋4H⁺＋4e⁻（酸化）', 'Cu²⁺＋2e⁻→Cu（還元）', 'Cu→Cu²⁺＋2e⁻（酸化）', 'Cu²⁺＋2e⁻→Cu（還元）'], N: 4,
    answerJp: '(1)陽極：2H₂O→O₂+4H⁺+4e⁻（酸化），陰極：Cu²⁺+2e⁻→Cu（還元） (2)陽極：Cu→Cu²⁺+2e⁻（酸化），陰極：Cu²⁺+2e⁻→Cu（還元）',
    explCn: '白金・炭素の陽極では水が酸化されO₂が発生。銅板の陽極では銅極板自身が溶ける。陰極ではCu²⁺が還元され析出する。',
    issues: [],
  },
  {
    code: 'chem-che6-qE3', category: '基本例題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '硝酸銀水溶液に白金電極を浸し，0.965Aの電流を10.0分間通じた（Ag=108，ファラデー定数=9.65×10⁴C/mol）。(1)陽極・陰極での変化を，それぞれe⁻を含むイオン反応式で表せ。(2)流れた電気量は何Cか。また，移動した電子は何molか。(3)陽極で発生する気体は何か。また，その体積は標準状態で何mLか。(4)陰極の質量は何g変化するか。増減を付して答えよ。',
    answerVector: ['2H₂O→O₂＋4H⁺＋4e⁻', 'Ag⁺＋e⁻→Ag', '5.79×10²C', '6.00×10⁻³mol', '酸素O₂，33.6mL', '0.648g増'], N: 6,
    answerJp: '(1)陽極：2H₂O→O₂+4H⁺+4e⁻，陰極：Ag⁺+e⁻→Ag (2)5.79×10²C，6.00×10⁻³mol (3)酸素O₂，33.6mL (4)0.648g増',
    explCn: 'Q=0.965×(10×60)=5.79×10²C，e⁻=5.79×10²/9.65×10⁴=6.00×10⁻³mol。O₂はe⁻4molに対し1molなので22.4×(6.00×10⁻³/4)=0.0336L=33.6mL。Agはe⁻1molにつき1mol析出し，108×6.00×10⁻³=0.648g増。',
    issues: [],
  },
  {
    code: 'chem-che6-qE4', category: '基本例題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '次の文の( )に適当な語句を入れよ。金属は鉱石として産出する。鉱石から単体の金属を得る操作を(a)という。鉄Feの鉱石は，酸化鉄を主成分とする(b)である。(b)に(c)を加えて高炉で還元すると(d)が得られる。(d)は炭素Cを多く含み，もろい。(d)に含まれるCを転炉で取り除くと(e)が得られる。アルミニウムAlの鉱石は，酸化アルミニウムを主成分とする(f)である。Alはイオン化傾向が(g)いため，イオンを含む水溶液の電気分解では得られない。Alを得るには，融解した塩を電気分解する方法を用いる。この方法を(h)という。銅Cuの鉱石はCuFeS₂を主成分とする黄銅鉱などである。黄銅鉱を処理すると，純度約99%の(i)が得られる。この後，電極に(i)と純銅，電解液に硫酸銅(Ⅱ)水溶液を用いて電気分解し，純度約99.99%の銅を得る。この操作を(j)という。',
    answerVector: ['製錬', '鉄鉱石（赤鉄鉱・磁鉄鉱）', 'コークス', '銑鉄', '鋼', 'ボーキサイト', '大き', '溶融塩電解（融解塩電解）', '粗銅', '電解精錬'], N: 10,
    answerJp: '(a)製錬 (b)鉄鉱石（赤鉄鉱・磁鉄鉱） (c)コークス (d)銑鉄 (e)鋼 (f)ボーキサイト (g)大き (h)溶融塩電解（融解塩電解） (i)粗銅 (j)電解精錬',
    explCn: '鉄はコークスで還元して銑鉄→鋼に精製。Alはイオン化傾向が大きく水溶液では得られないため溶融塩電解。Cuは粗銅の電解精錬で純銅を得る。',
    issues: [],
  },

  // ---- 基本問題 ----
  {
    code: 'chem-che6-qB1', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '表は代表的な実用電池をまとめたものである。(1)空欄(a)に当てはまる語句と，(b)～(d)に当てはまる化学式をそれぞれ答えよ。(2)空欄(e)～(g)に当てはまる最も適切なものを(ア)～(ウ)から選べ（(ア)携帯電話・電気自動車，(イ)自動車のバッテリー，(ウ)リモコン・懐中電灯）。(3)充電によりくり返し使うことのできる電池は表の①，②のどちらか。また，そのような電池を何というか。(4)電池の正極で起こる反応は酸化反応・還元反応のいずれか。',
    answerVector: ['マンガン乾電池', 'KOH', 'Pb', 'PbO₂', 'ウ', 'イ', 'ア', '②', '二次電池（蓄電池）', '還元反応'], N: 10,
    answerJp: '(1)(a)マンガン乾電池 (b)KOH (c)Pb (d)PbO₂ (2)(e)ウ (f)イ (g)ア (3)②，二次電池（蓄電池） (4)還元反応',
    explCn: 'マンガン乾電池とアルカリマンガン乾電池は負極Zn・正極MnO₂が同じで電解液が異なる（後者はKOH）。鉛蓄電池（②）は二次電池。正極では電子を受け取る還元反応が起こる。',
    issues: [],
  },
  {
    code: 'chem-che6-qB2', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '次の文の( )に当てはまる語句を下の語群から選べ。(1)乾電池のような持ち運ぶ電池では電解液の漏れを防ぐ工夫が必要である。たとえば，(a)の電解液は塩化亜鉛の水溶液であるが，炭素粉末や酸化マンガン(Ⅳ)と混ぜてペースト状にしてある。電解液に水酸化カリウムの水溶液を用いている(b)でも同様の工夫がなされている。(2)(a)や(b)は一度使い切ると再利用できない電池で，このような電池を(c)という。一方，充電すれば再利用できる電池を(d)といい，自動車のバッテリーに使われる(e)や，携帯電話に使われる(f)などがある。(3)酸素と水素の反応を利用する(g)も電源などに使われるようになってきている。[語群]アルカリマンガン乾電池，鉛蓄電池，燃料電池，マンガン乾電池，リチウムイオン電池，一次電池，二次電池',
    answerVector: ['マンガン乾電池', 'アルカリマンガン乾電池', '一次電池', '二次電池', '鉛蓄電池', 'リチウムイオン電池', '燃料電池'], N: 7,
    answerJp: '(a)マンガン乾電池 (b)アルカリマンガン乾電池 (c)一次電池 (d)二次電池 (e)鉛蓄電池 (f)リチウムイオン電池 (g)燃料電池',
    explCn: '液漏れ防止のためマンガン乾電池系では電解液をペースト状にする。一次電池は再使用不可，二次電池は充電可能。燃料電池は水素と酸素の反応を利用する。',
    issues: [],
  },
  {
    code: 'chem-che6-qB3', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '亜鉛板と銅板を電解質水溶液中に浸した電池について答えよ。(1)図のような構造の電池を何というか。(2)亜鉛板と銅板で起こる変化をそれぞれe⁻を含むイオン反応式で表せ。(3)正極は亜鉛板か銅板か。(4)導線中の(a)電子の流れる方向，(b)電流の流れる方向は，それぞれ図中の①，②のどちらか。(5)取り出す電気量を多くするには，硫酸亜鉛水溶液および硫酸銅(Ⅱ)水溶液の濃度を初めにどのようにしておくのがよいか。(6)反応する亜鉛1mol当たり導線を流れる電子は何molか。また，その電気量は何Cか。',
    answerVector: ['ダニエル電池', 'Zn→Zn²⁺＋2e⁻', 'Cu²⁺＋2e⁻→Cu', '銅板', '①', '②', '硫酸亜鉛水溶液は低く，硫酸銅(Ⅱ)水溶液は高くしておく', '2mol', '1.93×10⁵C'], N: 9,
    answerJp: '(1)ダニエル電池 (2)Zn→Zn²⁺+2e⁻，Cu²⁺+2e⁻→Cu (3)銅板 (4)(a)電子① (b)電流② (5)ZnSO₄を低く，CuSO₄を高く (6)2mol，1.93×10⁵C',
    explCn: 'Znが溶けて電子を放出（負極・酸化），Cu板でCu²⁺が還元（正極）。電子は負極→正極へ，電流はその逆。Zn1molにつきe⁻2mol：9.65×10⁴×2=1.93×10⁵C。',
    issues: [],
  },
  {
    code: 'chem-che6-qB4', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '鉛蓄電池に関して次の問いに答えよ。(1)(a)負極活物質，(b)正極活物質，(c)電解質に用いられる物質は何か。(2)放電のときの負極，正極での反応を，それぞれe⁻を含むイオン反応式で表せ。(3)放電のときの電池全体の反応を化学反応式で表せ。(4)放電によって電解質の濃度はどのように変化するか。',
    answerVector: ['鉛Pb', '酸化鉛(Ⅳ)PbO₂', '希硫酸', 'Pb＋SO₄²⁻→PbSO₄＋2e⁻', 'PbO₂＋4H⁺＋SO₄²⁻＋2e⁻→PbSO₄＋2H₂O', 'Pb＋PbO₂＋2H₂SO₄→2PbSO₄＋2H₂O', '濃度は低くなる'], N: 7,
    answerJp: '(1)(a)鉛 (b)酸化鉛(Ⅳ) (c)希硫酸 (2)負極：Pb+SO₄²⁻→PbSO₄+2e⁻，正極：PbO₂+4H⁺+SO₄²⁻+2e⁻→PbSO₄+2H₂O (3)Pb+PbO₂+2H₂SO₄→2PbSO₄+2H₂O (4)濃度は低くなる',
    explCn: '放電では両極ともPbSO₄になり，H₂SO₄が消費されH₂Oが生じるため電解質の濃度は低くなる。',
    issues: [],
  },
  {
    code: 'chem-che6-qB5', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: 'リチウムイオン電池の負極と正極では，放電時に次の反応が起こる。[負極]C₆Li_x→6C+xLi⁺+xe⁻ [正極]Li_(1-x)CoO₂+xLi⁺+xe⁻→LiCoO₂。(1)放電時に質量が増加する電極は，負極と正極のどちらか。(2)充電時に外部電源の正極を接続する電極は，図の(ア)と(イ)のどちらか。(3)充電時の電池全体の反応を化学反応式で表せ。',
    answerVector: ['正極', 'イ', '6C＋LiCoO₂→C₆Li_x＋Li_(1-x)CoO₂'], N: 3,
    answerJp: '(1)正極 (2)イ (3)6C+LiCoO₂→C₆Li_x+Li_(1-x)CoO₂',
    explCn: '放電時，負極からLi⁺が放出され質量は減少，正極にLi⁺が取り込まれ質量増加。充電は放電の逆で，外部電源の正極は正極活物質側（イ）に接続する。',
    issues: [],
  },
  {
    code: 'chem-che6-qB6', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'native', Q: '燃料電池に関する記述として誤りを含むものを1つ選べ。',
    options: [
      '(ア) 水素と酸素の化学反応にともなって生じるエネルギーを，電気エネルギーとして取り出している。',
      '(イ) 電子が外部に流れ出る電極を負極，外部から流れこむ電極を正極とよぶ。',
      '(ウ) 負極では水素が，正極では酸素が反応している。',
      '(エ) 反応に使われる水素と酸素の標準状態における体積は等しい。',
      '(オ) 1Cの電気量を取り出すのに必要な水素の物質量は，水の電気分解において1Cの電気量を通じたときに発生する水素の物質量に等しい。',
    ], correctIndex: 3,
    answerJp: 'エ',
    explCn: '(エ)が誤り。全体の反応は2H₂+O₂→2H₂Oで，水素と酸素は体積比2:1で反応するので等しくない。(オ)は正しい（燃料電池の水素消費と電気分解の水素発生は同じ電気量で等しい）。',
    issues: [],
  },
  {
    code: 'chem-che6-qB15', category: '基本問題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '次の文の( )に適当な語句を入れよ。電解質水溶液に2本の電極を入れて直流電流を流すと，酸化還元反応が起こる。このとき，外部電源の正極に接続する電極を(a)といい，(b)反応が起こる。また，外部電源の負極に接続する電極を(c)といい，(d)反応が起こる。このように電流を用いて酸化還元反応を起こさせることを(e)という。',
    answerVector: ['陽極', '酸化', '陰極', '還元', '電気分解'], N: 5,
    answerJp: '(a)陽極 (b)酸化 (c)陰極 (d)還元 (e)電気分解',
    explCn: '陽極（電源の正極側）では電子を失う酸化反応，陰極（電源の負極側）では電子を受け取る還元反応。電流で酸化還元反応を起こすことを電気分解という。',
    issues: [],
  },
  {
    code: 'chem-che6-qB8', category: '基本問題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '次の(1)～(6)の電解液と電極の組合せで電気分解を行ったとき，陽極，陰極で起こる反応を，それぞれe⁻を用いたイオン反応式で表せ。(1)AgNO₃水溶液／Pt・Pt (2)希硫酸／Pt・Pt (3)CuSO₄水溶液／Pt・Pt (4)CuSO₄水溶液／Cu・Cu (5)NaCl水溶液／C・Fe (6)融解NaCl／C・Fe',
    answerVector: ['2H₂O→O₂＋4H⁺＋4e⁻', 'Ag⁺＋e⁻→Ag', '2H₂O→O₂＋4H⁺＋4e⁻', '2H⁺＋2e⁻→H₂', '2H₂O→O₂＋4H⁺＋4e⁻', 'Cu²⁺＋2e⁻→Cu', 'Cu→Cu²⁺＋2e⁻', 'Cu²⁺＋2e⁻→Cu', '2Cl⁻→Cl₂＋2e⁻', '2H₂O＋2e⁻→H₂＋2OH⁻', '2Cl⁻→Cl₂＋2e⁻', 'Na⁺＋e⁻→Na'], N: 12,
    answerJp: '(1)陽極：2H₂O→O₂+4H⁺+4e⁻，陰極：Ag⁺+e⁻→Ag (2)陽極：2H₂O→O₂+4H⁺+4e⁻，陰極：2H⁺+2e⁻→H₂ (3)陽極：2H₂O→O₂+4H⁺+4e⁻，陰極：Cu²⁺+2e⁻→Cu (4)陽極：Cu→Cu²⁺+2e⁻，陰極：Cu²⁺+2e⁻→Cu (5)陽極：2Cl⁻→Cl₂+2e⁻，陰極：2H₂O+2e⁻→H₂+2OH⁻ (6)陽極：2Cl⁻→Cl₂+2e⁻，陰極：Na⁺+e⁻→Na',
    explCn: '陽極では，水溶液中にCl⁻があるとCl⁻が酸化されCl₂，その他では水が酸化されO₂（Cu・Ag極では極板が溶ける）。陰極では，イオン化傾向の小さい金属イオンがあれば析出，水溶液では水が還元されH₂，融解塩では陽イオンがそのまま析出する。',
    issues: [],
  },
  {
    code: 'chem-che6-qB9', category: '基本問題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '炭素電極を用いて，塩化銅(Ⅱ)水溶液に0.50Aの電流を32分10秒間流した。(1)陽極，陰極で起こった反応を，それぞれe⁻を含むイオン反応式で表せ。(2)陽極では酸化，還元のどちらが起こったか。(3)流れた電気量は何Cか。また流れた電子は何molか。(4)陰極の質量は何g増加するか。(5)陽極で発生した気体は標準状態で何Lか。',
    answerVector: ['2Cl⁻→Cl₂＋2e⁻', 'Cu²⁺＋2e⁻→Cu', '酸化', '9.7×10²C', '0.010mol', '0.32g', '0.11L'], N: 7,
    answerJp: '(1)陽極：2Cl⁻→Cl₂+2e⁻，陰極：Cu²⁺+2e⁻→Cu (2)酸化 (3)9.7×10²C，0.010mol (4)0.32g (5)0.11L',
    explCn: 'Q=0.50×(32×60+10)=965C=9.7×10²C，e⁻=965/9.65×10⁴=0.010mol。Cu：64×(0.010/2)=0.32g。Cl₂：22.4×(0.010/2)=0.112L=0.11L。',
    issues: [],
  },
  {
    code: 'chem-che6-qB10', category: '基本問題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '硫酸銅(Ⅱ)水溶液100mLをとり，白金を電極として1.0Aの電流を通じたところ，すべての銅(Ⅱ)イオンを銅として析出させるのに32分10秒間必要であった。(1)この電気分解の反応を1つにまとめた化学反応式を記せ。(2)析出した銅は何gか。(3)最初の硫酸銅(Ⅱ)水溶液の濃度は何mol/Lか。(4)陽極で発生する気体は何か。また，それは何molか。(5)電気分解終了後の溶液中には，何イオンが何mol含まれているか。(6)両電極を銅として電気分解すると，硫酸銅(Ⅱ)水溶液の濃度は電気分解の前後でどのように変わるか。',
    answerVector: ['2CuSO₄＋2H₂O→2Cu＋2H₂SO₄＋O₂', '0.64g', '0.10mol/L', '酸素O₂', '5.0×10⁻³mol', '水素イオン0.020mol，硫酸イオン0.010mol', '変わらない'], N: 7,
    answerJp: '(1)2CuSO₄+2H₂O→2Cu+2H₂SO₄+O₂ (2)0.64g (3)0.10mol/L (4)酸素O₂，5.0×10⁻³mol (5)水素イオン0.020mol，硫酸イオン0.010mol (6)変わらない',
    explCn: 'Q=1.0×(32×60+10)=1930C，e⁻=0.020mol。Cu：64×(0.020/2)=0.64g。O₂はe⁻4molにつき1mol=0.020/4=5.0×10⁻³mol。Cu²⁺0.010molが全析出，H⁺0.020mol生成，SO₄²⁻0.010molが残る。両極銅なら陽極溶解分と陰極析出分が同量で濃度不変。',
    issues: [],
  },
  {
    code: 'chem-che6-qB11', category: '基本問題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '両電極を白金として希硫酸を電気分解した。このときの平均の電流の強さは2.50Aであり，標準状態で両電極合計336mLの気体が発生した。(1)両電極での変化をそれぞれe⁻を含むイオン反応式で表せ。(2)両電極での変化を1つにまとめた化学反応式を記せ。(3)9.65×10⁴Cの電気量で発生する気体は，陽極，陰極それぞれ標準状態で何Lか。(4)標準状態で両電極合計336mLの気体が発生するのに必要な電気量は何Cか。(5)電気分解をした時間は何分何秒間か。',
    answerVector: ['2H₂O→O₂＋4H⁺＋4e⁻', '2H⁺＋2e⁻→H₂', '2H₂O→2H₂＋O₂', '陽極5.60L，陰極11.2L', '1.93×10³C', '12分52秒'], N: 6,
    answerJp: '(1)陽極：2H₂O→O₂+4H⁺+4e⁻，陰極：2H⁺+2e⁻→H₂ (2)2H₂O→2H₂+O₂ (3)陽極5.60L，陰極11.2L (4)1.93×10³C (5)12分52秒',
    explCn: '9.65×10⁴Cでe⁻1mol。O₂は1/4mol=5.60L，H₂は1/2mol=11.2L，合計16.8L。336mLのときQ=9.65×10⁴×(0.336/16.8)=1.93×10³C。t=1930/2.50=772s=12分52秒。',
    issues: [],
  },
  {
    code: 'chem-che6-qB12', category: '基本問題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: 'イオン交換膜法による塩化ナトリウム水溶液の電気分解について，図を参照して答えよ。(1)図中，右室から左室へ移動するイオンA，左室から右室へ移動できないイオンB，陰極で反応する物質C，反応生成物D，E，Fの化学式を記せ。(2)2.5Aの電流を16分5秒間流したときに発生する気体D，Eの体積は標準状態でそれぞれ何Lか。ただし，気体は溶けたり反応したりしないものとする。(3)(2)と同時に生じる物質Fの質量は何gか。',
    answerVector: ['Na⁺', 'OH⁻', 'H₂O', 'Cl₂', 'H₂', 'NaOH', 'D：0.28L', 'E：0.28L', '1.0g'], N: 9,
    answerJp: '(1)A：Na⁺，B：OH⁻，C：H₂O，D：Cl₂，E：H₂，F：NaOH (2)D：0.28L，E：0.28L (3)1.0g',
    explCn: 'Q=2.5×(16×60+5)=2.5×965C，e⁻=0.025mol。Cl₂・H₂ともe⁻2molにつき1mol→0.0125mol→0.28L。NaOHはe⁻1molにつき1mol生成→40×0.025=1.0g。',
    issues: [],
  },
  {
    code: 'chem-che6-qB16', category: '基本問題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '鉄は，原料の鉄鉱石に(a)やコークスを加え，高温で反応させることで製錬する。鉄鉱石に含まれる酸化鉄Fe₂O₃を溶鉱炉でFe₂O₃→(b)→FeO→Feと順に(c){酸化・還元}することで，炭素を多く含む(d)が得られる。(d)を転炉で酸素と反応させて炭素分を減らすと，硬くて強い(e)が得られる。(1)(a)～(e)に適当な語句や化学式を入れよ。(c)は適当なものを選べ。(2)コークスの役割を説明せよ。(3)下線部（転炉で酸素と反応）ではどのような反応が起こっているか。化学反応式を1つ書け。',
    answerVector: ['石灰石', 'Fe₃O₄', '還元', '銑鉄', '鋼', '鉄鉱石を還元するための一酸化炭素を発生させる役割', 'C＋O₂→CO₂　（他：2C＋O₂→2CO）'], N: 7,
    answerJp: '(1)(a)石灰石 (b)Fe₃O₄ (c)還元 (d)銑鉄 (e)鋼 (2)鉄鉱石を還元するための一酸化炭素を発生させる役割 (3)C+O₂→CO₂，2C+O₂→2CO など',
    explCn: '石灰石は不純物のSiO₂をスラグとして分離。コークスのCはCOを発生させFe₂O₃を還元。転炉ではCがO₂と反応して除かれ鋼になる。',
    issues: [],
  },
  {
    code: 'chem-che6-qB13', category: '基本問題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '粗銅（不純物としてAu，Ag，Fe，Znなどを含む）から純銅を得るための装置について答えよ。(1)粗銅板と純銅板のどちらを陽極に用いればよいか。(2)陽極，陰極で起こるおもな反応を，それぞれe⁻を用いたイオン反応式で表せ。(3)この電気分解では，粗銅に含まれる不純物の金属は純銅板に析出しない。その理由を，(a)銅よりイオン化傾向が大きい金属，(b)銅よりイオン化傾向が小さい金属について，それぞれ説明せよ。',
    answerVector: ['粗銅板', 'Cu→Cu²⁺＋2e⁻', 'Cu²⁺＋2e⁻→Cu', '(a)銅よりイオン化傾向が大きいため，銅とともに陽極から溶けるが，陰極では銅の析出が優先して起こるから', '(b)銅よりイオン化傾向が小さいため，陽極で溶けず，単体のまま陽極の下に沈殿するから'], N: 5,
    answerJp: '(1)粗銅板 (2)陽極：Cu→Cu²⁺+2e⁻，陰極：Cu²⁺+2e⁻→Cu (3)(a)イオン化傾向がCuより大きい金属は陽極で共に溶けるが陰極ではCuの析出が優先するから (b)イオン化傾向がCuより小さい金属は陽極で溶けず陽極泥として沈殿するから',
    explCn: '陽極に粗銅を用いるとCuが溶け，陰極に純銅が析出する。Cuよりイオン化傾向が大きいFe・Znは溶液中に残り，小さいAu・Agは陽極泥となる。',
    issues: [],
  },
  {
    code: 'chem-che6-qB14', category: '基本問題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: 'アルミニウムAlの原料である(a)は赤茶色の鉱石であり，これを精製することで白色の酸化アルミニウムAl₂O₃が得られる。Alはイオン化傾向が(b)いため，イオンを含む水溶液を電気分解しても，かわりに(c)が反応するだけで，Alは取り出せない。そこで，1000°C程度で融解した(d)にAl₂O₃を溶かして，電気分解により単体のアルミニウムを得る方法が用いられている。(1)空欄( )に適当な語句を入れよ。(2)Al₂O₃そのものを融解させるのではなく，下線部の方法をとるのはなぜか。',
    answerVector: ['ボーキサイト', '大き', '水', '氷晶石', 'より低い温度で溶融塩電解を行うため'], N: 5,
    answerJp: '(1)(a)ボーキサイト (b)大き (c)水 (d)氷晶石 (2)より低い温度で溶融塩電解を行うため',
    explCn: 'Al₂O₃は融点2054℃と高く融解しにくいが，融解した氷晶石には溶けるため，1000℃程度の低温で溶融塩電解できる。',
    issues: [],
  },

  // ---- 応用例題 ----
  {
    code: 'chem-che6-qA1', category: '応用例題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '鉛蓄電池を放電したところ，鉛極の質量が4.8g増加した。(1)このとき流れた電気量は何Cか。ファラデー定数=9.65×10⁴C/molとする。(2)酸化鉛(Ⅳ)極の質量はどれだけ変化したか。増，減を付して答えよ。(3)電解液として30.0%の希硫酸500gを用いたとすると，放電後の希硫酸は何gか。また，濃度は何%か。H=1.0，O=16，S=32，Pb=207とする。',
    answerVector: ['9.65×10³C', '3.2g増', '492g', '28.5%'], N: 4,
    answerJp: '(1)9.65×10³C (2)3.2g増 (3)492g，28.5%',
    explCn: 'Pb→PbSO₄で質量が(303-207)=96g/mol増えるので4.8/96=0.050molのPbが反応（e⁻0.10mol）→9.65×10³C。PbO₂→PbSO₄で(303-239)=64g/mol×0.050=3.2g増。溶液はH₂SO₄9.8g消費・H₂O1.8g生成で492g，濃度=(150-9.8)/492=28.5%。',
    issues: [],
  },
  {
    code: 'chem-che6-qA2', category: '応用例題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '電解槽Aには硫酸銅(Ⅱ)水溶液を，電解槽Bには硝酸銀水溶液を入れ，AとBを並列につないで白金電極を使って電気分解を行った。電流計の読みが0.400Aの一定値になるように調節しながら64分20秒間通じたところ，電解槽Aの陽極で発生した気体は標準状態で67.2mLであった。Ag=108とする。(1)流れた全電気量は何Cか。(2)電解槽Aの陽極での反応をe⁻を含むイオン反応式で表せ。(3)電解槽Aに流れた電気量は何Cか。(4)電解槽Bに流れた電気量は何Cか。(5)電解槽Bの陰極には何が何g生じたか。',
    answerVector: ['1.54×10³C', '2H₂O→O₂＋4H⁺＋4e⁻', '1.16×10³C', '3.9×10²C', '銀Ag 0.43g'], N: 5,
    answerJp: '(1)1.54×10³C (2)2H₂O→O₂+4H⁺+4e⁻ (3)1.16×10³C (4)3.9×10²C (5)銀0.43g',
    explCn: 'Q全体=0.400×(64×60+20)=1.544×10³C。AのO₂は0.003mol→e⁻0.012mol→1.158×10³C。B=1544-1158=386C→e⁻4.00×10⁻³mol→Ag108×4.00×10⁻³=0.432g=0.43g。',
    issues: [],
  },

  // ---- 応用問題 ----
  {
    code: 'chem-che6-qA3', category: '応用問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: 'ある電解質の水溶液に，電極として2種類の金属A，Bを浸して電池とした。この電位差を電池の(a)という。A，Bのうち，イオン化傾向の小さいほうの金属が(b)極となる。この電池を放電させるとき，還元反応が起こる電極は電池の(c)極である。また，放電によって一方の電極上で水素が発生するとき，その電極は(d)極である。(1)上の文の( )に適当な語句を入れよ。(2)希硫酸に電極として亜鉛板と銅板を浸して電池としたとき，一方の電極上でのみ水素が発生した。水素が発生する反応をe⁻を含むイオン反応式で表せ。(3)(2)の電池で，一方の電極の質量が6.5mg減少した。このとき流れた電気量は何Cか。また，このとき発生した水素は標準状態で何mLか。',
    answerVector: ['起電力（電圧）', '正', '正', '正', '2H⁺＋2e⁻→H₂', '19C', '2.2mL'], N: 7,
    answerJp: '(1)(a)起電力（電圧） (b)正 (c)正 (d)正 (2)2H⁺+2e⁻→H₂ (3)19C，2.2mL',
    explCn: 'イオン化傾向の小さい金属が正極で還元反応，H⁺の還元で水素が発生（正極）。Zn6.5mg=1.0×10⁻⁴mol→e⁻2.0×10⁻⁴mol→19.3C=19C，H₂1.0×10⁻⁴mol→2.24mL=2.2mL。',
    issues: [],
  },
  {
    code: 'chem-che6-qA4', category: '応用問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '(1)鉛蓄電池を放電して，5.79×10⁴Cの電気量を取り出した。(a)この放電により，正極の質量は何g変化したか。増，減を付して答えよ。(b)放電前の希硫酸の質量が1000g，質量パーセント濃度が32%であったとき，放電後の硫酸の質量パーセント濃度は何%になるか。(2)質量パーセント濃度25.0%の希硫酸を同量入れた6個の鉛蓄電池を直列に接続し，5.0Aの電流で1930秒間充電したところ，希硫酸の濃度は30.0%になった。最初の6個の鉛蓄電池に入れた希硫酸の総質量は何kgか。',
    answerVector: ['19g増', '27%', '0.89kg'], N: 3,
    answerJp: '(1)(a)19g増 (b)27% (2)0.89kg',
    explCn: '(1)e⁻=0.600mol。正極PbO₂→PbSO₄で64g/mol×(0.600/2)=19.2g=19g増。H₂SO₄58.8g消費・H₂O10.8g生成で質量48.0g減，(320-58.8)/(1000-48.0)=27.4=27%。(2)充電e⁻0.10molでH₂SO₄0.10mol生成・H₂O0.10mol減少。x×0.25+9.8=0.30(x+9.8-1.8)よりx=148g，6個で888g=0.89kg。',
    issues: [],
  },
  {
    code: 'chem-che6-qA5', category: '応用問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '水素-酸素燃料電池について，次の文の( )に適当な語句，数値を入れよ。濃いリン酸水溶液を電解液に用い，電池の(a)極に水素を送ると，H₂→2H⁺+2e⁻の反応で水素は(b)される。また，電池の(c)極に酸素を送ると，O₂+(e)H⁺+(f)e⁻→(g)H₂Oの反応で酸素は(d)される。このようにして外部回路を電子が流れ1.00molの水素が消費されるとき，1.00Aの電流を(h)時間流すことができる。',
    answerVector: ['負', '酸化', '正', '還元', '4', '4', '2', '53.6'], N: 8,
    answerJp: '(a)負 (b)酸化 (c)正 (d)還元 (e)4 (f)4 (g)2 (h)53.6',
    explCn: '負極でH₂が酸化（H₂→2H⁺+2e⁻），正極でO₂が還元（O₂+4H⁺+4e⁻→2H₂O）。H₂1molでe⁻2mol=1.93×10⁵C，1.00Aで53.6時間。',
    issues: [],
  },
  {
    code: 'chem-che6-qA6', category: '応用問題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '次の文の(a)，(b)には解答群から適当なものを選び，(c)～(e)には有効数字2桁の数値を入れよ。電極として1枚15.0gの(a)板を用い，(b)水溶液を電気分解したところ，200分後に一方の電極は19.0g，他方の電極は11.0gになっていた。このとき電極に析出した物質は1分間当たり(c)mol，流れた電子は1分間当たり(d)molとなる。よって，電流値が常に一定であったとすると，その値は(e)Aとなる。[解答群] 金 白金 銀 銅 ナトリウム 鉛 FeSO₄ NaCl H₂SO₄ CuSO₄ KCl MgCl₂',
    answerVector: ['銅', 'CuSO₄', '3.1×10⁻⁴', '6.3×10⁻⁴', '1.0'], N: 5,
    answerJp: '(a)銅 (b)CuSO₄ (c)3.1×10⁻⁴ (d)6.3×10⁻⁴ (e)1.0',
    explCn: '陽極の溶解量4.0gと陰極の析出量4.0gが等しく両極の金属が同じで，溶液も同じ金属イオンを含む→CuとCuSO₄。析出Cu=0.020g/分=3.125×10⁻⁴mol/分。e⁻は2倍で6.25×10⁻⁴mol/分。I=9.65×10⁴×(6.25×10⁻⁴/60)=1.0A。',
    issues: [],
  },
  {
    code: 'chem-che6-qA7', category: '応用問題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '陽イオン交換膜で仕切られたA室（陽極室）とB室（陰極室）があり，A室には1.00mol/Lの塩化ナトリウム水溶液1.0L，B室には0.10mol/Lの水酸化ナトリウム水溶液2.0Lが入っている。陽極に炭素，陰極に白金を用いて電気分解をしたところ，A室の塩化ナトリウム水溶液の濃度が0.80mol/Lになった。(1)B室で発生した気体の体積は標準状態で何Lか。(2)B室内の溶液の水酸化物イオン濃度は何mol/Lになったか。ただし，電気分解の前後で水溶液の体積は変わらないものとする。',
    answerVector: ['2.2L', '0.20mol/L'], N: 2,
    answerJp: '(1)2.2L (2)0.20mol/L',
    explCn: 'A室のNaClが0.20mol減少→e⁻0.20mol→B室でH₂0.10mol生成→2.24L=2.2L。OH⁻は(0.20+0.20)mol/2.0L=0.20mol/L。',
    issues: [],
  },
  {
    code: 'chem-che6-qA8', category: '応用問題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '0.020molの硫酸ニッケル(Ⅱ)と0.020molの硫酸を含む200mLの水溶液を，両電極を白金として1時間15分電気分解したところ，陰極では質量が0.295g増加し，同時に標準状態で0.112Lの気体が発生した。(1)流れた電流は何Aか。(2)陽極で発生した気体は標準状態で何Lか。(3)電気分解後の硫酸のモル濃度は何mol/Lか。',
    answerVector: ['0.43A', '0.11L', '0.13mol/L'], N: 3,
    answerJp: '(1)0.43A (2)0.11L (3)0.13mol/L',
    explCn: 'Ni(59)0.295g=0.0050molにe⁻0.010mol，H₂0.0050molにe⁻0.010mol，計e⁻0.020mol。Q=1.93×10³C，I=1930/4500=0.43A。O₂=e⁻/4=0.0050mol→0.112L=0.11L。H₂SO₄増加0.0050mol，(0.020+0.0050)/0.200=0.125=0.13mol/L。',
    issues: [],
  },
  {
    code: 'chem-che6-qA9', category: '応用問題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '白金を電極とし，電解槽Ⅰには塩化ナトリウム水溶液，電解槽Ⅱには硫酸銅(Ⅱ)水溶液を入れて直列につなぎ，5.00Aの電流を64分20秒間流した。(1)電極A，Cに流れた電気量は，それぞれ何Cか。(2)電極B，Cで発生する気体は，それぞれ何か。また，その体積は標準状態で何Lか。(3)電極Dの質量は何g変化するか。増，減を付して答えよ。(4)電気分解後の各溶液のpHは電気分解前に比べて，それぞれ大きいか小さいか。',
    answerVector: ['1.93×10⁴C', 'B：水素H₂，2.24L', 'C：酸素O₂，1.12L', '6.4g増', '電解槽Ⅰ：大きい，電解槽Ⅱ：小さい'], N: 5,
    answerJp: '(1)それぞれ1.93×10⁴C (2)B：水素2.24L，C：酸素1.12L (3)6.4g増 (4)電解槽Ⅰ：大きい，電解槽Ⅱ：小さい',
    explCn: '直列なのでどの電極も同じ電気量：Q=5.00×(64×60+20)=1.93×10⁴C，e⁻0.200mol。B（NaCl槽の陰極）でH₂0.100mol=2.24L。C（CuSO₄槽の陽極）でO₂0.050mol=1.12L。DでCu0.100mol=6.4g析出。',
    issues: [],
  },
  {
    code: 'chem-che6-qA10', category: '応用問題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '0.100mol/Lの硝酸銀水溶液100.0mLを入れた電解槽Aと，0.100mol/Lの硫酸銅(Ⅱ)水溶液100.0mLを入れた電解槽Bを並列につなぎ，全電極を白金として総電流0.500Aの電流で1.00時間電気分解した。0.100mol/Lの塩化ナトリウム水溶液10.00mLは，電気分解後のA槽の水溶液16.67mLと過不足なく反応した。次の問いに有効数字2桁で答えよ。(1)電解槽AおよびBを通過した電気量の総量は何Cか。(2)電解槽Aの陰極に析出した銀は何gか。(3)電解槽Bを流れた電流は何Aか。(4)電解槽Bで発生する気体は標準状態で何mLか。',
    answerVector: ['1.8×10³C', '0.43g', '0.39A', '82mL'], N: 4,
    answerJp: '(1)1.8×10³C (2)0.43g (3)0.39A (4)82mL',
    explCn: 'Q総=0.500×3600=1.8×10³C。残留Ag⁺=0.0600mol/L（滴定より）→析出Ag=(0.100-0.0600)×0.100=0.00400mol=0.43g→Aの電気量386C。B=1800-386=1414C→I=0.39A。O₂=1414/(9.65×10⁴)×(1/4)=0.00366mol→82mL。',
    issues: [],
  },
  {
    code: 'chem-che6-qA11', category: '応用問題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '鉄は，溶鉱炉（高炉）中でコークス（炭素）を用いて鉄鉱石を(a)して得る。このとき得られる鉄は(b)とよばれ，炭素を4%程度含んでいて，硬くてもろい。(b)を転炉に入れて酸素を吹きこみ，炭素を2%以下にした鉄を(c)という。(1)次の鉄鉱石の主成分の化学式をそれぞれ記せ。①赤鉄鉱 ②磁鉄鉱。(2)溶鉱炉中では，コークスが反応して生じた気体が鉄鉱石を(a)している。この気体の物質名と化学式を答えよ。(3)鉄の含有率96%の(b)を1.0kg得るには，理論上何kgの酸化鉄(Ⅲ)Fe₂O₃が必要か。',
    answerVector: ['還元', '銑鉄', '鋼', '①Fe₂O₃', '②Fe₃O₄', '一酸化炭素CO', '1.4kg'], N: 7,
    answerJp: '(a)還元 (b)銑鉄 (c)鋼 (1)①Fe₂O₃ ②Fe₃O₄ (2)一酸化炭素CO (3)1.4kg',
    explCn: 'C+O₂→CO₂，CO₂+C→2COで生じたCOがFe₂O₃を還元。Fe₂O₃中Feの割合112/160=0.7，0.96kgのFeを得るには0.96/0.7=1.37=1.4kg。',
    issues: [],
  },
  {
    code: 'chem-che6-qA12', category: '応用問題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: 'ニッケルと銀を含む粗銅200.0gを陽極に，純銅を陰極に用いて硫酸銅(Ⅱ)水溶液中で電気分解を行った。9.65Aの電流を400分間流したところ，陽極の質量が120.0gとなり，陽極の下に不溶物（陽極泥）が4.0g沈殿した。(1)陰極の質量は何g増加したか。(2)粗銅中の銅の質量の割合は何%か。',
    answerVector: ['77g', '83%'], N: 2,
    answerJp: '(1)77g (2)83%',
    explCn: 'e⁻=9.65×(400×60)/9.65×10⁴=2.40mol。Cu：64×(2.40/2)=76.8g=77g。溶解したCu+Ni=80.0-4.0=76.0g，64x+59y=76.0，2x+2y=2.40よりx=1.04mol=66.6g，割合66.6/80.0=83%。',
    issues: [],
  },
  {
    code: 'chem-che6-qA13', category: '応用問題', topic: TOPIC_E, subtopics: SUBTOPIC_E,
    optMode: 'multi', Q: '融解した水晶石に酸化アルミニウムを加え，両電極に炭素を用いて電気分解すると，陰極でアルミニウムが析出する。陽極では生じた酸素が炭素電極と反応して二酸化炭素と一酸化炭素が発生し，炭素電極が消耗する。(1)この電気分解によって，アルミニウムが1800g析出した。この電気分解に要した電気量は何Cか。(2)(1)のとき，陽極の消耗量は1140gであった。発生した二酸化炭素と一酸化炭素の物質量の比をCO₂:CO=1:□の形で求めよ。ただし，陽極で発生した酸素はすべて炭素電極と反応したものとする。',
    answerVector: ['1.9×10⁷C', '1：18'], N: 2,
    answerJp: '(1)1.9×10⁷C (2)1:18',
    explCn: 'Al³⁺+3e⁻→Alで，1800/27=66.7molのAlにe⁻200mol→9.65×10⁴×200=1.93×10⁷C=1.9×10⁷C。CO₂になるCをx，COになるCをyとすると12x+12y=1140，4x+2y=200→x=5.0，y=90→x:y=1:18。',
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
  console.log('che6 drafts:', d.length);
  const s = new Map();
  d.forEach((x) => s.set(x.generationStatus, (s.get(x.generationStatus) || 0) + 1));
  console.log('status:', Object.fromEntries(s));
  const nat = d.filter((x) => x.options.length > 0 && x.correctIndex !== null);
  console.log('有选项+答案的题:', nat.map((x) => `${x.businessCode}(idx=${x.correctIndex})`).join(', '));
}