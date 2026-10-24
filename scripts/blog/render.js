const MarkdownIt = require("markdown-it");
const katex = require("katex");

// 十个品类，覆盖小红书侧的八个选题标签 + 备考攻略 / 心理调节
// tag / cover 只能取 blog/assets 里已有的类：tag--green|orange|purple|teal，cover--blue|gray|green|orange|purple|teal
const CATEGORIES = [
  { code: "guide", name: "备考攻略", tag: "", cover: "blue" },
  { code: "japanese", name: "日语突破", tag: "tag--orange", cover: "blue" },
  { code: "math1", name: "文数技巧", tag: "tag--purple", cover: "purple" },
  { code: "math2", name: "理数技巧", tag: "tag--purple", cover: "purple" },
  { code: "bunso", name: "文综记忆", tag: "tag--green", cover: "green" },
  { code: "physics", name: "物理专题", tag: "tag--orange", cover: "orange" },
  { code: "chemistry", name: "化学专题", tag: "tag--orange", cover: "orange" },
  { code: "biology", name: "生物专题", tag: "tag--green", cover: "green" },
  { code: "mind", name: "心理调节", tag: "tag--teal", cover: "teal" },
  { code: "school", name: "院校申请", tag: "", cover: "gray" },
];

const HOME = "/#/pages/index/index";
const CTA_DEFAULT = "把本篇要点放进题库里练一遍，记忆效率翻倍。";

const catMap = new Map(CATEGORIES.map((c) => [c.code, c]));

