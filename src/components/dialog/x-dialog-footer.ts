/**
 * x-dialog-footer —— 对话框底部操作区（配合 x-dialog 使用）。
 *
 * 与 x-drawer-footer 同构（内容走默认插槽、右对齐贴底、与内容无分隔线），故直接继承其实现只换标签名。
 * 作为 x-dialog 的直接子元素固定底部，不参与中部内容滚动。
 */

import { define } from '../../core/element.js';
import { XDrawerFooter } from '../drawer/x-drawer-footer.js';

class XDialogFooter extends XDrawerFooter {
  static tag = 'x-dialog-footer';
}

declare global {
  interface HTMLElementTagNameMap {
    'x-dialog-footer': XDialogFooter;
  }
}

export { XDialogFooter };
export default define(XDialogFooter);
