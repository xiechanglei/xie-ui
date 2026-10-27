/**
 * form 组件注册入口（副作用）：import 本模块即定义 x-form / x-form-item / x-form-footer。
 * 顺序：先子件（item / footer）再容器（form），与依赖方向一致。
 */
import './x-form-item.js';
import './x-form-footer.js';
import './x-form.js';

export * from './x-form-item.js';
export * from './x-form-footer.js';
export * from './x-form.js';
