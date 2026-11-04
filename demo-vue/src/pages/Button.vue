<script setup lang="ts">
// Button 文档页：演示全部走通用 <Demo> —— 渲染的标记永远 == source（所见即所渲染）。
// 纯 HTML 案例只给 source；含交互案例的 :script 只是【展示用】原生写法，真实效果由 :setup 用 Vue 绑定实现。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// API 表数据（严格对齐 src/components/button/x-button.ts）
const PROPS_ROWS = [
  ['variant', "'solid' | 'outline' | 'ghost' | 'soft'", "'solid'", '形态（填充样式）轴'],
  ['color', "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'", "'primary'", '语义色轴，与形态正交；default 为中性缺省态（次要/取消），非强调角色'],
  ['size', "'sm' | 'md' | 'lg'", "'md'", '尺寸'],
  ['command', 'string', "''", '点击后向上递交的命令名，由链上最近认领者处理：x-form 认领 submit / reset，x-dialog / x-drawer 认领 close；无人认领则无副作用'],
  ['disabled', 'boolean', 'false', '禁用（未定义外观，出现即为 true）'],
  ['loading', 'boolean', 'false', '加载中（自动禁用并显示 spinner）'],
];
const EVENTS_ROWS = [
  ['x-click', '{ originalEvent: MouseEvent }', '点击后派发（composed 可冒泡出 Shadow DOM）；disabled / loading 时不触发，可 preventDefault 取消'],
];
const SLOTS_ROWS = [
  ['default', '按钮内容：纯文本、x-icon + 文本（前后缀皆可，组件自带间距），或只放 x-icon 作图标钮'],
];
const PARTS_ROWS = [
  ['base', '内部原生 button 元素'],
  ['label', '文本容器'],
  ['spinner', '加载指示器'],
];
const VARS_ROWS = [
  ['--xie-color-{color}', '对应语义色（本体 / hover / soft / fg）；color 属性决定取哪一支'],
  ['--xie-soft-mix', 'soft 淡底混合方向（随 light / dark 翻转）'],
  ['--xie-radius-md', '圆角'],
];

// —— 交互演示的 Vue 侧实现（渲染标记仍 == source；:script 展示原生写法、不执行）——
const setText = (id: string, v: string) => {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
};
const setupForm = (root: HTMLElement) => {
  const form = root.querySelector('#btn-form');
  if (!form) return;
  form.addEventListener('x-submit', (e) => {
    const values = (e as CustomEvent<{ values?: Record<string, unknown> }>).detail?.values;
    setText('btn-form-status', 'x-submit：' + JSON.stringify(values));
  });
  form.addEventListener('x-invalid', () => setText('btn-form-status', '校验未通过：关键词必填'));
};
const setupDialog = (root: HTMLElement) => {
  root.querySelector('#btn-open-dlg')?.addEventListener('click', () => {
    const dlg = document.getElementById('btn-dlg') as unknown as { show?: () => void } | null;
    dlg?.show?.();
  });
};
const setupEvent = (root: HTMLElement) => {
  let n = 0;
  root.querySelector('#btn-evt')?.addEventListener('x-click', (e) => {
    n += 1;
    const oe = (e as CustomEvent<{ originalEvent?: MouseEvent }>).detail?.originalEvent;
    setText('btn-evt-status', `已触发 x-click ${n} 次（detail.originalEvent.clientX=${Math.round(oe?.clientX ?? NaN)}）`);
  });
};
</script>

<template>
  <div>
    <h1>Button 按钮</h1>
    <p class="lead">触发操作行为的按钮，基于原生 &lt;button&gt; 封装。形态（variant）与语义色（color）两轴正交，另有尺寸、禁用 / 加载态与命令式提交。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-button</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="形态 variant"
      desc="solid 实心（默认）/ outline 描边 / ghost 幽灵 / soft 浅底"
      :source='`
<x-button variant="solid">Solid</x-button>
<x-button variant="outline">Outline</x-button>
<x-button variant="ghost">Ghost</x-button>
<x-button variant="soft">Soft</x-button>
`'
    />

    <Demo
      title="语义色 color"
      desc="default 中性缺省 / primary / secondary / success / warning / danger / info，与形态正交"
      :source='`
<x-button color="default">Default</x-button>
<x-button color="primary">Primary</x-button>
<x-button color="secondary">Secondary</x-button>
<x-button color="success">Success</x-button>
<x-button color="warning">Warning</x-button>
<x-button color="danger">Danger</x-button>
<x-button color="info">Info</x-button>
`'
    />

    <Demo
      title="形态 × 语义色 组合"
      desc="两轴自由组合，如 outline+danger、ghost+success、soft+info"
      :source='`
