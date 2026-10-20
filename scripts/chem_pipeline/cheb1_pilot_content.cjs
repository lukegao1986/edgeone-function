#!/usr/bin/env node
/**
 * cheb1_pilot_content.cjs — cheb1（第1章 物質の構成）内容定义
 *
 * 源：cheb1_题目.md + cheb1_解析.md（仅此两文件，其余为过程文件）
 * 考纲：ejuSyllabus.ts chem_1_1（物質の成分と構成元素）
 *  - 純物質と混合物 chem_1_1_1_01 / 物質の分離・精製 chem_1_1_1_02
 *  - 元素と単体・化合物・同素体 chem_1_1_2_01 / 元素の確認方法 chem_1_1_2_02
 *  - 物質の三態 chem_1_1_3_01 / 状態変化 chem_1_1_3_02
 *
 * 变通（沿用 che2~che17 规则）：
 *  - qA5(2) 作図図示 → 「语言描述图特征与操作要点」整体作槽位；
 *  - qB9(2)/qA3(1)(2)/qA4(2) 記述・理由 → 「参考答案要点」整体作槽位；
 *  - qA8(2) 作図（グラフ）→ 「语言描述曲线起点与平行移动特征」整体作槽位。
 *  - OCR 字形（解析中の「力」「才」「亻」）按項目规则保留原样，不改动。
 */
'use strict';

const T_SEP = 'chem_1_1_1';   // 純物質と混合物 / 物質の分離・精製
const S_PURE = ['chem_1_1_1_01'];  // 純物質と混合物
const S_SEP = ['chem_1_1_1_02'];   // 物質の分離・精製
const T_COMP = 'chem_1_1_2';   // 物質とその成分
const S_ELEM = ['chem_1_1_2_01'];  // 元素と単体・化合物・同素体
const S_CHK = ['chem_1_1_2_02'];   // 元素の確認方法
const T_ST = 'chem_1_1_3';     // 物質の状態
const S_TRI = ['chem_1_1_3_01'];   // 物質の三態（特徴）
const S_CHG = ['chem_1_1_3_02'];   // 状態変化

