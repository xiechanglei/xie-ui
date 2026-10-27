# xie-ui 全局规划设计

> 本文档记录组件库的全局架构设计与规划决策，随项目演进持续更新。
> 组件使用方式请见 [README.md](./README.md)。

## 1. 项目定位与设计目标

- **原生 Web Components 实现**：不依赖任何框架（Vue/React），任何框架或裸 HTML 均可使用
- **零运行时依赖**：底层基于自研轻量基类 + 内置模板字符串渲染，保持包体积最小
- **可插拔、可分类按需**：按「分类」粒度导出，`import '@xie-work/xie-ui/basic'` 即注册该分类全部组件（不做组件级子路径）
- **框架无关的互操作**：提供 React 包装组件生成方案（后续），Vue 天然支持自定义元素（配置 `isCustomElement`）

## 2. 技术选型（核心决策）

| 决策点 | 选择 | 理由 |
|---|---|---|
| 底层实现 | 原生 Custom Elements v1 + Light DOM（自研轻基类） | 零依赖、体积可控、无外部库升级风险；组件数量可控时成本可接受 |
| 响应式更新 | Signals 微型实现（~1KB，自研） | 细粒度更新，避免 dirty-diff；比全量重渲模板高效 |
| 样式方案 | Light DOM（`adoptedStyleSheets` 共享样式表）为主 + 暴露 `::part` | Shadow DOM 封装性强但导致外部 Tailwind/全局 CSS 失效、表单样式穿透困难；Light DOM 保留原生级联，配合约定化的 CSS Custom Properties 做主题 |
| 主题系统 | Design Tokens = CSS Custom Properties | `--xie-color-primary` 等两层 token（原始值 → 语义值），支持 dark mode 仅需切换根属性 |
| 构建 | Vite lib mode，浏览器 ESM，**单一全量产物 + 彻底压缩** | 只有一个入口 `src/index.ts` → `dist/index.js`，core/tokens/组件全内联到一个文件，引入一次零额外请求。压缩：JS 由自定义 renderChunk 插件再跑一次 esbuild `minify:true`（Vite lib 模式默认只压标识符/语法、不压空白且留注释），CSS 用真实 `.css`+`?inline` 走 Vite cssMinify 管线。**放弃按分类打包**；`src/categories/` 仅作内部聚合 |
| 公共导出面 | 组件入口（全量 & 分类）**零运行时导出**，纯注册副作用；**不对外暴露内部基类/工具** | Web Components 的本质是「引入即注册、直接用标签」，无需具名导入组件；类型靠各组件模块的 `declare global`（HTMLElementTagNameMap）+ 入口 `export type` 生效。本库定位简单 UI 库，core（基类/信号/模板）仅供内部使用；想写自己的组件就自己实现，不提供基于本库的开发者入口 |
| 测试 | Web Test Runner / Playwright Web Components 模式 | 真实浏览器环境测试自定义元素 |
| 开发/文档 | Story 化开发（每组件 `*.stories.ts`）+ Vite demo 页 | 开发期即可验证，后期直接产出文档站 |

## 3. 目录结构规划

```
src/
├── core/                      # 底层框架（与 UI 无关）
│   ├── element.ts             # XBaseElement：生命周期、属性/反射、事件
│   ├── signals.ts             # 微型响应式（signal/computed/effect）
│   ├── styles/
│   │   ├── adopted-sheets.ts  # 构造可共享的 CSSStyleSheet
│   │   └── css.ts             # html/css 标签模板工具
│   ├── controllers.ts         # 复用逻辑（如 ResizeObserver、点击外部关闭）
│   └── registry.ts            # 组件注册中心 + devtools
├── tokens/                    # 设计令牌
│   ├── primitive.css.ts       # 原始色板/间距/字号/阴影
│   ├── semantic.css.ts        # 语义 token（--xie-bg、--xie-fg...）
│   ├── light.ts / dark.ts     # 主题变体
│   └── global-style.ts        # 注入 :root 的一次性全局样式
├── utils/                     # 通用工具（dom、event、form helpers）
├── components/
│   ├── button/
│   │   ├── x-button.ts
│   │   ├── x-button.css.ts
│   │   ├── index.ts           # define + 类型导出
│   │   └── x-button.stories.ts
│   ├── input/ ...
│   └── ...
├── types/                     # 全局类型（HTMLElementTagNameMap 增强）
└── index.ts                   # 全量入口（注册所有组件）
```

## 4. 核心基类设计（`XBaseElement`）

关键约定（伪代码示意 API 形态）：

```ts
class XButton extends XBaseElement {
  static tag = 'x-button'
  static observedAttrs = ['variant', 'size', 'disabled']  // 属性 → signal 自动桥接
  static styles = [buttonStylesheet]                      // adoptedStyleSheets 共享

  variant = defineProp('variant', { reflect: true, default: 'solid' })

  render(t) { return t`<button class="base" part="base"><slot></slot></button>` }
}
```

设计要点：

- **属性（attribute）用于声明式配置**（kebab-case、可 reflect），**属性名（property）用于命令式/复杂值**（对象、数组只走 property）
- 统一更新调度：signal 变更 → microtask 合并 → 一次 `render` + 差量 DOM patch（局部模板插值）
- 表单组件实现 **Element Internals**（`attachInternals`），原生支持 `form` 关联、校验、`name/value` 提交
- 全局样式（tokens、reset）通过一次性注入 `<style>` 到 `document.head`，组件样式用共享 CSSStyleSheet

