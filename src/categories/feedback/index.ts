/**
 * 分类入口 · 反馈与浮层（feedback）
 *
 * 运行时：只做「注册」——import 本模块即注入令牌并注册该分类所有组件，无运行时导出。
 * 类型层：`export type` 把组件声明纳入类型图，使组件模块里的 `declare global`（标签增强）随入口生效。
 *
 * 新增反馈/浮层组件时：在此 import 其注册模块，并 `export type` 其公开类型。
 */
import '../../tokens/index.js';
import '../../components/drawer/index.js';

export type { XDrawer, DrawerPlacement } from '../../components/drawer/x-drawer.js';