const CONTENT = [
  // ---- 基礎 CHECK ----
  {
    code: 'chem-cheb1-qC1', category: '基礎 CHECK', topic: T_SEP, subtopics: S_PURE,
    optMode: 'multi', Q: '(a) 混合物 (b) 純物質 に分類せよ。（題文：(ア)銅 (イ)海水 (ウ)塩化ナトリウム (エ)メタン (オ)牛乳）',
    answerVector: ['イ，オ（海水，牛乳）', 'ア，ウ，エ（銅，塩化ナトリウム，メタン）'], N: 2,
    answerJp: '(a) イ，オ (b) ア，ウ，エ',
    explCn: '海水・牛乳は多成分からなる混合物。銅（単体）、塩化ナトリウム（化合物）、メタン（化合物）はいずれも単一物質からなる純物質。純物質には単体と化合物がある。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qC2', category: '基礎 CHECK', topic: T_COMP, subtopics: S_ELEM,
    optMode: 'multi', Q: '(a) 単体 (b) 化合物 (c) 混合物 に分類せよ。（題文：(ア)空気 (イ)アルゴン (ウ)二酸化炭素 (エ)黒鉛）',
    answerVector: ['イ，エ（アルゴン，黒鉛）', 'ウ（二酸化炭素）', 'ア（空気）'], N: 3,
    answerJp: '(a) イ，エ (b) ウ (c) ア',
    explCn: 'アルゴン（希ガスの単体）と黒鉛（炭素の単体・同素体の一つ）は単体。二酸化炭素（CO₂，2種類以上の元素）は化合物。空気は複数気体の混合で混合物。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qC3', category: '基礎 CHECK', topic: T_SEP, subtopics: S_SEP,
    optMode: 'native', Q: '石油からガソリンや灯油を得る方法を(ア)～(オ)から選べ。',
    options: ['（ア）ろ過', '（イ）抽出', '（ウ）分留', '（エ）再結晶', '（オ）昇華法'], correctIndex: 2,
    answerJp: 'ウ（分留）',
    explCn: '石油は沸点の異なる成分の混合物。沸点の違いを利用して、石油を各成分（ガソリン・灯油・軽油など）に分ける操作を分留（分別蒸留）という。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qC4', category: '基礎 CHECK', topic: T_COMP, subtopics: S_ELEM,
    optMode: 'simple', Q: '物質を構成する基本的な成分を何というか。',
    options: ['元素', '単体', '原子', '分子'], correctIndex: 0,
    answerJp: '元素',
    explCn: '物質を構成する基本的な成分（原子の種類）を「元素」という。単体は「1種類の元素だけからなる純物質」であり、成分（元素）とは概念が異なる。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qC5', category: '基礎 CHECK', topic: T_COMP, subtopics: S_ELEM,
    optMode: 'simple', Q: '同じ元素の単体で，性質が異なる物質が2種類以上存在するとき，これらの単体どうしを互いに何というか。',
    options: ['同素体', '同位体', '同族体', '同量体'], correctIndex: 0,
    answerJp: '同素体',
    explCn: '同じ元素からなる単体で、性質（外見・状態・化学的性質など）が異なるものどうしを互いに同素体という（例：酸素とオゾン、ダイヤモンドと黒鉛）。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qC6', category: '基礎 CHECK', topic: T_COMP, subtopics: S_CHK,
    optMode: 'multi', Q: '(1) 白金線をある水溶液に浸した後，炎の中に入れたところ，炎が黄色になった。(2) 硝酸銀水溶液を加えると，塩化銀の白色沈殿が生じた。検出できる元素は何か。',
    answerVector: ['ナトリウム', '塩素'], N: 2,
    answerJp: '(1) ナトリウム (2) 塩素',
    explCn: '(1) 炎色反応：Na は黄色の炎色を示す。(2) 硝酸銀水溶液による塩化銀 AgCl の白色沈殿で塩化物イオン（塩素）を確認する。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qC7', category: '基礎 CHECK', topic: T_ST, subtopics: S_CHG,
    optMode: 'multi', Q: '(1)固体が液体になる現象 (2)固体が液体にならず直接気体になる現象 (3)気体が液体になる現象 (4)液体の内部から激しく気体が発生する現象。それぞれの名称。',
    answerVector: ['融解', '昇華', '凝縮', '沸騰'], N: 4,
    answerJp: '(1) 融解 (2) 昇華 (3) 凝縮 (4) 沸騰',
    explCn: '融解＝固→液、昇華＝固→気、凝縮＝気→液。沸騰は液体の内部からも気化が起こる激しい気化現象（蒸発は液体表面からの気化）。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qC8', category: '基礎 CHECK', topic: T_ST, subtopics: S_CHG,
    optMode: 'simple', Q: '物質を構成する粒子が、その状態にかかわらず、常に行っている運動を何というか。',
    options: ['熱運動', '振動運動', '拡散', '対流'], correctIndex: 0,
    answerJp: '熱運動',
    explCn: '固体・液体・気体を問わず、構成粒子が常に行っている不規則な運動を熱運動という。温度が高いほど激しくなる。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qC9', category: '基礎 CHECK', topic: T_ST, subtopics: S_CHG,
    optMode: 'multi', Q: '(1) 固体が融解して液体になる温度 (2) 液体が沸騰して気体になる温度。それぞれの名称。',
    answerVector: ['融点', '沸点'], N: 2,
    answerJp: '(1) 融点 (2) 沸点',
    explCn: '固体が融解する温度を融点、液体が沸騰する温度を沸点という。いずれも純物質では一定の値になる。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qC10', category: '基礎 CHECK', topic: T_ST, subtopics: S_TRI,
    optMode: 'simple', Q: '最も低い温度のことを何というか。また，それは何℃か。',
    options: ['絶対零度，−273.15℃', '絶対零度，−273℃', '熱平衡温度，−273.15℃', '絶対温度の 0℃'], correctIndex: 0,
    answerJp: '絶対零度，−273.15℃',
    explCn: '理論上最も低い温度を絶対零度といい、−273.15℃ である。絶対零度では粒子の熱運動は完全に停止する。',
    issues: [],
  },
  // ---- 基本例題 ----
  {
    code: 'chem-cheb1-qE1', category: '基本例題', topic: T_SEP, subtopics: S_SEP,
    optMode: 'multi', Q: '次の文の（）に適当な語句，物質名を入れよ。混合物の分離：(a)塩化ナトリウムが溶け残っている飽和水溶液から溶け残りと溶液を分ける方法 (b)得られた水溶液から水を得る方法 (c)少量の硫酸銅（Ⅱ）を含む硝酸カリウムから硝酸カリウムを得る方法。分類：(d)1種類の元素からなる物質 (e)2種類以上の元素からなる物質 (f)同じ元素の単体で性質の異なるものどうし (g)酸素の同素体のうち無色・無臭の気体 (h)淡青色で特異臭のある気体。',
    answerVector: ['ろ過', '蒸留', '再結晶', '単体', '化合物', '同素体', '酸素', 'オゾン'], N: 8,
    answerJp: '(a) ろ過 (b) 蒸留 (c) 再結晶 (d) 単体 (e) 化合物 (f) 同素体 (g) 酸素 (h) オゾン',
    explCn: 'ろ過＝固体と液体の分離、蒸留＝溶液から溶媒（水）を得る方法、再結晶＝溶解度の差を利用した固体の精製。単体＝1種類の元素からなる純物質、化合物＝2種類以上の元素からなる純物質。同素体＝同じ元素の単体で性質の異なるもの。酸素 O₂ は無色・無臭、オゾン O₃ は淡青色・特異臭の気体。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qE2', category: '基本例題', topic: T_ST, subtopics: S_CHG,
    optMode: 'multi', Q: '次の文の（）に適当な語句を入れよ。(a)どの状態でも分子が行っている運動 (b)分子をつなぎ止めようとはたらく力 (c)固体が液体になる変化 (d)そのときの温度 (e)液体が固体になる変化 (f)そのときの温度 (g)液体が表面から気体になる変化 (h)液体の内部からも気体が生じる変化 (i)そのときの温度 (j)気体が液体になる変化 (k)固体が液体にならず直接気体になる変化 (l)その逆の変化。',
    answerVector: ['熱運動', '分子間力', '融解', '融点', '凝固', '凝固点', '蒸発', '沸騰', '沸点', '凝縮', '昇華', '凝華'], N: 12,
    answerJp: '(a) 熱運動 (b) 分子間力 (c) 融解 (d) 融点 (e) 凝固 (f) 凝固点 (g) 蒸発 (h) 沸騰 (i) 沸点 (j) 凝縮 (k) 昇華 (l) 凝華',
    explCn: '三態は熱運動と分子間力の兼ね合いで説明できる。固→液＝融解（融点）、固→気＝昇華、液→固＝凝固（凝固点）、液→気＝表面からの蒸発と内部からの沸騰（沸点）、気→液＝凝縮、気→固＝凝華。',
    issues: [],
  },
  // ---- 基本問題 ----
  {
    code: 'chem-cheb1-qB1', category: '基本問題', topic: T_SEP, subtopics: S_SEP,
    optMode: 'multi', Q: '混合物から目的の成分を分離する操作の1つを図に示す。(1)この分離操作を何というか。(2)図の①～③の器具の名称を答えよ。(3)図の②を通過して下に流れ出てくる液を何というか。(4)図の操作で不適当なところを2か所指摘せよ。(5)この操作でできないことをすべて選べ。',
    answerVector: [
      'ろ過',
      '① ビーカー ② ろ紙 ③ 漏斗',
      'ろ液',
      'ガラス棒を伝わらせて流すこと。漏斗の先をビーカーに密着させること。',
      'ア，イ',
    ], N: 5,
    answerJp: '(1) ろ過 (2) ① ビーカー ② ろ紙 ③ 漏斗 (3) ろ液 (4) ガラス棒を伝わらせて流す／漏斗の先をビーカーに密着させる (5) ア，イ',
    explCn: 'ろ過は固体と液体の分離操作。注意点：液はガラス棒を伝わらせて注ぎ、漏斗の先は受け器（ビーカー）に密着させる。食塩水のイオンや牛乳のタンパク質・脂肪はろ紙の隙間（約10⁻⁶m）より十分小さくろ紙を通過するので、(5)でできないのはア（食塩水から水を分離）、イ（牛乳から水を分離）。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qB2', category: '基本問題', topic: T_SEP, subtopics: S_SEP,
    optMode: 'multi', Q: '薄い塩化ナトリウム水溶液から水を分離する装置の概略を図に示す。(1)この分離操作を何というか。(2)図の①～③の器具の名称を答えよ。(3)温度計の球部は(ア)～(ウ)のどこがよいか。(4)冷却水の方向は(ア)a→b，(イ)b→aのどちらが適当か，理由とともに答えよ。(5)沸騰石を入れる目的は次のどれか。',
    answerVector: [
      '蒸留',
      '① 枝付きフラスコ ② リービッヒ冷却器 ③ アダプター',
      'ア',
      'イ（b→a）。冷却器を水で満たして冷却効率をよくするため。',
      'イ（液体の突沸を防ぐ）',
    ], N: 5,
    answerJp: '(1) 蒸留 (2) ① 枝付きフラスコ ② リービッヒ冷却器 ③ アダプター (3) ア (4) イ（b→a），冷却器を水で満たすため (5) イ',
    explCn: '蒸留は溶液から溶媒（水）を分離する操作。温度計の球部はフラスコの枝の付け根（蒸気の温度を測るため）。冷却水は下から上へ（冷却器内を水で満たすため）。沸騰石は突沸を防ぐ。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qB3', category: '基本問題', topic: T_SEP, subtopics: S_PURE,
    optMode: 'multi', Q: '次の物質を，(a)単体 (b)化合物 (c)混合物 に分類せよ。(ア)水 (イ)黒鉛 (ウ)ペンキ (エ)ステンレス鋼 (オ)ガソリン (カ)銅 (キ)塩酸 (ク)エタノール (ケ)スクロース (コ)砂糖',
    answerVector: [
      'イ，カ（黒鉛，銅）',
      'ア，ク，ケ（水，エタノール，スクロース）',
      'ウ，エ，オ，キ（ペンキ，ステンレス鋼，ガソリン，塩酸）',
    ], N: 3,
    answerJp: '(a) イ，カ (b) ア，ク，ケ (c) ウ，エ，オ，キ',
    explCn: '元素名と同じ名称の物質（黒鉛C、銅Cu）は単体。水・エタノール・スクロースは化合物。ペンキ・ステンレス鋼（合金）・ガソリン・塩酸（塩化水素の水溶液）は混合物。（解答は解析原文に基づき (a)(b)(c) 集合を採る。）',
    issues: ['解析原文中 (a)(c) 使用「力」「才」等字形，按項目规则保留原样（对应題文のカ・オ）'],
  },
  {
    code: 'chem-cheb1-qB4', category: '基本問題', topic: T_COMP, subtopics: S_ELEM,
    optMode: 'multi', Q: '(1) 次の組合せのうち，互いに同素体であるものをすべて選べ。(ア)水と過酸化水素 (イ)亜鉛と鉛 (ウ)赤リンと黄リン (エ)水と水蒸気 (オ)酸素とオゾン (2) 黒鉛とダイヤモンドで共通する事項は次のどれか。',
    answerVector: ['ウ，オ（赤リンと黄リン，酸素とオゾン）', 'ウ（燃焼による生成物）'], N: 2,
    answerJp: '(1) ウ，オ (2) ウ',
    explCn: '(1) 同素体＝同じ元素の単体で性質の異なるもの。赤リンと黄リン、酸素とオゾンが該当。水と過酸化水素は異なる化合物、亜鉛と鉛は異なる元素、水と水蒸気は同じ化合物の状態の違い。(2) 黒鉛もダイヤモンドも完全燃焼すると二酸化炭素になる（ウが共通）。硬さ・電気伝導性・融点の細部は異なる。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qB5', category: '基本問題', topic: T_COMP, subtopics: S_ELEM,
    optMode: 'multi', Q: '次の文中の「酸素」は、元素と単体、どちらを表すか。(1) 二酸化炭素は炭素と酸素からなる化合物である。(2) 水を電気分解すると水素と酸素が生じる。(3) 空気中には窒素が78%，酸素が21%含まれている。(4) 酸素とオゾンは，互いに同素体である。',
    answerVector: ['元素', '単体', '単体', '単体'], N: 4,
    answerJp: '(1) 元素 (2) 単体 (3) 単体 (4) 単体',
    explCn: '成分を表す場合は元素、物質そのものを表す場合は単体。(1) 二酸化炭素に含まれる成分は元素。(2)(3)(4) は酸素という物質そのものを指すので単体。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qB6', category: '基本問題', topic: T_COMP, subtopics: S_CHK,
    optMode: 'multi', Q: '次の文の［］には元素名や物質名を，( )には語句を入れよ。Na [a] や Ca [b] を含む水溶液をガスバーナーの外炎に入れると，炎がそれぞれ (c) 色，(d) 色になる。この現象を (e) という。食塩水に硝酸銀水溶液を加えると，(f) 色の沈殿が生じる。この沈殿は［g］で，食塩水中に［h］が含まれていたことが確認できる。エタノールが燃焼すると二酸化炭素が発生する。このことからエタノールは [i] を含む。二酸化炭素は (j) を白濁することで検出される。',
    answerVector: ['ナトリウム', 'カルシウム', '黄', '橙赤', '炎色反応', '白', '塩化銀', '塩素', '炭素', '石灰水'], N: 10,
    answerJp: '[a] ナトリウム [b] カルシウム (c) 黄 (d) 橙赤 (e) 炎色反応 (f) 白 [g] 塩化銀 [h] 塩素 [i] 炭素 (j) 石灰水',
    explCn: 'Na は黄色、Ca は橙赤色の炎色反応を示す（Li赤・K赤紫・Cu青緑・Sr紅・Ba黄緑）。塩化物イオンは硝酸銀で塩化銀 AgCl の白色沈殿により確認。燃焼で二酸化炭素が生じれば炭素を含む。CO₂ は石灰水を白濁させる。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qB7', category: '基本問題', topic: T_ST, subtopics: S_CHG,
    optMode: 'multi', Q: '(1) 図の①～⑥の状態変化の名称を答えよ。(2) 次の現象に関連の深い状態変化の名称を答えよ。(a)ドライアイスを放置したら消失した (b)入浴中に浴室の鏡がくもった (c)寒い朝，池の水が凍った (d)洗濯物を吊るしておいたら乾いた。',
    answerVector: [
      '蒸発', '凝縮', '融解', '凝固', '昇華', '凝華',
      '昇華', '凝縮', '凝固', '蒸発',
    ], N: 10,
    answerJp: '(1) ①蒸発 ②凝縮 ③融解 ④凝固 ⑤昇華 ⑥凝華 (2) (a)昇華 (b)凝縮 (c)凝固 (d)蒸発',
    explCn: '(1) 液→気＝蒸発、気→液＝凝縮、固→液＝融解、液→固＝凝固、固→気＝昇華、気→固＝凝華。(2)(a)固体が直接気体に＝昇華 (b)水蒸気が冷やされて水滴＝凝縮 (c)液体が固体＝凝固 (d)液体が気体に＝蒸発。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qB8', category: '基本問題', topic: T_ST, subtopics: S_TRI,
    optMode: 'multi', Q: '物質の三態である (1)固体 (2)液体 (3)気体 のそれぞれについて，該当する事項をすべて選べ。(ア)分子はばらばらになって飛びまわっている (イ)分子は熱運動をしている (ウ)分子間に分子間力がはたらき，分子が密集している (エ)分子間の距離が大きく，他の状態より密度が小さい (オ)分子の相互の位置は変わらない。',
    answerVector: ['イ，ウ，オ', 'イ，ウ', 'ア，イ，エ'], N: 3,
    answerJp: '(1) イ，ウ，オ (2) イ，ウ (3) ア，イ，エ',
    explCn: 'どの状態でも分子は熱運動している（イはすべてに該当）。固体：密集し位置は変わらず分子間力がはたらく（ウ，オ）。液体：密集しているが移動する（ウ）。気体：ばらばらに飛びまわり距離が大きく密度が小さい（ア，エ）。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qB9', category: '基本問題', topic: T_ST, subtopics: S_CHG,
    optMode: 'multi', Q: '(1) 絶対零度のとき，粒子の熱運動はどのようになっているか。(2) 拡散の速さは，温度が高くなるほどどうなるか。理由とともに説明せよ。',
    answerVector: ['完全に停止している。', '温度が高くなるほど分子の熱運動が激しくなり，拡散の速さは大きくなる。'], N: 2,
    answerJp: '(1) 完全に停止している。(2) 温度が高くなるほど熱運動が激しくなり，拡散の速さは大きくなる。',
    explCn: '(1) 絶対零度（−273.15℃）では粒子の熱運動は完全に停止する。(2) 液体・気体の分子は熱運動で絶えず動いており、温度が高いほど熱運動が激しくなるため拡散の速さも大きくなる。',
    issues: ['(2) 記述問題：参考答案要点整体作槽位'],
  },
  // ---- 応用例題 / 応用問題 ----
  {
    code: 'chem-cheb1-qA1', category: '応用例題', topic: T_ST, subtopics: S_CHG,
    optMode: 'multi', Q: '図は，一定圧力のもとで純物質に熱を加えて，固体の状態Aから気体の状態Fにしたときの温度変化を表す。(1) a，b の温度をそれぞれ何というか。(2) ア，イで起こる現象をそれぞれ何というか。(3) AB，BC，CD，DE，EFでは，物質はそれぞれどのような状態にあるか。(4) この純物質が水であるとすると，a，b の温度は1気圧で何℃か。',
    answerVector: [
      'a：融点 ／ b：沸点',
      'ア：融解 ／ イ：沸騰',
      'AB：② BC：⑤ CD：③ DE：④ EF：①',
      'a：0℃ ／ b：100℃',
    ], N: 4,
    answerJp: '(1) a：融点 b：沸点 (2) ア：融解 イ：沸騰 (3) AB：② BC：⑤ CD：③ DE：④ EF：① (4) a：0℃ b：100℃',
    explCn: '融点・沸点では加わった熱が粒子の配列を崩す・結合を切るのに使われ、温度が一定に保たれる。AB：固体、BC：液体と固体（融解中）、CD：液体、DE：液体と気体（沸騰中）、EF：気体。水では a＝0℃（融点）、b＝100℃（沸点）。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qA2', category: '応用問題', topic: T_SEP, subtopics: S_SEP,
    optMode: 'multi', Q: '物質の分離・精製に関する次の操作の名称を答えよ。(1)海水を沸騰させ，その水蒸気を冷却して純水を取り出す。(2)お茶の葉に熱湯を注いで，水に溶ける色素や味の成分を溶かし出す。(3)黒色のインキ中のいろいろな色素を，ろ紙への吸着のしやすさの違いにより分離する。(4)少量の塩化ナトリウムが混ざっている硝酸カリウムを熱水に溶かし，冷却して純粋な硝酸カリウムを析出させる。(5)空気を液化したのち，ゆっくり蒸発させて窒素を取り出す。',
    answerVector: ['蒸留', '抽出', 'ペーパークロマトグラフィー（クロマトグラフィー）', '再結晶', '分留（分別蒸留）'], N: 5,
    answerJp: '(1) 蒸留 (2) 抽出 (3) ペーパークロマトグラフィー（クロマトグラフィー） (4) 再結晶 (5) 分留（分別蒸留）',
    explCn: '(1) 溶液から溶媒（水）を得る＝蒸留。(2) 目的の溶質を溶媒で溶かし出す＝抽出。(3) ろ紙への吸着しやすさの差を利用＝ペーパークロマトグラフィー。(4) 温度による溶解度の差を利用＝再結晶。(5) 液化空気を沸点の差で分ける＝分留（窒素 −196℃、酸素 −183℃）。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qA3', category: '応用問題', topic: T_SEP, subtopics: S_SEP,
    optMode: 'multi', Q: '海水から水を取り出すため，図のような蒸留装置を組み立てた。(1) この装置には不適当な点が4か所ある。改め方を理由とともに説明せよ。(2) 沸点の低い可燃性の液体を蒸留するときには，加熱方法をどのように工夫すべきか，理由とともに説明せよ。',
    answerVector: [
      '突沸を防ぐため，フラスコ内の溶液に沸騰石を入れる。',
      '沸騰時のしぶきがリービッヒ冷却器へ流れ込むのを防ぐため，液量をフラスコの半分以下に減らす。',
      '蒸気の温度を測るため，温度計の球部をフラスコの枝の付け根の高さに合わせる。',
      '内圧が高くなって容器が破裂するのを防ぐため，密栓せずゴム栓を取り外す。',
      'ガスバーナーの直火は引火の危険があるため，水浴で間接加熱するか電熱ヒーターで加熱する。',
    ], N: 5,
    answerJp: '(1)①沸騰石を入れる ②液量を半分以下にする ③温度計の球部を枝の付け根の高さにする ④密栓しない (2) 水浴による間接加熱、または電熱ヒーター（直火は引火の危険）',
    explCn: '蒸留の注意点：沸騰石（突沸防止）、液量はフラスコの1/2以下（しぶきの流入防止）、温度計の球部は枝の付け根（蒸気温度の測定）、受け器は密栓しない（内圧上昇による破裂防止）。沸点の低い可燃性液体（ジエチルエーテル・アセトン等）は水浴や電熱ヒーターで均一・緩やかに加熱して引火を防ぐ。',
    issues: ['(1)(2) 記述問題：参考答案要点整体作槽位'],
  },
  {
    code: 'chem-cheb1-qA4', category: '応用問題', topic: T_SEP, subtopics: S_SEP,
    optMode: 'multi', Q: '微量のヨウ素が溶けている水溶液に，適量のヘキサンを入れてよく振り，ヨウ素を水からヘキサンに移した後，水とヘキサン溶液を分離した。(1) この分離操作の名称と，分離に用いる器具の名称を答えよ。(2) アセトンやエタノールをヘキサンの代わりに用いることは不適切である。ヘキサンのどのような性質が利用されているか。',
    answerVector: ['抽出', '分液漏斗', '水と混ざらずに分離（2層に分かれる）するため。'], N: 3,
    answerJp: '(1) 操作：抽出 器具：分液漏斗 (2) 水に混ざらずに分離する。',
    explCn: '目的の溶質のみを溶媒で溶かし出す操作を抽出という。抽出後、水とヨウ素を溶かしたヘキサンは2層に分かれ、分液漏斗で分離する。抽出溶媒は溶液と混ざってはいけないので、水とよく混ざるエタノールやアセトンは使えない。',
    issues: ['(2) 記述問題：参考答案要点整体作槽位'],
  },
  {
    code: 'chem-cheb1-qA5', category: '応用問題', topic: T_SEP, subtopics: S_SEP,
    optMode: 'multi', Q: 'ヨウ素と砂が混ざっているものを加熱すると，ヨウ素だけが気体となり分離できる。(1) この分離操作を何というか。(2) ヨウ素を一度気体にしてから再び固体にして取り出したい。ビーカー，冷水の入った丸底フラスコ，三脚，金網，ガスバーナーを用いて，装置と混合物の場所を図示せよ。',
    answerVector: [
      '昇華法',
      '三脚・金網の上にビーカーを置き，その中にヨウ素と砂の混合物を入れてガスバーナーで加熱し，ビーカーの上に冷水入り丸底フラスコをのせる。ヨウ素は紫色の気体になり，冷水入り丸底フラスコの底に再び結晶として析出する。',
    ], N: 2,
    answerJp: '(1) 昇華法 (2) ヨウ素を紫色の気体にし，冷水入り丸底フラスコの底に結晶として析出させる装置',
    explCn: '(1) 昇華しやすい物質（ヨウ素・ナフタレン等）は昇華法で分離できる。(2) 混合物をビーカー内で加熱するとヨウ素は紫色の気体になり、冷水入り丸底フラスコの底で結晶として析出する。金網でビーカーを直接火から守る。',
    issues: ['(2) 作図問題：図の特徴を语言描述で槽位化'],
  },
  {
    code: 'chem-cheb1-qA6', category: '応用問題', topic: T_COMP, subtopics: S_ELEM,
    optMode: 'multi', Q: '次の同素体に関する記述に該当する元素の名称を答えよ。(1) 同素体の一つは空気中で自然発火するので水中に保存する。(2) 同素体の一つに分子式 X₆₀ と表される物質がある。(3) 同素体の一つに，特異臭をもつ淡青色の有毒な気体がある。(4) 同素体の一つは，単体の液体を急冷して得られるゴム状物質である。',
    answerVector: ['リン', '炭素', '酸素', '硫黄'], N: 4,
    answerJp: '(1) リン (2) 炭素 (3) 酸素 (4) 硫黄',
    explCn: '(1) 空気中で自然発火するのは黄リン（水中保存）→元素はリン。(2) X₆₀ はフラーレン C₆₀→炭素。(3) 淡青色・特異臭の有毒な気体はオゾン O₃（酸素の同素体）→元素は酸素。(4) ゴム状硫黄→元素は硫黄。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qA7', category: '応用問題', topic: T_ST, subtopics: S_TRI,
    optMode: 'multi', Q: '次の記述のうち，正しいものをすべて選べ。(ア)同一の物質では，一般に液体の密度は固体の密度よりも大きい。(イ)固体では，構成粒子は一定の位置で振動している。(ウ)液体の流動性が高いのは，構成粒子間の距離が大きく，粒子間にはたらく引力が非常に小さいため，粒子が自由に動きまわることができるからである。(エ)構成粒子の熱運動のエネルギーは温度が高くなるほど大きくなるため，気体分子は高温になるほど速く動く。',
    answerVector: ['イ，エ'], N: 1,
    answerJp: '正しいもの：イ，エ',
    explCn: 'ア誤：一般に液体は固体より密度が小さい（ただし水は例外で液体の方が大きい）。イ正：固体の粒子は一定の位置で振動している。ウ誤：液体も粒子は密集しており、固体より少し小さい程度。エ正：温度が高いほど熱運動のエネルギーが大きく、気体分子は速く動く。',
    issues: [],
  },
  {
    code: 'chem-cheb1-qA8', category: '応用問題', topic: T_ST, subtopics: S_CHG,
    optMode: 'multi', Q: '(1) −10℃の氷を1気圧のもとで均一に加熱し，全部を120℃の水蒸気にした。加えた熱量と温度の関係を表すグラフのおよその形は次のどれか。(2) 同量の50℃の水を同じ条件で均一に加熱したときの温度変化を表すグラフを，(1)で選んだグラフに重ねてかけ。',
    answerVector: [
      '亻',
      '（1）で選んだグラフを左に平行移動した形。50℃の液体の水の部分から始まり，同じ傾きで上昇して100℃で一定となった後，120℃まで上昇する。',
    ], N: 2,
    answerJp: '(1) 亻（＝イ，OCR原样） (2) （1）のグラフを左に平行移動したグラフ',
    explCn: '(1) −10℃から温度が上昇し、融解（0℃）・沸騰（100℃）の間は温度一定の台形のグラフになる。解析原文の選択肢記号は「亻」（イ のOCR表記）。(2) 50℃の水なので出発点は（1）のグラフで液体を加熱している部分の中央。水量が同じなのでグラフの形は（1）と同じ（左に平行移動した形）。',
    issues: ['(1) 解析中的選択肢記号「亻」为OCR字形（应为イ），按項目规则保留原样不改动；', '(2) 作図問題：グラフの形状・起点を语言描述で槽位化'],
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
  console.log('cheb1 drafts:', d.length);
  const s = new Map();
  d.forEach((x) => s.set(x.generationStatus, (s.get(x.generationStatus) || 0) + 1));
  console.log('status:', Object.fromEntries(s));
}