/**
 * x-form —— 表单容器（布局分类 · 表单）。
 *
 * 三件事：
 *  1. 布局编排（属性两两正交、各管一轴，经 CSS 自定义属性穿透 shadow 下发给 x-form-item，零 JS 逐个设置）：
 *     - `layout`（轴2：item 之间）：vertical 纵向堆叠 / horizontal 横排自动换行——只管输入项怎么排，不碰 label；
 *     - `label-position`（轴1：label 与控件）：top 上下堆叠 / left 左右并排，与 layout 无关；
 *     - `label-width`（label 列宽）/ `label-align`（label 文本对齐，仅 left 模式有意义）/ `gap`（item 间距）。
 *     - `columns`（等宽列）：指定列数后 item 改走 grid 等宽分发（横排长短不齐的根治方案），
 *       并向控件下发 `--form-control-width:100%` 把文本类控件（input/textarea/select/file-input）拉满格宽；
 *       纵向+columns=2 即双列桌面表单，horizontal+columns=N 即 N 列筛选栏；不写维持 flex 自然宽。
 *       footer 自动通栏（grid-column 1/-1）。
 *     默认值开箱即经典桌面表单：`layout=vertical`（单列逐行）+ `label-position=left` + `gap=20px`，
 *     label-width 不写时自动测量全表单最宽 label 回填对齐；筛选栏等横排场景显式写 `layout="horizontal"`。
 *     footer 无条件通栏沉底（width:100% / grid-column:1/-1），不参与 layout 流向。
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
import type { XFormFooter } from './x-form-footer.js';
import formStyles from './x-form.css?inline';

export type FormLayout = 'vertical' | 'horizontal';

/** gap 别名 → 令牌值；未命中原样作 CSS 长度 */
const GAP_ALIAS: Record<string, string> = {
  none: '0',
  xs: 'var(--xie-space-1)',
  sm: 'var(--xie-space-2)',
  md: 'var(--xie-space-3)',
  lg: 'var(--xie-space-4)',
  xl: 'var(--xie-space-5)',
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
    labelPosition: { type: 'String', reflect: true, default: 'left' },
    labelAlign: { type: 'String', reflect: true, default: '' },
    labelWidth: { type: 'String', reflect: true, default: '' },
    columns: { type: 'String', reflect: true, default: '' },
    gap: { type: 'String', default: '20px' },
    disabled: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [formStyles];

  declare layout: FormLayout;
  declare labelPosition: FormLabelPosition | '';
  declare labelAlign: FormLabelAlign | '';
  declare labelWidth: string;
  /** 等宽列数（数字串；空 = 不开，维持 flex 自然宽） */
  declare columns: string;
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
      this.__queueLabelMeasure();
    });
    this.__syncLayout();
    this.__syncDisabled();
    this.__ensureSnapshot();
    this.__queueLabelMeasure();
  }

  protected override updated(): void {
    this.__syncLayout();
    this.__syncDisabled();
    this.__queueLabelMeasure();
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
    const s = this.style;
    // 轴1（label↔控件）：位置/对齐/列宽独立下发，未写落到内置默认
    s.setProperty('--form-label-position', this.labelPosition || 'top');
    s.setProperty('--form-label-align', this.labelAlign || 'start');
    // label-width：显式值直发；left 模式且未写时交给 __measureLabels 回填测量值（不在此写 auto 覆盖）；top 模式写 auto
    if (this.labelWidth) s.setProperty('--form-label-width', this.labelWidth);
    else if ((this.labelPosition || 'top') !== 'left') s.setProperty('--form-label-width', 'auto');
    // 轴2（item↔item）：layout 直驱流向——vertical→纵列不换行；horizontal→横排换行
    const row = this.layout === 'horizontal';
    s.setProperty('--form-items-dir', row ? 'row' : 'column');
    s.setProperty('--form-items-wrap', row ? 'wrap' : 'nowrap');
    const gap = (this.gap || '').trim();
    s.setProperty('--form-gap', gap ? GAP_ALIAS[gap] ?? gap : 'var(--xie-space-4)');
    // 等宽列：合法数字时切 grid 分发并拉满文本类控件；非法/未写保持 flex 自然宽
    const cols = parseInt(this.columns, 10);
    if (Number.isFinite(cols) && cols > 0) {
      s.setProperty('--form-columns', `repeat(${cols}, minmax(0, 1fr))`);
      s.setProperty('--form-control-width', '100%');
    } else {
      s.removeProperty('--form-columns');
      s.removeProperty('--form-control-width');
    }
    // footer 的 align/label-offset 也读继承的 --form-*，随布局变更重算
    this.__refreshFooters();
  }

  /** 驱动所有后代 x-form-footer 重算对齐/缩进（它们可能先于 form 升级，首读 --form-* 为空） */
  private __refreshFooters(): void {
    for (const ft of Array.from(this.querySelectorAll<XFormFooter>('x-form-footer'))) ft.refreshLayout();
  }

  /* ------------------------------- label 宽度 auto 测量 ------------------------------- */

  private __measureQueued = false;

  /** 微任务合并排队：slotchange/属性变更可能连续触发，一次只测一轮；未就绪时退到 rAF 重试 */
  private __queueLabelMeasure(): void {
    if (this.__measureQueued) return;
    this.__measureQueued = true;
    queueMicrotask(() => {
      this.__measureQueued = false;
      if (!this.__measureLabels()) this.__retryMeasure();
    });
  }

  /** 子项尚未完成首次渲染（动态 append 后自定义元素升级在微任务里）：下一帧重试直到全部就绪 */
  private __retryMeasure(): void {
    if (this.isConnected) requestAnimationFrame(() => this.__queueLabelMeasure());
  }

  /**
   * label-position=left 且用户未显式写 label-width 时：扫描各 item 的自然宽 label，
   * 取最宽者回填为 --form-label-width（Element Plus auto 做法），控件左边缘开箱即齐。
   * 全部 item 的 label 渲染就绪才测（否则漏测未升级项）；回填后宽度固定，重测幂等收敛。
   * 回填后逐个 item.refreshLayout() 让新 --_lw 生效（仅改 CSS 变量不会触发 item 的 JS 更新）。
   * 返回是否已完成测量（false = 未就绪，调用方应重试）。
   */
  private __measureLabels(): boolean {
    if ((this.labelPosition || 'top') !== 'left') { this.__refreshFooters(); return true; }
    if (this.labelWidth) { this.__refreshFooters(); return true; } // 用户显式宽度为权威，__syncLayout 已直发
    const items = this.items;
    for (const it of items) if (!it.labelRendered) return false; // 有 item 未完成首渲染，本轮作废
    let max = 0;
    for (const it of items) {
      if (it.labelWidth) continue; // 本 item 显式微调，不参与全表对齐
      max = Math.max(max, it.measuredLabelWidth);
    }
    if (max > 0) this.style.setProperty('--form-label-width', `${Math.ceil(max)}px`);
    for (const it of items) it.refreshLayout();
    this.__refreshFooters(); // label-offset 读的 --form-label-width 刚回填，footer 同步重算
    return true;
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
