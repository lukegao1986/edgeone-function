// 纯函数：输入文章数组，输出文章数组。迁移 CMS 时本文件可原样复用。
// cat 一律为分类 code；date 为 "YYYY-MM-DD" 字符串，可直接比较。

function overlap(a, b) {
  const set = new Set(b || []);
  return (a || []).filter((k) => set.has(k)).length;
}

// 内容相似度排序：同分类 +3，再累加关键词重合数；同分按日期倒序
function rankRelated(posts, me) {
  return posts
    .filter((p) => p.slug !== me.slug)
    .map((p) => ({ p, s: (p.cat === me.cat ? 3 : 0) + overlap(me.keywords, p.keywords) }))
    .sort((a, b) => b.s - a.s || (a.p.date < b.p.date ? 1 : -1))
    .map((x) => x.p);
}

// ① 相关文章：取第 1-3 名（右侧栏）
function related(posts, me, n = 3) {
  return rankRelated(posts, me).slice(0, n);
}

// ② 延伸阅读：取第 4-6 名（底部），与①不重复
function extended(posts, me, n = 3) {
  return rankRelated(posts, me).slice(n, n * 2);
}

// ③ 热门文章：PV 降序，PV 相同看 UV（与①完全独立）
function hot(posts, me, n = 5) {
  return posts
    .filter((p) => p.slug !== me.slug)
    .sort((a, b) => b.pv - a.pv || b.uv - a.uv)
    .slice(0, n);
}

// ④ 上下篇：按日期倒序取相邻下标，删文自动串联，永不死链
function adjacent(posts, me) {
  const ordered = posts.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const idx = ordered.findIndex((p) => p.slug === me.slug);
  return {
    prev: idx > 0 ? ordered[idx - 1] : null,
    next: idx > -1 && idx < ordered.length - 1 ? ordered[idx + 1] : null,
  };
}

module.exports = { related, extended, hot, adjacent, rankRelated };
