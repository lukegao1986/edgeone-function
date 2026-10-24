#!/usr/bin/env node
/**
 * fetch_sources.js — S1 信息源层：抓取与快照（设计文档 §3）
 *
 * 用法：
 *   node scripts/contentops/fetch_sources.js --probe     # 只探活，看哪些源可达
 *   node scripts/contentops/fetch_sources.js             # 抓取全部源，落 content-ops/sources/<date>/
 *
 * 设计定位：本脚本只做「取」与「存快照」，调度交给 n8n。
 * 两个独家源（43 份真题频次、学生真实提问）不在本脚本范围：
 *   真题 → scan_past_papers.js；学生提问 → 手录进 Base 选题池
 *
 * 源清单维护在 content-ops/sources/registry.json
 */
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const { P } = require('./lib/paths');
const { C, hasBin, gate } = require('./lib/pre');

const REG_FILE = path.join(P.SOURCES, 'registry.json');

function defaultRegistry() {
  return [
    { id: 'jasso', name: 'JASSO 官方（EJU 实施要项 / 出题科目）', url: 'https://www.jasso.go.jp/ryugaku/eju/index.html', intent: 'know', priority: 'high' },
    { id: 'waseda', name: '早稻田大学 募集要項', url: 'https://www.waseda.jp/admission/', intent: 'compare', priority: 'high' },
    { id: 'sophia', name: '上智大学 募集要項', url: 'https://www.sophia.ac.jp/admissions/', intent: 'compare', priority: 'mid' },
    { id: 'zhihu', name: '知乎 EJU 话题（中文需求侧）', url: 'https://www.zhihu.com/topic/20068887/hot', intent: 'know', priority: 'mid' },
  ];
}

function loadRegistry() {
  if (fs.existsSync(REG_FILE)) return JSON.parse(fs.readFileSync(REG_FILE, 'utf8'));
  fs.mkdirSync(P.SOURCES, { recursive: true });
  fs.writeFileSync(REG_FILE, JSON.stringify(defaultRegistry(), null, 2), 'utf8');
  console.log(C.dim(`已生成默认源清单：${REG_FILE}（请按实际补 URL）`));
  return defaultRegistry();
}

function head(url) {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve({ ok: false, code: 'TIMEOUT' }), 8000);
    try {
      const req = https.request(url, { method: 'GET', timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        clearTimeout(t);
        res.destroy();
        resolve({ ok: res.statusCode < 400, code: res.statusCode });
      });
      req.on('error', () => { clearTimeout(t); resolve({ ok: false, code: 'ERR' }); });
      req.end();
    } catch { clearTimeout(t); resolve({ ok: false, code: 'ERR' }); }
  });
}

async function main() {
  const argv = process.argv.slice(2);
  const reg = loadRegistry();

  if (argv.includes('--probe')) {
    console.log(C.bold('\n信息源探活'));
    for (const s of reg) {
      const r = await head(s.url);
      console.log(`  ${r.ok ? C.green('✓') : C.red('✗')} ${String(r.code).padEnd(8)} ${s.name}`);
    }
    console.log(C.dim('\n探活只验证可达性，正文抓取需要对应解析规则（每源一个 parser）'));
    return;
  }

  const ok = gate({
    name: 'fetch_sources.js',
    purpose: '抓取 1/2/6/7 号源，存快照 + diff',
    needs: [
      { label: '容器运行时（n8n 调度载体）', ok: hasBin('docker') || hasBin('colima'), fix: 'brew install colima && colima start' },
      { label: '源清单已配置', ok: fs.existsSync(REG_FILE), fix: `补 ${REG_FILE}` },
    ],
    todo: [
      'n8n 里建定时流：Cron → HTTP Request（每源）→ 写 Base 选题池',
      '每个源配一个 parser（正则或 LLM 抽取），抓到的标题走 dedupe.js 去重',
      '快照落 content-ops/sources/<YYYY-MM-DD>/，diff 只在变化时推送，避免噪音',
      '抓取频率：官网类每周一次，社区类每日一次（社区类噪音大，走 dedupe 降噪）',
    ],
  });
  if (!ok) process.exit(1);
  console.log(C.dim('\n本脚本的抓取逻辑由 n8n 承担，Node 侧只保留 parser 与去重入口'));
}

main();
