/**
 * x-menu-item —— 菜单项（叶子），导航菜单分类。
 *
 * 整行可点击，基于原生 <button role="menuitem">，天然可 Tab 聚焦、Enter/Space 触发。
 * `disabled` 控制是否可点击（如"规划中"项）；`active`（反射）为选中态；`note` 为右侧备注，
 * 也可用 slot="note" 放自定义徽标；slot="icon" 放图标（缺省不占位）。
 * 点击（未禁用时）向上冒泡内部事件 `x-menu-item-activate`，由祖先 <x-menu> 统一协调单选。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import menuItemStyles from './x-menu-item.css?inline';

class XMenuItem extends XBaseElement {
  static tag = 'x-menu-item';

  static properties: Record<string, PropertyOptions> = {
    value: { type: 'String', reflect: true, default: '' },
    note: { type: 'String', default: '' },
    disabled: { type: 'Boolean', reflect: true, default: false },
    active: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [menuItemStyles];

  declare value: string;
  declare note: string;
  declare disabled: boolean;
  declare active: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<button
      class="base"
      part="base"
      type="button"
      role="menuitem"
      disabled=${this.derive(() => this.disabled)}
      aria-current=${this.derive(() => (this.active ? 'page' : undefined))}
    ><slot name="icon"></slot><span class="label" part="label"><slot></slot></span><span class="note" part="note">${this.derive(() => this.note)}<slot name="note"></slot></span></button>`;
  }

  protected firstUpdated(): void {
    this.shadowRoot!.querySelector('.base')!.addEventListener('click', this.__onClick);
  }

  override disconnectedCallback(): void {
    const base = this.shadowRoot?.querySelector('.base');
    if (base) base.removeEventListener('click', this.__onClick);
    super.disconnectedCallback();
  }

  /** 未禁用时冒泡内部激活事件（不 composed，仅在同一 light DOM 树内由 x-menu 接住） */
  private __onClick = (): void => {
    if (this.disabled) return;
    this.dispatchEvent(
      new CustomEvent('x-menu-item-activate', { bubbles: true, detail: { value: this.value } }),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'x-menu-item': XMenuItem;
  }
}

export { XMenuItem };
export default define(XMenuItem);
