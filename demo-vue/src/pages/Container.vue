<script setup lang="ts">
// Container 应用外壳：sidebar 折叠为 rail（联动 logo/menu）、side 方位、自定义宽度、内置钮关闭。
// 基础/右置/宽度三例为静态（内置折叠钮由组件自身处理）；「关掉内置钮」例的宿主折叠钮由 :setup 调 toggleRail()。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

const setupHostToggle = (root: HTMLElement) => {
  const contEl = root.querySelector('#cont-demo');
  if (!contEl) return;
  const cont = contEl as unknown as { toggleRail: (force?: boolean) => void };
  const status = root.querySelector('#cont-status');
  root.querySelector('#cont-btn')?.addEventListener('click', () => cont.toggleRail());
  contEl.addEventListener('x-rail-change', (e) => {
    const rail = (e as CustomEvent<{ rail: boolean }>).detail.rail;
    if (status) status.textContent = rail ? '侧栏已折叠为窄栏（rail=true）' : '侧栏已展开（rail=false）';
  });
};

// 外壳内层（渲染 == 展示源码，反复复用）
const SHELL_STYLE = 'style="height: 320px; border: 1px solid var(--xie-color-border); border-radius: 10px; overflow: hidden"';
const SIDEBAR = `
    <div slot="sidebar" style="display: flex; flex-direction: column; gap: 6px; padding: 12px 0; min-width: 0">
      <x-logo mark="X" title="控制台" subtitle="Admin" style="padding: 2px 16px 10px"></x-logo>
      <x-menu>
        <x-menu-group label="概览" collapsible>
          <x-menu-item value="dash">仪表盘</x-menu-item>
          <x-menu-item value="stat">数据统计</x-menu-item>
        </x-menu-group>
        <x-menu-group label="管理" collapsible>
          <x-menu-item value="user">用户</x-menu-item>
          <x-menu-item value="set">设置</x-menu-item>
        </x-menu-group>
      </x-menu>
    </div>`;
const MAIN = `
    <div style="padding: 24px; min-height: 100%">
      <h3 style="margin: 0 0 8px">主内容区</h3>
      <p style="margin: 0; color: var(--xie-color-muted)">点侧栏右下角骑跨分隔线的小钮折叠侧栏：logo 只剩首字母、菜单项文字隐去。</p>
    </div>`;

const CONT_BASIC = `<x-container collapsible ${SHELL_STYLE}>${SIDEBAR}${MAIN}\n</x-container>`;
const CONT_RIGHT = `<x-container side="right" collapsible ${SHELL_STYLE}>${SIDEBAR}${MAIN}\n</x-container>`;
const CONT_WIDTH = `<x-container collapsible sidebar-width="220px" ${SHELL_STYLE}>${SIDEBAR}${MAIN}\n</x-container>`;
const CONT_HOST = `<x-container id="cont-demo" collapsible="false" ${SHELL_STYLE}>${SIDEBAR}${MAIN}\n</x-container>\n<x-button id="cont-btn" size="sm" style="margin-top: 12px">宿主自己的折叠钮</x-button>\n<span id="cont-status" style="margin-left: 12px; font-size: 13px; color: var(--xie-color-muted)">rail=false</span>`;

// API 表数据（严格对齐 src/components/container/x-container.ts）
const CONT_PROPS_ROWS = [
  ['rail', '侧栏是否折叠为窄栏（下沉给 logo/menu）', 'boolean', 'false'],
  ['side', '侧栏方位', "'left' | 'right'", "'left'"],
  ['sidebar-width', '侧栏展开宽度（property sidebarWidth）', 'CSS 长度', "'260px'"],
  ['rail-width', '侧栏折叠宽度（property railWidth）', 'CSS 长度', "'68px'"],
  ['collapsible', '是否显内置折叠按钮；写 "false" 即关（只影响按钮显隐，rail/toggleRail() 仍可用）', 'boolean', 'true'],
];
const CONT_METHODS_ROWS = [
  ['toggleRail(force?)', '切换侧栏折叠；force 可显式指定目标态'],
  ['scrollContentTop()', '主内容区滚动回顶部'],
];
const CONT_EVENTS_ROWS = [['x-rail-change', '折叠态变化时触发（供外部持久化）', '{ rail }']];
const CONT_SLOTS_ROWS = [
  ['header', '顶部区（存在才渲染）'],
  ['sidebar', '侧栏（放 x-logo + x-menu 等）'],
  ['(默认)', '主内容区（自身滚动）'],
  ['footer', '底部区（存在才渲染）'],
];
const CONT_PARTS_ROWS = [
  ['base', '整体网格容器'],
  ['header', '顶部容器'],
  ['sidebar', '侧栏容器'],
  ['main', '主内容容器'],
  ['footer', '底部容器'],
  ['rail-toggle', '内置折叠按钮'],
];
</script>

<template>
  <div>
    <h1>Container 布局容器</h1>
    <p class="lead">面向后台常见的「侧栏 + 内容」应用外壳：可选 header、sidebar 侧栏、默认主内容、可选 footer。侧栏可折叠为窄栏（rail），rail 由容器单源下沉给 x-logo 与 x-menu，驱动它们各自的窄栏形态。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-container</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo title="基础外壳（左侧栏 + 可折叠）" desc="sidebar 放 x-logo + x-menu，点内置小钮折叠" :column="true" :source="CONT_BASIC" />
    <Demo title="侧栏在右" desc='side="right"' :column="true" :source="CONT_RIGHT" />
    <Demo title="自定义侧栏宽度" desc='sidebar-width="220px"' :column="true" :source="CONT_WIDTH" />

    <Demo
      title="不要内置折叠钮：collapsible=&quot;false&quot;"
      desc="布尔属性除「出现即真」还认字面量假值：collapsible=&quot;false&quot; 即隐藏小钮；折叠能力没消失，用 rail 属性或 toggleRail() 由宿主自己接管"
      :column="true"
      :source="CONT_HOST"
      :script='`
const cont = document.querySelector("#cont-demo");
document.querySelector("#cont-btn").addEventListener("click", () => cont.toggleRail());
cont.addEventListener("x-rail-change", (e) => console.log("rail =", e.detail.rail));
`'
      :setup="setupHostToggle"
    />

    <p>交互：容器底部内置折叠按钮（<code>collapsible</code> 时显示），点击切换 rail 并派发 <code>x-rail-change</code>。rail 会被容器下沉给子树里的 <code>x-logo</code> 与 <code>x-menu</code>，菜单再扇出到每一项。选中态仍由 <code>x-menu</code> 负责，容器不含路由/菜单逻辑。</p>

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="CONT_PROPS_ROWS" />
    <ApiTable title="方法 Methods" :columns="['方法', '说明']" :rows="CONT_METHODS_ROWS" />
    <ApiTable title="事件 Events" :columns="['事件', '说明', '回调参数']" :rows="CONT_EVENTS_ROWS" />
    <ApiTable title="插槽 Slots" :columns="['插槽', '说明']" :rows="CONT_SLOTS_ROWS" />
    <ApiTable title="CSS 部分 Part" :columns="['part', '说明']" :rows="CONT_PARTS_ROWS" />
  </div>
</template>
