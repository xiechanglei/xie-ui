/** x-container 应用外壳文档：sidebar 折叠为 rail（联动 logo/menu）、side 方位、可滚主内容 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

/** 建一个 x-menu-item（无图标 → rail 折叠时显示标签首字） */
function item(value, label) {
  const el = document.createElement('x-menu-item');
  el.setAttribute('value', value);
  el.textContent = label;
  return el;
}

/** 建一个 x-menu-group（collapsible，含若干项） */
function group(label, items) {
  const g = document.createElement('x-menu-group');
  g.setAttribute('label', label);
  g.setAttribute('collapsible', '');
  g.append(...items);
  return g;
}

/** 组装一个内嵌演示用 x-container */
function buildShell(opts = {}) {
  const c = document.createElement('x-container');
  c.setAttribute('collapsible', '');
  if (opts.side) c.setAttribute('side', opts.side);
  if (opts.sidebarWidth) c.setAttribute('sidebar-width', opts.sidebarWidth);
  c.style.height = '340px';
  c.style.border = '1px solid var(--xie-color-border)';
  c.style.borderRadius = '10px';
  c.style.overflow = 'hidden';

  if (opts.header) {
    const hd = h('div', { slot: 'header', style: 'padding:10px 16px;font-weight:600;border-bottom:1px solid var(--xie-color-border);background:var(--xie-color-surface)' }, opts.header);
    c.append(hd);
  }

  const side = h('div', { slot: 'sidebar', style: 'display:flex;flex-direction:column;gap:6px;padding:12px 0;min-width:0' });
  const lg = document.createElement('x-logo');
  lg.setAttribute('mark', 'X');
  lg.setAttribute('title', '控制台');
  lg.setAttribute('subtitle', 'Admin');
  lg.style.padding = '2px 16px 10px';
  const menu = document.createElement('x-menu');
  menu.append(
    group('概览', [item('dash', '仪表盘'), item('stat', '数据统计')]),
    group('管理', [item('user', '用户'), item('role', '权限'), item('set', '设置')]),
  );
  side.append(lg, menu);
  c.append(side);

  const main = h(
    'div',
    { style: 'padding:24px;min-height:100%' },
    h('h3', { style: 'margin:0 0 8px' }, '主内容区'),
    h('p', { style: 'margin:0 0 16px;color:var(--xie-color-muted)' }, '点左下角按钮折叠侧栏：logo 只剩首字母、菜单项文字隐去（无图标者显首字）。滚动区在容器内。'),
    h('p', { style: 'line-height:1.8' }, '向下滚动验证容器内滚动 + 独立区域。'.repeat(1) + ' 内容内容内容 '.repeat(40)),
  );
  c.append(main);

  if (opts.footer) {
    const ft = h('div', { slot: 'footer', style: 'padding:8px 16px;font-size:12px;border-top:1px solid var(--xie-color-border);color:var(--xie-color-muted)' }, opts.footer);
    c.append(ft);
  }
  return c;
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}

export function render(el) {
  el.append(
    h('h1', null, 'Container 布局容器'),
    h('p', { class: 'lead' }, '面向后台常见的「侧栏 + 内容」应用外壳：可选 header、sidebar 侧栏、默认主内容、可选 footer。侧栏可折叠为窄栏（rail），rail 由容器单源下沉给 x-logo 与 x-menu，驱动它们各自的窄栏形态。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础外壳（左侧栏 + 可折叠）',
      desc: 'sidebar 放 x-logo + x-menu，点按钮折叠',
      build: (c) => {
        c.style.width = '100%';
        c.append(buildShell({ header: '顶部 Header', footer: '© 2026 xie-ui' }));
      },
      code: `<x-container collapsible>
  <div slot="header">顶部 Header</div>
  <div slot="sidebar">
    <x-logo mark="X" title="控制台" subtitle="Admin"></x-logo>
    <x-menu>
      <x-menu-group label="概览" collapsible>
        <x-menu-item value="dash">仪表盘</x-menu-item>
        <x-menu-item value="stat">数据统计</x-menu-item>
      </x-menu-group>
    </x-menu>
  </div>
  <div>主内容区…</div>
  <div slot="footer">© 2026 xie-ui</div>
</x-container>`,
    }),

    demoCard({
      title: '侧栏在右',
      desc: 'side="right"',
      build: (c) => {
        c.style.width = '100%';
        c.append(buildShell({ side: 'right' }));
      },
      code: `<x-container side="right" collapsible>
  <div slot="sidebar">…</div>
  <div>主内容区…</div>
</x-container>`,
    }),

    demoCard({
      title: '自定义侧栏宽度',
      desc: 'sidebar-width="220px"',
      build: (c) => {
        c.style.width = '100%';
        c.append(buildShell({ sidebarWidth: '220px' }));
      },
      code: `<x-container collapsible sidebar-width="220px">
  <div slot="sidebar">…</div>
  <div>主内容区…</div>
</x-container>`,
    }),

    rich('交互：容器底部内置折叠按钮（<code>collapsible</code> 时显示），点击切换 rail 并派发 <code>x-rail-change</code>。rail 会被容器下沉给子树里的 <code>x-logo</code> 与 <code>x-menu</code>，菜单再扇出到每一项。选中态仍由 <code>x-menu</code> 负责，容器不含路由/菜单逻辑。'),

    h('h2', null, 'API'),
    h('h3', null, '属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['rail', '侧栏是否折叠为窄栏（下沉给 logo/menu）', 'boolean', 'false'],
        ['side', '侧栏方位', "'left' | 'right'", "'left'"],
        ['sidebar-width', '侧栏展开宽度（attribute: sidebar-width）', 'CSS 长度', "'260px'"],
        ['rail-width', '侧栏折叠宽度（attribute: rail-width）', 'CSS 长度', "'68px'"],
        ['collapsible', '是否显示内置折叠按钮', 'boolean', 'true'],
      ],
    ),
    h('h3', null, '方法 Methods'),
    apiTable(
      ['方法', '说明'],
      [
        ['toggleRail(force?)', '切换侧栏折叠；force 可显式指定目标态'],
        ['scrollContentTop()', '主内容区滚动回顶部'],
      ],
    ),
    h('h3', null, '事件 Events'),
    apiTable(
      ['事件', '说明', '回调参数'],
      [['x-rail-change', '折叠态变化时触发（供外部持久化）', '{ rail }'],],
    ),
    h('h3', null, '插槽 Slots'),
    apiTable(
      ['插槽', '说明'],
      [
        ['header', '顶部区（存在才渲染容器）'],
        ['sidebar', '侧栏（放 x-logo + x-menu 等）'],
        ['(默认)', '主内容区（自身滚动）'],
        ['footer', '底部区（存在才渲染）'],
      ],
    ),
    h('h3', null, 'CSS 部分 Part'),
    apiTable(
      ['part', '说明'],
      [
        ['base', '整体网格容器'],
        ['header', '顶部容器'],
        ['sidebar', '侧栏容器'],
        ['main', '主内容容器'],
        ['footer', '底部容器'],
        ['rail-toggle', '内置折叠按钮'],
      ],
    ),
  );
}
