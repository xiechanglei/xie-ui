/**
 * x-form —— 表单容器（布局分类 · 表单）。
 *
 * 三件事：
 *  1. 布局编排（三轴，经 CSS 自定义属性穿透 shadow 下发给 x-form-item，零 JS 逐个设置）：
 *     - `layout` 预设一键设好「label 位置 + item 流向」：vertical(top+stack) / horizontal(left+stack) / inline(left+row)；
 *     - 细调 `label-position`/`label-align`/`label-width`（轴1：label 与控件）、`flow`（轴2：item 之间 stack/row 换行）、`gap`。
 *     显式细调优先于预设。
 *  2. 数据收集：各控件自带 FCCE，但**表单归属是「节点树」概念**——放在 shadow 内的 `<form>`
 *     关联不到 light DOM 里经 slot 投影进来的控件（浏览器实测：连原生 input 被 slot 进 shadow form 也不计入），
 *     故收集由 x-form **手动遍历「最外层」控件**、按公开值面（value/checked/files/values）聚合出 `values`/`formData()`
 *     （重复键自动收数组；禁用项/未勾选不计入，与原生 FormData 语义一致）。shadow 内仍保留真 `<form>` 作结构载体与提交派发。
 *  3. 校验/提交：`validate()` 遍历 x-form-item 走控件原生 checkValidity（与 form 归属无关，照常可用）；`submit()` 触发内部 form 的
 *     requestSubmit → 拦截为可取消的 `x-submit`（默认不导航）。`reset()` 按初始快照还原各控件并清错误态。
 *
 * `disabled`：同样因跨树而无法靠 `<fieldset disabled>` 原生下发，改由 x-form 显式置各控件 disabled（用 WeakSet 记录强制态，释放时不误清用户自设的禁用）。
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
  disabled?: boolean;
  files?: File[];
  values?: string[];
  multiple?: boolean;
  reset?: () => void;
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
  /** form 级 disabled 强制下发的控件集合（释放时只清「确实是 form 逼禁的」那些） */
  private readonly __forceDisabled = new WeakSet<ControlLike>();

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
      this.__syncDisabled();
      this.__emitChange();
    });
    this.__syncLayout();
    this.__syncDisabled();
    this.__ensureSnapshot();
  }

  protected override updated(): void {
    this.__syncLayout();
    this.__syncDisabled();
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

  /** 所有「最外层」受控控件：排除嵌套在另一控件内的子项（如 x-radio-group 里的 x-radio、x-checkbox-group 里的 x-checkbox），避免重复计入。 */
  private __controls(): ControlLike[] {
    const all = Array.from(this.querySelectorAll<ControlLike>(FORM_CONTROL_SELECTOR));
    return all.filter((el) => { const p = el.parentElement; return !p || !p.closest(FORM_CONTROL_SELECTOR); });
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

  /** disabled 下发：跨树无法靠 fieldset 原生禁用，显式置各控件 disabled；仅释放“确实是 form 逼禁的”那些 */
  private __syncDisabled(): void {
    for (const c of this.__controls()) {
      if (this.disabled) {
        if (!c.disabled) {
          c.disabled = true;
          this.__forceDisabled.add(c);
        }
      } else if (this.__forceDisabled.has(c)) {
        c.disabled = false;
        this.__forceDisabled.delete(c);
      }
    }
  }

  /** 原始 FormData（含 File 条目）：手动遍历最外层控件聚合（shadow form 关联不到 slot 控件） */
  formData(): FormData {
    const fd = new FormData();
    for (const c of this.__controls()) {
      const name = c.name;
      if (!name || c.disabled) continue;
      for (const v of this.__entriesFor(c)) fd.append(name, v instanceof File ? v : String(v));
    }
    return fd;
  }

  /**
   * 单个控件对 FormData 的贡献值数组（镜像各控件内部 setFormValue 的语义）：
   *  - file：逐个 File；select-multiple / checkbox-group：逐个字符串；
   *  - checkbox / radio / switch：仅 checked 才计入（值取 value，缺省 'on'）；
   *  - 其余标量（input/textarea/slider/select/radio-group）：String(value)，空串仅对文本类保留（select/radio-group 空值跳过）。
   */
  private __entriesFor(c: ControlLike): (string | File)[] {
    const tag = c.tagName;
    if (tag === 'X-FILE-INPUT') return Array.isArray(c.files) ? [...c.files] : [];
    if (tag === 'X-SELECT' && c.multiple) return Array.isArray(c.values) ? c.values.filter((v) => v !== '') : [];
    if (tag === 'X-CHECKBOX-GROUP') return Array.isArray(c.value) ? (c.value as string[]).filter((v) => v !== '') : [];
    if (tag === 'X-CHECKBOX' || tag === 'X-RADIO' || tag === 'X-SWITCH') return c.checked ? [String(c.value ?? 'on')] : [];
    if (tag === 'X-RADIO-GROUP') {
      const sel = (c as unknown as { selectedValue?: string }).selectedValue ?? (c.value == null ? '' : String(c.value));
      return sel ? [sel] : [];
    }
    if (tag === 'X-SLIDER') {
      // 档位滑块：value 是下标，镜像其 setFormValue 语义——计入档位标签（无标签则下标）
      const sl = c as unknown as { options?: string; value?: number };
      const opts = sl.options ? sl.options.split(',') : [];
      const i = Math.min(Math.max(Math.round(Number(sl.value) || 0), 0), Math.max(opts.length - 1, 0));
      return [opts[i] ?? String(i)];
    }
    const v = c.value;
    if (v == null) return [];
    const s = String(v);
    if (s === '' && tag === 'X-SELECT') return [];
    return [s];
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

  /** 批量写入控件值（按 name 匹配；容器控件直达子项；程序化不派发事件） */
  setValues(obj: Record<string, unknown>): void {
    for (const el of this.__controls()) {
      const name = el.name;
      if (!name || !(name in obj)) continue;
      this.__applyTo(el, obj[name]);
    }
    this.__snapshotTaken = false;
    this.__ensureSnapshot();
  }

  /** 读取控件的「可还原快照值」（容器取聚合态；file 用哨兵；开关/复选取 checked） */
  private __snapshotOf(el: ControlLike): unknown {
    const tag = el.tagName;
    if (tag === 'X-FILE-INPUT') return '__file__';
    if (tag === 'X-SELECT' && el.multiple) return Array.isArray(el.values) ? [...el.values] : [];
    if (tag === 'X-RADIO-GROUP') return (el as unknown as { selectedValue?: string }).selectedValue ?? el.value ?? '';
    if (tag === 'X-CHECKBOX-GROUP') return Array.isArray(el.value) ? [...(el.value as string[])] : [];
    if (typeof el.checked === 'boolean') return el.checked;
    return 'value' in el ? el.value : undefined;
  }

  /** 将快照/用户值写回控件：容器直接操作子项 checked（不依赖 group setter，不写只读 getter） */
  private __applyTo(el: ControlLike, v: unknown): void {
    const tag = el.tagName;
    if (tag === 'X-FILE-INPUT') return; // 文件不可程序化写入
    if (tag === 'X-SELECT' && el.multiple) {
      // 多选选中集在内部 values 轨道上，写单轨 value 不生效
      el.values = Array.isArray(v) ? v.map(String) : v == null || v === '' ? [] : [String(v)];
      return;
    }
    if (tag === 'X-RADIO-GROUP') {
      for (const r of Array.from(el.querySelectorAll<ControlLike>('x-radio, x-radio-item'))) r.checked = String(r.value) === String(v);
      el.value = v == null ? '' : String(v); // 回写 group.value，保证收集（读 group.value）与子项一致
      return;
    }
    if (tag === 'X-CHECKBOX-GROUP') {
      const set = new Set(Array.isArray(v) ? v.map(String) : []);
      for (const c of Array.from(el.querySelectorAll<ControlLike>('x-checkbox, x-checkbox-item'))) c.checked = set.has(String(c.value));
      return;
    }
    if (typeof v === 'boolean' && typeof el.checked === 'boolean') el.checked = v;
    else if ('value' in el) el.value = v;
  }

  private __ensureSnapshot(): void {
    if (this.__snapshotTaken) return;
    this.__snapshotTaken = true;
    this.__initial.clear();
    for (const el of this.__controls()) this.__initial.set(el, this.__snapshotOf(el));
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
      if (v === '__file__') el.reset?.();
      else this.__applyTo(el, v);
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
