/**
 * 菜单数据类型化适配层。
 * 数据单一来源仍是仓库 demo/menu.js（旧文档站与本 Vue 站共用一份注册表），
 * 这里补一层明确 TS 视图供 SFC 强类型消费（.js 无声明，直接 import 会 TS7016/联合类型报错）。
 */
import * as rawMenu from '../../demo/menu.js';

export interface MenuEntry {
  id: string;
  label: string;
  tag?: string;
  status?: string;
}
export interface MenuGroup {
  id: string;
  label: string;
  items: MenuEntry[];
}

export const MENU = (rawMenu as unknown as { MENU: MenuGroup[] }).MENU;
export const DEFAULT_ROUTE = (rawMenu as unknown as { DEFAULT_ROUTE: string }).DEFAULT_ROUTE;
