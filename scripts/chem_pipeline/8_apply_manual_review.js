#!/usr/bin/env node
/**
 * 8_apply_manual_review.js — 应用人工审阅回写（先出差异清单，确认后 --apply 应用）
 *
 * 规则：
 *  - 人工指定 topicCode 优先；subtopicCodes 必须来自该前缀并重新核验（存在且归属 newTopic），
 *    任一不合法则该行整体不应用；人工未填子考点且原子考点前缀不符时清空并标注待选。
 *  - 同步 JSON 与 preview（仅考点行与头部审阅状态行），不修改 businessCode/选项/答案/解析。
 *  - 只有人工审核结论=通过 且 考纲核验通过 的题才设 reviewStatus=approved（可入库）；
 *    审核结论=不通过 则置 rejected，取消可入库；其余保持原状。
 *  - 人工意见追加至 JSON.reviewNotes（数组，去重）。
 *
 * 用法：
 *   node 8_apply_manual_review.js            # 仅输出回写差异清单（不改数据）
 *   node 8_apply_manual_review.js --apply    # 确认差异后应用回写
 *   [--csv=docs/Topic_Review_Reports/xxx.csv] 指定审阅表（默认取最新）
 *
 * 输出：docs/Topic_Review_Reports/review_apply_diff_{date}.json（差异清单）
 *       docs/Topic_Review_Reports/review_apply_report_{date}.json（--apply 后应用报告）
 */
'use strict';

const fs = require('fs');
const path = require('path');
const {
  ROOT, REPORT_DIR, loadSyllabusIndex, readCsv,
  unitJsonPath, unitPreviewPath, unitOf,
} = require('./step6_review_common.cjs');

const MANUAL_COLS = ['人工topicCode', '人工subtopicCodes', '审核结论', '人工意见'];
const APPROVED_VALUES = new Set(['通过', 'approved', 'APPROVED', 'Approved', '合规', '合格']);
const REJECTED_VALUES = new Set(['不通过', 'rejected', '拒绝', '不合规']);

function todayStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function lastReviewCsv() {
  if (!fs.existsSync(REPORT_DIR)) return null;
  const files = fs.readdirSync(REPORT_DIR).filter((f) => /^chem_step6_review_.+\.csv$/.test(f)).sort().reverse();
  return files.length ? path.join(REPORT_DIR, files[0]) : null;
}

function splitSubCodes(raw) {
  return String(raw || '').split(/[,;；|，]/).map((s) => s.trim()).filter(Boolean);
}

/**
 * 计算单个回写项：{ businessCode, unit, jsonPath, idx, newTopic, newSubs, reviewStatus, newOpinion, diffs, ok, errors, originallyApproved }
 */
