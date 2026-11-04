/**
 * x-carousel-item —— 轮播的一屏（x-carousel 的配套部件）。
 *
 * 纯占位盒：自己声明「占满一幅宽 + snap 吸附起点」（flex:0 0 100%），轨道无需父件下发样式。
 * 内容随便放（图、排版、x-box 卡片均可）；高度由轨道 stretch 对齐，或张内内容自然撑开。
 * aria（role=group / 「第 n 张，共 m 张」）由 x-carousel 统一回写，本件不设属性。
 * 定制：暴露 part="base"。
 */

import { XBaseElement, html, define, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import itemStyles from './x-carousel-item.css?inline';

class XCarouselItem extends XBaseElement {
  static tag = 'x-carousel-item';

  static styles = [itemStyles];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="base" part="base"><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-carousel-item': XCarouselItem;
  }
}

export { XCarouselItem };
export default define(XCarouselItem);
