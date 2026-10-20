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

function normalizeLineBasics(line) {
  let value = line;

  value = value.replace(/\u00A0/g, ' ');
  value = value.replace(/[\u200B-\u200D\uFEFF]/g, '');
  value = value.replace(/[ \t\u3000]+$/g, '');

  if (/^(#{1,6})([^#\s])/.test(value)) {
    value = value.replace(/^(#{1,6})([^#\s])/, '$1 $2');
  }

  value = value.replace(/^(#{1,6})[ \t\u3000]+/, '$1 ');
  value = value.replace(/^(#{1,6})\s{2,}/, '$1 ');

  if (/^#+\s*第/.test(value)) {
    value = value.replace(/^(#{1,6})\s*第/, '$1 第');
  }

  if (/^#+\s*特集/.test(value)) {
    value = value.replace(/^(#{1,6})\s*特集/, '$1 特集');
  }

  if (/^#+\s*基礎/.test(value)) {
    value = value.replace(/^(#{1,6})\s*基礎/, '$1 基礎');
  }

  if (/^#+\s*基本/.test(value)) {
    value = value.replace(/^(#{1,6})\s*基本/, '$1 基本');
  }

  if (/^#+\s*応用/.test(value)) {
    value = value.replace(/^(#{1,6})\s*応用/, '$1 応用');
  }

  return value;
}

function removeObviousNoise(line) {
  if (/^→\s*[\d,\s]+\s*解[説說]動画\s*$/.test(line)) return '';
  if (/^→\s*[\d,\s]+\s*$/.test(line)) return '';
  return line;
}

function normalizeInlineMath(text) {
  let value = text;

  value = value.replace(/\$[ \t]+([^$\n]+?)[ \t]+\$/g, (_m, inner) => `$${inner.trim()}$`);
  value = value.replace(/\$\$[ \t]+([\s\S]*?)[ \t]+\$\$/g, (_m, inner) => `$$${inner}$$`);

  return value;
}

function isBlank(line) {
  return line.trim() === '';
}

function isHeading(line) {
  return /^#{1,6}\s+/.test(line);
}

function isImageLine(line) {
  return /^!\[[^\]]*]\([^)]+\)\s*$/.test(line.trim());
}

function isTableLine(line) {
  const trimmed = line.trim();
  return /^<table[\s>]/.test(trimmed) || /^<\/table>/.test(trimmed);
}

function isDivLine(line) {
  const trimmed = line.trim();
  return /^<div[\s>]/.test(trimmed) || /^<\/div>/.test(trimmed);
}

function isBlockish(line) {
  return isHeading(line) || isImageLine(line) || isTableLine(line) || isDivLine(line);
}

function formatBlocks(lines) {
  const output = [];

  for (let i = 0; i < lines.length; i += 1) {
    const current = lines[i];
    const next = i + 1 < lines.length ? lines[i + 1] : '';

    if (isBlockish(current) && output.length > 0 && !isBlank(output[output.length - 1])) {
      output.push('');
    }

    output.push(current);

    if (isBlockish(current) && next && !isBlank(next)) {
      output.push('');
    }
  }

  return output;
}

function collapseBlankLines(text) {
  return text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trimEnd() + '\n';
}

function cleanMarkdown(rawText) {
  let text = rawText.replace(/\r\n?/g, '\n').replace(/^\uFEFF/, '');
  const lines = text.split('\n').map((line) => removeObviousNoise(normalizeLineBasics(line)));
  const formatted = formatBlocks(lines);
  text = formatted.join('\n');
  text = normalizeInlineMath(text);
  text = collapseBlankLines(text);
  return text;
}

function writeCleanedFile(inputPath, outputPath, dryRun) {
  if (!inputPath || !fs.existsSync(inputPath)) {
    return { written: false, skipped: true };
  }

  const original = fs.readFileSync(inputPath, 'utf8');
  const cleaned = cleanMarkdown(original);

  if (!dryRun) {
    fs.writeFileSync(outputPath, cleaned, 'utf8');
  }

  return {
    written: !dryRun,
    skipped: false,
    changed: original !== cleaned,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const index = loadUnitIndex();

  const selectedUnits = args.units
    ? index.units.filter((unit) => args.units.includes(unit.unitCode))
    : index.units;

  if (selectedUnits.length === 0) {
    throw new Error('No units matched the provided --units filter.');
  }

  let processedCount = 0;

  for (const unit of selectedUnits) {
    const questionResult = writeCleanedFile(
      unit.paths.questionFile,
      unit.paths.cleanedQuestionFile,
      args.dryRun,
    );

    const analysisResult = writeCleanedFile(
      unit.paths.analysisFile,
      unit.paths.cleanedAnalysisFile,
      args.dryRun,
    );

    processedCount += 1;
    console.log(
      `[${unit.unitCode}] question changed=${Boolean(questionResult.changed)} analysis changed=${Boolean(analysisResult.changed)} dryRun=${args.dryRun}`,
    );
  }

  console.log(`Processed units: ${processedCount}`);
}

main();
