#!/usr/bin/env node
/**
 * cheb6_pilot_content.cjs — cheb6（第6章 酸化還元反応）内容定义
 *
 * 源：cheb6_题目.md + cheb6_解析.md（仅此两文件，其余为过程文件）
 * 考纲：ejuSyllabus.ts chem_2_1_3（酸化･還元）
 *  - 酸化・還元の基礎 chem_2_1_3_01（酸化還元の定義・酸化数・酸化剤還元剤・半反応式）
 *  - 金属のイオン化傾向 chem_2_1_3_02
 *  - 酸化還元滴定 chem_2_1_3_03（酸化還元滴定の定量計算・褐色ビュレット・COD 等）
 *
 * 变通（沿用 cheb1 规则）：
 *  - qB12(1) 解析中「才」（应为 オ）、qB1 解析中「增加」（应为 増加）、
 *    qA4(1) 解析中「酸化剂」（应为 酸化剤）、qA5 解析中「（工）」（应为（エ））等
 *    OCR 字形按項目规则保留原样，答案按规范字，并在 issues 中标注说明；
 *  - qC8/qB13/qA3 为 N=1 集合・顺序作答，参照 cheb1-qA7 变通以 multi 处理；
 *  - qB4(2) 記述问题参考答案要点整体作槽位。
 */
'use strict';

const T_REDOX = 'chem_2_1_3';       // (3)酸化･還元
const S_BASE = ['chem_2_1_3_01'];   // 酸化・還元の基礎
const S_METAL = ['chem_2_1_3_02'];  // 金属のイオン化傾向
const S_TIT = ['chem_2_1_3_03'];    // 酸化還元滴定

