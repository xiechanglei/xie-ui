/**
 * x-avatar —— 头像 / 标识方块（基础分类）。
 *
 * 一个定尺寸、可圆角、带底色的方块，内容回退链：**图片（src）> 文字（text）> 姓名（name）首字 > 占位图标**。
 * 图片加载失败会自动回退到文字/姓名首字，再不行显示内置 user 占位图标，保证不破图。底色/文字色吃角色令牌，
 * 深浅色与主色实时联动。既可用于用户头像，也可用于品牌标（logo 的 mark 即复用本组件）。
 *
 * 属性：
 *  - src    图片地址（有且加载成功则显示 <img>）
 *  - alt    图片无障碍名
 *  - text   无图时显示的文字（如首字母/emoji）
 *  - name   当 text 为空时，从姓名取第一个字（同 logo 的 rail 表现）
 *  - size   尺寸：令牌别名 sm|md|lg（默认 md，基于 --xie-size-*）或任意 CSS 长度（如 26px）
 *  - shape  形状：default(默认，跟随全局圆角档位 --xie-radius) | circle | rounded | square（反射，走 :host([shape]) CSS）
 *  - color  文字态底色角色：default(默认，中性缺省态) | primary | secondary | success | warning | danger | info（反射）
 *
 * 定制：暴露 part="base" / part="image" / part="text" / part="placeholder"。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
// 依赖图标组件（副作用注册 x-icon）：无图且无文字时显 user 占位
import '../icon/x-icon.js';
import avatarStyles from './x-avatar.css?inline';

export type AvatarShape = 'default' | 'circle' | 'rounded' | 'square';
export type AvatarColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

/** size 令牌别名 → 令牌值；未命中则原样作为 CSS 长度 */
const SIZE_ALIAS: Record<string, string> = {
  sm: 'var(--xie-size-sm)',
  md: 'var(--xie-size-md)',
  lg: 'var(--xie-size-lg)',
};

/** 从姓名取第一个字，大写（同 logo 的 firstChar 逻辑） */
function initials(name: string): string {
  return (name || '').trim().charAt(0).toUpperCase();
}

class XAvatar extends XBaseElement {
  static tag = 'x-avatar';

  static properties: Record<string, PropertyOptions> = {
    src: { type: 'String', default: '' },
    alt: { type: 'String', default: '' },
    text: { type: 'String', default: '' },
    name: { type: 'String', default: '' },
    size: { type: 'String', reflect: true, default: 'md' },
    shape: { type: 'String', reflect: true, default: 'default' },
    color: { type: 'String', reflect: true, default: 'default' },
  };

  static styles = [avatarStyles];

  declare src: string;
  declare alt: string;
  declare text: string;
  declare name: string;
  declare size: string;
  declare shape: AvatarShape;
  declare color: AvatarColor;

  /** 图片加载失败标记（底层信号：变更即驱动显隐派生重算，无需整树重渲） */
  private __failed = this.__signal<boolean>(false);

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    const srcOk = this.derive(() => !!this.src && !this.__failed.value);
    const shown = this.derive(() => this.text || initials(this.name));
    const hasText = this.derive(() => !!shown.value);
    return html`<div class="base" part="base"><img class="img" part="image" src=${this.derive(() => this.src)} alt=${this.derive(() => this.alt)} hidden=${this.derive(() => !srcOk.value)} /><span class="txt" part="text" hidden=${this.derive(() => srcOk.value || !hasText.value)}>${shown}</span><x-icon class="ph" part="placeholder" name="user" aria-hidden="true" hidden=${this.derive(() => srcOk.value || hasText.value)}></x-icon></div>`;
  }

  protected firstUpdated(): void {
    const img = this.shadowRoot!.querySelector('.img')!;
    img.addEventListener('error', this.__onImgError);
    img.addEventListener('load', this.__onImgLoad);
    this.__syncSize();
  }

  protected override updated(): void {
    this.__syncSize();
  }

  override disconnectedCallback(): void {
    const img = this.shadowRoot?.querySelector('.img');
    if (img) {
      img.removeEventListener('error', this.__onImgError);
      img.removeEventListener('load', this.__onImgLoad);
    }
    super.disconnectedCallback();
  }

  private __onImgError = (): void => {
    this.__failed.value = true;
  };

  private __onImgLoad = (): void => {
    this.__failed.value = false;
  };

  /** size 令牌别名/原始长度 → 宿主内联 --_sz（模板引擎不能拼 style 片段，故命令式写，同 x-flex/x-icon） */
  private __syncSize(): void {
    const s = (this.size || 'md').trim();
    this.style.setProperty('--_sz', SIZE_ALIAS[s] ?? s);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-avatar': XAvatar;
  }
}

export { XAvatar };
export default define(XAvatar);
