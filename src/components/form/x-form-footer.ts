/**
 * x-form-footer —— 表单按钮区（提交/重置等操作）。
 *
 * 单独成件，只为把「按钮组对齐」与「左右布局下与控件列对齐」这两件事收敛到一处：
 *  - `align`：start | center | end（按钮组在行内的对齐，映射 justify-content）；
 *  - `label-offset`：布尔，横向布局（x-form 的 label-position=left）时按 label 列宽缩进，
 *    让按钮与控件列左边缘对齐，而不是压在 label 下面（Element Plus 式表单的经典细节）。
 *
 * 按钮本身不自动接线，用户自行绑定（如 `<x-button onclick="form.submit()">`）。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import footerStyles from './x-form-footer.css?inline';

export type FormFooterAlign = 'start' | 'center' | 'end';

class XFormFooter extends XBaseElement {
  static tag = 'x-form-footer';

  static properties: Record<string, PropertyOptions> = {
    align: { type: 'String', reflect: true, default: 'start' },
    labelOffset: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [footerStyles];

  declare align: FormFooterAlign;
  declare labelOffset: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="footer" part="footer"><slot></slot></div>`;
  }

  protected override updated(): void {
    const s = this.style;
    s.setProperty(
      '--_jc',
      this.align === 'center' ? 'center' : this.align === 'end' ? 'flex-end' : 'flex-start',
    );
    // 缩进：仅当开启且继承的表单为横向布局、且 label 宽度是具体长度（非 auto）时生效
    let offset = '0px';
    if (this.labelOffset) {
      const cs = getComputedStyle(this);
      const horizontal = cs.getPropertyValue('--form-label-position').trim() === 'left';
      const lw = cs.getPropertyValue('--form-label-width').trim();
      if (horizontal && lw && lw !== 'auto') offset = `calc(${lw} + 12px)`;
    }
    s.setProperty('--_fo', offset);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-form-footer': XFormFooter;
  }
}

export { XFormFooter };
export default define(XFormFooter);
