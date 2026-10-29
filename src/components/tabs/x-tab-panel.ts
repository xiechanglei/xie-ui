/**
 * x-tab-panel —— 标签页面板（导航分类，x-tabs 的配套件）。
 *
 * 与同 `value` 的 x-tab 配对；显隐不用自管——x-tabs 按当前值挂/摘 `hidden`。
 * 面板内容惰性保留在 DOM（隐藏仅 display:none，状态不丢）；需要「切走即销毁」自行监听 x-select 处理。
 *
 * 属性：
 *  - value 关联键（反射）：对应 x-tab 的 value
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import panelStyles from './x-tab-panel.css?inline';

class XTabPanel extends XBaseElement {
  static tag = 'x-tab-panel';

  static properties: Record<string, PropertyOptions> = {
    value: { type: 'String', reflect: true, default: '' },
  };

  static styles = [panelStyles];

  declare value: string;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="panel" part="panel" role="tabpanel"><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-tab-panel': XTabPanel;
  }
}

export { XTabPanel };
export default define(XTabPanel);
