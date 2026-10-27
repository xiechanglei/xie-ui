/**
 * x-radio-item —— 带文字标签的单选项（表单分类）。继承 x-radio，复用盒体 DOM/CSS 与受控逻辑，
 * 并排 `label` 文字，点整行即选中（点盒子本体交原生处理）。单选语义（互斥）由 x-radio-group 提供。
 */

import { XRadio } from './x-radio.js';
import { html, define, type TemplateResult } from '../../core/element.js';
import radioStyles from './x-radio.css?inline';
import itemStyles from './x-radio-item.css?inline';

class XRadioItem extends XRadio {
  static override tag = 'x-radio-item';
  static override styles = [radioStyles, itemStyles];

  protected override render(): TemplateResult {
    return html`<span class="item" part="item">
      <span class="box" part="box">
        <input
          class="native"
          part="native"
          type="radio"
          disabled=${this.derive(() => this.disabled)}
          aria-label=${this.derive(() => this.label || undefined)}
          aria-checked=${this.derive(() => String(!!this.checked))}
        /><span class="mark" part="mark"></span>
      </span>
      <span class="label" part="label">${this.derive(() => this.label)}</span>
      <slot></slot>
    </span>`;
  }

  protected override firstUpdated(): void {
    super.firstUpdated();
    this.addEventListener('click', this.__onItemClick);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('click', this.__onItemClick);
    super.disconnectedCallback();
  }

  private __onItemClick = (event: MouseEvent): void => {
    if (event.composedPath().includes(this.__native())) return; // 盒子自身处理
    event.preventDefault();
    this.select(true);
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'x-radio-item': XRadioItem;
  }
}

export { XRadioItem };
export default define(XRadioItem);
