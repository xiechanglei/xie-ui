/**
 * 分类入口 · 导航菜单（nav）
 *
 * 运行时：只做「注册」——import 本模块即注入令牌并注册该分类所有组件，无运行时导出。
 * 类型层：`export type` 把组件声明纳入类型图，使组件模块里的 `declare global`（标签增强）随入口生效。
 *
 * 新增导航组件时：在此 import 其注册模块，并 `export type` 其公开类型。
 */
import '../../tokens/index.js';
import '../../components/menu/index.js';
import '../../components/tabs/index.js';
import '../../components/accordion/index.js';

export type { XMenu } from '../../components/menu/x-menu.js';
export type { XMenuGroup } from '../../components/menu/x-menu-group.js';
export type { XMenuItem } from '../../components/menu/x-menu-item.js';
export type { XTabs } from '../../components/tabs/x-tabs.js';
export type { XTab } from '../../components/tabs/x-tab.js';
export type { XTabPanel } from '../../components/tabs/x-tab-panel.js';
export type { XAccordion } from '../../components/accordion/x-accordion.js';
export type { XAccordionItem } from '../../components/accordion/x-accordion-item.js';
