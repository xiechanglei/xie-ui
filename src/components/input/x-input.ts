/**
 * x-input —— 单行输入框（表单分类）。
 *
 * 内部包一个原生 `<input>`（可聚焦、支持键盘/输入法/复制粘贴），外层 .field 负责本库观感：
 * 形态 `variant`（outline/filled/flush）× 语义色 `color`（6 强调角色，聚焦描边与光标取色）双轴正交，
 * 尺寸 `size`（sm/md/lg）吃 `--xie-size-*` 档位；颜色/圆角/高度全部走令牌，随主题面板实时联动。
 *
 * 事件：输入过程逐字符派发 `x-input`（detail:{ value }）；失焦/回车等「提交」时机派发可取消的
 * `x-change`（detail:{ value, previousValue }），被 preventDefault 则回退到提交前的值（受控写法）。
 * 程序化设 `value` 不派发任何事件，只把新值同步进原生 input。
 *
 * 约定：shadow 内的原生 input 不直接参与外部 `<form>` 提交；宿主为 FCCE（Form-Associated
 * Custom Element）——`name` + `internals.setFormValue` 把值计入外层 form，required/type/maxlength
 * 等约束镜像自内层原生 input 的 validity。取值/受控请走 `value` 属性与 x-input / x-change 事件。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import type { Signal } from '../../core/signals.js';
import '../../tokens/index.js';
// 依赖图标组件（副作用注册 x-icon）：清空/显密按钮取自内置图标注册表
import '../icon/x-icon.js';
import inputStyles from './x-input.css?inline';

/** 原生 type 透传白名单（number 的自绘箭头已在 CSS 关掉） */
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
/** 形态轴 */
export type InputVariant = 'outline' | 'filled' | 'flush';
/** 语义色（聚焦描边/光标颜色）轴：6 个强调角色，缺省 primary */
export type InputColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
/** 尺寸档位 */
export type InputSize = 'sm' | 'md' | 'lg';

class XInput extends XBaseElement {
  static tag = 'x-input';
  /** 开启 form 关联（FCCE）：值经 internals 计入外层 <form> 的 FormData，约束校验走原生 */
  static formAssociated = true;

  static properties: Record<string, PropertyOptions> = {
    value: { type: 'String', default: '' },
    type: { type: 'String', reflect: true, default: 'text' },
    size: { type: 'String', reflect: true, default: 'md' },
    variant: { type: 'String', reflect: true, default: 'outline' },
    color: { type: 'String', reflect: true, default: 'primary' },
    placeholder: { type: 'String', default: '' },
    disabled: { type: 'Boolean', reflect: true, default: false },
    readonly: { type: 'Boolean', reflect: true, default: false },
    required: { type: 'Boolean', reflect: true, default: false },
    clearable: { type: 'Boolean', reflect: true, default: false },
    showPassword: { type: 'Boolean', reflect: true, default: false },
    maxlength: { type: 'Number', default: undefined },
    showCount: { type: 'Boolean', reflect: true, default: false },
    label: { type: 'String', default: '' },
    // name 反射：FCCE 的 FormData 键取自宿主 name attribute
    name: { type: 'String', reflect: true, default: '' },
  };

  static styles = [inputStyles];

  declare value: string;
  declare type: InputType;
  declare size: InputSize;
  declare variant: InputVariant;
  declare color: InputColor;
  declare placeholder: string;
  declare disabled: boolean;
  declare readonly: boolean;
  declare required: boolean;
  declare clearable: boolean;
  /** 密码可见切换（仅 type=password 时生效，反射 show-password） */
  declare showPassword: boolean;
  /** 最大长度（透传给原生 maxlength，配合 show-count 显示 n/max） */
  declare maxlength?: number;
  declare showCount: boolean;
  declare label: string;
  declare name: string;

  /** FCCE 内部句柄 */
  protected internals!: ElementInternals;

