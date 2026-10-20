'use strict';
/**
 * Step6 审阅报表公共模块（供 7_generate_review_csv.js / 8_apply_manual_review.js 复用）
 *
 * 职责：
 *  - 考纲加载（ejuSyllabus.ts）与 topic/subtopic 索引构建；
 *  - 23 个常规单元清单与各章 Step6 产物路径构造（不含 chebt/chet，特集不建表）；
 *  - CSV 序列化/解析（UTF-8 BOM + 引号转义，Excel 兼容；支持旧表人工列合并）；
 *  - 题目问题分类（缺答/结构式/选项/考纲四类单列判定）与摘要提取。
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = '/Users/wanglimin/Desktop/edgeone-ex';
const CANDIDATE = path.join(ROOT, 'docs/0 数据准备/Chem/_meta/chem_question_blocks_candidate_2026-10-12_v2.json');
const SYLLABUS_PATH = path.join(ROOT, 'src/data/ejuSyllabus.ts');
const REPORT_DIR = path.join(ROOT, 'docs/Topic_Review_Reports');

// ---- 23 个常规单元：cheb1~cheb6 + che1~che17（不含 chebt/chet 特集）----
const UNITS = [
  'cheb1', 'cheb2', 'cheb3', 'cheb4', 'cheb5', 'cheb6',
  'che1', 'che2', 'che3', 'che4', 'che5', 'che6', 'che7',
  'che8', 'che9', 'che10', 'che11', 'che12', 'che13', 'che14',
  'che15', 'che16', 'che17',
];

const PILOT_DIR_NAME = '_step6_pilot_2026-10-12';

function unitOutDir(unit) {
  return path.join(ROOT, 'docs/0 数据准备/Chem', unit, PILOT_DIR_NAME);
}
function unitJsonPath(unit) {
  return path.join(unitOutDir(unit), `${unit}_step6_pilot_2026-10-12.json`);
}
function unitPreviewPath(unit) {
  return path.join(unitOutDir(unit), `${unit}_step6_pilot_2026-10-12_preview.md`);
}
function unitManifestPath(unit) {
  return path.join(unitOutDir(unit), 'manifest.json');
}

// ---- 考纲加载与索引（与各章生成器同构）----
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
  if (!chemistry) throw new Error('考纲中未找到 chemistry');
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
  const topicSet = new Map();
  const subtopicSet = new Map();
  for (const t of topics) {
    topicSet.set(t.topicId, t);
    for (const s of t.subtopics) subtopicSet.set(s.code, { topicId: t.topicId, name: s.name, aliases: s.aliases });
  }
  return { topicSet, subtopicSet };
}

function loadSyllabusIndex() {
  return buildSyllabusIndex(flattenTopics(loadSyllabus()));
}

// ---- CSV（BOM + 引号规则转义；\r\n 行尾）----
function csvEscape(v) {
  const s = String(v == null ? '' : v).replace(/[\r\n]+/g, ' ');
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function csvSerialize(header, rows) {
  const lines = [header.map(csvEscape).join(',')];
  for (const r of rows) lines.push(header.map((h) => csvEscape(r[h])).join(','));
  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}

/** 解析 CSV（支持 BOM；返回 { header, rows: Object[] }，或 null 当无法解析为表格） */
function csvParse(text) {
  if (Buffer.isBuffer(text)) text = text.toString('utf8');
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const rows = [];
  let row = [], field = '', inQ = false;
  const pushField = () => { row.push(field); field = ''; };
  const pushRow = () => { pushField(); rows.push(row); row = []; };
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; } else inQ = false;
      } else field += c;
    } else if (c === '"') {
      inQ = true;
    } else if (c === ',') {
      pushField();
    } else if (c === '\n') {
      pushRow();
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field !== '' || row.length) pushRow();
  if (!rows.length) return null;
  const header = rows[0];
  const data = rows.slice(1).filter((r) => !(r.length === 1 && r[0] === ''));
  return { header, rows: data.map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] || '').trim()]))) };
}

function readCsv(file) {
  if (!fs.existsSync(file)) return null;
  return csvParse(fs.readFileSync(file, 'utf8'));
}

// ---- 题目级判定 ----
function hasText(v) { return typeof v === 'string' && v.trim() !== ''; }

