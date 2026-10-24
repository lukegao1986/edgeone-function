#!/usr/bin/env node
/**
 * scan_past_papers.js — S1 信息源层：43 份真题的考点频次统计（设计文档 §3，独家源 1）
 *
 * 用法：
 *   node scripts/contentops/scan_past_papers.js --dir <真题Markdown目录> [--out freq.json]
 *   PAST_PAPERS_DIR=/path/to/文数真题 node scripts/contentops/scan_past_papers.js
 *
 * 这是护城河信息源：统计结果别人拿不到，直接决定「真题体封面」的选题质量
 * 关键词表维护在 content-ops/data/keywords.json：
 *   { "数学2": { "二次函数": ["二次関数","抛物线","頂点"], ... } }
 *
 * 产出：content-ops/data/freq-<category>.json（按频次降序）
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { P } = require('./lib/paths');
const { C, gate } = require('./lib/pre');

const KW_FILE = path.join(P.DATA, 'keywords.json');

function loadKeywords() {
  if (fs.existsSync(KW_FILE)) return JSON.parse(fs.readFileSync(KW_FILE, 'utf8'));
  const sample = {
    math2: {
      二次函数: ['二次関数', '放物線', '頂点', '判別式'],
      概率: ['確率', '場合の数', '順列', '組合せ'],
      数列: ['数列', '等差', '等比', '漸化式'],
      向量: ['ベクトル', '内積'],
      微积分: ['微分', '積分', '導関数'],
    },
  };
  fs.mkdirSync(P.DATA, { recursive: true });
  fs.writeFileSync(KW_FILE, JSON.stringify(sample, null, 2), 'utf8');
  console.log(C.dim(`已生成示例关键词表：${KW_FILE}（按你的考纲补全）`));
  return sample;
}

function walk(dir, ext = '.md') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, ext));
    else if (path.extname(e.name).toLowerCase() === ext) out.push(p);
  }
  return out;
}

function main() {
  const argv = process.argv.slice(2);
  const dirArg = (argv.find((a) => a.startsWith('--dir=')) || '').split('=')[1] || process.env.PAST_PAPERS_DIR;

  if (!dirArg || !fs.existsSync(dirArg)) {
    gate({
      name: 'scan_past_papers.js',
      purpose: '统计真题考点频次（独家源）',
      needs: [
        { label: '真题 Markdown 目录', ok: !!dirArg && fs.existsSync(dirArg), fix: '用 --dir 指定已转好的真题目录，或设 PAST_PAPERS_DIR' },
        { label: '关键词表已维护', ok: fs.existsSync(KW_FILE), fix: `补全 ${KW_FILE}（按考纲 subtopic 建词）` },
      ],
      todo: ['词表对齐你的考纲 topic→subtopic 层级，避免统计粒度不一致'],
    });
    process.exit(1);
  }

  const kw = loadKeywords();
  const files = walk(dirArg);
  console.log(C.bold(`\n扫描 ${files.length} 份真题 → ${Object.keys(kw).length} 个品类`));

  for (const [cat, topics] of Object.entries(kw)) {
    const stat = {};
    for (const [topic, words] of Object.entries(topics)) stat[topic] = 0;
    for (const f of files) {
      const text = fs.readFileSync(f, 'utf8');
      for (const [topic, words] of Object.entries(topics)) {
        for (const w of words) {
          const m = text.match(new RegExp(w, 'g'));
          if (m) stat[topic] += m.length;
        }
      }
    }
    const ranked = Object.entries(stat).sort((a, b) => b[1] - a[1]);
    const out = path.join(P.DATA, `freq-${cat}.json`);
    fs.writeFileSync(out, JSON.stringify({ category: cat, papers: files.length, scannedAt: new Date().toISOString(), ranking: ranked }, null, 2), 'utf8');

    console.log(C.bold(`\n${cat}（TOP 10 / 共 ${files.length} 份）`));
    ranked.slice(0, 10).forEach(([t, n], i) => {
      const bar = '█'.repeat(Math.max(1, Math.round(n / (ranked[0][1] || 1) * 24)));
      console.log(`  ${String(i + 1).padStart(2)}. ${t.padEnd(12, '　')} ${String(n).padStart(5)}  ${bar}`);
    });
    console.log(C.dim(`  → ${out}`));
  }

  console.log(C.dim('\n高频考点拿去做「真题体封面」（版式 E），是竞品做不出来的差异化'));
}

main();
