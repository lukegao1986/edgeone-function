const fs = require('fs');
const file = '/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/charpter 2-10/final_questions_v5_section_1-1-2_fixed.json';
let content = fs.readFileSync(file, 'utf8');

// replace any number of backslashes followed by times with exactly two backslashes and times
content = content.replace(/\\+times/g, '\\\\times');

fs.writeFileSync(file, content);
console.log('Fixed backslashes for times');
