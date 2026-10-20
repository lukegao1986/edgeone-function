const fs = require('fs');
const path = require('path');

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// 统计题干中有几个小问
function countSubQuestions(stem) {
  if (!stem) return 1;
  const matches = stem.match(/\(\d+\)/g);
  return matches ? matches.length : 1;
}

// 移除“干扰项”等字眼
function cleanOptionText(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/\s*\(?干扰项\d*\)?\s*/g, '').trim();
}

const baseDir = path.join(process.cwd(), 'docs/0 数据准备/Charpter 1-30');
const chapters = [11, 12, 13];
const fixLog = [];

for (const ch of chapters) {
  const jsonPath = path.join(baseDir, `charpter${ch}`, `phy_2_chapter${ch}_questions.json`);
  if (!fs.existsSync(jsonPath)) continue;

  let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let changed = false;

  for (let q of data) {
    if (!q.options || !Array.isArray(q.options)) continue;
    
    let optionsChanged = false;
    let oldOptionsCount = q.options.length;

    // 1. 清理明显的提示文字
    let cleanedOptions = q.options.map(cleanOptionText);
    for (let i = 0; i < q.options.length; i++) {
        if (cleanedOptions[i] !== q.options[i]) {
            optionsChanged = true;
        }
    }
    
    // 2. 根据小问数量截断过多的选项
    const N = countSubQuestions(q.stem);
    const targetCount = 2 * N + 2;
    
    let correctOpt = cleanedOptions[q.correctIndex || 0];
    if (cleanedOptions.length > targetCount) {
      console.log(`[${q.businessCode}] Truncating options from ${cleanedOptions.length} to ${targetCount} (N=${N})`);
      
      let newOptions = [correctOpt];
      let interferenceOpts = [];
      
      for (let i = 0; i < cleanedOptions.length; i++) {
        if (i !== (q.correctIndex || 0)) {
          interferenceOpts.push(cleanedOptions[i]);
        }
      }
      
      // 打乱干扰项，选取前 (targetCount - 1) 个
      shuffleArray(interferenceOpts);
      newOptions = newOptions.concat(interferenceOpts.slice(0, targetCount - 1));
      
      // 去重
      newOptions = Array.from(new Set(newOptions));
      
      // 重新封装并洗牌以随机化正确选项位置
      let optsWithFlag = newOptions.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === 0
      }));
      shuffleArray(optsWithFlag);
      
      q.options = optsWithFlag.map(o => o.text);
      q.correctIndex = optsWithFlag.findIndex(o => o.isCorrect);
      
      optionsChanged = true;
      changed = true;
      fixLog.push({
          businessCode: q.businessCode,
          action: `缩减选项数量 (${oldOptionsCount} -> ${q.options.length}) 并清理提示文字`
      });
    } else if (optionsChanged) {
      // 仅清理了文字
      q.options = cleanedOptions;
      changed = true;
      fixLog.push({
          businessCode: q.businessCode,
          action: `清理选项中的提示文字`
      });
    }
  }

  if (changed) {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Saved fixes for Chapter ${ch}`);
  }
}

fs.writeFileSync('docs/Topic_Review_Reports/ch11_13_options_fix_log.json', JSON.stringify(fixLog, null, 2));
console.log('Done fixing options count and text.');