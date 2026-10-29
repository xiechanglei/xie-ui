/** x-tabs 标签页文档：三件套（x-tabs / x-tab / x-tab-panel）用法 + API */
import { h, demoCard, apiTable } from '/demo/render.js';

/* ---- 轻量构建助手 ---- */
function tab(value, label, opts = {}) {
  return h('x-tab', { value, disabled: !!opts.disabled }, label);
}
function panel(value, ...children) {
  return h('x-tab-panel', { value }, ...children);
}
function tabsBody(text) {
  return h('div', { style: 'padding:16px;border:1px solid var(--xie-color-border);border-top:0;border-radius:0 0 8px 8px' }, text);
}

export function render(el) {
  el.append(
    h('h1', null, 'Tabs 标签页'),
    h('p', { class: 'lead' }, '标签页三件套：<code>&lt;x-tabs&gt;</code> 负责单选协调与键盘漫游，<code>&lt;x-tab&gt;</code> 是选项卡（自动挂进卡条），<code>&lt;x-tab-panel&gt;</code> 是与同名 tab 配对的面板。切换即派发 <code>x-select</code>。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础用法',
      desc: 'tab 与 panel 按 value 配对；点某张即显示对应面板',
      build: (c) => {
        const t = h(
          'x-tabs',
          null,
          tab('a', '账号'),
          tab('b', '订单'),
          tab('c', '设置'),
          panel('a', tabsBody('账号设置内容')),
          panel('b', tabsBody('订单列表内容')),
          panel('c', tabsBody('系统设置内容')),
        );
        t.style.width = '100%';
        c.append(t);
      },
      code: `<x-tabs>
  <x-tab value="a">账号</x-tab>
  <x-tab value="b">订单</x-tab>
  <x-tab value="c">设置</x-tab>
  <x-tab-panel value="a">账号设置内容</x-tab-panel>
  <x-tab-panel value="b">订单列表内容</x-tab-panel>
  <x-tab-panel value="c">系统设置内容</x-tab-panel>
</x-tabs>`,
    }),

    demoCard({
      title: '监听切换事件',
      desc: 'x-select 携带当前 value；也可用 value 属性程序化切换（不派发，避免回环）',
      build: (c) => {
        const status = h('div', { style: 'margin-top:8px;color:var(--xie-color-muted)' }, '当前：账号');
        const t = h(
          'x-tabs',
          { value: 'a' },
          tab('a', '标签一'),
          tab('b', '标签二'),
          tab('c', '标签三'),
          panel('a', tabsBody('第一个面板')),
          panel('b', tabsBody('第二个面板')),
          panel('c', tabsBody('第三个面板')),
        );
        t.style.width = '100%';
        t.addEventListener('x-select', (e) => (status.textContent = '当前：' + e.detail.value));
        c.append(t, status);
      },
      code: `const tabs = document.querySelector('x-tabs');
tabs.addEventListener('x-select', (e) => console.log(e.detail.value));
tabs.value = 'b'; // 程序化切换：同步高亮/显隐，但不派发 x-select`,
    }),

    demoCard({
      title: '禁用与等分',
      desc: 'tab disabled 不可点且键盘跳过；x-tabs fill 让各 tab 平分宽度',
      build: (c) => {
        const t = h(
          'x-tabs',
          { fill: true },
          tab('a', '可用'),
          tab('b', '禁用', { disabled: true }),
          tab('c', '也可用'),
          panel('a', tabsBody('A')),
          panel('c', tabsBody('C')),
        );
        t.style.width = '100%';
        c.append(t);
      },
      code: `<x-tabs fill>
  <x-tab value="a">可用</x-tab>
  <x-tab value="b" disabled>禁用</x-tab>
  <x-tab value="c">也可用</x-tab>
  ...
</x-tabs>`,
    }),

    h('h2', null, 'API · x-tabs'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['value', '当前选中标签的 value（反射）；缺省自动选第一张未禁用的 tab', 'string', "''"],
        ['fill', '等分铺满：所有 tab 平分卡条宽度（反射）', 'boolean', 'false'],
      ],
    ),
    apiTable(
      ['方法 / 事件 / Part', '说明'],
      [
        ['select(value)', '命令式切换（会派发 x-select）'],
        ['x-select', '切换选中时派发（bubbles+composed），detail:{ value }'],
        ['part', 'tablist / panels'],
      ],
    ),

    h('h2', null, 'API · x-tab'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['value', '关联键（反射）：与同名 x-tab-panel 配对', 'string', "''"],
        ['disabled', '禁用（反射）：不可点、不参与键盘漫游', 'boolean', 'false'],
        ['active', '选中态（反射）：由 x-tabs 回写，驱动高亮下划线 + aria-selected', 'boolean', 'false'],
      ],
    ),

    h('h2', null, 'API · x-tab-panel'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [['value', '关联键（反射）：对应 x-tab 的 value；显隐由 x-tabs 按当前值挂/摘 hidden', 'string', "''"]],
    ),

    h('h2', null, '说明'),
    h('p', null, '无障碍：tablist / tab / tabpanel 三角色齐备，roving tabindex（仅选中项 Tab 可达），方向键 ←→（纵排 ↑↓）/ Home / End 在未禁用 tab 间漫游并即时选中。面板切走仅 <code>display:none</code>、内容状态不丢；需「切走即销毁」请自行监听 <code>x-select</code> 处理。'),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
