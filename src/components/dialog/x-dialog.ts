/**
 * x-dialog —— 通用对话框浮层（反馈与浮层分类）。
 *
 * 视口中央的模态面板 + 遮罩，用于承载确认、详情、短表单等浮层内容。
 * 通过 `open` 属性（反射）驱动显隐；点遮罩空白 / 按 Esc / header 关闭按钮触发可取消的 `x-close`。
 * `closable=false` 时这三条「用户关闭」路径一并禁用（必读协议、processing 等强阻断场景），
 * 但 hide() 作为命令式入口照常可用（如 footer 里「取消」按钮写 `command="close"` 即路由到它）。
 * 面板为纵向 flex 容器，直接子元素排布：`<x-dialog-header>` / `<x-dialog-footer>` 固定顶/底，
 * 其余内容占据中部并自动滚动、内衬留白（见组件 CSS 的 ::slotted 规则）。
 * 面板视觉（背景/圆角/阴影/宽度）由全局令牌驱动，随主题实时联动。
 *
 * 快捷用法：只写 `title` / `subtitle`（不放 header 子元素）时，对话框自动生成一个带关闭按钮的
 * `<x-dialog-header>`；一旦 light DOM 里出现了显式 `<x-dialog-header>`，自动头部让位（hidden）。
 *
 * 与 x-drawer 共享浮层基建（core/overlay.ts）：滚动锁跨实例计数、Esc 只关最上面那层浮层、
 * 焦点陷阱（打开时 Tab 锁在面板内并自动聚焦，关闭时焦点归还打开前的来源元素）。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
// 滚动锁、Esc 关闭栈与焦点陷阱与抽屉共用（计数/栈/陷阱必须在浮层之间唯一，见 core/overlay.ts）
import {
  lockPageScroll,
  unlockPageScroll,
  popOverlayCloser,
  pushOverlayCloser,
  releaseFocus,
  trapFocus,
} from '../../core/overlay.js';
import '../../tokens/index.js';
// 自动头部依赖 x-dialog-header（副作用注册）：其关闭按钮向上递交 close 命令、由本件认领后 hide()
import './x-dialog-header.js';
import dialogStyles from './x-dialog.css?inline';

class XDialog extends XBaseElement {
  static tag = 'x-dialog';

  static properties: Record<string, PropertyOptions> = {
    open: { type: 'Boolean', reflect: true, default: false },
    width: { type: 'String', default: '480px' },
    closable: { type: 'Boolean', reflect: true, default: true },
    lockScroll: { type: 'Boolean', default: true },
    label: { type: 'String', default: '' },
    title: { type: 'String', default: '' },
    subtitle: { type: 'String', default: '' },
  };

  static styles = [dialogStyles];

  /**
   * 认领 close 命令（见 core/command.ts）：footer 里的 `<x-button command="close">`、
   * 头部的关闭按钮都经这条路回到 hide()。
   * 注意路由的是 hide() 而非 __closeByUser()——命令式入口不受 closable 旋钮限制，
   * 否则 closable=false 的对话框里「取消」按钮会被一起禁掉。
   */
  static commands = { close: 'hide' };

  declare open: boolean;
  declare width: string;
  /** 是否允许用户关闭（遮罩点击 / Esc / 头部关闭按钮一并生效）；hide() 不受此限制 */
  declare closable: boolean;
  declare lockScroll: boolean;
  declare label: string;
  /** 快捷头部标题（也可通过 property 赋值） */
  declare title: string;
  /** 快捷头部副标题 */
  declare subtitle: string;

  private __locked = false;

  /** light DOM 里是否已有显式 <x-dialog-header>（有则自动头部让位） */
  private __hasSlottedHeader = this.__signal<boolean>(false);

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="scrim" part="scrim">
      <div
        class="panel"
        part="panel"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        aria-label=${this.derive(() => this.label || this.title || undefined)}
      >
        <x-dialog-header
          class="auto-header"
          part="header"
          show-close
          subtitle=${this.derive(() => this.subtitle)}
          hidden=${this.derive(
            () => (this.__hasSlottedHeader.value || !(this.title || this.subtitle) ? '' : undefined),
          )}
          >${this.derive(() => this.title)}</x-dialog-header
        >
        <slot></slot>
      </div>
    </div>`;
  }

  /** title 与原生全局属性同名：把值搬进 property 后立刻移除宿主 attribute，
      否则浏览器会把对话框标题当 tooltip 浮在内容上（无障碍命名走 panel 的 aria-label）。
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
    const scrim = this.__scrim();
    // 遮罩是 flex 居中容器：点在面板外的空白处 target 才是 .scrim 本身；
    // 点在面板内（含插槽进来的 light DOM 内容）会被重定向成宿主/面板，不会命中这里，无需坐标计算。
    scrim.addEventListener('click', (event) => {
      if (event.target === scrim) this.__closeByUser();
    });
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
    popOverlayCloser(this.__closeByUser);
    this.__releaseLock();
    releaseFocus(this);
    super.disconnectedCallback();
  }

  /** 打开对话框 */
  show(): void {
    if (!this.open) this.open = true;
  }

  /** 关闭对话框：先派发可取消的 x-close，未被 preventDefault 才真正关闭 */
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

  /**
   * 「用户请求关闭」的唯一入口（Esc 与遮罩点击都走它）：closable=false 时这条路堵死。
   * 不写进 hide() 是因为 hide() 是命令式 API，消费者（如 footer 的取消按钮）显式调用时
   * 不该被旋钮拦掉。
   */
  private __closeByUser = (): void => {
    if (this.closable) this.hide();
  };

  /** 取得 shadow 内的遮罩层 */
  private __scrim(): HTMLElement {
    return this.shadowRoot!.querySelector('.scrim')!;
  }

  /** 取得 shadow 内的面板（焦点陷阱的聚焦兑底对象，tabindex=-1） */
  private __panel(): HTMLElement {
    return this.shadowRoot!.querySelector('.panel')!;
  }

  /** 登记 light DOM 里是否存在显式 header（信号驱动自动头部 hidden） */
  private __syncHeader(): void {
    const slot = this.shadowRoot!.querySelector('slot')!;
    this.__hasSlottedHeader.value = slot
      .assignedElements()
      .some((el) => el.tagName === 'X-DIALOG-HEADER');
  }

  /** 依据 open / width / closable 同步内联变量、Esc 栈与滚动锁 */
  private __sync(): void {
    this.style.setProperty('--_dialog-width', this.width || '480px');
    // 关闭按钮的显隐下发给头部组件（CSS 变量穿透 shadow，见 x-drawer-header.css）
    if (this.closable) this.style.removeProperty('--_overlay-close-display');
    else this.style.setProperty('--_overlay-close-display', 'none');
    // 打开即入栈、关闭即出栈：一次 Esc 只关最上面那层浮层（入栈幂等，updated 多次调用无妨）
    if (this.open) {
      pushOverlayCloser(this.__closeByUser);
      // 焦点陷阱同样幂等，由 overlay 内部按实例去重；打开锁 Tab + 自动聚焦，关闭归还来源焦点
      trapFocus(this.__panel(), this);
    } else {
      popOverlayCloser(this.__closeByUser);
      releaseFocus(this);
    }
    if (!this.lockScroll) {
      this.__releaseLock();
      return;
    }
    if (this.open && !this.__locked) {
      this.__locked = true;
      lockPageScroll();
    } else if (!this.open && this.__locked) {
      this.__releaseLock();
    }
  }

  private __releaseLock(): void {
    if (this.__locked) {
      this.__locked = false;
      unlockPageScroll();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-dialog': XDialog;
  }
}

export { XDialog };
export default define(XDialog);
