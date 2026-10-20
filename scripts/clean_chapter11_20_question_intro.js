const fs = require('fs');
const path = require('path');

const DEFAULT_ROOT = path.join(
  __dirname,
  '..',
  'docs',
  '0 数据准备',
  'charpter 11-20'
);

const QUESTION_FILE_RE = /^MinerU_markdown_リードα_物理_chapter\d+\.md$/;
const CHAPTER_TITLE_RE = /^## 第\d+章[^\n]*$/m;
const EXERCISE_HEADER_RE = /^## (基礎 CHECK|基本例題|基本問題).*$/m;

function shouldProcessFile(filePath) {
  return QUESTION_FILE_RE.test(path.basename(filePath));
}

function preserveTrailingNewline(source, output) {
  if (source.endsWith('\n') && !output.endsWith('\n')) {
    return `${output}\n`;
  }
  if (!source.endsWith('\n') && output.endsWith('\n')) {
    return output.slice(0, -1);
  }
  return output;
}

function cleanQuestionMarkdown(content) {
  const titleMatch = content.match(CHAPTER_TITLE_RE);
  if (!titleMatch || titleMatch.index == null) {
    throw new Error('未找到章节标题');
  }

  const titleEnd = titleMatch.index + titleMatch[0].length;
  const rest = content.slice(titleEnd);
  const headerMatch = rest.match(EXERCISE_HEADER_RE);
  if (!headerMatch || headerMatch.index == null) {
    throw new Error('未找到题目起始标题');
  }

  const exerciseStart = titleEnd + headerMatch.index;
  const between = content.slice(titleEnd, exerciseStart);
  if (!/[^\s]/.test(between)) {
    return content;
  }

  const cleaned = `${content.slice(0, titleEnd)}\n\n${content
    .slice(exerciseStart)
    .replace(/^\s+/, '')}`;

  return preserveTrailingNewline(content, cleaned);
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const cleaned = cleanQuestionMarkdown(original);
  const changed = cleaned !== original;

  if (changed) {
    fs.writeFileSync(filePath, cleaned, 'utf8');
  }

  return { filePath, changed };
}

function walk(dirPath, files = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }
    if (entry.isFile() && shouldProcessFile(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

function run(rootDir = DEFAULT_ROOT) {
  const files = walk(rootDir);
  const result = {
    rootDir,
    total: files.length,
    changed: [],
    unchanged: [],
    errors: []
  };

  for (const filePath of files) {
    try {
      const item = processFile(filePath);
      if (item.changed) {
        result.changed.push(filePath);
      } else {
        result.unchanged.push(filePath);
      }
    } catch (error) {
      result.errors.push({
        filePath,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return result;
}

function printResult(result) {
  console.log(`扫描目录: ${result.rootDir}`);
  console.log(`匹配题目文件: ${result.total}`);
  console.log(`已清洗: ${result.changed.length}`);
  console.log(`无需修改: ${result.unchanged.length}`);
  console.log(`异常: ${result.errors.length}`);

  if (result.changed.length > 0) {
    console.log('\n已清洗文件:');
    for (const filePath of result.changed) {
      console.log(`- ${filePath}`);
    }
  }

  if (result.errors.length > 0) {
    console.log('\n异常文件:');
    for (const item of result.errors) {
      console.log(`- ${item.filePath}: ${item.message}`);
    }
  }
}

if (require.main === module) {
  try {
    const rootDir = process.argv[2]
      ? path.resolve(process.argv[2])
      : DEFAULT_ROOT;
    const result = run(rootDir);
    printResult(result);
    process.exitCode = result.errors.length > 0 ? 1 : 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

module.exports = {
  DEFAULT_ROOT,
  shouldProcessFile,
  cleanQuestionMarkdown,
  processFile,
  run
};
