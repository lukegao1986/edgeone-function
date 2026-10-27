#!/usr/bin/env node
/**
 * pipeline.js — 内容流水线编排器（设计文档 §3 六段流水线 / §8 五道人工关卡）
 *
 * 设计原则：**除了打勾批示，其它全自动。**
 *   自动段：渲染封面与内页 → 事实核查 → 生成 G4 清单 → 发布长文并 push
 *   人工段：G1 选题终裁 / G2 草案审批 / G3 视觉终审 / G4 发布终审 / G5 周度复盘
 *
 * 关卡状态机（存在 00_topic.json 的 level 字段）：
 *   G1 待裁 ──批示──> S3 待产 ──自动──> G2 待审 ──批示──> G3 待审
 *          ──批示──> G4 待审 ──批示──> S5 待发 ──自动──> 已发布
 *   任一关卡可驳回：→ "Gx 驳回"，改完重新 --approve 即可
 *
 * 用法：
 *   node scripts/contentops/pipeline.js --status                 # 刷新并打印批示台 GATES.md
 *   node scripts/contentops/pipeline.js --sync                   # 读 GATES.md 的勾选，写回 level
 *   node scripts/contentops/pipeline.js --run                    # 推进所有包（自动段跑满，人工段停）
 *   node scripts/contentops/pipeline.js --run --topic <topicId>
 *   node scripts/contentops/pipeline.js --approve G2 <topicId>[,<topicId>]
 *   node scripts/contentops/pipeline.js --reject  G2 <topicId> --reason "标题太硬"
 *   node scripts/contentops/pipeline.js --json                   # 机器可读输出
 *
 * 退出码：0 正常 / 1 有阻断项（factcheck 红）/ 2 用法或文件错误
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { P, pkgFile, packageDir, exists, readJSON, writeJSON, listPackages } = require('./lib/paths');

const C = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

const GATES = ['G1', 'G2', 'G3', 'G4'];

/** 关卡 → 通过后进入的下一关 */
const NEXT = {
  'G1': 'S3 待产',
  'G2': 'G3 待审',
  'G3': 'G4 待审',
  'G4': 'S5 待发',
};

/** 自动段：进入该 level 时脚本能自己干完的事 */
const AUTO = {
  'S3 待产': ['render', 'factcheck', 'checklist'],
  'S5 待发': ['publish'],
};

const GATE_LABEL = {
  'G1': 'G1 选题终裁',
  'G2': 'G2 草案审批',
  'G3': 'G3 视觉终审',
  'G4': 'G4 发布终审',
};

// ────────────────────────── 基础读写 ──────────────────────────

/**
 * 00_topic.json 有两套字段风格（早期中文键 / 现行英文键），统一成英文键再处理。
 * 只在内存里归一化，写回时只改 level / gates / updatedAt，不动原字段。
 */
function normalize(t) {
  if (!t) return t;
  if (t.title === undefined) t.title = t.标题 || '';
  if (t.grade === undefined) t.grade = t.分级 || '';
  if (t.score === undefined) t.score = t.得分 ?? '';
  if (t.linkedSlug === undefined) t.linkedSlug = t.关联slug || '';
  if (t.categoryCode === undefined && Array.isArray(t.分类)) t.categoryCode = t.分类[0] || '';
  if (t.level === undefined) {
    t.level = t['关卡状态'] || t['level'] || 'G1 待裁';
  }
  return t;
}

function readTopic(topicId) {
  const f = pkgFile(topicId, '00_topic.json');
  return exists(f) ? normalize(readJSON(f)) : null;
}