## 5. 公共 API 规范（全组件统一）

- **命名**：统一 `x-` 前缀；属性 kebab-case；布尔属性存在即真（`disabled`）
- **事件**：统一 `CustomEvent`，命名 `{component}-{action}`：`x-change`、`x-input`、`x-close`；带 `detail` 载荷；可取消动作用 `cancelable`
- **插槽**：默认插槽放主内容；具名插槽 `xxx` 约定文档化；图标场景提供 `icon-start` / `icon-end`（同属性可覆盖）。对于统一使用本库内置图标的组件，可直接写 `<x-icon name="…">`（见「内置图标约定」）
- **内置图标约定**：框架自用 SVG 集中登记于内部 `src/components/icon/icons.ts`（**不对外导出**），仅收录本库组件实际使用的图标，不派生更多。对外出口为 `x-icon`（`name`/`size`/`label`）；内部组件需要图标时先写入注册表再以 `<x-icon name=…>` 消费，避免 SVG 路径多处重复
- **尺寸**：统一 `size: 'sm' | 'md' | 'lg'`；变体统一 `variant`（按组件语义取值）。对于同时有“形态”与“语义色”的组件（如 x-button），`variant` 只表形态（solid/outline/ghost/soft），`color` 只表语义色（primary/secondary/success/warning/danger/info），两轴正交、自由组合，避免单一枚举爆炸
- **状态**：`disabled`、`loading`、`readonly`、`required` 等跨组件同名同义
- **a11y 基线**：键盘导航（Enter/Space/Tab/Esc/方向键）、`role`/`aria-*` 自动管理、焦点可见环统一样式

## 6. 主题与定制体系

### 6.1 令牌分层（primitive → knob → derived）

- **primitive**：原始调色板/间距，不随主题变
- **knob（旋钮）**：主题面板唯一改写的少量基准值——`--xie-primary` / `--xie-danger` / `--xie-radius` / `--xie-control-height` / `--xie-font-size` / `--xie-shadow-strength`
- **derived（派生）**：由旋钮经 `calc` / `color-mix` 自动算出的语义令牌（`--xie-color-primary-hover`、`--xie-radius-md`、`--xie-size-lg`、`--xie-shadow-2` …），**组件只消费这一层**

因自定义属性可穿透 Shadow DOM 边界继承，改写 `:root` 上的旋钮即全站实时联动，无需 JS 逐个通知组件。

### 6.2 切换入口（三种，可并存）

1. **预设档位（纯 CSS零 JS）**：`<html data-xie-theme="dark" data-xie-radius="none" data-xie-size="compact" data-xie-shadow="strong">`；各维度正交覆盖对应旋钮，不产组合爆炸
2. **任意值**：直接 `setProperty('--xie-primary', …)` 覆盖旋钮，派生层自动重算
3. **可视化面板** `<x-theme-panel>`：把用户选择翻译成上述两者，写入 `:root`，变化时派发 `x-theme-change`

### 6.3 定制层次

- **Token 层**：覆盖旋钮/语义变量整体换肤
- **Part 层**：每个组件文档化 `::part(base/icon/label...)`，外部可精准定制结构件（Shadow DOM 下的官方穿透方式）

## 7. 组件路线图（分期）

| 阶段 | 内容 |
|---|---|
| **M0 地基** | core（基类+signals+样式注入）、tokens、tsconfig 加 `"lib": ["ES2022","DOM"]`、vite.config 改浏览器多入口构建、demo 壳、x-button + x-icon 打样验证全部机制 |
| **M1 基础** | input、textarea、checkbox、radio、badge、avatar、spinner、divider、space |
| **M2 表单系统** | form（收集/校验/提交）、select、switch、slider、date-picker、upload；Internals 表单互通 |
| **M3 反馈与浮层** | dialog、alert、toast、tooltip、popover、dropdown、progress、drawer（浮层定位自研 anchor 算法或引入 floating-ui 作为唯一外部依赖） |
| **M4 导航与数据展示** | menu、tabs、breadcrumb、pagination、table、tree、accordion、carousel、tag |
| **M5 工程化补全** | React wrapper 生成器、VSCode Web Tags 数据、文档站、CI（lint + test + build）、semver 发布 |

## 8. 现有配置修正项

1. **vite.config.ts**：`target: 'node18'` + `ssr: true` 是 Node 库配置（含残留的 `name: 'XieAuth'`），浏览器库应改为 `target: 'es2022'`、去掉 ssr、`rollupOptions.input` 多入口（每组件一个）
2. **tsconfig.json**：`lib` 缺 `"DOM"`，Web Component 的 `HTMLElement`、`CSSStyleSheet` 等类型会报错
3. **package.json**：`"exports"` 仅暴露全量入口 `"."` → `./dist/index.js`（已压缩单文件），不再有分类子路径；入口**不导出任何运行时 API**，仅注册副作用；不对外提供 core 子路径（基类仅供库内部使用）；浏览器库不再输出 CJS；包名 `@xie-work/xie-ui` 与组件前缀 `x-` 建议统一考虑

## 9. 风险与对策

- **自研渲染层的复杂度**：先用 button/input 两个组件验证「signals + 局部 patch」是否够用，不成熟则退化方案是引入 Lit（约 5KB gzip，架构不变，仅替换基类）
- **Light DOM 样式泄漏**：靠严格遵循 BEM 式内部类命名 + `data-xie-*` 属性隔离，组件内部类一律带前缀
- **SSR/框架服务端渲染兼容**：自定义元素在服务端不渲染，需要文档说明占位策略；后续可选 `declarative shadow DOM` 支持

