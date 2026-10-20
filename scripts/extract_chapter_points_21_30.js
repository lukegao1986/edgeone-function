const fs = require('fs');
const path = require('path');

const ROOT = '/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/Chapter 21-30';
const SEP_PRIMARY = '基礎 CHECK';
const SEP_FALLBACK = '## 基本例題';

function findCut(content) {
  const p1 = content.indexOf(SEP_PRIMARY);
  if (p1 !== -1) return { idx: p1, sep: SEP_PRIMARY };
  const p2 = content.indexOf(SEP_FALLBACK);
  if (p2 !== -1) return { idx: p2, sep: SEP_FALLBACK };
  return { idx: -1, sep: null };
}

const summary = {
  scannedDirs: 0,
  matchedFiles: 0,
  success: 0,
  failed: [],
  successList: [],
};

const dirs = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && /^chapter([2][1-9]|[3][0])$/.test(d.name))
  .sort((a, b) => parseInt(a.name.slice(7), 10) - parseInt(b.name.slice(7), 10));
summary.scannedDirs = dirs.length;

for (const dir of dirs) {
  const dirPath = path.join(ROOT, dir.name);
  let files;
  try {
    files = fs.readdirSync(dirPath, { withFileTypes: true }).filter(f => f.isFile());
  } catch (e) {
    summary.failed.push({ dir: dir.name, err: 'readdir failed: ' + ((e && e.message) || e) });
    continue;
  }
  const candidates = files.filter(f => /题目\.md$/.test(f.name));
  for (const cand of candidates) {
    summary.matchedFiles++;
    const inPath = path.join(dirPath, cand.name);
    let content;
    try {
      content = fs.readFileSync(inPath, 'utf8');
    } catch (e) {
      summary.failed.push({ file: inPath, err: 'read failed: ' + ((e && e.message) || e) });
      continue;
    }
    const cut = findCut(content);
    if (cut.idx === -1) {
      summary.failed.push({ file: inPath, err: `未找到 "${SEP_PRIMARY}" 或 fallback "${SEP_FALLBACK}"` });
      continue;
    }
    const extracted = content.slice(0, cut.idx);
    const outName = cand.name.replace(/题目\.md$/, '知识点.md');
    if (outName === cand.name) {
      summary.failed.push({ file: inPath, err: '文件名替换未生效: ' + cand.name });
      continue;
    }
    const outPath = path.join(dirPath, outName);
    try {
      fs.writeFileSync(outPath, extracted, 'utf8');
    } catch (e) {
      summary.failed.push({ file: inPath, out: outPath, err: 'write failed: ' + ((e && e.message) || e) });
      continue;
    }
    summary.success++;
    summary.successList.push({
      dir: dir.name,
      from: cand.name,
      to: outName,
      inChars: content.length,
      outChars: extracted.length,
      sepUsed: cut.sep,
      sepAt: cut.idx,
    });
  }
}

console.log(JSON.stringify({
  scannedDirs: summary.scannedDirs,
  matchedFiles: summary.matchedFiles,
  success: summary.success,
  failedCount: summary.failed.length,
  failed: summary.failed,
  successList: summary.successList,
}, null, 2));

process.exitCode = summary.failed.length ? 1 : 0;
