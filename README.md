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
| Switch | `<x-switch>` | 🚧 开发中（M0，二元开关：`<button role=switch>` 受控切换；FCCE form 关联（`name`/`required`，勾选才计入 FormData）） |
| Slider | `<x-slider>` | 🚧 开发中（M0，离散选项滑块，档位吸附拖动；已用于主题面板圆角/尺寸/阴影；FCCE form 关联（`name`，提交当前档位标签）） |
| Menu | `<x-menu>` / `<x-menu-group>` / `<x-menu-item>` | 🚧 开发中（M0，导航菜单三件套） |
| Drawer | `<x-drawer>` + `<x-drawer-header>` / `<x-drawer-footer>` | 🚧 开发中（M0；快捷用法只给 `title`/`subtitle` 即自动生成带关闭按钮的头部（显式 header 时让位），footer 自动贴底；与内容无分隔线） |
| ThemePanel | `<x-theme-panel>` | 🚧 开发中（M0，基于抽屉的右侧设置面板） |
| Icon | `<x-icon>` | 🚧 开发中（M0，仅收录本库内部组件实际使用的图标，不派生更多） |
| Typography | `<x-text>` | 🚧 开发中（M0，排版原子件：`variant` = title/subtitle/body/caption/muted，内部吃令牌、随主题联动） |
| Avatar | `<x-avatar>` | 🚧 开发中（M0，头像/标识方块：内容优先级 `src` 图片 > `text` 文字 > `name` 第一个字 > 占位图标；`shape`/`size`/`color`，加载失败自动回退，logo 的 mark 即复用本组件） |
| Flex | `<x-flex>` | 🚧 开发中（M0，弹性布局原子：`direction`/`align`/`justify`/`wrap`/`inline`/`gap`（令牌别名） |
| Container | `<x-container>` | 🚧 开发中（M0，应用外壳：header/sidebar/main/footer + 侧栏折叠为窄栏 `rail`，rail 单源下沉给 logo/menu） |
| Logo | `<x-logo>` | 🚧 开发中（M0，品牌标识：mark 复用 x-avatar，`mark`/`src`/`title`/`subtitle`，rail 窄栏只显首字母） |
| Input | `<x-input>` | 🚧 开发中（M0，单行输入：内包原生 input；`variant`(outline/filled/flush) × `color`(6 角色) 双轴 + `size`，`clearable`/`show-password` 显密切换/`show-count`/前后缀插槽；逐字符 `x-input`、提交 `x-change`（可取消回退）；FCCE form 关联（`name`，required/type/maxlength 镜像内层原生 validity）） |
| Textarea | `<x-textarea>` | 🚧 开发中（M0，多行文本域：与 Input 同源事件模型 + `variant`×`color` 双轴，`autosize`/`max-rows` 自适应高度、`resize`、`show-count`；FCCE form 关联） |
| Checkbox | `<x-checkbox>` / `<x-checkbox-item>` / `<x-checkbox-group>` | 🚧 开发中（M0，复选框三件套：原子/带文字项/容器；`shape`×`color` 双轴 + `indeterminate` 三方态；group 条件下沉公共属性、`min`/`max` 数量约束、聚合 `x-change`；本库首个 FCCE form 关联） |
| Radio | `<x-radio>` / `<x-radio-item>` / `<x-radio-group>` | 🚧 开发中（M0，单选框三件套：与 Checkbox 同源，互斥由 group 维护（跨 shadow 无法靠原生同名），`value` 以字符串聚合；FCCE form 关联） |
| Select | `<x-select>` | 🚧 开发中（M0，下拉选择：自绘弹层 listbox（吃全局令牌、选中打勾、不足向上翻转）+ 键盘导航（↑↓/Home/End/Enter/Esc）；`multiple` 多选（选中不关弹层、`values` 数组、同名多项进 FormData）；选项来自 light DOM `<option>` 或 `options` 数组；`placeholder`/`variant`×`color`；FCCE form 关联） |
| FileUpload | `<x-file-input>` | 🚧 开发中（M0，文件选择：隐藏原生 file + 自绘按钮；`accept`/`multiple`、`files` 只读、`reset()`；选中文件以 `name` 计入 FormData） |
| Filter | `<x-filter>` / `<x-filter-item>` | 🚧 开发中（M0，筛选器：单选 chip 行，观感复用 x-button（未选 soft、选中 solid、重置钮 solid）；选中项保留、其余横向折叠退场（grid 0fr→1fr 动画 + inert）；行尾 × 重置钮展开；`value` 聚合、可取消 `x-change`；`color`/`size`/`disabled` 下沉；刻意不做 form 关联（视图过滤用） |
| Form | `<x-form>` / `<x-form-item>` / `<x-form-footer>` | 🚧 开发中（M0，表单三件套：正交布局（`layout` 管输入项纵排（默认）/横排换行；`label-position` 管 label 在上/在左，默认 left，与 layout 无关；`label-width` 不写时自动测量最宽 label 回填对齐，`label-align` 管文本对齐；`gap` 间距默认 20px；`columns`=N 等宽 grid 列根治长短不齐（文本类控件拉满格宽，纵向可用双列表单）；footer `align` + `label-offset`，且无条件通栏沉底不参与流向）；字段统一在 x-form-item 声明（label/name/required/help，`name` 为权威绑定键强制下沉给控件）；x-form 统一遍历「最外层」控件、按公开值面聚合 `values`/`formData`（表单归属不跨 shadow，slot 进来的控件 `new FormData()` 收不到，故手动收集；控件自带 FCCE 仍在，直接放页面原生 form 可自动计入），`validate`/`submit`/`reset`/`setValues`，可取消 `x-submit`；`disabled` 显式下发各控件） |
| Dialog | `<x-dialog>` | 📋 规划中（M3） |
| Toast | `<x-toast>` | 📋 规划中（M3） |
| Table | `<x-table>` | 📋 规划中（M4） |

> 完整路线图见 [design.md](./design.md#7-组件路线图分期)。

## License

MIT
