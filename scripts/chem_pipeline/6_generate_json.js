#!/usr/bin/env node
/**
 * Step 6 正式生成器（升级版）
 *
 * 依据《化学 Step 6 正式生成契约》实现。只做语法与本地已有数据校验和 dry-run，
 * 不自动启动全量内容生成，不连接或写入数据库，不编写测试文件。
 *
 * 接口（契约第 11 节）：
 *   node 6_generate_json.js \
 *     --blocks <已批准Step5候选> \
 *     --approval <批准记录> \
 *     --units <显式常规单元列表> \
 *     --output-dir <独立版本目录> \
 *     --dry-run
 *
 * 唯一内容输入是显式指定的 Step 5 v2 题块文件，禁止回退读取历史全局
 * chem_question_blocks.json。
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '../../docs/0 数据准备/Chem');
const UNITS_PATH = path.join(ROOT_DIR, '_meta', 'chem_units.json');
const SYLLABUS_PATH = path.resolve(__dirname, '../../src/data/ejuSyllabus.ts');

// 范围白名单：仅处理 cheb1-cheb6、che1-che17；排除特集 chebt、chet。
const UNIT_WHITELIST = new Set([
  'cheb1', 'cheb2', 'cheb3', 'cheb4', 'cheb5', 'cheb6',
  'che1', 'che2', 'che3', 'che4', 'che5', 'che6', 'che7', 'che8',
  'che9', 'che10', 'che11', 'che12', 'che13', 'che14', 'che15',
  'che16', 'che17',
]);

const DEFAULT_SCORE = 5;
const OPTION_HARD_LIMIT = 12;            // 已确认硬上限，不使用 min(2N+2, 12) 封顶。
const CONTRACT_VERSION = 'chem-step6-contract-v1-draft';
const GENERATOR_VERSION = '1.0.0';

function sha256Text(text) {
  return crypto.createHash('sha256').update(String(text), 'utf8').digest('hex');
}

function sha256File(filePath) {
  return sha256Text(fs.readFileSync(filePath, 'utf8'));
}

function parseArgs(argv) {
  const args = {
    blocks: null,
    approval: null,
    units: [],
    outputDir: null,
    dryRun: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];
    if (token === '--blocks' && next) {
      args.blocks = next;
      i += 1;
    } else if (token === '--approval' && next) {
      args.approval = next;
      i += 1;
    } else if (token === '--units' && next) {
      args.units = next.split(',').map((s) => s.trim()).filter(Boolean);
      i += 1;
    } else if (token === '--output-dir' && next) {
      args.outputDir = next;
      i += 1;
    } else if (token === '--dry-run') {
      args.dryRun = true;
    }
  }
  return args;
}

function loadJson(filePath, label) {
  if (!filePath) {
    throw new Error(`${label} 未提供路径`);
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} 不存在: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadApproval(value) {
  if (!value) {
    return null;
  }
  if (fs.existsSync(value)) {
    return { record: loadJson(value, 'approval 记录文件'), type: 'file' };
  }
  try {
    return { record: JSON.parse(value), type: 'inline' };
  } catch (err) {
    throw new Error(`无法解析 --approval（既不是可读文件也不是 JSON 字符串）: ${value}`);
  }
}

function loadSyllabus() {
  const source = fs.readFileSync(SYLLABUS_PATH, 'utf8');
  const marker = 'export const EJU_SYLLABUS: EjuSyllabus =';
  const start = source.indexOf(marker);
  if (start < 0) {
    throw new Error(`无法在 ejuSyllabus.ts 中定位 ${marker}`);
  }
  const code = `${source.slice(start).replace(marker, 'const EJU_SYLLABUS =')}\nmodule.exports = EJU_SYLLABUS;`;
  const sandbox = { module: { exports: null } };
  vm.runInNewContext(code, sandbox, { timeout: 2000 });
  return sandbox.module.exports;
}

function flattenChemistryTopics(syllabus) {
  const science = syllabus.find((item) => item && item.code === 'science');
  const chemistry = science && science.subSubjects.find((item) => item.code === 'chemistry');
  if (!chemistry) {
    throw new Error('ejuSyllabus.ts 缺少 science → chemistry 分支');
  }
  const topics = [];
  for (const chapter of chemistry.chapters || []) {
    for (const section of chapter.sections || []) {
      for (const topic of section.topics || []) {
        topics.push({
          chapterId: chapter.id,
          sectionId: section.id,
          topicId: topic.id,
          topicTitle: topic.title,
          content: topic.content || '',
          subtopics: (topic.subtopics || []).map((s) => ({
            code: s.code,
            name: s.name,
            aliases: s.aliases || [],
          })),
        });
      }
    }
  }
  return topics;
}

// ---------- 前置硬校验（契约 3.2） ----------

function validateBlocks(blocksPayload, units) {
  const issues = [];
  const blocks = blocksPayload.blocks || [];
  const matchedKeys = new Set();
  const businessCodes = new Set();
  const unitCount = new Map();
  const selectedSet = new Set(units.map((u) => u.unitCode));

  // 特集单元绝不允许进入候选（范围硬性排除，即使未显式选中）。
  for (const b of blocks) {
    if (!UNIT_WHITELIST.has(b.unitCode)) {
      issues.push(`[范围] 候选含白名单外单元 ${b.unitCode}（businessCode=${b.businessCode || '?'}）`);
    }
  }

  for (const b of blocks) {
    if (!selectedSet.has(b.unitCode)) {
      // 未选中单元：合法，仅统计用于基线校验，不展开逐块校验。
      unitCount.set(b.unitCode, (unitCount.get(b.unitCode) || 0) + 1);
      continue;
    }
    unitCount.set(b.unitCode, (unitCount.get(b.unitCode) || 0) + 1);

    const matchKey = b.matchKey;
    if (!matchKey) {
      issues.push(`[键] ${b.businessCode || '?'} 缺少 matchKey`);
    } else {
      if (matchedKeys.has(matchKey)) {
        issues.push(`[键] matchKey 重复: ${matchKey}`);
      }
      matchedKeys.add(matchKey);
    }

    if (!b.businessCode) {
      issues.push(`[键] 缺 businessCode（matchKey=${matchKey || '?'}）`);
    } else {
      if (businessCodes.has(b.businessCode)) {
        issues.push(`[键] businessCode 重复: ${b.businessCode}`);
      }
      businessCodes.add(b.businessCode);
    }

    if (b.analysisMatchStatus !== 'matched') {
      issues.push(`[挂接] ${b.businessCode || matchKey} 解析状态非 matched，实际=${b.analysisMatchStatus}`);
    }
    if (!b.stemWithContextRaw) {
      issues.push(`[内容] ${b.businessCode || matchKey} 缺 stemWithContextRaw`);
    }
    if (!b.analysisWithContextRaw && !b.analysisRaw) {
      issues.push(`[内容] ${b.businessCode || matchKey} 缺解析来源`);
    }

    // 上下文引用必须属于正确单元/文件侧。
    for (const ctx of b.questionContextIds || []) {
      if (!/^[a-zA-Z0-9]+:question:\d+$/.test(ctx)) {
        issues.push(`[上下文] ${b.businessCode} questionContextId 格式异常: ${ctx}`);
      }
    }
    for (const ctx of b.analysisContextIds || []) {
      if (!/^[a-zA-Z0-9]+:analysis:\d+$/.test(ctx)) {
        issues.push(`[上下文] ${b.businessCode} analysisContextId 格式异常: ${ctx}`);
      }
    }
  }

  // 每个选中单元必须存在，且候选数量与批准基线一致。
  const statByUnit = new Map((blocksPayload.unitStats || []).map((s) => [s.unitCode, s]));
  for (const u of units) {
    const current = unitCount.get(u.unitCode) || 0;
    const stat = statByUnit.get(u.unitCode);
    const expected = stat ? stat.expectedCount : undefined;
    if (current === 0) {
      issues.push(`[基线] 选中单元 ${u.unitCode} 在候选中没有任何块`);
    } else if (expected !== undefined && current !== expected) {
      issues.push(`[基线] ${u.unitCode} 候选当前=${current}，批准期望=${expected}`);
    } else if (expected === undefined) {
      issues.push(`[基线] ${u.unitCode} 候选无 unitStats 基线记录（当前=${current}）`);
    }
  }

  return { issues, blocks };
}

function selectedUnits(units) {
  if (!units || units.length === 0) {
    return ALL_UNITS;
  }
  const out = [];
  for (const u of units) {
    const base = ALL_UNITS.find((x) => x.unitCode === u);
    if (!base) {
      throw new Error(`未在白名单中找到单元: ${u}`);
    }
    out.push(base);
  }
  return out;
}

// 记录全局单元（在 main 中填充），为避免循环引用先声明。
let ALL_UNITS = [];
let BLOCK_SOURCE_SHA = '';
let SYLLABUS_SHA = '';
let ARGS = null;

// 全局 topic 索引（由 main 填充）。
const TOPIC_INDEX = new Map();
const TOPIC_BY_CHAPTER = new Map();

// ---------- 草稿序列化（契约 9 状态机） ----------

/**
 * 将 Step 5 题块映射为一个带状态的草稿对象。
 *
 * 本轮不做自动内容生成（不自动拼装选项/猜答案/强制中文翻译），因此：
 *  - stem 完整取自 stemWithContextRaw；
 *  - explanation 以 Step 5 解析原文承载，标记【详细解析】为待人工中文审阅；
 *  - options/correctIndex 保持空并给出原因备注，绝不猜测或使用 -1/0 掩盖；
 *  - topicCode 通过考纲精确匹配 candidateSyllabusRoots。
 */
