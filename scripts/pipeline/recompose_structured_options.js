const fs = require('fs');
const path = require('path');

const CHAPTERS = [21, 22, 23, 24, 25, 26, 27, 28, 29];
const MAX_OPTIONS = 16;

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function splitSegments(text) {
  const value = String(text).trim();
  const markerMatches = value.match(
    /(?:[①②③④⑤⑥⑦⑧⑨⑩⑪⑫]|\(\d+\)|[アイウエオカキクケコ]:)\s*.*?(?=(?:\s*[①②③④⑤⑥⑦⑧⑨⑩⑪⑫]|\s*\(\d+\)|\s*[アイウエオカキクケコ]:)|$)/g
  );
  if (markerMatches && markerMatches.length >= 4) {
    return markerMatches
      .map(item => item.trim().replace(/,+$/g, '').trim())
      .filter(Boolean);
  }
  return value
    .split(/\s*,\s*/)
    .map(item => item.trim().replace(/,+$/g, '').trim())
    .filter(Boolean);
}

function getCombinations(indices, size) {
  const result = [];
  function dfs(start, path) {
    if (path.length === size) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < indices.length; i += 1) {
      path.push(indices[i]);
      dfs(i + 1, path);
      path.pop();
    }
  }
  dfs(0, []);
  return result;
}

function buildStructuredOptions(question) {
  const currentOptions = question.options || [];
  const targetCount = Math.min(currentOptions.length, MAX_OPTIONS);
  const correct = currentOptions[question.correctIndex];
  if (!correct) return null;

  const splitAll = currentOptions.map(splitSegments);
  const correctSegs = splitSegments(correct);
  const normalizedCorrect = correctSegs.join(', ');
  if (correctSegs.length < 4) return null;
  if (!splitAll.every(parts => parts.length === correctSegs.length)) return null;

  const pools = correctSegs.map(() => new Set());
  splitAll.forEach(parts => {
    parts.forEach((part, idx) => pools[idx].add(part));
  });
  const alternatives = pools.map((pool, idx) =>
    [...pool].filter(item => item !== correctSegs[idx])
  );
  const changeable = alternatives
    .map((items, idx) => ({ idx, count: items.length }))
    .filter(item => item.count > 0)
    .map(item => item.idx);

  if (changeable.length < 2) return null;

  const distractors = [];
  const seen = new Set([normalizedCorrect]);
  const comboSizes = [2, 3, 4];

  for (const comboSize of comboSizes) {
    const combos = getCombinations(changeable, comboSize);
    for (const combo of combos) {
      let produced = 0;
      const maxVariants = Math.max(...combo.map(idx => alternatives[idx].length));
      for (let offset = 0; offset < maxVariants; offset += 1) {
        const parts = [...correctSegs];
        combo.forEach((idx, comboPos) => {
          const pool = alternatives[idx];
          parts[idx] = pool[(offset + comboPos) % pool.length];
        });
        const candidate = parts.join(', ');
        if (seen.has(candidate)) continue;
        seen.add(candidate);
        distractors.push(candidate);
        produced += 1;
        if (distractors.length >= targetCount - 1) break;
      }
      if (distractors.length >= targetCount - 1) break;
      if (produced === 0) continue;
    }
    if (distractors.length >= targetCount - 1) break;
  }

  if (distractors.length < targetCount - 1) return null;

  const rebuilt = [normalizedCorrect, ...distractors.slice(0, targetCount - 1)];
  const shuffled = shuffleArray(rebuilt);
  return {
    options: shuffled,
    correctIndex: shuffled.indexOf(normalizedCorrect),
  };
}

function main() {
  for (const ch of CHAPTERS) {
    const prefix = ch >= 28 ? 'phy_5' : 'phy_4';
    const jsonPath = path.join(
      process.cwd(),
      `docs/0 数据准备/Charpter 1-30/charpter${ch}/${prefix}_chapter${ch}_questions.json`
    );
    if (!fs.existsSync(jsonPath)) continue;
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let modified = false;

    data.forEach(question => {
      if ((question.options || []).length <= 7) return;
      const rebuilt = buildStructuredOptions(question);
      if (!rebuilt) return;
      question.options = rebuilt.options;
      question.correctIndex = rebuilt.correctIndex;
      modified = true;
      process.stdout.write(`Recomposed ${question.businessCode}\n`);
    });

    if (modified) {
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      process.stdout.write(`Saved ${jsonPath}\n`);
    }
  }
}

main();
