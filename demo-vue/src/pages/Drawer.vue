<script setup lang="ts">
// Drawer 抽屉：x-drawer + x-drawer-header / x-drawer-footer。
// 三例都需外部按钮触发 show()（footer 的关闭走内置 command="close"）；「基础用法」另监听 x-close 回显，均由 :setup 实现。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

type DrawerHost = Element & { show: () => void; hide: () => void; toggle: () => void };

const QUICK_SOURCE = `<x-button id="dr-quick-btn" variant="soft" color="primary">打开快捷抽屉（只写 title）</x-button>
<x-drawer id="dr-quick" title="快捷抽屉" subtitle="仅靠 title / subtitle 自动生成头部" label="快捷抽屉">
  <div>
    <p style="margin: 0; color: var(--xie-color-muted); line-height: 1.7">这里只写了 title / subtitle 两个属性，没有手写「x-drawer-header」：抽屉自动补出带关闭按钮的头部（title 会被转入 property，故不会冒出原生 tooltip）。</p>
  </div>
</x-drawer>`;

const setupDrawerQuick = (root: HTMLElement) => {
  const btn = root.querySelector('#dr-quick-btn');
  const d = root.querySelector('#dr-quick') as DrawerHost | null;
  if (!btn || !d) return;
  btn.addEventListener('click', () => d.show());
};

const BASE_SOURCE = `<x-button id="dr-base-btn" variant="solid">打开右侧抽屉</x-button>
<x-drawer id="dr-base" label="右侧抽屉示例">
  <x-drawer-header show-close subtitle="管理此工作区的提醒方式">通知设置</x-drawer-header>
  <div>
    <p style="margin: 0; color: var(--xie-color-muted); line-height: 1.7">这里是抽屉主体（默认内容）。header / footer 是独立子组件，与内容之间没有分隔线；中部内容自动填满剩余高度并可滚动。</p>
  </div>
  <x-drawer-footer>
    <x-button command="close">取消</x-button>
    <x-button command="close" variant="solid">确定</x-button>
  </x-drawer-footer>
</x-drawer>
<div id="dr-base-log" style="margin-top: 8px; color: var(--xie-color-muted)">事件：无</div>`;

const setupDrawerBase = (root: HTMLElement) => {
  const btn = root.querySelector('#dr-base-btn');
  const d = root.querySelector('#dr-base') as DrawerHost | null;
  const log = root.querySelector('#dr-base-log');
  if (!btn || !d) return;
  btn.addEventListener('click', () => d.show());
  if (log) d.addEventListener('x-close', () => (log.textContent = '事件：x-close 已触发（' + new Date().toLocaleTimeString() + '）'));
};

const LEFT_SOURCE = `<x-button id="dr-left-btn" variant="outline">打开左侧抽屉（无关闭按钮 · 320px）</x-button>
<x-drawer id="dr-left" placement="left" width="320px" label="左侧抽屉">
  <x-drawer-header>左侧抽屉</x-drawer-header>
  <div>
    <p style="margin: 0; color: var(--xie-color-muted); line-height: 1.7">placement="left" + width，header 不加 show-close 即无关闭按钮、也没有 footer。</p>
  </div>
</x-drawer>`;

const setupDrawerLeft = (root: HTMLElement) => {
  const btn = root.querySelector('#dr-left-btn');
  const d = root.querySelector('#dr-left') as DrawerHost | null;
  if (!btn || !d) return;
  btn.addEventListener('click', () => d.show());
};

// API
const DRAWER_PROPS_ROWS = [
  ['open', '是否展开（反射属性）', 'boolean', 'false'],
  ['placement', '滑入方向', "'left' | 'right'", "'right'"],
  ['width', '面板宽度', 'string (CSS 长度)', "'440px'"],
  ['lock-scroll', '展开时锁定页面滚动', 'boolean', 'true'],
  ['label', '无障碍名称（aria-label）；留空时回退用 title', 'string', "''"],
  ['title', '快捷头部主标题：无显式 header 时自动生成带头部；属性会被转入 property（不留原生 title attribute）', 'string', "''"],
  ['subtitle', '快捷头部副标题（自动头部内以 x-text caption 排于主标题下方）', 'string', "''"],
];
const HEADER_PROPS_ROWS = [
  ['show-close', '显示右上角关闭按钮（点击向上递交 close 命令，由所属抽屉认领后关闭）', 'boolean', 'false'],
  ['subtitle', '主标题下方的次要说明行（复用 x-text variant="caption"）；留空不渲染', 'string', "''"],
];
const COMPOSITION_ROWS = [
  ['x-drawer-header', '头部：默认插槽放标题；subtitle 放副标题；show-close 控制关闭按钮；与内容无分隔线'],
  ['（普通元素）', '中部主体：作为 x-drawer 直接子元素，自动占据剩余高度并可滚动、留白（建议用单个包裹元素）'],
  ['x-drawer-footer', '底部操作区：内容右对齐、贴底；与内容无分隔线'],
];
const DRAWER_METHODS_ROWS = [
  ['show()', '打开抽屉'],
  ['hide()', '关闭抽屉（先派发可取消的 x-close）'],
  ['toggle()', '切换'],
];
const DRAWER_EVENTS_ROWS = [['x-close', '遮罩点击 / Esc / header 关闭按钮 / hide() 时派发，cancelable', '无']];
const DRAWER_PARTS_ROWS = [
  ['panel', 'x-drawer', '滑入的面板容器'],
  ['scrim', 'x-drawer', '半透明遮罩'],
  ['header', 'x-drawer', '自动生成的头部（仅快捷用法）'],
  ['title', 'x-drawer-header', '标题文字容器'],
  ['subtitle', 'x-drawer-header', '副标题（x-text）'],
  ['close', 'x-drawer-header', '关闭按钮'],
];
</script>

