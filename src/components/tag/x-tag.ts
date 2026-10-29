/**
 * x-tag —— 标签（基础分类）。
 *
 * 双轴范式（与 x-button 同源）：`color` 选语义色、`variant` 选填充形态，二者正交，任意组合自动成立。
 * 用于分类标记、状态徽条、可移除的关键词等；本身是轻量展示件，「关闭」只对外报事件、不擅自消失。
 *
 * 属性：
 *  - variant  形态（反射）：soft(默认，淡色底+强调字) | solid(实底) | outline(描边) | ghost(无底)
 *  - color    语义色（反射，全库统一 7 角色）：default(缺省，中性) | primary | secondary | success | warning | danger | info
 *  - size     尺寸（反射）：sm | md(默认) | lg
 *  - closable 是否显示关闭钮（反射）；点关闭钮派发可取消的 x-close，默认不阻止时也不自删（由宿主决定移除/隐藏）
 *  - round    胶囊形态（反射）：全圆角
 *
 * 事件：
 *  - x-close  点关闭钮派发（bubbles + composed + cancelable）；preventDefault 可拦截，交由宿主处理移除逻辑
 *
 * 定制：暴露 part="base" / "label" / "close"。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import '../icon/x-icon.js';
import tagStyles from './x-tag.css?inline';

export type TagVariant = 'soft' | 'solid' | 'outline' | 'ghost';
export type TagColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type TagSize = 'sm' | 'md' | 'lg';

class XTag extends XBaseElement {
  static tag = 'x-tag';

  static properties: Record<string, PropertyOptions> = {
    variant: { type: 'String', reflect: true, default: 'soft' },
    color: { type: 'String', reflect: true, default: 'default' },
    size: { type: 'String', reflect: true, default: 'md' },
    closable: { type: 'Boolean', reflect: true, default: false },
    round: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [tagStyles];

  declare variant: TagVariant;
  declare color: TagColor;
  declare size: TagSize;
  declare closable: boolean;
  declare round: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    // 关闭钮常驻、靠 hidden 显隐（细粒度绑定，避免结构重排）
    return html`<span class="base" part="base"><span class="label" part="label"><slot></slot></span
      ><button
        class="close"
        part="close"
        type="button"
        aria-label="移除"
        hidden=${this.derive(() => !this.closable)}
      ><x-icon name="close" size="0.9em"></x-icon></button></span>`;
  }

  protected firstUpdated(): void {
    this.shadowRoot!.querySelector<HTMLButtonElement>('.close')!.addEventListener('click', this.__onClose);
  }

  /** 关闭钮点击：阻断冒泡（不触发标签自身交互），派发可取消的 x-close 交宿主裁决 */
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
    'x-tag': XTag;
  }
}

export { XTag };
export default define(XTag);
