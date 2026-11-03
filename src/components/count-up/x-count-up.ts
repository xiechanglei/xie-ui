/**
 * x-count-up —— 数字渐变组件（基础分类）：把数字从起点快速补间到目标值（「打开页面从 0 涨上去」的滚动效果）。
 *
 * 由 requestAnimationFrame 驱动，零依赖。核心语义是**监听 value**：目标值变化时，从「当前显示数字」
 * 续滚到新目标——已落定在 500 时改成 1500，即 500→1500；滚动中途改值则从画面上的数字接着走，不回跳。
 * 初始不写值也安全：显示 0，之后写入 value 即从 0 滚过去。
 *
 * 属性：
 *  - value      目标数字（反射，Number）：缺省 0；变更后自动从当前位置续滚（须已起播过）
 *  - duration   滚动时长 ms（Number）：缺省 1500
 *  - easing     缓动（反射）：linear | ease-out（缺省，先快后慢收尾）| ease-in-out
 *  - decimals   小数位数（Number）：缺省 -1 = 自动跟随目标值的小数位；显式 ≥0 则定宽补零
 *  - grouping   千分位分隔（反射 Boolean）：缺省开
 *  - separator  千分位符：缺省 ','
 *  - prefix     前缀（如 ¥）；suffix 后缀（如 %、人）
 *  - trigger    起播方式（反射）：mount（缺省，连接即滚）| visible（首次进入视口才滚）；未知值按 mount 兜底
 *
 * 方法（target 参数可选：传了等价于先写 el.value 再操，一步到位）：
 *  - play(target?)     从当前显示值滚向 target（缺省取当前 value）；visible 强启、重播、一步改目标皆用它
 *  - reset()           停止并退回 0（无参；保留「已起播」状态，后续 value 变化仍会续滚）
 *  - immediate(target?) 无动画直接落定 target（缺省取当前 value）
 *
 * 改目标两条等价路径：写属性 el.value = 1500（已起播则自动续滚）；或一步 el.play(1500)。
 * 无 manual 触发档：「等数据到达再滚」直接不写 value、到达后再赋值即可（mount 下自动从 0 滚过去）。
 * 首播总是从 0 滚起；若需「从旧值滚向新值」（如 400→500 的增长叙事），组合 el.immediate(400); el.play(500) 即可。
 *
 * 事件：
 *  - x-finish  滚动落定时派发（bubbles+composed），detail:{ value }
 *
 * 无障碍：最终值就是普通文本，读屏可达；滚动过程不抢读屏（无 live 区域）。
 * prefers-reduced-motion: reduce 时播放直接落定目标值，不做动画。
 * 细节：数字用 tabular-nums 等宽渲染，滚动过程宽度不抖动。定制：暴露 part="num"。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import countUpStyles from './x-count-up.css?inline';

export type CountUpEasing = 'linear' | 'ease-out' | 'ease-in-out';
export type CountUpTrigger = 'mount' | 'visible';

/** 缓动曲线：p∈[0,1] → 进度比例。ease-out 三次缓出为主流的「快速起步、减速着陆」手感 */
const EASINGS: Record<string, (p: number) => number> = {
  linear: (p) => p,
  'ease-out': (p) => 1 - (1 - p) ** 3,
  'ease-in-out': (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2),
};

class XCountUp extends XBaseElement {
  static tag = 'x-count-up';

  static properties: Record<string, PropertyOptions> = {
    value: { type: 'Number', reflect: true, default: 0 },
    duration: { type: 'Number', default: 1500 },
    easing: { type: 'String', reflect: true, default: 'ease-out' },
    decimals: { type: 'Number', default: -1 },
    grouping: { type: 'Boolean', reflect: true, default: true },
    separator: { type: 'String', default: ',' },
    prefix: { type: 'String', default: '' },
    suffix: { type: 'String', default: '' },
    trigger: { type: 'String', reflect: true, default: 'mount' },
  };

  static styles = [countUpStyles];

  declare value: number;
  declare duration: number;
  declare easing: CountUpEasing;
  declare decimals: number;
  declare grouping: boolean;
  declare separator: string;
  declare prefix: string;
  declare suffix: string;
  declare trigger: CountUpTrigger;

