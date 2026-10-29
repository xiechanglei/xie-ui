/**
 * x-accordion —— 折叠面板根容器（导航分类）。
 *
 * 包裹若干 <x-accordion-item>，协调「单开互斥」：某项展开时自动收起其余（`multiple` 打开后可同时展开多项）。
 * 单项的展开收起、动画都由 x-accordion-item 自理；本组件只在用户切换后收拢旁项，并派发公开的 `x-change`。
 * 程序化改 item.expanded（非用户点击）不经过内部事件，不会触发互斥收拢，也不派发 x-change。
 *
 * 属性：
 *  - multiple 允许多项同时展开（反射）：缺省 false = 手风琴单开
 *
 * 事件：
 *  - x-change 用户切换某项后派发（bubbles+composed），detail:{ value, expanded, values }
 *    —— value/expanded 是本次被操作的项，values 是当下所有展开项的 value 列表
 *
 * 用法：
 *  <x-accordion>
 *    <x-accordion-item value="a" label="问题一" expanded>内容…</x-accordion-item>
 *    <x-accordion-item value="b" label="问题二">内容…</x-accordion-item>
 *  </x-accordion>
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import './x-accordion-item.js';
import accordionStyles from './x-accordion.css?inline';

/** 结构型引用，避免跨模块循环依赖 */
interface ItemLike extends HTMLElement {
  value: string;
  expanded: boolean;
  toggle(force?: boolean, fromUser?: boolean): void;
}

class XAccordion extends XBaseElement {
  static tag = 'x-accordion';

  static properties: Record<string, PropertyOptions> = {
    multiple: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [accordionStyles];

  declare multiple: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="accordion" part="accordion" role="presentation"><slot></slot></div>`;
  }

  protected firstUpdated(): void {
    this.addEventListener('x-accordion-item-toggle', this.__onItemToggle as EventListener);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('x-accordion-item-toggle', this.__onItemToggle as EventListener);
    super.disconnectedCallback();
  }

  /** 当前所有展开项的 value 列表 */
  getValues(): string[] {
    return this.__items()
      .filter((i) => i.expanded)
      .map((i) => i.value);
  }

  private __items(): ItemLike[] {
    return Array.from(this.querySelectorAll<ItemLike>('x-accordion-item'));
  }

  private __onItemToggle = (event: CustomEvent<{ value: string; expanded: boolean }>): void => {
    event.stopPropagation();
    const source = event.target as ItemLike;
    // 单开模式：某项被展开 → 收起其余（内部调用 fromUser=false，避免再触发本事件成环）
    if (!this.multiple && event.detail.expanded) {
      for (const item of this.__items()) {
        if (item !== source && item.expanded) item.toggle(false, false);
      }
    }
    this.dispatchEvent(
      new CustomEvent('x-change', {
        bubbles: true,
        composed: true,
        detail: { value: event.detail.value, expanded: event.detail.expanded, values: this.getValues() },
      }),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'x-accordion': XAccordion;
  }
}

export { XAccordion };
export default define(XAccordion);
