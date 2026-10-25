#!/usr/bin/env node
/**
 * archive_drafts.js — 草稿归档巡检：清理超期未发布的笔记草稿，避免占空间
 *
 * 判定「可归档」的两个必要条件（同时满足）：
 *   1. 未发布 —— 00_topic.json.level != "已发布"，且 linkedSlug 在 blog-src/ 里不存在
 *   2. 超期   —— 包内文件最后一次被修改距今 > --days 天（默认 30）
 *
 * 已发布的一律不碰（那是资产，不是草稿）。
 *
 * 用法：
 *   node scripts/contentops/archive_drafts.js                      # 只看报告，不动文件（默认 dry-run）
 *   node scripts/contentops/archive_drafts.js --days 60            # 改超期阈值
 *   node scripts/contentops/archive_drafts.js --apply              # 真的归档 → content-ops/_archive/YYYY-MM/
 *   node scripts/contentops/archive_drafts.js --apply --drop-images # 只删渲染图（保留全部文字），包留在原地
 *   node scripts/contentops/archive_drafts.js --json
 *
 * 归档不是删除：整包移动到 content-ops/_archive/<YYYY-MM>/<topicId>/，随时可搬回来。
 * 需要连图片一起瘦身时用 --drop-images（PNG 由 templates + 04_brief.json 可一键重建，已在 .gitignore）。
 *
 * 退出码：0 正常（含无可归档项）/ 2 用法错误
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { P, pkgFile, packageDir, exists, readJSON, listPackages } = require('./lib/paths');

const C = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function kb(bytes) { return `${(bytes / 1024).toFixed(0)} KB`; }
function mb(bytes) { return `${(bytes / 1024 / 1024).toFixed(1)} MB`; }

/** 递归统计目录大小与最新 mtime */
function walk(dir, acc = { size: 0, newest: 0, files: 0 }) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const st = fs.statSync(p);
    if (e.isDirectory()) { walk(p, acc); continue; }
    acc.size += st.size; acc.files += 1;
    if (st.mtimeMs > acc.newest) acc.newest = st.mtimeMs;
  }
  return acc;
}

/** 是否已发布：level 标记 或 长文已进 blog-src */
function isPublished(t, topicId) {
  if (!t) return false;
  if (String(t.level || '') === '已发布') return true;
  const slug = t.linkedSlug || t['关联slug'];
  if (slug && exists(path.join(P.BLOG_SRC, `${slug}.md`))) return true;
  return false;
}

function scan(opts) {
  const rows = [];
  for (const id of listPackages()) {
    const dir = packageDir(id);
    const stat = walk(dir);
    const t = exists(pkgFile(id, '00_topic.json')) ? readJSON(pkgFile(id, '00_topic.json')) : null;
    const published = isPublished(t, id);
    const lastMs = stat.newest || fs.statSync(dir).mtimeMs;
    const ageDays = Math.floor((Date.now() - lastMs) / 86400000);
    const created = (t && (t.createdAt || t.date)) || null;

    const assetDir = path.join(dir, 'assets');
    let imgBytes = 0, imgCount = 0;
    if (exists(assetDir)) {
      for (const f of fs.readdirSync(assetDir)) {
        if (!/\.(png|jpg|jpeg)$/i.test(f)) continue;
        imgBytes += fs.statSync(path.join(assetDir, f)).size;
        imgCount += 1;
      }
    }

    rows.push({
      topicId: id,
      title: (t && (t.title || t.标题)) || '',
      level: (t && t.level) || '（无 level）',
      published,
      ageDays,
      lastModified: new Date(lastMs).toISOString().slice(0, 10),
      created: created || '—',
      sizeBytes: stat.size,
      imgCount,
      imgBytes,
      stale: !published && ageDays > opts.days,
    });
  }
  rows.sort((a, b) => b.ageDays - a.ageDays);
  return rows;
}

function archiveOne(row, opts) {
  const src = packageDir(row.topicId);
  if (opts.dropImages) {
    const assetDir = path.join(src, 'assets');
    if (!exists(assetDir)) return { ...row, action: 'no-images', freed: 0 };
    let freed = 0;
    for (const f of fs.readdirSync(assetDir)) {
      if (!/\.(png|jpg|jpeg)$/i.test(f)) continue;
      const p = path.join(assetDir, f);
      freed += fs.statSync(p).size;
      fs.unlinkSync(p);
    }
    return { ...row, action: 'dropped-images', freed };
  }
  const ym = today().slice(0, 7);
  const destDir = path.join(P.CONTENT_OPS, '_archive', ym);
  const dest = path.join(destDir, row.topicId);
  fs.mkdirSync(destDir, { recursive: true });
  if (exists(dest)) return { ...row, action: 'skip-exists', freed: 0 };
  fs.renameSync(src, dest);
  return { ...row, action: 'archived', freed: row.sizeBytes, dest: path.relative(P.ROOT, dest) };
}

