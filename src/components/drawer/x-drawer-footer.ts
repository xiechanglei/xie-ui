/**
 * x-drawer-footer —— 抽屉底部操作区（配合 x-drawer 使用）。
 *
 * 内容走默认插槽，右对齐并贴底；与内容之间不设分隔线。作为 x-drawer 的直接子元素，固定底部不参与滚动。
 *
 * 本类同时是对话框底部的基座：x-dialog-footer 直接继承本类、只改 tag，DOM/CSS 不再重复一份。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import footerStyles from './x-drawer-footer.css?inline';

class XDrawerFooter extends XBaseElement {
  static tag = 'x-drawer-footer';

  static properties: Record<string, PropertyOptions> = {};

  static styles = [footerStyles];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-drawer-footer': XDrawerFooter;
  }
}

export { XDrawerFooter };
export default define(XDrawerFooter);