const CONTENT = [
  // ---- 基礎 CHECK ----
  {
    code: 'chem-cheb6-qC1', category: '基礎 CHECK', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: '(1) 酸素を受け取った (2) 水素を受け取った (3) 電子を受け取った (4) 酸化数が増加した。それぞれ酸化されたか，還元されたか。',
    answerVector: ['酸化された', '還元された', '還元された', '酸化された'], N: 4,
    answerJp: '(1) 酸化された (2) 還元された (3) 還元された (4) 酸化された',
    explCn: '酸素を受け取る・水素を失う・電子を失う・酸化数が増える → 酸化。水素を受け取る・電子を受け取る・酸化数が減る → 還元。(3) 電子を受け取ることは還元（酸化剤自身は還元される）。(4) 酸化数の増加は酸化。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qC2', category: '基礎 CHECK', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: '(1) 単体中の原子の酸化数はいくつか。(2) 化合物中の酸素，水素の酸化数はふつういくつか。',
    answerVector: ['0', 'O：−2，H：+1'], N: 2,
    answerJp: '(1) 0 (2) O：−2，H：+1',
    explCn: '単体（金属や O₂、H₂ など）中の原子の酸化数は 0。化合物中ではふつう O：−2，H：+1（過酸化物 H₂O₂ の O は −1、H₂O₂ や金属水素化物は例外）。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qC9', category: '基礎 CHECK', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: '(1) 他の物質を酸化する物質 (2) 他の物質を還元する物質。それぞれ何というか。',
    answerVector: ['酸化剤', '還元剤'], N: 2,
    answerJp: '(1) 酸化剤 (2) 還元剤',
    explCn: '相手を酸化する物質を酸化剤、相手を還元する物質を還元剤という。酸化剤自身は還元され（電子を受け取り、酸化数が減り）、還元剤自身は酸化される（電子を与え、酸化数が増える）。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qC3', category: '基礎 CHECK', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: '(1) 酸化剤と還元剤が反応するとき，酸化剤は酸化されるか，還元されるか。(2) 他の物質に酸素を与えるのは酸化剤・還元剤のどちらか。(3) 他の物質に電子を与えるのは酸化剤・還元剤のどちらか。',
    answerVector: ['還元される', '酸化剤', '還元剤'], N: 3,
    answerJp: '(1) 還元される (2) 酸化剤 (3) 還元剤',
    explCn: '(1) 酸化剤は相手から電子を奪うので、酸化剤自身は還元される（酸化数が減る）。(2) 酸素を与える＝相手を酸化する＝酸化剤。(3) 電子を与える＝相手を還元する＝還元剤。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qC4', category: '基礎 CHECK', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: 'I₂の酸化作用，SO₂の還元作用を表す式の（）を埋めよ。(1) I₂ + 2e⁻ → 2() (2) SO₂ + 2H₂O → （　） + 4H⁺ + 2e⁻',
    answerVector: ['I⁻', 'SO₄²⁻'], N: 2,
    answerJp: '(1) I⁻ (2) SO₄²⁻',
    explCn: '(1) I₂ は 2e⁻ を受け取って 2I⁻ になる（酸化剤のはたらき）。(2) SO₂ は水と反応して SO₄²⁻ になる際、電子 2e⁻ を放出する（還元剤のはたらき）。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qC5', category: '基礎 CHECK', topic: T_REDOX, subtopics: S_METAL,
    optMode: 'simple', Q: '金属をイオン化傾向の大きなものから順に並べた列を何というか。',
    options: ['金属のイオン化列', '金属の反応列', 'イオン化工ネルギー列', '標準電極電位列'], correctIndex: 0,
    answerJp: '金属のイオン化列',
    explCn: '金属をイオン化傾向の大きいものから順に並べたものを金属のイオン化列という（Li>K>Ca>Na>Mg>Al>Zn>Fe>Ni>Sn>Pb>(H₂)>Cu>Hg>Ag>Pt>Au）。イオン化工ネルギーは気体原子に関する量で別概念。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qC6', category: '基礎 CHECK', topic: T_REDOX, subtopics: S_METAL,
    optMode: 'multi', Q: '次の各組の金属で，イオン化傾向が大きいのはどちらか。(1) Cu，Zn (2) Zn，Pb (3) Cu，Ag',
    answerVector: ['Zn', 'Zn', 'Cu'], N: 3,
    answerJp: '(1) Zn (2) Zn (3) Cu',
    explCn: 'イオン化列 Zn>Fe>Pb>(H₂)>Cu>Ag より、(1) Zn>Cu、(2) Zn>Pb、(3) Cu>Ag。イオン化傾向が大きいほど電子を失い（酸化され）やすい。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qC7', category: '基礎 CHECK', topic: T_REDOX, subtopics: S_METAL,
    optMode: 'simple', Q: 'Fe，Mg，Na のうち，常温で水と反応する金属はどれか。',
    options: ['Na', 'Mg', 'Fe', 'Na と Mg'], correctIndex: 0,
    answerJp: 'Na',
    explCn: 'Na はイオン化傾向が特に大きく、常温の水と激しく反応して水素を発生する。Mg は熱水と反応、Fe は高温の水蒸気と反応（常温では反応しない）。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qC8', category: '基礎 CHECK', topic: T_REDOX, subtopics: S_METAL,
    optMode: 'multi', Q: 'Zn，Cu，Fe，Ag，Mg，Au のうち，塩酸や希硫酸には溶けないが，硝酸には溶けるものはどれか。',
    answerVector: ['Cu，Ag'], N: 1,
    answerJp: 'Cu，Ag',
    explCn: 'Cu・Ag は水素よりイオン化傾向が小さいため塩酸・希硫酸に溶けないが、酸化力の強い硝酸（酸化剤）には溶ける。Au は硝酸にも溶けない（王水にのみ溶ける）。',
    issues: [],
  },
  // ---- 基本例題 ----
  {
    code: 'chem-cheb6-qE1', category: '基本例題', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: '酸性の過マンガン酸カリウム水溶液に二酸化硫黄を吹き込んだ反応について，（a）～（r）に適当な酸化数・数値・語句・化学式を入れよ。（題文：（a）MnO₄⁻中のMnの酸化数 (b) MnO₄⁻1個が奪うe⁻の数 (c) Mn²⁺の酸化数 (d) SO₂1個が与えるe⁻の数 (e)(f) SO₂中のSの酸化数の変化 (g)(h) e⁻の数を失う剤・受け取る剤 (i)(j) ①式・②式の倍率 (k)～(p) ③式の係数 (q)(r) 酸化剤・還元剤の化学式）',
    answerVector: ['+7', '5', '+2', '2', '+4', '+6', '還元', '酸化', '2', '5', '2', '5', '2', '2', '5', '4', 'KMnO₄', 'SO₂'], N: 18,
    answerJp: '(a) +7 (b) 5 (c) +2 (d) 2 (e) +4 (f) +6 (g) 還元 (h) 酸化 (i) 2 (j) 5 (k) 2 (l) 5 (m) 2 (n) 2 (o) 5 (p) 4 (q) KMnO₄ (r) SO₂',
    explCn: 'MnO₄⁻のMnは +7（Kが+1、Oが−2×4）。酸性では MnO₄⁻が 5e⁻ を受け取って Mn²⁺（+2）になる。SO₂ の S は +4 → +6（2e⁻ 放出、還元剤）。酸化剤の受ける e⁻ 数＝還元剤の失う e⁻ 数より、①式×2＋②式×5 で e⁻ を消去し、2MnO₄⁻+5SO₂+2H₂O → 2Mn²⁺+5SO₄²⁻+4H⁺。2K⁺ を加えて化学反応式 2KMnO₄+5SO₂+2H₂O → K₂SO₄+2MnSO₄+2H₂SO₄。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qE2', category: '基本例題', topic: T_REDOX, subtopics: S_METAL,
    optMode: 'multi', Q: '次の(1)～(4)の記述に示された2種の金属A，Bのイオン化傾向は，それぞれどちらが大きいと考えられるか。(1) Aのイオンを含む水溶液にBの単体を入れるとAの単体が生じる (2) Aは常温の水と反応して水素を発生するがBは反応しない (3) Aの酸化物はBの単体によって還元される (4) 乾燥空気中ではAは酸化されるがBは酸化されない。',
    answerVector: ['B', 'A', 'B', 'A'], N: 4,
    answerJp: '(1) B (2) A (3) B (4) A',
    explCn: 'イオン化傾向の大きい金属はイオン・化合物になりやすく、小さい金属のイオン・化合物は単体になりやすい。(1) BがAのイオンを金属に戻す＝Bの方が大きい。(2) 常温で水と反応する＝大きい。(3) BがAの酸化物を還元＝Bの方が大きい。(4) 酸化されやすい＝大きい。',
    issues: [],
  },
  // ---- 基本問題 ----
  {
    code: 'chem-cheb6-qB1', category: '基本問題', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: '次の文の（）に適当な語句を入れよ。（酸化還元の電子による定義：Cu→CuOではCuは(b)される、電子を失うと(c)される・得ると(d)される、Cu+Cl₂→CuCl₂でCuは(e)されCl₂は(f)される、酸化数は電子を得ると(g)し失うと(h)し、酸化されると(i)し還元されると(j)する）',
    answerVector: ['電子', '酸化', '酸化', '還元', '酸化', '還元', '減少', '増加', '増加', '減少'], N: 10,
    answerJp: '(a) 電子 (b) 酸化 (c) 酸化 (d) 還元 (e) 酸化 (f) 還元 (g) 減少 (h) 増加 (i) 増加 (j) 減少',
    explCn: '酸化還元は酸素・水素のやりとりに限らず電子のやりとりで広く定義できる：電子を失う＝酸化（酸化数が増加）、電子を得る＝還元（酸化数が減少）。Cu+Cl₂→CuCl₂では Cu は電子を失い酸化、Cl₂ は電子を得て還元され、酸化と還元は同時に起こる。',
    issues: ['解析原文 (h)(i) 使用「增加」字形（应为 増加），按項目规则保留原样，答案按规范字「増加」'],
  },
  {
    code: 'chem-cheb6-qB2', category: '基本問題', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: '次の反応の説明文の（）に適当な語句を入れよ。(1) CuO+H₂→Cu+H₂OでCuOはO原子を失うので(a)される (2) 2H₂S+O₂→2H₂O+2SでH₂Sは(b)を失うので(c)される (3) H₂S+Cl₂→2HCl+SでCl₂は(b)を得るので(d)される (4) 2Mg+O₂→2MgOでO₂は(e)を得るので(f)される (5) Mg+Cl₂→MgCl₂でMgは(e)を失うので(g)される (6) SO₂+2HNO₃→H₂SO₄+2NO₂でSの(h)は増加しNの(h)は減少するのでSO₂は(i)されHNO₃は(j)される。',
    answerVector: ['還元', 'H原子（水素）', '酸化', '還元', '電子', '還元', '酸化', '酸化数', '酸化', '還元'], N: 10,
    answerJp: '(a) 還元 (b) H原子（水素） (c) 酸化 (d) 還元 (e) 電子 (f) 還元 (g) 酸化 (h) 酸化数 (i) 酸化 (j) 還元',
    explCn: '(1) 酸素を失う＝還元。(2)(3) 水素を失う（与える）＝酸化、水素を得る＝還元。(4)(5) 電子を得る＝還元、電子を失う＝酸化。(6) Sは+4→+6で酸化数増加（SO₂は酸化）、Nは+5→+4で減少（HNO₃は還元）。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qB3', category: '基本問題', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: '次の(ア)～(オ)の酸化還元反応について，(1) 下線のついた原子の酸化数がどのように変化したか例のように書け（例 +1 → 0 (-1)）。(2) 下線のついた原子が酸化しているものをすべて選べ。',
    answerVector: ['−3 → +2（+5）', '+5 → −1（−6）', '+6 → +4（−2）', '+4 → +6（+2）', '+7 → +2（−5）', 'ア，エ'], N: 6,
    answerJp: '(1) (ア) −3 → +2 (+5) (イ) +5 → −1 (−6) (ウ) +6 → +4 (−2) (エ) +4 → +6 (+2) (オ) +7 → +2 (−5) (2) ア，エ',
    explCn: '(ア) NH₃のNは−3、NOのNは+2（+5増）。(イ) KClO₃のClは+5、KClのCl⁻は−1（−6）。(ウ) H₂SO₄のSは+6、SO₂のSは+4（−2）。(エ) SO₂のSは+4、H₂SO₄のSは+6（+2）。(オ) KMnO₄のMnは+7、MnSO₄のMn²⁺は+2（−5）。(2) 酸化数の増えた(ア)(エ)。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qB4', category: '基本問題', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: '(1) Sの酸化数が (a) −2 (b) +6 となる化合物の化学式を1つずつ書け。(2) 硫黄の電子配置（K殻2・L殻8・M殻6）に着目して，Sの酸化数が−2から+6の間の値をとる理由を説明せよ。',
    answerVector: ['H₂S（FeSなど）', 'H₂SO₄（SO₃，FeSO₄など）', '他の原子から硫黄へ電子2個が引き寄せられると酸化数−2となり，硫黄の価電子6個すべてが他の原子（O，Fなど）へ引き寄せられると+6となるから。'], N: 3,
    answerJp: '(1) (a) H₂S（FeS など） (b) H₂SO₄（SO₃，FeSO₄ など） (2) 電子2個が硫黄側に引き寄せられると−2、価電子6個すべてが電気陰性度の大きい原子に引き寄せられると+6になるから。',
    explCn: '(1) H₂S・FeS では S は −2（H は +1，Fe は +2）。H₂SO₄・SO₃・FeSO₄ では S は +6。酸化物・フッ化物との結合で価電子をすべて奪われたとき+6 が最高。(2) M殻の価電子6個の利用度で酸化数が −2〜+6 の範囲をとる（非金属元素は最低と最高の差が8になることが多い）。',
    issues: ['(2) 記述問題：参考答案要点整体作槽位'],
  },
  {
    code: 'chem-cheb6-qB5', category: '基本問題', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: '次の(ア)～(エ)の化学反応のうち酸化還元反応はどれか。すべて選べ。また，そのときの酸化剤，還元剤を指摘せよ。(ア) MnO₂+4HCl→MnCl₂+2H₂O+Cl₂ (イ) KCl+H₂SO₄→KHSO₄+HCl (ウ) I₂+SO₂+2H₂O→2HI+H₂SO₄ (エ) 2FeCl₃+SnCl₂→2FeCl₂+SnCl₄',
    answerVector: ['ア，ウ，エ', 'MnO₂／HCl', 'I₂／SO₂', 'FeCl₃／SnCl₂'], N: 4,
    answerJp: '酸化還元反応：ア，ウ，エ  (ア) 酸化剤 MnO₂，還元剤 HCl (ウ) 酸化剤 I₂，還元剤 SO₂ (エ) 酸化剤 FeCl₃，還元剤 SnCl₂',
    explCn: '(ア) Mnは+4→+2（減少、MnO₂は酸化剤）、Clは−1→0（増加、HClは還元剤）。(イ) 全原子の酸化数不変→酸化還元反応ではない。(ウ) I₂は0→−1（酸化剤）、Sは+4→+6（SO₂は還元剤）。(エ) Feは+3→+2（FeCl₃は酸化剤）、Snは+2→+4（SnCl₂は還元剤）。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qB6', category: '基本問題', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: 'Cu+2H₂SO₄→CuSO₄+2H₂O+SO₂ について，(1)(a) 銅原子 (1)(b) 硫黄原子の酸化数の変化，(2) 硫酸は電子を与えたのか受け取ったのか，(3) 硫酸は酸化されたのか還元されたのか，(4) 酸化剤・還元剤はそれぞれ何か。',
    answerVector: ['Cu：0 → +2', 'S：+6 → +4', '受け取った', '還元された', '酸化剤：H₂SO₄（硫酸），還元剤：Cu（銅）'], N: 5,
    answerJp: '(1) 銅原子 0→+2，硫黄原子 +6→+4 (2) 受け取った (3) 還元された (4) 酸化剤：硫酸，還元剤：銅',
    explCn: '(1) Cu は単体で0、CuSO₄ の Cu²⁺ は+2。H₂SO₄ の S は+6、SO₂ の S は+4。(2)(3) H₂SO₄+2H⁺+2e⁻→SO₂+2H₂O のように硫酸は e⁻ を受け取り還元される。(4) 相手(Cu)を酸化した硫酸が酸化剤、Cu が還元剤。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qB7', category: '基本問題', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: '(1) 酸性溶液中で酸化剤のはたらきを示す e⁻を含む反応式のつくり方：(i) (a)辺に反応物，(b)辺に生成物 (ii) (c)辺に(d)を加える (iii) (e)辺に(f)を加えて電荷を等しくする (iv) (g)辺に(h)を加えて原子数を等しくする。(2) e⁻を含む反応式で書け。(a) MnO₄⁻→Mn²⁺ (b) HNO₃→NO₂ (c) SO₂→SO₄²⁻',
    answerVector: ['左', '右', '左', 'e⁻', '左', 'H⁺', '右', 'H₂O', 'MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O', 'HNO₃ + H⁺ + e⁻ → NO₂ + H₂O', 'SO₂ + 2H₂O → SO₄²⁻ + 4H⁺ + 2e⁻'], N: 11,
    answerJp: '(1) (a) 左 (b) 右 (c) 左 (d) e⁻ (e) 左 (f) H⁺ (g) 右 (h) H₂O (2) (a) MnO₄⁻+8H⁺+5e⁻→Mn²⁺+4H₂O (b) HNO₃+H⁺+e⁻→NO₂+H₂O (c) SO₂+2H₂O→SO₄²⁻+4H⁺+2e⁻',
    explCn: '半反応式の作り方：(1) 反応物を左、生成物を右に書き、酸化数の減少量だけ左に e⁻ を加え、酸性なら左に H⁺、足りない O・H を右（または左）に H₂O で補う。(2)(a) MnO₄⁻ は5e⁻ を受けて Mn²⁺ に（左辺に8H⁺、右に4H₂O）。(b) HNO₃ はe⁻ を受けて NO₂ に（左にH⁺、右にH₂O）。(c) SO₂ は還元剤として2e⁻ を放出（左に2H₂O、右に4H⁺）。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qB8', category: '基本問題', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: '次の文の（）に適当な語句・化学式・数値を入れよ。（過酸化水素＋酸性過マンガン酸カリウムでは (a) の泡が発生し過酸化水素は (b) 剤。H₂O₂+SO₂→(c) で S の酸化数は (d) から (e) へ。2H₂S+SO₂→(g)+(h) で硫化水素の S は (i) から (j) へ変化し，硫化水素は (k) 剤，二酸化硫黄は (l) 剤）',
    answerVector: ['酸素', '還元', 'H₂SO₄', '+4', '+6', '硫黄', '2H₂O', '3S', '−2', '0', '還元', '酸化'], N: 12,
    answerJp: '(a) 酸素 (b) 還元 (c) H₂SO₄ (d) +4 (e) +6 (f) 硫黄 (g) 2H₂O (h) 3S（(g)(h)は逆でもよい） (i) −2 (j) 0 (k) 還元 (l) 酸化',
    explCn: 'H₂O₂ は KMnO₄（酸化剤）に対しては還元剤として働き O₂ を発生（2MnO₄⁻+5H₂O₂+6H⁺→2Mn²⁺+5O₂+8H₂O）。H₂O₂+SO₂→H₂SO₄（S：+4→+6、SO₂ が還元剤）。2H₂S+SO₂→2H₂O+3S（H₂S の S：−2→0、H₂S が還元剤；SO₂ の S：+4→0、SO₂ が酸化剤）。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qB9', category: '基本問題', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: '(1) 希硝酸の酸化作用を表す式 HNO₃ + ( )H⁺ + ( )e⁻ → ( )H₂O + ( ) を完成せよ。(2) 銅と希硝酸の反応を反応式で書け。(3) (2)で酸化剤としてはたらいた硝酸は，銅1mol当たり何molか。',
    answerVector: ['HNO₃ + 3H⁺ + 3e⁻ → 2H₂O + NO', '3Cu + 8HNO₃ → 3Cu(NO₃)₂ + 4H₂O + 2NO', '2/3 mol'], N: 3,
    answerJp: '(1) HNO₃+3H⁺+3e⁻→2H₂O+NO (2) 3Cu+8HNO₃→3Cu(NO₃)₂+4H₂O+2NO (3) 2/3 mol',
    explCn: '(1) Nは+5→+2（NO）で3e⁻ を受け取る。電荷・原子数を合わせて左に3H⁺、右に2H₂O。(2) Cu→Cu²⁺+2e⁻ を×3、①式×2 して e⁻ を消去し、変化しない6NO₃⁻ を加えて整理。(3) 8molのHNO₃のうち6molは Cu(NO₃)₂ を作るだけで酸化数変化なし。酸化剤として働いたのはNOに変化した2molだけで、Cu 3mol 当たり2mol、すなわちCu 1mol 当たり 2/3 mol。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qB10', category: '基本問題', topic: T_REDOX, subtopics: S_TIT,
    optMode: 'multi', Q: '0.010 mol/L 過マンガン酸カリウム水溶液 50 mL に希硫酸を加え二酸化硫黄を通じた。aKMnO₄+bSO₂+cH₂O→dMnSO₄+eK₂SO₄+fH₂SO₄ について，(1) 酸化された物質・還元された物質（原子の酸化数の変化も）(2) 係数 a：b の比 (3) 反応したSO₂の標準状態での体積 [mL]。',
    answerVector: ['SO₂（S：+4 → +6）', 'KMnO₄（Mn：+7 → +2）', 'a：b＝2：5', '28 mL'], N: 4,
    answerJp: '(1) 酸化された物質：SO₂（S：+4→+6），還元された物質：KMnO₄（Mn：+7→+2） (2) a：b＝2：5 (3) 28 mL',
    explCn: '(1) SO₂ が酸化され（Sの酸化数+4→+6）、KMnO₄ が還元される（Mn：+7→+2）。(2) MnO₄⁻ は5e⁻ 受け取り、SO₂ は2e⁻ 放出 → ①式×2＋②式×5 で a:b=2:5。(3) KMnO₄ の物質量 0.010 mol/L×50/1000 L=5.0×10⁻⁴ mol。消費SO₂＝5.0×10⁻⁴×5/2=1.25×10⁻³ mol → 22.4×1.25×10⁻³=2.8×10⁻² L＝28 mL。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qB11', category: '基本問題', topic: T_REDOX, subtopics: S_METAL,
    optMode: 'multi', Q: '次の文の（）に適当な語句を入れよ。（金属は水溶液中で陽イオンになろうとする傾向をもつ。これを金属の (a) といい，亜鉛・銅・銀は (b)＞(c)＞(d)。硝酸銀水溶液に銅板を浸すと銀イオンが銅から (e) を受け取り銀が析出し，この変化はイオン反応式で (f)。亜鉛は塩酸と反応して (g) を発生する）',
    answerVector: ['イオン化傾向', '亜鉛', '銅', '銀', '電子', '2Ag⁺ + Cu → 2Ag + Cu²⁺', '水素'], N: 7,
    answerJp: '(a) イオン化傾向 (b) 亜鉛 (c) 銅 (d) 銀 (e) 電子 (f) 2Ag⁺+Cu→2Ag+Cu²⁺ (g) 水素',
    explCn: '金属のイオン化傾向（Zn>Cu>Ag）は、水溶液中で金属が陽イオンになる変化のしやすさ。Cu を AgNO₃ 水溶液に入れると、イオン化傾向の大きい Cu が e⁻ を失い（還元剤）、Ag⁺ が e⁻ を受け取って Ag が析出（酸化剤）。Zn は H₂ よりイオン化傾向が大きいので塩酸の H⁺ に e⁻ を与えて H₂ を発生（Zn+2H⁺→Zn²⁺+H₂）。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qB12', category: '基本問題', topic: T_REDOX, subtopics: S_METAL,
    optMode: 'multi', Q: '次の(ア)～(カ)の塩の水溶液に（）内の物質を入れた。(ア) 硫酸銅(Ⅱ)（亜鉛） (イ) 硝酸銀（鉄） (ウ) 硫酸亜鉛（鉛） (エ) 塩化ナトリウム（白金） (オ) 硝酸銀（銅） (カ) 塩化カルシウム（銀）。(1) （）内の物質が溶けるものはどれかすべて答えよ。(2) (1)の場合に起こる反応をそれぞれイオン反応式で書け。',
    answerVector: ['ア，イ，オ', 'Cu²⁺ + Zn → Cu + Zn²⁺', '2Ag⁺ + Fe → 2Ag + Fe²⁺', '2Ag⁺ + Cu → 2Ag + Cu²⁺'], N: 4,
    answerJp: '(1) ア，イ，オ (2) (ア) Cu²⁺+Zn→Cu+Zn²⁺ (イ) 2Ag⁺+Fe→2Ag+Fe²⁺ (オ) 2Ag⁺+Cu→2Ag+Cu²⁺',
    explCn: 'イオン化傾向の小さい金属イオンを含む水溶液に、イオン化傾向の大きい金属単体を入れると、イオンが還元されて析出し、単体が溶ける。(ア) Cu<Zn、(イ) Ag<Fe、(オ) Ag<Cu で反応が起こる。(ウ) Zn>Pb、(エ) Na>Pt、(カ) Ca>Ag では反応しない。',
    issues: ['解析原文 (1) 使用「才」字形（应为 オ），按項目规则保留原样，答案按題文の「オ」対応'],
  },
  {
    code: 'chem-cheb6-qB13', category: '基本問題', topic: T_REDOX, subtopics: S_METAL,
    optMode: 'multi', Q: '4種類の金属A，B，C，Dをイオン化傾向の大きい順に並べよ。（(a) A・Dは希硫酸に溶けて水素を発生，Cは反応しない (b) Dの硫酸塩水溶液にAの板を入れるとAの表面にDが析出 (c) Bだけが常温の水と激しく反応）',
    answerVector: ['B > A > D > C'], N: 1,
    answerJp: 'B > A > D > C',
    explCn: '(a) 希硫酸（H⁺）と反応する金属は水素よりイオン化傾向が大きい → A，D>C。(b) 析出するのはイオン化傾向の小さい金属 → A>D。(c) 常温の水と反応するのはイオン化傾向が特に大きいグループ（Na,K など）→ B が最大。よって B>A>D>C。',
    issues: [],
  },
  // ---- 応用例題 / 応用問題 ----
  {
    code: 'chem-cheb6-qA1', category: '応用例題', topic: T_REDOX, subtopics: S_TIT,
    optMode: 'multi', Q: '濃度未知の過酸化水素水 20.0 mL を 0.0400 mol/L 過マンガン酸カリウム水溶液で滴定した（H₂O₂→O₂+2H⁺+2e⁻，MnO₄⁻+8H⁺+5e⁻→Mn²⁺+4H₂O）。(1) イオン反応式をつくれ (2) KMnO₄ 1.0 mol と過不足なく反応する H₂O₂ は何 mol か (3) 過酸化水素水の濃度 (4) 褐色のビュレットを用いる理由 (5) 終点の判断方法。',
    answerVector: ['2MnO₄⁻ + 5H₂O₂ + 6H⁺ → 2Mn²⁺ + 5O₂ + 8H₂O', '2.5 mol', '0.0500 mol/L', '過マンガン酸カリウムが光によって分解されやすいから。', 'MnO₄⁻の赤紫色が消えず，わずかに残るようになったときが終点である。'], N: 5,
    answerJp: '(1) 2MnO₄⁻+5H₂O₂+6H⁺→2Mn²⁺+5O₂+8H₂O (2) 2.5 mol (3) 0.0500 mol/L (4) KMnO₄ が光で分解されやすいから (5) MnO₄⁻ の赤紫色が消えずわずかに残るようになったとき',
    explCn: '(1) ①式×5＋②式×2 で e⁻ を消去。(2) KMnO₄:H₂O₂=2:5 より 1.0×5/2=2.5 mol。(3) 0.0400×10.0/1000×5/2 = x×20.0/1000 → x=0.0500 mol/L（別解：e⁻ の物質量が等しい：0.0400×(10.0/1000)×5=x×(20.0/1000)×2）。(4) KMnO₄ は光分解しやすいため褐色瓶・褐色ビュレットを用いる。(5) 反応終了後、過剰の MnO₄⁻ の赤紫色が薄く残った点が終点。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qA2', category: '応用問題', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: '(1) ヨウ化カリウムとデンプンを含む水溶液に加えると青色を呈するものをすべて選べ（ア オゾン イ 硫化水素 ウ 塩素 エ 二酸化炭素）。(2) ヨウ素溶液に加えるとヨウ素の褐色が消えるものをすべて選べ（ア 硫化水素 イ 塩素 ウ 二酸化硫黄 エ 塩化ナトリウム）。',
    answerVector: ['ア，ウ', 'ア，ウ'], N: 2,
    answerJp: '(1) ア，ウ (2) ア，ウ',
    explCn: '(1) KI が酸化されて I₂ が生じるとヨウ素デンプン反応で青紫色になる。酸化作用のあるオゾン（O₃）と塩素（Cl₂）が該当（2I⁻→I₂+2e⁻ を酸化する）。(2) I₂ が還元されて I⁻ に変化すると褐色が消える。還元作用のある H₂S と SO₂ が該当（I₂+2e⁻→2I⁻）。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qA3', category: '応用問題', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: '次の反応は起こるが，それぞれの逆の反応は起こらない。Cl₂，Br₂，I₂ を酸化力の強い順に並べよ。(a) 2I⁻+Cl₂→2Cl⁻+I₂ (b) 2I⁻+Br₂→2Br⁻+I₂ (c) 2Br⁻+Cl₂→2Cl⁻+Br₂',
    answerVector: ['Cl₂ > Br₂ > I₂'], N: 1,
    answerJp: 'Cl₂ > Br₂ > I₂',
    explCn: '反応が起こる＝反応物側のハロゲン（酸化剤）が生成物側のハロゲンより酸化力が強い。(a)より Cl₂>I₂、(b)より Br₂>I₂、(c)より Cl₂>Br₂。よって Cl₂>Br₂>I₂（ハロゲンの酸化力は上から順に F₂>Cl₂>Br₂>I₂）。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qA4', category: '応用問題', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'multi', Q: '次の文の（）に適当な語句・数値を入れよ。（二酸化硫黄は硫化水素と反応するときは (a) としてはたらく。標準状態で14 mL の SO₂ を 0.010 mol/L の H₂S 水溶液 200 mL に通じて完全に反応させるとき，残った H₂S の物質量は (b) mol）',
    answerVector: ['酸化剤', '7.5 × 10⁻⁴ mol'], N: 2,
    answerJp: '(a) 酸化剤 (b) 7.5×10⁻⁴ mol',
    explCn: '2H₂S+SO₂→3S+2H₂O。SO₂ 中の S は+4→0（還元されるので酸化剤）、H₂S 中の S は−2→0（酸化されるので還元剤）。SO₂ の物質量=14×10⁻³/22.4=6.25×10⁻⁴ mol。H₂S 消費量=6.25×10⁻⁴×2=1.25×10⁻³ mol。残り=0.010×200/1000−1.25×10⁻³=2.0×10⁻³−1.25×10⁻³=7.5×10⁻⁴ mol。',
    issues: ['解析原文 (a) 使用「酸化剂」字形（应为 酸化剤），按項目规则保留原样，答案按规范字「酸化剤」'],
  },
  {
    code: 'chem-cheb6-qA5', category: '応用問題', topic: T_REDOX, subtopics: S_BASE,
    optMode: 'native', Q: '次の(ア)～(エ)のうち誤りを含むものを1つ選べ。',
    options: [
      '（ア）硫酸酸性の過マンガン酸カリウム水溶液に過酸化水素水を加えると，水溶液が赤紫色からほとんど無色の淡桃色に変化する。',
      '（イ）硫酸酸性のニクロム酸カリウム水溶液に過酸化水素水を加えると，水溶液が赤橙色から緑色に変化する。',
      '（ウ）硫酸酸性の過酸化水素水にヨウ化カリウム水溶液を加えると，水溶液が無色から青紫色に変化する。',
      '（エ）二酸化硫黄の水溶液に硫化水素を通じると，水溶液が無色から白色に変化する。',
    ], correctIndex: 2,
    answerJp: 'ウ',
    explCn: '(ア) MnO₄⁻（赤紫）は H₂O₂ により Mn²⁺（無色に近い淡桃色）に還元される（正）。(イ) Cr₂O₇²⁻（赤橙）は Cr³⁺（緑）に還元される（正）。(ウ) 2I⁻+H₂O₂+2H⁺→I₂+2H₂O で I₂ が生じるが、微量では青紫色になりにくく褐色どまりになるので誤り（デンプンを加えておくと無色→青紫色になる）。(エ) SO₂+2H₂S→3S+2H₂O で水に溶けにくい硫黄が白濁（正）。',
    issues: ['解析原文解题中「（工）」为OCR字形（应为（エ）），按項目规则保留原样；原生选项保留原书顺序不打散'],
  },
  {
    code: 'chem-cheb6-qA6', category: '応用問題', topic: T_REDOX, subtopics: S_TIT,
    optMode: 'multi', Q: '過酸化水素水を器具(a)(b)で20.0倍に薄め，10.0 mL を 3.16 g/L の KMnO₄ 水溶液で滴定（9.12 mL で完結）した。(1) H₂O₂ の e⁻を含む反応式 (2) KMnO₄ の e⁻を含む反応式 (3) 酸化数の変化する原子 (4) 器具(a)(b)の名称 (5) 終点の溶液の色 (6) KMnO₄ 水溶液の濃度 (7) 薄める前の H₂O₂ の濃度。',
    answerVector: ['H₂O₂ → O₂ + 2H⁺ + 2e⁻', 'MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O', 'H₂O₂ の O：−1 → 0，Mn：+7 → +2', 'メスフラスコ', 'ホールピペット', '薄い赤紫色', '0.0200 mol/L', '0.912 mol/L'], N: 8,
    answerJp: '(1) H₂O₂→O₂+2H⁺+2e⁻ (2) MnO₄⁻+8H⁺+5e⁻→Mn²⁺+4H₂O (3) H₂O₂ の O：−1→0，Mn：+7→+2 (4) (a) メスフラスコ (b) ホールピペット (5) 薄い赤紫色 (6) 0.0200 mol/L (7) 0.912 mol/L',
    explCn: '(1)(2) 半反応式。(3) H₂O₂ の O は−1（H は+1）→ O₂ で0、MnO₄⁻ の Mn は+7→ Mn²⁺ で+2。(4) 20.0倍希釈はメスフラスコ(a)とホールピペット(b)で行う。(5) 過剰になった MnO₄⁻ の赤紫色が薄く残ったときが終点（薄い赤紫色）。(6) 3.16/158=0.0200 mol/L。(7) 2MnO₄⁻+5H₂O₂ より 0.0200×(9.12/1000)×5/2=x×(10.0/1000) → x=0.0456（希釈後）、原液は20.0倍で 0.912 mol/L。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qA7', category: '応用問題', topic: T_REDOX, subtopics: S_TIT,
    optMode: 'multi', Q: '0.0500 mol/L シュウ酸標準液 20.0 mL を酸性にして過マンガン酸カリウム水溶液で滴定（16.0 mL で終点）した。(1) 酸化数の変化した原子と酸化数の変化 (2) KMnO₄ 水溶液の濃度 (3) 硫酸の代わりに硝酸を用いることができない理由 (4) 硫酸の代わりに塩酸を用いることができない理由。',
    answerVector: ['C：+3 → +4，Mn：+7 → +2', '0.0250 mol/L', '硝酸には酸化作用があり，シュウ酸を酸化してしまうから。', '塩化水素（Cl⁻）が KMnO₄ により酸化されて Cl₂ になり，KMnO₄ が消費されてしまうから。'], N: 4,
    answerJp: '(1) C：+3→+4，Mn：+7→+2 (2) 0.0250 mol/L (3) 硝酸は酸化作用がありシュウ酸を酸化してしまうから (4) HCl の Cl⁻ が KMnO₄ に酸化されて消費されるから',
    explCn: '(1) シュウ酸 (COOH)₂ の C は+3→CO₂ の+4、Mn は+7→+2。(2) 2MnO₄⁻+5(COOH)₂ より、x×(16.0/1000)×5=0.0500×(20.0/1000)×2 → x=0.0250 mol/L。(3) HNO₃ 自身も酸化剤として働きシュウ酸を酸化するため、KMnO₄ の滴下量が少なくなる。(4) Cl⁻ が酸化されて Cl₂ になり KMnO₄ を消費するため、滴下量が多くなる。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qA8', category: '応用問題', topic: T_REDOX, subtopics: S_TIT,
    optMode: 'multi', Q: '河川水 20 mL 中の有機物を酸化するのに 5.0×10⁻³ mol/L KMnO₄ 水溶液 4.8 mL を要した。(1) KMnO₄ 1 mol の消費は O₂ 何 mol の消費に換算されるか（e⁻ のやりとりから，分数で） (2) 河川水 1 L に要する KMnO₄ の物質量 (3) この河川水の COD [mg/L]。',
    answerVector: ['5/4 mol', '1.2 × 10⁻³ mol', '48 mg/L'], N: 3,
    answerJp: '(1) 5/4 mol (2) 1.2×10⁻³ mol (3) 48 mg/L',
    explCn: '(1) MnO₄⁻ は5e⁻ を受け取り、O₂ は4e⁻ を受け取る。KMnO₄ 1 mol の酸化力は O₂ 5/4 mol 分（5e⁻÷4e⁻/mol）。(2) 5.0×10⁻³×(4.8/1000)×(1000/20)=1.2×10⁻³ mol。(3) O₂ 換算で 1.2×10⁻³×5/4=1.5×10⁻³ mol → 32×1.5×10⁻³=0.048 g=48 mg → COD 48 mg/L。',
    issues: [],
  },
  {
    code: 'chem-cheb6-qA9', category: '応用問題', topic: T_REDOX, subtopics: S_METAL,
    optMode: 'multi', Q: 'A～G は 亜鉛・銀・スズ・鉄・銅・ナトリウム・鉛のいずれか。(1) Eの陽イオン水溶液に A を浸すと A の表面に E が析出 (2) BとDを空気中で強熱すると B は酸化されるが D はされない (3) Fは G より接触するとさびやすくなり A と接触するとさびにくくなる (4) C は常温の水と激しく反応 (5) A,C,F,G は希塩酸と反応し B,D,E は反応しない（Eは塩化物が水に溶けず表面をおおうため）。各金属を元素記号で答えよ。',
    answerVector: ['Zn', 'Cu', 'Na', 'Ag', 'Pb', 'Fe', 'Sn'], N: 7,
    answerJp: 'A：Zn，B：Cu，C：Na，D：Ag，E：Pb，F：Fe，G：Sn',
    explCn: '(4) 常温の水と反応＝Na（C）。(5) 塩酸と反応する A,C,F,G は水素より大きい。E は酸化数変化はするが塩化鉛（Ⅱ）PbCl₂ が水に不溶で保護膜となるため溶けない→Pb。(1) E のイオンを析出させる A は E より大きい。(2) 空気中で酸化される B>D。(3) 接触するとさびやすい側がイオン化傾向大（G<F<A より F>G かつ A>F）。全体で Na>Zn>Fe>Sn>Pb>Cu>Ag より A：Zn，B：Cu，D：Ag，F：Fe，G：Sn。',
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
  console.log('cheb6 drafts:', d.length);
  const s = new Map();
  d.forEach((x) => s.set(x.generationStatus, (s.get(x.generationStatus) || 0) + 1));
  console.log('status:', Object.fromEntries(s));
}