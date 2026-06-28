const fs = require('fs');
const path = require('path');

const SOURCE_PATH = '/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/charpter 2-10/MinerU_markdown_リードα_物理 charpter 2-10.md';
const EXPLANATION_PATH = '/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/charpter 2-10/MinerU_markdown_リードα_物理物理 charpter 2-10_解析.md';
const OUTPUT_PATH = '/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/charpter 2-10/final_questions.json';

// 精准考纲映射 (根据 MD 标题关键字)
const TOPIC_MAPPING = [
  { key: '落体の運動', code: 'phy_1_1_1' },
  { key: '力とは', code: 'phy_1_1_2' },
  { key: 'さまざまな力', code: 'phy_1_1_2' },
  { key: '力のつりあい', code: 'phy_1_1_3' },
  { key: '斜面上のつりあい', code: 'phy_1_1_3' },
  { key: '剛体', code: 'phy_1_1_4' },
  { key: '重心', code: 'phy_1_1_4' },
  { key: '運動の法則', code: 'phy_1_1_5' },
  { key: '運動方程式', code: 'phy_1_1_5' },
  { key: '摩擦力', code: 'phy_1_1_6' },
  { key: '仕事', code: 'phy_1_2_1' },
  { key: '運動エネルギー', code: 'phy_1_2_1' },
  { key: '位置エネルギー', code: 'phy_1_2_2' },
  { key: '力学的エネルギーの保存', code: 'phy_1_2_3' },
  { key: '運動量', code: 'phy_1_2_4' },
  { key: '衝突', code: 'phy_1_2_5' },
  { key: '円運動', code: 'phy_1_3_1' },
  { key: '慣性力', code: 'phy_1_3_2' },
  { key: '単振動', code: 'phy_1_3_3' },
  { key: '万有引力', code: 'phy_1_3_4' }
];

function clean(t) { return t ? t.replace(/\s+/g, ' ').trim() : ""; }

function generateDistractors(answer) {
  // 提取答案中的数字
  const numMatch = answer.match(/(\d+\.?\d*)/);
  if (numMatch) {
    const val = parseFloat(numMatch[1]);
    const unit = answer.replace(numMatch[0], '').trim();
    // 生成一些看似合理的干扰项
    return [
      `${(val * 0.5).toFixed(1)} ${unit}`,
      `${(val * 1.5).toFixed(1)} ${unit}`,
      `${(val * 2).toFixed(1)} ${unit}`
    ];
  }
  // 非数字答案的通用干扰项
  return ["条件により異なる", "計算不能", "その他"];
}

function getChineseExplanation(japaneseText, id, topicCode) {
    // 简单的关键词映射，用于生成中文解析
    const mappings = [
        { k: '自由落下', v: '物体做自由落体运动，初速度为0，加速度为重力加速度g。' },
        { k: '投げ上げ', v: '竖直上抛运动，上升过程中加速度方向向下，大小为g。' },
        { k: '等速直線運動', v: '物体做等速直线运动，速度保持不变，合力为0。' },
        { k: 'つりあい', v: '物体处于平衡状态，所受合外力为0或合力矩为0。' },
        { k: '運動方程式', v: '根据牛顿第二定律 F=ma，建立运动方程求解加速度或力。' },
        { k: '摩擦力', v: '考虑摩擦力影响，滑动摩擦力 f=μN，方向与运动方向相反。' },
        { k: 'エネルギー', v: '根据机械能守恒定律或动能定理，分析能量转化过程。' },
        { k: '運動量', v: '利用动量守恒定律分析碰撞或爆炸过程，系统总动量保持不变。' },
        { k: '万有引力', v: '根据万有引力定律 F=GMM/r^2，分析天体运动规律。' }
    ];

    let chinese = "本题考查";
    let found = false;
    for (const m of mappings) {
        if (japaneseText.includes(m.k)) {
            chinese += m.v;
            found = true;
            break;
        }
    }
    if (!found) chinese += "相关物理概念，请根据公式进行受力分析或运动状态推导。";
    
    return `${chinese}\n\n详细步骤：请参考原始解析文档中编号为 ${id.split('-')[0]} 的说明。`;
}

