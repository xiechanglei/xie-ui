# xie-ui

基于原生 Web Components 实现的 UI 组件库，零框架依赖，可在任意框架或裸 HTML 中使用。

> 当前进度：**M0–M3 已基本落地**（42 个组件，覆盖基础/布局/表单/导航/反馈五分类，P1 已交 spinner/tag、popover/dropdown、progress/divider/alert、tabs/accordion、breadcrumb 五批），M4 进行中（已交付 menu 三件套 + tabs/accordion/breadcrumb），M5 工程化仅文档站。
> 全局架构与规划设计见 [design.md](./design.md)，下一阶段优先序与决策倾向见 [plan.md](./plan.md)。

## 特性

- 原生 Custom Elements + Shadow DOM 封装，外部通过 `::part` 与 CSS 令牌定制
- 单一全量产物（已压缩），`import` 一次即用，零额外网络请求
- 统一的设计令牌（CSS Custom Properties），内置 light / dark 主题
- 统一的属性、事件、插槽、a11y 规范
- **入口只做注册**：`import` 一次即可直接用标签，无需具名导入任何组件

## 安装

> 📦 **尚未发布到 npm**（规划 P3：P0 技术债清理 + 部分 P1 完成后发第一个 beta）。当前接入方式：本地构建后通过 npm `file:` 协议或 `npm link` 引用。

```bash
# 仓库内构建产物
yarn build

# 消费项目本地引用（二选一）
yarn add file:/path/to/xie-ui
npm link ./path/to/xie-ui   # 开发调试期
```

发布后可直接：

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
>
> `command="submit" | "reset" | "close" | …` 把点击意图向上递交，由链上最近的认领者处理（`x-form` 认领 submit/reset，`x-dialog`/`x-drawer` 认领 close），无需监听 `x-click` 再手写 `form.submit()` / `dialog.hide()`。

```ts
const btn = document.querySelector('x-button')!;
btn.addEventListener('x-click', (e) => console.log(e.detail));
```

### Form + Input

```html
<x-form layout="vertical">
  <x-form-item label="用户名" name="username" required help="1-20 个字符">
    <x-input name="username" placeholder="请输入用户名" required maxlength="20"></x-input>
  </x-form-item>
  <x-form-footer>
    <x-button command="submit" variant="solid" color="primary">提交</x-button>
    <x-button command="reset" variant="ghost">重置</x-button>
  </x-form-footer>
</x-form>
```

```ts
const form = document.querySelector('x-form')!;
form.addEventListener('x-submit', (e) => {
  e.preventDefault(); // 校验已通过，e.detail.values 是聚合值
  console.log(e.detail.values);
});
```

## 通用 API 约定

所有组件遵循统一规范：

| 类别 | 约定 |
|---|---|
| 属性命名 | kebab-case；布尔属性存在即真（`disabled` 与 `disabled=""` 等价），**额外承认字面量假值** `disabled="false"`（大小写不敏感）——基座会把它当假处理并顺手摘掉该 attribute，使全库 `:host([attr])` 存在性选择器与属性值一致。此举是为了让**默认值为真的开关**（`x-container.collapsible`、`x-alert.icon`）在 HTML 里能写出 false，不致只能靠 JS 设 property |
| 尺寸 | `size: 'sm' \| 'md' \| 'lg'` |
| 状态 | `disabled`、`loading`、`readonly`、`required` 跨组件同名同义 |
| 事件 | `{component}-{action}`，如 `x-change`、`x-input`、`x-close`；载荷在 `event.detail` |
| 跨层命令 | 触发件（如 `x-button`）写 `command="名字"`，意图包成 `x-command` 向上冒泡，由**第一个认领它的祖先组件**接走（就近优先，内层认领后外层自动让路）：`x-form` 认领 `submit`/`reset`，`x-dialog`/`x-drawer` 认领 `close`；链上无人认领则退回页面原生 `<form>`，再没有就什么都不做。**命令只沿祖先链上传**，故触发件必须是目标组件的后代（把 footer 与 form 写成兄弟节点时 `submit` 就够不着 form）。发起方/接收方清单与扩展方式详见 [command.md](./command.md) |
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
2. 使用官方提供的 React 包装组件（规划 P3，`createElement`/`defineComponent` 一行封装，beta 前后提供）

