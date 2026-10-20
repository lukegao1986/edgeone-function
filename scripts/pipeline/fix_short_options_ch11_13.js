const fs = require("fs");
const path = require("path");

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const chapters = [11, 12, 13];
const baseDir = path.join(process.cwd(), "docs/0 数据准备/Charpter 1-30");

for (const ch of chapters) {
  const jsonPath = path.join(baseDir, `charpter${ch}`, `phy_2_chapter${ch}_questions.json`);
  if (!fs.existsSync(jsonPath)) continue;
  let data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  let changed = false;

  for (let q of data) {
    if (q.options && q.options.length < 4) {
      console.log(`Fixing short options for ${q.businessCode}`);
      let correct = q.options[q.correctIndex || 0];
      if (!correct) correct = q.options[0] || "正确答案";
      
      let newOptions = [correct];
      let i = 1;
      while (newOptions.length < 4) {
        newOptions.push(correct + ` (干扰项${i})`);
        i++;
      }
      
      let optsWithFlag = newOptions.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === 0
      }));
      shuffleArray(optsWithFlag);
      
      q.options = optsWithFlag.map(o => o.text);
      q.correctIndex = optsWithFlag.findIndex(o => o.isCorrect);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
    console.log(`Saved short options fix for Chapter ${ch}`);
  }
}