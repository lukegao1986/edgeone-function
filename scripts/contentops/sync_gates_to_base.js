#!/usr/bin/env node
/**
 * sync_gates_to_base.js —— 把本地 GATES 关卡状态单向回写飞书 Base「选题池」表
 *
 * 背景：批示台在本地 content-ops/GATES.md，飞书 Base 只是台账。不回写的话，
 * Base 里的「关卡状态」会一直停在「待审」，Luke 在飞书看着像卡住，其实流水线在跑。
 *
 * 写入两个字段：
 *   流水线关卡（单选，本脚本创建）  ← 精确的 GATES level，如「G2 待审」
 *   关卡状态（单选，原有字段）      ← 粗粒度映射：待审 / 通过 / 退回
 *
 * 用法：
 *   node scripts/contentops/sync_gates_to_base.js            # dry-run，只打印差异
 *   node scripts/contentops/sync_gates_to_base.js --apply     # 真正写入
 *
 * 注意：需要 lark-cli 的 user 登录态（读 Keychain）。在 WorkBuddy 自动化里跑时，
 * 该命令必须带 dangerouslyDisableSandbox: true，否则拿不到凭证。
 */

const { execFileSync } = require('child_process');
const { listPackages, pkgFile, readJSON, exists } = require('./lib/paths');

const BASE_TOKEN = process.env.EJU_BASE_TOKEN || 'LA0MbLX4fasekas388bc5J92nde';
const TABLE_ID = process.env.EJU_BASE_TABLE || 'tblRfXW1nsCekzv3';
const FIELD_STAGE = '流水线关卡';
const FIELD_STATE = '关卡状态';

const STAGE_OPTIONS = [
  'G1 待裁', 'S3 待产', 'G2 待审', 'G3 待审', 'G4 待审', 'S5 待发', '已发布', '已驳回',
];

/** 精确关卡：把 level 收敛到字段选项上 */
function toStage(level) {
  const s = String(level || '').trim();
  if (s.includes('驳回')) return '已驳回';
  if (STAGE_OPTIONS.includes(s)) return s;
  const hit = STAGE_OPTIONS.find((o) => s.startsWith(o.slice(0, 2)));
  return hit || '';
}

/** 粗粒度状态：给「待审/通过/退回」三选一用 */
function toState(level) {
  const s = String(level || '').trim();
  if (s.includes('驳回')) return '退回';
  if (s.includes('已发布')) return '通过';
  return '待审';
}

function lark(args) {
  try {
    const out = execFileSync('lark-cli', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    return JSON.parse(out);
  } catch (e) {
    const msg = (e.stdout || '') + (e.stderr || '');
    throw new Error(`lark-cli 调用失败：${(e.message || '').trim()}\n${msg.slice(0, 800)}`);
  }
}

/**
 * 拉取全部记录，返回 [{recordId, topicId, stage, state, title}]
 * 分页用 --offset / --limit（json 格式单次上限 200）；记录 ID 在 data.record_id_list 里，按行对齐。
 */
function fetchRecords() {
  const rows = [];
  let offset = 0;
  const LIMIT = 200;
  for (;;) {
    const d = lark([
      'base', '+record-list',
      '--base-token', BASE_TOKEN,
      '--table-id', TABLE_ID,
      '--field-id', '选题标题',
      '--field-id', 'topicId',
      '--field-id', FIELD_STAGE,
      '--field-id', FIELD_STATE,
      '--offset', String(offset),
      '--limit', String(LIMIT),
      '--as', 'user',
      '--format', 'json',
    ]);
    const data = (d && d.data) || {};
    const fields = data.fields || [];
    const raw = data.data || [];
    const ids = data.record_id_list || [];
    raw.forEach((r, i) => {
      const o = {};
      fields.forEach((f, j) => { o[f] = r[j]; });
      rows.push({
        recordId: ids[i] || '',
        topicId: String(o.topicId || '').trim(),
        title: String(o['选题标题'] || '').trim(),
        stage: Array.isArray(o[FIELD_STAGE]) ? (o[FIELD_STAGE][0] || '') : String(o[FIELD_STAGE] || ''),
        state: Array.isArray(o[FIELD_STATE]) ? (o[FIELD_STATE][0] || '') : String(o[FIELD_STATE] || ''),
      });
    });
    if (!data.has_more || !raw.length) break;
    offset += raw.length;
  }
  return rows;
}

function main() {
  const apply = process.argv.includes('--apply');

  const local = [];
  for (const id of listPackages()) {
    const f = pkgFile(id, '00_topic.json');
    if (!exists(f)) continue;
    const t = readJSON(f) || {};
    local.push({
      topicId: id,
      level: String(t.level || 'G1 待裁').trim(),
      title: String(t.title || t['标题'] || '').trim(),
    });
  }

  let rows;
  try {
    rows = fetchRecords();
  } catch (e) {
    console.error(`✗ 读飞书失败：${e.message}`);
    console.error('  提示：本脚本需要 lark-cli 的 user 登录态，自动化里跑要开 dangerouslyDisableSandbox。');
    process.exit(1);
  }

  const byTopic = new Map();
  for (const r of rows) if (r.topicId) byTopic.set(r.topicId, r);

  const updates = {};
  const diff = [];
  const skipped = [];
  const notInBase = [];

  for (const p of local) {
    const rec = byTopic.get(p.topicId);
    if (!rec) { notInBase.push(p); continue; }
    const stage = toStage(p.level);
    const state = toState(p.level);
    if (!stage) { skipped.push(`${p.topicId}（level「${p.level}」无法映射）`); continue; }
    if (rec.stage === stage && rec.state === state) continue;
    updates[rec.recordId] = { [FIELD_STAGE]: [stage], [FIELD_STATE]: [state] };
    diff.push(`${p.topicId}　${rec.stage || '（空）'} → ${stage}　｜状态 ${rec.state || '（空）'} → ${state}`);
  }

  const ids = Object.keys(updates);
  console.log(`本地包 ${local.length} 个 ｜ Base 记录 ${rows.length} 条 ｜ 需更新 ${ids.length} 条`);
  if (skipped.length) { console.log('\n无法映射：'); skipped.forEach((x) => console.log('  · ' + x)); }
  if (diff.length) { console.log('\n差异：'); diff.forEach((x) => console.log('  · ' + x)); }
  if (notInBase.length) {
    console.log('\nBase 里没有这些包（不会自动新建）：');
    notInBase.forEach((p) => console.log(`  · ${p.topicId}　${p.title}`));
  }
  if (!ids.length) { console.log('\n✓ 已一致，无需写入。'); return; }

  if (!apply) {
    console.log('\n[dry-run] 加 --apply 才会写入。');
    return;
  }

  const payload = JSON.stringify({ update_records: updates });
  const d = lark([
    'base', '+record-batch-update',
    '--base-token', BASE_TOKEN,
    '--table-id', TABLE_ID,
    '--json', payload,
    '--as', 'user',
    '--format', 'json',
  ]);
  if (d && d.ok) {
    console.log(`\n✓ 已回写 ${ids.length} 条。`);
    if (d.data && d.data.ignored_fields && d.data.ignored_fields.length) {
      console.log('  ⚠ 被忽略的字段：', JSON.stringify(d.data.ignored_fields));
    }
    console.log('  回读校验：lark-cli base +record-list ... --as user --format json');
  } else {
    console.error('✗ 写入失败：', JSON.stringify(d).slice(0, 600));
    process.exit(1);
  }
}

main();
