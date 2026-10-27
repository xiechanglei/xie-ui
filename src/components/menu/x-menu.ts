/**
 * x-menu —— 导航菜单根容器，导航菜单分类。
 *
 * 包裹若干 <x-menu-group>（可含 x-menu-item）或直接 <x-menu-item>，统一协调「单选」：
 * 子项点击冒泡内部事件 → 本组件把 `value` 置为该 item、回写其 active 态，并派发公开的 `x-select`。
 * 程序化设置 `value`（如路由变化）会同步高亮，但**不**派发 x-select，避免回环。
 * 内容全部通过默认插槽传入（light DOM），嵌套分组即子菜单。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import menuStyles from './x-menu.css?inline';

class XMenu extends XBaseElement {
  static tag = 'x-menu';

  static properties: Record<string, PropertyOptions> = {
    value: { type: 'String', reflect: true, default: '' },
    rail: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [menuStyles];

  declare value: string;
  declare rail: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="menu" part="menu" role="menu" aria-orientation="vertical"><slot></slot></div>`;
  }

  protected firstUpdated(): void {
    this.addEventListener('x-menu-item-activate', this.__onActivate);
    this.__syncActive();
    this.__syncRail();
  }

  protected override updated(): void {
    this.__syncActive();
    this.__syncRail();
  }

  override disconnectedCallback(): void {
    this.removeEventListener('x-menu-item-activate', this.__onActivate);
    super.disconnectedCallback();
  }

  /** 命令式选中某项（会派发 x-select） */
  select(value: string): void {
    this.__select(value, true);
  }

  private __onActivate = (event: Event): void => {
    event.stopPropagation();
    const value = (event as CustomEvent<{ value: string }>).detail.value;
    this.__select(value, true);
  };

  private __select(value: string, emit: boolean): void {
    this.value = value;
    this.__syncActive();
    if (emit) {
      this.dispatchEvent(new CustomEvent('x-select', { bubbles: true, composed: true, detail: { value } }));
    }
  }

  /** 依据当前 value 单选高亮所有后代菜单项 */
  private __syncActive(): void {
    const items = this.querySelectorAll('x-menu-item') as unknown as XMenuItemLike[];
    for (const item of items) item.active = !!this.value && item.value === this.value;
  }

  /** 把 rail（窄栏态）扇出给后代菜单项与分组（由 x-container 下沉触发） */
  private __syncRail(): void {
    const kids = this.querySelectorAll('x-menu-item, x-menu-group') as unknown as XRailLike[];
    for (const kid of kids) kid.rail = this.rail;
  }
}

/** 结构型引用，避免跨模块循环依赖 */
interface XMenuItemLike {
  value: string;
  active: boolean;
}

interface XRailLike {
  rail: boolean;
}

declare global {
  interface HTMLElementTagNameMap {
    'x-menu': XMenu;
  }
}

export { XMenu };
export default define(XMenu);
