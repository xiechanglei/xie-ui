/** x-tabs 标签页文档：三件套（x-tabs / x-tab / x-tab-panel）用法 + API */
import { h, demoCard, apiTable } from '/demo/render.js';

/* ---- 轻量构建助手 ---- */
function tab(value, label, opts = {}) {
  return h('x-tab', { value, disabled: !!opts.disabled }, label);
}
/** 富内容 tab：除文字外可放图标/标签等任意节点（x-tabs 已提供 gap 自动给距） */
function tabRich(value, ...children) {
  return h('x-tab', { value }, ...children);
}
function icon(name) {
  return h('x-icon', { name });
}
function tag(text, color) {
  return h('x-tag', { size: 'sm', color, round: true }, text);
}
function panel(value, ...children) {
  return h('x-tab-panel', { value }, ...children);
}
function tabsBody(text) {
  return h('div', { style: 'padding:16px;border:1px solid var(--xie-color-border);border-top:0;border-radius:0 0 8px 8px' }, text);
}
function panelBox(text) {
  return h('div', { style: 'padding:16px;border:1px solid var(--xie-color-border);border-radius:8px' }, text);
}

export function render(el) {
  el.append(
    h('h1', null, 'Tabs 标签页'),
    h('p', { class: 'lead' }, '标签页三件套：<code>&lt;x-tabs&gt;</code> 负责单选协调与键盘漫游，<code>&lt;x-tab&gt;</code> 是选项卡（自动挂进卡条），<code>&lt;x-tab-panel&gt;</code> 是与同名 tab 配对的面板。支持 <code>variant</code>（下划线/药丸/分段）、<code>size</code>、<code>orientation</code>（横排/纵排），tab 内可混排图标与标签。切换即派发 <code>x-select</code>。'),

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

    demoCard({
      title: '形态 · 药丸 pills',
      desc: 'variant="pills"：选中项为主色实心反色白字，hover 主色淡底；圆角跟随全局主题圆角旋钮（radius=none 时退化为直角块）',
      build: (c) => {
        const t = h(
          'x-tabs',
          { variant: 'pills' },
          tab('a', '首页'),
          tab('b', '订单'),
          tab('c', '设置'),
          panel('a', panelBox('首页内容')),
          panel('b', panelBox('订单内容')),
          panel('c', panelBox('设置内容')),
        );
        t.style.width = '100%';
        c.append(t);
      },
      code: `<x-tabs variant="pills">
  <x-tab value="a">首页</x-tab>
  <x-tab value="b">订单</x-tab>
  <x-tab value="c">设置</x-tab>
  <x-tab-panel value="a">首页内容</x-tab-panel>
  ...
</x-tabs>`,
    }),

    demoCard({
      title: '形态 · 分段器 segmented',
      desc: 'variant="segmented"：整组装进淡色轨道，选中项为浮起的白底小块（类 iOS 分段控件）',
      build: (c) => {
        const t = h(
          'x-tabs',
          { variant: 'segmented', fill: true },
          tab('a', '日'),
          tab('b', '周'),
          tab('c', '月'),
          panel('a', panelBox('按日统计')),
          panel('b', panelBox('按周统计')),
          panel('c', panelBox('按月统计')),
        );
        t.style.width = '320px';
        c.append(t);
      },
      code: `<x-tabs variant="segmented" fill>
  <x-tab value="a">日</x-tab>
  <x-tab value="b">周</x-tab>
  <x-tab value="c">月</x-tab>
  ...
</x-tabs>`,
    }),

    demoCard({
      title: '尺寸 size',
      desc: 'size="sm | md | lg" 统一控制各 tab 的内边距与字号（md 为缺省）',
      build: (c) => {
        for (const size of ['sm', 'md', 'lg']) {
          const t = h(
            'x-tabs',
            { variant: 'pills', size },
            tab('a', '标签'),
            tab('b', '选项'),
            panel('a', h('div', { style: 'padding:8px 0;color:var(--xie-color-muted)' }, `${size} 尺寸内容`)),
          );
          t.style.marginBottom = '8px';
          c.append(t);
        }
      },
      code: `<x-tabs variant="pills" size="sm">…</x-tabs>
<x-tabs variant="pills" size="md">…</x-tabs>
<x-tabs variant="pills" size="lg">…</x-tabs>`,
    }),

    demoCard({
      title: '纵向排列 vertical',
      desc: 'orientation="vertical"：卡条成列居左、面板在右，tab 内容水平居中；键盘改用 ↑↓ 漫游',
      build: (c) => {
        const t = h(
          'x-tabs',
          { orientation: 'vertical', variant: 'pills' },
          tabRich('a', icon('user'), '资料'),
          tabRich('b', icon('settings'), ' 设置'),
          tabRich('c', icon('info'), ' 关于'),
          panel('a', panelBox('个人资料')),
          panel('b', panelBox('账号设置')),
          panel('c', panelBox('关于本站')),
        );
        t.style.width = '100%';
        c.append(t);
      },
      code: `<x-tabs orientation="vertical" variant="pills">
  <x-tab value="a"><x-icon name="user"></x-icon> 资料</x-tab>
  <x-tab value="b"><x-icon name="settings"></x-icon> 设置</x-tab>
  <x-tab value="c"><x-icon name="info"></x-icon> 关于</x-tab>
  ...
</x-tabs>`,
    }),

    demoCard({
      title: '标签内混排图标 / 标签',
      desc: '每张 x-tab 的默认插槽可放任意内容：图标随选中态变色，x-tag / x-badge 保留自身配色，间距由组件自动给足',
      build: (c) => {
        const t = h(
          'x-tabs',
          null,
          tabRich('a', icon('check-circle'), '已完成'),
          tabRich('b', '收件箱', tag('3', 'primary')),
          tabRich('c', icon('settings'), '设置', tag('Beta', 'warning')),
          panel('a', tabsBody('已完成任务')),
          panel('b', tabsBody('收件箱消息')),
          panel('c', tabsBody('系统设置')),
        );
        t.style.width = '100%';
        c.append(t);
      },
      code: `<x-tabs>
  <x-tab value="a"><x-icon name="check-circle"></x-icon> 已完成</x-tab>
  <x-tab value="b">收件箱 <x-tag size="sm" color="primary" round>3</x-tag></x-tab>
  <x-tab value="c"><x-icon name="settings"></x-icon> 设置 <x-tag size="sm" color="warning" round>Beta</x-tag></x-tab>
  ...
</x-tabs>`,
    }),

    h('h2', null, 'API · x-tabs'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['value', '当前选中标签的 value（反射）；缺省自动选第一张未禁用的 tab', 'string', "''"],
        ['fill', '等分铺满：所有 tab 平分卡条宽度（反射）', 'boolean', 'false'],
        ['variant', '形态（反射）：underline 下划线 / pills 药丸 / segmented 分段器', 'string', "'underline'"],
        ['size', '尺寸（反射）：sm / md / lg，统一控制各 tab 内边距与字号', 'string', "'md'"],
        ['orientation', '排列方向（反射）：horizontal / vertical；纵排时卡条成列、面板在右', 'string', "'horizontal'"],
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
    h('p', null, '无障碍：tablist / tab / tabpanel 三角色齐备，roving tabindex（仅选中项 Tab 可达），方向键按 <code>orientation</code> 限定（横排 ←→、纵排 ↑↓）/ Home / End 在未禁用 tab 间漫游并即时选中。面板切走仅 <code>display:none</code>、内容状态不丢；需「切走即销毁」请自行监听 <code>x-select</code> 处理。'),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
