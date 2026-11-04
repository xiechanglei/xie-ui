<script setup lang="ts">
// Select 选择器：自绘弹层 listbox。基础（light DOM option）/形态/色为静态；
// options 数组、受控默认值&事件、多选三例需 JS 数据源，其挂载与 x-change 由 :setup 实现。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

type SelOpt = { value: string; label: string; disabled?: boolean };
type OptionsHost = { options: (SelOpt | string)[] };
type ValuesHost = { values: string[] };

const ARRAY_SOURCE = `<x-select id="sel-fr" placeholder="挑一个框架" style="width: 220px"></x-select>`;
const setupSelectArray = (root: HTMLElement) => {
  const el = root.querySelector('#sel-fr');
  if (!el) return;
  (el as unknown as OptionsHost).options = [
    { value: 'vue', label: 'Vue' },
    { value: 'react', label: 'React' },
    { value: 'svelte', label: 'Svelte', disabled: true },
    '原生字符串项',
  ];
};

const CTRL_SOURCE = `<x-select id="sel-demo" value="sh" style="width: 180px"></x-select>
<p id="sel-out" style="margin: 12px 0 0; color: var(--xie-color-muted)">x-change：上海</p>`;
const setupSelectControlled = (root: HTMLElement) => {
  const el = root.querySelector('#sel-demo');
  const out = root.querySelector('#sel-out');
  if (!el) return;
  (el as unknown as OptionsHost).options = [
    { value: 'bj', label: '北京' },
    { value: 'sh', label: '上海' },
    { value: 'other', label: '其他' },
  ];
  el.addEventListener('x-change', (e) => {
    const ev = e as CustomEvent<{ value: string; previousValue: string }>;
    if (ev.detail.value === 'other') {
      ev.preventDefault();
      if (out) out.textContent = 'x-change 被取消，回到「' + ev.detail.previousValue + '」';
    } else if (out) {
      out.textContent = 'x-change：' + ev.detail.value;
    }
  });
};

const MULTI_SOURCE = `<x-select id="sel-multi" multiple placeholder="选框架（可多选）" style="width: 240px"></x-select>
<p id="sel-multi-out" style="margin: 12px 0 0; color: var(--xie-color-muted)">x-change：—</p>`;
const setupSelectMulti = (root: HTMLElement) => {
  const el = root.querySelector('#sel-multi');
  const out = root.querySelector('#sel-multi-out');
  if (!el) return;
  (el as unknown as OptionsHost).options = ['Vue', 'React', 'Svelte', { value: 'jquery', label: 'jQuery（禁用）', disabled: true }];
  (el as unknown as ValuesHost).values = ['Vue'];
  el.addEventListener('x-change', (e) => {
    const val = (e as CustomEvent<{ value: string[] }>).detail.value;
    if (out) out.textContent = 'x-change：' + JSON.stringify(val);
  });
};

// API（严格对齐 src/components/select/x-select.ts）
const SELECT_PROPS_ROWS = [
  ['value', '选中值（程序化赋值回显，不派发事件）', 'string', "''"],
  ['options', '选项数组（JS 设置；优先于 light DOM option）', '({value,label,disabled}|string)[]', 'undefined'],
  ['placeholder', '未选占位（muted 色展示，不进弹层列表）', 'string', "''"],
  ['multiple', '多选模式（反射；选中不关弹层）', 'boolean', 'false'],
  ['name', '表单名（反射，FormData 键）', 'string', "''"],
  ['variant', '形态（反射）', "'outline' | 'filled' | 'flush'", "'outline'"],
  ['color', '语义色（反射，聚焦描边）', "'primary' | … | 'info'", "'primary'"],
  ['size', '尺寸（反射）', "'sm' | 'md' | 'lg'", "'md'"],
  ['disabled / required / label', '禁用 / 必填校验 / 无障碍名', '—', '—'],
];
const SELECT_MEMBERS_ROWS = [
  ['focus()', '聚焦触发件（弹层可用键盘操作）'],
  ['values（读写）', '多选选中值数组（程序化设置不派发事件）'],
  ['x-change', '单选 detail:{ value, previousValue }（string）；多选为 string[]；可取消回退'],
];
const SELECT_SOURCE_ROWS = [
  ['light DOM <option>', '写原生 <option value=..>文本</option>，或 <x-select-option value label>'],
  ['options 数组', '元素可为字符串或 { value, label, disabled }；设置后覆盖 slot 来源'],
];
</script>

