<script setup lang="ts">
// Carousel 轮播图：x-carousel + x-carousel-item（原生 scroll-snap）。
// 「程序化控制」用 next()/prev()/goTo()/value + 监听 x-change，由 :setup 实现；基础/循环/指示器为静态（自动播放内置）。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

const GRADS = [
  'linear-gradient(135deg, #6366f1, #22d3ee)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #0ea5e9)',
];
const slideHtml = (i: number) =>
  `  <x-carousel-item><div style="height: 100%; min-height: 220px; display: flex; align-items: center; justify-content: center; background: ${GRADS[i % GRADS.length]}; color: #fff; font-size: 26px; font-weight: 600">第 ${i + 1} 张</div></x-carousel-item>`;
const carHtml = (attrs: string, n = 3) =>
  `<x-carousel${attrs} style="height: 240px">\n${Array.from({ length: n }, (_, i) => slideHtml(i)).join('\n')}\n</x-carousel>`;

const BASE_SOURCE = carHtml('');
const LOOP_SOURCE = carHtml(' loop interval="1800"');
const INDICATOR_SOURCE =
  `<div style="margin-bottom: 4px; color: var(--xie-color-muted)">line 指示器：</div>\n` +
  carHtml(' indicator="line"') +
  `\n<div style="height: 12px"></div>\n<div style="margin-bottom: 4px; color: var(--xie-color-muted)">无指示器、无按钮（纯拖拽 / 程序驱动）：</div>\n` +
  carHtml(' indicator="none" arrows="false"', 2);
const PROG_SOURCE =
  carHtml(' loop') +
  `\n<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 8px">
  <x-button id="car-prev" variant="outline" size="sm">prev()</x-button>
  <x-button id="car-next" variant="outline" size="sm">next()</x-button>
  <x-button id="car-goto" variant="outline" size="sm">goTo(2)</x-button>
  <x-button id="car-value" variant="outline" size="sm">value = 0</x-button>
  <x-button id="car-auto" variant="outline" size="sm">自动播放开/关</x-button>
</div>
<div id="car-log" style="margin-top: 8px; color: var(--xie-color-muted); font-size: 13px">x-change：等待…</div>`;

type CarouselHost = Element & {
  value: number;
  interval: number;
  next: () => void;
  prev: () => void;
  goTo: (i: number) => void;
};

const setupCarouselProgram = (root: HTMLElement) => {
  const car = root.querySelector('x-carousel') as CarouselHost | null;
  const log = root.querySelector('#car-log');
  if (!car || !log) return;
  car.addEventListener('x-change', (e) => {
    log.textContent = 'x-change：当前第 ' + ((e as CustomEvent<{ value: number }>).detail.value + 1) + ' 张';
  });
  const bind = (id: string, fn: () => void) => {
    const b = root.querySelector(id);
    if (b) b.addEventListener('click', fn);
  };
  bind('#car-prev', () => car.prev());
  bind('#car-next', () => car.next());
  bind('#car-goto', () => car.goTo(2));
  bind('#car-value', () => (car.value = 0));
  bind('#car-auto', () => (car.interval = car.interval > 0 ? 0 : 1200));
};

// API
const CAR_PROPS_ROWS = [
  ['value', '当前张序（0 起，不反射）。写它即滚向该张；拖拽落定后组件也会回写并派发 x-change', 'number', '0'],
  ['loop', '无限循环：首尾各挂一张克隆哨兵，环绕/拖过端点都只挪一步再同位无缝换张；关则端点箭头禁用、自动播放停在末张', 'boolean', 'false'],
  ['interval', '自动播放间隔 ms；0 = 不播。悬停/聚焦/页签隐藏时暂停，恢复后重新计时', 'number', '0'],
  ['arrows', '左右圆钮开关；写 false（含 attribute 字面量）即收掉', 'boolean', 'true'],
  ['indicator', '指示器：dot（小圆点）/ line（短条）/ none', 'string', "'dot'"],
  ['label', '无障碍区域名（role=region 的 aria-label）；每张的「第 n 张，共 m 张」由根自动回写', 'string', "'轮播图'"],
];
const CAR_MEMBERS_ROWS = [
  ['next() / prev()', '相对当前张前进/后退（端点行为跟 loop）'],
  ['goTo(i)', '滚向第 i 张（越界夹紧）'],
  ['x-change', '滚动落定且张序变化时派发（bubbles+composed），detail:{ value }；任何来源同一条路径'],
  ['part', 'track / prev / next / indicators（张内 part="base" 在 x-carousel-item）'],
];
</script>

<template>
  <div>
    <h1>Carousel 轮播图</h1>
    <p class="lead"><code>&lt;x-carousel&gt;</code> + <code>&lt;x-carousel-item&gt;</code> 整幅滑动浏览内容（banner / 图片组 / 功能介绍）。实现走<strong>原生 scroll-snap</strong>：触屏拖拽、触控板横扫、惯性滚动都是浏览器原生能力，JS 只做翻页协调。可配循环（loop）、自动播放（interval）、左右钮（arrows）与指示器（indicator）。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-carousel / x-carousel-item</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="缺省 dot 指示器 + 左右钮；非 loop 到端点箭头置灰；也可用触控板横扫/触屏拖拽"
      :column="true"
      :source="BASE_SOURCE"
    />

    <Demo
      title="循环 + 自动播放"
      desc="loop 无限滚动：首尾克隆哨兵，环绕只挪一步、落定同位瞬移真张；interval 毫秒数即节奏；悬停、聚焦内部、切走页签自动暂停，移开恢复"
      :column="true"
      :source="LOOP_SOURCE"
    />

    <Demo
      title="指示器与按钮形态"
      desc="indicator：dot（缺省）/ line / none；arrows 写 false 收掉左右钮（attribute 显式假值）"
      :column="true"
      :source="INDICATOR_SOURCE"
    />

    <Demo
      title="程序化控制"
      desc="next()/prev()/goTo(i)；写 value 属性即滚向该张；滚动落定统一派发 x-change"
      :column="true"
      :source="PROG_SOURCE"
      :script='`
const car = document.querySelector("x-carousel");
car.next();           // 前进一张（loop 关到头不动，开则经哨兵一步环绕）
car.goTo(2);          // 直接跳第 3 张
car.value = 0;        // 写属性同样滚过去；落定都派发 x-change
car.interval = 1200;  // 随时开关自动播放（0 = 关）
car.addEventListener("x-change", (e) => console.log("当前", e.detail.value));
`'
      :setup="setupCarouselProgram"
    />

    <h2>说明</h2>
    <p>实现取舍：滑轨是 <code>overflow-x:auto + scroll-snap-type:x mandatory</code>，每张自声明 <code>flex:0 0 100% + scroll-snap-align:start + scroll-snap-stop:always</code>（快速甩动也被迫逐站停靠，一次手势只翻一张），JS 不做平移几何。loop 的无限滚动用经典克隆哨兵：首尾各深克隆一张缓冲（aria-hidden + inert，不可交互不进无障碍树），落进哨兵区即同位瞬移真张。高度由消费方给（<code>style="height:…"</code>）或由张内容撑开。裁切圆角跟随主题圆角旋钮；<code>prefers-reduced-motion</code> 下切张为瞬移。键盘不截 ←→（翻页键易误伤），左右钮与指示器 Tab 可达。</p>

    <h2>API · x-carousel</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="CAR_PROPS_ROWS" />
    <ApiTable title="方法 / 事件 / Part" :columns="['名称', '说明']" :rows="CAR_MEMBERS_ROWS" />
  </div>
</template>