function computeRow(r, syl) {
  const { topicSet, subtopicSet } = syl;
  const biz = r.businessCode;
  const unit = unitOf(biz);
  const out = {
    businessCode: biz, unit, jsonPath: null, idx: null,
    newTopic: null, newSubs: null, reviewStatus: null, newOpinion: '',
    diffs: [], ok: true, errors: [],
  };
  if (!unit) { out.ok = false; out.errors.push('无法从 businessCode 解析单元'); return out; }
  out.jsonPath = unitJsonPath(unit);
  if (!fs.existsSync(out.jsonPath)) { out.ok = false; out.errors.push('Step6 JSON 不存在'); return out; }
  const drafts = JSON.parse(fs.readFileSync(out.jsonPath, 'utf8'));
  const idx = drafts.findIndex((d) => d.businessCode === biz);
  if (idx < 0) { out.ok = false; out.errors.push('JSON 中找不到该 businessCode'); return out; }
  out.idx = idx;
  const d = drafts[idx];

  // ---- topicCode（人工优先）----
  const manualTopic = (r['人工topicCode'] || '').trim();
  let newTopic = d.topicCode || '';
  if (manualTopic) {
    if (topicSet.has(manualTopic)) {
      newTopic = manualTopic;
    } else {
      out.ok = false; out.errors.push(`人工topicCode 不在考纲: ${manualTopic}`);
    }
  }
  if (!newTopic) { out.ok = false; out.errors.push('原题缺考点且人工未指定'); }
  out.newTopic = newTopic || null;

  // ---- subtopicCodes（必须来自 newTopic 前缀并逐项核验）----
  const manualSubs = splitSubCodes(r['人工subtopicCodes']);
  let newSubs = null;
  const issues = [];
  const verifySubs = (codes) => {
    const ok = [];
    for (const st of codes) {
      const sub = subtopicSet.get(st);
      if (!sub) { issues.push(`子考点不在考纲: ${st}`); continue; }
      if (sub.topicId !== newTopic) { issues.push(`子考点不属于 ${newTopic}: ${st}→${sub.topicId}`); continue; }
      ok.push(st);
    }
    return ok;
  };
  if (manualSubs.length) {
    const verified = verifySubs(manualSubs);
    if (issues.length) {
      out.ok = false; out.errors.push(...issues);
    } else {
      newSubs = verified;
    }
  } else {
    const orig = Array.isArray(d.subtopicCodes) ? d.subtopicCodes : [];
    if (orig.length) {
      const verified = verifySubs(orig);
      if (!issues.length) {
        newSubs = verified;
      } else {
        newSubs = []; // 前缀不符/过期子考点：清空待人工重选
        out.diffs.push({ field: 'subtopicCodes', old: JSON.stringify(orig), new: '[]', note: '子考点已清空，待人工按新考点重选' });
      }
    } else {
      newSubs = []; // 原本无子考点：保持空
    }
  }
  if (out.ok && out.newTopic !== null && newSubs !== null) {
    out.newTopic = newTopic;
    out.newSubs = newSubs;
  } else {
    out.newTopic = null; out.newSubs = null;
  }

  // ---- reviewStatus（仅人工明确通过且考纲核验无错才可入库）----
  const verdict = (r['审核结论'] || '').trim();
  if (verdict) {
    if (APPROVED_VALUES.has(verdict)) {
      if (out.ok && !issues.length) {
        out.reviewStatus = 'approved';
      } else if (out.ok) {
        out.diffs.push({ field: 'reviewStatus', old: '', new: '', note: '考纲未核验通过，不设可入库标记' });
      }
    } else if (REJECTED_VALUES.has(verdict)) {
      out.reviewStatus = 'rejected';
    } else {
      out.errors.push(`审核结论取值无法识别: ${verdict}（应为 通过/不通过）`);
      out.ok = false;
    }
  }

  // ---- 人工意见（追加 reviewNotes）----
  out.newOpinion = (r['人工意见'] || '').trim();

  // ---- 汇总差异 ----
  if (out.ok) {
    if (newTopic !== d.topicCode) {
      out.diffs.push({ field: 'topicCode', old: d.topicCode || '', new: newTopic });
    }
    if (newSubs !== null && JSON.stringify(newSubs) !== JSON.stringify(d.subtopicCodes || [])) {
      out.diffs.push({ field: 'subtopicCodes', old: JSON.stringify(d.subtopicCodes || []), new: JSON.stringify(newSubs) });
    }
    if (out.reviewStatus === 'approved' && d.reviewStatus !== 'approved') {
      out.diffs.push({ field: 'reviewStatus', old: d.reviewStatus || '', new: 'approved' });
    }
    if (out.reviewStatus === 'rejected' && d.reviewStatus !== 'rejected') {
      out.diffs.push({ field: 'reviewStatus', old: d.reviewStatus || '', new: 'rejected' });
    }
    if (out.newOpinion) {
      const notes = Array.isArray(d.reviewNotes) ? d.reviewNotes : [];
      if (!notes.includes(out.newOpinion)) {
        out.diffs.push({ field: 'reviewNotes', old: JSON.stringify(notes), new: JSON.stringify([...notes, out.newOpinion]), note: '追加人工意见' });
      }
    }
    if (!out.diffs.length) out.ok = false; // 无实际变更的行不参与
  }
  return out;
}

/** 应用单行到 draft（调用前已确认） */
function applyDraft(draft, row) {
  if (row.newTopic !== null && row.newTopic !== undefined) draft.topicCode = row.newTopic;
  if (row.newSubs !== null) draft.subtopicCodes = row.newSubs;
  if (row.reviewStatus) draft.reviewStatus = row.reviewStatus;
  if (row.newOpinion) {
    if (!Array.isArray(draft.reviewNotes)) draft.reviewNotes = [];
    if (!draft.reviewNotes.includes(row.newOpinion)) draft.reviewNotes.push(row.newOpinion);
  }
  return draft;
}

