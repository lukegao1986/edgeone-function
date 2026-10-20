#!/usr/bin/env node
/**
 * d1_option_generator.cjs — 通用 D1"多问合并"组合选项生成器（可复用于各章题库）
 *
 * 输入：一条多空题的逐槽候选池
 *   cells: [{ label, correct, distractors: [..] }]
 *   每个 slot 的候选 = [correct, ...distractors]，correct 固定在 index 0。
 * 预算：K = min(2*N + 2, 12)，N = cells.length。
 *
 * 输出：
 *   options:        K 个完整组合的显示字符串（已用固定种子打散正确位）
 *   correctIndex:   正确组合所在零基下标
 *   combos:         [{ option, deltas: [slotId...], rationale, }]（供审计）
 *   若可构造互不相同组合 < K → { insufficient: true, need: K, found: n }
 *
 * 组合语法：每个组合覆盖全部 slot，每 slot 恰好一次，用分号拼接；正确组合 = 每 slot 取 correct。
 * 干扰项优先"改动最少位置"（distance 升序），确保化学误区清晰、可追溯。
 *
 * 不变式：不嵌套数组、不给原题伪造编号、不把集合元素数当 N、只有全向量全对才正确。
 */
'use strict';

const crypto = require('crypto');

function seedFrom(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0;
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffleIndex(n, seedStr) {
  const rnd = mulberry32(seedFrom(seedStr));
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    const t = idx[i]; idx[i] = idx[j]; idx[j] = t;
  }
  return idx;
}

const K_BUDGET = (N) => Math.min(2 * N + 2, 12);

/**
 * 生成所有组合（笛卡尔积），每组合覆盖全部 slot（每个 slot 取一个候选值）。
 */
function cartesian(cells) {
  let acc = []; // 数组的元素为 { values: [], slotIds: [] }
  for (let s = 0; s < cells.length; s += 1) {
    const cell = cells[s];
    const candidates = [cell.correct, ...(cell.distractors || [])];
    if (acc.length === 0) {
      acc = candidates.map((v) => ({ values: [v], slotIds: [String(s)] }));
    } else {
      const next = [];
      for (const base of acc) {
        for (const v of candidates) {
          next.push({ values: [...base.values, v], slotIds: [...base.slotIds, String(s)] });
        }
      }
      acc = next;
    }
  }
  return acc;
}

function distanceFromCorrect(comboValues, cells) {
  let d = 0;
  for (let i = 0; i < cells.length; i += 1) {
    if (comboValues[i] !== cells[i].correct) d += 1;
  }
  return d;
}

function renderCombo(comboValues, cells) {
  return cells.map((cell, i) => `${cell.label} ${comboValues[i]}`).join(' ; ');
}

/**
 * 主入口
 * @param {Array} cells  [{label, correct, distractors:[]}]
 * @param {string} businessCode 用于导出唯一性
 * @returns {Object}
 *
 * 构造法（不枚举全笛卡尔积，避免超大题内存爆炸）：
 *  1) 正确组合 = 每槽取 correct。
 *  2) 干扰组合按"改动位置数"从少到多依次产生：
 *     - 单槽错（distance=1）：把某一槽换成任一 distractor；
 *     - 双槽错（distance=2）：在尚未覆盖的槽对中换入干扰值；
 *     直到凑齐 K-1 个互不相同组合，或耗尽。
 *  组合(槽→值)用 key 去重；distance 升序保证干扰最小化、可追溯。
 */