function logArchive(results, opts) {
  const f = path.join(P.CONTENT_OPS, 'ARCHIVE.md');
  const L = [];
  L.push(`# 草稿归档日志`);
  L.push('');
  L.push(`> 最近一次巡检：${today()}　｜　阈值 > ${opts.days} 天未动且未发布　｜　模式：${opts.apply ? (opts.dropImages ? '删图保留文字' : '整包归档') : '仅报告'}`);
  L.push('');
  L.push('| 日期 | topicId | 标题 | 停留天数 | 动作 | 释放 |');
  L.push('| --- | --- | --- | --- | --- | --- |');
  const prev = exists(f) ? fs.readFileSync(f, 'utf8') : '';
  const oldRows = prev.split('\n').filter((l) => l.startsWith('| 20') && !l.startsWith('| 日期'));
  for (const r of results) {
    L.push(`| ${today()} | \`${r.topicId}\` | ${r.title || '—'} | ${r.ageDays} | ${r.action} | ${r.freed ? kb(r.freed) : '—'} |`);
  }
  L.push(...oldRows.slice(0, 200));
  L.push('');
  L.push('> 归档目录：`content-ops/_archive/<YYYY-MM>/`，整包保留，随时可搬回 `packages/`。');
  L.push('> 图片由 `content-ops/templates` + 各包 `04_brief.json` 可一键重建：`node scripts/contentops/render_covers.js <topicId>`');
  L.push('');
  fs.writeFileSync(f, L.join('\n'), 'utf8');
}

function main() {
  const argv = process.argv.slice(2);
  const days = Number(argv.includes('--days') ? argv[argv.indexOf('--days') + 1] : 30);
  if (!Number.isFinite(days) || days < 0) { console.error(C.red('--days 必须是 ≥0 的整数')); process.exit(2); }
  const opts = {
    days,
    apply: argv.includes('--apply'),
    dropImages: argv.includes('--drop-images'),
    json: argv.includes('--json'),
  };

  const rows = scan(opts);
  const stale = rows.filter((r) => r.stale);
  const totalStaleBytes = stale.reduce((s, r) => s + r.sizeBytes, 0);
  const staleImgBytes = stale.reduce((s, r) => s + r.imgBytes, 0);

  if (opts.json) {
    console.log(JSON.stringify({ days, apply: opts.apply, stale, all: rows, totalStaleBytes }, null, 2));
    return;
  }

  console.log(C.bold(`\n草稿归档巡检　阈值：停留 > ${days} 天且未发布　模式：${opts.apply ? (opts.dropImages ? '删图保留文字（已执行）' : '整包归档（已执行）') : '仅报告（加 --apply 才动手）'}\n`));

  for (const r of rows) {
    const flag = r.published ? C.green('已发布') : r.stale ? C.yellow(`超期 ${r.ageDays}d`) : C.dim(`${r.ageDays}d`);
    console.log(`  ${flag.padEnd(16)} ${r.topicId.padEnd(24)} ${(r.title || '—').slice(0, 24).padEnd(26)} 图${String(r.imgCount).padStart(2)}张/${kb(r.imgBytes).padStart(8)}　合计 ${kb(r.sizeBytes).padStart(8)}`);
  }

  console.log('');
  if (!stale.length) {
    console.log(C.green(`  ✓ 没有超期草稿。共 ${rows.length} 个包，其中已发布 ${rows.filter((r) => r.published).length} 个（永不归档）。`));
  } else {
    console.log(C.yellow(`  ⚠ ${stale.length} 个包可归档，合计 ${mb(totalStaleBytes)}（其中图片 ${mb(staleImgBytes)}）：`));
    stale.forEach((r) => console.log(`      · ${r.topicId}　${r.title}　停留 ${r.ageDays} 天　${kb(r.sizeBytes)}`));
    if (!opts.apply) {
      console.log(C.dim(`\n  仅报告，未改动任何文件。执行清理：`));
      console.log(C.dim(`    node scripts/contentops/archive_drafts.js --apply --drop-images   # 推荐：只删图，文字全留`));
      console.log(C.dim(`    node scripts/contentops/archive_drafts.js --apply                 # 整包移到 _archive/`));
    }
  }

  if (opts.apply && stale.length) {
    console.log('');
    const results = stale.map((r) => archiveOne(r, opts));
    let freed = 0;
    for (const r of results) {
      freed += r.freed || 0;
      const tag = r.action === 'archived' ? C.green('已归档') : r.action === 'dropped-images' ? C.green('已删图') : C.dim('跳过');
      console.log(`  ${tag}　${r.topicId}　释放 ${kb(r.freed || 0)}${r.dest ? ` → ${r.dest}` : ''}`);
    }
    logArchive(results, opts);
    console.log(C.green(`\n  共释放 ${mb(freed)}。日志：content-ops/ARCHIVE.md`));
  } else if (opts.apply) {
    logArchive([], opts);
  }
  console.log('');
}

main();