function cat(code) {
  const c = catMap.get(code);
  if (!c) throw new Error(`未知分类 code: ${code}`);
  return c;
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cls(base, extra) {
  return extra ? base + " " + extra : base;
}

// 把多行片段缩进 n 空格，并前置换行，保证产出 HTML 可读
function indent(str, n) {
  const pad = " ".repeat(n);
  return "\n" + str
    .split("\n")
    .map((l) => (l.trim() ? pad + l : l))
    .join("\n");
}

/* ---------- Markdown 渲染（构建期产出纯 HTML，页面运行时不加载任何 JS） ---------- */

const md = new MarkdownIt({ html: true, linkify: false, typographer: false });

md.inline.ruler.before("escape", "math", function (state, silent) {
  const src = state.src;
  const pos = state.pos;
  if (src.charCodeAt(pos) !== 0x24) return false;

  const display = src.charCodeAt(pos + 1) === 0x24;
  const open = display ? "$$" : "$";
  const after = src[pos + open.length];
  if (!after || /\s/.test(after)) return false;

  const end = src.indexOf(open, pos + open.length);
  if (end < 0) return false;

  const content = src.slice(pos + open.length, end);
  if (!content.trim()) return false;
  if (!display && content.indexOf("\n") !== -1) return false;

  if (silent) return true;
  const token = state.push("math", "", 0);
  token.content = content;
  token.markup = open;
  state.pos = end + open.length;
  return true;
});

md.renderer.rules.math = function (tokens, idx) {
  return katex.renderToString(tokens[idx].content, {
    throwOnError: false,
    displayMode: tokens[idx].markup === "$$",
  });
};

// h2 自动编号成 #s1 #s2 …，同时收集右侧栏目录
md.core.ruler.push("toc_anchor", function (state) {
  const toc = [];
  let n = 0;
  state.tokens.forEach(function (token, i) {
    if (token.type !== "heading_open" || token.tag !== "h2") return;
    n += 1;
    token.attrSet("id", "s" + n);
    const inline = state.tokens[i + 1];
    toc.push({ id: "s" + n, text: inline && inline.type === "inline" ? inline.content : "" });
  });
  state.env.toc = toc;
});

function renderMarkdown(post) {
  const env = {};
  post.bodyHtml = md.render(post.body, env);
  post.toc = env.toc || [];
  post.hasMath = post.bodyHtml.indexOf('class="katex') > -1;
  return post;
}

/* ---------- 片段 ---------- */

const HEAD_TAIL = `</body>
</html>
`;

function header(prefix, active) {
  return `<header class="site-header">
  <div class="site-header__inner">
    <a class="brand" href="${HOME}">
      <span class="brand__logo">E</span>
      <span class="brand__name">EJU Pro</span>
    </a>
    <nav class="nav">
      <a class="nav__link" href="${HOME}">首页</a>
      <a class="nav__link${active === "index" ? " is-active" : ""}" href="${prefix}index.html">博客</a>
      <a class="nav__btn nav__btn--ghost" href="${HOME}">登录</a>
      <a class="nav__btn nav__btn--solid" href="/#/pages/register/index">注册</a>
    </nav>
  </div>
</header>`;
}

function footer(prefix) {
  return `<footer class="site-footer">
  <div>EJU Pro · 智能刷题平台</div>
  <div class="site-footer__line">
    <a href="${HOME}">首页</a>
    <a href="${prefix}index.html">博客</a>
  </div>
</footer>`;
}

function coverClass(post) {
  return "cover--" + (post.cover || cat(post.cat).cover);
}

function card(post, href, foot, attrs) {
  return `<a class="card" href="${href}"${attrs ? " " + attrs : ""}>
  <div class="cover ${coverClass(post)}"><span class="cover__glyph">${esc(post.glyph)}</span></div>
  <div class="card__body">
    <span class="${cls("tag", cat(post.cat).tag)}">${cat(post.cat).name}</span>
    <h3 class="card__title">${esc(post.title)}</h3>
    <p class="card__desc">${esc(post.summary)}</p>
    <div class="card__foot">${foot}<span class="card__more">阅读全文 ›</span></div>
  </div>
</a>`;
}

function sidePost(post) {
  return `<a class="side-post" href="${post.slug}.html">
  <div class="side-post__glyph ${coverClass(post)}">${esc(post.glyph)}</div>
  <div class="side-post__body">
    <div class="side-post__title">${esc(post.title)}</div>
    <div class="side-post__meta">${cat(post.cat).name} · ${post.minutes} 分钟</div>
  </div>
</a>`;
}

/* ---------- 文章详情页 ---------- */

const ARTICLE_SCRIPT = `<script>
  (function () {
    var bar = document.getElementById('readProgress');
    var toTop = document.getElementById('toTop');

    function onScroll() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      toTop.classList.toggle('is-show', h.scrollTop > 600);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    var links = Array.prototype.slice.call(document.querySelectorAll('#toc .toc__link'));
    var heads = links.map(function (a) {
      return document.getElementById(a.getAttribute('href').slice(1));
    });

    function highlight() {
      var pos = window.scrollY + 120;
      var idx = 0;
      for (var i = 0; i < heads.length; i++) {
        if (heads[i] && heads[i].offsetTop <= pos) idx = i;
      }
      links.forEach(function (a, i) { a.classList.toggle('is-active', i === idx); });
    }
    window.addEventListener('scroll', highlight, { passive: true });
    highlight();

    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var t = document.getElementById(a.getAttribute('href').slice(1));
        if (t) {
          e.preventDefault();
          window.scrollTo({ top: t.offsetTop - 80, behavior: 'smooth' });
        }
      });
    });
  })();
</script>`;

function renderArticle(post, res, opts) {
  const c = cat(post.cat);

  const tocCard = post.toc.length
    ? `<div class="aside__card">
  <div class="aside__head">本文目录</div>
  <ul class="toc__list" id="toc">
${post.toc.map((h) => `    <li><a class="toc__link" href="#${h.id}">${esc(h.text)}</a></li>`).join("\n")}
  </ul>
</div>`
    : "";

  const relatedCard = res.related.length
    ? `<div class="aside__card">
  <div class="aside__head">相关文章</div>${indent(res.related.map(sidePost).join("\n"), 2)}
</div>`
    : "";

  const hotCard = res.hot.length
    ? `<div class="aside__card">
  <div class="aside__head">热门文章</div>
${res.hot
  .map(
    (p, i) => `  <a class="hot-item" href="${p.slug}.html">
    <span class="hot-item__no">${i + 1}</span>
    <span class="hot-item__title">${esc(p.title)}</span>
  </a>`
  )
  .join("\n")}
</div>`
    : "";

  const cta = `<div class="cta">
  <div class="cta__title">⚡ 边读边练才记得牢</div>
  <div class="cta__desc">${esc(post.cta || CTA_DEFAULT)}</div>
  <a class="cta__btn" href="${HOME}">免费开始刷题 →</a>
</div>`;

  const recapSection = post.recap.length
    ? `
    <section class="recap">
      <div class="recap__head">📌 本文要点回顾</div>
      <ol class="recap__list">
${post.recap.map((t) => `        <li>${t}</li>`).join("\n")}
      </ol>
    </section>
`
    : "";

  const extendedSection = res.extended.length
    ? `
    <section class="related">
      <div class="related__head">延伸阅读</div>
      <div class="grid">${indent(
        res.extended.map((p) => card(p, p.slug + ".html", `<span>⏱ 约 ${p.minutes} 分钟</span>`)).join("\n"),
        6
      )}
      </div>
    </section>
`
    : "";

  const pagerItem = (p, kind) => {
    const label = kind === "prev" ? "‹ 上一篇" : "下一篇 ›";
    if (!p) {
      return `      <div class="pager__item pager__item--empty">
        <div class="pager__label">${label}</div>
        <div class="pager__title">${kind === "prev" ? "已是第一篇" : "已是最后一篇"}</div>
      </div>`;
    }
    const cls = kind === "prev" ? "pager__item" : "pager__item pager__item--next";
    return `      <a class="${cls}" href="${p.slug}.html">
        <div class="pager__label">${label}</div>
        <div class="pager__title">${esc(p.title)}</div>
      </a>`;
  };

  const katexCss = opts.math ? `\n<link rel="stylesheet" href="../assets/katex/katex.min.css">` : "";

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(post.title)} · EJU Pro 博客</title>
<meta name="description" content="${esc(post.summary)}">
<link rel="stylesheet" href="../assets/style.css">${katexCss}
</head>
<body>

<div class="read-progress" id="readProgress"></div>

${header("../", "article")}

<main class="article">
  <div class="container">
   <div class="article-layout">

    <div class="article-main">

    <div class="crumb">
      <a href="${HOME}">首页</a><span>/</span><a href="../index.html">博客</a><span>/</span>${c.name}
    </div>

    <span class="${cls("article__tag", c.tag)}">${c.name}</span>
    <h1 class="article__title">${esc(post.title)}</h1>
    <div class="article__meta">
      <span>📅 ${post.date}</span>
      <span>⏱ 约 ${post.minutes} 分钟</span>
      <span>👁 ${post.pv} 次阅读</span>
    </div>

    <article class="prose">
${post.bodyHtml.trimEnd()}
    </article>
${recapSection}${extendedSection}
    <nav class="pager">
${pagerItem(res.prev, "prev")}
${pagerItem(res.next, "next")}
    </nav>

    </div><!-- /article-main -->

    <aside class="aside">

${indent([tocCard, relatedCard, hotCard, cta].filter(Boolean).join("\n\n"), 6)}

    </aside>

   </div>
  </div>
</main>

<button class="to-top" id="toTop" type="button" aria-label="回到顶部">↑</button>

${ARTICLE_SCRIPT}

${footer("../")}

${HEAD_TAIL}`;
}

/* ---------- 列表页 ---------- */

const LIST_SCRIPT = `<script>
  (function () {
    var tabs = document.querySelectorAll('#tabs .tab');
    var cards = Array.prototype.slice.call(document.querySelectorAll('#grid .card'));
    var input = document.getElementById('q');
    var empty = document.getElementById('empty');
    var count = document.getElementById('count');
    var current = 'all';

    function apply() {
      var kw = (input.value || '').trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var okCat = current === 'all' || card.dataset.cat === current;
        var okKw = !kw || card.dataset.key.toLowerCase().indexOf(kw) > -1;
        var show = okCat && okKw;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      empty.style.display = visible ? 'none' : 'block';
      count.textContent = visible;
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        current = tab.dataset.cat;
        apply();
      });
    });

    input.addEventListener('input', apply);

    // 支持从首页/外链带分类进入，如 /blog/#数学技巧
    var hash = decodeURIComponent(location.hash.replace('#', ''));
    if (hash && hash !== 'all') {
      var target = Array.prototype.slice.call(tabs).filter(function (t) { return t.dataset.cat === hash; })[0];
      if (target) target.click();
    }
  })();
