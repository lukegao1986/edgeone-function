// ============ 类型定义 ============

/** 分考点（对应 DB subtopics 表） */
export interface SubtopicNode {
  code: string;           // 如 "phy_1_1_1_01"
  name: string;           // 如 "落体の運動"
  aliases: string[];      // 如 ["自由落下", "自由落体", "落下運動"]
  description?: string;   // 可选，辅助 LLM 理解
}

/** 考点（对应 DB topics 表，原 TS 中的 SubTopic/subTopics） */
export interface TopicNode {
  id: string;             // 如 "phy_1_1_1"
  title: string;          // 如 "(1)運動の表し方"
  content: string;        // 原始考纲文本，逗号分隔的关键词（保留用于参考）
  subtopics?: SubtopicNode[];  // 【新增】分考点列表，第一轮可留空
}

/** 节（对应 DB sections 表） */
export interface Section {
  id: string;
  title: string;
  topics: TopicNode[];    // ← 原 subTopics，改名为 topics（与 DB 表名一致）
}

/** 章（对应 DB chapters 表） */
export interface Chapter {
  id: string;
  title: string;
  sections: Section[];
}

/** 分科目（对应 DB sub_subjects 表） */
export interface SubSubject {
  code: string;           // 如 "physics"（与 DB 列名对齐，原 id 改名）
  name: string;           // 如 "物理"
  sort_order: number;      // 如 1，控制显示顺序
  chapters: Chapter[];
}

/** 主科目（对应 DB main_subjects 表） */
export interface EjuMainSubject {
  code: string;            // 如 "science"（与 DB 列名对齐，原 id 改名）
  name: string;           // 如 "理科"
  sort_order: number;      // 如 1，控制显示顺序
  subSubjects: SubSubject[];  // 统一用数组，不用 Record
}

/** EJU 全科目考纲 */
export type EjuSyllabus = EjuMainSubject[];  // 统一用数组，不用 Record

