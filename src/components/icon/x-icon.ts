/**
 * x-icon —— 框架内置图标组件（基础分类）。
 *
 * 渲染本 UI 库其它组件实际用到的 SVG 图标（集中登记于内部 icons.ts 注册表，不派生更多图标以保持体积精简）。
 * 通过 `name` 选择图标；`size` 设定尺寸（CSS 长度，默认 1em 随字号）；`label` 提供无障碍名，
 * 留空则视为装饰性图标（aria-hidden）。图标描边统一 `stroke="currentColor"`，颜色随文本色/主题联动。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import iconStyles from './x-icon.css?inline';
import { getIcon } from './icons.js';

class XIcon extends XBaseElement {
  static tag = 'x-icon';

  static properties: Record<string, PropertyOptions> = {
    name: { type: 'String', reflect: true, default: '' },
    size: { type: 'String', default: '' },
    label: { type: 'String', default: '' },
  };

  static styles = [iconStyles];

  declare name: string;
  declare size: string;
  declare label: string;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<svg
      class="svg"
      part="svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      role="img"
      aria-hidden=${this.derive(() => (this.label ? undefined : 'true'))}
      aria-label=${this.derive(() => this.label || undefined)}
    ></svg>`;
  }

  protected firstUpdated(): void {
    this.__paint();
  }

  protected override updated(): void {
    this.__paint();
  }

  /** 同步 size → 尺寸变量，并把注册表内容注入 <svg>（模板引擎不插 HTML，故用 innerHTML） */
  private __paint(): void {
    if (this.size) this.style.setProperty('--_icon-size', this.size);
    else this.style.removeProperty('--_icon-size');
    const svg = this.shadowRoot?.querySelector('svg');
    if (svg) svg.innerHTML = getIcon(this.name);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-icon': XIcon;
  }
}

export { XIcon };
export default define(XIcon);
