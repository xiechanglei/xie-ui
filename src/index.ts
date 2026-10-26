/**
 * xie-ui 全量入口。
 *
 * 运行时：只做「注入令牌 + 注册所有分类组件」，不导出任何运行时 API。
 * 消费者 `import '@xie-work/xie-ui'` 后即可直接使用 `<x-button>` 等标签。
 *
 * 类型：`export type *` 聚合各分类的组件类型（编译期擦除，不产生运行时导出），
 *       并借此让各组件的全局标签增强（HTMLElementTagNameMap）随入口生效。
 *
 * 本库定位为即插即用的 UI 组件，不对外暴露内部基类/工具。
 */
import './tokens/index.js';
import './categories/basic/index.js';
import './categories/form/index.js';
import './categories/nav/index.js';
import './categories/feedback/index.js';

export type * from './categories/basic/index.js';
export type * from './categories/form/index.js';
export type * from './categories/nav/index.js';
export type * from './categories/feedback/index.js';
