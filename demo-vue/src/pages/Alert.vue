<script setup lang="ts">
// Alert 警告提示：x-alert 单件（soft/solid 形态 × 7 角色语义色 + 标题 + 富内容 + 可关闭）。
// 前 5 例为静态；「可关闭 closable」监听 x-close 由宿主隐藏，经 :setup 实现。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

const setupAlertClosable = (root: HTMLElement) => {
  const wrap = root.querySelector('#alert-close-wrap');
  const status = root.querySelector('#alert-close-status');
  if (!wrap) return;
  wrap.addEventListener('x-close', (e) => {
    (e.target as HTMLElement).hidden = true; // 组件不自删：宿主决定隐藏还是 remove
    if (status) status.textContent = '已隐藏一条（x-close 可 preventDefault 拦截）';
  });
};

// API
const ALERT_PROPS_ROWS = [
  ['variant', '形态（反射）', "'soft' | 'solid'", "'soft'"],
  ['color', '语义色（反射，图标跟随它）', "'info' | 'success' | 'warning' | 'danger' | 'primary' | 'secondary' | 'default'", "'info'"],
  ['title', '标题文本（不反射，与正文分两层）', 'string', "''"],
  ['icon', '显示图标（反射）', 'boolean', 'true'],
  ['closable', '显示关闭钮（反射）', 'boolean', 'false'],
];
const ALERT_EVENTS_ROWS = [['x-close', '点关闭钮派发（bubbles+composed+cancelable）；组件不自删，preventDefault 可拦截', '无']];
const ALERT_SLOTS_ROWS = [['default', '提示正文（富内容随意放）']];
const ALERT_PARTS_ROWS = [
  ['base', 'x-alert', '提示块外框'],
  ['icon', 'x-alert', '图标层'],
  ['title', 'x-alert', '标题层'],
  ['body', 'x-alert', '正文容器'],
  ['close', 'x-alert', '关闭钮（closable 时）'],
];
</script>

<template>
  <div>
    <h1>Alert 警告提示</h1>
    <p class="lead">页面内联的常驻提示块——toast 的「不会自己消失」版。配色与 toast 同源、形态走全库双轴范式：<code>color</code> 选 7 角色语义色、<code>variant</code> 选 soft(淡底)/solid(实底)；<code>icon</code> 跟随 color 自动配，<code>title</code> 属性起标题层，正文默认插槽放富内容；<code>closable</code> 出关闭钮，派发 <code>x-close</code> 由宿主裁决去留。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-alert</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="形态 variant"
      desc="soft(默认，淡底强调标题) / solid(实底反色)"
      :column="true"
      :source='`
<div style="display: flex; flex-direction: column; gap: 14px">
  <x-alert color="primary">soft 形态：淡色底 + 强调标题，正文常规前景色（默认）</x-alert>
  <x-alert variant="solid" color="primary">solid 形态：实底反色，强调场景更重</x-alert>
</div>
`'
    />

    <Demo
      title="语义色 color"
      desc="图标跟随 color；default/primary 无图标自动收起"
      :column="true"
      :source='`
<div style="display: flex; flex-direction: column; gap: 14px">
  <x-alert color="info">info 角色的提示内容</x-alert>
  <x-alert color="success">success 角色的提示内容</x-alert>
  <x-alert color="warning">warning 角色的提示内容</x-alert>
  <x-alert color="danger">danger 角色的提示内容</x-alert>
  <x-alert color="primary">primary 角色的提示内容</x-alert>
  <x-alert color="default">default 角色的提示内容</x-alert>
</div>
`'
    />

    <Demo
      title="标题 + 正文"
      desc="title 属性起标题层，默认插槽放正文"
      :column="true"
      :source='`
<div style="display: flex; flex-direction: column; gap: 14px">
  <x-alert color="warning" title="部署即将开始">服务将在 5 分钟后重启，请保存好工作。</x-alert>
  <x-alert color="danger" title="配额不足" variant="solid">本月 API 调用额度已用完，升级套餐可解除限制。</x-alert>
</div>
`'
    />

    <Demo
      title="富内容"
      desc="正文里放按钮/链接/段落都行"
      :column="true"
      :source='`
<x-alert color="danger" title="依赖更新">
  <div style="display: flex; flex-direction: column; gap: 10px">
    <p style="margin: 0">仓库有新版本，包含两个破坏性变更。</p>
    <div style="display: flex; gap: 8px">
      <x-button size="sm" variant="solid" color="danger">查看变更</x-button>
      <x-button size="sm" variant="outline">稍后</x-button>
    </div>
  </div>
</x-alert>
`'
    />

    <Demo
      title="关掉图标"
      desc='icon 默认开；置 false 纯文字'
      :column="true"
      :source='`
<x-alert icon="false" color="success">icon 关掉，只留文字（icon 名跟随 color，default/primary 本来就没有图标）</x-alert>
`'
    />

    <Demo
      title="可关闭 closable"
      desc="点 × 派发 x-close；组件不自删，宿主决定隐藏还是移除"
      :column="true"
      :source='`
<div id="alert-close-wrap" style="display: flex; flex-direction: column; gap: 14px">
  <x-alert closable color="info" title="这条可以关掉">点右侧 × ——组件不自删，宿主监听 x-close 决定去留（本例直接隐藏）。</x-alert>
  <x-alert closable color="secondary">再点一条试试。</x-alert>
</div>
<div id="alert-close-status" style="margin-top: 12px; color: var(--xie-color-muted)">还没关过</div>
`'
      :script='`
wrap.addEventListener("x-close", (e) => {
  e.target.hidden = true;   // 或直接 e.target.remove()
});
// x-close 是 cancelable 的，e.preventDefault() 可拦截（如二次确认）
`'
      :setup="setupAlertClosable"
    />

    <h2>设计要点</h2>
    <p>与 x-tag 同一<b>双轴正交</b>：<code>color</code> 只把语义色写进 <code>--_accent</code> 三件套，<code>variant</code> 只决定怎么消费（淡底/实底），新增一轴不影响另一轴。soft 形态下<b>正文回退常规前景色</b>——淡底上大面积强调字难读，标题/图标吃强调色就够了。图标名不开放自定义：<code>ALERT_ICONS</code> 表跟随 color（与 toast 同一张表）。<code>closable</code> 契约与 x-tag/x-toast 对齐：<code>x-close</code>（bubbles/composed/cancelable）先问再关，隐藏/移除/拦截都归宿主。<code>role="alert"</code> 让内容出现即被读屏播报。</p>

    <h2>API</h2>
    <ApiTable title="x-alert · 属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="ALERT_PROPS_ROWS" />
    <ApiTable title="事件 Events" :columns="['事件', '说明', 'detail']" :rows="ALERT_EVENTS_ROWS" />
    <ApiTable title="插槽 Slots" :columns="['插槽', '说明']" :rows="ALERT_SLOTS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '所属', '说明']" :rows="ALERT_PARTS_ROWS" />
  </div>
</template>
