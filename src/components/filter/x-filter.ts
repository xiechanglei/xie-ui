/**
 * x-filter —— 筛选器（单选 + 折叠动画 + 重置）。
 *
 * 语义类似 radio：点选一个 x-filter-item 后，该项进入选中态，其余项横向折叠退场
 * （折叠动画由子项宿主的 grid 0fr 轨道承担，见 x-filter-item.css）；再点选中项或点
 * 行尾的重置钮（仅选中时出现）即展开恢复全部选项。
 *
 * 刻意不做 FCCE：筛选器多用于视图过滤而非表单提交（对应「without HTML forms」用法）。
 *
 * 值解析：子项 value 为空时回退其文本内容；选中值聚合在 `value`（程序化赋值回显、不派发）。
 * 事件：用户交互变化派发可取消的 `x-change`（detail:{ value, previousValue }），取消则回退。
 * 下沉：color / disabled 条件下沉子项（同 radio-group 的 MANAGED 约定）。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import '../icon/x-icon.js'; // 副作用注册 x-icon（重置钮图标）
import '../button/x-button.js'; // 副作用注册 x-button（重置钮复用 solid 形态）
import type { XFilterItem } from './x-filter-item.js';
import filterStyles from './x-filter.css?inline';

/** 下沉给子项的受管属性（只写未被用户显式写过的） */
const MANAGED = ['disabled', 'color', 'size'] as const;

class XFilter extends XBaseElement {
  static tag = 'x-filter';

  static properties: Record<string, PropertyOptions> = {
    value: { type: 'String', default: '' },
    disabled: { type: 'Boolean', reflect: true, default: false },
    color: { type: 'String', reflect: true, default: 'primary' },
    size: { type: 'String', reflect: true, default: 'md' },
    gap: { type: 'String', default: '' },
  };

  static styles = [filterStyles];

  declare value: string;
  declare disabled: boolean;
  declare color: string;
  declare size: string;
  declare gap: string;

  private readonly __granted = new WeakMap<Element, Set<string>>();

  // 必须显式挂 shadow：基座渲染目标是 shadowRoot ?? this，缺失会把 light DOM 子项清空
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    // 重置钮复用 x-button solid（中性 default 色）；常渲染、靠 hidden 切显隐，事件在 firstUpdated 命令式绑定
    return html`<div class="group" part="group" role="group"><slot></slot
      ><x-button
        class="reset"
        part="reset"
        variant="solid"
        color="default"
        size=${this.derive(() => this.size)}
        aria-label="重置筛选"
        title="重置"
        hidden=${this.derive(() => (this.value ? undefined : ''))}
        disabled=${this.derive(() => this.disabled)}
      ><x-icon name="close" size="16px"></x-icon></x-button></div>`;
  }

  protected firstUpdated(): void {
    this.addEventListener('click', this.__onClick as EventListener);
    this.shadowRoot!.querySelector('.reset')!.addEventListener('click', () => this.reset());
    const slot = this.shadowRoot!.querySelector('slot')!;
    slot.addEventListener('slotchange', () => this.__syncChildren());
    this.__syncState();
    this.__syncChildren();
  }

  protected override updated(): void {
    if (this.gap) this.style.setProperty('--_grp-gap', this.gap);
    else this.style.removeProperty('--_grp-gap');
    this.__syncChildren();
  }

  private __items(): XFilterItem[] {
    return Array.from(this.querySelectorAll<XFilterItem>('x-filter-item'));
  }

  /** 子项有效值：value 属性优先，空则回退文本内容 */
  private __valueOf(el: XFilterItem): string {
    return el.value || (el.textContent ?? '').trim();
  }

  /** 单源同步：命中 value 的项 active，其余 collapsed（active 项永不折叠） */
  private __syncState(): void {
    for (const el of this.__items()) {
      const active = !!this.value && this.__valueOf(el) === this.value;
      el.active = active;
      el.toggleAttribute('collapsed', !!this.value && !active);
      el.toggleAttribute('inert', !!this.value && !active);
    }
  }

  /** 点选子项：命中已选则取消、否则选中（其余折叠）；派发可取消的 x-change */
  private __onClick = (event: Event): void => {
    // closest() 不跨 shadow 边界（chip 按钮在子项 shadow 内），改沿 composedPath 上溯找宿主
    const item = event
      .composedPath()
      .find((node) => (node as Element).tagName === 'X-FILTER-ITEM') as XFilterItem | undefined;
    if (!item || !this.contains(item)) return;
    if (this.disabled || item.disabled) return;

    const previous = this.value;
    const next = this.__valueOf(item) === this.value ? '' : this.__valueOf(item);
    this.value = next; // 经访问器触发 updated → 子项重渲
    this.__syncState();
    const change = new CustomEvent('x-change', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { value: next, previousValue: previous },
    });
    if (!this.dispatchEvent(change)) {
      // 被取消：原样回退
      this.value = previous;
      this.__syncState();
    }
  };

  /** 条件下沉公共属性（同 radio-group：用户自写的保留，撤掉的归还） */
  private __syncChildren(): void {
    for (const el of this.__items()) {
      const granted = this.__granted.get(el) ?? new Set<string>();
      for (const key of MANAGED) {
        const groupHas = this.hasAttribute(key);
        if (!groupHas) {
          if (granted.has(key)) {
            el.removeAttribute(key);
            granted.delete(key);
          }
          continue;
        }
        if (el.hasAttribute(key) && !granted.has(key)) continue; // 用户自写，保留
        if (key === 'disabled') el.toggleAttribute('disabled', this.disabled);
        else el.setAttribute(key, String(this[key as 'color' | 'size']));
        granted.add(key);
      }
      this.__granted.set(el, granted);
    }
  }

  /** 命令式选中某项（不派发 x-change）；传空串等价 reset */
  select(value: string): void {
    this.value = value ?? '';
    this.__syncState();
  }

  /** 清空选中、展开全部（不派发 x-change） */
  reset(): void {
    this.value = '';
    this.__syncState();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-filter': XFilter;
  }
}

export { XFilter };
export default define(XFilter);
