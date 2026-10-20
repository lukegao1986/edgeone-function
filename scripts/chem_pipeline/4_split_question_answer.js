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

function normalizeOutput(text) {
  return text.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function isAnswerStart(trimmed) {
  return (
    /^##\s*解答(?:\s|$|[:：(（])/.test(trimmed) ||
    /^解答(?:\s|$|[:：(（])/.test(trimmed) ||
    /^##\s*指針(?:\s|$|[:：(（<])/.test(trimmed) ||
    /^指針(?:\s|$|[:：(（<])/.test(trimmed) ||
    /^##\s*別解(?:\s|$|[:：(（])/.test(trimmed) ||
    /^別解(?:\s|$|[:：(（])/.test(trimmed) ||
    /^##\s*ここがポイント(?:\s|$|[:：(（])/.test(trimmed) ||
    /^ここがポイント(?:\s|$|[:：(（])/.test(trimmed) ||
    /^##\s*POINT(?:\s|$|[:：(（])/.test(trimmed) ||
    /^POINT(?:\s|$|[:：(（])/.test(trimmed) ||
    /^<div class="mineru-algorithm"/.test(trimmed)
  );
}

function isResumeHeading(trimmed) {
  return (
    /^##\s+/.test(trimmed) &&
    !isAnswerStart(trimmed)
  );
}

function splitQuestionText(text) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const output = [];
  let skipping = false;
  let skippingDiv = false;
  let currentHeading = '';
  let foundationCheckSawFirstTopLevelOne = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (/^##\s+/.test(trimmed)) {
      currentHeading = trimmed;
      foundationCheckSawFirstTopLevelOne = false;
    }

    if (skipping) {
      if (skippingDiv) {
        if (/<\/div>/.test(trimmed)) {
          skippingDiv = false;
        }
        continue;
      }

      if (isResumeHeading(trimmed)) {
        skipping = false;
      } else {
        continue;
      }
    }

    if (/^##\s*基礎 CHECK(?:\s|$)/.test(currentHeading) && /^1\s+/.test(trimmed)) {
      if (foundationCheckSawFirstTopLevelOne) {
        skipping = true;
        continue;
      }
      foundationCheckSawFirstTopLevelOne = true;
    }

    if (isAnswerStart(trimmed)) {
      skipping = true;
      skippingDiv = /^<div class="mineru-algorithm"/.test(trimmed);
      continue;
    }

    output.push(line);
  }

  return normalizeOutput(output.join('\n'));
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

  let processed = 0;
  let questionUpdated = 0;
  let analysisUpdated = 0;

  for (const unit of units) {
    const questionPath = unit.paths.cleanedQuestionFile;
    const analysisPath = unit.paths.cleanedAnalysisFile;
    const finalQuestionPath = unit.paths.finalQuestionFile;
    const finalAnalysisPath = unit.paths.finalAnalysisFile;

    if (!fs.existsSync(questionPath) || !fs.existsSync(analysisPath)) {
      continue;
    }

    const questionText = fs.readFileSync(questionPath, 'utf8');
    const analysisText = fs.readFileSync(analysisPath, 'utf8');

    const finalQuestion = splitQuestionText(questionText);
    const finalAnalysis = normalizeOutput(analysisText);

    const qChanged = writeIfChanged(finalQuestionPath, finalQuestion, args.dryRun);
    const aChanged = writeIfChanged(finalAnalysisPath, finalAnalysis, args.dryRun);

    if (qChanged) questionUpdated += 1;
    if (aChanged) analysisUpdated += 1;

    processed += 1;
    console.log(
      `[${unit.unitCode}] questionOut=${qChanged} analysisOut=${aChanged} dryRun=${args.dryRun}`,
    );
  }

  console.log(`Processed units: ${processed}`);
  console.log(`Final question files updated: ${questionUpdated}`);
  console.log(`Final analysis files updated: ${analysisUpdated}`);
}

main();
