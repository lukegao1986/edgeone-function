/**
 * 路径与常量：所有 contentops 脚本共用
 * ROOT 固定为项目根（scripts/contentops 的上两级）
 */
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..', '..', '..');

const P = {
  ROOT,
  CONTENT_OPS: path.join(ROOT, 'content-ops'),
  PACKAGES: path.join(ROOT, 'content-ops', 'packages'),
  TEMPLATES: path.join(ROOT, 'content-ops', 'templates'),
  SOURCES: path.join(ROOT, 'content-ops', 'sources'),
  DATA: path.join(ROOT, 'content-ops', 'data'),
  REGISTRY: path.join(ROOT, 'content-ops', 'templates', 'registry.json'),
  BLOG_SRC: path.join(ROOT, 'blog-src'),
  BLOG_BUILD: path.join(ROOT, 'scripts', 'blog', 'build_static.js'),
};

/** 内容包目录 */
function packageDir(topicId) {
  return path.join(P.PACKAGES, topicId);
}

/** 内容包内的标准文件名 */
function pkgFile(topicId, name) {
  return path.join(packageDir(topicId), name);
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJSON(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
}

function exists(file) {
  return fs.existsSync(file);
}

/** 列出所有内容包（目录名即 topicId） */
function listPackages() {
  if (!fs.existsSync(P.PACKAGES)) return [];
  return fs.readdirSync(P.PACKAGES, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

module.exports = { P, packageDir, pkgFile, readJSON, writeJSON, exists, listPackages };
