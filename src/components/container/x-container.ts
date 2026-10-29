/**
 * x-container —— 应用外壳 / 布局容器（布局分类）。
 *
 * 面向后台常见的「侧栏 + 内容」骨架：可选 header、sidebar 侧栏、默认（主内容）、可选 footer。
 * 侧栏可折叠为窄栏（rail 轨道态）。rail 是唯一数据源：容器在切换时把 rail 下沉给子树里的
 * x-logo 与 x-menu（它们各自再响应 / 扇出），全链路用「反射布尔属性 + :host([rail]) CSS」，
 * 与 x-menu-group.collapsed 同范式，避免 Firefox 不支持的 :host-context()。
 *
 * 插槽：
 *  - header    顶部区（存在才渲染容器，用 slotchange 检测）
 *  - sidebar   侧栏（放 x-logo + x-menu 等）
 *  - (默认)    主内容区（自身滚动）
 *  - footer    底部区（存在才渲染）
 *
 * 属性：
 *  - rail          侧栏是否折叠为窄栏（Boolean 反射，默认 false）
 *  - side          侧栏方位（'left' | 'right'，默认 left，反射）
 *  - sidebarWidth  展开宽度（默认 '260px'）
 *  - railWidth     折叠宽度（默认 '68px'）
 *  - collapsible   是否显示内置折叠按钮（Boolean 反射，默认 true；写 collapsible="false" 即关，
 *                  只隐按钮——rail 属性与 toggleRail() 照常可用）
 *
 * 方法：toggleRail(force?) 切换折叠；scrollContentTop() 主内容区回到顶部。
 * 事件：x-rail-change（detail:{ rail }，composed bubbles）供外部持久化。
 *
 * 高度约定：宿主 `height:100%` 吃满父元素，要求祖先链给出确定高度（应用外壳典型做法：
 * `html,body{height:100%}`，或把容器放进定高的 grid/flex 区域）。内部用
 * `grid-template-rows: auto minmax(0,1fr) auto` 把中间行严格锁在剩余空间——若写成 `1fr`
 * （= minmax(auto,1fr)），auto 最小值会让该行长到内容高、撑破宿主产生整页滚动条；
 * 溢出全部交给 .main / .sidebar__scroll 内部滚动。两处滚动条用 `scrollbar-gutter: stable`
 * 常驻预留轨道槽，内容在可滚/不可滚阈值间切换时不回流、不抖动。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
// 依赖图标组件（副作用注册 x-icon）：折叠按钮箭头取自内置图标注册表
import '../icon/x-icon.js';
import containerStyles from './x-container.css?inline';

export type ContainerSide = 'left' | 'right';

class XContainer extends XBaseElement {
  static tag = 'x-container';

  static properties: Record<string, PropertyOptions> = {
    rail: { type: 'Boolean', reflect: true, default: false },
    side: { type: 'String', reflect: true, default: 'left' },
    sidebarWidth: { type: 'String', default: '260px' },
    railWidth: { type: 'String', default: '68px' },
    collapsible: { type: 'Boolean', reflect: true, default: true },
  };

  static styles = [containerStyles];

  declare rail: boolean;
  declare side: ContainerSide;
  declare sidebarWidth: string;
  declare railWidth: string;
  declare collapsible: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="grid" part="base">
      <header class="header" part="header"><slot name="header"></slot></header>
      <aside class="sidebar" part="sidebar">
        <div class="sidebar__scroll"><slot name="sidebar"></slot></div>
        <button
          class="rail-toggle"
          part="rail-toggle"
          type="button"
          aria-label=${this.derive(() => (this.rail ? '展开侧栏' : '折叠侧栏'))}
          hidden=${this.derive(() => (this.collapsible ? undefined : ''))}
        ><x-icon name="chevrons-right"></x-icon></button>
      </aside>
      <main class="main" part="main"><slot></slot></main>
      <footer class="footer" part="footer"><slot name="footer"></slot></footer>
    </div>`;
  }

  protected firstUpdated(): void {
    this.shadowRoot!.querySelector<HTMLButtonElement>('.rail-toggle')!.addEventListener('click', this.__onToggle);
    const header = this.shadowRoot!.querySelector('slot[name="header"]')!;
    const footer = this.shadowRoot!.querySelector('slot[name="footer"]')!;
    header.addEventListener('slotchange', this.__syncFilled);
    footer.addEventListener('slotchange', this.__syncFilled);
    this.__sync();
  }

  protected override updated(): void {
    this.__sync();
  }

  override disconnectedCallback(): void {
    const header = this.shadowRoot?.querySelector('slot[name="header"]');
    const footer = this.shadowRoot?.querySelector('slot[name="footer"]');
    header?.removeEventListener('slotchange', this.__syncFilled);
    footer?.removeEventListener('slotchange', this.__syncFilled);
    super.disconnectedCallback();
  }

  /** 切换侧栏折叠；force 可显式指定目标态 */
  toggleRail(force?: boolean): void {
    this.rail = force ?? !this.rail;
    this.dispatchEvent(
      new CustomEvent('x-rail-change', { bubbles: true, composed: true, detail: { rail: this.rail } }),
    );
  }

  /** 主内容区滚动回顶部 */
  scrollContentTop(): void {
    const main = this.shadowRoot?.querySelector('.main');
    if (main) main.scrollTop = 0;
  }

  /** 依据 header/footer 是否有内容，开关宿主上的 data-* 标记（CSS 据此显隐其容器） */
  private __syncFilled = (): void => {
    const sr = this.shadowRoot!;
    const has = (name: string) =>
      (sr.querySelector(`slot[name="${name}"]`) as HTMLSlotElement | null)
        ?.assignedNodes({ flatten: true })
        .some((n) => n.nodeType === Node.ELEMENT_NODE || (n.nodeType === Node.TEXT_NODE && !!n.textContent?.trim()));
    this.toggleAttribute('data-header', !!has('header'));
    this.toggleAttribute('data-footer', !!has('footer'));
  };

  /** 同步内联宽度变量并把 rail 下沉给侧栏里的 x-logo / x-menu */
  private __sync(): void {
    const w = (this.rail ? this.railWidth : this.sidebarWidth) || (this.rail ? '68px' : '260px');
    this.style.setProperty('--_side-w', w);
    this.__syncFilled();
    this.__syncRail();
  }

  /**
   * 把 rail 下沉给「侧栏插槽」内的 x-logo / x-menu（限缩到 sidebar，避免误伤主内容区里的示例）。
   * 只走 sidebar 插槽的 assignedElements 及其子树，默认插槽（正文）里的菜单不受影响。
   */
  private __syncRail(): void {
    const slot = this.shadowRoot?.querySelector('slot[name="sidebar"]') as HTMLSlotElement | null;
    if (!slot) return;
    const targets: HTMLElement[] = [];
    slot.assignedElements({ flatten: true }).forEach((node) => {
      const el = node as HTMLElement;
      if (el.matches?.('x-logo, x-menu')) targets.push(el);
      el.querySelectorAll?.('x-logo, x-menu').forEach((child) => targets.push(child as HTMLElement));
    });
    targets.forEach((el) => {
      (el as unknown as { rail: boolean }).rail = this.rail;
    });
  }

  private __onToggle = (): void => {
    this.toggleRail();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'x-container': XContainer;
  }
}

export { XContainer };
export default define(XContainer);
