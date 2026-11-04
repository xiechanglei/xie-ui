<script setup lang="ts">
// Popover 气泡卡片：x-popover 包裹触发件（默认插槽）+ 面板内容（slot="content"），fixed 面板、四向翻转、Esc 栈、焦点陷阱。
// 基础/四向/悬停/焦点陷阱/贴边翻转皆声明式静态（click/hover 内建）；「可编程控制」经 :setup 绑按钮 show()/hide()。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

type PopHost = Element & { show: () => void; hide: () => void; toggle: () => void; open: boolean };

const BASIC_SOURCE = `<x-popover>
  <x-button variant="outline">点我展开</x-button>
  <div slot="content">
    <div style="display: flex; flex-direction: column; gap: 8px; max-width: 240px">
      <span>这是一张气泡卡片，可承载富内容与交互件；点面板外任意处或再按 Esc 即收起。</span>
      <div style="display: flex; gap: 8px">
        <x-button color="primary" size="sm">知道了</x-button>
        <x-button variant="soft" size="sm">取消</x-button>
      </div>
    </div>
  </div>
</x-popover>`;

const PLACES_SOURCE = `<div style="display: flex; align-items: center; gap: 18px; flex-wrap: wrap; padding: 32px 0">
  <x-popover placement="top"><x-button variant="soft">top</x-button><div slot="content"><span>面板在上方</span></div></x-popover>
  <x-popover placement="bottom"><x-button variant="soft">bottom（默认）</x-button><div slot="content"><span>面板在下方</span></div></x-popover>
  <x-popover placement="left"><x-button variant="soft">left</x-button><div slot="content"><span>面板在左侧</span></div></x-popover>
  <x-popover placement="right"><x-button variant="soft">right</x-button><div slot="content"><span>面板在右侧</span></div></x-popover>
</div>`;

const HOVER_SOURCE = `<x-popover trigger="hover">
  <x-button variant="outline">悬停我</x-button>
  <div slot="content">
    <div style="display: flex; flex-direction: column; gap: 8px; max-width: 240px"><span>鼠标移入即开、移开延时 150ms 自动收；此模式不设焦点陷阱，跟随指针语义。</span></div>
  </div>
</x-popover>`;

const TRAP_SOURCE = `<x-popover>
  <x-button color="primary">展开含表单的面板</x-button>
  <div slot="content">
    <div style="display: flex; flex-direction: column; gap: 8px; max-width: 240px">
      <label style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--xie-color-muted)">打开后焦点自动落进这里，Tab 锁在面板内循环：
        <input placeholder="随手输入…">
      </label>
      <x-button variant="soft" size="sm">末尾按钮（Shift+Tab 到头会绕回这里）</x-button>
    </div>
  </div>
</x-popover>`;

const CONTROL_SOURCE = `<div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 40px 0 16px">
  <x-popover id="pop-ctl" open>
    <x-button variant="outline">这个面板默认开着</x-button>
    <div slot="content"><div style="display: flex; flex-direction: column; gap: 8px; max-width: 240px"><span>外部按钮可以程序化关掉我。</span></div></div>
  </x-popover>
  <x-button id="pop-close" variant="soft" color="danger">程序化关闭</x-button>
  <x-button id="pop-open" variant="soft" color="success">程序化打开</x-button>
  <span id="pop-status" style="font-size: 13px; color: var(--xie-color-muted)">当前：开着的（open 属性直写）</span>
</div>`;

const setupPopControl = (root: HTMLElement) => {
  const pop = root.querySelector('#pop-ctl') as PopHost | null;
  const status = root.querySelector('#pop-status');
  if (!pop) return;
  root.querySelector('#pop-close')?.addEventListener('click', () => {
    pop.hide();
    if (status) status.textContent = '当前：已被 show()/hide() 关掉';
  });
  root.querySelector('#pop-open')?.addEventListener('click', () => {
    pop.show();
    if (status) status.textContent = '当前：程序化打开';
  });
};

const EDGE_SOURCE = `<div style="padding: 4px 0 40px">
  <x-popover placement="top">
    <x-button variant="outline">我上面没地方了</x-button>
    <div slot="content"><div style="display: flex; flex-direction: column; gap: 8px; max-width: 240px"><span>空间不足时主轴自动翻转到对侧，交叉轴夹紧不出屏。</span></div></div>
  </x-popover>
</div>`;

