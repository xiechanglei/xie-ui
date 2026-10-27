/**
 * 框架内置图标注册表（内部实现，不作为运行时 API 对外导出）。
 *
 * 只收录本 UI 库其它组件实际需要用到的 SVG 图标，不派生更多图标以保持库体积精简。
 * 每项为 `viewBox="0 0 24 24"` 描边图标的内部标记；
 * `fill="none" / stroke="currentColor" / stroke-width / linecap / linejoin` 由 x-icon 统一提供。
 *
 * 新增内部图标时：在此加一条 name → 内部 SVG 内容，并在需要它的组件里用 <x-icon name="...">。
 */
export const ICONS: Record<string, string> = {
  // 右向尖角（菜单分组折叠指示器等）
  'chevron-right': '<path d="M9 6l6 6-6 6" />',
  // 双右向尖角（» 侧栏折叠按钮等）
  'chevrons-right': '<path d="m13 17 5-5-5-5" /><path d="m6 17 5-5-5-5" />',
  // 用户（头像无图/无文字时的占位）
  'user': '<circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" />',
  // 关闭（×）
  'close': '<path d="M6 6l12 12M18 6L6 18" />',
  // 下尖角（下拉选择器展开指示器等）
  'chevron-down': '<path d="M6 9l6 6 6-6" />',
  // 上传（文件选择按钮）
  'upload': '<path d="M12 15V4M8 8l4-4 4 4" /><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />',
  // 太阳（浅色）
  'sun': '<circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />',
  // 月亮（深色）
  'moon': '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />',
};

/** 已注册的图标名联合类型（随注册表推导，自动补全/校验） */
export type IconName = keyof typeof ICONS;

/** 取图标内部 SVG 标记；未登记返回空串 */
export function getIcon(name: string): string {
  return ICONS[name] || '';
}
