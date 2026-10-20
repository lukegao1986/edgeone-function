#!/usr/bin/env node
/**
 * d1_driver.cjs — 通用"把 needs_review 草稿接入 D1 组合选项生成器"驱动（che1/che2 等共用）
 *
 * 职责：
 *  1. 取基础题块 answerSlots 的 value 作为每槽"正确值"（权威，不回退、不拆改槽粒度）；
 *  2. 取候选池（可由各章传入，如 che2_d1_candidates.cjs）中对应槽的 label 与 distractors；
 *  3. 组装 cells → d1_option_generator.generate(...)；
 *  4. 把结果(options/correctIndex/combos/blocked)写回草稿并叠加 reviewIssues/d1 元数据。
 *
 * 对 overrideStatus='blocked'（INSUFFICIENT_DISTRACTORS 等）直接置 blocked。
 *
 * 用法：applyD1ToDrafts(drafts, CANDIDATES)
 */
'use strict';

const { generate } = require('./d1_option_generator.cjs');
const { CANDIDATES: DEFAULT_CANDIDATES } = require('./che2_d1_candidates.cjs');

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 为单条 needs_review 草稿应用 D1 构造（就地修改 draft 对象），返回 true 表示处理过。
 * @param {Object} draft 来自 che2_pilot_content.build() 的草稿
 * @param {Object} [CANDIDATES] 候选池（缺省用 che2 候选池，兼容旧调用）
 */
function applyD1(draft, CANDIDATES = DEFAULT_CANDIDATES) {
  const spec = CANDIDATES[draft.businessCode];
  if (!spec) return false;

  // 强制阻断（INSUFFICIENT_DISTRACTORS 等）
  if (spec.overrideStatus === 'blocked') {
    draft.generationStatus = 'blocked';
    draft.optionMode = 'blocked';
    draft.options = [];
    draft.correctIndex = null;
    draft.reviewIssues = draft.reviewIssues || [];
    draft.reviewIssues.push(`D1：${spec.overrideReason}，整题阻断，不构造选项、不凑数。`);
    draft.d1 = { status: 'blocked', reason: spec.overrideReason, N: draft.N, K: Math.min(2 * (draft.N || 0) + 2, 12) };
    return true;
  }

  const slots = draft.answerSlots || [];
  if (slots.length === 0) {
    draft.reviewIssues = draft.reviewIssues || [];
    draft.reviewIssues.push('D1：无 answerSlots，无法构造组合选项。');
    return true;
  }
  if (slots.length !== spec.cells.length) {
    draft.reviewIssues = draft.reviewIssues || [];
    draft.reviewIssues.push(`D1：候选池槽数(${spec.cells.length})与 answerSlots(${slots.length})不一致，跳过构造留待人工核对。`);
    return true;
  }

  // 组装 cells：correct 取自 answerSlots（剥离候选 label 前缀，避免重复），distractors 取自候选池
  const cells = spec.cells.map((c, i) => {
    const raw = String(slots[i].value);
    const label = c.label || '';
    // 若 raw 以 label 开头，则剥掉前缀只保留内容，避免渲染重复 (xxx) (xxx)xxx
    const displayValue = label && raw.startsWith(label) ? raw.slice(label.length) : raw;
    return {
      label: label || slots[i].sourceLabel || String(i + 1),
      correct: displayValue,
      distractors: c.distractors || [],
    };
  });

  const result = generate(cells, draft.businessCode);

  if (result.insufficient) {
    draft.generationStatus = 'blocked';
    draft.optionMode = 'blocked';
    draft.options = [];
    draft.correctIndex = null;
    draft.reviewIssues = (draft.reviewIssues || []).concat([
      `D1：可构造组合不足 K（need=${result.need}、found=${result.found}）→ INSUFFICIENT_DISTRACTORS 阻断。`,
    ]);
    draft.d1 = { status: 'blocked', reason: 'INSUFFICIENT_DISTRACTORS', need: result.need, found: result.found, N: result.N, K: result.K };
    return true;
  }

  // 构造成功：提升为 draft（可入库候选，需抽检化学语义）
  draft.generationStatus = 'draft';
  draft.optionMode = 'd1_combined';
  draft.options = result.options;
  draft.correctIndex = result.correctIndex;
  draft.reviewIssues = (draft.reviewIssues || []).concat([
    `D1：已自动构造 K=${result.K} 个组合选项（正确位已按固定种子打散至 ${result.correctIndex}）。请抽检每个干扰项是否化学语义成立且仅一个正确组合。`,
  ]);
  draft.d1 = {
    status: 'constructed',
    N: result.N,
    K: result.K,
    correctIndex: result.correctIndex,
    combos: result.combos,
    note: spec.note || '',
    coverage: result.coverage,
    actualCounts: result.actualCounts,
    balanceNote: result.balanceNote,
  };
  return true;
}

/** 批量处理：只处理 generationStatus == 'needs_review' 且候选池有定义的题 */
function applyD1ToDrafts(drafts, CANDIDATES = DEFAULT_CANDIDATES) {
  let applied = 0;
  for (const d of drafts) {
    if (d.generationStatus === 'needs_review') {
      const handled = applyD1(d, CANDIDATES);
      if (handled) applied += 1;
    }
  }
  return applied;
}

module.exports = { applyD1, applyD1ToDrafts };

if (require.main === module) {
  const { build } = require('./che2_pilot_content.cjs');
  const drafts = build().filter((x) => x.generationStatus === 'needs_review');
  const n = applyD1ToDrafts(drafts);
  console.log(`处理 needs_review 草稿: ${n}`);
  const st = new Map();
  drafts.forEach((x) => st.set(x.generationStatus, (st.get(x.generationStatus) || 0) + 1));
  console.log('处理后状态:', JSON.stringify(Object.fromEntries(st)));
  for (const d of drafts) {
    console.log(`\n### ${d.businessCode} N=${d.N} K=${d.d1 ? d.d1.K : '-'} ${d.generationStatus} correct=${d.correctIndex}/${d.options.length}`);
    if (d.options.length) {
      d.options.forEach((op, i) => {
        const mark = i === d.correctIndex ? '✅' : '  ';
        console.log(`  ${mark} ${i}. ${op}`);
      });
      if (d.correctIndex >= 0) console.log(`  ★正确组合: ${d.options[d.correctIndex]}`);
    }
  }
}