const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "../../docs/0 数据准备/Chem");
const write = process.argv.includes("--write");
const sync = process.argv.includes("--sync");
const date = "2026-10-11";
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const line = (text, offset) => text.slice(0, offset).split("\n").length;
const range = (text, start, end) => `L${line(text, start)}–L${line(text, end - 1)}`;
const images = (text) => [...text.matchAll(/!\[[^\]]*\]\([^)]+\)|<img\b[^>]*>/g)].map((m) => m[0]);
const tables = (text) => [...text.matchAll(/<table\b[\s\S]*?<\/table>|^\|.*$/gm)].map((m) => m[0]);

function category(raw) {
  if (/^基礎\s*CHECK$/.test(raw)) return "基礎 CHECK";
  if (/^基本例[題题](?:\s+\d+)?$/.test(raw)) return "基本例題";
  if (/^応用例題$/.test(raw)) return "応用例題";
  if (/^(基本問題|応用問題)$/.test(raw)) return raw;
  return null;
}

function parse(text, unit) {
  const events = [], ignored = [];
  let current = "";
  for (const match of text.matchAll(/^[ \t]{0,3}(#{1,6})[ \t]+(.+)$/gm)) {
    const depth = match[1].length, raw = match[2].trim(), cat = category(raw);
    if (depth > 2 && !(current === "基礎 CHECK" && raw === "解答")) continue;
    if (cat) current = cat;
    const id = raw.match(/^(?:(?:基本例[題题]|応用例題|記述)\s*)?(※?)(\d+)(?=\s|[（(]|$)/);
    const kind = cat ? "category" : current === "基礎 CHECK" && raw === "解答" ? "check" : id ? "question" : null;
    if (!kind) {
      assert(depth !== 1, `${unit}: unknown category ${raw}`);
      ignored.push({ raw, start: match.index });
      continue;
    }
    events.push({
      kind, category: current, number: id?.[2], label: id ? id[1] + id[2] : "",
      title: match[0], start: match.index, key: `${current}:${id?.[2]}`,
    });
  }
  return {
    ignored,
    events: events.map((event, i) => ({ ...event, end: events[i + 1]?.start ?? text.length })),
  };
}

function insert(text, insertions) {
  let output = "", cursor = 0, shift = 0;
  const positions = [];
  for (const item of [...insertions].sort((a, b) => a.at - b.at)) {
    assert(item.at >= cursor, "Insertion order mismatch");
    output += text.slice(cursor, item.at) + item.text;
    positions.push({ start: item.at + shift, length: item.text.length });
    shift += item.text.length;
    cursor = item.at;
  }
  output += text.slice(cursor);
  let restored = output;
  for (const item of positions.reverse()) restored = restored.slice(0, item.start) + restored.slice(item.start + item.length);
  assert(restored === text, "Original analysis changed");
  return output;
}

const notes = {
  cheb1: [
    ["基礎 CHECK:1", "CHECK 1 答案出现“才”，CHECK 2 出现“工”，而题目对应选项为“オ”“エ”；疑似 OCR 字形混淆，按原答案保留。"],
  ],
  cheb2: [],
  cheb3: [
    ["基礎 CHECK:7", "极性分子答案写为“イ, ウ, 才”，题目选项使用片假名，末项疑似“オ”的 OCR 误识别；未改写。"],
    ["基本例題:9", "第 (2) 小问要求从“次のどれか”选择分子形状，答案使用ア、イ、エ、カ，但本题题干块内未见相应选项文字或图片；未自行补选项。"],
  ],
  cheb4: [
    ["基本例題:11", "解答 (2) 后的独立公式重复列出 35Cl、37Cl 及撇号，下方另有相对质量/存在比标签；原排版关系不明确，整体保留于解析。"],
    ["応用例題:16", "密度、体积、质量的说明文字被排成分母；(2) 末句止于“3.5% の希”，后接“答 80 mL”。公式排版与残句未补写。"],
    ["応用例題:17", "(1) 将“溶質の質量 [g]”与无量纲质量比等式相连，标签或等号归属有歧义；按原文转移，未重算或改单位。"],
  ],
  cheb5: [
    ["基本例題:21", "题干操作标记出现重复①，小问要求①、⑥、⑤，答案首项却标为 a；操作编号对应不一致，保留源文待人工确认。"],
  ],
  cheb6: [
    ["基本例題:26", "指針在“とな”处中断，后面有孤立公式“\\circ \\mathrm{e}^{-}”“\\mathrm{してイ}”；解说正文疑似残缺，仍整段转移。"],
    ["応用例題:28", "(3) 的物质的量等式整体被放入分子，分母为“KMnO4 の物質量”说明文字；保留原公式及别解，未改排版。"],
  ],
};

function prepare(unit, expected) {
  const dir = path.join(root, unit);
  const before = new Map(fs.readdirSync(dir).filter((name) => fs.statSync(path.join(dir, name)).isFile())
    .map((name) => [name, fs.readFileSync(path.join(dir, name))]));
  const qName = `${unit}题目_cleaned.md`, aName = `${unit}解析_cleaned.md`;
  assert(before.has(qName) && before.has(aName), `${unit}: source missing`);
  const q = before.get(qName).toString(), a = before.get(aName).toString();
  const qp = parse(q, unit), ap = parse(a, unit);
  assert(qp.ignored.length === 0, `${unit}: unrecognized question heading`);
  const questions = qp.events.filter((h) => h.kind === "question");
  const analyses = ap.events.filter((h) => h.kind === "question");
  const regular = questions.filter((h) => /問題$/.test(h.category));
  assert(questions.length === expected, `${unit}: unexpected question count ${questions.length}`);
  assert(new Set(questions.map((h) => h.key)).size === expected, `${unit}: duplicate question`);
  assert(analyses.length === regular.length, `${unit}: analysis count mismatch`);
  for (const h of analyses) {
    const matches = regular.filter((entry) => entry.number === h.number);
    assert(matches.length === 1, `${unit}: unmatched analysis ${h.number}`);
    assert(!h.category || h.category === matches[0].category, `${unit}: category conflict ${h.number}`);
    h.category = matches[0].category;
    h.key = matches[0].key;
    assert(a.slice(h.start + h.title.length, h.end).trim(), `${unit}: empty analysis ${h.number}`);
  }
  assert(new Set(analyses.map((h) => h.key)).size === regular.length, `${unit}: duplicate analysis`);
  const removals = [], moved = new Map(), special = [];
  const checkBlocks = qp.events.filter((h) => h.kind === "check");
  assert(checkBlocks.length === 1, `${unit}: ambiguous CHECK answers`);
  const check = checkBlocks[0], offset = check.start + check.title.length + 1;
  const text = q.slice(offset, check.end);
  const checkAnchors = [...text.matchAll(/^(\d+)(?=[ \t(（]|\r?$)/gm)];
  assert(text.slice(0, checkAnchors[0]?.index).trim() === "", `${unit}: unassigned CHECK preamble`);
  for (let i = 0; i < checkAnchors.length; i++) {
    const anchor = checkAnchors[i], end = checkAnchors[i + 1]?.index ?? text.length;
    const key = `基礎 CHECK:${anchor[1]}`;
    assert(questions.some((h) => h.key === key) && !moved.has(key), `${unit}: CHECK answer mismatch ${key}`);
    const payload = text.slice(anchor.index, end);
    const output = `## ${anchor[1]}\n\n${payload.slice(anchor[1].length)}`;
    assert(output.replace(/^## (\d+)\n\n/, "$1") === payload, `${unit}: CHECK content loss`);
    moved.set(key, { start: offset + anchor.index, end: offset + end, output });
  }
  removals.push({ start: check.start, end: check.end });
  for (const h of questions.filter((entry) => /例題$/.test(entry.category))) {
    const body = q.slice(h.start, h.end);
    const marker = /^[ \t]*(?:#{1,6}[ \t]+)?(?:【|\[)?(?:指針|解答)/m.exec(body);
    assert(marker, `${unit}: missing example answer ${h.key}`);
    const start = h.start + marker.index;
    let end = h.end;
    if (unit === "cheb5" && h.key === "応用例題:24") {
      const tag = /^発展[ \t]*$/m.exec(body);
      assert(tag && tag.index > marker.index, "Development label boundary changed");
      end = h.start + tag.index;
      special.push(`Q ${range(q, end, h.end)} 的独立“発展”标签保留在题目侧、例题 25 之前，不转入例题 24 解析。`);
    }
    const payload = q.slice(start, end);
    assert(/解答/.test(payload), `${unit}: answer marker absent ${h.key}`);
    moved.set(h.key, { start, end, output: `${h.title}\n\n${payload}` });
    removals.push({ start, end });
  }
  assert(moved.size + analyses.length === expected, `${unit}: missing answers`);
  let qOut = "", cursor = 0;
  for (const item of removals.sort((x, y) => x.start - y.start)) {
    assert(item.start >= cursor, "Overlapping removals");
    qOut += q.slice(cursor, item.start);
    cursor = item.end;
  }
  qOut += q.slice(cursor);
  const emit = (cat) => `# ${cat}\n\n` + questions.filter((h) => h.category === cat).map((h) => moved.get(h.key).output).join("");
  const basic = ap.events.find((h) => h.kind === "category" && h.category === "基本問題");
  const applied = ap.events.find((h) => h.kind === "category" && h.category === "応用問題");
  assert(unit === "cheb6" || (basic && applied), `${unit}: unexpected missing classification`);
  const insertions = [
    { at: basic?.start ?? analyses[0].start, text: emit("基礎 CHECK") + emit("基本例題") + (basic ? "" : "# 基本問題\n\n") },
    { at: applied?.start ?? analyses.find((h) => h.category === "応用問題").start, text: emit("応用例題") + (applied ? "" : "# 応用問題\n\n") },
  ];
  const aOut = insert(a, insertions);
  const finalQ = parse(qOut, unit).events.filter((h) => h.kind === "question");
  const finalA = parse(aOut, unit).events.filter((h) => h.kind === "question");
  assert(equal(finalQ.map((h) => h.key), questions.map((h) => h.key)), `${unit}: question identity changed`);
  assert(equal(finalQ.map((h) => h.key), finalA.map((h) => h.key)), `${unit}: output alignment mismatch`);
  for (const h of questions) {
    const transfer = moved.get(h.key), targetQ = finalQ.find((entry) => entry.key === h.key);
    const expectedStem = transfer && /例題$/.test(h.category)
      ? q.slice(h.start, transfer.start) + q.slice(transfer.end, h.end) : q.slice(h.start, h.end);
    assert(qOut.slice(targetQ.start, targetQ.end) === expectedStem, `${unit}: stem changed ${h.key}`);
    const targetA = finalA.find((entry) => entry.key === h.key);
    const original = analyses.find((entry) => entry.key === h.key);
    assert(aOut.slice(targetA.start, targetA.end) === (transfer?.output ?? a.slice(original.start, original.end)),
      `${unit}: answer changed ${h.key}`);
    assert(aOut.slice(targetA.start + targetA.title.length, targetA.end).trim(), `${unit}: empty answer ${h.key}`);
  }
  assert(!/指針|ここがポイント|解答(?!群)/.test(qOut), `${unit}: solution remains in question output`);
  assert(equal([...images(q), ...images(a)].sort(), [...images(qOut), ...images(aOut)].sort()), `${unit}: image loss`);
  assert(equal([...tables(q), ...tables(a)].sort(), [...tables(qOut), ...tables(aOut)].sort()), `${unit}: table loss`);

  if (sync) {
    const outputs = { [`${unit}_题目.md`]: qOut, [`${unit}_解析.md`]: aOut };
    return { unit, dir, before, outputs, summary: {
      questions: expected, covered: expected,
      changed: Object.entries(outputs).filter(([name, text]) => before.get(name)?.toString() !== text).map(([name]) => name),
    } };
  }

  if (unit === "cheb1") special.push("基本問題的“※1”与解析“1”按原题号对应，保留※；応用例題标题原文为“## 3 三態の変化と温度”，按所在分类识别，不改标题。基本例題 1 解答中 d/e/f 等字母的原始顺序保留。");
  if (unit === "cheb4") special.push("题目 75 的二级标题有一个前导空格，按有效题号识别并原样保留；“基本例题 13/14”的简体“题”保留。原解析“## 基本問題”按分类识别，输出不改层级。");
  if (unit === "cheb5") special.push("重复的“## 基礎 CHECK”及“# 基本例題 19”属于分类，不计入题数；题目侧原样保留。新解析分类使用“# 基本例題”，普通题 114 已有对应解析，不使用旧预览的错误编号。");
  if (unit === "cheb6") special.push("题目侧重复的基本例題分类保留；原解析无分类，依据题目普通题范围，在输出 141 前补“# 基本問題”、154 前补“# 応用問題”，原解析正文不变。");
  for (const h of ap.ignored) special.push(`A L${line(a, h.start)} 的“${h.raw}”不是题号，按章节说明或所在题目内部正文保留，不截断解析块。`);
  const reportName = `${unit}_Step4分离记录_${date}.md`;
  assert(!before.has(reportName), `${unit}: existing report would be overwritten`);
  const report = [`# ${unit} Step 4 分离记录`, "",
    `执行日期：${date}。唯一来源：${qName}、${aName}。仅更新本目录 ${unit}_题目.md、${unit}_解析.md，并新建本记录；cleaned、drill、JSON 和其他单元未修改。`,
    "", "## 结果", "", "| 分类 | 题目数 | 题目侧答案转移 | 原解析侧覆盖 | 非空覆盖 |", "|---|---:|---:|---:|---:|"];
  for (const cat of [...new Set(questions.map((h) => h.category))]) {
    const entries = questions.filter((h) => h.category === cat), transferred = entries.filter((h) => moved.has(h.key)).length;
    report.push(`| ${cat} | ${entries.length} | ${transferred} | ${entries.length - transferred} | ${entries.length} |`);
  }
  report.push(`| 合计 | ${expected} | ${moved.size} | ${analyses.length} | ${expected} |`, "",
    `缺答、重复挂接、无题干解析：均为 0。原文内容待确认：${notes[unit].length} 项。`,
    "覆盖仅表示有非空原文答案/解析来源，不等于每个小问、选项、公式及图文均已校订。未凭化学知识改写源文或补充答案。",
    "", "## 分离规则与特殊对应", "",
    "- CHECK 答案按原题号逐题移入解析，仅将答案行首数字提升为二级标题；数字后全部字符保留。",
    "- 例题从指針或解答的起点（含原有 Markdown 标题符号）连续转移，保留图片、公式、表格、图注和顺序；题干与题图保留。",
    "- 题号、题目标题和原解析正文不清洗、不重排；新增解析分类仅用于承接转移内容。",
    ...special.map((item) => `- ${item}`),
    "", "## 逐题溯源", "", `Q = ${qName}；A = ${aName}。行号基于本次来源，包含块尾空行。以“分类 + 原题号”区分 CHECK、例题与普通题。`,
    "", "| 分类 | 原题号 | 题干来源 | 答案/解析来源 | 对应方式 |", "|---|---|---|---|---|");
  for (const h of questions) {
    const transfer = moved.get(h.key), original = analyses.find((entry) => entry.key === h.key);
    const stemEnd = transfer && /例題$/.test(h.category) ? transfer.start : h.end;
    const source = transfer ? `Q ${range(q, transfer.start, transfer.end)}` : `A ${range(a, original.start, original.end)}`;
    report.push(`| ${h.category} | ${h.label} | Q ${range(q, h.start, stemEnd)} | ${source} | ${transfer ? "题目侧原文转移" : "原题号对应"} |`);
  }
  report.push("", "## 原文内容待确认", "");
  if (!notes[unit].length) report.push("本次分离边界、题号对应核对未发现需单列的明确缺项；未执行图片视觉检查或全文化学正确性校订。");
  for (const [key, description] of notes[unit]) {
    const h = questions.find((entry) => entry.key === key);
    assert(h, `Missing issue reference ${key}`);
    const transfer = moved.get(key);
    report.push(`- ${key.replace(":", " ")}（Q ${range(q, h.start, h.end)}${transfer ? `；答案 Q ${range(q, transfer.start, transfer.end)}` : ""}）：${description}`);
  }
  report.push("", "## 完整性核验", "",
    `- 两份输出各 ${expected} 个有效题块，分类与题号按顺序一一对应，均有非空答案/解析；题目标题原文不变。`,
    "- 每题题干与源文保留区逐字一致；每段转移解答与来源逐字一致（CHECK 仅提升题号）。",
    "- 从输出解析移除新增分类和转移块，可逐字还原整个原解析来源；原解析内部的非题号标题没有导致截断。",
    `- 图片引用：来源题目 ${images(q).length}、解析 ${images(a).length}；输出题目 ${images(qOut).length}、解析 ${images(aOut).length}。总引用集合一致，片段内顺序不变，未创建或下载图片。`,
    "- HTML/Markdown 表格集合一致；所有公式随原文片段保留。题目侧不含指針、解答正文或ここがポイント。",
    `- Q SHA-256：${hash(q)}`, `- A SHA-256：${hash(a)}`, "");
  return { unit, dir, before, outputs: { [`${unit}_题目.md`]: qOut, [`${unit}_解析.md`]: aOut, [reportName]: report.join("\n") },
    summary: { questions: expected, transferred: moved.size, original: analyses.length, covered: expected, unresolved: notes[unit].length } };
}

const batches = [29, 33, 42, 54, 55, 33].map((count, index) => prepare(`cheb${index + 1}`, count));
if (write) {
  for (const batch of batches) for (const [name, bytes] of batch.before) {
    assert(fs.readFileSync(path.join(batch.dir, name)).equals(bytes), `Concurrent change: ${name}`);
  }
  for (const batch of batches) {
    for (const [name, text] of Object.entries(batch.outputs)) {
      if (batch.before.get(name)?.toString() !== text) fs.writeFileSync(path.join(batch.dir, name), text);
    }
    for (const [name, text] of Object.entries(batch.outputs)) assert(fs.readFileSync(path.join(batch.dir, name), "utf8") === text, `Disk mismatch: ${name}`);
    for (const [name, bytes] of batch.before) if (!(name in batch.outputs)) {
      assert(fs.readFileSync(path.join(batch.dir, name)).equals(bytes), `Unexpected change: ${name}`);
    }
  }
}
console.log(JSON.stringify({ written: write, units: batches.map((batch) => ({ unit: batch.unit, ...batch.summary })) }, null, 2));
