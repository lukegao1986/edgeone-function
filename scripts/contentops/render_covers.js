#!/usr/bin/env node
/**
 * render_covers.js — S4 制作层：封面与内页批量渲染（设计文档 §7.1）
 *
 * 用法：
 *   node scripts/contentops/render_covers.js <topicId>              # 按 brief 的 layout / intent 渲染
 *   node scripts/contentops/render_covers.js <topicId> --layouts A,B # 指定版式（A/B 测封面点击率）
 *   node scripts/contentops/render_covers.js <topicId> --all-layouts # 五套全出
 *   node scripts/contentops/render_covers.js --list                  # 打印版式注册表
 *
 * 输入：content-ops/packages/<topicId>/04_brief.json
 * 输出：content-ops/packages/<topicId>/assets/cover-<版式>.png（1080×1440）
 *       content-ops/packages/<topicId>/assets/manifest.json
 *
 * 渲染后端：优先 Playwright（未装也能跑），自动回退本机 Chrome headless
 * 可用环境变量覆盖后端：CONTENTOPS_RENDERER=playwright|chrome
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { P, packageDir, pkgFile, readJSON, writeJSON, exists } = require('./lib/paths');

const C = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const REG = readJSON(P.REGISTRY);
const { width: W, height: H } = REG.canvas;

const CHROME_BIN =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/* ---------------- 组装 HTML ---------------- */

function inlineAssets(html) {
  const css = fs.readFileSync(path.join(P.TEMPLATES, '_base.css'), 'utf8');
  const helper = fs.readFileSync(path.join(P.TEMPLATES, '_render.js'), 'utf8');
  return html
    .replace('<!--BASE_CSS-->', `<style>\n${css}\n</style>`)
    .replace('<!--HELPER-->', `<script>\n${helper}\n</script>`);
}

/** 注入 brief（必须在 HELPER 之前，故替换后再调整顺序不依赖位置，靠 window 全局） */
function compose(templateFile, brief) {
  const raw = fs.readFileSync(templateFile, 'utf8');
  const json = JSON.stringify(brief).replace(/</g, '\\u003c');
  return inlineAssets(raw).replace(
    '<!--BRIEF-->',
    `<script>window.__BRIEF__=${json};</script>`
  );
}

/* ---------------- 渲染后端 ---------------- */

function hasPlaywright() {
  if (process.env.CONTENTOPS_RENDERER === 'chrome') return false;
  try { require.resolve('playwright'); return true; } catch { return false; }
}

async function renderWithPlaywright(htmlFile, outPng) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    await page.goto('file://' + htmlFile, { waitUntil: 'load' });
    await page.waitForFunction("document.body.dataset.ready === '1'", null, { timeout: 10000 });
    await page.screenshot({ path: outPng, clip: { x: 0, y: 0, width: W, height: H } });
  } finally {
    await browser.close();
  }
}

function renderWithChrome(htmlFile, outPng) {
  if (!fs.existsSync(CHROME_BIN)) {
    throw new Error(`找不到 Chrome：${CHROME_BIN}。设置 CHROME_PATH，或安装 Playwright：npm i -D playwright && npx playwright install chromium`);
  }
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'eju-chrome-'));
  const args = [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--disable-extensions', '--no-first-run',
    `--user-data-dir=${profile}`,
    `--window-size=${W},${H}`,
    '--default-background-color=FFFFFFFF',
    '--virtual-time-budget=3000',
    `--screenshot=${outPng}`,
    'file://' + htmlFile,
  ];
  try {
    execFileSync(CHROME_BIN, args, { stdio: 'pipe', timeout: 60000 });
  } finally {
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  }
  if (!fs.existsSync(outPng)) throw new Error('Chrome 未产出截图，尝试 --headless 旧模式或改用 Playwright');
}

async function renderOne(htmlFile, outPng, backend) {
  fs.mkdirSync(path.dirname(outPng), { recursive: true });
  if (backend === 'playwright') await renderWithPlaywright(htmlFile, outPng);
  else renderWithChrome(htmlFile, outPng);
}

/* ---------------- 版式解析 ---------------- */

function resolveLayouts(brief, flagLayouts, allFlag) {
  if (allFlag) return Object.keys(REG.layouts);
  if (flagLayouts) return flagLayouts.split(',').map((s) => s.trim().toUpperCase()).filter((s) => REG.layouts[s]);
  if (Array.isArray(brief.layouts) && brief.layouts.length) return brief.layouts.map((s) => String(s).toUpperCase());
  if (brief.layout) return [String(brief.layout).toUpperCase()];
  const intent = String(brief.intent || '').trim();
  return [REG.defaultLayoutByIntent[intent] || REG.fallbackLayout];
}

function validate(brief, layout) {
  const def = REG.layouts[layout];
  if (!def) return [`未知版式 ${layout}`];
  const miss = [];
  for (const f of def.required || []) {
    const v = f.split('.').reduce((o, k) => (o == null ? undefined : o[k]), brief);
    if (v == null || v === '' || (Array.isArray(v) && !v.length)) miss.push(f);
  }
  return miss;
}

