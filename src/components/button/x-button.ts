/**
 * x-button —— M0 打样组件，验证 core 渲染链路：
 *  attribute 观察 → signal 桥接 → 模板细粒度绑定 → adoptedStyleSheets 共享样式
 *
 * 表单动作：`type="submit|reset"` 沿 composedPath 找最近的 form 并代为 requestSubmit/reset
 * （表单归属跳不过 shadow 边界，本件手动接线；对 x-form 与页面原生 form 一律有效）。
 */

import { XBaseElement, html, define, type PropertyOptions } from '../../core/element.js';
import '../../tokens/index.js';
import buttonStyles from './x-button.css?inline';

/** 形态（外观/填充）轴 */
export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'soft';
/** 语义色（颜色）轴：default 为中性缺省态（次要/取消类按钮，非强调角色），其余为 6 个强调角色 */
export type ButtonColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type ButtonSize = 'sm' | 'md' | 'lg';

class XButton extends XBaseElement {
  static tag = 'x-button';

  static properties: Record<string, PropertyOptions> = {
    variant: { type: 'String', reflect: true, default: 'solid' },
    color: { type: 'String', reflect: true, default: 'primary' },
    size: { type: 'String', reflect: true, default: 'md' },
    type: { type: 'String', reflect: true, default: 'button' },
    disabled: { type: 'Boolean', reflect: true, default: false },
    loading: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [buttonStyles];

  // 声明式补出响应式属性的类型（运行时由基类动态定义访问器，故用 declare 不产出代码）
  declare variant: ButtonVariant;
  declare color: ButtonColor;
  declare size: ButtonSize;
  declare type: 'button' | 'submit' | 'reset';
  declare disabled: boolean;
  declare loading: boolean;

  constructor() {
    super();
    // shadow DOM 封装内部结构，同时保留 <slot> 承接宿主 light DOM 内容
    this.attachShadow({ mode: 'open' });
  }

  protected render() {
    // 派生信号：任一状态变化都会自动驱动对应 DOM 更新
    const innerDisabled = this.derive(() => this.prop('disabled') || this.prop('loading'));
    const showSpinner = this.derive(() => !this.prop('loading'));

    return html`<button
      class="base"
      part="base"
      type=${this.signalOf('type')}
      disabled=${innerDisabled}
      aria-busy=${this.derive(() => String(!!this.prop('loading')))}
    ><span class="spinner" part="spinner" hidden=${showSpinner}></span><span class="label" part="label"><slot></slot></span></button>`;
  }

  protected firstUpdated(): void {
    this.addEventListener('click', this.__onClick);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('click', this.__onClick);
    super.disconnectedCallback();
  }

  /** 拦截禁用/加载态下的点击，其余派发可取消的 x-click，载荷携带原生事件 */
  private __onClick = (event: MouseEvent): void => {
    if (this.prop<boolean>('disabled') || this.prop<boolean>('loading')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const ok = this.emitXEvent<{ originalEvent: MouseEvent }>('x-click', { originalEvent: event }, { cancelable: true });
    if (!ok) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    // x-click 未被取消才代为接线表单动作
    this.__formAction(event);
  };

  /**
   * 表单动作接线：表单归属按节点树算，本件 shadow 里的原生 button 看不到外层 form
   * （实测 innerBtn.form 为 null、type=submit 点下去零提交），所以这里自己找归属：
   * 沿 composedPath 取最近的 form（含 x-form shadow 内的 form，投影链上能拿到），
   * 走原生 requestSubmit/reset —— 与原生 button 同一事件链路，不另发明一套提交协议。
   * 找不到 form 时与原生一致：什么都不做。x-click 被 preventDefault 则不触发（等价原生）。
   */
  private __formAction(event: MouseEvent): void {
    const type = this.prop<string>('type');
    if (type !== 'submit' && type !== 'reset') return;
    const form = event.composedPath().find((n): n is HTMLFormElement => n instanceof HTMLFormElement);
    if (!form) return;
    event.preventDefault(); // 归属已手动解析，显式派发一次即可
    if (type === 'submit') form.requestSubmit();
    else form.reset();
  };

  /** 统一事件派发：composed + bubbles，返回是否未被 preventDefault */
  protected emitXEvent<T>(type: string, detail?: T, options?: { cancelable?: boolean }): boolean {
    return this.dispatchEvent(
      new CustomEvent(type, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: options?.cancelable ?? false,
      }),
    );
  }

  /** 焦点委托给内部原生 button */
  override focus(options?: FocusOptions): void {
    const base = this.shadowRoot?.querySelector<HTMLButtonElement>('.base');
    (base ?? this).focus(options);
  }
}

// 全局标签类型增强：让 document.querySelector('x-button') 等自动获得类型与补全，
// 而无需在包的公共入口导出组件类。
declare global {
  interface HTMLElementTagNameMap {
    'x-button': XButton;
  }
}

// 仅供内部模块（分类聚合）引用；不进入公共入口的导出面。
export { XButton };
export default define(XButton);
