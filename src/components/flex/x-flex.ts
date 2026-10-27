/**
 * x-flex —— 弹性布局原子组件（布局分类）。
 *
 * 把常见的 `display:flex` 排布需求收敛为几个可配置属性，内部全部经自定义属性透传，
 * 间距（gap）可直接吃设计令牌别名，随主题（尺寸档位）联动。用于替代各处手写的
 * `style="display:flex;gap:..."`，减少重复、统一间距口径。
 *
 * 属性（默认值往「开箱即用即常用」靠拢：横排默认带 sm 间距、justify 从首、align 不强加）：
 *  - direction  主轴方向（row | row-reverse | column | column-reverse，默认 row，反射）
 *  - align      交叉轴对齐（align-items，反射；默认 normal=stretch，横向居中请显式传 center）
 *  - justify    主轴对齐（justify-content，反射；默认 flex-start）
 *  - wrap       是否换行（Boolean 反射）
 *  - inline     行内盒（Boolean 反射：inline-flex 而非 flex），便于嵌入文本行
 *  - gap        间距：令牌别名 none|xs|sm|md|lg 或任意 CSS 长度（默认 sm≈8px；紧贴传 none）
 *
 * 定制：暴露 part="base"。gap 别名映射到 `--xie-space-1..4`；更大间距传原始长度即可。
 * 语义：纯表现层容器，不承载文档结构语义。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import flexStyles from './x-flex.css?inline';

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

/** gap 别名 → 令牌值；未命中则原样作为 CSS 长度使用 */
const GAP_ALIAS: Record<string, string> = {
  none: '0',
  xs: 'var(--xie-space-1)',
  sm: 'var(--xie-space-2)',
  md: 'var(--xie-space-3)',
  lg: 'var(--xie-space-4)',
};

class XFlex extends XBaseElement {
  static tag = 'x-flex';

  static properties: Record<string, PropertyOptions> = {
    direction: { type: 'String', reflect: true, default: 'row' },
    align: { type: 'String', reflect: true, default: '' },
    justify: { type: 'String', reflect: true, default: '' },
    wrap: { type: 'Boolean', reflect: true, default: false },
    inline: { type: 'Boolean', reflect: true, default: false },
    gap: { type: 'String', default: 'sm' },
  };

  static styles = [flexStyles];

  declare direction: FlexDirection;
  declare align: string;
  declare justify: string;
  declare wrap: boolean;
  declare inline: boolean;
  declare gap: string;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="flex" part="base"><slot></slot></div>`;
  }

  protected firstUpdated(): void {
    this.__syncVars();
  }

  protected override updated(): void {
    this.__syncVars();
  }

  /**
   * direction/align/justify/gap 映射为宿主内联自定义属性（模板引擎只支持完整属性值插值，
   * 无法在 style 片段里拼接，故命令式写入，与 x-icon 同步尺寸变量的做法一致）。
   */
  private __syncVars(): void {
    const s = this.style;
    s.setProperty('--_dir', this.direction || 'row');
    if (this.align) s.setProperty('--_ai', this.align);
    else s.removeProperty('--_ai');
    if (this.justify) s.setProperty('--_jc', this.justify);
    else s.removeProperty('--_jc');
    const gap = (this.gap || '').trim();
    if (gap) s.setProperty('--_gap', GAP_ALIAS[gap] ?? gap);
    else s.removeProperty('--_gap');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-flex': XFlex;
  }
}

export { XFlex };
export default define(XFlex);
