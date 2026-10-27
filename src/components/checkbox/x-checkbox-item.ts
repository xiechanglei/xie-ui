/**
 * x-checkbox-item —— 带文字标签的复选项（表单分类）。
 *
 * 继承 x-checkbox，复用同一套盒体 DOM/CSS 与受控事件逻辑，只在旁边并排一段说明文字（`label` 属性），
 * 并把「点击文字/整行」也接到切换上（点盒子本体仍由原生 input 处理，二者互不重复）。
 * 因此本项既是可视化标签、又是无障碍名（label 缺失时可再放默认插槽内容作补充节点）。
 */

import { XCheckbox } from './x-checkbox.js';
import { html, define, type TemplateResult } from '../../core/element.js';
import checkboxStyles from './x-checkbox.css?inline';
import itemStyles from './x-checkbox-item.css?inline';

class XCheckboxItem extends XCheckbox {
  static override tag = 'x-checkbox-item';
  static override styles = [checkboxStyles, itemStyles];

  protected override render(): TemplateResult {
    return html`<span class="item" part="item">
      <span class="box" part="box">
        <input
          class="native"
          part="native"
          type="checkbox"
          disabled=${this.derive(() => this.disabled)}
          aria-label=${this.derive(() => this.label || undefined)}
          aria-checked=${this.derive(() => (this.indeterminate ? 'mixed' : String(!!this.checked)))}
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

  /** 点整行任意处都切换；唯独点在盒子（原生 input）上时交给原生自身处理，避免双重翻转 */
  private __onItemClick = (event: MouseEvent): void => {
    if (event.composedPath().includes(this.__native())) return;
    event.preventDefault();
    this.toggle();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'x-checkbox-item': XCheckboxItem;
  }
}

export { XCheckboxItem };
export default define(XCheckboxItem);
