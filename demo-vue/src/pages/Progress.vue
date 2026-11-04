<script setup lang="ts">
// Progress 进度条：定值 / 不确定 / 语义色 / 尺寸。仅「动态推进」含交互：
// 渲染标记 == source，:script 展示原生写法、不执行，真实推进由 :setup 用 Vue 定时器实现。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// 交互的 Vue 侧实现：value 就是普通 property，点按钮用 setInterval 递增
const setupProgressRun = (root: HTMLElement) => {
  const barEl = root.querySelector('#pg-live');
  if (!barEl) return;
  const bar = barEl as unknown as { value: number };
  root.querySelector('#pg-run')?.addEventListener('click', () => {
    let v = 0;
    bar.value = 0;
    const timer = setInterval(() => {
      v = Math.min(v + 7 + Math.round(Math.random() * 10), 100);
      bar.value = v;
      if (v >= 100) clearInterval(timer);
    }, 260);
  });
};

// API 表数据（严格对齐 src/components/progress/x-progress.ts）
const PROGRESS_PROPS_ROWS = [
  ['value', '完成度（反射，0–100）；未设置 = 不确定模式', 'number', '—'],
  ['indeterminate', '强制不确定（反射），忽略 value', 'boolean', 'false'],
  ['color', '语义色（反射）', "'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default'", "'primary'"],
  ['size', '轨道高度（写局部变量，纯数字按 px）', 'string', "'8px'"],
  ['label', '无障碍名（不确定模式自动改播「加载中」）', 'string', "'进度'"],
];
const PROGRESS_PARTS_ROWS = [
  ['track', 'x-progress', '轨道'],
  ['fill', 'x-progress', '填充条'],
];
</script>

<template>
  <div>
    <h1>Progress 进度条</h1>
    <p class="lead">线性完成度指示。写 value（0–100）即定值模式，填充条按比例伸展；不写 value（或加 indeterminate）即不确定模式，小条来回扫动。与 x-spinner 分工：知道完成度用 progress、只知道「在忙」用 spinner。颜色走全库统一 7 角色语义色。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-progress</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="定值 value"
      desc="0–100，越界自动夹紧；变更带 width 过渡"
      :column="true"
      :source='`
<x-progress value="25"></x-progress>
<x-progress value="60" color="success"></x-progress>
<x-progress value="100" color="info"></x-progress>
`'
    />

    <Demo
      title="动态推进"
      desc="value 就是普通 property：bar.value = 42 即更新（可绑定进度事件）"
      :column="true"
      :source='`
<x-progress id="pg-live" value="0" color="warning"></x-progress>
<div><x-button id="pg-run" variant="outline" size="sm">跑起来</x-button></div>
`'
      :script='`
const bar = document.querySelector("#pg-live");
document.querySelector("#pg-run").addEventListener("click", () => {
  let v = 0;
  bar.value = 0;
  const timer = setInterval(() => {
    v = Math.min(v + 7 + Math.round(Math.random() * 10), 100);
    bar.value = v;
    if (v >= 100) clearInterval(timer);
  }, 260);
});
`'
      :setup="setupProgressRun"
    />

    <Demo
      title="不确定模式"
      desc="不写 value 即扫动；或显式 indeterminate 忽略 value"
      :column="true"
      :source='`
<x-progress></x-progress>
<x-progress indeterminate color="danger"></x-progress>
`'
    />

    <Demo
      title="语义色 color"
      desc="7 角色与 tag/spinner 同族；default 为中性"
      :column="true"
      :source='`
<x-progress value="30" color="primary"></x-progress>
<x-progress value="40" color="secondary"></x-progress>
<x-progress value="50" color="success"></x-progress>
<x-progress value="60" color="warning"></x-progress>
<x-progress value="70" color="danger"></x-progress>
<x-progress value="80" color="info"></x-progress>
<x-progress value="90" color="default"></x-progress>
`'
    />

    <Demo
      title="尺寸 size"
      desc="任意 CSS 长度或纯数字（按 px），轨道圆角随高度联动"
      :column="true"
      :source='`
<x-progress value="70" size="4px" color="info"></x-progress>
<x-progress value="70"></x-progress>
<x-progress value="70" size="16px" color="success"></x-progress>
`'
    />

    <h2>设计要点</h2>
    <p>填充条宽度靠<b>细粒度 style 绑定</b>直写：value 变更只动这一条属性，不重渲结构。<code>role="progressbar"</code> + <code>aria-valuenow/min/max</code> 挂在填充条上，不确定模式自动省略 valuenow 并改播「加载中」。<code>prefers-reduced-motion: reduce</code> 下扫动停为半透明静态满条。单一非 7 角色颜色覆写 <code>--_pg-color</code> 即可。</p>

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="PROGRESS_PROPS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '所属', '说明']" :rows="PROGRESS_PARTS_ROWS" />
  </div>
</template>
