#!/usr/bin/env node
/**
 * factcheck.js — S3 草案层的事实与合规自检（设计文档 §6.3）
 *
 * 用法：
 *   node scripts/contentops/factcheck.js <topicId>
 *   node scripts/contentops/factcheck.js <topicId> --json
 *   node scripts/contentops/factcheck.js --all
 *
 * 检查项：
 *   🔴 承诺词命中                → 阻断
 *   🔴 标题 > 20 字              → 阻断
 *   🔴 高危事实词（分数线/出愿）无免责句 → 阻断
 *   🟡 AI 味句式                 → 标黄，G2 必看
 *   🟡 孤立数字（无来源标记）      → 标黄，G2 必看
 *   🟡 正文 > 1000 字            → 标黄
 *   🟡 标签数不在 8–12           → 标黄
 *   🟡 标题候选不足 3 条          → 标黄
 *
 * 产出：packages/<topicId>/05_factcheck.json，并追加摘要到 99_review.md
 * 退出码：0 通过 / 1 存在阻断项 / 2 用法或文件错误
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { pkgFile, packageDir, exists, writeJSON, listPackages } = require('./lib/paths');
const W = require('./lib/redwords');

const C = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

/* ---------------- 解析 ---------------- */

/** 按 h1 标题把 markdown 切成 { 标题: 正文 } */
function splitSections(md) {
  const out = {};
  let cur = 'BODY';
  out[cur] = [];
  for (const line of md.split(/\r?\n/)) {
    const m = /^#{1,2}\s+(.+?)\s*$/.exec(line);
    if (m) { cur = m[1].trim(); out[cur] = out[cur] || []; continue; }
    out[cur].push(line);
  }
  for (const k of Object.keys(out)) out[k] = out[k].join('\n').trim();
  return out;
}

function pickSection(sec, names) {
  for (const n of names) {
    const hit = Object.keys(sec).find((k) => k.includes(n));
    if (hit && sec[hit]) return sec[hit];
  }
  return '';
}

function parseTitles(text) {
  if (!text) return [];
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    const m = /^\s*(?:\d+[.、)]|[-*])\s*(.+?)\s*$/.exec(line);
    if (m && m[1]) out.push(m[1]);
  }
  return out;
}

function parseTags(text) {
  if (!text) return [];
  const out = [];
  const re = /#([^\s#、,，]+)/g;
  let m;
  while ((m = re.exec(text))) if (m[1]) out.push('#' + m[1]);
  return out;
}

