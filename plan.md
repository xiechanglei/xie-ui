# xie-ui 后续规划（plan）

> 盘点时点：2026-10-28。已完成 25 个组件（basic 6 / layout 3 / form 10 / nav 3 / feedback 5 + theme-panel），
> M0–M3 基本落地，M4 仅 menu，M5 仅文档站；包体积基线 **151.28 kB / gzip 32.55 kB**。
> 本文是下一阶段的候选规划，按「先还债、再补全、后攻坚」排序，动哪个以当期讨论为准。

## 现状快照

| 路线图 | 状态 |
| --- | --- |
| M0 地基（core/tokens/demo/button/icon） | ✅ 完成 |
| M1 基础（input/textarea/checkbox/radio/badge/avatar） | 🔶 缺 spinner、divider、space |
| M2 表单系统（form/select/switch/slider/upload + FCCE） | ✅ 完成（date-picker 未做、校验规则面窄） |
| M3 反馈与浮层（dialog/toast/tooltip/drawer） | 🔶 缺 alert、popover、dropdown、progress；焦点管理 ✅（P0-1 已做）|
| M4 导航与数据展示（menu） | 🔶 仅 menu 三件套，tabs/table 等全缺 |
| M5 工程化 | 🔶 仅文档站；无 CI / 自动化测试 / 发布流程 |

## P0 · 收尾性技术债（优先，拖越久返工越大）

### P0-1 浮层焦点管理统一策略 ✅（已完成）
- 从 toast 交付起挂账：dialog/drawer 无焦点陷阱（Tab 可跑出弹层）、关闭后不归还焦点；tooltip 无 Esc 关闭。
- `core/overlay.ts` 已有滚动锁 + Esc 栈，补齐另外一半：
  - 打开时记录来源焦点 → Tab 循环锁在面板内（首个/末个可聚焦件衔接）→ 关闭归还焦点；
  - Esc 统一经 overlay 栈判定（一次只关最上层）；
  - 一套基建 dialog / drawer 共享，popover / dropdown / date-picker / table 行内编辑全部踩在这个地基上，先行 = 后面零返工。
- **落地要点**：
  - `overlay.ts` 新增 `trapFocus(panel, scope)` / `releaseFocus(scope)`，可聚焦集合按「组合序」递归穿透 shadow
    （面板件 + slot 分布进来的 light DOM 件 + 内嵌组件 shadow 里的真实原生件），与 `document.activeElement` 用同口径
    的 deepActiveElement 比对定位首/末，故 x-button 这类「宿主包内层 button」不会漏判；
  - dialog/drawer 在 `__sync` 里随 open 幂等激活/释放（与 Esc 栈同一入口），面板补 `tabindex=-1` 作无内件套时的兑底；
  - 踩坑：dialog 面板居于 visibility 渐变的 `.scrim` 内，开浮层首帧 visibility 仍 hidden 致自动聚焦静默落空——
    修正浮层 CSS 为「开即显、关延迟隐」（visibility 不参渐变，只 opacity 渐变），dialog/drawer 同步修；
  - tooltip 补 Esc 关闭并置压制态（移开/失焦前不再重弹）；无头探针（.tmp-check/focus.html + cdp-probe.mjs）8 条断言全绿。

### P0-2 表单自定义校验规则 ✅（已完成）
- 原倾向的「声明式规则引擎」（`x-form-item.rules` + 内建 min/max/pattern + validate-on 状态机）经讨论认为与本库
  「简单化」定位相冲，**最终改为函数式 `form.validate(rules)`，非声明式规则引擎**。
- **落地要点**：
  - `validate(rules?)` 接「字段名 → 断言函数」：`(value, values) => true/undefined 通过 | 非空 string 不通过（即错误消息）`，
    第二参 `values` 为整表单聚合值→跨字段校验；结果可为 Promise；
  - **破坏性契约**：`validate()` 由 `boolean` 改 `Promise<boolean>`，`__onSubmit` 改 `await validate()` 后才派发 `x-submit`（加 `__submitting` 防重入）；
  - 流水线：手动 `error` > 控件原生 `checkValidity()`（required/type/maxlength 镜像保留）> `rules[name]`；原生失败时自定义不跑；
  - item 只加 `validate(validator?)` 可选入参 + 记住函数供实时消错 + `__seq` 防竞态 + 新信号 `__ruleMessage`，不改属性面、不回写 internals；
  - 无头 Chrome CDP 探针（.tmp-check/validation.html + cdp-validation.mjs）9 条断言全绿；gzip 33.47→33.77 kB。

