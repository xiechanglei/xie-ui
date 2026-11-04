<script setup lang="ts">
// Flex 弹性布局原子：direction / gap / align / justify / wrap / inline。纯展示。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// 演示用色块（渲染 == 展示源码：把占位 div 的内联样式如实写进 source）
const PAL = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];
const cell = (t: string, i = 0) => `<div style="width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #fff; background: ${PAL[i % 4]}">${t}</div>`;
const cells = (arr: string[]) => arr.map((t, i) => cell(t, i)).join('');

const FLEX_DEFAULT = `<x-flex>\n  ${cells(['1', '2', '3', '4'])}\n</x-flex>`;
const FLEX_GAP = `<x-flex gap="md">\n  ${cells(['1', '2', '3', '4'])}\n</x-flex>`;
const FLEX_COLUMN = `<x-flex direction="column" gap="sm">\n  ${cells(['A', 'B', 'C'])}\n</x-flex>`;
const FLEX_JUSTIFY = `<x-flex justify="space-between" gap="md" style="width: 100%">\n  ${cell('L', 0)}\n  ${cell('R', 3)}\n</x-flex>`;
const FLEX_ALIGN = `<x-flex align="flex-end" gap="sm" style="height: 80px; border: 1px dashed var(--xie-color-border)">\n  ${cell('a', 0)}\n  <div style="width: 48px; height: 64px; border-radius: 8px; background: #8b5cf6"></div>\n  ${cell('c', 2)}\n</x-flex>`;
const FLEX_WRAP = `<x-flex wrap gap="md" style="width: 200px">\n  ${cells(['1', '2', '3', '4', '5', '6'])}\n</x-flex>`;

// API 表数据（严格对齐 src/components/flex/x-flex.ts）
const FLEX_PROPS_ROWS = [
  ['direction', '主轴方向', "'row' | 'row-reverse' | 'column' | 'column-reverse'", "'row'"],
  ['align', '交叉轴对齐（align-items）', 'CSS 值，如 center / flex-end', "'normal'（=stretch，不强加 center）"],
  ['justify', '主轴对齐（justify-content）', 'CSS 值，如 space-between / center', "'flex-start'"],
  ['wrap', '是否换行（flex-wrap:wrap）', 'boolean', 'false'],
  ['inline', '行内盒（inline-flex 而非 flex）', 'boolean', 'false'],
  ['gap', '间距：令牌别名或 CSS 长度', "'none' | 'xs' | 'sm' | 'md' | 'lg' | <长度>", "'sm'（≈8px）"],
];
const FLEX_SLOTS_ROWS = [['(默认)', '弹性内容']];
const FLEX_PARTS_ROWS = [['base', '内部包裹盒（display:contents，仅作定制钩子）']];
</script>

<template>
  <div>
    <h1>Flex 弹性布局</h1>
    <p class="lead">把常见的 display:flex 排布收敛为几个可配置属性；gap 可直接吃设计令牌别名（none/xs/sm/md/lg），随主题尺寸档位联动。默认往「开箱即用即常用」靠拢：默认带 sm 间距、justify 从首、align 不强加。用于替代各处手写的 display:flex;gap:… 样式。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-flex</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo title="默认（横排）" desc="不写任何属性：direction=row、默认 gap=sm（≈8px）、justify=flex-start、align=normal" :source="FLEX_DEFAULT" />
    <Demo title="横向 + 间距" desc="direction=row（默认），gap 用令牌别名 md" :source="FLEX_GAP" />
    <Demo title="纵向" desc="direction=column，gap=sm" :source="FLEX_COLUMN" />
    <Demo title="主轴对齐" desc="justify=between，撑满一行" :column="true" :source="FLEX_JUSTIFY" />
    <Demo title="交叉轴对齐 + 高度" desc="align=end，容器高 80px" :column="true" :source="FLEX_ALIGN" />
    <Demo title="换行" desc="wrap + gap=md，容器宽度受限" :column="true" :source="FLEX_WRAP" />

    <p>提示：x-flex 是<b>表现层</b>容器。gap 别名 <code>none/xs/sm/md/lg</code> 映射到 <code>--xie-space-1..4</code>；更大或自定义间距直接传 CSS 长度（如 <code>gap="20px"</code>）。</p>

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="FLEX_PROPS_ROWS" />
    <ApiTable title="插槽 Slots" :columns="['插槽', '说明']" :rows="FLEX_SLOTS_ROWS" />
    <ApiTable title="CSS 部分 Part" :columns="['part', '说明']" :rows="FLEX_PARTS_ROWS" />
  </div>
</template>
