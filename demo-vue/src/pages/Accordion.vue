<script setup lang="ts">
// Accordion 折叠面板：两件套（x-accordion / x-accordion-item）。
// 「多项同开 multiple」监听 x-change 回显展开列表，由 :setup 实现；其余（基础/禁用/复杂标题）为静态。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

const MULTI_SOURCE = `<x-accordion multiple style="width: 100%">
  <x-accordion-item value="q1" label="第一节" expanded>
    <div style="line-height: 1.7">可以同时展开多节内容。</div>
  </x-accordion-item>
  <x-accordion-item value="q2" label="第二节">
    <div style="line-height: 1.7">彼此独立、互不影响。</div>
  </x-accordion-item>
  <x-accordion-item value="q3" label="第三节">
    <div style="line-height: 1.7">再点标题即可折叠。</div>
  </x-accordion-item>
</x-accordion>
<div id="acc-status" style="margin-top: 8px; color: var(--xie-color-muted)">展开：q1</div>`;

const setupAccordionChange = (root: HTMLElement) => {
  const a = root.querySelector('x-accordion');
  const status = root.querySelector('#acc-status');
  if (!a || !status) return;
  a.addEventListener('x-change', (e) => {
    const values = (e as CustomEvent<{ values: string[] }>).detail.values;
    status.textContent = '展开：' + values.join(', ');
  });
};

// API · x-accordion
const ACC_PROPS_ROWS = [
  ['multiple', '允许多项同时展开（反射）：缺省 false = 手风琴单开互斥', 'boolean', 'false'],
];
const ACC_MEMBERS_ROWS = [
  ['getValues()', '返回当前所有展开项的 value 数组'],
  ['x-change', '用户切换某项后派发（bubbles+composed），detail:{ value, expanded, values }'],
  ['part', 'accordion'],
];
// API · x-accordion-item
const ITEM_PROPS_ROWS = [
  ['value', '关联键（反射）：供协调与 x-change 回报', 'string', "''"],
  ['label', '标题文本（不反射）：快捷路径，单行省略；被 slot="header" 内容覆盖', 'string', "''"],
  ['expanded', '展开态（反射）：驱动 grid 0fr↔1fr 高度动画', 'boolean', 'false'],
  ['disabled', '禁用（反射）：标题栏不可点', 'boolean', 'false'],
];
const ITEM_MEMBERS_ROWS = [
  ['toggle(force?, fromUser?)', '展开/收起；fromUser=false 时不派发内部事件（供根静默收拢旁项）'],
  ['slot=(默认)', '可折叠内容'],
  ['slot=header', '自定义标题区任意内容（多行/两栏/图标徽标等）：样式由使用方自控，优先于 label；前置图标也在其中自己摆'],
  ['part', 'item / header / main / indicator / content / content-inner'],
];
</script>

<template>
  <div>
    <h1>Accordion 折叠面板</h1>
    <p class="lead">折叠面板两件套：<code>&lt;x-accordion&gt;</code> 协调「单开互斥」，<code>&lt;x-accordion-item&gt;</code> 是一块「标题栏 + 可折叠内容」，展开收起带高度自适应动画。常用于 FAQ、设置分组。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-accordion / x-accordion-item</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="单开互斥：展开一项自动收起其余；点标题栏切换"
      :column="true"
      :source='`
<x-accordion style="width: 100%">
  <x-accordion-item value="q1" label="什么是 xie-ui？" expanded>
    <div style="line-height: 1.7">一套零依赖的原生 Web Components UI 组件库，标签即用、主题走 CSS 自定义属性。</div>
  </x-accordion-item>
  <x-accordion-item value="q2" label="需要框架吗？">
    <div style="line-height: 1.7">不需要。任何能渲染 HTML 的环境都能用，React/Vue 里当作普通标签写即可。</div>
  </x-accordion-item>
  <x-accordion-item value="q3" label="如何换主题？">
    <div style="line-height: 1.7">改根上的 --xie-color-* 令牌即可全局联动明暗与主色。</div>
  </x-accordion-item>
</x-accordion>
`'
    />

    <Demo
      title="多项同开（multiple）"
      desc="x-accordion 加 multiple 后取消互斥，可同时展开多项；监听 x-change 拿展开列表"
      :column="true"
      :source="MULTI_SOURCE"
      :script='`
