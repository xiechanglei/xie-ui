/**
 * x-logo —— 品牌标识组件（基础分类）。
 *
 * 站点 / 侧栏顶部的品牌块：一个标识方块（mark）+ 名称（title）+ 副标题（subtitle）。
 * 行排布复用 x-flex；标识方块复用 x-avatar（shape=rounded color=primary size=26px），
 * 因此 logo 既可用字母、也可通过 `src` 直接放品牌图片。
 *
 * src：品牌图片地址（传给内部 x-avatar）；留空则显示 mark 字母（底色吃主色令牌随主题联动）。
 * rail（轨道/窄栏态，由 x-container 下沉设置）：为 true 时隐藏 title/subtitle，
 * mark 只显示首个字母（大写并居中），适配侧栏折叠为窄栏的场景。
 *
 * 定制：暴露 part="mark"（内嵌 x-avatar）/ part="text" / part="title" / part="subtitle"。
 *
 * 折叠/展开动画：侧栏轨道宽度缓动与 rail 显隐切换不同步（展开首帧文字块已可见、轨道仍窄），
 * 因此文字固定单行 + 文字块裁切（与 x-menu-item / x-filter-item 同族做法），
 * 不然会瞬时报出多行、把行高撑起来致整块跳动。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
// 复用弹性布局原子件（副作用注册 x-flex）：logo 的行排布/文字块不再手写 flex CSS
import '../flex/x-flex.js';
// 复用头像原子件（副作用注册 x-avatar）：标识方块用它承担，logo 因此也能显示品牌图片
import '../avatar/x-avatar.js';
import logoStyles from './x-logo.css?inline';

class XLogo extends XBaseElement {
  static tag = 'x-logo';

  static properties: Record<string, PropertyOptions> = {
    mark: { type: 'String', reflect: true, default: '' },
    src: { type: 'String', default: '' },
    title: { type: 'String', reflect: true, default: '' },
    subtitle: { type: 'String', reflect: true, default: '' },
    rail: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [logoStyles];

  declare mark: string;
  declare src: string;
  declare title: string;
  declare subtitle: string;
  declare rail: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<x-flex class="row" part="row" inline align="center" gap="10px"><x-avatar class="mark" part="mark" shape="rounded" color="primary" size="26px" src=${this.derive(() => this.src)} text=${this.derive(() => (this.rail ? firstChar(this.mark) : this.mark))}></x-avatar><x-flex class="text" part="text" align="center" gap="10px"><span class="title" part="title">${this.derive(() => this.title)}</span><span class="subtitle" part="subtitle">${this.derive(() => this.subtitle)}</span></x-flex></x-flex>`;
  }

  /**
   * rail 窄栏态：布局本身交给内嵌的 x-flex，这里只切换它的公开属性——
   * 主行 justify 居中、文字块 text.hidden 隐藏（x-flex 自带 :host([hidden]) 生效），不再手写 flex CSS。
   */
  protected override updated(): void {
    const sr = this.shadowRoot!;
    const row = sr.querySelector('.row');
    if (row) (row as unknown as { justify: string }).justify = this.rail ? 'center' : 'flex-start';
    const text = sr.querySelector('.text');
    if (text) (text as HTMLElement).hidden = this.rail;
  }
}

/** 取标识首个可视字符并大写（rail 窄栏时只显示它） */
function firstChar(mark: string): string {
  return (mark || '').trim().charAt(0).toUpperCase();
}

declare global {
  interface HTMLElementTagNameMap {
    'x-logo': XLogo;
  }
}

export { XLogo };
export default define(XLogo);
