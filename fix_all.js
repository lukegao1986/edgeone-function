const fs = require('fs');
const path = '/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/charpter 2-10/charpter5_MD/phy_1_chapter05_questions.json';
let data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Helper to convert LaTeX in explanation to Unicode or wrap in $
data.forEach(q => {
  // Fix options
  if (q.options) {
    q.options = q.options.map(opt => {
      if (!opt.includes('$')) {
        let match = opt.match(/^(\([1-9a-z]\)\s*)(.*)$/);
        if (!/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(opt)) {
          return opt.replace(/(\([1-9a-z]\)\s*)?(.*)/, (m, p1, p2) => {
            if (p1) return p1 + '$' + p2.trim() + '$';
            return '$' + p2.trim() + '$';
          });
        }
        let newOpt = opt.replace(/([a-zA-Z0-9_\\^{}()+\-/*=<>≤≥\s.,]+(?:\\mathrm|\\frac|\\sqrt|\\times|\\cdot|\\sin|\\cos|\\tan|\\theta|\\mu)[a-zA-Z0-9_\\^{}()+\-/*=<>≤≥\s.,]*)/g, (match) => {
           let trimmed = match.trim();
           if (trimmed.length < 2) return match;
           let prefix = match.substring(0, match.indexOf(trimmed));
           let suffix = match.substring(match.indexOf(trimmed) + trimmed.length);
           return prefix + '$' + trimmed + '$' + suffix;
        });
        newOpt = newOpt.replace(/\$\$/g, '$');
        newOpt = newOpt.replace(/\$ \$/g, ' ');
        return newOpt;
      }
      return opt;
    });
  }

  // Fix explanation
  if (q.explanation) {
    q.explanation = q.explanation
      .replace(/\\mathrm\{N\}/g, 'N')
      .replace(/\\mathrm\{m\}/g, 'm')
      .replace(/\\mathrm\{cm\}/g, 'cm')
      .replace(/\\mathrm\{kg\}/g, 'kg');

    q.explanation = q.explanation.replace(/【参考答案】:\s*([^\n]+)/g, (match, p1) => {
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

    q.explanation = q.explanation.replace(/(?<!\$)([A-Za-z0-9_\\^{}()+\-/*.,]+(?:\s*[=<>≤≥]|\\implies|\\times|\\cdot|\\frac|\\sqrt|\\sin|\\cos|\\tan)[A-Za-z0-9_\\^{}()+\-/*.,\s]*)(?!\$)/g, (match) => {
      let trimmed = match.trim();
      if (trimmed.length < 3 || trimmed === '\\implies' || trimmed.match(/^[a-zA-Z]+$/)) return match;
      if (trimmed.includes('http') || trimmed.includes('![image]')) return match;
      
      let prefix = match.substring(0, match.indexOf(trimmed));
      let suffix = match.substring(match.indexOf(trimmed) + trimmed.length);
      return prefix + '$' + trimmed + '$' + suffix;
    });

    q.explanation = q.explanation.replace(/\$\$/g, '$');
    q.explanation = q.explanation.replace(/\$([^$]+)\$/g, (match, inner) => {
      return match;
    });
    q.explanation = q.explanation.replace(/\$ \$/g, ' ');
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Done fix_all!');
