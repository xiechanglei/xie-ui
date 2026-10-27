/**
 * x-form —— 表单容器（布局分类 · 表单）。
 *
 * 三件事：
 *  1. 布局编排（三轴，经 CSS 自定义属性穿透 shadow 下发给 x-form-item，零 JS 逐个设置）：
 *     - `layout` 预设一键设好「label 位置 + item 流向」：vertical(top+stack) / horizontal(left+stack) / inline(left+row)；
 *     - 细调 `label-position`/`label-align`/`label-width`（轴1：label 与控件）、`flow`（轴2：item 之间 stack/row 换行）、`gap`。
 *     显式细调优先于预设。
 *  2. 数据收集：shadow 内放一个真正的 `<form>` + `<fieldset>` + `<slot>`；各控件自带 FCCE，
 *     经扁平树归属到这个内部 form，`new FormData()` 直接聚合出 `values`（重复键自动收数组）。
 *  3. 校验/提交：`validate()` 遍历 x-form-item 走控件原生 checkValidity；`submit()` 触发内部 form 的
 *     requestSubmit → 拦截为可取消的 `x-submit`（默认不导航）。`reset()` 按初始快照还原各控件并清错误态。
 *
 * `disabled` 交给 `<fieldset disabled>` 的原生语义：自动禁用其中所有 FCCE 控件（各自 formDisabledCallback 生效）。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import './x-form-item.js';
import { FORM_CONTROL_SELECTOR, type XFormItem, type FormLabelPosition, type FormLabelAlign } from './x-form-item.js';
import formStyles from './x-form.css?inline';

export type FormLayout = 'vertical' | 'horizontal' | 'inline';
export type FormFlow = 'stack' | 'row';

/** layout 预设 → label 位置 + item 流向 */
const LAYOUT_PRESET: Record<FormLayout, { position: FormLabelPosition; flow: FormFlow }> = {
  vertical: { position: 'top', flow: 'stack' },
  horizontal: { position: 'left', flow: 'stack' },
  inline: { position: 'left', flow: 'row' },
};

/** gap 别名 → 令牌值；未命中原样作 CSS 长度 */
const GAP_ALIAS: Record<string, string> = {
  none: '0',
  xs: 'var(--xie-space-1)',
  sm: 'var(--xie-space-2)',
  md: 'var(--xie-space-3)',
  lg: 'var(--xie-space-4)',
};

type ControlLike = HTMLElement & {
  value?: unknown;
  checked?: boolean;
  name?: string;
};

class XForm extends XBaseElement {
  static tag = 'x-form';

