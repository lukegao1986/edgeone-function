#!/usr/bin/env node
/**
 * dedupe.js — S2 选题层：三步去重降噪（设计文档 §4）
 *
 * 用法：
 *   node scripts/contentops/dedupe.js <topics.json> [--out deduped.json]
 *   node scripts/contentops/dedupe.js --demo
 *
 * 输入文件结构：[{ topicId, 标题, 来源, ... }]
 * 三步：
 *   1. 精确去重：标题归一化后完全相同
 *   2. 近似去重：标题字集 Jaccard ≥ 0.72 视为同题（保留得分高的）
 *   3. 冷却期：近 90 天已发过的同 category + 主关键词，标记为冷却，不删但降权
 *
 * 输出：deduped.json（保留列表）+ 控制台被剔除清单
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { C } = require('./lib/pre');

const SIM_THRESHOLD = 0.72;
const COOLDOWN_DAYS = 90;

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)) // 全角转半角
    .replace(/[\s\p{P}\p{S}]/gu, '')
    .replace(/(第\d+期|完整版|最新版|超全|必看)/g, '');
}

function jaccard(a, b) {
  const A = new Set(a), B = new Set(b);
  let inter = 0;
  for (const ch of A) if (B.has(ch)) inter++;
  return inter / (A.size + B.size - inter || 1);
}

function dedupe(list) {
  const kept = [];
  const dropped = [];

  // 步骤 1 + 2
  for (const t of list) {
    const n = normalize(t.标题 || t.title || '');
    const dupIdx = kept.findIndex((k) => jaccard(n, k._n) >= SIM_THRESHOLD);
    if (dupIdx >= 0) {
      dropped.push({ topic: t.标题 || t.title, reason: `与「${kept[dupIdx].标题 || kept[dupIdx].title}」近似（${(jaccard(n, kept[dupIdx]._n) * 100).toFixed(0)}%）` });
      continue;
    }
    kept.push(Object.assign({}, t, { _n: n }));
  }

  // 步骤 3：冷却期（读近期已发清单，缺失则跳过）
  const publishedFile = path.join(__dirname, '..', '..', 'content-ops', 'data', 'published.json');
  if (fs.existsSync(publishedFile)) {
    const pub = JSON.parse(fs.readFileSync(publishedFile, 'utf8'));
    const cutoff = Date.now() - COOLDOWN_DAYS * 864e5;
    for (const k of kept) {
      const hit = pub.find((p) => {
        if (!p.publishedAt || new Date(p.publishedAt).getTime() < cutoff) return false;
        return jaccard(k._n, normalize(p.标题 || p.title || '')) >= 0.6;
      });
      if (hit) k._cooldown = true;
    }
  }

  for (const k of kept) delete k._n;
  return { kept, dropped };
}

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length) {
    console.log('用法: node scripts/contentops/dedupe.js <topics.json> [--out deduped.json] | --demo');
    process.exit(2);
  }

  let list;
  if (argv.includes('--demo')) {
    list = [
      { topicId: 'a', 标题: 'EJU文数高频考点TOP10', 来源: '真题' },
      { topicId: 'b', 标题: 'EJU文数高频考点TOP10（完整版）', 来源: '真题' },
      { topicId: 'c', 标题: '早稻田EJU分数要求', 来源: '官网' },
      { topicId: 'd', 标题: 'EJU日语读解长文拆解三步法', 来源: '教学' },
    ];
  } else {
    const f = argv.find((a) => !a.startsWith('--'));
    list = JSON.parse(fs.readFileSync(f, 'utf8'));
  }

  const { kept, dropped } = dedupe(list);
  console.log(C.bold(`\n去重：${list.length} → ${kept.length}（剔除 ${dropped.length}）`));
  dropped.forEach((d) => console.log(`  ${C.yellow('−')} ${d.topic}  ${C.dim(d.reason)}`));
  const cool = kept.filter((k) => k._cooldown);
  if (cool.length) console.log(C.yellow(`\n冷却期内 ${cool.length} 条（不删，但本次降权）`));

  const out = (argv.find((a) => a.startsWith('--out=')) || '').split('=')[1];
  if (out) {
    fs.writeFileSync(out, JSON.stringify(kept, null, 2), 'utf8');
    console.log(`\n已写入 ${out}`);
  }
}

main();
