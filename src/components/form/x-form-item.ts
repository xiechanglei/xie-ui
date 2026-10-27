/**
 * x-form-item —— 表单字段包装器（布局分类 · 表单）。
 *
 * 职责：把一个受控控件（x-input / x-select / x-checkbox-group …）与它的 label、错误/帮助文本
 * 组织成一个可统一排布的单元。布局不自己主张，而是读取 x-form 经 CSS 自定义属性下发的三轴：
 *  - label 与控件的关系：`--form-label-position`（top 上下堆叠 / left 左右并排）
 *  - 左右并排时 label 对齐：`--form-label-align`（start 左 / end 右 / center 居中）
 *  - label 列宽：`--form-label-width`（让各行控件左边缘对齐）
 * 本 item 的 `label-position`/`label-align`/`label-width` 若显式设置则覆盖 form 默认（逐字段微调）。
 *
 * 值/校验：控件仍是数据的权威来源（各控件自带 FCCE，值经原生 FormData 计入外层 form）。
 * item 只做「读取 + 展示」：`validate()` 调控件的原生 checkValidity，把错误信息渲染到下方；
 * 用户显式写过 `required` 会下沉给控件、并显示必填星号；`label` 会推进控件的 aria-label 做无障碍关联。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import type { Signal } from '../../core/signals.js';
import '../../tokens/index.js';
import itemStyles from './x-form-item.css?inline';

/** 被识别为「受控控件」的标签（祖先 group 排在前面，querySelector 依树序优先返回容器） */
export const FORM_CONTROL_SELECTOR =
  'x-input, x-textarea, x-select, x-checkbox-group, x-checkbox, x-radio-group, x-radio, x-switch, x-slider, x-file-input';

export type FormLabelPosition = 'top' | 'left';
export type FormLabelAlign = 'start' | 'end' | 'center';

/** 控件的公共可读面（各 FCCE 控件均具备 value/checked 之一，以及校验只读接口） */
type ControlLike = HTMLElement & {
  value?: unknown;
  checked?: boolean;
  name?: string;
  required?: boolean;
  checkValidity?: () => boolean;
  validationMessage?: string;
};

class XFormItem extends XBaseElement {
  static tag = 'x-form-item';

  static properties: Record<string, PropertyOptions> = {
    label: { type: 'String', default: '' },
    name: { type: 'String', default: '' },
    required: { type: 'Boolean', reflect: true, default: false },
    help: { type: 'String', default: '' },
    error: { type: 'String', default: '' },
    // 布局细调：空串 = 继承 x-form；显式设置则覆盖（反射便于 CSS/外部观察）
    labelPosition: { type: 'String', reflect: true, default: '' },
    labelAlign: { type: 'String', reflect: true, default: '' },
    labelWidth: { type: 'String', reflect: true, default: '' },
  };

  static styles = [itemStyles];

  declare label: string;
  declare name: string;
  declare required: boolean;
  declare help: string;
  declare error: string;
  declare labelPosition: FormLabelPosition | '';
  declare labelAlign: FormLabelAlign | '';
  declare labelWidth: string;