function generate(cells, businessCode) {
  if (!cells || cells.length === 0) {
    return { insufficient: false, options: [], correctIndex: null, combos: [], N: 0, K: 2, note: '无槽位' };
  }
  const N = cells.length;
  const K = K_BUDGET(N);
  const needDistractors = K - 1;

  const correctValues = cells.map((c) => c.correct);
  const comboKey = (values) => values.join('\u0001');

  // 候选值每槽：index0=correct，其余为干扰
  const candPerSlot = cells.map((c) => [c.correct, ...(c.distractors || [])]);
  const distPermutations = cells.map((c) => (c.distractors || []).map((_, i) => i + 1));

  // 收集干扰组合（保序：先 distance=1，再 distance=2）
  const distCombos = [];
  const seen = new Set([comboKey(correctValues)]);

  function rationaleOf(deltas, values) {
    return deltas.map((idx) => `slot ${cells[idx].label}=${values[idx]}（正确为${cells[idx].correct}）`).join('；');
  }
  function addIfNew(deltas, values) {
    const key = comboKey(values);
    if (seen.has(key)) return;
    seen.add(key);
    distCombos.push({
      values,
      distance: deltas.length,
      deltas,
      rationale: rationaleOf(deltas, values),
    });
  }

  // distance = 1：单槽错（全部收集，作为均衡选择的候选池）
  for (let i = 0; i < N; i += 1) {
    for (const di of distPermutations[i]) {
      const values = correctValues.slice();
      values[i] = candPerSlot[i][di];
      addIfNew([i], values);
    }
  }

  // distance = 2：双槽错（补充候选池，保证足够供均衡挑选）
  for (let a = 0; a < N; a += 1) {
    for (let b = a + 1; b < N; b += 1) {
      for (const da of distPermutations[a]) {
        for (const db of distPermutations[b]) {
          const values = correctValues.slice();
          values[a] = candPerSlot[a][da];
          values[b] = candPerSlot[b][db];
          addIfNew([a, b], values);
        }
      }
    }
  }

  const totalAvail = 1 + distCombos.length;
  if (totalAvail < K) {
    return {
      insufficient: true,
      need: K,
      found: totalAvail,
      N,
      K,
      businessCode,
      reason: '可构造的互不相同完整组合不足 K（INSUFFICIENT_DISTRACTORS）',
    };
  }

  // ── 均衡填充（balanced fill）───────────────────────────────
  // 目标：让每个槽的各候选值在 K 个选项中近似均衡分布（避免正确值占绝对多数）。
  // 采用“回溯行填充”：第 1 行固定为全正确；其余 K-1 行按每槽目标频数分配各候选值，
  // 同时保证各行互不相同、仅第 1 行全正确。
  // 1) 为每槽计算目标频数 t_i[v]：K 次出现均分给该槽所有候选值（尽量等额、各≥1）。
  // 2) 回溯构造 K-1 个干扰行；若某槽配额已用尽仍无法完成唯一行，则放宽容许超额（计入 note）。
  const nvArr = cells.map((c) => 1 + (c.distractors || []).length);
  const targetCounts = cells.map((c, i) => {
    const nv = nvArr[i];
    const t = new Array(nv).fill(0);
    for (let k = 0; k < K; k += 1) {
      let mi = 0;
      for (let v = 1; v < nv; v += 1) if (t[v] < t[mi]) mi = v;
      t[mi] += 1;
    }
    return t;
  });
  // 剩余配额（扣除第 1 行全正确对各槽 correct 各贡献 1 次）
  const rem = targetCounts.map((t) => t.slice());
  rem.forEach((r) => { r[0] -= 1; });

  const usedKeys = new Set([comboKey(correctValues)]);
  const builtRows = [{ values: correctValues }];
  const buildRow = (slot, partial) => {
    if (slot === N) {
      const key = comboKey(partial);
      if (usedKeys.has(key)) return false;
      usedKeys.add(key);
      builtRows.push({ values: partial.slice() });
      return true;
    }
    // 候选值下标：优先 remaining>0，再按剩余量降序；无剩余则按原序（放宽容许超额）
    const orderV = Array.from({ length: nvArr[slot] }, (_, v) => v).sort((a, b) => (rem[slot][b] || -1e6) - (rem[slot][a] || -1e6) || a - b);
    for (const v of orderV) {
      const before = rem[slot][v];
      if (before > 0) rem[slot][v] -= 1;
      partial[slot] = candPerSlot[slot][v];
      if (buildRow(slot + 1, partial)) return true;
      rem[slot][v] = before; // 精确回滚：仅在确实扣减时恢复，避免配额被抬高破坏均衡
      partial[slot] = undefined;
    }
    return false;
  };

  const builtBefore = builtRows.length;
  for (let r = 1; r < K && builtRows.length < K; r += 1) {
    buildRow(0, new Array(N));
  }
  // 若回溯因为配额苛刻仍缺行，用候选池（distCombos）逐个补齐不重复的行
  for (const cand of distCombos) {
    if (builtRows.length >= K) break;
    const key = comboKey(cand.values);
    if (usedKeys.has(key)) continue;
    usedKeys.add(key);
    builtRows.push({ values: cand.values });
  }
  if (builtRows.length < K) {
    return {
      insufficient: true,
      need: K,
      found: builtRows.length,
      N,
      K,
      businessCode,
      reason: '均衡填充可用的互不相同完整组合不足 K（INSUFFICIENT_DISTRACTORS）',
    };
  }

  // 计算实际每槽各值出现次数（审计用），并标记是否超额
  const actualCounts = cells.map(() => new Map());
  builtRows.forEach((r) => candPerSlot.forEach((cs, i) => {
    const v = r.values[i];
    actualCounts[i].set(v, (actualCounts[i].get(v) || 0) + 1);
  }));
  const overTargets = [];
  cells.forEach((c, i) => {
    candPerSlot[i].forEach((v, idx) => {
      const actual = actualCounts[i].get(v) || 0;
      if (actual > targetCounts[i][idx]) overTargets.push(`${c.label||('slot'+i)}[${v}]=${actual}(目标${targetCounts[i][idx]})`);
    });
  });

  const rowToCombo = (row, isCorrect) => {
    const deltas = [];
    row.values.forEach((v, i) => { if (v !== correctValues[i]) deltas.push(i); });
    return {
      values: row.values,
      distance: deltas.length,
      deltas,
      isCorrect,
      rationale: isCorrect
        ? '全槽位正确'
        : deltas.map((idx) => `slot ${cells[idx].label}=${row.values[idx]}（正确为${cells[idx].correct}）`).join('；'),
    };
  };
  const allCombos = builtRows.map((row, i) => rowToCombo(row, i === 0));
  const balanceNote = overTargets.length ? `均衡略有超额：${overTargets.join('；')}` : '各槽候选值出现次数均在目标±内';

  const seed = `${businessCode}:d1:20261012`;
  const order = shuffleIndex(allCombos.length, seed);
  const options = [];
  const combos = [];
  let correctIndex = -1;
  order.forEach((pos, displayIdx) => {
    const combo = allCombos[pos];
    options.push(renderCombo(combo.values, cells));
    combos.push({
      index: displayIdx,
      option: renderCombo(combo.values, cells),
      isCorrect: combo.isCorrect,
      deltas: combo.deltas,
      rationale: combo.rationale,
    });
    if (combo.isCorrect) correctIndex = displayIdx;
  });

  return {
    insufficient: false,
    options,
    correctIndex,
    combos,
    N,
    K,
    coverage: allCombos.reduce((acc, cb) => {
      cb.values.forEach((v, i) => { (acc[i] = acc[i] || new Set()).add(v); });
      return acc;
    }, []).map((s) => s.size),
    actualCounts: actualCounts.map((m) => Object.fromEntries(m)),
    balanceNote,
  };
}

module.exports = { generate, K_BUDGET, seedFrom };

if (require.main === module) {
  // 简易自检：两位置各两值（对应 che2 qB6 情形）应 INSUFFICIENT
  const demo = [
    { label: '(1)', correct: '食塩', distractors: ['スクロース'] },
    { label: '(2)', correct: 'オクタン', distractors: ['プロパン'] },
  ];
  console.log(JSON.stringify(generate(demo, 'demo-qB6'), null, 1));
}