/**
 * x-spinner —— 旋转加载指示器（基础分类，「内置动画」待办的落点）。
 *
 * 库里所有「等待中」的视觉收敛到这一件：x-button 的 loading 内嵌的就是它，
 * 消费者也可单独用在页面级 / 区块级 / 按钮外的任何 loading 场景。
 *
 * 属性：
 *  - size   直径（不反射，写局部变量）：任意 CSS 长度（'16px' / '1.25em'）或纯数字（按 px 理解）；缺省 1em 跟随字号
 *  - stroke 环粗（不反射）：同上；缺省 2px
 *  - speed  转一圈的时长（不反射）：秒数或 CSS 时间（'0.8' / '800ms'）；缺省 .6s
 *  - color  语义色（反射，全库统一 7 角色）：default(缺省，currentColor 随上下文文字色) | primary | … | info
 *  - label  无障碍名，缺省「加载中」；显式置空则退化为纯装饰（aria-hidden），状态由宿主自行播报
 *
 * 只要单一颜色的变体而非 7 角色之一，不用扩属性——--_sp-color 就是它的逃生舱：
 * `x-spinner{ --_sp-color:#e11 }` 直接覆写（未设 color 时组件不写 inline 变量，继承值得以生效）。
 *
 * 无障碍：有 label 时 role="status"，读屏会播报；`prefers-reduced-motion: reduce` 下停转、
 * 保留完整静态圆环——仍指示「进行中」，但不靠动效传达状态。
 * 定制：暴露 part="spinner"。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import spinnerStyles from './x-spinner.css?inline';

/** 语义色轴：与 button/avatar/badge 同一套 7 角色（default = 中性，跟随上下文文字色） */
export type SpinnerColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

class XSpinner extends XBaseElement {
  static tag = 'x-spinner';

  static properties: Record<string, PropertyOptions> = {
    size: { type: 'String', default: '' },
    stroke: { type: 'String', default: '' },
    speed: { type: 'String', default: '' },
    color: { type: 'String', reflect: true, default: 'default' },
    label: { type: 'String', default: '加载中' },
  };

  static styles = [spinnerStyles];

  declare size: string;
  declare stroke: string;
  declare speed: string;
  declare color: SpinnerColor;
  declare label: string;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<span
      class="spinner"
      part="spinner"
      role=${this.derive(() => (this.label ? 'status' : undefined))}
      aria-label=${this.derive(() => this.label || undefined)}
      aria-hidden=${this.derive(() => (this.label ? undefined : 'true'))}
    ></span>`;
  }

  protected firstUpdated(): void {
    this.__paint();
  }

  protected override updated(): void {
    this.__paint();
  }

  /** 把尺寸类属性写成本地 CSS 变量：空串交回 CSS 缺省（缺省值只在一处定义，不双写） */
  private __paint(): void {
    const s = this.style;
    const pairs: [string, string][] = [
      ['--_sp-size', numOrUnit(this.size, 'px')],
      ['--_sp-stroke', numOrUnit(this.stroke, 'px')],
      ['--_sp-duration', numOrUnit(this.speed, 's')],
    ];
    for (const [name, value] of pairs) {
      if (value) s.setProperty(name, value);
      else s.removeProperty(name);
    }
  }
}

/** 纯数字补单位（'16'→'16px'、'0.8'→'0.8s'）；已带单位/令牌则原样透传；空值返回空串 */
function numOrUnit(v: string, unit: string): string {
  if (!v) return '';
  return /^\d*\.?\d+$/.test(v) ? v + unit : v;
}

declare global {
  interface HTMLElementTagNameMap {
    'x-spinner': XSpinner;
  }
}

export { XSpinner };
export default define(XSpinner);
