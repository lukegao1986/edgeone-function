const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const root = path.resolve(__dirname, "../../docs/0 数据准备/Chem");
const date = "2026-10-10";
const write = process.argv.includes("--write");
const sync = process.argv.includes("--sync");
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const hash = (text) => crypto.createHash("sha256").update(text).digest("hex");
const line = (text, offset) => text.slice(0, offset).split("\n").length;
const span = (text, start, end) => `L${line(text, start)}–L${line(text, end - 1)}`;
const unique = (text, needle) => {
  const index = text.indexOf(needle);
  assert(index >= 0 && text.indexOf(needle, index + needle.length) === -1, `Nonunique boundary: ${needle}`);
  return index;
};
const categories = new Set(["基礎 CHECK", "基本例題", "基本問題", "応用例題", "応用問題"]);
const internalHeadings = { che16: "2 個の", che17: "2つ以上あるときは、すべて記せ。" };
const images = (text) => [...text.matchAll(/!\[[^\]]*\]\([^)]+\)|<img\b[^>]*>/g)].map((m) => m[0]);
const tables = (text) => [...text.matchAll(/<table\b[\s\S]*?<\/table>|^\|.*$/gm)].map((m) => m[0]);
const emptyAnswers = new Set(["che9:基礎 CHECK:3", "che16:基本例題:60"]);

