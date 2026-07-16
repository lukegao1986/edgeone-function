const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../docs/0 数据准备/charpter 2-10/charpter4_MD/phy_1_chapter04_questions.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let shuffledCount = 0;

data.forEach(q => {
  // Only shuffle if it has options and correctIndex is valid
  if (q.options && q.options.length > 0 && typeof q.correctIndex === 'number') {
    let indices = q.options.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const newOptions = indices.map(i => q.options[i]);
    const newCorrectIndex = indices.indexOf(q.correctIndex);
    
    q.options = newOptions;
    q.correctIndex = newCorrectIndex;
    shuffledCount++;
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Successfully randomized correctIndex for ${shuffledCount} questions.`);