## 组件列表

| 组件 | 标签 | 状态 |
|---|---|---|
| Button | `<x-button>` | ✅ 已交付（M0，`command=submit\|reset\|close` 向上递交意图、由祖先组件认领，无需手写派发） |
| Switch | `<x-switch>` | ✅ 已交付（M0，二元开关：`<button role=switch>` 受控切换；FCCE form 关联（`name`/`required`，勾选才计入 FormData）） |
| Slider | `<x-slider>` | ✅ 已交付（M0，离散选项滑块，档位吸附拖动；已用于主题面板圆角/尺寸/阴影；FCCE form 关联（`name`，提交当前档位标签）） |
| Menu | `<x-menu>` / `<x-menu-group>` / `<x-menu-item>` | ✅ 已交付（M0，导航菜单三件套） |
| Tabs | `<x-tabs>` / `<x-tab>` / `<x-tab-panel>` | ✅ 已交付（P1，标签页三件套：`x-tabs` 按 `value` 一对一协调单选、`x-tab` 连接时自动挂 `slot=tab` 进卡条（同 x-dropdown-content 套路）、`x-tab-panel` 显隐由根挂/摘 `hidden`（内容惰性保留状态不丢）；`value` 程序化设置只同步不高亮不派发避回环，用户切换派发 `x-select`（detail:{value}）；`fill` 等分铺满、`tab disabled` 跳过；ARIA tablist/tab/tabpanel 齐备 + roving tabindex + ←→/↑↓/Home/End 键盘漫游即时激活；激活下划线 `::after scaleX` 动画不量几何） |
| Accordion | `<x-accordion>` + `<x-accordion-item>` | ✅ 已交付（P1，折叠面板：`x-accordion-item` 是「标题栏 + 可折叠内容」，`expanded`（反射）驱动 grid `0fr↔1fr` 高度自适应动画（复用 x-menu-group 经验，常驻内边距落在裁切区更内一层——放轨道项上会抬高 0fr 下限致收起回不了零、随状态跳变则动画起收帧突变）、标题区两段式（`label` 快捷单行省略 / `slot=header` 任意复杂呈现样式自控、图标也在其中自摆，不设专用 icon 插槽）、`disabled`；`x-accordion` 协调单开互斥（`multiple` 关闭互斥可同时展开），用户切换后派发 `x-change`（detail:{value,expanded,values}）、`getValues()`；程序化改 `expanded` 不触发互斥与事件；item 可脱离根单独使用） |
| Collapse | `<x-collapse>` | ✅ 已交付（P1，折叠区域：「触发钮 + 可折叠内容」的独立自由片段，与 accordion-item 分工——item 是自带分隔线、可被根收编单开互斥的「面板行」，本件容器不表态（无框无底零留白，外观交消费方/x-box 自理）不与任何根协调；折叠动画同走 grid `0fr↔1fr` 高度自适应（三层结构沿用 accordion 防坑结论）；`open`（反射）写它即开合，`label` 快捷 / `slot=trigger` 自定义两段式；`placement` top/bottom——bottom 把钮缀到内容尾部即「展开全文/Read more」形态（column-reverse 只翻视觉序，DOM/朗读序不变）；用户点钮派发 `x-change`（detail:{open}，程序化写不派发）、`toggle(force?)`；钮默认轻呈现（链接感文本+尖角，展开旋转 180°）；aria-expanded/controls + role=region，reduced-motion 瞬变） |
| Breadcrumb | `<x-breadcrumb>` + `<x-breadcrumb-item>` | ✅ 已交付（P1，面包屑：根单源下沉 `separator`（slash/chevron/none，chevron 吃内部已登记图标）并把末项回写 `current`（不可点 + `aria-current=page`）；`max-items` 收纳过长路径——首项与末项恒在、中间折成「…」挂到第一个被折叠项上，点它全展开并派发 `x-toggle`（「…」不占格，至少能合并两项才折）；`size` 只下发字号与间距；item 写了 `href` 即真链接（右键/新标签页等原生能力都在），点击先派发可取消 `x-select`（detail:{href,text}）——`preventDefault()` 即换前端路由，不写 href 退为占位锚（链接与文本共用一个 `<a>`，靠 href 有无可点，免拆二选一也不会出现两个无名 slot）；`nav` 地标 + role=list/listitem，格内文字单行不折字） |
| Carousel | `<x-carousel>` + `<x-carousel-item>` | ✅ 已交付（P1，轮播图：实现走**原生 scroll-snap**（滑轨 overflow-x:auto + 每张自声明 flex:0 0 100%，拖拽/触控板/惯性全免费，JS 只做翻页协调）；`value` 当前张序（不反射，写它即滚向该张，静态 attribute 也生效）；`loop` 无限滚动（首尾克隆哨兵 data-clone 不计张数，环绕/拖过端点都只挪一步、落定同位瞬移真张，哨兵 aria-hidden+inert；关则端点箭头置灰、自动播放停）；每张 `scroll-snap-stop:always` 快速甩动逐站停靠不跳张；`interval` 自动播放 ms（悬停/聚焦内部/页签隐藏暂停，移开恢复）；`arrows` 左右圆钮（缺省开，Boolean 缺省真值不落 attribute 故不反射、镜像成宿主 no-arrows 假标记供 CSS 消费——tabs 同款坑）；`indicator` dot/line/none；`next()/prev()/goTo(i)`；落定优先 scrollend（老浏览器退回 120ms debounce）取整回写并统一派发 `x-change`（拖拽/按钮/自动/程序化同一条路径）；无障碍全套（region+carousel 描述、每张自动「第 n 张共 m 张」、指示钮 aria-current）；reduced-motion 切张瞬移；高度由消费方给或张内容撑开；键盘不截←→防误伤张内横向内容；part=track/prev/next/indicators） |
| Drawer | `<x-drawer>` + `<x-drawer-header>` / `<x-drawer-footer>` | ✅ 已交付（M0；快捷用法只给 `title`/`subtitle` 即自动生成带关闭按钮的头部（显式 header 时让位），footer 自动贴底、按钮写 `command="close"` 即可关本抽屉；与内容无分隔线；Esc 走与对话框共享的浮层栈，只关最上层） |
| ThemePanel | `<x-theme-panel>` | ✅ 已交付（M0，基于抽屉的右侧设置面板） |
| Icon | `<x-icon>` | ✅ 已交付（M0，仅收录本库内部组件实际使用的图标，不派生更多） |
| Typography | `<x-text>` | ✅ 已交付（M0，排版原子件：`variant` = title/subtitle/body/caption/muted，内部吃令牌、随主题联动） |
| Avatar | `<x-avatar>` | ✅ 已交付（M0，头像/标识方块：内容优先级 `src` 图片 > `text` 文字 > `name` 第一个字 > 占位图标；`shape`/`size`/`color`，加载失败自动回退，logo 的 mark 即复用本组件） |
| Badge | `<x-badge>` | ✅ 已交付（M0，徽标/角标：不塞内容即行内胶囊/圆点（独立态）、塞了子元素即浮到其四角（锚定态、带背景色环）；`value`+`max` 纯数字溢出折叠为 `${max}+`、`dot` 圆点、`show-zero`、`placement` 四角、`size` 三档、`color` 7 角色实底（default 中性反色）；锚定/独立由 slot 有无内容自动切换） |
| Status | `<x-status>` | ✅ 已交付（P1，状态灯：文档流里的小圆点常与文字并排（「● 在线」），与 badge 的角标 dot 分工明确；`color` 7 角色（default=currentColor 随上下文联动，`--_st-color` 逃生舱）、`size` xs/sm/md/lg（4/6/8/12px）；双动画轴 `pulse` 呼吸灯=活跃、`halo` 雷达波=强提醒（纯 CSS 可叠加，reduced-motion 自动静止）；`label` 写了才 role=img+aria-label，不写即 aria-hidden 纯装饰 |
| Spinner | `<x-spinner>` | ✅ 已交付（P1，旋转加载指示器：圆环缺一段匀速旋转，库里所有「等待中」视觉的收敛点（x-button 的 loading 内嵌即它）；`size`/`stroke`/`speed` 走宿主局部变量（纯数字补 px/s，缺省 1em/2px/.6s）、`color` 7 角色（default=currentColor 随上下文联动）、`label` 无障碍名（空则退为 aria-hidden 纯装饰）；`prefers-reduced-motion` 停转补成静态圆环；单一非角色色用 `--_sp-color` 逃生舱） |
| Tag | `<x-tag>` | ✅ 已交付（P1，标签：与 x-button 同源双轴 `variant`（soft/solid/outline/ghost）×`color`（7 角色，正交任意组合）+ `size` 三档；`round` 胶囊、`closable` 显关闭钮（点它派发可取消 `x-close`，组件不自删、由宿主决定移除）；纯展示件，文字过长省略号截断） |
| Chat Bubble | `<x-chat-bubble>` | ✅ 已交付（P1，聊天气泡：一条消息一个气泡，`side` 定收/发——start 缺省靠左、end 靠右并整行镜像（`row-reverse`，含头像落位与贴边）；三段结构 avatar / header（发送者名+时间）/ footer（送达状态，`read` 一键已读态：自动「已读 + success 色✓」，与 `footer` 文本可叠加作标签）全可缺席——`name`+`time` 快捷拼 header、`footer` 快捷放一行状态文本，同名 `slot` 有内容即整体覆盖快捷路径，空段自动不占位（slotchange+updated 双路 presence 幂等判定，静态解析期子件渐进挂入也收敛）；外观沿用 x-box/x-button 双轴范式 `variant`（solid/soft/outline/ghost，缺省 soft）×`color`（7 角色，缺省 default 中性面），两轴不互相窥探；方向感靠「面朝头像侧的上角收小圆角」（角圆差在任意底色下都成立；物理尾巴经多轮方案尝试后按用户决定整体移除，历史见 design.md）；行宽为内容宽且封顶宿主局部变量 `--_bubble-maxw`（缺省 80%），长文自动折行不撑破、`word-break` 兜底超长 URL、头像 `align-items:flex-start` 不随多行漂；图片/图集/附件等富内容不是 API 维度——往默认插槽自由组合原子件即可；part=row/avatar/header/bubble/footer） |
| Progress | `<x-progress>` | ✅ 已交付（P1，线性进度条：与 spinner 分工——知道完成度用它、只知道「在忙」用 spinner；`value` 0–100 越界自动夹紧，不写 value（或 `indeterminate`）即不确定模式小条扫动；`color` 7 角色、`size` 任意长度（纯数字按 px）轨道圆角随高度联动；填充条宽靠细粒度 style 绑定直写；`role=progressbar` + aria 全套，reduced-motion 停为静态半条；单色逃生舱 `--_pg-color`） |
| Radial Progress | `<x-radial-progress>` | ✅ 已交付（P1，圆环进度：x-progress 的圆形同族——占地小、中心能放内容，适合仪表盘/卡片角；画法 conic-gradient 扇形 + radial-gradient mask 抠环带，任意 size/thickness 组合零数学不依赖 SVG 周长；`value` 0–100 越界夹紧、环从 12 点方向上色，不写（或 `indeterminate`）即不确定转环；`color` 7 角色与 progress/spinner 同族，轨道余量色自动取主色 18% 淡染（`--_rp-track` 可覆写）；`size`（缺省 64px）/`thickness`（缺省 size/10）纯数字按 px；中心两段式：定值自动显百分比（tabular-nums 不抖宽），默认插槽放内容即整体覆盖；百分比经 `--_rp-pct` 变量细粒度直写不重渲；aria progressbar 全套，reduced-motion 停为静态半弧；part=base/ring/center） |
| CountUp | `<x-count-up>` | ✅ 已交付（P1，数字渐变：rAF 补间把数字从起点滚到目标（「打开页面从 0 涨上去」）；核心是监听 `value`——已起播后改值从画面当前值续滚不回 0，中途改目标也不回跳；`duration`/`easing`（linear/ease-out/ease-in-out）、`decimals` 缺省自动跟目标小数位、`grouping`+`separator` 千分位、`prefix`/`suffix`；`trigger` mount（缺省即挂即滚）/visible（首次进视口才滚，未知值按 mount 兜底）；`play(target?)`/`immediate(target?)` 可选目标一步到位（传参=先写 value 含反射）、`reset()` 退 0 不清起播态；落定派发 `x-finish`；tabular-nums 不抖宽、reduced-motion 直落 |
| Timeline | `<x-timeline>` + `<x-timeline-item>` | ✅ 已交付（P1，时间线两件套：容器协调流向/首尾线段淡出/左右交替与全局 dot-color/line-color（项同名属性可覆盖），item 是「节点列 + 时间标签 + 任意内容体」；线段由节点列 `::before/::after` 自绘（不像 flyonui 靠用户手插 `<hr>`），首项无上半段、末项无下半段由容器下发 `data-tl-first/last` 单源标记；`orientation` vertical（缺省）/horizontal（节点横躺内容上方，下发 `data-tl-orient`）；`alternate` 一行开启——容器对各项轮流指派 `side=start/end`，全体统一三列中轴布局保证中轴同一 x（两列/三列混排会错位断线，故下发 `data-tl-alt` 给所有项）；`line-color` 语义 = 本节点「之前」那段线的颜色，下一项的 line-color 同时接管上一项的下半段，同段线两端始终同色；色值走全库 7 角色（primary/success…）；缺省线色比主题边框再淡一档（color-mix 55%），线段与节点间恒留 3px 呼吸空隙不贴死；节点三态互斥靠 CSS：缺省光晕+大核心小圆点、`icon` 只换 glyph 体量与点档一致、`slot=icon` 放 x-avatar 等覆盖节点本体（presence 回写宿主假标记 `has-icon-content` 隐光晕）；`dot-color` 7 角色驱动节点色、`time` 内容上方 muted 小字（缺省整行 hidden）；内容体结构不预设（要卡片壳可自行用 x-box 包裹），脱离容器单独用也成立（缺省垂直、线段画满）；role=list/listitem，part=base/node/content/time，定制变量 `--_tl-color`/`--_tl-line`/`--_tl-line-below` |
| Flex | `<x-flex>` | ✅ 已交付（M0，弹性布局原子：`direction`/`align`/`justify`/`wrap`/`inline`/`gap`（令牌别名）） |
| Box | `<x-box>` | ✅ 已交付（M0，通用视觉容器（表面件）：外观沿用 Button 双轴范式 `variant`（ghost 缺省全透明/solid/outline/soft）×`color`（7 角色，两轴正交——写 color 不反推 variant，要实底卡面显式 `variant="solid"`）；`width` full 横向充满父元素/fit 只包住子元素；`padding`/`radius` 吃令牌别名或任意长度、`shadow` 三档、`hoverable` 悬停浮起可点暗示；外观全落宿主本身（shadow 只留 slot），直接 CSS 覆写无需 part；只管面不管排布（x-flex）与骨架（x-container）） |
| Container | `<x-container>` | ✅ 已交付（M0，应用外壳：header/sidebar/main/footer + 侧栏折叠为窄栏 `rail`，rail 单源下沉给 logo/menu；`collapsible` 默认显内置折叠钮，写 `collapsible="false"` 即关（也可 `toggleRail()` 命令式切换）；**高度约定**：宿主 `height:100%` 吃满父元素（需祖先给确定高，如 `html,body{height:100%}`），内部 `minmax(0,1fr)` 把中间行锁在剩余空间、溢出全交给 main/侧栏内部滚（不外溢产生整页滚动条）；两处滚动条 `scrollbar-gutter:stable` 预留轨道槽防抖动 + 细窄主题化样式） |
| Divider | `<x-divider>` | ✅ 已交付（P1，分割线：横（默认）/`direction=vertical` 纵，纵线 `align-self:stretch` 吃 flex 父项高；可选文字—往默认插槽放内容即断线，`label-placement` start/center/end；`dashed` 虚线用 background 渐变平铺画段（不用 border-style:dashed，两段相位不连续）；线色吃 `--xie-color-border` 随主题联动） |
| Logo | `<x-logo>` | ✅ 已交付（M0，品牌标识：mark 复用 x-avatar，`mark`/`src`/`title`/`subtitle`，rail 窄栏只显首字母；窄栏折叠/展开动画期文字不换行、随轨道宽被平滑裁切（不瞬时报出多行致行高跳动）） |
| Input | `<x-input>` | ✅ 已交付（M0，单行输入：内包原生 input；`variant`(outline/filled/flush) × `color`(6 角色) 双轴 + `size`，`clearable`/`show-password` 显密切换/`show-count`/前后缀插槽；逐字符 `x-input`、提交 `x-change`（可取消回退）；FCCE form 关联（`name`，required/type/maxlength 镜像内层原生 validity）） |
| Textarea | `<x-textarea>` | ✅ 已交付（M0，多行文本域：与 Input 同源事件模型 + `variant`×`color` 双轴，`autosize`/`max-rows` 自适应高度、`resize`、`show-count`；FCCE form 关联） |
| Checkbox | `<x-checkbox>` / `<x-checkbox-item>` / `<x-checkbox-group>` | ✅ 已交付（M0，复选框三件套：原子/带文字项/容器；`shape`×`color` 双轴 + `indeterminate` 三方态；group 条件下沉公共属性、`min`/`max` 数量约束、聚合 `x-change`；本库首个 FCCE form 关联） |
| Radio | `<x-radio>` / `<x-radio-item>` / `<x-radio-group>` | ✅ 已交付（M0，单选框三件套：与 Checkbox 同源，互斥由 group 维护（跨 shadow 无法靠原生同名），`value` 以字符串聚合；FCCE form 关联） |
| Select | `<x-select>` | ✅ 已交付（M0，下拉选择：自绘弹层 listbox（吃全局令牌、选中打勾、不足向上翻转）+ 键盘导航（↑↓/Home/End/Enter/Esc）；`multiple` 多选（选中不关弹层、`values` 数组、同名多项进 FormData）；选项来自 light DOM `<option>` 或 `options` 数组；`placeholder`/`variant`×`color`；FCCE form 关联；弹层刻意不复用 `<x-popover>`——本件是 combobox（焦点留触发件 + `aria-activedescendant`），与 popover/dropdown 的 dialog/menu 焦点陷阱是两套模型） |
| FileUpload | `<x-file-input>` | ✅ 已交付（M0，文件选择：隐藏原生 file + 自绘按钮；`accept`/`multiple`、`files` 只读、`reset()`；选中文件以 `name` 计入 FormData） |
| Filter | `<x-filter>` / `<x-filter-item>` | ✅ 已交付（M0，筛选器：单选 chip 行，观感复用 x-button（未选 soft、选中 solid、重置钮 solid）；选中项保留、其余横向折叠退场（grid 0fr→1fr 动画 + inert）；行尾 × 重置钮展开；`value` 聚合、可取消 `x-change`；`color`/`size`/`disabled` 下沉；刻意不做 form 关联（视图过滤用） |
| Form | `<x-form>` / `<x-form-item>` / `<x-form-footer>` | ✅ 已交付（M0，表单三件套：正交布局（`layout` 管输入项纵排（默认）/横排换行；`label-position` 管 label 在上/在左，默认 left，与 layout 无关；`label-width` 不写时自动测量最宽 label 回填对齐，`label-align` 管文本对齐；`gap` 间距默认 20px；`columns`=N 等宽 grid 列根治长短不齐（文本类控件拉满格宽，纵向可用双列表单）；footer `align` + `label-offset`，且无条件通栏沉底不参与流向）；字段统一在 x-form-item 声明（label/name/required/help，`name` 为权威绑定键强制下沉给控件）；x-form 统一遍历「最外层」控件、按公开值面聚合 `values`/`formData`（表单归属不跨 shadow，slot 进来的控件 `new FormData()` 收不到，故手动收集；控件自带 FCCE 仍在，直接放页面原生 form 可自动计入），`validate`/`submit`/`reset`/`setValues`，可取消 `x-submit`；校验以控件原生约束为底层（required/type/pattern），叠加函数式自定义规则 `validate(rules?)`——rules 为「字段名→断言函数」（返回 `true/undefined` 通过、非空字符串即错误消息，第二参拿整表单 `values` 做跨字段、可异步），`validate()` 统一返回 `Promise<boolean>`；提交入口不写监听——footer 里 `<x-button command="submit"|"reset">` 即就近交给本 form 认领（footer 须在 `<x-form>` 内：命令只沿祖先链上传）；`disabled` 显式下发各控件） |
| Dialog | `<x-dialog>` + `<x-dialog-header>` / `<x-dialog-footer>` | ✅ 已交付（M0，与抽屉同模式的居中浮层：遮罩 + 面板、Esc 关闭、滚动锁（与抽屉共享计数与 Esc 栈，一次 Esc 只关最上层）；快捷用法只给 `title`/`subtitle` 即自动生成带关闭按钮的头部（显式 header 时让位）；`closable=false` 一次性禁用遮罩点击/Esc/关闭按钮三条路径（footer 里的 `command="close"` 与 `hide()` 照旧可用）；`width` 默认 480px，内容超高只有中部滚动、header/footer 常驻） |
| Toast | `<x-toast>` | ✅ 已交付（M0，轻提示容器：页面挂一个 `<x-toast>`（不占布局）、调 `add(文本, opts)` 即在其内堆叠；不锁滚动/不拦操作、`pointer-events` 只落条上；`color` 语义色自动配图标、`duration` 自动关（hover 暂停）、`closable` 手关、`placement` 六向（四角+顶/底居中）、`max` 堆叠上限；每条关闭前派发可取消 `x-close`；内容仅纯文本） |
| Alert | `<x-alert>` | ✅ 已交付（P1，警告提示：toast 的常驻版，页面内联不自消失；双轴 `variant`（soft 淡底/solid 实底）×`color`（7 角色）；图标名跟随 color 自动配（与 toast 同表，default/primary 无图标自动收起）、`icon=false` 可关；`title` 属性起标题层 + 默认插槽放富内容；`closable` 派发可取消 `x-close` 组件不自删（与 x-tag 同契约）；`role=alert` 出现即播报） |
| Tooltip | `<x-tooltip>` | ✅ 已交付（M0，文字提示：包裹触发内容（同 x-badge 锚定态的包裹结构）、悬停/聚焦弹一枚深色小气泡；`content` 纯文本（空则不弹）、`placement` 四向、`delay` 显示延时（默认 150ms）、`open` 强制常开；气泡 `pointer-events:none` 不拦操作、shadow 内 absolute 定位（会被祖先 overflow 裁剪、与 x-select 同取舍）；反色实底随主题联动） |
| Popover | `<x-popover>` | ✅ 已交付（P1，气泡卡片：包裹结构（默认插槽触发件 + `slot=content` 面板内容），面板为 shadow 内 `position:fixed` 实底卡片（不受祖先 overflow 裁剪），坐标由 `core/anchor.ts` 按 `placement` 四向算出（主轴空间不足自动翻转、交叉轴居中后视口夹紧）；`trigger` click/hover（hover 移开 150ms 延时收、不设陷阱）；click 模式吃 P0-1 基建：打开即聚焦、Tab 锁面板内、关闭归还来源，Esc 走全局浮层栈只关最上层，面板外 pointerdown 即关；滚动/缩放跟随重定位；`show()/hide()/toggle()` 与反射 `open` 等价；认领 `close` 命令） |
| Dropdown | `<x-dropdown>` + `<x-dropdown-content>` | ✅ 已交付（P1，下拉菜单：x-popover 的菜单化子类（只覆盖四个旋钮：起边对齐、面板 minWidth 跟触发件宽、点内容行即关、haspopup=menu），开合/Esc 栈/外部点关/焦点归还/fixed 落位零重复实现；菜单行用配套部件 `<x-dropdown-content>` 归组（自动挂 slot="content"、默认纵排铺满，行与触发件不再平铺成兄弟；轻量也可直接多元素挂 slot="content"），点行派发 `x-select`（detail:{item} = 被点的行）；超高 320px 滚动） |
| Table | `<x-table>` | 📋 规划中（M4，动手前先纸面钉死 API 面：数据驱动 vs slot 驱动、受控性、行内编辑依赖校验引擎，见 [plan.md](./plan.md)） |

> 完整路线图见 [design.md](./design.md#7-组件路线图分期)，下一阶段优先序与决策倾向见 [plan.md](./plan.md)。

## License

MIT
