/**
 * x-radio —— 单选框（表单分类，原子件）。
 *
 * 与 x-checkbox 同源：shadow 内包原生 `<input type="radio">`（appearance 关自绘，键盘/无障碍白送），
 * 选中点由 CSS `:checked` 驱动；语义色 `color`、尺寸 `size` 双轴走令牌，随主题联动。
 * FCCE form 关联：选中时把 `value` 经 `internals.setFormValue` 计入外层 form（同名单选靠组互斥保证只提交一个）。
 *
 * 注意：跨自定义元素无法用原生同名互斥（radio 分组只在同一渲染树内生效），故互斥交由 x-radio-group 管理；
 * 单个裸 x-radio 独立存在时仅表现为「可勾选、点自己不会取消」的开关，需配 group 才有单选语义。
 * 事件沿用可取消的 `x-change`（detail:{ checked:true, value }）。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import radioStyles from './x-radio.css?inline';

export type RadioColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type RadioSize = 'sm' | 'md' | 'lg';

class XRadio extends XBaseElement {
  static tag = 'x-radio';
  static formAssociated = true;

  static properties: Record<string, PropertyOptions> = {
    checked: { type: 'Boolean', reflect: true, default: false },
    disabled: { type: 'Boolean', reflect: true, default: false },
    required: { type: 'Boolean', reflect: true, default: false },
    name: { type: 'String', reflect: true, default: '' },
    value: { type: 'String', default: '' },
    label: { type: 'String', default: '' },
    size: { type: 'String', reflect: true, default: 'md' },
    color: { type: 'String', reflect: true, default: 'primary' },
  };

  static styles = [radioStyles];

  declare checked: boolean;
  declare disabled: boolean;
  declare required: boolean;
  declare name: string;
  declare value: string;
  declare label: string;
  declare size: RadioSize;
  declare color: RadioColor;

  protected internals!: ElementInternals;

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this.internals = this.attachInternals();
  }

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  protected render(): TemplateResult {
    return html`<span class="box" part="box">
      <input
        class="native"
        part="native"
        type="radio"
        disabled=${this.derive(() => this.disabled)}
        aria-label=${this.derive(() => this.label || undefined)}
        aria-checked=${this.derive(() => String(!!this.checked))}
      /><span class="mark" part="mark"></span>
    </span>`;
  }

  protected firstUpdated(): void {
    this.__native().addEventListener('change', this.__onChange);
    this.__sync();
  }

  protected override updated(): void {
    this.__sync();
  }

  override disconnectedCallback(): void {
    const native = this.shadowRoot?.querySelector('input');
    if (native) native.removeEventListener('change', this.__onChange);
    super.disconnectedCallback();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  /** 选中/取消。单选正常只会被置 true；force=false 供 group 清空他人时程序化调用。 */
  select(force = true): void {
    if (force && (this.disabled || this.checked)) return;
    if (!this.__dispatchChange(force)) return;
    this.checked = force;
  }

  protected __native(): HTMLInputElement {
    return this.shadowRoot!.querySelector<HTMLInputElement>('.native')!;
  }

  private __onChange = (): void => {
    const native = this.__native();
    if (native.checked === this.checked) return;
    if (!this.__dispatchChange(native.checked)) {
      this.__sync();
      return;
    }
    this.checked = native.checked;
  };

  private __dispatchChange(next: boolean): boolean {
    return this.dispatchEvent(
      new CustomEvent('x-change', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { checked: next, value: this.value },
      }),
    );
  }

  private __sync(): void {
    const native = this.shadowRoot?.querySelector<HTMLInputElement>('.native');
    if (!native) return;
    native.checked = !!this.checked;
    this.internals.setFormValue(this.checked ? this.value : null);
    if (this.required && !this.checked) {
      this.internals.setValidity({ valueMissing: true }, '请选择一项', native);
    } else {
      this.internals.setValidity({});
    }
  }

  override focus(options?: FocusOptions): void {
    const native = this.shadowRoot?.querySelector<HTMLInputElement>('.native');
    (native ?? this).focus(options);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-radio': XRadio;
  }
}

export { XRadio };
export default define(XRadio);
