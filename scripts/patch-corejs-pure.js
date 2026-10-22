'use strict';

// core-js-pure@3.49 移除了下列模块，而 @pmmmwh/react-refresh-webpack-plugin 的
// client/utils/patchUrl.js 仍会 require，导致本地 H5 dev server 报 Module not found。
// 该分支仅在浏览器缺少 URL/URLSearchParams 时执行，H5 下运行时不触发，故用空实现补齐。

const fs = require('fs');
const path = require('path');

const MODULES = [
  'web.url-search-params.delete',
  'web.url-search-params.has',
  'web.url-search-params.size',
  'web.url.to-json',
];

const dir = path.join(__dirname, '..', 'node_modules', 'core-js-pure', 'modules');

if (!fs.existsSync(dir)) {
  console.log('[patch-corejs-pure] core-js-pure 未安装，跳过');
  process.exit(0);
}

const CONTENT = "'use strict';\nmodule.exports = function () {};\n";
let created = 0;

MODULES.forEach((name) => {
  const file = path.join(dir, `${name}.js`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, CONTENT);
    created += 1;
  }
});

console.log(`[patch-corejs-pure] 已补齐 ${created} 个缺失模块`);
