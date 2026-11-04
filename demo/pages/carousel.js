/** x-carousel 轮播图文档：用法 + API（原生 scroll-snap 实现，整幅滑动浏览） */
import { h, demoCard, apiTable } from '/demo/render.js';

/* ---- 轻量构建助手 ---- */
const GRADS = [
  'linear-gradient(135deg, #6366f1, #22d3ee)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #0ea5e9)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
];

function slide(label, i = 0) {
  return h(
    'x-carousel-item',
    null,
    h(
      'div',
      { style: `height:100%;min-height:220px;display:flex;align-items:center;justify-content:center;background:${GRADS[i % GRADS.length]};color:#fff;font-size:26px;font-weight:600` },
      label,
    ),
  );
}

function carousel(props = {}, n = 3) {
  const c = h('x-carousel', { style: 'height:240px', ...props });
  for (let i = 1; i <= n; i++) c.append(slide(`第 ${i} 张`, i - 1));
  return c;
}

function btn(label, onclick) {
  return h('x-button', { variant: 'outline', size: 'sm', onclick }, label);
}

function row(...children) {
  return h('div', { style: 'display:flex;align-items:center;gap:8px;flex-wrap:wrap' }, ...children);
}

function note(text) {
  return h('div', { style: 'margin-top:8px;color:var(--xie-color-muted);font-size:13px' }, text);
}

export function render(el) {
  el.append(
    h('h1', null, 'Carousel 轮播图'),
    h('p', { class: 'lead' }, '<code>&lt;x-carousel&gt;</code> + <code>&lt;x-carousel-item&gt;</code> 整幅滑动浏览内容（banner / 图片组 / 功能介绍）。实现走<strong>原生 scroll-snap</strong>：触屏拖拽、触控板横扫、惯性滚动都是浏览器原生能力，JS 只做翻页协调。可配循环（loop）、自动播放（interval）、左右钮（arrows）与指示器（indicator）。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础用法',
      desc: '缺省 dot 指示器 + 左右钮；非 loop 到端点箭头置灰；也可用触控板横扫/触屏拖拽',
      build: (c) => {
        c.append(carousel());
      },
      code: `<x-carousel style="height:240px">
  <x-carousel-item>…</x-carousel-item>
  <x-carousel-item>…</x-carousel-item>
  <x-carousel-item>…</x-carousel-item>
</x-carousel>`
    }),

    demoCard({
      title: '循环 + 自动播放',
      desc: 'loop 无限滚动：首尾克隆哨兵，环绕只挪一步、落定同位瞬移真张（拖过端点也不弹回）；interval 毫秒数即节奏；悬停、聚焦内部、切走页签自动暂停，移开恢复',
      build: (c) => {
        c.append(
          // 布尔走真属性值（h() 命中已升级元素的访问器，'' / 'false' 字符串会被 !! 强转带偏）
          carousel({ loop: true, interval: 1800 }),
          note('把鼠标移进去会暂停，移开继续；首尾相连可一直刷，快速甩动也只翻一张（scroll-snap-stop 逐站停靠）。'),
        );
      },
      code: `<x-carousel loop interval="1800" style="height:240px">…</x-carousel>`
    }),

    demoCard({
      title: '指示器与按钮形态',
      desc: 'indicator：dot（缺省）/ line / none；arrows 写 false 收掉左右钮（attribute 显式假值）',
      build: (c) => {
        c.append(
          row(h('span', null, 'line 指示器：')),
          carousel({ indicator: 'line' }),
          h('div', { style: 'height:12px' }),
          row(h('span', null, '无指示器、无按钮（纯拖拽/程序驱动）：')),
          (() => {
            const c = carousel({ indicator: 'none' }, 2);
            c.arrows = false; // 布尔假值 h() 会跳过 props，构建后直接写属性
            return c;
          })(),
        );
      },
      code: `<x-carousel indicator="line" style="height:240px">…</x-carousel>
<x-carousel indicator="none" arrows="false" style="height:240px">…</x-carousel>`
    }),

    demoCard({
      title: '程序化控制',
      desc: 'next()/prev()/goTo(i)；写 value 属性即滚向该张；滚动落定统一派发 x-change',
      build: (c) => {
        const car = carousel({ loop: true });
        const log = note('x-change：等待…');
        car.addEventListener('x-change', (e) => (log.textContent = `x-change：当前第 ${e.detail.value + 1} 张`));
        c.append(
          car,
          row(
            btn('prev()', () => car.prev()),
            btn('next()', () => car.next()),
            btn('goTo(2)', () => car.goTo(2)),
            btn('value = 0', () => (car.value = 0)),
            btn('自动播放开/关', () => (car.interval = car.interval > 0 ? 0 : 1200)),
          ),
          log,
        );
      },
      code: `const car = document.querySelector('x-carousel');
car.next();          // 前进一张（loop 关到头不动，开则经哨兵一步环绕）
car.goTo(2);         // 直接跳第 3 张
car.value = 0;       // 写属性同样滚过去；落定都派发 x-change
car.interval = 1200; // 随时开关自动播放（0 = 关）
car.addEventListener('x-change', (e) => console.log('当前', e.detail.value));`,
    }),

    h('h2', null, 'API · x-carousel'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['value', '当前张序（0 起，不反射）。写它即滚向该张；拖拽落定后组件也会回写并派发 x-change', 'number', '0'],
        ['loop', '无限循环：首尾各挂一张克隆哨兵（data-clone，不计入张数），环绕/拖过端点都只挪一步再同位无缝换张；关则端点箭头禁用、自动播放停在末张', 'boolean', 'false'],
        ['interval', '自动播放间隔 ms；0 = 不播。悬停/聚焦/页签隐藏时暂停，恢复后重新计时', 'number', '0'],
        ['arrows', '左右圆钮开关；写 false（含 attribute 字面量）即收掉', 'boolean', 'true'],
        ['indicator', '指示器：dot（小圆点）/ line（短条）/ none', 'string', "'dot'"],
        ['label', '无障碍区域名（role=region 的 aria-label）；每张的「第 n 张，共 m 张」由根自动回写', 'string', "'轮播图'"],
      ],
    ),
    apiTable(
      ['方法 / 事件 / Part', '说明'],
      [
        ['next() / prev()', '相对当前张前进/后退（端点行为跟 loop）'],
        ['goTo(i)', '滚向第 i 张（越界夹紧）'],
        ['x-change', '滚动落定且张序变化时派发（bubbles+composed），detail:{ value }；任何来源（拖拽/按钮/自动/程序化）同一条路径'],
        ['part', 'track / prev / next / indicators（张内 part="base" 在 x-carousel-item）'],
      ],
    ),

    h('h2', null, '说明'),
    h('p', null, '实现取舍：滑轨是 <code>overflow-x:auto + scroll-snap-type:x mandatory</code>，每张自声明 <code>flex:0 0 100% + scroll-snap-align:start + scroll-snap-stop:always</code>（快速甩动也被迫逐站停靠，一次手势只翻一张），JS 不做平移几何——拖拽手感与惯性归浏览器，当前张靠 <code>scrollend</code>（老浏览器退回 scroll 停 120ms debounce）取整判定。loop 的无限滚动用经典克隆哨兵：首尾各深克隆一张缓冲（aria-hidden + inert，不可交互不进无障碍树），落进哨兵区即同位瞬移真张。高度由消费方给（<code>style="height:…"</code>）或由张内容撑开。裁切圆角跟随主题圆角旋钮；<code>prefers-reduced-motion</code> 下切张为瞬移。键盘不截 ←→（张内可能有横向内容，翻页键易误伤），左右钮与指示器 Tab 可达。'),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
