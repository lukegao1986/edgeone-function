#!/usr/bin/env node
/**
 * 11_db_readonly_inspect.cjs — 只读核查数据库（阶段 2，不写入任何数据）
 *
 * 范围：shuati_db（读自 scripts/uploader/upload.js 的 dbConfig，仅取 database 名，绝不打印凭证）
 * 核查项：
 *   1) 库表结构（information_schema）与 questions.business_code 唯一约束
 *   2) 库内已有业务编号（全量 business_code 拉取）与拟上传 875 的冲突清单
 *   3) 考纲记录完整性：topics.code / subtopics.code 与拟上传 topicCode/subtopicCodes 全覆盖比对
 *      以及 DB 内 subtopic→topic 归属关系与 JSON 的逐项一致性
 * 输出：docs/Topic_Review_Reports/chem_db_readonly_inspect_{date}.json（无任何凭证字段）
 * 用法：node 11_db_readonly_inspect.cjs
 */
'use strict';

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const ROOT = '/Users/wanglimin/Desktop/edgeone-ex';
const REPORT_DIR = path.join(ROOT, 'docs/Topic_Review_Reports');
const UPLOADER = path.join(ROOT, 'scripts/uploader/upload.js');

const UNITS = [
  'cheb1', 'cheb2', 'cheb3', 'cheb4', 'cheb5', 'cheb6',
  'che1', 'che2', 'che3', 'che4', 'che5', 'che6', 'che7', 'che8', 'che9',
  'che10', 'che11', 'che12', 'che13', 'che14', 'che15', 'che16', 'che17',
];

function todayStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function reviewDate() {
  if (fs.existsSync(REPORT_DIR)) {
    const d = fs.readdirSync(REPORT_DIR)
      .map((f) => (f.match(/^chem_step6_review_(\d{4}-\d{2}-\d{2})\.csv$/) || [])[1])
      .filter(Boolean).sort().pop();
    if (d) return d;
  }
  return todayStamp();
}

// 静默读取 upload.js 的 dbConfig（evaluate 为对象），本文件任何输出都不含 host/user/port/password
function loadDbConfigQuiet() {
  const s = fs.readFileSync(UPLOADER, 'utf8');
  const m = s.match(/const dbConfig\s*=\s*({[\s\S]*?});/);
  if (!m) throw new Error('upload.js 中未找到 dbConfig 字面量');
  const cfg = new Function(`return (${m[1]});`)();
  return cfg;
}

function unitJsonPath(unit) {
  return path.join(ROOT, 'docs/0 数据准备/Chem', unit, `_step6_pilot_2026-10-12/${unit}_step6_pilot_2026-10-12.json`);
}

// 收集拟上传清单的 businessCode / topicCode / subtopicCodes
function collectDraftCodes() {
  const biz = [];
  const topicSet = new Set();
  const subSet = new Set();
  const pairs = []; // { businessCode, unit, topicCode, subtopicCodes }
  let total = 0;
  for (const unit of UNITS) {
    const jp = unitJsonPath(unit);
    if (!fs.existsSync(jp)) { console.log(`跳过缺失草稿: ${unit}`); continue; }
    const drafts = JSON.parse(fs.readFileSync(jp, 'utf8'));
    for (const d of drafts) {
      total += 1;
      biz.push(d.businessCode);
      if (d.topicCode) topicSet.add(d.topicCode);
      for (const s of d.subtopicCodes || []) subSet.add(s);
      pairs.push({ businessCode: d.businessCode, unit, topicCode: d.topicCode, subtopicCodes: d.subtopicCodes || [] });
    }
  }
  return { total, biz, topicSet, subSet, pairs };
}

