#!/usr/bin/env node
'use strict';
/**
 * init_bench_accounts.js — S0 博主池初始化
 *
 * 把 data/benchmark-accounts.json（2026-10-24 调研，20 个账号）
 * 升级为 benchmark/accounts.json，补上三个待填字段：
 *   tier       1（每周必看） / 2（每月看）
 *   relevance  high / mid / low
 *   observeFor 数组：选题 / 结构 / 钩子 / 数据 / 反面
 * 并追加公开检索补充的候选账号。
 *
 * 用法：node scripts/contentops/init_bench_accounts.js
 */
const fs = require('fs');
const path = require('path');
const { P } = require('./lib/paths');

const SRC = path.join(P.DATA, 'benchmark-accounts.json');
const OUT = path.join(P.BENCHMARK, 'accounts.json');

if (!fs.existsSync(SRC)) {
  console.error('找不到源档案：' + SRC);
  process.exit(1);
}

const src = JSON.parse(fs.readFileSync(SRC, 'utf8'));

// 已知账号的默认值（调研已有判断的先填上，其余留 null 等 Luke 补）
const DEFAULTS = {
  '知日塾日本留学':   { tier: 1, relevance: 'high', observeFor: ['选题', '结构', '数据'] },
  '元气体育':         { tier: 2, relevance: 'low',  observeFor: ['结构'] },
  '孟同学（拒绝摆烂www）': { tier: 1, relevance: 'mid', observeFor: ['结构', '钩子'] },
  '知日音乐-日本音乐留学': { tier: 2, relevance: 'low', observeFor: ['钩子'] },
  'CHIART知日美术':   { tier: 2, relevance: 'low',  observeFor: ['反面'] },
  '名校志向塾（Meko Edu）': { tier: 1, relevance: 'high', observeFor: ['选题', '结构'] },
  '行知学园':         { tier: 1, relevance: 'high', observeFor: ['选题', '数据'] },
  '芥末 EJU 留考辅导中心': { tier: 1, relevance: 'high', observeFor: ['选题', '钩子'] },
  '早稻田文化馆 / 慧诚教育': { tier: 1, relevance: 'mid', observeFor: ['选题'] },
  '嘟嘟日本留学':     { tier: 2, relevance: 'low',  observeFor: ['钩子'] },
};

const NEW_CANDIDATES = [
  { name: '格致学苑', type: '机构垂类号', region: null, dataLevel: 'inferred',
    positioning: '小班化 EJU 文综教学，知识点细致拆解',
    whyItWorks: '来自公开私塾盘点文章，需实际到小红书核实账号与数据' },
  { name: '青藤教育', type: '机构垂类号', region: null, dataLevel: 'inferred',
    positioning: 'EJU 文科 / 商科留考教学，结合模考数据做个性化方案',
    whyItWorks: '来自公开私塾盘点文章，需实际核实' },
  { name: '启程留学塾', type: '机构垂类号', region: null, dataLevel: 'inferred',
    positioning: 'EJU 全科应试教学，线上线下同步',
    whyItWorks: '来自公开私塾盘点文章，需实际核实' },
];

const accounts = src.accounts.map((a) => {
  const d = DEFAULTS[a.name] || { tier: null, relevance: null, observeFor: [] };
  return {
    name: a.name,
    xhsId: a.xhsId || null,
    url: null,
    type: a.type,
    region: a.region || null,
    dataLevel: a.dataLevel,
    fans: a.fans ?? null,
    likes: a.likes ?? null,
    likeFanRatio: a.likeFanRatio ?? null,
    positioning: a.positioning || null,
    observableMoves: a.observableMoves || [],
    whyItWorks: a.whyItWorks || null,
    tier: d.tier,
    relevance: d.relevance,
    observeFor: d.observeFor,
    updateFreq: null,
    note: null,
    verifiedAt: a.dataLevel === 'verified' ? '2026-10-24' : null,
  };
});

// 追加：嘟嘟日本留学（公开检索 verified）+ 3 个 inferred 候选
accounts.push({
  name: '嘟嘟日本留学',
  xhsId: '429958143',
  url: null,
  type: '达人号',
  region: '日本',
  dataLevel: 'verified',
  fans: 152000,
  likes: 467000,
  likeFanRatio: 3.07,
  positioning: '海外华人 · 留学背景 · 日本生活记录',
  observableMoves: [],
  whyItWorks: '赞粉比仅 3.1，生活记录型。观察其选题与互动话术，不作为内容模式标杆',
  tier: 2, relevance: 'low', observeFor: ['钩子'],
  updateFreq: null, note: null, verifiedAt: '2026-10-27',
});

for (const c of NEW_CANDIDATES) {
  accounts.push({
    name: c.name, xhsId: null, url: null, type: c.type, region: c.region,
    dataLevel: c.dataLevel, fans: null, likes: null, likeFanRatio: null,
    positioning: c.positioning, observableMoves: [], whyItWorks: c.whyItWorks,
    tier: null, relevance: null, observeFor: [],
    updateFreq: null, note: null, verifiedAt: null,
  });
}

const out = {
  _meta: {
    createdAt: '2026-10-27',
    migratedFrom: 'content-ops/data/benchmark-accounts.json（2026-10-24 调研，20 账号）',
    待填字段: {
      tier: '1=每周必看（目标 6 个） / 2=每月看（其余）',
      relevance: 'high=直接讲 EJU 备考 / mid=日本留学大盘 / low=泛留学生活',
      observeFor: '数组，可多选：选题 / 结构 / 钩子 / 数据 / 反面',
      updateFreq: '如 日更 / 周3更 / 月更',
    },
    采集硬边界: '禁止模拟登录批量抓取小红书。数据一律人工浏览速记 / 专业号后台导出 / 公开检索',
    灰豚数据用法: '灰豚(xhs.huitun.com)为付费站内数据平台，需登录。导出时按本表列名对齐后粘贴，重点补 fans/likes/互动中位数',
  },
  accounts,
};

fs.mkdirSync(P.BENCHMARK, { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');

const need = accounts.filter((a) => a.tier === null).length;
console.log('✔ 已生成 ' + OUT);
console.log('  共 ' + accounts.length + ' 个账号，其中待 Luke 定观察层级：' + need + ' 个');
