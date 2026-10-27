/**
 * x-drawer-header —— 抽屉头部（配合 x-drawer 使用）。
 *
 * 标题内容走默认插槽；`subtitle`（默认空）在标题下补一行次要说明（复用 x-text caption 角色）；
 * `show-close`（默认 false）时右侧显示关闭按钮，点击关闭所属的 x-drawer。
 * 与内容之间不设分隔线（贴合极简观感）。配色全部消费全局令牌，随主题实时联动。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
// 依赖图标组件（副作用注册 x-icon）：关闭按钮统一取自内置图标注册表
import '../icon/x-icon.js';
// 依赖排版原子件（副作用注册 x-text）：副标题不再另写 font/color
import '../text/x-text.js';
import headerStyles from './x-drawer-header.css?inline';

class XDrawerHeader extends XBaseElement {
  static tag = 'x-drawer-header';

  static properties: Record<string, PropertyOptions> = {
    showClose: { type: 'Boolean', reflect: true, default: false },
    subtitle: { type: 'String', default: '' },
  };

  static styles = [headerStyles];

  declare showClose: boolean;
  declare subtitle: string;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="inner">
      <div class="texts">
        <div class="title" part="title"><slot></slot></div>
        <x-text
          class="sub"
          part="subtitle"
          variant="caption"
          hidden=${this.derive(() => (this.subtitle ? undefined : ''))}
          >${this.derive(() => this.subtitle)}</x-text
        >
      </div>
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
