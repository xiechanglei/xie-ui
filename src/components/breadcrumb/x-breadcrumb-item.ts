/**
 * x-breadcrumb-item —— 路径项（导航分类，x-breadcrumb 的配套件）。
 *
 * 面包屑里的一格：默认插槽放文字/图标等富内容（单入口，不设 label 属性以免两处写同一件事）。
 * 写了 `href` 即渲染成真链接（右键、新标签页、Ctrl/⌘+点击等原生能力都在）；点击时**先**派发可取消的
 * `x-select`，宿主 `preventDefault()` 即拦下跳转（SPA 自路由的接入点）；未写 href 则退为占位锚
 * （无链接语义、不可点、不进 Tab 序）。需要 target/rel 等原生链接属性时：不写 href，把 `<a>` 自己放进默认插槽。
 *
 * 以下三项通常<b>不由手写</b>，而由父级 x-breadcrumb 单源下沉（脱离根单独使用时自写照样生效）：
 *  - separator  分隔符形态 'slash' | 'chevron' | 'none'，画在本项<b>之前</b>，首项自动不留
 *  - current    当前页（根按「末项」自动判定）：不可点 + aria-current="page"，href 被忽略
 *  - ellipsis   折叠占位：本项代表被折叠的前段渲染成「…」按钮，点击上抛给根展开全部
 *
 * 只读：`linkable` —— 本项此刻是否为真链接（非当前页、非折叠占位且写了 href）。
 * 定制：暴露 part="base" / "separator" / "crumb" / "more"。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import '../icon/x-icon.js';
import breadcrumbItemStyles from './x-breadcrumb-item.css?inline';

/** 分隔符形态（chevron 吃内部已登记的 chevron-right 图标，随主题与字号联动） */
export type BreadcrumbSeparator = 'slash' | 'chevron' | 'none';

class XBreadcrumbItem extends XBaseElement {
  static tag = 'x-breadcrumb-item';

  static properties: Record<string, PropertyOptions> = {
    href: { type: 'String', default: '' },
    separator: { type: 'String', reflect: true, default: 'slash' },
    current: { type: 'Boolean', reflect: true, default: false },
    ellipsis: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [breadcrumbItemStyles];

  declare href: string;
  declare separator: BreadcrumbSeparator;
  declare current: boolean;
  declare ellipsis: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    // 分隔符两种形态与「…」常驻、靠 hidden 显隐（细粒度绑定，不重排结构，同 x-tag 关闭钮）；
    // 分隔符<b>不</b>因 ellipsis 而隐藏：折叠占位也是路径里的一格，否则「首项 …」之间会少一个分隔符、节奏断裂；
    // 链接/文本共用一个 <a>：href 绑不到值即被摘除，占位锚天然不可点（免拆二选一、也不会出现两个无名 slot）。
    const slash = this.derive(() => this.separator === 'slash');
    const chevron = this.derive(() => this.separator === 'chevron');
    const linkable = this.derive(() => !this.current && !!this.href);
    return html`<span class="base" part="base"><span class="sep" part="separator" aria-hidden="true" hidden=${this.derive(() => !slash.value)}>/</span
      ><x-icon class="sep sep-icon" part="separator" name="chevron-right" size="0.9em" aria-hidden="true" hidden=${this.derive(() => !chevron.value)}></x-icon
      ><a class="crumb" part="crumb" href=${this.derive(() => (linkable.value ? this.href : undefined))} aria-current=${this.derive(() => (this.current ? 'page' : undefined))}><slot></slot></a
      ><button class="more" part="more" type="button" aria-label="展开完整路径" hidden=${this.derive(() => !this.ellipsis)}>…</button></span>`;
  }

  protected firstUpdated(): void {
    this.shadowRoot!.querySelector<HTMLAnchorElement>('.crumb')!.addEventListener('click', this.__onCrumbClick);
    this.shadowRoot!.querySelector<HTMLButtonElement>('.more')!.addEventListener('click', this.__onMoreClick);
  }

  override disconnectedCallback(): void {
    const sr = this.shadowRoot;
    if (sr) {
      sr.querySelector<HTMLAnchorElement>('.crumb')?.removeEventListener('click', this.__onCrumbClick);
      sr.querySelector<HTMLButtonElement>('.more')?.removeEventListener('click', this.__onMoreClick);
    }
    super.disconnectedCallback();
  }

  /** 链接项点击：派发可取消的 x-select（detail:{href,text}），宿主拦下即阻止原生跳转 */
  private __onCrumbClick = (event: MouseEvent): void => {
    if (!this.linkable) return;
    const accepted = this.dispatchEvent(
      new CustomEvent('x-select', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { href: this.href, text: (this.textContent || '').trim() },
      }),
    );
    if (!accepted) event.preventDefault();
  };

  /** 「…」点击：上抛内部事件（bubbles 不 composed，只在 light DOM 链路由 x-breadcrumb 接住） */
  private __onMoreClick = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('x-breadcrumb-expand', { bubbles: true }));
  };

  /** 本项当前是否可点（真链接）：非当前页、非折叠占位且写了 href */
  get linkable(): boolean {
    return !this.current && !this.ellipsis && !!this.href;
  }

  override connectedCallback(): void {
    // 语义补全：作为 x-breadcrumb 列表的一项存在（未自写 role 才补，不覆盖宿主意图）
    if (!this.getAttribute('role')) this.setAttribute('role', 'listitem');
    super.connectedCallback();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-breadcrumb-item': XBreadcrumbItem;
  }
}

export { XBreadcrumbItem };
export default define(XBreadcrumbItem);
