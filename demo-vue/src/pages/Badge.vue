<script setup lang="ts">
// Badge 徽标：独立胶囊/圆点 + 锚定四角、数字溢出折叠、语义色。仅「动态计数」含交互：
// 渲染标记 == source，:script 展示原生写法、不执行，真实加减/归零由 :setup 用 Vue 绑定。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// 交互的 Vue 侧实现：改 x-badge 的 value 属性即可（点击事件 composed，可从宿主直接监听）
const setupBadgeDyn = (root: HTMLElement) => {
  const badge = root.querySelector('#badge-dyn') as unknown as { value: string } | null;
  if (!badge) return;
  let count = 0;
  const paint = () => { badge.value = String(count); };
  root.querySelector('#badge-inc')?.addEventListener('click', () => { count += 1; paint(); });
  root.querySelector('#badge-dec')?.addEventListener('click', () => { count = Math.max(0, count - 1); paint(); });
  root.querySelector('#badge-zero')?.addEventListener('click', () => { count = 0; paint(); });
};

// API 表数据（严格对齐 src/components/badge/x-badge.ts）
const BADGE_PROPS_ROWS = [
  ['value', '徽标内容（数字或短文本）；空且非 dot 时整体隐藏', 'string', "''"],
  ['max', '纯数字超过 max 显示 `${max}+`；0 = 不设上限', 'number', '99'],
  ['dot', '圆点模式：只显示小圆点，忽略 value 文本', 'boolean', 'false'],
  ['show-zero', 'value 为 "0" 时是否仍显示（默认隐藏）', 'boolean', 'false'],
  ['color', '语义色（反射）', "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'", "'default'"],
  ['placement', '锚定角（反射，仅锚定态有意义）', "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'", "'top-right'"],
  ['size', '尺寸档位（反射）', "'sm' | 'md' | 'lg'", "'md'"],
];
const BADGE_SLOTS_ROWS = [['default', '放入任意元素即进入锚定态，徽标浮到其角上；不放内容则为独立胶囊/圆点']];
const BADGE_PARTS_ROWS = [['badge', 'x-badge', '徽标本体（胶囊/圆点）']];
</script>

<template>
  <div>
    <h1>Badge 徽标</h1>
    <p class="lead">小号状态标记：不塞内容时是行内胶囊/圆点（独立模式，当微标签用），塞了内容就浮到其四角（锚定模式，带背景色环与所附内容分隔）。数字超过 max 折叠为 <code>${max}+</code>，值为 0 默认隐藏。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-badge</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="独立用法"
      desc="不写子内容即行内胶囊；value 为文本或数字，dot 收成圆点"
      :source='`
<div class="demo-stage">
  <x-badge value="5"></x-badge>
  <x-badge value="41"></x-badge>
  <x-badge value="128" max="99"></x-badge>
  <x-badge value="new" color="danger"></x-badge>
  <x-badge value="HOT" color="primary" size="lg"></x-badge>
  <x-badge dot></x-badge>
</div>
`'
    />

    <Demo
      title="锚定到内容四角"
      desc="往 &lt;x-badge&gt; 里放任意元素即进入锚定态，placement 选角（默认 top-right）"
      :source='`
<div class="demo-stage" style="gap: 32px">
  <x-badge value="6" placement="top-right"><x-avatar text="X" color="primary" shape="rounded"></x-avatar></x-badge>
  <x-badge value="6" placement="top-left"><x-avatar text="X" color="primary" shape="rounded"></x-avatar></x-badge>
  <x-badge value="6" placement="bottom-right"><x-avatar text="X" color="primary" shape="rounded"></x-avatar></x-badge>
  <x-badge value="6" placement="bottom-left"><x-avatar text="X" color="primary" shape="rounded"></x-avatar></x-badge>
</div>
`'
    />

    <Demo
      title="数字溢出与 0 值"
      desc="纯数字超过 max 折叠为 ${max}+；value=&quot;0&quot; 默认隐藏，show-zero 强制显示"
      :source='`
<div class="demo-stage" style="gap: 24px">
  <x-badge value="99" max="99"></x-badge>
  <x-badge value="100" max="99"></x-badge>
  <x-badge value="9999" max="999"></x-badge>
  <x-badge value="0"></x-badge>
  <x-badge value="0" show-zero></x-badge>
</div>
`'
    />

    <Demo
      title="语义色"
      desc="color 走全库统一 7 角色；default 为中性反色实底，随主题明暗联动"
      :source='`
<div class="demo-stage">
  <x-badge value="●" color="default"></x-badge>
  <x-badge value="8" color="primary"></x-badge>
  <x-badge value="8" color="secondary"></x-badge>
  <x-badge value="8" color="success"></x-badge>
  <x-badge value="8" color="warning"></x-badge>
  <x-badge value="8" color="danger"></x-badge>
  <x-badge value="8" color="info"></x-badge>
</div>
`'
    />

    <Demo
      title="尺寸"
      desc="size 三档 sm/md/lg，胶囊高与圆点、字号一并联动"
      :source='`
<div class="demo-stage">
  <x-badge value="12" size="sm"></x-badge>
  <x-badge value="12" size="md"></x-badge>
  <x-badge value="12" size="lg"></x-badge>
</div>
`'
    />

    <Demo
      title="动态计数"
      desc="改 value 即时更新；归零后徽标自动消失（max=9 演示溢出）"
      :source='`
<div class="demo-stage" style="gap: 20px">
  <x-badge id="badge-dyn" value="0" max="9" color="danger"><x-icon name="settings" size="24px"></x-icon></x-badge>
  <x-button id="badge-inc" variant="soft" color="success">+1</x-button>
  <x-button id="badge-dec" variant="soft" color="secondary">-1</x-button>
  <x-button id="badge-zero" variant="outline">归零（看它消失）</x-button>
</div>
`'
      :script='`
const b = document.querySelector("#badge-dyn");
let count = 0;
const paint = () => b.value = String(count);
document.querySelector("#badge-inc").addEventListener("click", () => { count++; paint(); });
document.querySelector("#badge-dec").addEventListener("click", () => { count = Math.max(0, count - 1); paint(); });
document.querySelector("#badge-zero").addEventListener("click", () => { count = 0; paint(); });
`'
      :setup="setupBadgeDyn"
    />

    <h2>设计要点</h2>
    <p>徽标本身<b>不带交互</b>：它是纯展示标记，点击等交互应由其锚定的宿主元素承担。锚定/独立两态由内部检测 slot 是否有实际内容自动切换（<code>data-anchored</code>），无需手动开关。数字折叠只对<b>纯数字</b>字符串生效，<code>"new"</code> / <code>"12k+"</code> 等原样展示。</p>

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="BADGE_PROPS_ROWS" />
    <ApiTable title="插槽 Slots" :columns="['插槽', '说明']" :rows="BADGE_SLOTS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '所属', '说明']" :rows="BADGE_PARTS_ROWS" />
  </div>
</template>
