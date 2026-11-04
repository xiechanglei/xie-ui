<script setup lang="ts">
// Tabs 标签页：三件套（x-tabs / x-tab / x-tab-panel）。
// 「监听切换事件」x-select 回显由 :setup 实现；其余（基础/禁用/形态/尺寸/纵向/混排）为静态。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

const EVENT_SOURCE = `<x-tabs id="tabs-demo" value="a" style="width: 100%">
  <x-tab value="a">标签一</x-tab>
  <x-tab value="b">标签二</x-tab>
  <x-tab value="c">标签三</x-tab>
  <x-tab-panel value="a"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-top: 0; border-radius: 0 0 8px 8px">第一个面板</div></x-tab-panel>
  <x-tab-panel value="b"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-top: 0; border-radius: 0 0 8px 8px">第二个面板</div></x-tab-panel>
  <x-tab-panel value="c"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-top: 0; border-radius: 0 0 8px 8px">第三个面板</div></x-tab-panel>
</x-tabs>
<div id="tabs-status" style="margin-top: 8px; color: var(--xie-color-muted)">当前：a</div>`;

const setupTabsSelect = (root: HTMLElement) => {
  const t = root.querySelector('#tabs-demo');
  const status = root.querySelector('#tabs-status');
  if (!t) return;
  t.addEventListener('x-select', (e) => {
    const val = (e as CustomEvent<{ value: string }>).detail.value;
    if (status) status.textContent = '当前：' + val;
  });
};

// API · x-tabs
const TABS_PROPS_ROWS = [
  ['value', '当前选中标签的 value（反射）；缺省自动选第一张未禁用的 tab', 'string', "''"],
  ['fill', '等分铺满：所有 tab 平分卡条宽度（反射）', 'boolean', 'false'],
  ['variant', '形态（反射）', "'underline' | 'pills' | 'segmented'", "'underline'"],
  ['size', '尺寸（反射）：统一控制各 tab 内边距与字号', "'sm' | 'md' | 'lg'", "'md'"],
  ['orientation', '排列方向（反射）：纵排时卡条成列、面板在右', "'horizontal' | 'vertical'", "'horizontal'"],
];
const TABS_MEMBERS_ROWS = [
  ['select(value)', '命令式切换（会派发 x-select）'],
  ['x-select', '切换选中时派发（bubbles+composed），detail:{ value }'],
  ['part', 'tablist / panels'],
];
const TAB_PROPS_ROWS = [
  ['value', '关联键（反射）：与同名 x-tab-panel 配对', 'string', "''"],
  ['disabled', '禁用（反射）：不可点、不参与键盘漫游', 'boolean', 'false'],
  ['active', '选中态（反射）：由 x-tabs 回写，驱动高亮 + aria-selected', 'boolean', 'false'],
];
const TAB_PANEL_PROPS_ROWS = [
  ['value', '关联键（反射）：对应 x-tab 的 value；显隐由 x-tabs 按当前值挂/摘 hidden', 'string', "''"],
];
</script>

<template>
  <div>
    <h1>Tabs 标签页</h1>
    <p class="lead">标签页三件套：<code>&lt;x-tabs&gt;</code> 负责单选协调与键盘漫游，<code>&lt;x-tab&gt;</code> 是选项卡，<code>&lt;x-tab-panel&gt;</code> 是与同名 tab 配对的面板。支持 variant（下划线/药丸/分段）、size、orientation（横排/纵排），tab 内可混排图标与标签。切换即派发 <code>x-select</code>。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-tabs / x-tab / x-tab-panel</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="tab 与 panel 按 value 配对；点某张即显示对应面板"
      :column="true"
      :source='`
<x-tabs style="width: 100%">
  <x-tab value="a">账号</x-tab>
  <x-tab value="b">订单</x-tab>
  <x-tab value="c">设置</x-tab>
  <x-tab-panel value="a"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-top: 0; border-radius: 0 0 8px 8px">账号设置内容</div></x-tab-panel>
  <x-tab-panel value="b"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-top: 0; border-radius: 0 0 8px 8px">订单列表内容</div></x-tab-panel>
  <x-tab-panel value="c"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-top: 0; border-radius: 0 0 8px 8px">系统设置内容</div></x-tab-panel>
</x-tabs>
`'
    />

    <Demo
      title="监听切换事件"
      desc="x-select 携带当前 value；也可用 value 属性程序化切换（不派发，避免回环）"
      :column="true"
      :source="EVENT_SOURCE"
      :script='`
const tabs = document.querySelector("#tabs-demo");
tabs.addEventListener("x-select", (e) => console.log(e.detail.value));
tabs.value = "b"; // 程序化切换：同步高亮/显隐，但不派发 x-select
`'
      :setup="setupTabsSelect"
    />

    <Demo
      title="禁用与等分"
      desc="tab disabled 不可点且键盘跳过；x-tabs fill 让各 tab 平分宽度"
      :column="true"
      :source='`
<x-tabs fill style="width: 100%">
  <x-tab value="a">可用</x-tab>
  <x-tab value="b" disabled>禁用</x-tab>
  <x-tab value="c">也可用</x-tab>
  <x-tab-panel value="a"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-top: 0">A</div></x-tab-panel>
  <x-tab-panel value="c"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-top: 0">C</div></x-tab-panel>
</x-tabs>
`'
    />

    <Demo
      title="形态 · 药丸 pills"
      desc='variant="pills"：选中项为主色实心反色白字；圆角跟随全局主题圆角旋钮'
      :column="true"
      :source='`
