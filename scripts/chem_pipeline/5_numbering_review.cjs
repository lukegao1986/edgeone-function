const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { extractUnit } = require('./5_extract_question_blocks');

const root = path.resolve(__dirname, '../..');
const chem = path.join(root, 'docs/0 数据准备/Chem');
const outputDir = path.join(root, 'docs/4 题库全量输入');
const name = 'Step5_旧编号与当前题目逐条确认清单_2026-10-12';
const outputs = ['md', 'json'].map((ext) => path.join(outputDir, `${name}.${ext}`));
const units = [
  ...Array.from({ length: 6 }, (_, i) => `cheb${i + 1}`),
  ...Array.from({ length: 17 }, (_, i) => `che${i + 1}`),
];
const sha = (text) => crypto.createHash('sha256').update(text).digest('hex');
const sourceVersions = new Map();
function read(file) {
  const text = fs.readFileSync(file, 'utf8');
  sourceVersions.set(file, sha(text));
  return text;
}
const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/\s+/g, ' ');
const code = (s) => `\`${String(s).replace(/`/g, "'").replace(/\s+/g, ' ')}\``;
const link = (source, label) =>
  `[${label}](file://${encodeURI(source.file)}#L${source.startLine}-L${source.endLine})`;

function main() {
  for (const file of outputs) {
    if (fs.existsSync(file)) throw new Error(`拒绝覆盖已有审阅意见或证据文件：${file}`);
  }
  const indexFile = path.join(chem, '_meta/chem_units.json');
  const legacyFile = path.join(chem, '_meta/chem_question_blocks.json');
  const pilotFile = path.join(chem, '_meta/chem_question_blocks_che2_pilot.json');
  const index = JSON.parse(read(indexFile));
  const legacyText = read(legacyFile);
  const legacy = JSON.parse(legacyText);
  const pilot = JSON.parse(read(pilotFile));
  read(path.join(__dirname, '5_extract_question_blocks.js'));
  const results = units.map((unitCode) => {
    const matches = index.units.filter((unit) => unit.unitCode === unitCode);
    if (matches.length !== 1) throw new Error(`单元索引缺失或重复：${unitCode}`);
    const unit = matches[0];
    for (const [field, suffix] of [['finalQuestionFile', '题目'], ['finalAnalysisFile', '解析']]) {
      const expected = path.join(chem, unitCode, `${unitCode}_${suffix}.md`);
      if (unit.paths[field] !== expected || fs.realpathSync(expected) !== expected) {
        throw new Error(`最终文件路径不符合范围：${unitCode}.${field}`);
      }
      read(expected);
    }
    return extractUnit(unit);
  });
  const current = results.flatMap((r) => r.blocks);
  const old = legacy.blocks.map((block, index) => ({ ...block, index }))
    .filter((block) => units.includes(block.unitCode));
  const affected = old.filter((b) => /^(?:リード [CD]|発展)$/.test(b.sectionLabel));
  const related = old.filter((b) => b.unitCode === 'cheb3' && b.blockType === 'C');

  function target(b) {
    return {
      matchKey: b.matchKey, unitCode: b.unitCode, category: b.originalCategory,
      number: b.matchNumber, blockType: b.blockType, heading: b.sourceHeading,
      stemRaw: b.stemRaw, analysisRaw: b.analysisRaw,
      questionSource: b.questionSource, analysisSource: b.analysisSource,
      analysisMatchStatus: b.analysisMatchStatus,
    };
  }
  function checkTargets(unit, numbers) {
    return current.filter((b) => b.unitCode === unit &&
      b.originalCategory === '基礎 CHECK' && numbers.includes(b.matchNumber)).map(target);
  }
  const che16Notes = {
    B1: ['题干', [], '旧 B1 的题干对应当前 CHECK 15；B 前缀与当前 C 类不一致。'],
    B2: ['题干夹入其他题答案', ['15'], '旧 B2 含 CHECK 16 题干及 CHECK 15 答案；与旧 B3 同号，不能将两条都继承到 CHECK 16。'],
    B3: ['答案误作题目', [], '旧 B3 仅为“16 ニンヒドリン反応”，是 CHECK 16 答案，不是另一道题；与旧 B2 指向同一答案位置。'],
    B4: ['不完整题干', [], '旧 B4 只含 CHECK 17 题干及(1)，当前完整题有(1)–(3)；不能把旧分片当作独立完整题。'],
    B5: ['答案误作题目', [], '旧 B5 是 CHECK 17 三项答案；与旧 B4 不应生成两道当前题。'],
    B6: ['答案与题干串块', ['17'], '旧 B6 含 CHECK 18 答案“等電点”和 CHECK 17 的(2)；不能直接继承为 CHECK 18 的完整题干。'],
    B7: ['跨题答案与题干串块', ['17', '20'], '旧 B7 含 CHECK 19 答案、CHECK 17 的(3)及 CHECK 20 答案；不能仅按 sourceNumber=19 整块挂接。'],
    B8: ['答案误作题目', [], '旧 B8 是 CHECK 21 答案；与旧 B12 的题干属于同一当前题。'],
    B9: ['题干', [], '旧 B9 对应 CHECK 18 题干；与旧 B6 的答案分片不能分别占用当前题编号。'],
    B10: ['题干', [], '旧 B10 对应 CHECK 19 题干；与旧 B7 的串块答案不能分别占用当前题编号。'],
    B11: ['题干', [], '旧 B11 对应 CHECK 20 题干；旧 B7 中另含此题答案。'],
    B12: ['题干', [], '旧 B12 对应 CHECK 21 题干；旧 B8 为此题答案分片。'],
  };

  function row(b, id, family) {
    // Same-number lookup is an audit candidate list only, never an assignment.
    const candidates = current.filter((q) => q.unitCode === b.unitCode &&
      q.matchNumber === String(b.sourceNumber)).map(target);
    const line = legacyText.slice(0, legacyText.indexOf(`"businessCode": "${b.businessCode}"`))
      .split('\n').length;
    const suffix = b.businessCode.split('-q')[1];
    const peers = old.filter((q) => q.unitCode === b.unitCode &&
      String(q.sourceNumber) === String(b.sourceNumber) && q.businessCode !== b.businessCode)
      .map((q) => q.businessCode);
    let reason = `旧分类“${b.sectionLabel}”不属于当前精确分类键；不能全局把该标签替换为某个固定分类。`;
    let proposal = '逐题核对新旧题干身份后，批准此旧编号绑定列出的当前精确键；正文和解析仅采用最新最终文件。未确认前不执行映射。';
    let kind = '历史分类待确认';
    let extraTargets = [];
    if (candidates.length !== 1) {
      reason += ` 当前同单元同题号候选数为 ${candidates.length}，不具备唯一定位条件。`;
      proposal = '请明确目标 unitCode＋分类＋题号；无法确认时保留历史编号并暂停继承。';
    } else if (candidates[0].blockType !== b.blockType) {
      reason += ` 当前为 ${candidates[0].category}/${candidates[0].blockType}，旧编号为 ${b.blockType} 前缀，抽取器现行格式校验将拒绝直接复用。`;
      proposal = '选择：保留旧编号作为明确的历史前缀例外，分类/难度取当前值；或批准旧号退役并建立新号迁移关系。未查数据库，不分配新号。';
      kind = '分类与编号前缀冲突';
    }
    if (family === 'cheb3') {
      if (suffix === 'C1') {
        reason = '旧 C1 将当前 CHECK 1–10 拼为一条；旧 sourceNumber=1 又与 C2 冲突。旧解析为物质组成式答案，与当前 CHECK 1 不符。';
        proposal = '选择：旧 C1 仅由当前 CHECK 1 继承，CHECK 2–10 单独按批准规则编号；或旧合并块整体退役。无论何种选择，禁止带入旧解析。';
        extraTargets = checkTargets('cheb3', Array.from({ length: 9 }, (_, i) => String(i + 2)));
        kind = '一旧块含多题及重号';
      } else {
        reason = `旧 ${suffix} 的题干是“${b.stemRaw.split('\n').find((s) => s.trim())}”，与当前同键 CHECK ${b.sourceNumber} 正文不符；不能仅凭分类和题号继承。`;
        proposal = '建议不绑定当前同号 CHECK，旧编号暂作历史保留/待退役。若此旧题仍需保留，请指定其真实当前来源；本次未确认其在23单元内的正式目标。';
        kind = suffix === 'C2' ? '同键双编号且正文不同' : '连带发现同键正文不同';
      }
    }
    if (b.unitCode === 'che16' && che16Notes[suffix]) {
      const [type, extras, note] = che16Notes[suffix];
      kind = type;
      reason += ` ${note}`;
      extraTargets = checkTargets('che16', extras);
      const primary = { '15': 'B1', '16': 'B2', '17': 'B4', '18': 'B9', '19': 'B10', '20': 'B11', '21': 'B12' }[b.sourceNumber];
      proposal = suffix === primary ?
        `建议将 ${b.businessCode} 作为当前 CHECK ${b.sourceNumber} 的主继承候选，其余答案分片号保留历史并待退役；需同时确认保留 B 前缀例外还是另行批准迁移。` :
        `建议此答案/串块编号不独立继承，保留历史并待退役；当前 CHECK ${b.sourceNumber} 的主继承候选为 chem-che16-q${primary}，等待成组确认。`;
    }
    return {
      id, family, kind,
      old: {
        businessCode: b.businessCode, unitCode: b.unitCode, category: b.sectionLabel,
        number: b.sourceNumber, blockType: b.blockType, heading: b.sourceHeading,
        source: { file: legacyFile, startLine: line, endLine: line,
          fileSha256: sourceVersions.get(legacyFile), jsonPointer: `/blocks/${b.index}`,
          stemSha256: sha(b.stemRaw), analysisSha256: sha(b.analysisRaw || '') },
        stemRaw: b.stemRaw, analysisRaw: b.analysisRaw,
      },
      candidateBasis: '仅同单元＋同原题号枚举，分类未确认；非自动挂接依据',
      candidates, extraTargets, sameNumberOldCodes: peers,
      reason, proposedDecision: proposal, decision: null, status: '待用户确认',
    };
  }
  const rows = [
    ...related.map((b, i) => row(b, `H${String(i + 1).padStart(3, '0')}`, 'cheb3')),
    ...affected.map((b, i) => row(b, `M${String(i + 1).padStart(3, '0')}`, 'legacy-category')),
  ];
  const byCode = new Map(rows.map((r) => [r.old.businessCode, r.id]));
  const documents = results.flatMap((r) => r.documents);
  const sourceDrift = (pilot.documents || []).filter((d) => units.includes(d.unitCode)).map((d) => ({
    unitCode: d.unitCode, side: d.side, file: d.file, pilotSha256: d.sha256,
    currentSha256: sourceVersions.get(d.file), stale: d.sha256 !== sourceVersions.get(d.file),
  }));
  const structuralIssues = results.filter((r) => !r.stats.passed).map((r) => ({
    unitCode: r.stats.unitCode, issues: r.stats.issues, unassigned: r.stats.unassigned,
    duplicates: r.stats.duplicates, missing: r.stats.missing,
  }));
  const unitCounts = Object.fromEntries(units.map((u) => [u, current.filter((b) => b.unitCode === u).length]));
  const report = {
    reportType: 'numbering-review-only', generatedAt: new Date().toISOString(),
    selectedUnits: units, totalCurrentQuestions: current.length, unitCounts,
    legacyCategoryRecordCount: affected.length, relatedCheb3RecordCount: related.length,
    databaseChecked: false, decisionsApplied: false, rows, sourceDrift, structuralIssues,
    sourceVersions: [...sourceVersions].map(([file, sha256]) => ({ file, sha256 })),
  };
  const out = [
    '# Step 5 旧编号与当前题目逐条确认清单', '',
    '日期：2026-10-12。状态：待用户确认。仅审阅，不修改编号、不生成题块、不执行 Step 6、不连接数据库。', '',
    `本次列出 **${affected.length} 条历史分类记录＋cheb3 的 ${related.length} 条关联记录，共 ${rows.length} 条旧记录**。`,
    'cheb3 除先前已知 C1/C2 外，新增 C3/C4/C5 三条关联风险；新增明细不是题库新增了三道题。',
    `只读解析 23 个常规单元，当前共 ${current.length} 题。特集不读取最终文件、不参与映射或报告。`, '',
    '## 确认方式', '',
    '每条末尾保留“确认意见”。按 H001/M001 等编号填写即可；也可用“某范围全部同意建议，以下编号例外”批量确认。',
    '**所有建议均未执行；同题号唯一不等于正文身份已经确认。** 任何继承均须落到明确的 unitCode＋原分类＋原题号。',
    '“退役”仅指不作为当前题的活动编号，不删除旧文件或数据库记录，也不重新使用旧号。旧号是否已入库未知。',
    '旧 JSON 无最终 Markdown 行号；因此使用其 JSON Pointer、编号所在行及文件 SHA-256 定位，不能伪造旧 Markdown 来源。',
    `完整新旧题干、解析、来源行范围及 SHA-256 见 [同名 JSON 证据](./${name}.json)。Markdown 中的短摘录仅便于识别，不作为匹配依据。`, '',
    '## 优先确认', '',
    '- H001–H005：cheb3 旧合并块、同键双编号、正文身份不符。C2–C5 暂无已确认目标，所列同号题只用于反证，不能自动绑定。',
    '- che4 的三条旧 B 号对应当前応用問題/A；必须决定历史编号前缀例外或显式编号迁移，不得反改当前分类来适配旧号。',
    '- che16 的旧 B1–B12 涉及 CHECK 15–21、答案误作题、串块及多号归一，必须成组决定主继承编号和退役编号。',
    '- 其余历史分类记录逐题确认映射，不把所有リード C/D批量替换成基本問題。',
    '- 本清单聚焦已报告的75条和cheb3关联问题，不宣称完成全库所有旧正文的语义身份审计；已能形成精确键的其他记录仍需在正式候选审阅中检查。', '',
    '## 逐条索引', '',
    '| 审阅号 | 旧编号 | 旧分类 / 题号 | 当前同号候选 | 冲突类型 |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const r of rows) out.push(
    `| [${r.id}](#${r.id.toLowerCase()}) | ${r.old.businessCode} | ${cell(r.old.category)} / ${r.old.number} | ${cell(r.candidates.map((c) => `${c.unitCode} ${c.category} ${c.number}`).join('；') || '无')} | ${cell(r.kind)} |`);
  out.push('', '## 逐条明细', '');
  for (const r of rows) {
    out.push(`<a id="${r.id.toLowerCase()}"></a>`, '', `### ${r.id} · ${r.old.businessCode}`, '',
      `- 旧编号 → 来源：${code(r.old.businessCode)}；${code(r.old.category)} / ${code(r.old.number)}；${link(r.old.source, '旧 JSON 编号位置')}；Pointer ${code(r.old.source.jsonPointer)}。`,
      `- 旧题干摘录：${code(r.old.stemRaw.slice(0, 240))}${r.old.stemRaw.length > 240 ? '（截取，完整原文见证据 JSON）' : ''}`,
      `- 当前题目候选（${r.candidateBasis}）：`);
    for (const c of r.candidates) {
      out.push(`  - ${code(c.matchKey)}；${link(c.questionSource, `题干 L${c.questionSource.startLine}–L${c.questionSource.endLine}`)}；${c.analysisSource ? link(c.analysisSource, `解析 L${c.analysisSource.startLine}–L${c.analysisSource.endLine}`) : '无解析'}；状态 ${c.analysisMatchStatus}。`,
        `  - 当前题干摘录：${code(c.stemRaw.slice(0, 200))}`);
    }
    if (r.extraTargets.length) out.push(`- 其他连带题目：${r.extraTargets.map((c) => link(c.questionSource, `${c.category} ${c.number}`)).join('；')}。`);
    if (r.sameNumberOldCodes.length) out.push(`- 同单元同题号旧记录（不等同于同一题）：${r.sameNumberOldCodes.map((c) => byCode.has(c) ? `[${c} / ${byCode.get(c)}](#${byCode.get(c).toLowerCase()})` : code(c)).join('；')}。`);
    out.push(`- 冲突原因：${r.reason}`, `- 待确认决策：${r.proposedDecision}`, '',
      '**确认意见：待填写。**', '');
  }
  out.push('## 工程事项（不占用上述编号决策条数）', '',
    '### P001 · che2 试点来源版本', '');
  for (const d of sourceDrift) out.push(
    `- ${d.unitCode}/${d.side}：${d.stale ? '已过期，需要保持编号重抽取并重新确认' : '与当前文件一致'}。`,
    `  - 试点 SHA-256：${code(d.pilotSha256)}`,
    `  - 当前 SHA-256：${code(d.currentSha256)}`);
  out.push('', '无需重新手改已验收的解析；未在本轮重生成试点。', '',
    '### P002 · 最终文件结构校验', '');
  for (const issue of structuralIssues) {
    out.push(`- ${issue.unitCode}：${issue.issues.length} 个结构疑点，${issue.unassigned.length} 个未归属片段，${issue.duplicates.length} 个重复键，${issue.missing.length} 个缺失匹配。`);
    for (const item of issue.issues) {
      const doc = documents.find((d) => d.unitCode === issue.unitCode && d.side === item.side);
      out.push(`  - ${link({ file: doc.file, startLine: item.line, endLine: item.line }, `${item.side} L${item.line}`)} ${code(item.raw || '')}：${item.reason}。`);
    }
  }
  out.push('', 'cheb5 的带编号一级标题属于抽取器分类上下文适配问题；本轮未改源文、未改识别规则。不得把未归属片段丢弃后宣称全量通过。', '',
    '## 版本与保护', '',
    '本轮所读最终文件及旧 JSON 均按完整文件 SHA-256 冻结在证据 JSON 的 sourceVersions 中。任何源文件改变，都须重新核对相关决策。',
    '本脚本拒绝覆盖已有同名审阅文档，避免重跑丢失人工意见。未分配或变更任何 businessCode，未查询数据库占用情况。', '');
  for (const [file, hash] of sourceVersions) {
    if (sha(fs.readFileSync(file, 'utf8')) !== hash) throw new Error(`读取期间源版本改变：${file}`);
  }
  fs.writeFileSync(outputs[1], `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
  fs.writeFileSync(outputs[0], out.join('\n'), { flag: 'wx' });
  console.log(JSON.stringify({
    outputs, currentQuestions: current.length, legacyRows: affected.length,
    relatedRows: related.length, totalRows: rows.length,
    typeConflicts: rows.filter((r) => r.candidates.some((c) => c.blockType !== r.old.blockType)).length,
    sourceDrift: sourceDrift.filter((d) => d.stale).length,
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
