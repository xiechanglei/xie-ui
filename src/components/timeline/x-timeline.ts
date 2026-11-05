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
 *  - line         线段色（反射，扇出 data-tl-line / data-tl-next-color）：'border'(缺省，淡边框色) | 'color'（每段线由下端节点定色：本项色 + 下一项色各管半段，整段不劈开）| 直接写色名 'primary'/'success'…（整线统一）
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
  color?: string;
}

class XTimeline extends XBaseElement {
  static tag = 'x-timeline';

  static properties: Record<string, PropertyOptions> = {
    orientation: { type: 'String', reflect: true, default: 'vertical' },
    alternate: { type: 'Boolean', reflect: true, default: false },
    line: { type: 'String', reflect: true, default: 'border' },
    label: { type: 'String', default: '时间线' },
  };

  static styles = [timelineStyles];

  declare orientation: string;
  declare alternate: boolean;
  declare line: string;
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
    const line = this.line;
    const colorMode = line === 'color';
    const named = line !== 'border' && !colorMode;
    for (let i = 0; i < items.length; i++) {
      const el = items[i];
      if (horiz) el.setAttribute('data-tl-orient', 'horizontal');
      else el.removeAttribute('data-tl-orient');
      // 线色：color/色名都下发标记供 item CSS 消费；缺省 border 不落
      if (colorMode || named) el.setAttribute('data-tl-line', line);
      else el.removeAttribute('data-tl-line');
      // color 模式：本项下半段（连向下一项）由下一项节点色定色；末项无下半段不下发
      if (colorMode && i < items.length - 1) {
        const next = items[i + 1];
        el.setAttribute('data-tl-next-color', next.color || next.getAttribute('color') || 'primary');
      } else {
        el.removeAttribute('data-tl-next-color');
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