## 10. 更新记录

| 日期 | 内容 |
|---|---|
| 2026-10-23 | 初版：完成全局架构规划（选型、目录、基类、API 规范、主题、路线图） |
| 2026-10-23 | **M0 落地**：修正 tsconfig（lib 加 DOM）与 vite 构建（改浏览器 ESM 单入口 + `preserveModules`，产出与 `.d.ts` 路径对齐，`./button` 子路径按需引入）；实现 `core/signals.ts`、`core/element.ts`、`tokens`、`x-button`，跑通 attribute→signal→模板细粒度绑定→共享样式表的完整链路。 |
| 2026-10-23 | **样式方案偏差修正**：M0 实际采用 **Shadow DOM + 构造式样式表（`adoptedStyleSheets` 实例共享）** 而非原定的 Light DOM。原因：细粒度模板绑定、`<slot>` 内容承接、`::part` 定制与跨实例样式表复用均以 Shadow DOM 最为自然；主题仍通过继承的 CSS 自定义属性穿透 shadow 边界生效。后续如需 Light DOM 组件，可在基类放开 `attachShadow` 开关按需关闭。 |
| 2026-10-23 | **组件测试约定**：新增 `test/` 可视化测试台（`yarn test` 启动 vite 并打开 `/test/`），组件样式由人工在浏览器肉眼验证并反馈，**不编写虚拟 DOM（jsdom）单测**。每个新组件在 `test/index.html` 追加对应用例区块。 |
| 2026-10-23 | **按需粒度改为分类级**：取消组件级子路径，新增 `src/categories/basic/index.ts` 聚合入口；全量入口 `src/index.ts` 改为 re-export 各分类；package.json `exports` 用 `./basic` 替换 `./button`。分类命名与 demo 菜单一致（basic/form/feedback），`form/feedback` 待有组件时再加同名入口。 |
| 2026-10-23 | **文档站落地**：新增 `demo/` 文档站（`yarn docs` 先构建再启动 vite 并打开 `/demo/`）。左侧两级菜单（一级分类 / 二级组件名，首位为 Start 介绍），右侧展示实时示例 + API。**直接用 JS `import '/dist/index.js'` 消费构建产物**，模拟真实使用环境。每新增组件：在 `demo/menu.js` 登记、`demo/pages/<id>.js` 写文档。 |
| 2026-10-23 | **收敛公共导出面**：消费者反馈入口导出过多。将全量/分类入口改为**零运行时导出**（纯注入令牌 + 注册组件，import 一次即直接用标签），组件类型改由 `x-button.ts` 内 `declare global { HTMLElementTagNameMap }` 增强 + 入口 `export type`（编译期擦除）提供，响应式属性用 `declare` 字段补出类型。已用消费者视角 typecheck 验证 `<x-button>` 类型经 dist 生效。 |
| 2026-10-23 | **取消对外 core 入口**：本库定位为简单 UI 库，想写自己的组件应自行实现而非基于本库。删除 `src/core/index.ts`、package.json `./core` 子路径与 vite entries 中的 `core/index`；core（基类/信号/模板）回归为仅供库内部依赖链使用的私有实现，不再对外。 |
| 2026-10-23 | **主题系统升级（旋钮+派生+面板）**：令牌重构为 primitive→knob→derived 三层，旋钮用 `calc`/`color-mix` 自动派生主色族/圆角/尺寸/字号/阴影；新增预设档位 `data-xie-radius/size/shadow`（与 `data-xie-theme` 正交）；x-button 改为消费派生令牌。新增 `x-theme-panel` 可视化配置组件（属于 basic 分类），选择即写入 `:root` 令牌、全站实时联动，并派发 `x-theme-change`。demo 新增「主题定制」指南页，test 新增面板用例。 |
| 2026-10-26 | **构建产物改为每入口自包含**：取消 `preserveModules`（原会把组件拆为几十个模块文件，随组件增长请求数线性膨胀）。现在全量入口挨 `dist/index.js`、分类入口挨 `dist/<cat>.js`（如 `dist/basic.js`），core/tokens/组件内联到一个文件，引入一次零额外组件请求；多入口共享部分由 rollup 抽为 `dist/shared/*.js` 稳定命名公共 chunk。`entries()` 分类名改为平铺（`basic` 而非 `categories/basic/index`）；package.json `./basic` 的 default 改指 `./dist/basic.js`（types 仍为 `dist/categories/basic/index.d.ts`，因 vite-plugin-dts 依旧按源码结构逐模块产出类型）。 |
| 2026-10-26 | **简化为单一全量产物 + 压缩**：放弃上一条的分类级分包（对简单 UI 库收益不大、且增加 exports/构建复杂度）。vite.config.ts 改为单 entry（`src/index.ts`）、`minify: true`、`fileName: () => 'index.js'`，只产出 `dist/index.js` 一个压缩文件（core/tokens/组件全内联）。移除 package.json `./basic` 子路径（仅保留 `.`）；`src/categories/` 保留为内部聚合。demo/README 引入示例统一为 `import '@xie-work/xie-ui'`。 |
| 2026-10-26 | **产物彻底压缩**：发现 Vite lib 模式用 esbuild 只压标识符/语法、**不压空白且保留 `/** */` 注释**（dist 近 850 行、可读性太强）。曾试切 `minify:'terser'` 但本环境下未生效（产物反变全裸未压），改回并在 renderChunk 末尾加自定义插件 `xie:full-es-minify` 直接调 esbuild `transform({minify:true, legalComments:'none'})`。产物 846→54 行、gzip 7.6→5.7kB、注释清零。同时样式改为真实 `.css`+`?inline`（见上）使 CSS 走 Vite 压缩管线。tsconfig types 加 `vite/client`。 |
| 2026-10-26 | **新增 Drawer 抽屉（首个 feedback 分类组件）**：新建通用 `x-drawer`（`src/components/drawer/`），从视口右/左滑入的面板+遮罩，`open` 反射属性驱动 CSS 过渡，遮罩点击/Esc 触发可取消的 `x-close`，自带滞动锁。`:host{display:contents}`，面板固定定位故不占布局；宽度经 `--_drawer-width` 自定义属性隔射 shadow。新建 `src/categories/feedback/index.ts` 分类入口并在 `src/index.ts` 接入。 |
| 2026-10-26 | **x-theme-panel 重构为抽屉**：面板不再内联展示，而是内嵌 `x-drawer` 做成右侧滑入的精美设置面板；对外新增 `open` 属性（反射）+ `show/hide/toggle`，单一数据源（抽屉自关→监听 x-close 回写 panel.open）。demo「主题定制」改为按钮唤出，新增 demo/pages/drawer.js 文档页与菜单项，test 新增抽屉用例。 |
| 2026-10-26 | **全局基础样式下沉到库**：将「页面画布跟随主题」从 demo/docs.css 上移到 `tokens.css` 的 `:root`（`background-color:var(--xie-color-bg)` + `color` + `color-scheme:light/dark`），消费者 import 库即自动联动、原生滚动条/表单件也随之深浅色；docs.css 仅保留文档站自身排版。代价：库对 `:root` 背景有默认主张，消费者需以更高特异性 CSS 覆盖。 |
| 2026-10-26 | **主题持久化**：新增 `src/components/theme/persist.ts`（`localStorage` 键 `xie-theme-config` 读写/清除 + `applyConfigToRoot` 公共翻译）。`x-theme-panel` 变更即存、恢复默认即清除，`constructor` 用存储值 hydrate 属性以还原选中态；并在模块顶层（dist 加载、首屏前）尽早 `applyConfigToRoot`，避免刷新后闪默认色。无存储时为空操作，不影响未用面板的消费者。 |
| 2026-10-26 | **强调色体系（颜色可定制）**：旋钮从 primary/danger 扩到 6 个强调色角色 primary/secondary/success/warning/danger/info，每个补齐完整派生族（本体/hover/active/soft/fg）；引入 `--xie-soft-mix` 单一开关使 soft 随 light/dark 翻转（浅往白、深往黑）。`persist.ts` 新增 `ACCENT_KEYS`/`ACCENT_DEFAULT`（默认值单一源）与 `pickFg`（按 WCAG 相对亮度自动取黑/白前景），`applyConfigToRoot` 遂一角色处理（定制则 setProperty 旋钮+fg，否则 removeProperty 回落 CSS）。`x-theme-panel` 因模板引擎不支持列表，改为在 `firstUpdated` 命令式构建「强调色」区（每角色一行：预设色卡+取色器）；x-button 补 secondary/success/warning/info 实心 variant。中性色（bg/fg/border/surface）本轮仍由明暗开关接管，留作下一步。 |
| 2026-10-26 | **新增 Switch 开关（首个 form 分类组件）**：新建通用 `x-switch`（`src/components/switch/`），以 `<button role="switch">` 实现（可键盘 Space/Enter），`checked`/`disabled` 反射属性，交互切换派发可取消的 `x-change`（detail:{checked,value}，程序化设值不触发）；支持 `slot="on"/"off"` 图标随态显隐；尺寸走 `--xie-switch-width/-height`。新建 `src/categories/form/index.ts` 分类入口并在 `src/index.ts` 接入（demo 菜单原已有 form 分组）。x-theme-panel 的「外观模式」行由分段控件改为带太阳/月亮图标的 switch + 当前模式文字，监听 x-change 回写 theme、syncUI 回写 checked（单一数据源）。
| 2026-10-26 | **x-button 拆双轴（variant 形态 + color 语义色）**：原 `variant` 把形态（solid/outline/ghost）与颜色（secondary/success/warning/danger/info）焊在一起，导致只有实心态、拿不到 outline-danger 等组合。现拆为正交两轴：`variant`=形态（新增 soft 淡底）、`color`=语义色（6 角色）。CSS 改为分层变量：“颜色轴”只写 `--_accent/-hover/-fg/-soft`（`:host([color=...])`），“形态轴”只决定如何消费 accent（solid 默认 / outline 描边 / ghost 透底 / soft 淡底），hover 按形态取 `--_accent-hover` 或 surface/soft。规则数从 24 降到 6+4，且复用已有角色令牌族。**breaking change**：不保留旧颜色 variant，已迁移 demo（button.js/theme.js）。
| 2026-10-26 | **新增 Menu 菜单三件套（首个 nav 分类）**：新建 `src/components/menu/`下的 `x-menu`（单选协调根，`value`+`x-select`）、`x-menu-group`（分类/子菜单，`label`/`collapsible`(默认 false)/`collapsed`，grid 0fr↔1fr 高度自适应折叠动画 + `x-toggle`，可嵌套当子菜单）、`x-menu-item`（`value`/`note`备注/`disabled`/`active`，slot icon/note）。三件套均为 `<button role=menuitem>` 可 Tab 聚焦；配色吃全局令牌。新建 `src/categories/nav/index.ts` 并在 `src/index.ts` 接入。**同时迁移真实侧边栏**：demo/app.js 改为用 x-menu 渲染（分类=x-menu-group、项=x-menu-item，note=规划中/tag、disabled=规划项），监听 x-select→写 location.hash，路由变化时 setActive 回写 value（程序化不重触）；docs.css 删除旧 `.menu-group/.menu-item` 样式（下沉至组件）。注：Boolean 反射属性默认 true 不写 attribute，故 collapsible 采用默认 false。 |
| 2026-10-26 | **新增 Icon 内置图标组件 + 单一图标源**：新建 `src/components/icon/`，含 `icons.ts`（内部注册表，**不对外导出**，只收录本库内部组件实际使用的 SVG，避免图标库无限膨胀）+ `x-icon`（消费入口，`name`/`size`/`label`，`innerHTML` 注入注册表内容以适配模板引擎不插 HTML 的限制，stroke=currentColor 随主题联动）。**全量迁移现有内联 SVG**：x-menu-group 折叠箭头（chevron-right）、x-theme-panel 抽屉关闭（close）+ 外观模式开关内太阳/月亮（sun/moon）均改用 `<x-icon>`（共 4 处）；x-switch CSS `.thumb ::slotted(svg)` 修为同时匹配 `::slotted(x-icon)` 以保证开关内图标尺寸。x-icon 归入 `basic` 分类（基础构建块，与 button 同级），新增 demo/pages/icon.js 与 README/design.md 条目。约定：**新组件需图标 → 先 icons.ts 登记 name→SVG 再在组件模板 `<x-icon name=…>`**；icons.ts 不属于对外 API。 |
| 2026-10-26 | **新增 Slider 离散选项滑块 + 主题面板三行改用滑块**：新建 `src/components/slider/`（form 分类），`x-slider` 以 `options`（逗号分隔档位标签）+ `value`（选中下标，Number 反射）+ `disabled`/`label` 实现。指针：轨道 pointerdown/pointermove/pointerup + setPointerCapture 拖动、点按定位、跨档吸附（round）；键盘：手柄 role=slider 可聚焦，方向键逐档（MVP 不做 PageUp/Home/End）。拖动实时派 `x-input`、松手/换档派 `x-change`（detail:{index,value}），程序化 set value 不触发（受控）。刻度点/档位标签因模板引擎不支持循环，在 firstUpdated/updated 命令式生成（按 options 数量重建）。**主题面板将圆角/尺寸/阴影三行由分段按钮改为 x-slider**（value=预设数组 indexOf，监听 x-input 实时应用/x-change 落盘；单一数据源），删除面板内失效的 `.seg` 样式。新增 demo/pages/slider.js、test 用例与 README/design.md 条目。 |
| 2026-10-26 | **抽离 Drawer 的 header/footer 结构**：x-drawer 从“只有 panel+默认插槽”升级为内置三段——header（`slot="title"` 标题、缺省回落 `label` 文本 + 右上角关闭按钮）、body（默认插槽、自带内边距与滚动）、footer（`slot="footer"`）。新增 `hide-close`（Boolean 反射，默认 false 即显示关闭）控制关闭按钮；header/footer 依内容自动显隐（`__syncStructure` 配合 `slotchange` 事件与 `__slotFilled` 判断 assignedNodes；footer 有内容才贴底）。面板为 flex 列、body `flex:1` 保证 footer 天然贴底。关闭按钮改用内置 `<x-icon name=close>`（drawer 顶部 import x-icon）。**迁移 x-theme-panel**：删除自绘的 `.hd`/`.hd__close`/`.actions`，改为向 drawer 传 `slot=title`（标题块）/默认插槽（主体）/`slot=footer`（恢复默认），面板 CSS 同步清理 `.body/.hd/.hd__close/.actions`。重写 demo/pages/drawer.js（title/footer 插槽 + hide-close 演示、新增 Slots/Parts 表）与 test 用例。 |
| 2026-10-26 | **Slider 视觉精致化（参照 minimal）**：轨道去笨重描边改 `color-mix(surface+fg)` 柔和底、加粗至 10px，手柄 18→20px、白底主色描边+柔和阴影，hover 出 6px 光环、拖拽 `scale`+8px 光环+更深阴影（拖拽态用宿主非声明属性 `data-dragging` 驱动 CSS，pointerdown set/pointerup remove，不触发重渲染）；fill 改 primary→primary-hover 渐变；新增跟随手柄的**数值气泡**（.thumb 内子元素，derive 文本，hover/drag/focus 时 opacity 浮现）。首/末档不画刻度点（`__buildStops` 中 `i!==0 && i!==len-1`），中间刻度已过档转 `primary-fg` 变亮（dot 打 `data-i`、`__syncActive` 维护 `data-passed`）。 |
| 2026-10-26 | **Drawer header/footer 拆为独立组件（取代上条内置三段方案）**：按用户反馈将 header/footer 从 x-drawer 内置结构解耦为两个独立自定义元素：`<x-drawer-header>`（新建 x-drawer-header.ts/.css，feedback 分类；默认插槽放标题，`show-close`（Boolean 反射默认 false）控制右上角关闭按钮，点按钮 `closest('x-drawer')?.hide()` 回关宿主）与 `<x-drawer-footer>`（默认插槽、右对齐贴底）。x-drawer 回归为纯容器（render 只剩 scrim+panel>`<slot>`），删往 `hideClose`/`__syncStructure`/`__slotFilled`/`slotchange` 逻辑与内置 header/footer；panel CSS 改用 `::slotted` 布局：header/footer `flex:0 0 auto`，其余内容 `flex:1;min-height:0;overflow-y:auto;padding`。**去掉 header/footer 与内容之间的分隔线**（无 border-top/bottom）。关闭按钮因移到 header 且默认不渲染（无 show-close 时 `hidden`）而修复了“看不到关闭”问题。**迁移**：x-theme-panel 改为 `<x-drawer-header show-close>`/`<x-drawer-footer>` 子元素并改 `import '../drawer/index.js'`；drawer/index.ts 注册导出三件，feedback 分类导出 XDrawerHeader/XDrawerFooter。重写 demo/pages/drawer.js、test 用例、README。 |
| 2026-10-26 | **新增 Typography 排版原子组件 `x-text`**：新建 `src/components/text/`（basic 分类），把散落的标题/副标题/说明文字样式收敛为 `variant`（title/subtitle/body/caption/muted）+ `inline`（Boolean 反射）。字号/字重/颜色全部写在 `:host` 上且只消费 `--xie-font-size-*/--xie-color-fg/muted` 令牌，经扁平树继承透传到 `<slot>`，故随主题实时联动；暴露 `part="text"` 定制钩子。定位表现层排版、不占文档大纲语义。**迁移去重**：x-theme-panel 抽屉头部的 `.hd__title`/`.hd__desc`（span）改为 `<x-text variant=title/caption>`、删对应 CSS；demo/pages/drawer.js 的 title/subtitle 内联字号改用 x-text；新增 demo/pages/text.js、menu 条目、README 行。 |
| 2026-10-26 | **新增 layout 布局分类三件套 `x-flex`/`x-logo`/`x-container` + rail 单源下沉 + docs 外壳重构（dogfood）**：新建 `src/categories/layout/` 与 `src/components/{flex,logo,container}/`。`x-flex`（弹性布局原子）：`direction`/`align`/`justify`/`wrap`/`inline`/`gap`，其中 `gap` 支持令牌别名 `none/xs/sm/md/lg`（映射 `--xie-space-1..4`）或原始 CSS 长度；布局属性经命令式写宿主内联自定义属性（模板引擎不能拼 style 片段，同 x-icon），`.flex` 用 `display:contents` 仅作 `part` 钩子且不破坏 flex 项归属。`x-logo`（品牌标识）：`mark`/`title`/`subtitle` + `rail`，mark 底吃 `--xie-color-primary/-primary-fg` 随主题联动，rail 时隐藏文字、只显首字母（大写居中）。`x-container`（应用外壳）：`header`/`sidebar`/默认(主内容)/`footer` 四插槽 + `rail`/`side`/`sidebarWidth`/`railWidth`/`collapsible`，grid 布局、主内容区自身滚动；`toggleRail(force?)`/`scrollContentTop()` 方法 + `x-rail-change` 事件；header/footer 依 `slotchange`+`assignedNodes` 检测非空才显出容器（`data-header`/`data-footer`）。**rail 单源下沉**：container 为唯一源，`updated` 时 `querySelectorAll('x-logo, x-menu').forEach(el => el.rail=this.rail)`；`x-menu` 新增 `rail` 再扇出到 `x-menu-item`/`x-menu-group`（新增各自 `rail` + `.mini` 首字兼底：有 icon 显图标、无则显标签首字）。全链路用「反射布尔 + `:host([rail])` CSS」（同 `x-menu-group.collapsed` 范式），规避 Firefox 不支持的 `:host-context()`。**docs 外壳重构**：`demo/index.html` 的 `.docs-layout`(grid) 换为 `x-container`+`x-logo`，`app.js` 路由回顶改为 `shell.scrollContentTop()`、新增 `x-rail-change` 持久化到 localStorage 启动回填；`docs.css` 删除 grid/brand/sidebar/main 规则、新增 `.docs-side` 侧栏内容排布。新增 demo/pages/{flex,logo,container}.js + layout 菜单分组 + README 三行。 |
| 2026-10-27 | **抽离 Avatar 头像原子件 `x-avatar`（basic 分类）+ x-logo 复用重构**：按需求将 x-logo 的背景标识方块抽为独立组件 `src/components/avatar/`（ts/css/index 三件套），定尺寸、可圆角、带底色，内容优先级：**图片（src）> 文字（text）> 姓名首字母（name，最多两词大写）> 占位图标**；`src` 加载失败（监听 img error）自动回退不破图，回退态用信号 `__failed` 驱动显隐派生重算（不全树重渲）；`shape`（circle/rounded/square）/`color`（7 角色吃 `--xie-color-{role}/-fg` 令牌随主题联动）反射走 `:host([attr])` CSS，`size` 支持令牌别名 sm/md/lg（映射 `--xie-size-*`）或任意 CSS 长度（命令式写宿主内联 `--_sz`，同 x-flex/x-icon 范式）；无图无字时显内置 `user` 占位图标（icons.ts 新增 name→SVG，遵「先登记再消费」约定）。**x-logo 重构**：mark 方块改用 `<x-avatar shape=rounded color=primary size=26px>`，新增 `src` 属性透传给内部 x-avatar，logo 因此可直接放品牌图片（无图回退字母）；expose `part=mark` 仍指向内嵌 x-avatar。**接线**：categories/basic 入口 import 注册 + 导出 XAvatar；menu.js avatar 条目转 done + 新增 demo/pages/avatar.js（图片/文字/首字母/占位/失败回退/shape/size/color 七场景 + API 表）；logo demo 新增 src 图片标用例；README 增 Avatar 行、改 Logo 行描述。 |
| 2026-10-27 | **Drawer 快捷用法：`title` / `subtitle` 自动生成头部**：按需求为 `x-drawer` 新增 `title`/`subtitle`（String、默认 ''），不写 `<x-drawer-header>` 子元素时抽屉在 shadow 内自动渲染一个 `<x-drawer-header show-close>`（直接复用已有头部组件，`part=header`），标题走其默认插槽文本、副标题走 `subtitle` 属性；显式头部让位机制：`__hasSlottedHeader` 信号由默认插槽 `slotchange` → `assignedElements().some(tagName==='X-DRAWER-HEADER')` 维护，derive 驱动自动头部 `hidden`。**x-drawer-header** 新增 `subtitle`（String）属性，模板改 `.texts` 纵列包标题+`<x-text variant=caption part=subtitle>`（复用排版原子件而非自写 font/color；无副标题时该元素置 hidden 使高度退回单行，`.inner` 仍 `align-items:center` 以与旧版单行表现一致），并补 `:host([hidden]){display:none}`（作者样式 `display:block` 会覆盖 UA `[hidden]`，同 avatar 破图回退那个坑）。**原生 title 属性冲突处理**：`attributeChangedCallback` 拦截 `title`，把值搬进 property 后立即 `removeAttribute('title')`（否则浏览器将抽屉标题当 tooltip 浮在内容上），因此 attribute 的 null 回调不能进基类否则清空刚取的值；无障碍命名改走 `aria-label=label||title` 兼底。x-drawer 顶部新增 `import './x-drawer-header.js'` 副作用注册。同步 demo/pages/drawer.js（新增「快捷用法」卡 + API 补 title/subtitle/subtitle(header) 行 + Parts 补 header/subtitle，并将显式头部示例改为直接吃 header 的 `subtitle`、删去手拼 x-text）、README Drawer 行、test/index.html 测试台。**修正（自动头部关闭失效）**：原 `__onClose` 用 `this.closest('x-drawer')` 找宿主，但 `closest()` 不跨 shadow 边界（`parentElement` 链在 shadow root 处断），对抽屉在内部 shadow 生成的头部返回 null → 落到“自身派发 x-close”兜底分支，而 x-drawer 只在 `hide()` 里发射 x-close、并不消费，故点击无效。改抽 `__findDrawer()`：沿 `parentNode` 上溯、遇 `ShadowRoot` 时改取 `.host` 继续向上，直到碰到 `X-DRAWER`（两种用法——light DOM 显式头部 / shadow 内自动头部——均可达）。 |
| 2026-10-27 | **新增 Input 输入框 `x-input`（首个文本输入类组件）**：新建 `src/components/input/`（form 分类，categories/form 入口 import + 导出 XInput/InputType/InputVariant/InputColor/InputSize）。结构：shadow 内包一个原生 `<input>`（键盘/输入法/粘贴/type 校验全部白送）+ `.field` 负责本库观感，所以上层只绘制度、不重实现行为。**双轴正交**：`variant`=形态（outline 缺省/filled 灰底聚焦显边/flush 下划线）× `color`=语义色（6 强调角色，缺省 primary，只覆盖 `.field` 的 `--_accent`，聚焦描边+光环+光标统一消费），沿用分层变量范式；`size`=sm/md/lg 吃 `--xie-size-*`。**缺省态写基座**：遵「初始默认值不反射」约定，outline/primary/md 全写在 `:host`/`.field` 基座，属性选择器只做覆盖；`:host` 给 `width:240px` 默认尺寸兜底。**事件模型**：逐字符 `x-input`（仅通知，detail:{value}）+ 提交时机 `x-change`（原生 change：失焦/回车；可 cancelable，被 preventDefault 则 `value` 回退到 `__committed` 旧值并重写 native），程序化改 `value` 不发事件；`value` 不反射，由 `updated` 单向回写 native（同值不写，避免打断光标/输入法合成）。**能力**：`placeholder`/`disabled`/`readonly`/`required`/`clearable`（有值且非禁用只读才显出 `<x-icon name=close>` 小圆钮，点完 return focus）/`maxlength`+`show-count`（n/max 或 n）/`label`(aria-label)/`prefix`+`suffix` 插槽；`focus()`/`select()` 委派内部 input；CSS 关掉 number 步进箭头与 Edge 的 ms-reveal/ms-clear 自绘件（与本库观感不符），并补 `.clear[hidden]{display:none}`（作者 display 覆盖 UA [hidden]）。新增 demo/pages/input.js（九卡 + 全量 API）+ menu 转 done、README Input 行、test 测试台用例。**修正（输入文字字体奇怪）**：根因是库内从无字体族令牌，原生 `input` 的 `font: inherit` 只能靠页面继承链——在没设 `font-family` 的宿主页（如 test 台）退化到浏览器 UA 默认字体，与组件其余文字不一致。补 knob 旋钮 `--xie-font-family`（system-ui 中文优先栈），`x-input :host` 以 `var(--xie-font-family, inherit)` 消费：不声明时吃令牌默认值，宿主页把令牌置为 `inherit` 即跟随页面排版（var fallback 保 inherit 语义）；内部 input 的 `font: inherit` 链路不变。 |
| 2026-10-27 | **新增字体族令牌 `--xie-font-family`**：tokens.css knob 层补字体族旋钮（system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, PingFang SC, Microsoft YaHei, sans-serif），与 radius/control-height/font-size 并列为「布局类旋钮」；组件需要自带字体时用 `var(--xie-font-family, inherit)` 消费（当前仅 x-input，其余组件继续吃页面继承链），宿主页置 `--xie-font-family: inherit` 可全局让组件跟随自己的排版。 |
| 2026-10-27 | **新增五个输入组件（checkbox/radio/textarea/select/file-input）+ 引入 FCCE form 关联基建**：均归 form 分类（src/components/{checkbox,radio,textarea,select,file-input}/ 三件套 + categories/form import/export）。**新基建·FCCE**：这批组件是库内首批 Form-Associated Custom Element —— `static formAssociated = true` + 构造函数 `attachShadow({delegatesFocus:true})` + `attachInternals()`；用 `internals.setFormValue` 把值计入外层 form（name 需反射以作为 FormData 键）、`internals.setValidity` 走 `required` 原生校验、`formDisabledCallback` 随 fieldset 禁用；shadow 内的原生控件不参与外部 form，form 能力全靠宿主 internals。**Checkbox 三段式**：`x-checkbox`（原子）shadow 内包原生 `input[type=checkbox]`（appearance:none，盒子即控件，键盘/无障碍白送），勾选/三方态视觉**纯由 CSS `:checked`/`:indeterminate` 驱动**（JS 只单向回写 native.checked/indeterminate），`shape`(square/rounded/circle)×`color`(6 角色) 双轴走令牌；`x-checkbox-item` **继承** XCheckbox 复用盒体 DOM/CSS，只加 label 文字行 + “点整行切换”（`composedPath().includes(native)` 则交给原生，避免双翻）；`x-checkbox-group` 用 WeakMap 记录“下发过的属性”做**条件下沉**（只写用户未显式设置的 name/disabled/size/shape/color，不陈旧覆盖），借子项 `x-change` 可取消语义实时拦 `min`/`max`（越界 preventDefault），微任务里聚合派发 `x-change`（detail.value 为选中数组）。`toggle(force?)` 统一受控入口（native change 与外部调用同走一套可取消流程）。**Radio 三段式**：与 Checkbox 同源（去掉三方态，type=radio，圆点 CSS），关键：**跨自定义元素无法用原生同名互斥**（radio 分组只在同一渲染树内生效），故由 `x-radio-group` 在子项 `x-change` 时同步置其余 `checked=false`（程序化不再触发子项事件）；`value` 以字符串聚合。**Textarea**：x-input 的多行版（包原生 textarea），沿用逐字符 `x-input` + 失焦可取消 `x-change`；新增 `autosize`（scrollHeight 回写高度，rows 作下限 / max-rows 封顶）与 `resize`(none/vertical/both/auto)。**Select**：**包原生 `select`**（展开弹层/方向键/移动滚轮全白送）+ appearance:none + 自绘 chevron；选项两源（`options` 数组优先，否则 slotchange 读 light DOM `<option>`/`<x-select-option>` 并在 shadow 内重建 `<option>`，原始源用 `display:none` 的 `.src` 包裹仅用于读取）；`options` 走普通字段而非响应式属性（数组无法用 String/Number/Boolean 桥接）；`placeholder` 渲染为 disabled+hidden 空值项。**FileInput**：隐藏原生 `input[type=file]` + 自绘按钮触发；因安全限制 files 不可程序化写入→组件为只读输出（`files` getter + `reset()`）；选中文件逐个以 name 为键 append 进 FormData 经 setFormValue 计入 form。**图标**：icons.ts 新增 `chevron-down`（select）、`upload`（file）。均 `:host` 显式吃 `--xie-font-family`、补 `:host([hidden])`。同步：menu.js 五条转 done（新增 textarea/radio/file 条目）、新增 demo/pages/{checkbox,radio,textarea,select,file}.js、README 五处行。tsc+build 全绿（101.9 kB / gzip 21.3 kB）。 |
| 2026-10-27 | **修复（checkbox/radio group 不显示）：非 FCCE 容器漏 attachShadow**：文档页里 group 预览区空白。根因：基座 `__initialRender` 的渲染目标是 `this.shadowRoot ?? this`，`x-checkbox-group`/`x-radio-group` 未写构造函数、从未挂 shadow DOM，于是模板直接渲进 light DOM——`render()` 首句 `root.textContent=''` 把用户写在 group 里的子项全部清空，塞进的 `<slot>` 在 light DOM 中又是无意义空元素，随后 `firstUpdated` 的 `this.shadowRoot!.querySelector('slot')!` 还会抛 TypeError（FCCE 五件在构造函数里已 attachShadow 故不受影响；x-menu-group 当时就显式挂了）。修复：两个 group 补 `constructor(){ super(); this.attachShadow({mode:'open'}); }`（同 x-menu-group 范式），并删 checkbox-group firstUpdated 里误查 light DOM slot 的死代码。全库扫描确认无其他漏挂。教训：**非 FCCE 组件只要实现了 render()，必须在构造函数显式挂 shadow，否则基座会拿 this 当渲染目标毁掉宿主子树**。tsc+build 全绿（101.92 kB）。 |