function buildDraft(block, resources) {
  const stem = trimBlock(block.stemWithContextRaw || block.stemRaw);
  const analysis = trimBlock(block.analysisWithContextRaw || block.analysisRaw || '');

  const topicMatch = matchTopicByBlock(block);

  // 选项策略判定（契约 6.x）：如实标注，不自动生成。
  const optionMode = inferOptionMode(stem);
  const reasons = [];
  if (optionMode === 'native_pending') {
    reasons.push('题干含原生选项但未做无损结构提取，保持原状待人工迁移，correctIndex 待定');
  } else if (optionMode === 'multi_subquestion') {
    reasons.push('客观多小问需按 D1 审批后生成完整答案组合，本步骤不自动拼装');
  } else if (optionMode === 'non_equivalent') {
    reasons.push('存在作图/论述/结构式等不可自动等价转换的作答位置，标记 NON_EQUIVALENT_CONVERSION');
  } else if (optionMode === 'new_generation') {
    reasons.push('非原生选择题需按 D1 审批后新造 2N+2 组合，本步骤不自动生成');
  }

  const status = deriveStatus(optionMode);

  const answerSlots = extractAnswerSlots(stem);

  const draft = {
    businessCode: block.businessCode,
    matchKey: block.matchKey,
    topicCode: topicMatch.topicCode,
    subtopicCodes: topicMatch.subtopicCodes,
    topicEvidence: topicMatch.evidence,
    questionType: 1,
    difficultyLevel: block.difficultyLevel,
    score: DEFAULT_SCORE,
    stem,
    options: [],
    correctIndex: null,
    explanation: buildExplanation(block, analysis),
    optionMode,
    optionStateNotes: reasons,
    answerSlots,
    N: answerSlots && answerSlots.length > 0 ? answerSlots.length : null,
    NPolicy: 'answer-slots',
    unitCode: block.unitCode,
    originalCategory: block.originalCategory,
    blockType: block.blockType,
    sourceNumber: block.sourceNumber,
    matchNumber: block.matchNumber,
    sourceHeading: block.sourceHeading,
    analysisSourceHeading: block.analysisSourceHeading,
    analysisMatchStatus: block.analysisMatchStatus,
    chapterTitle: block.chapterTitle,
    generationStatus: status, // draft | needs_review | blocked
    reviewIssues: reasons,
    source: {
      questionSource: block.questionSource,
      analysisSource: block.analysisSource,
      questionContextIds: block.questionContextIds || [],
      analysisContextIds: block.analysisContextIds || [],
      blocksFileSha256: BLOCK_SOURCE_SHA,
    },
    contentHash: buildContentHash(block),
    generatorVersion: GENERATOR_VERSION,
    contractVersion: CONTRACT_VERSION,
    syllabusSha256: SYLLABUS_SHA,
  };

  // 资源清单（图片、表格）按出现记录。
  collectResources(block, draft, resources);
  return draft;
}

