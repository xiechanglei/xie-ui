<script setup lang="ts">
// Divider 分割线：横/纵 + 可选文字断线 + 虚线。纯展示。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// API 表数据（严格对齐 src/components/divider/x-divider.ts）
const DIVIDER_PROPS_ROWS = [
  ['direction', '方向（反射）', "'horizontal' | 'vertical'", "'horizontal'"],
  ['dashed', '虚线（反射）', 'boolean', 'false'],
  ['label-placement', '标签锚位（反射 property labelPlacement，仅带标签时生效）', "'start' | 'center' | 'end'", "'center'"],
];
const DIVIDER_SLOTS_ROWS = [['default', '标签内容（放即成断线文字，留空为纯线）']];
const DIVIDER_PARTS_ROWS = [
  ['line', 'x-divider', '线本体（含两段断线）'],
  ['label', 'x-divider', '标签层'],
];
</script>

<template>
  <div>
    <h1>Divider 分割线</h1>
    <p class="lead">一条线把内容切成两段。横向（默认）分隔上下区块；<code>direction="vertical"</code> 分隔行内元素，高度靠 flex 父项 stretch 撑满。往默认插槽放内容即得带文字的断线，label-placement 调锚位；dashed 切虚线。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-divider</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="横向分隔"
      desc="默认形态，块级铺满一行"
      :column="true"
      :source='`
<div style="width: 100%">
  <div style="padding: 14px; background: var(--xie-color-surface); border-radius: 8px; text-align: center">上区块</div>
  <x-divider></x-divider>
  <div style="padding: 14px; background: var(--xie-color-surface); border-radius: 8px; text-align: center">下区块</div>
</div>
`'
    />

    <Demo
      title="带文字"
      desc="标签走默认插槽；label-placement 调锚位"
      :column="true"
      :source='`
<div style="width: 100%">
  <x-divider>或</x-divider>
  <x-divider label-placement="start">开始</x-divider>
  <x-divider label-placement="end">结束</x-divider>
</div>
`'
    />

    <Demo
      title="虚线 dashed"
      desc="纯线与带文字都支持；虚线段两侧明暗一致"
      :column="true"
      :source='`
<div style="width: 100%">
  <x-divider dashed></x-divider>
  <x-divider dashed>虚线分隔</x-divider>
</div>
`'
    />

    <Demo
      title="纵向 direction"
      desc="行内场景竖向分隔；处于 flex stretch 容器时自动撑满父高"
      :column="true"
      :source='`
<div style="display: flex; align-items: center; gap: 4px">
  <a href="#">编辑</a>
  <x-divider direction="vertical"></x-divider>
  <a href="#">复制</a>
  <x-divider direction="vertical"></x-divider>
  <a href="#" style="color: var(--xie-color-danger)">删除</a>
</div>
<div style="display: flex; align-items: stretch; gap: 12px; height: 64px; margin-top: 14px">
  <div style="padding: 14px; background: var(--xie-color-surface); border-radius: 8px">左</div>
  <x-divider direction="vertical"></x-divider>
  <div style="padding: 14px; background: var(--xie-color-surface); border-radius: 8px">右</div>
</div>
`'
    />

    <h2>设计要点</h2>
    <p>线色吃全局令牌 <code>--xie-color-border</code>，随主题明暗联动。<b>带文字的线</b>由 ::before/::after 两段断线实现，插槽留空时自动收起标签层、退化为一根纯线。<b>虚线不用 <code>border-style:dashed</code></b>：改用 background 渐变平铺画段，左右天然一致。纵向线高度不写死——<code>align-self:stretch</code> 让它在 flex 父项里自己长满。</p>

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="DIVIDER_PROPS_ROWS" />
    <ApiTable title="插槽 Slots" :columns="['插槽', '说明']" :rows="DIVIDER_SLOTS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '所属', '说明']" :rows="DIVIDER_PARTS_ROWS" />
  </div>
</template>