  static properties: Record<string, PropertyOptions> = {
    layout: { type: 'String', reflect: true, default: 'vertical' },
    labelPosition: { type: 'String', reflect: true, default: '' },
    labelAlign: { type: 'String', reflect: true, default: '' },
    labelWidth: { type: 'String', reflect: true, default: '' },
    flow: { type: 'String', reflect: true, default: '' },
    gap: { type: 'String', default: '' },
    disabled: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [formStyles];

  declare layout: FormLayout;
  declare labelPosition: FormLabelPosition | '';
  declare labelAlign: FormLabelAlign | '';
  declare labelWidth: string;
  declare flow: FormFlow | '';
  declare gap: string;
  declare disabled: boolean;

  /** 初始值快照（reset 用）：控件元素 → value/checked */
  private readonly __initial = new Map<ControlLike, unknown>();
  private __snapshotTaken = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<form class="native" part="form" novalidate>
      <fieldset class="items" part="items"><slot></slot></fieldset>
    </form>`;
  }

  protected firstUpdated(): void {
    this.__formEl().addEventListener('submit', this.__onSubmit);
    this.addEventListener('x-change', this.__onFieldChange as EventListener);
    this.addEventListener('x-input', this.__onFieldChange as EventListener);
    const slot = this.shadowRoot!.querySelector('slot')!;
    slot.addEventListener('slotchange', () => {
      this.__ensureSnapshot();
      this.__emitChange();
    });
    this.__syncLayout();
    this.__ensureSnapshot();
  }

  protected override updated(): void {
    this.__syncLayout();
    const fs = this.shadowRoot!.querySelector<HTMLFieldSetElement>('fieldset');
    if (fs) fs.disabled = this.disabled;
  }

  private __formEl(): HTMLFormElement {
    return this.shadowRoot!.querySelector<HTMLFormElement>('form.native')!;
  }

  /** 所有 x-form-item（含嵌套） */
  get items(): XFormItem[] {
    return Array.from(this.querySelectorAll<XFormItem>('x-form-item'));
  }

  /** 所有受控控件（含嵌套；用于收集/快照/还原） */
  private __controls(): ControlLike[] {
    return Array.from(this.querySelectorAll<ControlLike>(FORM_CONTROL_SELECTOR));
  }

  /* ------------------------------- 布局下发 ------------------------------- */

  private __syncLayout(): void {
    const preset = LAYOUT_PRESET[this.layout] ?? LAYOUT_PRESET.vertical;
    const position = this.labelPosition || preset.position;
    const flow = this.flow || preset.flow;
    const s = this.style;
    s.setProperty('--form-label-position', position);
    s.setProperty('--form-label-align', this.labelAlign || 'start');
    s.setProperty('--form-label-width', this.labelWidth || 'auto');
    s.setProperty('--form-flow', flow);
    // 轴2（item 之间流向）：stack→纵列不换行；row→横排换行
    s.setProperty('--form-items-dir', flow === 'row' ? 'row' : 'column');
    s.setProperty('--form-items-wrap', flow === 'row' ? 'wrap' : 'nowrap');
    const gap = (this.gap || '').trim();
    s.setProperty('--form-gap', gap ? GAP_ALIAS[gap] ?? gap : 'var(--xie-space-4)');
  }

  /* ------------------------------- 数据收集 ------------------------------- */

  /** 原始 FormData（含 File 条目） */
  formData(): FormData {
    return new FormData(this.__formEl());
  }

  /** 聚合值对象：重复键（多选/复选组/多文件）自动收成数组 */
  get values(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    this.formData().forEach((v, k) => {
      if (k in out) {
        out[k] = Array.isArray(out[k]) ? [...(out[k] as unknown[]), v] : [out[k], v];
      } else {
        out[k] = v;
      }
    });
    return out;
  }

  /** 批量写入控件值（按 name 匹配；checked 走布尔、其余走 value；程序化不派发事件） */
  setValues(obj: Record<string, unknown>): void {
    for (const el of this.__controls()) {
      const name = el.name;
      if (!name || !(name in obj)) continue;
      const v = obj[name];
      if (typeof v === 'boolean' && typeof el.checked === 'boolean') el.checked = v;
      else if ('value' in el) el.value = v;
    }
    this.__snapshotTaken = false;
    this.__ensureSnapshot();
  }

  private __ensureSnapshot(): void {
    if (this.__snapshotTaken) return;
    this.__snapshotTaken = true;
    this.__initial.clear();
    for (const el of this.__controls()) {
      if (typeof el.checked === 'boolean' && el.value === undefined) this.__initial.set(el, el.checked);
      else if ('value' in el) this.__initial.set(el, el.value);
    }
  }

  /* ------------------------------- 校验/提交 ------------------------------- */

  /** 校验全部字段；失败时聚焦第一个非法项并派发 x-invalid。返回是否通过。 */
  validate(): boolean {
    let ok = true;
    let firstInvalid: XFormItem | null = null;
    for (const it of this.items) {
      if (!it.validate()) {
        ok = false;
        if (!firstInvalid) firstInvalid = it;
      }
    }
    if (!ok) {
      firstInvalid?.focus();
      this.dispatchEvent(new CustomEvent('x-invalid', { bubbles: true, composed: true }));
    }
    return ok;
  }

  /** 清除全部字段的错误态 */
  clearValidate(): void {
    for (const it of this.items) it.clearValidate();
  }

  /** 触发提交（走内部 form 的 requestSubmit → 拦截为 x-submit） */
  submit(): void {
    this.__formEl().requestSubmit();
  }

  /** 重置：还原各控件到初始值 + 清除错误态 */
  reset(): void {
    for (const [el, v] of this.__initial) {
      if (typeof v === 'boolean' && typeof el.checked === 'boolean') el.checked = v;
      else if ('value' in el) el.value = v;
    }
    this.clearValidate();
    this.__emitChange();
  }

  private __onSubmit = (event: Event): void => {
    event.preventDefault(); // 绝不真正导航/刷新
    if (!this.validate()) return;
    this.dispatchEvent(
      new CustomEvent('x-submit', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { values: this.values },
      }),
    );
  };

  private __onFieldChange = (event: Event): void => {
    if (event.target === this) return; // 忽略自身转发的 x-change 回环
    queueMicrotask(() => this.__emitChange());
  };

  /** 字段变化后向外包发聚合 x-change：detail { name, value, values } */
  private __emitChange(): void {
    this.dispatchEvent(
      new CustomEvent('x-change', {
        bubbles: true,
        composed: true,
        detail: { values: this.values },
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-form': XForm;
  }
}

export { XForm };
export default define(XForm);
