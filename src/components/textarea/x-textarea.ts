/**
 * x-textarea —— 多行文本域（表单分类）。
 *
 * 与 x-input 同源设计：shadow 内包原生 `<textarea>`（键盘/输入法/粘贴/换行白送），外层 .field 只绘制度；
 * 形态 variant(outline/filled/flush) × 语义色 color(6 角色) 双轴正交，尺寸 size 影响字号，颜色/圆角走令牌随主题联动。
 * 事件沿用 x-input 模型：逐字符 `x-input`（detail:{value}）+ 失焦提交的可取消 `x-change`（detail:{value,previousValue}），
 * 程序化设 value 不派发。`autosize` 让高度随内容伸缩；`resize`（none/vertical/both/auto）控制手动拖拽。
 * FCCE：value 经 internals 计入外层 form，`required`/`maxlength` 走原生校验。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import textareaStyles from './x-textarea.css?inline';

export type TextareaVariant = 'outline' | 'filled' | 'flush';
export type TextareaColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaResize = 'none' | 'vertical' | 'both' | 'auto';

class XTextarea extends XBaseElement {
  static tag = 'x-textarea';
  static formAssociated = true;

  static properties: Record<string, PropertyOptions> = {
    value: { type: 'String', default: '' },
    rows: { type: 'Number', default: 3 },
    maxRows: { type: 'Number', default: undefined },
    autosize: { type: 'Boolean', reflect: true, default: false },
    resize: { type: 'String', reflect: true, default: 'vertical' },
    variant: { type: 'String', reflect: true, default: 'outline' },
    color: { type: 'String', reflect: true, default: 'primary' },
    size: { type: 'String', reflect: true, default: 'md' },
    placeholder: { type: 'String', default: '' },
    disabled: { type: 'Boolean', reflect: true, default: false },
    readonly: { type: 'Boolean', reflect: true, default: false },
    required: { type: 'Boolean', reflect: true, default: false },
    maxlength: { type: 'Number', default: undefined },
    showCount: { type: 'Boolean', reflect: true, default: false },
    label: { type: 'String', default: '' },
  };

  static styles = [textareaStyles];

  declare value: string;
  declare rows: number;
  declare maxRows?: number;
  declare autosize: boolean;
  declare resize: TextareaResize;
  declare variant: TextareaVariant;
  declare color: TextareaColor;
  declare size: TextareaSize;
  declare placeholder: string;
  declare disabled: boolean;
  declare readonly: boolean;
  declare required: boolean;
  declare maxlength?: number;
  declare showCount: boolean;
  declare label: string;

  private __committed = '';

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this.internals = this.attachInternals();
  }

  private internals!: ElementInternals;

  protected render(): TemplateResult {
    return html`<div class="field" part="field">
      <textarea
        class="input"
        part="input"
        rows=${this.derive(() => this.rows)}
        placeholder=${this.derive(() => this.placeholder || undefined)}
        disabled=${this.derive(() => this.disabled)}
        readonly=${this.derive(() => this.readonly)}
        maxlength=${this.derive(() => this.maxlength)}
        aria-label=${this.derive(() => this.label || undefined)}
      ></textarea>
      <span class="foot">
        <span class="count" part="count" hidden=${this.derive(() => (this.showCount ? undefined : ''))}>${this.derive(
          () => (this.maxlength ? this.value.length + '/' + this.maxlength : String(this.value.length)),
        )}</span>
      </span>
    </div>`;
  }

  protected firstUpdated(): void {
    const el = this.__el();
    el.addEventListener('input', this.__onInput);
    el.addEventListener('change', this.__onChange);
    this.__committed = this.value ?? '';
    this.__write();
  }

  protected override updated(): void {
    this.__write();
  }

  override disconnectedCallback(): void {
    const el = this.shadowRoot?.querySelector('textarea');
    if (el) {
      el.removeEventListener('input', this.__onInput);
      el.removeEventListener('change', this.__onChange);
    }
    super.disconnectedCallback();
  }

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  /** 校验态只读接口（供 x-form / x-form-item 读取渲染错误） */
  get validity(): ValidityState {
    return this.internals.validity;
  }
  get validationMessage(): string {
    return this.internals.validationMessage;
  }
  get willValidate(): boolean {
    return this.internals.willValidate;
  }
  checkValidity(): boolean {
    return this.internals.checkValidity();
  }
  reportValidity(): boolean {
    return this.internals.reportValidity();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  override focus(options?: FocusOptions): void {
    (this.shadowRoot?.querySelector('textarea') ?? this).focus(options);
  }

  select(): void {
    this.shadowRoot?.querySelector<HTMLTextAreaElement>('.input')?.select();
  }

  private __el(): HTMLTextAreaElement {
    return this.shadowRoot!.querySelector<HTMLTextAreaElement>('.input')!;
  }

  /** 信号 → 原生 textarea / FormData / 自适应高度 单向回写 */
  private __write(): void {
    const el = this.shadowRoot?.querySelector<HTMLTextAreaElement>('.input');
    if (!el) return;
    const next = this.value ?? '';
    if (el.value !== next) el.value = next;
    this.internals.setFormValue(next);
    if (this.required && !next) this.internals.setValidity({ valueMissing: true }, '请输入内容', el);
    else this.internals.setValidity({});
    if (this.autosize) this.__autosize(el);
  }

  /** 高度贴合内容：先归零再取 scrollHeight，受 rows(最小) 与 maxRows(最大) 夹逼 */
  private __autosize(el: HTMLTextAreaElement): void {
    el.style.height = 'auto';
    const cs = getComputedStyle(el);
    const lh = parseFloat(cs.lineHeight) || 20;
    const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const min = lh * (this.rows || 1) + pad;
    const cap = this.maxRows ? lh * this.maxRows + pad : Infinity;
    el.style.height = Math.max(min, Math.min(el.scrollHeight, cap)) + 'px';
  }

  private __onInput = (): void => {
    const next = this.__el().value;
    if (next === (this.value ?? '')) return;
    this.value = next;
    this.dispatchEvent(new CustomEvent('x-input', { bubbles: true, composed: true, detail: { value: next } }));
  };

  private __onChange = (): void => {
    this.__commit(this.__committed);
  };

  private __commit(previousValue: string): void {
    const current = this.value ?? '';
    if (current === previousValue) return;
    const ok = this.dispatchEvent(
      new CustomEvent('x-change', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { value: current, previousValue },
      }),
    );
    this.__committed = ok ? current : previousValue;
    if (!ok) this.value = previousValue;
    this.__write();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-textarea': XTextarea;
  }
}

export { XTextarea };
export default define(XTextarea);
