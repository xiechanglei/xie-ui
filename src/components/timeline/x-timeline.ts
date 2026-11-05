/**
 * x-timeline —— 时间线容器（基础分类）。
 *
 * 包裹若干 <x-timeline-item>（light DOM 默认插槽），本件只做协调三件事：
 *  1) 方向布局（vertical 缺省 / horizontal 横向滚动）与 alternate 左右交替的**轮流指派**；
 *  2) 首尾线段淡出标记下发（data-tl-first / data-tl-last，item 据此收掉半段连线）；
 *  3) 提供 role=list 列表语义与无障碍名（各项由 x-timeline-item 自补 role=listitem）。
 * 节点、线段、外壳样式都在 x-timeline-item 里画，本件不搬内容。
 *
 * 属性：
 *  - orientation  方向（反射）：'vertical'(缺省) | 'horizontal'（横向排列、溢出滚动）
 *  - alternate    左右交替（反射，仅垂直有意义）：true 时容器按序给各项指派 side（偶 start 奇 end），
 *                 形成中轴线；退出交替即清空指派
 *  - dot-color    全局节点色（扇出 data-tl-dot）：7 角色色名，仅对未自写 dot-color 的项生效
 *  - line-color   全局线色（扇出 data-tl-line / data-tl-next-line）：7 角色色名；项自写 line-color 可覆盖；
 *                 都未写时缺省淡边框色
 *  - label        列表无障碍名（缺省「时间线」）
 *
 * 定制：暴露 part="base"。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import './x-timeline-item.js';
import timelineStyles from './x-timeline.css?inline';

/** 结构型引用，避免跨模块循环依赖 */
interface ItemLike extends HTMLElement {
  dotColor?: string;
  lineColor?: string;
}

class XTimeline extends XBaseElement {
  static tag = 'x-timeline';

  static properties: Record<string, PropertyOptions> = {
    orientation: { type: 'String', reflect: true, default: 'vertical' },
    alternate: { type: 'Boolean', reflect: true, default: false },
    dotColor: { type: 'String', reflect: true, default: '' },
    lineColor: { type: 'String', reflect: true, default: '' },
    label: { type: 'String', default: '时间线' },
  };

  static styles = [timelineStyles];

  declare orientation: string;
  declare alternate: boolean;
  declare dotColor: string;
  declare lineColor: string;
  declare label: string;

  /** 本件压过 side 的项（撤销时只撤自己设过的，不动宿主自己写的） */
  private __assigned = new WeakSet<ItemLike>();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="base" part="base" role="list" aria-label=${this.derive(() => this.label || '时间线')}><slot></slot></div>`;
  }

  protected firstUpdated(): void {
    // 静态解析时子件升级晚于本件、slotchange 随解析逐个触发——每轮全量幂等下发即可收敛
    this.shadowRoot!.querySelector('slot')!.addEventListener('slotchange', this.__onSlotChange);
    this.__sync();
  }

  protected override updated(): void {
    this.__sync();
  }

  override disconnectedCallback(): void {
    this.shadowRoot?.querySelector('slot')?.removeEventListener('slotchange', this.__onSlotChange);
    super.disconnectedCallback();
  }

  private __onSlotChange = (): void => {
    this.__sync();
  };

  /** 方向/首尾/交替三类标记单源下发（幂等：每轮按当前子件列表重算，增删自动跟上） */
  private __sync(): void {
    const items = Array.from(this.querySelectorAll<ItemLike>('x-timeline-item'));
    if (!items.length) return;
    const horiz = this.orientation === 'horizontal';
    const alt = this.alternate && !horiz;
    const dotDefault = this.dotColor;
    const lineDefault = this.lineColor;
    for (let i = 0; i < items.length; i++) {
      const el = items[i];
      if (horiz) el.setAttribute('data-tl-orient', 'horizontal');
      else el.removeAttribute('data-tl-orient');
      // 点色三级优先：本项 dot-color > 容器 dot-color（仅在项未写时兜底下发）> 缺省 primary（CSS :host 基规则）；
      // own 存在时不发 data-tl-* 兜底标记，两组 CSS 规则不会同时命中，书写顺序无关
      const ownDot = el.dotColor || el.getAttribute('dot-color') || '';
      if (!ownDot && dotDefault) el.setAttribute('data-tl-dot', dotDefault);
      else el.removeAttribute('data-tl-dot');
      // 线色同理：本项 line-color（= 本节点之前那段线）> 容器 line-color 兜底 > 缺省淡边框色
      const ownLine = el.lineColor || el.getAttribute('line-color') || '';
      if (!ownLine && lineDefault) el.setAttribute('data-tl-line', lineDefault);
      else el.removeAttribute('data-tl-line');
      // 下半段（::after）是「下一项之前」的线：按下一项 line-color 优先、容器 line-color 次之；末项无下半段不下发
      if (i < items.length - 1) {
        const next = items[i + 1];
        const nextLine = next.lineColor || next.getAttribute('line-color') || lineDefault || '';
        if (nextLine) el.setAttribute('data-tl-next-line', nextLine);
        else el.removeAttribute('data-tl-next-line');
      } else {
        el.removeAttribute('data-tl-next-line');
      }
      // 交替时全体项统一三列同轴（含未指派侧的）：否则两列/三列混排，中轴 x 错位、连线断开
      if (alt) el.setAttribute('data-tl-alt', '');
      else el.removeAttribute('data-tl-alt');
      if (i === 0) el.setAttribute('data-tl-first', '');
      else el.removeAttribute('data-tl-first');
      if (i === items.length - 1) el.setAttribute('data-tl-last', '');
      else el.removeAttribute('data-tl-last');
      // side 走 attribute 写（attribute 来源不 reflect 回写、不成环）；
      // 不走 property：基类 reflect 空串会落 side="" 残 attribute，撤销不干净
      if (alt) {
        el.setAttribute('side', i % 2 === 0 ? 'start' : 'end');
        this.__assigned.add(el);
      } else if (this.__assigned.has(el)) {
        el.removeAttribute('side');
        this.__assigned.delete(el);
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-timeline': XTimeline;
  }
}

export { XTimeline };
export default define(XTimeline);
