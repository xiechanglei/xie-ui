/**
 * x-radial-progress —— 圆环进度（基础分类，x-progress 的圆形同族）。
 *
 * 定值模式：`value` 0–100，环从 12 点方向按比例上色；不写 value（或置 indeterminate）即不确定模式，
 * 固定弧段整环转。与线性 progress 同一套语义，只是占地小、中心能放内容——
 * 紧凑仪表盘/卡片角上的「完成度」用它，通栏加载条用 x-progress。
 *
 * 画法：conic-gradient 扇形 + radial-gradient mask 抠洞，任意 size/thickness 组合零数学，
 * 不依赖 SVG 周长（stroke-dasharray 要半径参与计算，size 可变时公式要跟着推）。
 *
 * 属性：
 *  - value          当前完成度（反射，Number）：0–100，越界自动夹紧；未设置 = 不确定模式
 *  - indeterminate  强制不确定（反射）：true 时忽略 value 的填充、只跑转环动画
 *  - color          语义色（反射，全库统一 7 角色）：primary(默认) | secondary | success | warning | danger | info | default(中性)
 *  - size           圆环直径（不反射，写局部变量）：任意 CSS 长度或纯数字（按 px）；缺省 64px
 *  - thickness      环带厚度（不反射，写局部变量）：任意 CSS 长度或纯数字（按 px）；缺省 = size/10
 *  - duration       值变化补间时长 ms（不反射）：缺省 250，0 = 直接落定；与 x-progress 的 width 过渡对齐
 *  - label          无障碍名，缺省「进度」；不确定模式自动改播「加载中」
 *
 * 动态过程（同 x-count-up 语义）：value 变化时由 rAF 从「当前显示值」补间到新目标（ease-out），
 * 弧段与中心百分比逐帧同步行走；中途改值接着走不回跳；首次挂载从 0 扫上去。
 * aria-valuenow 始终直报目标值，读屏不被逐帧中间态轰炸。
 *
 * 中心内容两段式：定值模式自动显示「72%」百分比文本（tabular-nums 不抖宽）；
 * 默认插槽放任何东西即整体覆盖自动文本（图标/自定义文字/留空皆可）——
 * presence 非 signal 驱动不了细粒度绑定，故照 chat-bubble 惯例回写宿主标记 `has-content` 由 CSS 消费。
 *
 * 无障碍：role="progressbar" + aria-valuenow/min/max（不确定模式省 valuenow）；
 * `prefers-reduced-motion: reduce` 下转环停为静态半弧、补间直接落定，不用动效传达状态。
 * 定制：暴露 part="base" / "ring" / "center"。轨道余量色自动取主色 18% 淡染，覆写走 `--_rp-track`；
 * 主色之外的单一色 `--_rp-color`。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import radialStyles from './x-radial-progress.css?inline';

export type RadialProgressColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

class XRadialProgress extends XBaseElement {
  static tag = 'x-radial-progress';

  static properties: Record<string, PropertyOptions> = {
    value: { type: 'Number', reflect: true },
    indeterminate: { type: 'Boolean', reflect: true, default: false },
    color: { type: 'String', reflect: true, default: 'primary' },
    size: { type: 'String', default: '' },
    thickness: { type: 'String', default: '' },
    duration: { type: 'Number', default: 250 },
    label: { type: 'String', default: '进度' },
  };

  static styles = [radialStyles];

  declare value: number | undefined;
  declare indeterminate: boolean;
  declare color: RadialProgressColor;
  declare size: string;
  declare thickness: string;
  declare duration: number;
  declare label: string;

  /** 当前画面上的百分比（补间中间态，非信号、不进渲染；弧与文本逐帧由 __paint 直写） */
  private __displayed = 0;
  private __raf = 0;
  /** 上次已瞄准的目标（NaN = 哨兵：不确定态/未起播，保证转回定值时必触发一次补间） */
  private __lastTarget = Number.NaN;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  /** 不确定态：显式 indeterminate，或压根没给 value */
  private get __uncertain(): boolean {
    return this.indeterminate || this.value === undefined;
  }

  /** 夹紧到 0–100：越界写值不产生负弧/超圆 */
  private get __pct(): number {
    const v = this.value ?? 0;
    return Math.min(Math.max(v, 0), 100);
  }

  protected render(): TemplateResult {
    return html`<div class="base" part="base">
      <div
        class=${this.derive(() => (this.__uncertain ? 'ring indeterminate' : 'ring'))}
        part="ring"
        role="progressbar"
        aria-valuenow=${this.derive(() => (this.__uncertain ? undefined : this.__pct))}
        aria-valuemin=${this.derive(() => (this.__uncertain ? undefined : 0))}
        aria-valuemax=${this.derive(() => (this.__uncertain ? undefined : 100))}
        aria-label=${this.derive(() => (this.__uncertain ? '加载中' : this.label))}
      ></div>
      <div class="center" part="center"><slot></slot><span class="auto" hidden=${this.derive(() => this.__uncertain)}></span></div>
    </div>`;
  }

  protected firstUpdated(): void {
    const slot = this.shadowRoot!.querySelector('slot')!;
    slot.addEventListener('slotchange', () => this.__syncPresence());
    this.__syncPresence();
    // 首播固定从 0 扫起（同 count-up：不预置终态再动）；初渲不走 updated，这里必须自己_paint + 起播
    this.__lastTarget = this.__uncertain ? Number.NaN : this.__pct;
    this.__paint();
    if (!this.__uncertain) this.__tweenTo(this.__pct);
  }

  protected override updated(): void {
    this.__paint();
    if (this.__uncertain) {
      cancelAnimationFrame(this.__raf);
      this.__lastTarget = Number.NaN;
      return;
    }
    const target = this.__pct;
    if (target !== this.__lastTarget) {
      this.__lastTarget = target;
      this.__tweenTo(target);
    }
  }

  override disconnectedCallback(): void {
    cancelAnimationFrame(this.__raf);
    super.disconnectedCallback();
  }

  /** 插槽有内容→宿主假标记 has-content（不在观察表内、无回环），CSS 据此让自动百分比退场 */
  private __syncPresence(): void {
    const slot = this.shadowRoot!.querySelector('slot') as HTMLSlotElement | null;
    const has = !!slot && slot.assignedNodes({ flatten: false }).length > 0;
    if (has) this.setAttribute('has-content', '');
    else this.removeAttribute('has-content');
  }

  /** size/thickness 写本地变量 + 弧/文本吃 __displayed（逐帧调用，不走重渲）：空串交回 CSS 缺省 */
  private __paint(): void {
    const s = numOrUnit(this.size, 'px');
    if (s) this.style.setProperty('--_rp-size', s);
    else this.style.removeProperty('--_rp-size');
    const t = numOrUnit(this.thickness, 'px');
    if (t) this.style.setProperty('--_rp-thick', t);
    else this.style.removeProperty('--_rp-thick');
    this.style.setProperty('--_rp-pct', String(this.__displayed));
    const auto = this.shadowRoot?.querySelector('.auto');
    if (auto) auto.textContent = Math.round(this.__displayed) + '%';
  }

  /** 补间：从当前显示值走到目标（ease-out 三次缓出，与 count-up 同曲线）；中途重瞄从画面上接着走 */
  private __tweenTo(target: number): void {
    cancelAnimationFrame(this.__raf);
    const start = this.__displayed;
    const dur = Number.isFinite(this.duration) ? this.duration : 250;
    // 无动画路径：减动偏好 / 非正时长 / 起终相同——直接落定
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || dur <= 0 || start === target) {
      this.__displayed = target;
      this.__paint();
      return;
    }
    const t0 = performance.now();
    const step = (now: number): void => {
      const p = Math.min((now - t0) / dur, 1);
      this.__displayed = start + (target - start) * (1 - (1 - p) ** 3);
      this.__paint();
      if (p < 1) {
        this.__raf = requestAnimationFrame(step);
      } else {
        this.__displayed = target; // 消除浮点残差，终态精确等于目标
        this.__paint();
      }
    };
    this.__raf = requestAnimationFrame(step);
  }
}

/** 纯数字补单位（'12'→'12px'）；已带单位/令牌则原样透传；空值返回空串 */
function numOrUnit(v: string, unit: string): string {
  if (!v) return '';
  return /^\d*\.?\d+$/.test(v) ? v + unit : v;
}

declare global {
  interface HTMLElementTagNameMap {
    'x-radial-progress': XRadialProgress;
  }
}

export { XRadialProgress };
export default define(XRadialProgress);
