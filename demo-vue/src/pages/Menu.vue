<script setup lang="ts">
// Menu 菜单：三件套（x-menu / x-menu-group / x-menu-item）。
// 「基础用法」x-select 回显由 :setup 实现；其余（备注/图标/折叠/窄栏）为静态。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

const BASIC_SOURCE = `<x-menu id="menu-demo" style="max-width: 220px">
  <x-menu-group label="概览" collapsible>
    <x-menu-item value="dash">仪表盘</x-menu-item>
    <x-menu-item value="report">报表</x-menu-item>
  </x-menu-group>
  <x-menu-group label="管理" collapsible>
    <x-menu-item value="user">用户</x-menu-item>
    <x-menu-item value="role">角色</x-menu-item>
  </x-menu-group>
</x-menu>
<span id="menu-status" style="margin-left: 16px; color: var(--xie-color-muted)">未选择</span>`;

const setupMenuSelect = (root: HTMLElement) => {
  const m = root.querySelector('#menu-demo');
  const status = root.querySelector('#menu-status');
  if (!m) return;
  m.addEventListener('x-select', (e) => {
    const val = (e as CustomEvent<{ value: string }>).detail.value;
    if (status) status.textContent = '已选择：' + val;
  });
};

// API · x-menu
const MENU_PROPS_ROWS = [
  ['value', '当前选中项的 value（反射）', 'string', "''"],
  ['rail', '窄栏态：扇出给后代项/分组，隐藏文字改显图标或首字（反射；通常由 x-container 下沉）', 'boolean', 'false'],
];
const MENU_MEMBERS_ROWS = [
  ['select(value)', '命令式选中某项（会派发 x-select）'],
  ['x-select', '选中项变化时派发（composed，仅用户交互 / select() 触发），detail:{ value }'],
];
// API · x-menu-group
const GROUP_PROPS_ROWS = [
  ['label', '分组标题', 'string', "''"],
  ['collapsible', '是否可折叠（默认 false，需显式开启）', 'boolean', 'false'],
  ['collapsed', '当前是否折叠（反射，驱动动画）', 'boolean', 'false'],
  ['rail', '窄栏态：头部仅显图标或首字（由 x-menu 扇出）', 'boolean', 'false'],
];
const GROUP_MEMBERS_ROWS = [
  ['toggle(force?)', '展开/收起（仅 collapsible 时生效）'],
  ['x-toggle', '折叠切换时派发，detail:{ collapsed }'],
  ['slot=icon / (默认)', '分组标题图标 / 分组内容（菜单项、嵌套分组）'],
  ['part', 'group / header / label / mini / indicator / content / content-inner'],
];
// API · x-menu-item
const ITEM_PROPS_ROWS = [
  ['value', '唯一标识（选中匹配用，反射）', 'string', "''"],
  ['note', '右侧备注文本（也可用 slot=note 覆盖）', 'string', "''"],
  ['disabled', '是否禁用（不可点击、跳过 Tab）', 'boolean', 'false'],
  ['active', '是否选中（由 x-menu 维护，反射）', 'boolean', 'false'],
  ['rail', '窄栏态：隐藏文字与备注，有图标显图标、无图标显首字徽标（由 x-menu 扇出）', 'boolean', 'false'],
];
const ITEM_MEMBERS_ROWS = [
  ['slot=(默认)', '菜单项文本'],
  ['slot=icon', '菜单项图标（缺省不占位）'],
  ['slot=note', '自定义备注徽标（替代 note 属性）'],
  ['part', 'base / label / note / mini'],
];
</script>

<template>
  <div>
    <h1>Menu 菜单</h1>
    <p class="lead">导航菜单三件套：<code>&lt;x-menu&gt;</code> 负责单选协调，<code>&lt;x-menu-group&gt;</code> 是可折叠的分类/子菜单，<code>&lt;x-menu-item&gt;</code> 是可选中/禁用的菜单项。左侧文档栏即用它构建。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-menu*</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="分组 + 菜单项，点击项由 x-menu 统一单选并派发 x-select"
      :column="true"
      :source="BASIC_SOURCE"
      :script='`
