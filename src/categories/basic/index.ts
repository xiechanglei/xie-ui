/**
 * 分类入口 · 基础组件（basic）
 *
 * 运行时：只做「注册」——import 本模块即注入令牌并注册该分类所有组件，无运行时导出。
 * 类型层：通过 `export type` 把组件声明纳入类型图（编译期擦除，不产生运行时导出），
 *         使组件模块里的 `declare global`（HTMLElementTagNameMap 增强）随入口生效，
 *         从而 `document.querySelector('x-button')` 等自动有类型。
 *
 * 新增基础类组件时：在此 import 其注册模块，并 `export type` 其公开类型。
 */
import '../../tokens/index.js';
import '../../components/button/index.js';
import '../../components/icon/index.js';
import '../../components/text/index.js';
import '../../components/avatar/index.js';
import '../../components/logo/index.js';
import '../../components/theme/index.js';

export type {
  XButton,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
} from '../../components/button/x-button.js';
export type { XIcon } from '../../components/icon/x-icon.js';
export type { IconName } from '../../components/icon/icons.js';
export type { XText, TextVariant } from '../../components/text/x-text.js';
export type { XAvatar, AvatarShape, AvatarColor } from '../../components/avatar/x-avatar.js';
export type { XLogo } from '../../components/logo/x-logo.js';
export type {
  XThemePanel,
  ThemeMode,
  RadiusPreset,
  SizePreset,
  ShadowPreset,
} from '../../components/theme/x-theme-panel.js';
