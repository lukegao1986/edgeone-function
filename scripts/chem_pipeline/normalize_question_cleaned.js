const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../docs/0 数据准备/Chem');
const TARGET_UNITS = ['che8', 'che9', 'che10', 'che11', 'che12', 'che13', 'che14', 'che15', 'che16', 'che17'];

function removeTailRefs(text) {
  return text
    .replace(/\s*→\s*例題[^\n]*$/u, '')
    .replace(/\s*→\s*特集[^\n]*$/u, '')
    .replace(/\s+$/u, '');
}

function normalizeExamplePrefix(text) {
  return text
    .replace(/^基本例题/u, '基本例題')
    .replace(/^応用例题/u, '応用例題');
}

function normalizeCategoryName(text) {
  const value = normalizeExamplePrefix(text.trim());
  if (value === '基礎 CHECK' || value === '基本例題' || value === '基本問題' || value === '応用例題' || value === '応用問題') {
    return value;
  }
  return '';
}

function isSectionDelimiter(text) {
  return /^(基本例[題题]|応用例[題题])\s*\d+/u.test(text)
    || /^(基礎 CHECK|基本問題|応用問題)$/u.test(normalizeExamplePrefix(text))
    || /^(リード [CD]|発展)$/u.test(text);
}

function splitAtSecondSpace(text) {
  let seen = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === ' ') {
      seen += 1;
      if (seen === 2) {
        return [text.slice(0, i), text.slice(i + 1).trim()];
      }
    }
  }
  return [text, ''];
}

function tokenList(text) {
  return text.trim().split(/\s+/u).filter(Boolean);
}

function shouldSplitAtSecondSpace(text) {
  if (/^(基本例題|応用例題)\s*\d+/u.test(text)) {
    return false;
  }

  if (!/^(?:記述\s*)?[0-9０-９]+\s+/u.test(text)) {
    return false;
  }

  const tokens = tokenList(text);
  if (tokens.length < 3) {
    return false;
  }

  const secondToken = tokens[1];
  const bodyStart = tokens[2];

  if (secondToken.length > 16) {
    return false;
  }

  if (secondToken.includes('$') || secondToken.includes('（') || secondToken.includes('(')) {
    return false;
  }

  if (/^[0-9０-９+\-]/u.test(secondToken) || /^[0-9０-９+\-]/u.test(bodyStart)) {
    return false;
  }

  if (/[,.，。、:]$/u.test(secondToken)) {
    return false;
  }

  if (/^(の|に|を|は|が|で|と|へ|より|から|や)/u.test(bodyStart)) {
    return false;
  }

  return true;
}

function isSuspiciousSplitHeading(text) {
  const value = text.trim();
  if (!value || /^(基本例題|応用例題)\s*\d+/u.test(value)) {
    return false;
  }

  const tokens = tokenList(value);
  if (tokens.length < 2) {
    return false;
  }

  const lastToken = tokens[tokens.length - 1];
  if (/^[0-9０-９]+$/u.test(lastToken)) {
    return true;
  }

  if ((value.match(/\$/gu) || []).length % 2 === 1) {
    return true;
  }

  if (/[,.，。、:]$/u.test(value)) {
    return true;
  }

  return false;
}

