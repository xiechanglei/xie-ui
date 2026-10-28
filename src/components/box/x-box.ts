/**
 * x-box —— 通用视觉容器（布局分类）。
 *
 * 表面件：只负责「一块有外观的面」——背景/描边/圆角/内边距/阴影；内部排布交给 x-flex、
 * 页面骨架交给 x-container，三者边界清晰互不代职。外观沿用 x-button 的双轴范式：
 * `variant`（填充形态）× `color`（语义色）正交组合；缺省 solid + default 即中性卡片面
 *（surface 底 + 正文色，随明暗主题翻转）。
 *
 * 属性：
 *  - variant    solid(默认，实底色面) | outline(透明+描边) | soft(淡底) | ghost(全透明，只留间距)（反射）
 *  - color      default(默认，中性卡面) | primary | secondary | success | warning | danger | info（反射）
 *  - width      full(默认：block 横向充满父元素) | fit(只包住子元素)（反射）
 *  - padding    内边距：令牌别名 none|xs|sm|md|lg|xl 或任意 CSS 长度（默认 lg=16px）
 *  - radius     圆角：别名 none|sm|md|lg|full 或任意长度（默认 md，吃 --xie-radius 旋钮联动主题）
 *  - shadow     阴影：none(默认) | sm | md | lg（对应 --xie-shadow-1..3 档位）（反射）
 *  - hoverable  可点暗示：cursor:pointer + 悬停浮起（阴影升档 + 微位移）（反射）
 *
 * 文字色规则：solid 用角色反色 fg（实底上白/深字），其余形态一律吃正文色——soft/outline 卡内
 * 常放任意内容，不强染子树文字色。描边恒占 1px（无描边形态置 transparent）防形态切换跳动。
 *
 * 定制：外观全部落在宿主元素本身，消费者直接 `x-box { ... }` 覆写即可（无 shadow 内部件可拆）。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import boxStyles from './x-box.css?inline';

/** 形态轴（与 x-button 同名同义，消费方式按面容器特化） */
export type BoxVariant = 'solid' | 'outline' | 'soft' | 'ghost';
/** 颜色轴 */
export type BoxColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
/** 横向尺寸模式 */
export type BoxWidth = 'full' | 'fit';
/** 阴影档位 */
export type BoxShadow = 'none' | 'sm' | 'md' | 'lg';

/** padding 别名 → 令牌值；未命中则原样作为 CSS 长度（与 x-flex 的 gap 别名口径一致） */
const PAD_ALIAS: Record<string, string> = {
  none: '0',
  xs: 'var(--xie-space-1)',
  sm: 'var(--xie-space-2)',
  md: 'var(--xie-space-3)',
  lg: 'var(--xie-space-4)',
  xl: 'var(--xie-space-5)',
};

/** radius 别名 → 圆角派生令牌 */
const RAD_ALIAS: Record<string, string> = {
  none: 'var(--xie-radius-none)',
  sm: 'var(--xie-radius-sm)',
  md: 'var(--xie-radius-md)',
  lg: 'var(--xie-radius-lg)',
  full: 'var(--xie-radius-full)',
};

class XBox extends XBaseElement {
  static tag = 'x-box';

  static properties: Record<string, PropertyOptions> = {
    variant: { type: 'String', reflect: true, default: 'solid' },
    color: { type: 'String', reflect: true, default: 'default' },
    width: { type: 'String', reflect: true, default: 'full' },
    padding: { type: 'String', default: 'lg' },
    radius: { type: 'String', default: 'md' },
    shadow: { type: 'String', reflect: true, default: 'none' },
    hoverable: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [boxStyles];

  declare variant: BoxVariant;
  declare color: BoxColor;
  declare width: BoxWidth;
  declare padding: string;
  declare radius: string;
  declare shadow: BoxShadow;
  declare hoverable: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    // 外观全部由宿主 CSS 变量/属性选择器驱动，shadow 里只留出口
    return html`<slot></slot>`;
  }

  protected firstUpdated(): void {
    this.__syncVars();
  }

  protected override updated(): void {
    this.__syncVars();
  }

  /**
   * padding/radius 映射为宿主内联自定义属性（模板引擎无法拼 style 片段，
   * 与 x-flex 的 --_gap / x-icon 的 --_icon-size 同一命令式同步范式）。
   */
  private __syncVars(): void {
    const s = this.style;
    const pad = (this.padding || '').trim();
    if (pad) s.setProperty('--_pad', PAD_ALIAS[pad] ?? pad);
    else s.removeProperty('--_pad');
    const rad = (this.radius || '').trim();
    if (rad) s.setProperty('--_rad', RAD_ALIAS[rad] ?? rad);
    else s.removeProperty('--_rad');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-box': XBox;
  }
}

export { XBox };
export default define(XBox);