  private __invalid!: Signal<boolean>;
  private __message!: Signal<string>;
  private __tone!: Signal<'error' | 'help'>;
  private __labelSlotted!: Signal<boolean>;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.__invalid = this.__signal(false);
    this.__message = this.__signal('');
    this.__tone = this.__signal('help');
    this.__labelSlotted = this.__signal(false);
  }

  protected render(): TemplateResult {
    return html`<div class="item" part="item">
      <label class="label" part="label">
        <slot name="label"></slot>
        <span
          class="label-text"
          part="label-text"
          hidden=${this.derive(() => (this.__labelSlotted.value ? '' : undefined))}
          >${this.derive(() => this.label)}</span
        >
        <span class="req" part="required" hidden=${this.derive(() => (this.required ? undefined : ''))}>*</span>
      </label>
      <div class="control" part="control">
        <slot></slot>
        <div
          class="msg"
          part="message"
          data-tone=${this.derive(() => this.__tone.value)}
          hidden=${this.derive(() => (this.__message.value ? undefined : ''))}
        >
          ${this.derive(() => this.__message.value)}
        </div>
      </div>
    </div>`;
  }

  protected firstUpdated(): void {
    const labelSlot = this.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="label"]')!;
    labelSlot.addEventListener('slotchange', () => {
      this.__labelSlotted.value = labelSlot.assignedNodes({ flatten: true }).length > 0;
    });
    this.__labelSlotted.value = labelSlot.assignedNodes({ flatten: true }).length > 0;

    // 控件值变化时：若已处于错误态则实时复检（边改边消错），并同步 label/name 下沉
    this.addEventListener('x-change', this.__onFieldEvent as EventListener);
    this.addEventListener('x-input', this.__onFieldEvent as EventListener);
    const slot = this.shadowRoot!.querySelector('slot:not([name])')!;
    slot.addEventListener('slotchange', () => this.__syncControl());
    this.__syncControl();
    this.__syncLayout();
    this.__syncMessage();
  }

  protected override updated(): void {
    this.__syncControl();
    this.__syncLayout();
    this.__syncMessage();
  }

  /** 本 item 内的受控控件（优先容器，如 x-checkbox-group 而非其内部 x-checkbox） */
  get control(): ControlLike | null {
    return this.querySelector<ControlLike>(FORM_CONTROL_SELECTOR);
  }

  /** 当前控件值（无控件返回 undefined）；switch/checkbox 优先读 checked */
  get value(): unknown {
    const c = this.control;
    if (!c) return undefined;
    if (typeof c.checked === 'boolean' && c.value === undefined) return c.checked;
    return 'value' in c ? c.value : c.checked;
  }

  /** 绑定键：item 的 name 优先，否则回退控件的 name */
  get fieldName(): string {
    return this.name || this.control?.name || '';
  }

  /**
   * 校验本字段：调控件原生 checkValidity（各 FCCE 控件已镜像 required/type/pattern 等约束）。
   * 无控件时按 required 兜底判空。结果渲染到下方消息，返回是否通过。
   */
  validate(): boolean {
    if (this.error) {
      this.__invalid.value = true;
      this.__syncMessage();
      return false;
    }
    const c = this.control;
    let ok = true;
    if (c && typeof c.checkValidity === 'function') ok = c.checkValidity();
    else if (this.required) ok = !this.__isEmpty(this.value);
    this.__invalid.value = !ok;
    this.__syncMessage();
    return ok;
  }

  /** 清除错误态（不校验） */
  clearValidate(): void {
    this.__invalid.value = false;
    this.__syncMessage();
  }

  /** 聚焦本字段控件 */
  override focus(options?: FocusOptions): void {
    (this.control ?? this).focus(options);
  }

  private __onFieldEvent = (): void => {
    this.__syncControl();
    if (this.__invalid.value) this.validate();
    else this.__syncMessage();
  };

  /** required / label / name 下沉到控件 + aria 关联（不覆盖用户已写的） */
  private __syncControl(): void {
    const c = this.control;
    if (!c) return;
    if (this.required) c.required = true;
    if (this.label && !c.getAttribute('aria-label')) c.setAttribute('aria-label', this.label);
    if (this.name && !c.name) c.name = this.name;
  }

  /** 解析三轴布局：本 item 显式值 > 继承 form 的 --form-* > 内置默认，写成局部变量供 CSS 用 */
  private __syncLayout(): void {
    const cs = getComputedStyle(this);
    const position =
      this.labelPosition || (cs.getPropertyValue('--form-label-position').trim() as FormLabelPosition) || 'top';
    const align = this.labelAlign || (cs.getPropertyValue('--form-label-align').trim() as FormLabelAlign) || 'start';
    const width = this.labelWidth || cs.getPropertyValue('--form-label-width').trim() || 'auto';
    const s = this.style;
    s.setProperty('--_dir', position === 'top' ? 'column' : 'row');
    s.setProperty('--_la', align === 'end' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start');
    s.setProperty('--_lw', position === 'top' ? 'auto' : width);
    this.toggleAttribute('data-horizontal', position !== 'top');
  }

  /** 消息优先级：手动 error > 校验失败信息 > help 帮助文本 */
  private __syncMessage(): void {
    if (this.error) {
      this.__message.value = this.error;
      this.__tone.value = 'error';
      return;
    }
    if (this.__invalid.value) {
      const c = this.control;
      this.__message.value = c?.validationMessage || '此项为必填或格式不正确';
      this.__tone.value = 'error';
      return;
    }
    if (this.help) {
      this.__message.value = this.help;
      this.__tone.value = 'help';
      return;
    }
    this.__message.value = '';
  }

  private __isEmpty(v: unknown): boolean {
    if (v == null || v === false || v === '') return true;
    if (Array.isArray(v)) return v.length === 0;
    return false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-form-item': XFormItem;
  }
}

export { XFormItem };
export default define(XFormItem);
