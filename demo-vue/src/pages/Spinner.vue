<script setup lang="ts">
// Spinner 加载中：圆环旋转，em 随字号、7 角色语义色 + currentColor 逃生舱。纯展示。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// API 表数据（严格对齐 src/components/spinner/x-spinner.ts）
const SPINNER_PROPS_ROWS = [
  ['size', '直径：任意 CSS 长度或纯数字（按 px）', 'string', "'1em'（随字号）"],
  ['stroke', '环粗：同上', 'string', "'2px'"],
  ['speed', '转一圈时长：秒数或 CSS 时间', 'string', "'.6s'"],
  ['color', '语义色（反射）', "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'", "'default'"],
  ['label', '无障碍名；置空则退化为纯装饰（aria-hidden），由宿主自行播报状态', 'string', "'加载中'"],
];
const SPINNER_VARS_ROWS = [
  ['--_sp-size', '直径（组件按 size 写入，可直接覆写绕过属性）'],
  ['--_sp-stroke', '环粗'],
  ['--_sp-duration', '一圈时长'],
  ['--_sp-color', '环色；缺省 currentColor，单一非角色色的逃生舱'],
];
const SPINNER_PARTS_ROWS = [['spinner', 'x-spinner', '圆环本体']];
</script>

<template>
  <div>
    <h1>Spinner 加载中</h1>
    <p class="lead">圆环缺一段、匀速旋转的加载指示器。库里所有「等待中」的视觉都收敛到这一件（x-button 的 loading 内嵌的就是它）。默认尺寸 1em 随字号缩放、颜色 currentColor 随上下文文字色与主题自动联动；size / stroke / speed 可微调，color 走全库统一 7 角色。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-spinner</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="尺寸与环粗"
      desc="size 直径、stroke 环粗：纯数字按 px 理解，也可直接写 CSS 长度（缺省 1em / 2px）"
      :source='`
<div class="demo-stage" style="gap: 24px">
  <x-spinner></x-spinner>
  <x-spinner size="20px"></x-spinner>
  <x-spinner size="32px" stroke="3px"></x-spinner>
  <x-spinner size="48px" stroke="5px"></x-spinner>
</div>
`'
    />

    <Demo
      title="语义色"
      desc="color 走全库统一 7 角色；default 为中性，实为 currentColor 随上下文联动"
      :source='`
<div class="demo-stage">
  <x-spinner color="default" size="22px" stroke="3px"></x-spinner>
  <x-spinner color="primary" size="22px" stroke="3px"></x-spinner>
  <x-spinner color="secondary" size="22px" stroke="3px"></x-spinner>
  <x-spinner color="success" size="22px" stroke="3px"></x-spinner>
  <x-spinner color="warning" size="22px" stroke="3px"></x-spinner>
  <x-spinner color="danger" size="22px" stroke="3px"></x-spinner>
  <x-spinner color="info" size="22px" stroke="3px"></x-spinner>
</div>
`'
    />

    <Demo
      title="转速"
      desc="speed 一圈时长：秒数或 CSS 时间（缺省 .6s）"
      :source='`
<div class="demo-stage">
  <x-spinner speed="0.3" size="22px" stroke="3px"></x-spinner>
  <x-spinner speed="0.6" size="22px" stroke="3px"></x-spinner>
  <x-spinner speed="1.4" size="22px" stroke="3px"></x-spinner>
</div>
`'
    />

    <Demo
      title="随上下文联动"
      desc="不设 color 时环色即 currentColor：外层文字色/字号变了它自动跟着变，无需单独配"
      :source='`
<div class="demo-stage">
  <span style="color: #dc2626; font-size: 28px; display: inline-flex; align-items: center; gap: 8px"><x-spinner></x-spinner> 大字红色</span>
  <span style="color: #0891b2; font-size: 14px; display: inline-flex; align-items: center; gap: 8px"><x-spinner></x-spinner> 小字同色</span>
</div>
`'
    />

    <Demo
      title="在按钮里（同源）"
      desc="x-button 的 loading 内嵌的就是 x-spinner，颜色自动吃按钮前景色"
      :source='`
<div class="demo-stage">
  <x-button loading>提交中</x-button>
  <x-button variant="outline" loading>Outline</x-button>
  <x-button variant="ghost" color="success" loading>Ghost</x-button>
</div>
`'
    />

    <Demo
      title="页面级区块"
      desc="较大 size/stroke 配文案，label 提供无障碍名（读屏播报 role=status）"
      :column="true"
      :source='`
<div style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 24px; color: var(--xie-color-muted)">
  <x-spinner size="36px" stroke="4px" color="primary" label="正在加载数据"></x-spinner>
  <span>正在加载数据…</span>
</div>
`'
    />

    <h2>设计要点</h2>
    <p>几何（尺寸/环粗/转速）不反射成属性，而是由组件把值写成宿主局部变量 <code>--_sp-*</code>，CSS 里 <code>var(--_sp-size, 1em)</code> 兜缺省。颜色轴沿用全库统一的 7 角色；只想要某一个非角色色，直接 <code>x-spinner{ --_sp-color:#e11 }</code> 覆写。<code>prefers-reduced-motion: reduce</code> 下停转并把缺口补成完整静态圆环。</p>

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="SPINNER_PROPS_ROWS" />
    <ApiTable title="CSS 变量 Variables" :columns="['变量', '说明']" :rows="SPINNER_VARS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '所属', '说明']" :rows="SPINNER_PARTS_ROWS" />
  </div>
</template>
