<script setup lang="ts">
// Typography 排版：x-text 语义角色演示。全部纯展示（无 JS 交互），演示标记 == source。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// API 表数据（严格对齐 src/components/text/x-text.ts：variant / inline）
const TEXT_PROPS_ROWS = [
  ['variant', '排版角色（字号/字重/颜色的语义档位）', "'title' | 'subtitle' | 'body' | 'caption' | 'muted'", "'body'"],
  ['inline', '行内盒排布（默认块级），便于嵌入句子', 'boolean', 'false'],
];
const TEXT_SLOTS_ROWS = [['(默认)', '文本内容']];
const TEXT_PARTS_ROWS = [['text', '内部包裹盒（字体属性继承自宿主）']];
const TEXT_TOKEN_ROWS = [
  ['title', '--xie-font-size-lg', '600', '--xie-color-fg'],
  ['subtitle', '--xie-font-size-md', '500', '--xie-color-fg'],
  ['body（默认）', '--xie-font-size-md', '400', '--xie-color-fg'],
  ['caption', '--xie-font-size-sm', '400', '--xie-color-muted'],
  ['muted', '--xie-font-size-md', '400', '--xie-color-muted'],
];
</script>

<template>
  <div>
    <h1>Typography 排版</h1>
    <p class="lead">把「字号 / 字重 / 行高 / 颜色」收敛为一组语义角色（variant），内部全部消费设计令牌，随主题实时联动。用于替代各处散落的标题 / 副标题 / 说明文字样式。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-text</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="角色一览"
      desc="variant 取 title / subtitle / body / caption / muted"
      :column="true"
      :source='`
<x-text variant="title">Title 区块主标题</x-text>
<x-text variant="subtitle">Subtitle 次级标题</x-text>
<x-text>Body 正文（默认）</x-text>
<x-text variant="caption">Caption 次要说明</x-text>
<x-text variant="muted">Muted 弱化正文</x-text>
`'
    />

    <Demo
      title="行内嵌入"
      desc="inline 让宿主转为行内盒，可嵌入句子中"
      :source='`
<p style="margin: 0; font-size: var(--xie-font-size-md); color: var(--xie-color-fg)">请先阅读 <x-text variant="caption" inline>（次要提示）</x-text>，再确认操作。</p>
`'
    />

    <Demo
      title="标题 + 副标题组合"
      desc="块级 x-text 纵向堆叠，常见于卡片 / 抽屉头部"
      :source='`
<div style="display: flex; flex-direction: column; gap: 2px">
  <x-text variant="title">通知设置</x-text>
  <x-text variant="caption">管理此工作区的提醒方式</x-text>
</div>
`'
    />

    <p>提示：x-text 是<b>表现层</b>排版，不承担文档大纲语义。需要真正的 <code>&lt;h1&gt;~&lt;h6&gt;</code> 结构时请用语义标签，或按需通过 <code>part="text"</code> 覆盖外观。</p>

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="TEXT_PROPS_ROWS" />
    <ApiTable title="插槽 Slots" :columns="['插槽', '说明']" :rows="TEXT_SLOTS_ROWS" />
    <ApiTable title="CSS 部分 Part" :columns="['part', '说明']" :rows="TEXT_PARTS_ROWS" />
    <ApiTable title="各 variant 对应的令牌" :columns="['variant', '字号', '字重', '颜色']" :rows="TEXT_TOKEN_ROWS" />
  </div>
</template>
