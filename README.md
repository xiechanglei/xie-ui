# xie-ui

基于原生 Web Components 实现的 UI 组件库，零框架依赖，可在任意框架或裸 HTML 中使用。

> ⚠️ 项目处于 **M0 地基阶段**，组件 API 已按规划约定，实际可用性以各组件文档为准。
> 全局架构与规划设计见 [design.md](./design.md)。

## 特性

- 原生 Custom Elements + Shadow DOM 封装，外部通过 `::part` 与 CSS 令牌定制
- 单一全量产物（已压缩），`import` 一次即用，零额外网络请求
- 统一的设计令牌（CSS Custom Properties），内置 light / dark 主题
- 统一的属性、事件、插槽、a11y 规范
- **入口只做注册**：`import` 一次即可直接用标签，无需具名导入任何组件

## 安装

```bash
yarn add @xie-work/xie-ui
```

## 引入方式

> 入口**不导出任何运行时 API**：`import` 即＝注入设计令牌 + 注册所有组件，之后直接写 `<x-button>` 等标签即可。组件的 TS 类型通过全局 `HTMLElementTagNameMap` 增强自动生效（`document.querySelector('x-button')` 直接有类型）。

### 1. 全量引入（推荐）

```ts
import '@xie-work/xie-ui';
```

### 2. 浏览器直接通过 `<script type="module">` 引入

```html
<script type="module" src="https://unpkg.com/@xie-work/xie-ui/dist/index.js"></script>
<x-button variant="solid">确定</x-button>
```

## 使用示例

组件统一使用 `x-` 前缀，直接在 HTML 中书写标签即可，无需任何注册配置。

### Button

```html
<x-button variant="solid" color="primary" size="md">主要按钮</x-button>
<x-button variant="outline" color="danger" size="sm">描边危险按钮</x-button>
<x-button variant="soft" color="success">柔和成功按钮</x-button>
<x-button variant="ghost">幽灵按钮</x-button>
<x-button disabled loading>加载中</x-button>
```

> `variant`（形态：solid/outline/ghost/soft）与 `color`（语义色：primary/secondary/success/warning/danger/info）两轴正交，可任意组合。

```ts
const btn = document.querySelector('x-button')!;
btn.addEventListener('x-click', (e) => console.log(e.detail));
```

### Input（规划中）

```html
<x-input name="username" placeholder="请输入用户名" required></x-input>
```

```ts
const input = document.querySelector('x-input')!;
input.addEventListener('x-change', (e) => console.log(e.detail.value));
```

## 通用 API 约定

所有组件遵循统一规范：

| 类别 | 约定 |
|---|---|
| 属性命名 | kebab-case；布尔属性存在即真（如 `disabled`） |
| 尺寸 | `size: 'sm' \| 'md' \| 'lg'` |
| 状态 | `disabled`、`loading`、`readonly`、`required` 跨组件同名同义 |
| 事件 | `{component}-{action}`，如 `x-change`、`x-input`、`x-close`；载荷在 `event.detail` |
| 插槽 | 默认插槽放主内容；图标场景提供 `icon-start` / `icon-end` |
| 样式定制 | 每个组件暴露 `::part(base/...)`，见各组件文档 |

## 主题定制

字体、尺寸、圆角、颜色、阴影等可全局定义与切换的风格维度，都由**设计令牌（CSS 自定义属性）**驱动。组件通过 `var(--xie-*)` 读取，自定义属性可穿透 Shadow DOM 继承，因此改写 `:root` 上的令牌即**全站实时联动**，无需任何 JS 逐个更新。

令牌分三层：`primitive`（原始调色板）→ `knob` 旋钮（6 个强调色 primary/secondary/success/warning/danger/info + 圆角/尺寸/字号/阴影强度）→ `derived` 派生（经 `calc`/`color-mix` 自动算出，组件消费此层）。

### 1. 预设档位（纯 CSS，零 JS）

在 `<html>` 上设 data 属性，各维度正交、互不干扰：

```html
<html data-xie-theme="dark" data-xie-radius="none" data-xie-size="compact" data-xie-shadow="strong"></html>
```

- `data-xie-theme`：`light` | `dark`
- `data-xie-radius`：`none` | `sm` | `md` | `lg` | `full`
- `data-xie-size`：`compact` | `default` | `comfortable`
- `data-xie-shadow`：`none` | `soft` | `strong`

### 2. 任意值（覆盖旋钮）

取色器、自定义 px 等，直接改旋钮令牌，派生层自动重算。每个强调色都会自动派生 `hover`/`active`/`soft`，并根据背景亮度**自动选取黑/白前景**保证可读：

```css
:root {
  --xie-primary: #6f42c1;   /* 主色，hover/active/soft 自动派生 */
  --xie-success: #0a7d43;   /* 成功色 */
  --xie-danger:  #c02626;   /* 危险色 */
  --xie-radius: 10px;       /* 圆角基准，0 = 直角 */
}
```

### 3. 可视化配置抽屉

内置 `<x-theme-panel>`（基于通用 `<x-drawer>` 的右侧滑入面板），调用 `show()` 唤出，选择即写入 `:root` 令牌，变化时派发 `x-theme-change`。面板支持为每个强调色选预设色卡或用取色器任意调，且配置**自动持久化到 localStorage**（刷新保持，“恢复默认”会清除）：

```html
<x-button onclick="panel.show()">打开主题设置</x-button>
<x-theme-panel id="panel"></x-theme-panel>
```

## 在框架中使用

### Vue

Vue 3 原生支持自定义元素，需在编译/运行时配置中识别 `x-` 前缀：

```ts
// vite 插件配置
template: {
  compilerOptions: {
    isCustomElement: (tag) => tag.startsWith('x-'),
  },
}
```

### React

自定义元素的 property 与事件无法直接通过 JSX 传递，推荐两种方式：

1. 通过 `ref` 设置属性、`useEffect` 绑定事件
2. 使用官方提供的 React 包装组件（M5 阶段提供，计划中）

## 组件列表

| 组件 | 标签 | 状态 |
|---|---|---|
| Button | `<x-button>` | 🚧 开发中（M0） |
| Switch | `<x-switch>` | 🚧 开发中（M0） |
| Slider | `<x-slider>` | 🚧 开发中（M0，离散选项滑块，档位吸附拖动；已用于主题面板圆角/尺寸/阴影） |
| Menu | `<x-menu>` / `<x-menu-group>` / `<x-menu-item>` | 🚧 开发中（M0，导航菜单三件套） |
| Drawer | `<x-drawer>` | 🚧 开发中（M0） |
| ThemePanel | `<x-theme-panel>` | 🚧 开发中（M0，基于抽屉的右侧设置面板） |
| Icon | `<x-icon>` | 🚧 开发中（M0，仅收录本库内部组件实际使用的图标，不派生更多） |
| Input | `<x-input>` | 📋 规划中（M1） |
| Checkbox | `<x-checkbox>` | 📋 规划中（M1） |
| Radio | `<x-radio>` | 📋 规划中（M1） |
| Select | `<x-select>` | 📋 规划中（M2） |
| Dialog | `<x-dialog>` | 📋 规划中（M3） |
| Toast | `<x-toast>` | 📋 规划中（M3） |
| Table | `<x-table>` | 📋 规划中（M4） |

> 完整路线图见 [design.md](./design.md#7-组件路线图分期)。

## License

MIT
