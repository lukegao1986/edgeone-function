const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter4_MD/phy_1_chapter04_questions.json');
// Reload from backup to test again
const data = JSON.parse(fs.readFileSync(jsonPath.replace('.json', '_backup.json'), 'utf8'));

function extractN(stem) {
  if (stem.includes('(4)')) return 4;
  if (stem.includes('(3)')) return 3;
  if (stem.includes('(2)')) return 2;
  return 1;
}

function extractCorrectAnswerFromExplanationAndOriginal(q) {
  const match = q.explanation.match(/【参考答案】:\s*([^\n]+)/);
  if (!match) return q.options[q.correctIndex].replace(/^[A-Z][:.]\s*/, '').trim();
  
  let refAns = match[1].trim();
  
  let rawOptions = [];
  if (q.options.length > 0 && q.options[0].includes(' | ')) {
    rawOptions = q.options[0].split('|').map(s => s.trim());
  } else {
    rawOptions = [...q.options];
  }
  let cleanOptions = rawOptions.map(o => o.replace(/^[A-Z][:.]\s*/, '').trim());
  
  if (/^[A-Z]$/.test(refAns)) {
    // find the option starting with this letter in original q.options
    const found = q.options.find(o => o.startsWith(refAns + ':') || o.startsWith(refAns + '.'));
    if (found) {
      return found.replace(/^[A-Z][:.]\s*/, '').trim();
    }
  }
  
  let normalize = s => s.replace(/\s+/g, '').replace(/[(1234)]/g, '').replace(/,/g, '').replace(/、/g, '');
  let normRef = normalize(refAns);
  
  for (let opt of cleanOptions) {
      if (normalize(opt) === normRef || normalize(opt).includes(normRef) || normRef.includes(normalize(opt))) {
          return opt;
      }
  }
  
  return refAns;
}

data.forEach(q => {
  // 1. Remove markdown headers from stem
  q.stem = q.stem.replace(/#{1,3}\s/g, '');

  let N = extractN(q.stem);
  let targetCount = 2 * N + 2;

  let correctAnswerText = extractCorrectAnswerFromExplanationAndOriginal(q);
  correctAnswerText = correctAnswerText.replace(/^[A-Z][:.]\s*/, '').trim();

  let rawOptions = [];
  if (q.options.length > 0 && q.options[0].includes(' | ')) {
    rawOptions = q.options[0].split('|').map(s => s.trim());
  } else {
    rawOptions = [...q.options];
  }

  let cleanOptions = rawOptions.map(o => o.replace(/^[A-Z][:.]\s*/, '').trim());
  cleanOptions = [...new Set(cleanOptions)];

  if (!cleanOptions.includes(correctAnswerText)) {
    cleanOptions.unshift(correctAnswerText);
  }

  if (cleanOptions.length > targetCount) {
    const correctIdx = cleanOptions.indexOf(correctAnswerText);
    if (correctIdx > -1) {
       cleanOptions.splice(correctIdx, 1);
    }
    cleanOptions = cleanOptions.slice(0, targetCount - 1);
    cleanOptions.push(correctAnswerText);
  } else if (cleanOptions.length < targetCount) {
    let distractors = cleanOptions.filter(o => o !== correctAnswerText);
    if (distractors.length === 0) distractors = [correctAnswerText + ' (Incorrect)'];
    
    let i = 0;
    while (cleanOptions.length < targetCount) {
      let base = distractors[i % distractors.length];
      let tweaked = base;
      if (tweaked.match(/\d/)) {
          tweaked = tweaked.replace(/(\d+)(?!.*\d)/, (m) => parseInt(m) + 1);
      } else {
          tweaked = base + ' *';
      }
      if (!cleanOptions.includes(tweaked)) {
        cleanOptions.push(tweaked);
      } else {
        cleanOptions.push(tweaked + ' *');
      }
      i++;
    }
  }

  let indices = cleanOptions.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const shuffledOptions = indices.map(i => cleanOptions[i]);
  const newCorrectIndex = shuffledOptions.indexOf(correctAnswerText);

  q.options = shuffledOptions;
  q.correctIndex = newCorrectIndex;
});

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Fixed options locally.');