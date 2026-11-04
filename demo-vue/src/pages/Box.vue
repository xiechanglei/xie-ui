<script setup lang="ts">
// Box 通用容器：视觉表面件——variant×color 双轴（缺省 ghost）、full/fit 宽度、padding/radius/shadow、hoverable。纯展示。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// 语义色 chip（渲染 == 展示源码）
const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'];
const chip = (c: string, variant: string) => `<x-box color="${c}" variant="${variant}" width="fit" padding="sm">${c}${variant === 'soft' ? ' soft' : ''}</x-box>`;
const COLOR_SOLID = `<x-flex gap="sm" wrap align="center">\n  ${COLORS.map((c) => chip(c, 'solid')).join('\n  ')}\n</x-flex>`;
const COLOR_SOFT = `<x-flex gap="sm" wrap align="center">\n  ${COLORS.map((c) => chip(c, 'soft')).join('\n  ')}\n</x-flex>`;
const COLOR_DEMO = `<x-flex direction="column" gap="md">\n  ${COLOR_SOLID}\n  ${COLOR_SOFT}\n</x-flex>`;

const PAD_DEMO = `<x-flex gap="sm" wrap align="center">
  <x-box padding="none" variant="outline" width="fit">none</x-box>
  <x-box padding="xs" variant="outline" width="fit">xs</x-box>
  <x-box padding="sm" variant="outline" width="fit">sm</x-box>
  <x-box padding="md" variant="outline" width="fit">md</x-box>
  <x-box padding="lg" variant="outline" width="fit">lg（默认）</x-box>
  <x-box padding="28px" variant="outline" width="fit">28px 任意长度</x-box>
</x-flex>`;
const RAD_DEMO = `<x-flex gap="sm" wrap align="center">
  <x-box radius="none" color="primary" variant="solid" width="fit" padding="sm">none</x-box>
  <x-box radius="sm" color="primary" variant="solid" width="fit" padding="sm">sm</x-box>
  <x-box radius="md" color="primary" variant="solid" width="fit" padding="sm">md（默认）</x-box>
  <x-box radius="lg" color="primary" variant="solid" width="fit" padding="sm">lg</x-box>
  <x-box radius="full" color="primary" variant="solid" width="fit" padding="sm">full 胶囊</x-box>
</x-flex>`;
const SHADOW_DEMO = `<x-flex gap="lg" wrap align="center">
  <x-box shadow="none" width="fit" padding="sm" variant="outline">none</x-box>
  <x-box shadow="sm" width="fit" padding="sm" variant="solid">sm</x-box>
  <x-box shadow="md" width="fit" padding="sm" variant="solid">md</x-box>
  <x-box shadow="lg" width="fit" padding="sm" variant="solid">lg</x-box>
</x-flex>`;

// API 表数据（严格对齐 src/components/box/x-box.ts）
const BOX_PROPS_ROWS = [
  ['variant', '形态（填充样式，反射）；缺省不写即 ghost', "'ghost' | 'solid' | 'outline' | 'soft'", "'ghost'"],
  ['color', '语义色（与形态正交，反射）；default 为中性，仅 solid/soft/outline 下看得出差异', "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'", "'default'"],
  ['width', '横向尺寸（反射）：full 充满父元素 / fit 只包住子元素', "'full' | 'fit'", "'full'"],
  ['padding', '内边距：令牌别名或任意 CSS 长度', "'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | <length>", "'lg'（16px）"],
  ['radius', '圆角：别名或任意长度；默认吃 --xie-radius 旋钮，随主题面板联动', "'none' | 'sm' | 'md' | 'lg' | 'full' | <length>", "'md'"],
  ['shadow', '阴影档位（反射），吃全局阴影令牌', "'none' | 'sm' | 'md' | 'lg'", "'none'"],
  ['hoverable', '可点暗示：cursor:pointer + 悬停浮起（反射）', 'boolean', 'false'],
];
const BOX_SLOTS_ROWS = [['default', '任意内容（文字、组件、x-flex 排布…）']];
</script>

<template>
  <div>
    <h1>Box 通用容器</h1>
    <p class="lead">一块「有外观的面」：背景、描边、圆角、内边距、阴影。外观沿用 Button 的双轴范式（variant × color 正交），横向可选充满父元素或只包住子元素。缺省形态是 <code>ghost</code>（全透明）。它不管内部怎么排（交给 x-flex）、不当页面骨架（交给 x-container）。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-box</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="形态 variant"
      desc="ghost（缺省，全透明只留间距）/ solid（实底色面）/ soft（淡底）/ outline（描边）"
      :column="true"
      :source='`
