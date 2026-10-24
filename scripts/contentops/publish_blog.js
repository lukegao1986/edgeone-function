#!/usr/bin/env node
/**
 * publish_blog.js — S5 发布层：01_blog.md → blog-src/ → 全量重建 → push（设计文档 §14）
 *
 * 用法：
 *   node scripts/contentops/publish_blog.js <topicId>            # 拷贝 + 校验 + 全量重建
 *   node scripts/contentops/publish_blog.js <topicId> --push     # 顺带 git commit + push
 *   node scripts/contentops/publish_blog.js --all
 *
 * 纪律（与《博客系统技术方案》§7.2 六条一致，违反即中止）：
 *   1. slug 不可变（已存在同名 slug 则拒绝覆盖）
 *   2. 正文存原始 Markdown
 *   3. 图片一律 COS 绝对 URL（检测到相对路径即报错）
 *   4. 分类存 code（japanese/math2/bunso/physics/mind/school）
 *   5. pv/uv 不进 front matter
 *   6. date / updated 分离
 *
 * 注意：博客必须全量重建——上下篇、相关推荐、热门榜都依赖全站数据
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { P, pkgFile, exists } = require('./lib/paths');
const { C } = require('./lib/pre');

// 与 scripts/blog/render.js 的 CATEGORIES 保持一致
const CAT_CODES = ['guide', 'japanese', 'math1', 'math2', 'bunso', 'physics', 'chemistry', 'biology', 'mind', 'school'];

function parseFrontMatter(md) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(md);
  if (!m) return { fm: {}, body: md, raw: '' };
  const fm = {};
  let key = null;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(line);
    if (kv) { key = kv[1]; fm[key] = kv[2].trim(); }
    else if (/^\s*-\s+/.test(line) && key) {
      if (!Array.isArray(fm[key])) fm[key] = fm[key] ? [fm[key]] : [];
      fm[key].push(line.replace(/^\s*-\s+/, '').trim());
    }
  }
  return { fm, body: m[2], raw: m[1] };
}

function validate(fm, body, slug) {
  const errs = [];
  if (!fm.slug) errs.push('front matter 缺 slug');
  else if (fm.slug !== slug) errs.push(`slug 与文件名不一致：${fm.slug} vs ${slug}`);
  if (!fm.title) errs.push('缺 title');
  if (!CAT_CODES.includes(String(fm.cat))) errs.push(`cat 必须是 ${CAT_CODES.join('/')} 之一，当前 ${fm.cat}`);
  if (!fm.date) errs.push('缺 date');
  if (!fm.updated) errs.push('缺 updated（date 与 updated 必须分离）');
  if (fm.pv !== undefined || fm.uv !== undefined) errs.push('pv/uv 不得写进 front matter');
  const relImg = /!\[[^\]]*\]\((?!https?:)([^)]+)\)/.exec(body);
  if (relImg) errs.push(`图片必须是 COS 绝对 URL，发现相对路径：${relImg[1]}（先跑 upload_assets.js）`);
  // 正文允许行内 HTML（<p> / <strong> / <div class="formula"> 是现有文章的既有写法），
  // 但不允许把「渲染后的整页 HTML」存进来
  if (/<!DOCTYPE|<html[\s>]|<body[\s>]|<head[\s>]/i.test(body)) errs.push('存的是渲染后的 HTML 页面，必须存原始 Markdown 源');
  if (/<script|onclick=|javascript:/i.test(body)) errs.push('正文含脚本或事件属性，有安全风险');
  if ((body.replace(/\s/g, '').length) < 1500) errs.push(`正文过短（${body.replace(/\s/g, '').length} 字，长文要求 2500–4000）`);
  return errs;
}

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length) {
    console.log('用法: node scripts/contentops/publish_blog.js <topicId> [--push] | --all [--push]');
    process.exit(2);
  }
  const doPush = argv.includes('--push');
  let ids = argv.filter((a) => !a.startsWith('--'));
  if (argv.includes('--all')) {
    ids = fs.readdirSync(P.PACKAGES, { withFileTypes: true })
      .filter((d) => d.isDirectory()).map((d) => d.name)
      .filter((id) => exists(pkgFile(id, '01_blog.md')));
  }

  let moved = 0, failed = 0;
  for (const id of ids) {
    const src = pkgFile(id, '01_blog.md');
    if (!exists(src)) { console.log(C.dim(`  − ${id} 无 01_blog.md，跳过`)); continue; }
    const md = fs.readFileSync(src, 'utf8');
    const { fm, body } = parseFrontMatter(md);
    const slug = fm.slug || id;
    const dst = path.join(P.BLOG_SRC, slug + '.md');

    console.log(C.bold(`\n${id} → blog-src/${slug}.md`));
    if (fs.existsSync(dst)) {
      console.log(C.red(`  ✗ slug 已存在，拒绝覆盖（纪律 1：slug 不可变）`));
      console.log(C.dim('    要改内容就改源文件内容，不要换 slug'));
      failed++; continue;
    }

    const errs = validate(fm, body, slug);
    if (errs.length) {
      errs.forEach((e) => console.log(C.red('  ✗ ' + e)));
      failed++; continue;
    }

    fs.writeFileSync(dst, md, 'utf8');
    console.log(C.green('  ✓ 已写入 blog-src'));
    moved++;
  }

  if (!moved) { console.log('\n没有新文章入库，跳过重建'); process.exit(failed ? 1 : 0); }

  console.log(C.bold('\n全量重建静态博客'));
  execSync(`node "${P.BLOG_BUILD}"`, { stdio: 'inherit', cwd: P.ROOT });

  if (doPush) {
    console.log(C.bold('\n提交并推送'));
    const slugs = ids.join(', ');
    execSync('git add blog-src blog blog-data', { stdio: 'inherit', cwd: P.ROOT });
    execSync(`git commit -m "blog: 新增 ${slugs}"`, { stdio: 'inherit', cwd: P.ROOT });
    execSync('git push', { stdio: 'inherit', cwd: P.ROOT });
    console.log(C.green('  ✓ 已 push，EdgeOne 会自动构建'));
  } else {
    console.log(C.dim('\n未推送。确认无误后跑：git add blog-src blog && git commit && git push'));
  }
}

main();
