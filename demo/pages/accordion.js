/** x-accordion 折叠面板文档：两件（x-accordion / x-accordion-item）用法 + API */
import { h, demoCard, apiTable } from '/demo/render.js';

/* ---- 轻量构建助手 ---- */
function accItem(value, label, body, opts = {}) {
  const it = h('x-accordion-item', {
    value,
    label,
    expanded: !!opts.expanded,
    disabled: !!opts.disabled,
  });
  it.append(h('div', { style: 'line-height:1.7' }, body));
  return it;
}

export function render(el) {
  el.append(
    h('h1', null, 'Accordion 折叠面板'),
    h('p', { class: 'lead' }, '折叠面板两件套：<code>&lt;x-accordion&gt;</code> 协调「单开互斥」，<code>&lt;x-accordion-item&gt;</code> 是一块「标题栏 + 可折叠内容」，展开收起带高度自适应动画。常用于 FAQ、设置分组。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础用法',
      desc: '单开互斥：展开一项自动收起其余；点标题栏切换',
      build: (c) => {
        const a = h(
          'x-accordion',
          null,
          accItem('q1', '什么是 xie-ui？', '一套零依赖的原生 Web Components UI 组件库，标签即用、主题走 CSS 自定义属性。', { expanded: true }),
          accItem('q2', '需要框架吗？', '不需要。任何能渲染 HTML 的环境都能用，React/Vue 里当作普通标签写即可。'),
          accItem('q3', '如何换主题？', '改根上的 --xie-color-* 令牌即可全局联动明暗与主色。'),
        );
        a.style.width = '100%';
        c.append(a);
      },
      code: `<x-accordion>
  <x-accordion-item value="q1" label="什么是 xie-ui？" expanded>
    一套零依赖的原生 Web Components UI 组件库。
  </x-accordion-item>
  <x-accordion-item value="q2" label="需要框架吗？">不需要。</x-accordion-item>
  <x-accordion-item value="q3" label="如何换主题？">改令牌即可。</x-accordion-item>
</x-accordion>`,
    }),

    demoCard({
      title: '多项同开（multiple）',
      desc: 'x-accordion 加 multiple 后取消互斥，可同时展开多项；监听 x-change 拿展开列表',
      build: (c) => {
        const status = h('div', { style: 'margin-top:8px;color:var(--xie-color-muted)' }, '展开：q1');
        const a = h(
          'x-accordion',
          { multiple: true },
          accItem('q1', '第一节', '可以同时展开多节内容。', { expanded: true }),
          accItem('q2', '第二节', '彼此独立、互不影响。'),
          accItem('q3', '第三节', '再点标题即可折叠。'),
        );
        a.style.width = '100%';
        a.addEventListener('x-change', (e) => (status.textContent = '展开：' + e.detail.values.join(', ')));
        c.append(a, status);
      },
      code: `<x-accordion multiple>
  <x-accordion-item value="q1" label="第一节">…</x-accordion-item>
  <x-accordion-item value="q2" label="第二节">…</x-accordion-item>
</x-accordion>

acc.addEventListener('x-change', (e) => {
  console.log(e.detail.value, e.detail.expanded, e.detail.values);
});`,
    }),

    demoCard({
      title: '禁用态',
      desc: 'item disabled 让该项不可展开；图标不设专用插槽——需要前置图标就在 slot="header" 内容里自己摆（见下「复杂标题」例）',
      build: (c) => {
        const a = h(
          'x-accordion',
          null,
          accItem('p1', '个人资料', '账号头像、昵称等。'),
          accItem('p2', '安全设置', '密码、两步验证。'),
          accItem('p3', '实验特性（暂不可用）', '敬请期待。', { disabled: true }),
        );
        a.style.width = '100%';
        c.append(a);
      },
      code: `<x-accordion-item value="p1" label="个人资料">账号头像、昵称等。</x-accordion-item>
<x-accordion-item value="p3" label="实验特性" disabled>敬请期待。</x-accordion-item>`,
    }),

    demoCard({
      title: '复杂标题（slot="header"）',
      desc: '标题是复杂呈现元素时（多行/左右两栏/图标徽标），直接放任意元素到 slot="header"：light DOM 样式自控，组件只保证占满弹性区；传入后 label 被覆盖',
      build: (c) => {
        const mkRich = (v, icon, num, time, state, stateColor, body, expanded) => {
          const it = h('x-accordion-item', { value: v, expanded: !!expanded });
          it.append(
            h('div', { slot: 'header', style: 'display:flex;align-items:center;gap:12px;width:100%' },
              h('span', { style: 'flex:0 0 auto;font-size:18px' }, icon),
              h('div', { style: 'flex:1 1 auto;min-width:0' },
                h('div', { style: 'font-weight:500' }, '订单 ' + num),
                h('div', { style: 'font-size:12px;color:var(--xie-color-muted)' }, time + ' · 3 件商品')),
              h('span', { style: 'flex:0 0 auto;color:' + stateColor }, state),
            ),
            h('div', { style: 'line-height:1.7' }, body),
          );
          return it;
        };
        const a = h(
          'x-accordion',
          null,
          mkRich('o1', '📦', '#1024', '2026-10-28 12:30', '已发货', 'var(--xie-color-success)', '顺丰 SF1234567890，预计明天送达。', true),
          mkRich('o2', '💰', '#1023', '2026-10-27 09:12', '待付款', 'var(--xie-color-warning)', '等待买家付款，24 小时后自动关闭。'),
          mkRich('o3', '✅', '#1019', '2026-10-20 18:45', '已完成', 'var(--xie-color-muted)', '交易完成，可进行评价。'),
        );
        a.style.width = '100%';
        c.append(a);
      },
      code: `<x-accordion-item value="o1">  <!-- 不写 label，标题整体自定义；图标也在 header 里摆 -->
  <div slot="header" style="display:flex;align-items:center;gap:12px;width:100%">
    <span style="font-size:18px">📦</span>
    <div style="flex:1 1 auto;min-width:0">
      <div style="font-weight:500">订单 #1024</div>
      <div style="font-size:12px;color:var(--xie-color-muted)">2026-10-28 12:30 · 3 件商品</div>
    </div>
    <span style="color:var(--xie-color-success)">已发货</span>
  </div>
  顺丰 SF1234567890，预计明天送达。
</x-accordion-item>`,
    }),

    h('h2', null, 'API · x-accordion'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [['multiple', '允许多项同时展开（反射）：缺省 false = 手风琴单开互斥', 'boolean', 'false']],
    ),
    apiTable(
      ['方法 / 事件 / Part', '说明'],
      [
        ['getValues()', '返回当前所有展开项的 value 数组'],
        ['x-change', '用户切换某项后派发（bubbles+composed），detail:{ value, expanded, values }'],
        ['part', 'accordion'],
      ],
    ),

    h('h2', null, 'API · x-accordion-item'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['value', '关联键（反射）：供协调与 x-change 回报', 'string', "''"],
        ['label', '标题文本（不反射）：快捷路径，单行省略；被 slot="header" 内容覆盖', 'string', "''"],
        ['expanded', '展开态（反射）：驱动 grid 0fr↔1fr 高度动画', 'boolean', 'false'],
        ['disabled', '禁用（反射）：标题栏不可点', 'boolean', 'false'],
      ],
    ),
    apiTable(
      ['方法 / 插槽 / Part', '说明'],
      [
        ['toggle(force?, fromUser?)', '展开/收起；fromUser=false 时不派发内部事件（供根静默收拢旁项）'],
        ['slot=(默认)', '可折叠内容'],
        ['slot=header', '自定义标题区任意内容（多行/两栏/图标徽标等）：样式由使用方自控，优先于 label；前置图标也在其中自己摆'],
        ['part', 'item / header / main / indicator / content / content-inner'],
      ],
    ),

    h('h2', null, '说明'),
    h('p', null, '标题区两段式：简单场景写 <code>label</code> 属性即可；复杂呈现放 <code>slot="header"</code>，组件不再对其施加单行省略等约束。折叠动画复用 <code>x-menu-group</code> 同款 grid <code>0fr↔1fr</code> 技巧，内容高度自适应、无需 JS 量测；常驻内边距位于裁切区更内一层，展开/收起全程无高度突变。<code>x-accordion-item</code> 也可脱离根容器单独使用（自管 <code>expanded</code>）；放进 <code>x-accordion</code> 时才享受单开互斥与统一的 <code>x-change</code>。程序化改 <code>item.expanded</code>（非点击）不触发互斥与事件，避免回环。'),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
