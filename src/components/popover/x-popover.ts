/**
 * x-popover —— 气泡卡片（反馈分类）。
 *
 * 与 x-tooltip 同源的包裹结构：默认插槽放触发内容，`slot="content"` 放面板内容；
 * 区别在面板是 position:fixed 的实底卡片（可交互），坐标由 core/anchor.ts 按 placement
 * 算出（空间不足翻转到对侧、交叉轴夹紧），不再受祖先 overflow 裁剪。
 *
 * 打开时吃 P0-1 浮层基建：Esc 走全局关闭栈（嵌套时只关最上层）、click 触发模式下
 * 激活焦点陷阱（Tab 锁在面板内，关闭归还给打开前的来源元素）；面板外按下即关、
 * 滚动/缩放跟随重定位。hover 触发则不设陷阱（跟随鼠标语义），留小延时供穿越间距。
 *
 * 属性：
 *  - open       反射，可编程开关（show()/hide()/toggle() 同义）
 *  - placement  top | bottom(默认) | left | right（反射，落位翻转时实际方位可能不同）
 *  - trigger    click(默认，点触发件开合) | hover(悬停开、移开延时关)
 *  键盘：Esc 关（经浮层栈）；焦点归还由陷阱完成，来源件按 Esc 后重新可操作。
 *
 * 事件：popover 本身无专属事件；closeOnChoose 开启的子类（x-dropdown）点中内容行时
 * 在收起前派发冒泡的 `x-select`（detail:{ item }，item = 被点的直接子元素）。
 * 开合状态看反射的 open 属性；面板内其余动作交给内容自己派发。
 * 定制：暴露 part="anchor" / part="panel"。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import {
  placePanel,
  ANCHOR_GAP,
  type AnchorAlign,
  type AnchorPlacement,
} from '../../core/anchor.js';
import { pushOverlayCloser, popOverlayCloser, trapFocus, releaseFocus, scrollTargetsFor } from '../../core/overlay.js';
import '../../tokens/index.js';
import popoverStyles from './x-popover.css?inline';

export type PopoverPlacement = AnchorPlacement;
export type PopoverTrigger = 'click' | 'hover';

class XPopover extends XBaseElement {
  static tag = 'x-popover';

  static properties: Record<string, PropertyOptions> = {
    open: { type: 'Boolean', reflect: true, default: false },
    placement: { type: 'String', reflect: true, default: 'bottom' },
    trigger: { type: 'String', reflect: true, default: 'click' },
  };

  static styles = [popoverStyles];

  /** 认领 close 命令：面板内的关闭按钮可经 dispatchCommand 关掉本浮层（同 drawer/dialog 语义） */
  static commands = { close: 'hide' };

  declare open: boolean;
  declare placement: PopoverPlacement;
  declare trigger: PopoverTrigger;

  /** —— 子类旋钮（x-dropdown 覆盖）：交叉轴对齐 / 面板是否跟随触发件宽 / 点内容即关 / haspopup 语义值 —— */
  protected panelAlign: AnchorAlign = 'center';
  protected fitTriggerWidth = false;
  protected closeOnChoose = false;
  protected popupKind = 'dialog';

  /** 面板是否已按 open 落好监听与陷阱（updated 里与 this.open 比对做增量切换） */
  private __shown = false;
  /** 本次打开挂上的滚动监听目标集（window + 铺平树祖先 shadow roots，卸载时原样回收） */
  private __scrollTargets: EventTarget[] = [];
  /** hover 模式移开后的延时关闭计时器（穿越面板与触发件之间的间距用） */
  private __hideTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  show(): void {
    this.open = true;
  }
  hide(): void {
    this.open = false;
  }
  toggle(): void {
    this.open = !this.open;
  }

  protected render(): TemplateResult {
    return html`<span class="anchor" part="anchor"><slot></slot></span
      ><div class="panel" part="panel" tabindex="-1" hidden=${this.derive(() => !this.open)}
      ><slot name="content" class="content"></slot
    ></div>`;
  }

  protected firstUpdated(): void {
    this.setAttribute('aria-haspopup', this.popupKind);
    this.setAttribute('aria-expanded', String(!!this.open));
    this.addEventListener('click', this.__onClick);
    this.addEventListener('mouseenter', this.__onEnter);
    this.addEventListener('mouseleave', this.__onLeave);
    // 内容晚到（JS 填充/切换）会改变面板尺寸：开着的时侯重新量位
    this.shadowRoot!.querySelector<HTMLSlotElement>('.content')!.addEventListener('slotchange', () => {
      if (this.__shown) this.__position();
    });
    if (this.open) this.__applyShow(); // 出生即开（markup 写了 open）
  }

  protected updated(): void {
    this.setAttribute('aria-expanded', String(!!this.open));
    if (this.open && !this.__shown) this.__applyShow();
    else if (!this.open && this.__shown) this.__applyHide();
    else if (this.open && this.__shown) this.__position(); // placement 等变了且开着 → 原地挪
  }

  override disconnectedCallback(): void {
    this.__teardown();
    if (this.__shown) releaseFocus(this);
    this.__shown = false;
    super.disconnectedCallback();
  }

  /* -------------------------------- 开合副作用 -------------------------------- */

  private __applyShow(): void {
    this.__shown = true;
    this.__position();
    document.addEventListener('pointerdown', this.__onDocPointer, true);
    // 滚动重定位：scroll 不跨 shadow 边界，window capture 听不到外层组件（如 x-container .main）
    // 内部滚动，目标集由 overlay 工具沿铺平树收集（见 scrollTargetsFor 注释）
    this.__scrollTargets = scrollTargetsFor(this);
    for (const t of this.__scrollTargets) t.addEventListener('scroll', this.__reposition, true);
    window.addEventListener('resize', this.__reposition);
    pushOverlayCloser(this.__requestClose);
    // 焦点陷阱只给 click 模式（hover 跟随鼠标，锁 Tab 反而出格）；面板 visibility 已即时生效，
    // trapFocus 内的 getClientRects 能量到，进入即聚焦（见 core/overlay.ts 注释）
    if (this.trigger === 'click') trapFocus(this.__panel(), this);
  }

  private __applyHide(): void {
    this.__shown = false;
    this.__teardown();
    releaseFocus(this);
  }

  private __teardown(): void {
    document.removeEventListener('pointerdown', this.__onDocPointer, true);
    for (const t of this.__scrollTargets) t.removeEventListener('scroll', this.__reposition, true);
    this.__scrollTargets = [];
    window.removeEventListener('resize', this.__reposition);
    popOverlayCloser(this.__requestClose);
    if (this.__hideTimer !== undefined) {
      clearTimeout(this.__hideTimer);
      this.__hideTimer = undefined;
    }
  }

  /* -------------------------------- 落位 -------------------------------- */

  /** fixed 面板贴触发件对应侧；主轴空间不足翻转、交叉轴按 panelAlign 对齐后夹紧 */
  private __position(): void {
    const panel = this.__panel();
    if (!panel) return;
    const r = this.getBoundingClientRect();
    const placed = placePanel(
      { left: r.left, top: r.top, width: r.width, height: r.height },
      { width: panel.offsetWidth, height: panel.offsetHeight },
      this.placement,
      ANCHOR_GAP,
      this.panelAlign,
    );
    if (this.fitTriggerWidth) panel.style.minWidth = `${Math.round(r.width)}px`;
    panel.style.left = `${placed.left}px`;
    panel.style.top = `${placed.top}px`;
  }

  private __reposition = (): void => {
    if (this.__shown) this.__position();
  };

  private __panel(): HTMLElement {
    return this.shadowRoot!.querySelector<HTMLElement>('.panel')!;
  }

  /* -------------------------------- 交互 -------------------------------- */

  private __onClick = (event: MouseEvent): void => {
    const panel = this.__panel();
    if (panel && event.composedPath().includes(panel)) {
      // 面板内点击不开也不 toggle；下拉语义里点中内容行即选中完毕 → 先报事件再关
      // （跨 shadow 重定向后，点面板本体 e.target 是宿主，点 slot 内容才是具体元素）
      if (this.closeOnChoose && event.target !== this) {
        this.__emitSelect(event.target as Element);
        this.open = false;
      }
      return;
    }
    if (this.trigger !== 'click') return;
    this.open = !this.open;
  };

  /** 派发 x-select 语义事件：item 取从点击目标上溯到的「行」层——宿主直接子级（平铺/包装 div 写法），
   *  或 x-dropdown-content 的直接子级（归组写法时不能停在容器上，行才是用户要的 item） */
  private __emitSelect(target: Element): void {
    let node: Element | null = target;
    while (
      node &&
      node.parentElement !== this &&
      node.parentElement?.tagName !== 'X-DROPDOWN-CONTENT'
    ) {
      node = node.parentElement;
    }
    this.dispatchEvent(
      new CustomEvent('x-select', { bubbles: true, composed: true, detail: { item: node ?? target } }),
    );
  }

  private __onDocPointer = (event: PointerEvent): void => {
    // 面板/触发件都在宿主（含 shadow 子树）内，composedPath 不含宿主即为外部
    if (!event.composedPath().includes(this)) this.open = false;
  };

  private __onEnter = (): void => {
    if (this.trigger !== 'hover') return;
    if (this.__hideTimer !== undefined) {
      clearTimeout(this.__hideTimer);
      this.__hideTimer = undefined;
    }
    this.open = true;
  };

  private __onLeave = (): void => {
    if (this.trigger !== 'hover') return;
    if (this.__hideTimer !== undefined) clearTimeout(this.__hideTimer);
    // 面板与触发件之间有间距，移开瞬间会命中其下页面：给 150ms 走进面板的机会（面板是宿主 shadow 子孙，进入即取消）
    this.__hideTimer = setTimeout(() => {
      this.__hideTimer = undefined;
      this.open = false;
    }, 150);
  };

  /** Esc 栈回调（稳定引用，overlay.ts 要求）：只请求关闭，走统一的 open → updated 收线 */
  private __requestClose = (): void => {
    this.open = false;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'x-popover': XPopover;
  }
}

export { XPopover };
export default define(XPopover);
