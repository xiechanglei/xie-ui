/**
 * 两级菜单数据。
 * 一级：分类（category）；二级：组件（item）。
 * item.id 用于 hash 路由并映射到 pages/<id>.js 文档模块。
 * status: 'done' 可点击进入；'planned' 规划中（禁用）。
 */
export const MENU = [
  {
    id: 'guide',
    label: '指南',
    items: [
      { id: 'start', label: '介绍', status: 'done' },
      { id: 'theme', label: '主题定制', tag: 'x-theme-panel', status: 'done' },
    ],
  },
  {
    id: 'basic',
    label: '基础组件',
    items: [
      { id: 'button', label: 'Button 按钮', tag: 'x-button', status: 'done' },
      { id: 'icon', label: 'Icon 图标', tag: 'x-icon', status: 'done' },
      { id: 'text', label: 'Typography 排版', tag: 'x-text', status: 'done' },
      { id: 'logo', label: 'Logo 品牌标识', tag: 'x-logo', status: 'done' },
      { id: 'avatar', label: 'Avatar 头像', tag: 'x-avatar', status: 'done' },
      { id: 'badge', label: 'Badge 徽标', tag: 'x-badge', status: 'planned' },
    ],
  },
  {
    id: 'layout',
    label: '布局组件',
    items: [
      { id: 'flex', label: 'Flex 弹性布局', tag: 'x-flex', status: 'done' },
      { id: 'container', label: 'Container 布局容器', tag: 'x-container', status: 'done' },
    ],
  },
  {
    id: 'form',
    label: '表单组件',
    items: [
      { id: 'switch', label: 'Switch 开关', tag: 'x-switch', status: 'done' },
      { id: 'slider', label: 'Slider 滑块', tag: 'x-slider', status: 'done' },
      { id: 'input', label: 'Input 输入框', tag: 'x-input', status: 'planned' },
      { id: 'checkbox', label: 'Checkbox 复选', tag: 'x-checkbox', status: 'planned' },
      { id: 'select', label: 'Select 选择器', tag: 'x-select', status: 'planned' },
    ],
  },
  {
    id: 'nav',
    label: '导航组件',
    items: [
      { id: 'menu', label: 'Menu 菜单', tag: 'x-menu', status: 'done' },
    ],
  },
  {
    id: 'feedback',
    label: '反馈与浮层',
    items: [
      { id: 'drawer', label: 'Drawer 抽屉', tag: 'x-drawer', status: 'done' },
      { id: 'dialog', label: 'Dialog 对话框', tag: 'x-dialog', status: 'planned' },
      { id: 'toast', label: 'Toast 轻提示', tag: 'x-toast', status: 'planned' },
      { id: 'tooltip', label: 'Tooltip 文字提示', tag: 'x-tooltip', status: 'planned' },
    ],
  },
];

export const DEFAULT_ROUTE = 'start';

/** 按 id 查找二级项 */
export function findItem(id) {
  for (const group of MENU) {
    for (const item of group.items) {
      if (item.id === id) return { group, item };
    }
  }
  return null;
}
