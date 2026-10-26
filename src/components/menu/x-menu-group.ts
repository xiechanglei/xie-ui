/**
 * x-menu-group —— 菜单分组（分类 / 子菜单），导航菜单分类。
 *
 * 头部是分组标签（`label` + 可选 slot="icon"），`collapsible`（默认 false，需显式开启）时可点击折叠，
 * `collapsed`（反射）驱动 grid 0fr↔1fr 高度自适应动画；内容通过默认插槽承载，可再嵌套 x-menu-group 形成子菜单。
 * 折叠切换时派发 `x-toggle`（detail:{ collapsed }），供外部持久化折叠状态。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
// 依赖图标组件（副作用注册 x-icon）：折叠指示箭头统一取自内置图标注册表
import '../icon/x-icon.js';
import menuGroupStyles from './x-menu-group.css?inline';

class XMenuGroup extends XBaseElement {
  static tag = 'x-menu-group';

  static properties: Record<string, PropertyOptions> = {
    label: { type: 'String', default: '' },
    collapsible: { type: 'Boolean', reflect: true, default: false },
    collapsed: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [menuGroupStyles];

  declare label: string;
  declare collapsible: boolean;
  declare collapsed: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="group" part="group">
      <button
        class="header"
        part="header"
        type="button"
        aria-expanded=${this.derive(() => (this.collapsible ? String(!this.collapsed) : undefined))}
        tabindex=${this.derive(() => (this.collapsible ? undefined : '-1'))}
      ><slot name="icon"></slot><span class="h-label" part="label">${this.derive(() => this.label)}</span><span class="chevron" part="indicator" aria-hidden="true"><x-icon name="chevron-right"></x-icon></span></button>
      <div class="content" part="content"><div class="content-inner" part="content-inner"><slot></slot></div></div>
    </div>`;
  }

  protected firstUpdated(): void {
    this.shadowRoot!.querySelector('.header')!.addEventListener('click', this.__onHeader);
  }

  override disconnectedCallback(): void {
    const header = this.shadowRoot?.querySelector('.header');
    if (header) header.removeEventListener('click', this.__onHeader);
    super.disconnectedCallback();
  }

  /** 展开 / 收起（仅可折叠时生效） */
  toggle(force?: boolean): void {
    if (!this.collapsible) return;
    this.collapsed = force ?? !this.collapsed;
    this.dispatchEvent(
      new CustomEvent('x-toggle', { bubbles: true, composed: true, detail: { collapsed: this.collapsed } }),
    );
  }

  private __onHeader = (): void => {
    this.toggle();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'x-menu-group': XMenuGroup;
  }
}

export { XMenuGroup };
export default define(XMenuGroup);
