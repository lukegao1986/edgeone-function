#!/usr/bin/env node
/**
 * 12_batch_upload.cjs — Chem Step6 批量上传（阶段 3），支持多种模式
 *
 * 模式：
 *   --list-unit <unit>   逐单元上传（每个单元一个)
 *   --batch <n>          n=1 小批次：按小批次单元白名单上传（默认第一个元小批次）
 *
 * 安全约束：
 *   1) 前置强校验：topicCode 必须存在于 topics.code，subtopicCodes 每个必须存在于 subtopics.code
 *      且归属(topic_id→topics.code)与 JSON 的 topicCode 一致；任一未命中 → 该题 fail，不算成功
 *   2) 逐题 ON DUPLICATE KEY UPDATE（business_code 唯一键），重试沿用原 businessCode
 *   3) 逐题回读核验：stem / options / correct_index / explanation / topic_id→code / subtopic 关联
 *   4) 全程不打印任何连接凭证
 * 输出：docs/Topic_Review_Reports/chem_upload_batch_{date}.json（含逐题明细与回读比对结果）
 * 用法：node 12_batch_upload.cjs --unit che10
 */
'use strict';

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const ROOT = '/Users/wanglimin/Desktop/edgeone-ex';
const REPORT_DIR = path.join(ROOT, 'docs/Topic_Review_Reports');
const UPLOADER = path.join(ROOT, 'scripts/uploader/upload.js');

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

function loadDbConfigQuiet() {
  const s = fs.readFileSync(UPLOADER, 'utf8');
  const m = s.match(/const dbConfig\s*=\s*({[\s\S]*?});/);
  if (!m) throw new Error('upload.js 中未找到 dbConfig 字面量');
  return new Function(`return (${m[1]});`)();
}

function unitJsonPath(unit) {
  return path.join(ROOT, 'docs/0 数据准备/Chem', unit, `_step6_pilot_2026-10-12/${unit}_step6_pilot_2026-10-12.json`);
}

function parseArgs(argv) {
  const arg = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      arg[key] = argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[i + 1] : true;
      if (arg[key] !== true) i++;
    }
  }
  return arg;
}

