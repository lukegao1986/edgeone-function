#!/usr/bin/env node
/**
 * che12_pilot_content.cjs — che12（第12章 有機化合物の分類と分析）内容定义
 *
 * 源：che12_题目.md + che12_解析.md（仅此两文件，其余为过程文件）
 * 考纲：ejuSyllabus.ts
 *  - 官能基・化合物の分類（アルコール/アルデヒド/ケトン/カルボン酸/エステル/アミン/エーテル）
 *    → chem_4_1_2（官能基をもつ脂肪族化合物）
 *  - 異性体（構造異性体・シス-トランス・鏡像異性体・異性体の数）→ chem_4_1_1_03
 *  - 元素分析・成分元素の検出・分子式/組成式/構造式の決定 → chem_1_4_2_01
 *    （化学式の種類：分子式・電子式・構造式・組成式；考纲无独立"分析"节点，取该最贴近节点）
 *
 * 变通：记述题（275 ソーダ石灰管位置と理由）已把参考答案要点作为一个槽位纳入多空构造。
 */
'use strict';

const T_CLS = 'chem_4_1_2';                  // 官能基をもつ脂肪族化合物（分類）
const T_ISO = 'chem_4_1_1';                  // 脂肪族炭化水素（異性体）
const T_ANA = 'chem_1_4_2';                  // 化学式（元素分析・分子式決定）
const S_A = ['chem_4_1_2_01'];               // アルコール・エーテル
const S_B = ['chem_4_1_2_02'];               // アルデヒド・ケトン
const S_C = ['chem_4_1_2_03'];               // カルボン酸・エステル
const S_ABC = ['chem_4_1_2_01', 'chem_4_1_2_02', 'chem_4_1_2_03'];
const S_BC = ['chem_4_1_2_02', 'chem_4_1_2_03'];
const S_ISO = ['chem_4_1_1_03'];             // 異性体
const S_ANA = ['chem_1_4_2_01'];             // 分子式・組成式・構造式

