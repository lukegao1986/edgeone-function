import katex from 'katex';

const replaceSvgWithImg = (html: string) => {
  return html.replace(/<svg([\s\S]*?)>([\s\S]*?)<\/svg>/g, (match, p1, p2) => {
    const svgString = `<svg${p1}>${p2}</svg>`;
    // 使用 encodeURIComponent 转换为 data URI
    const encoded = encodeURIComponent(svgString).replace(/'/g, '%27').replace(/"/g, '%22');
    const heightMatch = p1.match(/height=(['"])(.*?)\1/);
    const h = heightMatch ? heightMatch[2] : '100%';

    // KaTeX 会为了根号顶部的横线生成极宽的 SVG (width="400em")
    // 我们强制设其宽度为 100%，让它自动填满 KaTeX 预先分配的占位容器。
    // 但是小程序的 <image> 组件默认有图片宽高比和 display 属性的影响，
    // 我们必须加上 position: absolute; top: 0; left: 0; 以防止它挤占文档流，导致后续公式（如等号）发生重叠或被挤压。
    return `<img src="data:image/svg+xml;charset=utf-8,${encoded}" style="width:100%; height:${h}; position:absolute; top:0; left:0; display:block;" />`;
  });
};

/**
 * 简易 Markdown 解析，支持图片、换行以及 LaTeX 公式
 * @param text 待解析文本
 * @returns 解析后的 HTML 字符串
 */
export const renderMarkdown = (text: string) => {
  if (!text) return '';
  
  let html = text;

  // 1. 处理块级公式 $$ ... $$
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) => {
    try {
      const rendered = katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false });
      return `<div class="katex-display">${replaceSvgWithImg(rendered)}</div>`;
    } catch (e) {
      return formula;
    }
  });

  // 2. 处理行内公式 $ ... $
  html = html.replace(/\$(.*?)\$/g, (_, formula) => {
    try {
      const rendered = katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false });
      return replaceSvgWithImg(rendered);
    } catch (e) {
      return formula;
    }
  });

  // 3. 处理图片
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 10px 0; display: block; border-radius: 8px;" />');
  
  // 4. 处理表格样式 (微信小程序 RichText 默认不支持完整的表格 CSS，需要内联注入样式)
  html = html.replace(/<table>/g, '<table style="border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 14px; text-align: center;">');
  html = html.replace(/<th>/g, '<th style="border: 1px solid #e8e8e8; padding: 8px; background-color: #f5f6fa; font-weight: 600; color: #333;">');
  html = html.replace(/<td>/g, '<td style="border: 1px solid #e8e8e8; padding: 8px; color: #666;">');

  // 5. 处理换行
  html = html.replace(/\n/g, '<br/>');

  return `<div style="line-height: 1.6;">${html}</div>`;
};
