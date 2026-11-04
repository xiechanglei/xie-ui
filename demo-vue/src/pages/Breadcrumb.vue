<script setup lang="ts">
// Breadcrumb 面包屑：两件套（x-breadcrumb / x-breadcrumb-item）。
// 「超长收纳」监听 x-toggle、「受控展开/拦截跳转」监听可取消的 x-select，均由 :setup 实现；其余为静态。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

const FOLD_SOURCE = `<x-breadcrumb max-items="3" label="订单路径">
  <x-breadcrumb-item href="/">工作台</x-breadcrumb-item>
  <x-breadcrumb-item href="/orders">订单管理</x-breadcrumb-item>
  <x-breadcrumb-item href="/detail">订单详情</x-breadcrumb-item>
  <x-breadcrumb-item href="/refund">退款审批</x-breadcrumb-item>
  <x-breadcrumb-item>审批记录</x-breadcrumb-item>
</x-breadcrumb>
<div id="bc-toggle-log" style="margin-top: 8px; color: var(--xie-color-muted)">点「…」可展开</div>`;

const setupBcToggle = (root: HTMLElement) => {
  const b = root.querySelector('x-breadcrumb');
  const log = root.querySelector('#bc-toggle-log');
  if (!b || !log) return;
  b.addEventListener('x-toggle', (e) => {
    const collapsed = (e as CustomEvent<{ collapsed: boolean }>).detail.collapsed;
    log.textContent = '已展开（x-toggle · collapsed=' + collapsed + '）';
  });
};

const CONTROLLED_SOURCE = `<x-breadcrumb max-items="2" collapsed="false">
  <x-breadcrumb-item href="/工作台">工作台</x-breadcrumb-item>
  <x-breadcrumb-item href="/订单管理">订单管理</x-breadcrumb-item>
  <x-breadcrumb-item href="/订单详情">订单详情</x-breadcrumb-item>
  <x-breadcrumb-item href="/退款审批">退款审批</x-breadcrumb-item>
  <x-breadcrumb-item>审批记录</x-breadcrumb-item>
</x-breadcrumb>
<div id="bc-select-log" style="margin-top: 8px; color: var(--xie-color-muted)">点任意前项试试（已拦截跳转）</div>`;

const setupBcSelect = (root: HTMLElement) => {
  const b = root.querySelector('x-breadcrumb');
  const log = root.querySelector('#bc-select-log');
  if (!b || !log) return;
  b.addEventListener('x-select', (e) => {
    e.preventDefault(); // 拦下 <a> 原生跳转，改由前端路由处理
    const d = (e as CustomEvent<{ href: string; text: string }>).detail;
    log.textContent = '拦截到 ' + d.text + ' → ' + d.href;
  });
};

// API · x-breadcrumb
const BC_PROPS_ROWS = [
  ['separator', '分隔符形态（反射，扇出给各项）：slash / chevron / none', 'string', "'slash'"],
  ['size', '尺寸（反射）：sm / md / lg，下发字号与间距', 'string', "'md'"],
  ['max-items', '最多显示几格真实路径（反射，0/不写 = 不限）；「…」不占格，至少能合并两项才折', 'number', '0'],
  ['collapsed', '折叠态（反射）：仅与 max-items 配合有意义；同时承认字面量假值 collapsed="false"', 'boolean', 'true'],
  ['label', 'nav 的无障碍名', 'string', "'面包屑'"],
];
const BC_MEMBERS_ROWS = [
  ['expand()', '命令式展开全部（不派发 x-toggle，避免与外部状态回环）'],
  ['x-toggle', '点「…」展开时派发（bubbles+composed），detail:{ collapsed: false }'],
  ['part', 'nav / list'],
];
// API · x-breadcrumb-item
const ITEM_PROPS_ROWS = [
  ['href', '链接目标（不反射）：写了即真链接；当前页/折叠态下自动失效', 'string', "''"],
  ['separator', '分隔符形态（反射）：通常由根下沉，脱离根单独用时可自写', 'string', "'slash'"],
  ['current', '当前页（反射）：由根按「末项」回写；不可点 + aria-current="page"', 'boolean', 'false'],
  ['ellipsis', '折叠占位（反射）：由根回写，本项代表被折叠的前段渲染成「…」', 'boolean', 'false'],
];
const ITEM_MEMBERS_ROWS = [
  ['linkable', '只读：此刻是否为真链接（非当前页、非折叠占位且写了 href）'],
  ['x-select', '链接项点击时派发（bubbles+composed+cancelable），detail:{ href, text }；preventDefault 即阻止跳转'],
  ['part', 'base / separator / crumb / more'],
];
</script>

<template>
  <div>
    <h1>Breadcrumb 面包屑</h1>
    <p class="lead">路径导航两件套：<code>&lt;x-breadcrumb&gt;</code> 负责分隔符/当前页/超长收纳的协调与 <code>nav</code> 地标，<code>&lt;x-breadcrumb-item&gt;</code> 是其中一格路径（写了 <code>href</code> 即真链接）。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-breadcrumb / x-breadcrumb-item</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="末项自动识别为当前页（不可点 + aria-current），前项写了 href 即真链接"
      :source='`
