/**
 * x-carousel —— 轮播图（导航分类）。
 *
 * 横屏整幅滑动浏览内容（banner / 图片组 / 功能介绍）。实现走**原生 scroll-snap**：
 * 滑轨 overflow-x:auto + snap，x-carousel-item 自声明「占满一幅 + 吸附起点」，
 * JS 不做几何平移——触屏拖拽、触控板横扫、原生惯性全免费，包体也小。
 *
 * 属性：
 *  - value     当前张序（Number，不反射：随滚动高频更新，保持 DOM 干净）；写它即滚向该张；
 *              静态写 attribute 也生效（slotchange 拿到张数后补对位）
 *  - loop      无限循环（反射 Boolean）：缺省关——到头箭头禁、自动播放停、拖到端点弹回；
 *              开则走**克隆哨兵**无缝环绕：首尾各挂一张 aria-hidden+inert 的视觉缓冲张
 *              （data-clone，不计入张数），环绕只挪一步，落定后瞬时同位换到真张——不回滚轨道、无跳帧
 *  - interval  自动播放间隔 ms（Number）：缺省 0 不播；悬停/聚焦内部/页签隐藏时暂停，移开恢复
 *  - arrows    左右圆钮：缺省开。写 false（含 attribute 字面量 false）即关；与 tabs 同款坑——
 *              Boolean 缺省真值不落 attribute，故不反射，由 updated 镜像成宿主 `no-arrows` 假标记供 CSS 消费（同 badge data-anchored 范式）
 *  - indicator 指示器（反射）：dot(缺省，小圆点) | line(短条) | none
 *  - label     无障碍区域名（role=region）：缺省「轮播图」；张的「第 n 张 / 共 m 张」由根自动回写
 *
 * 方法：
 *  - next() / prev()   相对当前张前进/后退（到端点：loop 环绕，否则不动）
 *  - goTo(i)           滚向第 i 张（越界夹紧）
 *
 * 事件：
 *  - x-change  滚动落定且张序变化时派发（bubbles+composed），detail:{ value }——拖拽/箭头/指示器/
 *              自动播放/程序化改 value 全部同一条路径，取消不拦截（非表单件）
 *
 * 落定判定优先用 scrollend（动画途中不会误判）；不支持的老浏览器退回「scroll 停 120ms」debounce——
 * 帧间隔大的环境下 debounce 可能在 smooth 途中误读半张位置，配合对位滚动会自放大。
 * 快速甩动不跳张：每张声明 scroll-snap-stop:always，动量也被迫逐站停靠，一次手势只翻一张。
 * 哨兵模式下「张序 ↔ 滚动位」换算收口在 __off()（克隆态恒为 1），value 永远指真实张序；
 * 程序化环绕在动画期挂 __wrapLand（落位真张轨位），updated 的对位补滚见挂起点让路，免中途抢卷。
 *
 * 高度：根不猜高度——消费方给 host 定高（或让张内容撑开），张在轨道内 stretch 对齐。
 * 键盘不截 ←→（张内可能有横向滚动/交互内容，翻页键易误伤），钮与指示器 Tab 可达。
 * prefers-reduced-motion: reduce 下切张无平滑滚动（瞬移），自动播放语义不变。
 * 定制：暴露 part="track / prev / next / indicators"。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import '../icon/index.js';
import carouselStyles from './x-carousel.css?inline';

export type CarouselIndicator = 'dot' | 'line' | 'none';

class XCarousel extends XBaseElement {
  static tag = 'x-carousel';

  static properties: Record<string, PropertyOptions> = {
    value: { type: 'Number', default: 0 },
    loop: { type: 'Boolean', reflect: true, default: false },
    interval: { type: 'Number', default: 0 },
    arrows: { type: 'Boolean', default: true },
    indicator: { type: 'String', reflect: true, default: 'dot' },
    label: { type: 'String', default: '轮播图' },
  };

  static styles = [carouselStyles];

  declare value: number;
  declare loop: boolean;
  declare interval: number;
  declare arrows: boolean;
  declare indicator: CarouselIndicator;
  declare label: string;

  private __settleTimer = 0;
  private __autoTimer = 0;
  private __hovered = false;
  private __focused = false;
  private __count = 0;
  private readonly __useScrollEnd = 'onscrollend' in window;
  /** 哨兵重建签名（模式+张数），变了才真重建 */
  private __cloneSig = '';
  /** 程序化环绕的落位点（克隆模式下要停回的真实轨位）；非 null 即环绕动画在途 */
  private __wrapLand: number | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="track" part="track"><slot></slot></div><button type="button" class="nav prev" part="prev" aria-label="上一张"><x-icon name="chevron-left" size="20px"></x-icon></button><button type="button" class="nav next" part="next" aria-label="下一张"><x-icon name="chevron-right" size="20px"></x-icon></button><div class="indicators" part="indicators"></div>`;
  }

  protected firstUpdated(): void {
    const root = this.shadowRoot!;
    const track = root.querySelector<HTMLElement>('.track')!;
    track.addEventListener(this.__useScrollEnd ? 'scrollend' : 'scroll', this.__onScroll);
    root.querySelector<HTMLButtonElement>('.prev')!.addEventListener('click', () => this.prev());
    root.querySelector<HTMLButtonElement>('.next')!.addEventListener('click', () => this.next());
    this.addEventListener('pointerenter', () => { this.__hovered = true; this.__armAuto(); });
    this.addEventListener('pointerleave', () => { this.__hovered = false; this.__armAuto(); });
    this.addEventListener('focusin', () => { this.__focused = true; this.__armAuto(); });
    this.addEventListener('focusout', () => { this.__focused = false; this.__armAuto(); });
    document.addEventListener('visibilitychange', this.__onVisibility);
    window.addEventListener('resize', this.__onResize);
    // 静态解析时 x-carousel 先于子张升级——靠 slotchange 拿齐整的张数，动态增删也自动重同步
    root.querySelector('slot')!.addEventListener('slotchange', this.__onSlotChange);
    this.__syncStructure();
    // 踢一轮 updated：静态解析且属性全缺省时没有任何变化会触发它，而宿主 aria、no-arrows 镜像、
    // 自动播放起播都住在 updated 里——不踢首轮全部缺席（本基类不像 Lit 会自动跑首轮 updated）
    this.requestUpdate();
  }

  protected override updated(): void {
    // 假值才落 no-arrows 标记：缺省态保持 DOM 干净（不能反射 arrows 本身——缺省真值不落 attribute，
    // :host(:not([arrows])) 会把默认态误藏掉，tabs 缺省 variant 同款坑）
    this.toggleAttribute('no-arrows', !this.arrows);
    // 无障碍区域名落宿主
    this.setAttribute('role', 'region');
    this.setAttribute('aria-roledescription', 'carousel');
    if (this.label) this.setAttribute('aria-label', this.label);
    // loop 在运行时被改写不会触发 slotchange，这里按签名（模式+张数）变化补建/拆哨兵；没变则零开销早退
    if (((this.__cloneMode() ? 'c' : 'n') + this.__count) !== this.__cloneSig) {
      this.__rebuildClones(Array.from(this.querySelectorAll(':scope > x-carousel-item:not([data-clone])')));
    }
    // value 被外部写入 → 滚向该张（已在位则不动，避免滚动落定回写时自激）；环绕在途时让路，
    // 此刻 shown（哨兵区）与 want（真张）必然不等，补滚会把环绕动画反卷回轨道深处
    const track = this.shadowRoot?.querySelector<HTMLElement>('.track');
    if (track && track.clientWidth && this.__wrapLand === null) {
      const shown = Math.round(track.scrollLeft / track.clientWidth);
      const want = this.__clamp(this.value) + this.__off();
      if (shown !== want) this.__scrollTo(want);
    }
    this.__syncControls();
    this.__armAuto();
  }

  override disconnectedCallback(): void {
    clearTimeout(this.__settleTimer);
    clearInterval(this.__autoTimer);
    document.removeEventListener('visibilitychange', this.__onVisibility);
    window.removeEventListener('resize', this.__onResize);
    super.disconnectedCallback();
  }

  next(): void {
    if (!this.__count) return;
    const cur = this.__clamp(this.value);
    if (cur + 1 >= this.__count) {
      if (!this.loop) return;
      if (this.__cloneMode()) {
        // 末张再进一步落在「首张哨兵」上，落定后瞬移回真首张——全程只挪一张，视觉无缝
        this.__applyIndex(0);
        this.__wrapLand = 1;
        this.__scrollTo(this.__count + 1);
      } else {
        this.__go(0);
      }
      return;
    }
    this.__go(cur + 1);
  }

  prev(): void {
    if (!this.__count) return;
    const cur = this.__clamp(this.value);
    if (cur - 1 < 0) {
      if (!this.loop) return;
      if (this.__cloneMode()) {
        this.__applyIndex(this.__count - 1);
        this.__wrapLand = this.__count;
        this.__scrollTo(0);
      } else {
        this.__go(this.__count - 1);
      }
      return;
    }
    this.__go(cur - 1);
  }

  goTo(i: number): void {
    if (!this.__count) return;
    this.__go(this.__clamp(i));
  }

  private __go(i: number): void {
    // 直接跳转（指示器/goTo/写 value）不借哨兵，作废在途环绕落点
    this.__wrapLand = null;
    this.__scrollTo(i + this.__off());
    // 平滑滚动会经 scroll 落定回写；0 时长路径不等事件，这里统一落状态
    this.__applyIndex(i);
  }

  /** 轨道滚动位换算：克隆模式下真第 i 张在轨位 i+1（前头压着一张尾哨兵） */
  private __cloneMode(): boolean {
    return this.loop && this.__count > 1;
  }

  private __off(): number {
    return this.__cloneMode() ? 1 : 0;
  }

  private __scrollTo(i: number): void {
    const track = this.shadowRoot!.querySelector<HTMLElement>('.track')!;
    const behavior: ScrollBehavior = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    track.scrollTo({ left: i * track.clientWidth, behavior });
  }

  /** 结构同步：数张、回写每张 aria、重建指示器、校正越界 value */
  private __onSlotChange = (): void => {
    this.__syncStructure();
  };

  private __syncStructure(): void {
    const items = Array.from(this.querySelectorAll(':scope > x-carousel-item:not([data-clone])'));
    const prevCount = this.__count;
    this.__count = items.length;
    items.forEach((el, i) => {
      el.setAttribute('role', 'group');
      el.setAttribute('aria-roledescription', 'slide');
      el.setAttribute('aria-label', `第 ${i + 1} 张，共 ${this.__count} 张`);
    });
    const box = this.shadowRoot!.querySelector<HTMLElement>('.indicators')!;
    box.replaceChildren(
      ...items.map((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `切换到第 ${i + 1} 张`);
        b.addEventListener('click', () => this.goTo(i));
        return b;
      }),
    );
    this.__rebuildClones(items);
    // 只在张数真减少时收紧 value（移除场景）；静态解析期 slotchange 逐张增长 count，此时夹紧会把
    // author 写的初始 value 当成「越界」抹掉（count=1 时 value=1 被夹成 0）——缺位校正交给
    // updated 的对位（want=clamp 只用于滚动目标）与落定回写（applyIndex 会把真实张序写回 value）
    if (items.length < prevCount) this.value = this.__clamp(this.value);
    // 重走一轮 updated（滚对位 + 控件态 + 自动播放）：静态解析时开标签就升级，firstUpdated 当下
    // 子张还没解析出来（count=0），缺省态同步与起播必须等 slotchange 拿到张数后补跑；
    // 标记式踢一次（requestUpdate 自带合并），不在此直接调方法是为了滚动/控件/起播收口只住 updated 一处
    this.requestUpdate();
  }

  /**
   * 克隆哨兵重建：签名（模式+张数）没变且 DOM 完好直接跳过——哨兵的增删会再触发 slotchange，
   * 不自防就会重建→slotchange→同步→重建死循环。变化后把滚动位瞬移回当前 value 的真实轨位，
   * 保证增删张/切 loop 前后画面不动。
   */
  private __rebuildClones(items: Element[]): void {
    const cloneMode = this.__cloneMode();
    const sig = (cloneMode ? 'c' : 'n') + this.__count;
    const has = (el: Element | null | undefined) => !!el && el.matches('x-carousel-item[data-clone]');
    const intact = has(this.firstElementChild) && has(this.lastElementChild);
    if (sig === this.__cloneSig && (intact || !cloneMode)) return;
    this.__cloneSig = sig;
    this.querySelectorAll(':scope > x-carousel-item[data-clone]').forEach((el) => el.remove());
    if (cloneMode && items.length) {
      const lead = this.__makeClone(items[items.length - 1]);
      this.prepend(lead);
      const tail = this.__makeClone(items[0]);
      this.append(tail);
    }
    const track = this.shadowRoot?.querySelector<HTMLElement>('.track');
    if (track?.clientWidth) track.scrollLeft = (this.__clamp(this.value) + (cloneMode ? 1 : 0)) * track.clientWidth;
  }

  /** 哨兵是纯视觉缓冲：深克隆真张，藏出无障碍树并 inert 断掉交互，落位后由同内容真张接管 */
  private __makeClone(src: Element): HTMLElement {
    const el = src.cloneNode(true) as HTMLElement;
    el.setAttribute('data-clone', '');
    el.setAttribute('aria-hidden', 'true');
    el.inert = true;
    return el;
  }

  /** 端点禁用（非 loop）+ 指示器激活态：一切视觉跟随 value */
  private __syncControls(): void {
    const root = this.shadowRoot!;
    const prev = root.querySelector<HTMLButtonElement>('.prev')!;
    const next = root.querySelector<HTMLButtonElement>('.next')!;
    const cur = this.__clamp(this.value);
    prev.disabled = !this.loop && cur <= 0;
    next.disabled = !this.loop && cur >= this.__count - 1;
    for (const [i, b] of Array.from(root.querySelectorAll('.indicators button')).entries()) {
      b.classList.toggle('active', i === cur);
      if (i === cur) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    }
  }

  private __onScroll = (): void => {
    // scrollend 路径直达（事件本身就是“真落定”信号）；debounce 路径等静默 120ms 再判定
    if (this.__useScrollEnd) {
      this.__settle();
      return;
    }
    clearTimeout(this.__settleTimer);
    this.__settleTimer = window.setTimeout(() => this.__settle(), 120);
  };

  private __settle(): void {
    const track = this.shadowRoot!.querySelector<HTMLElement>('.track')!;
    const w = track.clientWidth;
    if (!w) return;
    // 程序化环绕落定：同位瞬移回真张（画面内容一致，无可辨跳帧）；之后的 scrollend 会按常规路径再校验一遍
    if (this.__wrapLand !== null) {
      const land = this.__wrapLand;
      this.__wrapLand = null;
      track.scrollLeft = land * w;
      this.__syncControls();
      return;
    }
    const raw = Math.round(track.scrollLeft / w);
    if (this.__cloneMode()) {
      // 用户拖进了哨兵区：那就是邻端那张的替身，记张序后瞬移到真位（无缝接盘）
      if (raw <= 0) {
        this.__applyIndex(this.__count - 1);
        track.scrollLeft = this.__count * w;
        return;
      }
      if (raw >= this.__count + 1) {
        this.__applyIndex(0);
        track.scrollLeft = w;
        return;
      }
      this.__applyIndex(raw - 1);
      return;
    }
    this.__applyIndex(raw);
  }

  private __applyIndex(i: number): void {
    if (i === this.value) {
      this.__syncControls();
      return;
    }
    this.value = i;
    this.__syncControls();
    this.dispatchEvent(new CustomEvent('x-change', { bubbles: true, composed: true, detail: { value: i } }));
  }

  private __clamp(i: number): number {
    if (!this.__count) return 0;
    return Math.min(Math.max(Number.isFinite(i) ? i : 0, 0), this.__count - 1);
  }

  /** 自动播放的启停收口：interval 有效、张数 >1、非悬停/聚焦/隐藏 才跑 */
  private __armAuto(): void {
    clearInterval(this.__autoTimer);
    const active = this.interval > 0 && this.__count > 1 && !this.__hovered && !this.__focused && !document.hidden;
    if (!active) return;
    this.__autoTimer = window.setInterval(() => this.next(), this.interval);
  }

  private __onVisibility = (): void => {
    this.__armAuto();
  };

  /** 视口变宽：按当前张重对位（无动画），防止 snap 停在半张上 */
  private __onResize = (): void => {
    const track = this.shadowRoot?.querySelector<HTMLElement>('.track');
    if (track) track.scrollLeft = (this.__clamp(this.value) + this.__off()) * track.clientWidth;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'x-carousel': XCarousel;
  }
}

export { XCarousel };
export default define(XCarousel);
