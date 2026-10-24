#!/usr/bin/env node
/**
 * score_topics.js — S2 选题层：五维打分与分级（设计文档 §5.2）
 *
 * 与飞书 Base「选题池」的公式字段保持一致，改公式必须两处同步：
 *   得分 = (需求×3 + 差异×2.5 + 转化×2.5 + 复用×2 − 成本×2) × 时效系数
 *   分级：≥85 S ｜ 70–85 A ｜ 50–70 B ｜ <50 C
 *
 * 用法：
 *   node scripts/contentops/score_topics.js <topics.json> [--out scored.json] [--min B]
 *   node scripts/contentops/score_topics.js --demo
 *
 * 输入字段（均为 0–10）：需求强度 差异化 转化价值 复用性 生产成本 时效系数
 * 写回飞书 Base 需 lark-cli（见 --push-base，TODO：等 n8n 通道打通后自动回写）
 */
'use strict';
const fs = require('fs');
const { C } = require('./lib/pre');

const WEIGHTS = { 需求强度: 3, 差异化: 2.5, 转化价值: 2.5, 复用性: 2, 生产成本: -2 };

function score(t) {
  const n = (k) => {
    const v = Number(t[k]);
    return Number.isFinite(v) ? Math.max(0, Math.min(10, v)) : 0;
  };
  const raw =
    n('需求强度') * WEIGHTS.需求强度 +
    n('差异化') * WEIGHTS.差异化 +
    n('转化价值') * WEIGHTS.转化价值 +
    n('复用性') * WEIGHTS.复用性 +
    n('生产成本') * WEIGHTS.生产成本;
  const k = Number(t.时效系数) > 0 ? Number(t.时效系数) : 1;
  return Math.round(raw * k);
}

function grade(s) {
  if (s >= 85) return 'S';
  if (s >= 70) return 'A';
  if (s >= 50) return 'B';
  return 'C';
}

const ACTION = {
  S: '视频 + 长文 + 系列化，投全平台',
  A: '图文笔记 + 长文，投小红书 + 知乎 + 博客',
  B: '单条图文笔记，只投小红书',
  C: '归档，不生产（季度复盘再扫）',
};

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length) {
    console.log('用法: node scripts/contentops/score_topics.js <topics.json> [--out scored.json] | --demo');
    process.exit(2);
  }

  let list;
  if (argv.includes('--demo')) {
    list = [
      { topicId: 'math2-freq', 标题: 'EJU文数高频考点TOP10', 需求强度: 9, 差异化: 10, 转化价值: 9, 复用性: 10, 生产成本: 8, 时效系数: 1.15 },
      { topicId: 'waseda', 标题: '早稻田/上智/MARCH 分数要求', 需求强度: 9, 差异化: 7, 转化价值: 9, 复用性: 8, 生产成本: 5, 时效系数: 1.15 },
      { topicId: 'reading', 标题: 'EJU日语读解长文拆解三步法', 需求强度: 10, 差异化: 7, 转化价值: 8, 复用性: 9, 生产成本: 6, 时效系数: 1.0 },
      { topicId: 'bunso', 标题: 'EJU文综时间轴记忆法', 需求强度: 8, 差异化: 6, 转化价值: 7, 复用性: 8, 生产成本: 4, 时效系数: 1.0 },
      { topicId: 'anxiety', 标题: '考试焦虑自救指南', 需求强度: 6, 差异化: 3, 转化价值: 3, 复用性: 5, 生产成本: 2, 时效系数: 1.0 },
    ];
  } else {
    list = JSON.parse(fs.readFileSync(argv.find((a) => !a.startsWith('--')), 'utf8'));
  }

  const scored = list.map((t) => {
    const s = score(t);
    return Object.assign({}, t, { 得分: s, 分级: grade(s), 处置: ACTION[grade(s)] });
  }).sort((a, b) => b.得分 - a.得分);

  console.log(C.bold('\n选题打分'));
  console.log('得分  分级  选题');
  for (const t of scored) {
    const g = t.分级 === 'C' ? C.dim(t.分级) : t.分级 === 'S' ? C.green(t.分级) : t.分级;
    console.log(`  ${String(t.得分).padStart(3)}  ${g}    ${t.标题 || t.topicId}  ${C.dim('— ' + t.处置)}`);
  }

  const out = (argv.find((a) => a.startsWith('--out=')) || '').split('=')[1];
  if (out) { fs.writeFileSync(out, JSON.stringify(scored, null, 2), 'utf8'); console.log(`\n已写入 ${out}`); }
  console.log(C.dim('\n注：写回飞书 Base 走 n8n 通道，P3 打通前在 Base 里手改状态'));
}

main();