function parseAnsFile(content) {
    const map = new Map();
    const blocks = content.split(/\n(?=\d{1,3}\s*\n|## 第\d+章)/);
    for (const b of blocks) {
        const m = b.match(/^(\d{1,3})/);
        if (!m) continue;
        const qNum = m[1];
        const subs = new Map();
        const subParts = b.split(/\((\d)\)/);
        if (subParts.length > 1) {
            for (let k = 1; k < subParts.length; k += 2) {
                subs.set(subParts[k], clean(subParts[k+1].split('\n')[0]));
            }
        } else {
            const afterAns = b.split('解答')[1] || b.split('\n').slice(1).join('\n');
            subs.set('0', clean(afterAns.trim().split('\n')[0]));
        }
        map.set(qNum, subs);
    }
    return map;
}

function convert() {
  console.log('🚀 开始转换流程...');
  const source = fs.readFileSync(SOURCE_PATH, 'utf8');
  const expFile = fs.readFileSync(EXPLANATION_PATH, 'utf8');

  const fileAnsMap = parseAnsFile(expFile);
  const sourceAnsMap = new Map();
  
  // 从源文件中提取嵌入的解答
  const sourceSections = source.split('## 解答');
  if (sourceSections.length > 1) {
      const ansPart = sourceSections[1].split('##')[0];
      const lines = ansPart.split('\n');
      let curQ = "";
      for (let l of lines) {
          const m = l.match(/^(\d+)\s+(.*)/);
          if (m) {
              curQ = m[1];
              const subs = new Map();
              const subParts = m[2].split(/\((\d)\)/);
              if (subParts.length > 1) {
                  for (let k = 1; k < subParts.length; k += 2) subs.set(subParts[k], clean(subParts[k+1]));
              } else {
                  subs.set('0', clean(m[2]));
              }
              sourceAnsMap.set(curQ, subs);
          } else if (curQ && l.trim().startsWith('(')) {
              const sm = l.match(/^\((\d)\)\s*(.*)/);
              if (sm) sourceAnsMap.get(curQ).set(sm[1], clean(sm[2]));
          }
      }
  }

  const questions = [];
  const lines = source.split('\n');
  let currentTopic = 'phy_1_1_1';
  let currentDifficulty = 2;
  let sectionPrefix = 'phy-02';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('# 第')) {
      const m = line.match(/第(\d+)章/);
      if (m) sectionPrefix = `phy-${m[1].padStart(2, '0')}`;
    }
    if (line.startsWith('## ')) {
      const title = line.replace('## ', '');
      if (title.includes('基礎 CHECK')) currentDifficulty = 1;
      else if (title.includes('応用問題')) currentDifficulty = 3;
      else currentDifficulty = 2;
      for (const m of TOPIC_MAPPING) { if (title.includes(m.key)) { currentTopic = m.code; break; } }
    }

    const qMatch = line.match(/^(?:考\s+)?(\d{1,3})\s+(.*)/);
    if (qMatch) {
      const qNum = qMatch[1];
      let stemBase = qMatch[2];
      let j = i + 1;
      const subStems = [];
      let commonImg = "";
      while (j < lines.length && !lines[j].startsWith('##') && !lines[j].match(/^(?:考\s+)?\d{1,3}\s+/)) {
        const l = lines[j].trim();
        if (l.match(/^\(\d\)/)) subStems.push(l);
        else if (l.startsWith('![image]')) commonImg += "\n" + l;
        else if (l && !l.startsWith('指針') && !l.startsWith('解答')) stemBase += "\n" + l;
        j++;
      }
      i = j - 1;

      const getAns = (sid) => (sourceAnsMap.get(qNum)?.get(sid) || fileAnsMap.get(qNum)?.get(sid) || sourceAnsMap.get(qNum)?.get('0') || fileAnsMap.get(qNum)?.get('0') || "詳解参照");

      if (subStems.length === 0) {
        questions.push(build(qNum, stemBase + commonImg, currentTopic, currentDifficulty, sectionPrefix, getAns('0')));
      } else {
        subStems.forEach((ss, idx) => {
          const sid = (idx + 1).toString();
          questions.push(build(`${qNum}-${sid}`, stemBase + "\n" + ss + commonImg, currentTopic, currentDifficulty, sectionPrefix, getAns(sid)));
        });
      }
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(questions, null, 2));
  console.log(`✅ 成功转换 ${questions.length} 道题目并保存到 ${OUTPUT_PATH}`);
}

function build(id, stem, topic, diff, prefix, ans) {
  // 转换 LaTeX
  const fStem = stem.replace(/(\d+\.?\d*m\/s\^?2?)/g, '$$$1$$').replace(/(\d+\.?\d*kg)/g, '$$$1$$');
  const fAns = ans.replace(/(\d+\.?\d*m\/s\^?2?)/g, '$$$1$$');
  
  // 随机正确选项索引 (0-3)
  const correctIdx = Math.floor(Math.random() * 4);
  const distractors = generateDistractors(ans);
  
  const options = [];
  let dIdx = 0;
  for (let i = 0; i < 4; i++) {
    if (i === correctIdx) {
      options.push(fAns);
    } else {
      options.push(distractors[dIdx++].replace(/(\d+\.?\d*m\/s\^?2?)/g, '$$$1$$'));
    }
  }

  return {
    businessCode: `${prefix}-q${id}`,
    topicCode: topic,
    questionType: 1,
    difficultyLevel: diff,
    score: 5,
    stem: fStem,
    options: options,
    correctIndex: correctIdx,
    explanation: getChineseExplanation(stem + ans, id, topic)
  };
}

convert();
