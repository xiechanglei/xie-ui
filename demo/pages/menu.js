/** x-menu 菜单文档：三件套（x-menu / x-menu-group / x-menu-item）用法 + API */
import { h, demoCard, apiTable } from '/demo/render.js';

/* ---- 轻量构建助手 ---- */
function item(value, label, opts = {}) {
  const it = h('x-menu-item', { value, note: opts.note || '', disabled: !!opts.disabled }, label);
  if (opts.icon) {
    const s = document.createElement('span');
    s.setAttribute('slot', 'icon');
    s.textContent = opts.icon;
    it.prepend(s);
  }
  return it;
}

function group(label, children, opts = {}) {
  const g = h('x-menu-group', { label, collapsible: opts.collapsible !== false, collapsed: !!opts.collapsed });
  if (opts.icon) {
    const s = document.createElement('span');
    s.setAttribute('slot', 'icon');
    s.textContent = opts.icon;
    g.prepend(s);
  }
  g.append(...children);
  return g;
}

function menu(...children) {
  const m = h('x-menu', null, ...children);
  return m;
}

export function render(el) {
  el.append(
    h('h1', null, 'Menu 菜单'),
    h('p', { class: 'lead' }, '导航菜单三件套：<code>&lt;x-menu&gt;</code> 负责单选协调，<code>&lt;x-menu-group&gt;</code> 是可折叠的分类/子菜单，<code>&lt;x-menu-item&gt;</code> 是可选中/禁用的菜单项。左侧文档栏即用它构建。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础用法',
      desc: '分组 + 菜单项，点击项由 x-menu 统一单选并派发 x-select',
      build: (c) => {
        const status = h('span', { class: 'demo-card__title', style: 'margin-left:16px' }, '未选择');
        const m = menu(
          group('概览', [item('dash', '仪表盘'), item('report', '报表')]),
          group('管理', [item('user', '用户'), item('role', '角色')]),
        );
        m.style.maxWidth = '220px';
        m.addEventListener('x-select', (e) => (status.textContent = '已选择：' + e.detail.value));
        c.append(m, status);
      },
      code: `<x-menu>
  <x-menu-group label="概览" collapsible>
    <x-menu-item value="dash">仪表盘</x-menu-item>
    <x-menu-item value="report">报表</x-menu-item>
  </x-menu-group>
  <x-menu-group label="管理" collapsible>
    <x-menu-item value="user">用户</x-menu-item>
  </x-menu-group>
</x-menu>`,
    }),

    demoCard({
      title: '备注与禁用',
      desc: 'note 显示右侧备注徽标；disabled 让该项不可点击',
      build: (c) => {
        const m = menu(
          group('版本', [
            item('pro', '专业版', { note: 'beta' }),
            item('ent', '企业版', { note: '推荐' }),
            item('old', '旧版入口', { note: '规划中', disabled: true }),
          ]),
        );
        m.style.maxWidth = '220px';
        c.append(m);
      },
      code: `<x-menu-item value="pro" note="beta">专业版</x-menu-item>
<x-menu-item value="old" note="规划中" disabled>旧版入口</x-menu-item>`,
    }),

    demoCard({
      title: '图标',
      desc: 'slot="icon" 放图标（此处用 emoji，实际可放 SVG）',
      build: (c) => {
        const m = menu(
          group('导航', [
            item('home', '首页', { icon: '🏠' }),
            item('bell', '通知', { icon: '🔔', note: '3' }),
            item('gear', '设置', { icon: '⚙️' }),
          ]),
        );
        m.style.maxWidth = '220px';
        c.append(m);
      },
      code: `<x-menu-item value="home">
  <span slot="icon">🏠</span>首页
</x-menu-item>`,
    }),

    demoCard({
      title: '折叠与子菜单',
      desc: '分组 collapsible 可折叠（带高度动画）；组内再嵌 x-menu-group 即为子菜单',
      build: (c) => {
        const m = menu(
          group('默认展开', [item('a1', '项目 A'), item('a2', '项目 B')]),
          group('默认折叠', [item('b1', '隐藏项')], { collapsed: true }),
          group('含子菜单', [
            item('c1', '普通项'),
            group('子菜单', [item('c2', '孙子项 1'), item('c3', '孙子项 2')], { collapsible: false }),
          ]),
        );
        m.style.maxWidth = '240px';
        c.append(m);
      },
      code: `<x-menu-group label="默认折叠" collapsible collapsed>
  <x-menu-item value="b1">隐藏项</x-menu-item>
</x-menu-group>

<!-- 子菜单：组内嵌套分组 -->
<x-menu-group label="含子菜单" collapsible>
  <x-menu-item value="c1">普通项</x-menu-item>
  <x-menu-group label="子菜单">
    <x-menu-item value="c2">孙子项 1</x-menu-item>
  </x-menu-group>
</x-menu-group>`,
    }),

    demoCard({
      title: '窄栏态（rail）',
      desc: 'rail=true 时隐藏文字：有图标显图标、无图标兜底显标签首字（一般由 x-container 折叠侧栏自动下沉）',
      build: (c) => {
        const m = menu(
          group('导航', [
            item('home', '首页', { icon: '🏠' }),
            item('bell', '通知', { icon: '🔔' }),
            item('set', '设置'),
            item('data', '报表'),
          ]),
        );
        m.setAttribute('rail', '');
        m.style.width = '68px';
        m.style.border = '1px dashed var(--xie-color-border)';
        m.style.borderRadius = '8px';
        c.append(m);
      },
      code: `<x-menu rail>
  <x-menu-group label="导航" collapsible>
    <x-menu-item value="home"><span slot="icon">🏠</span>首页</x-menu-item>
    <x-menu-item value="set">设置</x-menu-item>
  </x-menu-group>
</x-menu>`,
    }),

    h('h2', null, 'API · x-menu'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['value', '当前选中项的 value（反射）', 'string', "''"],
        ['rail', '窄栏态：扇出给后代项/分组，隐藏文字改显图标或首字（反射；通常由 x-container 下沉设置）', 'boolean', 'false'],
      ],
    ),
    apiTable(
      ['方法 / 事件', '说明', 'detail'],
      [
        ['select(value)', '命令式选中某项（会派发 x-select）', '—'],
        ['x-select', '选中项变化时派发（composed，仅用户交互/ select() 触发）', '{ value: string }'],
      ],
    ),

    h('h2', null, 'API · x-menu-group'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['label', '分组标题', 'string', "''"],
        ['collapsible', '是否可折叠（默认 false，需显式开启）', 'boolean', 'false'],
        ['collapsed', '当前是否折叠（反射，驱动动画）', 'boolean', 'false'],
        ['rail', '窄栏态：头部仅显图标（有）或首字（无），隐藏标题与折叠箭头（由 x-menu 扇出）', 'boolean', 'false'],
      ],
    ),
    apiTable(
      ['方法 / 事件 / 插槽 / Part', '说明'],
      [
        ['toggle(force?)', '展开/收起（仅 collapsible 时生效）'],
        ['x-toggle', '折叠切换时派发，detail:{ collapsed:boolean }'],
        ['slot=(默认)', '分组内容（菜单项 / 嵌套分组）'],
        ['slot=icon', '分组标题图标'],
        ['part', 'group / header / label / mini / indicator / content / content-inner'],
      ],
    ),

    h('h2', null, 'API · x-menu-item'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['value', '唯一标识（选中匹配用，反射）', 'string', "''"],
        ['note', '右侧备注文本（也可用 slot=note 覆盖）', 'string', "''"],
        ['disabled', '是否禁用（不可点击、跳过 Tab）', 'boolean', 'false'],
        ['active', '是否选中（由 x-menu 维护，反射）', 'boolean', 'false'],
        ['rail', '窄栏态：隐藏文字与备注，有图标显图标、无图标显标签首字徽标（由 x-menu 扇出）', 'boolean', 'false'],
      ],
    ),
    apiTable(
      ['插槽 / Part', '说明'],
      [
        ['slot=(默认)', '菜单项文本'],
        ['slot=icon', '菜单项图标（缺省不占位）'],
        ['slot=note', '自定义备注徽标（替代 note 属性）'],
        ['part', 'base / label / note / mini'],
      ],
    ),

    h('h2', null, '说明'),
    h('p', null, '键盘导航当前支持 Tab 聚焦 + Enter/Space 触发（内部用原生 button/role=menuitem）；方向键 roving focus 为后续增强项。所有配色/圆角/折叠动画均消费全局主题令牌，随明暗与主色实时联动。'),
    h('p', null, '窄栏态 <code>rail</code>：通常不手写，而由父级 <code>x-container</code> 在侧栏折叠时下沉给 <code>x-menu</code>，再由菜单扇出到每个分组/项（有图标显图标、无图标取标签首字兼底）。'),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
