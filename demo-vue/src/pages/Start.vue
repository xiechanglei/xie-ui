<script setup lang="ts">
// 介绍页：xie-ui 概览 + 「在 Vue 中使用」专章（对应文档站诉求：说明 Vue 侧的接入与写法）。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';

// —— Vue 接入与写法片段（纯展示，用 CodeBlock；含引号故放脚本反引号常量里）——
const SNIP_MAIN = `// main.ts
import { createApp } from 'vue';
import '@xie-work/xie-ui';            // 一次引入 = 注入令牌 + 注册全部 x-* 组件
import App from './App.vue';

createApp(App).mount('#app');`;

const SNIP_CUSTOM_ELEMENT = `// vite.config.ts
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 关键：告诉 Vue 编译器 x- 前缀是原生自定义元素，不要当未注册组件
          isCustomElement: (tag) => tag.startsWith('x-'),
        },
      },
    }),
  ],
});`;

const SNIP_PROPS = `<template>
  <!-- 静态属性 -->
  <x-button variant="solid" color="primary">确定</x-button>

  <!-- 动态绑定：命中同名 property，并反射为 attribute -->
  <x-input :value="keyword" :disabled="loading" placeholder="搜索"></x-input>

  <!-- 布尔属性「出现即为 true」；绑定用 :attr="布尔值" -->
  <x-switch :checked="on"></x-switch>
</template>`;

const SNIP_EVENTS = `<template>
  <!-- 自定义事件（camel / kebab 均可）：结构化数据在 \$event.detail -->
  <x-select :options="langs" @x-change="onChange"></x-select>

  <!-- 原生事件照常监听 -->
  <x-button @click="handleSubmit">提交</x-button>
</template>

<script setup>
function onChange(e) {
  console.log(e.detail.value); // 组件派发的 detail
}
<\/script>`;

const SNIP_SLOTS = `<template>
  <!-- x-* 是原生自定义元素：用原生 slot 属性分发，而非 Vue 具名插槽语法 -->
  <x-button>
    <x-icon name="upload" slot="start"></x-icon>
    上传
  </x-button>
</template>`;

const SNIP_REF = `<template>
  <x-button @click="dlg?.show()">打开</x-button>
  <x-dialog ref="dlg" title="命令传递">对话框内容</x-dialog>
</template>

<script setup>
import { ref } from 'vue';
const dlg = ref();          // 模板 ref 拿到元素实例，直接调用其方法（show / hide 等）
<\/script>`;

const SNIP_VMODEL = `<template>
  <!-- 组件不内置 v-model：用「:value 绑定 + @x-change 回写」手动实现双向 -->
  <x-input :value="text" @x-change="text = \$event.detail.value"></x-input>
</template>

<script setup>
import { ref } from 'vue';
const text = ref('');
<\/script>`;

const SNIP_THEME = `/* 覆盖 --xie-* 令牌即可换肤 */
:root {
  --xie-color-primary: #6f42c1;
}

<!-- 深色：在根元素标注 data-xie-theme="dark" -->
<html data-xie-theme="dark"></html>`;

const SNIP_SCRIPT_MODULE = `<script type="module" src="/dist/index.js"><\/script>
<x-button variant="solid">确定</x-button>`;
</script>

<template>
  <div>
    <h1>xie-ui</h1>
    <p class="lead">基于原生 Web Components 实现的 UI 组件库，零框架依赖，可在任意框架或裸 HTML 中使用。</p>

    <h2>特性</h2>
    <ul>
      <li>原生 Custom Elements + Shadow DOM，样式自封装、跨实例共享样式表</li>
      <li>入口只做注册：<code>import</code> 一次即可直接用标签，无需具名导入组件</li>
      <li>单一全量产物（已压缩），引入一次即用</li>
      <li>统一的设计令牌（CSS 自定义属性），内置 light / dark 主题</li>
      <li>统一的属性 / 事件 / 插槽 / a11y 规范</li>
    </ul>

    <h2>安装</h2>
    <CodeBlock code="yarn add @xie-work/xie-ui" />

    <h2>引入方式</h2>
    <h3>1. 全量引入（注册所有组件）</h3>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />
    <p>入口不导出任何运行时 API：<code>import</code> 即完成「注入令牌 + 注册组件」，随后直接写 <code>&lt;x-button&gt;</code> 标签即可。本库定位为即插即用的 UI 组件，不对外暴露内部基类 / 工具。</p>
    <h3>2. 浏览器中通过 &lt;script type="module"&gt;</h3>
    <CodeBlock :code="SNIP_SCRIPT_MODULE" lang="xml" />

    <h2>第一个组件</h2>
    <p>引入即注册，直接在模板中书写 <code>&lt;x-button&gt;</code> 标签即可，无需任何额外配置。</p>
    <Demo
      title="开箱即用"
      :source='`
<x-button variant="solid">Solid</x-button>
<x-button variant="outline">Outline</x-button>
`'
    />

    <h2>在 Vue 中使用</h2>
    <p>本库组件都是原生自定义元素，Vue 3 天然支持渲染。接入只需两步：入口引入一次、让 Vue 编译器识别 <code>x-</code> 前缀。</p>

    <h3>1. 入口引入一次</h3>
    <CodeBlock :code="SNIP_MAIN" lang="javascript" />

    <h3>2. 让 Vue 把 x- 前缀当作自定义元素</h3>
    <p>否则 Vue 会把 <code>&lt;x-button&gt;</code> 当成「未注册的组件」而告警、不渲染。用 <code>@vitejs/plugin-vue</code> 时配 <code>isCustomElement</code>：</p>
    <CodeBlock :code="SNIP_CUSTOM_ELEMENT" lang="javascript" />

    <h3>3. 模板里直接写标签</h3>
    <p><b>传属性</b>：静态直接写；动态用 <code>:attr</code>。绑定会命中组件定义的同名 property 并反射为 attribute（布尔属性「出现即为 true」）。</p>
    <CodeBlock :code="SNIP_PROPS" lang="xml" />

    <p><b>听事件</b>：组件的自定义事件用 <code>@x-*</code> 监听，结构化数据在 <code>$event.detail</code>；原生事件照常 <code>@click</code>。</p>
    <CodeBlock :code="SNIP_EVENTS" lang="xml" />

    <p><b>用插槽</b>：因为是原生自定义元素，内容分发用<b>原生 <code>slot</code> 属性</b>，而不是 Vue 组件的具名插槽语法。</p>
    <CodeBlock :code="SNIP_SLOTS" lang="xml" />

    <p><b>调方法 / 拿实例</b>：用模板 <code>ref</code> 获取元素实例，直接调用命令式 API（如 <code>show()</code>）。</p>
    <CodeBlock :code="SNIP_REF" lang="xml" />

    <p><b>双向绑定</b>：组件不内置 <code>v-model</code>，用「<code>:value</code> 绑定 + <code>@x-change</code> 回写」手动实现。</p>
    <CodeBlock :code="SNIP_VMODEL" lang="xml" />

    <h2>主题定制</h2>
    <p>覆盖 <code>--xie-*</code> 令牌即可换肤；在根元素设置 <code>data-xie-theme="dark"</code> 切换深色主题。</p>
    <CodeBlock :code="SNIP_THEME" />

    <h2>当前进度</h2>
    <p>本库持续按 <b>basic → layout → form → nav → feedback</b> 分类推进，已交付组件见左侧菜单，未迁移页会显示「规划中」占位。</p>
  </div>
</template>
