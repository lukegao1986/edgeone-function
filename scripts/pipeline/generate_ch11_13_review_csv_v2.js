const fs = require('fs');
const path = require('path');

const chapters = [11, 12, 13];
const baseDir = path.join(process.cwd(), 'docs/0 数据准备/Charpter 1-30');
// 增加 v2 版本号
const outCsvPath = path.join(process.cwd(), 'docs/Topic_Review_Reports/Chapter11_13_Topics_Review_Detailed_v2.csv');

function checkUnclosedDollar(text) {
  if (!text) return false;
  const matches = text.match(/(?<!\\)\$/g);
  return matches && matches.length % 2 !== 0;
}

function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const rows = [];
// 写入表头
rows.push(['businessCode', '概要', 'topicCode', '人工意见', 'subtopicCodes', 'options检查结果', 'explanation检查结果'].map(escapeCSV).join(','));

chapters.forEach(ch => {
  const jsonPath = path.join(baseDir, `charpter${ch}`, `phy_2_chapter${ch}_questions.json`);
  if (!fs.existsSync(jsonPath)) return;
  
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  data.forEach(q => {
    const businessCode = q.businessCode || '';
    const stem = q.stem || '';
    const summary = stem.substring(0, 100).replace(/\n/g, ' ');
    const topicCode = q.topicCode || '';
    const subtopicCodes = (q.subtopicCodes || []).join(';');
    
    // options 检查
    let optionsStatus = [];
    if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
      if (q.options && q.options.length === 1 && q.options[0].includes(';')) {
        optionsStatus.push('仅1个选项但包含分号(可能未切分)');
      } else {
        optionsStatus.push('选项不完整(少于2个)');
      }
    } else {
      const uniqueOpts = new Set(q.options);
      if (uniqueOpts.size < q.options.length) {
        optionsStatus.push('存在重复选项');
      }
    }
    
    let hasDollarIssue = false;
    if (q.options && Array.isArray(q.options)) {
        q.options.forEach(opt => {
            if (checkUnclosedDollar(opt)) {
                hasDollarIssue = true;
            }
        });
    }
    if (hasDollarIssue) {
        optionsStatus.push('存在乱码($未闭合)');
    }
    
    // explanation 检查
    let expStatus = [];
    if (q.explanation === undefined || q.explanation === 'undefined' || (typeof q.explanation === 'string' && q.explanation.includes('undefined'))) {
        expStatus.push('包含undefined或为空');
    }
    if (checkUnclosedDollar(q.explanation)) {
        expStatus.push('存在乱码($未闭合)');
    }
    
    rows.push([
      businessCode,
      summary,
      topicCode,
      '', // 人工意见清空供后续使用
      subtopicCodes,
      optionsStatus.length > 0 ? optionsStatus.join('，') : '正常',
      expStatus.length > 0 ? expStatus.join('，') : '正常'
    ].map(escapeCSV).join(','));
  });
});

// 确保目录存在
const outDir = path.dirname(outCsvPath);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(outCsvPath, rows.join('\n'), 'utf8');
console.log(`生成检查结果 CSV 完成: ${outCsvPath}`);