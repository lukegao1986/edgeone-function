#!/usr/bin/env node
/**
 * che1 Step6 试点生成器（独立试点，不入库、不覆盖旧 JSON/preview）
 *
 * 数据源：
 *  - 内容定义：che1_pilot_content.cjs（25 题；答案源自 che1_解析.md，不回退 cleaned）
 *  - 题块题干/公共条件/解析原文：chem_question_blocks_candidate_..._v2.json 中 che1 块（stemWithContextRaw）
 *  - 考纲：ejuSyllabus.ts（topicCode/subtopicCodes 合法性校验；che1 整章 chem_2_2_5 / chem_2_2_5_01）
 *  - D1 候选池：che1_d1_candidates.cjs（20 个多空题逐槽干扰项）
 *
 * 输出（独立目录，不触碰现网全局元数据）：
 *  - che1_step6_pilot_2026-10-12.json       完整试点草稿
 *  - che1_step6_pilot_2026-10-12_preview.md 逐题预览
 *  - manifest.json                           来源 SHA 锁定 + 版本
 *  - audit/validation.json                   校验明细
 *  - audit/issues.json                       待审项清单
 *
 * 规则（沿用于 che2）：
 *  - 构造单答题（optMode=simple）：正确位置按固定种子打散，correctIndex 随打散重算；
 *  - 多空题（multi）→ D1 组合选项（均衡填充：每槽≥2 种取值、各候选值频数近似均衡）；
 *  - 作图/记述题已按"语言描述图特征 / 参考答案要点作选项"变通纳入 simple 或 multi 构造。
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');

const ROOT = '/Users/wanglimin/Desktop/edgeone-ex';
const CANDIDATE = path.join(ROOT, 'docs/0 数据准备/Chem/_meta/chem_question_blocks_candidate_2026-10-12_v2.json');
const SYLLABUS_PATH = path.join(ROOT, 'src/data/ejuSyllabus.ts');
const OUT_DIR = path.join(ROOT, 'docs/0 数据准备/Chem/che1/_step6_pilot_2026-10-12');

const CONTENT = require('./che1_pilot_content.cjs');
const { CANDIDATES: CHE1_CANDIDATES } = require('./che1_d1_candidates.cjs');
const { applyD1ToDrafts } = require('./che2_d1_driver.cjs');
const SHA_PREFIX_LEN = 12;

function sha256Text(t) { return crypto.createHash('sha256').update(String(t), 'utf8').digest('hex'); }
function sha256File(p) { return sha256Text(fs.readFileSync(p, 'utf8')); }

// ---- 确定性随机（固定种子，保证每次运行打散结果一致，可复核）----
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedFrom(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) { h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0; }
  return h >>> 0;
}
/** 原地 Fisher-Yates 打散，返回打散顺序索引数组 [origIdx...] */
function shuffle(options, seedStr) {
  const rnd = mulberry32(seedFrom(seedStr));
  const idx = options.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    const t = idx[i]; idx[i] = idx[j]; idx[j] = t;
  }
  return idx;
}

// ---- 考纲加载 ----
function loadSyllabus() {
  const source = fs.readFileSync(SYLLABUS_PATH, 'utf8');
  const marker = 'export const EJU_SYLLABUS: EjuSyllabus =';
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`无法定位 ${marker}`);
  const code = `${source.slice(start).replace(marker, 'const EJU_SYLLABUS =')}\nmodule.exports = EJU_SYLLABUS;`;
  const sandbox = { module: { exports: null } };
  vm.runInNewContext(code, sandbox, { timeout: 2000 });
  return sandbox.module.exports;
}
function flattenTopics(syllabus) {
  const science = syllabus.find((i) => i && i.code === 'science');
  const chemistry = science && science.subSubjects.find((i) => i.code === 'chemistry');
  const out = [];
  for (const ch of chemistry.chapters || []) {
    for (const sec of ch.sections || []) {
      for (const tp of sec.topics || []) {
        out.push({
          chapterId: ch.id, sectionId: sec.id, topicId: tp.id,
          topicTitle: tp.title, content: tp.content || '',
          subtopics: (tp.subtopics || []).map((s) => ({ code: s.code, name: s.name, aliases: s.aliases || [] })),
        });
      }
    }
  }
  return out;
}