const POP_PROPS_ROWS = [
  ['open', '面板开合（反射，可编程读写）', 'boolean', 'false'],
  ['placement', '弹出方位（反射；空间不足自动翻到对侧）', "'top' | 'bottom' | 'left' | 'right'", "'bottom'"],
  ['trigger', '触发方式：click 点触发件开合 / hover 悬停开、移开延时 150ms 关', "'click' | 'hover'", "'click'"],
];
const POP_METHODS_ROWS = [['show() / hide() / toggle()', '等价于写 open 属性；close 命令（x-command）也认领 hide']];
const POP_SLOTS_ROWS = [
  ['default', '触发内容（按钮/图标/任意元素）'],
  ['content', '面板内容（富内容与交互件皆可；点面板外/按 Esc 即关）'],
];
const POP_PARTS_ROWS = [
  ['anchor', 'x-popover', '包住触发内容的行内壳（display:contents，不产生盒子）'],
  ['panel', 'x-popover', 'fixed 面板本体（底色/边框/圆角/阴影全吃全局令牌，可整体覆写）'],
];
</script>

<template>
  <div>
    <h1>Popover 气泡卡片</h1>
    <p class="lead">包裹一段触发内容，点击（或悬停）在其旁弹出一张实底卡片面板。面板是 <code>position:fixed</code> 的浮层：不受祖先 overflow 裁剪、空间不足自动翻转方位、滚动缩放跟随重定位。承载富内容与交互件，打开时吃库的浮层基建——Esc 走全局关闭栈、Tab 锁在面板内、关闭后焦点归还给来源元素。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-popover</code> 标签，触发件放默认插槽、面板内容挂 <code>slot="content"</code>（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="触发内容放默认插槽，面板内容挂 slot=&quot;content&quot;；点触发件开合、点面板外即关"
      :source="BASIC_SOURCE"
    />

    <Demo
      title="四向落位"
      desc="placement 指定面板方位（bottom 默认 / top / left / right）"
      :source="PLACES_SOURCE"
    />

    <Demo
      title="悬停触发"
      desc='trigger="hover" 移入即开、移开延时收；此模式不设焦点陷阱'
      :source="HOVER_SOURCE"
    />

    <Demo
      title="焦点陷阱与归还"
      desc="click 模式打开即聚焦面板内首个可聚焦件，Tab 循环锁在面板内；Esc/外点后焦点回到触发按钮"
      :source="TRAP_SOURCE"
    />

    <Demo
      title="可编程控制"
      desc="open 属性 / show() / hide() / toggle() 三种途径等价，状态看反射的 open 属性"
      :source="CONTROL_SOURCE"
      :script='`
pop.show(); pop.hide(); pop.toggle();
// 或直接写属性：pop.open = true;
`'
      :setup="setupPopControl"
    />

    <Demo
      title="空间不足自动翻转"
      desc="请求方位放不下时翻到对侧（如紧贴视口上沿的 top 会翻到下侧），交叉轴再夹紧防出屏"
      :source="EDGE_SOURCE"
    />

    <h2>与其它浮层的边界</h2>
    <p>Popover 是<b>就地展开的轻面板</b>：不遮罩、不锁页面、可与触发件同时在场。纯文本补充说明用更轻的 <code>x-tooltip</code>（不可交互）；需要「点一行选一项」的菜单语义用它的孪生兄弟 <code>x-dropdown</code>；打断式确认用 <code>x-dialog</code>。面板内容完全由消费者供给（任意元素，或再套一个 <code>x-popover</code> 就是级联菜单），库不预设任何内部结构。落位计算收敛在 <code>core/anchor.ts</code>，与 Esc 栈、焦点陷阱（<code>core/overlay.ts</code>）共同构成全库浮层的共用基建。</p>

    <h2>API</h2>
    <ApiTable title="x-popover · 属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="POP_PROPS_ROWS" />
    <ApiTable title="方法 Methods" :columns="['方法', '说明']" :rows="POP_METHODS_ROWS" />
    <ApiTable title="插槽 Slots" :columns="['插槽', '说明']" :rows="POP_SLOTS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '所属', '说明']" :rows="POP_PARTS_ROWS" />
  </div>
</template>