<x-flex gap="md" wrap>
  <x-box variant="solid" style="flex: 1 1 200px"><strong>Solid</strong><p style="margin: 6px 0 0">显式写 solid：中性卡面 surface 底 + 正文色，随主题翻转</p></x-box>
  <x-box variant="soft" style="flex: 1 1 200px"><strong>Soft</strong><p style="margin: 6px 0 0">淡色底，适合次级分区</p></x-box>
  <x-box variant="outline" style="flex: 1 1 200px"><strong>Outline</strong><p style="margin: 6px 0 0">透明底 + 描边，经典线框卡</p></x-box>
  <x-box style="flex: 1 1 200px"><strong>缺省</strong><p style="margin: 6px 0 0">不写 variant 即 ghost：全透明，只保留内边距与圆角</p></x-box>
</x-flex>
`'
    />

    <Demo title="语义色 color" desc="default（缺省中性）+ 6 强调角色，与形态正交；color 不会反推 variant" :column="true" :source="COLOR_DEMO" />

    <Demo
      title="宽度：充满 / 包住内容"
      desc="width=&quot;full&quot;（默认）block 横向充满父元素；width=&quot;fit&quot; 只包住子元素"
      :column="true"
      :source='`
<x-flex direction="column" gap="md">
  <x-box variant="solid">width="full"（缺省）：block 横向充满父元素</x-box>
  <x-box variant="solid" width="fit">width="fit"：只包住子元素</x-box>
</x-flex>
`'
    />

    <Demo title="内边距 padding" desc="令牌别名或任意 CSS 长度" :column="true" :source="PAD_DEMO" />
    <Demo title="圆角 radius" desc="别名或任意长度；默认吃 --xie-radius 旋钮，随主题面板联动" :column="true" :source="RAD_DEMO" />
    <Demo title="阴影 shadow" desc="三档吃全局阴影令牌（强度旋钮 / 主题联动）" :column="true" :source="SHADOW_DEMO" />

    <Demo
      title="可点暗示 hoverable"
      desc="悬停浮起（阴影升档 + 微位移）并置 cursor:pointer；只给视觉，点击语义仍由消费者自理"
      :column="true"
      :source='`
<x-flex gap="md" wrap>
  <x-box hoverable variant="solid" shadow="sm" width="fit" padding="md"><strong>悬停我</strong><p style="margin: 6px 0 0">阴影升档 + 微浮起，可点暗示</p></x-box>
  <x-box hoverable variant="outline" color="primary" width="fit" padding="md">outline + hoverable</x-box>
</x-flex>
`'
    />

    <Demo
      title="组合：面 + 排布 + 排版"
      desc="典型分工：x-box 出面（要卡面显式 solid），x-flex 排布，x-text / x-avatar / x-button 填内容"
      :column="true"
      :source='`
<x-box variant="solid" shadow="md" padding="xl" style="flex: 1 1 100%">
  <x-flex align="center" gap="sm">
    <x-avatar text="张" color="primary"></x-avatar>
    <x-flex direction="column" gap="xs">
      <x-text variant="title">张三</x-text>
      <x-text variant="caption">前端工程师 · 在线</x-text>
    </x-flex>
    <x-flex style="margin-left: auto; gap: 8px">
      <x-button size="sm" variant="outline" color="default">发消息</x-button>
      <x-button size="sm">关注</x-button>
    </x-flex>
  </x-flex>
</x-box>
`'
    />

    <h2>与其它布局件的边界</h2>
    <p><code>x-box</code> 只管<b>面</b>（背景/描边/圆角/间距/阴影），内部要弹性排布用 <code>x-flex</code> 套在 slot 里；页面级骨架（侧栏/头部）用 <code>x-container</code>。需要整张卡可点击时 <code>hoverable</code> 只给视觉暗示——语义上请再包一层 <code>&lt;a&gt;</code> 或自行绑事件补 <code>tabindex</code>。</p>

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="BOX_PROPS_ROWS" />
    <ApiTable title="插槽 Slots" :columns="['插槽', '说明']" :rows="BOX_SLOTS_ROWS" />
  </div>
</template>
