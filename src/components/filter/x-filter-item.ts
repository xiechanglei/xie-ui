/**
 * x-filter-item —— 筛选器选项（表单分类）。
 *
 * 一枚 chip 按钮（内容走默认插槽），选中/折叠态由父 x-filter 单源驱动：
 *  - `active`（反射）：选中；
 *  - `collapsed`（filter 直接 toggleAttribute）：其它项被选中时横向折叠退场——
 *    宿主是 display:grid 单轨，`grid-template-columns: 1fr→0fr` 配合 opacity/margin 过渡
 *    （x-menu-group 高度折叠同款的横向版），退场不占位。
 * 折叠项由 filter 同时挂 `inert`（不可聚焦不可点），CSS 再兜一层 pointer-events。
 *
 * 观感直接复用 x-button：未选 soft（淡底）、选中 solid（accent 填充），color/size/disabled 透传，
 * 本组件只负责「折叠动画 + 值」，不再自绘 chip。不带 value 时以文本内容作值（由 filter 读取）。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import '../button/x-button.js'; // 副作用注册 x-button（chip 观感复用）
import itemStyles from './x-filter-item.css?inline';

class XFilterItem extends XBaseElement {
  static tag = 'x-filter-item';

  static properties: Record<string, PropertyOptions> = {
    value: { type: 'String', default: '' },
    active: { type: 'Boolean', reflect: true, default: false },
    disabled: { type: 'Boolean', reflect: true, default: false },
    color: { type: 'String', reflect: true, default: 'primary' },
    size: { type: 'String', reflect: true, default: 'md' },
  };

  static styles = [itemStyles];

  declare value: string;
  declare active: boolean;
  declare disabled: boolean;
  declare color: string;
  declare size: string;

  // 必须显式挂 shadow：基座渲染目标是 shadowRoot ?? this，缺失会毁掉宿主子树
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<x-button
      class="chip"
      part="chip"
      variant=${this.derive(() => (this.active ? 'solid' : 'soft'))}
      color=${this.derive(() => this.color)}
      size=${this.derive(() => this.size)}
      disabled=${this.derive(() => this.disabled)}
      aria-pressed=${this.derive(() => String(this.active))}
    ><slot></slot></x-button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-filter-item': XFilterItem;
  }
}

export { XFilterItem };
export default define(XFilterItem);
