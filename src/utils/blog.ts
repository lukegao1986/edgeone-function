// 博客为纯 Web 静态站（构建期烘焙，页面零渲染 JS）。
// 首期只对 H5 开放：小程序无法直接跳转站内 HTML，需配置业务域名走 web-view，投入产出比低。
// 编译期 process.env.TARO_ENV 被 Taro 替换为字面量，小程序端该分支恒为 false（已被证实会内联成 !1）。
export const BLOG_ENABLED = process.env.TARO_ENV === 'h5';

export function openBlog(slug?: string) {
  if (!BLOG_ENABLED) return;
  window.location.href = slug ? `/blog/posts/${slug}.html` : '/blog/';
}
