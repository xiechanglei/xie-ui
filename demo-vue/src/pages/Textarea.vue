<script setup lang="ts">
// Textarea 文本域：与 Input 同源的多行版。autosize/计数/形态/色/尺寸/拖拽为静态；「事件与受控」由 :setup 监听 x-input / x-change。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

const EVENT_SOURCE = `<div style="display: flex; gap: 12px; flex-wrap: wrap; width: 100%">
  <x-textarea id="ta-a" rows="3" placeholder="边打字边看下面" style="flex: 1; min-width: 200px"></x-textarea>
  <x-textarea id="ta-b" rows="3" placeholder="含 bad 会被拒绝（失焦触发）" style="flex: 1; min-width: 200px"></x-textarea>
</div>
<div style="display: flex; gap: 16px; margin-top: 8px">
  <span id="ta-live" style="font-size: 13px; color: var(--xie-color-muted)">x-input：—</span>
  <span id="ta-committed" style="font-size: 13px; color: var(--xie-color-muted)">x-change：—</span>
</div>`;

const setupTextareaEvent = (root: HTMLElement) => {
  const a = root.querySelector('#ta-a');
  const b = root.querySelector('#ta-b');
  const live = root.querySelector('#ta-live');
  const committed = root.querySelector('#ta-committed');
  if (!a || !b) return;
  a.addEventListener('x-input', (e) => {
    if (live) live.textContent = 'x-input：' + (e as CustomEvent<{ value: string }>).detail.value;
  });
  a.addEventListener('x-change', (e) => {
    if (committed) committed.textContent = 'x-change：' + (e as CustomEvent<{ value: string }>).detail.value;
  });
  b.addEventListener('x-change', (e) => {
    const ev = e as CustomEvent<{ value: string; previousValue: string }>;
    if (ev.detail.value.includes('bad')) {
      ev.preventDefault();
      if (committed) committed.textContent = 'x-change 被取消，回退到「' + ev.detail.previousValue + '」';
    }
  });
};

// API 表数据（严格对齐 src/components/textarea/x-textarea.ts）
const TA_PROPS_ROWS = [
  ['value', '当前值（程序化赋值不派发事件）', 'string', "''"],
  ['rows', '可见行数（autosize 时作最小高度）', 'number', '3'],
  ['max-rows', 'autosize 最大高度对应的行数（property maxRows）', 'number', 'undefined'],
  ['autosize', '高度随内容伸缩（反射）', 'boolean', 'false'],
  ['resize', '手动拖拽（反射）', "'none' | 'vertical' | 'both' | 'auto'", "'vertical'"],
  ['variant', '形态（反射）', "'outline' | 'filled' | 'flush'", "'outline'"],
  ['color', '语义色（反射，聚焦描边/光标）', "'primary' | … | 'info'", "'primary'"],
  ['size', '尺寸（反射，字号）', "'sm' | 'md' | 'lg'", "'md'"],
  ['placeholder / disabled / readonly / required', '同语义透传原生', '—', '—'],
  ['maxlength / show-count', '最大长度 / 显示 n(或 n/max) 计数（property showCount）', 'number | boolean', '—'],
  ['label', '无障碍名（aria-label）', 'string', "''"],
];
const TA_METHODS_ROWS = [['focus() / select()', '委托内部原生 textarea']];
const TA_EVENTS_ROWS = [
  ['x-input', '逐字符派发（composed）', '{ value }'],
  ['x-change', '提交时机（失焦）派发，可取消回退', '{ value, previousValue }'],
];
const TA_PARTS_ROWS = [['field', '外框'], ['input', '内部原生 textarea'], ['count', '字数计数']];
</script>

<template>
  <div>
    <h1>Textarea 文本域</h1>
    <p class="lead">与 Input 同源的多行版：shadow 内包原生 <code>&lt;textarea&gt;</code>，逐字符派发 <code>x-input</code>、失焦提交派发可取消的 <code>x-change</code>；形态 variant × 语义色 color 双轴，<code>autosize</code> 让高度随内容伸缩，同样支持 form 关联（FCCE）。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-textarea</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="rows 控制初始行数；程序化设 value 不派发事件"
      :column="true"
      :source='`<x-textarea placeholder="请输入备注…"></x-textarea>`'
    />

    <Demo
      title="自适应高度 autosize"
      desc="rows 作最小高度，max-rows 封顶，超出滚动"
      :column="true"
      :source='`<x-textarea autosize rows="2" max-rows="6" placeholder="逐行输入看看高度变化"></x-textarea>`'
    />

    <Demo
      title="计数 & maxLength"
      desc="show-count 实时显示 n/max"
      :column="true"
      :source='`<x-textarea show-count maxlength="50" rows="3" placeholder="最多 50 字"></x-textarea>`'
    />

    <Demo
      title="形态 variant"
      desc="outline / filled / flush"
      :column="true"
      :source='`
<x-textarea variant="outline" rows="2" placeholder="outline"></x-textarea>
<x-textarea variant="filled" rows="2" placeholder="filled"></x-textarea>
<x-textarea variant="flush" rows="2" placeholder="flush"></x-textarea>
`'
    />

    <Demo
      title="语义色 color & 尺寸 size"
      desc="聚焦描边/光标取色；size 影响字号"
      :column="true"
      :source='`
<div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-start">
  <x-textarea color="primary" rows="2" placeholder="primary"></x-textarea>
  <x-textarea color="success" rows="2" placeholder="success"></x-textarea>
  <x-textarea color="danger" rows="2" placeholder="danger"></x-textarea>
  <x-textarea size="sm" rows="2" placeholder="sm"></x-textarea>
  <x-textarea size="lg" rows="2" placeholder="lg"></x-textarea>
</div>
`'
    />

    <Demo
      title="拖拽 resize & 状态"
      desc="resize：vertical(默认)/none/both/auto；禁用/只读"
      :column="true"
      :source='`
<x-textarea resize="both" rows="2" placeholder="可拖拽 both"></x-textarea>
<x-textarea disabled rows="2" value="禁用"></x-textarea>
<x-textarea readonly rows="2" value="只读，仍可选中复制"></x-textarea>
`'
    />

    <Demo
      title="事件与受控"
      desc="逐字符 x-input；失焦提交 x-change，含 bad 会被拒绝回退"
      :column="true"
      :source="EVENT_SOURCE"
      :script='`
const ta = document.querySelector("#ta-a");
ta.addEventListener("x-input", (e) => console.log("实时", e.detail.value));
const b = document.querySelector("#ta-b");
b.addEventListener("x-change", (e) => {
  if (e.detail.value.includes("bad")) e.preventDefault(); // 拒绝 → 回退 previousValue
});
`'
      :setup="setupTextareaEvent"
    />

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="TA_PROPS_ROWS" />
    <ApiTable title="方法 Methods" :columns="['名称', '说明']" :rows="TA_METHODS_ROWS" />
    <ApiTable title="事件 Events" :columns="['事件', '说明', '回调参数']" :rows="TA_EVENTS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '说明']" :rows="TA_PARTS_ROWS" />
  </div>
</template>
