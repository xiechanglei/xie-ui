/** Spinner 加载中文档：圆环旋转、em 随字号、7 角色语义色 + currentColor 逃生舱 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

function spinner(attrs = {}) {
  const s = document.createElement('x-spinner');
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, String(v));
  return s;
}

function button(label, attrs = {}) {
  const b = document.createElement('x-button');
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, String(v));
  b.textContent = label;
  return b;
}

const COLORS = ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'];

export function render(el) {
  /* —— 尺寸：默认 1em 随字号缩放 —— */
  const sizeWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:24px;flex-wrap:wrap' },
    spinner(), // 1em，跟着周围 14px 字号
    spinner({ size: '20px' }),
    spinner({ size: '32px', stroke: '3px' }),
    spinner({ size: '48px', stroke: '5px' }),
  );

  /* —— 颜色：7 角色 —— */
  const colorWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:20px;flex-wrap:wrap' },
    ...COLORS.map((c) => spinner({ color: c, size: '22px', stroke: '3px' })),
  );

  /* —— 速度 —— */
  const speedWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:20px;flex-wrap:wrap' },
    spinner({ speed: '0.3', size: '22px', stroke: '3px' }),
    spinner({ speed: '0.6', size: '22px', stroke: '3px' }),
    spinner({ speed: '1.4', size: '22px', stroke: '3px' }),
  );

  /* —— 随上下文文字色（currentColor）联动：放进不同色/字号的容器 —— */
  const inheritWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:16px;flex-wrap:wrap' },
    h('span', { style: 'color:#dc2626;font-size:28px;display:inline-flex;align-items:center;gap:8px' }, spinner(), '随父级文字色·大字'),
    h('span', { style: 'color:#0891b2;font-size:14px;display:inline-flex;align-items:center;gap:8px' }, spinner(), '小字同色'),
  );

  /* —— 与 x-button 加载态同源：button 内嵌的就是它 —— */
  const btnWrap = h(
    'div',
    { style: 'display:flex;align-items:center;gap:16px;flex-wrap:wrap' },
    button('提交中', { loading: '' }),
    button('Outline', { variant: 'outline', loading: '' }),
    button('Ghost', { variant: 'ghost', color: 'success', loading: '' }),
  );

  /* —— 页面级区块：转圈 + 文案，配 aria-live 播报 —— */
  const blockWrap = h(
    'div',
    { style: 'display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px;color:var(--xie-color-muted)' },
    spinner({ size: '36px', stroke: '4px', color: 'primary', label: '正在加载数据' }),
    h('span', null, '正在加载数据…'),
  );

  el.append(
    h('h1', null, 'Spinner 加载中'),
    h(
      'p',
      { class: 'lead' },
      '圆环缺一段、匀速旋转的加载指示器。库里所有「等待中」的视觉都收敛到这一件（x-button 的 loading 内嵌的就是它）。默认尺寸 1em 随字号缩放、颜色 currentColor 随上下文文字色与主题自动联动；size / stroke / speed 可微调，color 走全库统一 7 角色。',
    ),

    h('h2', null, '引入'),
    h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, `import '@xie-work/xie-ui';`)))),

    h('h2', null, '代码演示'),
    demoCard({
      title: '尺寸与环粗',
      desc: 'size 直径、stroke 环粗：纯数字按 px 理解，也可直接写 CSS 长度（缺省 1em / 2px）',
      build: (c) => c.append(sizeWrap),
      code: `<x-spinner></x-spinner>              <!-- 1em，随字号 -->
<x-spinner size="20px"></x-spinner>
<x-spinner size="32" stroke="3"></x-spinner>  <!-- 纯数字按 px -->
<x-spinner size="1.5em" stroke="0.2em"></x-spinner>`,
    }),
    demoCard({
      title: '语义色',
      desc: 'color 走全库统一 7 角色；default 为中性，实为 currentColor 随上下文联动',
      build: (c) => c.append(colorWrap),
      code: `<x-spinner color="primary"></x-spinner>
<x-spinner color="success"></x-spinner>
<x-spinner color="danger"></x-spinner>`,
    }),
    demoCard({
      title: '转速',
      desc: 'speed 一圈时长：秒数或 CSS 时间（缺省 .6s）',
      build: (c) => c.append(speedWrap),
      code: `<x-spinner speed="0.3"></x-spinner>
<x-spinner speed="0.6"></x-spinner>
<x-spinner speed="1.4"></x-spinner>`,
    }),
    demoCard({
      title: '随上下文联动',
      desc: '不设 color 时环色即 currentColor：外层文字色/字号变了它自动跟着变，无需单独配',
      build: (c) => c.append(inheritWrap),
      code: `<span style="color:#dc2626;font-size:28px">
  <x-spinner></x-spinner> 大字红色
</span>`,
    }),
    demoCard({
      title: '在按钮里（同源）',
      desc: 'x-button 的 loading 内嵌的就是 x-spinner，颜色自动吃按钮前景色',
      build: (c) => c.append(btnWrap),
      code: `<x-button loading>提交中</x-button>
<x-button variant="outline" loading>Outline</x-button>`,
    }),
    demoCard({
      title: '页面级区块',
      desc: '较大 size/stroke 配文案，label 提供无障碍名（读屏播报 role=status）',
      build: (c) => c.append(blockWrap),
      code: `<x-spinner size="36" stroke="4" color="primary" label="正在加载数据"></x-spinner>`,
    }),

    h('h2', null, '设计要点'),
    rich(
      '几何（尺寸/环粗/转速）不反射成属性、也不进样式表，而是由组件把值写成宿主局部变量 <code>--_sp-*</code>，CSS 里 <code>var(--_sp-size, 1em)</code> 兜缺省——缺省值只在样式里定义一处，属性留空即交回 CSS。颜色轴沿用全库统一的 7 角色；只想要某一个非角色色，不扩属性，直接 <code>x-spinner{ --_sp-color:#e11 }</code> 覆写（未设 color 时组件不写 inline 变量，继承值生效）。<code>prefers-reduced-motion: reduce</code> 下停转并把缺口补成完整静态圆环，仍表「进行中」但不靠动效。',
    ),

    h('h2', null, 'API'),
    h('h3', null, 'x-spinner · 属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['size', '直径：任意 CSS 长度或纯数字（按 px）', 'string', "'1em'（随字号）"],
        ['stroke', '环粗：同上', 'string', "'2px'"],
        ['speed', '转一圈时长：秒数或 CSS 时间', 'string', "'.6s'"],
        ['color', '语义色（反射）', "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'", "'default'"],
        ["label", '无障碍名；置空则退化为纯装饰（aria-hidden），由宿主自行播报状态', 'string', "'加载中'"],
      ],
    ),
    h('h3', null, 'CSS 变量 Variables'),
    apiTable(
      ['变量', '说明'],
      [
        ['--_sp-size', '直径（组件按 size 写入，可直接覆写绕过属性）'],
        ['--_sp-stroke', '环粗'],
        ['--_sp-duration', '一圈时长'],
        ['--_sp-color', '环色；缺省 currentColor，单一非角色色的逃生舱'],
      ],
    ),
    h('h3', null, '样式部件 Parts'),
    apiTable(
      ['part', '所属', '说明'],
      [['spinner', 'x-spinner', '圆环本体']],
    ),
  );
}
