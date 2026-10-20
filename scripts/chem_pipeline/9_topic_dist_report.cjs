#!/usr/bin/env node
/**
 * 9_topic_dist_report.cjs — 生成 EJU 化学“topicCode → 题量”分布柱形图报告（映射步进 9）
 *
 * 数据口径：23 个常规单元（cheb1~cheb6 + che1~che17）的 _step6_pilot 草稿 JSON（最新值，含均衡调整后）。
 * 考纲：src/data/ejuSyllabus.ts（chemistry 分支全树）。
 * 输出：docs/chem_topic_distribution_{YYYY-MM-DD}.html（纯静态，无外部依赖，可直接 file:// 打开）。
 * 用法：node 9_topic_dist_report.cjs
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, UNITS, unitJsonPath, loadSyllabus } = require('./step6_review_common.cjs');

function todayStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function sha8(str) { return require('crypto').createHash('sha256').update(String(str), 'utf8').digest('hex').slice(0, 8); }

function collect() {
  const syllabus = loadSyllabus();
  const sci = syllabus.find((i) => i && i.code === 'science');
  const chem = sci.subSubjects.find((i) => i.code === 'chemistry');

  const topicMeta = new Map();       // topicId -> {chapterId,chapterTitle,sectionId,sectionTitle,id,title,subtopics:[]}
  for (const ch of chem.chapters || []) {
    for (const sec of ch.sections || []) {
      for (const tp of sec.topics || []) {
        topicMeta.set(tp.id, {
          chapterId: ch.id, chapterTitle: ch.title, sectionId: sec.id, sectionTitle: sec.title,
          id: tp.id, title: tp.title, content: tp.content || '', subtopics: (tp.subtopics || []),
        });
      }
    }
  }

  const tCount = new Map();          // topicId -> count
  const sCount = new Map();          // subtopicId -> count
  const manual = new Map();          // subtopicId -> [businessCode]
  for (const u of UNITS) {
    const p = unitJsonPath(u);
    if (!fs.existsSync(p)) continue;
    const drafts = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const d of drafts) {
      const t = d.topicCode;
      if (t) tCount.set(t, (tCount.get(t) || 0) + 1);
      for (const s of d.subtopicCodes || []) {
        sCount.set(s, (sCount.get(s) || 0) + 1);
        if (!manual.has(s)) manual.set(s, []);
        manual.get(s).push(d.businessCode);
      }
    }
  }
  return { chem, topicMeta, tCount, sCount, manual };
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml({ chem, topicMeta, tCount, sCount, manual }, date, digest) {
  const topics = chem.chapters
    .flatMap((ch) => ch.sections.flatMap((sec) => sec.topics.map((tp) => ({ ch, sec, tp }))));
  const stats = topics.map(({ ch, sec, tp }) => ({
    ch, sec, tp, n: tCount.get(tp.id) || 0,
  })).sort((a, b) => b.n - a.n);

  const total = stats.reduce((s, x) => s + x.n, 0);
  const maxN = Math.max(...stats.map((x) => x.n));
  const emptyTopics = stats.filter((x) => x.n === 0).length;
  const subtopicTotal = chem.chapters.flatMap((ch) => ch.sections.flatMap((sec) => sec.topics.flatMap((tp) => tp.subtopics || []))).length;
  const emptySubtopics = [...topicMeta.values()]
    .flatMap((m) => m.subtopics.map((st) => ({ code: st.code, name: st.name, topic: m.id, topicTitle: m.title })))
    .filter((st) => (sCount.get(st.code) || 0) === 0);

  const palette = [
    ['#2563eb', '#dbeafe'], ['#059669', '#d1fae5'], ['#d97706', '#fef3c7'],
    ['#dc2626', '#fee2e2'], ['#7c3aed', '#ede9fe'], ['#0891b2', '#cffafe'],
    ['#c026d3', '#fae8ff'], ['#4d7c0f', '#ecfccb'],
  ];
  const chapColor = new Map();
  let ci = 0;
  for (const ch of chem.chapters) if (!chapColor.has(ch.id)) chapColor.set(ch.id, palette[ci++ % palette.length]);

  // 柱形条渲染（两种排序共用）：按题量降序 / 按 topicCode 顺序（大纲序）
  const renderBar = ({ ch, tp, n }) => {
    const [c] = chapColor.get(ch.id);
    const pct = maxN ? Math.round((n / maxN) * 100) : 0;
    return `<div class="bar-row">
      <div class="bar-label" title="${esc(tp.id)} ｜ ${esc(tp.title)}">${esc(tp.title.replace(/^\(\d+\)/, ''))} <span class="bid">${esc(tp.id)}</span></div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${Math.max(1, pct)}%;background:${c}" data-n="${n}"></div>
      </div>
      <div class="bar-num">${n}</div>
    </div>`;
  };
  const barsByCount = stats.map(renderBar).join('\n');
  const barsByCode = topics
    .map(({ ch, tp }) => ({ ch, tp, n: tCount.get(tp.id) || 0 }))
    .map(renderBar).join('\n');

  // 完整表格（章节分组）
  const rows = stats.map(({ ch, sec, tp, n }) => `    <tr>
      <td>${esc(ch.id)}</td><td>${esc(ch.title)}</td><td>${esc(sec.id)}</td><td>${esc(sec.title)}</td>
      <td class="mono">${esc(tp.id)}</td><td>${esc(tp.title.replace(/^\(\d+\)/, ''))}</td>
      <td class="num"><b>${n}</b></td>
      <td>${total ? (n / total * 100).toFixed(1) : 0}%</td>
    </tr>`).join('\n');

  const emptySubRows = emptySubtopics.map((st) => (`    <tr>
      <td class="mono">${esc(st.code)}</td><td>${esc(st.name)}</td><td class="mono">${esc(st.topic)}</td><td>${esc(st.topicTitle)}</td>
    </tr>`)).join('\n');

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EJU 化学 topicCode 题量分布（${date}）</title>
<style>
  :root{--ink:#1f2937;--muted:#6b7280;--line:#e5e7eb;}
  *{box-sizing:border-box;}
  body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;color:var(--ink);margin:0;background:#f8fafc;}
  .wrap{max-width:1080px;margin:0 auto;padding:32px 20px 64px;}
  h1{font-size:22px;margin:0 0 6px;}
  .sub{color:var(--muted);font-size:13px;margin-bottom:18px;}
  .cards{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px;}
  .card{flex:1;min-width:150px;background:#fff;border:1px solid var(--line);border-radius:10px;padding:14px 16px;}
  .card .k{font-size:12px;color:var(--muted);}
  .card .v{font-size:24px;font-weight:700;margin-top:4px;}
  .card .v small{font-size:13px;color:var(--muted);font-weight:400;}
  section{background:#fff;border:1px solid var(--line);border-radius:10px;padding:18px 20px;margin-bottom:24px;}
  section h2{font-size:15px;margin:0 0 12px;}
  .tabs{display:flex;gap:8px;margin:0 0 14px;}
  .tab{border:1px solid var(--line);background:#fff;color:var(--muted);border-radius:999px;padding:5px 14px;font-size:13px;cursor:pointer;line-height:1.4;}
  .tab:hover{border-color:#9ca3af;}
  .tab.active{background:var(--ink);color:#fff;border-color:var(--ink);font-weight:600;}
  .bar-row{display:flex;align-items:center;gap:10px;margin-bottom:7px;}
  .bar-label{width:300px;flex:none;font-size:13px;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .bar-label .bid{color:var(--muted);font-size:11px;font-family:ui-monospace,Menlo,monospace;}
  .bar-track{flex:1;background:#f1f5f9;border-radius:5px;height:20px;overflow:hidden;}
  .bar-fill{height:100%;border-radius:5px;min-width:4px;transition:width .3s;}
  .bar-num{width:36px;flex:none;font-variant-numeric:tabular-nums;font-weight:600;font-size:13px;}
  table{width:100%;border-collapse:collapse;font-size:12.5px;}
  th,td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top;}
  th{background:#f8fafc;font-weight:600;white-space:nowrap;}
  td.mono,.num{font-family:ui-monospace,Menlo,monospace;}
  td.num{text-align:right;}
  tr:hover td{background:#f8fafc;}
  .note{font-size:12px;color:var(--muted);margin-top:10px;line-height:1.8;}
  .ch-sep td{background:#fff7ed;font-weight:700;border-top:2px solid #fcd34d;}
  .badge{display:inline-block;background:#fee2e2;color:#b91c1c;border-radius:999px;padding:0 8px;font-size:11px;font-weight:700;margin-left:6px;}
</style>
</head>
<body>
<div class="wrap">
  <h1>EJU 理科（化学）topicCode 题量分布</h1>
  <div class="sub">统计口径：23 个常规单元（cheb1~cheb6 + che1~che17）Step6 试点草稿 JSON（含 2026-10-17 均衡调整 7 题）；考纲来源 ejuSyllabus.ts｜来源版本 ${digest}｜生成时间 ${date}</div>

  <div class="cards">
    <div class="card"><div class="k">总题量</div><div class="v">${total}</div></div>
    <div class="card"><div class="k">topic 考点数</div><div class="v">${stats.length}<small> 个</small></div></div>
    <div class="card"><div class="k">有题量 topic</div><div class="v">${stats.length - emptyTopics}<small> / ${stats.length}</small></div></div>
    <div class="card"><div class="k">子考点覆盖</div><div class="v">${subtopicTotal - emptySubtopics.length}<small> / ${subtopicTotal}</small></div></div>
    <div class="card"><div class="k">最大单考点题量</div><div class="v">${maxN}</div></div>
  </div>

  <section>
    <h2>各 topicCode 题量柱形图</h2>
    <div class="tabs">
      <button class="tab active" data-order="count">按题量降序</button>
      <button class="tab" data-order="code">按 topicCode 序</button>
    </div>
    <div id="barsByCount">
${barsByCount}
    </div>
    <div id="barsByCode" hidden>
${barsByCode}
    </div>
  </section>

  <section>
    <h2>明细表（章节 / 节 / topicCode / 题量）</h2>
    <div style="overflow-x:auto;">
    <table>
      <thead><tr><th>章节ID</th><th>章节</th><th>节ID</th><th>节</th><th>topicCode</th><th>考点</th><th>题量</th><th>占比</th></tr></thead>
      <tbody>
${rows}
      </tbody>
    </table>
    </div>
  </section>

  <section>
    <h2>未覆盖子考点（题量为 0）${emptySubtopics.length ? '<span class="badge">' + emptySubtopics.length + '</span>' : ''}</h2>
    ${emptySubtopics.length
      ? `<table><thead><tr><th>子考点</th><th>名称</th><th>所属 topicCode</th><th>所属考点</th></tr></thead><tbody>\n${emptySubRows}\n    </tbody></table>`
      : '<div class="note">全部子考点均有题目覆盖。</div>'}
    <div class="note">
      ※ <b>chem_3_1_2_03 遷移元素の用途</b>：现有题库无“用途类”专述题（关键词检索 0 命中），未能由现有题平移填充，需后续补题；
      其余此前空置的 chem_1_3_4_02 水素結合、chem_2_2_1_02 状態変化と熱 已通过 2026-10-17 均衡调整填充。
    </div>
  </section>
</div>
<script>
  (function () {
    var boxes = { count: document.getElementById('barsByCount'), code: document.getElementById('barsByCode') };
    document.querySelectorAll('.tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.tab').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        boxes.count.hidden = btn.dataset.order !== 'count';
        boxes.code.hidden = btn.dataset.order !== 'code';
      });
    });
  })();
</script>
</body>
</html>
`;
  return html;
}

function main() {
  // 日期优先沿用最新审阅表 CSV 的日期（保持项目内命名体系一致），无表时回退系统当天
  const reportDir = path.join(ROOT, 'docs/Topic_Review_Reports');
  let date = null;
  if (fs.existsSync(reportDir)) {
    const m = fs.readdirSync(reportDir)
      .map((f) => (f.match(/^chem_step6_review_(\d{4}-\d{2}-\d{2})\.csv$/) || [])[1])
      .filter(Boolean).sort().pop();
    if (m) date = m;
  }
  if (!date) date = todayStamp();
  const { chem, topicMeta, tCount, sCount, manual } = collect();
  // 摘要的来源版本 = 各章 JSON 全文 sha 前缀拼接（截断，便于追溯）
  const digest = UNITS.map((u) => `${u}:${sha8(fs.existsSync(unitJsonPath(u)) ? fs.readFileSync(unitJsonPath(u)) : '')}`).join(' ');
  const outPath = path.join(ROOT, 'docs', `chem_topic_distribution_${date}.html`);
  fs.writeFileSync(outPath, buildHtml({ chem, topicMeta, tCount, sCount, manual }, date, digest), 'utf8');
  console.log('报告已生成:', outPath);
}

main();