const CONTENT = [
  // ---- 基礎 CHECK ----
  {
    code: 'chem-che12-qC1', category: '基礎 CHECK', topic: T_CLS, subtopics: S_ABC,
    optMode: 'multi', Q: '次の官能基を例にならって記せ（-SO₃H のように表記）。(1)ヒドロキシ基 (2)ホルミル基 (3)アミノ基 (4)ニトロ基 (5)カルボキシ基',
    answerVector: ['-OH', '-CHO', '-NH₂', '-NO₂', '-COOH'], N: 5,
    answerJp: '(1)-OH (2)-CHO (3)-NH₂ (4)-NO₂ (5)-COOH',
    explCn: 'ヒドロキシ基 -OH（アルコール）、ホルミル基 -CHO（アルデヒド）、アミノ基 -NH₂（アミン）、ニトロ基 -NO₂（ニトロ化合物）、カルボキシ基 -COOH（カルボン酸）。',
    issues: [],
  },
  {
    code: 'chem-che12-qC2', category: '基礎 CHECK', topic: T_CLS, subtopics: S_BC,
    optMode: 'multi', Q: '(1) -CHO をもつ化合物を何というか。(2) -COOH をもつ化合物を何というか。',
    answerVector: ['アルデヒド', 'カルボン酸'], N: 2,
    answerJp: '(1)アルデヒド (2)カルボン酸',
    explCn: '-CHO を官能基にもつ化合物をアルデヒド、-COOH をもつものをカルボン酸という。',
    issues: [],
  },
  {
    code: 'chem-che12-qC3', category: '基礎 CHECK', topic: T_ISO, subtopics: S_ISO,
    optMode: 'multi', Q: '分子式が同じで，構造が異なる化合物どうしを何というか。',
    answerVector: ['異性体'], N: 1,
    answerJp: '異性体',
    explCn: '分子式が同じであるが、原子の結合のしかたや立体構造が異なる化合物どうしを異性体という（構造異性体を含んだ総称）。',
    issues: [],
  },
  {
    code: 'chem-che12-qC4', category: '基礎 CHECK', topic: T_ISO, subtopics: S_ISO,
    optMode: 'multi', Q: '分子式 C₄H₁₀ の炭化水素には，何種類の構造異性体があるか。',
    answerVector: ['2種類'], N: 1,
    answerJp: '2種類',
    explCn: 'C₄H₁₀ は n-ブタン（直鎖）とイソブタン（分岐 CH₃-CH(CH₃)-CH₃）の 2 種類。',
    issues: [],
  },

  // ---- 基本例題 ----
  {
    code: 'chem-che12-qE1', category: '基本例題', topic: T_ANA, subtopics: S_ANA,
    optMode: 'multi', Q: '元素分析（化合物A 0.66g 燃焼→CO₂ 1.32g・H₂O 0.54g）：(1)(a),(b)に詰める薬品 (2)CO₂ と H₂O の吸収位置 (3)A の組成式 (4)分子量 88 として分子式。',
    answerVector: ['塩化カルシウム', 'ソーダ石灰', '二酸化炭素：b、水：a', 'C₂H₄O', 'C₄H₈O₂'], N: 5,
    answerJp: '(1)(a)塩化カルシウム (b)ソーダ石灰 (2)CO₂：b、H₂O：a (3)C₂H₄O (4)C₄H₈O₂',
    explCn: 'H は H₂O として塩化カルシウムに、C は CO₂ としてソーダ石灰に吸収される（ソーダ石灰は H₂O も吸収するので後ろ）。C=1.32×12/44=0.36g、H=0.54×2/18=0.060g、O=0.66-(0.36+0.060)=0.24g → C:H:O=0.36/12:0.060/1.0:0.24/16=2:4:1 → 組成式 C₂H₄O（式量44）。44×n=88 より n=2 → 分子式 C₄H₈O₂。',
    issues: [],
  },

  // ---- 基本問題 ----
  {
    code: 'chem-che12-qB1', category: '基本問題', topic: T_CLS, subtopics: S_ABC,
    optMode: 'multi', Q: '有機化合物の性質：（a）を骨格とし、構成元素の数は（b）く、（a）や（c）のほかに酸素・（d）など。一般に（e）からなる物質で融点・沸点は（f）い。水（g）に溶けにくく（h）に溶けやすい。選択：水素/ケイ素/炭素/窒素/多/少な/高/低/イオン/分子/水/有機溶媒。',
    answerVector: ['炭素', '少な', '水素', '窒素', '分子', '低', '水', '有機溶媒'], N: 8,
    answerJp: '(a)炭素 (b)少な (c)水素 (d)窒素 (e)分子 (f)低 (g)水 (h)有機溶媒',
    explCn: '有機化合物は C を骨格とし構成元素の種類は少なく、C・H のほか O・N・S など。一般に分子からなる物質で融点・沸点は低く、水に溶けにくく有機溶媒に溶けやすい。',
    issues: [],
  },
  {
    code: 'chem-che12-qB2', category: '基本問題', topic: T_CLS, subtopics: S_ABC,
    optMode: 'multi', Q: '化合物の分類（ア）炭化水素（イ）カルボン酸（ウ）アルコール（エ）アルデヒド（オ）ケトン（カ）エステル（キ）アミン（ク）エーテル：(1)CH₃-CH₂-COOH (2)CH₃-OH (3)CH₃-O-CH₃ (4)CH₂=CH-CH₃ (5)CH₃-CO-CH₃ (6)CH₃-COO-C₂H₅ (7)C₆H₅-NH₂ (8)H-CHO。',
    answerVector: ['カルボン酸', 'アルコール', 'エーテル', '炭化水素', 'ケトン', 'エステル', 'アミン', 'アルデヒド'], N: 8,
    answerJp: '(1)カルボン酸 (2)アルコール (3)エーテル (4)炭化水素 (5)ケトン (6)エステル (7)アミン (8)アルデヒド',
    explCn: '-COOH→カルボン酸、-OH→アルコール、C-O-C→エーテル、C=C のみ→炭化水素（プロペン）、-CO-→ケトン（アセトン）、-COO-→エステル、-NH₂→アミン（アニリン）、-CHO→アルデヒド（ホルムアルデヒド）。',
    issues: [],
  },
  {
    code: 'chem-che12-qB3', category: '基本問題', topic: T_ISO, subtopics: S_ISO,
    optMode: 'multi', Q: '(1)(ア)～(ク)のうち構造異性体の組を 2 組選べ（アとウ、エとキ など）。(2)(a)C₅H₁₂ (b)C₄H₉Cl (c)C₂H₃Cl₃ (d)C₂H₂Cl₂ (e)C₃H₈O の鎖式化合物の構造異性体の種類数。',
    answerVector: ['アとウ', 'エとキ', '3種類', '4種類', '2種類', '2種類', '3種類'], N: 7,
    answerJp: '(1)アとウ、エとキ (2)(a)3種類 (b)4種類 (c)2種類 (d)2種類 (e)3種類',
    explCn: '(1)アC₂H₆O(エタノール)とウC₂H₆O(ジメチルエーテル)、エC₃H₆O(プロパナール)とキC₃H₆O(アセトン)。(2)a ペンタン3異性体；b ブチル基の Cl 位置は 1-Cl/2-Cl/2-メチル-1-Cl/2-メチル-2-Cl の4種；c 1,1,1-トリクロロメタンと1,1,2-トリクロロの2種；d CH₂=CCl₂ と CHCl=CHCl(cis/trans は構造異性体に含めず)の2種；e 1-プロパノール・2-プロパノール・メチルエチルエーテルの3種。',
    issues: [],
  },
  {
    code: 'chem-che12-qB4', category: '基本問題', topic: T_ANA, subtopics: S_ANA,
    optMode: 'multi', Q: '成分元素の検出：次の操作で確認できる元素を答えよ（炭素/水素/窒素/塩素/硫黄）。(1)ソーダ石灰と加熱→濃 HCl 近づけ白煙 (2)単体 Na と加熱→水溶かし酢酸鉛(Ⅱ)水溶液で黒色沈殿 (3)黒く焼いた銅線に付けて炎→青緑色炎色 (4)CuO と加熱→石灰水白濁 (5)CuO と加熱→白色 CuSO₄ が青。',
    answerVector: ['窒素', '硫黄', '塩素', '炭素', '水素'], N: 5,
    answerJp: '(1)窒素 (2)硫黄 (3)塩素 (4)炭素 (5)水素',
    explCn: '(1)N はソーダ石灰加熱で NH₃→濃 HCl と NH₄Cl 白煙。(2)S は Na 加熱で Na₂S→Pb²⁺ で黒色 PbS。(3)Cl は CuCl₂ として青緑炎色。(4)C は CO₂→石灰水白濁。(5)H は H₂O→白色 CuSO₄ が CuSO₄·5H₂O で青に。',
    issues: [],
  },
  {
    code: 'chem-che12-qB5', category: '基本問題', topic: T_ANA, subtopics: S_ANA,
    optMode: 'multi', Q: '元素分析：(1)CuO は(ア)を(イ)に変える働き。(2)ソーダ石灰管の位置（AかB）とその理由。(3)X 中の炭素・水素の質量(mg)。(4)X の組成式。',
    answerVector: ['CO', 'CO₂', 'B', '塩化カルシウムは水のみ、ソーダ石灰はCO₂と水の両方を吸収するため、順序を入れ替えると各質量を別々に測定できないから', '24mg', '5.0mg', 'C₂H₅'], N: 7,
    answerJp: '(1)CO→CO₂ (2)B（理由：塩化カルシウムは水を、ソーダ石灰はCO₂と水の両方を吸収するので、順序を入れ替えるとそれぞれの質量を別々に測定できなくなるから） (3)炭素24mg・水素5.0mg (4)C₂H₅',
    explCn: '(1)CuO は不完全燃焼で生じる CO を CO₂ に酸化する酸化剤。(2)ソーダ石灰は H₂O と CO₂ の両方を吸収するので、先に用いると別々に測れない → 最後の B。(3)C=88×12/44=24mg、H=45×2/18=5.0mg。(4)x:y=24/12:5.0/1.0=2:5 → C₂H₅。',
    issues: [],
  },
  {
    code: 'chem-che12-qB6', category: '基本問題', topic: T_ANA, subtopics: S_ANA,
    optMode: 'multi', Q: 'A 45mg 完全燃焼→塩化カルシウム管増27mg、ソーダ石灰管増66mg。分子量 60。(1)A の組成式 (2)A の分子式。',
    answerVector: ['CH₂O', 'C₂H₄O₂'], N: 2,
    answerJp: '(1)CH₂O (2)C₂H₄O₂',
    explCn: 'H₂O 27mg→H=27×2/18=3.0mg、CO₂ 66mg→C=66×12/44=18mg、O=45-(18+3.0)=24mg → C:H:O=18/12:3.0/1.0:24/16=1:2:1 → CH₂O（式量30）。30×n=60 → n=2 → C₂H₄O₂。',
    issues: [],
  },
  {
    code: 'chem-che12-qB7', category: '基本問題', topic: T_ANA, subtopics: S_ANA,
    optMode: 'multi', Q: '元素分析 C:52.2% H:13.0% O:34.8%、分子量 46。(1)分子式 (2)ヒドロキシ基 -OH をもつときの構造式。',
    answerVector: ['C₂H₆O', 'CH₃-CH₂-OH'], N: 2,
    answerJp: '(1)C₂H₆O (2)CH₃-CH₂-OH',
    explCn: 'x:y:z=52.2/12:13.0/1.0:34.8/16≈2:6:1 → C₂H₆O（式量46）。46×n=46→n=1 → C₂H₆O。-OH を除くと C₂H₅- で、CH₃-CH₂- と決まる → CH₃-CH₂-OH（エタノール）。',
    issues: [],
  },

  // ---- 応用例題 ----
  {
    code: 'chem-che12-qA1', category: '応用例題', topic: T_ISO, subtopics: S_ISO,
    optMode: 'multi', Q: '化合物 (A)~(E) の関係：(1)(B)と(C) (2)(A)と(B) (3)(D)と(E) はそれぞれ構造異性体・シス-トランス異性体・鏡像異性体のどれか。',
    answerVector: ['シス-トランス異性体', '構造異性体', '鏡像異性体'], N: 3,
    answerJp: '(1)シス-トランス異性体 (2)構造異性体 (3)鏡像異性体',
    explCn: '(1)C=C は回転できないため置換基の向きが異なる別物質 → シス-トランス異性体。(2)分子式が同じで結合のしかたが異なる → 構造異性体。(3)不斉炭素原子をもち実像と鏡像の関係 → 鏡像異性体。',
    issues: [],
  },

  // ---- 応用問題 ----
  {
    code: 'chem-che12-qA2', category: '応用問題', topic: T_ISO, subtopics: S_ISO,
    optMode: 'multi', Q: '(1)(ア)～(エ)のうち同じ物質を表す組合せ。(2)(a)(ア)と(イ)～(オ)のうち同じ物質をすべて選べ。(b)同じ物質群と異なる物質群の関係。(c)(b)の関係が生じるのに必要な原子。',
    answerVector: ['アとエ', 'ウ、オ', '鏡像異性体（光学異性体）', '不斉炭素原子'], N: 4,
    answerJp: '(1)アとエ (2)(a)ウ、オ (b)鏡像異性体（光学異性体） (c)不斉炭素原子',
    explCn: '(1)C-C 単結合は回転できるので、Cl の向きが違っても同じ物質 → アとエ。(2)a H の位置をそろえて回転させ、CH₃→OH→Cl の回転方向が同じ (ウ)・(オ)。(b)左右の回転が逆 → 鏡像異性体。(c)4 つがすべて異なる基に結合した不斉炭素原子が必要。',
    issues: [],
  },
  {
    code: 'chem-che12-qA3', category: '応用問題', topic: T_ISO, subtopics: S_ISO,
    optMode: 'multi', Q: '立体異性体を含め何種類の構造が考えられるか。(1)CH₂Cl₂ (2)C₃H₆Cl₂ (3)C₄H₁₀O (4)C₂H₂Cl₂。',
    answerVector: ['1種類', '5種類', '8種類', '3種類'], N: 4,
    answerJp: '(1)1種類 (2)5種類 (3)8種類 (4)3種類',
    explCn: '(1)CH₂Cl₂ は四面体で位置差なし → 1種類（鏡像なし）。(2)C₃H₆Cl₂：構造異性体 1,3-/1,1-/1,2-/2,2- の 4 種に不斉炭素（1,2-）の鏡像 1 を加えて 5。(3)C₄H₁₀O：アルコール4(1-,2-,2-メチル-1-,2-メチル-2-)+エーテル3 = 7 種、+2-ブタノールの鏡像1 = 8。(4)CH₂=CCl₂ と CHCl=CHCl、後者に cis/trans が2 → 計3。',
    issues: [],
  },
  {
    code: 'chem-che12-qA4', category: '応用問題', topic: T_ANA, subtopics: S_ANA,
    optMode: 'multi', Q: '分子式 C₉HₙO₂ の化合物 30mg を完全燃焼→水 18mg 生成。n の値を求めよ。',
    answerVector: ['10'], N: 1,
    answerJp: 'n = 10',
    explCn: '分子量=12×9+n+32=140+n。水 18mg 中の H=18×2/18=2.0mg。30mg×(n/(140+n))=2.0mg → n=10。',
    issues: [],
  },
  {
    code: 'chem-che12-qA5', category: '応用問題', topic: T_ANA, subtopics: S_ANA,
    optMode: 'multi', Q: 'A 7.7mg 燃焼→塩化カルシウム管増6.3mg・ソーダ石灰管増15.4mg。A 440mg をベンゼン100g に溶かし凝固点0.256K 降下（モル凝固点降下5.12）。(1)A の分子式 (2)エステル結合をもつときの構造の種類数。',
    answerVector: ['C₄H₈O₂', '4種類'], N: 2,
    answerJp: '(1)C₄H₈O₂ (2)4種類',
    explCn: 'C=15.4×12/44=4.2mg、H=6.3×2/18=0.70mg、O=7.7-(4.2+0.70)=2.8mg → C:H:O=4.2/12:0.70/1.0:2.8/16=2:4:1 → C₂H₄O（式量44）。0.256=5.12×{(0.440/M)/0.100} → M=88 → n=2 → C₄H₈O₂。(2)R-COO-R′ で、R′=H はカルボン酸になってしまうため除外。R/R′ の組合せ：HCOO-C₃H₇（C₃H₇- は 2 種）＋CH₃COO-C₂H₅＋C₂H₅COO-CH₃＝計 4種類。',
    issues: [],
  },
  {
    code: 'chem-che12-qA6', category: '応用問題', topic: T_ANA, subtopics: S_ANA,
    optMode: 'multi', Q: '炭化水素 A は標準状態で密度 2.41g/L の気体。A 16.0mg の完全燃焼に O₂ 36.5mL 必要。(1)A の分子式 (2)鎖式化合物の構造異性体の種類数。',
    answerVector: ['C₄H₆', '4種類'], N: 2,
    answerJp: '(1)C₄H₆ (2)4種類',
    explCn: '(1)モル質量=2.41×22.4≈54.0。CₓHᵧ とすると燃焼の O₂ 係数 x+y/4：22400×(16.0×10⁻³/54.0)×(x+y/4)=36.5 → 4x+y=22。分子量 12x+y=54 → x=4、y=6 → C₄H₆。(2)2n-2 個の H より C=C 2個又は C≡C 1個：CH₂=C=CH-CH₃、CH₂=CH-CH=CH₂、CH≡C-CH₂-CH₃、CH₃-C≡C-CH₃ の 4種類。',
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
  console.log('che12 drafts:', d.length);
  const s = new Map();
  d.forEach((x) => s.set(x.generationStatus, (s.get(x.generationStatus) || 0) + 1));
  console.log('status:', Object.fromEntries(s));
}