/** 同步 preview：替换该题考点行 + 头部审阅状态行 */
function syncPreview(preview, rows, date) {
  let text = preview;
  const headerLine = `人工审阅: ${date} 回写 ${rows.length} 题`;
  if (/^人工审阅: \d{4}-\d{2}-\d{2} 回写 \d+ 题.*$/m.test(text)) {
    text = text.replace(/^人工审阅: \d{4}-\d{2}-\d{2} 回写 \d+ 题.*$/m, headerLine);
  } else {
    text = text.replace(/^来源:.*$/m, (m) => m + '\n' + headerLine);
  }
  for (const row of rows) {
    // 定位该题块（## [难度 ...] businessCode ... 到下一个 ## [难度 或文末）
    const re = new RegExp(`(## \\[难度 [^\\n]*)${escapeRe(row.businessCode)}[^\\n]*`, 'm');
    if (!re.test(text)) continue;
    // 注意：不能带 'm' 标志——m 下前瞻里的 $ 会在标题行行尾即刻命中，块被截断为空，考点行永不更新
    const blockMatch = text.match(new RegExp(`(## \\[难度 [^\\n]*${escapeRe(row.businessCode)}[^\\n]*)([\\s\\S]*?)(?=\\n---\\n|\\n## \\[难度 )`));
    if (!blockMatch) continue;
    const block = blockMatch[2];
    const newKw = `**考点**: ${row.newTopic}${row.newSubs && row.newSubs.length ? ' | ' + row.newSubs.join(', ') : '（未定）'}`;
    const newBlock = block.replace(/^\*\*考点\*\*:.*$/m, newKw);
    if (newBlock !== block) {
      text = text.slice(0, blockMatch.index + blockMatch[1].length) + newBlock + text.slice(blockMatch.index + blockMatch[1].length + block.length);
    }
  }
  return text;
}
function escapeRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const csvArg = args.find((a) => a.startsWith('--csv='));
  const csvPath = csvArg ? csvArg.slice('--csv='.length) : lastReviewCsv();
  if (!csvPath || !fs.existsSync(csvPath)) {
    console.error('未找到审阅表 CSV（可用 --csv= 指定）');
    process.exit(1);
  }
  const date = todayStamp();
  const syl = loadSyllabusIndex();

  const parsed = readCsv(csvPath);
  if (!parsed || !parsed.header.includes('businessCode')) {
    console.error('CSV 解析失败或缺少 businessCode 列:', csvPath);
    process.exit(1);
  }
  const rows = parsed.rows
    .filter((r) => MANUAL_COLS.some((c) => (r[c] || '').trim() !== ''))
    .map((r) => computeRow(r, syl));

  const okRows = rows.filter((r) => r.ok);
  const badRows = rows.filter((r) => !r.ok);
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const diffFile = path.join(REPORT_DIR, `review_apply_diff_${date}.json`);
  fs.writeFileSync(diffFile, JSON.stringify({
    generatedAt: new Date().toISOString(),
    csv: csvPath, mode: apply ? 'APPLY' : 'DIFF_ONLY',
    summary: { reviewedRows: rows.length, ok: okRows.length, error: badRows.length, wouldChange: okRows.filter((r) => r.diffs.length).length },
    changes: okRows.map((r) => ({ businessCode: r.businessCode, unit: r.unit, diffs: r.diffs })),
    errors: badRows.map((r) => ({ businessCode: r.businessCode, errors: r.errors })),
  }, null, 2), 'utf8');

  console.log('审阅表: ', csvPath);
  console.log('读取人工填写行: ', rows.length, '| 可回写: ', okRows.length, '| 校验失败: ', badRows.length);
  console.log('差异清单: ', diffFile);
  if (!apply) {
    console.log('\n===== 回写差异清单（未应用）=====');
    for (const r of okRows) {
      console.log(`- ${r.businessCode}`);
      r.diffs.forEach((d) => console.log(`    ${d.field}: ${d.old || '∅'} → ${d.new || '∅'}${d.note ? '  (' + d.note + ')' : ''}`));
    }
    if (badRows.length) {
      console.log('\n[未应用，待修正]');
      badRows.forEach((r) => console.log(`- ${r.businessCode}: ${r.errors.join('; ')}`));
    }
    console.log('\n确认无误后执行: node 8_apply_manual_review.js --apply' + (csvArg ? '' : ' [--csv=...]'));
    return;
  }

  // ---- 应用 ----
  const byUnit = new Map();
  for (const r of okRows) {
    if (!byUnit.has(r.unit)) byUnit.set(r.unit, []);
    byUnit.get(r.unit).push(r);
  }
  const appliedUnits = [];
  for (const [unit, unitRows] of byUnit) {
    const jp = unitJsonPath(unit);
    const drafts = JSON.parse(fs.readFileSync(jp, 'utf8'));
    for (const r of unitRows) { applyDraft(drafts[r.idx], r); }
    fs.writeFileSync(jp, JSON.stringify(drafts, null, 2));

    const pp = unitPreviewPath(unit);
    if (fs.existsSync(pp)) {
      const preview = fs.readFileSync(pp, 'utf8');
      fs.writeFileSync(pp, syncPreview(preview, unitRows, date));
    }
    appliedUnits.push(unit);
  }

  const reportFile = path.join(REPORT_DIR, `review_apply_report_${date}.json`);
  fs.writeFileSync(reportFile, JSON.stringify({
    generatedAt: new Date().toISOString(),
    applied: {
      units: appliedUnits,
      count: okRows.length,
      approvedCount: okRows.filter((r) => r.reviewStatus === 'approved').length,
      rejectedCount: okRows.filter((r) => r.reviewStatus === 'rejected').length,
      skippedDuplicate: 0,
    },
    unchangedOrSkipped: badRows.map((r) => ({ businessCode: r.businessCode, errors: r.errors })),
    note: '已同步各章 JSON 与 preview；businessCode/选项/答案/解析未改动。',
  }, null, 2), 'utf8');

  console.log('\n[APPLIED] 已应用单位:', appliedUnits.join(', '));
  console.log('应用报告: ', reportFile);
  console.log('通过(可入库): ', okRows.filter((r) => r.reviewStatus === 'approved').length,
    '| 不通过: ', okRows.filter((r) => r.reviewStatus === 'rejected').length);
}

main();