  /** 上一次「提交」的值，作为 x-change 的 previousValue 与取消时的回退目标 */
  private __committed = '';
  /** 密码是否明文展示（内部态，不反射不改 type 属性本身） */
  private __revealed!: Signal<boolean>;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.internals = this.attachInternals();
    this.__revealed = this.__signal(false);
  }

  /** 所属 form（FCCE 提供） */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }
  /** 校验态镜像自内层原生 input（required/type/pattern/maxlength 等） */
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

  /** FCCE：随 fieldset / form disabled 一起禁用 */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  protected render(): TemplateResult {
    return html`<div class="field" part="field">
      <slot name="prefix"></slot>
      <input
        class="input"
        part="input"
        type=${this.derive(() => (this.type === 'password' && this.__revealed.value ? 'text' : this.type))}
        placeholder=${this.derive(() => this.placeholder || undefined)}
        disabled=${this.derive(() => this.disabled)}
        readonly=${this.derive(() => this.readonly)}
        required=${this.derive(() => this.required)}
        maxlength=${this.derive(() => this.maxlength)}
        aria-label=${this.derive(() => this.label || undefined)}
        aria-required=${this.derive(() => (this.required ? 'true' : undefined))}
      />
      <slot name="suffix"></slot>
      <button
        class="reveal"
        part="reveal"
        type="button"
        aria-label=${this.derive(() => (this.__revealed.value ? '隐藏密码' : '显示密码'))}
        hidden=${this.derive(() => (this.__revealVisible ? undefined : ''))}
      >
        <x-icon name=${this.derive(() => (this.__revealed.value ? 'eye-off' : 'eye'))} size="16px"></x-icon>
      </button>
      <button class="clear" part="clear" type="button" aria-label="清空" hidden=${this.derive(() => (this.__clearVisible ? undefined : ''))}>
        <x-icon name="close" size="12px"></x-icon>
      </button>
      <span class="count" part="count" hidden=${this.derive(() => (this.showCount ? undefined : ''))}>${this.derive(
        () => (this.maxlength ? this.value.length + '/' + this.maxlength : String(this.value.length)),
      )}</span>
    </div>`;
  }

  protected firstUpdated(): void {
    const input = this.__inputEl();
    input.addEventListener('input', this.__onInput);
    input.addEventListener('change', this.__onChange);
    this.shadowRoot!.querySelector<HTMLButtonElement>('.clear')!.addEventListener('click', this.__onClear);
    const reveal = this.shadowRoot!.querySelector<HTMLButtonElement>('.reveal')!;
    // mousedown 拦在焦点转移前：切换显隐不抢焦点、不打断光标/输入法
    reveal.addEventListener('mousedown', (event) => event.preventDefault());
    reveal.addEventListener('click', this.__onReveal);
    // 点外框空白处/前后缀也聚焦输入（点清空/显密钮除外）
    this.shadowRoot!.querySelector('.field')!.addEventListener('click', (event) => {
      const target = event.target as Element;
      if (target.tagName !== 'INPUT' && !target.closest('.clear') && !target.closest('.reveal')) input.focus();
    });
    this.__committed = this.value ?? '';
    this.__writeValue();
    this.__syncForm();
  }

  protected override updated(): void {
    // 离开密码态时收起明文，避免切回 type=password 后直接漏显
    if (this.type !== 'password' && this.__revealed.value) this.__revealed.value = false;
    // 信号 → 原生 input 单向回写（同值不写，避免打断用户光标）
    this.__writeValue();
    this.__syncForm();
  }

  /** 把当前值与内层原生 input 的约束校验态同步到宿主（FCCE：FormData + validity） */
  private __syncForm(): void {
    this.internals.setFormValue(this.value ?? '');
    const input = this.__inputEl();
    if (!input) return;
    if (input.validity.valid) this.internals.setValidity({});
    else this.internals.setValidity(input.validity, input.validationMessage, input);
  }

  override disconnectedCallback(): void {
    const input = this.shadowRoot?.querySelector('input');
    if (input) {
      input.removeEventListener('input', this.__onInput);
      input.removeEventListener('change', this.__onChange);
    }
    super.disconnectedCallback();
  }

  /** 聚焦/选中委托给内部原生 input */
  override focus(options?: FocusOptions): void {
    (this.shadowRoot?.querySelector('input') ?? this).focus(options);
  }

  /** 全选输入内容 */
  select(): void {
    this.shadowRoot?.querySelector<HTMLInputElement>('.input')?.select();
  }

  /** 清空按钮只在「可清 + 有内容 + 非禁用只读」时出现 */
  private get __clearVisible(): boolean {
    return this.clearable && !this.disabled && !this.readonly && !!(this.value ?? '');
  }

  /** 显密钮只在「开启 + 密码型 + 非禁用」时出现（readonly 下允许查看） */
  private get __revealVisible(): boolean {
    return this.showPassword && this.type === 'password' && !this.disabled;
  }

  private __onReveal = (): void => {
    if (!this.__revealVisible) return;
    this.__revealed.value = !this.__revealed.value;
  };

  private __inputEl(): HTMLInputElement {
    return this.shadowRoot!.querySelector<HTMLInputElement>('.input')!;
  }

  private __writeValue(): void {
    const input = this.shadowRoot?.querySelector<HTMLInputElement>('.input');
    if (!input) return;
    const next = this.value ?? '';
    if (input.value !== next) input.value = next;
  }

  /** 逐字符输入：同步 value 信号并派发 x-input（不可取消，仅通知） */
  private __onInput = (): void => {
    const next = this.__inputEl().value;
    if (next === (this.value ?? '')) return;
    this.value = next;
    this.dispatchEvent(new CustomEvent('x-input', { bubbles: true, composed: true, detail: { value: next } }));
  };

  /** 提交时机（原生 change：失焦/回车/清除）→ 派发可取消的 x-change，取消则回退 */
  private __onChange = (): void => {
    this.__commit(this.__committed);
  };

  private __onClear = (): void => {
    const previous = this.value ?? '';
    if (!previous) return;
    this.value = '';
    this.__writeValue();
    this.dispatchEvent(new CustomEvent('x-input', { bubbles: true, composed: true, detail: { value: '' } }));
    this.__commit(previous);
    this.focus();
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
    this.__writeValue();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-input': XInput;
  }
}

export { XInput };
export default define(XInput);
