/**
 * 浮层公共工具（库内部，不对外暴露）——遮罩类浮层（x-drawer / x-dialog）共享的两件事：
 *
 * 1. 页面滚动锁：**跨实例计数**。各浮层自己维护计数器的话，嵌套场景（抽屉里再开对话框）
 *    关内层就会把外层的锁也解掉；只有一个计数器才正确。
 * 2. Esc 关闭栈：全局**只挂一个** keydown 监听，按 Esc 关「最上面那层」。
 *    各浮层各自监听会导致一次 Esc 把所有开着的浮层一起关掉。
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