function countChars(s) {
  // 中文按 1 字算，去空白与 markdown 符号
  return s.replace(/[\s*`>#\-]/g, '').length;
}

/* ---------------- 检查器 ---------------- */

/** 词表匹配：/xxx/ 形式按正则处理，其余按字面量（自动转义） */
function findWords(text, list) {
  const hits = [];
  for (const w of list) {
    const isRe = w.length > 1 && w.startsWith('/') && w.endsWith('/');
    const src = isRe ? w.slice(1, -1) : w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = new RegExp(src).exec(text);
    if (m) hits.push({ word: isRe ? m[0] : w, at: m.index });
  }
  return hits;
}

function checkOrphanNumbers(body) {
  const blocks = body.split(/\n\s*\n|\n(?=\d+[.、])/).filter(Boolean);
  const flags = [];
  for (const b of blocks) {
    for (const { re, label } of W.NUMBER_PATTERNS) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(b))) {
        const hasSrc = W.SOURCE_TOKEN.some((t) => b.includes(t));
        if (!hasSrc) flags.push({ label, value: m[0], ctx: b.slice(Math.max(0, m.index - 24), m.index + 34).replace(/\n/g, ' ') });
      }
    }
  }
  return flags;
}

function checkSensitive(body) {
  const flags = [];
  const hits = findWords(body, W.SENSITIVE_FACT);
  if (hits.length) {
    const hasDisc = W.DISCLAIMER.some((t) => body.includes(t));
    if (!hasDisc) flags.push({ words: hits.map((h) => h.word).slice(0, 5) });
  }
  return flags;
}

/* ---------------- 主流程 ---------------- */

function checkOne(topicId) {
  const dir = packageDir(topicId);
  const xhsPath = pkgFile(topicId, '02_xhs.md');
  if (!exists(xhsPath)) return { topicId, error: '缺少 02_xhs.md' };

  const md = fs.readFileSync(xhsPath, 'utf8');
  const sec = splitSections(md);
  const titleSec = pickSection(sec, ['标题', '题目']);
  const bodySec = pickSection(sec, ['正文', '文案']) || sec.BODY || '';
  const tagSec = pickSection(sec, ['标签', '话题']);

  // 无小标题时，标题候选退化为空，正文取整篇
  const titles = parseTitles(titleSec);
  const body = bodySec || md;
  const tags = parseTags(tagSec || md);

  const issues = [];
  const add = (level, item, detail, fix) => issues.push({ level, item, detail, fix });

  // 🔴 承诺词
  const promise = findWords(md, W.PROMISE);
  if (promise.length) add('RED', '承诺性表述', promise.map((p) => p.word).join(' / '), '改写为定性描述，去掉绝对化与结果承诺');

  // 🔴 标题超长
  const long = titles.filter((t) => countChars(t) > W.TITLE_MAX);
  if (long.length) add('RED', '标题超长', long.map((t) => `${t}（${countChars(t)}字）`).join(' / '), `每条 ≤ ${W.TITLE_MAX} 字`);

  // 🔴 高危事实无免责
  const sens = checkSensitive(body);
  if (sens.length) add('RED', '高危事实无免责句', sens[0].words.join(' / '), '句尾补「以各校最新募集要項为准」之类免责句，并核对官网原文');

  // 🟡 AI 味
  const tone = [];
  for (const w of W.AI_TONE) {
    if (new RegExp(w).test(body)) tone.push(w);
  }
  if (tone.length) add('YELLOW', 'AI 味句式', tone.join(' / '), '整句改写，用你自己讲课时会说的话');

  // 🟡 孤立数字
  const nums = checkOrphanNumbers(body);
  if (nums.length) add('YELLOW', '孤立数字', nums.slice(0, 4).map((n) => `${n.label}「${n.value}」`).join(' / '), '标注来源，或改写为定性描述');

  // 🟡 正文超长
  const blen = countChars(body);
  if (blen > W.BODY_MAX) add('YELLOW', '正文超长', `${blen} 字（上限 ${W.BODY_MAX}）`, '砍到 3 个最有用的点');

  // 🟡 标签数
  if (tags.length && (tags.length < W.TAG_RANGE[0] || tags.length > W.TAG_RANGE[1]))
    add('YELLOW', '标签数量', `${tags.length} 个（建议 ${W.TAG_RANGE[0]}–${W.TAG_RANGE[1]}）`, '三层结构：大类 3 / 精准 3–4 / 长尾 4–6');

  // 🟡 标题候选不足
  if (titles.length < 3) add('YELLOW', '标题候选不足', `${titles.length} 条`, '补齐 3 条，便于测封面点击率');

  const blocked = issues.filter((i) => i.level === 'RED').length;
  return { topicId, titles, tags, bodyChars: blen, issues, blocked };
}

function render(res) {
  const L = res.blocked ? C.red('✗ 阻断') : (res.issues.length ? C.yellow('△ 通过（有标黄）') : C.green('✓ 通过'));
  console.log(`\n${C.bold(res.topicId)}  ${L}`);
  if (res.error) { console.log('  ' + C.red(res.error)); return; }
  console.log(`  标题 ${res.titles.length} 条 | 标签 ${res.tags.length} 个 | 正文 ${res.bodyChars} 字`);
  if (!res.issues.length) { console.log('  ' + C.dim('无问题项')); return; }
  for (const i of res.issues) {
    const tag = i.level === 'RED' ? C.red('🔴') : C.yellow('🟡');
    console.log(`  ${tag} ${i.item} — ${i.detail}`);
    console.log(`     ${C.dim('→ ' + i.fix)}`);
  }
}

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length) {
    console.log('用法: node scripts/contentops/factcheck.js <topicId> [--json] | --all');
    process.exit(2);
  }
  const asJson = argv.includes('--json');
  const ids = argv.includes('--all') ? listPackages() : argv.filter((a) => !a.startsWith('--'));

  if (!ids.length) { console.log('content-ops/packages/ 下没有内容包'); process.exit(2); }

  const results = ids.map(checkOne);
  if (!asJson) results.forEach(render);

  for (const r of results) {
    if (r.error) continue;
    writeJSON(pkgFile(r.topicId, '05_factcheck.json'), {
      topicId: r.topicId,
      checkedAt: new Date().toISOString(),
      blocked: r.blocked > 0,
      issues: r.issues,
    });
    const rv = pkgFile(r.topicId, '99_review.md');
    const line = `\n- [${new Date().toISOString().slice(0, 10)}] factcheck：${r.blocked ? '阻断 ' + r.blocked + ' 项' : '通过'}（标黄 ${r.issues.filter((i) => i.level === 'YELLOW').length} 项）\n`;
    fs.appendFileSync(rv, line);
  }

  if (asJson) console.log(JSON.stringify(results, null, 2));

  const totalBlocked = results.reduce((n, r) => n + (r.blocked || 0), 0);
  if (!asJson) {
    console.log(`\n合计 ${results.length} 个内容包，阻断项 ${totalBlocked} 处。${totalBlocked ? '改完再进 G2。' : '可进 G2 审批。'}`);
  }
  process.exit(totalBlocked ? 1 : 0);
}

main();
