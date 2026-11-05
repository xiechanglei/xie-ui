<script setup lang="ts">
// Dropdown 下拉菜单：x-popover 的菜单化子集（点行即关 + 宽随触发件 + x-select 回报行）。菜单行归组进 x-dropdown-content。
// 「基础用法」监听 x-select 回显被点的行，经 :setup 实现；分隔分组/四向/悬停菜单栏/宽度跟手为静态。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

const BASIC_SOURCE = `<div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 48px 0 8px">
  <x-dropdown id="dd-basic">
    <x-button variant="outline">操作 ▾</x-button>
    <x-dropdown-content>
      <button>✏️ 重命名</button>
      <button>📋 复制</button>
      <button>📦 归档</button>
      <button style="color: var(--xie-color-danger)">🗑 删除</button>
    </x-dropdown-content>
  </x-dropdown>
  <span id="dd-basic-status" style="font-size: 13px; color: var(--xie-color-muted)">还没选</span>
</div>`;

const setupDropdownSelect = (root: HTMLElement) => {
  const dd = root.querySelector('#dd-basic');
  const status = root.querySelector('#dd-basic-status');
  if (!dd || !status) return;
  dd.addEventListener('x-select', (e) => {
    const item = (e as CustomEvent<{ item: Element }>).detail.item;
    status.textContent = '点了「' + (item?.textContent || '').trim() + '」（面板已自动收起）';
  });
};

const GROUPED_SOURCE = `<div style="padding: 48px 0 8px">
  <x-dropdown>
    <x-button variant="soft">排序 ▾</x-button>
    <x-dropdown-content>
      <button>名称</button>
      <button>大小</button>
      <button>修改时间</button>
      <hr style="border: 0; border-top: 1px solid var(--xie-color-border); margin: 4px 0">
      <button style="color: var(--xie-color-primary)">升序 ↑</button>
      <button style="color: var(--xie-color-primary)">降序 ↓</button>
    </x-dropdown-content>
  </x-dropdown>
</div>`;

const PLACES_SOURCE = `<div style="display: flex; align-items: center; gap: 18px; flex-wrap: wrap; padding: 32px 0">
  <x-dropdown placement="top">
    <x-button variant="soft">top</x-button>
    <x-dropdown-content><button>上面</button><button>的面板</button></x-dropdown-content>
  </x-dropdown>
  <x-dropdown placement="bottom">
    <x-button variant="soft">bottom（默认）</x-button>
    <x-dropdown-content><button>下面</button><button>的面板</button></x-dropdown-content>
  </x-dropdown>
  <x-dropdown placement="left">
    <x-button variant="soft">left</x-button>
    <x-dropdown-content><button>左边</button><button>的面板</button></x-dropdown-content>
  </x-dropdown>
  <x-dropdown placement="right">
    <x-button variant="soft">right</x-button>
    <x-dropdown-content><button>右边</button><button>的面板</button></x-dropdown-content>
  </x-dropdown>
</div>`;

const HOVER_SOURCE = `<div style="display: flex; gap: 4px; padding: 8px; border: 1px solid var(--xie-color-border); border-radius: var(--xie-radius-md)">
  <x-dropdown trigger="hover">
    <x-button variant="soft">文件</x-button>
    <x-dropdown-content>
      <button>新建</button>
      <button>打开…</button>
      <button>保存</button>
      <hr style="border: 0; border-top: 1px solid var(--xie-color-border); margin: 4px 0">
      <button>退出</button>
    </x-dropdown-content>
  </x-dropdown>
  <x-dropdown trigger="hover">
    <x-button variant="soft">编辑</x-button>
    <x-dropdown-content>
      <button>撤销</button>
      <button>重做</button>
    </x-dropdown-content>
  </x-dropdown>
  <span style="align-self: center; font-size: 12px; color: var(--xie-color-muted); margin-left: 8px">移开 150ms 自动收，连续横扫不误关</span>
</div>`;

const WIDE_SOURCE = `<div style="padding: 48px 0 8px">
  <x-dropdown>
    <x-button variant="outline" style="width: 260px; justify-content: space-between">宽触发件 → 面板至少一样宽 ▾</x-button>
    <x-dropdown-content>
      <button>面板宽度不小于触发件</button>
      <button>内容更长则自动撑开</button>
    </x-dropdown-content>
  </x-dropdown>
</div>`;

