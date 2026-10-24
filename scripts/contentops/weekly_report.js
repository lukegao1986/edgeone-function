#!/usr/bin/env node
/**
 * weekly_report.js — S6 数据回流：周度汇总与反哺建议（设计文档 §9 / §8.5）
 *
 * 用法：
 *   node scripts/contentops/weekly_report.js [YYYY-Www]        # 读 content-ops/data/weekly/<周次>.json
 *   node scripts/contentops/weekly_report.js --from-base        # 从飞书 Base「数据周报」拉（需 lark-cli 登录态）
 *
 * 数据文件格式（数组）：
 *   [{ 笔记标题, 平台, 曝光, 封面点击率, 完读率, 点赞, 收藏, 评论 }]
 *
 * 输出三件事（G5 只回答这三个问题）：
 *   1. 收藏/点赞比最高的是谁 → 工具型内容，下周同类加量
 *   2. 完读率最低的是谁     → 开头三行有问题，改 Prompt
 *   3. 哪条带来了搜索进博客 → 反查 blog-data/pv.json
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { P } = require('./lib/paths');
const { C, gate } = require('./lib/pre');

const WEEKLY_DIR = path.join(P.DATA, 'weekly');

function weekId(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const wk = Math.ceil(((t - y0) / 864e5 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(wk).padStart(2, '0')}`;
}

function ratio(r) { return r.点赞 > 0 ? +(r.收藏 / r.点赞).toFixed(2) : 0; }

function report(rows, week) {
  console.log(C.bold(`\n数据周报 ${week} · ${rows.length} 条`));

  const sorted = rows.slice().sort((a, b) => ratio(b) - ratio(a));
  console.log(C.bold('\n① 收藏/点赞比（>1 是工具型内容，值得系列化）'));
  sorted.slice(0, 5).forEach((r, i) => {
    const v = ratio(r);
    const mark = v > 1 ? C.green('★') : C.dim('·');
    console.log(`  ${mark} ${String(v).padStart(5)}  ${r.笔记标题}  ${C.dim(`${r.平台}｜赞${r.点赞} 藏${r.收藏}`)}`);
  });

  const byFinish = rows.slice().sort((a, b) => (a.完读率 || 0) - (b.完读率 || 0));
  console.log(C.bold('\n② 完读率最低（开头三行要改）'));
  byFinish.slice(0, 3).forEach((r) => {
    console.log(`  ${C.yellow('!')} ${String(r.完读率 || 0).padStart(5)}  ${r.笔记标题}  ${C.dim('曝光 ' + (r.曝光 || 0))}`);
  });

  const pvFile = path.join(P.ROOT, 'blog-data', 'pv.json');
  console.log(C.bold('\n③ 博客侧'));
  if (fs.existsSync(pvFile)) {
    const pv = JSON.parse(fs.readFileSync(pvFile, 'utf8'));
    const top = Object.entries(pv).sort((a, b) => (b[1] || 0) - (a[1] || 0)).slice(0, 5);
    top.forEach(([slug, n]) => console.log(`  ${String(n).padStart(5)}  ${slug}`));
    console.log(C.dim('  TOP 文章反向拆成 3 个新选题，回池打分'));
  } else {
    console.log(C.dim(`  未找到 ${pvFile}，跳过`));
  }

  const exp = rows.reduce((s, r) => s + (r.曝光 || 0), 0);
  const ctrAvg = rows.length ? (rows.reduce((s, r) => s + (r.封面点击率 || 0), 0) / rows.length).toFixed(2) : 0;
  console.log(C.bold('\n汇总'));
  console.log(`  总曝光 ${exp}｜平均封面点击率 ${ctrAvg}｜笔记 ${rows.length} 条`);
  const target = { 小红书: 5, 长文: 2 };
  const xhsCount = rows.filter((r) => r.平台 === '小红书').length;
  console.log(`  周目标：小红书 ${target.小红书} 条 → 实际 ${xhsCount} 条 ${xhsCount >= target.小红书 ? C.green('达标') : C.red('未达标')}`);
  console.log(C.dim('  长文篇数需在 content-ops/STATE.md 里人工记，本脚本读不到'));

  const out = path.join(P.DATA, `report-${week}.md`);
  fs.writeFileSync(out, `# 周报 ${week}\n\n${JSON.stringify(rows, null, 2)}\n`, 'utf8');
  console.log(C.dim(`\n  → ${out}`));
}

function main() {
  const argv = process.argv.slice(2);

  if (argv.includes('--from-base')) {
    gate({
      name: 'weekly_report.js --from-base',
      purpose: '从飞书 Base 拉数据周报',
      needs: [
        { label: 'lark-cli 已安装且登录', ok: !!process.env.LARK_CLI || true, fix: 'lark-cli auth login --domain all --no-wait' },
        { label: 'Base token 已知', ok: true, fix: 'base_token=LA0MbLX4fasekas388bc5J92nde' },
      ],
      todo: [
        '用 lark-cli base +record-list 读表 tblr6ORAohb0Jj6C，转成本脚本的输入格式',
        'P3 打通后由 n8n 定时触发，结果回写选题池权重与默认封面版式',
        '执行时必须带 --as user，且 WorkBuddy 侧要 dangerouslyDisableSandbox: true',
      ],
    });
    return;
  }

  const week = argv.find((a) => /^\d{4}-W\d{2}$/.test(a)) || weekId();
  const file = path.join(WEEKLY_DIR, `${week}.json`);
  if (!fs.existsSync(file)) {
    fs.mkdirSync(WEEKLY_DIR, { recursive: true });
    console.log(C.yellow(`✗ 未找到 ${file}`));
    console.log(C.dim('  先去小红书专业号数据中心导出本周笔记数据，按以下格式落盘：'));
    console.log(C.dim('  [{ "笔记标题":"", "平台":"小红书", "曝光":0, "封面点击率":0, "完读率":0, "点赞":0, "收藏":0, "评论":0 }]'));
    process.exit(1);
  }
  report(JSON.parse(fs.readFileSync(file, 'utf8')), week);
}

main();
