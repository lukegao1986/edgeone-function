#!/usr/bin/env node
/**
 * 从飞书多维表格「EJU Pro 讲师风采」导入讲师数据（博客静态站体系）
 *
 * 用法：
 *   npm run import:teachers
 *
 * 产出：
 *   blog-data/teachers.json            讲师数据（build:blog 消费）
 *   blog/assets/teachers/<id>/         照片 / 讲义截图 / 家长反馈（本地化，随站打包）
 *
 * 飞书字段（姓名为必填，其余可空）：
 *   姓名 / 照片 / 地区 / 学科 / 头衔 / 简介 / 详细介绍(markdown)
 *   讲义截图(附件×n) / 家长反馈(附件×n) / 排序
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const BASE_TOKEN = process.env.TEACHERS_BASE_TOKEN || "UGaUbTRH3aft2usaNHBcZEc8nlc";
const TABLE_ID = process.env.TEACHERS_TABLE_ID || "tblItSn3RsQhqHwN";

const ROOT = path.resolve(__dirname, "../..");
const ASSET_DIR = path.join(ROOT, "blog", "assets", "teachers");
const OUTPUT_JSON = path.join(ROOT, "blog-data", "teachers.json");

const F = {
  name: "姓名",
  avatar: "照片",
  region: "地区",
  subjects: "学科",
  title: "头衔",
  intro: "简介",
  detail: "详细介绍",
  handout: "讲义截图",
  feedback: "家长反馈",
  order: "排序",
};

// 姓 → 拼音 slug（保证 URL 稳定、不暴露飞书 record_id）。
// 新增老师时在这里补一条；同名姓会追加数字后缀，见 slugFor()。
const SURNAME_PINYIN = {
  高: "gao",
  邓: "deng",
  崔: "cui",
  许: "xu",
  刘: "liu",
  邱: "qiu",
  李: "li",
  朴: "piao",
  佐藤: "sato",
  高桥: "takahashi",
  王: "wang",
  小: "xiao",
  石: "shi",
};

// 生成稳定 slug：优先取「姓」拼音，匹配不到就用全名拼音兜底 + 去空格
function slugFor(name, used) {
  const surname = name.replace(/\s+/g, "").slice(0, 1);
  let base = SURNAME_PINYIN[surname];
  if (!base) {
    base = name.replace(/\s+/g, "").toLowerCase();
  }
  let slug = base;
  let n = 2;
  while (used.has(slug)) {
    slug = base + n;
    n += 1;
  }
  used.add(slug);
  return slug;
}

function run(cmd) {
  return execSync(cmd, { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 });
}

function log(m) {
  console.log(m);
}
function warn(m) {
  console.log("\x1b[33m⚠️  " + m + "\x1b[0m");
}

/** 下载某条记录的一组附件到 assets/teachers/<relDir>/，返回相对 /blog/ 的 URL 数组；失败返回空数组 */
function downloadAttachments(recordId, cell, relDir) {
  const tokens = [];
  if (Array.isArray(cell)) {
    cell.forEach((item) => {
      if (typeof item === "string") tokens.push(item);
      else if (item && item.file_token) tokens.push(item.file_token);
    });
  } else if (typeof cell === "string" && cell) {
    tokens.push(cell);
  }
  if (!tokens.length) return [];

  const outDir = path.join(ASSET_DIR, relDir);
  fs.mkdirSync(outDir, { recursive: true });

  const urls = [];
  tokens.forEach((token, i) => {
    const attachName =
      Array.isArray(cell) && cell[i] && cell[i].name ? cell[i].name : `file-${i + 1}`;
    const ext = path.extname(attachName) || ".jpg";
    const localName = `${i + 1}${ext}`;
    try {
      run(
        `lark-cli base +record-download-attachment --base-token ${BASE_TOKEN} --table-id ${TABLE_ID} --record-id ${recordId} --file-token ${token} --output ${path.join(outDir, localName)} --overwrite --as user`
      );
      urls.push(`/blog/assets/teachers/${relDir}/${localName}`);
    } catch (e) {
      warn(`下载附件失败（record ${recordId} / ${relDir} / #${i + 1}）：${e.stderr || e.message}`);
    }
  });
  return urls;
}