function trimBlock(text) {
  return String(text || '').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** inferOptionMode：保守判定选项处理分支。 */
function inferOptionMode(stem) {
  const hasNativeOption = /(?:\n|\s)\([ア-オァ-ォア-ウa-zA-Z]+\)(?:\s|.)*$/.test(stem) || /\((?:ア|イ|ウ|エ|オ|A|B|C|D)\)/.test(stem);
  const multiSub = /(?:\(|（)\d+(?:\)|）)/.test(stem);
  const nonEquiv = /記述|説明せよ|図にかきこめ|描け|示せ|構造式|たてよ|述べよ|説明|かきこめ/.test(stem);
  if (multiSub && nonEquiv) {
    return 'non_equivalent';
  }
  if (multiSub) {
    return 'multi_subquestion';
  }
  if (hasNativeOption) {
    return 'native_pending';
  }
  return 'new_generation';
}

function deriveStatus(optionMode) {
  // blocked：超限/结构/不可等价转换；其余待审草稿。
  if (optionMode === 'non_equivalent' || optionMode === 'multi_subquestion') {
    return 'blocked';
  }
  return 'needs_review';
}

/** extractAnswerSlots：按独立作答位置初步提取（契约 5 节）。返回数组作为待审清单。 */
function extractAnswerSlots(stem) {
  const slots = [];
  const seen = new Set();
  // 捕获 (n)(x) 叶子位置与 (n) 顶层位置；父问与叶子不重复累计的处理留待人工核定。
  const re = /(?:\(|（)(\d+)(?:\)|）)(?:\s*\(?([a-zA-Z]{1,2})\)?)?/g;
  let m;
  while ((m = re.exec(stem))) {
    const top = m[1];
    const leaf = m[2];
    const id = leaf ? `${top}.${leaf}` : top;
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    slots.push({
      slotId: id,
      sourceLabel: leaf ? `(${top})(${leaf})` : `(${top})`,
      parent: leaf ? top : null,
      state: 'pending_review',
    });
  }
  return slots;
}

function matchTopicByBlock(block) {
  const roots = block.candidateSyllabusRoots || [];
  const searchText = `${block.chapterTitle || ''}\n${block.stemWithContextRaw || block.stemRaw}\n${block.analysisWithContextRaw || block.analysisRaw || ''}`;

  // 从候选根章下属 topics 中选得分最高且有正分的 topic。
  let best = null;
  let bestScore = 0;
  for (const root of roots) {
    const rootTopics = TOPIC_BY_CHAPTER.get(root) || [];
    for (const t of rootTopics) {
      // 同时比较 topic 标题/内容与 subtopic 名称/别名，评价该 topic 的整体相关性。
      const topicText = `${t.topicTitle}\n${t.content || ''}`;
      let score = 0;
      const topicTerms = extractTerms(topicText);
      for (const term of topicTerms) {
        if (searchText.includes(term)) {
          score += term.length >= 4 ? 3 : 2;
        }
      }
      for (const subt of t.subtopics) {
        const terms = [subt.name, ...subt.aliases].filter(Boolean);
        for (const term of terms) {
          if (term.length >= 2 && searchText.includes(term)) {
            score += term.length >= 4 ? 3 : 2;
          }
        }
      }
      if (score > bestScore) {
        bestScore = score;
        best = { topic: t, score };
      }
    }
  }

  if (!best || bestScore <= 0) {
    return { topicCode: null, subtopicCodes: [], evidence: [] };
  }

  const picked = best.topic.subtopics
    .map((s) => ({ s, score: subtopicScore(s, searchText) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.s.code);
  return { topicCode: best.topic.topicId, subtopicCodes: picked, evidence: verdictEvidence(best.topic, searchText) };
}

function extractTerms(text) {
  const value = String(text || '');
  return (value.match(/[A-Za-z][A-Za-z0-9_+\-]{1,}|[一-龥ぁ-んァ-ヶー]{2,}|\d+(?:\.\d+)?/g) || [])
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => s.length >= 2);
}

function verdictEvidence(topic, searchText) {
  const hits = [];
  for (const subt of topic.subtopics) {
    const terms = [subt.name, ...subt.aliases].filter(Boolean);
    for (const term of terms) {
      if (term.length >= 2 && searchText.includes(term)) {
        hits.push(term);
      }
    }
  }
  return Array.from(new Set(hits)).slice(0, 8);
}

function subtopicScore(subt, searchText) {
  let score = 0;
  const terms = [subt.name, ...subt.aliases].filter(Boolean);
  for (const term of terms) {
    if (term.length >= 2 && searchText.includes(term)) {
      score += term.length >= 4 ? 3 : 2;
    }
  }
  return score;
}

function buildExplanation(block, analysis) {
  if (!analysis) {
    return '【参考答案】: 待补充\n\n【详细解析】: Step 5 未挂接解析,需人工补充答案与中文解析。';
  }
  return `【参考答案】: ${extractAnswerSummary(block) || '(待人工从解析中核定)'}\n\n【详细解析】: ${analysis}（本段现为日文解析原文,中文整理需人工审阅并通过后才能标记内容通过）`;
}

function extractAnswerSummary(block) {
  const raw = trimBlock(block.analysisRaw);
  if (!raw) {
    return '';
  }
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^!?\[.*]\(.*\)$/.test(l))
    .filter((l) => !/^##/.test(l))
    .filter((l) => !/^\${2,}$/.test(l));
  return lines.slice(0, 3).join(' / ');
}

function buildContentHash(block) {
  return sha256Text(JSON.stringify({
    businessCode: block.businessCode,
    stem: block.stemWithContextRaw,
    analysis: block.analysisWithContextRaw,
    matchKey: block.matchKey,
  }));
}

function collectResources(block, draft, resources) {
  const text = `${block.stemWithContextRaw || ''}\n${block.analysisWithContextRaw || ''}`;
  const images = text.match(/!\[[^\]]*]\(([^)]+)\)/g) || [];
  const htmlTables = (text.match(/<table[\s\S]*?<\/table>/g) || []).length;
  for (const img of images) {
    const url = (img.match(/]\(([^)]+)\)/) || [])[1];
    resources.push({ businessCode: draft.businessCode, type: 'image', ref: url || img });
  }
  if (htmlTables > 0) {
    resources.push({ businessCode: draft.businessCode, type: 'html_table', count: htmlTables });
  }
}

