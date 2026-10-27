/**
 * x-radio-group —— 单选框容器（表单分类）。
 *
 * 职责一：互斥 —— 原生 radio 的「同名互斥」不能跨自定义元素 shadow 边界生效，故由本容器统一维护：
 * 任一子项被选中时，同步把其余子项置为未选中（程序化置值不再派发子项事件）。
 * 职责二：把公共属性（name / disabled / size / color）条件下沉给子项（只写未被用户显式写过的）。
 * 职责三：聚合当前选中值 `value`（单选：字符串），选择变化时派发 `x-change`（detail:{ value, checked }）。
 *
 * `required` 仅作样式/语义提示与子项原生校验的挂载点，真正的「至少选一个」由消费方提交时校验。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import type { XRadio } from './x-radio.js';
import groupStyles from './x-radio-group.css?inline';

export type RadioGroupDirection = 'row' | 'column';

const MANAGED = ['name', 'disabled', 'size', 'color'] as const;

class XRadioGroup extends XBaseElement {
  static tag = 'x-radio-group';

  static properties: Record<string, PropertyOptions> = {
    disabled: { type: 'Boolean', reflect: true, default: false },
    required: { type: 'Boolean', reflect: true, default: false },
    name: { type: 'String', reflect: true, default: '' },
    value: { type: 'String', default: '' },
    size: { type: 'String', reflect: true, default: 'md' },
    color: { type: 'String', reflect: true, default: 'primary' },
    direction: { type: 'String', reflect: true, default: 'column' },
    gap: { type: 'String', default: '' },
  };

  static styles = [groupStyles];

  declare disabled: boolean;
  declare required: boolean;
  declare name: string;
  declare value: string;
  declare size: string;
  declare color: string;
  declare direction: RadioGroupDirection;
  declare gap: string;

  private readonly __granted = new WeakMap<Element, Set<string>>();

  // 必须显式挂 shadow：基座渲染目标是 shadowRoot ?? this，缺失会把 light DOM 子项清空
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="group" part="group"><slot></slot></div>`;
  }

  protected firstUpdated(): void {
    this.addEventListener('x-change', this.__onChildChange as EventListener);
    const slot = this.shadowRoot!.querySelector('slot')!;
    slot.addEventListener('slotchange', () => this.__syncChildren());
    // 用 group.value 初始化：命中同值子项选中、其余取消
    this.__applyValue();
    this.__syncChildren();
  }

  protected override updated(): void {
    if (this.gap) this.style.setProperty('--_grp-gap', this.gap);
    else this.style.removeProperty('--_grp-gap');
    this.__syncChildren();
  }

  private __radios(): XRadio[] {
    return Array.from(this.querySelectorAll<XRadio>('x-radio, x-radio-item'));
  }

  /** 当前选中项的 value（无选中则空串） */
  get selectedValue(): string {
    return this.__radios().find((el) => el.checked)?.value ?? '';
  }

  private __syncChildren(): void {
    for (const el of this.__radios()) {
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
        else el.setAttribute(key, String(this[key]));
        granted.add(key);
      }
      this.__granted.set(el, granted);
    }
  }

  /** group.value → 命中子项选中；子项变化 → 回读 selectedValue 更新 group.value */
  private __applyValue(): void {
    if (!this.value) return;
    for (const el of this.__radios()) {
      el.checked = el.value === this.value;
    }
  }

  private __onChildChange = (event: CustomEvent<{ checked: boolean; value: string }>): void => {
    const target = event.target as Element;
    if (target === this) return;
    if (target.tagName !== 'X-RADIO' && target.tagName !== 'X-RADIO-ITEM') return;

    if (event.detail?.checked) {
      // 互斥：同步清掉其它已选中项（程序化，不触发它们的事件）
      for (const el of this.__radios()) {
        if (el !== target && el.checked) el.checked = false;
      }
    }

    queueMicrotask(() => {
      const selected = this.selectedValue;
      this.value = selected; // 回写 group 自身值（子项不监听 group，无回环）
      if (event.defaultPrevented) return;
      this.dispatchEvent(
        new CustomEvent('x-change', {
          bubbles: true,
          composed: true,
          detail: { value: selected, checked: this.__radios().find((el) => el.checked) ?? null },
        }),
      );
    });
  };

  /** 清空选择 */
  clear(): void {
    for (const el of this.__radios()) el.checked = false;
    this.value = '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-radio-group': XRadioGroup;
  }
}

export { XRadioGroup };
export default define(XRadioGroup);