</script>`;

function renderList(posts) {
  const used = CATEGORIES.filter((c) => posts.some((p) => p.cat === c.code));

  const tabs = ['      <span class="tab is-active" data-cat="all">全部</span>']
    .concat(used.map((c) => `      <span class="tab" data-cat="${c.name}">${c.name}</span>`))
    .join("\n");

  const cards = posts
    .map((p) => {
      const attrs = `data-cat="${cat(p.cat).name}" data-key="${esc(
        [p.title].concat(p.keywords).join(" ")
      )}"`;
      return indent(card(p, "posts/" + p.slug + ".html", `<span>${p.date}</span>`, attrs), 6);
    })
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>备考博客 · EJU Pro</title>
<meta name="description" content="EJU 备考攻略、数学技巧、文综记忆、物理专题、心理调节与院校申请，全部为独立静态页。">
<link rel="stylesheet" href="assets/style.css">
</head>
<body>

${header("", "index")}

<section class="section">
  <div class="container">

    <div class="section__head">
      <h2 class="section__title">备考博客</h2>
      <p class="section__subtitle">共 <b id="count">${posts.length}</b> 篇文章 · 每篇均为独立静态页，秒开</p>
    </div>

    <div class="search">
      <span>🔍</span>
      <input id="q" type="text" placeholder="搜索标题或摘要，如「读解」「微积分」">
    </div>

    <div class="tabs" id="tabs">
${tabs}
    </div>

    <div class="grid" id="grid">
${cards}
    </div>

    <p id="empty" style="display:none;text-align:center;color:#86909c;padding:60px 0;">没有匹配的文章</p>

    <div class="pagination">
      <span class="page is-disabled">‹</span>
      <span class="page is-active">1</span>
      <span class="page is-disabled">›</span>
    </div>

  </div>
</section>

${footer("")}

${LIST_SCRIPT}

${HEAD_TAIL}`;
}

function renderSitemap(posts, siteUrl) {
  const urls = [
    `  <url><loc>${siteUrl}/blog/</loc><lastmod>${posts.length ? posts[0].updated : ""}</lastmod></url>`,
  ].concat(
    posts.map(
      (p) => `  <url><loc>${siteUrl}/blog/posts/${p.slug}.html</loc><lastmod>${p.updated}</lastmod></url>`
    )
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}

module.exports = { CATEGORIES, cat, renderMarkdown, renderArticle, renderList, renderSitemap, esc };
