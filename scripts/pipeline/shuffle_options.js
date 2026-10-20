const fs = require('fs');
const path = require('path');

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function main() {
  const chapters = [21, 22, 23, 24, 25, 26, 27, 28, 29];
  
  for (const ch of chapters) {
    const prefix = (ch >= 28) ? 'phy_5' : 'phy_4';
    const jsonPath = path.join(process.cwd(), `docs/0 数据准备/Charpter 1-30/charpter${ch}/${prefix}_chapter${ch}_questions.json`);
    if (!fs.existsSync(jsonPath)) continue;
    
    let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let modified = false;

    for (let q of data) {
      if (q.options && q.options.length > 1) {
        // Protect correct option
        let correctOpt = q.options[q.correctIndex];
        if (correctOpt === undefined) {
          console.warn(`Warning: ${q.businessCode} has invalid correctIndex ${q.correctIndex}`);
          continue;
        }

        // We will reshuffle every question to guarantee randomness across the board
        // This is safe because we track the correct string
        const shuffledOptions = shuffleArray(q.options);
        
        // In rare cases where there are duplicate strings (which we already cleaned, but just in case)
        // indexOf will find the first one. Since they are identical strings, it's fine.
        const newCorrectIndex = shuffledOptions.indexOf(correctOpt);
        
        if (JSON.stringify(q.options) !== JSON.stringify(shuffledOptions)) {
          q.options = shuffledOptions;
          q.correctIndex = newCorrectIndex;
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Shuffled options for Chapter ${ch}.`);
    }
  }
}

main().catch(console.error);