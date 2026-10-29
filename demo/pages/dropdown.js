/** Dropdown 下拉菜单文档：x-popover 的菜单化子集；点行即关、宽随触发件、行结构由内容自定 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

function button(label, attrs = {}) {
  const b = document.createElement('x-button');
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, String(v));
  b.textContent = label;
  return b;
}

/** 一行菜单：ghost 按钮左对齐（宽度由面板默认纵排 stretch 铺满，行内部对齐自己定） */
function row(label, opts = {}) {
  const b = button(label, { variant: 'ghost', size: 'sm', ...(opts.attrs || {}) });
  b.setAttribute('style', 'justify-content:flex-start;gap:8px' + (opts.style || ''));
  if (opts.value) b.dataset.value = opts.value;
  return b;
}

/** 建一个 dropdown：trigger 走默认插槽，菜单行归组进 <x-dropdown-content>（它自动挂进面板、默认纵排铺满） */
function dd(attrs, trigger, rows) {
  const d = document.createElement('x-dropdown');
  for (const [k, v] of Object.entries(attrs || {})) d.setAttribute(k, String(v));
  d.append(trigger);
  const content = document.createElement('x-dropdown-content');
  content.append(...rows);
  d.append(content);
  return d;
}

export function render(el) {
  /* —— 1. 基础：点行即关 + 状态回显 —— */
  const status = h('span', { style: 'font-size:13px;color:var(--xie-color-muted)' }, '还没选');
  const basic = dd({}, button('操作 ▾', { variant: 'outline' }), [
    row('✏️ 重命名'), row('📋 复制'), row('📦 归档'), row('🗑 删除', { attrs: { color: 'danger' } }),
  ]);
  const basicWrap = h('div', { style: 'display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:48px 0 8px' }, basic, status);
  // 直接吃 dropdown 的语义事件：detail.item 就是被点的行元素，不用再委派 click + closest
  basic.addEventListener('x-select', (e) => {
    status.textContent = `点了「${e.detail.item.textContent.trim()}」（面板已自动收起）`;
  });

  /* —— 2. 带分隔与分组 —— */
  const grouped = dd({}, button('排序 ▾', { variant: 'soft' }), [
    row('名称', { value: 'name' }), row('大小', { value: 'size' }), row('修改时间', { value: 'mtime' }),
    h('hr', { style: 'border:0;border-top:1px solid var(--xie-color-border);margin:4px 0' }),
    row('升序 ↑', { style: ';color:var(--xie-color-primary)' }), row('降序 ↓', { style: ';color:var(--xie-color-primary)' }),
  ]);
  const groupedWrap = h('div', { style: 'padding:48px 0 8px' }, grouped);

  /* —— 3. 四向落位 —— */
  const places = h('div', { style: 'display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding:32px 0' },
    dd({ placement: 'top' }, button('top', { variant: 'soft' }), [row('上面'), row('的面板')]),
    dd({ placement: 'bottom' }, button('bottom（默认）', { variant: 'soft' }), [row('下面'), row('的面板')]),
    dd({ placement: 'left' }, button('left', { variant: 'soft' }), [row('左边'), row('的面板')]),
    dd({ placement: 'right' }, button('right', { variant: 'soft' }), [row('右边'), row('的面板')]),
  );

  /* —— 4. hover 触发（菜单栏手感）—— */
  const hover = dd({ trigger: 'hover' }, button('文件', { variant: 'soft' }), [
    row('新建'), row('打开…'), row('保存'), h('hr', { style: 'border:0;border-top:1px solid var(--xie-color-border);margin:4px 0' }), row('退出'),
  ]);
  const hoverBar = h('div', { style: 'display:flex;gap:4px;padding:8px;border:1px solid var(--xie-color-border);border-radius:var(--xie-radius-md)' },
    hover,
    dd({ trigger: 'hover' }, button('编辑', { variant: 'soft' }), [row('撤销'), row('重做')]),
    h('span', { style: 'align-self:center;font-size:12px;color:var(--xie-color-muted);margin-left:8px' }, '移开 150ms 自动收，连续横扫不误关'),
  );

  /* —— 5. 宽度跟随触发件 —— */
  const wideTrigger = button('宽触发件 → 面板至少一样宽 ▾', { variant: 'outline' });
  wideTrigger.setAttribute('style', 'width:260px;justify-content:space-between');
  const wide = dd({}, wideTrigger, [row('面板宽度不小于触发件'), row('内容更长则自动撑开')]);
  const wideWrap = h('div', { style: 'padding:48px 0 8px' }, wide);

  el.append(
    h('h1', null, 'Dropdown 下拉菜单'),
    h('p', { class: 'lead' },
      '「点一下、选一行的」下拉菜单：x-popover 的菜单化子集——面板贴触发件底沿起边对齐、宽度至少跟触发件一致、菜单行默认纵向铺满、点中任意一行即视为选完派发 <code>x-select</code> 并自动收起。行用配套部件 <code>x-dropdown-content</code> 归组（不用写 slot 魔法串、不用套 div），行内放什么元素仍由你定。'),

    h('h2', null, '引入'),
    h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, `import '@xie-work/xie-ui';`)))),

    h('h2', null, '代码演示'),
    demoCard({
      title: '基础用法',
      desc: '触发件放默认插槽、菜单行归组进 x-dropdown-content（自动挂进面板、默认纵排铺满）；监听 x-select 拿被点的行',
      build: (c) => c.append(basicWrap),
      code: `<x-dropdown id="dd">
  <x-button variant="outline">操作 ▾</x-button>
  <x-dropdown-content>
    <x-button variant="ghost" size="sm">重命名</x-button>
    <x-button variant="ghost" size="sm" color="danger">删除</x-button>
  </x-dropdown-content>
</x-dropdown>
<script>
  dd.addEventListener('x-select', (e) => console.log(e.detail.item));
</\script>`,
    }),
    demoCard({
      title: '分隔与分组',
      desc: '面板只收口成菜单容器（4px 内边距、超高滚动），行间加不加 hr/分组标题随便拼；轻量场景也可不裹容器、直接把多个元素挂 slot="content"（同样默认纵排）',
      build: (c) => c.append(groupedWrap),
      code: `<x-dropdown>
  <x-button variant="soft">排序 ▾</x-button>
  <x-dropdown-content>
    <x-button variant="ghost" size="sm">名称</x-button>
    <hr />
    <x-button variant="ghost" size="sm">升序</x-button>
  </x-dropdown-content>
</x-dropdown>`,
    }),
    demoCard({
      title: '四向落位',
      desc: 'placement 同 x-popover（bottom 默认），空间不足自动翻到对侧',
      build: (c) => c.append(places),
      code: `<x-dropdown placement="right">…</x-dropdown>`,
    }),
    demoCard({
      title: '悬停触发（菜单栏）',
      desc: 'trigger="hover" 得到经典菜单栏手感：移开有 150ms 宽限，横扫相邻菜单不断',
      build: (c) => c.append(hoverBar),
      code: `<x-dropdown trigger="hover">
  <x-button variant="soft">文件</x-button>
  <x-dropdown-content>
    <x-button variant="ghost" size="sm">新建</x-button>
    <x-button variant="ghost" size="sm">打开…</x-button>
  </x-dropdown-content>
</x-dropdown>`,
    }),
    demoCard({
      title: '宽度跟随触发件',
      desc: '面板 minWidth 自动取触发件宽度；内容更宽时自行撑开',
      build: (c) => c.append(wideWrap),
      code: `<x-dropdown>
  <x-button style="width:260px">宽触发件 ▾</x-button>
  <x-dropdown-content>
    <x-button variant="ghost" size="sm">面板至少一样宽</x-button>
  </x-dropdown-content>
</x-dropdown>`,
    }),

    h('h2', null, '设计要点'),
    rich(
      'dropdown 是 popover 的<b>子类</b>而非拷贝：只覆盖四个旋钮（交叉轴 <code>start</code> 对齐、宽度跟手、<code>closeOnChoose</code>、<code>haspopup=menu</code>），开合/Esc 栈/外部点关/焦点归还/fixed 落位全部继承，与 <code>x-dialog-header</code> 继承 <code>x-drawer-header</code> 同一套路（见 design.md 的继承复用）。菜单行用 <b><code>x-dropdown-content</code> 归组</b>：它连接时若没写 slot 会自动挂 <code>slot="content"</code> 进面板，消费者不用记魔法串，DOM 树上行与触发件也不再平铺成兄弟；内部默认纵排铺满。监听 <b><code>x-select</code> 拿 <code>detail.item</code></b> 即被点的行（content 的直接子级；平铺写法则是宿主直接子级），行内带什么数据（dataset/value/图标）自己取。需要完整 <code>role=menu/menuitem</code> 键盘漫游的场景请显式给行加 ARIA 或改用 <code>x-menu</code>——库刻意不在容器里代管行的语义。',
    ),

    h('h2', null, 'API'),
    h('h3', null, 'x-dropdown · 属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['open', '面板开合（反射，可编程读写）', 'boolean', 'false'],
        ['placement', '弹出方位（反射；起边对齐 + 宽度跟手已内置）', "'top' | 'bottom' | 'left' | 'right'", "'bottom'"],
        ['trigger', "click 点开合 / hover 悬停开移开延时关", "'click' | 'hover'", "'click'"],
      ],
    ),
    h('h3', null, '方法 Methods'),
    apiTable(
      ['方法', '说明'],
      [['show() / hide() / toggle()', '继承自 x-popover，等价于写 open 属性']],
    ),
    h('h3', null, '事件 Events'),
    apiTable(
      ['事件', '说明'],
      [['x-select', '点中面板内容时派发（收起面板前，bubbles/composed），detail:{ item }，item = 被点的行元素（x-dropdown-content 的直接子级；平铺写法则为宿主直接子级）']],
    ),
    h('h3', null, 'Slots'),
    apiTable(
      ['插槽', '说明'],
      [
        ['default', '触发内容（常见为一个 x-button）'],
        ['content', '菜单面板内容：主范式放一个 <code>x-dropdown-content</code>（它自动挂此插槽）；轻量写法也可直接把多个元素挂此插槽（同样默认纵排）'],
      ],
    ),
    h('h3', null, 'x-dropdown-content · 菜单行容器'),
    apiTable(
      ['要点', '说明'],
      [
        ['定位', '纯容器不带行为：归组菜单行、自动挂 slot="content"（已显式写 slot 则尊重）、:host 默认 flex 纵排逐行铺满'],
        ['内容', '直接子元素即菜单行，结构不预设（x-button / hr / 分组标题…）；行内部对齐由行元素自定'],
      ],
    ),
    h('h3', null, '样式部件 Parts'),
    apiTable(
      ['part', '所属', '说明'],
      [['panel', 'x-dropdown', '菜单面板（容器 4px 内边距、max-height 320px 超高滚动）']],
    ),
  );
}
