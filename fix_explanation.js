const fs = require('fs');
const path = '/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/charpter 2-10/charpter5_MD/phy_1_chapter05_questions.json';
let data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Helper to convert LaTeX in explanation to Unicode or wrap in $
data.forEach(q => {
  if (q.explanation) {
    // We want to ensure formulas in the explanation are properly wrapped in $...$
    // Specifically looking for unwrapped variables, numbers with units, and formulas like:
    // M_1 = 6.0 \mathrm{N}\cdot\mathrm{m}
    // \frac{mgd}{l}
    // l_{1}=0.20\mathrm{m}

    // Step 1: Let's convert some \mathrm tags to make it cleaner just like options
    q.explanation = q.explanation
      .replace(/\\mathrm\{N\}/g, 'N')
      .replace(/\\mathrm\{m\}/g, 'm')
      .replace(/\\mathrm\{cm\}/g, 'cm')
      .replace(/\\mathrm\{kg\}/g, 'kg');

    // Step 2: The 【参考答案】 section usually mirrors options, let's wrap it in $
    q.explanation = q.explanation.replace(/【参考答案】:\s*([^\n]+)/g, (match, p1) => {
      // Split by (1) (2) etc.
      let parts = p1.split(/(?=\([1-9a-z]\))/g);
      let newParts = parts.map(part => {
        let m = part.match(/^(\([1-9a-z]\)\s*)(.*)$/);
        if (m) {
          let prefix = m[1];
          let content = m[2].trim();
          if (!content.includes('$') && !/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(content)) {
            return prefix + '$' + content + '$ ';
          }
        } else {
          if (!part.includes('$') && !/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(part)) {
             return '$' + part.trim() + '$ ';
          }
        }
        return part + ' ';
      });
      return '【参考答案】: ' + newParts.join('').trim();
    });

    // Step 3: We have many unwrapped formulas in the detailed explanation
    // We can use a regex to wrap things that look like math.
    // Things with =, \times, \cdot, _, ^, \frac, \sqrt, \sin, \cos, \implies
    q.explanation = q.explanation.replace(/(?<!\$)([A-Za-z0-9_\\^{}()+\-/*.,]+(?:\s*[=<>≤≥]|\\implies|\\times|\\cdot|\\frac|\\sqrt|\\sin|\\cos|\\tan)[A-Za-z0-9_\\^{}()+\-/*.,\s]*)(?!\$)/g, (match) => {
      let trimmed = match.trim();
      // Avoid wrapping single words or empty strings
      if (trimmed.length < 3 || trimmed === '\\implies' || trimmed.match(/^[a-zA-Z]+$/)) return match;
      // Also avoid wrapping URLs or image markdown
      if (trimmed.includes('http') || trimmed.includes('![image]')) return match;
      
      let prefix = match.substring(0, match.indexOf(trimmed));
      let suffix = match.substring(match.indexOf(trimmed) + trimmed.length);
      
      return prefix + '$' + trimmed + '$' + suffix;
    });

    // Step 4: Clean up double $
    q.explanation = q.explanation.replace(/\$\$/g, '$');
    // Clean up $ inside $
    q.explanation = q.explanation.replace(/\$([^$]+)\$/g, (match, inner) => {
      // if inner contains another $, something went wrong, but the above regex is careful
      return match;
    });
    q.explanation = q.explanation.replace(/\$ \$/g, ' ');
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Done explanation fix!');
