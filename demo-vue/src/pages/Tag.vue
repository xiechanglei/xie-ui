<script setup lang="ts">
// Tag 标签：variant×color 双轴正交 + 尺寸/胶囊/可关闭。矩阵为数据驱动（Vue v-for），
// 「可关闭」含交互：渲染标记 == source，真实移除由 :setup 监听 x-close 实现（:script 展示原生写法）。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

const COLORS = ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'];
const VARIANTS = ['soft', 'solid', 'outline', 'ghost'];

// 可关闭：组件不自删，宿主在 x-close 里裁决移除（这里与展示的原生片段一致——点 × 即移除）
const setupTagClose = (root: HTMLElement) => {
  const wrap = root.querySelector('#tag-closable');
  const status = root.querySelector('#tag-close-status');
  if (!wrap) return;
  wrap.addEventListener('x-close', (e) => {
    const t = e.target as HTMLElement;
    const name = (t.textContent ?? '').trim();
    t.remove();
    if (status) status.textContent = `已移除「${name}」`;
  });
};

// API 表数据（严格对齐 src/components/tag/x-tag.ts）
const TAG_PROPS_ROWS = [
  ['variant', '形态（反射）', "'soft' | 'solid' | 'outline' | 'ghost'", "'soft'"],
  ['color', '语义色（反射，与形态正交）', "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'", "'default'"],
  ['size', '尺寸档位（反射）', "'sm' | 'md' | 'lg'", "'md'"],
  ['closable', '是否显示关闭钮（反射）', 'boolean', 'false'],
  ['round', '胶囊形态·全圆角（反射）', 'boolean', 'false'],
];
const TAG_EVENTS_ROWS = [['x-close', '点击关闭钮派发（bubbles+composed+cancelable）；默认不自删，preventDefault 可拦截', '无']];
const TAG_SLOTS_ROWS = [['default', '标签文字内容（过长自动省略号截断）']];
const TAG_PARTS_ROWS = [
  ['base', 'x-tag', '标签外框'],
  ['label', 'x-tag', '文字容器'],
  ['close', 'x-tag', '关闭钮（closable 时）'],
];
</script>

<template>
  <div>
    <h1>Tag 标签</h1>
    <p class="lead">轻量分类标记。双轴范式与 x-button 同源：variant 选填充形态（soft/solid/outline/ghost）、color 选 7 角色语义色，二者正交、任意组合自动成立；另有尺寸、胶囊形态与可关闭。标签本身是展示件，「关闭」只对外派发 x-close，是否移除由宿主决定。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-tag</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="形态 variant"
      desc="soft(默认，淡底+强调字) / solid(实底) / outline(描边) / ghost(无底)"
      :source='`
<x-tag variant="soft">soft</x-tag>
<x-tag variant="solid">solid</x-tag>
<x-tag variant="outline">outline</x-tag>
<x-tag variant="ghost">ghost</x-tag>
`'
    />

    <Demo
      title="语义色 color"
      desc="全库统一 7 角色；default 为中性（随主题明暗翻转），其余 6 个强调角色"
      :source='`
<x-tag>default</x-tag>
<x-tag color="primary">primary</x-tag>
<x-tag color="secondary">secondary</x-tag>
<x-tag color="success">success</x-tag>
<x-tag color="warning">warning</x-tag>
<x-tag color="danger">danger</x-tag>
<x-tag color="info">info</x-tag>
`'
    />

    <!-- 组合矩阵：数据驱动的重复网格，用 Vue v-for 渲染（与 Icon 画廊同理，属「动态内容由 Vue 实现」） -->
    <div class="demo-card">
      <div class="demo-card__preview">
        <div style="display: flex; flex-direction: column; gap: 10px">
          <div v-for="v in VARIANTS" :key="v" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap">
            <span style="width: 56px; color: var(--xie-color-muted); font-size: 12px">{{ v }}</span>
            <x-tag v-for="c in COLORS" :key="c" :variant="v" :color="c">{{ c }}</x-tag>
          </div>
        </div>
      </div>
      <div class="demo-card__title">形态 × 语义色 组合<span> — 两轴正交，组合矩阵无需任何额外代码即自动成立</span></div>
    </div>

    <Demo
      title="尺寸"
      desc="size 三档 sm/md/lg，高度、内边距与字号一并联动"
      :source='`
<x-tag size="sm" color="info">sm</x-tag>
<x-tag size="md" color="info">md</x-tag>
<x-tag size="lg" color="info">lg</x-tag>
`'
    />

    <Demo
      title="胶囊 round"
      desc="全圆角形态，常用于状态/筛选 chip"
      :source='`
<x-tag round color="success">圆角</x-tag>
<x-tag round variant="solid" color="danger">实心胶囊</x-tag>
<x-tag round variant="outline" color="secondary">描边胶囊</x-tag>
`'
    />

    <Demo
      title="可关闭 closable"
      desc="显 × 钮，点它派发 x-close；组件不自删，由宿主在监听里决定移除"
      :column="true"
      :source='`
<div class="demo-stage" id="tag-closable">
  <x-tag closable color="primary">标签 A</x-tag>
  <x-tag closable color="secondary">标签 B</x-tag>
  <x-tag closable color="success">标签 C</x-tag>
</div>
<div id="tag-close-status" class="demo-status">点标签上的 × 试试</div>
`'
      :script='`
const wrap = document.querySelector("#tag-closable");
const status = document.querySelector("#tag-close-status");
wrap.addEventListener("x-close", (e) => {
  const name = e.target.textContent.trim();
  e.target.remove();                 // 宿主决定移除（x-close 可 cancelable，也能 preventDefault 拦截）
  status.textContent = "已移除「" + name + "」";
});
`'
      :setup="setupTagClose"
    />

    <h2>设计要点</h2>
    <p>与 x-button 同一双轴实现：<code>color</code> 只决定「这一支语义色」写进 <code>--_accent</code> 系变量，<code>variant</code> 只决定「如何消费它」（实底/淡底/描边/无底），两段 CSS 正交。标签是纯展示件，<b>关闭不自动消失</b>：<code>x-close</code> 派发后由宿主决定移除/隐藏。文字过长时省略号截断、不撑破容器。</p>

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="TAG_PROPS_ROWS" />
    <ApiTable title="事件 Events" :columns="['事件', '说明', 'detail']" :rows="TAG_EVENTS_ROWS" />
    <ApiTable title="插槽 Slots" :columns="['插槽', '说明']" :rows="TAG_SLOTS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '所属', '说明']" :rows="TAG_PARTS_ROWS" />
  </div>
</template>
