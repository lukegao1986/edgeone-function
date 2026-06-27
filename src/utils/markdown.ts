import katex from 'katex';
import 'katex/dist/katex.min.css';

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
      return `<div class="katex-display">${katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch (e) {
      return formula;
    }
  });

  // 2. 处理行内公式 $ ... $
  html = html.replace(/\$(.*?)\$/g, (_, formula) => {
    try {
      return katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false });
    } catch (e) {
      return formula;
    }
  });

  // 3. 处理图片
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 10px 0; display: block; border-radius: 8px;" />');
  
  // 4. 处理换行
  html = html.replace(/\n/g, '<br/>');

  return `<div style="line-height: 1.6;">${html}</div>`;
};