export const EJU_SYLLABUS: EjuSyllabus = [
  {
    "code": "science",
    "name": "理科",
    "sort_order": 1,
    "subSubjects": [
      {
        "code": "physics",
        "name": "物理",
        "sort_order": 1,
        "chapters": [
          {
            "id": "phy_1",
            "title": "I 力学",
            "sections": [
              {
                "id": "phy_1_1",
                "title": "1.運動と力",
                "topics": [
                  {
                    "id": "phy_1_1_1",
                    "title": "(1)運動の表し方",
                    "content": "位置,変位,速度,加速度,相対運動,落体の運動,水平投射,斜方投射",
                    "subtopics": [
                      {
                        "code": "phy_1_1_1_01",
                        "name": "位置と変位",
                        "aliases": [
                          "位置",
                          "変位",
                          "座標",
                          "変位ベクトル",
                          "位置ベクトル",
                          "座標系"
                        ],
                        "description": "物体の位置、変位、座標系に関する問題"
                      },
                      {
                        "code": "phy_1_1_1_02",
                        "name": "速度と加速度",
                        "aliases": [
                          "速度",
                          "加速度",
                          "初速度",
                          "終端速度",
                          "等加速度",
                          "加速度ベクトル",
                          "速度ベクトル",
                          "平均速度",
                          "瞬間速度"
                        ],
                        "description": "速度、加速度、等加速度運動に関する問題"
                      },
                      {
                        "code": "phy_1_1_1_03",
                        "name": "相対運動",
                        "aliases": [
                          "相対速度",
                          "相対運動",
                          "相対位置",
                          "相対的な速度",
                          "移動座標系"
                        ],
                        "description": "複数物体の相対的な運動に関する問題"
                      },
                      {
                        "code": "phy_1_1_1_04",
                        "name": "落体の運動",
                        "aliases": [
                          "自由落下",
                          "自由落体",
                          "落下運動",
                          "重力による落下",
                          "鉛直投げ下ろし",
                          "鉛直投げ上げ",
                          "鉛直投射"
                        ],
                        "description": "重力作用下の落下運動、自由落下、鉛直方向の投げ上げ・投げ下ろし"
                      },
                      {
                        "code": "phy_1_1_1_05",
                        "name": "水平投射",
                        "aliases": [
                          "水平投射",
                          "水平方向の投射",
                          "水平投げ出し",
                          "水平発射"
                        ],
                        "description": "水平方向に投射された物体の運動"
                      },
                      {
                        "code": "phy_1_1_1_06",
                        "name": "斜方投射",
                        "aliases": [
                          "斜方投射",
                          "斜め投射",
                          "放物運動",
                          "投射運動",
                          "放物線",
                          "斜方投げ出し"
                        ],
                        "description": "斜め方向に投射された物体の運動、放物線運動"
                      }
                    ]
                  },
                  {
                    "id": "phy_1_1_2",
                    "title": "(2)さまざまな力",
                    "content": "力,重力,摩擦力,抗力,張力,弾性力,液体や気体から受ける力",
                    "subtopics": []
                  },
                  {
                    "id": "phy_1_1_3",
                    "title": "(3)力のつり合い",
                    "content": "力の合成･分解,力のつり合い",
                    "subtopics": []
                  },
                  {
                    "id": "phy_1_1_4",
                    "title": "(4)剛体にはたらく力のつり合い",
                    "content": "力のモーメント,合力,偶力,剛体のつり合い,重心",
                    "subtopics": []
                  },
                  {
                    "id": "phy_1_1_5",
                    "title": "(5)運動の法則",
                    "content": "ニュートンの運動の3法則,力の単位と運動方程式,単位系と次元",
                    "subtopics": []
                  },
                  {
                    "id": "phy_1_1_6",
                    "title": "(6)摩擦や空気の抵抗を受ける運動",
                    "content": "静止摩擦力,動摩擦力,空気の抵抗と終端速度",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "phy_1_2",
                "title": "2.エネルギーと運動量",
                "topics": [
                  {
                    "id": "phy_1_2_1",
                    "title": "(1)仕事と運動エネルギー",
                    "content": "仕事の原理,仕事率,運動エネルギー",
                    "subtopics": []
                  },
                  {
                    "id": "phy_1_2_2",
                    "title": "(2)位置エネルギー",
                    "content": "重力による位置エネルギー,弾性力による位置エネルギー",
                    "subtopics": []
                  },
                  {
                    "id": "phy_1_2_3",
                    "title": "(3)力学的エネルギーの保存",
                    "content": "力学的エネルギーの保存",
                    "subtopics": []
                  },
                  {
                    "id": "phy_1_2_4",
                    "title": "(4)運動量と力積",
                    "content": "運動量と力積,運動量保存則,分裂と合体",
                    "subtopics": []
                  },
                  {
                    "id": "phy_1_2_5",
                    "title": "(5)衝突と力学的エネルギー",
                    "content": "反発係数(はねかえり係数),弾性衝突,非弾性衝突",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "phy_1_3",
                "title": "3.さまざまな力と運動",
                "topics": [
                  {
                    "id": "phy_1_3_1",
                    "title": "(1)等速円運動",
                    "content": "速度と角速度,周期と回転数,加速度と向心力,等速でない円運動の向心力",
                    "subtopics": []
                  },
                  {
                    "id": "phy_1_3_2",
                    "title": "(2)慣性力",
                    "content": "慣性力,遠心力",
                    "subtopics": []
                  },
                  {
                    "id": "phy_1_3_3",
                    "title": "(3)単振動",
                    "content": "変位,速度,加速度,復元力,振幅,周期,振動数,位相,角振動数,ばね振り子,単振り子,単振動のエネルギー",
                    "subtopics": []
                  },
                  {
                    "id": "phy_1_3_4",
                    "title": "(4)万有引力",
                    "content": "惑星の運動(ケプラーの法則),万有引力,重力,万有引力による位置エネルギー,力学的エネルギーの保存",
                    "subtopics": []
                  }
                ]
              }
            ]
          },
          {
            "id": "phy_2",
            "title": "II 熱",
            "sections": [
              {
                "id": "phy_2_1",
                "title": "1.熱と温度",
                "topics": [
                  {
                    "id": "phy_2_1_1",
                    "title": "(1)熱と温度",
                    "content": "熱運動,熱平衡,温度,絶対温度,熱量,熱容量,比熱(比熱容量),熱量の保存",
                    "subtopics": []
                  },
                  {
                    "id": "phy_2_1_2",
                    "title": "(2)物質の状態",
                    "content": "物質の三態,融点,沸点,融解熱,蒸発熱,潜熱,熱膨張",
                    "subtopics": []
                  },
                  {
                    "id": "phy_2_1_3",
                    "title": "(3)熱と仕事",
                    "content": "熱と仕事,内部エネルギー,熱力学第1法則,不可逆変化,熱機関,熱効率,熱力学第2法則",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "phy_2_2",
                "title": "2.気体の性質",
                "topics": [
                  {
                    "id": "phy_2_2_1",
                    "title": "(1)理想気体の状態方程式",
                    "content": "ボイルの法則,シャルルの法則,ボイル･シャルルの法則,理想気体の状態方程式",
                    "subtopics": []
                  },
                  {
                    "id": "phy_2_2_2",
                    "title": "(2)気体分子の運動",
                    "content": "気体分子の運動と圧力･絶対温度,気体の内部エネルギー,単原子分子,二原子分子",
                    "subtopics": []
                  },
                  {
                    "id": "phy_2_2_3",
                    "title": "(3)気体の状態変化",
                    "content": "定積変化,定圧変化,等温変化,断熱変化,モル比熱",
                    "subtopics": []
                  }
                ]
              }
            ]
          },
          {
            "id": "phy_3",
            "title": "III 波",
            "sections": [
              {
                "id": "phy_3_1",
                "title": "1.波",
                "topics": [
                  {
                    "id": "phy_3_1_1",
                    "title": "(1)波の性質",
                    "content": "波動,媒質,波源,横波と縦波",
                    "subtopics": []
                  },
                  {
                    "id": "phy_3_1_2",
                    "title": "(2)波の伝わり方とその表し方",
                    "content": "波形,振幅,周期,振動数,波長,波の速さ,正弦波,位相,波のエネルギー",
                    "subtopics": []
                  },
                  {
                    "id": "phy_3_1_3",
                    "title": "(3)重ね合わせの原理とホイヘンスの原理",
                    "content": "重ね合わせの原理,干渉,定在波(定常波),ホイヘンスの原理,反射の法則,屈折の法則,回折",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "phy_3_2",
                "title": "2.音",
                "topics": [
                  {
                    "id": "phy_3_2_1",
                    "title": "(1)音の性質と伝わり方",
                    "content": "音の速さ,音の反射･屈折･回折･干渉,うなり",
                    "subtopics": []
                  },
                  {
                    "id": "phy_3_2_2",
                    "title": "(2)発音体の振動と共振･共鳴",
                    "content": "弦の振動,気柱の振動,共振･共鳴",
                    "subtopics": []
                  },
                  {
                    "id": "phy_3_2_3",
                    "title": "(3)ドップラー効果",
                    "content": "ドップラー効果,音源が動く場合,観測者が動く場合,音源と観測者が動く場合",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "phy_3_3",
                "title": "3.光",
                "topics": [
                  {
                    "id": "phy_3_3_1",
                    "title": "(1)光の性質",
                    "content": "可視光,白色光,単色光,光と色,スペクトル,分散,偏光",
                    "subtopics": []
                  },
                  {
                    "id": "phy_3_3_2",
                    "title": "(2)光の伝わり方",
                    "content": "光の速さ,光の反射･屈折,全反射,光の散乱,レンズ,球面鏡",
                    "subtopics": []
                  },
                  {
                    "id": "phy_3_3_3",
                    "title": "(3)光の回折と干渉",
                    "content": "回折,干渉,ヤングの実験,回折格子,薄膜による干渉,空気層による干渉",
                    "subtopics": []
                  }
                ]
              }
            ]
          },
          {
            "id": "phy_4",
            "title": "IV 電気と磁気",
            "sections": [
              {
                "id": "phy_4_1",
                "title": "1.電場",
                "topics": [
                  {
                    "id": "phy_4_1_1",
                    "title": "(1)静電気力",
                    "content": "物体の帯電,電荷,電気量,電気量保存の法則,クーロンの法則",
                    "subtopics": []
                  },
                  {
                    "id": "phy_4_1_2",
                    "title": "(2)電場",
                    "content": "電場,点電荷のまわりの電場,電場の重ね合わせ,電気力線",
                    "subtopics": []
                  },
                  {
                    "id": "phy_4_1_3",
                    "title": "(3)電位",
                    "content": "静電気力による位置エネルギー,電位と電位差,点電荷のまわりの電位,等電位面",
                    "subtopics": []
                  },
                  {
                    "id": "phy_4_1_4",
                    "title": "(4)電場の中の物体",
                    "content": "電場中の導体,静電誘導,静電遮蔽,接地,電場中の不導体,誘電分極",
                    "subtopics": []
                  },
                  {
                    "id": "phy_4_1_5",
                    "title": "(5)コンデンサー",
                    "content": "コンデンサー,電気容量,誘電体,コンデンサーに蓄えられる静電エネルギー,コンデンサーの接続",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "phy_4_2",
                "title": "2.電流",
                "topics": [
                  {
                    "id": "phy_4_2_1",
                    "title": "(1)電流",
                    "content": "電流,電圧,オームの法則,抵抗と抵抗率,ジュール熱,電力,電力量",
                    "subtopics": []
                  },
                  {
                    "id": "phy_4_2_2",
                    "title": "(2)直流回路",
                    "content": "抵抗の直列接続と並列接続,電流計,電圧計,キルヒホッフの法則,電池の起電力と内部抵抗,抵抗の測定,起電力の測定,抵抗率の温度変化,コンデンサーを含む回路",
                    "subtopics": []
                  },
                  {
                    "id": "phy_4_2_3",
                    "title": "(3)半導体",
                    "content": "n型半導体,p型半導体,pn接合,ダイオード",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "phy_4_3",
                "title": "3.電流と磁場",
                "topics": [
                  {
                    "id": "phy_4_3_1",
                    "title": "(1)磁場",
                    "content": "磁石,磁極,磁気力,磁気量,磁場,磁力線,磁化,磁性体,磁束密度,透磁率,磁束",
                    "subtopics": []
                  },
                  {
                    "id": "phy_4_3_2",
                    "title": "(2)電流がつくる磁場",
                    "content": "直線電流がつくる磁場,円形電流がつくる磁場,ソレノイドの電流がつくる磁場",
                    "subtopics": []
                  },
                  {
                    "id": "phy_4_3_3",
                    "title": "(3)電流が磁場から受ける力",
                    "content": "直線電流が磁場から受ける力,平行電流が及ぼし合う力",
                    "subtopics": []
                  },
                  {
                    "id": "phy_4_3_4",
                    "title": "(4)ローレンツ力",
                    "content": "ローレンツ力,磁場中の荷電粒子の運動,ホール効果",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "phy_4_4",
                "title": "4.電磁誘導と電磁波",
                "topics": [
                  {
                    "id": "phy_4_4_1",
                    "title": "(1)電磁誘導の法則",
                    "content": "電磁誘導,レンツの法則,ファラデーの電磁誘導の法則,導体が磁場を横切るときの誘導起電力,ローレンツ力と誘導起電力,渦電流",
                    "subtopics": []
                  },
                  {
                    "id": "phy_4_4_2",
                    "title": "(2)自己誘導,相互誘導",
                    "content": "自己誘導,自己インダクタンス,コイルに蓄えられるエネルギー,相互誘導,相互インダクタンス,変圧器",
                    "subtopics": []
                  },
                  {
                    "id": "phy_4_4_3",
                    "title": "(3)交流",
                    "content": "交流の発生,交流電圧,交流電流,位相,周波数,角周波数,抵抗を流れる交流,実効値",
                    "subtopics": []
                  },
                  {
                    "id": "phy_4_4_4",
                    "title": "(4)交流回路",
                    "content": "コイルのリアクタンスと位相差,コンデンサーのリアクタンスと位相差,消費電力,交流回路のインピーダンス,共振回路,振動回路",
                    "subtopics": []
                  },
                  {
                    "id": "phy_4_4_5",
                    "title": "(5)電磁波",
                    "content": "電磁波,電磁波の発生,電磁波の性質,電磁波の種類",
                    "subtopics": []
                  }
                ]
              }
            ]
          },
          {
            "id": "phy_5",
            "title": "V 原子",
            "sections": [
              {
                "id": "phy_5_1",
                "title": "1.電子と光",
                "topics": [
                  {
                    "id": "phy_5_1_1",
                    "title": "(1)電子",
                    "content": "放電,陰極線,電子,比電荷,電気素量",
                    "subtopics": []
                  },
                  {
                    "id": "phy_5_1_2",
                    "title": "(2)粒子性と波動性",
                    "content": "光電効果,光子,X線,コンプトン効果,ブラッグ反射,物質波,電子線の干渉と回折",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "phy_5_2",
                "title": "2.原子と原子核",
                "topics": [
                  {
                    "id": "phy_5_2_1",
                    "title": "(1)原子の構造",
                    "content": "原子核,水素原子のスペクトル,ボーアの原子模型,エネルギー準位",
                    "subtopics": []
                  },
                  {
                    "id": "phy_5_2_2",
                    "title": "(2)原子核",
                    "content": "原子核の構成,同位体,原子質量単位,原子量,原子核の崩壊,放射線,放射能,半減期,核反応,核エネルギー,質量とエネルギーの等価性",
                    "subtopics": []
                  },
                  {
                    "id": "phy_5_2_3",
                    "title": "(3)素粒子",
                    "content": "素粒子,4つの基本的力",
                    "subtopics": []
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "code": "chemistry",
        "name": "化学",
        "sort_order": 2,
        "chapters": [
          {
            "id": "chem_1",
            "title": "I 物質の構成",
            "sections": [
              {
                "id": "chem_1_1",
                "title": "1.物質の成分と構成元素",
                "topics": [
                  {
                    "id": "chem_1_1_1",
                    "title": "(1)純物質と混合物",
                    "content": "純物質,混合物,物質の分離･精製",
                    "subtopics": []
                  },
                  {
                    "id": "chem_1_1_2",
                    "title": "(2)物質とその成分",
                    "content": "元素,単体,化合物,同素体,元素の確認(炎色反応,沈殿反応)",
                    "subtopics": []
                  },
                  {
                    "id": "chem_1_1_3",
                    "title": "(3)物質の状態",
                    "content": "物質の三態(気体,液体,固体),状態変化",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "chem_1_2",
                "title": "2.物質の構成粒子",
                "topics": [
                  {
                    "id": "chem_1_2_1",
                    "title": "(1)原子の構造",
                    "content": "電子,陽子,中性子,原子番号,質量数,同位体",
                    "subtopics": []
                  },
                  {
                    "id": "chem_1_2_2",
                    "title": "(2)電子配置と周期律",
                    "content": "電子殻,原子の性質,周期表,最外殻電子,価電子",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "chem_1_3",
                "title": "3.物質と化学結合",
                "topics": [
                  {
                    "id": "chem_1_3_1",
                    "title": "(1)イオン結合",
                    "content": "イオン結合,イオン結晶,イオン化エネルギー,電子親和力,電解質",
                    "subtopics": []
                  },
                  {
                    "id": "chem_1_3_2",
                    "title": "(2)金属結合",
                    "content": "金属結合,自由電子,金属結晶,展性･延性",
                    "subtopics": []
                  },
                  {
                    "id": "chem_1_3_3",
                    "title": "(3)共有結合",
                    "content": "共有結合,配位結合,共有結合結晶,分子結晶,結合の極性,電気陰性度",
                    "subtopics": []
                  },
                  {
                    "id": "chem_1_3_4",
                    "title": "(4)分子間力",
                    "content": "ファンデルワールス力,水素結合",
                    "subtopics": []
                  },
                  {
                    "id": "chem_1_3_5",
                    "title": "(5)化学結合と物質の性質",
                    "content": "融点,沸点,密度,溶解度,電気伝導性,熱伝導性",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "chem_1_4",
                "title": "4.物質の量的取扱いと化学式",
                "topics": [
                  {
                    "id": "chem_1_4_1",
                    "title": "(1)物質量など",
                    "content": "原子量,分子量,式量,物質量,モル濃度,質量パーセント濃度,質量モル濃度",
                    "subtopics": []
                  },
                  {
                    "id": "chem_1_4_2",
                    "title": "(2)化学式",
                    "content": "分子式,電子式(ルイス構造),構造式,組成式(実験式)",
                    "subtopics": []
                  }
                ]
              }
            ]
          },
          {
            "id": "chem_2",
            "title": "II 物質の状態と変化",
            "sections": [
              {
                "id": "chem_2_1",
                "title": "1.物質の変化",
                "topics": [
                  {
                    "id": "chem_2_1_1",
                    "title": "(1)化学反応",
                    "content": "化学反応式,化学反応の量的関係",
                    "subtopics": []
                  },
                  {
                    "id": "chem_2_1_2",
                    "title": "(2)酸･塩基",
                    "content": "酸･塩基の定義と強弱,水素イオン濃度,pH,中和反応,中和滴定(酸塩基滴定),塩",
                    "subtopics": []
                  },
                  {
                    "id": "chem_2_1_3",
                    "title": "(3)酸化･還元",
                    "content": "酸化･還元の定義,酸化数,金属のイオン化傾向,酸化剤･還元剤,酸化還元滴定",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "chem_2_2",
                "title": "2.物質の状態と平衡",
                "topics": [
                  {
                    "id": "chem_2_2_1",
                    "title": "(1)状態の変化",
                    "content": "分子の熱運動と物質の三態,気体分子のエネルギー分布,絶対温度,沸点,融点,融解熱,蒸発熱,蒸気圧,状態図",
                    "subtopics": []
                  },
                  {
                    "id": "chem_2_2_2",
                    "title": "(2)気体の性質",
                    "content": "理想気体の状態方程式,混合気体,分圧の法則,実在気体と理想気体",
                    "subtopics": []
                  },
                  {
                    "id": "chem_2_2_3",
                    "title": "(3)溶解平衡",
                    "content": "希薄溶液,飽和溶液,溶解度積,過飽和,固体の溶解度,気体の溶解度,ヘンリーの法則",
                    "subtopics": []
                  },
                  {
                    "id": "chem_2_2_4",
                    "title": "(4)溶液の性質",
                    "content": "蒸気圧降下,沸点上昇,凝固点降下,過冷却,浸透圧,コロイド溶液,チンダル現象,ブラウン運動,透析,電気泳動",
                    "subtopics": []
                  },
                  {
                    "id": "chem_2_2_5",
                    "title": "(5)固体の構造",
                    "content": "結晶,アモルファス,単位格子,金属結晶,イオン結晶,共有結合結晶,分子結晶",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "chem_2_3",
                "title": "3.物質の変化と平衡",
                "topics": [
                  {
                    "id": "chem_2_3_1",
                    "title": "(1)化学反応とエネルギー",
                    "content": "化学反応と熱･光,発熱反応,吸熱反応,結合エネルギー,エンタルピー,反応エンタルピー,生成エンタルピー,ヘスの法則",
                    "subtopics": []
                  },
                  {
                    "id": "chem_2_3_2",
                    "title": "(2)電池",
                    "content": "電気エネルギーと化学エネルギー,ダニエル電池,実用電池",
                    "subtopics": []
                  },
                  {
                    "id": "chem_2_3_3",
                    "title": "(3)電気分解",
                    "content": "電極反応,物質の変化量と電気量(ファラデーの法則),電解精錬",
                    "subtopics": []
                  },
                  {
                    "id": "chem_2_3_4",
                    "title": "(4)反応速度と化学平衡",
                    "content": "反応速度と速度定数,反応速度と濃度･温度･触媒,活性化エネルギー,可逆反応,平衡定数,化学平衡の移動,ルシャトリエの原理",
                    "subtopics": []
                  },
                  {
                    "id": "chem_2_3_5",
                    "title": "(5)電離平衡",
                    "content": "酸･塩基の強弱と電離度,水のイオン積,弱酸･弱塩基の電離平衡,塩の加水分解,緩衝液",
                    "subtopics": []
                  }
                ]
              }
            ]
          },
          {
            "id": "chem_3",
            "title": "III 無機化学",
            "sections": [
              {
                "id": "chem_3_1",
                "title": "1.無機物質",
                "topics": [
                  {
                    "id": "chem_3_1_1",
                    "title": "(1)典型元素(主要族元素)",
                    "content": "各族の代表的な元素の単体と化合物の性質や反応,及び用途",
                    "subtopics": []
                  },
                  {
                    "id": "chem_3_1_2",
                    "title": "(2)遷移元素",
                    "content": "クロム,マンガン,鉄,銅,亜鉛,銀,水銀,及びそれらの化合物の性質や反応,及び用途",
                    "subtopics": []
                  },
                  {
                    "id": "chem_3_1_3",
                    "title": "(3)無機物質の工業的製法",
                    "content": "炭酸ナトリウム,アルミニウム,ケイ素,鉄,銅,水酸化ナトリウム,アンモニア,硫酸,硝酸など",
                    "subtopics": []
                  },
                  {
                    "id": "chem_3_1_4",
                    "title": "(4)金属イオンの分離･分析",
                    "content": "金属イオンの分離･分析",
                    "subtopics": []
                  },
                  {
                    "id": "chem_3_1_5",
                    "title": "(5)広く利用されている金属と無機化合物",
                    "content": "金属:チタン,タングステン,白金など 無機化合物:ガラス,ファインセラミックスなど",
                    "subtopics": []
                  }
                ]
              }
            ]
          },
          {
            "id": "chem_4",
            "title": "IV 有機化学",
            "sections": [
              {
                "id": "chem_4_1",
                "title": "1.有機化合物の性質と反応",
                "topics": [
                  {
                    "id": "chem_4_1_1",
                    "title": "(1)脂肪族炭化水素",
                    "content": "アルカン,アルケン,アルキンの代表的な化合物の構造,性質及び反応",
                    "subtopics": []
                  },
                  {
                    "id": "chem_4_1_2",
                    "title": "(2)官能基をもつ脂肪族化合物",
                    "content": "アルコール,エーテル,アルデヒド,ケトン,カルボン酸,エステルなど",
                    "subtopics": []
                  },
                  {
                    "id": "chem_4_1_3",
                    "title": "(3)芳香族化合物",
                    "content": "芳香族炭化水素,フェノール類,芳香族カルボン酸,芳香族アミンなど",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "chem_4_2",
                "title": "2.有機化合物と人間生活",
                "topics": [
                  {
                    "id": "chem_4_2_1",
                    "title": "(1)単糖類,二糖類,アミノ酸など",
                    "content": "グルコース,フルクトース,マルトース,スクロース,グリシン,アラニンなど",
                    "subtopics": []
                  },
                  {
                    "id": "chem_4_2_2",
                    "title": "(2)代表的な医薬品,染料,洗剤など",
                    "content": "サリチル酸の誘導体,アゾ化合物,アルキル硫酸エステルナトリウムなど",
                    "subtopics": []
                  },
                  {
                    "id": "chem_4_2_3",
                    "title": "(3)高分子化合物",
                    "content": "合成高分子化合物, 天然高分子化合物, 広く利用されている高分子化合物",
                    "subtopics": []
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "code": "biology",
        "name": "生物",
        "sort_order": 3,
        "chapters": [
          {
            "id": "bio_1",
            "title": "I 生物の進化",
            "sections": [
              {
                "id": "bio_1_1",
                "title": "1.生命の起源と細胞の進化",
                "topics": [
                  {
                    "id": "bio_1_1_1",
                    "title": "(1)生命の起源",
                    "content": "原始地球と化学進化",
                    "subtopics": []
                  },
                  {
                    "id": "bio_1_1_2",
                    "title": "(2)細胞の進化",
                    "content": "原核細胞の誕生と光合成生物の出現,真核細胞の誕生と細胞内共生",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "bio_1_2",
                "title": "2.遺伝子の変化と遺伝子の組合せの変化",
                "topics": [
                  {
                    "id": "bio_1_2_1",
                    "title": "(1)遺伝子とその変化",
                    "content": "突然変異と生物の形質の変化,塩基の置換･挿入･欠失",
                    "subtopics": []
                  },
                  {
                    "id": "bio_1_2_2",
                    "title": "(2)遺伝子の組合せの変化",
                    "content": "遺伝子と染色体,性染色体と常染色体,減数分裂と受精,連鎖と組換え",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "bio_1_3",
                "title": "3.進化の仕組み",
                "topics": [
                  {
                    "id": "bio_1_3_1",
                    "title": "(1)進化の仕組み",
                    "content": "遺伝子頻度と進化,遺伝的浮動と中立説,自然選択と適応進化",
                    "subtopics": []
                  },
                  {
                    "id": "bio_1_3_2",
                    "title": "(2)種分化",
                    "content": "隔離と種分化",
                    "subtopics": []
                  }
                ]
              }
            ]
          },
          {
            "id": "bio_2",
            "title": "II 生物の系統と進化",
            "sections": [
              {
                "id": "bio_2_1",
                "title": "1.生物の系統と進化",
                "topics": [
                  {
                    "id": "bio_2_1_1",
                    "title": "(1)生物の系統と分類",
                    "content": "塩基配列やアミノ酸配列,分子進化,脊椎動物の系統樹",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "bio_2_3",
                "title": "3.遺伝子を扱う技術",
                "topics": [
                  {
                    "id": "bio_2_3_1",
                    "title": "(1)遺伝子を扱う技術",
                    "content": "遺伝子の単離と増幅,遺伝子の構造や発現の解析",
                    "subtopics": []
                  },
                  {
                    "id": "bio_2_3_2",
                    "title": "(2)遺伝子を扱う技術の応用",
                    "content": "食糧生産への応用,医療への応用",
                    "subtopics": []
                  }
                ]
              }
            ]
          },
          {
            "id": "bio_6",
            "title": "VI ヒトの体内環境の維持",
            "sections": [
              {
                "id": "bio_6_1",
                "title": "1.ヒトの体の調節",
                "topics": [
                  {
                    "id": "bio_6_1_1",
                    "title": "(1)体液とその循環",
                    "content": "血液凝固",
                    "subtopics": []
                  },
                  {
                    "id": "bio_6_1_2",
                    "title": "(2)自律神経系と内分泌系",
                    "content": "自律神経系と内分泌系",
                    "subtopics": []
                  },
                  {
                    "id": "bio_6_1_3",
                    "title": "(3)免疫",
                    "content": "免疫",
                    "subtopics": []
                  }
                ]
              }
            ]
          },
          {
            "id": "bio_7",
            "title": "VII 動物の反応と行動",
            "sections": [
              {
                "id": "bio_7_1",
                "title": "1.動物の反応",
                "topics": [
                  {
                    "id": "bio_7_1_1",
                    "title": "(1)刺激の受容と反応",
                    "content": "神経系とニューロン,静止電位と活動電位,興奮の伝導と跳躍伝導",
                    "subtopics": []
                  },
                  {
                    "id": "bio_7_1_2",
                    "title": "(2)受容器の仕組み",
                    "content": "刺激の受容と適刺激,受容器から中枢神経への情報の伝達",
                    "subtopics": []
                  },
                  {
                    "id": "bio_7_1_3",
                    "title": "(3)中枢神経系の構造と働き",
                    "content": "脳の構造と働き,脊髄の構造と働き,反射の仕組み",
                    "subtopics": []
                  },
                  {
                    "id": "bio_7_1_4",
                    "title": "(4)効果器の仕組み",
                    "content": "骨格筋の構造,興奮の伝導と筋収縮",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "bio_7_2",
                "title": "2.動物の行動",
                "topics": [
                  {
                    "id": "bio_7_2_1",
                    "title": "(1)生得的行動",
                    "content": "生得的行動",
                    "subtopics": []
                  },
                  {
                    "id": "bio_7_2_2",
                    "title": "(2)習得的行動と学習",
                    "content": "習得的行動と学習",
                    "subtopics": []
                  }
                ]
              }
            ]
          },
          {
            "id": "bio_8",
            "title": "VIII 植物の成長と環境応答",
            "sections": [
              {
                "id": "bio_8_1",
                "title": "1.被子植物の生殖と発生",
                "topics": [
                  {
                    "id": "bio_8_1_1",
                    "title": "(1)配偶子形成",
                    "content": "配偶子形成",
                    "subtopics": []
                  },
                  {
                    "id": "bio_8_1_2",
                    "title": "(2)重複受精",
                    "content": "重複受精",
                    "subtopics": []
                  },
                  {
                    "id": "bio_8_1_3",
                    "title": "(3)胚発生",
                    "content": "胚発生",
                    "subtopics": []
                  },
                  {
                    "id": "bio_8_1_4",
                    "title": "(4)種子の形成",
                    "content": "種子の形成",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "bio_8_2",
                "title": "2.植物の一生と植物ホルモン",
                "topics": [
                  {
                    "id": "bio_8_2_1",
                    "title": "(1)種子の発芽と光環境",
                    "content": "種子の休眠と発芽,光発芽種子と暗発芽種子,光受容体",
                    "subtopics": []
                  },
                  {
                    "id": "bio_8_2_2",
                    "title": "(2)植物の環境応答と成長",
                    "content": "オーキシンの働き,光と重力への応答,屈性と傾性,気孔の開閉",
                    "subtopics": []
                  },
                  {
                    "id": "bio_8_2_3",
                    "title": "(3)花芽形成と花の形成",
                    "content": "光周性,花芽形成の仕組み,春化,花の構造とABCモデル",
                    "subtopics": []
                  },
                  {
                    "id": "bio_8_2_4",
                    "title": "(4)果実の成長と成熟･落葉･落果",
                    "content": "果実の成長と成熟･落葉･落果",
                    "subtopics": []
                  }
                ]
              }
            ]
          },
          {
            "id": "bio_9",
            "title": "IX 生態と環境",
            "sections": [
              {
                "id": "bio_9_1",
                "title": "1.個体群と生物群集",
                "topics": [
                  {
                    "id": "bio_9_1_1",
                    "title": "(1)個体群とその特徴",
                    "content": "生存曲線と年齢ピラミッド,個体群密度と種内競争",
                    "subtopics": []
                  },
                  {
                    "id": "bio_9_1_2",
                    "title": "(2)生物群集とその特徴",
                    "content": "捕食と被食,寄生と共生,種間競争と生態的地位(ニッチ)",
                    "subtopics": []
                  }
                ]
              },
              {
                "id": "bio_9_2",
                "title": "2.生態系",
                "topics": [
                  {
                    "id": "bio_9_2_1",
                    "title": "(1)植生の遷移とバイオーム",
                    "content": "植生の遷移とバイオーム",
                    "subtopics": []
                  },
                  {
                    "id": "bio_9_2_2",
                    "title": "(2)生態系の物質生産と物質循環",
                    "content": "物質生産,栄養段階ごとの物質収支とエネルギーの流れ",
                    "subtopics": []
                  },
                  {
                    "id": "bio_9_2_3",
                    "title": "(3)生態系と人間生活",
                    "content": "生態系と生物多様性,人間活動が生態系に及ぼす影響,生態系のバランスと保全",
                    "subtopics": []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "code": "bunso",
    "name": "総合科目",
    "sort_order": 2,
    "subSubjects": [
      {
        "code": "geography",
        "name": "地理",
        "sort_order": 1,
        "chapters": []
      },
      {
        "code": "history",
        "name": "歴史",
        "sort_order": 2,
        "chapters": []
      },
      {
        "code": "politics",
        "name": "政治",
        "sort_order": 3,
        "chapters": []
      },
      {
        "code": "economics",
        "name": "経済",
        "sort_order": 4,
        "chapters": []
      },
      {
        "code": "modern_society",
        "name": "現代社会",
        "sort_order": 5,
        "chapters": []
      }
    ]
  },
  {
    "code": "japanese",
    "name": "日本語",
    "sort_order": 3,
    "subSubjects": [
      {
        "code": "jp_reading",
        "name": "読解",
        "sort_order": 1,
        "chapters": []
      },
      {
        "code": "jp_listening",
        "name": "聴解",
        "sort_order": 2,
        "chapters": []
      },
      {
        "code": "jp_listen_read",
        "name": "聴読解",
        "sort_order": 3,
        "chapters": []
      },
      {
        "code": "jp_writing",
        "name": "記述",
        "sort_order": 4,
        "chapters": []
      }
    ]
  },
  {
    "code": "math1",
    "name": "数学コース1",
    "sort_order": 4,
    "subSubjects": [
      {
        "code": "math1_liberal",
        "name": "文科数学",
        "sort_order": 1,
        "chapters": []
      }
    ]
  },
  {
    "code": "math2",
    "name": "数学コース2",
    "sort_order": 5,
    "subSubjects": [
      {
        "code": "math2_science",
        "name": "理科数学",
        "sort_order": 1,
        "chapters": []
      }
    ]
  }
];
