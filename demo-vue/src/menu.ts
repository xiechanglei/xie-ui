/**
 * 两级菜单数据（本 Vue 文档站的唯一菜单来源）。
 * 一级：分类（category）；二级：组件（item）。
 * item.id 用于 hash 路由并映射到 pages/<PascalCase>.vue（归一化匹配，见 router/index.ts）。
 * 历史注：原与旧 vanilla 文档站共用仓库 demo/menu.js，旧站已移除（2026-11-04），数据收编于此并补 TS 类型供 SFC 强类型消费。
 */
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

export const MENU: MenuGroup[] = [
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
      { id: 'badge', label: 'Badge 徽标', tag: 'x-badge', status: 'done' },
      { id: 'status', label: 'Status 状态灯', tag: 'x-status', status: 'done' },
      { id: 'spinner', label: 'Spinner 加载中', tag: 'x-spinner', status: 'done' },
      { id: 'progress', label: 'Progress 进度条', tag: 'x-progress', status: 'done' },
      { id: 'radial-progress', label: 'Radial Progress 圆环进度', tag: 'x-radial-progress', status: 'done' },
      { id: 'countup', label: 'CountUp 数字渐变', tag: 'x-count-up', status: 'done' },
      { id: 'tag', label: 'Tag 标签', tag: 'x-tag', status: 'done' },
      { id: 'timeline', label: 'Timeline 时间线', tag: 'x-timeline', status: 'done' },
      { id: 'chat-bubble', label: 'Chat Bubble 聊天气泡', tag: 'x-chat-bubble', status: 'done' },
    ],
  },
  {
    id: 'layout',
    label: '布局组件',
    items: [
      { id: 'flex', label: 'Flex 弹性布局', tag: 'x-flex', status: 'done' },
      { id: 'box', label: 'Box 通用容器', tag: 'x-box', status: 'done' },
      { id: 'container', label: 'Container 布局容器', tag: 'x-container', status: 'done' },
      { id: 'divider', label: 'Divider 分割线', tag: 'x-divider', status: 'done' },
    ],
  },
  {
    id: 'form',
    label: '表单组件',
    items: [
      { id: 'switch', label: 'Switch 开关', tag: 'x-switch', status: 'done' },
      { id: 'slider', label: 'Slider 滑块', tag: 'x-slider', status: 'done' },
      { id: 'input', label: 'Input 输入框', tag: 'x-input', status: 'done' },
      { id: 'textarea', label: 'Textarea 文本域', tag: 'x-textarea', status: 'done' },
      { id: 'checkbox', label: 'Checkbox 复选', tag: 'x-checkbox', status: 'done' },
      { id: 'radio', label: 'Radio 单选', tag: 'x-radio', status: 'done' },
      { id: 'select', label: 'Select 选择器', tag: 'x-select', status: 'done' },
      { id: 'file', label: 'FileUpload 上传', tag: 'x-file-input', status: 'done' },
      { id: 'filter', label: 'Filter 筛选器', tag: 'x-filter', status: 'done' },
      { id: 'form', label: 'Form 表单', tag: 'x-form', status: 'done' },
    ],
  },
  {
    id: 'nav',
    label: '导航组件',
    items: [
      { id: 'menu', label: 'Menu 菜单', tag: 'x-menu', status: 'done' },
      { id: 'tabs', label: 'Tabs 标签页', tag: 'x-tabs', status: 'done' },
      { id: 'accordion', label: 'Accordion 折叠面板', tag: 'x-accordion', status: 'done' },
      { id: 'collapse', label: 'Collapse 折叠区域', tag: 'x-collapse', status: 'done' },
      { id: 'breadcrumb', label: 'Breadcrumb 面包屑', tag: 'x-breadcrumb', status: 'done' },
      { id: 'carousel', label: 'Carousel 轮播图', tag: 'x-carousel', status: 'done' },
    ],
  },
  {
    id: 'feedback',
    label: '反馈与浮层',
    items: [
      { id: 'drawer', label: 'Drawer 抽屉', tag: 'x-drawer', status: 'done' },
      { id: 'dialog', label: 'Dialog 对话框', tag: 'x-dialog', status: 'done' },
      { id: 'toast', label: 'Toast 轻提示', tag: 'x-toast', status: 'done' },
      { id: 'alert', label: 'Alert 警告提示', tag: 'x-alert', status: 'done' },
      { id: 'tooltip', label: 'Tooltip 文字提示', tag: 'x-tooltip', status: 'done' },
      { id: 'popover', label: 'Popover 气泡卡片', tag: 'x-popover', status: 'done' },
      { id: 'dropdown', label: 'Dropdown 下拉菜单', tag: 'x-dropdown', status: 'done' },
    ],
  },
];

export const DEFAULT_ROUTE = 'start';