const m = document.querySelector("#menu-demo");
m.addEventListener("x-select", (e) => console.log("已选择", e.detail.value));
`'
      :setup="setupMenuSelect"
    />

    <Demo
      title="备注与禁用"
      desc="note 显示右侧备注徽标；disabled 让该项不可点击"
      :column="true"
      :source='`
<x-menu style="max-width: 220px">
  <x-menu-group label="版本" collapsible>
    <x-menu-item value="pro" note="beta">专业版</x-menu-item>
    <x-menu-item value="ent" note="推荐">企业版</x-menu-item>
    <x-menu-item value="old" note="规划中" disabled>旧版入口</x-menu-item>
  </x-menu-group>
</x-menu>
`'
    />

    <Demo
      title='图标'
      desc='slot="icon" 放图标（此处用 emoji，实际可放 SVG）'
      :column="true"
      :source='`
<x-menu style="max-width: 220px">
  <x-menu-group label="导航" collapsible>
    <x-menu-item value="home"><span slot="icon">🏠</span>首页</x-menu-item>
    <x-menu-item value="bell" note="3"><span slot="icon">🔔</span>通知</x-menu-item>
    <x-menu-item value="gear"><span slot="icon">⚙️</span>设置</x-menu-item>
  </x-menu-group>
</x-menu>
`'
    />

    <Demo
      title="折叠与子菜单"
      desc="分组 collapsible 可折叠（带高度动画）；collapsed 初始折叠；组内再嵌 x-menu-group 即为子菜单"
      :column="true"
      :source='`
<x-menu style="max-width: 240px">
  <x-menu-group label="默认展开" collapsible>
    <x-menu-item value="a1">项目 A</x-menu-item>
    <x-menu-item value="a2">项目 B</x-menu-item>
  </x-menu-group>
  <x-menu-group label="默认折叠" collapsible collapsed>
    <x-menu-item value="b1">隐藏项</x-menu-item>
  </x-menu-group>
  <x-menu-group label="含子菜单" collapsible>
    <x-menu-item value="c1">普通项</x-menu-item>
    <x-menu-group label="子菜单">
      <x-menu-item value="c2">孙子项 1</x-menu-item>
      <x-menu-item value="c3">孙子项 2</x-menu-item>
    </x-menu-group>
  </x-menu-group>
</x-menu>
`'
    />

    <Demo
      title="窄栏态（rail）"
      desc="rail 时隐藏文字：有图标显图标、无图标兜底显标签首字（一般由 x-container 折叠侧栏自动下沉）"
      :column="true"
      :source='`
<x-menu rail style="width: 68px; border: 1px dashed var(--xie-color-border); border-radius: 8px">
  <x-menu-group label="导航" collapsible>
    <x-menu-item value="home"><span slot="icon">🏠</span>首页</x-menu-item>
    <x-menu-item value="bell"><span slot="icon">🔔</span>通知</x-menu-item>
    <x-menu-item value="set">设置</x-menu-item>
    <x-menu-item value="data">报表</x-menu-item>
  </x-menu-group>
</x-menu>
`'
    />

    <h2>说明</h2>
    <p>键盘导航当前支持 Tab 聚焦 + Enter/Space 触发（内部用原生 button/role=menuitem）。配色/圆角/折叠动画均消费全局主题令牌，随明暗与主色实时联动。<code>rail</code> 通常不手写，而由父级 <code>x-container</code> 在侧栏折叠时下沉给 <code>x-menu</code>，再由菜单扇出到每个分组/项。</p>

    <h2>API · x-menu</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="MENU_PROPS_ROWS" />
    <ApiTable title="方法 / 事件" :columns="['名称', '说明']" :rows="MENU_MEMBERS_ROWS" />

    <h2>API · x-menu-group</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="GROUP_PROPS_ROWS" />
    <ApiTable title="方法 / 事件 / 插槽 / Part" :columns="['名称', '说明']" :rows="GROUP_MEMBERS_ROWS" />

    <h2>API · x-menu-item</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="ITEM_PROPS_ROWS" />
    <ApiTable title="插槽 / Part" :columns="['名称', '说明']" :rows="ITEM_MEMBERS_ROWS" />
  </div>
</template>
