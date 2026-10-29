/**
 * x-dropdown —— 下拉菜单（反馈分类）。
 *
 * x-popover 的菜单化子集：面板贴触发件底沿、交叉轴起边对齐、宽度至少跟触发件一致，
 * 点中面板内容即视为「选完一行」自动收起（closeOnChoose），aria-haspopup=menu。
 * 菜单行主范式用配套部件 <x-dropdown-content> 归组（它自动挂进面板、内部默认纵排铺满），
 * 轻量场景也可直接把多个元素挂 slot="content"（平铺写法同样默认纵排）；
 * 行内部对齐/图标由行元素自己决定，点行派发 `x-select` 事件；需要完整键盘漫游的侧栏菜单请用 x-menu。
 *
 * 开合/Esc 栈/外部点关/焦点归还全部继承自 x-popover，此处零重复实现
 *（同 x-dialog-header 继承 x-drawer-header 的复用套路）。
 *
 * 属性：open / placement / trigger 同 x-popover（placement 缺省 bottom，常见用 bottom-start 语义的对齐已内置）。
 * 事件：x-select —— 点中面板内容时派发（bubbles/composed，收起面板前），detail:{ item }，
 * item = 被点的「行」元素（x-dropdown-content 的直接子级；平铺写法则是宿主的直接子级）；
 * 监听它即可，无需再委派 click + closest。
 * 定制：暴露 part="anchor" / part="panel"。
 */

import { define } from '../../core/element.js';
import type { AnchorAlign } from '../../core/anchor.js';
// 与 x-popover.ts 引同一份 CSS 文本：共享样式表按文本缓存去重，不会重复打包
import popoverStyles from '../popover/x-popover.css?inline';
import dropdownStyles from './x-dropdown.css?inline';
import { XPopover } from '../popover/x-popover.js';

class XDropdown extends XPopover {
  static override tag = 'x-dropdown';
  /** properties 沿原型链继承 popover 的声明（open/placement/trigger），无需重写 */
  static override styles = [popoverStyles, dropdownStyles];

  protected override panelAlign: AnchorAlign = 'start';
  protected override fitTriggerWidth = true;
  protected override closeOnChoose = true;
  protected override popupKind = 'menu';
}

declare global {
  interface HTMLElementTagNameMap {
    'x-dropdown': XDropdown;
  }
}

export { XDropdown };
export default define(XDropdown);
