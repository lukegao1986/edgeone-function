const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '../..');
const reviewBase = path.join(root, 'docs/4 题库全量输入/Step5_旧编号与当前题目逐条确认清单_2026-10-12');
const output = path.join(root, 'docs/0 数据准备/Chem/_meta/chem_numbering_decisions_2026-10-12_v2.json');
const sha = (text) => crypto.createHash('sha256').update(text).digest('hex');

function main() {
  if (fs.existsSync(output)) throw new Error('决策快照已存在，拒绝覆盖。');
  const reviewText = fs.readFileSync(`${reviewBase}.md`, 'utf8');
  const evidenceText = fs.readFileSync(`${reviewBase}.json`, 'utf8');
  const evidence = JSON.parse(evidenceText);
  const opinions = new Map();
  for (const section of reviewText.split(/^### /m).slice(1)) {
    const heading = section.match(/^([HM]\d{3}) · ([^\r\n]+)/);
    if (!heading) continue;
    const opinion = section.match(/^\*\*确认意见：(.+?)\*\*\s*$/m);
    if (!opinion || opinion[1].includes('待填写') || opinions.has(heading[1])) {
      throw new Error(`确认意见缺失或重复：${heading[1]}`);
    }
    opinions.set(heading[1], { code: heading[2], text: opinion[1] });
  }
  if (opinions.size !== 80 || evidence.rows.length !== 80) throw new Error('确认范围不是80条。');
  const retired = new Set(['H002', 'H003', 'H004', 'H005', 'M051', 'M053', 'M054', 'M055', 'M056']);
  const migrated = new Set(['M018', 'M019', 'M020', 'M021']);
  const exceptions = new Set(['M049', 'M050', 'M052', 'M057', 'M058', 'M059', 'M060']);
  const rules = evidence.rows.map((row) => {
    const opinion = opinions.get(row.id);
    if (!opinion || opinion.code !== row.old.businessCode) throw new Error(`编号与意见不一致：${row.id}`);
    const action = retired.has(row.id) ? 'retire' : migrated.has(row.id) ? 'migrate' : 'retain';
    const expected = row.id === 'H001' ? /旧 C1 仅由当前 CHECK 1 继承/ :
      migrated.has(row.id) ? /^批准旧号退役并建立新号迁移关系/ :
      retired.has(row.id) || exceptions.has(row.id) ? /^(?:依照你的建议执行|接受你的建议)/ :
      /^旧题干和当前题目候选应该是同一题/;
    if (!expected.test(opinion.text)) throw new Error(`意见超出本次已解释的决策：${row.id}`);
    if (row.candidates.length !== 1) throw new Error(`目标不唯一：${row.id}`);
    return {
      reviewId: row.id, oldCode: row.old.businessCode, unitCode: row.old.unitCode,
      action, targetMatchKey: row.id.startsWith('H') && row.id !== 'H001' ? null : row.candidates[0].matchKey,
      allowHistoricalPrefix: exceptions.has(row.id), userOpinion: opinion.text,
      supplementalConfirmation: exceptions.has(row.id) ?
        '用户在本轮补充确认：保留旧编号（推荐）；实际分类C、难度1，其余答案分片号退役。' : null,
      oldSource: row.old.source,
    };
  });
  const oldFile = path.join(root, 'docs/0 数据准备/Chem/_meta/chem_question_blocks.json');
  const oldText = fs.readFileSync(oldFile, 'utf8');
  const old = JSON.parse(oldText);
  for (const [reviewId, oldCode, number] of [
    ['S001', 'chem-che17-qB13', '416'], ['S002', 'chem-che17-qB14', '418'],
  ]) {
    const index = old.blocks.findIndex((b) => b.businessCode === oldCode);
    if (index < 0 || old.blocks[index].sourceNumber !== number) throw new Error(`补充决策来源变化：${oldCode}`);
    rules.push({
      reviewId, oldCode, unitCode: 'che17', action: 'migrate',
      targetMatchKey: JSON.stringify(['che17', '応用問題', number]),
      allowHistoricalPrefix: false,
      userOpinion: '用户在本轮补充确认：旧号退役并迁移（推荐）。',
      supplementalConfirmation: '旧合并块只由首题416/418建立迁移关系；417/419独立编号，题解仅采用最新最终文件。',
      oldSource: { file: oldFile, fileSha256: sha(oldText), jsonPointer: `/blocks/${index}` },
    });
  }
  // The extractor is intentionally upgraded after the historical evidence was recorded.
  const sourceVersions = evidence.sourceVersions.filter((s) =>
    !s.file.endsWith('/scripts/chem_pipeline/5_extract_question_blocks.js'));
  sourceVersions.push({ file: `${reviewBase}.md`, sha256: sha(reviewText) },
    { file: `${reviewBase}.json`, sha256: sha(evidenceText) });
  for (const source of sourceVersions) {
    if (sha(fs.readFileSync(source.file)) !== source.sha256) throw new Error(`审阅依据已变化：${source.file}`);
  }
  const payload = {
    schemaVersion: 1, kind: 'approved-numbering-decisions', scope: evidence.selectedUnits,
    approvalBasis: '用户已填写80条意见并明确要求执行；che16前缀及che17两条新增迁移已在本轮补充确认。',
    generatedAt: new Date().toISOString(), sourceVersions, rules, databaseChecked: false,
  };
  fs.writeFileSync(output, `${JSON.stringify(payload, null, 2)}\n`, { flag: 'wx' });
  console.log(JSON.stringify({
    output, rules: rules.length, retain: rules.filter((r) => r.action === 'retain').length,
    retire: retired.size, migrate: rules.filter((r) => r.action === 'migrate').length,
    historicalPrefixExceptions: exceptions.size,
  }, null, 2));
}

try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