## P1 · 低成本高频小件（清 M1/M3/M4 尾巴，单件半天内）

| 组件 | 分类 | 说明 |
| --- | --- | --- |
| `x-spinner` | basic | x-button 内部已有 spinner CSS，抽出即得（顺带兑现 todo-1「内置动画」） |
| `x-progress` | basic/feedback | 与 spinner 同族，条状 |
| `x-divider` | layout | M1 遗留，横/纵 + 可选文字 |
| `x-tag` | basic | 双轴范式直接套（variant × color） |
| `x-alert` | feedback | 与 toast 同源配色（实底语义色），常驻版 |
| `x-tabs` | nav | 后台三件套之一 |
| `x-accordion` | nav/layout | 折叠面板，可复用 x-menu-group 的折叠动画经验 |
| `x-breadcrumb` / `x-pagination` | nav | 配合未来 table 使用 |
| `x-popover` / `x-dropdown` | feedback | 浮层基建 + P0-1 的第一个受益者；可反哺 select 弹层的通用化 |

## P2 · 攻坚件（先纸面设计、后开发——沿用 x-form「先讨论后写」的成功经验）

### P2-1 table（todo.md 第 4 条）
- 全库最复杂组件，动手前先钉死设计决策：
  - 数据驱动（`columns` + `rows` 属性）还是 slot 驱动（`x-table-column` / `<tr>`）？（库内先例：select 两源并存）
  - 排序 / 筛选 / 分页：受控 or 非受控？
  - 固定列、虚拟滚动：建议 v1 不做虚拟滚动（后台千行内可接受），留接口；
  - 行内编辑依赖 P0-2 校验引擎。

### P2-2 date-picker（todo.md 第 5 条）
- 结论倾向：**短期包原生 `input[type=date]`**——零体积、键盘 / 本地化 / 无障碍全白送，
  与 select 当初包原生 select 同一哲学；仅当观感不可接受时才自绘日历面板
  （面板 + 键盘导航 + locale 成本全库最高，不值当为单组件付）。

## P3 · 工程化（M5，决定「别人能不能用」）

- **自动化测试**：把历轮会话手写的无头探针固化成 CI 可跑的 e2e（headless Chrome 脚本 + 断言清单），
  每组件保 3–5 条核心交互断言，防回归。注意既有约束：effect 微任务语义（写后等一拍再读）、
  dist 缓存需 cache-buster。
- **CI**：lint + tsc + build + e2e 一条龙。
- **体积护栏**：size-limit 进 CI，gzip 预算设线（基线 32.55 kB），防无意识膨胀。
- **发布**：semver 流程，P0 + 部分 P1 完成后发第一个 beta，拿真实项目试吃。
- **React wrapper**：`createElement`/`defineComponent` 一行封装（体积成本极低），Web Components 框架中立红利所在。
- **VSCode Web Tags 自定义数据**（custom-data），提升消费者体验。

## P4 · docs 反哺（对应 todo.md 第 2、3、7 条）

- **菜单 icon（todo-3）**：应用级 icon 放 demo 代码、不进库（符合「图标只收库内实际用到的」登记策略），顺手可做。
- **loadMenuMode（todo-2）**：建议**不做进库**——路由/菜单生成器属应用层，与本库「简单化、不做框架」定位冲突；
  可抽成独立 `xie-ui-admin` 模板包或直接写在 docs 层。
- **menu 默认展开态（todo-7）**：给 `x-menu-group` 补 `default-open`（或受控 `collapsed` + 事件），小修。
- 远期：文档站组件 playground（可编辑实时预览）。

## 建议节奏

```
P0（焦点管理 → 校验引擎）
  → P1 挑高频（spinner / tabs / popover / tag）
    → 发 beta 真实项目试吃
      → 期间纸面设计 table（P2-1）
  P3（测试 + CI）随 beta 前跟上；P4 随任意一轮顺手带上
```

> 本文件与 [design.md](./design.md#7-组件路线图分期) 的原始路线图互补：design.md 记「承诺过的分期」，
> plan.md 记「当下讨论出的优先序与决策倾向」。动手前以最新讨论为准。
