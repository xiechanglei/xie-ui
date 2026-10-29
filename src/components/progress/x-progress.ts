/**
 * x-progress —— 线性进度条（基础分类，与 x-spinner 同族的「进行中」视觉）。
 *
 * 定值模式：`value` 0–100，填充条按比例伸展；不写 value（或置 indeterminate）即不确定模式，
 * 滑块来回扫动——与 spinner 分工：知道完成度用它、只知道「在忙」用 spinner。
 *
 * 属性：
 *  - value          当前完成度（反射，Number）：0–100；未设置 = 不确定模式
 *  - indeterminate  强制不确定（反射）：true 时忽略 value 的填充、只跑扫动动画
 *  - color          语义色（反射，全库统一 7 角色）：primary(默认) | secondary | success | warning | danger | info | default(中性)
 *  - size           高度（不反射，写局部变量）：任意 CSS 长度或纯数字（按 px）；缺省 8px
 *  - label          无障碍名，缺省「进度」；不确定模式自动改播「加载中」
 *
 * 无障碍：填充条 role="progressbar" + aria-valuenow/min/max（不确定模式省 valuenow）；
 * `prefers-reduced-motion: reduce` 下扫动停为静态半条，不用动效传达状态。
 * 定制：暴露 part="track" / "fill"。单一非 7 角色色覆写 `--_pg-color`。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import progressStyles from './x-progress.css?inline';

export type ProgressColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

class XProgress extends XBaseElement {
  static tag = 'x-progress';

  static properties: Record<string, PropertyOptions> = {
    value: { type: 'Number', reflect: true },
    indeterminate: { type: 'Boolean', reflect: true, default: false },
    color: { type: 'String', reflect: true, default: 'primary' },
    size: { type: 'String', default: '' },
    label: { type: 'String', default: '进度' },
  };

  static styles = [progressStyles];

  declare value: number | undefined;
  declare indeterminate: boolean;
  declare color: ProgressColor;
  declare size: string;
  declare label: string;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  /** 不确定态：显式 indeterminate，或压根没给 value */
  private get __uncertain(): boolean {
    return this.indeterminate || this.value === undefined;
  }

  /** 夹紧到 0–100：越界写值不产生负宽/超宽填充 */
  private get __pct(): number {
    const v = this.value ?? 0;
    return Math.min(Math.max(v, 0), 100);
  }

  protected render(): TemplateResult {
    // 填充条宽靠 style 绑定直写（细粒度：value 变更只动这一条属性）；不确定模式改由 CSS 动画扫动
    return html`<div class="track" part="track"
      ><div
        class=${this.derive(() => (this.__uncertain ? 'fill indeterminate' : 'fill'))}
        part="fill"
        role="progressbar"
        aria-valuenow=${this.derive(() => (this.__uncertain ? undefined : this.__pct))}
        aria-valuemin=${this.derive(() => (this.__uncertain ? undefined : 0))}
        aria-valuemax=${this.derive(() => (this.__uncertain ? undefined : 100))}
        aria-label=${this.derive(() => (this.__uncertain ? '加载中' : this.label))}
        style=${this.derive(() => (this.__uncertain ? '' : `width:${this.__pct}%`))}
      ></div></div>`;
  }

  protected firstUpdated(): void {
    this.__paint();
  }

  protected override updated(): void {
    this.__paint();
  }

  /** size 写成本地变量：空串交回 CSS 缺省（缺省只在一处定义，不双写） */
  private __paint(): void {
    const v = numOrUnit(this.size, 'px');
    if (v) this.style.setProperty('--_pg-height', v);
    else this.style.removeProperty('--_pg-height');
  }
}

/** 纯数字补单位（'12'→'12px'）；已带单位/令牌则原样透传；空值返回空串 */
function numOrUnit(v: string, unit: string): string {
  if (!v) return '';
  return /^\d*\.?\d+$/.test(v) ? v + unit : v;
}

declare global {
  interface HTMLElementTagNameMap {
    'x-progress': XProgress;
  }
}

export { XProgress };
export default define(XProgress);
