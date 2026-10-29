/**
 * x-tooltip —— 文字提示（反馈分类）。
 *
 * 与 x-badge 锚定态同款的包裹结构：light DOM 放触发内容（按钮/图标/任意元素），
 * 悬停或聚焦时在其旁弹出一枚深色小气泡，移开/失焦即隐。内容只支持纯文本
 *（textContent 写入无 HTML 注入面；富内容请改用对话框/抽屉）。
 *
 * 气泡为宿主 shadow 内 absolute 定位（纯 CSS 按 placement 落位，零测量脚本），
 * 因此会被祖先 overflow:hidden 裁剪——与 x-select 弹层同一取舍，库刻意不做
 * fixed 传送门来换这份简单。
 *
 * 属性：
 *  - content    提示文本；空（或全空白）时任何交互都不弹
 *  - placement  弹出方位：top(默认) | bottom | left | right（反射，CSS 选择器消费）
 *  - delay      显示延时毫秒（默认 150，防误悬停闪弹）；0 = 立即；隐藏无延时
 *  - open       强制常开（反射）：文档/调试用，与悬停态叠加，不影响自动隐
 *  键盘：焦点触发时可按 Esc 关提示（压住不重弹，直到真正移开/失焦再释放）
 *
 * 定制：暴露 part="tip"。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import tooltipStyles from './x-tooltip.css?inline';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

class XTooltip extends XBaseElement {
  static tag = 'x-tooltip';

  static properties: Record<string, PropertyOptions> = {
    content: { type: 'String', default: '' },
    placement: { type: 'String', reflect: true, default: 'top' },
    /** 显示延时（毫秒），0 = 立即 */
    delay: { type: 'Number', default: 150 },
    /** 强制常开（文档/调试用） */
    open: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [tooltipStyles];

  declare content: string;
  declare placement: TooltipPlacement;
  declare delay: number;
  declare open: boolean;

  /** 悬停/聚焦激活态（与强制 open 叠加出最终显隐） */
  private __active = this.__signal(false);
  /** Esc 压制态：按过 Esc 后不再自动弹，直到 mouseleave/focusout 释放 */
  private __dismissed = false;
  private __timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    // data-show 布尔绑定：true → 属性在场（applyAttr 写空串），false → 移除
    const show = this.derive(
      () => (this.open || this.__active.value) && !!this.content.trim(),
    );
    return html`<slot></slot><span class="tip" part="tip" role="tooltip" data-show=${show}>${this.derive(() => this.content)}</span>`;
  }

  protected firstUpdated(): void {
    // mouseenter/leave 不冒泡但会分别派发到被进入的每个祖先元素，挂在宿主上可靠且无 move 抖动
    this.addEventListener('mouseenter', this.__onEnter);
    this.addEventListener('mouseleave', () => this.__onLeave());
    this.addEventListener('focusin', this.__onEnter);
    this.addEventListener('focusout', () => this.__onLeave());
    // Esc 关掉当前提示并压住重弹（keydown composed 冒泡，焦点在 slot 内容里也能命中）；
    // 不 preventDefault：浮层栈仍会收到同一次 Esc，叠加行为（对话框里关对话框）符合预期
    this.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      this.__dismissed = true;
      this.__onLeave(false); // 只隐不释放压制态，移开/失焦时才复位
    });
  }

  override disconnectedCallback(): void {
    if (this.__timer !== undefined) clearTimeout(this.__timer);
    super.disconnectedCallback();
  }

  private __onEnter = (): void => {
    if (this.__dismissed) return; // Esc 压住后不再自动弹，移开一次即释放
    if (this.__timer !== undefined) clearTimeout(this.__timer);
    if (this.delay > 0) {
      this.__timer = setTimeout(() => {
        this.__timer = undefined;
        this.__active.value = true;
      }, this.delay);
    } else {
      this.__active.value = true;
    }
  };

  private __onLeave = (clearDismiss = true): void => {
    if (clearDismiss) this.__dismissed = false;
    if (this.__timer !== undefined) {
      clearTimeout(this.__timer);
      this.__timer = undefined;
    }
    this.__active.value = false;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'x-tooltip': XTooltip;
  }
}

export { XTooltip };
export default define(XTooltip);
