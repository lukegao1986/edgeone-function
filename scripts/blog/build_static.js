#!/usr/bin/env node
// 博客生成器入口：blog-src/*.md → blog/*.html
// 全量覆盖 blog/index.html、blog/posts/、blog/sitemap.xml；blog/assets/ 不在清理范围内。
const fs = require("fs");
const path = require("path");

const { readSources } = require("./read_sources");
const { related, extended, hot, adjacent } = require("./rank");
const {
  renderMarkdown,
  renderArticle,
  renderList,
  renderSitemap,
  renderTeachersIndex,
  renderTeacherDetail,
  renderTeacherSitemap,
} = require("./render");

const ROOT = path.resolve(__dirname, "../..");
const BLOG_DIR = path.join(ROOT, "blog");
const POSTS_DIR = path.join(BLOG_DIR, "posts");
const TEACHERS_DIR = path.join(BLOG_DIR, "teachers");
const TEACHERS_JSON = path.join(ROOT, "blog-data", "teachers.json");
const KATEX_ASSETS = path.join(BLOG_DIR, "assets", "katex");
const SITE_URL = "https://eju-pro.site";
const KATEX_DIST = path.join(ROOT, "node_modules", "katex", "dist");

function clean() {
  fs.rmSync(POSTS_DIR, { recursive: true, force: true });
  fs.rmSync(path.join(BLOG_DIR, "index.html"), { force: true });
  fs.rmSync(path.join(BLOG_DIR, "sitemap.xml"), { force: true });
  fs.rmSync(TEACHERS_DIR, { recursive: true, force: true });
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.mkdirSync(TEACHERS_DIR, { recursive: true });
}

// KaTeX 只在确有公式的文章存在时才拷贝进 blog/assets/，避免无谓体积
function syncKatex() {
  fs.rmSync(KATEX_ASSETS, { recursive: true, force: true });
  fs.mkdirSync(path.join(KATEX_ASSETS, "fonts"), { recursive: true });

  fs.copyFileSync(path.join(KATEX_DIST, "katex.min.css"), path.join(KATEX_ASSETS, "katex.min.css"));

  const src = path.join(KATEX_DIST, "fonts");
  let n = 0;
  fs.readdirSync(src)
    .filter((f) => f.endsWith(".woff2"))
    .forEach((f) => {
      fs.copyFileSync(path.join(src, f), path.join(KATEX_ASSETS, "fonts", f));
      n += 1;
    });
  return n;
}

function build() {
  const posts = readSources().map(renderMarkdown);
  const needsKatex = posts.some((p) => p.hasMath);

  clean();

  posts.forEach((post) => {
    const html = renderArticle(
      post,
      Object.assign({}, adjacent(posts, post), {
        related: related(posts, post),
        extended: extended(posts, post),
        hot: hot(posts, post),
      }),
      { math: needsKatex }
    );
    fs.writeFileSync(path.join(POSTS_DIR, post.slug + ".html"), html, "utf8");
  });

  fs.writeFileSync(path.join(BLOG_DIR, "index.html"), renderList(posts), "utf8");

  // 讲师风采：blog-data/teachers.json 存在时生成 /blog/teachers/（一览 + 个人页）
  let teacherCount = 0;
  if (fs.existsSync(TEACHERS_JSON)) {
    const teachers = JSON.parse(fs.readFileSync(TEACHERS_JSON, "utf8")).teachers || [];
    if (teachers.length) {
      fs.writeFileSync(path.join(TEACHERS_DIR, "index.html"), renderTeachersIndex(teachers), "utf8");
      teachers.forEach((t) => {
        fs.writeFileSync(path.join(TEACHERS_DIR, t.id + ".html"), renderTeacherDetail(t, teachers), "utf8");
      });
      teacherCount = teachers.length;
    }
  }

  fs.writeFileSync(
    path.join(BLOG_DIR, "sitemap.xml"),
    fs.existsSync(TEACHERS_JSON) && teacherCount
      ? renderSitemap(posts, SITE_URL, JSON.parse(fs.readFileSync(TEACHERS_JSON, "utf8")).teachers)
      : renderSitemap(posts, SITE_URL),
    "utf8"
  );

  const fontCount = needsKatex ? syncKatex() : 0;

  console.log(`博客生成完成：${posts.length} 篇文章 + 1 个列表页`);
  if (teacherCount) console.log(`讲师页生成完成：${teacherCount} 位讲师 + 1 个一览页（blog/teachers/）`);
  console.log(`  产物  blog/index.html · blog/posts/*.html · blog/sitemap.xml`);
  console.log(`  KaTeX ${needsKatex ? `已启用（拷贝 ${fontCount} 个 woff2 字体）` : "未使用（本次无公式，已跳过）"}`);
}

build();
