/**
 * x-switch —— 通用二元开关（表单分类）。
 *
 * 以 <button role="switch"> 实现，天然可聚焦、支持 Space/Enter 切换。
 * `checked`（反射）驱动状态；用户交互切换时派发可取消的 `x-change`（detail:{ checked, value }），
 * 程序化设置 checked 不触发事件，便于作为受控组件嵌入（如主题面板「外观模式」）。
 * 可选 slot="on" / slot="off" 在滑块内放置图标（如太阳/月亮），随状态自动显隐。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import switchStyles from './x-switch.css?inline';

class XSwitch extends XBaseElement {
  static tag = 'x-switch';

  static properties: Record<string, PropertyOptions> = {
    checked: { type: 'Boolean', reflect: true, default: false },
    disabled: { type: 'Boolean', reflect: true, default: false },
    label: { type: 'String', default: '' },
    value: { type: 'String', default: 'on' },
  };

  static styles = [switchStyles];

  declare checked: boolean;
  declare disabled: boolean;
  declare label: string;
  declare value: string;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<button
      class="base"
      part="base"
      type="button"
      role="switch"
      aria-checked=${this.derive(() => String(this.checked))}
      aria-label=${this.derive(() => this.label || undefined)}
      disabled=${this.derive(() => this.disabled)}
    ><span class="track" part="track"><span class="thumb" part="thumb"><slot name="off"></slot><slot name="on"></slot></span></span></button>`;
  }

  protected firstUpdated(): void {
    this.shadowRoot!.querySelector('.base')!.addEventListener('click', this.__onClick);
  }

  override disconnectedCallback(): void {
    const base = this.shadowRoot?.querySelector('.base');
    if (base) base.removeEventListener('click', this.__onClick);
    super.disconnectedCallback();
  }

  /**
   * 切换开关。可传入目标态 force；派发可取消的 x-change，
   * 若被外部 preventDefault 则不改变状态（受控回退）。
   */
  toggle(force?: boolean): void {
    if (this.disabled) return;
    const next = force ?? !this.checked;
    if (next === this.checked) return;
    const ok = this.dispatchEvent(
      new CustomEvent('x-change', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { checked: next, value: this.value },
      }),
    );
    if (!ok) return;
    this.checked = next;
  }

  private __onClick = (event: Event): void => {
    event.preventDefault();
    this.toggle();
  };

  /** 焦点委托给内部原生 button */
  override focus(options?: FocusOptions): void {
    const base = this.shadowRoot?.querySelector<HTMLButtonElement>('.base');
    (base ?? this).focus(options);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-switch': XSwitch;
  }
}

export { XSwitch };
export default define(XSwitch);
