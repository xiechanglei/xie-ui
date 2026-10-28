/**
 * x-toast —— 轻提示容器（反馈与浮层分类）。
 *
 * 定位「挂载一个、随处调用」：页面里放一个 <x-toast>（不占布局），之后
 * `toast.add('保存成功', { color: 'success' })` 即在该容器内堆叠出一条提示。
 * 每条提示是本组件内部建的轻量 DOM（不拆 x-toast-item，省一个组件的体积），
 * 内容只支持纯文本——富内容场景请改用 dialog/drawer。
 *
 * 与遮罩类浮层的边界：不锁滚动、不进 Esc 栈、pointer-events 只落在提示条上，
 * 轻提示不打断主线操作；自动关闭期间 hover 暂停、移开续时。
 * 颜色走语义色单轴（default/primary/success/warning/danger/info），非 default 自动配对应图标；
 * 视觉全部吃全局令牌，随主题实时联动。每条关闭时派发可取消的 `x-close`（先问再关）。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import toastStyles from './x-toast.css?inline';
import { getIcon } from '../icon/icons.js';

/** 堆叠列锚位：四角 + 顶/底居中，共六向 */
export type ToastPlacement = 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
/** 语义色轴：default 为中性（无图标），其余 6 个强调角色自动映射图标 */
export type ToastColor = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

/** add() 的载荷 */
export interface ToastOptions {
  /** 提示文本（必填） */
  message?: string;
  /** 语义色，图标随色自动配；default 无图标 */
  color?: ToastColor;
  /** 自动关闭延时（毫秒），0 = 不自动关；默认 3000 */
  duration?: number;
  /** 是否显示关闭按钮 */
  closable?: boolean;
}

/** add() 返回的句柄：提前关闭某一条 */
export interface ToastHandle {
  close(): void;
}

/** color → 内置图标名（default 无图标；图标只收录内部实际用到的，见 icon/icons.ts） */
const TOAST_ICONS: Partial<Record<ToastColor, string>> = {
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'x-circle',
  info: 'info',
};

/** 内部计时器：剩余时长 + 起止点，支撑 hover 暂停/移开续时 */
interface ToastTimer {
  remaining: number;
  start: number;
  id?: ReturnType<typeof setTimeout>;
}

interface ToastRow {
  row: HTMLElement;
  timer: ToastTimer | null;
  closing: boolean;
}

/** 早于首渲的 add：先存参数与取消标记，首渲时再挂载 */
interface PendingAdd extends ToastHandle {
  o: ToastOptions;
  cancelled: boolean;
}

class XToast extends XBaseElement {
  static tag = 'x-toast';

  static properties: Record<string, PropertyOptions> = {
    /** 堆叠列锚位（六向），默认 top（顶部居中）；CSS 属性选择器驱动定位 */
    placement: { type: 'String', reflect: true, default: 'top' },
    /** 同屏最多存活条数，超出挤掉最旧一条；0 = 不限 */
    max: { type: 'Number', default: 5 },
  };

  static styles = [toastStyles];

  declare placement: ToastPlacement;
  declare max: number;

  /** 存活中的提示行（含计时器），close 走完退场动画才从这里除名 */
  private readonly __rows = new Set<ToastRow>();
  /** 早于首渲到达的 add 队列 */
  private __pending: PendingAdd[] | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected render(): TemplateResult {
    // 空堆叠列：不渲染 slot，本组件不承接 light DOM 内容，提示行全部由 add() 建进 .list
    return html`<div class="list" part="list" role="status" aria-live="polite"></div>`;
  }

  protected firstUpdated(): void {
    // 退场完成：委托到容器一次监听，服务所有行（含未来新建的）
    this.__list().addEventListener('transitionend', (e) => {
      const row = (e.target as HTMLElement).closest?.('.toast');
      if (!row) return;
      for (const t of this.__rows) if (t.row === row && t.closing) this.__remove(t);
    });
    // 首渲前（容器尚未连接）排队的 add：现在 .list 已就绪，统一挂载；
    // 挂完把句柄的 close 改接向真实行（此前它只置 cancelled，因为 DOM 还不存在）
    const pending = this.__pending;
    this.__pending = null;
    if (pending)
      for (const p of pending) {
        if (p.cancelled) continue;
        const real = this.__mount(p.o);
        p.close = real.close;
      }
  }

  /** 容器从 DOM 摘除：清掉所有未触发的计时器，防向游离节点建 DOM */
  override disconnectedCallback(): void {
    for (const t of this.__rows) if (t.timer) clearTimeout(t.timer.id);
    super.disconnectedCallback();
  }

