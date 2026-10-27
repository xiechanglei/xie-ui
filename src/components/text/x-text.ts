/**
 * x-text —— 排版原子组件（基础分类）。
 *
 * 把「字号 / 字重 / 行高 / 颜色」收敛为一组语义角色（variant），内部全部消费设计令牌，
 * 因此随主题（深浅色、尺寸档位）实时联动。用于替代各组件内散落的标题 / 副标题 / 说明文字样式，
 * 避免每处各写各的 font-size/font-weight/color。
 *
 * 变体 variant：
 *  - title    区块主标题（lg + 600）
 *  - subtitle 次级标题（md + 500）
 *  - body     正文（默认，md + 400）
 *  - caption  次要说明（sm + muted）
 *  - muted    弱化正文（md + muted）
 *
 * inline：让宿主以行内盒排布（默认块级），便于嵌入句子中。
 * 定制：暴露 part="text"；字号/颜色已走令牌，一般无需覆盖。
 * 语义：这是「表现层」排版，不承担文档大纲语义；需要真正的 <h1>~<h6> 结构时请用语义标签。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import textStyles from './x-text.css?inline';

export type TextVariant = 'title' | 'subtitle' | 'body' | 'caption' | 'muted';

class XText extends XBaseElement {
  static tag = 'x-text';

  static properties: Record<string, PropertyOptions> = {
    variant: { type: 'String', reflect: true, default: 'body' },
    inline: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [textStyles];

  declare variant: TextVariant;
  declare inline: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<span class="text" part="text"><slot></slot></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-text': XText;
  }
}

export { XText };
export default define(XText);