function buildSyllabusIndex(topics) {
  const topicSet = new Map();           // topicId -> topic
  const subtopicSet = new Map();        // code -> {topicId,...}
  for (const t of topics) {
    topicSet.set(t.topicId, t);
    for (const s of t.subtopics) subtopicSet.set(s.code, { topicId: t.topicId, name: s.name, aliases: s.aliases });
  }
  return { topicSet, subtopicSet };
}

// ---- 主流程 ----
function main() {
  const content = CONTENT;
  const candidate = JSON.parse(fs.readFileSync(CANDIDATE, 'utf8'));
  const shaCandRaw = sha256File(CANDIDATE);   // 原始字节 SHA（与 Step5 报告一致）
  const shaCandJson = sha256Text(JSON.stringify(candidate));

  const syllabus = loadSyllabus();
  const topics = flattenTopics(syllabus);
  const shaSyllabus = sha256File(SYLLABUS_PATH);
  const { topicSet, subtopicSet } = buildSyllabusIndex(topics);

  const blocks = candidate.blocks.filter((b) => b.unitCode === 'che1');
  const byCode = new Map(blocks.map((b) => [b.businessCode, b]));

  // ---- 组装草稿 ----
  // 先对 needs_review 草稿执行 D1 组合选项构造（生成 options/correctIndex），再逐草稿处理
  const baseDrafts = content.build();
  const d1Applied = applyD1ToDrafts(baseDrafts.filter((x) => x.generationStatus === 'needs_review'), CHE1_CANDIDATES);

  const drafts = baseDrafts.map((d) => {
    const block = byCode.get(d.businessCode);
    const optMode = d.optionMode;
    let options = [...d.options];
    let correctIndex = d.correctIndex;
    const shuffleNote = [];

    if (optMode === 'simple' && options.length > 1 && typeof correctIndex === 'number') {
      const seed = `${d.businessCode}:pilot20261012`; // 固定种子
      const order = shuffle(options, seed);
      options = order.map((o) => options[o]);
      correctIndex = order.indexOf(correctIndex);
      shuffleNote.push(`正确位打散至 ${correctIndex}（固定种子，可复核）`);
    } else if (optMode === 'native') {
      shuffleNote.push('原生选项保留原书顺序/标签，不打散');
    } else if (optMode === 'd1_combined') {
      shuffleNote.push(`D1 组合选项：K=${d.options.length}，正确位 ${d.correctIndex}（生成器固定种子打散）`);
    } else {
      correctIndex = null;
    }

    return {
      businessCode: d.businessCode,
      matchKey: d.matchKey,
      unitCode: d.unitCode,
      originalCategory: d.originalCategory,
      blockType: d.blockType,
      sourceNumber: d.sourceNumber,
      matchNumber: d.matchNumber,
      sourceHeading: d.sourceHeading,
      analysisSourceHeading: d.analysisSourceHeading,
      topicCode: d.topicCode,
      subtopicCodes: d.subtopicCodes,
      questionType: d.questionType,
      score: d.score,
      difficultyLevel: d.difficultyLevel,
      stem: d.stem,
      answerPrompt: d.answerPrompt,
      options,
      correctIndex,
      answerSlots: d.answerSlots,
      N: d.N,
      answerJp: d.answerJp,
      explanation: d.explanation,
      optionMode: d.optionMode,
      generationStatus: d.generationStatus,
      reviewIssues: [...(d.reviewIssues || []), ...shuffleNote],
      d1: d.d1 || undefined,
      resources: block ? collectResources(block) : { images: [], htmlTables: 0 },
      questionSource: d.questionSource,
      analysisSource: d.analysisSource,
      questionContextIds: d.questionContextIds,
      analysisContextIds: d.analysisContextIds,
    };
  });

  // ---- 校验 ----
  const v = validate(drafts, { topicSet, subtopicSet }, blocks);
  const statusCount = countBy(drafts, 'generationStatus');

  // ---- 输出 ----
  fs.mkdirSync(path.join(OUT_DIR, 'audit'), { recursive: true });

  const manifest = {
    name: 'che1 Step6 独立试点（不入库）',
    generatedAt: new Date().toISOString(),
    generator: 'che1_step6_pilot.cjs v1.0.0 (+D1组合选项/均衡填充)',
    contract: '化学Step6正式生成契约_待确认_2026-10-12（min(2N+2,12)）',
    d1: {
      applied: d1Applied,
      constructed: drafts.filter((x) => x.optionMode === 'd1_combined').length,
      insufficientBlocked: drafts.filter((x) => x.generationStatus === 'blocked' && x.d1 && x.d1.status === 'blocked' && x.d1.reason === 'INSUFFICIENT_DISTRACTORS').length,
      generatorModule: 'd1_option_generator.cjs',
      candidatesModule: 'che1_d1_candidates.cjs',
    },
    candidateSource: {
      file: CANDIDATE,
      sha256: shaCandRaw,
      prefix: shaCandRaw.slice(0, SHA_PREFIX_LEN),
      reSerializeSha: shaCandJson, // JSON 重序列化哈希(供内容复核),非规范性锁定
    },
    syllabusSource: { file: SYLLABUS_PATH, sha256: shaSyllabus, prefix: shaSyllabus.slice(0, SHA_PREFIX_LEN) },
    unit: 'che1',
    totalBlocks: blocks.length,
    draftCount: drafts.length,
    businessCodeUnique: v.businessCodeUnique,
    statusCount,
    optionModeCount: countBy(drafts, 'optionMode'),
    validation: {
      issueCount: v.issues.length,
      blockingIssueCount: v.blockingIssues.length,
      passed: v.issues.length === 0,
    },
    note: '本试点为独立产物，未覆盖历史 JSON/preview，未写入数据库。确认后方可扩批至全量。',
  };

  fs.writeFileSync(path.join(OUT_DIR, 'che1_step6_pilot_2026-10-12.json'), JSON.stringify(drafts, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'audit/validation.json'), JSON.stringify(v.byCode, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'audit/issues.json'), JSON.stringify(v.issues, null, 2));
  const preview = renderPreview(drafts, topicSet, subtopicSet);
  fs.writeFileSync(path.join(OUT_DIR, 'che1_step6_pilot_2026-10-12_preview.md'), preview);

  // 控制台统计
  console.log('输出目录:', OUT_DIR);
  console.log('草稿数:', drafts.length, '| 题块数:', blocks.length);
  console.log('状态分布:', statusCount);
  console.log('选项模式分布:', countBy(drafts, 'optionMode'));
  console.log('校验问题数:', v.issues.length, '| 阻断问题数:', v.blockingIssues.length);
  console.log('businessCode 唯一:', v.businessCodeUnique);
  if (v.blockingIssues.length) {
    console.log('\n[阻断/FAIL] 需要人工处理,不符合可入库:');
    v.blockingIssues.forEach((s) => console.log(' -', s));
  } else {
    console.log('\n[PASS] 校验通过:题数/唯一性/选项数/correctIndex/考纲合法性 均满足。');
  }
  console.log('\n待审项汇总:');
  listIssues(drafts);

  // D1 均衡审计（每槽 coverage + actualCounts）
  console.log('\nD1 每槽取值覆盖与频数均衡审计:');
  for (const d of drafts) {
    if (d.optionMode !== 'd1_combined') continue;
    const { actualCounts, balanceNote, coverage } = d.d1 || {};
    if (!actualCounts) continue;
    const coverageOk = (coverage || []).every((c) => c >= 2);
    console.log(` - ${d.businessCode} N=${d.N} K=${d.d1.K} coverage=${JSON.stringify(coverage)} ${coverageOk ? 'OK' : '!!<2'} | ${balanceNote}`);
    actualCounts.forEach((m, i) => {
      const slot = (d.answerSlots[i] && d.answerSlots[i].sourceLabel) || `slot${i + 1}`;
      console.log(`     ${slot}: ${JSON.stringify(m)}`);
    });
  }
}

