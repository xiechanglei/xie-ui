/**
 * x-breadcrumb —— 面包屑路径根容器（导航分类）。
 *
 * 包裹若干 <x-breadcrumb-item>（light DOM 默认插槽），本件只做协调三件事：
 *  1) 单源下沉 `separator` 给各项，并把末项标为当前页（current）；
 *  2) 按 `max-items` 收纳过长路径：首项与末项恒在，中间折成「…」挂到第一个被折叠项上，
 *     点「…」展开全部并派发 x-toggle；
 *  3) 提供 <nav> 地标与 role=list 列表语义（各项由 x-breadcrumb-item 自补 role=listitem）。
 * 项的链接渲染与 x-select 派发都由 x-breadcrumb-item 负责，本件不拦不转发。
 *
 * 属性：
 *  - separator  分隔符形态 'slash' | 'chevron' | 'none'（反射，扇出给各项；chevron 吃内部图标）
 *  - size       'sm' | 'md' | 'lg'（反射）：只下发字号与间距，不改格内结构
 *  - max-items  最多显示几格**真实路径**（反射，0/不写 = 不限；「…」不占格）。至少能合并两项才折——
 *               只藏一项反而多出一个「…」；末项是当前页，永不进折叠区
 *  - collapsed  折叠态（反射，默认 true）：仅与 max-items 配合有意义，置 false 即展开。
 *               布尔属性除「写了即 true」也认字面量假值 collapsed="false"，等价于 el.collapsed = false
 *  - label      <nav> 的无障碍名（缺省「面包屑」）
 *
 * 事件：
 *  - x-toggle  点「…」展开时派发（bubbles+composed），detail:{ collapsed: false }
 *
 * 方法：expand() 命令式展开全部（不派发 x-toggle，避免与外部状态回环）。
 * 定制：暴露 part="nav" / "list"。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import './x-breadcrumb-item.js';
import breadcrumbStyles from './x-breadcrumb.css?inline';

/** 结构型引用，避免跨模块循环依赖 */
interface ItemLike extends HTMLElement {
  separator: string;
  current: boolean;
  ellipsis: boolean;
}

class XBreadcrumb extends XBaseElement {
  static tag = 'x-breadcrumb';

  static properties: Record<string, PropertyOptions> = {
    separator: { type: 'String', reflect: true, default: 'slash' },
    size: { type: 'String', reflect: true, default: 'md' },
    maxItems: { type: 'Number', reflect: true, default: 0 },
    collapsed: { type: 'Boolean', reflect: true, default: true },
    label: { type: 'String', default: '面包屑' },
  };

  static styles = [breadcrumbStyles];

  declare separator: string;
  declare size: string;
  declare maxItems: number;
  declare collapsed: boolean;
  declare label: string;

  /** 本件压过 hidden 的项（撤销时只撤自己设过的，不动宿主自己写的 hidden） */
  private __folded: ItemLike[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<nav class="nav" part="nav" aria-label=${this.derive(() => this.label || '面包屑')}><div class="list" part="list" role="list"><slot></slot></div></nav>`;
  }

  protected firstUpdated(): void {
    this.addEventListener('x-breadcrumb-expand', this.__onExpand as EventListener);
    // 初次与动态增删都靠 slotchange 协调（静态解析时子件升级晚于本件，微任务读不到）
    this.shadowRoot!.querySelector('slot')!.addEventListener('slotchange', this.__onSlotChange);
    this.__sync();
  }

  protected override updated(): void {
    this.__sync();
  }

  override disconnectedCallback(): void {
    this.removeEventListener('x-breadcrumb-expand', this.__onExpand as EventListener);
    this.shadowRoot?.querySelector('slot')?.removeEventListener('slotchange', this.__onSlotChange);
    super.disconnectedCallback();
  }

  /** 命令式展开全部（不派发事件） */
  expand(): void {
    this.collapsed = false;
    this.__sync();
  }

  private __onSlotChange = (): void => {
    this.__sync();
  };

  private __onExpand = (event: Event): void => {
    event.stopPropagation();
    if (!this.collapsed) return;
    this.collapsed = false;
    this.__sync();
    this.dispatchEvent(new CustomEvent('x-toggle', { bubbles: true, composed: true, detail: { collapsed: false } }));
  };

  private __items(): ItemLike[] {
    return Array.from(this.querySelectorAll<ItemLike>('x-breadcrumb-item'));
  }

  /** 回写分隔符/当前页，并按 max-items 收纳前段（幂等：每轮先撤销上一轮压下的 hidden） */
  private __sync(): void {
    const items = this.__items();
    if (!items.length) return;
    for (const el of this.__folded) el.hidden = false;
    this.__folded = [];

    const count = items.length;
    const n = Number.isFinite(this.maxItems) ? Math.trunc(this.maxItems) : 0;
    // 折叠区 = 下标 1..foldEnd：下标 1 变身「…」，其余真藏；可见真实格数 = count - foldEnd
    const fold = this.collapsed && n >= 1 && count - n >= 2;
    const foldEnd = fold ? Math.min(count - n, count - 2) : -1;
    for (let i = 0; i < count; i++) {
      const el = items[i];
      el.separator = this.separator || 'slash';
      el.ellipsis = fold && i === 1;
      el.current = i === count - 1;
      if (fold && i > 1 && i <= foldEnd) {
        el.hidden = true;
        this.__folded.push(el);
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-breadcrumb': XBreadcrumb;
  }
}

export { XBreadcrumb };
export default define(XBreadcrumb);