async function main() {
  const args = parseArgs(process.argv);
  const batchUnits = (args.units || 'che10').split(',').map((s) => s.trim()).filter(Boolean);
  if (!batchUnits.length) { console.error('缺少 --units 参数'); process.exit(1); }
  const tag = args.tag ? `_${args.tag}` : '';
  const batchName = batchUnits.join('+');

  const date = reviewDate();
  const cfg = loadDbConfigQuiet();
  const dbName = cfg.database;

  // -------- 加载小批次草稿 --------
  const drafts = [];
  for (const unit of batchUnits) {
    const jp = unitJsonPath(unit);
    if (!fs.existsSync(jp)) { console.error(`❌ 草稿缺失: ${jp}`); process.exit(1); }
    const arr = JSON.parse(fs.readFileSync(jp, 'utf8'));
    for (const d of arr) drafts.push(Object.assign({ _unit: unit }, d));
  }
  console.log(`小批次单元: ${batchUnits.join(', ')} | 拟上传 ${drafts.length} 题，目标库: ${dbName}`);

  const detail = [];       // 逐题明细
  const skipped = [];      // 未上传（前置校验 fail）
  let conn;
  try {
    conn = await mysql.createConnection(Object.assign({}, cfg, { multipleStatements: false, connectTimeout: 20000 }));

    // -------- 前置强校验：考纲命中与归属 --------
    const [tRows] = await conn.query('SELECT id, code FROM topics');
    const topicIdByCode = new Map(tRows.map((t) => [t.code, t.id]));
    const [stRows] = await conn.query('SELECT st.id, st.code, st.topic_id, t.code AS t_code FROM subtopics st LEFT JOIN topics t ON st.topic_id = t.id');
    const subIdByCode = new Map(stRows.map((s) => [s.code, s.id]));
    const subTopicByCode = new Map(stRows.map((s) => [s.code, s.t_code]));

    // topic→上级层级 ID 缓存（与 upload.js 的 JOIN 上溯一致）
    const [ancRows] = await conn.query(
      `SELECT t.id AS t_id, t.code AS t_code, s.id AS s_id, c.id AS c_id, sub.id AS sub_id, sub.main_subject_id AS main_id
       FROM topics t
       JOIN sections s ON t.section_id = s.id
       JOIN chapters c ON s.chapter_id = c.id
       JOIN sub_subjects sub ON c.sub_subject_id = sub.id`
    );
    const ancByCode = new Map(ancRows.map((r) => [r.t_code, r]));

    let successCount = 0;
    let failCount = 0;
    let insertedCount = 0;
    let updatedCount = 0;

    for (const q of drafts) {
      const biz = q.businessCode;
      // 前置校验：topicCode / subtopicCodes / 归属，任一失败 → 该题 fail，不写库
      const pre = [];
      const tId = q.topicCode && topicIdByCode.get(q.topicCode);
      if (!q.topicCode || !tId) pre.push(`topicCode=${q.topicCode || '空'} 在库中无对应 topics 记录`);
      else if (!ancByCode.has(q.topicCode)) pre.push(`topicCode=${q.topicCode} 无法上溯层级 ID`);
      for (const s of q.subtopicCodes || []) {
        if (!subIdByCode.has(s)) pre.push(`subtopicCode=${s} 在库中无对应 subtopics 记录`);
        else if (subTopicByCode.get(s) !== q.topicCode) pre.push(`subtopicCode=${s} 归属 topic=${subTopicByCode.get(s)}，与 topicCode=${q.topicCode} 不一致`);
      }
      if (pre.length) {
        skipped.push({ businessCode: biz, unit: q._unit, reasons: pre });
        detail.push({
          businessCode: biz, unit: q._unit, status: 'skipped',
          step: 'preflight', reasons: pre,
        });
        failCount++;
        continue;
      }

      try {
        const anc = ancByCode.get(q.topicCode);
        const [result] = await conn.execute(
          `INSERT INTO questions (
             business_code, main_subject_id, sub_subject_id, chapter_id, section_id, topic_id,
             question_type, difficulty_level, score, stem, options, correct_index, explanation
           )
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             main_subject_id=VALUES(main_subject_id),
             sub_subject_id=VALUES(sub_subject_id),
             chapter_id=VALUES(chapter_id),
             section_id=VALUES(section_id),
             topic_id=VALUES(topic_id),
             question_type=VALUES(question_type),
             difficulty_level=VALUES(difficulty_level),
             score=VALUES(score),
             stem=VALUES(stem),
             options=VALUES(options),
             correct_index=VALUES(correct_index),
             explanation=VALUES(explanation)`,
          [
            biz,
            anc.main_id, anc.sub_id, anc.c_id, anc.s_id, anc.t_id,
            q.questionType || 1,
            q.difficultyLevel || 1,
            q.score || null,
            q.stem,
            JSON.stringify(q.options),
            q.correctIndex !== undefined ? q.correctIndex : null,
            q.explanation || '',
          ]
        );
        const affected = result.affectedRows;
        if (result.insertId) insertedCount++; else if (affected > 0) updatedCount++;

        // 取 question id（新插入用 insertId，否则按 business_code 反查）
        let qid = result.insertId;
        if (!qid) {
          const [qRows] = await conn.execute('SELECT id FROM questions WHERE business_code = ?', [biz]);
          qid = qRows[0] && qRows[0].id;
        }

        // 关联 question_subtopics：先清后写
        await conn.execute('DELETE FROM question_subtopics WHERE question_id = ?', [qid]);
        for (const s of q.subtopicCodes || []) {
          await conn.execute(
            'INSERT IGNORE INTO question_subtopics (question_id, subtopic_id) VALUES (?, ?)',
            [qid, subIdByCode.get(s)]
          );
        }

        // -------- 回读核验 --------
        const mismatches = [];
        const [b] = await conn.execute(
          `SELECT id, business_code, question_type, difficulty_level, score, stem, options, correct_index, explanation, topic_id, section_id, chapter_id, sub_subject_id, main_subject_id
           FROM questions WHERE business_code = ?`, [biz]);
        if (!b.length) {
          mismatches.push('回读无记录');
        } else {
          const row = b[0];
          if (row.stem !== q.stem) mismatches.push('stem 不一致');
          if (row.correct_index !== q.correctIndex) mismatches.push(`correct_index=${row.correct_index} ≠ ${q.correctIndex}`);
          if (row.explanation !== q.explanation) mismatches.push('explanation 不一致');
          let dbOptions = row.options;
          if (typeof dbOptions === 'string') {
            try { dbOptions = JSON.parse(dbOptions); } catch (e) { mismatches.push('options 非 JSON'); }
          }
          if (typeof dbOptions !== 'object' || JSON.stringify(dbOptions) !== JSON.stringify(q.options)) mismatches.push('options 不一致');
          const [tc] = await conn.execute('SELECT code FROM topics WHERE id = ?', [row.topic_id]);
          if (!tc.length || tc[0].code !== q.topicCode) mismatches.push(`topic_id→code 回读=${tc[0] && tc[0].code} ≠ ${q.topicCode}`);
          // 回读 question_subtopics 关联 codes，与 JSON 集合比对
          const [qs] = await conn.execute(
            `SELECT s.code FROM question_subtopics qs JOIN subtopics s ON qs.subtopic_id = s.id WHERE qs.question_id = ? ORDER BY s.code`, [row.id]);
          const dbSubCodes = qs.map((r) => r.code).sort();
          const jsonSubCodes = [...(q.subtopicCodes || [])].sort();
          if (JSON.stringify(dbSubCodes) !== JSON.stringify(jsonSubCodes)) {
            mismatches.push(`subtopic 关联回读=[${dbSubCodes.join(',')}] ≠ JSON=[${jsonSubCodes.join(',')}]`);
          }
        }

        const ok = mismatches.length === 0;
        detail.push({
          businessCode: biz, unit: q._unit, status: ok ? 'success' : 'mismatch',
          action: result.insertId ? 'insert' : 'update',
          questionId: qid,
          mismatches,
        });
        if (ok) successCount++; else failCount++;
        console.log(`  ${ok ? '✔' : '✘'} ${biz} → ${result.insertId ? '新增' : '更新'} ${ok ? '' : ' 回读不一致: ' + mismatches.join('; ')}`);
      } catch (err) {
        detail.push({ businessCode: biz, unit: q._unit, status: 'error', step: 'write', error: err.message });
        failCount++;
        console.log(`  ✘ ${biz} → 写入异常: ${err.message}`);
      }
    }

    const report = {
      generatedAt: new Date().toISOString(),
      date,
      batch: { units: batchUnits, requested: drafts.length },
      targetEnv: { database: dbName },
      summary: {
        success: successCount,
        fail: failCount,
        inserted: insertedCount,
        updated: updatedCount,
        skipped: skipped.length,
      },
      blockers: [],
      detail,
      skipped,
    };
    if (skipped.length) report.blockers.push({ level: 'HIGH', reason: `${skipped.length} 题前置校验未通过，未写入（含未知 topicCode/subtopicCode）` });
    const outFile = path.join(REPORT_DIR, `chem_upload_batch_${date}${tag}.json`);
    fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf8');

    console.log(`\n==== 批次(${batchName})上传完成 ====`);
    console.log(`成功 ${successCount} | 失败 ${failCount} | 新增 ${insertedCount} | 更新 ${updatedCount} | 前置拦截 ${skipped.length}`);
    const bad = detail.filter((d) => d.status !== 'success');
    if (bad.length) { console.log('失败明细:'); for (const d of bad) console.log(`  [${d.status}] ${d.businessCode} ${(d.reasons || []).join(';') || (d.mismatches || []).join(';') || d.error || ''}`); }
    else console.log('全部通过回读核验');
    console.log('报告输出:', outFile);
  } catch (err) {
    console.error('❌ 上传失败:', err.message);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
}

main();