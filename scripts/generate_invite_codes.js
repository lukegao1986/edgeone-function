#!/usr/bin/env node
/**
 * scripts/generate_invite_codes.js — 批量生成注册邀请码（一次性、幂等）
 *
 * 用法:
 *   node scripts/generate_invite_codes.js                          # 默认 100 个，batch=当天
 *   node scripts/generate_invite_codes.js --count 200 --batch batch-2026-10-19
 *
 * 说明: 码为 8 位大写（剔除 I/O/0/1 易混字符）；INSERT IGNORE 保证幂等，
 *       已存在的码不会重复插入。不打印任何连接凭证。
 */
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const ROOT = path.resolve(__dirname, '..');
const UPLOADER = path.join(ROOT, 'scripts/uploader/upload.js');
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function parseArgs(argv) {
  const arg = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      arg[key] = argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[i + 1] : true;
      if (arg[key] !== true) i++;
    }
  }
  return arg;
}

// 静默读取 upload.js 的 dbConfig（不打印任何凭证）
function loadDbConfigQuiet() {
  const s = fs.readFileSync(UPLOADER, 'utf8');
  const m = s.match(/const dbConfig\s*=\s*({[\s\S]*?});/);
  if (!m) throw new Error('upload.js 中未找到 dbConfig 字面量');
  return new Function(`return (${m[1]});`)();
}

function genCode(len = 8) {
  let s = '';
  for (let i = 0; i < len; i++) s += CHARS[crypto.randomInt(CHARS.length)];
  return s;
}

async function main() {
  const args = parseArgs(process.argv);
  const count = parseInt(args.count || '100', 10);
  const batch = args.batch || `batch-${new Date().toISOString().slice(0, 10)}`;

  const uniq = new Set();
  while (uniq.size < count) uniq.add(genCode());
  const codes = [...uniq];

  const cfg = loadDbConfigQuiet();
  const conn = await mysql.createConnection(Object.assign({}, cfg, { connectTimeout: 20000 }));

  let inserted = 0;
  const MAX = 100;
  for (let i = 0; i < codes.length; i += MAX) {
    const chunk = codes.slice(i, i + MAX);
    const ph = chunk.map(() => '(?, ?)').join(',');
    const [res] = await conn.query(
      `INSERT IGNORE INTO invite_codes (code, batch) VALUES ${ph}`,
      chunk.flatMap((c) => [c, batch])
    );
    inserted += res.affectedRows;
  }
  await conn.end();

  console.log(`批次: ${batch} | 请求生成: ${count} | 实际新插入: ${inserted} | 库总邀请码: (含历史)`);
  console.log('------- 邀请码清单 -------');
  for (const c of codes) console.log(c);
}

main().catch((e) => {
  console.error('生成失败:', e.message);
  process.exit(1);
});