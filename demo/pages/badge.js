/** Badge 徽标文档：独立胶囊/圆点 + 锚定四角两形态，数字溢出折叠、语义色实底 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

function badge(attrs = {}, text = null) {
  const b = document.createElement('x-badge');
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, String(v));
  if (text != null) b.textContent = text;
  return b;
}

function button(label, attrs = {}) {
  const b = document.createElement('x-button');
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, String(v));
  b.textContent = label;
  return b;
}

function avatarBox(attrs = {}) {
  const a = document.createElement('x-avatar');
  for (const [k, v] of Object.entries(attrs)) a.setAttribute(k, String(v));
  return a;
}

export function render(el) {
  /* —— 1. 独立用法（行内胶囊） —— */
  const standalone = h(
    'div',
    { style: 'display:flex;align-items:center;gap:20px;flex-wrap:wrap' },
    badge({ value: '5' }),
    badge({ value: '41' }),
    badge({ value: '128', max: '99' }),
    badge({ value: 'new', color: 'danger' }),
    badge({ value: 'HOT', color: 'primary', size: 'lg' }),
    badge({ dot: true }),
  );

  /* —— 2. 锚定到内容四角 —— */
  const anchorWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:32px;flex-wrap:wrap' },
    ...['top-right', 'top-left', 'bottom-right', 'bottom-left'].map((p) => {
      const b = badge({ value: '6', placement: p });
      b.append(avatarBox({ text: 'X', color: 'primary', shape: 'rounded' }));
      return b;
    }),
  );

  /* —— 3. 数字溢出折叠 + 0 值显隐 —— */
  const overflowWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:24px;flex-wrap:wrap' },
    badge({ value: '99', max: '99' }),
    badge({ value: '100', max: '99' }),
    badge({ value: '9999', max: '999' }),
    badge({ value: '0' }),
    badge({ value: '0', 'show-zero': true }),
  );

  /* —— 4. 语义色轴 —— */
  const COLORS = ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'];
  const colorWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:16px;flex-wrap:wrap' },
    ...COLORS.map((c) => badge({ value: c === 'default' ? '●' : '8', color: c })),
  );

  /* —— 5. 尺寸档位 —— */
  const sizeWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:16px;flex-wrap:wrap' },
    badge({ value: '12', size: 'sm' }),
    badge({ value: '12', size: 'md' }),
    badge({ value: '12', size: 'lg' }),
  );

  /* —— 6. 动态计数（消息图标 + 加减按钮） —— */
  const dynBadge = badge({ value: '0', max: '9', color: 'danger' });
  const icon = document.createElement('x-icon');
  icon.setAttribute('name', 'settings');
  icon.setAttribute('size', '24px');
  dynBadge.append(icon);
  let count = 0;
  const paint = () => (dynBadge.value = String(count));
  const incBtn = button('+1', { variant: 'soft', color: 'success' });
  incBtn.addEventListener('click', () => { count++; paint(); });
  const decBtn = button('-1', { variant: 'soft', color: 'secondary' });
  decBtn.addEventListener('click', () => { count = Math.max(0, count - 1); paint(); });
  const zeroBtn = button('归零（看它消失）', { variant: 'outline' });
  zeroBtn.addEventListener('click', () => { count = 0; paint(); });
  const dynWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:20px;flex-wrap:wrap' },
    dynBadge, incBtn, decBtn, zeroBtn,
  );

  el.append(
    h('h1', null, 'Badge 徽标'),
    h(
      'p',
      { class: 'lead' },
      '小号状态标记：不塞内容时是行内胶囊/圆点（独立模式，当微标签用），塞了内容就浮到其四角（锚定模式，带背景色环与所附内容分隔）。数字超过 max 折叠为 `${max}+`，值为 0 默认隐藏。',
    ),

    h('h2', null, '引入'),
    h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, `import '@xie-work/xie-ui';`)))),

    h('h2', null, '代码演示'),
    demoCard({
      title: '独立用法',
      desc: '不写子内容即行内胶囊；value 为文本或数字，dot 收成圆点',
      build: (c) => c.append(standalone),
      code: `<x-badge value="5"></x-badge>\n<x-badge value="128" max="99"></x-badge>\n<x-badge value="new" color="danger"></x-badge>\n<x-badge dot></x-badge>`,
    }),
    demoCard({
      title: '锚定到内容四角',
      desc: '往 <x-badge> 里放任意元素即进入锚定态，placement 选角（默认 top-right）',
      build: (c) => c.append(anchorWrap),
      code: `<x-badge value="6" placement="top-right">\n  <x-avatar text="X" color="primary"></x-avatar>\n</x-badge>`,
    }),
    demoCard({
      title: '数字溢出与 0 值',
      desc: '纯数字超过 max 折叠为 ${max}+；value="0" 默认隐藏，show-zero 强制显示',
      build: (c) => c.append(overflowWrap),
      code: `<x-badge value="100" max="99"></x-badge>  <!-- 99+ -->\n<x-badge value="0"></x-badge>            <!-- 隐藏 -->\n<x-badge value="0" show-zero></x-badge>   <!-- 0 -->`,
    }),
    demoCard({
      title: '语义色',
      desc: 'color 走全库统一 7 角色；default 为中性反色实底，随主题明暗联动',
      build: (c) => c.append(colorWrap),
      code: `<x-badge value="8" color="success"></x-badge>\n<x-badge value="8" color="danger"></x-badge>`,
    }),
    demoCard({
      title: '尺寸',
      desc: 'size 三档 sm/md/lg，胶囊高与圆点、字号一并联动',
      build: (c) => c.append(sizeWrap),
      code: `<x-badge value="12" size="sm"></x-badge>\n<x-badge value="12" size="lg"></x-badge>`,
    }),
    demoCard({
      title: '动态计数',
      desc: '改 value 即时更新；归零后徽标自动消失（max=9 演示溢出）',
      build: (c) => c.append(dynWrap),
      code: `const b = document.querySelector('x-badge');\nb.value = String(++count); // 变更后自动重算显隐/折叠`,
    }),

    h('h2', null, '设计要点'),
    rich(
      '徽标本身<b>不带交互</b>：它是纯展示标记，点击等交互应由其锚定的宿主元素承担。锚定/独立两态由内部检测 slot 是否有实际内容自动切换（<code>data-anchored</code>），无需手动开关。数字折叠只对<b>纯数字</b>字符串生效，<code>"new"</code> / <code>"12k+"</code> 等原样展示。中性缺省走反色实底，与 toast 中性条同源，深浅主题皆清晰。',
    ),

    h('h2', null, 'API'),
    h('h3', null, 'x-badge · 属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['value', '徽标内容（数字或短文本）；空且非 dot 时整体隐藏', 'string', "''"],
        ['max', '纯数字超过 max 显示 `${max}+`；0 = 不设上限', 'number', '99'],
        ['dot', '圆点模式：只显示小圆点，忽略 value 文本', 'boolean', 'false'],
        ['show-zero', 'value 为 "0" 时是否仍显示（默认隐藏）', 'boolean', 'false'],
        ['color', '语义色（反射）', "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'", "'default'"],
        ['placement', '锚定角（反射，仅锚定态有意义）', "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'", "'top-right'"],
        ['size', '尺寸档位（反射）', "'sm' | 'md' | 'lg'", "'md'"],
      ],
    ),
    h('h3', null, 'Slots'),
    apiTable(
      ['插槽', '说明'],
      [['default', '放入任意元素即进入锚定态，徽标浮到其角上；不放内容则为独立胶囊/圆点']],
    ),
    h('h3', null, '样式部件 Parts'),
    apiTable(
      ['part', '所属', '说明'],
      [['badge', 'x-badge', '徽标本体（胶囊/圆点）']],
    ),
  );
}
