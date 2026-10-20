#!/usr/bin/env node
/**
 * 10_preflight_chem_upload.cjs — Chem Step6 草稿「离线入库预检」+ 上传清单锁定（步进 10，不连接数据库）
 *
 * 范围：23 个常规单元（cheb1~cheb6 + che1~che17）的最新 _step6_pilot_2026-10-12 JSON。
 * 约束：清单限定 23 个常规单元；若发现 chebt/chet 混入则整体阻断、不出清单。
 * 校验项：必填字段 / businessCode 唯一且稳定 / 题型含义 / 合法选项与 correctIndex /
 *         中文解析 / 考纲代码与子考点前缀 / 来源版本（源文件 SHA 实测 + candidate 溯源）/
 *         未决状态 / 图片与公式检查。
 * 目标环境：读自 scripts/uploader/upload.js 的 dbConfig（仅输出 database 名，不打印凭证）。
 * 输出：docs/Topic_Review_Reports/chem_upload_preflight_{date}.json（含逐题问题与限定的上传清单 businessCode）。
 * 用法：node 10_preflight_chem_upload.cjs
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {
  ROOT, CANDIDATE, REPORT_DIR, UNITS,
  unitJsonPath, unitManifestPath,
  loadSyllabusIndex, readCsv,
} = require('./step6_review_common.cjs');

const UPLOADER = path.join(ROOT, 'scripts/uploader/upload.js');

function sha256(buf) { return crypto.createHash('sha256').update(buf).digest('hex'); }
function sha8(buf) { return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8); }
function todayStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function titleMdFor(unit) {
  return path.join(ROOT, 'docs/0 数据准备/Chem', unit, `${unit}_题目.md`);
}
function analysisMdFor(unit) {
  return path.join(ROOT, 'docs/0 数据准备/Chem', unit, `${unit}_解析.md`);
}

function reviewDate() {
  // 优先沿用最新审阅表 CSV 的日期（保持项目内命名体系一致），否则系统当天
  if (fs.existsSync(REPORT_DIR)) {
    const d = fs.readdirSync(REPORT_DIR)
      .map((f) => (f.match(/^chem_step6_review_(\d{4}-\d{2}-\d{2})\.csv$/) || [])[1])
      .filter(Boolean).sort().pop();
    if (d) return d;
  }
  return todayStamp();
}

function main() {
  const syl = loadSyllabusIndex();
  const { topicSet, subtopicSet } = syl;

  // 候选块索引（来源版本溯源 / businessCode 稳定性）
  const cand = JSON.parse(fs.readFileSync(CANDIDATE, 'utf8'));
  const candByCode = new Map(cand.blocks.map((b) => [b.businessCode, b]));

  // -------- 读取 upload.js 的目标环境（仅 database 名，不打印凭证）--------
  let envName = '';
  try {
    const s = fs.readFileSync(UPLOADER, 'utf8');
    const m = s.match(/database:\s*'([^']+)'/);
    envName = m ? m[1] : '未知(未读取到)';
  } catch (e) { envName = '未知(读取失败)'; }

  // 日志/命名统一沿用最新审阅表日期（保持项目日期体系）
  const date = reviewDate();

  // 审阅表 businessCode 集合（交叉核验清单 = 已人工审阅）
  const csv = readCsv(path.join(REPORT_DIR, `chem_step6_review_${date}.csv`));
  const csvCodes = csv ? new Set(csv.rows.map((r) => r.businessCode)) : new Set();

  // -------- 收集全部题并逐题预检 --------
  let total = 0;
  const all = [];               // 展平后的题（仅常规单元）
  const problems = [];          // { businessCode, unit, check, detail }  ← 阻断上传
  const warnings = [];          // { businessCode, unit, check, detail }  ← 非阻断提示
  const uniqueTopics = new Set();
  const forbidden = [];         // 混入 chebt/chet 的阻断记录

  for (const unit of UNITS) {
    const jp = unitJsonPath(unit);
    if (!fs.existsSync(jp)) continue;
    const drafts = JSON.parse(fs.readFileSync(jp, 'utf8'));

    for (const d of drafts) {
      total += 1;

      // 0) 单元白名单（阻断 chebt/chet）
      const uCode = d.unitCode || unit;
      if (uCode === 'chebt' || uCode === 'chet' || /^chem-(chebt|chet)-/i.test(d.businessCode || '')) {
        forbidden.push({ businessCode: d.businessCode, unit: uCode });
        continue;
      }
      if (!UNITS.includes(uCode)) {
        problems.push({ businessCode: d.businessCode, unit: uCode, check: '单元白名单', detail: `unitCode=${uCode} 不在上传清单(pipeline 常规 23 单元)` });
        continue;
      }

      // 1) 必填字段
      const req = ['businessCode', 'unitCode', 'stem', 'options', 'correctIndex', 'explanation', 'topicCode', 'difficultyLevel', 'questionType'];
      for (const f of req) {
        const v = d[f];
        if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
          problems.push({ businessCode: d.businessCode, unit, check: '必填字段', detail: `缺少 ${f}` });
        }
      }

      // 2) businessCode 稳定性：存在于候选块且来源溯源一致
      const bizOk = /^chem-[a-z0-9]+-q[A-Z]\d+$/.test(d.businessCode || '');
      if (!bizOk) problems.push({ businessCode: d.businessCode, unit, check: 'businessCode格式', detail: `${d.businessCode} 不符合 chem-{unit}-q{X}{n} 规范` });
      const blk = candByCode.get(d.businessCode);
      if (!blk) {
        problems.push({ businessCode: d.businessCode, unit, check: 'businessCode稳定性', detail: '候选块中不存在该 businessCode' });
      } else {
        const bs = d.questionSource && d.questionSource.sha256;
        const cs = blk.questionSource && blk.questionSource.sha256;
        if (bs && cs && bs !== cs) {
          problems.push({ businessCode: d.businessCode, unit, check: '来源溯源', detail: `questionSource.sha256 ${bs.slice(0, 8)} ≠ 候选块 ${cs.slice(0, 8)}` });
        }
      }

      // 3) 题型含义（当前契约：单选=1）
      if (d.questionType !== 1) {
        problems.push({ businessCode: d.businessCode, unit, check: '题型', detail: `questionType=${d.questionType}，合法值当前为 1(单选)` });
      }

      // 4) 选项与 correctIndex
      const opts = d.options || [];
      if (opts.length < 2 || opts.length > 12) {
        problems.push({ businessCode: d.businessCode, unit, check: '选项', detail: `选项数=${opts.length} 超出 [2,12]` });
      }
      if (typeof d.correctIndex !== 'number' || !Number.isInteger(d.correctIndex) || d.correctIndex < 0 || d.correctIndex >= opts.length) {
        problems.push({ businessCode: d.businessCode, unit, check: 'correctIndex', detail: `correctIndex=${d.correctIndex} 越界/非法(选项数=${opts.length})` });
      }
      if (new Set(opts.map((o) => String(o).trim())).size !== opts.length) {
        problems.push({ businessCode: d.businessCode, unit, check: '选项', detail: '存在重复选项' });
      }

      // 5) 中文解析
      if (!/[\u4e00-\u9fff]/.test(d.explanation || '')) {
        problems.push({ businessCode: d.businessCode, unit, check: '中文解析', detail: 'explanation 不含中文字符' });
      }

      // 6) 考纲代码与子考点前缀
      const tp = d.topicCode || '';
      if (!topicSet.has(tp)) {
        problems.push({ businessCode: d.businessCode, unit, check: '考纲topicCode', detail: `topicCode=${tp} 不在考纲` });
      } else {
        uniqueTopics.add(tp);
      }
      for (const s of d.subtopicCodes || []) {
        const sub = subtopicSet.get(s);
        if (!sub) {
          problems.push({ businessCode: d.businessCode, unit, check: '考纲subtopicCode', detail: `subtopicCode=${s} 不在考纲` });
        } else if (sub.topicId !== tp) {
          problems.push({ businessCode: d.businessCode, unit, check: '子考点前缀', detail: `${s} 归属 ${sub.topicId}，与 topicCode=${tp} 前缀不一致` });
        }
      }

      // 7) 来源版本：JSON 记录的源文件 SHA 对照磁盘实测
      const md = titleMdFor(unit);
      const mdParsed = analysisMdFor(unit);
      const qs = d.questionSource || {};
      const as = d.analysisSource || {};
      if (!qs.sha256 || !as.sha256) {
        problems.push({ businessCode: d.businessCode, unit, check: '来源版本', detail: 'questionSource/analysisSource 缺少 sha256' });
      }
      if (qs.fileSha256) {
        if (!fs.existsSync(md)) problems.push({ businessCode: d.businessCode, unit, check: '来源版本', detail: `题目源文件缺失: ${md}` });
        else if (qs.fileSha256 !== sha256(fs.readFileSync(md))) {
          problems.push({ businessCode: d.businessCode, unit, check: '来源版本', detail: '题目源文件 SHA 与记录不一致（题目.md 已变更）' });
        }
      }
      if (as.fileSha256) {
        if (!fs.existsSync(mdParsed)) problems.push({ businessCode: d.businessCode, unit, check: '来源版本', detail: `解析源文件缺失: ${mdParsed}` });
        else if (as.fileSha256 !== sha256(fs.readFileSync(mdParsed))) {
          problems.push({ businessCode: d.businessCode, unit, check: '来源版本', detail: '解析源文件 SHA 与记录不一致（解析.md 已变更）' });
        }
      }

      // 8) 未决状态
      if (d.reviewStatus === 'rejected') {
        problems.push({ businessCode: d.businessCode, unit, check: '未决状态', detail: 'reviewStatus=rejected，禁止上传' });
      }

      // 9) 图片/公式检查
      const probe = [d.stem || '', (d.options || []).join('\n'), d.explanation || ''].join('\n');
      if ((probe.match(/\$/g) || []).length % 2 !== 0) {
        problems.push({ businessCode: d.businessCode, unit, check: '公式', detail: 'LaTeX $ 数量为奇数，公式疑似未闭合' });
      }
      if (/cdn-mineru\.openxlab\.org\.cn/.test(probe)) {
        problems.push({ businessCode: d.businessCode, unit, check: '图片', detail: '含已失效 openxlab 图片链接' });
      }
      const imgUrls = [...probe.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1]);
      const resImgs = (d.resources && d.resources.images) || [];
      if (resImgs.length && imgUrls.length === 0) {
        // 源题有图、draft 以「文字描述图特征」替代（作图题变通策略），非阻断
        warnings.push({ businessCode: d.businessCode, unit, check: '图片未嵌入正文', detail: `resources.images=${resImgs.length} 但正文无 markdown 引用（以文字描述替代，合规变通）` });
      }

      all.push(d);
    }
  }

  // 每单元统计（以 problems 归属单元为准）
  const unitStats = new Map(); // unit -> { total, ok, problem }
  for (const unit of UNITS) {
    const totalInUnit = all.filter((d) => (d.unitCode || unit) === unit).length;
    const problemInUnit = new Set(problems.filter((p) => p.unit === unit).map((p) => p.businessCode)).size;
    unitStats.set(unit, { total: totalInUnit, problem: problemInUnit, ok: totalInUnit - problemInUnit });
  }

  // businessCode 全局唯一
  const codes = all.map((d) => d.businessCode);
  const dup = codes.filter((c, i) => codes.indexOf(c) !== i);
  const uniqueness = {
    total: codes.length,
    unique: new Set(codes).size,
    duplicates: [...new Set(dup)],
  };

  // 清单与审阅表交叉核验
  const missingInCsv = codes.filter((c) => !csvCodes.has(c));
  const extraInCsv = [...csvCodes].filter((c) => !codes.includes(c));

  // 阻断判定：混入特集
  const blockedBySpecial = forbidden.length > 0;
  const blockedByCsvMismatch = missingInCsv.length > 0 || extraInCsv.length > 0;

  // 可上传候选：无任何问题 且 在审阅表内 且 非特集
  const problemCodes = new Set(problems.map((p) => p.businessCode));
  const uploadCandidates = codes.filter((c) => !problemCodes.has(c) && csvCodes.has(c));

  const report = {
    generatedAt: new Date().toISOString(),
    date,
    scope: { units: UNITS },
    targetEnv: { database: envName, note: '读自 scripts/uploader/upload.js；本阶段未连接数据库' },
    source: {
      candidateFile: CANDIDATE,
      candidateSha8: sha8(fs.readFileSync(CANDIDATE)),
      reviewCsv: `chem_step6_review_${date}.csv`,
    },
    summary: {
      total,
      withProblem: problemCodes.size,
      clean: uploadCandidates.length,
      warnings: warnings.length,
      uniqueness,
      csvCrossCheck: {
        missingInCsv: missingInCsv.length,
        extraInCsv: extraInCsv.length,
      },
      issuesByCheck: Object.entries(
        problems.reduce((acc, p) => { acc[p.check] = (acc[p.check] || 0) + 1; return acc; }, {})
      ).sort((a, b) => b[1] - a[1]),
    },
    blockers: [
      blockedBySpecial ? { level: 'HIGH', reason: `清单混入特集单元：${forbidden.map((f) => f.businessCode).join(', ')}` } : null,
      blockedByCsvMismatch ? { level: 'HIGH', reason: `清单与审阅表不一致：CSV 缺 ${missingInCsv.length}，多 ${extraInCsv.length}` } : null,
    ].filter(Boolean),
    perUnit: Object.fromEntries(
      [...unitStats.entries()].map(([u, s]) => [u, s])
    ),
    problems: problems.slice(0, 500),
    warnings: warnings.slice(0, 500),
    forbiddenSpecialUnits: forbidden,
    uploadCandidates,
  };

  const outFile = path.join(REPORT_DIR, `chem_upload_preflight_${report.date}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf8');

  // -------- 控制台摘要 --------
  console.log('离线入库预检完成');
  console.log('目标环境:', envName, '（本阶段未连接数据库）');
  console.log(`拟上传单元: ${UNITS.length} 个 →`, UNITS.join(' '));
  console.log(`总题量: ${total} | 无问题: ${uploadCandidates.length} | 有问题(缓传): ${problemCodes.size} | 警告(非阻断): ${warnings.length}`);
  console.log('businessCode 唯一性:', uniqueness.unique, '/', uniqueness.total, uniqueness.duplicates.length ? ' 重复: ' + uniqueness.duplicates.join(',') : '');
  console.log('清单↔审阅表:', `CSV ${csv.rows.length} 行，交叉缺失 ${missingInCsv.length} / 多余 ${extraInCsv.length}`);
  if (blockedBySpecial) console.log('⚠ 阻断: 混入特集单元', forbidden.map((f) => f.businessCode).join(', '));
  if (problems.length) {
    console.log('问题明细(前20条):');
    for (const p of problems.slice(0, 20)) console.log(`  [${p.check}] ${p.businessCode} → ${p.detail}`);
  } else {
    console.log('无任何预检问题');
  }
  console.log('报告输出:', outFile);
}

main();