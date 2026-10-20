const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { extractUnit, assignBusinessCodes, loadNumberingDecisions } = require('./5_extract_question_blocks');

const root = path.resolve(__dirname, '../..');
const meta = path.join(root, 'docs/0 数据准备/Chem/_meta');
const candidateFile = path.join(meta, 'chem_question_blocks_candidate_2026-10-12_v2.json');
const outputBase = path.join(root, 'docs/4 题库全量输入/Step5_确认意见执行与Step6准入报告_2026-10-12');
const sha = (text) => crypto.createHash('sha256').update(text).digest('hex');
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const check = (condition, message) => { if (!condition) throw new Error(message); };
const link = (source, text) => `[${text}](file://${encodeURI(source.file)}#L${source.startLine}-L${source.endLine})`;
const resources = (text) => ({
  images: [...text.matchAll(/!\[[^\]]*\]\([^)]+\)|<img\b[^>]*>/g)].map((m) => m[0]),
  htmlTables: [...text.matchAll(/<table\b[\s\S]*?<\/table>/g)].map((m) => m[0]),
  markdownTableLines: text.split(/\r?\n/).filter((line) => /^\s*\|/.test(line)),
});

function main() {
  check(!fs.existsSync(`${outputBase}.md`) && !fs.existsSync(`${outputBase}.json`), '拒绝覆盖执行报告。');
  const payload = read(candidateFile);
  const index = read(path.join(meta, 'chem_units.json'));
  const legacy = read(path.join(meta, 'chem_question_blocks.json'));
  const pilot = read(path.join(meta, 'chem_question_blocks_che2_pilot.json'));
  const decisions = loadNumberingDecisions(path.join(meta, 'chem_numbering_decisions_2026-10-12_v2.json'));
  const expected = {
    cheb1: 29, cheb2: 33, cheb3: 42, cheb4: 54, cheb5: 55, cheb6: 33,
    che1: 25, che2: 29, che3: 38, che4: 48, che5: 38, che6: 43, che7: 25, che8: 57,
    che9: 46, che10: 16, che11: 38, che12: 18, che13: 24, che14: 41, che15: 42, che16: 62, che17: 39,
  };
  const units = Object.keys(expected);
  check(payload.schemaVersion === 2 && payload.blocks.length === 875 && payload.totalBlocks === 875, '题数/schema不符。');
  check(payload.selectedUnits.length === 23 && units.every((u) => payload.selectedUnits.includes(u)), '范围不符。');
  check(new Set(payload.blocks.map((b) => b.matchKey)).size === 875, '匹配键重复。');
  check(new Set(payload.blocks.map((b) => b.businessCode)).size === 875, '业务编号重复。');
  check(Object.keys(payload.businessCodeMap).length === 875, '活动编号数量不符。');
  check(payload.unitStats.length === 23 && payload.unitStats.every((s) =>
    units.includes(s.unitCode) && s.passed && s.blockCount === expected[s.unitCode]), '逐单元基线不符。');
  check(payload.documents.length === 46, '最终来源文件数量不符。');
  const texts = new Map();
  const segments = new Map();
  const documentRows = [];
  for (const doc of payload.documents) {
    check(units.includes(doc.unitCode), '来源含范围外单元。');
    const expectedFile = path.join(root, 'docs/0 数据准备/Chem', doc.unitCode,
      `${doc.unitCode}_${doc.side === 'question' ? '题目' : '解析'}.md`);
    check(doc.file === expectedFile, '来源不是最终文件。');
    const text = fs.readFileSync(doc.file, 'utf8');
    texts.set(doc.file, text);
    check(sha(text) === doc.sha256 && doc.segments.map((s) => s.raw).join('') === text, '来源版本或原文覆盖不符。');
    check(doc.segments.every((s) => s.kind !== 'unassigned'), '存在未归属片段。');
    let offset = 0;
    for (const segment of doc.segments) {
      check(segment.source.startOffset === offset, '来源片段非连续。');
      offset = segment.source.endOffset;
      check(!segments.has(segment.id), '片段ID重复。');
      segments.set(segment.id, segment);
    }
    const counts = resources(text);
    documentRows.push({ unitCode: doc.unitCode, side: doc.side, file: doc.file, sha256: doc.sha256,
      imageOccurrences: counts.images.length, htmlTables: counts.htmlTables.length,
      markdownTableLines: counts.markdownTableLines.length, lossless: true });
  }
  function verifySource(source, raw) {
    const text = texts.get(source.file);
    check(text !== undefined && sha(text) === source.fileSha256, '来源文件SHA不一致。');
    check(text.slice(source.startOffset, source.endOffset) === raw && sha(raw) === source.sha256, '片段SHA或正文不一致。');
    const lines = text.match(/[^\r\n]*(?:\r\n|\r|\n|$)/g).filter(Boolean);
    check(lines.slice(0, source.startLine - 1).join('').length === source.startOffset &&
      lines.slice(0, source.endLine).join('').length === source.endOffset, '来源行范围不一致。');
  }
  for (const segment of segments.values()) verifySource(segment.source, segment.raw);
  const usedContexts = new Set();
  const questionRows = payload.blocks.map((b) => {
    check(units.includes(b.unitCode) && b.analysisMatchStatus === 'matched', '题块范围或解析状态不符。');
    check(b.matchKey === JSON.stringify([b.unitCode, b.originalCategory, b.matchNumber]) &&
      payload.businessCodeMap[b.matchKey] === b.businessCode, '活动编号键不符。');
    for (const [side, source, raw, ids, complete] of [
      ['question', b.questionSource, b.stemRaw, b.questionContextIds, b.stemWithContextRaw],
      ['analysis', b.analysisSource, b.analysisRaw, b.analysisContextIds, b.analysisWithContextRaw],
    ]) {
      verifySource(source, raw);
      const owner = segments.get(`${b.unitCode}:${side}:${source.startLine}`);
      const contexts = ids.map((id) => {
        const s = segments.get(id);
        check(s && s.source.file === source.file && ['document-context', 'category-context'].includes(s.kind), '上下文失联或串题。');
        check(s.kind === 'document-context' || s.category === b.originalCategory &&
          s.categoryStartLine === owner.categoryStartLine, '分类公共条件归属不符。');
        usedContexts.add(id);
        return s.raw;
      });
      check(contexts.join('') + raw === complete, '完整读取字段遗漏公共条件。');
    }
    return { businessCode: b.businessCode, matchKey: b.matchKey, originalCategory: b.originalCategory,
      sourceNumber: b.sourceNumber, sourceHeading: b.sourceHeading, analysisSourceHeading: b.analysisSourceHeading,
      questionSource: b.questionSource, analysisSource: b.analysisSource,
      questionContextIds: b.questionContextIds, analysisContextIds: b.analysisContextIds,
      analysisMatchStatus: b.analysisMatchStatus, resources: Object.fromEntries(Object.entries(
        resources(b.stemWithContextRaw + b.analysisWithContextRaw)).map(([key, values]) => [key, values.length])) };
  });
  for (const s of segments.values()) {
    if (s.kind.endsWith('context') && s.raw.replace(/^\s*#{1,2}[^\r\n]*/, '').trim()) {
      check(usedContexts.has(s.id), `公共条件未供下游读取：${s.id}`);
    }
  }
  const applied = decisions.rules.map((rule) => {
    const item = payload.retiredBusinessCodes.find((r) => r.oldCode === rule.oldCode);
    if (rule.action === 'retain') {
      check(payload.businessCodeMap[rule.targetMatchKey] === rule.oldCode, `继承未执行：${rule.reviewId}`);
    } else {
      check(item && !payload.blocks.some((b) => b.businessCode === rule.oldCode), `退役未执行：${rule.reviewId}`);
      check(item.replacementBusinessCode === (rule.targetMatchKey ? payload.businessCodeMap[rule.targetMatchKey] : null),
        `迁移关系不符：${rule.reviewId}`);
    }
    return { ...rule, replacementBusinessCode: item?.replacementBusinessCode || null,
      currentBusinessCode: rule.targetMatchKey ? payload.businessCodeMap[rule.targetMatchKey] : null, status: '已执行' };
  });
  check(applied.length === 82 && payload.retiredBusinessCodes.length === 15, '决策执行数量不符。');
  check(Object.keys(payload.businessCodeExceptions).length === 7, '历史前缀例外数量不符。');
  for (const [key, code] of Object.entries(payload.businessCodeExceptions)) {
    const block = payload.blocks.find((b) => b.matchKey === key);
    check(block.businessCode === code && block.blockType === 'C' && block.difficultyLevel === 1, '历史前缀污染实际分类。');
  }
  const fresh = units.flatMap((u) => extractUnit(index.units.find((v) => v.unitCode === u)).blocks);
  const rerun = assignBusinessCodes(fresh, [legacy, pilot, payload], units, decisions);
  check(rerun.reused === 875 && rerun.allocated === 0 &&
    fresh.every((b) => payload.businessCodeMap[b.matchKey] === b.businessCode), '全量重跑编号变化。');
  check(fresh.every((b, i) => b.stemWithContextRaw === payload.blocks[i].stemWithContextRaw &&
    b.analysisWithContextRaw === payload.blocks[i].analysisWithContextRaw), '重抽取内容不一致。');
  for (const b of pilot.blocks) check(payload.businessCodeMap[b.matchKey] === b.businessCode, 'che2旧试点编号变化。');
  const refreshed = payload.blocks.filter((b) => b.unitCode === 'che2').map((b) => ({ ...b, businessCode: '' }));
  const subset = assignBusinessCodes(refreshed, [legacy, payload], ['che2'], decisions);
  check(subset.reused === 29 && subset.allocated === 0, 'che2增量重跑编号变化。');
  for (const source of decisions.sourceVersions) {
    check(sha(fs.readFileSync(source.file)) === source.sha256, `历史或原文输入发生改变：${source.file}`);
  }
  const report = {
    generatedAt: new Date().toISOString(), candidate: { file: candidateFile, sha256: sha(fs.readFileSync(candidateFile)) },
    status: 'step5-verified-candidate-awaiting-release-approval', step5TechnicalBlockers: [],
    scope: units, unitCounts: expected, questionCount: 875, applied,
    rerun: { reused: 875, allocated: 0, che2Stable: 29, incrementalPreservedOtherQuestions: 846 },
    retiredBusinessCodes: payload.retiredBusinessCodes, businessCodeExceptions: payload.businessCodeExceptions,
    documents: documentRows, questions: questionRows,
    allSourceTextPreserved: true, publicContextReferencesVerified: true, databaseChecked: false,
    formalGlobalReplaced: false, step6Executed: false,
    pendingGates: ['确认本次候选版本作为Step6输入', '最终确认Step6契约并升级旧生成器后，才能生成试点JSON'],
    versions: ['scripts/chem_pipeline/5_extract_question_blocks.js', 'scripts/chem_pipeline/6_generate_json.js']
      .map((p) => ({ file: path.join(root, p), sha256: sha(fs.readFileSync(path.join(root, p))) })),
  };
  const out = [
    '# Step 5 确认意见执行与 Step 6 准入报告', '',
    '状态：82 条决策已执行，Step 5 技术阻断清零；独立候选待发布确认。未连接数据库，未执行 Step 6。', '',
    '## 结论', '',
    '**Step 5 已满足进入 Step 6 试点准备的技术条件；不能直接运行旧版 6_generate_json.js。**',
    '正式生成试点 JSON 前，需确认本报告对应的候选输入版本，并最终确认 Step 6 契约、完成生成器升级。全库正式文件尚未覆盖，候选校验通过不冒充人工发布批准。',
    '本轮无新增未决编号；已知来源版本、分类上下文和编号冲突均已处理。', '',
    `候选文件：[chem_question_blocks_candidate_2026-10-12_v2.json](file://${encodeURI(candidateFile)})`,
    `候选 SHA-256：\`${report.candidate.sha256}\``,
    `完整预览：[候选题干解析预览](file://${encodeURI(candidateFile.replace('.json', '_preview.md'))})`,
    'v1 候选只保留为执行历史，曾含两条悬空旧映射，不作为 Step 6 输入；v2 已完成补充迁移及严格活动键核验。',
    '旧 che2 试点保持原文件不动且仍属过期历史；v2 中的29道 che2 题已从最新最终文件重新抽取，29个业务编号全部不变。', '',
    '## 验证结果', '',
    '- 23 单元 / 875 题，875 个非空解析精确匹配，875 个唯一业务编号及活动匹配键。',
    '- 逐单元基线通过；重复、缺失、孤立解析、未归属、来源版本不符均为0。',
    '- 所有原文片段按顺序复原46份最终文件；逐片段SHA-256、文件SHA-256、行范围、上下文引用均验证。',
    '- 图片、HTML表格、Markdown表格行按原文出现次数计数；原文逐字保留，因此脚注/图注不丢失。本轮未进行图片URL联网可用性或渲染验收。',
    '- 首次候选复用595个业务编号、新增280个；补充迁移后全部875个编号不变。全量重跑复用875、新增0；che2增量编号29个不变，其余846题保留。',
    '- 67条旧编号继承；9条退役/归并，6条显式迁移，合计15个旧号永久保留且不再分配；7条精确历史前缀例外。',
    '- 题干/解析Markdown、人工意见清单、旧正式题块及旧che2试点SHA全部未变；特集未抽取或带入候选。', '',
    '| 单元 | 基线 | 候选题数 | 匹配解析 |',
    '| --- | ---: | ---: | ---: |',
    ...units.map((u) => `| ${u} | ${expected[u]} | ${payload.blocks.filter((b) => b.unitCode === u).length} | ${payload.unitStats.find((s) => s.unitCode === u).matchedAnalysisCount} |`),
    '', '## 逐条执行结果', '',
    'H/M编号对应原清单；S001/S002为本轮补充确认。业务编号保留不代表沿用旧题干或旧解析，正文统一采用最新最终文件。',
    '| 审阅号 | 旧编号 | 执行动作 | 当前精确键 | 当前编号/迁移终点 |',
    '| --- | --- | --- | --- | --- |',
    ...applied.map((r) => `| ${r.reviewId} | ${r.oldCode} | ${{ retain: '继承', retire: '退役/归并', migrate: '退役并迁移' }[r.action]}${r.allowHistoricalPrefix ? '（前缀例外）' : ''} | ${r.targetMatchKey || '无当前目标，保留历史'} | ${r.currentBusinessCode || '无'} |`),
    '', '## 工程处理', '',
    '- cheb5 题目侧 `# 基本例題 19` 仅在后继明确为同号例题时识别为分类上下文；原始标题和文本完整保留，不改源文。',
    '- che7 例题26、che12 例题47的旧“基本例题”字形按完整旧标题和编号精确兼容；不扩展为未知分类通配。',
    '- che17 旧B13包含416/417、旧B14包含418/419；按本轮批准，旧号退役并迁移到416/418的新A号，417/419各自完整独立，旧串块不进入题解。',
    '- 编号器新增悬空活动映射阻断；退役号单独保存，不能冒充活动题目。保留最大历史序号，杜绝退役号再分配。',
    '- 后续重跑必须携带已冻结决策文件及最新候选作为编号基准，不能重新用旧正式全库推断冲突映射。', '',
    '## 资源统计', '',
    '| 单元 | 来源侧 | 图片出现次数 | HTML表格数 | Markdown表格行数 |',
    '| --- | --- | ---: | ---: | ---: |',
    ...documentRows.map((d) => `| ${d.unitCode} | ${d.side} | ${d.imageOccurrences} | ${d.htmlTables} | ${d.markdownTableLines} |`),
    '', '## 逐题溯源索引', '',
    '完整SHA-256、原分类/题号/标题、上下文、挂接状态见同名JSON的questions数组；下面链接直接定位最终源文件。',
    '| businessCode | 原分类 | 原题号 | 题干行范围 | 解析行范围 | 状态 |',
    '| --- | --- | --- | --- | --- | --- |',
    ...payload.blocks.map((b) => `| ${b.businessCode} | ${b.originalCategory} | ${b.sourceNumber} | ${link(b.questionSource, `${b.questionSource.startLine}–${b.questionSource.endLine}`)} | ${link(b.analysisSource, `${b.analysisSource.startLine}–${b.analysisSource.endLine}`)} | ${b.analysisMatchStatus} |`), '',
  ];
  fs.writeFileSync(`${outputBase}.json`, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
  fs.writeFileSync(`${outputBase}.md`, out.join('\n'), { flag: 'wx' });
  console.log(JSON.stringify({ report: `${outputBase}.md`, verified: 875, applied: 82,
    retired: 15, migrations: 6, exceptions: 7, candidateSha256: report.candidate.sha256 }, null, 2));
}
try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