/** 本地时间 YYYY-MM-DD */
function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 本地时间 YYYY-MM-DD HH:mm */
function nowStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${today()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function saveTopic(topicId, t) {
  t.updatedAt = today();
  writeJSON(pkgFile(topicId, '00_topic.json'), t);
}

function appendReview(topicId, line) {
  const f = pkgFile(topicId, '99_review.md');
  const stamp = today();
  const old = exists(f) ? fs.readFileSync(f, 'utf8') : '';
  fs.writeFileSync(f, `${old.trimEnd()}\n\n- [${stamp}] ${line}\n`, 'utf8');
}

function runScript(name, args) {
  const f = path.join(__dirname, name);
  try {
    const out = execFileSync(process.execPath, [f, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { ok: true, out };
  } catch (e) {
    return { ok: false, out: (e.stdout || '') + (e.stderr || e.message || '') };
  }
}

/** 抽一行最有价值的信息用于回显 */
function brief(out, keys) {
  const lines = out.split('\n').map((s) => s.trim()).filter(Boolean);
  const hit = lines.filter((l) => keys.some((k) => l.includes(k)));
  return hit.slice(-2).join(' ｜ ') || lines.slice(-1)[0] || '';
}

// ────────────────────────── 自动动作 ──────────────────────────

function stepRender(topicId) {
  if (!exists(pkgFile(topicId, '04_brief.json'))) {
    return { ok: false, msg: '缺 04_brief.json —— 需先起草（写作由 agent 完成）' };
  }
  const r = runScript('render_covers.js', [topicId]);
  return { ok: r.ok, msg: brief(r.out, ['张', 'PNG', '渲染']), raw: r.out };
}

function stepFactcheck(topicId) {
  const r = runScript('factcheck.js', [topicId]);
  const fc = exists(pkgFile(topicId, '05_factcheck.json')) ? readJSON(pkgFile(topicId, '05_factcheck.json')) : null;
  const blocked = fc ? (fc.blocked || fc.red || []).length : 0;
  return { ok: r.ok, blocked, msg: brief(r.out, ['阻断', '通过', '标黄']), raw: r.out };
}

function stepChecklist(topicId) {
  const r = runScript('make_checklist.js', [topicId]);
  return { ok: r.ok, msg: brief(r.out, ['未通过', '全部通过', '检查项']), raw: r.out };
}

function stepPublish(topicId) {
  // 防呆：长文已在 blog-src 里就别重复发（publish_blog 会拒绝覆盖同名 slug）
  const t = readTopic(topicId);
  const slug = t && t.linkedSlug;
  if (slug && exists(path.join(P.BLOG_SRC, `${slug}.md`))) {
    return { ok: true, msg: `长文已在库（${slug}），跳过重复发布`, skipped: true };
  }
  const r = runScript('publish_blog.js', [topicId, '--push']);
  return { ok: r.ok, msg: brief(r.out, ['已完成', '上线', 'push', '重建']), raw: r.out };
}

const STEPS = {
  render: stepRender,
  factcheck: stepFactcheck,
  checklist: stepChecklist,
  publish: stepPublish,
};

// ────────────────────────── 推进单个包 ──────────────────────────

function advance(topicId, opts = {}) {
  const t = readTopic(topicId);
  if (!t) return { topicId, err: '缺 00_topic.json' };

  const level = String(t.level || 'G1 待裁').trim();
  const auto = AUTO[level];
  const log = [];

  // ── 人工关卡：停下等批示 ──
  if (!auto) {
    const g = GATES.find((x) => level.startsWith(x));
    if (g) return { topicId, level, waiting: g, title: t.title, log };
    if (level === '已发布') return { topicId, level, done: true, title: t.title, log };
    return { topicId, level, unknown: true, title: t.title, log };
  }

  // ── 自动段 ──
  let blocked = 0;
  for (const s of auto) {
    const r = STEPS[s](topicId);
    log.push({ step: s, ok: r.ok, msg: r.msg });
    if (!r.ok) {
      appendReview(topicId, `pipeline/${s} 未通过：${r.msg}`);
      break;
    }
    if (s === 'factcheck') blocked = r.blocked || 0;
  }

  const allOk = log.every((l) => l.ok);

  if (level === 'S3 待产') {
    if (!allOk) {
      t.level = 'S3 待产';
      saveTopic(topicId, t);
      return { topicId, level: t.level, title: t.title, log, stalled: true };
    }
    t.level = blocked > 0 ? 'G2 待审' : 'G2 待审';
    saveTopic(topicId, t);
    appendReview(topicId, `pipeline：封面 ${countAssets(topicId)} 张 + 清单已生成，${blocked > 0 ? `factcheck 阻断 ${blocked} 项` : 'factcheck 通过'}，交 G2`);
    return { topicId, level: t.level, title: t.title, log, blocked, advanced: true };
  }

  if (level === 'S5 待发') {
    if (!allOk) {
      return { topicId, level, title: t.title, log, stalled: true };
    }
    t.level = '已发布';
    t.publishedAt = today();
    saveTopic(topicId, t);
    appendReview(topicId, 'pipeline：长文已入库并 push，进入「已发布」');
    return { topicId, level: t.level, title: t.title, log, advanced: true, published: true };
  }

  return { topicId, level, title: t.title, log };
}

function countAssets(topicId) {
  const d = path.join(packageDir(topicId), 'assets');
  if (!exists(d)) return 0;
  return fs.readdirSync(d).filter((f) => /\.(png|jpg)$/i.test(f)).length;
}

// ────────────────────────── 批示 ──────────────────────────

function approve(gate, ids, opts = {}) {
  const res = [];
  for (const id of ids) {
    const t = readTopic(id);
    if (!t) { res.push({ id, err: '未找到' }); continue; }
    const cur = String(t.level || '');
    if (!cur.startsWith(gate)) {
      res.push({ id, err: `当前关卡是「${cur}」，不是 ${gate} 待审` });
      continue;
    }
    const next = NEXT[gate];
    t.level = next;
    t.gates = t.gates || {};
    t.gates[gate] = { at: today(), by: 'Luke' };
    saveTopic(id, t);
    appendReview(id, `${gate} 通过 → ${next}${opts.reason ? `（${opts.reason}）` : ''}`);
    res.push({ id, from: cur, to: next });
  }
  return res;
}

function reject(gate, ids, opts = {}) {
  const res = [];
  for (const id of ids) {
    const t = readTopic(id);
    if (!t) { res.push({ id, err: '未找到' }); continue; }
    const cur = String(t.level || '');
    t.level = `${gate} 驳回`;
    t.gates = t.gates || {};
    t.gates[gate] = { at: today(), by: 'Luke', rejected: true, reason: opts.reason || '' };
    saveTopic(id, t);
    appendReview(id, `${gate} 驳回（原 ${cur}）${opts.reason ? `：${opts.reason}` : ''}`);
    res.push({ id, from: cur, to: t.level });
  }
  return res;
}

// ────────────────────────── 批示台 GATES.md ──────────────────────────

/**
 * 对账：长文已进 blog-src 的包，自动收敛为「已发布」
 * （历史包可能是人工发布的，level 还停在 Gx 待审，不该长期占着批示台）
 * 注意：这里只代表「长文已上线」，小红书发布无 API，仍需本人在 App 完成。
 */
function reconcilePublished() {
  const fixed = [];
  for (const id of listPackages()) {
    const t = readTopic(id);
    if (!t) continue;
    const level = String(t.level || '');
    if (level === '已发布') continue;
    const slug = t.linkedSlug || t['关联slug'];
    if (slug && exists(path.join(P.BLOG_SRC, `${slug}.md`))) {
      t.level = '已发布';
      t.xhsStatus = t.xhsStatus || '待发（App 手工，无 API）';
      saveTopic(id, t);
      appendReview(id, `对账：长文 ${slug} 已在 blog-src，收敛为「已发布」`);
      fixed.push({ id, from: level });
    }
  }
  return fixed;
}

/** 从 GATES.md 读勾选状态，写回 level（Luke 打勾即批示） */
function syncFromGates() {
  const f = path.join(P.CONTENT_OPS, 'GATES.md');
  if (!exists(f)) return { synced: [], reason: 'GATES.md 不存在' };
  const md = fs.readFileSync(f, 'utf8');
  const synced = [];

  // 段落格式：## G2 草案审批 … - [x] <topicId> · 标题
  const blocks = md.split(/\n##\s+/).slice(1);
  for (const b of blocks) {
    const head = b.split('\n')[0].trim();
    const gate = GATES.find((g) => head.startsWith(g));
    if (!gate) continue;
    // 只认「通过」段落，驳回用命令行（要写原因）
    const re = /^\s*-\s*\[(x|X)\]\s*`?([\w-]+)`?/gm;
    let m;
    const ids = [];
    while ((m = re.exec(b))) ids.push(m[2]);
    if (ids.length) {
      const r = approve(gate, ids, { reason: 'GATES.md 勾选' });
      synced.push(...r.filter((x) => !x.err));
    }
  }
  return { synced };
}

function renderGates() {
  const pkgs = listPackages();
  const buckets = {};
  GATES.forEach((g) => (buckets[g] = []));
  const other = [];

  for (const id of pkgs) {
    const t = readTopic(id);
    if (!t) { other.push({ id, level: '（缺元数据）', title: '' }); continue; }
    const level = String(t.level || 'G1 待裁');
    const g = GATES.find((x) => level.startsWith(x) && !level.includes('驳回'));
    const row = { id, level, title: t.title || '', grade: t.grade || '', score: t.score || '', blocked: level.includes('驳回') };
    if (g) buckets[g].push(row); else other.push(row);
  }

  const L = [];
  L.push('# 批示台 · GATES');
  L.push('');
  L.push(`> 自动生成于 ${nowStr()}　｜　**你要做的唯一动作：在下面的方框里打勾。**`);
  L.push('> 打勾后下次流水线运行（周一 09:00 自动，或手动 `--sync --run`）会自动往下推。');
  L.push('> 驳回不要用打勾，用命令行写原因：`node scripts/contentops/pipeline.js --reject G2 <topicId> --reason "…"`');
  L.push('');
  L.push('> **关卡纪律（2026-10-26 定，务必遵守）**：G1 是真正的决策点。');
  L.push('> 选题卡阶段只给 **标题 / 切入角度 / 一句核心钩子 / 风险标注 / 得分**，不写正文、不渲染图。');
  L.push('> **Luke 勾了 G1，agent 才动笔。** 被否掉的选题不生产，不浪费成本。');
  L.push('> 新包建包时 `level` 一律写 `G1 待裁`，不许直接写 `S3 待产` —— 直接写 S3 等于跳过 G1，把生米煮成熟饭再来要放行章。');
  L.push('');

  const META = {
    'G1': { q: '这个选题做不做？', look: '看标题 + 角度 + 得分 + 风险标注（此时还没写正文、没渲染图）' },
    'G2': { q: '文字能不能发？', look: '看 02_xhs.md 正文 + 05_factcheck.json（红=必改，黄=你定）' },
    'G3': { q: '图能不能用？', look: '看 assets/ 里的封面与内页 PNG（缩略图下别糊、别错字）' },
    'G4': { q: '现在发不发？', look: '看 checklist.md 8 项，第 7/8 项要你人工确认' },
  };

  let pending = 0;
  for (const g of GATES) {
    const rows = buckets[g];
    const m = META[g];
    L.push(`## ${GATE_LABEL[g]}`);
    L.push('');
    L.push(`**要回答的问题**：${m.q}　　**看什么**：${m.look}`);
    L.push('');
    if (!rows.length) {
      L.push('_（当前无待批示项）_');
      L.push('');
      continue;
    }
    pending += rows.length;
    for (const r of rows) {
      const meta = [r.grade, r.score ? `${r.score}分` : '', r.level].filter(Boolean).join(' · ');
      L.push(`- [ ] \`${r.id}\`　${r.title}　${meta ? `_${meta}_` : ''}`);
    }
    L.push('');
  }

  if (other.length) {
    L.push('## 其它状态');
    L.push('');
    for (const r of other) {
      L.push(`- \`${r.id}\`　${r.title || ''}　—— **${r.level}**${r.blocked ? '（需改写后重新提交）' : ''}`);
    }
    L.push('');
  }

  L.push('---');
  L.push('');
  L.push('## 命令速查');
  L.push('');
  L.push('```bash');
  L.push('node scripts/contentops/pipeline.js --status          # 刷新本文件');
  L.push('node scripts/contentops/pipeline.js --sync --run      # 读勾选 → 自动推进');
  L.push('node scripts/contentops/pipeline.js --approve G2 <id> # 命令行批准');
  L.push('```');
  L.push('');

  return { md: L.join('\n'), pending };
}

// ────────────────────────── CLI ──────────────────────────

function parseArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const s = argv[i];
    if (s.startsWith('--')) {
      const k = s.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) { a[k] = next; i++; }
      else a[k] = true;
    } else a._.push(s);
  }
  return a;
}

function main() {
  const a = parseArgs(process.argv.slice(2));
  const json = !!a.json;

  // 每次运行先对账：已上线的长文不再占批示台
  const reconciled = reconcilePublished();
  if (reconciled.length && !json) {
    reconciled.forEach((x) => console.log(`${C.dim('⟳')} ${x.id}　${x.from} → 已发布（长文已在线）`));
  }

  // 批示：--approve / --reject
  if (a.approve || a.reject) {
    const gate = String(a.approve || a.reject).toUpperCase();
    const ids = String(a._[0] || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (!GATES.includes(gate) || !ids.length) {
      console.error(C.red('用法：--approve <G1|G2|G3|G4> <topicId>[,<topicId>] [--reason "…"]'));
      process.exit(2);
    }
    const r = a.approve ? approve(gate, ids, { reason: a.reason }) : reject(gate, ids, { reason: a.reason });
    if (json) { console.log(JSON.stringify(r, null, 2)); }
    else {
      r.forEach((x) => {
        if (x.err) console.log(`${C.red('✗')} ${x.id}：${x.err}`);
        else console.log(`${C.green('✓')} ${x.id}　${x.from} → ${C.bold(x.to)}`);
      });
    }
    // 批示完顺手刷新批示台
    const g = renderGates();
    fs.writeFileSync(path.join(P.CONTENT_OPS, 'GATES.md'), g.md, 'utf8');
    return;
  }

  // 同步勾选
  if (a.sync) {
    const s = syncFromGates();
    if (!json) {
      if (!s.synced.length) console.log(C.dim('GATES.md 没有新的勾选。'));
      else s.synced.forEach((x) => console.log(`${C.green('✓')} 勾选生效：${x.id}　${x.from} → ${x.to}`));
    }
    if (!a.run) return;
  }

  // 推进
  if (a.run) {
    const ids = a.topic ? String(a.topic).split(',').map((s) => s.trim()) : listPackages();
    const out = [];
    let blocked = 0;
    for (const id of ids) {
      const r = advance(id);
      out.push(r);
      if (r.blocked) blocked += r.blocked;
      if (json) continue;
      const tag = r.waiting ? C.yellow(`⏸ 等 ${r.waiting}`)
        : r.done ? C.green('✔ 已发布')
        : r.advanced ? C.green('▶ 已推进')
        : r.stalled ? C.red('✖ 卡住')
        : C.dim('—');
      console.log(`${tag}　${id}　${C.dim(r.level || '')}　${r.title || r.err || ''}`);
      (r.log || []).forEach((l) => console.log(`      ${l.ok ? C.green('·') : C.red('·')} ${l.step}：${l.msg}`));
    }
    // 刷新批示台
    const g = renderGates();
    fs.writeFileSync(path.join(P.CONTENT_OPS, 'GATES.md'), g.md, 'utf8');
    if (json) console.log(JSON.stringify({ ran: out, pending: g.pending }, null, 2));
    else console.log(C.dim(`\n批示台已刷新：content-ops/GATES.md（${g.pending} 项待你打勾）`));
    process.exit(blocked > 0 ? 1 : 0);
  }

  // 默认：刷新并打印批示台
  const g = renderGates();
  fs.writeFileSync(path.join(P.CONTENT_OPS, 'GATES.md'), g.md, 'utf8');
  if (json) console.log(JSON.stringify({ pending: g.pending }, null, 2));
  else {
    console.log(g.md);
    console.log(C.dim(`\n已写入 content-ops/GATES.md　待批示 ${g.pending} 项`));
  }
}

main();
