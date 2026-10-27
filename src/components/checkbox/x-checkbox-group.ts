/**
 * x-checkbox-group —— 复选框容器（表单分类）。
 *
 * 职责一：把公共属性（name / disabled / size / shape / color）「条件下沉」给内部的
 * x-checkbox / x-checkbox-item —— 只覆盖那些没被用户显式写过的子项，用户写过的保留自身值。
 * 职责二：聚合选择结果，读取 `value`（选中项 value 数组）并在选择变化时派发 `x-change`
 * （detail:{ value: string[], checked: 子项[] }）。
 * 职责三：可选的 `min`/`max` 限制勾选数量 —— 借助子项 x-change 的「可取消」语义，
 * 在越界时 preventDefault，直接挡掉这次切换（min 挡「取消到下限以下」，max 挡「勾选到上限以上」）。
 *
 * 排布：`direction`（row/column）+ `gap` 控制子项布局（Web Components 无模板语法，容器管排版最省心）。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import type { XCheckbox } from './x-checkbox.js';
import groupStyles from './x-checkbox-group.css?inline';

export type CheckboxGroupDirection = 'row' | 'column';

/** group 会条件下沉的子项公共属性（均单词，attribute 名即属性名） */
const MANAGED = ['name', 'disabled', 'size', 'shape', 'color'] as const;

class XCheckboxGroup extends XBaseElement {
  static tag = 'x-checkbox-group';

  static properties: Record<string, PropertyOptions> = {
    disabled: { type: 'Boolean', reflect: true, default: false },
    required: { type: 'Boolean', reflect: true, default: false },
    name: { type: 'String', reflect: true, default: '' },
    size: { type: 'String', reflect: true, default: 'md' },
    shape: { type: 'String', reflect: true, default: 'rounded' },
    color: { type: 'String', reflect: true, default: 'primary' },
    min: { type: 'Number', default: undefined },
    max: { type: 'Number', default: undefined },
    direction: { type: 'String', reflect: true, default: 'column' },
    gap: { type: 'String', default: '' },
  };

  static styles = [groupStyles];

  declare disabled: boolean;
  declare required: boolean;
  declare name: string;
  declare size: string;
  declare shape: string;
  declare color: string;
  declare min?: number;
  declare max?: number;
  declare direction: CheckboxGroupDirection;
  declare gap: string;

  /** 记录「本 group 往某子项下发过哪些属性」，以便后续更新这些属性而不覆盖用户自写的 */
  private readonly __granted = new WeakMap<Element, Set<string>>();

  protected render(): TemplateResult {
    return html`<div class="group" part="group"><slot></slot></div>`;
  }

  protected firstUpdated(): void {
    this.addEventListener('x-change', this.__onChildChange as EventListener);
    this.querySelector('slot')?.addEventListener('slotchange', () => this.__syncChildren());
    const slot = this.shadowRoot!.querySelector('slot')!;
    slot.addEventListener('slotchange', () => this.__syncChildren());
    this.__syncChildren();
  }

  protected override updated(): void {
    if (this.gap) this.style.setProperty('--_grp-gap', this.gap);
    else this.style.removeProperty('--_grp-gap');
    this.__syncChildren();
  }

  /** 组内所有子控件（x-checkbox / x-checkbox-item），含嵌套 */
  private __items(): XCheckbox[] {
    return Array.from(this.querySelectorAll<XCheckbox>('x-checkbox, x-checkbox-item'));
  }

  /** 当前选中项的 value 数组 */
  get value(): string[] {
    return this.__items()
      .filter((el) => el.checked && !el.indeterminate)
      .map((el) => el.value);
  }

  /** 当前选中的子项元素 */
  get checkedItems(): XCheckbox[] {
    return this.__items().filter((el) => el.checked && !el.indeterminate);
  }

  /** 条件下沉：只写用户没显式写过的公共属性；曾下发过的可随 group 更新 */
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
        // 用户显式写过且非我们下发 → 保留用户值
        if (el.hasAttribute(key) && !granted.has(key)) continue;
        if (key === 'disabled') el.toggleAttribute('disabled', this.disabled);
        else el.setAttribute(key, String(this[key]));
        granted.add(key);
      }
      this.__granted.set(el, granted);
    }
  }

  /** 拦截子项切换：越 min/max 则取消；放行后微任务里派发聚合 x-change */
  private __onChildChange = (event: CustomEvent<{ checked: boolean; value: string }>): void => {
    const target = event.target as Element;
    if (target === this) return; // 忽略自身派发的聚合事件回环
    if (target.tagName !== 'X-CHECKBOX' && target.tagName !== 'X-CHECKBOX-ITEM') return;
    const others = this.__items().filter((el) => el !== target && el.checked && !el.indeterminate).length;
    const next = event.detail?.checked;
    if (next) {
      if (this.max != null && others + 1 > this.max) event.preventDefault();
    } else {
      if (this.min != null && others < this.min) event.preventDefault();
    }
    if (event.defaultPrevented) return;
    // 子项将在本次派发后落定状态，延后一个微任务读取真实选择再聚合
    queueMicrotask(() => this.__emitAggregate());
  };

  private __emitAggregate(): void {
    this.dispatchEvent(
      new CustomEvent('x-change', {
        bubbles: true,
        composed: true,
        detail: { value: this.value, checked: this.checkedItems },
      }),
    );
  }

  /** 全选 / 全不选（受 min/max 约束：逐一走子项受控切换，越界项会被自动挡下） */
  setAllChecked(checked: boolean): void {
    for (const el of this.__items()) {
      if (el.checked !== checked) el.toggle(checked);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-checkbox-group': XCheckboxGroup;
  }
}

export { XCheckboxGroup };
export default define(XCheckboxGroup);
