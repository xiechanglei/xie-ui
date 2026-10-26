/** x-icon 按需入口：引入即注册组件并注入令牌（副作用来自 x-icon.js 内部） */
import './x-icon.js';

export * from './x-icon.js';
export { ICONS, getIcon } from './icons.js';
export type { IconName } from './icons.js';
