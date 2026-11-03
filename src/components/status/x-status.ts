/**
 * x-status —— 状态指示灯（基础分类）。
 *
 * 一颗小圆点，表示当前状态（在线/离线/运行中/异常）。与 x-badge 的 dot 分工明确：
 * badge 的 dot 是「有未读」的角标信号（锚定在内容角上），status 是文档流里的状态灯，
 * 常与文字并排（`<x-status color="success"></x-status> 在线`）。
 *
 * 属性（形态=圆点唯一，不设 variant 轴；颜色与尺寸双轴分离）：
 *  - color  语义色（反射，全库统一 7 角色）：default(缺省，currentColor 随上下文文字色) | primary | secondary | success | warning | danger | info
 *  - size   直径档位（反射）：xs(4px) | sm(6px) | md(缺省，8px) | lg(12px)
 *  - pulse  呼吸灯（反射 Boolean）：透明度明暗脉动，表示「活跃/正在发生」
 *  - halo   雷达波（反射 Boolean）：圆点向外扩散渐隐的声呐涟漪，表示「告警/呼叫」级别的强提醒
 *  - label  无障碍名：写了才有 role="img" + aria-label；缺省空 → aria-hidden 纯装饰（状态语义交给旁边的文字）
 *
 * 只要任意色而非 7 角色之一，不扩属性——--_st-color 是逃生舱：`x-status{ --_st-color:#e11 }`。
 * pulse 与 halo 正交可叠加（罕见但无害）；prefers-reduced-motion: reduce 下停掉动画，静态圆点仍是有效状态信号。
 * 定制：暴露 part="dot"。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import statusStyles from './x-status.css?inline';

export type StatusColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type StatusSize = 'xs' | 'sm' | 'md' | 'lg';

class XStatus extends XBaseElement {
  static tag = 'x-status';

  static properties: Record<string, PropertyOptions> = {
    color: { type: 'String', reflect: true, default: 'default' },
    size: { type: 'String', reflect: true, default: 'md' },
    pulse: { type: 'Boolean', reflect: true, default: false },
    halo: { type: 'Boolean', reflect: true, default: false },
    label: { type: 'String', default: '' },
  };

  static styles = [statusStyles];

  declare color: StatusColor;
  declare size: StatusSize;
  declare pulse: boolean;
  declare halo: boolean;
  declare label: string;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<span
      class="dot"
      part="dot"
      role=${this.derive(() => (this.label ? 'img' : undefined))}
      aria-label=${this.derive(() => this.label || undefined)}
      aria-hidden=${this.derive(() => (this.label ? undefined : 'true'))}
    ></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-status': XStatus;
  }
}

export { XStatus };
export default define(XStatus);
