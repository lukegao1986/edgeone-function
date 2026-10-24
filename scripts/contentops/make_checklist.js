#!/usr/bin/env node
/**
 * make_checklist.js — S5 发布层：生成 G4 发布前检查清单（设计文档 §8.4）
 *
 * 用法：
 *   node scripts/contentops/make_checklist.js <topicId>
 *   node scripts/contentops/make_checklist.js --all
 *
 * 八条检查里 1–6 脚本可自动判，7 靠 published.json 指纹比对，8 靠 linkedSlug + 博客产物
 * 产出：packages/<topicId>/checklist.md（发布前 60 秒过一遍，人工只勾选 7/8）
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { pkgFile, packageDir, exists, listPackages } = require('./lib/paths');
const W = require('./lib/redwords');
const { C } = require('./lib/pre');

const LINK_RE = /(https?:\/\/|www\.|二维码|扫码|加微|\+v|微信[:：]|vx[:：]|公众号[:：])/i;

function readIf(p) { return exists(p) ? fs.readFileSync(p, 'utf8') : ''; }

function build(topicId) {
  const dir = packageDir(topicId);
  const xhs = readIf(pkgFile(topicId, '02_xhs.md'));
  const briefRaw = readIf(pkgFile(topicId, '04_brief.json'));
  const brief = briefRaw ? JSON.parse(briefRaw) : {};
  const factRaw = readIf(pkgFile(topicId, '05_factcheck.json'));

  const assetDir = path.join(dir, 'assets');
  const covers = fs.existsSync(assetDir)
    ? fs.readdirSync(assetDir).filter((f) => /^cover-.*\.png$/.test(f))
    : [];

  const tags = (xhs.match(/#[^\s#、,，]+/g) || []);
  const titles = (xhs.match(/^\s*(?:\d+[.、)]|[-*])\s*(.+?)\s*$/gm) || []).map((s) => s.replace(/^\s*(?:\d+[.、)]|[-*])\s*/, ''));
  const maxTitle = titles.reduce((m, t) => Math.max(m, t.replace(/[\s*`>#-]/g, '').length), 0);

  const items = [];
  const push = (n, name, ok, note) => items.push({ n, name, ok, note });

  // 1 无外链
  push(1, '无外链 / 二维码 / 微信号', !LINK_RE.test(xhs), LINK_RE.test(xhs) ? '检测到疑似导流字样，删掉' : '正文干净');

  // 2 无承诺表述
  const promiseHits = W.PROMISE.filter((w) => xhs.includes(w));
  push(2, '无承诺性表述', !promiseHits.length, promiseHits.length ? '命中：' + promiseHits.join('、') : '无');

  // 3 数据有源 + 免责句
  const sens = W.SENSITIVE_FACT.filter((w) => xhs.includes(w));
  const hasDisc = W.DISCLAIMER.some((w) => xhs.includes(w));
  push(3, '数据有源且带免责句', !sens.length || hasDisc,
    sens.length ? (hasDisc ? '含高危事实词，免责句已就位，务必核对官网' : '含' + sens.join('、') + '但缺免责句') : '无高危事实词');

  // 4 标题 ≤ 20
  push(4, '标题 ≤ 20 字', titles.length === 0 || maxTitle <= W.TITLE_MAX,
    titles.length ? `最长 ${maxTitle} 字（共 ${titles.length} 条候选）` : '未解析到标题候选，人工确认');

  // 5 标签 8–12
  push(5, `标签 ${W.TAG_RANGE[0]}–${W.TAG_RANGE[1]} 个`, tags.length >= W.TAG_RANGE[0] && tags.length <= W.TAG_RANGE[1],
    `${tags.length} 个`);

  // 6 封面存在 + 钩子行
  push(6, '封面已渲染且钩子行就位', covers.length > 0 && !!brief.hook,
    `封面 ${covers.length} 张｜钩子行「${brief.hook || '（缺失）'}」`);

  // 7 首图不撞车（近 30 天）
  const pubFile = path.join(__dirname, '..', '..', 'content-ops', 'data', 'published.json');
  let collision = null;
  if (fs.existsSync(pubFile)) {
    const pub = JSON.parse(fs.readFileSync(pubFile, 'utf8'));
    const cutoff = Date.now() - 30 * 864e5;
    const key = String(brief.title || topicId).replace(/[\s\p{P}]/gu, '');
    collision = pub.find((p) => {
      if (!p.publishedAt || new Date(p.publishedAt).getTime() < cutoff) return false;
      const k = String(p.标题 || p.title || '').replace(/[\s\p{P}]/gu, '');
      return k && (k === key || (k.length > 4 && key.includes(k.slice(0, 5))));
    });
  }
  push(7, '首图与近 30 天不撞车', !collision,
    collision ? `疑似撞车：${collision.标题 || collision.title}` : (fs.existsSync(pubFile) ? '未撞车' : 'published.json 缺失，需人工比对'));

  // 8 长文已上线（产物路径：blog/posts/<slug>.html）
  const slug = brief.linkedSlug || brief.关联slug || '';
  const blogOut = slug ? path.join(__dirname, '..', '..', 'blog', 'posts', slug + '.html') : '';
  const srcMd = slug ? path.join(__dirname, '..', '..', 'blog-src', slug + '.md') : '';
  const staged = !!slug && fs.existsSync(srcMd);
  push(8, '长文已上线（引流有落点）', !!slug && fs.existsSync(blogOut),
    slug ? (fs.existsSync(blogOut) ? `blog/posts/${slug}.html 已生成`
      : staged ? `源已入库 blog-src/${slug}.md，待 build + push`
      : `slug=${slug} 尚未入库，先跑 publish_blog`) : '未填 linkedSlug，引流会落空');

  return { topicId, items, covers, factRaw };
}

function render(r) {
  const fail = r.items.filter((i) => !i.ok);
  console.log(C.bold(`\nG4 检查清单 · ${r.topicId}`));
  for (const i of r.items) {
    console.log(`  ${i.ok ? C.green('✓') : C.red('✗')} ${i.n}. ${i.name}  ${C.dim(i.note)}`);
  }
  console.log(fail.length ? C.red(`\n  ${fail.length} 项未过，发布前必须处理`) : C.green('\n  全部通过，可发布'));

  const md = [
    `# G4 发布前检查清单 · ${r.topicId}`,
    '',
    `生成时间：${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
    '',
    '| # | 检查项 | 状态 | 说明 |',
    '| - | --- | --- | --- |',
    ...r.items.map((i) => `| ${i.n} | ${i.name} | ${i.ok ? '✅' : '❌'} | ${i.note} |`),
    '',
    fail.length ? `> ⚠ ${fail.length} 项未通过，处理完再发。` : '> 全部通过。',
    '',
    '人工复核（脚本判不了）：',
    '- [ ] 封面缩略图下不错字、主色与品类一致',
    '- [ ] 正文读一遍，像人话',
    '- [ ] 评论区准备好置顶引导（只说「搜 EJU Pro」，不贴链接）',
    '',
  ].join('\n');

  const out = pkgFile(r.topicId, 'checklist.md');
  fs.writeFileSync(out, md, 'utf8');
  console.log(C.dim(`  → ${out}`));
}

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length) { console.log('用法: node scripts/contentops/make_checklist.js <topicId> | --all'); process.exit(2); }
  const ids = argv.includes('--all') ? listPackages() : argv.filter((a) => !a.startsWith('--'));
  if (!ids.length) { console.log('没有内容包'); process.exit(2); }
  let bad = 0;
  for (const id of ids) { const r = build(id); render(r); bad += r.items.filter((i) => !i.ok).length; }
  process.exit(bad ? 1 : 0);
}

main();