  /**
   * 追加一条轻提示。两种写法等价：`add('文本', { color: 'success' })` /
   * `add({ message: '文本', color: 'success' })`。返回句柄可提前 close()。
   *
   * 升级时序：堆叠列 .list 由首渲建立，而首渲发生在连接后的微任务里。若 add 早于首渲
   *（典型：createElement 完立刻调、或内联脚本早于组件升级），先排队存参数，首渲时统一挂载；
   * 排队期间句柄 close() 只置取消标记，不碰尚未存在的 DOM。
   */
  add(message: string | ToastOptions, opts: ToastOptions = {}): ToastHandle {
    const o: ToastOptions = typeof message === 'string' ? { ...opts, message } : message;
    if (!(o.message ?? '').trim()) return { close: () => {} };
    if (!this.shadowRoot?.querySelector('.list')) {
      const p: PendingAdd = { o, cancelled: false, close() { p.cancelled = true; } };
      (this.__pending ??= []).push(p);
      return p;
    }
    return this.__mount(o);
  }

  /** 真正建一行并挂进堆叠列（要求 .list 已存在） */
  private __mount(o: ToastOptions): ToastHandle {
    const text = (o.message ?? '').trim();
    const color: ToastColor = o.color ?? 'default';
    const duration = o.duration ?? 3000;

    const row = document.createElement('div');
    row.className = 'toast entering';
    row.dataset.color = color;

    const iconName = TOAST_ICONS[color];
    if (iconName) {
      const icon = document.createElement('span');
      icon.className = 'toast-icon';
      icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${getIcon(iconName)}</svg>`;
      row.append(icon);
    }

    const label = document.createElement('span');
    label.className = 'toast-text';
    label.textContent = text; // 纯文本入 textContent，无 HTML 注入面
    row.append(label);

    const target: ToastRow = { row, timer: null, closing: false };
    this.__rows.add(target);
    if (o.closable) {
      const btn = document.createElement('button');
      btn.className = 'toast-close';
      btn.type = 'button';
      btn.title = '关闭';
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${getIcon('close')}</svg>`;
      btn.addEventListener('click', () => this.__close(target));
      row.append(btn);
    }

    if (duration > 0) {
      target.timer = { remaining: duration, start: 0 };
      row.addEventListener('mouseenter', () => this.__pause(target));
      row.addEventListener('mouseleave', () => this.__resume(target));
    }

    this.__list().append(row);
    // 先挂上再下一帧进场：保证 .entering→无 class 的过渡真正被浏览器起算（同帧改类会被合并跳帧）
    requestAnimationFrame(() => row.classList.remove('entering'));
    if (target.timer) this.__resume(target);

    // 超出 max 挤最旧一条（本容器插入序即时间序）
    if (this.max > 0) {
      const alive = [...this.__rows].filter((t) => !t.closing);
      for (let i = 0; i < alive.length - this.max; i++) this.__close(alive[i]);
    }

    return { close: () => this.__close(target) };
  }

  /** 清空全部提示（各条照常派发可取消的 x-close，被取消的留下） */
  clear(): void {
    for (const t of [...this.__rows]) this.__close(t);
  }

  /** 堆叠列（首渲后必存在；firstUpdated 前不会调到这里） */
  private __list(): HTMLElement {
    return this.shadowRoot!.querySelector<HTMLElement>('.list')!;
  }

  /** 关闭一条：先派发可取消的 x-close，无人拦才走退场动画 */
  private __close(target: ToastRow): void {
    if (target.closing) return;
    const ok = this.dispatchEvent(
      new CustomEvent('x-close', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { message: target.row.querySelector('.toast-text')?.textContent ?? '' },
      }),
    );
    if (!ok) return;
    target.closing = true;
    if (target.timer) clearTimeout(target.timer.id);
    target.row.classList.add('leaving');
    // 退场兜底：reduced-motion 下 transition 可能被压成 0，transitionend 不一定来
    setTimeout(() => this.__remove(target), 260);
  }

  /** 退场结束（transitionend）或被兜底定时器叫醒，两条路都幂等移除 */
  private __remove(target: ToastRow): void {
    if (!this.__rows.has(target)) return;
    this.__rows.delete(target);
    target.row.remove();
  }

  private __pause(target: ToastRow): void {
    const t = target.timer;
    if (!t || target.closing) return;
    t.remaining -= Date.now() - t.start;
    clearTimeout(t.id);
  }

  private __resume(target: ToastRow): void {
    const t = target.timer;
    if (!t || target.closing) return;
    t.start = Date.now();
    t.id = setTimeout(() => this.__close(target), Math.max(t.remaining, 0));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-toast': XToast;
  }
}

export { XToast };
export default define(XToast);
