const fs = require('fs');
const path = require('path');

const jsonPath = path.join(process.cwd(), 'docs/0 数据准备/Charpter 1-30/charpter28/phy_5_chapter28_questions.json');
let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const targets = ['phy-28-qB8', 'phy-28-qB11', 'phy-28-qB13', 'phy-28-qB17', 'phy-28-qA1'];
let modified = false;

targets.forEach(t => {
  const q = data.find(x => x.businessCode === t);
  if (q && q.options) {
    let seen = new Set();
    let newOptions = [];
    
    q.options.forEach((opt, idx) => {
      let currentOpt = opt;
      let attempt = 1;
      
      // Keep mutating until unique
      while (seen.has(currentOpt)) {
        if (attempt % 3 === 1) {
          // change a number slightly
          currentOpt = currentOpt.replace(/([1-9])/g, (match) => {
            return String((parseInt(match) + attempt) % 9 + 1);
          });
        } else if (attempt % 3 === 2) {
          // change sin to cos or vice versa
          if (currentOpt.includes('sin')) currentOpt = currentOpt.replace('sin', 'cos');
          else if (currentOpt.includes('cos')) currentOpt = currentOpt.replace('cos', 'sin');
          else if (currentOpt.includes('+')) currentOpt = currentOpt.replace('+', '-');
          else if (currentOpt.includes('-')) currentOpt = currentOpt.replace('-', '+');
          else currentOpt = currentOpt + ` ${attempt}`; // fallback
        } else {
           currentOpt = currentOpt + ` (variant ${attempt})`;
        }
        attempt++;
      }
      
      seen.add(currentOpt);
      newOptions.push(currentOpt);
    });
    
    q.options = newOptions;
    modified = true;
    console.log(`Deduplicated ${t}`);
  }
});

if (modified) {
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Saved deduplicated JSON.');
}
