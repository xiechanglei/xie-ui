// 代码高亮：只用 highlight.js 做分词并打 hljs-* class，颜色交给 docs.css 里随主题切换的令牌，
// 不引入任何 hljs 主题 CSS（避免给代码面板强加固定底色）。按需登记 xml(含 HTML) 与 javascript，控制产物体积。
import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('xml', xml);
hljs.registerLanguage('javascript', javascript);

/** 已知语言高亮，返回带 hljs-* span 的 HTML 片段字符串 */
export function highlight(code: string, lang: 'xml' | 'javascript'): string {
  return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
}

/** 未知语言：在 xml / javascript 子集内自动识别 */
export function highlightAuto(code: string): string {
  return hljs.highlightAuto(code, ['xml', 'javascript']).value;
}
