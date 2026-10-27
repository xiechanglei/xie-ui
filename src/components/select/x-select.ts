/**
 * x-select —— 下拉选择（表单分类）。
 *
 * 包一个原生 `<select>`（appearance 关自绘）：展开弹层、键盘方向键导航、移动端滚轮、无障碍全部由浏览器白送，
 * 本库只负责绘制外框与右侧 chevron 指示，因此观感统一、行为可靠。选项来源二选一（可混用，数组优先）：
 *  1) light DOM 里写原生 `<option value=.. >文本</option>`（或 `<x-select-option>`）；
 *  2) JS 设 `options` 数组（`{ value, label, disabled }` 或字符串）。
 * `placeholder` 渲染为一个 disabled+hidden 的空值占位项，未选中时显示。
 *
 * 事件：选择变化派发可取消的 `x-change`（detail:{ value, previousValue }），取消则回退。FCCE：value 经 internals
 * 计入 form；`required` 未选时走原生校验。形态 variant / 语义色 color / 尺寸 size 双轴沿用输入类约定。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import '../icon/x-icon.js';
import selectStyles from './x-select.css?inline';

export type SelectVariant = 'outline' | 'filled' | 'flush';
export type SelectColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type SelectSize = 'sm' | 'md' | 'lg';
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
/** options 数组允许传对象或纯字符串 */
export type SelectOptionInput = SelectOption | string;

class XSelect extends XBaseElement {
  static tag = 'x-select';
  static formAssociated = true;

  static properties: Record<string, PropertyOptions> = {
    value: { type: 'String', default: '' },
    disabled: { type: 'Boolean', reflect: true, default: false },
    required: { type: 'Boolean', reflect: true, default: false },
    name: { type: 'String', reflect: true, default: '' },
    placeholder: { type: 'String', default: '' },
    variant: { type: 'String', reflect: true, default: 'outline' },
    color: { type: 'String', reflect: true, default: 'primary' },
    size: { type: 'String', reflect: true, default: 'md' },
    label: { type: 'String', default: '' },
  };

  static styles = [selectStyles];

  declare value: string;
  declare disabled: boolean;
  declare required: boolean;
  declare name: string;
  declare placeholder: string;
  declare variant: SelectVariant;
  declare color: SelectColor;
  declare size: SelectSize;
  declare label: string;

  /** options 走普通字段（非反射属性）：数组无法用 String/Number/Boolean 类型桥接 */
  private _options?: SelectOptionInput[];
  private __committed = '';
  private internals!: ElementInternals;

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this.internals = this.attachInternals();
  }

  set options(v: SelectOptionInput[] | undefined) {
    this._options = v;
    this.__populate();
    this.requestUpdate();
  }
  get options(): SelectOptionInput[] | undefined {
    return this._options;
  }

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  protected render(): TemplateResult {
    return html`<div class="field" part="field">
      <select
        class="native"
        part="native"
        disabled=${this.derive(() => this.disabled)}
        aria-label=${this.derive(() => this.label || undefined)}
      ></select>
      <x-icon class="chevron" part="chevron" name="chevron-down" size="16px"></x-icon>
      <div class="src"><slot></slot></div>
    </div>`;
  }

  protected firstUpdated(): void {
    const el = this.__el();
    el.addEventListener('change', this.__onChange);
    const slot = this.shadowRoot!.querySelector('slot')!;
    slot.addEventListener('slotchange', () => this.__populate());
    this.__committed = this.value ?? '';
    this.__populate();
  }

  protected override updated(): void {
    this.__sync();
  }

  override disconnectedCallback(): void {
    const el = this.shadowRoot?.querySelector('select');
    if (el) el.removeEventListener('change', this.__onChange);
    super.disconnectedCallback();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  override focus(options?: FocusOptions): void {
    (this.shadowRoot?.querySelector('select') ?? this).focus(options);
  }

  private __el(): HTMLSelectElement {
    return this.shadowRoot!.querySelector<HTMLSelectElement>('.native')!;
  }

  /** 收集选项：_options 数组优先，否则读 light DOM 的 <option>/<x-select-option> */
  private __collect(): SelectOption[] {
    if (this._options) {
      return this._options.map((o) =>
        typeof o === 'string' ? { value: o, label: o } : { value: o.value, label: o.label ?? o.value, disabled: o.disabled },
      );
    }
    const slot = this.shadowRoot?.querySelector('slot');
    const nodes = slot ? slot.assignedElements() : [];
    return nodes
      .filter((el) => el.tagName === 'OPTION' || el.tagName === 'X-SELECT-OPTION')
      .map((el) => {
        const text = (el.textContent || '').trim();
        const value = el.getAttribute('value') ?? text;
        const label = el.getAttribute('label') ?? text;
        return { value, label, disabled: el.hasAttribute('disabled') };
      });
  }

  /** 依据当前选项源重建 shadow <select> 的 <option>，并保持 value 命中 */
  private __populate(): void {
    const el = this.__el();
    if (!el) return;
    el.textContent = '';
    if (this.placeholder) {
      const ph = document.createElement('option');
      ph.value = '';
      ph.textContent = this.placeholder;
      ph.disabled = true;
      ph.hidden = true;
      el.appendChild(ph);
    }
    for (const opt of this.__collect()) {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      if (opt.disabled) o.disabled = true;
      el.appendChild(o);
    }
    this.__sync();
  }

  /** 信号 → 原生 select 值 / FormData / 校验 */
  private __sync(): void {
    const el = this.shadowRoot?.querySelector<HTMLSelectElement>('.native');
    if (!el) return;
    const next = this.value ?? '';
    if (el.value !== next) el.value = next;
    this.internals.setFormValue(next === '' ? null : next);
    if (this.required && !next) this.internals.setValidity({ valueMissing: true }, '请选择一项', el);
    else this.internals.setValidity({});
  }

  private __onChange = (): void => {
    const el = this.__el();
    const next = el.value;
    if (next === this.value) return;
    const previousValue = this.__committed;
    const ok = this.dispatchEvent(
      new CustomEvent('x-change', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { value: next, previousValue },
      }),
    );
    if (!ok) {
      this.value = previousValue;
      this.__sync();
      return;
    }
    this.value = next;
    this.__committed = next;
    this.__sync();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'x-select': XSelect;
  }
}

export { XSelect };
export default define(XSelect);
