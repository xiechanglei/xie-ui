/** 介绍页：xie-ui 是什么、如何安装与引入、如何在本库中消费组件 */
import { h, rich, demoCard } from '/demo/render.js';

export function render(el) {
  el.append(
    h('h1', null, 'xie-ui'),
    h('p', { class: 'lead' }, '基于原生 Web Components 实现的 UI 组件库，零框架依赖，可在任意框架或裸 HTML 中使用。'),

    h('h2', null, '特性'),
    h('ul', null,
      li('原生 Custom Elements + Shadow DOM，样式自封装、跨实例共享样式表'),
      li('入口只做注册：import 一次即可直接用标签，无需具名导入组件'),
      li('单一全量产物（已压缩），引入一次即用'),
      li('统一的设计令牌（CSS 自定义属性），内置 light / dark 主题'),
      li('统一的属性 / 事件 / 插槽 / a11y 规范'),
    ),

    h('h2', null, '安装'),
    codeBlock('yarn add @xie-work/xie-ui'),

    h('h2', null, '引入方式'),
    rich('<h3>1. 全量引入（注册所有组件）</h3>'),
    codeBlock(`import '@xie-work/xie-ui';`),
    rich('入口<b>不导出任何运行时 API</b>：import 即完成“注入令牌 + 注册组件”，随后直接写 <code>&lt;x-button&gt;</code> 标签即可。本库定位为即插即用的 UI 组件，不对外暴露内部基类/工具。'),
    rich('<h3>2. 浏览器中通过 &lt;script type="module"&gt;</h3>'),
    codeBlock(`<script type="module" src="/dist/index.js"><\/script>\n<x-button variant="solid">确定</x-button>`),

    h('h2', null, '第一个组件'),
    rich('引入即注册，直接在 HTML 中书写 <code>&lt;x-button&gt;</code> 标签即可，无需任何额外配置。'),
    demoCard({
      title: '开箱即用',
      build: (c) =>
        c.append(
          button('Solid', { variant: 'solid' }),
          button('Outline', { variant: 'outline' }),
        ),
      code: `<x-button variant="solid">Solid</x-button>
<x-button variant="outline">Outline</x-button>`,
    }),

    h('h2', null, '主题定制'),
    rich('覆盖 <code>--xie-*</code> 令牌即可换肤；在根元素设置 <code>data-xie-theme="dark"</code> 切换深色主题。'),
    codeBlock(`:root {\n  --xie-color-primary: #6f42c1;\n}\n\n<html data-xie-theme="dark"></html>`),

    h('h2', null, '在框架中使用'),
    rich('<b>Vue 3</b>：自定义元素需在编译配置中识别 <code>x-</code> 前缀。'),
    codeBlock(`// vite 插件配置\ncompilerOptions: {\n  isCustomElement: (tag) => tag.startsWith('x-'),\n}`),
    rich('<b>React</b>：property 与自定义事件无法直接经 JSX 传递，建议用 <code>ref</code> 设属性、<code>useEffect</code> 绑事件。'),

    h('h2', null, '当前进度'),
    rich('本库处于 <b>M0 地基阶段</b>，目前已提供 <code>x-button</code>，其余组件见左侧菜单中的“规划中”项。'),
  );
}

/* ---- 局部小工具 ---- */
function li(text) {
  return h('li', null, text);
}
function codeBlock(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
function button(label, attrs = {}) {
  const b = document.createElement('x-button');
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  b.textContent = label;
  return b;
}
