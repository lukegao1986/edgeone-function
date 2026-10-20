const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '../../docs/0 数据准备/Chem');
const META_PATH = path.join(ROOT_DIR, '_meta/chem_units.json');
const GLOBAL_PATH = path.join(ROOT_DIR, '_meta/chem_question_blocks.json');
const ALLOWED_UNITS = [
  ...Array.from({ length: 6 }, (_, i) => `cheb${i + 1}`),
  ...Array.from({ length: 17 }, (_, i) => `che${i + 1}`),
];
const CATEGORY_TYPES = {
  '基礎 CHECK': 'C',
  '基本例題': 'E',
  '基本問題': 'B',
  '応用例題': 'A',
  '応用問題': 'A',
};
const DIFFICULTY = { C: 1, E: 2, B: 2, A: 3 };
const EXPECTED_COUNTS = {
  cheb1: 29, cheb2: 33, cheb3: 42, cheb4: 54, cheb5: 55, cheb6: 33,
  che1: 25, che2: 29, che3: 38, che4: 48, che5: 38, che6: 43, che7: 25,
  che8: 57, che9: 46, che10: 16, che11: 38, che12: 18, che13: 24,
  che14: 41, che15: 42, che16: 62, che17: 39,
};
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const keyOf = (unit, category, number) => JSON.stringify([unit, category, number]);
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

function parseArgs(argv) {
  const args = {};
  const flags = { '--dry-run': 'dryRun', '--validate-only': 'validateOnly', '--incremental': 'incremental' };
  const values = {
    '--units': 'units', '--output': 'output', '--preview': 'preview', '--report': 'report',
    '--base': 'base', '--numbering-decisions': 'numberingDecisions',
  };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (flags[token]) args[flags[token]] = true;
    else if (values[token] && argv[i + 1] && !argv[i + 1].startsWith('--')) {
      args[values[token]] = argv[++i];
    } else throw new Error(`未知参数或缺少参数值: ${token}`);
  }
  if (!args.units) throw new Error('必须显式指定 --units，禁止隐式执行全库。');
  args.units = [...new Set(args.units.split(',').map((item) => item.trim()))];
  if (args.units.some((unit) => !ALLOWED_UNITS.includes(unit))) {
    throw new Error(`单元不在白名单内: ${args.units.filter((unit) => !ALLOWED_UNITS.includes(unit)).join(',')}`);
  }
  if (args.base && !args.incremental) throw new Error('--base 只能与 --incremental 一起使用。');
  if (args.validateOnly && (args.output || args.preview || args.incremental)) {
    throw new Error('--validate-only 仅允许 --report，不生成题块或预览。');
  }
  if (!args.validateOnly && !args.dryRun && !args.output) {
    throw new Error('必须通过 --output 指定独立题块路径。');
  }
  for (const name of ['output', 'preview', 'report', 'base', 'numberingDecisions']) {
    if (args[name]) args[name] = path.resolve(args[name]);
  }
  if (args.output) {
    if (path.extname(args.output) !== '.json') throw new Error('--output 必须为 JSON 文件。');
    args.preview ||= args.output.replace(/\.json$/, '_preview.md');
    args.report ||= args.output.replace(/\.json$/, '_report.json');
  }
  return args;
}

function canonicalCategory(label, unitCode) {
  const value = label.replace(/^#{1,2}\s*/, '').trim();
  if (/^基礎\s*CHECK$/.test(value)) return '基礎 CHECK';
  if (unitCode === 'cheb4' && value === '基本例题') return '基本例題';
  if (unitCode === 'che4' && value === '応答問題') return '応用問題';
  return Object.hasOwn(CATEGORY_TYPES, value) ? value : null;
}

function imageRefs(text) {
  const refs = [];
  for (const match of text.matchAll(/!\[[^\]]*]\(([^)]+)\)|<img\b[^>]*\bsrc=["']([^"']+)["']/g)) {
    refs.push(match[1] || match[2]);
  }
  return [...new Set(refs)];
}

