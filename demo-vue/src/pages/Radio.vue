<script setup lang="ts">
// Radio 单选框：原子 / 带文字项 / 容器三段式，互斥由 group 维护。
// 「基础用法」group 的 x-change 回显由 :setup 实现；其余为静态。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// group 聚合 x-change：detail { value: string, checked: Element | null }
const GROUP_SOURCE = `<x-radio-group id="rd-group" name="gender">
  <x-radio-item label="男" value="male" checked></x-radio-item>
  <x-radio-item label="女" value="female"></x-radio-item>
  <x-radio-item label="保密" value="secret"></x-radio-item>
</x-radio-group>
<p id="rd-out" style="margin: 12px 0 0; color: var(--xie-color-muted)">当前：male</p>`;

const setupRadioGroup = (root: HTMLElement) => {
  const g = root.querySelector('#rd-group');
  const out = root.querySelector('#rd-out');
  if (!g) return;
  g.addEventListener('x-change', (e) => {
    const val = (e as CustomEvent<{ value: string }>).detail.value;
    if (out) out.textContent = '当前：' + (val || '—');
  });
};

// API · x-radio / x-radio-item
const RD_PROPS_ROWS = [
  ['checked', '是否选中（反射）', 'boolean', 'false'],
  ['value', '选中时提交/聚合的值', 'string', "''"],
  ['name', '表单名（反射，作为 FormData 键）', 'string', "''"],
  ['label', 'item 的可见文字 / 原子的无障碍名', 'string', "''"],
  ['disabled', '禁用（反射）', 'boolean', 'false'],
  ['required', '必填（走原生校验）', 'boolean', 'false'],
  ['color', '语义色（反射）', "'primary' | … | 'info'", "'primary'"],
  ['size', '尺寸（反射）', "'sm' | 'md' | 'lg'", "'md'"],
];
const RD_EVENTS_ROWS = [
  ['select(force=true)', '选中/取消（force=false 供 group 清空他人）', '—'],
  ['x-change', '用户选中时派发，可取消回退', '{ checked, value }'],
];

// API · x-radio-group
const RD_GROUP_ROWS = [
  ['name/disabled/size/color', '条件下沉给未显式设置该属性的子项', '—'],
  ['value', '当前选中项 value（双向：设置可回显）', 'string'],
  ['selectedValue（只读）', '同 value 的只读视图', 'string'],
  ['direction', '子项排布（反射）', "'column' | 'row'"],
  ['gap', '子项间距', 'string'],
  ['clear()', '清空选择', '() => void'],
  ['x-change', '选择变化', '{ value, checked }'],
];
</script>

<template>
  <div>
    <h1>Radio 单选框</h1>
    <p class="lead">与 Checkbox 同源：<code>x-radio</code> 原子件、<code>x-radio-item</code> 带文字、<code>x-radio-group</code> 容器。原生 radio 的同名互斥无法跨自定义元素边界，故互斥交由 group 统一维护；选中值以字符串聚合（区别于 checkbox 的数组）。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-radio*</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="group 里写一次 name，子项给 value；监听 x-change 读选中的 value"
      :column="true"
      :source="GROUP_SOURCE"
      :script='`
const g = document.querySelector("#rd-group");
const out = document.querySelector("#rd-out");
g.addEventListener("x-change", (e) => {
  out.textContent = "当前：" + (e.detail.value || "—");
});
`'
      :setup="setupRadioGroup"
    />

    <Demo
      title="横向排布 + 统一下发"
      desc="direction=row；group 的 size/color 自动下发给未自写的子项"
      :column="true"
      :source='`
<x-radio-group direction="row" color="danger" size="lg">
  <x-radio-item label="选项 A" value="a" checked></x-radio-item>
  <x-radio-item label="选项 B" value="b"></x-radio-item>
  <x-radio-item label="选项 C" value="c"></x-radio-item>
</x-radio-group>
`'
    />

    <Demo
      title="语义色 color"
      desc="选中底色随 color 轴变化"
      :source='`
<div style="display: flex; gap: 16px; flex-wrap: wrap">
  <x-radio-item label="primary" color="primary" checked></x-radio-item>
  <x-radio-item label="success" color="success" checked></x-radio-item>
  <x-radio-item label="warning" color="warning" checked></x-radio-item>
  <x-radio-item label="danger" color="danger" checked></x-radio-item>
  <x-radio-item label="info" color="info" checked></x-radio-item>
</div>
`'
    />

    <Demo
      title="原子 x-radio & 禁用"
      desc="原子裸圆点自己配文字；disabled 半透明不可交互"
      :source='`
<div style="display: flex; gap: 8px; align-items: center">
  <x-radio checked></x-radio>
  <x-text>裸圆点</x-text>
  <x-radio-item label="禁用" disabled checked></x-radio-item>
</div>
`'
    />

    <h2>API · x-radio / x-radio-item</h2>
    <ApiTable :columns="['属性', '说明', '类型', '默认值']" :rows="RD_PROPS_ROWS" />
    <ApiTable title="方法 / 事件" :columns="['名称', '说明', 'detail']" :rows="RD_EVENTS_ROWS" />

    <h2>API · x-radio-group</h2>
    <ApiTable :columns="['属性/成员', '说明', '类型']" :rows="RD_GROUP_ROWS" />
  </div>
</template>
