/** x-text 排版原子组件文档：variant 角色一览 + inline + API */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

/** 生成一个 <x-text variant=…> */
function t(variant, text, inline = false) {
  const el = document.createElement('x-text');
  if (variant) el.setAttribute('variant', variant);
  if (inline) el.setAttribute('inline', '');
  el.textContent = text;
  return el;
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}

export function render(el) {
  el.append(
    h('h1', null, 'Typography 排版'),
    h('p', { class: 'lead' }, '把「字号 / 字重 / 行高 / 颜色」收敛为一组语义角色（variant），内部全部消费设计令牌，随主题实时联动。用于替代各处散落的标题 / 副标题 / 说明文字样式。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '角色一览',
      desc: 'variant 取 title / subtitle / body / caption / muted',
      build: (c) => {
        c.style.flexDirection = 'column';
        c.style.alignItems = 'flex-start';
        c.style.gap = '6px';
        c.append(
          t('title', 'Title 区块主标题'),
          t('subtitle', 'Subtitle 次级标题'),
          t('body', 'Body 正文（默认）'),
          t('caption', 'Caption 次要说明'),
          t('muted', 'Muted 弱化正文'),
        );
      },
      code: `<x-text variant="title">Title 区块主标题</x-text>
<x-text variant="subtitle">Subtitle 次级标题</x-text>
<x-text>Body 正文（默认）</x-text>
<x-text variant="caption">Caption 次要说明</x-text>
<x-text variant="muted">Muted 弱化正文</x-text>`,
    }),

    demoCard({
      title: '行内嵌入',
      desc: 'inline 让宿主转为行内盒，可嵌入句子中',
      build: (c) => {
        c.style.display = 'block';
        c.append(
          h('p', { style: 'margin:0;font-size:var(--xie-font-size-md);color:var(--xie-color-fg)' },
            '请先阅读',
            t('caption', '（次要提示）', true),
            '，再确认操作。'),
        );
      },
      code: `<p>请先阅读 <x-text variant="caption" inline>（次要提示）</x-text>，再确认操作。</p>`,
    }),

    demoCard({
      title: '标题 + 副标题组合',
      desc: '块级 x-text 纵向堆叠，常见于卡片 / 抽屉头部',
      build: (c) => {
        const wrap = h('div', { style: 'display:flex;flex-direction:column;gap:2px' });
        wrap.append(t('title', '通知设置'), t('caption', '管理此工作区的提醒方式'));
        c.append(wrap);
      },
      code: `<div style="display:flex;flex-direction:column;gap:2px">
  <x-text variant="title">通知设置</x-text>
  <x-text variant="caption">管理此工作区的提醒方式</x-text>
</div>`,
    }),

    rich('提示：x-text 是<b>表现层</b>排版，不承担文档大纲语义。需要真正的 <code>&lt;h1&gt;~&lt;h6&gt;</code> 结构时请用语义标签，或按需通过 <code>part="text"</code> 覆盖外观。'),

    h('h2', null, 'API'),
    h('h3', null, '属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['variant', '排版角色（字号/字重/颜色的语义档位）', "'title' | 'subtitle' | 'body' | 'caption' | 'muted'", "'body'"],
        ['inline', '行内盒排布（默认块级），便于嵌入句子', 'boolean', 'false'],
      ],
    ),
    h('h3', null, '插槽 Slots'),
    apiTable(
      ['插槽', '说明'],
      [['(默认)', '文本内容'],],
    ),
    h('h3', null, 'CSS 部分 Part'),
    apiTable(
      ['part', '说明'],
      [['text', '内部包裹盒（字体属性继承自宿主）'],],
    ),
    h('h3', null, '各 variant 对应的令牌'),
    apiTable(
      ['variant', '字号', '字重', '颜色'],
      [
        ['title', '--xie-font-size-lg', '600', '--xie-color-fg'],
        ['subtitle', '--xie-font-size-md', '500', '--xie-color-fg'],
        ['body（默认）', '--xie-font-size-md', '400', '--xie-color-fg'],
        ['caption', '--xie-font-size-sm', '400', '--xie-color-muted'],
        ['muted', '--xie-font-size-md', '400', '--xie-color-muted'],
      ],
    ),
  );
}
