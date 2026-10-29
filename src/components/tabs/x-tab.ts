/**
 * x-tab —— 选项卡按钮（导航分类，x-tabs 的配套件）。
 *
 * 只负责「一枚可点的标签页签」：默认插槽放标题文字，连接时若没写 slot 自动挂 `slot="tab"`
 * 进 x-tabs 的选项卡条（消费者不用记魔法串，同 x-dropdown-content 套路）。
 * 单选协调、面板显隐、键盘漫游都由宿主 x-tabs 负责；本件只在被点时上抛内部事件。
 *
 * 属性：
 *  - value    关联键（反射）：与同名 x-tab-panel 的 value 配对
 *  - disabled 禁用（反射）：不可点、不参与键盘漫游
 *  - active   选中态（反射）：由 x-tabs 回写（独立使用也可自写），驱动高亮下划线 + aria-selected
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import tabStyles from './x-tab.css?inline';

class XTab extends XBaseElement {
  static tag = 'x-tab';

  static properties: Record<string, PropertyOptions> = {
    value: { type: 'String', reflect: true, default: '' },
    disabled: { type: 'Boolean', reflect: true, default: false },
    active: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [tabStyles];

  declare value: string;
  declare disabled: boolean;
  declare active: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  override connectedCallback(): void {
    // 归位到 x-tabs 的选项卡条；显式写了 slot 则尊重（也支持脱离 x-tabs 单独摆放）
    if (!this.getAttribute('slot')) this.setAttribute('slot', 'tab');
    super.connectedCallback();
  }

  protected render(): TemplateResult {
    // roving tabindex：选中项可 Tab 到达，其余 -1（方向键在 x-tabs 里漫游）
    return html`<button
      class="base"
      part="base"
      type="button"
      role="tab"
      aria-selected=${this.derive(() => (this.active ? 'true' : 'false'))}
      tabindex=${this.derive(() => (this.active ? 0 : -1))}
      disabled=${this.derive(() => this.disabled)}
    ><slot></slot></button>`;
  }

  protected firstUpdated(): void {
    this.shadowRoot!.querySelector<HTMLButtonElement>('.base')!.addEventListener('click', this.__onClick);
  }

  /** 键盘漫游用：把焦点移进 shadow 里的真实按钮（宿主本身不可聚焦） */
  focusTab(): void {
    this.shadowRoot?.querySelector<HTMLElement>('.base')?.focus();
  }

  /** 点击上抛内部激活事件（bubbles 不 composed：只在 light DOM 链路由 x-tabs 接住） */
  private __onClick = (): void => {
    if (this.disabled) return;
    this.dispatchEvent(
      new CustomEvent('x-tab-activate', { bubbles: true, detail: { value: this.value } }),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'x-tab': XTab;
  }
}

export { XTab };
export default define(XTab);
