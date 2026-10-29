/**
 * x-divider —— 分割线（布局分类）。
 *
 * 一条线把内容切成两段。横排（默认）分隔上下区块；`direction="vertical"` 分隔行内元素，
 * 高度靠 flex 父项 stretch 撑满。可选文字标签：往默认插槽放内容，线即在标签两侧断开，
 * `labelPlacement` 调锚位（start/center/end）。插槽留空则是一根纯线。
 *
 * 属性：
 *  - direction      方向（反射）：horizontal(默认) | vertical
 *  - dashed         虚线（反射）
 *  - labelPlacement 标签锚位（反射，仅带标签时生效）：start | center(默认) | end
 *
 * 无障碍：线本身 role="separator" + aria-orientation 表意分区；纯装饰线可自加 aria-hidden。
 * 定制：暴露 part="line" / "label"。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import dividerStyles from './x-divider.css?inline';

export type DividerDirection = 'horizontal' | 'vertical';
export type LabelPlacement = 'start' | 'center' | 'end';

class XDivider extends XBaseElement {
  static tag = 'x-divider';

  static properties: Record<string, PropertyOptions> = {
    direction: { type: 'String', reflect: true, default: 'horizontal' },
    dashed: { type: 'Boolean', reflect: true, default: false },
    labelPlacement: { type: 'String', reflect: true, default: 'center' },
  };

  static styles = [dividerStyles];

  declare direction: DividerDirection;
  declare dashed: boolean;
  declare labelPlacement: LabelPlacement;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    // 结构恒定：线 = ::before + 标签 + ::after（见 CSS）。标签空时两侧留白自动收起、成一根直光。
    return html`<div class="line" part="line"
      ><span class="label" part="label"><slot></slot></span
      ></div>`;
  }

  protected firstUpdated(): void {
    const slot = this.shadowRoot!.querySelector('slot')!;
    const line = this.shadowRoot!.querySelector<HTMLElement>('.line')!;
    line.setAttribute('role', 'separator');
    // 有分发的 light DOM 内容才算带标签：切换 .labeled，CSS 据此断开两侧线
    const sync = (): void => {
      const has = slot.assignedNodes({ flatten: true }).some(
        (n) => n.nodeType === Node.ELEMENT_NODE || (n.nodeType === Node.TEXT_NODE && n.textContent!.trim()),
      );
      line.classList.toggle('labeled', has);
    };
    sync();
    slot.addEventListener('slotchange', sync);
    this.__disposers.push(() => slot.removeEventListener('slotchange', sync));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-divider': XDivider;
  }
}

export { XDivider };
export default define(XDivider);
