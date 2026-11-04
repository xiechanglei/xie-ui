<script setup lang="ts">
// Tooltip 文字提示：x-tooltip 包裹触发内容，悬停/聚焦弹深色小气泡。全为声明式静态（placement/delay/open 皆属性）。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

const TIP_PROPS_ROWS = [
  ['content', '提示文本（纯文本）；空或全空白时任何交互都不弹', 'string', "''"],
  ['placement', '弹出方位（反射）', "'top' | 'bottom' | 'left' | 'right'", "'top'"],
  ['delay', '显示延时（毫秒），0 = 立即；隐藏无延时', 'number', '150'],
  ['open', '强制常开（反射），与悬停态叠加', 'boolean', 'false'],
];
const TIP_SLOTS_ROWS = [['default', '触发内容（按钮/图标/任意元素）；悬停或聚焦它即弹出气泡']];
const TIP_PARTS_ROWS = [['tip', 'x-tooltip', '气泡本体']];
</script>

<template>
  <div>
    <h1>Tooltip 文字提示</h1>
    <p class="lead">包裹一段触发内容（按钮/图标/任意元素），鼠标悬停或键盘聚焦时在其旁弹出一枚深色小气泡补充说明。内容只支持纯文本；气泡 <code>pointer-events:none</code>，不拦操作也不抢焦点。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-tooltip</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="把触发元素放进 x-tooltip，content 写提示文本"
      :source='`
<x-tooltip content="复制到剪贴板">
  <x-button variant="outline">悬停我</x-button>
</x-tooltip>
`'
    />

    <Demo
      title="四向弹出"
      desc="placement 选气泡相对内容的方位（top 默认 / bottom / left / right）"
      :source='`
<div style="display: flex; align-items: center; gap: 18px; flex-wrap: wrap">
  <x-tooltip content="顶部提示（默认）" placement="top"><x-button variant="soft">top</x-button></x-tooltip>
  <x-tooltip content="底部提示" placement="bottom"><x-button variant="soft">bottom</x-button></x-tooltip>
  <x-tooltip content="左侧提示" placement="left"><x-button variant="soft">left</x-button></x-tooltip>
  <x-tooltip content="右侧提示" placement="right"><x-button variant="soft">right</x-button></x-tooltip>
</div>
`'
    />

    <Demo
      title="显示延时"
      desc="delay 毫秒防误悬停闪弹（默认 150）；0 = 立即；隐藏始终无延时"
      :source='`
<div style="display: flex; align-items: center; gap: 18px; flex-wrap: wrap">
  <x-tooltip content="我 0ms 立即弹" delay="0"><x-button variant="outline">delay=0</x-button></x-tooltip>
  <x-tooltip content="我 600ms 后才弹，防误悬停" delay="600"><x-button variant="outline">delay=600</x-button></x-tooltip>
</div>
`'
    />

    <Demo
      title="强制常开"
      desc="open 让气泡常驻（文档/调试用），与悬停态叠加、不干扰自动隐"
      :source='`
<div style="display: flex; align-items: center; gap: 18px; flex-wrap: wrap; padding: 24px 0">
  <x-tooltip content="我用 open 常开，无需悬停" open><x-button variant="soft" color="primary">open 常开</x-button></x-tooltip>
</div>
`'
    />

    <Demo
      title="图标触发与长文本"
      desc="触发内容可以是图标等任意元素；长文本超 240px 自动换行"
      :source='`
<div style="display: flex; align-items: center; gap: 18px; flex-wrap: wrap">
  <x-tooltip content="设置项"><x-icon name="settings" size="20px"></x-icon></x-tooltip>
  <x-tooltip content="这是一段较长的提示文本，超过 240px 宽度会自动换行，不会撑破布局"><x-button variant="outline" color="secondary">长文本</x-button></x-tooltip>
</div>
`'
    />

    <h2>与其它浮层的边界</h2>
    <p>Tooltip 是<b>最轻</b>的补充说明：只在悬停/聚焦时出现、纯文本、不可交互（<code>pointer-events:none</code>）。气泡是宿主 shadow 内 <code>position:absolute</code> 定位，会被祖先 <code>overflow:hidden</code> 裁剪——与 <code>x-select</code> 弹层同一取舍，库里刻意不做 fixed 传送门换这份简单。需要点击展开、承载富内容时用 <code>x-dialog</code> / <code>x-drawer</code>；主动抛出的瞬时反馈用 <code>x-toast</code>。触发元素若已有原生 <code>title</code>，请去掉以免和浏览器自带提示重复。</p>

    <h2>API</h2>
    <ApiTable title="x-tooltip · 属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="TIP_PROPS_ROWS" />
    <ApiTable title="插槽 Slots" :columns="['插槽', '说明']" :rows="TIP_SLOTS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '所属', '说明']" :rows="TIP_PARTS_ROWS" />
  </div>
</template>