function anchorFor(line, unitCode, side, category, currentNumber) {
  const text = line.trim();
  // These exceptions are source identities, not a numeric or semantic heuristic.
  if (side === 'question' && category === '基本問題' &&
      ((unitCode === 'che16' && currentNumber === '367' && text === '## 2 個の') ||
       (unitCode === 'che17' && currentNumber === '398' && text === '## 2つ以上あるときは、すべて記せ。'))) {
    return { kind: 'inner', rule: 'confirmed-inner-heading' };
  }
  if (unitCode === 'che1' && side === 'question' && category === '応用問題' &&
      /^15 ZnS の結晶(?:\s|$)/.test(text)) {
    return { kind: 'question', sourceNumber: '15', matchNumber: '15', rule: 'che1-bare-15' };
  }
  if (unitCode === 'che5' && side === 'analysis' && category === '基本問題' && /^##\s+1 0 8$/.test(text)) {
    return { kind: 'question', sourceNumber: '1 0 8', matchNumber: '108', rule: 'che5-spaced-108' };
  }
  const heading = text.match(/^##\s+(.+)$/);
  if (!heading) return null;
  const example = heading[1].match(/^(基本例題|基本例题|応用例題)\s+(\d+)(?=\s|$)/);
  if (example) {
    const exampleCategory = canonicalCategory(example[1], unitCode);
    if (!exampleCategory) return { kind: 'unknown', rule: 'unknown-example-category' };
    return {
      kind: 'question', sourceNumber: example[2], matchNumber: example[2],
      category: exampleCategory, rule: 'example-heading',
    };
  }
  const numeric = heading[1].match(/^(?:記述\s*)?(?:[※×-]\s*)?(\d+)(?=\s|$|[（(])/);
  if (numeric) {
    const suffix = heading[1].slice(numeric[0].length);
    if (/^(?:\s+\d)+\s*$/.test(suffix)) return { kind: 'unknown', rule: 'unconfirmed-spaced-number' };
    return { kind: 'question', sourceNumber: numeric[1], matchNumber: numeric[1], rule: 'numeric-heading' };
  }
  return { kind: /^\d/.test(heading[1]) ? 'unknown' : 'inner', rule: 'non-question-heading' };
}

function parseDocument(unit, side, file) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.trim()) throw new Error(`最终文件为空: ${file}`);
  const lines = text.match(/[^\r\n]*(?:\r\n|\r|\n|$)/g).filter(Boolean);
  const offsets = [0];
  for (const line of lines) offsets.push(offsets[offsets.length - 1] + line.length);
  const fileHash = sha256(text);
  const segments = [];
  const blocks = [];
  const contexts = [];
  const events = [];
  const issues = [];
  let category = null;
  let categoryHeading = '';
  let categoryStartLine = null;
  let currentNumber = null;
  let pending = { kind: 'document-context', start: 0 };
  let fenced = null;

  function flush(end) {
    if (end <= pending.start) return;
    const raw = text.slice(offsets[pending.start], offsets[end]);
    const source = {
      file, fileSha256: fileHash, startLine: pending.start + 1, endLine: end,
      startOffset: offsets[pending.start], endOffset: offsets[end], sha256: sha256(raw),
    };
    const segment = {
      ...pending, id: `${unit.unitCode}:${side}:${pending.start + 1}`, raw, source,
    };
    delete segment.start;
    segments.push(segment);
    if (segment.kind === 'question') blocks.push(segment);
    if (['document-context', 'category-context'].includes(segment.kind)) contexts.push(segment);
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].replace(/[\r\n]+$/, '');
    const fence = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      if (!fenced) fenced = fence[1];
      else if (fence[1][0] === fenced[0] && fence[1].length >= fenced.length) fenced = null;
      continue;
    }
    if (fenced) continue;
    const heading = line.trim().match(/^#{1,2}\s+(.+)$/);
    let nextCategory = heading && canonicalCategory(heading[1], unit.unitCode);
    if (unit.unitCode === 'cheb5' && side === 'question' && line.trim() === '# 基本例題 19') {
      const following = lines.slice(i + 1).find((item) => item.trim());
      if (/^## 基本例題 19(?:\s|$)/.test(following?.trim() || '')) {
        nextCategory = '基本例題';
        events.push({ line: i + 1, raw: line, rule: 'cheb5-example-19-category-context' });
      }
    }
    if (nextCategory) {
      flush(i);
      category = nextCategory;
      categoryHeading = line;
      categoryStartLine = i + 1;
      currentNumber = null;
      pending = { kind: 'category-context', start: i, category, categoryHeading, categoryStartLine };
      continue;
    }
    if (/^\s*#\s+/.test(line)) {
      flush(i);
      category = null;
      currentNumber = null;
      pending = { kind: 'unassigned', start: i };
      issues.push({ line: i + 1, raw: line, reason: '未识别一级分类，后续内容不猜配' });
      continue;
    }
    const anchor = anchorFor(line, unit.unitCode, side, category, currentNumber);
    if (!anchor) continue;
    if (anchor.kind !== 'question') {
      events.push({ line: i + 1, raw: line, category, ownerNumber: currentNumber, rule: anchor.rule });
      if (anchor.kind === 'unknown') issues.push({ line: i + 1, raw: line, reason: anchor.rule });
      continue;
    }
    const actualCategory = anchor.category || category;
    if (!actualCategory || (anchor.category && category && anchor.category !== category)) {
      issues.push({ line: i + 1, raw: line, reason: '题号缺少分类或例题分类冲突' });
      flush(i);
      pending = { kind: 'unassigned', start: i };
      currentNumber = null;
      continue;
    }
    flush(i);
    category = actualCategory;
    currentNumber = anchor.matchNumber;
    pending = {
      kind: 'question', start: i, category, categoryHeading, categoryStartLine,
      sourceNumber: anchor.sourceNumber, matchNumber: anchor.matchNumber,
      sourceHeading: line, anchorRule: anchor.rule,
      matchKey: keyOf(unit.unitCode, category, anchor.matchNumber),
    };
    if (anchor.rule !== 'numeric-heading') {
      events.push({ line: i + 1, raw: line, category, ownerNumber: currentNumber, rule: anchor.rule });
    }
  }
  flush(lines.length);
  if (segments.map((segment) => segment.raw).join('') !== text) throw new Error(`原文覆盖校验失败: ${file}`);
  return {
    unitCode: unit.unitCode, side, file, sha256: fileHash,
    segments, blocks, contexts, events, issues, lossless: true,
  };
}