async function main() {
  const date = reviewDate();
  const cfg = loadDbConfigQuiet();
  const dbName = cfg.database;

  const ours = collectDraftCodes();
  console.log(`拟上传: ${ours.total} 题 / topicCode ${ours.topicSet.size} 个 / subtopicCode ${ours.subSet.size} 个`);

  let conn;
  const report = {
    generatedAt: new Date().toISOString(),
    date,
    targetEnv: { database: dbName, note: '只读核查，未执行任何写入' },
    schema: null,
    existing: null,
    syllabusDb: null,
    conflicts: null,
    readyToUpload: false,
    blockers: [],
  };

  try {
    conn = await mysql.createConnection(Object.assign({}, cfg, { multipleStatements: false, connectTimeout: 20000 }));
    console.log(`已连接数据库: ${dbName}（只读）`);

    // ---------- 1) 表结构与唯一约束 ----------
    const [tables] = await conn.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME"
    );
    const tableNames = tables.map((t) => t.TABLE_NAME);

    const [cols] = await conn.query(
      `SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
       FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE()
       ORDER BY TABLE_NAME, ORDINAL_POSITION`
    );
    const columnsByTable = {};
    for (const c of cols) (columnsByTable[c.TABLE_NAME] = columnsByTable[c.TABLE_NAME] || []).push({
      name: c.COLUMN_NAME, type: c.COLUMN_TYPE, nullable: c.IS_NULLABLE === 'YES', key: c.COLUMN_KEY,
    });

    const [uniqIdx] = await conn.query(
      `SELECT TABLE_NAME, INDEX_NAME, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns, NON_UNIQUE
       FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND NON_UNIQUE = 0
       GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE ORDER BY TABLE_NAME, INDEX_NAME`
    );

    report.schema = {
      tables: tableNames,
      uniqueIndexes: uniqIdx.map((u) => ({ table: u.TABLE_NAME, index: u.INDEX_NAME, columns: u.columns })),
      questionsColumns: columnsByTable.questions || [],
      questionSubtopicsColumns: columnsByTable.question_subtopics || [],
      subtopicsColumns: columnsByTable.subtopics || [],
      topicsColumns: columnsByTable.topics || [],
      otherTables: Object.fromEntries(Object.entries(columnsByTable).filter(([t]) => !['questions', 'question_subtopics', 'subtopics', 'topics'].includes(t))),
    };

    const qUniq = (report.schema.uniqueIndexes || []).filter((u) => u.table === 'questions' && u.columns.includes('business_code'));
    if (qUniq.length === 0) {
      report.blockers.push({ level: 'HIGH', reason: 'questions 表不存在 business_code 唯一索引' });
    }

    // ---------- 2) 已有业务编号 ----------
    const [[cnt]] = await conn.query('SELECT COUNT(*) AS c FROM questions');
    const [existingRows] = await conn.query('SELECT business_code, id, question_type FROM questions');
    const existingCodes = existingRows.map((r) => r.business_code);
    const existingSet = new Set(existingCodes);
    const prefixOf = (c) => (c || '').replace(/^chem-(chebt|chet|cheb\d+|che\d+).*$/, '$1') || (c || '').split('-')[1] || '?';
    const prefixCount = {};
    for (const c of existingCodes) {
      const p = /^chem-((?:chebt|chet|cheb\d*|che\d+))-/.exec(c);
      const key = p ? p[1] : 'other';
      prefixCount[key] = (prefixCount[key] || 0) + 1;
    }
    report.existing = {
      totalQuestions: cnt.c,
      existingCodeCount: existingCodes.length,
      uniqueExistingCodes: existingSet.size,
      prefixCount,
      otherSamples: existingCodes.filter((c) => !/^chem-(chebt|chet|cheb\d+|che\d+)-/.test(c)).slice(0, 10),
    };

    // 冲突分析
    const oursSet = new Set(ours.biz);
    const willInsert = ours.biz.filter((c) => !existingSet.has(c));
    const willUpdate = ours.biz.filter((c) => existingSet.has(c));
    const specialExisting = existingCodes.filter((c) => /^chem-(chebt|chet)-/.test(c));
    report.conflicts = {
      oursTotal: ours.total,
      willInsertCount: willInsert.length,   // 预计新增
      willUpdateCount: willUpdate.length,   // 预计更新（库中已有同 business_code 行）
      existingRowsNotInList: existingCodes.filter((c) => !oursSet.has(c)).length,
      willUpdateCodes: willUpdate,
      specialExistingCodes: specialExisting, // 库中存在的特集业务编号（不读、不动）
      willInsertSample: willInsert.slice(0, 20),
    };
    if (specialExisting.length) {
      report.blockers.push({ level: 'INFO', reason: `库中存在 ${specialExisting.length} 条特集(chebt/chet)业务编号，本次清单未包含，不会读取/更新/删除` });
    }

    // ---------- 3) 考纲记录 ----------
    const [topicRows] = await conn.query('SELECT id, code, title FROM topics ORDER BY code');
    const [subTopicRows] = await conn.query('SELECT st.id, st.code, st.topic_id, t.code AS t_code FROM subtopics st LEFT JOIN topics t ON st.topic_id = t.id ORDER BY st.code');
    const dbTopicCodes = new Set(topicRows.map((t) => t.code));
    const dbSubByCode = new Map(subTopicRows.map((s) => [s.code, s]));
    const haveSectionRows = tableNames.includes('sections') ? await conn.query('SELECT COUNT(*) AS c FROM sections') : [[{ c: -1 }]];
    const haveChapterRows = tableNames.includes('chapters') ? await conn.query('SELECT COUNT(*) AS c FROM chapters') : [[{ c: -1 }]];

    const missingTopics = [...ours.topicSet].filter((c) => !dbTopicCodes.has(c)).sort();
    const missingSubtopics = [...ours.subSet].filter((c) => !dbSubByCode.has(c)).sort();

    // DB 内 subtopic→topic 归属与 JSON 逐项一致性
    const relationIssues = [];
    for (const p of ours.pairs) {
      if (!p.topicCode) continue;
      for (const s of p.subtopicCodes) {
        const db = dbSubByCode.get(s);
        if (!db) continue; // 已计入 missingSubtopics
        if (db.t_code !== p.topicCode) {
          relationIssues.push({ businessCode: p.businessCode, subtopic: s, dbTopic: db.t_code, jsonTopic: p.topicCode });
        }
      }
    }

    report.syllabusDb = {
      topicsCount: topicRows.length,
      subtopicsCount: subTopicRows.length,
      sectionsCount: haveSectionRows[0][0].c,
      chaptersCount: haveChapterRows[0][0].c,
      missingTopics,
      missingSubtopics,
      subtopicTopicRelationIssues: relationIssues,
      dbTopicCodes: topicRows.map((t) => t.code),
    };

    if (missingTopics.length) report.blockers.push({ level: 'HIGH', reason: `topics 表缺失 ${missingTopics.length} 个 topicCode：${missingTopics.join(', ')}` });
    if (missingSubtopics.length) report.blockers.push({ level: 'HIGH', reason: `subtopics 表缺失 ${missingSubtopics.length} 个 subtopicCode：${missingSubtopics.join(', ')}` });
    if (relationIssues.length) report.blockers.push({ level: 'HIGH', reason: `${relationIssues.length} 条 JSON 的 subtopic→topic 归属与库不一致（标注了将覆盖的 topic_id）` });

    // ---------- 4) 就绪判定 ----------
    const critical = report.blockers.filter((b) => b.level === 'HIGH');
    report.readyToUpload = critical.length === 0;
    if (!report.readyToUpload) {
      // 补充：若仅缺特集信息等非关键项，仍视为不具备条件
    }

    const outFile = path.join(REPORT_DIR, `chem_db_readonly_inspect_${date}.json`);
    fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf8');

    // -------- 控制台摘要（不含任何凭证）--------
    console.log('\n========== 只读核查摘要 ==========');
    console.log(`库内表: ${tableNames.join(', ')}`);
    console.log(`questions 唯一索引(business_code): ${qUniq.length ? '存在' : '缺失!'} | 库内总数: ${report.existing.totalQuestions} | 业务编号唯一数: ${report.existing.uniqueExistingCodes}`);
    console.log(`库内业务编号单元分布: ${JSON.stringify(report.existing.prefixCount)}`);
    if (report.existing.otherSamples.length) console.log(`  非 chem 前缀样例: ${report.existing.otherSamples.join(', ')}`);
    console.log(`冲突: 预计新增 ${report.conflicts.willInsertCount} | 预计更新 ${report.conflicts.willUpdateCount} | 库内不在清单 ${report.conflicts.existingRowsNotInList}`);
    if (report.conflicts.willUpdateCount) console.log(`  需更新码: ${report.conflicts.willUpdateCodes.join(', ')}`);
    if (specialExisting.length) console.log(`  库内特集码(不动): ${specialExisting.join(', ')}`);
    console.log(`考纲: topics ${topicRows.length} / subtopics ${subTopicRows.length} / sections ${report.syllabusDb.sectionsCount} / chapters ${report.syllabusDb.chaptersCount}`);
    console.log(`缺失 topicCode: ${missingTopics.length ? missingTopics.join(', ') : '无'}`);
    console.log(`缺失 subtopicCode: ${missingSubtopics.length ? missingSubtopics.join(', ') : '无'}`);
    console.log(`subtopic→topic 归属不一致: ${relationIssues.length}`);
    console.log(`\n✅ 具备上传条件: ${report.readyToUpload ? '是' : '否（存在阻断项，见 blocker）'}`);
    console.log('报告输出:', outFile);
  } catch (err) {
    console.error('❌ 只读核查失败:', err.message);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
}

main();