// ---- 校验实现 ----
function verifyCountIssues(d) {
  const issues = [];
  const code = d.businessCode;
  if (typeof d.correctIndex === 'number') {
    if (d.correctIndex < 0 || d.correctIndex >= d.options.length) {
      issues.push(`correctIndex ${d.correctIndex} 越界(options=${d.options.length})`);
    }
    if (d.options.length < 2 || d.options.length > 12) {
      issues.push(`选项数 ${d.options.length} 不在 [2,12]`);
    }
  }
  return issues;
}

function validate(drafts, syl, blocks) {
  const issues = [];
  const byCode = {};
  const seenBiz = new Set();
  let bizUnique = true;

  if (drafts.length !== blocks.length) {
    issues.push(`[FAIL] 题数不符 草稿=${drafts.length} 题块=${blocks.length}`);
  }

  // 题块 businessCode 本身唯一
  const bizInBlocks = new Set();
  for (const b of blocks) {
    if (bizInBlocks.has(b.businessCode)) issues.push(`[FAIL] 题块 businessCode 重复: ${b.businessCode}`);
    bizInBlocks.add(b.businessCode);
  }

  for (const d of drafts) {
    const code = d.businessCode;
    const rec = { code, status: d.generationStatus, optionsCount: d.options.length, correctIndex: d.correctIndex, issues: [] };
    if (seenBiz.has(code)) { rec.issues.push('[FAIL] 草稿 businessCode 唯一性被破坏'); bizUnique = false; }
    seenBiz.add(code);

    // 选项数 / correctIndex
    const ci = verifyCountIssues(d);
    ci.forEach((s) => { rec.issues.push('[FAIL] ' + s); issues.push(`[FAIL] ${code}: ${s}`); });

    // 考纲合法性 + 前缀一致
    if (d.topicCode && !syl.topicSet.has(d.topicCode)) {
      rec.issues.push(`[FAIL] topicCode 不存在: ${d.topicCode}`);
      issues.push(`[FAIL] ${code}: topicCode ${d.topicCode} 不存在`);
    }
    for (const st of d.subtopicCodes || []) {
      const sub = syl.subtopicSet.get(st);
      if (!sub) {
        rec.issues.push(`[FAIL] subtopicCode 不存在: ${st}`);
        issues.push(`[FAIL] ${code}: subtopicCode ${st} 不存在`);
      } else if (d.topicCode && sub.topicId !== d.topicCode) {
        rec.issues.push(`[FAIL] subtopic ${st} 属于 ${sub.topicId},与 topic ${d.topicCode} 前缀不一致`);
        issues.push(`[FAIL] ${code}: subtopic ${st}→${sub.topicId} 与 topic ${d.topicCode} 不一致`);
      }
    }

    // N 与 answerSlots（仅多空题有 slots；单答/原生题 N=null 且无 slots 属正确）
    const hasSlots = Array.isArray(d.answerSlots) && d.answerSlots.length > 0;
    if (hasSlots && d.N !== d.answerSlots.length) {
      rec.issues.push(`[FAIL] N=${d.N} 与 answerSlots=${d.answerSlots.length} 不符`);
      issues.push(`[FAIL] ${code}: N=${d.N} 与 answerSlots 数不符`);
    }

    // 草稿/原生应给出唯一答案；needs_review/blocked 必须无 correctIndex(不伪装可入库)
    if ((d.optionMode === 'simple' || d.optionMode === 'native') && d.generationStatus === 'draft') {
      if (typeof d.correctIndex !== 'number') {
        rec.issues.push('[FAIL] draft 类缺 correctIndex');
        issues.push(`[FAIL] ${code}: draft 缺 correctIndex`);
      }
    }
    if ((d.optionMode === 'multi' || d.optionMode === 'blocked') && typeof d.correctIndex === 'number') {
      rec.issues.push(`[WARN] ${d.optionMode} 却给了 correctIndex,疑似伪装可入库`);
      issues.push(`[WARN] ${code}: ${d.optionMode} 却给 correctIndex=${d.correctIndex}`);
    }

    byCode[code] = rec;
  }
  const blockingIssues = issues.filter((s) => s.startsWith('[FAIL]'));
  return { issues, blockingIssues, byCode, businessCodeUnique: bizUnique };
}