function groupBy(items, key) {
  const map = new Map();
  for (const item of items) {
    const value = key(item);
    if (!map.has(value)) map.set(value, []);
    map.get(value).push(item);
  }
  return map;
}

function applicableContexts(document, block) {
  return document.contexts.filter((context) => context.kind === 'document-context' ||
    (context.category === block.category && context.categoryStartLine === block.categoryStartLine));
}

function extractUnit(unit) {
  const question = parseDocument(unit, 'question', unit.paths.finalQuestionFile);
  const analysis = parseDocument(unit, 'analysis', unit.paths.finalAnalysisFile);
  const qMap = groupBy(question.blocks, (block) => block.matchKey);
  const aMap = groupBy(analysis.blocks, (block) => block.matchKey);
  const duplicates = [question, analysis].flatMap((doc) =>
    [...groupBy(doc.blocks, (block) => block.matchKey)].filter(([, items]) => items.length > 1)
      .map(([matchKey, items]) => ({ side: doc.side, matchKey, sources: items.map((item) => item.source) })));
  const blocks = question.blocks.map((q) => {
    const candidates = aMap.get(q.matchKey) || [];
    const a = candidates.length === 1 && qMap.get(q.matchKey).length === 1 ? candidates[0] : null;
    const qContexts = applicableContexts(question, q);
    const aContexts = a ? applicableContexts(analysis, a) : [];
    const stemWithContextRaw = qContexts.map((context) => context.raw).join('') + q.raw;
    const analysisWithContextRaw = a ? aContexts.map((context) => context.raw).join('') + a.raw : '';
    const analysisBody = a ? a.raw.slice(a.sourceHeading.length).trim() : '';
    const inlineAnswer = a && a.sourceHeading.replace(/^##\s*/, '')
      .replace(/^(?:記述\s*)?(?:[※×-]\s*)?\d+\s*/, '').trim();
    return {
      unitCode: unit.unitCode, originalCategory: q.category, sectionLabel: q.category,
      blockType: CATEGORY_TYPES[q.category], difficultyLevel: DIFFICULTY[CATEGORY_TYPES[q.category]],
      sourceNumber: q.sourceNumber, matchNumber: q.matchNumber, matchKey: q.matchKey,
      sourceHeading: q.sourceHeading, sourceCategoryHeading: q.categoryHeading,
      analysisSourceHeading: a ? a.sourceHeading : '',
      analysisSourceNumber: a ? a.sourceNumber : null,
      analysisMatchNumber: a ? a.matchNumber : null,
      analysisCategoryHeading: a ? a.categoryHeading : '',
      chapterTitle: unit.chapterTitle, candidateSyllabusRoots: unit.candidateSyllabusRoots || [],
      stemRaw: q.raw, analysisRaw: a ? a.raw : '',
      stemWithContextRaw, analysisWithContextRaw,
      questionContextIds: qContexts.map((context) => context.id),
      analysisContextIds: aContexts.map((context) => context.id),
      questionSource: q.source, analysisSource: a ? a.source : null,
      imageRefs: imageRefs(stemWithContextRaw + analysisWithContextRaw),
      analysisMatchStatus: !a ? (candidates.length ? 'ambiguous' : 'missing') :
        (analysisBody || (a.anchorRule === 'numeric-heading' && inlineAnswer) ? 'matched' : 'empty'),
      businessCode: '',
    };
  });
  const unassigned = [question, analysis].flatMap((doc) => doc.segments
    .filter((segment) => segment.kind === 'unassigned' && segment.raw.trim())
    .map((segment) => ({ side: doc.side, ...segment })));
  for (const doc of [question, analysis]) {
    const usedContexts = new Set(doc.blocks.flatMap((block) =>
      applicableContexts(doc, block).map((context) => context.id)));
    unassigned.push(...doc.contexts.filter((context) => !usedContexts.has(context.id) &&
      context.raw.replace(/^\s*#{1,2}[^\r\n]*/, '').trim())
      .map((context) => ({ side: doc.side, ...context, reason: '公共条件或章首说明无关联题目' })));
  }
  const missing = blocks.filter((block) => block.analysisMatchStatus !== 'matched')
    .map((block) => ({ matchKey: block.matchKey, status: block.analysisMatchStatus, source: block.questionSource }));
  const orphanAnalysis = analysis.blocks.filter((block) => !qMap.has(block.matchKey));
  const categoryCounts = Object.fromEntries(Object.keys(CATEGORY_TYPES).map((category) =>
    [category, blocks.filter((block) => block.originalCategory === category).length]));
  const reusedNumbers = [...groupBy(question.blocks, (block) => block.matchNumber)]
    .filter(([, items]) => new Set(items.map((item) => item.category)).size > 1)
    .map(([number, items]) => ({ number, categories: items.map((item) => item.category) }));
  const issues = [question, analysis].flatMap((doc) => doc.issues.map((issue) => ({ side: doc.side, ...issue })));
  if (!question.blocks.length) issues.push({ side: 'question', reason: '未识别出任何题目' });
  const stats = {
    unitCode: unit.unitCode, blockCount: blocks.length, analysisCount: analysis.blocks.length,
    expectedCount: EXPECTED_COUNTS[unit.unitCode] ?? null,
    matchedAnalysisCount: blocks.length - missing.length, categoryCounts,
    blockTypeCounts: Object.fromEntries(['C', 'E', 'B', 'A'].map((type) =>
      [type, blocks.filter((block) => block.blockType === type).length])),
    duplicates, missing, orphanAnalysis, unassigned, issues, reusedNumbers,
    events: [question, analysis].flatMap((doc) => doc.events.map((event) => ({ side: doc.side, file: doc.file, ...event }))),
    contextSources: [question, analysis].flatMap((doc) => doc.contexts
      .map((context) => ({ side: doc.side, ...context }))),
    lossless: question.lossless && analysis.lossless,
  };
  stats.passed = !duplicates.length && !missing.length && !orphanAnalysis.length &&
    !unassigned.length && !issues.length &&
    (stats.expectedCount === null || stats.expectedCount === blocks.length);
  return { blocks, stats, documents: [question, analysis] };
}

function legacyKey(block) {
  let label = block.originalCategory || block.sectionLabel || '';
  const legacyExampleSpellings = {
    'chem-che7-qE1': '## 基本例题 26 反応速度式',
    'chem-che12-qE1': '## 基本例题 47 元素分析',
  };
  if (label === legacyExampleSpellings[block.businessCode]) label = label.replace('基本例题', '基本例題');
  const example = label.replace(/^##\s*/, '').match(/^(基本例題|基本例题|応用例題)(?:\s|$)/);
  const category = canonicalCategory(example ? example[1] : label, block.unitCode);
  const number = String(block.matchNumber ?? block.sourceNumber ?? '');
  if (!category || !/^\d+$/.test(number)) throw new Error(`无法确认旧业务编号的精确来源键: ${block.businessCode}`);
  const key = keyOf(block.unitCode, category, number);
  if (block.matchKey && block.matchKey !== key) throw new Error(`旧映射键不一致: ${block.businessCode}`);
  return key;
}

function loadNumberingDecisions(file) {
  if (!file) return null;
  const text = fs.readFileSync(file, 'utf8');
  const decisions = JSON.parse(text);
  if (decisions.schemaVersion !== 1 || decisions.kind !== 'approved-numbering-decisions' ||
      !Array.isArray(decisions.rules) || !Array.isArray(decisions.sourceVersions) ||
      !Array.isArray(decisions.scope) || decisions.scope.some((u) => !ALLOWED_UNITS.includes(u))) {
    throw new Error('编号决策格式或范围无效。');
  }
  for (const source of decisions.sourceVersions) {
    if (sha256(fs.readFileSync(source.file)) !== source.sha256) {
      throw new Error(`编号确认依据已变化，需重新确认: ${source.file}`);
    }
  }
  return { ...decisions, source: { file, sha256: sha256(text) } };
}

function assignBusinessCodes(blocks, payloads, selectedUnits, decisions = null) {
  const registry = new Map();
  const owners = new Map();
  const maxima = new Map();
  const retired = new Map();
  const exceptions = new Map();
  const rules = new Map();
  const currentKeys = new Set(blocks.map((b) => b.matchKey));
  function rememberCode(code, unit) {
    const match = code.match(/^chem-(cheb[1-6]|che(?:1[0-7]|[1-9]))-q([CEBA])([1-9]\d*)$/);
    if (!match || match[1] !== unit || !Number.isSafeInteger(Number(match[3]))) {
      throw new Error(`业务编号格式无效: ${code}`);
    }
    const prefix = code.slice(0, -match[3].length);
    maxima.set(prefix, Math.max(maxima.get(prefix) || 0, Number(match[3])));
  }
  function registerException(key, code) {
    if (exceptions.has(code) && exceptions.get(code) !== key) throw new Error(`历史前缀例外冲突: ${code}`);
    exceptions.set(code, key);
  }
  for (const payload of payloads) {
    for (const item of payload.retiredBusinessCodes || []) {
      if (!selectedUnits.includes(item.unitCode)) continue;
      rememberCode(item.oldCode, item.unitCode);
      if (retired.has(item.oldCode) && retired.get(item.oldCode).targetMatchKey !== item.targetMatchKey) {
        throw new Error(`退役编号目标冲突: ${item.oldCode}`);
      }
      retired.set(item.oldCode, { ...item });
    }
    for (const [key, code] of Object.entries(payload.businessCodeExceptions || {})) {
      if (selectedUnits.includes(JSON.parse(key)[0])) registerException(key, code);
    }
  }
  for (const rule of decisions?.rules || []) {
    if (!selectedUnits.includes(rule.unitCode)) continue;
    if (rules.has(rule.oldCode) || !['retain', 'retire', 'migrate'].includes(rule.action)) {
      throw new Error(`重复或无效编号决策: ${rule.oldCode}`);
    }
    rememberCode(rule.oldCode, rule.unitCode);
    if (rule.targetMatchKey) {
      const [unit, category, number] = JSON.parse(rule.targetMatchKey);
      if (unit !== rule.unitCode || !CATEGORY_TYPES[category] || !/^\d+$/.test(number) ||
          !currentKeys.has(rule.targetMatchKey)) throw new Error(`批准的编号目标不存在: ${rule.oldCode}`);
    } else if (rule.action !== 'retire') throw new Error(`编号决策缺少目标: ${rule.oldCode}`);
    rules.set(rule.oldCode, rule);
    if (rule.action !== 'retain') {
      retired.set(rule.oldCode, {
        unitCode: rule.unitCode, oldCode: rule.oldCode, action: rule.action,
        targetMatchKey: rule.targetMatchKey, reviewId: rule.reviewId,
      });
    } else if (rule.allowHistoricalPrefix) registerException(rule.targetMatchKey, rule.oldCode);
  }
  function reserve(key, code) {
    const [unitCode, category] = JSON.parse(key);
    if (!selectedUnits.includes(unitCode)) return;
    if (retired.has(code)) throw new Error(`退役编号不得复用: ${code}`);
    rememberCode(code, unitCode);
    const match = code.match(new RegExp(`^chem-${unitCode}-q${CATEGORY_TYPES[category]}(\\d+)$`));
    if (!match && exceptions.get(code) !== key) throw new Error(`业务编号格式或分类冲突: ${key} => ${code}`);
    if ((registry.has(key) && registry.get(key) !== code) || (owners.has(code) && owners.get(code) !== key)) {
      throw new Error(`业务编号映射冲突，需人工确认: ${key} => ${code}`);
    }
    registry.set(key, code);
    owners.set(code, key);
  }
  for (const payload of payloads) {
    for (const block of payload.blocks || []) {
      if (!selectedUnits.includes(block.unitCode) || !block.businessCode) continue;
      rememberCode(block.businessCode, block.unitCode);
      if (retired.has(block.businessCode)) continue;
      const rule = rules.get(block.businessCode);
      reserve(rule?.targetMatchKey || legacyKey(block), block.businessCode);
    }
    for (const [key, code] of Object.entries(payload.businessCodeMap || {})) {
      if (!selectedUnits.includes(JSON.parse(key)[0])) continue;
      rememberCode(code, JSON.parse(key)[0]);
      if (!retired.has(code)) reserve(rules.get(code)?.targetMatchKey || key, code);
    }
  }
  for (const rule of rules.values()) {
    if (rule.action === 'retain') reserve(rule.targetMatchKey, rule.oldCode);
  }
  const orphanKeys = [...registry.keys()].filter((key) => !currentKeys.has(key));
  if (orphanKeys.length) {
    throw new Error(`活动编号映射没有当前题目，禁止猜测迁移或带入候选: ${orphanKeys.join('; ')}`);
  }
  const reused = blocks.filter((block) => registry.has(block.matchKey)).length;
  for (const block of blocks) {
    if (!registry.has(block.matchKey)) {
      const prefix = `chem-${block.unitCode}-q${block.blockType}`;
      const next = (maxima.get(prefix) || 0) + 1;
      reserve(block.matchKey, `${prefix}${next}`);
    }
    block.businessCode = registry.get(block.matchKey);
  }
  for (const item of retired.values()) {
    item.replacementBusinessCode = item.targetMatchKey ? registry.get(item.targetMatchKey) || null : null;
    if (item.targetMatchKey && !item.replacementBusinessCode) throw new Error(`退役目标缺少编号: ${item.oldCode}`);
  }
  return {
    businessCodeMap: Object.fromEntries(registry), reused, allocated: blocks.length - reused,
    retiredBusinessCodes: [...retired.values()],
    businessCodeExceptions: Object.fromEntries([...exceptions].map(([code, key]) => [key, code])),
    decisionsSource: decisions?.source || null,
  };
}

function buildPreview(payload, report) {
  const out = [
    '# Step 5 题干-解析核对预览', '',
    '仅结构化抽取；未执行 Step 6，未生成选项或改写原文。', '',
    '| 单元 | 题数 | 非空匹配 | 原分类数量 | 重复键 | 缺失/空解析 | 未归属 |', '| --- | ---: | ---: | --- | ---: | ---: | ---: |',
    ...report.unitStats.map((s) => `| ${s.unitCode} | ${s.blockCount} | ${s.matchedAnalysisCount} | ${Object.entries(s.categoryCounts).map(([c, n]) => `${c}: ${n}`).join('；')} | ${s.duplicates.length} | ${s.missing.length} | ${s.unassigned.length} |`),
    '', '原文空行、标题、图片、表格、脚注全部保留。章节说明及分类公共条件单独列出，并在逐题全文中携带。',
    '跨分类同号合法；同分类同号阻断挂接。异常清单及完整来源见同名 report.json。', '',
  ];
  for (const block of payload.blocks.filter((item) => report.selectedUnits.includes(item.unitCode))) {
    out.push('---', '', `### ${block.businessCode} | ${block.originalCategory} | ${block.sourceNumber}`, '',
      `匹配键：\`${block.matchKey}\`；状态：${block.analysisMatchStatus}`,
      `题干来源：${block.questionSource.file}:${block.questionSource.startLine}-${block.questionSource.endLine}`,
      `解析来源：${block.analysisSource ? `${block.analysisSource.file}:${block.analysisSource.startLine}-${block.analysisSource.endLine}` : '缺失'}`,
      `原题干标题：\`${block.sourceHeading}\``,
      `原解析标题：\`${block.analysisSourceHeading}\``,
      `公共条件引用：${[...block.questionContextIds, ...block.analysisContextIds].join(', ')}`, '',
      '**题干（含公共条件）**', '', block.stemWithContextRaw,
      '**解析（含公共条件）**', '', block.analysisWithContextRaw, '');
  }
  return out.join('\n');
}

function checkOutputPaths(args) {
  const outputs = ['output', 'preview', 'report'].map((name) => args[name]).filter(Boolean);
  if (new Set(outputs).size !== outputs.length) throw new Error('题块、预览、报告必须使用不同路径。');
  for (const file of outputs) {
    if (file === GLOBAL_PATH || file === META_PATH || file === args.base || file === args.numberingDecisions ||
        /(?:题目|解析)(?:_cleaned)?\.md$/.test(file) ||
        !/(?:\.json|_preview\.md)$/.test(file)) {
      throw new Error(`禁止覆盖源文、元数据、基准文件或正式全库: ${file}`);
    }
    if (!fs.existsSync(path.dirname(file))) throw new Error(`输出父目录不存在: ${path.dirname(file)}`);
    if (fs.existsSync(file) && (fs.lstatSync(file).isSymbolicLink() || fs.statSync(file).nlink > 1)) {
      throw new Error(`输出不允许符号链接或硬链接: ${file}`);
    }
    const realParent = fs.realpathSync(path.dirname(file));
    if (realParent !== path.dirname(file)) throw new Error(`输出父目录不允许路径别名: ${file}`);
    if (file.endsWith('.json') && fs.existsSync(file)) {
      const old = readJson(file);
      if (old.schemaVersion !== 2) throw new Error(`拒绝覆盖非本脚本 v2 产物: ${file}`);
    }
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  checkOutputPaths(args);
  const index = readJson(META_PATH);
  const units = args.units.map((code) => {
    const matches = index.units.filter((unit) => unit.unitCode === code);
    if (matches.length !== 1) throw new Error(`单元索引缺失或重复: ${code}`);
    const unit = matches[0];
    for (const [name, suffix] of [['finalQuestionFile', '题目'], ['finalAnalysisFile', '解析']]) {
      const expected = path.join(ROOT_DIR, code, `${code}_${suffix}.md`);
      const file = unit.paths[name];
      if (!file || path.resolve(file) !== expected || !fs.existsSync(file)) {
        throw new Error(`缺少最终文件或路径不符合白名单: ${code}.${name} = ${file || '(未配置)'}；禁止回退 cleaned。`);
      }
      if (fs.realpathSync(file) !== expected) throw new Error(`最终文件不允许重定向: ${file}`);
    }
    return unit;
  });
  const oldOutput = args.output && fs.existsSync(args.output) ? readJson(args.output) : null;
  if (!args.incremental && oldOutput && (oldOutput.blocks || []).some((b) => !args.units.includes(b.unitCode))) {
    throw new Error('输出包含未选单元；必须 --incremental 明确保留，或改用新的独立路径。');
  }
  const baseFile = args.base || (args.incremental ? args.output : null);
  if (args.incremental && (!baseFile || !fs.existsSync(baseFile))) throw new Error('增量执行必须指定存在的 --base 或 --output。');
  const base = args.incremental ? readJson(baseFile) : null;
  if (base && !Array.isArray(base.blocks)) throw new Error('增量基准缺少 blocks。');
  if (base && base.blocks.some((block) => !ALLOWED_UNITS.includes(block.unitCode))) {
    throw new Error('增量基准含范围外单元，禁止将特集带入常规候选；请指定纯常规基准。');
  }
  if (base && oldOutput && baseFile !== args.output) {
    const retained = (p) => (p.blocks || []).filter((b) => !args.units.includes(b.unitCode));
    if (JSON.stringify(retained(base)) !== JSON.stringify(retained(oldOutput))) {
      throw new Error('基准与已有输出的未选单元不同，禁止覆盖；请改用新输出路径。');
    }
  }
  const results = units.map(extractUnit);
  const blocks = results.flatMap((result) => result.blocks);
  const unitStats = results.map((result) => result.stats);
  const documents = results.flatMap((result) => result.documents);
  const report = {
    schemaVersion: 2, generatedAt: new Date().toISOString(), selectedUnits: args.units,
    validateOnly: !!args.validateOnly, dryRun: !!args.dryRun,
    passed: unitStats.every((stats) => stats.passed), unitStats,
    sources: documents.map(({ unitCode, side, file, sha256: hash, lossless }) =>
      ({ unitCode, side, file, sha256: hash, lossless })),
  };
  let payload;
  if (!args.validateOnly && report.passed) {
    const global = fs.existsSync(GLOBAL_PATH) ? readJson(GLOBAL_PATH) : null;
    const decisions = loadNumberingDecisions(args.numberingDecisions);
    const numbering = assignBusinessCodes(blocks, [global, base, oldOutput].filter(Boolean), args.units, decisions);
    report.numbering = { reused: numbering.reused, allocated: numbering.allocated, databaseChecked: false };
    report.numbering.retiredBusinessCodes = numbering.retiredBusinessCodes;
    report.numbering.businessCodeExceptions = numbering.businessCodeExceptions;
    report.numbering.decisionsSource = numbering.decisionsSource;
    report.numbering.seedSources = [...new Set([GLOBAL_PATH, baseFile, oldOutput && args.output].filter(Boolean))]
      .filter((file) => fs.existsSync(file)).map((file) => ({ file, sha256: sha256(fs.readFileSync(file)) }));
    const preservedBlocks = base ? base.blocks.filter((block) => !args.units.includes(block.unitCode)) : [];
    report.incremental = {
      enabled: !!args.incremental, base: baseFile || null,
      preservedUnits: [...new Set(preservedBlocks.map((block) => block.unitCode))],
      preservedBlockCount: preservedBlocks.length,
    };
    const preserve = (items) => (items || []).filter((item) => !args.units.includes(item.unitCode));
    payload = {
      ...(base || {}), schemaVersion: 2, generatedAt: report.generatedAt,
      selectedUnits: args.units, totalBlocks: preservedBlocks.length + blocks.length,
      unitStats: [...preserve(base?.unitStats), ...unitStats],
      blocks: [...preservedBlocks, ...blocks],
      documents: [...preserve(base?.documents), ...documents.map(({ blocks: ignoredBlocks, contexts: ignoredContexts, ...doc }) => doc)],
      businessCodeMap: {
        ...Object.fromEntries(Object.entries(base?.businessCodeMap || {}).filter(([key]) =>
          !args.units.includes(JSON.parse(key)[0]))),
        ...numbering.businessCodeMap,
      },
      retiredBusinessCodes: [...preserve(base?.retiredBusinessCodes), ...numbering.retiredBusinessCodes],
      businessCodeExceptions: {
        ...Object.fromEntries(Object.entries(base?.businessCodeExceptions || {}).filter(([key]) =>
          !args.units.includes(JSON.parse(key)[0]))),
        ...numbering.businessCodeExceptions,
      },
      numberingDecisionsSource: numbering.decisionsSource,
      contentContract: {
        raw: 'stemRaw / analysisRaw 是包含原始题目标题的连续原文，不压缩空白、不拆分小问。',
        complete: '下游必须读取 stemWithContextRaw / analysisWithContextRaw，或按 contextIds 从 documents.segments 拼接公共条件与 raw。',
        provenance: 'source 的行号从 1 开始且首尾包含；offset 为 JavaScript UTF-16 偏移，endOffset 不包含。',
        numbering: '精确来源键复用旧编号；显式批准迁移/退役；退役号记录在 retiredBusinessCodes，永不复用；历史前缀例外仅按 businessCodeExceptions 精确放行。',
      },
    };
  }
  for (const stats of unitStats) {
    console.log(`[${stats.unitCode}] 题目=${stats.blockCount} 解析=${stats.analysisCount} 匹配=${stats.matchedAnalysisCount} 分类=${JSON.stringify(stats.categoryCounts)} 重复=${stats.duplicates.length} 缺失=${stats.missing.length} 孤立解析=${stats.orphanAnalysis.length} 未归属=${stats.unassigned.length} 结构疑点=${stats.issues.length} 无损=${stats.lossless}`);
  }
  console.log(`校验=${report.passed ? '通过' : '未通过'} dry-run=${!!args.dryRun} validate-only=${!!args.validateOnly}`);
  if (report.numbering) console.log(`业务编号: 复用=${report.numbering.reused} 新增=${report.numbering.allocated}；未核查数据库`);
  if (report.incremental) console.log(`增量保留: ${JSON.stringify(report.incremental)}`);
  if (!args.dryRun) {
    for (const doc of documents) {
      if (sha256(fs.readFileSync(doc.file)) !== doc.sha256) throw new Error(`抽取期间来源发生变化: ${doc.file}`);
    }
    if (args.report) fs.writeFileSync(args.report, `${JSON.stringify(report, null, 2)}\n`);
    if (payload) {
      fs.writeFileSync(args.output, `${JSON.stringify(payload, null, 2)}\n`);
      fs.writeFileSync(args.preview, buildPreview(payload, report));
    }
  }
  if (!report.passed) {
    if (!args.report || args.dryRun) console.log(JSON.stringify(report, null, 2));
    process.exitCode = 1;
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Step 5 失败: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { parseDocument, extractUnit, assignBusinessCodes, parseArgs, loadNumberingDecisions };
