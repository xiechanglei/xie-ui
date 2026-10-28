/** Tooltip 文字提示文档：包裹触发内容，悬停/聚焦弹深色小气泡；四向、延时、强制常开、纯文本 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

function button(label, attrs = {}) {
  const b = document.createElement('x-button');
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, String(v));
  b.textContent = label;
  return b;
}

/** 建一个 tooltip，把 trigger 塞进去 */
function tip(content, attrs, trigger) {
  const t = document.createElement('x-tooltip');
  t.setAttribute('content', content);
  for (const [k, v] of Object.entries(attrs || {})) t.setAttribute(k, String(v));
  t.append(trigger);
  return t;
}

export function render(el) {
  /* —— 1. 基础 —— */
  const basic = tip('复制到剪贴板', {}, button('悬停我', { variant: 'outline' }));

  /* —— 2. 四向 —— */
  const places = h(
    'div',
    { style: 'display:flex;align-items:center;gap:18px;flex-wrap:wrap' },
    tip('顶部提示（默认）', { placement: 'top' }, button('top', { variant: 'soft' })),
    tip('底部提示', { placement: 'bottom' }, button('bottom', { variant: 'soft' })),
    tip('左侧提示', { placement: 'left' }, button('left', { variant: 'soft' })),
    tip('右侧提示', { placement: 'right' }, button('right', { variant: 'soft' })),
  );

  /* —— 3. 延时 / 立即 —— */
  const delayWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:18px;flex-wrap:wrap' },
    tip('我 0ms 立即弹', { delay: '0' }, button('delay=0', { variant: 'outline' })),
    tip('我 600ms 后才弹，防误悬停', { delay: '600' }, button('delay=600', { variant: 'outline' })),
  );

  /* —— 4. 强制常开（open）—— */
  const openWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding:24px 0' },
    tip('我用 open 常开，无需悬停', { open: true }, button('open 常开', { variant: 'soft', color: 'primary' })),
  );

  /* —— 5. 图标触发 + 长文本换行 —— */
  const icon = document.createElement('x-icon');
  icon.setAttribute('name', 'settings');
  icon.setAttribute('size', '20px');
  const iconTip = tip('设置项', {}, icon);
  const longTip = tip(
    '这是一段较长的提示文本，超过 240px 宽度会自动换行，不会撑破布局',
    {},
    button('长文本', { variant: 'outline', color: 'secondary' }),
  );
  const mixedWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:18px;flex-wrap:wrap' },
    iconTip, longTip,
  );

  el.append(
    h('h1', null, 'Tooltip 文字提示'),
    h(
      'p',
      { class: 'lead' },
      '包裹一段触发内容（按钮/图标/任意元素），鼠标悬停或键盘聚焦时在其旁弹出一枚深色小气泡补充说明。内容只支持纯文本；气泡 pointer-events:none，不拦操作也不抢焦点。',
    ),

    h('h2', null, '引入'),
    h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, `import '@xie-work/xie-ui';`)))),

    h('h2', null, '代码演示'),
    demoCard({
      title: '基础用法',
      desc: '把触发元素放进 <x-tooltip>，content 写提示文本',
      build: (c) => c.append(basic),
      code: `<x-tooltip content="复制到剪贴板">\n  <x-button variant="outline">悬停我</x-button>\n</x-tooltip>`,
    }),
    demoCard({
      title: '四向弹出',
      desc: 'placement 选气泡相对内容的方位（top 默认 / bottom / left / right）',
      build: (c) => c.append(places),
      code: `<x-tooltip content="顶部提示" placement="top">…</x-tooltip>\n<x-tooltip content="右侧提示" placement="right">…</x-tooltip>`,
    }),
    demoCard({
      title: '显示延时',
      desc: 'delay 毫秒防误悬停闪弹（默认 150）；0 = 立即；隐藏始终无延时',
      build: (c) => c.append(delayWrap),
      code: `<x-tooltip content="立即" delay="0">…</x-tooltip>\n<x-tooltip content="慢弹" delay="600">…</x-tooltip>`,
    }),
    demoCard({
      title: '强制常开',
      desc: 'open 让气泡常驻（文档/调试用），与悬停态叠加、不干扰自动隐',
      build: (c) => c.append(openWrap),
      code: `<x-tooltip content="常开" open>\n  <x-button>open 常开</x-button>\n</x-tooltip>`,
    }),
    demoCard({
      title: '图标触发与长文本',
      desc: '触发内容可以是图标等任意元素；长文本超 240px 自动换行',
      build: (c) => c.append(mixedWrap),
      code: `<x-tooltip content="设置项"><x-icon name="settings"></x-icon></x-tooltip>\n<x-tooltip content="很长的提示……自动换行">…</x-tooltip>`,
    }),

    h('h2', null, '与其它浮层的边界'),
    rich(
      'Tooltip 是<b>最轻</b>的补充说明：只在悬停/聚焦时出现、纯文本、不可交互（<code>pointer-events:none</code>）。气泡是宿主 shadow 内 <code>position:absolute</code> 定位，会被祖先 <code>overflow:hidden</code> 裁剪——与 <code>x-select</code> 弹层同一取舍，库里刻意不做 fixed 传送门换这份简单。需要点击展开、承载富内容时用 <code>x-dialog</code> / <code>x-drawer</code>；主动抛出的瞬时反馈用 <code>x-toast</code>。触发元素若已有原生 <code>title</code>，请去掉以免和浏览器自带提示重复。',
    ),

    h('h2', null, 'API'),
    h('h3', null, 'x-tooltip · 属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['content', '提示文本（纯文本）；空或全空白时任何交互都不弹', 'string', "''"],
        ['placement', '弹出方位（反射）', "'top' | 'bottom' | 'left' | 'right'", "'top'"],
        ['delay', '显示延时（毫秒），0 = 立即；隐藏无延时', 'number', '150'],
        ['open', '强制常开（反射），与悬停态叠加', 'boolean', 'false'],
      ],
    ),
    h('h3', null, 'Slots'),
    apiTable(
      ['插槽', '说明'],
      [['default', '触发内容（按钮/图标/任意元素）；悬停或聚焦它即弹出气泡']],
    ),
    h('h3', null, '样式部件 Parts'),
    apiTable(
      ['part', '所属', '说明'],
      [['tip', 'x-tooltip', '气泡本体']],
    ),
  );
}
