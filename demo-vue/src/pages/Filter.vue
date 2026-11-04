<script setup lang="ts">
// Filter 筛选器：单选 chip 行，选中留下、其余折叠退场，行尾重置钮展开。
// 基础/色&禁用为静态；「受控值 & 事件」的 x-change（含拒绝 other 回退）由 :setup 实现。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

const EVENT_SOURCE = `<x-filter id="flt-demo">
  <x-filter-item value="all">全部</x-filter-item>
  <x-filter-item value="doing">进行中</x-filter-item>
  <x-filter-item value="done">已完成</x-filter-item>
  <x-filter-item>other</x-filter-item>
</x-filter>
<p id="flt-out" style="margin: 12px 0 0; color: var(--xie-color-muted)">x-change：—</p>`;

const setupFilterEvent = (root: HTMLElement) => {
  const f = root.querySelector('#flt-demo');
  const out = root.querySelector('#flt-out');
  if (!f) return;
  f.addEventListener('x-change', (e) => {
    const ev = e as CustomEvent<{ value: string; previousValue: string }>;
    if (ev.detail.value === 'other') {
      ev.preventDefault();
      if (out) out.textContent = 'x-change 被取消，回到「' + (ev.detail.previousValue || '未选') + '」';
    } else if (out) {
      out.textContent = 'x-change：' + (ev.detail.value || '（已清空）');
    }
  });
};

// API（严格对齐 src/components/filter/x-filter.ts）
const FILTER_PROPS_ROWS = [
  ['value', '当前选中值（程序化赋值回显、不派发；空串=未选/全部展开）', 'string', "''"],
  ['color', '语义色（反射，下沉子项选中填充）', "'primary' | … | 'info'", "'primary'"],
  ['size', '尺寸（反射，下沉子项 chip）', "'sm' | 'md' | 'lg'", "'md'"],
  ['disabled', '整体禁用（反射，下沉子项）', 'boolean', 'false'],
  ['gap', '子项间距（CSS 长度，缺省 --xie-space-2）', 'string', "''"],
];
const FILTER_METHODS_ROWS = [
  ['select(value)', '命令式选中某项（不派发 x-change）；传空串等价 reset'],
  ['reset()', '清空选中、展开全部（不派发 x-change）'],
  ['x-change', '用户交互变化派发，detail:{ value, previousValue }；可取消回退'],
];
const FILTER_ITEM_ROWS = [
  ['value', '选项值；缺省回退文本内容（由 filter 读取）', 'string', "''"],
  ['active', '选中态（由 filter 单源驱动，反射；true=solid false=soft）', 'boolean', 'false'],
  ['color / size', 'chip 语义色 / 尺寸（一般由 filter 下沉）', 'string', "'primary' / 'md'"],
  ['disabled', '禁用该项', 'boolean', 'false'],
];
</script>

<template>
  <div>
    <h1>Filter 筛选器</h1>
    <p class="lead">单选式筛选：点一个选项（chip）后它进入选中态留在原地，其余选项横向折叠退场（grid 0fr→1fr 动画，不占位、不可聚焦）；再点选中项、或点行尾出现的重置钮（×），全部选项展开恢复。观感直接复用 x-button：未选 soft、选中 solid、重置钮 solid。语义类似 radio 但刻意不做表单关联。变化派发可取消的 <code>x-change</code>。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-filter</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="点选后其余折叠，行尾出现 × 重置钮；再点选中项或 × 展开全部"
      :column="true"
      :source='`
<x-filter>
  <x-filter-item>咖啡</x-filter-item>
  <x-filter-item>茶</x-filter-item>
  <x-filter-item>可乐</x-filter-item>
  <x-filter-item>果汁</x-filter-item>
</x-filter>
`'
    />

    <Demo
      title="受控值 & 事件"
      desc="value 读写当前选中；变化派发可取消的 x-change（这里拒绝 other 并回退）"
      :column="true"
      :source="EVENT_SOURCE"
      :script='`
const filter = document.querySelector("#flt-demo");
filter.addEventListener("x-change", (e) => {
  if (e.detail.value === "other") e.preventDefault(); // 拒绝 → 回退
});
filter.value;          // 当前选中值
filter.select("done"); // 命令式选中（不派发）
filter.reset();        // 清空、展开全部
`'
      :setup="setupFilterEvent"
    />

    <Demo
      title="语义色 color & 禁用"
      desc="color 下沉子项（选中填充色随主题语义色）；disabled 整体禁用"
      :column="true"
      :source='`
<x-filter color="primary">
  <x-filter-item>Jungle</x-filter-item>
  <x-filter-item>Beach</x-filter-item>
  <x-filter-item>Mountain</x-filter-item>
</x-filter>
<x-filter color="success">
  <x-filter-item>Jungle</x-filter-item>
  <x-filter-item>Beach</x-filter-item>
  <x-filter-item>Mountain</x-filter-item>
</x-filter>
<x-filter color="danger">
  <x-filter-item>Jungle</x-filter-item>
  <x-filter-item>Beach</x-filter-item>
  <x-filter-item>Mountain</x-filter-item>
</x-filter>
<x-filter disabled>
  <x-filter-item>不可点 A</x-filter-item>
  <x-filter-item>不可点 B</x-filter-item>
</x-filter>
`'
    />

    <h2>API · x-filter</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="FILTER_PROPS_ROWS" />
    <ApiTable title="方法 / 事件" :columns="['名称', '说明']" :rows="FILTER_METHODS_ROWS" />
    <ApiTable title="x-filter-item 属性" :columns="['属性', '说明', '类型', '默认值']" :rows="FILTER_ITEM_ROWS" />
  </div>
</template>
