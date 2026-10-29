/**
 * 浮层公共工具（库内部，不对外暴露）——遮罩类浮层（x-drawer / x-dialog）共享的三件事：
 *
 * 1. 页面滚动锁：**跨实例计数**。各浮层自己维护计数器的话，嵌套场景（抽屉里再开对话框）
 *    关内层就会把外层的锁也解掉；只有一个计数器才正确。
 * 2. Esc 关闭栈：全局**只挂一个** keydown 监听，按 Esc 关「最上面那层」。
 *    各浮层各自监听会导致一次 Esc 把所有开着的浮层一起关掉。
 * 3. 焦点陷阱：浮层打开时把 Tab 循环锁在面板内、进入自动聚焦首个可聚焦件、
 *    关闭时把焦点归还给打开前的来源元素。可聚焦集合须**穿透 shadow**（面板内件 +
 *    slot 分布进来的 light DOM 件 + 内嵌组件 shadow 里的真实可聚焦件），
 *    否则库自身「组件套组件」的结构（x-button 内是 shadow 里的原生 button）会漏判。
 */

/** 已打开浮层的「用户请求关闭」回调栈（后开的在数组尾部，Esc 关栈顶） */
const closers: (() => void)[] = [];

let lockCount = 0;

/** 锁定页面滚动（首个持锁者真正落样式） */
export function lockPageScroll(): void {
  if (lockCount++ === 0) document.documentElement.style.overflow = 'hidden';
}

/** 解除页面滚动锁（最后一个持锁者关闭时才还原） */
export function unlockPageScroll(): void {
  if (--lockCount <= 0) {
    lockCount = 0;
    document.documentElement.style.overflow = '';
  }
}

/**
 * 登记浮层的关闭回调（浮层打开时调用）。
 * 需传稳定引用（如实例上的箭头函数字段），否则重复入栈、注销也找不到同一条。
 */
export function pushOverlayCloser(close: () => void): void {
  if (closers.includes(close)) return;
  closers.push(close);
  document.addEventListener('keydown', onKey);
}

/** 注销浮层的关闭回调（浮层关闭或从 DOM 摘除时必须调用，防泄漏） */
export function popOverlayCloser(close: () => void): void {
  const i = closers.indexOf(close);
  if (i < 0) return;
  closers.splice(i, 1);
  if (!closers.length) document.removeEventListener('keydown', onKey);
}

/** 按 Esc 关栈顶浮层；事件已被 preventDefault（如浮层内的下拉正在消费 Esc）则不抢 */
function onKey(event: KeyboardEvent): void {
  if (event.key !== 'Escape' || event.defaultPrevented) return;
  const top = closers[closers.length - 1];
  if (top) top();
}

/* -------------------------------------------------------------------------- */
/*                              滚动重定位监听目标                              */
/* -------------------------------------------------------------------------- */

/**
 * 收集「能收到宿主相关滚动信号」的事件目标：window + 宿主所在铺平树（flattened tree）
 * 祖先链上的每个 shadow root。
 *
 * 坑：scroll 事件不冒泡也 **不跨 shadow 边界**（composed:false），只挂 window capture 监听
 * 接不到 shadow 内滚动容器的信号——典型如文档站：popover 在 x-container 的 light DOM（经 slot
 * 布进 shadow 内的 .main），滚动发生在 x-container 的 shadow 树里，window 完全听不到，
 * 浮层停在旧坐标「随页面滚动错乱」。捕获路径会经过事件所在树的每个节点（含 shadow root），
 * 故给链上每个 shadow root 挂 capture 监听即可接住其内任意元素的滚动；文档/光 DOM 滚动仍由 window 接。
 *
 * 上溯走铺平树而非 parentNode：遇 assignedSlot（被分布进父树的光 DOM 元素）就跳进 slot 所在的
 * shadow 树继续，才能从宿主一直走到 x-container 这类外层树的 shadow root。
 */
export function scrollTargetsFor(el: Element): EventTarget[] {
  const targets: EventTarget[] = [window];
  let n: Node | null = el;
  while (n) {
    if (n instanceof ShadowRoot) {
      targets.push(n);
      n = n.host;
    } else {
      const slot: HTMLSlotElement | null = (n as Element).assignedSlot ?? null;
      n = slot ?? n.parentNode;
    }
  }
  return targets;
}

/* -------------------------------------------------------------------------- */
/*                                焦点陷阱                                       */
/* -------------------------------------------------------------------------- */

/**
 * 可聚焦选择器。排除 tabindex="-1"（可编程聚焦但不进 Tab 序）与隐藏 input。
 * 命中的是各 shadow 内的**真实可聚焦件**（原生 button/input…），自定义元素宿主
 * 因不在名单内、也不会被误收（它们的焦点落在自己 shadow 里的原生件上）。
 */
const FOCUSABLE =
  'a[href],area[href],button:not([disabled]),input:not([type="hidden"]):not([disabled]),' +
  'select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),' +
  '[contenteditable]:not([contenteditable="false"]),audio[controls],video[controls]';

