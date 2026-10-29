/**
 * x-alert —— 警告提示条（反馈与浮层分类，toast 的常驻版）。
 *
 * 页面内联的实心/淡底提示块：不像 toast 一闪而过，alert 常驻直到情境失效。
 * 配色与 toast 同源（语义色单轴消费），形态轴走全库双轴范式：`color` 选语义色、
 * `variant` 选 soft(淡底强调字) / solid(实底反色字)，正交组合。
 *
 * 属性：
 *  - variant  形态（反射）：soft(默认) | solid
 *  - color    语义色（反射，7 角色）：info(默认) | success | warning | danger | primary | secondary | default
 *  - title    标题文本（不反射）：与正文分两层；无 title 时内容单行并排
 *  - icon     是否显示图标（反射）：缺省显示；图标名跟随 color（success→✓ / warning→△ / danger→✕ / info→i，default/primary 无图标自动收起）
 *  - closable 显示关闭钮（反射）：点它派发可取消的 x-close，组件不自删——隐藏/移除由宿主裁决
 *
 * 结构：icon + 内容（title 层 + 默认插槽正文层）+ 关闭钮；正文富内容随意放（段落/按钮/链接都行）。
 * 无障碍：根 role="alert"，出现即播报（常驻件天然满足）。
 * 定制：暴露 part="base" / "icon" / "title" / "body" / "close"。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import '../icon/x-icon.js';
import alertStyles from './x-alert.css?inline';

export type AlertVariant = 'soft' | 'solid';
export type AlertColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

/** color → 内置图标名（与 toast 同表；default/primary/secondary 无图标） */
const ALERT_ICONS: Partial<Record<AlertColor, string>> = {
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'x-circle',
  info: 'info',
};

class XAlert extends XBaseElement {
  static tag = 'x-alert';

  static properties: Record<string, PropertyOptions> = {
    variant: { type: 'String', reflect: true, default: 'soft' },
    color: { type: 'String', reflect: true, default: 'info' },
    title: { type: 'String', default: '' },
    icon: { type: 'Boolean', reflect: true, default: true },
    closable: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [alertStyles];

  declare variant: AlertVariant;
  declare color: AlertColor;
  declare title: string;
  declare icon: boolean;
  declare closable: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    // 图标/标题/关闭钮都常驻、靠 hidden 显隐（细粒度绑定，避免结构重排，同 x-tag 套路）
    return html`<div class="base" part="base" role="alert">
      <span class="icon" part="icon" hidden=${this.derive(() => !this.icon || !ALERT_ICONS[this.color])}>
        <x-icon name=${this.derive(() => ALERT_ICONS[this.color] ?? '')} size="1.2em"></x-icon>
      </span>
      <div class="content">
        <div class="title" part="title" hidden=${this.derive(() => !this.title)}>${this.derive(() => this.title)}</div>
        <div class="body" part="body"><slot></slot></div>
      </div>
      <button class="close" part="close" type="button" aria-label="关闭" hidden=${this.derive(() => !this.closable)}>
        <x-icon name="close" size="1em"></x-icon>
      </button>
    </div>`;
  }

  protected firstUpdated(): void {
    this.shadowRoot!.querySelector<HTMLButtonElement>('.close')!.addEventListener('click', this.__onClose);
  }

  /** 关闭钮点击：阻断冒泡，派发可取消的 x-close 交宿主裁决（隐藏/移除/拦截） */
  private __onClose = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('x-close', { bubbles: true, composed: true, cancelable: true }),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'x-alert': XAlert;
  }
}

export { XAlert };
export default define(XAlert);
