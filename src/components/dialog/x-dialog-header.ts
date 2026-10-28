/**
 * x-dialog-header —— 对话框头部（配合 x-dialog 使用）。
 *
 * 与 x-drawer-header 完全同构（标题走默认插槽 + `subtitle` 次要说明 + `show-close` 关闭按钮），
 * 故直接继承其实现，只覆盖两件事：标签名、以及关闭按钮上溯要找的宿主（hostTag=x-dialog）。
 * 好处是头部 DOM/CSS 只有一份，不重复实现（体积与维护双省）。
 *
 * 注意：`show-close` 缺省 false（与抽屉头部一致），快捷用法下由 x-dialog 自动生成的头部代为打开；
 * 宿主置 `closable=false` 时，无论 show-close 写什么，关闭按钮都被宿主下发的变量隐藏。
 */

import { define } from '../../core/element.js';
import { XDrawerHeader } from '../drawer/x-drawer-header.js';

class XDialogHeader extends XDrawerHeader {
  static tag = 'x-dialog-header';

  /** 关闭按钮回关的是对话框，不是抽屉 */
  static hostTag = 'x-dialog';
}

declare global {
  interface HTMLElementTagNameMap {
    'x-dialog-header': XDialogHeader;
  }
}

export { XDialogHeader };
export default define(XDialogHeader);