function parse(text, unit) {
  let category = "";
  const headings = [];
  for (const m of text.matchAll(/^(#{1,2})[ \t]+(.+)$/gm)) {
    const raw = m[2].trim();
    if (raw === internalHeadings[unit]) continue;
    if (categories.has(raw)) category = raw;
    else assert(m[1] === "##", `${unit}: unknown category ${raw}`);
    const number = raw.match(/^(?:(?:基本例題|応用例題|記述)\s+)?(\d+)(?=\s|\(|（|$)/)?.[1];
    assert(categories.has(raw) || number || raw === "解答", `${unit}: unknown heading ${raw}`);
    headings.push({ title: m[0], raw, category, number, key: `${category}:${number}`, start: m.index });
  }
  return headings.map((h, i) => ({ ...h, end: headings[i + 1]?.start ?? text.length }));
}

function applyInsertions(text, insertions) {
  const sorted = [...insertions].sort((a, b) => a.at - b.at);
  let output = "", cursor = 0;
  for (const insertion of sorted) {
    assert(insertion.at >= cursor, "Overlapping insertion");
    output += text.slice(cursor, insertion.at) + insertion.text;
    cursor = insertion.at;
  }
  return output + text.slice(cursor);
}

const contentNotes = {
  che6: [
    ["応用例題:24", "题目侧", "H2SO4 质量比的分式中美元符号与分子、分母边界混杂；按源文转移，未重写公式。"],
    ["応用例題:25", "题目侧", "(4) 电量相减式将“(1)より”“(3)より”等说明写作分母；保留原排版，未当成数值运算重新计算。"],
  ],
  che7: [],
  che8: [
    ["基本例題:29", "题目侧", "反应物质的量表中，平衡时 HI 一栏写为 -1/2 x，与后续采用 x 的平衡式不一致；未改公式。"],
    ["基本例題:31", "题目侧", "指針后的水的离子积公式附近存在单/双美元符号混用及解答被公式定界符包围；整段转移，渲染需复核。"],
  ],
  che9: [
    ["基礎 CHECK:3", "题目侧", "CHECK 答案原编号从 2 跳至 4，未找到本题答案；未套用基本例題 36 的相似答案。输出解析仅保留 ## 3 空锚点，不计入覆盖。"],
    ["基本例題:36", "题目侧", "解说段从“共有結合，金属元素とは…”开始，疑似句首缺文；已连同“〈ハロゲンの酸化力〉”移入解析，缺文不补写。"],
  ],
  che10: [],
  che11: [
    ["基本問題:254", "解析侧", "254 与新分出的 255 之间仍有双金属、铬及锰氧化数表等说明，疑似跨题脚注；未凭题号邻近关系重新分配，仍按源文顺序保留。"],
  ],
  che12: [],
  che13: [],
  che14: [
    ["基本例題:53", "题目侧", "解答 (3) 的 OH 基团文字落在全部答案末尾，键连位置未在当前排版中明确；保持源文，不自行绘制结构。"],
    ["基本例題:54", "题目侧", "C3H7、C4H9 支链结构文字和 (3) 手性碳上的 CH3 标签排版混杂；图与图注整体转移，未重排基团。"],
    ["応用例題:55", "题目侧", "油脂结构式多行内容挤在同一行，碘值计算式把说明文字排入分母；按原文保留，未校订算式。"],
  ],
  che15: [
    ["基本例題:56", "题目侧", "(1) 苯氯代方程式反应物写为 C6H5，而非题干中的苯；文字与图均保留，未据化学知识改写。"],
    ["基本例題:58", "题目侧", "(1) 酚盐反应式中苯环表示不完整，后续苯环 Unicode 公式附近美元符号混杂；保留全部原文，需复核结构式及渲染。"],
  ],
  che16: [
    ["基本例題:60", "题目侧", "两份来源均未找到本例题答案；题干小问从 (1) 跳到 (3)，未见 (2)。题干保留，输出解析仅建立空锚点，不计入覆盖。"],
  ],
  che17: [
    ["基本例題:64", "题目侧", "(1) 答案 (カ) 之后的末组结构文字包含“CH-CH=CH2”，芳香环及 (キ) 标识不明确；未补画或推断补全。"],
  ],
};

function prepare(unit, expectedCount) {
  const dir = path.join(root, unit);
  const before = new Map(fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isFile())
    .map((f) => [f, fs.readFileSync(path.join(dir, f))]));
  const qName = `${unit}题目_cleaned.md`, aName = `${unit}解析_cleaned.md`;
  assert(before.has(qName) && before.has(aName), `${unit}: missing source`);
  const q = before.get(qName).toString(), a = before.get(aName).toString();
  const qh = parse(q, unit), originalAH = parse(a, unit);
  const questions = qh.filter((h) => h.number);
  assert(questions.length === expectedCount, `${unit}: question count ${questions.length}`);
  const removed = [], transfers = new Map(), special = [], insertions = [];
  const checkGroups = qh.filter((h) => h.raw === "解答");
  assert(checkGroups.length === 1 && checkGroups[0].category === "基礎 CHECK", `${unit}: CHECK boundary`);
  const check = checkGroups[0];
  const checkStart = check.start + check.title.length + 1;
  const checkText = q.slice(checkStart, check.end);
  const anchors = [...checkText.matchAll(/^(\d+)(?=[ \t(（]|\r?$)/gm)];
  assert(checkText.slice(0, anchors[0].index).trim() === "", `${unit}: CHECK preamble`);
  const checks = questions.filter((h) => h.category === "基礎 CHECK");
  for (let i = 0; i < anchors.length; i += 1) {
    const m = anchors[i], end = anchors[i + 1]?.index ?? checkText.length;
    const question = checks.find((h) => h.number === m[1]);
    assert(question && !transfers.has(question.key), `${unit}: unexpected CHECK answer ${m[1]}`);
    const original = checkText.slice(m.index, end);
    // Only promote the original answer number; retain every character after it.
    const output = `## ${m[1]}\n\n${original.slice(m[1].length)}`;
    assert(output.replace(/^## (\d+)\n\n/, "$1") === original, "CHECK text loss");
    transfers.set(question.key, { start: checkStart + m.index, end: checkStart + end, output });
  }
  removed.push({ start: check.start, end: check.end, insert: "" });
  for (const h of questions.filter((item) => /例題$/.test(item.category))) {
    const body = q.slice(h.start, h.end);
    const marker = unit === "che9" && h.number === "36" && !body.includes("指針")
      ? { index: unique(body, "〈ハロゲンの酸化力〉") }
      : /(?:【|\[)?(?:指針|解答)/.exec(body);
    if (!marker) {
      assert(emptyAnswers.has(`${unit}:${h.key}`), `${unit}: unknown answerless example ${h.key}`);
      continue;
    }
    const start = h.start + marker.index;
    let end = h.end;
    if (unit === "che12" && h.number === "48") {
      end = unique(q, "(原子量 H=1.0, C=12, O=16)");
      special.push(`応用例題 48 后的公共原子量条件（Q ${span(q, end, h.end)}）保留于题目侧原位置，不混入例题解析。`);
    }
    const payload = q.slice(start, end);
    assert(payload.includes("解答"), `${unit}: solution marker missing ${h.key}`);
    transfers.set(h.key, { start, end, output: `${h.title}\n\n${payload}` });
    // Inline markers need a new paragraph so that the following heading stays a heading.
    const separator = q[start - 1] !== "\n" ? "\n\n" : "";
    removed.push({ start, end, insert: separator });
    if (separator) special.push(`${h.raw} 的指針位于题干同一行（Q L${line(q, start)}）；在“指針”前分离，题干仅补段落换行。`);
  }
  const missing = questions.filter((h) => /例題$/.test(h.category) || h.category === "基礎 CHECK")
    .filter((h) => !transfers.has(h.key));
  for (const h of missing) assert(emptyAnswers.has(`${unit}:${h.key}`), `${unit}: unexpected missing ${h.key}`);

  if (unit === "che11" && !originalAH.some((h) => h.number === "255")) {
    const at = unique(a, "(1) (a) 化合物 (b) 混合物");
    assert(originalAH.find((h) => h.number === "254").end > at, "255 boundary changed");
    insertions.push({ at, text: "## 255\n\n", type: "anchor" });
    special.push(`原解析无 255 标题，但 A L${line(a, at)} 起的“化合物/混合物、青銅、ジュラルミン、ステンレス鋼、黄銅”与题目 255 各小问吻合；仅在输出该处插入 ## 255，正文未移动或补写，cleaned 不变。`);
  }
  const answerText = applyInsertions(a, insertions);
  const ah = parse(answerText, unit), analyses = ah.filter((h) => h.number);
  const emitCategory = (category) => {
    const entries = questions.filter((h) => h.category === category);
    if (!entries.length) return "";
    return `# ${category}\n\n` + entries.map((h) => transfers.get(h.key)?.output ?? `${h.category === "基礎 CHECK" ? `## ${h.number}` : h.title}\n\n`).join("");
  };
  insertions.push({
    at: originalAH.find((h) => h.raw === "基本問題").start,
    text: emitCategory("基礎 CHECK") + emitCategory("基本例題"),
    type: "transfer",
  });
  const applied = emitCategory("応用例題");
  if (applied) insertions.push({ at: originalAH.find((h) => h.raw === "応用問題").start, text: applied, type: "transfer" });
  if (unit === "che9") special.push("基本例題 36 无指針标记，从“〈ハロゲンの酸化力〉”开始的解释内容整体转移，包含后续解答。記述 217 与解析 217 按原题号对应，保留“記述”。");
  if (unit === "che10") special.push("基本例題 41 无指針，从“解答”起转移，题干中的填空与化学式位置保持不变。");
  if (unit === "che11") special.push("記述 251 与解析 251 按原题号对应，保留题目标题中的“記述”；基本例題 45 的指針图片移入解析。");
  if (unit === "che13") special.push("解析分类原文为二级标题“## 応用問題”，按分类识别 294–299，不当成题目；输出保留原层级。289、291 题标题中的额外空格不改写。");
  if (unit === "che16") special.push("基本例題 61 从“解答”起转移；来源无応用例題分类，不新增该分类。367、383 的解析锚点现已存在，不沿用旧预览的缺号结论。");
  if (unit === "che17") special.push("来源无応用例題分类，不新增该分类；399、403、404 的解析锚点现已存在。");
  if (internalHeadings[unit]) special.push(`题目中的“## ${internalHeadings[unit]}”属于上一题正文而非新题号；原文原样保留，计数与后续结构化须分别归入 ${unit === "che16" ? "367" : "398"} 题。`);

  let qOut = "", cursor = 0;
  for (const part of removed.sort((x, y) => x.start - y.start)) {
    assert(part.start >= cursor, "Overlapping answer removals");
    qOut += q.slice(cursor, part.start) + part.insert;
    cursor = part.end;
  }
  qOut += q.slice(cursor);
  const aOut = applyInsertions(a, insertions);
  const finalQ = parse(qOut, unit).filter((h) => h.number), finalA = parse(aOut, unit).filter((h) => h.number);
  assert(equal(finalQ.map((h) => h.title), questions.map((h) => h.title)), `${unit}: question titles changed`);
  assert(equal(finalQ.map((h) => h.key), finalA.map((h) => h.key)), `${unit}: alignment mismatch`);
  assert(new Set(finalQ.map((h) => h.key)).size === expectedCount, `${unit}: duplicate key`);
  assert(!/指針|解答|ここがポイント/.test(qOut.replace(/解答群|該当する解答が/g, "")), `${unit}: answer marker remains`);
  const mappedSources = [];
  for (const h of questions) {
    const transfer = transfers.get(h.key), targets = analyses.filter((item) => item.key === h.key);
    const removal = removed.find((part) => transfer && part.start === transfer.start);
    const expectedStem = transfer && /例題$/.test(h.category)
      ? q.slice(h.start, transfer.start) + removal.insert + q.slice(transfer.end, h.end)
      : q.slice(h.start, h.end);
    const actualStem = finalQ.find((item) => item.key === h.key);
    assert(qOut.slice(actualStem.start, actualStem.end) === expectedStem, `${unit}: stem changed ${h.key}`);
    const isMovedCategory = h.category === "基礎 CHECK" || /例題$/.test(h.category);
    assert(isMovedCategory ? targets.length === 0 : targets.length === 1, `${unit}: ambiguous ${h.key}`);
    if (!isMovedCategory) {
      const target = targets[0];
      assert(answerText.slice(target.start + target.title.length, target.end).trim(), `${unit}: empty original answer`);
      const anchorInsertion = insertions.filter((i) => i.type === "anchor");
      const originalOffset = (offset) => offset - anchorInsertion.reduce((sum, i) => sum + (offset >= i.at + i.text.length ? i.text.length : 0), 0);
      mappedSources.push({ key: h.key, start: originalOffset(target.start), end: originalOffset(target.end) });
    }
    if (transfer) {
      const actual = finalA.find((item) => item.key === h.key);
      assert(aOut.slice(actual.start, actual.end) === transfer.output, `${unit}: transferred block changed`);
    }
  }
  let restored = aOut;
  let shift = 0;
  const positions = [...insertions].sort((x, y) => x.at - y.at).map((i) => {
    const p = { ...i, outputAt: i.at + shift }; shift += i.text.length; return p;
  });
  for (const i of positions.reverse()) restored = restored.slice(0, i.outputAt) + restored.slice(i.outputAt + i.text.length);
  assert(restored === a, `${unit}: original analysis not reversible`);
  const movedImages = [...transfers.values()].flatMap((t) => images(q.slice(t.start, t.end)));
  assert(equal(images(qOut).concat(images(aOut)).sort(), images(q).concat(images(a)).sort()), `${unit}: image loss`);
  assert(equal(tables(qOut).concat(tables(aOut)).sort(), tables(q).concat(tables(a)).sort()), `${unit}: table loss`);
  assert(questions.length === transfers.size + analyses.length + missing.length, `${unit}: coverage accounting`);
  assert(equal(finalA.filter((h) => !aOut.slice(h.start + h.title.length, h.end).trim()).map((h) => h.key),
    missing.map((h) => h.key)), `${unit}: unreported empty answers`);

  if (sync) return {
    unit, dir, before,
    outputs: { [`${unit}_题目.md`]: qOut, [`${unit}_解析.md`]: aOut },
    summary: {
      questions: expectedCount, transferred: transfers.size, original: analyses.length,
      covered: expectedCount - missing.length, missing: missing.map((h) => h.key),
      changed: [[`${unit}_题目.md`, qOut], [`${unit}_解析.md`, aOut]]
        .filter(([name, text]) => before.get(name)?.toString() !== text).map(([name]) => name),
    },
  };

  const reportName = `${unit}_Step4分离记录_${date}.md`;
  assert(!before.has(reportName), `${unit}: report already exists`);
  const notes = contentNotes[unit];
  const report = [
    `# ${unit} Step 4 分离记录`, "",
    `执行日期：${date}。唯一内容来源为 ${qName}、${aName}。只写入本目录的 ${unit}_题目.md、${unit}_解析.md 和本记录；未修改 cleaned、drill、JSON、其他单元或旧预览。`,
    "", "## 结果", "",
    "| 分类 | 题目数 | 题目侧答案转移 | 原解析侧覆盖 | 非空覆盖 | 缺答 |",
    "|---|---:|---:|---:|---:|---:|",
  ];
  for (const category of new Set(questions.map((h) => h.category))) {
    const entries = questions.filter((h) => h.category === category);
    const moved = entries.filter((h) => transfers.has(h.key)).length;
    const original = entries.filter((h) => analyses.some((s) => s.key === h.key)).length;
    report.push(`| ${category} | ${entries.length} | ${moved} | ${original} | ${moved + original} | ${entries.length - moved - original} |`);
  }
  report.push(`| 合计 | ${expectedCount} | ${transfers.size} | ${analyses.length} | ${expectedCount - missing.length} | ${missing.length} |`, "",
    `题号重复对应：0；缺答：${missing.length} 题。原文内容待确认列项：${notes.length} 项（包含缺答，见下文）。`,
    "非空覆盖仅表示具有对应的原文答案/解说片段，不代表所有小问、公式、化学结构及图片均已校订。缺答题只保留空解析锚点，未生成或借用其他题答案。",
    "", "## 分离规则与特殊对应", "",
    "- CHECK 按原编号逐题转移；只将答案开头题号提升为二级锚点，题号后的字符原样保留。",
    "- 例题按已核对的指針/解答/无标记解说起点切分，连续转移到下一题或分类前；不按空行拆散图文或公式。",
    "- 题干、题目标题、原解析标题保持原样；行内切分仅补充必要换行。原解析正文及相对顺序不变，跨题疑点不擅自改写。",
    ...special.map((item) => `- ${item}`),
    "", "## 逐题溯源", "",
    `Q = ${qName}；A = ${aName}。行号按本次来源计算，包含块尾空行。同一行出现题干与指針时，以指針之前/之后区分，不能只按整行截断。`,
    "", "| 分类 | 原题号 | 题干来源 | 答案/解析来源 | 对应状态 |",
    "|---|---|---|---|---|",
  );
  for (const h of questions) {
    const transfer = transfers.get(h.key), original = mappedSources.find((s) => s.key === h.key);
    const stemEnd = transfer && /例題$/.test(h.category) ? transfer.start : h.end;
    const source = transfer ? `Q ${span(q, transfer.start, transfer.end)}` : original ? `A ${span(a, original.start, original.end)}` : "两份来源未找到";
    const status = transfer ? "原文转移" : original ? unit === "che11" && h.number === "255" ? "按小问内容对应，输出补锚点" : "原分类、题号对应" : "缺答，空锚点不计覆盖";
    report.push(`| ${h.category} | ${h.number} | Q ${span(q, h.start, stemEnd)} | ${source} | ${status} |`);
  }
  report.push("", "## 原文内容待确认", "");
  if (!notes.length) report.push("本次分离边界与题号核对未另发现明确缺答或需单列的内容疑点；不等同于完成全文化学正确性、公式渲染或图片视觉校对。");
  for (const [key, side, description] of notes) {
    const question = questions.find((h) => h.key === key);
    const original = mappedSources.find((s) => s.key === key);
    const ref = side === "题目侧" ? `Q ${span(q, question.start, question.end)}` : `A ${span(a, original.start, original.end)}`;
    report.push(`- ${key.replace(":", " ")}（${ref}）：${description}`);
  }
  report.push("", "## 完整性核验", "",
    `- 两份输出各 ${expectedCount} 个有效题块，按分类与题号一一对应；空锚点 ${missing.length} 个单列，不算非空覆盖。`,
    "- 原解析移除本次新增分类、转移内容及记录注明的新锚点后，可逐字还原为最新 cleaned 来源。",
    "- CHECK 编号后的全部字符、例题转移片段逐字保留；未修改公式、单位、小问顺序或化学结构文本。",
    `- 图片引用：来源 Q ${images(q).length} 个、A ${images(a).length} 个；转移 ${movedImages.length} 个；输出题目 ${images(qOut).length} 个、解析 ${images(aOut).length} 个。总数及逐项内容不变，片段内原顺序不变。`,
    "- HTML/Markdown 表格内容集合一致；未创建或下载图片。题目侧无指針/解答正文/ここがポイント标记；“解答群”“該当する解答が”等必要作答说明保留。",
    `- Q SHA-256：${hash(q)}`, `- A SHA-256：${hash(a)}`, "",
  );
  return { unit, dir, before, outputs: { [`${unit}_题目.md`]: qOut, [`${unit}_解析.md`]: aOut, [reportName]: report.join("\n") },
    summary: { questions: expectedCount, transferred: transfers.size, original: analyses.length, covered: expectedCount - missing.length, missing: missing.map((h) => h.key), contentIssues: notes.length, movedImages: movedImages.length } };
}

const counts = [43, 25, 57, 46, 16, 38, 18, 24, 41, 42, 62, 39];
const batches = counts.map((count, i) => prepare(`che${i + 6}`, count));
if (write) {
  for (const batch of batches) {
    for (const [name, bytes] of batch.before) assert(fs.readFileSync(path.join(batch.dir, name)).equals(bytes), `Changed during processing: ${name}`);
  }
  for (const batch of batches) {
    for (const [name, text] of Object.entries(batch.outputs)) {
      if (batch.before.get(name)?.toString() !== text) fs.writeFileSync(path.join(batch.dir, name), text);
    }
    for (const [name, bytes] of batch.before) {
      if (!(name in batch.outputs)) assert(fs.readFileSync(path.join(batch.dir, name)).equals(bytes), `Unexpected modification: ${name}`);
    }
    for (const [name, text] of Object.entries(batch.outputs)) assert(fs.readFileSync(path.join(batch.dir, name), "utf8") === text, `Disk mismatch: ${name}`);
  }
}
console.log(JSON.stringify({ written: write, units: batches.map((b) => ({ unit: b.unit, ...b.summary })) }, null, 2));
