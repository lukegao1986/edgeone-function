#!/usr/bin/env node
/**
 * che5 Step6 试点内容定义
 *
 * 数据源唯一为基础题块 che5 blocks（来源 SHA-256 与 che1~che4 同一 lock 文件）。
 * 每题定义：答案(源自 che5_解析.md)、选项(语义成立、正确唯一)、中文解析、考点、状态。
 * 策略沿用 che1~che4：作图/记述题 → 语言描述图特征 / 参考答案要点作选项；多空题 → D1 组合。
 *
 * che5 整章 = 第5章 化学反応とエネルギー → chem_2_3_1（化学反応とエネルギー）
 */
const path = require('path');

const CANDIDATE = '/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/Chem/_meta/chem_question_blocks_candidate_2026-10-12_v2.json';
const blocksPayload = require(CANDIDATE);
const blocks = blocksPayload.blocks.filter((b) => b.unitCode === 'che5');
const byCode = new Map(blocks.map((b) => [b.businessCode, b]));

const TOPIC = 'chem_2_3_1';
const SUBTOPIC = ['chem_2_3_1_01'];

const CONTENT = [
  // ---- 基礎 CHECK ----
  {
    code: 'chem-che5-qC1', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '化学反応が起こるとき，(1)観察の対象となる部分，(2)それ以外の部分をそれぞれ何というか。',
    answerVector: ['系', '外界'], N: 2,
    answerJp: '(1)系 (2)外界',
    explCn: '化学変化では，観察の対象となる部分を「系」，それ以外の周囲を「外界」という。',
    issues: [],
  },
  {
    code: 'chem-che5-qC2', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: '一定圧力で化学反応が起こるとき，放出したり吸収したりする熱量を何というか。',
    options: ['反応エンタルピー', '燃焼エンタルピー', '溶解エンタルピー', '反応の速さ'], correctIndex: 0,
    answerJp: '反応エンタルピー',
    explCn: '一定圧力下で，化学反応に伴って放出・吸収される熱量を反応エンタルピー（反応熱）という。',
    issues: [],
  },
  {
    code: 'chem-che5-qC3', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '(1)外界に熱を放出しながら進む反応を何というか。(2)外界から熱を吸収しながら進む反応を何というか。',
    answerVector: ['発熱反応', '吸熱反応'], N: 2,
    answerJp: '(1)発熱反応 (2)吸熱反応',
    explCn: '反応物のエンタルピーが生成物より大きいとき差を外界へ放出し発熱反応，小さいとき外界から吸収し吸熱反応となる。',
    issues: [],
  },
  // 题4 → qC12（businessCode 非线性：qC12=原题4）
  {
    code: 'chem-che5-qC12', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: '生成物のもつエンタルピーが反応物のもつエンタルピーより大きいとき，発熱反応と吸熱反応のどちらになるか。',
    options: ['吸熱反応', '発熱反応', '中和反応', '可逆反応'], correctIndex: 0,
    answerJp: '吸熱反応',
    explCn: '生成物のエンタルピーが反応物より大きいときは，差に当たるエネルギーを外界から受け取るので吸熱反応（ΔH＞0）である。',
    issues: [],
  },
  // 题5 → qC4
  {
    code: 'chem-che5-qC4', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: '反応エンタルピーΔH＞0となるのは，発熱反応と吸熱反応のどちらか。',
    options: ['吸熱反応', '発熱反応', '光化学反応', '触媒反応'], correctIndex: 0,
    answerJp: '吸熱反応',
    explCn: '吸熱反応では反応エンタルピーが正（ΔH＞0），発熱反応では負（ΔH＜0）。',
    issues: [],
  },
  // 题6 → qC5
  {
    code: 'chem-che5-qC5', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '次の(1)～(4)の反応エンタルピーを何というか。(1)化合物1molが成分元素の単体から生成するとき。(2)物質1molが完全燃焼するとき。(3)溶質1molが多量の水に溶解するとき。(4)酸と塩基とが反応して水1molが生じるとき。',
    answerVector: ['生成エンタルピー', '燃焼エンタルピー', '溶解エンタルピー', '中和エンタルピー'], N: 4,
    answerJp: '(1)生成エンタルピー (2)燃焼エンタルピー (3)溶解エンタルピー (4)中和エンタルピー',
    explCn: '生成エンタルピー＝単体から化合物1molができる変化；燃焼＝物質1molの完全燃焼；溶解＝溶質1molが多量の溶媒に溶ける；中和＝水1molが生じる変化。',
    issues: [],
  },
  // 题7 → qC6
  {
    code: 'chem-che5-qC6', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '次の反応で表されるエンタルピー変化を何というか。(1)H₂O(液)→H₂O(気) ΔH=44kJ (2)H₂O(固)→H₂O(液) ΔH=6.0kJ',
    answerVector: ['（水の）蒸発エンタルピー', '（水の）融解エンタルピー'], N: 2,
    answerJp: '(1)水の蒸発エンタルピー (2)水の融解エンタルピー',
    explCn: '液体→気体の変化が蒸発エンタルピー，固体→液体の変化が融解エンタルピー。いずれも吸熱（ΔH＞0）。',
    issues: [],
  },
  // 题8 → qC7
  {
    code: 'chem-che5-qC7', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: '炭素（黒鉛）1molが完全燃焼してCO₂が生じるときの燃焼エンタルピーが-394kJ/molであることを，エンタルピー変化を付した反応式で表せ。',
    options: ['C(黒鉛)＋O₂(気)→CO₂(気)  ΔH=-394kJ', 'C(黒鉛)＋O₂(気)→CO₂(気)  ΔH=+394kJ', 'C(黒鉛)＋1/2O₂(気)→CO(気)  ΔH=-394kJ', '2C(黒鉛)＋2O₂(気)→2CO₂(気)  ΔH=-394kJ'], correctIndex: 0,
    answerJp: 'C(黒鉛)＋O₂(気)→CO₂(気)  ΔH=-394kJ',
    explCn: '燃焼エンタルピーは着目物質1molの完全燃焼で表し，発熱なのでΔH＜0。',
    issues: [],
  },
  // 题9 → qC13
  {
    code: 'chem-che5-qC13', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: '水素0.400gが燃えると57.2kJの熱が発生する。水素の燃焼エンタルピーは何kJ/molか。H=1.00。',
    options: ['-286', '-143', '-572', '-114'], correctIndex: 0,
    answerJp: '-286 kJ/mol',
    explCn: 'H₂=2.00g/molより，0.400g=0.200mol。(-57.2kJ)×(1/0.200)=-286kJ/mol。',
    issues: [],
  },
  // 题10 → qC8
  {
    code: 'chem-che5-qC8', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: '「物質が変化するときの反応エンタルピーの総和は，変化の前後の物質の種類と状態だけで決まり，経路や方法には関係しない。」この法則は何とよばれるか。',
    options: ['ヘスの法則', 'ボイルの法則', 'ルシャトリエの原理', '質量作用の法則'], correctIndex: 0,
    answerJp: 'ヘスの法則（総熱量保存の法則）',
    explCn: '反応エンタルピーが経路に依存しないことをいうのがヘスの法則。',
    issues: [],
  },
  // 题11 → qC9
  {
    code: 'chem-che5-qC9', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: '分子内の共有結合を切断して，ばらばらの原子にするのに必要なエネルギーを何というか。',
    options: ['結合エネルギー', '電離エネルギー', '格子エネルギー', '活性化エネルギー'], correctIndex: 0,
    answerJp: '結合エネルギー',
    explCn: '共有結合1molを切断し原子にするのに必要なエネルギーを結合エネルギー（ΔH＞0）という。',
    issues: [],
  },
  // 题12 → qC10
  {
    code: 'chem-che5-qC10', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: '光の吸収によって引き起こされたり促進されたりする化学反応を何というか。',
    options: ['光化学反応', '触媒反応', '発光反応', '蛍光反応'], correctIndex: 0,
    answerJp: '光化学反応',
    explCn: '光エネルギーを吸収して進む化学反応を光化学反応という。',
    issues: [],
  },
  // 题13 → qC11
  {
    code: 'chem-che5-qC11', category: '基礎 CHECK', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: 'それ自身は変化しないが，反応を速く進めるはたらきをもつものを何というか。また，光が当たることでそのようなはたらきを示すものを特に何というか。',
    answerVector: ['触媒', '光触媒'], N: 2,
    answerJp: '触媒，光触媒',
    explCn: '反応前後で変化せず反応速度を上げる触媒のうち，光照射で働くもの（酸化チタン(Ⅳ)等）を光触媒という。',
    issues: [],
  },

  // ---- 基本例題 ----
  {
    code: 'chem-che5-qE1', category: '基本例題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '次の事項をエンタルピー変化を付した反応式で表せ（原子量H=1.0,N=14,O=16,K=39，整数値kJ）。(1)メタンCH₄1molが完全燃焼すると891kJの熱を放出した。(2)単体からメタノールCH₃OH1molが生じると239kJの発熱があった。(3)硝酸カリウム2.0gを水98gに溶かすと温度が1.7K下がった。(4)希塩酸と希NaOH水溶液の中和で水6.0gが生じたとき18.8kJの発熱があった。',
    answerVector: [
      'CH₄(気)＋2O₂(気)→CO₂(気)＋2H₂O(液)  ΔH=-891kJ',
      'C(黒鉛)＋2H₂(気)＋1/2O₂(気)→CH₃OH(液)  ΔH=-239kJ',
      'KNO₃(固)＋aq→KNO₃aq  ΔH=35kJ',
      'HClaq＋NaOHaq→NaClaq＋H₂O(液)  ΔH=-56kJ',
    ], N: 4,
    answerJp: '(1)CH₄(気)+2O₂(気)→CO₂(気)+2H₂O(液) ΔH=-891kJ (2)C(黒鉛)+2H₂(気)+1/2O₂(気)→CH₃OH(液) ΔH=-239kJ (3)KNO₃(固)+aq→KNO₃aq ΔH=35kJ (4)HClaq+NaOHaq→NaClaq+H₂O(液) ΔH=-56kJ',
    explCn: '(3)吸熱量=(2.0+98)g×4.1J/(g·K)×1.7K=0.697kJ，KNO₃(101g/mol)1mol当たり0.697×101/2.0≈35kJ。(4)水1mol当たり18.8×18/6.0=56.4≈56kJ。エンタルピー変化は着目物質の係数を1とする。',
    issues: [],
  },
  {
    code: 'chem-che5-qE2', category: '基本例題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: 'エタン，炭素（黒鉛），水素の燃焼エンタルピーがそれぞれ-1561,-394,-286kJ/molである。(1)エンタルピー変化を付した反応式で表せ（水は液体）。(2)(1)の式を用いてエタンの生成エンタルピーを求めよ。',
    answerVector: [
      'C₂H₆(気)＋7/2O₂(気)→2CO₂(気)＋3H₂O(液)  ΔH=-1561kJ',
      'C(黒鉛)＋O₂(気)→CO₂(気)  ΔH=-394kJ',
      'H₂(気)＋1/2O₂(気)→H₂O(液)  ΔH=-286kJ',
      '-85 kJ/mol',
    ], N: 4,
    answerJp: '(1)①C₂H₆(気)+7/2O₂(気)→2CO₂(気)+3H₂O(液) ΔH=-1561kJ ②C(黒鉛)+O₂(気)→CO₂(気) ΔH=-394kJ ③H₂(気)+1/2O₂(気)→H₂O(液) ΔH=-286kJ (2)-85kJ/mol',
    explCn: '生成式2C+3H₂→C₂H₆は②×2+③×3-①より，ΔH=-394×2+(-286)×3-(-1561)=-85kJ/mol。',
    issues: [],
  },

  // ---- 基本問題 101-108 ----
  {
    code: 'chem-che5-qB1', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '次の文の（）に適当な語句，記号を入れよ。一定圧力で，化学反応に伴い放出・吸収する熱量を(a)という。熱が放出される反応を(b)反応，熱を吸収する反応を(c)反応といい，反応物のもつ(d)の総和が生成物のもつ(d)の総和よりも(e)いとき，(b)反応になる。',
    answerVector: ['反応エンタルピー', '発熱', '吸熱', 'エンタルピー', '大き'], N: 5,
    answerJp: '(a)反応エンタルピー (b)発熱 (c)吸熱 (d)エンタルピー (e)大き',
    explCn: '反応物のエンタルピーが生成物より大きいと，差が熱として放出され発熱反応になる。',
    issues: [],
  },
  {
    code: 'chem-che5-qB2', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '次の化学反応式のΔHは，どの物質の何という反応エンタルピーを表しているか。(1)C₃H₈+5O₂→3CO₂+4H₂O ΔH=-2219kJ (2)C+O₂→CO₂ ΔH=-394kJ (3)CO+1/2O₂→CO₂ ΔH=-283kJ (4)NH₄Cl+aq→NH₄Claq ΔH=15kJ (5)HClaq+KOHaq→KClaq+H₂O ΔH=-56kJ (6)H₂O(固)→H₂O(液) ΔH=6.0kJ',
    answerVector: ['プロパンの燃焼エンタルピー', '黒鉛の燃焼エンタルピー（CO₂の生成エンタルピー）', '一酸化炭素の燃焼エンタルピー', '塩化アンモニウムの溶解エンタルピー', '中和エンタルピー', '水の融解エンタルピー'], N: 6,
    answerJp: '(1)プロパンの燃焼エンタルピー (2)黒鉛の燃焼エンタルピー（CO₂の生成エンタルピー） (3)一酸化炭素の燃焼エンタルピー (4)塩化アンモニウムの溶解エンタルピー (5)中和エンタルピー (6)水の融解エンタルピー',
    explCn: '燃焼エンタルピーは完全燃焼する物質1mol基準；単体Cの燃焼はCO₂の生成エンタルピーとも見なせる；aqは多量の水。',
    issues: [],
  },
  {
    code: 'chem-che5-qB3', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '次の事項を，エンタルピー変化を付した反応式で表せ。(1)エタンC₂H₆の燃焼エンタルピー-1561kJ/mol (2)希硫酸とNaOH水溶液の中和エンタルピー-56kJ/mol (3)NaClの溶解エンタルピー3.88kJ/mol (4)メタノールCH₃OHの生成エンタルピー-239kJ/mol。',
    answerVector: [
      'C₂H₆(気)＋7/2O₂(気)→2CO₂(気)＋3H₂O(液)  ΔH=-1561kJ',
      '1/2H₂SO₄aq＋NaOHaq→1/2Na₂SO₄aq＋H₂O(液)  ΔH=-56kJ',
      'NaCl(固)＋aq→NaClaq  ΔH=3.88kJ',
      'C(黒鉛)＋2H₂(気)＋1/2O₂(気)→CH₃OH(液)  ΔH=-239kJ',
    ], N: 4,
    answerJp: '(1)C₂H₆(気)+7/2O₂(気)→2CO₂(気)+3H₂O(液) ΔH=-1561kJ (2)1/2H₂SO₄aq+NaOHaq→1/2Na₂SO₄aq+H₂O(液) ΔH=-56kJ (3)NaCl(固)+aq→NaClaq ΔH=3.88kJ (4)C(黒鉛)+2H₂(気)+1/2O₂(気)→CH₃OH(液) ΔH=-239kJ',
    explCn: '中和エンタルピーは生成するH₂O(液)1mol当たりなのでH₂SO₄aqの係数は1/2。生成エンタルピーは右辺の化合物の係数を1とする。',
    issues: [],
  },
  {
    code: 'chem-che5-qB4', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '次の事項を，エンタルピー変化を付した反応式で表せ。(1)アセチレンC₂H₂1.0gが燃焼すると50kJの発熱。(2)NaOH2.0gを多量の水に溶かすと2.2kJの発熱。(3)氷が融解すると1g当たり334Jの吸熱。(4)単体からエタノールC₂H₅OH5.0gをつくると30kJの発熱。',
    answerVector: [
      'C₂H₂(気)＋5/2O₂(気)→2CO₂(気)＋H₂O(液)  ΔH=-1.3×10³kJ',
      'NaOH(固)＋aq→NaOHaq  ΔH=-44kJ',
      'H₂O(固)→H₂O(液)  ΔH=6.0kJ',
      '2C(黒鉛)＋3H₂(気)＋1/2O₂(気)→C₂H₅OH(液)  ΔH=-2.8×10²kJ',
    ], N: 4,
    answerJp: '(1)C₂H₂(気)+5/2O₂(気)→2CO₂(気)+H₂O(液) ΔH=-1.3×10³kJ (2)NaOH(固)+aq→NaOHaq ΔH=-44kJ (3)H₂O(固)→H₂O(液) ΔH=6.0kJ (4)2C(黒鉛)+3H₂(気)+1/2O₂(気)→C₂H₅OH(液) ΔH=-2.8×10²kJ',
    explCn: '1mol当たりに換算：C₂H₂=26g→-50×26/1.0=-1.3×10³；NaOH=40g→-2.2×40/2.0=-44；H₂O=18g→334×18≈6.0kJ；C₂H₅OH=46g→-30×46/5.0≈-2.8×10²。',
    issues: [],
  },
  {
    code: 'chem-che5-qB5', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '常温・常圧で水の蒸発エンタルピーと凝縮エンタルピーはそれぞれ44,-44kJ/molである。(1)エンタルピー変化を付した反応式でそれぞれ表せ。(2)一方が吸熱，他方が発熱になる理由を，分子の熱運動のちがいと，気体と液体のもつエンタルピーの差に着目して説明せよ。',
    answerVector: [
      'H₂O(液)→H₂O(気)  ΔH=44kJ',
      'H₂O(気)→H₂O(液)  ΔH=-44kJ',
      '気体は液体より分子の熱運動が激しく分子のもつエンタルピーが大きいため，蒸発は吸熱，凝縮は発熱となる',
    ], N: 3,
    answerJp: '(1)蒸発：H₂O(液)→H₂O(気) ΔH=44kJ，凝縮：H₂O(気)→H₂O(液) ΔH=-44kJ (2)気体は分子の熱運動が激しくエンタルピーが大きく，その差が蒸発では吸熱，凝縮では発熱となるため。',
    explCn: '同じ物質ではエンタルピーは気体＞液体＞固体。エンタルピーが高い状態へは吸熱，低い状態へは発熱。',
    issues: ['(2)は説明問題：参考答案要点を正解オプションとする'],
  },
  {
    code: 'chem-che5-qB6', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '(1)右のエネルギー図を用いて，炭素（黒鉛）の燃焼エンタルピー，CO₂の生成エンタルピーをそれぞれ求めよ。(2)炭素12gをある条件で燃焼させると，COとCO₂の体積比1:3の混合気体が生成した。この燃焼で放出された熱量は何kJか。',
    answerVector: ['-394 kJ/mol', '-394 kJ/mol', '323'], N: 3,
    answerJp: '(1)炭素の燃焼エンタルピー：-394kJ/mol，CO₂の生成エンタルピー：-394kJ/mol (2)323kJの発熱',
    explCn: '(2)CO 1/4mol(-111)とCO₂ 3/4mol(-394)で，ΔH=-111/4-394×3/4=-323.25≈-323kJ。発熱量323kJ。',
    issues: [],
  },
  {
    code: 'chem-che5-qB7', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '次の（）に適当な数値，語句，関係式を入れよ。炭素の燃焼エンタルピー-394，水素-286，メタン-891kJ/mol。炭素1mol，水素2molが燃焼するときの反応エンタルピーの総和Q₁=(a)kJ。一方，炭素と水素からメタン1molが生じ，燃焼するときの総和Q₂は，メタンの(b)エンタルピーと燃焼エンタルピーの和。ヘスの法則より(c)であるから，メタンの(b)エンタルピーは(d)kJ/mol。',
    answerVector: ['-966', '生成', 'Q₁=Q₂', '-75'], N: 4,
    answerJp: '(a)-966 (b)生成 (c)Q₁=Q₂ (d)-75',
    explCn: 'Q₁=-394+(-286)×2=-966。ヘスの法則によりQ₁=Q₂，従ってx+(-891)=-966→x=-75kJ/mol。',
    issues: [],
  },
  {
    code: 'chem-che5-qB8', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '(1)炭素，水素，メタンの燃焼エンタルピーが-394,-286,-891kJ/molのとき，メタンの生成エンタルピーを求めよ。(2)CO₂，水，エタノールの生成エンタルピーが-394,-286,-277kJ/molのとき，エタノールの燃焼エンタルピーを求めよ。(3)アンモニア，NO，水(気)の生成エンタルピーが-46,90,-242kJ/molのとき，アンモニア4molが酸素と反応してNOと水(気)が生じる反応エンタルピーを求めよ。',
    answerVector: ['-75 kJ/mol', '-1369 kJ/mol', '-908 kJ'], N: 3,
    answerJp: '(1)-75kJ/mol (2)-1369kJ/mol (3)-908kJ',
    explCn: '(2)燃焼式C₂H₅OH+3O₂→2CO₂+3H₂O(液)：ΔH=-394×2+(-286)×3-(-277)=-1369kJ/mol。(3)4NH₃+5O₂→4NO+6H₂O(気)：ΔH=90×4+(-242)×6-(-46)×4=-908kJ。',
    issues: [],
  },
  {
    code: 'chem-che5-qB9', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '中和エンタルピーに関して問う。(1)断熱容器に0.20mol/L塩酸200mLと同温の1.0mol/L NaOH水溶液40mLを混合したところ2.2K上昇した。中和エンタルピーは何kJ/molか（密度1.0g/cm³，比熱4.2J/(g·K)）。(2)塩酸の代わりに0.10mol/L希硫酸200mLでも同じ値になった理由を，強酸と強塩基の中和のしくみに着目して説明せよ。(3)NaOH(固)の溶解エンタルピー-44.5kJ/molとし，(1)の中和エンタルピーを用いて，HCl 0.50molを含む希塩酸にNaOH(固)1.0molを加えたときの発熱量は何kJか。',
    answerVector: [
      '-55 kJ/mol',
      '強酸と強塩基の中和ではH⁺＋OH⁻→H₂Oの発熱反応のみが起こり，水1mol当たりの値は酸・塩基の種類によらないから',
      '72 kJ',
    ], N: 3,
    answerJp: '(1)-55kJ/mol (2)強酸と強塩基の中和はH⁺＋OH⁻→H₂Oのみで種類によらないから (3)72kJ',
    explCn: '(1)発熱量=240g×4.2×2.2K=2217.6J，生じた水0.040molより-2217.6/0.040≈-55.4kJ/mol。(3)(-44.5)×1.0+(-55.4)×0.50≈-72.2kJ→発熱量72kJ。',
    issues: ['(2)は記述問題：参考答案要点を正解オプションとする'],
  },
  {
    code: 'chem-che5-qB12', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '標準状態のエタンC₂H₆とプロパンC₃H₈の混合気体22.4Lを完全燃焼させたところ，4.00molの酸素が消費され1780kJの発熱があった。(1)エタンとプロパンの物質量の比を簡単な整数比で示せ。(2)エタンの燃焼エンタルピーを-1560kJ/molとするとき，プロパンの燃焼エンタルピーは何kJ/molか。',
    answerVector: ['2 : 1', '-2220 kJ/mol'], N: 2,
    answerJp: '(1)エタン:プロパン=2:1 (2)-2220kJ/mol',
    explCn: 'x+y=1.00，(7/2)x+5y=4.00 → x=2/3，y=1/3。(2)(-1560)×(2/3)+Q×(1/3)=-1780 → Q=-2220kJ/mol。',
    issues: [],
  },
  {
    code: 'chem-che5-qB13', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: 'C(ダイヤモンド)+O₂(気)→CO₂(気) ΔH=-396kJ，C₆₀(フラーレン)+60O₂(気)→60CO₂(気) ΔH=-25930kJ，C(黒鉛)→C(ダイヤモンド) ΔH=2kJ を用いて，同じ質量の黒鉛・ダイヤモンド・フラーレンC₆₀のもつエンタルピーの大小の順を答えよ。',
    options: ['フラーレン＞ダイヤモンド＞黒鉛', 'ダイヤモンド＞フラーレン＞黒鉛', '黒鉛＞ダイヤモンド＞フラーレン', 'フラーレン＞黒鉛＞ダイヤモンド'], correctIndex: 0,
    answerJp: 'フラーレン＞ダイヤモンド＞黒鉛',
    explCn: 'C原子1mol当たりで比較：フラーレンは-25930/60≈-432kJ/mol（エンタルピー最大），ダイヤモンドは396，黒鉛は394（黒鉛がダイヤモンドより2kJ小さい）。よってフラーレン＞ダイヤモンド＞黒鉛。',
    issues: [],
  },
  {
    code: 'chem-che5-qB14', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: 'CO₂(気)+2H₂O(液)→CH₄(気)+2O₂(気)の反応の反応エンタルピーは何kJ/molか。また，この反応は発熱反応と吸熱反応のどちらか。ただしCO₂(気)・H₂O(液)・CH₄(気)の生成エンタルピーをそれぞれ-394・-286・-75kJ/molとする。',
    answerVector: ['891 kJ/mol', '吸熱反応'], N: 2,
    answerJp: '反応エンタルピー891kJ/mol，吸熱反応',
    explCn: 'ΔH=生成物-反応物=(-75)-[(-394)+(-286)×2]=891kJ>0なので吸熱反応。',
    issues: [],
  },
  {
    code: 'chem-che5-qB10', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '(1)H-H・Cl-Clの結合エネルギーを436・243kJ/mol，HClの生成エンタルピーを-92.5kJ/molとしてH-Clの結合エネルギーを求めよ。(2)N≡N・N-H・H-Hの結合エネルギーを946・391・436kJ/molとしてアンモニアNH₃の生成エンタルピーを求めよ。(3)H-H・C-H・C-Cの結合エネルギーを436・416・368kJ/mol，プロパンの生成エンタルピーを-107kJ/molとして，C(黒鉛)の昇華エンタルピーを求めよ。',
    answerVector: ['432 kJ/mol', '-46 kJ/mol', '738 kJ/mol'], N: 3,
    answerJp: '(1)432kJ/mol (2)-46kJ/mol (3)738kJ/mol',
    explCn: '(1)436/2+243/2-x=-92.5→x=432。(2)946/2+436×3/2-391×3=-46。(3){(-107)+4064-436×4}/3=737.6≈738（C黒鉛→C気の昇華）。',
    issues: [],
  },
  {
    code: 'chem-che5-qB11', category: '基本問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '次の(1)～(3)の例として適当なものを(ア)～(ウ)から1つずつ選べ。(1)化学発光 (2)光合成 (3)光触媒。(ア)酸化チタン(Ⅳ)をコーティングした壁は汚れがつきにくい。(イ)緑色植物は光エネルギーを吸収して水と二酸化炭素から糖類をつくる。(ウ)ルミノール溶液を過酸化水素水と混ぜると青白く発光する。',
    answerVector: ['ウ', 'イ', 'ア'], N: 3,
    answerJp: '(1)ウ (2)イ (3)ア',
    explCn: '化学発光：化学反応に伴って光を発する現象（ウ）。光合成：クロロフィルが光を吸収して糖類を合成（イ）。光触媒：光が当たると触媒としてはたらく（ア，酸化チタン）。',
    issues: [],
  },
  // ---- 応用例題 ----
  {
    code: 'chem-che5-qA1', category: '応用例題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '断熱容器に0.50mol/L塩酸100mLをとり，固体NaOH 2.0gを加えたときの温度曲線（図）を示した。(1)温度変化ΔTをT₀～T₃のうち必要なものを用いて表せ。(2)ΔT=12.4K，水溶液の体積100mL，密度1.0g/cm³，比熱4.1J/(g·K)として，この反応をエンタルピー変化を付した反応式で表せ（H=1.0,O=16,Na=23，整数値）。(3)中和エンタルピーを-56.5kJ/molとしてNaOH(固)の溶解エンタルピーを求めよ。',
    answerVector: [
      'T₃－T₀',
      'HClaq＋NaOHaq→NaClaq＋H₂O(液)  ΔH=-102kJ',
      '-45 kJ/mol',
    ], N: 3,
    answerJp: '(1)T₃-T₀ (2)ΔH=-102kJ (3)-45kJ/mol',
    explCn: '(2)発熱量=100×4.1×12.4=5084J≈5.08kJ，中和水0.050mol→-5.08/0.050≈-101.7≈-102kJ/mol。(3)-101.7=Q+(-56.5)→Q≈-45kJ/mol。',
    issues: [],
  },
  {
    code: 'chem-che5-qA2', category: '応用例題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: 'O-H・C-H・C=O・O=Oの結合エネルギーがそれぞれ463・413・799・498kJ/mol，水が水蒸気として生じるときのプロパンC₃H₈の燃焼エンタルピーが-2043kJ/molである。プロパン中のC-Cの結合エネルギーは何kJ/molか。',
    options: ['331 kJ/mol', '413 kJ/mol', '498 kJ/mol', '326 kJ/mol'], correctIndex: 0,
    answerJp: '331 kJ/mol',
    explCn: 'C₃H₈+5O₂→3CO₂+4H₂O(気)：{413×8+Q×2+498×5}-{799×6+463×8}=-2043 → Q=330.5≈331kJ/mol。',
    issues: [],
  },
  // ---- 応用問題 ----
  {
    code: 'chem-che5-qA3', category: '応用問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: 'C₂H₄(気)+H₂O(液)→C₂H₅OH(液)のΔHを求めることができる反応エンタルピーの組合せは(ア)～(エ)のどれか。(ア)C₂H₄燃焼+C₂H₅OH燃焼 (イ)C₂H₄燃焼+C₂H₅OH生成 (ウ)C₂H₄生成+C₂H₅OH燃焼 (エ)C₂H₄生成+C₂H₅OH生成。',
    options: ['ア', 'イ', 'ウ', 'エ'], correctIndex: 0,
    answerJp: 'ア',
    explCn: 'C₂H₄+3O₂→2CO₂+2H₂O(液)（q₁）からC₂H₅OH+3O₂→2CO₂+3H₂O(液)（q₃）を引くとq₁-q₃=C₂H₄+H₂O→C₂H₅OH。よってC₂H₄の燃焼エンタルピーとC₂H₅OHの燃焼エンタルピーの組合せ（ア）。',
    issues: [],
  },
  {
    code: 'chem-che5-qA4', category: '応用問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: 'H⁺+OH⁻→H₂Oの中和エンタルピーは-56.5kJ。水に溶けているアンモニア1molと硝酸1mol（電離度1）が反応するときの反応エンタルピーは-51.5kJである。水に溶けているアンモニアが水と反応してアンモニウムイオンが生じるときの反応エンタルピーは何kJ/molか。',
    options: ['5.0 kJ/mol', '-5.0 kJ/mol', '-51.5 kJ/mol', '-56.5 kJ/mol'], correctIndex: 0,
    answerJp: '5.0 kJ/mol',
    explCn: 'NH₃aq+H⁺→NH₄⁺（q₁=-51.5）=q₂+(-56.5) → q₂=5.0kJ/mol。',
    issues: [],
  },
  {
    code: 'chem-che5-qA5', category: '応用問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'simple', Q: '塩化亜鉛の生成エンタルピー-415kJ/mol・溶解エンタルピー-73kJ/mol，塩化水素の生成エンタルピー-92kJ/mol・溶解エンタルピー-75kJ/molとする。亜鉛を塩酸に溶かすときの反応エンタルピーを求め，エンタルピー変化を付した反応式で表せ。',
    options: ['Zn(固)＋2HClaq→ZnCl₂aq＋H₂(気)  ΔH=-154kJ', 'Zn(固)＋2HClaq→ZnCl₂aq＋H₂(気)  ΔH=-154kJ/mol', 'Zn(固)＋2HClaq→ZnCl₂aq＋H₂(気)  ΔH=73kJ', 'Zn(固)＋2HClaq→ZnCl₂aq＋H₂(気)  ΔH=-519kJ'], correctIndex: 0,
    answerJp: 'Zn(固)+2HClaq→ZnCl₂aq+H₂(気) ΔH=-154kJ',
    explCn: 'Zn+Cl₂→ZnCl₂(固)（-415）＋ZnCl₂(固)+aq→ZnCl₂aq（-73）－2×{1/2H₂+1/2Cl₂→HCl(気)（-92）}－2×{HCl(気)+aq→HClaq（-75）} → ΔH=-154kJ。',
    issues: [],
  },
  {
    code: 'chem-che5-qA6', category: '応用問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '次の実験について( )に適当な語句・式・数値を入れよ。[実験1]水50mLにNaOH 2.0gを入れて温度を測定。この発熱は(a)によるもので，温度上昇は図の(b)に相当し10.5K。NaOHの(a)エンタルピーは(c)kJ/mol。[実験2]1.0mol/L塩酸100mLに1.0mol/L NaOH水溶液50mLを加える。発熱は(d)によるもので，56kJ/molとすると温度上昇は(e)K。[実験3]塩酸100mLにNaOH(固)2.0gを加えるとき，反応エンタルピーは(f)の法則より(c)+( -56)= (g)kJ/molとな。水溶液の温度上昇は(h)K。',
    answerVector: ['溶解', 't₅－t₁', '-44', '中和', '4.5', 'ヘス', '-100', '12'], N: 8,
    answerJp: '(a)溶解 (b)t₅-t₁ (c)-44 (d)中和 (e)4.5 (f)ヘス (g)-100 (h)12',
    explCn: '(c)52g×4.0×10.5K=2184J，-2184×40/2.0=-43680J/mol≈-44kJ/mol。(e)56×10³×0.050=154×4.0×ΔT→ΔT≈4.5K。(g)-44+(-56)=-100kJ/mol。(h)100×10³×0.050=104×3.9×ΔT→ΔT≈12.3→12K。',
    issues: [],
  },
  {
    code: 'chem-che5-qA7', category: '応用問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: 'ある量の酸素中でプロパンC₃H₈ 1.00molを燃焼させたところ不完全燃焼が起こり，水素原子はすべて水（気体）に，炭素原子は80.0%がCO₂，20.0%がCOになった。CO₂・CO・H₂O(液)・C₃H₈の生成エンタルピーをそれぞれ-394・-111・-286・-105kJ/mol，H₂Oの蒸発エンタルピーを44kJ/molとして，(1)プロパンの燃焼で消費された酸素は何molか。(2)発生した熱量は何kJか。',
    answerVector: ['4.70 mol', '1.88×10³ kJ'], N: 2,
    answerJp: '(1)4.70mol (2)1.88×10³kJ',
    explCn: '(1)0.800mol×5+0.200mol×7/2=4.70mol。(2)完全燃焼ΔH=-2045，不完全ΔH=-1196 → (-2045)×0.800+(-1196)×0.200=-1875.2≈-1.88×10³kJ。',
    issues: [],
  },
  {
    code: 'chem-che5-qA8', category: '応用問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: 'O-H・C=O・O=Oの結合エネルギーがそれぞれ463・799・498kJ/mol，エタンの燃焼エンタルピーは-1429kJ/mol，メタン1molをすべてC原子とH原子にするのに必要なエネルギーは1652kJ/mol（燃焼で生じる水はすべて気体）。(1)メタンにおけるC-Hの結合エネルギーは何kJ/molか。(2)エタンにおけるC-Cの結合エネルギーは何kJ/molか。(3)プロパンの燃焼エンタルピーは何kJ/molか。',
    answerVector: ['413 kJ/mol', '324 kJ/mol', '-2056 kJ/mol'], N: 3,
    answerJp: '(1)413kJ/mol (2)324kJ/mol (3)-2056kJ/mol',
    explCn: '(1)1652/4=413。(2)CH₄→C+4H：413×4=1652でつじつまが合う。エタン燃焼：(413×6+Q×1+498×7/2)-(799×2×+463×3×2)=-1429…式を解くとQ=324。(3)C₃H₈+5O₂→3CO₂+4H₂O(気)：(413×8+324×2+498×5)-(799×6+463×8)=-2056kJ/mol。',
    issues: [],
  },
  {
    code: 'chem-che5-qA9', category: '応用問題', topic: TOPIC, subtopics: SUBTOPIC,
    optMode: 'multi', Q: '図はナトリウム・塩素および塩化ナトリウムの各状態のエネルギー関係を示す。格子エネルギーはNaCl結晶1molのイオンをすべて無限遠まで引き離すのに必要なエネルギーである。(1)アに当てはまる語句を書け。(2)イに当てはまる化学式（状態も付して）を書け。(3)塩素原子のアをエンタルピー変化を付した反応式で表せ。(4)気体状態でNa原子の電子1個を取り去りCl原子がこの電子を受け取る反応を表せ。(5)NaCl結晶の格子エネルギーを反応式で表せ。',
    answerVector: [
      '電子親和力',
      'Na(気)',
      'Cl(気)＋e⁻→Cl⁻(気)  ΔH=-354 kJ',
      'Na(気)＋Cl(気)→Na⁺(気)＋Cl⁻(気)  ΔH=148 kJ',
      'NaCl(固)→Na⁺(気)＋Cl⁻(気)  ΔH=788 kJ',
    ], N: 5,
    answerJp: '(1)電子親和力 (2)Na(気) (3)Cl(気)+e⁻→Cl⁻(気) ΔH=-354kJ (4)Na(気)+Cl(気)→Na⁺(気)+Cl⁻(気) ΔH=148kJ (5)NaCl(固)→Na⁺(気)+Cl⁻(気) ΔH=788kJ',
    explCn: '(1)Cl原子が電子を得てCl⁻になるとき放出するエンタルピーが電子親和力。(2)昇華107kJがNa(固)→Na(気)。(4)502+(-354)=148kJ。(5)ヘスの法則：411+107+122+502+(-354)=788kJ。',
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
  console.log('che5 drafts:', d.length);
  const s = new Map();
  d.forEach((x) => s.set(x.generationStatus, (s.get(x.generationStatus) || 0) + 1));
  console.log('status:', Object.fromEntries(s));
  const nat = d.filter((x) => x.options.length > 0 && x.correctIndex !== null);
  console.log('有选项+答案的题:', nat.map((x) => `${x.businessCode}(idx=${x.correctIndex})`).join(', '));
}