/** Divider 分割线文档：横/纵 + 可选文字断线 + 虚线 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

function divider(attrs = {}, text = null) {
  const d = document.createElement('x-divider');
  for (const [k, v] of Object.entries(attrs)) d.setAttribute(k, String(v));
  if (text != null) d.textContent = text;
  return d;
}

export function render(el) {
  /* —— 横向：上下区块之间 —— */
  const block = (bg, txt) =>
    h('div', { style: `padding:14px;background:${bg};border-radius:8px;text-align:center` }, txt);
  const horizWrap = h(
    'div',
    { style: 'width:100%' },
    block('var(--xie-color-surface)', '上区块'),
    divider(),
    block('var(--xie-color-surface)', '下区块'),
  );

  /* —— 带文字：默认插槽放标签，线在两侧断开 —— */
  const labeledWrap = h(
    'div',
    { style: 'width:100%' },
    divider({}, '或'),
    divider({ labelPlacement: 'start' }, '开始'),
    divider({ labelPlacement: 'end' }, '结束'),
  );

  /* —— 虚线 —— */
  const dashedWrap = h(
    'div',
    { style: 'width:100%' },
    divider({ dashed: true }),
    divider({ dashed: true }, '虚线分隔'),
  );

  /* —— 纵向：行内元素之间 —— */
  const verticalWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:4px' },
    h('a', { href: 'javascript:void 0' }, '编辑'),
    divider({ direction: 'vertical' }),
    h('a', { href: 'javascript:void 0' }, '复制'),
    divider({ direction: 'vertical' }),
    h('a', { href: 'javascript:void 0', style: 'color:var(--xie-color-danger)' }, '删除'),
  );
  const verticalTallWrap = h(
    'div',
    { style: 'display:flex;align-items:stretch;gap:12px;height:64px' },
    block('var(--xie-color-surface)', '左'),
    divider({ direction: 'vertical' }),
    block('var(--xie-color-surface)', '右'),
  );

  el.append(
    h('h1', null, 'Divider 分割线'),
    h(
      'p',
      { class: 'lead' },
      '一条线把内容切成两段。横向（默认）分隔上下区块；direction="vertical" 分隔行内元素，高度靠 flex 父项 stretch 撑满。往默认插槽放内容即得带文字的断线，labelPlacement 调锚位；dashed 切虚线。',
    ),

    h('h2', null, '引入'),
    h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, `import '@xie-work/xie-ui';`)))),

    h('h2', null, '代码演示'),
    demoCard({
      title: '横向分隔',
      desc: '默认形态，块级铺满一行',
      build: (c) => c.append(horizWrap),
      code: `<div>上区块</div>
<x-divider></x-divider>
<div>下区块</div>`,
    }),
    demoCard({
      title: '带文字',
      desc: '标签走默认插槽（插槽里放什么就是什么）；labelPlacement 调锚位',
      build: (c) => c.append(labeledWrap),
      code: `<x-divider>或</x-divider>
<x-divider label-placement="start">开始</x-divider>
<x-divider label-placement="end">结束</x-divider>`,
    }),
    demoCard({
      title: '虚线 dashed',
      desc: '纯线与带文字都支持；虚线段两侧/整线明暗一致',
      build: (c) => c.append(dashedWrap),
      code: `<x-divider dashed></x-divider>
<x-divider dashed>虚线分隔</x-divider>`,
    }),
    demoCard({
      title: '纵向 direction',
      desc: '行内场景竖向分隔；处于 flex stretch 容器时自动撑满父高',
      build: (c) => {
        c.append(verticalWrap, divider({ style: 'margin:14px 0' }), verticalTallWrap);
      },
      code: `<div style="display:flex;align-items:center">
  <a>编辑</a>
  <x-divider direction="vertical"></x-divider>
  <a>复制</a>
</div>`,
    }),

    h('h2', null, '设计要点'),
    rich(
      '线色吃全局令牌 <code>--xie-color-border</code>，随主题明暗联动。<b>带文字的线</b>由 ::before/::after 两段断线实现，插槽留空时自动收起标签层、退化为一根纯线——所以「纯线 / 带字」共用一套结构，靠 <code>slotchange</code> 切换。<b>虚线不用 <code>border-style:dashed</code></b>：两段线的 dash 相位不连续会在标签两侧错位，改用 background 渐变平铺画段，左右天然一致。纵向线高度不写死——<code>align-self:stretch</code> 让它在 flex 父项里自己长满，孤立摆放时退化为 1em。',
    ),

    h('h2', null, 'API'),
    h('h3', null, 'x-divider · 属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['direction', '方向（反射）', "'horizontal' | 'vertical'", "'horizontal'"],
        ['dashed', '虚线（反射）', 'boolean', 'false'],
        ['labelPlacement', '标签锚位（反射，仅带标签时生效）', "'start' | 'center' | 'end'", "'center'"],
      ],
    ),
    h('h3', null, '插槽 Slots'),
    apiTable(
      ['插槽', '说明'],
      [['default', '标签内容（放即成断线文字，留空为纯线）']],
    ),
    h('h3', null, '样式部件 Parts'),
    apiTable(
      ['part', '所属', '说明'],
      [
        ['line', 'x-divider', '线本体（含两段断线）'],
        ['label', 'x-divider', '标签层'],
      ],
    ),
  );
}
