/**
 * x-checkbox —— 复选框（表单分类，原子件）。
 *
 * shadow 内包一个原生 `<input type="checkbox">`（appearance 关掉自绘，键盘 Space/Tab、无障碍角色、
 * 点击切换全部白送），勾选/三方态视觉纯由 CSS 的 `:checked`/`:indeterminate` 驱动，JS 只在信号↔原生之间单向回写。
 * 形态 `shape`(square/rounded/circle) × 语义色 `color`(6 角色，选中底色/描边取色) 双轴正交，
 * 尺寸 `size`(sm/md/lg) 吃 `--xie-size-*`；颜色/圆角全部走令牌，随主题实时联动。
 *
 * form 关联（本库首个 FCCE）：`static formAssociated` + `attachInternals()`，选中时把 `value` 经
 * `internals.setFormValue` 计入外层 `<form>` 的 FormData（键取宿主 name attribute），`required` 走原生校验。
 *
 * 事件：用户切换派发可取消的 `x-change`（detail:{ checked, value }），被 preventDefault 则回退（受控写法）；
 * 程序化设 `checked` 不派发事件。`toggle(force?)` 供外部（如 item 的文字点击）复用同一套受控逻辑。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import checkboxStyles from './x-checkbox.css?inline';

/** 形态轴（方框形状） */
export type CheckboxShape = 'square' | 'rounded' | 'circle';
/** 语义色轴：6 个强调角色，缺省 primary */
export type CheckboxColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
/** 尺寸档位 */
export type CheckboxSize = 'sm' | 'md' | 'lg';

class XCheckbox extends XBaseElement {
  static tag = 'x-checkbox';
  /** 开启 form 关联（Form-Associated Custom Element） */
  static formAssociated = true;

  static properties: Record<string, PropertyOptions> = {
    checked: { type: 'Boolean', reflect: true, default: false },
    indeterminate: { type: 'Boolean', reflect: true, default: false },
    disabled: { type: 'Boolean', reflect: true, default: false },
    required: { type: 'Boolean', reflect: true, default: false },
    // name 反射：FCCE 的 FormData 键取自「宿主 name attribute」，故必须保持 attribute 与 property 同步
    name: { type: 'String', reflect: true, default: '' },
    value: { type: 'String', default: 'on' },
    label: { type: 'String', default: '' },
    size: { type: 'String', reflect: true, default: 'md' },
    shape: { type: 'String', reflect: true, default: 'rounded' },
    color: { type: 'String', reflect: true, default: 'primary' },
  };

  static styles = [checkboxStyles];

  declare checked: boolean;
  declare indeterminate: boolean;
  declare disabled: boolean;
  declare required: boolean;
  declare name: string;
  declare value: string;
  declare label: string;
  declare size: CheckboxSize;
  declare shape: CheckboxShape;
  declare color: CheckboxColor;

  /** FCCE 内部句柄（供 item 子类复用） */
  protected internals!: ElementInternals;

  constructor() {
    super();
    // delegatesFocus：点宿主/聚焦宿主时透传到内部原生 input
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this.internals = this.attachInternals();
  }

  /** 所属 form（FCCE 提供） */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  protected render(): TemplateResult {
    return html`<span class="box" part="box">
      <input
        class="native"
        part="native"
        type="checkbox"
        disabled=${this.derive(() => this.disabled)}
        aria-label=${this.derive(() => this.label || undefined)}
        aria-checked=${this.derive(() => (this.indeterminate ? 'mixed' : String(!!this.checked)))}
      /><span class="mark" part="mark"></span>
    </span>`;
  }

  protected firstUpdated(): void {
    this.__native().addEventListener('change', this.__onChange);
    this.__sync();
  }

  protected override updated(): void {
    // 信号 → 原生 input / FormData / 校验态 单向回写（同值不写，避免打断）
    this.__sync();
  }

  override disconnectedCallback(): void {
    const native = this.shadowRoot?.querySelector('input');
    if (native) native.removeEventListener('change', this.__onChange);
    super.disconnectedCallback();
  }

  /** FCCE：随 fieldset disabled 一起禁用 */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  /** 切换勾选。force 指定目标态；派发可取消的 x-change，被取消则不改状态（受控回退）。 */
  toggle(force?: boolean): void {
    if (this.disabled) return;
    const next = force ?? !this.checked;
    if (next === this.checked && !(next === false && this.indeterminate)) return;
    if (!this.__dispatchChange(next)) return;
    this.checked = next;
    this.indeterminate = false; // 主动勾选/取消即清除三方态
  }

  protected __native(): HTMLInputElement {
    return this.shadowRoot!.querySelector<HTMLInputElement>('.native')!;
  }

  /** 原生 change（用户点击/Space）：以原生态为目标走同一受控流程 */
  private __onChange = (): void => {
    const native = this.__native();
    const next = native.checked;
    if (next === this.checked && !this.indeterminate) return;
    if (!this.__dispatchChange(next)) {
      this.__sync(); // 取消 → 用权威态回写，撤销原生刚才的翻转
      return;
    }
    this.checked = next;
    this.indeterminate = false;
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

  /** 把信号态写回原生 input，并同步 FormData 与校验态 */
  private __sync(): void {
    const native = this.shadowRoot?.querySelector<HTMLInputElement>('.native');
    if (!native) return;
    native.checked = !!this.checked;
    native.indeterminate = !!this.indeterminate;
    // 三方态与未勾选都不计入 FormData（与原生一致：只有 checked 才提交）
    this.internals.setFormValue(this.checked && !this.indeterminate ? this.value : null);
    this.__syncValidity(native);
  }

  private __syncValidity(native: HTMLInputElement): void {
    if (!this.required) {
      this.internals.setValidity({});
      return;
    }
    if (!this.checked) {
      this.internals.setValidity({ valueMissing: true }, '请勾选此项', native);
    } else {
      this.internals.setValidity({});
    }
  }

  /** 焦点委托给内部原生 input */
  override focus(options?: FocusOptions): void {
    const native = this.shadowRoot?.querySelector<HTMLInputElement>('.native');
    (native ?? this).focus(options);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-checkbox': XCheckbox;
  }
}

export { XCheckbox };
export default define(XCheckbox);