function countBy(arr, key) {
  const m = {};
  arr.forEach((x) => { m[x[key]] = (m[x[key]] || 0) + 1; });
  return m;
}

function collectResources(block) {
  const text = `${block.stemWithContextRaw || ''}\n${block.analysisWithContextRaw || ''}`;
  const imgs = (text.match(/!\[[^\]]*]\(([^)]+)\)/g) || []).map((m) => (m.match(/]\(([^)]+)\)/) || [])[1]).filter(Boolean);
  const htmlTables = (text.match(/<table[\s\S]*?<\/table>/g) || []).length;
  return { images: imgs, htmlTables };
}

// ---- 预览渲染（布局参照物理题库 preview，来源/题号/分类可追溯）----
function renderPreview(drafts, topicSet, subtopicSet) {
  const L = [];
  L.push('# che1 Step6 试点题目预览（独立产物，不入库）');
  L.push('');
  L.push('总题数: ' + drafts.length);
  L.push('来源: 基础题块 chem_question_blocks_candidate_2026-10-12_v2.json（che1 25 块）+ che1_解析.md（答案溯源）');
  L.push('');
  L.push('> 说明: ✅=正确项 ❌=干扰项 | D1 组合选项由生成器均衡填充构造（每槽≥2 种取值、频数近似均衡），正确位按固定种子打散。');
  L.push('');

  for (const d of drafts) {
    const diff = d.difficultyLevel || 1;
    const optsCount = d.options.length ? ` (选项数: ${d.options.length})` : ' (无构造选项/待审)';
    L.push(`## [难度 ${diff}] ${d.businessCode}${optsCount}`);
    L.push('');
    L.push(`**来源**: ${d.originalCategory} · 原题号 ${d.sourceNumber}（匹配号 ${d.matchNumber}）`);
    L.push('');
    const topic = d.topicCode ? topicSet.get(d.topicCode) : null;
    L.push(`**考点**: ${d.topicCode || '未定'}${d.subtopicCodes && d.subtopicCodes.length ? ' | ' + d.subtopicCodes.join(', ') : ''}`);

    // 题干（完整公共条件+图片/表格）
    L.push('');
    L.push('**题干**:');
    L.push('');
    (d.stem || '').split('\n').forEach((ln) => { if (ln.trim()) L.push(ln); });
    if (d.answerPrompt && d.answerPrompt !== d.stem) {
      L.push('');
      L.push('（作答要求/提示）: ' + d.answerPrompt);
    }
    L.push('');

    // 选项
    if (d.options.length) {
      L.push('**选项**:');
      L.push('');
      d.options.forEach((op, i) => {
        const mark = (typeof d.correctIndex === 'number' && i === d.correctIndex) ? '✅' : '❌';
        L.push(`${mark} ${i}. ${op}`);
      });
      L.push('');
    } else {
      L.push('**选项**: （本步未构造，见待审项）');
      L.push('');
    }

    // 解析
    L.push('**解析**:');
    L.push('');
    (d.explanation || '').split('\n').forEach((ln) => { if (ln.trim()) L.push(ln); });
    L.push('');

    // 待审项
    if (d.reviewIssues && d.reviewIssues.length) {
      L.push('**待审项**:');
      L.push('');
      d.reviewIssues.forEach((is) => L.push('- ' + is));
      L.push('');
    } else {
      L.push('**待审项**: 无');
      L.push('');
    }
    L.push('---');
    L.push('');
  }
  return L.join('\n');
}

function listIssues(drafts) {
  for (const d of drafts) {
    if (d.reviewIssues && d.reviewIssues.length) {
      console.log(` - ${d.businessCode} [${d.generationStatus}]`);
      d.reviewIssues.forEach((i) => console.log(`     * ${i}`));
    }
  }
}

main();