/**
 * 前置条件检查：所有 contentops 脚本统一用它声明依赖
 * 缺依赖时不静默失败，直接告诉 Luke 卡住了什么、怎么解
 */
'use strict';
const fs = require('fs');
const { execSync } = require('child_process');

const C = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function hasBin(name) {
  try { execSync(`command -v ${name}`, { stdio: 'ignore' }); return true; } catch { return false; }
}

function hasEnv(...names) {
  return names.every((n) => process.env[n] && String(process.env[n]).trim());
}

/**
 * @param {object} o
 * @param {string} o.name     脚本名
 * @param {string} o.purpose  职责一句话
 * @param {Array}  o.needs    [{ label, ok, fix }]
 * @param {Array}  [o.todo]   待接入的步骤
 * @returns {boolean} 全部满足返回 true
 */
function gate(o) {
  console.log(C.bold(`\n${o.name} — ${o.purpose}`));
  const needs = o.needs || [];
  const missing = needs.filter((n) => !n.ok);
  for (const n of needs) {
    console.log(`  ${n.ok ? C.green('✓') : C.red('✗')} ${n.label}${n.ok ? '' : C.red('  → ' + n.fix)}`);
  }
  if (o.todo && o.todo.length) {
    console.log(C.dim('\n  待接入：'));
    o.todo.forEach((t, i) => console.log(C.dim(`    ${i + 1}. ${t}`)));
  }
  if (missing.length) {
    console.log(C.yellow(`\n  ⚠ 缺少 ${missing.length} 项前置条件，本脚本暂不可运行。`));
    return false;
  }
  return true;
}

/** 加载项目 .env（不覆盖已有环境变量） */
function loadEnv(root) {
  const file = require('path').join(root, '.env');
  if (!fs.existsSync(file)) return false;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!m) continue;
    const k = m[1];
    const v = m[2].replace(/^['"]|['"]$/g, '');
    if (process.env[k] === undefined) process.env[k] = v;
  }
  return true;
}

module.exports = { C, hasBin, hasEnv, gate, loadEnv };
