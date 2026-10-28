/**
 * x-badge —— 徽标 / 角标（基础分类）。
 *
 * 两种形态同一组件：light DOM 塞了内容即「锚定模式」，徽标浮在内容四角（placement，带背景色描边环
 * 与所附内容分隔）；不塞内容即「独立模式」，渲染为行内胶囊/圆点，可当微标签用。
 *
 * 属性：
 *  - value     徽标内容（数字或短文本，如 "5" / "99+" / "new"）；空且非 dot 时整体隐藏
 *  - max       value 为纯数字且超过 max 时显示 `${max}+`；0 = 不设上限（默认 99）
 *  - dot       圆点模式（反射）：只显示一个小圆点，忽略 value 文本
 *  - show-zero value 为 "0" 时是否仍显示（默认隐藏，attribute 名 show-zero）
 *  - color     语义色：default(默认，中性反色实底) | primary | secondary | success | warning | danger | info（反射）
 *  - placement 锚定角：top-right(默认) | top-left | bottom-right | bottom-left（反射，仅锚定模式有意义）
 *  - size      尺寸：sm | md(默认) | lg（反射）
 *
 * 定制：暴露 part="badge"；内部用 data-anchored 标记锚定态（slot 有无实际内容）。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import badgeStyles from './x-badge.css?inline';

export type BadgeColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgePlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export type BadgeSize = 'sm' | 'md' | 'lg';

class XBadge extends XBaseElement {
  static tag = 'x-badge';

  static properties: Record<string, PropertyOptions> = {
    value: { type: 'String', default: '' },
    /** 数字上限，超出显示 `${max}+`；0 = 不限 */
    max: { type: 'Number', default: 99 },
    dot: { type: 'Boolean', reflect: true, default: false },
    /** value 为 "0" 时是否仍显示（默认隐藏） */
    showZero: { type: 'Boolean', default: false },
    color: { type: 'String', reflect: true, default: 'default' },
    placement: { type: 'String', reflect: true, default: 'top-right' },
    size: { type: 'String', reflect: true, default: 'md' },
  };

  static styles = [badgeStyles];

  declare value: string;
  declare max: number;
  declare dot: boolean;
  declare showZero: boolean;
  declare color: BadgeColor;
  declare placement: BadgePlacement;
  declare size: BadgeSize;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    // dot 模式只显圆点不显文本；溢出折叠只对「纯数字」生效，字符串（如 "new"、"12k+"）原样展示
    const text = this.derive(() => {
      if (this.dot) return '';
      const v = this.value ?? '';
      if (/^\d+$/.test(v) && this.max > 0 && Number(v) > this.max) return `${this.max}+`;
      return v;
    });
    const visible = this.derive(
      () => this.dot || (!!text.value && (this.showZero || text.value !== '0')),
    );
    return html`<slot></slot><span class="badge" part="badge" hidden=${this.derive(() => !visible.value)}>${text}</span>`;
  }

  protected firstUpdated(): void {
    const slot = this.shadowRoot!.querySelector('slot')!;
    this.__syncAnchored(slot);
    slot.addEventListener('slotchange', () => this.__syncAnchored(slot));
  }

  /** 判定锚定态：只有元素节点或非空白文本节点算「有内容」（空白排版不误切定位模式）；
      结果落在宿主 data-anchored 上由 CSS 选择器消费，不触发重渲（非 observed attribute） */
  private __syncAnchored(slot: HTMLSlotElement): void {
    const has = slot
      .assignedNodes({ flatten: true })
      .some(
        (n) =>
          n.nodeType === Node.ELEMENT_NODE ||
          (n.nodeType === Node.TEXT_NODE && !!(n.textContent ?? '').trim()),
      );
    this.toggleAttribute('data-anchored', has);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-badge': XBadge;
  }
}

export { XBadge };
export default define(XBadge);