/* ---------------- 主流程 ---------------- */

async function main() {
  const argv = process.argv.slice(2);
  if (!argv.length || argv.includes('-h')) {
    console.log('用法: node scripts/contentops/render_covers.js <topicId> [--layouts A,B] [--all-layouts] | --list');
    process.exit(2);
  }

  if (argv.includes('--list')) {
    console.log(C.bold('版式注册表'));
    for (const [k, v] of Object.entries(REG.layouts)) {
      console.log(`  ${k}  ${v.name.padEnd(5, '　')} ${v.use}`);
      console.log(`     ${C.dim('必填: ' + (v.required || []).join(', '))}`);
    }
    console.log(`\n画布 ${W}×${H}｜渲染后端 ${hasPlaywright() ? 'Playwright' : 'Chrome headless'}`);
    return;
  }

  const topicId = argv.find((a) => !a.startsWith('--'));
  const flagLayouts = (argv.find((a) => a.startsWith('--layouts=')) || '').split('=')[1];
  const allFlag = argv.includes('--all-layouts');

  const briefPath = pkgFile(topicId, '04_brief.json');
  if (!exists(briefPath)) {
    console.error(C.red(`✗ 找不到 ${briefPath}`));
    console.error('  先由 Dify 产出 04_brief.json，或手工补一份');
    process.exit(2);
  }

  const brief = readJSON(briefPath);
  // 分类可能来自 Base 的中文标签，先归一成 code
  const rawCat = Array.isArray(brief.category) ? brief.category[0] : brief.category;
  const catCode = REG.categories[rawCat] ? rawCat : (REG.categoryByChineseLabel[rawCat] || 'math1');
  const cat = REG.categories[catCode] || {};
  const full = Object.assign(
    {
      category: catCode,
      categoryWord: cat.word || '',
      hook: (REG.brandBar && REG.brandBar.hookDefault) || '完整版见主页',
    },
    brief
  );

  const layouts = resolveLayouts(full, flagLayouts, allFlag);
  const backend = hasPlaywright() ? 'playwright' : 'chrome';
  const assetDir = path.join(packageDir(topicId), 'assets');
  const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eju-html-'));

  console.log(C.bold(`\n渲染封面 · ${topicId}`));
  console.log(C.dim(`  品类 ${full.category}（${full.categoryWord}）｜intent ${full.intent || '-'}｜后端 ${backend}`));

  const manifest = { topicId, renderedAt: new Date().toISOString(), canvas: REG.canvas, covers: [], inner: [] };
  let warn = 0;

  for (const L of layouts) {
    const def = REG.layouts[L];
    if (!def) { console.log(C.red(`  ✗ 跳过未知版式 ${L}`)); warn++; continue; }
    const miss = validate(full, L);
    if (miss.length) console.log(C.yellow(`  △ 版式 ${L} 缺必填字段: ${miss.join(', ')}（会渲染成占位内容）`));

    const htmlFile = path.join(cacheDir, `${L}.html`);
    fs.writeFileSync(htmlFile, compose(path.join(P.TEMPLATES, def.file), full));
    const outPng = path.join(assetDir, `cover-${L}.png`);
    await renderOne(htmlFile, outPng, backend);
    const kb = (fs.statSync(outPng).size / 1024).toFixed(0);
    console.log(`  ${C.green('✓')} cover-${L}.png  ${W}×${H}  ${kb} KB`);
    manifest.covers.push({ layout: L, name: def.name, file: `cover-${L}.png`, path: outPng });

    // 内页：brief.pages 为数组时复用同一管线（§7.2）
    if (Array.isArray(full.pages)) {
      for (let i = 0; i < full.pages.length; i++) {
        const p = full.pages[i];
        const pL = String(p.layout || L).toUpperCase();
        const pDef = REG.layouts[pL];
        if (!pDef) continue;
        const merged = Object.assign({}, full, p, { hook: p.hook || full.hook });
        const pHtml = path.join(cacheDir, `${pL}-p${i}.html`);
        fs.writeFileSync(pHtml, compose(path.join(P.TEMPLATES, pDef.file), merged));
        const pOut = path.join(assetDir, `inner-${String(i + 1).padStart(2, '0')}-${pL}.png`);
        await renderOne(pHtml, pOut, backend);
        manifest.inner.push({ index: i + 1, layout: pL, file: path.basename(pOut), path: pOut });
        console.log(`  ${C.green('✓')} ${path.basename(pOut)}`);
      }
    }
  }

  writeJSON(path.join(assetDir, 'manifest.json'), manifest);
  try { fs.rmSync(cacheDir, { recursive: true, force: true }); } catch {}

  console.log(`\n产出 ${manifest.covers.length} 张封面、${manifest.inner.length} 张内页 → ${assetDir}`);
  console.log(C.dim('人工关卡 G3：用文件夹缩略图看一遍，10 秒/张，重点看错别字与主色是否串品类'));
  if (warn) process.exit(1);
}

main().catch((e) => {
  console.error(C.red('✗ 渲染失败: ' + e.message));
  process.exit(1);
});