// ---------- 预览与审计 ----------

function buildPreview(unit, drafts) {
  let md = `# ${unit.unitCode} 题库草稿预览（Step 6 候选，非可导入）\n\n`;
  md += `- 章节：${unit.chapterTitle}\n`;
  md += `- 草稿数：${drafts.length}\n`;
  md += `- 状态分布：${summarizeField(drafts, 'generationStatus')}\n`;
  md += `- optionMode 分布：${summarizeField(drafts, 'optionMode')}\n\n`;
  md += `## 题目索引\n\n`;
  for (const d of drafts) {
    md += `- ${d.businessCode} | topic=${d.topicCode || '未定'} | 难度${d.difficultyLevel} | 状态${d.generationStatus} | ${truncate(stripHeading(d.stem), 70)}\n`;
  }
  md += `\n## 完整内容\n\n`;
  for (const d of drafts) {
    md += `### ${d.businessCode}\n`;
    md += `- topicCode: ${d.topicCode || 'TOPIC_UNRESOLVED'}\n`;
    md += `- subtopicCodes: ${d.subtopicCodes.join(', ') || 'SUBTOPIC_UNRESOLVED'}\n`;
    md += `- optionMode: ${d.optionMode}\n`;
    md += `- generationStatus: ${d.generationStatus}\n`;
    md += `- N(answerSlots): ${d.N}\n`;
    md += `- reviewIssues: ${d.reviewIssues.join('；') || '无'}\n\n`;
    md += `#### 题干\n\n${d.stem}\n\n`;
    md += `#### 选项\n\n${d.options.length === 0 ? '- [ ] 未生成（需人工审批/提取）\n\n' : d.options.map((o, i) => `- [${i === d.correctIndex ? '✓' : ' '}] ${o}`).join('\n') + '\n\n'}`;
    md += `#### 解析\n\n${d.explanation}\n\n`;
  }
  return md;
}

