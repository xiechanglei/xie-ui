/** Progress 进度条文档：定值 / 不确定 / 语义色 / 尺寸 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

function progress(attrs = {}) {
  const p = document.createElement('x-progress');
  for (const [k, v] of Object.entries(attrs)) p.setAttribute(k, String(v));
  return p;
}

const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'default'];

export function render(el) {
  /* —— 定值：几档静态 + 一条会自己走的（演示 width 过渡） —— */
  const staticWrap = h(
    'div',
    { style: 'display:flex;flex-direction:column;gap:18px;width:100%' },
    progress({ value: 25 }),
    progress({ value: 60, color: 'success' }),
    progress({ value: 100, color: 'info' }),
  );
  const liveBar = progress({ value: 0, color: 'warning' });
  const liveBtn = h('x-button', { variant: 'outline', size: 'sm' }, '跑起来');
  liveBtn.addEventListener('click', () => {
    let v = 0;
    liveBar.value = 0;
    const timer = setInterval(() => {
      v = Math.min(v + 7 + Math.round(Math.random() * 10), 100);
      liveBar.value = v;
      if (v >= 100) clearInterval(timer);
    }, 260);
  });
  const liveWrap = h('div', { style: 'display:flex;flex-direction:column;gap:14px;width:100%' }, liveBar, h('div', null, liveBtn));

  /* —— 不确定 —— */
  const indetWrap = h(
    'div',
    { style: 'display:flex;flex-direction:column;gap:18px;width:100%' },
    progress(),
    progress({ indeterminate: true, color: 'danger' }),
  );

  /* —— 颜色轴 —— */
  const colorWrap = h(
    'div',
    { style: 'display:flex;flex-direction:column;gap:14px;width:100%' },
    ...COLORS.map((c, i) => progress({ color: c, value: 30 + i * 10 })),
  );

  /* —— 尺寸 —— */
  const sizeWrap = h(
    'div',
    { style: 'display:flex;flex-direction:column;gap:16px;width:100%' },
    progress({ value: 70, size: '4px', color: 'info' }),
    progress({ value: 70 }),
    progress({ value: 70, size: '16px', color: 'success' }),
  );

  el.append(
    h('h1', null, 'Progress 进度条'),
    h(
      'p',
      { class: 'lead' },
      '线性完成度指示。写 value（0–100）即定值模式，填充条按比例伸展；不写 value（或加 indeterminate）即不确定模式，小条来回扫动。与 x-spinner 分工：知道完成度用 progress、只知道「在忙」用 spinner。颜色走全库统一 7 角色语义色。',
    ),

    h('h2', null, '引入'),
    h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, `import '@xie-work/xie-ui';`)))),

    h('h2', null, '代码演示'),
    demoCard({
      title: '定值 value',
      desc: '0–100，越界自动夹紧；变更带 width 过渡',
      build: (c) => c.append(staticWrap),
      code: `<x-progress value="25"></x-progress>
<x-progress value="60" color="success"></x-progress>
<x-progress value="100" color="info"></x-progress>`,
    }),
    demoCard({
      title: '动态推进',
      desc: 'value 就是普通 property：bar.value = 42 即更新（可绑定进度事件）',
      build: (c) => c.append(liveWrap),
      code: `const bar = document.querySelector('x-progress');
bar.value = 42; // 框架无关，直接写`,
    }),
    demoCard({
      title: '不确定模式',
      desc: '不写 value 即扫动；或显式 indeterminate 忽略 value',
      build: (c) => c.append(indetWrap),
      code: `<x-progress></x-progress>
<x-progress indeterminate color="danger"></x-progress>`,
    }),
    demoCard({
      title: '语义色 color',
      desc: '7 角色与 tag/spinner 同族；default 为中性',
      build: (c) => c.append(colorWrap),
      code: `<x-progress value="60" color="success"></x-progress>
<x-progress value="60" color="warning"></x-progress>
<x-progress value="60" color="danger"></x-progress>`,
    }),
    demoCard({
      title: '尺寸 size',
      desc: '任意 CSS 长度或纯数字（按 px），轨道圆角随高度联动',
      build: (c) => c.append(sizeWrap),
      code: `<x-progress value="70" size="4px"></x-progress>
<x-progress value="70"></x-progress>
<x-progress value="70" size="16px" color="success"></x-progress>`,
    }),

    h('h2', null, '设计要点'),
    rich(
      '填充条宽度靠<b>细粒度 style 绑定</b>直写：value 变更只动这一条属性，不重渲结构（基类模板引擎的 attribute 绑定红利）。<code>role="progressbar"</code> + <code>aria-valuenow/min/max</code> 挂在填充条上，不确定模式自动省略 valuenow 并改播「加载中」。<code>prefers-reduced-motion: reduce</code> 下扫动停为半透明静态满条——仍传达「进行中」但不靠动效。单一非 7 角色颜色不用扩属性：覆写 <code>--_pg-color</code> 即可。',
    ),

    h('h2', null, 'API'),
    h('h3', null, 'x-progress · 属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['value', '完成度（反射，0–100）；未设置 = 不确定模式', 'number', '—'],
        ['indeterminate', '强制不确定（反射），忽略 value', 'boolean', 'false'],
        ['color', '语义色（反射）', "'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default'", "'primary'"],
        ['size', '轨道高度（写局部变量，纯数字按 px）', 'string', "'8px'"],
        ['label', '无障碍名（不确定模式自动改播「加载中」）', 'string', "'进度'"],
      ],
    ),
    h('h3', null, '样式部件 Parts'),
    apiTable(
      ['part', '所属', '说明'],
      [
        ['track', 'x-progress', '轨道'],
        ['fill', 'x-progress', '填充条'],
      ],
    ),
  );
}
