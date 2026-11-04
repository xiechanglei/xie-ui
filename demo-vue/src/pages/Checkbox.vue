<script setup lang="ts">
// Checkbox 复选框：原子 / 带文字项 / 容器三段式，shape×color 双轴。
// 「容器 group」例的聚合 x-change 回显由 :setup 实现；其余为静态。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// 聚合 x-change：detail { value: string[], checked: Element[] }
const GROUP_SOURCE = `<x-checkbox-group id="cb-group" name="fruit" color="success">
  <x-checkbox-item label="苹果" value="apple" checked></x-checkbox-item>
  <x-checkbox-item label="香蕉" value="banana"></x-checkbox-item>
  <x-checkbox-item label="橙子" value="orange"></x-checkbox-item>
</x-checkbox-group>
<p id="cb-out" style="margin: 12px 0 0; color: var(--xie-color-muted)">已选：—</p>`;

const setupCheckboxGroup = (root: HTMLElement) => {
  const g = root.querySelector('#cb-group');
  const out = root.querySelector('#cb-out');
  if (!g) return;
  g.addEventListener('x-change', (e) => {
    const val = (e as CustomEvent<{ value: string[] }>).detail.value;
    if (out) out.textContent = '已选：' + (val.join('、') || '—');
  });
};

// API · x-checkbox / x-checkbox-item
const CB_PROPS_ROWS = [
  ['checked', '是否选中（反射）', 'boolean', 'false'],
  ['indeterminate', '三方态（仅 x-checkbox 常用，反射）', 'boolean', 'false'],
  ['value', '选中时提交/聚合的值', 'string', "'on'"],
  ['name', '表单名（反射，作为 FormData 键）', 'string', "''"],
  ['label', 'item 的可见文字 / 原子的无障碍名', 'string', "''"],
  ['disabled', '禁用（反射）', 'boolean', 'false'],
  ['required', '必填（走原生校验）', 'boolean', 'false'],
  ['shape', '形态（反射）', "'square' | 'rounded' | 'circle'", "'rounded'"],
  ['color', '语义色（反射）', "'primary' | … | 'info'", "'primary'"],
  ['size', '尺寸（反射）', "'sm' | 'md' | 'lg'", "'md'"],
];
const CB_EVENTS_ROWS = [
  ['toggle(force?)', '受控切换，派发可取消的 x-change', '—'],
  ['x-change', '用户切换时派发，可 preventDefault 回退', '{ checked, value }'],
];

// API · x-checkbox-group
const CB_GROUP_ROWS = [
  ['name/disabled/size/shape/color', '条件下沉给未显式设置该属性的子项', '—'],
  ['min / max', '勾选数量下限/上限（越界挡下切换）', 'number'],
  ['direction', '子项排布（反射）', "'column' | 'row'"],
  ['gap', '子项间距（CSS 长度）', 'string'],
  ['value（只读）', '当前选中项 value 数组', 'string[]'],
  ['checkedItems（只读）', '当前选中子项元素', 'Element[]'],
  ['setAllChecked(b)', '全选 / 全不选（受 min/max 约束）', '(boolean) => void'],
  ['x-change', '聚合选择变化', '{ value: string[], checked: Element[] }'],
];
</script>

<template>
  <div>
    <h1>Checkbox 复选框</h1>
    <p class="lead">三段式：<code>x-checkbox</code> 是纯方框原子件，<code>x-checkbox-item</code> 附带文字标签（点整行即切换），<code>x-checkbox-group</code> 作容器统一下发公共属性、聚合选择结果并可做数量约束。内部包原生 input，键盘/无障碍/勾选态全部白送；首个支持 form 关联（FCCE）的组件。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-checkbox*</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="带文字项用 label 属性；checked 反射，程序化赋值不派发事件"
      :source='`
<x-checkbox-item label="同意协议"></x-checkbox-item>
<x-checkbox-item label="默认勾选" checked></x-checkbox-item>
`'
    />

    <Demo
      title="原子 x-checkbox"
      desc="只要方框、文字自己排；也可单独用 indeterminate 三方态"
      :source='`
<div style="display: flex; gap: 8px; align-items: center">
  <x-checkbox></x-checkbox>
  <x-text>裸方框</x-text>
  <x-checkbox indeterminate></x-checkbox>
  <x-text>三方态</x-text>
</div>
`'
    />

    <Demo
      title="容器 group"
      desc="公共 size/color/name 写一次；监听 x-change 读聚合 value 数组"
      :column="true"
      :source="GROUP_SOURCE"
      :script='`
const g = document.querySelector("#cb-group");
const out = document.querySelector("#cb-out");
g.addEventListener("x-change", (e) => {
  out.textContent = "已选：" + (e.detail.value.join("、") || "—");
});
`'
      :setup="setupCheckboxGroup"
    />

    <Demo
      title="数量约束 min / max"
      desc="借子项 x-change 的可取消语义，越界直接挡下这次切换"
      :column="true"
      :source='`
<x-checkbox-group min="1" max="2">
  <x-checkbox-item label="最多选 2 个" value="a"></x-checkbox-item>
  <x-checkbox-item label="尝试第 3 个" value="b"></x-checkbox-item>
  <x-checkbox-item label="再多" value="c"></x-checkbox-item>
</x-checkbox-group>
`'
    />

    <Demo
      title="形态 shape × 语义色 color"
      desc="shape: square/rounded(默认)/circle；color 决定选中底色"
      :column="true"
      :source='`
<x-checkbox-item label="square" shape="square" color="primary" checked></x-checkbox-item>
<x-checkbox-item label="rounded" shape="rounded" color="primary" checked></x-checkbox-item>
<x-checkbox-item label="circle" shape="circle" color="primary" checked></x-checkbox-item>
<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 8px">
  <x-checkbox-item label="primary" color="primary" checked></x-checkbox-item>
  <x-checkbox-item label="success" color="success" checked></x-checkbox-item>
  <x-checkbox-item label="warning" color="warning" checked></x-checkbox-item>
  <x-checkbox-item label="danger" color="danger" checked></x-checkbox-item>
  <x-checkbox-item label="info" color="info" checked></x-checkbox-item>
</div>
`'
    />

    <Demo
      title="尺寸 & 禁用"
      desc="size 档位；disabled 半透明不可交互"
      :source='`
<x-checkbox-item label="sm" size="sm" checked></x-checkbox-item>
<x-checkbox-item label="md" size="md" checked></x-checkbox-item>
<x-checkbox-item label="lg" size="lg" checked></x-checkbox-item>
<x-checkbox-item label="禁用" disabled checked></x-checkbox-item>
`'
    />

    <h2>API · x-checkbox / x-checkbox-item</h2>
    <ApiTable :columns="['属性', '说明', '类型', '默认值']" :rows="CB_PROPS_ROWS" />
    <ApiTable title="方法 / 事件" :columns="['名称', '说明', 'detail']" :rows="CB_EVENTS_ROWS" />

    <h2>API · x-checkbox-group</h2>
    <ApiTable :columns="['属性/成员', '说明', '类型']" :rows="CB_GROUP_ROWS" />
  </div>
</template>
