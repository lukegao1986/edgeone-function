/* ============================================================
   EJU Pro 封面模板 · 共享渲染助手
   由 render_covers.js 以 <script> 内联注入，禁止被模板直接引用路径
   暴露：window.EJU（B / esc / autofit / lines / finish）
   ============================================================ */
(function () {
  'use strict';

  var B = window.__BRIEF__ || {};

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** 取变量，缺省回退 */
  function pick(key, fallback) {
    var v = B[key];
    if (v == null || v === '') return fallback;
    return v;
  }

  /** 把文本切成行数组：优先按显式换行符 / | 切，其次按字数均分 */
  function lines(text, maxPerLine) {
    var raw = String(text == null ? '' : text).trim();
    if (!raw) return [];
    if (raw.indexOf('\n') >= 0) return raw.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    if (raw.indexOf('|') >= 0) return raw.split('|').map(function (s) { return s.trim(); }).filter(Boolean);
    var n = maxPerLine || 12;
    var out = [];
    for (var i = 0; i < raw.length; i += n) out.push(raw.slice(i, i + n));
    return out;
  }

  /**
   * 自动缩字号：在不超出容器宽高的前提下尽量大
   * @param {HTMLElement} el
   * @param {number} max  起始字号 px
   * @param {number} min  最小字号 px
   * @param {number} boxW 容器宽（默认父元素宽）
   * @param {number} boxH 容器高（默认父元素高）
   */
  function autofit(el, max, min, boxW, boxH) {
    var parent = el.parentElement;
    var w = boxW || parent.clientWidth;
    var h = boxH || parent.clientHeight;
    var size = max;
    el.style.fontSize = size + 'px';
    var guard = 0;
    while (size > min && (el.scrollWidth > w + 2 || el.scrollHeight > h + 2) && guard++ < 60) {
      size -= Math.max(2, Math.round(size * 0.04));
      el.style.fontSize = size + 'px';
    }
    return size;
  }

  /** 绑定顶部品牌条（所有模板统一） */
  function mountBar() {
    var catWord = pick('categoryWord', '');
    var el = document.querySelector('[data-bind="bar-cat"]');
    if (el) el.textContent = catWord || '';
  }

  /** 绑定底部钩子行 */
  function mountHook() {
    var el = document.querySelector('[data-bind="hook"]');
    if (el) el.textContent = pick('hook', '完整版见主页');
  }

  /** 渲染完成：render_covers.js 等这个标记再截图 */
  function finish() {
    document.body.dataset.ready = '1';
  }

  window.EJU = {
    B: B, esc: esc, pick: pick, lines: lines,
    autofit: autofit, mountBar: mountBar, mountHook: mountHook, finish: finish
  };
})();
