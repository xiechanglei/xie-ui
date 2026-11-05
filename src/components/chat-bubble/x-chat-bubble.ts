/**
 * x-chat-bubble —— 聊天气泡（基础分类）。
 *
 * 一条消息一个气泡：`side` 决定收/发对齐（start 接收方靠左、end 发送方靠右），气泡面朝头像侧的上角
 * 收小圆角——方向感来自角圆差而非物理尾巴（尾巴方案多轮尝试后已按用户决定整体移除，见 design.md）。
 * 外观沿用 x-box/x-button 双轴范式：`variant`（soft 缺省）× `color`（7 角色）正交；两轴不互相窥探。
 *
 * 三段结构 + 主体：avatar / header（发送者名 + 时间）/ bubble 正文 / footer（送达状态）。
 * header、footer 走「属性快捷 / slot 自定义」两段式（accordion 同款）：`name`+`time` 快捷拼 header，
 * `footer` 快捷放一行状态文本；同名 slot 有内容即整体覆盖快捷路径。avatar 只给 slot（x-avatar 一行即摆）。
 * 空段自动不占位（slotchange + updated 双路检测，presence 判定幂等——静态解析期渐进触发也安全）。
 *
 * 属性：
 *  - side     收/发（反射）：start(缺省，靠左) | end（靠右，镜像布局）
 *  - variant  气泡形态（反射）：solid | soft(缺省) | outline | ghost；缺省态样式落 .bubble 基座兜底（默认值不反射）
 *  - color    气泡角色色（反射）：default(缺省) | primary | secondary | success | warning | danger | info
 *  - name     header 发送者名（不反射）：快捷路径，被 slot="header" 覆盖
 *  - time     header 时间戳（不反射）：跟在名字右侧、弱化色
 *  - footer   状态行文本（不反射）：如 Seen/Delivered；被 slot="footer" 覆盖
 *  - read     已读态（Boolean 反射，默认 false）：footer 段自动拼「已读 + ✓」（内置 check 图标、success 色）；
 *             同时写了 footer 文本则用其作标签、勾照带；slot="footer" 整体覆盖快捷路径
 *
 * 定制：气泡最大宽度写宿主局部变量 `--_bubble-maxw`（缺省 80%）；暴露 part="row / avatar / header / bubble / footer"。
 * 富内容（图片/图集/附件）不是 API 维度——往默认插槽里组合原子件即可（文档页有示例）。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
// 依赖图标组件（副作用注册 x-icon）：已读态取内置 check 图标
import '../icon/x-icon.js';
import bubbleStyles from './x-chat-bubble.css?inline';

export type BubbleSide = 'start' | 'end';
export type BubbleVariant = 'solid' | 'soft' | 'outline' | 'ghost';
export type BubbleColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

class XChatBubble extends XBaseElement {
  static tag = 'x-chat-bubble';

  static properties: Record<string, PropertyOptions> = {
    side: { type: 'String', reflect: true, default: 'start' },
    variant: { type: 'String', reflect: true, default: 'soft' },
    color: { type: 'String', reflect: true, default: 'default' },
    name: { type: 'String', default: '' },
    time: { type: 'String', default: '' },
    footer: { type: 'String', default: '' },
    read: { type: 'Boolean', reflect: true, default: false },
  };

  static styles = [bubbleStyles];

  declare side: BubbleSide;
  declare variant: BubbleVariant;
  declare color: BubbleColor;
  declare name: string;
  declare time: string;
  declare footer: string;
  declare read: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    return html`<div class="row" part="row">
      <div class="avatar" part="avatar"><slot name="avatar"></slot></div>
      <div class="stack">
        <div class="header" part="header"><slot name="header"><span class="name">${this.derive(() => this.name)}</span><span class="time">${this.derive(() => this.time)}</span></slot></div>
        <div class="bubble" part="bubble"><slot></slot></div>
        <div class="footer" part="footer"><slot name="footer"><span class="foot-text">${this.derive(() => this.footer || (this.read ? '已读' : ''))}</span><x-icon class="read-check" name="check" size="12px" hidden=${this.derive(() => !this.read)}></x-icon></slot></div>
      </div>
    </div>`;
  }

  protected firstUpdated(): void {
    const root = this.shadowRoot!;
    for (const name of ['avatar', 'header', 'footer']) {
      root.querySelector(`slot[name="${name}"]`)!.addEventListener('slotchange', () => this.__syncFlags());
    }
    this.__syncFlags();
  }

  protected override updated(): void {
    this.__syncFlags();
  }

  /**
   * 段可见性回写宿主假标记（has-avatar/has-header/has-footer，不在 properties 观察表内、无回环）。
   * presence 判定幂等，不数渐进数量——静态解析期 slotchange 随子件逐个进来也收敛到正确终态。
   */
  private __syncFlags(): void {
    const root = this.shadowRoot!;
    const assigned = (name: string): boolean => {
      const slot = root.querySelector(`slot[name="${name}"]`) as HTMLSlotElement | null;
      return !!slot && slot.assignedNodes({ flatten: false }).length > 0;
    };
    this.__flag('has-avatar', assigned('avatar'));
    this.__flag('has-header', assigned('header') || !!this.name || !!this.time);
    this.__flag('has-footer', assigned('footer') || !!this.footer || this.read);
  }

  private __flag(attr: string, on: boolean): void {
    if (on) this.setAttribute(attr, '');
    else this.removeAttribute(attr);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-chat-bubble': XChatBubble;
  }
}

export { XChatBubble };
export default define(XChatBubble);
