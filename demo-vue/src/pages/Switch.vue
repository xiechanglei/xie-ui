<script setup lang="ts">
// Switch 开关：二元切换控件。基础/禁用/图标插槽为静态；「事件监听」例的 x-change 回显由 :setup 实现。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// 图标插槽的 SVG（太阳/月亮），双引号属性、无单引号，可安全内联
const ICON_SOURCE = `<x-switch label="深色模式">
  <svg slot="off" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>
  <svg slot="on" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path></svg>
</x-switch>
<x-switch label="深色模式" checked>
  <svg slot="off" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>
  <svg slot="on" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path></svg>
</x-switch>`;

// 事件监听：x-change detail { checked, value }
const EVENT_SOURCE = `<x-switch id="sw-demo" label="受控示例" value="wifi"></x-switch>
<span id="sw-status" style="margin-left: 12px; font-size: 13px; color: var(--xie-color-muted)">当前：关</span>`;

const setupSwitchEvent = (root: HTMLElement) => {
  const sw = root.querySelector('#sw-demo');
  const status = root.querySelector('#sw-status');
  if (!sw) return;
  sw.addEventListener('x-change', (e) => {
    const d = (e as CustomEvent<{ checked: boolean; value: string }>).detail;
    if (status) status.textContent = `当前：${d.checked ? '开' : '关'}（value=${d.value}）`;
  });
};

// API 表数据（严格对齐 src/components/switch/x-switch.ts）
const SWITCH_PROPS_ROWS = [
  ['checked', '是否选中（反射，驱动滑块与配色）', 'boolean', 'false'],
  ['disabled', '是否禁用', 'boolean', 'false'],
  ['required', '表单校验：要求必须开启（配合 form/FCCE）', 'boolean', 'false'],
  ['name', '表单字段名（FCCE 的 FormData 键，反射）', 'string', "''"],
  ['label', '无障碍名称（aria-label：屏幕阅读器朗读，无视觉表现）', 'string', "''"],
  ['value', '随事件回传 / 计入表单的自定义值', 'string', "'on'"],
];
const SWITCH_METHODS_ROWS = [['toggle(force?)', '切换开关；可传目标态。会派发可取消的 x-change']];
const SWITCH_EVENTS_ROWS = [['x-change', '用户交互切换时派发（可 preventDefault 取消，程序化设值不触发）', '{ checked, value }']];
const SWITCH_SLOTS_ROWS = [
  ['on', '选中态滑块内图标（checked 时显示）'],
  ['off', '未选中态滑块内图标（未 checked 时显示）'],
];
const SWITCH_PARTS_ROWS = [['base', '内部原生 button'], ['track', '轨道'], ['thumb', '滑块']];
const SWITCH_VARS_ROWS = [
  ['--xie-switch-width', '开关宽度', '44px'],
  ['--xie-switch-height', '开关高度（滑块/图标据此换算）', '24px'],
  ['--xie-color-primary', '选中态轨道配色', '—'],
];
</script>

<template>
  <div>
    <h1>Switch 开关</h1>
    <p class="lead">用于在两种状态（开/关）之间切换的二元控件。基于原生 <code>&lt;button role="switch"&gt;</code>，可键盘聚焦、支持 Space/Enter 切换。勾选态经 form 关联（FCCE）计入外层表单。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-switch</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="checked 为布尔属性，存在即选中；交互切换派发 x-change"
      :source='`
<x-switch label="开关一"></x-switch>
<x-switch label="开关二" checked></x-switch>
`'
    />

    <Demo
      title="禁用态"
      desc="disabled 为布尔属性，存在即禁用"
      :source='`
<x-switch label="禁用·关" disabled></x-switch>
<x-switch label="禁用·开" disabled checked></x-switch>
`'
    />

    <Demo title="图标插槽（明暗切换）" desc='在滑块内放 slot="on" / slot="off" 图标，随状态自动显隐' :source="ICON_SOURCE" />

    <Demo
      title="事件监听"
      desc="x-change 为 composed 可取消事件，detail 携带最新 checked / value"
      :source="EVENT_SOURCE"
      :script='`
const sw = document.querySelector("#sw-demo");
const status = document.querySelector("#sw-status");
sw.addEventListener("x-change", (e) => {
  status.textContent = "当前：" + (e.detail.checked ? "开" : "关") + "（value=" + e.detail.value + "）";
});
`'
      :setup="setupSwitchEvent"
    />

    <h2>设计要点</h2>
    <p><b>受控友好</b>：程序化设置 <code>checked</code> 不派发事件，仅用户交互触发 <code>x-change</code>——该事件 <code>cancelable</code>，被 <code>preventDefault</code> 时状态回退。<b>无障碍</b>靠原生 button + <code>role="switch"</code> + <code>aria-checked</code>，<code>label</code> 映射 <code>aria-label</code>。<b>表单关联</b>：勾选时把 <code>value</code> 经 <code>setFormValue</code> 计入 <code>&lt;form&gt;</code>，<code>required</code> 要求必须开启，未勾选不计入。</p>

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="SWITCH_PROPS_ROWS" />
    <ApiTable title="方法 Methods" :columns="['方法', '说明']" :rows="SWITCH_METHODS_ROWS" />
    <ApiTable title="事件 Events" :columns="['事件', '说明', '回调参数']" :rows="SWITCH_EVENTS_ROWS" />
    <ApiTable title="插槽 Slots" :columns="['插槽', '说明']" :rows="SWITCH_SLOTS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '说明']" :rows="SWITCH_PARTS_ROWS" />
    <ApiTable title="CSS 变量 Variables" :columns="['变量', '说明', '默认']" :rows="SWITCH_VARS_ROWS" />
  </div>
</template>