function mergeSuspiciousHeadingBodies(lines) {
  const merged = [];

  for (let i = 0; i < lines.length; i += 1) {
    const current = lines[i];
    const next = lines[i + 1];
    const nextNext = lines[i + 2];
    const trimmed = current.trim();

    if (
      /^##\s+/u.test(trimmed)
      && next === ''
      && nextNext
      && nextNext.trim()
      && !/^(#|##)\s/u.test(nextNext.trim())
      && isSuspiciousSplitHeading(trimmed.replace(/^##\s*/u, ''))
    ) {
      merged.push(`${trimmed.replace(/^##\s*/u, '')} ${nextNext.trim()}`);
      i += 2;
      continue;
    }

    merged.push(current);
  }

  return merged;
}

function buildQuestionBlock(content, currentCategory) {
  let text = normalizeExamplePrefix(removeTailRefs(content)).trim();
  if (!text) {
    return [];
  }

  text = text.replace(/^発展\s+/u, '');

  if (currentCategory === '基礎 CHECK') {
    const inlineSubMatch = text.match(/^([0-9０-９]+)\s*([（(].*)$/u);
    if (inlineSubMatch) {
      return [`## ${inlineSubMatch[1]}`, '', inlineSubMatch[2].trim()];
    }
    const spacedSubMatch = text.match(/^([0-9０-９]+)\s+([（(].*)$/u);
    if (spacedSubMatch) {
      return [`## ${spacedSubMatch[1]}`, '', spacedSubMatch[2].trim()];
    }
  }

  const separatorMatch = text.match(/^(.*?)(?:\s*[知考])(?:\s+(.*))?$/u);
  if (separatorMatch) {
    const heading = separatorMatch[1].trim();
    const body = (separatorMatch[2] || '').trim();
    if (heading) {
      return body ? [`## ${heading}`, '', body] : [`## ${heading}`];
    }
  }

  const hasNumberPrefix = /^[0-9０-９]+(?:\s|[（(])/u.test(text);
  if (hasNumberPrefix) {
    const [heading, body] = shouldSplitAtSecondSpace(text) ? splitAtSecondSpace(text) : [text, ''];
    if (heading) {
      return body ? [`## ${heading}`, '', body] : [`## ${heading}`];
    }
  }

  return [`## ${text}`];
}

function normalizeLines(input) {
  const lines = mergeSuspiciousHeadingBodies(input.replace(/\r\n/g, '\n').split('\n'));
  const output = [];
  let currentCategory = '';
  let inAnswerBlock = false;
  let lastBasicCheckQuestionNumber = 0;

  for (const originalLine of lines) {
    const trimmedRight = originalLine.replace(/[ \t]+$/u, '');
    const stripped = trimmedRight.trim();

    if (!stripped) {
      output.push('');
      continue;
    }

    let withoutHashes = stripped.replace(/^#+\s*/u, '');
    const normalizedCategory = normalizeCategoryName(withoutHashes);

    if (stripped === '#' || stripped === '##') {
      continue;
    }

    if (withoutHashes === 'リード C' || withoutHashes === 'リード D') {
      continue;
    }

    if (withoutHashes === '発展') {
      continue;
    }

    if (normalizedCategory) {
      output.push(`# ${normalizedCategory}`);
      currentCategory = normalizedCategory;
      inAnswerBlock = false;
      lastBasicCheckQuestionNumber = 0;
      continue;
    }

    if (withoutHashes === '解答') {
      output.push('## 解答');
      inAnswerBlock = true;
      lastBasicCheckQuestionNumber = 0;
      continue;
    }

    if (/^(基本例[題题]|応用例[題题])\s*\d+/u.test(withoutHashes)) {
      output.push(`## ${normalizeExamplePrefix(removeTailRefs(withoutHashes))}`);
      inAnswerBlock = false;
      lastBasicCheckQuestionNumber = 0;
      continue;
    }

    if (
      currentCategory === '基礎 CHECK'
      && lastBasicCheckQuestionNumber > 0
      && /^[0-9０-９]{2,}/u.test(withoutHashes)
    ) {
      const expectedPrefix = String(lastBasicCheckQuestionNumber + 1);
      if (withoutHashes.startsWith(expectedPrefix)) {
        withoutHashes = `${expectedPrefix} ${withoutHashes.slice(expectedPrefix.length).trimStart()}`;
      }
    }

    const numberMatch = withoutHashes.match(/^(?:記述\s*)?([0-9０-９]+)/u);
    if (currentCategory === '基礎 CHECK' && numberMatch && !inAnswerBlock) {
      const numericValue = Number(numberMatch[1].replace(/[０-９]/gu, (char) => String.fromCharCode(char.charCodeAt(0) - 65248)));
      if (Number.isFinite(numericValue) && lastBasicCheckQuestionNumber > 0 && numericValue <= lastBasicCheckQuestionNumber) {
        output.push('## 解答');
        inAnswerBlock = true;
      } else if (Number.isFinite(numericValue)) {
        lastBasicCheckQuestionNumber = numericValue;
      }
    }

    if ((/^(?:記述\s*)?[0-9０-９]+/u.test(withoutHashes) || /^発展\s+[0-9０-９]+/u.test(withoutHashes)) && !inAnswerBlock) {
      const block = buildQuestionBlock(withoutHashes, currentCategory);
      output.push(...block);
      continue;
    }

    if (inAnswerBlock && /^##\s+/u.test(stripped)) {
      output.push(removeTailRefs(withoutHashes));
      continue;
    }

    output.push(removeTailRefs(trimmedRight));

    if (isSectionDelimiter(withoutHashes)) {
      inAnswerBlock = false;
    }
  }

  return output;
}

function insertMissingCategories(lines) {
  const finalLines = [];
  let lastCategory = '';
  let seenContent = false;

  function ensureCategory(name) {
    if (lastCategory === name) {
      return;
    }
    if (finalLines.length > 0 && finalLines[finalLines.length - 1] !== '') {
      finalLines.push('');
    }
    finalLines.push(`# ${name}`);
    finalLines.push('');
    lastCategory = name;
  }

  for (const line of lines) {
    const stripped = line.trim();
    if (!stripped) {
      if (finalLines.length > 0 && finalLines[finalLines.length - 1] !== '') {
        finalLines.push('');
      }
      continue;
    }

    if (!seenContent) {
      seenContent = true;
      if (!/^#\s/u.test(stripped)) {
        ensureCategory('基礎 CHECK');
      }
    }

    if (/^#\s/u.test(stripped)) {
      const category = normalizeCategoryName(stripped.replace(/^#\s*/u, ''));
      if (category) {
        if (finalLines.length > 0 && finalLines[finalLines.length - 1] !== '') {
          finalLines.push('');
        }
        finalLines.push(`# ${category}`);
        finalLines.push('');
        lastCategory = category;
        continue;
      }
    }

    if (/^##\s*基本例題\s*\d+/u.test(stripped)) {
      ensureCategory('基本例題');
    } else if (/^##\s*応用例題\s*\d+/u.test(stripped)) {
      ensureCategory('応用例題');
    }

    finalLines.push(line);
  }

  while (finalLines.length > 0 && finalLines[finalLines.length - 1] === '') {
    finalLines.pop();
  }

  const collapsed = [];
  for (const line of finalLines) {
    if (line === '' && collapsed[collapsed.length - 1] === '' && collapsed[collapsed.length - 2] === '') {
      continue;
    }
    collapsed.push(line);
  }

  return `${collapsed.join('\n')}\n`;
}

for (const unit of TARGET_UNITS) {
  const filePath = path.join(ROOT, unit, `${unit}题目_cleaned.md`);
  const source = fs.readFileSync(filePath, 'utf8');
  const normalized = insertMissingCategories(normalizeLines(source));
  fs.writeFileSync(filePath, normalized, 'utf8');
  console.log(`normalized ${unit}`);
}