/** 单个浮层的焦点陷阱状态（按宿主元素存，幂等：重复 activate 不重复入栈） */
interface FocusTrap {
  /** 打开前的来源焦点元素，关闭时归还 */
  prevActive: Element | null;
  /** 承接 Tab 拦截的宿主（浮层组件本身） */
  scope: HTMLElement;
  /** 兜底聚焦对象（面板，需 tabindex=-1）：无内嵌可聚焦件时聚焦它 */
  panel: HTMLElement;
  onTab: (event: KeyboardEvent) => void;
}

const traps = new WeakMap<HTMLElement, FocusTrap>();

/**
 * 遍历一个节点的「组合序」子节点：有 shadow 则进 shadow，遇 <slot> 展开为分布进来的
 * light DOM 元素（flatten 保留 slot 占位默认内容），从而覆盖跨 shadow 的完整焦点链。
 */
function eachComposedChild(node: Element, cb: (child: Element) => void): void {
  const root: ParentNode = (node as { shadowRoot?: ShadowRoot | null }).shadowRoot ?? node;
  for (const child of Array.from(root.children)) {
    if (child.tagName === 'SLOT') {
      for (const assigned of (child as HTMLSlotElement).assignedElements({ flatten: true })) {
        cb(assigned);
      }
    } else {
      cb(child);
    }
  }
}

/** 深度可聚焦判定：命中名单且真正可见（getClientRects 非空，挡掉 display:none 的关闭按钮/让位头部） */
function isFocusable(el: Element): el is HTMLElement {
  if (!el.matches(FOCUSABLE)) return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  return el.getClientRects().length > 0;
}

/** 按组合序递归收集 scope 内所有可聚焦元素（Tab 序近似，够循环用） */
function collectFocusable(node: Element, out: HTMLElement[]): void {
  eachComposedChild(node, (child) => {
    if (isFocusable(child)) out.push(child);
    collectFocusable(child, out);
  });
}

/** 从文档活动元素逐层下钻到 shadow 内的真实焦点件（与 collectFocusable 同为「内层件」口径） */
function deepActiveElement(): Element | null {
  let el: Element | null = document.activeElement;
  while (el) {
    const inner = (el as { shadowRoot?: ShadowRoot | null }).shadowRoot?.activeElement;
    if (!inner) break;
    el = inner;
  }
  return el;
}

/**
 * 激活焦点陷阱（浮层打开时调用，幂等）：记录来源焦点 → 自动聚焦面板内首个可聚焦件
 * （无则聚焦 panel 本身）→ 锁 Tab 循环。须传真实存在的面板元素。
 */
export function trapFocus(panel: HTMLElement, scope: HTMLElement): void {
  if (traps.has(scope)) return;

  const onTab = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab' || event.defaultPrevented) return;
    const list: HTMLElement[] = [];
    collectFocusable(scope, list);
    if (!list.length) {
      // 面板内没有任何可聚焦件：不让 Tab 跑出浮层，焦点留在面板本身
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = list[0];
    const last = list[list.length - 1];
    const idx = list.indexOf(deepActiveElement() as HTMLElement);
    if (event.shiftKey) {
      // Shift+Tab 卡首元素（或焦点尚在面板本身，idx<0）→ 绕到尾元素
      if (idx <= 0) {
        event.preventDefault();
        last.focus();
      }
    } else if (idx === list.length - 1 || idx < 0) {
      // Tab 卡尾元素（或焦点尚在面板本身）→ 绕回首元素
      event.preventDefault();
      first.focus();
    }
  };

  traps.set(scope, { prevActive: document.activeElement, scope, panel, onTab });
  // keydown 冒泡且 composed：焦点在浮层内任意处（含 slot 里的 light DOM、内嵌 shadow）都会经过宿主
  scope.addEventListener('keydown', onTab);

  // 进入即聚焦：优先 [autofocus]，否则首个可聚焦件，再否则面板本身。
  // collectFocusable 内的 getClientRects 会强制重排，把 [open] 的 visibility 变化结算到当前帧，
  // 因此能同步聚焦到位（浮层 CSS 需保证打开态的 visibility 即时可见，勿对 visibility 做时长渐变）。
  const list: HTMLElement[] = [];
  collectFocusable(scope, list);
  const target = list.find((el) => el.hasAttribute('autofocus')) ?? list[0] ?? panel;
  target.focus();
}

/** 释放焦点陷阱（浮层关闭或从 DOM 摘除时调用）：解监听 + 把焦点归还来源元素 */
export function releaseFocus(scope: HTMLElement): void {
  const trap = traps.get(scope);
  if (!trap) return;
  traps.delete(scope);
  scope.removeEventListener('keydown', trap.onTab);
  const prev = trap.prevActive as HTMLElement | null;
  // 仅当来源元素还在文档且可聚焦时归还，否则交给浏览器落到 body（来源可能随浮层一起被移除）
  if (prev && prev.isConnected && typeof prev.focus === 'function') prev.focus();
}
