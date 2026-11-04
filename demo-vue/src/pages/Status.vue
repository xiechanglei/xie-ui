<script setup lang="ts">
// Status 状态灯：x-status 小圆点表示状态，常与文字并排。纯展示（pulse/halo 为 CSS 动画属性，非 JS 交互）。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// API 表数据（严格对齐 src/components/status/x-status.ts）
const STATUS_PROPS_ROWS = [
  ['color', '语义色（反射）：default（currentColor 随上下文）/ primary / secondary / success / warning / danger / info', 'string', "'default'"],
  ['size', '直径档位（反射）：xs 4px / sm 6px / md 8px / lg 12px', 'string', "'md'"],
  ['pulse', '呼吸灯动画（反射 Boolean）：透明度脉动，表示「活跃/正在发生」', 'boolean', 'false'],
  ['halo', '雷达波动画（反射 Boolean）：向外扩散渐隐涟漪，强提醒', 'boolean', 'false'],
  ['label', '无障碍名：写了才有 role="img" + aria-label；缺省 aria-hidden 纯装饰', 'string', "''"],
];
const STATUS_CUSTOM_ROWS = [
  ['part', 'dot'],
  ['--_st-color', '任意色逃生舱：不占 color 属性位，x-status{ --_st-color:#e11 } 直接覆写'],
];
</script>

<template>
  <div>
    <h1>Status 状态灯</h1>
    <p class="lead"><code>&lt;x-status&gt;</code> 是一颗表示当前状态的小圆点（在线/离线/运行中/异常），常与文字并排。颜色走全库统一 7 角色，缺省 <code>currentColor</code> 随上下文文字色联动；可选呼吸灯（pulse）与雷达波（halo）两种动画表达「活跃」与「强提醒」。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-status</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="语义色"
      desc="color 与 button/badge/spinner 同一套 7 角色；default 不强行染色，跟随上下文文字色"
      :column="true"
      :source='`
<p style="margin: 0"><x-status color="success"></x-status> 在线</p>
<p style="margin: 0"><x-status color="warning"></x-status> 空闲</p>
<p style="margin: 0"><x-status color="danger"></x-status> 离线</p>
<p style="margin: 0"><x-status></x-status> 中性（随文字色）</p>
`'
    />

    <Demo
      title="尺寸 size"
      desc="xs(4px) / sm(6px) / md(缺省 8px) / lg(12px)，行内小点与文字基线居中对齐"
      :source='`
<div class="demo-stage">
  <span><x-status size="xs"></x-status> xs</span>
  <span><x-status size="sm" color="success"></x-status> sm</span>
  <span><x-status size="md" color="primary"></x-status> md</span>
  <span><x-status size="lg" color="danger"></x-status> lg</span>
</div>
`'
    />

    <Demo
      title="动画 pulse / halo"
      desc="pulse 呼吸灯=「活跃/正在发生」；halo 雷达波=「告警/呼叫」级强提醒；prefers-reduced-motion 下自动静止"
      :source='`
<div class="demo-stage">
  <span><x-status color="info" pulse></x-status> 正在同步…</span>
  <span><x-status color="danger" halo></x-status> 服务器已离线</span>
</div>
`'
    />

    <Demo
      title="组合场景 · 成员列表"
      desc="与 x-avatar 等其他基础件并排使用；label 属性给读屏的状态名（不写则纯装饰，语义交给旁边文字）"
      :column="true"
      :source='`
<div style="display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px solid var(--xie-color-border)">
  <x-avatar size="sm" name="张三"></x-avatar>
  <span style="min-width: 64px">张三</span>
  <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--xie-color-muted); font-size: 13px"><x-status color="success" label="在线"></x-status> 在线</span>
</div>
<div style="display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px solid var(--xie-color-border)">
  <x-avatar size="sm" name="李四"></x-avatar>
  <span style="min-width: 64px">李四</span>
  <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--xie-color-muted); font-size: 13px"><x-status color="warning" label="忙碌"></x-status> 忙碌</span>
</div>
<div style="display: flex; align-items: center; gap: 10px; padding: 6px 0">
  <x-avatar size="sm" name="王五"></x-avatar>
  <span style="min-width: 64px">王五</span>
  <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--xie-color-muted); font-size: 13px"><x-status color="default" label="离线"></x-status> 离线</span>
</div>
`'
    />

    <h2>API · x-status</h2>
    <ApiTable :columns="['属性', '说明', '类型', '默认值']" :rows="STATUS_PROPS_ROWS" />
    <ApiTable :columns="['定制', '说明']" :rows="STATUS_CUSTOM_ROWS" />

    <h2>说明</h2>
    <p>与 <code>x-badge</code> 的 <code>dot</code> 模式分工：badge 的圆点是「有未读/有更新」的角标信号（锚定在内容四角），status 是文档流里的状态灯，常与文字并排读作「● 在线」。动画实现为纯 CSS，零 JS 参与；<code>prefers-reduced-motion: reduce</code> 下自动静止。</p>
  </div>
</template>
