/**
 * x-tabs —— 标签页根容器（导航分类）。
 *
 * 包裹若干 <x-tab>（选项卡）与 <x-tab-panel>（面板），按 `value` 一对一配对，协调单选：
 * 点某张 tab → 本组件置 `value`、回写各 tab 的 active 与各 panel 的显隐，并派发公开 `x-select`。
 * 程序化设置 `value`（如外部状态驱动）会同步高亮/显隐，但**不**派发 x-select，避免回环。
 * 选项卡自动挂 `slot="tab"` 进卡条（见 x-tab），面板走默认插槽——两者在 light DOM 里的书写顺序不限。
 *
 * 属性：
 *  - value  当前选中标签的关联键（反射）；缺省自动选第一张未禁用的 tab
 *  - fill   等分铺满（反射）：所有 tab 平分卡条宽度（MUI fullWidth），缺省随内容宽
 *
 * 事件：
 *  - x-select  切换选中时派发（bubbles+composed），detail:{ value }
 *
 * 无障碍：tablist / tab / tabpanel 三角色齐备，roving tabindex（仅选中项 Tab 可达），
 * 方向键 ←→（纵排 ↑↓）/Home/End 在未禁用 tab 间漫游并即时选中。
 * 定制：暴露 part="tablist" / "panels"。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import './x-tab.js';
import './x-tab-panel.js';
import tabsStyles from './x-tabs.css?inline';

/** 结构型引用，避免跨模块循环依赖 */
interface TabLike extends HTMLElement {
  value: string;
  active: boolean;
  disabled: boolean;
  focusTab(): void;
}
interface PanelLike extends HTMLElement {
  value: string;
}

class XTabs extends XBaseElement {
  static tag = 'x-tabs';

  static properties: Record<string, PropertyOptions> = {
    value: { type: 'String', reflect: true, default: '' },
    fill: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [tabsStyles];

  declare value: string;
  declare fill: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="tablist" part="tablist" role="tablist"><slot name="tab"></slot></div><div class="panels" part="panels"><slot></slot></div>`;
  }

  protected firstUpdated(): void {
    this.addEventListener('x-tab-activate', this.__onActivate as EventListener);
    this.addEventListener('keydown', this.__onKeydown);
    // 初次协调靠 slotchange，而非微任务：静态 HTML 解析时反应队列按树序，x-tabs 先于子 x-tab/x-tab-panel
    // 升级——微任务可能在子件就位前就跑完，读不到 value。改由两个 slot 的 slotchange 驱动：子件被分发进
    // 插槽即触发，届时该子件已升级；对动态增删 tab 也能自动重协调。
    for (const slot of Array.from(this.shadowRoot!.querySelectorAll('slot'))) {
      slot.addEventListener('slotchange', this.__onSlotChange);
    }
    this.__init();
  }

  protected override updated(): void {
    this.__sync();
  }

  override disconnectedCallback(): void {
    this.removeEventListener('x-tab-activate', this.__onActivate as EventListener);
    this.removeEventListener('keydown', this.__onKeydown);
    super.disconnectedCallback();
  }

  private __onSlotChange = (): void => {
    this.__init();
  };

  /** 首次/结构变化时的协调：无选中值则兜底取第一张未禁用 tab，再回写显隐（幂等） */
  private __init(): void {
    const tabs = this.__tabs().filter((t) => t.shadowRoot); // 只看已升级的 x-tab
    if (!tabs.length) return;
    if (!this.value) {
      const first = tabs.find((t) => !t.disabled);
      if (first) this.value = first.value;
    }
    this.__sync();
  }

  /** 命令式切换（会派发 x-select） */
  select(value: string): void {
    this.__select(value, true);
  }

  private __onActivate = (event: CustomEvent<{ value: string }>): void => {
    event.stopPropagation();
    this.__select(event.detail.value, true);
  };

  private __select(value: string, emit: boolean): void {
    if (this.value === value) return;
    this.value = value;
    this.__sync();
    if (emit) {
      this.dispatchEvent(new CustomEvent('x-select', { bubbles: true, composed: true, detail: { value } }));
    }
  }

  private __tabs(): TabLike[] {
    return Array.from(this.querySelectorAll<TabLike>('x-tab'));
  }

  /** 依当前 value 回写各 tab 选中态 + 各 panel 显隐；跳过尚未升级的子件（无 shadowRoot）避免误清 */
  private __sync(): void {
    for (const tab of this.__tabs()) {
      if (tab.shadowRoot) tab.active = tab.value === this.value;
    }
    for (const panel of Array.from(this.querySelectorAll<PanelLike>('x-tab-panel'))) {
      if (panel.shadowRoot) panel.toggleAttribute('hidden', panel.value !== this.value);
    }
  }

  /** 键盘漫游：←→/↑↓ 循环、Home/End 跳端点；落焦即选中（自动激活） */
  private __onKeydown = (event: KeyboardEvent): void => {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    const tabs = this.__tabs().filter((t) => !t.disabled);
    if (!tabs.length) return;
    // keydown 是 composed，跨 x-tab 的 shadow 后 target 被重定向为其宿主
    const current = tabs.findIndex((t) => t === (event.target as TabLike));
    if (current < 0) return;
    let next = current;
    const fwd = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    if (fwd) next = (current + 1) % tabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    event.preventDefault();
    const target = tabs[next];
    this.__select(target.value, true);
    target.focusTab();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'x-tabs': XTabs;
  }
}

export { XTabs };
export default define(XTabs);