function makeSummary(sourceHeading) {
  let s = String(sourceHeading || '').replace(/^#{1,6}\s*/, '').trim();
  s = s.replace(/\$\$[\s\S]*?\$\$/g, ' ').replace(/\$[^$]*\$/g, ' ');
  s = s.replace(/[\\{}_^~]/g, ' ').replace(/\s+/g, ' ').trim();
  return s.length > 80 ? s.slice(0, 80) + '…' : s;
}

/** 问题单列判定：返回 { missing, structure, options, syllabus }（空串=无问题） */
function classifyIssues(draft, block, syl) {
  const out = { missing: '', structure: '', options: '', syllabus: '' };
  const { topicSet, subtopicSet } = syl;

  // 缺答：答案缺失 / 解析缺失 / 解析未匹配
  const missing = [];
  const hasAnswer = (Array.isArray(draft.answerSlots) && draft.answerSlots.length > 0)
    || hasText(draft.answerJp)
    || ((draft.d1 && draft.d1.N) || 0) > 0;
  if (!hasAnswer) missing.push('缺答案');
  if (!hasText(draft.explanation)) missing.push('缺解析');
  if (block && block.analysisMatchStatus && block.analysisMatchStatus !== 'matched') missing.push(`解析${block.analysisMatchStatus}`);
  out.missing = missing.join(';');

  // 结构式/图形类：题干/答案/选项/解析/待审项命中图形或结构式关键词
  const probe = [
    draft.stem || '', draft.answerJp || '', draft.answerPrompt || '',
    (draft.options || []).join('\n'), draft.explanation || '',
    (draft.reviewIssues || []).join('\n'),
  ].join('\n');
  const p = (re) => (probe.match(re) || []).flat(1);
  const hits = new Set();
  const kw = [
    ['構造式', /(構造式|構造図|結晶構造|化学構造|構造異性体)/],
    ['図/グラフ', /(略図|装置図|図示|作図|グラフ|曲線|図のように|描け)/],
  ];
  for (const [label, re] of kw) {
    const m = probe.match(re);
    if (m) hits.add(label + (m[0] ? '(' + m[0] + ')' : ''));
  }
  if (hits.size) out.structure = [...hits].slice(0, 3).join(';');

  // 选项：数量/越界/重复/D1 K 超限
  const opts = draft.options || [];
  const optIssues = [];
  if (!opts.length) optIssues.push('无选项');
  if (opts.length && (opts.length < 2 || opts.length > 12)) optIssues.push(`选项数${opts.length}超出[2,12]`);
  if (typeof draft.correctIndex === 'number' && (draft.correctIndex < 0 || draft.correctIndex >= opts.length)) optIssues.push(`正确索引${draft.correctIndex}越界`);
  const seen = new Set();
  for (const o of opts) {
    const k = String(o).trim();
    if (seen.has(k)) { optIssues.push('选项重复'); break; }
    seen.add(k);
  }
  if (draft.d1 && typeof draft.d1.K === 'number' && draft.d1.K > 12) optIssues.push(`D1组合K=${draft.d1.K}>12`);
  out.options = optIssues.join(';');

  // 考纲：缺考点/考点不在考纲/子考点非法/前缀不符
  // （不做"章节根"强校验：cheb4→chem_2_1_1、che2→chem_1_3、che12→chem_1_4_2 等跨编挂载为已确认决策）
  const sylIssues = [];
  const topic = draft.topicCode || '';
  if (!topic) {
    sylIssues.push('缺考点');
  } else {
    if (!topicSet.has(topic)) sylIssues.push(`考点不在考纲:${topic}`);
  }
  const subs = draft.subtopicCodes || [];
  if (!subs.length) {
    if (topic) sylIssues.push('无子考点');
  } else {
    for (const st of subs) {
      const sub = subtopicSet.get(st);
      if (!sub) sylIssues.push(`子考点不在考纲:${st}`);
      else if (topic && sub.topicId !== topic) sylIssues.push(`子考点评级不符:${st}→${sub.topicId}`);
    }
  }
  out.syllabus = sylIssues.join(';');

  return out;
}

/** 从 businessCode 解析单元（chem-cheb6-qC1 → cheb6） */
function unitOf(businessCode) {
  const m = String(businessCode || '').match(/^chem-([a-z0-9]+)-/i);
  return m ? m[1] : null;
}

module.exports = {
  ROOT, CANDIDATE, SYLLABUS_PATH, REPORT_DIR, UNITS,
  PILOT_DIR_NAME,
  unitOutDir, unitJsonPath, unitPreviewPath, unitManifestPath,
  loadSyllabus, flattenTopics, buildSyllabusIndex, loadSyllabusIndex,
  csvEscape, csvSerialize, csvParse, readCsv,
  hasText, makeSummary, classifyIssues, unitOf,
};