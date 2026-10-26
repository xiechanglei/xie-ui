/**
 * x-drawer —— 通用抽屉浮层（反馈与浮层分类）。
 *
 * 从视口边缘（默认右）滑入的面板 + 遮罩，用于承载设置面板、详情、表单等浮层内容。
 * 通过 `open` 属性（反射）驱动显隐；点遮罩 / 按 Esc 触发可取消的 `x-close`，默认自带关闭。
 * 内容通过默认插槽传入；面板视觉（背景/阴影/宽度）由全局令牌驱动，随主题实时联动。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import drawerStyles from './x-drawer.css?inline';

export type DrawerPlacement = 'left' | 'right';

/** 跨实例共享的滚动锁计数，避免多抽屉叠加时提前解锁 */
let lockCount = 0;
function lockBody(): void {
  if (lockCount++ === 0) document.documentElement.style.overflow = 'hidden';
}
function unlockBody(): void {
  if (--lockCount <= 0) {
    lockCount = 0;
    document.documentElement.style.overflow = '';
  }
}

class XDrawer extends XBaseElement {
  static tag = 'x-drawer';

  static properties: Record<string, PropertyOptions> = {
    open: { type: 'Boolean', reflect: true, default: false },
    placement: { type: 'String', reflect: true, default: 'right' },
    width: { type: 'String', default: '440px' },
    lockScroll: { type: 'Boolean', default: true },
    label: { type: 'String', default: '' },
  };

  static styles = [drawerStyles];

  declare open: boolean;
  declare placement: DrawerPlacement;
  declare width: string;
  declare lockScroll: boolean;
  declare label: string;

  private __locked = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="scrim" part="scrim"></div>
      <div class="panel" part="panel" role="dialog" aria-modal="true" aria-label=${this.derive(() => this.label || undefined)}>
        <slot></slot>
      </div>`;
  }

  protected firstUpdated(): void {
    this.shadowRoot!.querySelector('.scrim')!.addEventListener('click', () => this.hide());
    document.addEventListener('keydown', this.__onKey);
    this.__sync();
  }

  protected override updated(): void {
    this.__sync();
  }

  override disconnectedCallback(): void {
    document.removeEventListener('keydown', this.__onKey);
    this.__releaseLock();
    super.disconnectedCallback();
  }

  /** 打开抽屉 */
  show(): void {
    if (!this.open) this.open = true;
  }

  /** 关闭抽屉：先派发可取消的 x-close，未被 preventDefault 才真正关闭 */
  hide(): void {
    if (!this.open) return;
    const ok = this.dispatchEvent(
      new CustomEvent('x-close', { bubbles: true, composed: true, cancelable: true }),
    );
    if (!ok) return;
    this.open = false;
  }

  toggle(): void {
    this.open ? this.hide() : this.show();
  }

  private __onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.open) this.hide();
  };

  /** 依据 open / width 同步内联宽度变量与滚动锁 */
  private __sync(): void {
    this.style.setProperty('--_drawer-width', this.width || '440px');
    if (!this.lockScroll) {
      this.__releaseLock();
      return;
    }
    if (this.open && !this.__locked) {
      this.__locked = true;
      lockBody();
    } else if (!this.open && this.__locked) {
      this.__releaseLock();
    }
  }

  private __releaseLock(): void {
    if (this.__locked) {
      this.__locked = false;
      unlockBody();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-drawer': XDrawer;
  }
}

export { XDrawer };
export default define(XDrawer);
