/**
 * x-dropdown-content —— 下拉菜单行容器（反馈分类，x-dropdown 的配套部件）。
 *
 * 把菜单行归组成一个元素：行不再与触发件平铺成兄弟，DOM 树上一眼分清「谁触发、谁是被选的菜单」。
 * 组件知道自己是该进 dropdown 面板的——连接时没写 slot 就自动挂 slot="content"，
 * 消费者连魔法字符串都不用记。内部默认纵向排列、逐行铺满（:host flex column + stretch）。
 *
 * 行结构仍不预设：直接子元素放任意可点元素（x-button、hr、分组标题…）。
 * 纯容器不带行为：点行判定、`x-select` 派发与收起都由宿主 x-dropdown（x-popover 基类）负责；
 * 届时的 `detail.item` 是被点的行（本组件的直接子元素），不是本容器。
 *
 * 兼容：不裹本容器、直接把多个元素挂 `slot="content"` 的轻量写法同样有效（面板侧 .content 也默认纵排）。
 */

import { XBaseElement, html, define, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import contentStyles from './x-dropdown-content.css?inline';

class XDropdownContent extends XBaseElement {
  static tag = 'x-dropdown-content';
  static styles = [contentStyles];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  /** 没指定 slot 就自己声明进宿主的面板槽（宿主是 popover 时同语义：content 即面板内容） */
  connectedCallback(): void {
    if (!this.hasAttribute('slot')) this.setAttribute('slot', 'content');
    super.connectedCallback();
  }

  protected render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-dropdown-content': XDropdownContent;
  }
}

export { XDropdownContent };
export default define(XDropdownContent);
