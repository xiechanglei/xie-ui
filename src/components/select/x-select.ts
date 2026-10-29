/**
 * x-select —— 下拉选择（表单分类）。
 *
 * 触发件为 shadow 内 <button role="combobox">，弹层为 position:fixed 的自绘 listbox
 * （原生 select 的弹出面板由操作系统绘制、CSS 进不去，观感不可控，故整体自绘）：
 * 弹层吃全局令牌（表面色/圆角/阴影/语义色/暗色），随主题实时联动；空间不足自动向上翻转。
 * 键盘完整支持：↑↓ 开合与移动、Home/End、Enter/Space 选中、Esc 关闭、输入式首字母不做（可反馈再加）。
 *
 * 选项来源二选一（可混用，数组优先）：
 *  1) light DOM 里写原生 `<option value=.. >文本</option>`（或 `<x-select-option>`）；
 *  2) JS 设 `options` 数组（`{ value, label, disabled }` 或字符串）。
 * `placeholder` 为未选中时触发件上的占位文本（ muted 色），不进入弹层列表。
 *
 * 多选：`multiple` 后弹层选项可勾选多项（选中不关弹层），`values: string[]` 读写，展示文本用「、」拼接；
 * form 提交时选中值以同名多项进 FormData，`required` 校验改为「至少选一项」。
 *
 * 事件：选择变化派发可取消的 `x-change`（单选 detail:{ value: string, previousValue }；多选 detail:{ value: string[], previousValue: string[] }），取消则回退。
 * FCCE：value 经 internals 计入 form；`required` 未选时走原生校验。形态 variant / 语义色 color / 尺寸 size 沿用输入类约定。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import type { Signal } from '../../core/signals.js';
import { scrollTargetsFor } from '../../core/overlay.js';
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
    multiple: { type: 'Boolean', reflect: true, default: false },
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
  declare multiple: boolean;
  declare variant: SelectVariant;
  declare color: SelectColor;
  declare size: SelectSize;
  declare label: string;

  /** options 走普通字段（非反射属性）：数组无法用 String/Number/Boolean 类型桥接 */
  private _options?: SelectOptionInput[];
  private __committed = '';
  private internals!: ElementInternals;

  /** 弹层开合（信号驱动 aria-expanded 与 chevron 旋转；宿主 class 驱动弹层显隐） */
  private __open!: Signal<boolean>;
  /** 触发件展示文本（options 非响应式，故命令式刷新进信号） */
  private __display!: Signal<string>;
  /** 当前缓存的选项列表（弹层 li 与之按下标一一对应） */
  private __items: SelectOption[] = [];
  /** 键盘高亮下标，-1 为无 */
  private __active = -1;
  /** 多选选中集（信号数组，仅 multiple 模式有意义；单多选互转时在 updated 里搬迁） */
  private __multiSel!: Signal<string[]>;
  private __wasMultiple?: boolean;
  /** 本次打开挂上的滚动监听目标集（window + 铺平树祖先 shadow roots，卸载时原样回收） */
  private __scrollTargets: EventTarget[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this.internals = this.attachInternals();
    this.__open = this.__signal(false);
    this.__display = this.__signal('');
    this.__multiSel = this.__signal<string[]>([]);
    // 升级前迁移：`options` 是访问器而非声明属性，基座通用快照管不到；
    // 若消费方在 upgrade 前写 `el.options=[...]`，会落成遮蔽访问器的实例自有属性，这里捕获并回放给 setter
    if (Object.hasOwn(this, 'options')) {
      const pre = (this as unknown as { options?: SelectOptionInput[] }).options;
      delete (this as unknown as { options?: SelectOptionInput[] }).options;
      this.options = pre;
    }
  }

  set options(v: SelectOptionInput[] | undefined) {
    this._options = v;
    this.__populate();
    this.requestUpdate();
  }
  get options(): SelectOptionInput[] | undefined {
    return this._options;
  }

  /** 多选模式的选中值数组（JS 访问）；单选模式下退化为 [value] 或 [] */
  get values(): string[] {
    return this.multiple ? [...this.__multiSel.value] : this.value ? [this.value] : [];
  }
  set values(v: string[] | undefined) {
    if (this.multiple) {
      this.__multiSel.value = Array.isArray(v) ? v.map(String) : [];
    } else {
      this.value = v && v.length ? String(v[0]) : '';
    }
    this.__sync();
    this.requestUpdate();
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

  protected render(): TemplateResult {
    return html`<div class="field" part="field">
      <button
        class="trigger"
        part="trigger"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-controls="popup"
        aria-expanded=${this.derive(() => String(this.__open.value))}
        aria-disabled=${this.derive(() => String(this.disabled))}
        aria-label=${this.derive(() => this.label || undefined)}
      ><span class="value" part="value" data-ph=${this.derive(() =>
        this.multiple ? (this.__multiSel.value.length ? undefined : true) : this.value ? undefined : true
      )}>${() => this.__display.value}</span
      ><x-icon class="chevron" part="chevron" name="chevron-down" size="16px"></x-icon></button>
      <div class="src" part="source"><slot></slot></div>
    </div>
    <ul
      class="popup"
      part="popup"
      id="popup"
      role="listbox"
      aria-multiselectable=${this.derive(() => String(this.multiple))}
      tabindex="-1"
    ></ul>`;
  }

  protected firstUpdated(): void {
    const trigger = this.__trigger();
    trigger.addEventListener('click', this.__onTriggerClick);
    trigger.addEventListener('keydown', this.__onKeydown);
    const slot = this.shadowRoot!.querySelector('slot')!;
    slot.addEventListener('slotchange', () => this.__populate());
    this.__committed = this.value ?? '';
    this.__populate();
  }

  protected override updated(): void {
    if (this.disabled) this.__hide();
    // 模式切换搬迁：把旧选中结果带到新模式（单→多取 [value]，多→单取首个）
    if (this.__wasMultiple === undefined) this.__wasMultiple = this.multiple;
    else if (this.__wasMultiple !== this.multiple) {
      if (this.multiple) this.__multiSel.value = this.value ? [this.value] : [];
      else this.value = this.__multiSel.value[0] ?? '';
      this.__wasMultiple = this.multiple;
    }
    this.__sync();
  }

  override disconnectedCallback(): void {
    this.__teardownDoc();
    super.disconnectedCallback();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  override focus(options?: FocusOptions): void {
    (this.shadowRoot?.querySelector<HTMLButtonElement>('.trigger') ?? this).focus(options);
  }

  private __trigger(): HTMLButtonElement {
    return this.shadowRoot!.querySelector<HTMLButtonElement>('.trigger')!;
  }

  private __popup(): HTMLElement | null {
    return this.shadowRoot?.querySelector<HTMLElement>('.popup') ?? null;
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

  /** 依据当前选项源重建弹层 li 列表（模板引擎不插 HTML/循环，命令式构建，同 x-slider 刻度范式） */
  private __populate(): void {
    this.__items = this.__collect();
    const popup = this.__popup();
    if (!popup) return;
    popup.textContent = '';
    this.__items.forEach((opt, i) => {
      const li = document.createElement('li');
      li.className = 'option';
      li.id = `opt-${i}`;
      li.setAttribute('role', 'option');
      if (opt.disabled) li.dataset.disabled = '';
      const label = document.createElement('span');
      label.className = 'opt-label';
      label.textContent = opt.label;
      const check = document.createElement('x-icon');
      check.className = 'opt-check';
      check.setAttribute('name', 'check');
      check.setAttribute('size', '14px');
      li.append(label, check);
      li.addEventListener('click', () => {
        if (opt.disabled) return;
        this.__choose(opt.value);
      });
      popup.appendChild(li);
    });
    this.__sync();
  }

  /** 信号/选项源 → 展示文本 / 选中态 / FormData / 校验（单选 value 与多选 __multiSel 双轨归一） */
  private __sync(): void {
    const selected = this.multiple ? this.__multiSel.value : this.value ? [this.value] : [];
    const selSet = new Set(selected);
    const labelOf = (v: string) => this.__items.find((o) => o.value === v)?.label ?? v;
    this.__display.value = selected.length ? selected.map(labelOf).join('、') : this.placeholder;
    const popup = this.__popup();
    if (popup) {
      Array.from(popup.children).forEach((li, i) => {
        const on = selSet.has(this.__items[i]?.value ?? '');
        if (on) li.setAttribute('data-selected', '');
        else li.removeAttribute('data-selected');
        li.setAttribute('aria-selected', String(on));
      });
    }
    if (this.multiple) {
      if (!selected.length) {
        this.internals.setFormValue(null);
      } else {
        // setFormValue(FormData) 会把各项键名统一改写为宿主 name，这里键名仅作占位
        const fd = new FormData();
        for (const v of selected) fd.append('v', v);
        this.internals.setFormValue(fd);
      }
    } else {
      this.internals.setFormValue(this.value || null);
    }
    const anchor = this.shadowRoot?.querySelector<HTMLElement>('.trigger') ?? undefined;
    if (this.required && !selected.length) this.internals.setValidity({ valueMissing: true }, '请选择一项', anchor);
    else this.internals.setValidity({});
  }

  /* -------------------------------- 弹层开合 -------------------------------- */

  private __show(): void {
    if (this.__open.value || this.disabled) return;
    this.__open.value = true;
    this.classList.add('popup-open');
    this.__position();
    const selKey = this.multiple ? this.__multiSel.value[0] : this.value;
    this.__highlight(this.__items.findIndex((o) => o.value === selKey && !o.disabled));
    document.addEventListener('pointerdown', this.__onDocPointer, true);
    // 滚动重定位：scroll 不跨 shadow 边界，只挂 window capture 听不到外层组件内部滚动（见 scrollTargetsFor 注释）
    this.__scrollTargets = scrollTargetsFor(this);
    for (const t of this.__scrollTargets) t.addEventListener('scroll', this.__reposition, true);
    window.addEventListener('resize', this.__reposition);
  }

  private __hide(): void {
    if (!this.__open.value) return;
    this.__open.value = false;
    this.classList.remove('popup-open');
    this.__highlight(-1);
    this.__teardownDoc();
  }

  private __teardownDoc(): void {
    document.removeEventListener('pointerdown', this.__onDocPointer, true);
    for (const t of this.__scrollTargets) t.removeEventListener('scroll', this.__reposition, true);
    this.__scrollTargets = [];
    window.removeEventListener('resize', this.__reposition);
  }

  /** fixed 弹层贴触发件下沿；下方放不下且上方更宽裕时向上翻转 */
  private __position(): void {
    const popup = this.__popup();
    if (!popup) return;
    const rect = this.__trigger().getBoundingClientRect();
    popup.style.left = `${rect.left}px`;
    popup.style.width = `${rect.width}px`;
    const h = popup.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < h + 12 && rect.top > spaceBelow) {
      popup.style.top = '';
      popup.style.bottom = `${window.innerHeight - rect.top + 6}px`;
      popup.classList.add('up');
    } else {
      popup.style.top = `${rect.bottom + 6}px`;
      popup.style.bottom = '';
      popup.classList.remove('up');
    }
  }

  private __reposition = (): void => {
    if (this.__open.value) this.__position();
  };

  private __onDocPointer = (event: PointerEvent): void => {
    // 弹层/触发件在自身 shadow 内，composedPath 含宿主即视为内部点击（收起由 trigger click 负责）
    if (!event.composedPath().includes(this)) this.__hide();
  };

  private __onTriggerClick = (): void => {
    if (this.disabled) return;
    if (this.__open.value) this.__hide();
    else this.__show();
  };

  /* -------------------------------- 键盘导航 -------------------------------- */

  private __onKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) return;
    const key = event.key;
    const open = this.__open.value;
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      if (!open) this.__show();
      this.__highlight(this.__step(open ? key === 'ArrowDown' : undefined, key === 'ArrowDown'));
      return;
    }
    if (!open) {
      if (key === 'Enter' || key === ' ') {
        event.preventDefault(); // 拦下 button 默认 click，避免与 __show 双触发
        this.__show();
      }
      return;
    }
    switch (key) {
      case 'Home':
        event.preventDefault();
        this.__highlight(this.__step(undefined, true));
        break;
      case 'End':
        event.preventDefault();
        this.__highlight(this.__step(undefined, false));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.__chooseActive();
        break;
      case 'Escape':
        event.preventDefault();
        this.__hide();
        break;
      case 'Tab':
        this.__hide();
        break;
    }
  };

  /** 从当前高亮挪一格（dir=true 下/+1）；未开弹层或无高亮时取首/末个可用项；跳过 disabled */
  private __step(fromOpen: boolean | undefined, down: boolean): number {
    const len = this.__items.length;
    if (!len) return -1;
    let i = this.__active;
    if (!fromOpen || i < 0) return down ? this.__nearest(-1, 1) : this.__nearest(len, -1);
    i += down ? 1 : -1;
    // 环形探测一个周期，找首个未禁用项
    for (let n = 0; n < len; n++) {
      const idx = (i + len) % len;
      if (!this.__items[idx].disabled) return idx;
      i += down ? 1 : -1;
    }
    return -1;
  }

  /** 从 start 起沿 dir 步长找首个未禁用下标，找不到返回 -1 */
  private __nearest(start: number, dir: 1 | -1): number {
    for (let i = start + dir; i >= 0 && i < this.__items.length; i += dir) {
      if (!this.__items[i].disabled) return i;
    }
    return -1;
  }

  private __highlight(index: number): void {
    const popup = this.__popup();
    const prev = popup?.querySelector('[data-active]');
    if (prev) prev.removeAttribute('data-active');
    this.__active = index;
    const trigger = this.__trigger();
    const li = index >= 0 && popup ? (popup.children[index] as HTMLElement | undefined) : undefined;
    if (li && !this.__items[index]?.disabled) {
      li.setAttribute('data-active', '');
      trigger.setAttribute('aria-activedescendant', li.id);
      if (this.__open.value) li.scrollIntoView({ block: 'nearest' });
    } else {
      trigger.removeAttribute('aria-activedescendant');
      this.__active = -1;
    }
  }

  private __chooseActive(): void {
    const opt = this.__items[this.__active];
    if (opt && !opt.disabled) this.__choose(opt.value);
    else this.__hide();
  }

  /* -------------------------------- 选择提交 -------------------------------- */

  private __choose(next: string): void {
    if (this.multiple) {
      // 多选：切换命中项、保持弹层打开；取消则整体回退不动选中集
      const cur = this.__multiSel.value;
      const nv = cur.includes(next) ? cur.filter((v) => v !== next) : [...cur, next];
      const previousValue = [...cur];
      const ok = this.dispatchEvent(
        new CustomEvent('x-change', {
          bubbles: true,
          composed: true,
          cancelable: true,
          detail: { value: nv, previousValue },
        }),
      );
      if (!ok) return;
      this.__multiSel.value = nv;
      this.__sync();
      return;
    }
    this.__hide();
    this.__trigger().focus();
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
    } else {
      this.value = next;
      this.__committed = next;
    }
    this.__sync();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-select': XSelect;
  }
}

export { XSelect };
export default define(XSelect);