// API
const DD_PROPS_ROWS = [
  ['open', '面板开合（反射，可编程读写）', 'boolean', 'false'],
  ['placement', '弹出方位（反射；起边对齐 + 宽度跟手已内置）', "'top' | 'bottom' | 'left' | 'right'", "'bottom'"],
  ['trigger', 'click 点开合 / hover 悬停开移开延时关', "'click' | 'hover'", "'click'"],
];
const DD_METHODS_ROWS = [['show() / hide() / toggle()', '继承自 x-popover，等价于写 open 属性']];
const DD_EVENTS_ROWS = [['x-select', '点中面板内容时派发（收起面板前，bubbles/composed），detail:{ item }，item = 被点的行元素（x-dropdown-content 的直接子级；平铺写法则为宿主直接子级）']];
const DD_SLOTS_ROWS = [
  ['default', '触发内容（常见为一个 x-button）'],
  ['content', '菜单面板内容：主范式放一个 x-dropdown-content（它自动挂此插槽）；轻量写法也可直接把多个元素挂此插槽（同样默认纵排）'],
];
const DD_CONTENT_ROWS = [
  ['定位', '纯容器不带行为：归组菜单行、自动挂 slot="content"（已显式写 slot 则尊重）、:host 默认 flex 纵排逐行铺满'],
  ['内容', '直接子元素即菜单行，结构不预设（button / hr / 分组标题…）；普通元素吃容器默认行皮肤，x-button 等自带外观的组件豁免'],
];
const DD_PARTS_ROWS = [['panel', 'x-dropdown', '菜单面板（容器 4px 内边距、max-height 320px 超高滚动）']];
</script>

<template>
  <div>
    <h1>Dropdown 下拉菜单</h1>
    <p class="lead">「点一下、选一行的」下拉菜单：<code>x-popover</code> 的菜单化子集——面板贴触发件底沿起边对齐、宽度至少跟触发件一致、菜单行默认纵向铺满、点中任意一行即视为选完派发 <code>x-select</code> 并自动收起。行用配套部件 <code>x-dropdown-content</code> 归组（不用写 slot 魔法串、不用套 div），行内放什么元素仍由你定。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-dropdown / x-dropdown-content</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="触发件放默认插槽、菜单行归组进 x-dropdown-content；普通元素直接当行零样式即得菜单默认皮肤（对齐 Select 选项行），监听 x-select 拿被点的行"
      :source="BASIC_SOURCE"
      :script='`
const dd = document.querySelector("#dd-basic");
dd.addEventListener("x-select", (e) => console.log(e.detail.item)); // detail.item 即被点的行
`'
      :setup="setupDropdownSelect"
    />

    <Demo
      title="分隔与分组"
      desc="面板只收口成菜单容器（4px 内边距、超高滚动），行间加 hr/分组标题随便拼；行内样式（如主题色）直接写 style 即可覆盖默认皮肤；也可不裹容器、直接把多个元素挂 slot=&quot;content&quot;（同样默认纵排）"
      :source="GROUPED_SOURCE"
    />

    <Demo
      title="四向落位"
      desc="placement 同 x-popover（bottom 默认），空间不足自动翻到对侧"
      :source="PLACES_SOURCE"
    />

    <Demo
      title="悬停触发（菜单栏）"
      desc='trigger="hover" 得到经典菜单栏手感：移开有 150ms 宽限，横扫相邻菜单不断'
      :source="HOVER_SOURCE"
    />

    <Demo
      title="宽度跟随触发件"
      desc="面板 minWidth 自动取触发件宽度；内容更宽时自行撑开"
      :source="WIDE_SOURCE"
    />

    <h2>设计要点</h2>
    <p>dropdown 是 popover 的<b>子类</b>而非拷贝：只覆盖四个旋钮（交叉轴 <code>start</code> 对齐、宽度跟手、<code>closeOnChoose</code>、<code>haspopup=menu</code>），开合/Esc 栈/外部点关/焦点归还/fixed 落位全部继承，与 <code>x-dialog-header</code> 继承 <code>x-drawer-header</code> 同一套路。菜单行用 <b><code>x-dropdown-content</code> 归组</b>：它连接时若没写 slot 会自动挂 <code>slot="content"</code> 进面板，消费者不用记魔法串。容器提供<b>默认行皮肤</b>（<code>::slotted</code>，参数对齐 <code>x-select</code> 选项行：32px 行高、中性字色、hover 底色、禁用态）：普通元素当行零样式即协调；行内放 <code>x-button</code> 等自带外观的组件则豁免不干涉，light DOM 行内样式永远可覆盖。监听 <b><code>x-select</code> 拿 <code>detail.item</code></b> 即被点的行，行内带什么数据（dataset/value/图标）自己取。需要完整 <code>role=menu/menuitem</code> 键盘漫游的场景请显式给行加 ARIA 或改用 <code>x-menu</code>。</p>

    <h2>API</h2>
    <ApiTable title="x-dropdown · 属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="DD_PROPS_ROWS" />
    <ApiTable title="方法 Methods" :columns="['方法', '说明']" :rows="DD_METHODS_ROWS" />
    <ApiTable title="事件 Events" :columns="['事件', '说明']" :rows="DD_EVENTS_ROWS" />
    <ApiTable title="插槽 Slots" :columns="['插槽', '说明']" :rows="DD_SLOTS_ROWS" />
    <ApiTable title="x-dropdown-content · 菜单行容器" :columns="['要点', '说明']" :rows="DD_CONTENT_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '所属', '说明']" :rows="DD_PARTS_ROWS" />
  </div>
</template>
