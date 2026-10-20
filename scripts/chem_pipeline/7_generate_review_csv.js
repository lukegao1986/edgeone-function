#!/usr/bin/env node
/**
 * 7_generate_review_csv.js — 生成 Chem Step6 人工审阅表（CSV，UTF-8 BOM，Excel 可直接打开）
 *
 * 范围：23 个常规单元（cheb1~cheb6 + che1~che17）的 _step6_pilot_2026-10-12 草稿。
 *       不纳入 chebt/chet，不为特集另行建表。
 * 数据源：各章输出 JSON + manifest（来源版本）+ 候选块索引（解析匹配状态/章节根）。
 * 问题单列：缺答 / 结构式 / 选项 / 考纲 四列；保留旧表已填写的人工列（人工topicCode/人工subtopicCodes/审核结论/人工意见）。
 * 用法：node 7_generate_review_csv.js
 * 输出：docs/Topic_Review_Reports/chem_step6_review_YYYY-MM-DD.csv
 */
'use strict';

const fs = require('fs');
const path = require('path');
const {
  CANDIDATE, REPORT_DIR, UNITS,
  unitJsonPath, unitManifestPath,
  loadSyllabusIndex, csvSerialize, readCsv,
  makeSummary, classifyIssues, hasText,
} = require('./step6_review_common.cjs');

const HEADER = [
  'businessCode', '单元', '原分类', '原题号', '摘要', '小问数', '选项数', '正确答案索引',
  '答案/解析状态', 'topicCode', 'subtopicCodes', '难度', '来源版本',
  '问题_缺答', '问题_结构式', '问题_选项', '问题_考纲',
  '人工topicCode', '人工subtopicCodes', '审核结论', '人工意见',
];

function todayStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function main() {
  const date = todayStamp();
  const outFile = path.join(REPORT_DIR, `chem_step6_review_${date}.csv`);
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const syl = loadSyllabusIndex();
  const candidate = JSON.parse(fs.readFileSync(CANDIDATE, 'utf8'));
  const byCode = new Map(candidate.blocks.map((b) => [b.businessCode, b]));

  const rows = [];
  const skipped = [];
  for (const unit of UNITS) {
    const jp = unitJsonPath(unit);
    if (!fs.existsSync(jp)) { skipped.push(unit); continue; }
    const drafts = JSON.parse(fs.readFileSync(jp, 'utf8'));
    const manifest = fs.existsSync(unitManifestPath(unit))
      ? JSON.parse(fs.readFileSync(unitManifestPath(unit), 'utf8'))
      : null;
    const candPrefix = (manifest && manifest.candidateSource && manifest.candidateSource.prefix) || '';

    for (const d of drafts) {
      const block = byCode.get(d.businessCode) || null;
      const prob = classifyIssues(d, block, syl);
      const hasAnswer = (Array.isArray(d.answerSlots) && d.answerSlots.length > 0) || hasText(d.answerJp) || ((d.d1 && d.d1.N) || 0) > 0;
      const ansParts = [];
      ansParts.push(!block || block.analysisMatchStatus === 'matched' ? '解析已匹配' : `解析未匹配(${block.analysisMatchStatus})`);
      if (!hasAnswer) ansParts.push('缺答案');
      if (!hasText(d.explanation)) ansParts.push('缺解析');

      const qSha = (d.questionSource && d.questionSource.sha256 || '').slice(0, 8);
      const aSha = (d.analysisSource && d.analysisSource.sha256 || '').slice(0, 8);

      rows.push({
        businessCode: d.businessCode,
        单元: d.unitCode || unit,
        原分类: d.originalCategory || '',
        原题号: d.sourceNumber != null ? d.sourceNumber : '',
        摘要: makeSummary((block && block.sourceHeading) || d.sourceHeading),
        小问数: (d.d1 && d.d1.N) || (d.answerSlots && d.answerSlots.length) || 1,
        选项数: (d.options || []).length,
        正确答案索引: typeof d.correctIndex === 'number' ? d.correctIndex : '',
        '答案/解析状态': ansParts.join('/'),
        topicCode: d.topicCode || '',
        subtopicCodes: (d.subtopicCodes || []).join(','),
        难度: d.difficultyLevel != null ? d.difficultyLevel : '',
        来源版本: `${candPrefix}/Q:${qSha}/A:${aSha}`,
        问题_缺答: prob.missing,
        问题_结构式: prob.structure,
        问题_选项: prob.options,
        问题_考纲: prob.syllabus,
        人工topicCode: '',
        人工subtopicCodes: '',
        审核结论: '',
        人工意见: '',
      });
    }
  }

  // 保留旧表（任一 chem_step6_review_*.csv）中已填写的人工列
  const oldFiles = fs.existsSync(REPORT_DIR)
    ? fs.readdirSync(REPORT_DIR).filter((f) => /^chem_step6_review_.+\.csv$/.test(f)).map((f) => path.join(REPORT_DIR, f))
    : [];
  const carry = new Map();
  for (const f of oldFiles) {
    const parsed = readCsv(f);
    if (!parsed || !parsed.header.includes('businessCode')) continue;
    for (const r of parsed.rows) {
      if (!carry.has(r.businessCode)) carry.set(r.businessCode, {});
      const cur = carry.get(r.businessCode);
      for (const c of ['人工topicCode', '人工subtopicCodes', '审核结论', '人工意见']) {
        if (!cur[c] && r[c]) cur[c] = r[c];
      }
    }
  }
  for (const row of rows) {
    const old = carry.get(row.businessCode);
    if (!old) continue;
    for (const c of ['人工topicCode', '人工subtopicCodes', '审核结论', '人工意见']) {
      if (old[c]) row[c] = old[c];
    }
  }

  fs.writeFileSync(outFile, csvSerialize(HEADER, rows), 'utf8');

  // 统计
  const count = (fn) => rows.reduce((n, r) => n + (fn(r) ? 1 : 0), 0);
  console.log('审阅表输出:', outFile);
  console.log('总题数:', rows.length);
  console.log('跳过单元(无 Step6 输出):', skipped.length ? skipped.join(',') : '无');
  console.log('问题单列计数: 缺答', count((r) => r['问题_缺答']), '| 结构式', count((r) => r['问题_结构式']),
    '| 选项', count((r) => r['问题_选项']), '| 考纲', count((r) => r['问题_考纲']));
  const carried = rows.reduce((n, r) => n + (r['人工意见'] || r['审核结论'] || r['人工topicCode'] || r['人工subtopicCodes'] ? 1 : 0), 0);
  console.log('保留旧表人工填写行数:', carried);
}

main();