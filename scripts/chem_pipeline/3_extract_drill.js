const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../docs/0 数据准备/Chem');
const META_PATH = path.join(ROOT_DIR, '_meta', 'chem_units.json');

function parseArgs(argv) {
  const args = {
    units: null,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--units' && argv[i + 1]) {
      args.units = argv[i + 1].split(',').map((item) => item.trim()).filter(Boolean);
      i += 1;
      continue;
    }
    if (token === '--dry-run') {
      args.dryRun = true;
    }
  }

  return args;
}

function loadUnitIndex() {
  if (!fs.existsSync(META_PATH)) {
    throw new Error(`Step 0 output not found: ${META_PATH}`);
  }
  return JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
}

function normalizeTrailing(text) {
  return text.replace(/\r\n?/g, '\n').replace(/\s+$/, '') + '\n';
}

function cleanupText(text) {
  return normalizeTrailing(text.replace(/\n{3,}/g, '\n\n').trim());
}

function findDrillStart(lines) {
  return lines.findIndex((line) => /^##\s*基礎ドリル\s*$/.test(line.trim()));
}

function findQuestionDrillEnd(lines, startIndex) {
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i].trim())) {
      return i;
    }
  }
  return lines.length;
}

function findAnalysisDrillEnd(lines, startIndex) {
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();

    if (!trimmed) continue;

    if (/^\d{1,3}\s*$/.test(trimmed)) {
      return i;
    }

    if (/^\d{1,3}\s+/.test(trimmed)) {
      return i;
    }

    if (/^##\s+/.test(trimmed) && !/^##\s*[〈【（(]/.test(trimmed)) {
      return i;
    }
  }
  return lines.length;
}

function extractSection(text, mode) {
  const normalized = text.replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');
  const startIndex = findDrillStart(lines);

  if (startIndex === -1) {
    return {
      found: false,
      sectionBody: '',
      updatedText: normalizeTrailing(normalized),
    };
  }

  const endIndex = mode === 'question'
    ? findQuestionDrillEnd(lines, startIndex)
    : findAnalysisDrillEnd(lines, startIndex);

  const before = lines.slice(0, startIndex);
  const section = lines.slice(startIndex, endIndex);
  const after = lines.slice(endIndex);

  const sectionBody = cleanupText(section.join('\n').replace(/^##\s*基礎ドリル\s*\n?/, ''));
  const updatedText = normalizeTrailing(
    [...before, ...after].join('\n').replace(/\n{3,}/g, '\n\n').trim(),
  );

  return {
    found: true,
    sectionBody,
    updatedText,
  };
}

function buildDrillMarkdown(unitCode, chapterTitle, questionBody, analysisBody) {
  const parts = ['## 基礎ドリル'];

  if (chapterTitle) {
    parts.push('', `> ${chapterTitle}`);
  }

  if (questionBody) {
    parts.push('', '### 题目', '', questionBody.trim());
  }

  if (analysisBody) {
    parts.push('', '### 答案', '', analysisBody.trim());
  }

  return `${parts.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

function writeIfChanged(filePath, content, dryRun) {
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
  if (current === content) return false;
  if (!dryRun) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  return true;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const index = loadUnitIndex();
  const units = args.units
    ? index.units.filter((unit) => args.units.includes(unit.unitCode))
    : index.units;

  if (units.length === 0) {
    throw new Error('No units matched the provided --units filter.');
  }

  let drillCount = 0;
  let updatedQuestionCount = 0;
  let updatedAnalysisCount = 0;

  for (const unit of units) {
    const questionFile = unit.paths.cleanedQuestionFile;
    const analysisFile = unit.paths.cleanedAnalysisFile;

    if (!fs.existsSync(questionFile) || !fs.existsSync(analysisFile)) {
      continue;
    }

    const questionText = fs.readFileSync(questionFile, 'utf8');
    const analysisText = fs.readFileSync(analysisFile, 'utf8');

    const questionResult = extractSection(questionText, 'question');
    const analysisResult = extractSection(analysisText, 'analysis');

    if (!questionResult.found && !analysisResult.found) {
      continue;
    }

    drillCount += 1;

    const drillPath = path.join(unit.paths.dir, `${unit.unitCode}_drill.md`);
    const drillContent = buildDrillMarkdown(
      unit.unitCode,
      unit.chapterTitle,
      questionResult.sectionBody,
      analysisResult.sectionBody,
    );

    const drillChanged = writeIfChanged(drillPath, drillContent, args.dryRun);
    const questionChanged = questionResult.found
      ? writeIfChanged(questionFile, questionResult.updatedText, args.dryRun)
      : false;
    const analysisChanged = analysisResult.found
      ? writeIfChanged(analysisFile, analysisResult.updatedText, args.dryRun)
      : false;

    if (questionChanged) updatedQuestionCount += 1;
    if (analysisChanged) updatedAnalysisCount += 1;

    console.log(
      `[${unit.unitCode}] drill=${drillChanged} questionUpdated=${questionChanged} analysisUpdated=${analysisChanged} dryRun=${args.dryRun}`,
    );
  }

  console.log(`Units with drill extracted: ${drillCount}`);
  console.log(`Question files updated: ${updatedQuestionCount}`);
  console.log(`Analysis files updated: ${updatedAnalysisCount}`);
}

main();
