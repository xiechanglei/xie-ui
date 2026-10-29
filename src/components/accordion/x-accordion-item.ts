/**
 * x-accordion-item —— 折叠面板单项（导航分类，x-accordion 的配套件）。
 *
 * 一块「标题栏 + 可折叠内容」：默认插槽放内容，`expanded`（反射）驱动 grid 0fr↔1fr 高度自适应展开/收起。
 * 标题区两段式：`label` 属性是快捷路径（单行文本，内置省略号）；复杂标题（多行/徽标/右侧状态等任意呈现）
 * 直接放 `slot="header"`——light DOM 由使用者自控样式（图标也在内容里自己摆），组件只保证它占满弹性区，插槽优先于 label。
 * 独立可用（自己管 expanded）；放进 x-accordion 时，单开互斥、公开 x-change 由根容器协调——
 * 本件只在被点时上抛内部事件，不自行决定别项的收放。
 *
 * 属性：
 *  - value    关联键（反射）：供 x-accordion 协调与 x-change 回报；缺省用序号
 *  - label    标题文本（不反射）：快捷路径；被 slot="header" 内容覆盖
 *  - expanded 展开态（反射）：true 内容展开；x-accordion 单开模式下由根回写
 *  - disabled 禁用（反射）：标题栏不可点
 *
 * 无障碍：标题栏 role=button + aria-expanded，内容区 role=region。定制：暴露 part="header" / "content"。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import '../icon/x-icon.js';
import itemStyles from './x-accordion-item.css?inline';

class XAccordionItem extends XBaseElement {
  static tag = 'x-accordion-item';

  static properties: Record<string, PropertyOptions> = {
    value: { type: 'String', reflect: true, default: '' },
    label: { type: 'String', default: '' },
    expanded: { type: 'Boolean', reflect: true, default: false },
    disabled: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [itemStyles];

  declare value: string;
  declare label: string;
  declare expanded: boolean;
  declare disabled: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="item" part="item">
      <button
        class="header"
        part="header"
        type="button"
        aria-expanded=${this.derive(() => String(this.expanded))}
        aria-disabled=${this.derive(() => (this.disabled ? 'true' : undefined))}
        disabled=${this.derive(() => this.disabled)}
      ><span class="h-main" part="main"><slot name="header"><span class="preset">${this.derive(() => this.label)}</span></slot></span><span class="chevron" part="indicator" aria-hidden="true"><x-icon name="chevron-right"></x-icon></span></button>
      <div class="content" part="content"><div class="content-inner" part="content-inner" role="region"><div class="content-body"><slot></slot></div></div></div>
    </div>`;
  }

  protected firstUpdated(): void {
    this.shadowRoot!.querySelector<HTMLButtonElement>('.header')!.addEventListener('click', this.__onHeader);
  }

  override disconnectedCallback(): void {
    this.shadowRoot?.querySelector('.header')?.removeEventListener('click', this.__onHeader);
    super.disconnectedCallback();
  }

  /** 展开 / 收起（force 可强制指定）；禁用时忽略。用户主动切换才上抛内部事件 */
  toggle(force?: boolean, fromUser = true): void {
    if (this.disabled) return;
    const next = force ?? !this.expanded;
    if (next === this.expanded) return;
    this.expanded = next;
    if (fromUser) {
      // 内部协调事件：bubbles 不 composed——只在 light DOM 链上被父 x-accordion 接住
      this.dispatchEvent(
        new CustomEvent('x-accordion-item-toggle', {
          bubbles: true,
          detail: { value: this.value, expanded: this.expanded },
        }),
      );
    }
  }

  private __onHeader = (): void => {
    this.toggle(undefined, true);
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'x-accordion-item': XAccordionItem;
  }
}

export { XAccordionItem };
export default define(XAccordionItem);
