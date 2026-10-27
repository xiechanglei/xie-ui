/**
 * x-drawer —— 通用抽屉浮层（反馈与浮层分类）。
 *
 * 从视口边缘（默认右）滑入的面板 + 遮罩，用于承载设置面板、详情、表单等浮层内容。
 * 通过 `open` 属性（反射）驱动显隐；点遮罩 / 按 Esc 触发可取消的 `x-close`。
 * 面板为纵向 flex 容器，直接子元素排布：`<x-drawer-header>` / `<x-drawer-footer>` 固定顶/底，
 * 其余内容占据中部并自动滚动、内衬留白（见组件 CSS 的 ::slotted 规则）。
 * 面板视觉（背景/阴影/宽度）由全局令牌驱动，随主题实时联动。
 *
 * 快捷用法：只写 `title` / `subtitle`（不放 header 子元素）时，抽屉自动生成一个带关闭按钮的
 * `<x-drawer-header>`；一旦 light DOM 里出现了显式 `<x-drawer-header>`，自动头部让位（hidden）。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
// 自动头部依赖 x-drawer-header（副作用注册）：其关闭按钮跳 shadow 上溯找到宿主 drawer 后 hide()
import './x-drawer-header.js';
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
    title: { type: 'String', default: '' },
    subtitle: { type: 'String', default: '' },
  };

  static styles = [drawerStyles];

  declare open: boolean;
  declare placement: DrawerPlacement;
  declare width: string;
  declare lockScroll: boolean;
  declare label: string;
  /** 快捷头部标题（也可通过 property 赋值） */
  declare title: string;
  /** 快捷头部副标题 */
  declare subtitle: string;

  private __locked = false;

  /** light DOM 里是否已有显式 <x-drawer-header>（有则自动头部让位） */
  private __hasSlottedHeader = this.__signal<boolean>(false);

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="scrim" part="scrim"></div>
      <div
        class="panel"
        part="panel"
        role="dialog"
        aria-modal="true"
        aria-label=${this.derive(() => this.label || this.title || undefined)}
      >
        <x-drawer-header
          class="auto-header"
          part="header"
          show-close
          subtitle=${this.derive(() => this.subtitle)}
          hidden=${this.derive(
            () => (this.__hasSlottedHeader.value || !(this.title || this.subtitle) ? '' : undefined),
          )}
          >${this.derive(() => this.title)}</x-drawer-header
        >
        <slot></slot>
      </div>`;
  }

  /** title 与原生全局属性同名：把值搬进 property 后立刻移除宿主 attribute，
      否则浏览器会把抽屉标题当 tooltip 浮在内容上（无障碍命名走 panel 的 aria-label）。
      因此 attribute 置 null 的回写不能进基类，否则会把刚拿到的值清掉。 */
  override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (name === 'title') {
      if (value !== null) {
        this.title = value;
        this.removeAttribute('title');
      }
      return;
    }
    super.attributeChangedCallback(name, _old, value);
  }

  protected firstUpdated(): void {
    this.shadowRoot!.querySelector('.scrim')!.addEventListener('click', () => this.hide());
    document.addEventListener('keydown', this.__onKey);
    // 监听默认插槽：显式 header 可能是后续动态插入的
    const slot = this.shadowRoot!.querySelector('slot')!;
    slot.addEventListener('slotchange', () => this.__syncHeader());
    this.__syncHeader();
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

  /** 登记 light DOM 里是否存在显式 header（信号驱动自动头部 hidden） */
  private __syncHeader(): void {
    const slot = this.shadowRoot!.querySelector('slot')!;
    this.__hasSlottedHeader.value = slot
      .assignedElements()
      .some((el) => el.tagName === 'X-DRAWER-HEADER');
  }

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
