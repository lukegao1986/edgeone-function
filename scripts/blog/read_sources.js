const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const SRC_DIR = path.join(ROOT, "blog-src");
const STATS_FILE = path.join(ROOT, "blog-data", "pv.json");

const REQUIRED = ["title", "slug", "cat", "date"];

function parseScalar(raw) {
  const v = raw.trim();
  if (!v) return "";
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  if (/^-?\d+$/.test(v)) return Number(v);
  return v;
}

function parseFrontMatter(raw, file) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/.exec(raw);
  if (!m) throw new Error(`缺少 front matter: ${file}`);

  const data = {};
  let key = null;
  m[1].split(/\r?\n/).forEach((line) => {
    if (!line.trim() || /^\s*#/.test(line)) return;

    const item = /^\s*-\s+(.*)$/.exec(line);
    if (item && key) {
      if (!Array.isArray(data[key])) data[key] = data[key] ? [data[key]] : [];
      data[key].push(parseScalar(item[1]));
      return;
    }

    const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (!kv) return;
    key = kv[1];
    const val = kv[2].trim();

    if (/^\[.*\]$/.test(val)) {
      data[key] = val
        .slice(1, -1)
        .split(",")
        .map(parseScalar)
        .filter((s) => s !== "");
      return;
    }
    data[key] = parseScalar(val);
  });

  REQUIRED.forEach((k) => {
    if (data[k] === undefined || data[k] === "") {
      throw new Error(`front matter 缺少必填字段 ${k}: ${file}`);
    }
  });

  return { data, body: raw.slice(m[0].length).trim() };
}

function readStats() {
  if (!fs.existsSync(STATS_FILE)) return {};
  return JSON.parse(fs.readFileSync(STATS_FILE, "utf8"));
}

function readSources() {
  if (!fs.existsSync(SRC_DIR)) {
    throw new Error(`文章源目录不存在: ${SRC_DIR}`);
  }

  const stats = readStats();
  const seen = new Set();

  const posts = fs
    .readdirSync(SRC_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((file) => {
      const full = path.join(SRC_DIR, file);
      const { data, body } = parseFrontMatter(fs.readFileSync(full, "utf8"), file);

      if (data.slug !== path.basename(file, ".md")) {
        throw new Error(`slug 与文件名不一致: ${file} → slug=${data.slug}`);
      }
      if (seen.has(data.slug)) throw new Error(`slug 重复: ${data.slug}`);
      seen.add(data.slug);

      const kw = Array.isArray(data.keywords) ? data.keywords : [];
      return {
        slug: data.slug,
        title: data.title,
        cat: data.cat,
        date: data.date,
        updated: data.updated || data.date,
        minutes: data.minutes || 5,
        summary: data.summary || "",
        keywords: kw.length ? kw : [data.title],
        cover: data.cover || "",
        glyph: data.glyph || "📄",
        cta: data.cta || "",
        recap: Array.isArray(data.recap) ? data.recap : [],
        body,
        pv: (stats[data.slug] && stats[data.slug].pv) || 0,
        uv: (stats[data.slug] && stats[data.slug].uv) || 0,
      };
    });

  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return posts;
}

module.exports = { readSources, SRC_DIR, STATS_FILE };
