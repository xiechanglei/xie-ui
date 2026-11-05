/**
 * x-timeline-item —— 时间线项（基础分类，x-timeline 的配套件）。
 *
 * 一件事：节点（小圆点 / 图标 / 插槽覆盖）+ 时间标签 + 默认插槽内容体。
 * 内容体不预设结构——标题/正文/附件/头像随便写（库路线：原子件组合，不造 x-card）。
 * 通常包在 x-timeline 里（方向、首尾线段淡出、交替侧由容器以 data 标记单源下发）；
 * 脱离容器单独用也成立（缺省垂直、线段画满）。
 *
 * 属性：
 *  - dot-color  节点色（反射，全库统一 7 角色）：primary(缺省) | secondary | success | warning | danger | info | default(中性)；
 *               不写时吃容器 dot-color，都没有则 primary
 *  - line-color 本节点「之前」那段线的颜色（反射，7 角色）：不写时吃容器 line-color，都没有则淡边框色
 *  - icon     节点图标（反射，吃内部登记名）：不写 = 小圆点；写了只换 glyph，节点体量与点档一致
 *  - time     时间标签（内容上方 muted 小字，缺省不渲染行）
 *  - side     内容侧（反射）'start' | 'end'：alternate 时由容器轮流指派；单独写也可强制某侧（自动切三列中轴布局）
 *
 * 插槽：default = 内容体；name="icon" = 覆盖节点本体（放 x-avatar 等，presence 即隐光晕——
 * presence 非 signal 驱动不了细粒度绑定，照惯例回写宿主假标记 `has-icon-content` 由 CSS 消费）。
 *
 * 无障碍：连上即补 role="listitem"（未自写 role 才补）；时间线列表语义由父 x-timeline 提供。
 * 定制：暴露 part="base" / "node" / "content" / "time"。线段色覆写 `--_tl-line`，节点色走 dot-color 属性/`--_tl-color`。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import '../icon/x-icon.js';
import timelineItemStyles from './x-timeline-item.css?inline';

export type TimelineColorRole = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type TimelineItemSide = '' | 'start' | 'end';

class XTimelineItem extends XBaseElement {
  static tag = 'x-timeline-item';

  static properties: Record<string, PropertyOptions> = {
    dotColor: { type: 'String', reflect: true, default: '' },
    lineColor: { type: 'String', reflect: true, default: '' },
    icon: { type: 'String', reflect: true, default: '' },
    time: { type: 'String', default: '' },
    side: { type: 'String', reflect: true, default: '' },
  };

  static styles = [timelineItemStyles];

  declare dotColor: TimelineColorRole | '';
  declare lineColor: TimelineColorRole | '';
  declare icon: string;
  declare time: string;
  declare side: TimelineItemSide;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    // 节点三态互斥靠 CSS：缺省光晕+点 → [icon] 光晕放大换图标 → [has-icon-content] 光晕退场只留插槽；
    // 时间行常驻、无值时 hidden 摘掉（细粒度绑定，不重渲结构）
    return html`<div class="base" part="base"
      ><div class="node-col" part="node"
        ><span class="node"><span class="dot"></span
          ><x-icon class="ic" name=${this.derive(() => this.icon)} size="12" aria-hidden="true"></x-icon></span
        ><slot name="icon"></slot></div
      ><div class="content" part="content"
        ><div class="time" part="time" hidden=${this.derive(() => !this.time)}>${this.derive(() => this.time)}</div
        ><div class="body"><slot></slot></div></div
    ></div>`;
  }

  protected firstUpdated(): void {
    const slot = this.shadowRoot!.querySelector('slot[name="icon"]')!;
    slot.addEventListener('slotchange', () => this.__syncPresence());
    this.__syncPresence();
  }

  override connectedCallback(): void {
    // 语义补全：作为时间线列表的一项存在（未自写 role 才补，不覆盖宿主意图）
    if (!this.getAttribute('role')) this.setAttribute('role', 'listitem');
    super.connectedCallback();
  }

  /** 节点插槽有内容→宿主假标记 has-icon-content（不在观察表内、无回环），CSS 据此隐光晕 */
  private __syncPresence(): void {
    const slot = this.shadowRoot!.querySelector('slot[name="icon"]') as HTMLSlotElement | null;
    const has = !!slot && slot.assignedNodes({ flatten: false }).length > 0;
    if (has) this.setAttribute('has-icon-content', '');
    else this.removeAttribute('has-icon-content');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-timeline-item': XTimelineItem;
  }
}

export { XTimelineItem };
export default define(XTimelineItem);
