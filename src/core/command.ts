/**
 * 跨层命令协议（库内部，不对外暴露）
 *
 * 解决的问题：高阶组件（浮层、表单）不只是显示，还要接住「消费者塞进来的子控件」发出的意图。
 * 以前这类接线各处硬编码一份：x-button 靠 `type=submit` 手动沿 composedPath 找 form、
 * x-drawer-header 的关闭按钮靠 static hostTag 上溯找浮层再调 hide()——两套同构逻辑、两种写法。
 * 本模块把它收敛成一条通路，组件只要：触发侧发一个命令名，接收侧列一张认领表。
 *
 * 三段分工：
 *  - 触发侧：dispatchCommand(el, name) 把 command 属性变成一次向上传播的意图事件；
 *  - 传播：靠事件本身冒泡（composed 才跨得动 shadow），**就近优先**——第一个认领者 preventDefault
 *    之后，外层组件看到 defaultPrevented 就让路，不需要谁去 stopPropagation；
 *  - 接收侧：组件用 `static commands = { 命令名: 实例方法名 }` 白名单认领（见 XBaseElement）。
 *    绝不做「链上有同名方法就调」的反射：那等于把 remove / replaceChildren / setAttribute
 *    全暴露成可点出来的命令。
 *
 * 语义边界：命令表达「请求做某事」，不是「已经做了某事」，所以认领方有权不接（不声明即不接）、
 * 也有权后处理（如 x-dialog 的 hide() 内部还会派发可取消的 x-close）。消费者想旁听或在外面
 * 拦一道，直接在祖先上 addEventListener('x-command') 即可——协议本身是公开事件、私有语义。
 */

/** 承载命令的自定义事件名 */
export const COMMAND_EVENT = 'x-command';

/** x-command 的载荷：name 命令名，source 发起元素（供认领方区分是谁请求的），arg 可选参数 */
export interface CommandDetail {
  name: string;
  source: Element;
  arg?: unknown;
}

/**
 * 向上递交一条命令。返回是否被认领（true = 有组件接了）。
 *
 * 未被认领时给 submit/reset 留一条兜底：退回最近的**原生 form** 代为 requestSubmit/reset。
 * 这条兜底是为了不能力回退——x-button 换成 command 协议之前，`type=submit` 对页面原生
 * `<form>`（消费者没用它包 x-form 的场合）同样有效；若只认 x-form，那种用法会静默失效。
 */
export function dispatchCommand(source: Element, name: string, arg?: unknown): boolean {
  if (!name) return false;
  const event = new CustomEvent<CommandDetail>(COMMAND_EVENT, {
    bubbles: true,
    composed: true,
    cancelable: true,
    detail: { name, source, arg },
  });
  if (!source.dispatchEvent(event)) return true; // 已被某个祖先认领

  if (name === 'submit' || name === 'reset') {
    const form = nearestForm(source);
    if (form) {
      if (name === 'submit') form.requestSubmit();
      else form.reset();
      return true;
    }
  }
  return false;
}

/**
 * 从元素向上找最近的 form（沿 parentNode、遇 ShadowRoot 改取 .host）。
 * 不能用 event.composedPath()：派发结束后 dispatch 标志已 unset、composedPath() 返回空数组
 *（本轮探针实测试出来的：写成 composedPath 时兜底一次也没命中过）。
 * 也不需覆盖 x-form 内部那个 shadow form：它自己会认领 submit/reset，轮不到这里。
 */
function nearestForm(from: Element): HTMLFormElement | null {
  let node: Node | null = from;
  while (node) {
    if (node instanceof HTMLFormElement) return node;
    node = node.parentNode ?? (node instanceof ShadowRoot ? node.host : null);
  }
  return null;
}