  /** 当前画面上的数字（补间中间态，非反射状态，不进渲染） */
  private __displayed = 0;
  private __raf = 0;
  /** 是否已起播（首播触发过一次即真，reset 不清）：续滚门控与 visible 重观察都看它 */
  private __played = false;
  private __lastTarget = 0;
  private __io: IntersectionObserver | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    // 数字本体 .digits 由 __paint 直写 textContent（每帧 rAF 更新，不走属性响应重渲染）；前后缀走信号绑定
    return html`<span class="num" part="num"><span class="affix">${this.derive(() => this.prefix)}</span><span class="digits"></span><span class="affix">${this.derive(() => this.suffix)}</span></span>`;
  }

  protected firstUpdated(): void {
    this.__displayed = 0; // 首播固定从 0 起滚（无 from 属性：旧值起点场景用 immediate(旧值)+play(新值) 组合）
    this.__lastTarget = this.value;
    this.__paint();
    this.__arm();
  }

  protected override updated(): void {
    // 模板是细粒度信号绑定（前后缀自动更新），.digits 由 __paint 直写；这里重绘兼做起终态兜底
    this.__paint();
    const target = this.__safe(this.value, 0);
    if (target !== this.__lastTarget) {
      this.__lastTarget = target;
      // 已起播过才「续滚」；visible 未进场时只记目标，待进场时一并滚向最新值
      if (this.__played) this.__tweenTo(target);
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // visible 模式被暂时移出文档后又插回：未播过则恢复观察
    if (this.__io && !this.__played) this.__io.observe(this);
  }

  override disconnectedCallback(): void {
    cancelAnimationFrame(this.__raf);
    this.__io?.disconnect();
    super.disconnectedCallback();
  }

  /** 启动滚动：滚向 target（缺省取当前 value）；visible 强启与一步改目标共用此入口 */
  play(target?: number): void {
    this.__played = true;
    this.__io?.disconnect();
    this.__tweenTo(this.__aim(target));
  }

  /** 退回 0 并停止；不清「已起播」标记——之后改 value 仍会从 0 自动续滚 */
  reset(): void {
    cancelAnimationFrame(this.__raf);
    this.__displayed = 0;
    this.__lastTarget = this.__safe(this.value, 0);
    this.__paint();
  }

  /** 跳过动画直接落定：target 缺省取当前 value */
  immediate(target?: number): void {
    const t = this.__aim(target);
    cancelAnimationFrame(this.__raf);
    this.__displayed = t;
    this.__paint();
  }

  /** 目标解析：传入有限数则同步写回 value（含反射）并预标 __lastTarget，
   * 避免随后异步 updated() 对同一目标再起一段补间；非法/缺省回退当前 value */
  private __aim(target?: number): number {
    if (target !== undefined && Number.isFinite(target)) {
      this.value = target;
      this.__lastTarget = target;
      return target;
    }
    return this.__safe(this.value, 0);
  }

  /** 按 trigger 决定何时首播；未知/非法值一律按 mount 兕底，保证数字不会静默不动 */
  private __arm(): void {
    if (this.trigger === 'visible') {
      this.__io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) this.play();
      });
      this.__io.observe(this);
    } else {
      this.play();
    }
  }

  /** Number 属性可能被写成 NaN/undefined（非法 attribute），统一兜底 */
  private __safe(v: number, fallback: number): number {
    return Number.isFinite(v) ? v : fallback;
  }

  private __tweenTo(target: number): void {
    cancelAnimationFrame(this.__raf);
    const start = this.__displayed;
    const dur = this.__safe(this.duration, 1500);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // 无动画路径：减动偏好 / 非法时长 / 起终相同 —— 直接落定，同样派发 x-finish
    if (reduce || dur <= 0 || start === target) {
      this.__displayed = target;
      this.__paint();
      this.__emitFinish(target);
      return;
    }
    const ease = EASINGS[this.easing] ?? EASINGS['ease-out'];
    const t0 = performance.now();
    const step = (now: number): void => {
      const p = Math.min((now - t0) / dur, 1);
      this.__displayed = start + (target - start) * ease(p);
      this.__paint();
      if (p < 1) {
        this.__raf = requestAnimationFrame(step);
      } else {
        this.__displayed = target; // 消除浮点残差，终值精确等于目标
        this.__paint();
        this.__emitFinish(target);
      }
    };
    this.__raf = requestAnimationFrame(step);
  }

  private __emitFinish(value: number): void {
    this.dispatchEvent(new CustomEvent('x-finish', { bubbles: true, composed: true, detail: { value } }));
  }

  private __paint(): void {
    const el = this.shadowRoot?.querySelector('.digits');
    if (el) el.textContent = this.__format(this.__displayed);
  }

  /** 格式化：小数位 → 分组 → 负号（对绝对值分组，负数不错位） */
  private __format(n: number): string {
    const d = this.__effectiveDecimals();
    const fixed = Math.abs(n).toFixed(d);
    const dot = fixed.indexOf('.');
    const int = d > 0 ? fixed.slice(0, dot) : fixed;
    const frac = d > 0 ? fixed.slice(dot + 1) : '';
    const sep = this.separator || ',';
    const grouped = this.grouping ? int.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : int;
    const body = d > 0 ? `${grouped}.${frac}` : grouped;
    return (n < 0 && Math.abs(n) >= 0.5 / 10 ** d ? '-' : '') + body;
  }

  /** decimals=-1 时按 value 的小数位数自动（科学计数法回退 0 位） */
  private __effectiveDecimals(): number {
    if (this.decimals >= 0) return Math.min(Math.trunc(this.decimals), 20);
    return decimalPlaces(this.value);
  }
}

function decimalPlaces(v: number): number {
  if (!Number.isFinite(v)) return 0;
  const s = String(v);
  if (/e/i.test(s)) return 0;
  const dot = s.indexOf('.');
  return dot < 0 ? 0 : s.length - dot - 1;
}

declare global {
  interface HTMLElementTagNameMap {
    'x-count-up': XCountUp;
  }
}

export { XCountUp };
export default define(XCountUp);
