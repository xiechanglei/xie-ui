/**
 * 分类入口 · 布局组件（layout）
 *
 * 运行时：只做「注册」——import 本模块即注入令牌并注册该分类所有组件，无运行时导出。
 * 类型层：通过 `export type` 把组件声明纳入类型图（编译期擦除，不产生运行时导出），
 *         使组件模块里的 `declare global`（HTMLElementTagNameMap 增强）随入口生效。
 *
 * 新增布局类组件时：在此 import 其注册模块，并 `export type` 其公开类型。
 */
import '../../tokens/index.js';
import '../../components/flex/index.js';
import '../../components/box/index.js';
import '../../components/container/index.js';
import '../../components/divider/index.js';

export type { XFlex, FlexDirection } from '../../components/flex/x-flex.js';
export type { XBox, BoxVariant, BoxColor, BoxWidth, BoxShadow } from '../../components/box/x-box.js';
export type { XContainer, ContainerSide } from '../../components/container/x-container.js';
export type { XDivider, DividerDirection, LabelPlacement } from '../../components/divider/x-divider.js';
