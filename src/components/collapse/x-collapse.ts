/**
 * x-collapse —— 折叠区域（导航分类）。
 *
 * 一块「触发钮 + 可折叠内容」的独立片段：点触发钮展开/收起内容，高度走 grid 0fr↔1fr 自适应动画
 * （复用 x-accordion-item 经验，常驻留白放裁切区更内一层，免 0fr 下限抬高的收起空隙）。
 *
 * 与 x-accordion-item 的分工：item 是「面板行」——自带分隔线与整行标题栏、可被 x-accordion 收编
 * 单开互斥；本件是「正文里的自由片段」——无边框卡片表态（容器不表态，外观交消费方/x-box 自理），
 * 触发钮可上可下（placement=bottom 即「展开全文/Read more」形态），单独使用、不与任何根协调。
 *
 * 属性：
 *  - open      展开态（反射 Boolean）：写它即开合（程序化不派发事件）
 *  - label     触发钮文本（不反射）：快捷路径；被 slot="trigger" 内容覆盖（图标/多行/任意呈现自控）
 *  - placement 触发钮位置（反射）：top(缺省，钮在内容上方) | bottom（内容在上、钮缀尾部——
 *              「展开全文/Read more」形态；视觉序经 column-reverse 翻转，DOM/朗读序恒为钮在前，
 *              两种形态的阅读入口都自然）
 *  - disabled  禁用（反射）：触发钮不可点
 *
 * 方法：
 *  - toggle(force?)  开/合（force 可强制指定）；disabled 忽略
 *
 * 事件：
 *  - x-change  用户点触发钮切换后派发（bubbles+composed），detail:{ open }；程序化写 open 不派发
 *
 * 无障碍：触发钮 aria-expanded + aria-controls，内容区 role=region。
 * prefers-reduced-motion: reduce 下开合无动画（瞬变）。
 * 定制：暴露 part="trigger / content / content-inner"；chevron 在 trigger 内自带（slot=trigger 时随自定义内容自摆）。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import '../icon/x-icon.js';
import collapseStyles from './x-collapse.css?inline';

export type CollapsePlacement = 'top' | 'bottom';

class XCollapse extends XBaseElement {
  static tag = 'x-collapse';

  static properties: Record<string, PropertyOptions> = {
    open: { type: 'Boolean', reflect: true, default: false },
    label: { type: 'String', default: '展开全文' },
    placement: { type: 'String', reflect: true, default: 'top' },
    disabled: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [collapseStyles];

  declare open: boolean;
  declare label: string;
  declare placement: CollapsePlacement;
  declare disabled: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="box" part="box">
      <button
        class="trigger"
        part="trigger"
        type="button"
        aria-controls="body"
        aria-expanded=${this.derive(() => String(this.open))}
        aria-disabled=${this.derive(() => (this.disabled ? 'true' : undefined))}
        disabled=${this.derive(() => this.disabled)}
      ><span class="t-main"><slot name="trigger"><span class="preset">${this.derive(() => this.label)}</span></slot></span><span class="chevron" aria-hidden="true"><x-icon name="chevron-down"></x-icon></span></button>
      <div class="content" part="content" id="body" role="region"><div class="content-inner" part="content-inner"><div class="content-body"><slot></slot></div></div></div>
    </div>`;
  }

  protected firstUpdated(): void {
    this.shadowRoot!.querySelector<HTMLButtonElement>('.trigger')!.addEventListener('click', this.__onTrigger);
  }

  override disconnectedCallback(): void {
    this.shadowRoot?.querySelector('.trigger')?.removeEventListener('click', this.__onTrigger);
    super.disconnectedCallback();
  }

  /** 展开 / 收起（force 可强制指定）；禁用时忽略。用户主动切换才派发 x-change */
  toggle(force?: boolean, fromUser = true): void {
    if (this.disabled) return;
    const next = force ?? !this.open;
    if (next === this.open) return;
    this.open = next;
    if (fromUser) {
      this.dispatchEvent(new CustomEvent('x-change', { bubbles: true, composed: true, detail: { open: this.open } }));
    }
  }

  private __onTrigger = (): void => {
    this.toggle(undefined, true);
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'x-collapse': XCollapse;
  }
}

export { XCollapse };
export default define(XCollapse);
