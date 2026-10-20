const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  shouldProcessFile,
  cleanQuestionMarkdown,
  processFile
} = require('./clean_chapter11_20_question_intro');

function testRemoveIntroBeforeBasicCheck() {
  const input = [
    '## 第11章 熱とエネルギー',
    '',
    '### ここがポイント',
    '前置き説明',
    '',
    '## 基礎 CHECK',
    '',
    '1 問題'
  ].join('\n');

  const output = cleanQuestionMarkdown(input);

  assert.strictEqual(
    output,
    ['## 第11章 熱とエネルギー', '', '## 基礎 CHECK', '', '1 問題'].join('\n')
  );
}

function testKeepAlreadyCleanFileUntouched() {
  const input = ['## 第12章 気体の法則', '', '## 基礎 CHECK', '', '1 問題', ''].join(
    '\n'
  );

  const output = cleanQuestionMarkdown(input);
  assert.strictEqual(output, input);
}

function testHandleBasicExampleAsFirstMarker() {
  const input = [
    '## 第15章 正弦波の式',
    '',
    '前置きの知識整理',
    '',
    '## 基本例題 53 正弦波の式',
    '',
    '問題本文'
  ].join('\n');

  const output = cleanQuestionMarkdown(input);

  assert.strictEqual(
    output,
    ['## 第15章 正弦波の式', '', '## 基本例題 53 正弦波の式', '', '問題本文'].join('\n')
  );
}

function testProcessFilePreservesUtf8Content() {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'clean-chapter11-20-question-intro-')
  );
  const filePath = path.join(tempDir, 'MinerU_markdown_リードα_物理_chapter99.md');
  const input = [
    '## 第99章 テスト',
    '',
    '不要な整理',
    '日本語と中文を含む',
    '',
    '## 基本問題',
    '',
    '1 波長は何mか。'
  ].join('\n');

  fs.writeFileSync(filePath, input, 'utf8');
  const result = processFile(filePath);
  const output = fs.readFileSync(filePath, 'utf8');

  assert.strictEqual(result.changed, true);
  assert.strictEqual(output.includes('日本語と中文を含む'), false);
  assert.strictEqual(output.includes('1 波長は何mか。'), true);
}

function testFilenameFilter() {
  assert.strictEqual(
    shouldProcessFile('/tmp/MinerU_markdown_リードα_物理_chapter11.md'),
    true
  );
  assert.strictEqual(
    shouldProcessFile('/tmp/MinerU_markdown_リードα_物理_chapter11_解析.md'),
    false
  );
}

function main() {
  testRemoveIntroBeforeBasicCheck();
  testKeepAlreadyCleanFileUntouched();
  testHandleBasicExampleAsFirstMarker();
  testProcessFilePreservesUtf8Content();
  testFilenameFilter();
  console.log('测试通过: clean_chapter11_20_question_intro');
}

main();
