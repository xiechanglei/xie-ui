/** Popover 气泡卡文档：包裹触发内容，click/hover 弹出 fixed 实底面板；四向翻转、Esc 栈、焦点陷阱 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

function button(label, attrs = {}, style) {
  const b = document.createElement('x-button');
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, String(v));
  if (style) b.setAttribute('style', style);
  b.textContent = label;
  return b;
}

/** 建一个 popover：trigger 走默认插槽，content 挂 slot="content" */
function pop(attrs, trigger, content) {
  const p = document.createElement('x-popover');
  for (const [k, v] of Object.entries(attrs || {})) p.setAttribute(k, String(v));
  p.append(trigger);
  const box = document.createElement('div');
  box.setAttribute('slot', 'content');
  box.append(content);
  p.append(box);
  return p;
}

function textContent(...lines) {
  return h('div', { style: 'display:flex;flex-direction:column;gap:8px;max-width:240px' },
    ...lines.map((l) => (typeof l === 'string' ? h('span', null, l) : l)));
}

export function render(el) {
  /* —— 1. 基础：点触发件开、点空白/再点关 —— */
  const basic = pop({}, button('点我展开', { variant: 'outline' }),
    textContent('这是一张气泡卡片，可承载富内容与交互件；点面板外任意处或再按 Esc 即收起。',
      h('div', { style: 'display:flex;gap:8px' }, button('知道了', { color: 'primary', size: 'sm' }), button('取消', { variant: 'soft', size: 'sm' }))));

  /* —— 2. 四向落位 —— */
  const places = h('div', { style: 'display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding:32px 0' },
    pop({ placement: 'top' }, button('top', { variant: 'soft' }), textContent('面板在上方')),
    pop({ placement: 'bottom' }, button('bottom（默认）', { variant: 'soft' }), textContent('面板在下方')),
    pop({ placement: 'left' }, button('left', { variant: 'soft' }), textContent('面板在左侧')),
    pop({ placement: 'right' }, button('right', { variant: 'soft' }), textContent('面板在右侧')),
  );

  /* —— 3. hover 触发 —— */
  const hover = pop({ trigger: 'hover' }, button('悬停我', { variant: 'outline' }),
    textContent('鼠标移入即开、移开延时 150ms 自动收；此模式不设焦点陷阱，跟随指针语义。'));

  /* —— 4. 焦点陷阱与归还（P0-1 基建首秀）—— */
  const trapContent = textContent(
    h('label', { style: 'display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--xie-color-muted)' },
      '打开后焦点自动落进这里，Tab 锁在面板内循环：',
      (() => { const i = document.createElement('input'); i.placeholder = '随手输入…'; return i; })()),
    button('末尾按钮（Shift+Tab 到头会绕回这里）', { variant: 'soft', size: 'sm' }),
  );
  const trap = pop({}, button('展开含表单的面板', { color: 'primary' }), trapContent);

  /* —— 5. 可编程控制 open —— */
  const ctlStatus = h('span', { style: 'font-size:13px;color:var(--xie-color-muted)' }, '当前：开着的（open 属性直写）');
  const ctlPop = pop({ open: true }, button('这个面板默认开着', { variant: 'outline' }), textContent('外部按钮可以程序化关掉我。'));
  const ctlClose = button('程序化关闭', { variant: 'soft', color: 'danger' });
  ctlClose.addEventListener('click', () => { ctlPop.hide(); ctlStatus.textContent = '当前：已被 show()/hide() 关掉'; });
  const ctlOpen = button('程序化打开', { variant: 'soft', color: 'success' });
  ctlOpen.addEventListener('click', () => { ctlPop.show(); ctlStatus.textContent = '当前：程序化打开'; });
  const ctlWrap = h('div', { style: 'display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:40px 0 16px' }, ctlPop, ctlClose, ctlOpen, ctlStatus);

  /* —— 6. 贴边翻转：靠近视口上沿自动翻到下侧 —— */
  const topEdge = h('div', { style: 'padding:4px 0 40px' },
    pop({ placement: 'top' }, button('我上面没地方了', { variant: 'outline' }), textContent('空间不足时主轴自动翻转到对侧，交叉轴夹紧不出屏。')));

  el.append(
    h('h1', null, 'Popover 气泡卡片'),
    h('p', { class: 'lead' },
      '包裹一段触发内容，点击（或悬停）在其旁弹出一张实底卡片面板。面板是 position:fixed 的浮层：不受祖先 overflow 裁剪、空间不足自动翻转方位、滚动缩放跟随重定位。承载富内容与交互件，打开时吃库的浮层基建——Esc 走全局关闭栈、Tab 锁在面板内、关闭后焦点归还给来源元素。'),

    h('h2', null, '引入'),
    h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, `import '@xie-work/xie-ui';`)))),

    h('h2', null, '代码演示'),
    demoCard({
      title: '基础用法',
      desc: '触发内容放默认插槽，面板内容挂 slot="content"；点触发件开合、点面板外即关',
      build: (c) => c.append(basic),
      code: `<x-popover>
  <x-button variant="outline">点我展开</x-button>
  <div slot="content">气泡卡片内容……</div>
</x-popover>`,
    }),
    demoCard({
      title: '四向落位',
      desc: 'placement 指定面板方位（bottom 默认 / top / left / right）',
      build: (c) => c.append(places),
      code: `<x-popover placement="top">…</x-popover>
<x-popover placement="right">…</x-popover>`,
    }),
    demoCard({
      title: '悬停触发',
      desc: 'trigger="hover" 移入即开、移开延时收；此模式不设焦点陷阱',
      build: (c) => c.append(hover),
      code: `<x-popover trigger="hover">…</x-popover>`,
    }),
    demoCard({
      title: '焦点陷阱与归还',
      desc: 'click 模式打开即聚焦面板内首个可聚焦件，Tab 循环锁在面板内；Esc/外点后焦点回到触发按钮',
      build: (c) => c.append(trap),
      code: `<x-popover>
  <x-button>展开含表单的面板</x-button>
  <form slot="content">…</form>
</x-popover>`,
    }),
    demoCard({
      title: '可编程控制',
      desc: 'open 属性 / show() / hide() / toggle() 三种途径等价，状态看反射的 open 属性',
      build: (c) => c.append(ctlWrap),
      code: `pop.show(); pop.hide(); pop.toggle();
// 或直接写属性：pop.open = true;`,
    }),
    demoCard({
      title: '空间不足自动翻转',
      desc: '请求方位放不下时翻到对侧（如紧贴视口上沿的 top 会翻到下侧），交叉轴再夹紧防出屏',
      build: (c) => c.append(topEdge),
      code: `<x-popover placement="top">…</x-popover> <!-- 上方空间不足时自动翻到下方 -->`,
    }),

    h('h2', null, '与其它浮层的边界'),
    rich(
      'Popover 是<b>就地展开的轻面板</b>：不遮罩、不锁页面、可与触发件同时在场。纯文本补充说明用更轻的 <code>x-tooltip</code>（不可交互）；需要「点一行选一项」的菜单语义用它的孪生兄弟 <code>x-dropdown</code>；打断式确认用 <code>x-dialog</code>。面板内容完全由消费者供给（任意元素，或再套一个 <code>x-popover</code> 就是级联菜单），库不预设任何内部结构——这也是它和常见组件库「标题/按钮模板」写法的分野。落位计算收敛在 <code>core/anchor.ts</code>，与 Esc 栈、焦点陷阱（<code>core/overlay.ts</code>）共同构成全库浮层的共用基建。',
    ),

    h('h2', null, 'API'),
    h('h3', null, 'x-popover · 属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['open', '面板开合（反射，可编程读写）', 'boolean', 'false'],
        ['placement', '弹出方位（反射；空间不足自动翻到对侧）', "'top' | 'bottom' | 'left' | 'right'", "'bottom'"],
        ['trigger', "触发方式：click 点触发件开合 / hover 悬停开、移开延时 150ms 关", "'click' | 'hover'", "'click'"],
      ],
    ),
    h('h3', null, '方法 Methods'),
    apiTable(
      ['方法', '说明'],
      [['show() / hide() / toggle()', '等价于写 open 属性；close 命令（x-command）也认领 hide']],
    ),
    h('h3', null, 'Slots'),
    apiTable(
      ['插槽', '说明'],
      [
        ['default', '触发内容（按钮/图标/任意元素）'],
        ['content', '面板内容（富内容与交互件皆可；点面板外/按 Esc 即关）'],
      ],
    ),
    h('h3', null, '样式部件 Parts'),
    apiTable(
      ['part', '所属', '说明'],
      [
        ['anchor', 'x-popover', '包住触发内容的行内壳（display:contents，不产生盒子）'],
        ['panel', 'x-popover', 'fixed 面板本体（底色/边框/圆角/阴影全吃全局令牌，可整体覆写）'],
      ],
    ),
  );
}
