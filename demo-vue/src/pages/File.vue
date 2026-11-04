<script setup lang="ts">
// FileUpload 文件上传：包原生 input[type=file]，只读输出。
// 「基础用法」x-change 读 files、「重置」调 reset() 由 :setup 实现；其余为静态。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

const BASIC_SOURCE = `<x-file-input id="file-basic" name="avatar"></x-file-input>
<p id="file-out" style="margin: 12px 0 0; color: var(--xie-color-muted)">未选择</p>`;
const setupFileBasic = (root: HTMLElement) => {
  const f = root.querySelector('#file-basic');
  const out = root.querySelector('#file-out');
  if (!f) return;
  f.addEventListener('x-change', (e) => {
    const files = (e as CustomEvent<{ files: File[] }>).detail.files;
    if (out) out.textContent = files.length ? '已选 ' + files.length + ' 个：' + files.map((x) => x.name).join('、') : '未选择';
  });
};

const RESET_SOURCE = `<x-file-input id="file-reset"></x-file-input>
<x-button id="file-reset-btn" size="sm" style="margin-left: 12px">清空</x-button>`;
const setupFileReset = (root: HTMLElement) => {
  const f = root.querySelector('#file-reset') as unknown as { reset: () => void } | null;
  if (!f) return;
  root.querySelector('#file-reset-btn')?.addEventListener('click', () => f.reset());
};

// API（严格对齐 src/components/file-input/x-file-input.ts）
const FILE_PROPS_ROWS = [
  ['accept', '限定文件类型（透传原生，如 image/*、.pdf）', 'string', "''"],
  ['multiple', '允许多选（反射）', 'boolean', 'false'],
  ['name', '表单名（反射，FormData 中每个文件的键）', 'string', "'file'"],
  ['button-label', '按钮文案（property buttonLabel）', 'string', "'选择文件'"],
  ['placeholder', '未选择时的提示文案', 'string', "'未选择任何文件'"],
  ['color', '按钮语义色（反射）', "'primary' | … | 'info'", "'primary'"],
  ['size', '尺寸（反射）', "'sm' | 'md' | 'lg'", "'md'"],
  ['disabled / required / label', '禁用 / 必填校验 / 无障碍名', '—', '—'],
];
const FILE_MEMBERS_ROWS = [
  ['files（只读）', '已选文件数组 File[]（不可外部赋值）'],
  ['form（只读）', '所属 form（FCCE）'],
  ['reset()', '清空已选'],
  ['x-change', '选择/清空后派发，detail:{ files: File[] }'],
];
</script>

<template>
  <div>
    <h1>FileUpload 文件上传</h1>
    <p class="lead">包一个隐藏的原生 <code>input[type=file]</code>：系统文件选择框、accept 过滤、多选、无障碍全白送，本库只画触发按钮与文件名展示。因浏览器安全限制 <code>files</code> 不能程序化写入，故组件是「只读输出」——用 <code>files</code> 读取、<code>reset()</code> 清空。选中的文件以 name 为键计入外层 form。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-file-input</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="选完在按钮右侧显示文件名；监听 x-change 读 files"
      :column="true"
      :source="BASIC_SOURCE"
      :script='`
const f = document.querySelector("#file-basic");
const out = document.querySelector("#file-out");
f.addEventListener("x-change", (e) => {
  const files = e.detail.files;
  out.textContent = files.length ? "已选 " + files.length + " 个：" + files.map((x) => x.name).join("、") : "未选择";
});
`'
      :setup="setupFileBasic"
    />

    <Demo
      title="accept 过滤 + multiple 多选"
      desc="accept 限定类型；multiple 可多选，显示「xxx 等 N 个文件」"
      :source='`<x-file-input accept="image/*" multiple button-label="选图片"></x-file-input>`'
    />

    <Demo
      title="语义色 color & 尺寸 size"
      desc="按钮取语义色；size 三档"
      :source='`
<x-file-input color="success"></x-file-input>
<x-file-input color="danger" size="sm"></x-file-input>
<x-file-input color="info" size="lg"></x-file-input>
`'
    />

    <Demo
      title="禁用 & 自定义文案"
      desc="disabled 半透明；button-label / placeholder 可自定义"
      :source='`
<x-file-input disabled></x-file-input>
<x-file-input button-label="上传附件" placeholder="支持 pdf / doc，≤10MB"></x-file-input>
`'
    />

    <Demo
      title="重置"
      desc="files 不可外部赋值，只能 reset() 清空"
      :source="RESET_SOURCE"
      :script='`
const fileEl = document.querySelector("#file-reset");
document.querySelector("#file-reset-btn").addEventListener("click", () => fileEl.reset());
`'
      :setup="setupFileReset"
    />

    <h2>设计约定</h2>
    <p>出于安全，浏览器禁止脚本设置 <code>input[type=file]</code> 的 value，因此本组件不提供 value 写入，只读 <code>files</code>、可 <code>reset</code>。form 关联时每个文件以 name 为键 append 进 FormData（multiple 会同名多次出现）。</p>

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="FILE_PROPS_ROWS" />
    <ApiTable title="成员 / 方法 / 事件" :columns="['名称', '说明']" :rows="FILE_MEMBERS_ROWS" />
  </div>
</template>
