<script setup lang="ts">
// Input 输入框：形态×颜色双轴、尺寸、前后缀插槽、清除/计数、类型、受控事件。
// 除「事件与受控」例外均为静态；受控例由 :setup 监听 x-input / x-change（含 preventDefault 回退）。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// 事件与受控：x-input 逐字符 { value }；x-change 提交 { value, previousValue } 可取消回退
const EVENT_SOURCE = `<div style="display: flex; gap: 12px; align-items: center; width: 100%">
  <x-input id="inp-a" placeholder="边打字边看下面" clearable style="width: 200px"></x-input>
  <x-input id="inp-b" placeholder="含 bad 会被拒绝" style="width: 200px"></x-input>
</div>
<div style="display: flex; gap: 16px; margin-top: 8px">
  <span id="inp-live" style="font-size: 13px; color: var(--xie-color-muted)">x-input：—</span>
  <span id="inp-committed" style="font-size: 13px; color: var(--xie-color-muted)">x-change：—</span>
</div>`;

const setupInputEvent = (root: HTMLElement) => {
  const a = root.querySelector('#inp-a');
  const b = root.querySelector('#inp-b');
  const live = root.querySelector('#inp-live');
  const committed = root.querySelector('#inp-committed');
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

// API 表数据（严格对齐 src/components/input/x-input.ts）
const INPUT_PROPS_ROWS = [
  ['value', '当前值（程序化赋值不派发事件，作为受控数据源）', 'string', "''"],
  ['type', '原生类型透传（决定键盘/校验/掩码）', "'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'", "'text'"],
  ['variant', '形态（反射）：描边 / 灰底 / 下划线', "'outline' | 'filled' | 'flush'", "'outline'"],
  ['color', '语义色（反射）：聚焦描边、光环与光标取色', "'primary' | 'secondary' | … | 'info'", "'primary'"],
  ['size', '尺寸档位（反射，吃 --xie-size-*）', "'sm' | 'md' | 'lg'", "'md'"],
  ['placeholder', '占位提示', 'string', "''"],
  ['disabled', '禁用', 'boolean', 'false'],
  ['readonly', '只读（仍可聚焦、选中复制）', 'boolean', 'false'],
  ['required', '必填标记（透传原生 + aria-required）', 'boolean', 'false'],
  ['clearable', '有内容时显出清空按钮（禁用/只读时不显）', 'boolean', 'false'],
  ['show-password', '密码可见切换钮（仅 type=password 且非禁用时显）', 'boolean', 'false'],
  ['maxlength', '最大长度（透传原生；配合 show-count 显示 n/max）', 'number', 'undefined'],
  ['show-count', '显示字数计数（property showCount，反射）', 'boolean', 'false'],
  ['label', '无障碍名称（aria-label）', 'string', "''"],
  ['name', '表单字段名（FCCE 的 FormData 键，反射）', 'string', "''"],
];
const INPUT_METHODS_ROWS = [['focus(options?)', '聚焦到内部原生 input'], ['select()', '全选输入内容']];
const INPUT_EVENTS_ROWS = [
  ['x-input', '每次输入实时派发（同值不重复派）', '{ value }'],
  ['x-change', '提交时机（失焦 / 回车 / 点清空）派发，可 preventDefault 取消 → 回退到 previousValue', '{ value, previousValue }'],
];
const INPUT_SLOTS_ROWS = [['prefix', '前缀（图标/文字），自动弱化色'], ['suffix', '后缀（单位/图标），排在清空按钮之前']];
const INPUT_PARTS_ROWS = [
  ['field', '外框（描边/圆角/背景都在这层）'],
  ['input', '内部原生 input'],
  ['reveal', '密码显隐按钮'],
  ['clear', '清空按钮'],
  ['count', '字数计数'],
];
</script>

<template>
  <div>
    <h1>Input 输入框</h1>
    <p class="lead">单行文本输入。内部包一个原生 <code>&lt;input&gt;</code>（键盘、输入法、复制粘贴、类型校验全部白送），外层由本库统一绘制度；形态 variant × 语义色 color 双轴正交，尺寸/圆角/颜色均吃全局令牌，随主题面板实时联动。宿主为 form 关联元素（FCCE）。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-input</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="placeholder 提示；value 为当前值（程序化赋值不会触发事件）"
      :source='`
<x-input placeholder="请输入用户名"></x-input>
<x-input placeholder="已有默认值" value="xie"></x-input>
`'
    />

    <Demo
      title="形态 variant"
      desc="outline（默认描边）/ filled（灰底聚焦显边）/ flush（下划线），与 color 正交"
      :source='`
<x-input variant="outline" value="描边"></x-input>
<x-input variant="filled" value="填充"></x-input>
<x-input variant="flush" value="下划线"></x-input>
`'
    />

    <Demo
      title="尺寸 size"
      desc="sm / md（默认）/ lg，吃 --xie-size-* 档位"
      :source='`
<x-input size="sm" placeholder="小号"></x-input>
<x-input placeholder="默认中号"></x-input>
<x-input size="lg" placeholder="大号"></x-input>
`'
    />

    <Demo
      title="语义色 color"
      desc="聚焦描边、光环与光标取色；primary（默认）/ secondary / success / warning / danger / info"
      :source='`
<x-input color="primary" value="primary" style="width: 120px"></x-input>
<x-input color="secondary" value="secondary" style="width: 120px"></x-input>
<x-input color="success" value="success" style="width: 120px"></x-input>
<x-input color="warning" value="warning" style="width: 120px"></x-input>
<x-input color="danger" value="danger" style="width: 120px"></x-input>
<x-input color="info" value="info" style="width: 120px"></x-input>
`'
    />

    <Demo
      title="前后缀插槽"
      desc='slot="prefix" / slot="suffix" 放图标或单位，自动弱化色且不参与滚动'
      :source='`
<x-input placeholder="搜索…">
  <x-icon slot="prefix" name="user" size="16px"></x-icon>
</x-input>
<x-input value="128" style="width: 160px">
  <x-text slot="suffix" variant="caption">元</x-text>
</x-input>
`'
    />

    <Demo
      title="可清除 & 计数"
      desc="clearable 有内容时才显出 ×；show-count 显示 n/maxlength"
      :source='`
<x-input clearable value="点右边的 × 清空" style="width: 220px"></x-input>
<x-input show-count maxlength="12" placeholder="最多 12 字" style="width: 220px"></x-input>
`'
    />

    <Demo
      title="状态 disabled / readonly / required"
      desc="禁用半透明不可交互；只读灰底仍可选中复制；required 只做 aria 与样式钩子"
      :source='`
<x-input disabled value="禁用"></x-input>
<x-input readonly value="只读内容"></x-input>
<x-input required placeholder="必填"></x-input>
`'
    />

    <Demo
      title="类型 type"
      desc="原生 type 透传：password / email / number 等；show-password 显出眼睛钮切换明文/掩码（不抢焦点）"
      :source='`
<x-input type="password" value="secret" style="width: 160px"></x-input>
<x-input type="password" show-password value="abc12345" placeholder="密码" style="width: 200px"></x-input>
<x-input type="number" placeholder="数量" style="width: 120px"></x-input>
<x-input type="email" placeholder="name@example.com" style="width: 220px"></x-input>
`'
    />

    <Demo
      title="事件与受控"
      desc="输入逐字符派发 x-input；失焦/回车提交时派发可取消的 x-change（preventDefault 则回退旧值）"
      :column="true"
      :source="EVENT_SOURCE"
      :script='`
const a = document.querySelector("#inp-a");
a.addEventListener("x-input", (e) => console.log("实时", e.detail.value));
const b = document.querySelector("#inp-b");
b.addEventListener("x-change", (e) => {
  if (e.detail.value.includes("bad")) e.preventDefault(); // 拒绝本次提交 → 回退 previousValue
});
`'
      :setup="setupInputEvent"
    />

    <h2>设计约定</h2>
    <p>shadow 内的原生 input 不直接参与外部 <code>&lt;form&gt;</code> 提交，取值走 <code>value</code> 属性 / <code>x-input</code> / <code>x-change</code>；宿主经 FCCE 把值计入外层 form。number 自绘步进箭头与 Edge 显密钮观感与本库不符，已在 CSS 关闭；密码显隐由 <code>show-password</code> 自绘（眼睛图标切换、不对外暴露、不抢输入焦点）。</p>

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="INPUT_PROPS_ROWS" />
    <ApiTable title="方法 Methods" :columns="['方法', '说明']" :rows="INPUT_METHODS_ROWS" />
    <ApiTable title="事件 Events" :columns="['事件', '说明', '回调参数']" :rows="INPUT_EVENTS_ROWS" />
    <ApiTable title="插槽 Slots" :columns="['插槽', '说明']" :rows="INPUT_SLOTS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '说明']" :rows="INPUT_PARTS_ROWS" />
  </div>
</template>
