/** Tag 标签文档：variant×color 双轴正交 + 尺寸/胶囊/可关闭 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

function tag(attrs = {}, text = null) {
  const t = document.createElement('x-tag');
  for (const [k, v] of Object.entries(attrs)) t.setAttribute(k, String(v));
  if (text != null) t.textContent = text;
  return t;
}

const COLORS = ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'];
const VARIANTS = ['soft', 'solid', 'outline', 'ghost'];

export function render(el) {
  /* —— 形态 variant —— */
  const variantWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:12px;flex-wrap:wrap' },
    ...VARIANTS.map((v) => tag({ variant: v, color: 'primary' }, v)),
  );

  /* —— 语义色 color —— */
  const colorWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:12px;flex-wrap:wrap' },
    ...COLORS.map((c) => tag({ color: c }, c)),
  );

  /* —— 双轴组合矩阵：每行一个 variant，每列一个 color —— */
  const matrix = h(
    'div',
    { style: 'display:flex;flex-direction:column;gap:10px' },
    ...VARIANTS.map((v) =>
      h(
        'div',
        { style: 'display:flex;align-items:center;gap:10px;flex-wrap:wrap' },
        h('span', { style: 'width:56px;color:var(--xie-color-muted);font-size:12px' }, v),
        ...COLORS.map((c) => tag({ variant: v, color: c }, c)),
      ),
    ),
  );

  /* —— 尺寸 —— */
  const sizeWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:12px;flex-wrap:wrap' },
    tag({ size: 'sm', color: 'info' }, 'sm'),
    tag({ size: 'md', color: 'info' }, 'md'),
    tag({ size: 'lg', color: 'info' }, 'lg'),
  );

  /* —— 胶囊 round —— */
  const roundWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:12px;flex-wrap:wrap' },
    tag({ round: true, color: 'success' }, '圆角'),
    tag({ round: true, variant: 'solid', color: 'danger' }, '实心胶囊'),
    tag({ round: true, variant: 'outline', color: 'secondary' }, '描边胶囊'),
  );

  /* —— 可关闭：点 × 派发 x-close，由宿主（此处分派监听器）决定是否移除 —— */
  const closableWrap = h('div', { style: 'display:flex;align-items:center;gap:12px;flex-wrap:wrap' });
  ['标签 A', '标签 B', '标签 C'].forEach((txt, i) => {
    closableWrap.append(tag({ closable: true, color: COLORS[i + 1] }, txt));
  });
  const closableStatus = h('span', { class: 'demo-card__title' }, '点标签上的 × 试试');
  const closableHost = h('div', { style: 'display:flex;flex-direction:column;gap:12px' }, closableWrap, closableStatus);
  // 组件不自删：宿主在 x-close 里裁决。此处 confirm「确定=移除」「取消=保留」。
  closableWrap.addEventListener('x-close', (e) => {
    const t = e.target;
    if (window.confirm('移除该标签？')) {
      t.remove();
      closableStatus.textContent = `已移除「${t.textContent.trim()}」`;
    } else {
      closableStatus.textContent = `已取消，保留「${t.textContent.trim()}」`;
    }
  });

  el.append(
    h('h1', null, 'Tag 标签'),
    h(
      'p',
      { class: 'lead' },
      '轻量分类标记。双轴范式与 x-button 同源：variant 选填充形态（soft/solid/outline/ghost）、color 选 7 角色语义色，二者正交、任意组合自动成立；另有尺寸、胶囊形态与可关闭。标签本身是展示件，「关闭」只对外派发 x-close，是否移除由宿主决定。',
    ),

    h('h2', null, '引入'),
    h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, `import '@xie-work/xie-ui';`)))),

    h('h2', null, '代码演示'),
    demoCard({
      title: '形态 variant',
      desc: 'soft(默认，淡底+强调字) / solid(实底) / outline(描边) / ghost(无底)',
      build: (c) => c.append(variantWrap),
      code: `<x-tag variant="soft">soft</x-tag>
<x-tag variant="solid">solid</x-tag>
<x-tag variant="outline">outline</x-tag>
<x-tag variant="ghost">ghost</x-tag>`,
    }),
    demoCard({
      title: '语义色 color',
      desc: '全库统一 7 角色；default 为中性（随主题明暗翻转），其余 6 个强调角色',
      build: (c) => c.append(colorWrap),
      code: `<x-tag>default</x-tag>
<x-tag color="primary">primary</x-tag>
<x-tag color="success">success</x-tag>
<x-tag color="danger">danger</x-tag>`,
    }),
    demoCard({
      title: '形态 × 语义色 组合',
      desc: '两轴正交，组合矩阵无需任何额外代码即自动成立',
      build: (c) => c.append(matrix),
      code: `<x-tag variant="outline" color="danger">Outline Danger</x-tag>
<x-tag variant="ghost" color="success">Ghost Success</x-tag>
<x-tag variant="solid" color="info">Solid Info</x-tag>`,
    }),
    demoCard({
      title: '尺寸',
      desc: 'size 三档 sm/md/lg，高度、内边距与字号一并联动',
      build: (c) => c.append(sizeWrap),
      code: `<x-tag size="sm">sm</x-tag>
<x-tag size="md">md</x-tag>
<x-tag size="lg">lg</x-tag>`,
    }),
    demoCard({
      title: '胶囊 round',
      desc: '全圆角形态，常用于状态/筛选 chip',
      build: (c) => c.append(roundWrap),
      code: `<x-tag round color="success">圆角</x-tag>
<x-tag round variant="solid" color="danger">实心胶囊</x-tag>`,
    }),
    demoCard({
      title: '可关闭 closable',
      desc: '显 × 钮，点它派发 x-close；组件不自删，由宿主在监听里决定移除（本例用 confirm 演示取舍）',
      build: (c) => c.append(closableHost),
      code: `const wrap = document.querySelector('.tags');
wrap.addEventListener('x-close', (e) => e.target.remove()); // 宿主决定移除
// x-close 为 cancelable，也可 e.preventDefault() 拦截`,
    }),

    h('h2', null, '设计要点'),
    rich(
      '与 x-button 同一双轴实现：<code>color</code> 只决定「这一支语义色」写进 <code>--_accent</code> 系变量，<code>variant</code> 只决定「如何消费它」（实底/淡底/描边/无底），两段 CSS 正交，新增强调角色或形态互不影响。标签是纯展示件，<b>关闭不自动消失</b>：<code>x-close</code> 派发后由宿主决定移除/隐藏（可 <code>preventDefault</code> 拦截），交互权交回使用方。文字过长时 <code>.label</code> 省略号截断、不撑破容器。',
    ),

    h('h2', null, 'API'),
    h('h3', null, 'x-tag · 属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['variant', '形态（反射）', "'soft' | 'solid' | 'outline' | 'ghost'", "'soft'"],
        ['color', '语义色（反射，与形态正交）', "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'", "'default'"],
        ['size', '尺寸档位（反射）', "'sm' | 'md' | 'lg'", "'md'"],
        ['closable', '是否显示关闭钮（反射）', 'boolean', 'false'],
        ['round', '胶囊形态·全圆角（反射）', 'boolean', 'false'],
      ],
    ),
    h('h3', null, '事件 Events'),
    apiTable(
      ['事件', '说明', 'detail'],
      [['x-close', '点击关闭钮派发（bubbles+composed+cancelable）；默认不自删，preventDefault 可拦截', '无']],
    ),
    h('h3', null, '插槽 Slots'),
    apiTable(
      ['插槽', '说明'],
      [['default', '标签文字内容（过长自动省略号截断）']],
    ),
    h('h3', null, '样式部件 Parts'),
    apiTable(
      ['part', '所属', '说明'],
      [
        ['base', 'x-tag', '标签外框'],
        ['label', 'x-tag', '文字容器'],
        ['close', 'x-tag', '关闭钮（closable 时）'],
      ],
    ),
  );
}