async function main() {
  log("== 导入飞书讲师数据（博客体系） ==\n");

  log("① 读取讲师表记录…");
  const ndjsonPath = path.join(ROOT, ".workbuddy", "teachers-raw.ndjson");
  let raw;
  try {
    run(
      `lark-cli base +record-list --base-token ${BASE_TOKEN} --table-id ${TABLE_ID} --format ndjson --output ${ndjsonPath} --overwrite --as user`
    );
    raw = fs.readFileSync(ndjsonPath, "utf8");
  } catch (e) {
    console.error("❌ 读取记录失败：" + (e.stderr || e.message));
    process.exit(1);
  }

  // record_file 是逐行 ndjson：每行 { record_id, 字段名: 值, ... }
  const rows = [];
  raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      try {
        const obj = JSON.parse(line);
        if (obj && obj.record_id) rows.push(obj);
      } catch (_) {
        /* 忽略空行/异常行 */
      }
    });

  log(`   ${rows.length} 条记录\n`);

  if (!rows.length) {
    warn("表格暂无记录。请在飞书填入讲师数据后重跑。");
    process.exit(0);
  }

  fs.rmSync(ASSET_DIR, { recursive: true, force: true });
  fs.mkdirSync(ASSET_DIR, { recursive: true });

  const teachers = [];
  const usedSlugs = new Set();
  log("② 下载图片并组装数据…");

  rows.forEach((row, rowIdx) => {
    const get = (name) => (row[name] === undefined ? null : row[name]);
    const name = String(get(F.name) || "").trim();
    const recordId = row.record_id || `t${rowIdx + 1}`;
    if (!name) {
      warn(`第 ${rowIdx + 1} 行缺少姓名，已跳过`);
      return;
    }

    // 用姓拼音做稳定 slug；图片目录也按 slug 归位（不暴露 record_id）
    const slug = slugFor(name, usedSlugs);
    const assetBase = `${slug}`;

    const avatarUrls = downloadAttachments(recordId, get(F.avatar), assetBase + "/avatar");
    const handouts = downloadAttachments(recordId, get(F.handout), assetBase + "/handout");
    const feedbacks = downloadAttachments(recordId, get(F.feedback), assetBase + "/feedback");

    const regionCell = get(F.region);
    const subjectsCell = get(F.subjects);
    const detailRaw = String(get(F.detail) || "").trim();
    const order = Number(get(F.order)) || teachers.length + 1;

    teachers.push({
      id: slug,
      name,
      avatar: avatarUrls[0] || "",
      region: Array.isArray(regionCell) ? regionCell[0] || "" : String(regionCell || ""),
      subjects: Array.isArray(subjectsCell) ? subjectsCell : subjectsCell ? [subjectsCell] : [],
      title: String(get(F.title) || "").trim(),
      intro: String(get(F.intro) || "").trim(),
      /** 详细介绍 markdown；为空时用简介兜底 */
      detail: detailRaw,
      handouts,
      feedbacks,
      order,
    });

    log(
      `   ✓ ${name}（照片${avatarUrls.length ? "✓" : "缺"} / 讲义${handouts.length}张 / 反馈${feedbacks.length}条）`
    );
  });

  teachers.sort((a, b) => a.order - b.order);

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(
    OUTPUT_JSON,
    JSON.stringify({ generatedAt: new Date().toISOString(), teachers }, null, 2),
    "utf8"
  );

  log(`\n✅ 导入完成：${teachers.length} 位讲师`);
  log(`   数据：${path.relative(ROOT, OUTPUT_JSON)}`);
  log(`   图片：${path.relative(ROOT, ASSET_DIR)}/`);
  log("\n下一步：npm run build:blog 重新构建（讲师页与博客一起生成）。");
}

main().catch((e) => {
  console.error("❌ 导入异常：" + (e.stack || e.message));
  process.exit(1);
});