<x-button variant="outline" color="danger">Outline Danger</x-button>
<x-button variant="ghost" color="success">Ghost Success</x-button>
<x-button variant="soft" color="info">Soft Info</x-button>
<x-button variant="soft" color="warning">Soft Warning</x-button>
`'
    />

    <Demo
      title="尺寸 size"
      :source='`
<x-button size="sm">Small</x-button>
<x-button size="md">Medium</x-button>
<x-button size="lg">Large</x-button>
`'
    />

    <Demo
      title="图标 + 文字"
      desc="在默认插槽里把 x-icon 与文字混排（前后缀皆可），间距由组件自带 gap 统一留白"
      :source='`
<x-button><x-icon name="upload"></x-icon>上传文件</x-button>
<x-button variant="outline" color="danger"><x-icon name="close"></x-icon>删除</x-button>
`'
    />

    <Demo
      title="禁用与加载"
      desc="disabled / loading 为布尔属性，存在即生效；loading 自动禁用并旋入 spinner"
      :source='`
<x-button disabled>Disabled</x-button>
<x-button loading>Loading</x-button>
<x-button variant="outline" loading>Outline Loading</x-button>
`'
    />

    <Demo
      title="表单提交 / 重置"
      desc="command=submit / reset 向上递交，由所在 x-form 就近认领；x-submit 携带聚合值，必填留空改走 x-invalid 拦截"
      :column="true"
      :source='`
<x-form id="btn-form">
  <x-form-item label="关键词" name="kw" required><x-input placeholder="留空会被校验拦下"></x-input></x-form-item>
  <x-form-footer>
    <x-button command="submit">提交</x-button>
    <x-button command="reset" variant="outline" color="default">重置</x-button>
  </x-form-footer>
</x-form>
<span id="btn-form-status">尚未提交</span>
`'
      :script='`
const form = document.querySelector("#btn-form");
const status = document.querySelector("#btn-form-status");
form.addEventListener("x-submit", (e) => status.textContent = "x-submit：" + JSON.stringify(e.detail.values));
form.addEventListener("x-invalid", () => status.textContent = "校验未通过：关键词必填");
`'
      :setup="setupForm"
    />

    <Demo
      title="命令传递 command"
      desc="开关靠 open / show()，关闭只需 command=close，按钮不认识对话框；命令沿祖先链冒泡递交"
      :source='`
<x-button id="btn-open-dlg">打开对话框</x-button>
<x-dialog id="btn-dlg" title="命令传递" subtitle="下面两个按钮都没绑过 click">
  <p style="margin: 0">开关靠 open / show()，关闭则根本不需要知道对话框的存在：取消按钮只写了 command="close"。</p>
  <x-dialog-footer>
    <x-button command="close" variant="outline" color="default">取消</x-button>
    <x-button command="close">确定</x-button>
  </x-dialog-footer>
</x-dialog>
`'
      :script='`
document.querySelector("#btn-open-dlg").addEventListener("click", () => document.querySelector("#btn-dlg").show());
`'
      :setup="setupDialog"
    />

    <Demo
      title="事件监听 x-click"
      desc="x-click 为 composed 事件，detail 携带 { originalEvent }；disabled / loading 时不派发"
      :source='`
<x-button id="btn-evt" variant="solid">点我</x-button>
<span id="btn-evt-status">点击按钮查看事件</span>
`'
      :script='`
let n = 0;
document.querySelector("#btn-evt").addEventListener("x-click", (e) => {
  n += 1;
  const oe = e.detail.originalEvent;
  document.querySelector("#btn-evt-status").textContent = "已触发 x-click " + n + " 次（clientX=" + Math.round(oe.clientX) + "）";
});
`'
      :setup="setupEvent"
    />

    <h2>API</h2>
    <ApiTable title="属性 Properties" :columns="['属性', '类型', '默认值', '说明']" :rows="PROPS_ROWS" />
    <ApiTable title="事件 Events" :columns="['事件', 'detail', '说明']" :rows="EVENTS_ROWS" />
    <ApiTable title="插槽 Slots" :columns="['名称', '说明']" :rows="SLOTS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['名称', '说明']" :rows="PARTS_ROWS" />
    <ApiTable title="CSS 变量 Variables" :columns="['变量', '说明']" :rows="VARS_ROWS" />
  </div>
</template>
