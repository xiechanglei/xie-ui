/** x-breadcrumb 面包屑文档：两件套（x-breadcrumb / x-breadcrumb-item）用法 + API */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

/* ---- 轻量构建助手 ---- */
function crumb(href, label, opts = {}) {
  return h('x-breadcrumb-item', { href: href || null }, opts.icon ? h('x-icon', { name: opts.icon, size: '1em' }) : null, label);
}
function bc(attrs, ...items) {
  const b = h('x-breadcrumb', attrs || null, ...items);
  return b;
}
const PATH = ['工作台', '订单管理', '订单详情', '退款审批', '审批记录'];

export function render(el) {
  el.append(
    h('h1', null, 'Breadcrumb 面包屑'),
    h('p', { class: 'lead' }, '路径导航两件套：<code>&lt;x-breadcrumb&gt;</code> 负责分隔符/当前页/超长收纳的协调与 <code>nav</code> 地标，<code>&lt;x-breadcrumb-item&gt;</code> 是其中一格路径（写了 <code>href</code> 即真链接）。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础用法',
      desc: '末项自动识别为当前页（不可点 + aria-current），前项写了 href 即真链接',
      build: (c) => {
        c.append(bc(null, crumb('/demo', '首页'), crumb('/demo/orders', '订单管理'), crumb(null, '订单详情')));
      },
      code: `<x-breadcrumb>
  <x-breadcrumb-item href="/">首页</x-breadcrumb-item>
  <x-breadcrumb-item href="/orders">订单管理</x-breadcrumb-item>
  <x-breadcrumb-item>订单详情</x-breadcrumb-item>
</x-breadcrumb>`,
    }),

    demoCard({
      title: '分隔符形态',
      desc: 'separator=slash（默认）/ chevron / none，由根扇出给各项',
      build: (c) => {
        const row = (sep) => bc({ separator: sep }, crumb('/a', '首页'), crumb('/b', '会员'), crumb(null, '等级规则'));
        c.append(row('slash'), h('div', { style: 'height:8px' }), row('chevron'), h('div', { style: 'height:8px' }), row('none'));
      },
      code: `<x-breadcrumb separator="chevron">
  <x-breadcrumb-item href="/">首页</x-breadcrumb-item>
  <x-breadcrumb-item href="/member">会员</x-breadcrumb-item>
  <x-breadcrumb-item>等级规则</x-breadcrumb-item>
</x-breadcrumb>

<!-- slash 斜杠（默认）· chevron 尖角图标 · none 不画（靠间距分隔） -->`,
    }),

    demoCard({
      title: '尺寸',
      desc: 'size=sm / md（默认）/ lg，只下发字号与间距',
      build: (c) => {
        for (const size of ['sm', 'md', 'lg']) {
          const b = bc({ size }, crumb('/a', '首页'), crumb('/b', '设置'), crumb(null, '安全'));
          c.append(b, h('div', { style: 'height:6px' }));
        }
      },
      code: `<x-breadcrumb size="sm">…</x-breadcrumb>
<x-breadcrumb size="md">…</x-breadcrumb>
<x-breadcrumb size="lg">…</x-breadcrumb>`,
    }),

    demoCard({
      title: '超长路径收纳',
      desc: 'max-items 限定最多显示几格真实路径，中间折成「…」；点它展开全部',
      build: (c) => {
        const b = bc({ maxItems: 3, label: '订单路径' }, ...PATH.map((t, i) => crumb(i < PATH.length - 1 ? '/' + t : null, t)));
        const log = h('div', { style: 'margin-top:8px;color:var(--xie-color-muted)' }, '点「…」可展开');
        b.addEventListener('x-toggle', (e) => (log.textContent = '已展开（x-toggle · collapsed=' + e.detail.collapsed + '）'));
        c.append(b, log);
      },
      code: `<x-breadcrumb max-items="3">
  <x-breadcrumb-item href="/">工作台</x-breadcrumb-item>
  <x-breadcrumb-item>订单管理</x-breadcrumb-item>
  <x-breadcrumb-item>订单详情</x-breadcrumb-item>
  <x-breadcrumb-item>退款审批</x-breadcrumb-item>
  <x-breadcrumb-item>审批记录</x-breadcrumb-item>
</x-breadcrumb>

<script>
  // 显示 首项 + … + 末 (max-items-1) 项；「…」不占格，点它展开全部并派发 x-toggle
  bc.addEventListener('x-toggle', (e) => console.log(e.detail.collapsed));
</script>`,
    }),

    demoCard({
      title: '受控展开 / 拦截跳转',
      desc: 'collapsed="false" 直接全展开；preventDefault 掉 x-select 即可换成前端路由',
      build: (c) => {
        const b = bc({ maxItems: 2 }, ...PATH.map((t, i) => crumb('/' + t, t)));
        b.collapsed = false; // 全展开（HTML 里等价写法 collapsed="false"）
        const log = h('div', { style: 'margin-top:8px;color:var(--xie-color-muted)' }, '点任意前项试试（已拦截跳转）');
        b.addEventListener('x-select', (e) => {
          e.preventDefault(); // 拦下原生跳转，改由「路由」处理
          log.textContent = '拦截到 ' + e.detail.text + ' → ' + e.detail.href;
        });
        c.append(b, log);
      },
      code: `<x-breadcrumb collapsed="false">…</x-breadcrumb>
<!-- 布尔属性除「写了即 true」也认字面量假值；JS 侧则写 bc.collapsed = false -->

<script>
  bc.addEventListener('x-select', (e) => {
    e.preventDefault();                 // 阻止 <a> 原生跳转
    router.push(e.detail.href);         // detail:{ href, text }
  });
</script>`,
    }),

    demoCard({
      title: '格内放图标',
      desc: '默认插槽收富内容，图标 + 文字随意组合',
      build: (c) => {
        c.append(
          bc({ separator: 'chevron' }, crumb('/home', '首页', { icon: 'user' }), crumb('/set', '设置', { icon: 'settings' }), crumb(null, '主题')),
        );
      },
      code: `<x-breadcrumb separator="chevron">
  <x-breadcrumb-item href="/home"><x-icon name="user" size="1em"></x-icon>首页</x-breadcrumb-item>
  <x-breadcrumb-item href="/set"><x-icon name="settings" size="1em"></x-icon>设置</x-breadcrumb-item>
  <x-breadcrumb-item>主题</x-breadcrumb-item>
</x-breadcrumb>`,
    }),

    h('h2', null, 'API · x-breadcrumb'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['separator', '分隔符形态（反射，扇出给各项）：slash / chevron / none', 'string', "'slash'"],
        ['size', '尺寸（反射）：sm / md / lg，下发字号与间距', 'string', "'md'"],
        ['max-items', '最多显示几格<b>真实路径</b>（反射，0/不写 = 不限）；「…」不占格，至少能合并两项才折', 'number', '0'],
        ['collapsed', '折叠态（反射）：仅与 max-items 配合有意义；同时承认字面量假值 <code>collapsed="false"</code>', 'boolean', 'true'],
        ['label', '<code>nav</code> 的无障碍名', 'string', "'面包屑'"],
      ],
    ),
    apiTable(
      ['方法 / 事件 / Part', '说明'],
      [
        ['expand()', '命令式展开全部（不派发 x-toggle，避免与外部状态回环）'],
        ['x-toggle', '点「…」展开时派发（bubbles+composed），detail:{ collapsed: false }'],
        ['part', 'nav / list'],
      ],
    ),

    h('h2', null, 'API · x-breadcrumb-item'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['href', '链接目标（不反射）：写了即真链接；当前页/折叠态下自动失效', 'string', "''"],
        ['separator', '分隔符形态（反射）：通常由根下沉，脱离根单独用时可自写', 'string', "'slash'"],
        ['current', '当前页（反射）：由根按「末项」回写；不可点 + aria-current="page"', 'boolean', 'false'],
        ['ellipsis', '折叠占位（反射）：由根回写，本项代表被折叠的前段渲染成「…」', 'boolean', 'false'],
      ],
    ),
    apiTable(
      ['方法 / 事件 / Part', '说明'],
      [
        ['linkable', '只读：此刻是否为真链接（非当前页、非折叠占位且写了 href）'],
        ['x-select', '链接项点击时派发（bubbles+composed+cancelable），detail:{ href, text }；preventDefault 即阻止跳转'],
        ['part', 'base / separator / crumb / more'],
      ],
    ),

    h('h2', null, '说明'),
    rich(
      '无障碍：根渲染为 <code>&lt;nav aria-label&gt;</code> 地标，内部列表挂 <code>role=list</code>，各路由 <code>x-breadcrumb-item</code> 自补 <code>role=listitem</code>（屏幕阅读器会报「第 2 项，共 5 项」）；当前页带 <code>aria-current=page</code>，分隔符 <code>aria-hidden</code> 不朗读。',
    ),
    rich(
      '需要 <code>target</code>/<code>rel</code> 等原生链接属性时：不写 <code>href</code>，把 <code>&lt;a&gt;</code> 自己放进默认插槽。项与项之间靠换行收纳长路径，格内文字固定单行不折字。',
    ),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