function stripHeading(text) {
  return String(text || '').replace(/^#{1,6}\s*/gm, '').trim();
}

function truncate(text, length = 120) {
  const value = String(text || '').trim();
  return value.length <= length ? value : `${value.slice(0, length)}...`;
}

function summarizeField(items, key) {
  const counts = new Map();
  for (const it of items) {
    const v = String(it[key] === null ? 'null' : it[key]);
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  return Array.from(counts.entries()).map(([k, v]) => `${k}=${v}`).join('，');
}

// ---------- main ----------

function main() {
  const args = parseArgs(process.argv.slice(2));
  ARGS = args;
  if (!args.blocks) {
    throw new Error('缺少 --blocks 参数：必须指定已批准的 Step 5 候选文件（唯一内容输入）。');
  }

  // 考纲与单元索引（锁定 SHA）。
  const syllabus = loadSyllabus();
  const chemistryTopics = flattenChemistryTopics(syllabus);
  for (const t of chemistryTopics) {
    TOPIC_INDEX.set(t.topicId, t);
    if (!TOPIC_BY_CHAPTER.has(t.chapterId)) {
      TOPIC_BY_CHAPTER.set(t.chapterId, []);
    }
    TOPIC_BY_CHAPTER.get(t.chapterId).push(t);
  }
  SYLLABUS_SHA = sha256File(SYLLABUS_PATH);

  const unitsPayload = loadJson(UNITS_PATH, 'chem_units.json');
  ALL_UNITS = (unitsPayload.units || [])
    .filter((u) => UNIT_WHITELIST.has(u.unitCode))
    .map((u) => ({
      unitCode: u.unitCode,
      chapterTitle: u.chapterTitle,
      candidateSyllabusRoots: u.candidateSyllabusRoots || [],
    }));

  // 严格校验：若 --units 传入特集，直接报错。
  for (const u of args.units) {
    if (!UNIT_WHITELIST.has(u)) {
      throw new Error(`白名单外单元不可生成：${u}`);
    }
  }

  const blocksPayload = loadJson(args.blocks, 'Step 5 候选题块');
  BLOCK_SOURCE_SHA = sha256File(args.blocks);

  // approval（提供时）校验候选 SHA 与白名单一致。
  const approval = loadApproval(args.approval);
  if (approval) {
    const rec = approval.record;
    if (rec.blocksSha256 && rec.blocksSha256 !== BLOCK_SOURCE_SHA) {
      throw new Error(`approval 记录的 blocksSha256 与实际候选不一致。记录=${rec.blocksSha256}，实际=${BLOCK_SOURCE_SHA}`);
    }
  }

  const units = selectedUnits(args.units);

  // 前置硬校验。
  const { issues, blocks } = validateBlocks(blocksPayload, units);
  if (issues.length > 0) {
    throw new Error(`前置硬校验失败（共 ${issues.length} 条）：\n${issues.slice(0, 40).join('\n')}${issues.length > 40 ? `\n... 其余 ${issues.length - 40} 条` : ''}`);
  }

  // 逐单元生成草稿。
  const draftsByUnit = new Map();
  const allDrafts = [];
  const resources = [];
  for (const unit of units) {
    const unitBlocks = blocks.filter((b) => b.unitCode === unit.unitCode);
    const drafts = unitBlocks.map((b) => buildDraft(b, resources));
    draftsByUnit.set(unit.unitCode, drafts);
    allDrafts.push(...drafts);
  }

  // 汇总与 dry-run 判定。
  if (args.dryRun) {
    console.log(`DRY-RUN 通过。输入候选 SHA-256: ${BLOCK_SOURCE_SHA}`);
    console.log(`  总草稿数: ${allDrafts.length}`);
    console.log(`  状态分布: ${summarizeField(allDrafts, 'generationStatus')}`);
    console.log(`  optionMode 分布: ${summarizeField(allDrafts, 'optionMode')}`);
    console.log(`  topic 未定: ${allDrafts.filter((d) => !d.topicCode).length}`);
    console.log(`  subtopic 未定: ${allDrafts.filter((d) => d.topicCode && d.subtopicCodes.length === 0).length}`);
    console.log(`  resources(图片/表格): ${resources.length}`);
    console.log('  dry-run 未写任何文件，未连接数据库。');
    return;
  }

  if (!args.outputDir) {
    throw new Error('非 dry-run 模式必须提供 --output-dir。');
  }
  writeVersionedOutput(args.outputDir, units, draftsByUnit, allDrafts, resources);
}

function writeVersionedOutput(outputDir, units, draftsByUnit, allDrafts, resources) {
  const dirs = [path.join(outputDir, 'drafts'), path.join(outputDir, 'previews'), path.join(outputDir, 'audit')];
  for (const d of dirs) {
    fs.mkdirSync(d, { recursive: true });
  }

  for (const unit of units) {
    const drafts = draftsByUnit.get(unit.unitCode);
    fs.writeFileSync(path.join(outputDir, 'drafts', `${unit.unitCode}.json`), `${JSON.stringify(drafts, null, 2)}\n`, 'utf8');
    fs.writeFileSync(path.join(outputDir, 'previews', `${unit.unitCode}.md`), buildPreview(unit, drafts), 'utf8');
  }

  fs.writeFileSync(path.join(outputDir, 'audit', 'questions.json'), `${JSON.stringify(allDrafts, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(outputDir, 'audit', 'issues.json'), `${JSON.stringify(collectIssues(allDrafts), null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(outputDir, 'audit', 'resources.json'), `${JSON.stringify(resources, null, 2)}\n`, 'utf8');

  const manifest = {
    schemaVersion: 2,
    contractVersion: CONTRACT_VERSION,
    generatorVersion: GENERATOR_VERSION,
    generatedAt: new Date().toISOString(),
    blocksFile: path.basename(ARGS.blocks),
    blocksSha256: BLOCK_SOURCE_SHA,
    syllabusSha256: SYLLABUS_SHA,
    units: units.map((u) => u.unitCode),
    unitDraftCounts: Object.fromEntries(Array.from(draftsByUnit.entries()).map(([u, d]) => [u, d.length])),
    statusSummary: summarizeField(allDrafts, 'generationStatus'),
    optionModeSummary: summarizeField(allDrafts, 'optionMode'),
    optionHardLimit: OPTION_HARD_LIMIT,
    answerSlotPolicy: 'answer-slots',
    totalDrafts: allDrafts.length,
    note: '本目录仅为含状态的草稿封装，不包含可导入数组；写入数据库需另行批准并完成目标环境只读预检。',
  };
  fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`输出已写入: ${path.resolve(outputDir)}`);
  console.log(`  草稿: ${allDrafts.length}，状态=${manifest.statusSummary}`);
}

function collectIssues(allDrafts) {
  const issues = [];
  for (const d of allDrafts) {
    if (d.reviewIssues.length > 0) {
      issues.push({ businessCode: d.businessCode, generationStatus: d.generationStatus, reviewIssues: d.reviewIssues });
    }
  }
  return issues;
}

main();