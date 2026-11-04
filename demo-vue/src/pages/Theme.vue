<script setup lang="ts">
// 主题定制指南：令牌分层与切换原理、x-theme-panel 实时演示。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// 交互的 Vue 侧实现（渲染标记 == source；:script 展示原生写法、不执行）
const setupTheme = (root: HTMLElement) => {
  const panel = root.querySelector('#theme-panel');
  if (!panel) return;
  root.querySelector('#theme-open')?.addEventListener('click', () => (panel as unknown as { show?: () => void }).show?.());
  const status = root.querySelector('#theme-status');
  panel.addEventListener('x-theme-change', (e: Event) => {
    if (status) status.textContent = '当前配置：' + JSON.stringify((e as CustomEvent).detail);
  });
};

const PANEL_PROPS_ROWS = [
  ['open', '抽屉是否展开（反射属性）', 'boolean', 'false'],
  ['theme', '明暗主题', "'light' | 'dark'", "'light'"],
  ['primary', '主色（空=跟随令牌默认）', 'string (色值)', "''"],
  ['secondary', '次要色', 'string (色值)', "''"],
  ['success', '成功色', 'string (色值)', "''"],
  ['warning', '警告色', 'string (色值)', "''"],
  ['danger', '危险色', 'string (色值)', "''"],
  ['info', '信息色', 'string (色值)', "''"],
  ['radius', '圆角档位', "'none' | 'sm' | 'md' | 'lg' | 'full'", "'md'"],
  ['size', '控件尺寸档位', "'compact' | 'default' | 'comfortable'", "'default'"],
  ['shadow', '阴影强度档位', "'none' | 'soft' | 'strong'", "'soft'"],
];
const PANEL_METHODS_ROWS = [
  ['show()', '展开抽屉'],
  ['hide()', '收起抽屉'],
  ['toggle()', '切换展开 / 收起'],
];
const PANEL_EVENTS_ROWS = [
  ['x-theme-change', '任一配置项变化时派发（composed，可冒泡）', '{ theme, primary, secondary, success, warning, danger, info, radius, size, shadow }'],
];
const KNOB_ROWS = [
  ['--xie-primary', '主色基准', '按钮 / 选中态背景；hover/active/soft 自动派生，前景色按亮度自动取黑/白'],
  ['--xie-secondary', '次要色基准', 'secondary 按钮'],
  ['--xie-success', '成功色基准', 'success 按钮'],
  ['--xie-warning', '警告色基准', 'warning 按钮'],
  ['--xie-danger', '危险色基准', 'danger 按钮'],
  ['--xie-info', '信息色基准', 'info 按钮'],
  ['--xie-radius', '圆角基准（0=直角）', '所有圆角 sm/md/lg'],
  ['--xie-control-height', '控件高度基准', '组件 sm/md/lg 尺寸'],
  ['--xie-font-size', '字号基准', '文本 sm/md/lg'],
  ['--xie-shadow-strength', '阴影强度 0~2', '阴影 1/2/3 档'],
];
</script>

<template>
  <div>
    <h1>主题定制</h1>
    <p class="lead">字体大小、控件尺寸、圆角（直角 / 圆角）、颜色、阴影等可全局定义与切换的风格维度，都由设计令牌（CSS 自定义属性）驱动。</p>

    <h2>原理：为什么改一次就全站联动</h2>
    <p>所有组件通过 <code>var(--xie-*)</code> 读取令牌，而自定义属性可<strong>穿透 Shadow DOM 边界继承</strong>。因此改写 <code>:root</code> 上的令牌，页面上所有组件会<strong>立即</strong>跟随，无需任何 JS 逐个通知或重渲染。</p>
    <p>令牌分三层：<strong>primitive</strong>（原始调色板）→ <strong>knob 旋钮</strong>（6 个强调色 primary / secondary / success / warning / danger / info + 圆角 / 尺寸 / 字号 / 阴影强度）→ <strong>derived 派生</strong>（经 <code>calc</code> / <code>color-mix</code> 自动算出的语义令牌，组件消费这一层）。</p>

    <h2>实时演示</h2>
    <p>面板以<strong>右侧滑入抽屉</strong>形式呈现（内嵌通用组件 <code>x-drawer</code>）。点下面的按钮唤出，调整任一维度都会改写 <code>:root</code> 令牌，本页所有示例（含整个文档站）实时变化；配置会<strong>自动记在 localStorage</strong>，刷新后仍保持。</p>

    <Demo
      title="可视化配置抽屉"
      desc="x-theme-panel：点按钮从右侧滑入，选择即写入全局令牌"
      :column="true"
      :source='`
<x-button id="theme-open" variant="solid">打开主题设置</x-button>
<div class="demo-stage">
  <x-button variant="solid">Solid</x-button>
  <x-button variant="outline">Outline</x-button>
  <x-button variant="soft" color="info">Soft Info</x-button>
  <x-button color="danger">Danger</x-button>
  <x-button color="success">Success</x-button>
  <x-button variant="ghost" color="warning">Ghost Warning</x-button>
  <x-button variant="solid" loading>Loading</x-button>
</div>
<div class="demo-box">一个跟随圆角 / 阴影 / 配色的容器</div>
<div id="theme-status" class="demo-status">当前配置：默认</div>
<x-theme-panel id="theme-panel"></x-theme-panel>
`'
      :script='`
const panel = document.querySelector("#theme-panel");
document.querySelector("#theme-open").addEventListener("click", () => panel.show());
const status = document.querySelector("#theme-status");
panel.addEventListener("x-theme-change", (e) => status.textContent = "当前配置：" + JSON.stringify(e.detail));
`'
      :setup="setupTheme"
    />

    <h2>两种切换方式</h2>
    <h3>1. 预设档位（纯 CSS，零 JS）</h3>
    <p>在 <code>&lt;html&gt;</code> 上设置 data 属性即可，各维度正交、互不干扰：</p>
    <CodeBlock :code="'<html data-xie-theme=\'dark\' data-xie-radius=\'none\' data-xie-size=\'compact\' data-xie-shadow=\'strong\'>'" lang="xml" />

    <h3>2. 任意值（直接覆盖旋钮）</h3>
    <p>取色器、自定义 px 等，直接改旋钮令牌，派生层自动重算：</p>
    <CodeBlock :code="`document.documentElement.style.setProperty('--xie-primary', '#8b5cf6');\ndocument.documentElement.style.setProperty('--xie-radius', '10px');`" lang="javascript" />

    <h2>API · x-theme-panel</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="PANEL_PROPS_ROWS" />
    <ApiTable title="方法 Methods" :columns="['方法', '说明']" :rows="PANEL_METHODS_ROWS" />
    <ApiTable title="事件 Events" :columns="['事件', '说明', 'detail']" :rows="PANEL_EVENTS_ROWS" />

    <h2>可覆盖的旋钮令牌</h2>
    <ApiTable title="令牌 Tokens" :columns="['令牌', '说明', '影响']" :rows="KNOB_ROWS" />
  </div>
</template>