<template>
  <div>
    <h1>Select 选择器</h1>
    <p class="lead">自绘下拉：触发件是无边框 button，弹层是吃全局令牌的 listbox（圆角/阴影/语义色/暗色随主题实时联动，选中项高亮打勾，空间不足自动向上翻转）。键盘完整：↑↓ 开合与移动、Home/End、Enter 选中、Esc 关闭，点击外部自动收起。选项来源二选一（数组优先）。支持 form 关联（FCCE）。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-select</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法（light DOM option）"
      desc="直接写原生 &lt;option&gt;；placeholder 作未选占位"
      :source='`
<x-select placeholder="请选择城市" style="width: 200px">
  <option value="bj">北京</option>
  <option value="sh">上海</option>
  <option value="gz">广州</option>
</x-select>
`'
    />

    <Demo
      title="options 数组"
      desc="JS 传 { value, label, disabled } 数组或字符串项，适合动态数据"
      :source="ARRAY_SOURCE"
      :script='`
const sel = document.querySelector("#sel-fr");
sel.options = [
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte", disabled: true },
  "原生字符串项",
];
`'
      :setup="setupSelectArray"
    />

    <Demo
      title="受控默认值 & 事件"
      desc="设 value 回显；变化派发可取消的 x-change（选 other 被拒绝回退）"
      :column="true"
      :source="CTRL_SOURCE"
      :script='`
const sel = document.querySelector("#sel-demo");
sel.options = [
  { value: "bj", label: "北京" },
  { value: "sh", label: "上海" },
  { value: "other", label: "其他" },
];
sel.addEventListener("x-change", (e) => {
  if (e.detail.value === "other") e.preventDefault(); // 拒绝 → 回退 previousValue
});
`'
      :setup="setupSelectControlled"
    />

    <Demo
      title="多选 multiple"
      desc="选中不关弹层、可连点多项；用 values 数组读写，展示文本用「、」拼接"
      :column="true"
      :source="MULTI_SOURCE"
      :script='`
const sel = document.querySelector("#sel-multi");
sel.options = ["Vue", "React", "Svelte", { value: "jquery", label: "jQuery（禁用）", disabled: true }];
sel.values = ["Vue"]; // 程序化设置不派发事件
sel.addEventListener("x-change", (e) => console.log(JSON.stringify(e.detail.value)));
`'
      :setup="setupSelectMulti"
    />

    <Demo
      title="形态 variant & 尺寸 size"
      desc="outline / filled / flush；sm / md / lg"
      :source='`
<x-select variant="outline" placeholder="outline" style="width: 140px"><option>A</option><option>B</option></x-select>
<x-select variant="filled" placeholder="filled" style="width: 140px"><option>A</option><option>B</option></x-select>
<x-select variant="flush" placeholder="flush" style="width: 140px"><option>A</option><option>B</option></x-select>
<x-select size="sm" placeholder="sm" style="width: 120px"><option>A</option></x-select>
<x-select size="lg" placeholder="lg" style="width: 120px"><option>A</option></x-select>
`'
    />

    <Demo
      title="语义色 color & 状态"
      desc="聚焦描边取色；disabled 不可开合"
      :source='`
<x-select color="primary" placeholder="primary" style="width: 120px"><option>A</option><option>B</option></x-select>
<x-select color="success" placeholder="success" style="width: 120px"><option>A</option><option>B</option></x-select>
<x-select color="danger" placeholder="danger" style="width: 120px"><option>A</option><option>B</option></x-select>
<x-select disabled placeholder="禁用" style="width: 120px"><option>A</option></x-select>
`'
    />

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="SELECT_PROPS_ROWS" />
    <ApiTable title="方法 / 事件" :columns="['名称', '说明']" :rows="SELECT_MEMBERS_ROWS" />
    <ApiTable title="选项来源" :columns="['方式', '说明']" :rows="SELECT_SOURCE_ROWS" />
  </div>
</template>