<x-tabs variant="pills" style="width: 100%">
  <x-tab value="a">首页</x-tab>
  <x-tab value="b">订单</x-tab>
  <x-tab value="c">设置</x-tab>
  <x-tab-panel value="a"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-radius: 8px">首页内容</div></x-tab-panel>
  <x-tab-panel value="b"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-radius: 8px">订单内容</div></x-tab-panel>
  <x-tab-panel value="c"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-radius: 8px">设置内容</div></x-tab-panel>
</x-tabs>
`'
    />

    <Demo
      title="形态 · 分段器 segmented"
      desc='variant="segmented"：整组装进淡色轨道，选中项为浮起的白底小块（类 iOS 分段控件）'
      :column="true"
      :source='`
<x-tabs variant="segmented" fill style="width: 320px">
  <x-tab value="a">日</x-tab>
  <x-tab value="b">周</x-tab>
  <x-tab value="c">月</x-tab>
  <x-tab-panel value="a"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-radius: 8px">按日统计</div></x-tab-panel>
  <x-tab-panel value="b"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-radius: 8px">按周统计</div></x-tab-panel>
  <x-tab-panel value="c"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-radius: 8px">按月统计</div></x-tab-panel>
</x-tabs>
`'
    />

    <Demo
      title="尺寸 size"
      desc='size="sm | md | lg" 统一控制各 tab 的内边距与字号（md 为缺省）'
      :column="true"
      :source='`
<x-tabs variant="pills" size="sm" style="margin-bottom: 8px">
  <x-tab value="a">标签</x-tab>
  <x-tab value="b">选项</x-tab>
  <x-tab-panel value="a"><div style="padding: 8px 0; color: var(--xie-color-muted)">sm 尺寸内容</div></x-tab-panel>
</x-tabs>
<x-tabs variant="pills" size="md" style="margin-bottom: 8px">
  <x-tab value="a">标签</x-tab>
  <x-tab value="b">选项</x-tab>
  <x-tab-panel value="a"><div style="padding: 8px 0; color: var(--xie-color-muted)">md 尺寸内容</div></x-tab-panel>
</x-tabs>
<x-tabs variant="pills" size="lg">
  <x-tab value="a">标签</x-tab>
  <x-tab value="b">选项</x-tab>
  <x-tab-panel value="a"><div style="padding: 8px 0; color: var(--xie-color-muted)">lg 尺寸内容</div></x-tab-panel>
</x-tabs>
`'
    />

    <Demo
      title="纵向排列 vertical"
      desc='orientation="vertical"：卡条成列居左、面板在右；键盘改用 ↑↓ 漫游'
      :column="true"
      :source='`
<x-tabs orientation="vertical" variant="pills" style="width: 100%">
  <x-tab value="a"><x-icon name="user"></x-icon> 资料</x-tab>
  <x-tab value="b"><x-icon name="settings"></x-icon> 设置</x-tab>
  <x-tab value="c"><x-icon name="info"></x-icon> 关于</x-tab>
  <x-tab-panel value="a"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-radius: 8px">个人资料</div></x-tab-panel>
  <x-tab-panel value="b"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-radius: 8px">账号设置</div></x-tab-panel>
  <x-tab-panel value="c"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-radius: 8px">关于本站</div></x-tab-panel>
</x-tabs>
`'
    />

    <Demo
      title="标签内混排图标 / 标签"
      desc="每张 x-tab 的默认插槽可放任意内容：图标随选中态变色，x-tag / x-badge 保留自身配色，间距由组件自动给足"
      :column="true"
      :source='`
<x-tabs style="width: 100%">
  <x-tab value="a"><x-icon name="check-circle"></x-icon> 已完成</x-tab>
  <x-tab value="b">收件箱 <x-tag size="sm" color="primary" round>3</x-tag></x-tab>
  <x-tab value="c"><x-icon name="settings"></x-icon> 设置 <x-tag size="sm" color="warning" round>Beta</x-tag></x-tab>
  <x-tab-panel value="a"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-top: 0">已完成任务</div></x-tab-panel>
  <x-tab-panel value="b"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-top: 0">收件箱消息</div></x-tab-panel>
  <x-tab-panel value="c"><div style="padding: 16px; border: 1px solid var(--xie-color-border); border-top: 0">系统设置</div></x-tab-panel>
</x-tabs>
`'
    />

    <h2>说明</h2>
    <p>无障碍：tablist / tab / tabpanel 三角色齐备，roving tabindex（仅选中项 Tab 可达），方向键按 <code>orientation</code> 限定（横排 ←→、纵排 ↑↓）/ Home / End 在未禁用 tab 间漫游并即时选中。面板切走仅 <code>display:none</code>、内容状态不丢；需「切走即销毁」请自行监听 <code>x-select</code> 处理。</p>

    <h2>API · x-tabs</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="TABS_PROPS_ROWS" />
    <ApiTable title="方法 / 事件 / Part" :columns="['名称', '说明']" :rows="TABS_MEMBERS_ROWS" />

    <h2>API · x-tab</h2>
    <ApiTable :columns="['属性', '说明', '类型', '默认值']" :rows="TAB_PROPS_ROWS" />

    <h2>API · x-tab-panel</h2>
    <ApiTable :columns="['属性', '说明', '类型', '默认值']" :rows="TAB_PANEL_PROPS_ROWS" />
  </div>
</template>