<x-breadcrumb>
  <x-breadcrumb-item href="/">首页</x-breadcrumb-item>
  <x-breadcrumb-item href="/orders">订单管理</x-breadcrumb-item>
  <x-breadcrumb-item>订单详情</x-breadcrumb-item>
</x-breadcrumb>
`'
    />

    <Demo
      title="分隔符形态"
      desc="separator=slash（默认）/ chevron / none，由根扇出给各项"
      :source='`
<x-breadcrumb separator="slash">
  <x-breadcrumb-item href="/a">首页</x-breadcrumb-item>
  <x-breadcrumb-item href="/b">会员</x-breadcrumb-item>
  <x-breadcrumb-item>等级规则</x-breadcrumb-item>
</x-breadcrumb>
<div style="height: 8px"></div>
<x-breadcrumb separator="chevron">
  <x-breadcrumb-item href="/a">首页</x-breadcrumb-item>
  <x-breadcrumb-item href="/b">会员</x-breadcrumb-item>
  <x-breadcrumb-item>等级规则</x-breadcrumb-item>
</x-breadcrumb>
<div style="height: 8px"></div>
<x-breadcrumb separator="none">
  <x-breadcrumb-item href="/a">首页</x-breadcrumb-item>
  <x-breadcrumb-item href="/b">会员</x-breadcrumb-item>
  <x-breadcrumb-item>等级规则</x-breadcrumb-item>
</x-breadcrumb>
`'
    />

    <Demo
      title="尺寸"
      desc="size=sm / md（默认）/ lg，只下发字号与间距"
      :source='`
<x-breadcrumb size="sm">
  <x-breadcrumb-item href="/a">首页</x-breadcrumb-item>
  <x-breadcrumb-item href="/b">设置</x-breadcrumb-item>
  <x-breadcrumb-item>安全</x-breadcrumb-item>
</x-breadcrumb>
<div style="height: 6px"></div>
<x-breadcrumb size="md">
  <x-breadcrumb-item href="/a">首页</x-breadcrumb-item>
  <x-breadcrumb-item href="/b">设置</x-breadcrumb-item>
  <x-breadcrumb-item>安全</x-breadcrumb-item>
</x-breadcrumb>
<div style="height: 6px"></div>
<x-breadcrumb size="lg">
  <x-breadcrumb-item href="/a">首页</x-breadcrumb-item>
  <x-breadcrumb-item href="/b">设置</x-breadcrumb-item>
  <x-breadcrumb-item>安全</x-breadcrumb-item>
</x-breadcrumb>
`'
    />

    <Demo
      title="超长路径收纳"
      desc="max-items 限定最多显示几格真实路径，中间折成「…」；点它展开全部"
      :source="FOLD_SOURCE"
      :script='`
const bc = document.querySelector("x-breadcrumb");
bc.addEventListener("x-toggle", (e) => console.log(e.detail.collapsed)); // 点「…」展开全部并派发
`'
      :setup="setupBcToggle"
    />

    <Demo
      title="受控展开 / 拦截跳转"
      desc='collapsed="false" 直接全展开；preventDefault 掉 x-select 即可换成前端路由'
      :source="CONTROLLED_SOURCE"
      :script='`
const bc = document.querySelector("x-breadcrumb");
bc.addEventListener("x-select", (e) => {
  e.preventDefault();           // 阻止 <a> 原生跳转
  console.log(e.detail.href, e.detail.text); // detail:{ href, text }
});
`'
      :setup="setupBcSelect"
    />

    <Demo
      title="格内放图标"
      desc="默认插槽收富内容，图标 + 文字随意组合"
      :source='`
<x-breadcrumb separator="chevron">
  <x-breadcrumb-item href="/home"><x-icon name="user" size="1em"></x-icon>首页</x-breadcrumb-item>
  <x-breadcrumb-item href="/set"><x-icon name="settings" size="1em"></x-icon>设置</x-breadcrumb-item>
  <x-breadcrumb-item>主题</x-breadcrumb-item>
</x-breadcrumb>
`'
    />

    <h2>说明</h2>
    <p>无障碍：根渲染为 <code>&lt;nav aria-label&gt;</code> 地标，内部列表挂 <code>role=list</code>，各路由 <code>x-breadcrumb-item</code> 自补 <code>role=listitem</code>；当前页带 <code>aria-current=page</code>，分隔符 <code>aria-hidden</code> 不朗读。需要 <code>target</code>/<code>rel</code> 等原生链接属性时：不写 <code>href</code>，把 <code>&lt;a&gt;</code> 自己放进默认插槽。项与项之间靠换行收纳长路径，格内文字固定单行不折字。</p>

    <h2>API · x-breadcrumb</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="BC_PROPS_ROWS" />
    <ApiTable title="方法 / 事件 / Part" :columns="['名称', '说明']" :rows="BC_MEMBERS_ROWS" />

    <h2>API · x-breadcrumb-item</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="ITEM_PROPS_ROWS" />
    <ApiTable title="方法 / 事件 / Part" :columns="['名称', '说明']" :rows="ITEM_MEMBERS_ROWS" />
  </div>
</template>