<template>
  <div>
    <h1>Drawer 抽屉</h1>
    <p class="lead">从视口边缘滑入的浮动面板，自带遮罩、Esc 关闭与滚动锁。两种写法：快捷只给 title / subtitle（抽屉自动生成带关闭按钮的头部），或显式组合 <code>&lt;x-drawer-header&gt;</code> / <code>&lt;x-drawer-footer&gt;</code>（与内容无分隔线，中部内容自动滚动）。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-drawer / x-drawer-header / x-drawer-footer</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="快捷用法（title / subtitle）"
      desc="不放 header 子元素时，抽屉自动生成一个 show-close 的头部；适合「一句话拉起一个抽屉」的临时场景"
      :source="QUICK_SOURCE"
      :script='`
const btn = document.querySelector("#dr-quick-btn");
const drawer = document.querySelector("#dr-quick");
btn.addEventListener("click", () => drawer.show());
`'
      :setup="setupDrawerQuick"
    />

    <Demo
      title="基础用法（header + footer 子组件）"
      desc="需要定制头部内容（富标题、标签、图标）或去掉关闭按钮时，回到显式 x-drawer-header；此时内部自动头部让位。footer 按钮只写 command=&quot;close&quot;，无需拿引用绑 click"
      :source="BASE_SOURCE"
      :script='`
const btn = document.querySelector("#dr-base-btn");
const drawer = document.querySelector("#dr-base");
btn.addEventListener("click", () => drawer.show());
drawer.addEventListener("x-close", () => console.log("抽屉已关闭"));
`'
      :setup="setupDrawerBase"
    />

    <Demo
      title="左侧 & 不显示关闭按钮"
      desc='placement="left" + width，header 不加 show-close 即无关闭按钮、无 footer'
      :source="LEFT_SOURCE"
      :script='`
const btn = document.querySelector("#dr-left-btn");
const drawer = document.querySelector("#dr-left");
btn.addEventListener("click", () => drawer.show());
`'
      :setup="setupDrawerLeft"
    />

    <h2>关闭的接线方式</h2>
    <p>footer 里的按钮不必拿到抽屉的引用、也不必绑 click：写 <code>command="close"</code> 即向上递交关闭意图，链上最近的 <code>x-drawer</code> / <code>x-dialog</code> 认领后走 <code>hide()</code>（仍会先派发可取消的 <code>x-close</code>）。同理 <code>x-drawer-header</code> 的关闭按钮也不认宿主，所以它与 <code>x-dialog-header</code> 能共用一份实现。</p>

    <h2>配合主题面板</h2>
    <p><code>x-theme-panel</code> 即基于本抽屉构建——标题与关闭按钮取自 <code>&lt;x-drawer-header show-close&gt;</code>，底部「恢复默认」取自 <code>&lt;x-drawer-footer&gt;</code>。见左侧「指南 · 主题定制」。</p>

    <h2>API</h2>
    <ApiTable title="x-drawer · 属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="DRAWER_PROPS_ROWS" />
    <ApiTable title="x-drawer-header · 属性" :columns="['属性', '说明', '类型', '默认值']" :rows="HEADER_PROPS_ROWS" />
    <ApiTable title="结构 Composition" :columns="['标签', '说明']" :rows="COMPOSITION_ROWS" />
    <ApiTable title="方法 Methods（x-drawer）" :columns="['方法', '说明']" :rows="DRAWER_METHODS_ROWS" />
    <ApiTable title="事件 Events" :columns="['事件', '说明', 'detail']" :rows="DRAWER_EVENTS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '所属', '说明']" :rows="DRAWER_PARTS_ROWS" />
  </div>
</template>
