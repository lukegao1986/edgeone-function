const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../docs/0 数据准备/Chem');
const META_DIR = path.join(ROOT_DIR, '_meta');
const OUTPUT_PATH = path.join(META_DIR, 'chem_units.json');

const UNIT_PATTERN = /^che(?:b\d+|bt|\d+|t)$/;

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readTextIfExists(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf8');
}

function getUnitSortValue(unitCode) {
  if (/^cheb\d+$/.test(unitCode)) return Number(unitCode.slice(4));
  if (unitCode === 'chebt') return 99;
  if (/^che\d+$/.test(unitCode)) return 100 + Number(unitCode.slice(3));
  if (unitCode === 'chet') return 199;
  return 999;
}

function listUnitDirs(rootDir) {
  return fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && UNIT_PATTERN.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => getUnitSortValue(a) - getUnitSortValue(b));
}

function buildSourceBook(unitCode) {
  if (/^cheb\d+$/.test(unitCode) || /^che[1-8]$/.test(unitCode) || unitCode === 'chebt') {
    return {
      id: 'theory',
      label: '理论化学',
      questionSourceFile: unitCode === 'chebt'
        ? 'リードα 化学基礎+化学 问题篇 （理论化学）.md'
        : 'リードα 化学基礎+化学 问题篇 （理论化学）.md',
      analysisSourceFile: 'リードα 化学基礎+化学 解答篇(理论化学).md',
    };
  }

  return {
    id: 'inorganic_organic',
    label: '无机有机',
    questionSourceFile: 'リードα 化学基礎+化学 问题篇(无机有机).md',
    analysisSourceFile: 'リードα 化学基礎+化学 解答篇(无机有机).md',
  };
}

function buildCandidateSyllabusRoots(unitCode) {
  if (/^cheb[1-4]$/.test(unitCode)) return ['chem_1'];
  if (/^cheb[5-6]$/.test(unitCode)) return ['chem_2'];
  if (/^che[1-8]$/.test(unitCode)) return ['chem_2'];
  if (/^che(?:9|10|11)$/.test(unitCode)) return ['chem_3'];
  if (/^che(?:12|13|14|15|16|17)$/.test(unitCode)) return ['chem_4'];
  if (unitCode === 'chebt') return ['chem_1', 'chem_2'];
  if (unitCode === 'chet') return ['chem_1', 'chem_2', 'chem_3', 'chem_4'];
  return ['chem_1', 'chem_2', 'chem_3', 'chem_4'];
}

function buildUnitType(unitCode) {
  if (unitCode === 'chebt' || unitCode === 'chet') return 'special';
  if (unitCode.startsWith('cheb')) return 'foundation';
  return 'regular';
}

function buildStudyStage(unitCode) {
  if (/^cheb\d+$/.test(unitCode) || unitCode === 'chebt') return '化学基礎';
  if (/^che\d+$/.test(unitCode) || unitCode === 'chet') return '化学';
  return '未知';
}

function normalizeHeadingText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/^#+\s*/, '')
    .trim();
}

function extractHeadings(text) {
  const lines = text.split(/\r?\n/);
  const headings = [];

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^\s{0,3}#{1,6}\s*(.+?)\s*$/);
    if (!match) continue;

    const value = normalizeHeadingText(match[1]);
    if (!value) continue;

    headings.push({
      index: i,
      value,
    });
  }

  return headings;
}

function isGenericHeading(value) {
  return [
    'リードα 化学基礎 + 化学',
    'リードα 化学基礎+化学',
    '化学',
    '化学基礎',
  ].includes(value);
}

function findChapterTitle(texts) {
  const headings = texts.flatMap((text) => extractHeadings(text));

  for (let i = 0; i < headings.length; i += 1) {
    const current = headings[i].value;
    const next = headings[i + 1] ? headings[i + 1].value : '';

    if (/^第\s*\d+\s*章\s+.+/.test(current) || /^第\d+章.+/.test(current)) {
      return current.replace(/\s+/g, ' ').trim();
    }

    if (/^第\s*\d+\s*章$/.test(current) && next && !isGenericHeading(next) && !/^基礎ドリル$/.test(next)) {
      return `${current} ${next}`.replace(/\s+/g, ' ').trim();
    }

    if (/^特集[①②③④⑤⑥⑦⑧⑨⑩\d]/.test(current)) {
      return current;
    }
  }

  for (const item of headings) {
    if (!isGenericHeading(item.value)) {
      return item.value;
    }
  }

  return '';
}

function buildUnitRecord(unitCode, index) {
  const unitDir = path.join(ROOT_DIR, unitCode);
  const knowledgePath = path.join(unitDir, `${unitCode}知识点.md`);
  const questionPath = path.join(unitDir, `${unitCode}题目.md`);
  const analysisPath = path.join(unitDir, `${unitCode}解析.md`);

  const knowledgeText = readTextIfExists(knowledgePath);
  const questionText = readTextIfExists(questionPath);
  const analysisText = readTextIfExists(analysisPath);

  const sourceBook = buildSourceBook(unitCode);
  const chapterTitle = findChapterTitle([analysisText, questionText, knowledgeText]);

  return {
    unitCode,
    sortOrder: index + 1,
    unitType: buildUnitType(unitCode),
    isSpecial: unitCode === 'chebt' || unitCode === 'chet',
    studyStage: buildStudyStage(unitCode),
    chapterTitle,
    candidateSyllabusRoots: buildCandidateSyllabusRoots(unitCode),
    sourceBook,
    paths: {
      dir: unitDir,
      knowledgeFile: fs.existsSync(knowledgePath) ? knowledgePath : null,
      questionFile: fs.existsSync(questionPath) ? questionPath : null,
      analysisFile: fs.existsSync(analysisPath) ? analysisPath : null,
      drillFile: path.join(unitDir, `${unitCode}_drill.md`),
      cleanedQuestionFile: path.join(unitDir, `${unitCode}题目_cleaned.md`),
      cleanedAnalysisFile: path.join(unitDir, `${unitCode}解析_cleaned.md`),
      finalQuestionFile: path.join(unitDir, `${unitCode}_题目.md`),
      finalAnalysisFile: path.join(unitDir, `${unitCode}_解析.md`),
      jsonFile: path.join(unitDir, `chem_${unitCode}_questions.json`),
      previewFile: path.join(unitDir, `chem_${unitCode}_questions_preview.md`),
    },
    exists: {
      knowledgeFile: fs.existsSync(knowledgePath),
      questionFile: fs.existsSync(questionPath),
      analysisFile: fs.existsSync(analysisPath),
    },
  };
}

function main() {
  ensureDir(META_DIR);

  const unitCodes = listUnitDirs(ROOT_DIR);
  const units = unitCodes.map((unitCode, index) => buildUnitRecord(unitCode, index));

  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    rootDir: ROOT_DIR,
    totalUnits: units.length,
    units,
  };

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`Generated ${OUTPUT_PATH}`);
  console.log(`Total units: ${units.length}`);
  console.log(`Units: ${units.map((unit) => unit.unitCode).join(', ')}`);
}

main();