const acc = document.querySelector("x-accordion");
acc.addEventListener("x-change", (e) => {
  console.log(e.detail.value, e.detail.expanded, e.detail.values);
  status.textContent = "展开：" + e.detail.values.join(", ");
});
`'
      :setup="setupAccordionChange"
    />

    <Demo
      title="禁用态"
      desc="item disabled 让该项不可展开；图标不设专用插槽——需要前置图标就在 slot=&quot;header&quot; 内容里自己摆（见下「复杂标题」例）"
      :column="true"
      :source='`
<x-accordion style="width: 100%">
  <x-accordion-item value="p1" label="个人资料">
    <div style="line-height: 1.7">账号头像、昵称等。</div>
  </x-accordion-item>
  <x-accordion-item value="p2" label="安全设置">
    <div style="line-height: 1.7">密码、两步验证。</div>
  </x-accordion-item>
  <x-accordion-item value="p3" label="实验特性（暂不可用）" disabled>
    <div style="line-height: 1.7">敬请期待。</div>
  </x-accordion-item>
</x-accordion>
`'
    />

    <Demo
      title="复杂标题（slot=&quot;header&quot;）"
      desc="标题是复杂呈现元素时（多行/左右两栏/图标徽标），直接放任意元素到 slot=&quot;header&quot;：light DOM 样式自控，组件只保证占满弹性区；传入后 label 被覆盖"
      :column="true"
      :source='`
<x-accordion style="width: 100%">
  <x-accordion-item value="o1" expanded>
    <div slot="header" style="display: flex; align-items: center; gap: 12px; width: 100%">
      <span style="flex: 0 0 auto; font-size: 18px">📦</span>
      <div style="flex: 1 1 auto; min-width: 0">
        <div style="font-weight: 500">订单 #1024</div>
        <div style="font-size: 12px; color: var(--xie-color-muted)">2026-10-28 12:30 · 3 件商品</div>
      </div>
      <span style="flex: 0 0 auto; color: var(--xie-color-success)">已发货</span>
    </div>
    <div style="line-height: 1.7">顺丰 SF1234567890，预计明天送达。</div>
  </x-accordion-item>
  <x-accordion-item value="o2">
    <div slot="header" style="display: flex; align-items: center; gap: 12px; width: 100%">
      <span style="flex: 0 0 auto; font-size: 18px">💰</span>
      <div style="flex: 1 1 auto; min-width: 0">
        <div style="font-weight: 500">订单 #1023</div>
        <div style="font-size: 12px; color: var(--xie-color-muted)">2026-10-27 09:12 · 3 件商品</div>
      </div>
      <span style="flex: 0 0 auto; color: var(--xie-color-warning)">待付款</span>
    </div>
    <div style="line-height: 1.7">等待买家付款，24 小时后自动关闭。</div>
  </x-accordion-item>
  <x-accordion-item value="o3">
    <div slot="header" style="display: flex; align-items: center; gap: 12px; width: 100%">
      <span style="flex: 0 0 auto; font-size: 18px">✅</span>
      <div style="flex: 1 1 auto; min-width: 0">
        <div style="font-weight: 500">订单 #1019</div>
        <div style="font-size: 12px; color: var(--xie-color-muted)">2026-10-20 18:45 · 3 件商品</div>
      </div>
      <span style="flex: 0 0 auto; color: var(--xie-color-muted)">已完成</span>
    </div>
    <div style="line-height: 1.7">交易完成，可进行评价。</div>
  </x-accordion-item>
</x-accordion>
`'
    />

    <h2>说明</h2>
    <p>标题区两段式：简单场景写 <code>label</code> 属性即可；复杂呈现放 <code>slot="header"</code>，组件不再对其施加单行省略等约束。折叠动画复用 <code>x-menu-group</code> 同款 grid <code>0fr↔1fr</code> 技巧，内容高度自适应、无需 JS 量测。<code>x-accordion-item</code> 也可脱离根容器单独使用（自管 <code>expanded</code>）；放进 <code>x-accordion</code> 时才享受单开互斥与统一的 <code>x-change</code>。程序化改 <code>item.expanded</code>（非点击）不触发互斥与事件，避免回环。</p>

    <h2>API · x-accordion</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="ACC_PROPS_ROWS" />
    <ApiTable title="方法 / 事件 / Part" :columns="['名称', '说明']" :rows="ACC_MEMBERS_ROWS" />

    <h2>API · x-accordion-item</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="ITEM_PROPS_ROWS" />
    <ApiTable title="方法 / 插槽 / Part" :columns="['名称', '说明']" :rows="ITEM_MEMBERS_ROWS" />
  </div>
</template>
