/**
 * x-drawer-header —— 抽屉头部（配合 x-drawer 使用）。
 *
 * 标题内容走默认插槽；`show-close`（默认 false）时右侧显示关闭按钮，点击关闭所属的 x-drawer。
 * 与内容之间不设分隔线（贴合极简观感）。配色全部消费全局令牌，随主题实时联动。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
// 依赖图标组件（副作用注册 x-icon）：关闭按钮统一取自内置图标注册表
import '../icon/x-icon.js';
import headerStyles from './x-drawer-header.css?inline';

class XDrawerHeader extends XBaseElement {
  static tag = 'x-drawer-header';

  static properties: Record<string, PropertyOptions> = {
    showClose: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [headerStyles];

  declare showClose: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="inner">
      <div class="title" part="title"><slot></slot></div>
      <button class="close" part="close" type="button" aria-label="关闭" hidden=${this.derive(() => (this.showClose ? undefined : ''))}>
        <x-icon name="close" size="18px"></x-icon>
      </button>
    </div>`;
  }

  protected firstUpdated(): void {
    this.shadowRoot!.querySelector<HTMLButtonElement>('.close')!.addEventListener('click', this.__onClose);
  }

  /** 关闭：优先关闭所属 x-drawer（借其可取消的 x-close 逻辑），否则自身派发 x-close */
  private __onClose = (): void => {
    const drawer = this.closest('x-drawer') as { hide?: () => void } | null;
    if (drawer && typeof drawer.hide === 'function') {
      drawer.hide();
      return;
    }
    this.dispatchEvent(new CustomEvent('x-close', { bubbles: true, composed: true, cancelable: true }));
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'x-drawer-header': XDrawerHeader;
  }
}

export { XDrawerHeader };
export default define(XDrawerHeader);
