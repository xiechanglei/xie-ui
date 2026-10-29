/** Alert 警告提示文档：soft/solid 形态 × 7 角色语义色 + 标题 + 富内容 + 可关闭 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

function alert(attrs = {}, body = null, text = null) {
  const a = document.createElement('x-alert');
  for (const [k, v] of Object.entries(attrs)) a.setAttribute(k, String(v));
  if (text != null) a.textContent = text;
  if (body) a.append(body);
  return a;
}

const COLORS = ['info', 'success', 'warning', 'danger', 'primary', 'default'];

export function render(el) {
  /* —— 形态：soft / solid —— */
  const variantWrap = h(
    'div',
    { style: 'display:flex;flex-direction:column;gap:14px' },
    alert({ color: 'primary' }, null, 'soft 形态：淡色底 + 强调标题，正文常规前景色（默认）'),
    alert({ variant: 'solid', color: 'primary' }, null, 'solid 形态：实底反色，强调场景更重'),
  );

  /* —— 语义色：7 角色一行排开看一遍 —— */
  const colorWrap = h(
    'div',
    { style: 'display:flex;flex-direction:column;gap:14px' },
    ...COLORS.map((c) => alert({ color: c }, null, `${c} 角色的提示内容`)),
  );

  /* —— 标题 + 正文两层 —— */
  const titleWrap = h(
    'div',
    { style: 'display:flex;flex-direction:column;gap:14px' },
    alert({ color: 'warning', title: '部署即将开始' }, null, '服务将在 5 分钟后重启，请保存好工作。'),
    alert({ color: 'danger', title: '配额不足', variant: 'solid' }, null, '本月 API 调用额度已用完，升级套餐可解除限制。'),
  );

  /* —— 富内容：正文插槽随意放（段落/按钮/链接均可） —— */
  const richBody = h(
    'div',
    { style: 'display:flex;flex-direction:column;gap:10px' },
    h('p', null, '仓库有新版本，包含两个破坏性变更。'),
    h(
      'div',
      { style: 'display:flex;gap:8px' },
      h('x-button', { size: 'sm', variant: 'solid', color: 'danger' }, '查看变更'),
      h('x-button', { size: 'sm', variant: 'outline' }, '稍后'),
    ),
  );
  const richWrap = h('div', { style: 'display:flex;flex-direction:column;gap:14px' }, alert({ color: 'danger', title: '依赖更新' }, richBody));

  /* —— 无图标 —— */
  const noIconWrap = h(
    'div',
    { style: 'display:flex;flex-direction:column;gap:14px' },
    alert({ icon: false, color: 'success' }, null, 'icon 关掉，只留文字（icon 名跟随 color，default/primary 本来就没有图标）'),
  );

  /* —— 可关闭：派发 x-close，宿主裁决隐藏 —— */
  const closableWrap = h('div', { style: 'display:flex;flex-direction:column;gap:14px' });
  closableWrap.append(
    alert({ closable: true, color: 'info', title: '这条可以关掉' }, null, '点右侧 × ——组件不自删，宿主监听 x-close 决定去留（本例直接隐藏）。'),
    alert({ closable: true, color: 'secondary' }, null, '再点一条试试。'),
  );
  const closableStatus = h('span', { class: 'demo-card__title' }, '还没关过');
  closableWrap.addEventListener('x-close', (e) => {
    e.target.hidden = true;
    closableStatus.textContent = `已隐藏一条（x-close 可 preventDefault 拦截）`;
  });
  const closableHost = h('div', { style: 'display:flex;flex-direction:column;gap:12px' }, closableWrap, closableStatus);

  el.append(
    h('h1', null, 'Alert 警告提示'),
    h(
      'p',
      { class: 'lead' },
      '页面内联的常驻提示块——toast 的「不会自己消失」版。配色与 toast 同源、形态走全库双轴范式：color 选 7 角色语义色、variant 选 soft(淡底)/solid(实底)；icon 跟随 color 自动配，title 属性起标题层，正文默认插槽放富内容；closable 出关闭钮，派发 x-close 由宿主裁决去留。',
    ),

    h('h2', null, '引入'),
    h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, `import '@xie-work/xie-ui';`)))),

    h('h2', null, '代码演示'),
    demoCard({
      title: '形态 variant',
      desc: 'soft(默认，淡底强调标题) / solid(实底反色)',
      build: (c) => c.append(variantWrap),
      code: `<x-alert color="primary">soft 形态（默认）</x-alert>
<x-alert variant="solid" color="primary">solid 形态</x-alert>`,
    }),
    demoCard({
      title: '语义色 color',
      desc: '图标跟随 color；default/primary 无图标自动收起',
      build: (c) => c.append(colorWrap),
      code: `<x-alert color="info">info</x-alert>
<x-alert color="success">success</x-alert>
<x-alert color="warning">warning</x-alert>
<x-alert color="danger">danger</x-alert>`,
    }),
    demoCard({
      title: '标题 + 正文',
      desc: 'title 属性起标题层，默认插槽放正文',
      build: (c) => c.append(titleWrap),
      code: `<x-alert color="warning" title="部署即将开始">
  服务将在 5 分钟后重启，请保存好工作。
</x-alert>`,
    }),
    demoCard({
      title: '富内容',
      desc: '正文里放按钮/链接/段落都行',
      build: (c) => c.append(richWrap),
      code: `<x-alert color="danger" title="依赖更新">
  <p>仓库有新版本，包含两个破坏性变更。</p>
  <x-button size="sm" variant="solid" color="danger">查看变更</x-button>
</x-alert>`,
    }),
    demoCard({
      title: '关掉图标',
      desc: 'icon 默认开；置 false 纯文字',
      build: (c) => c.append(noIconWrap),
      code: `<x-alert icon="false" color="success">只留文字</x-alert>
<!-- 布尔属性「存在即 true」，并额外承认字面量假值 icon="false"；JS 侧写 alertEl.icon = false 等价 -->`,
    }),
    demoCard({
      title: '可关闭 closable',
      desc: '点 × 派发 x-close；组件不自删，宿主决定隐藏还是移除',
      build: (c) => c.append(closableHost),
      code: `wrap.addEventListener('x-close', (e) => {
  e.target.hidden = true;   // 或直接 e.target.remove()
});
// x-close 是 cancelable 的，e.preventDefault() 可拦截（如二次确认）`,
    }),

    h('h2', null, '设计要点'),
    rich(
      '与 x-tag 同一<b>双轴正交</b>：color 只把语义色写进 <code>--_accent</code> 三件套，variant 只决定怎么消费（淡底/实底），新增一轴不影响另一轴。soft 形态下<b>正文回退常规前景色</b>——淡底上大面积强调字难读，标题/图标吃强调色就够了。图标名不开放自定义：<code>ALERT_ICONS</code> 表跟随 color（与 toast 同一张表），库里图标「只收实际用到的」的登记策略继续成立。<code>closable</code> 契约与 x-tag/x-toast 对齐：<code>x-close</code>（bubbles/composed/cancelable）先问再关，隐藏/移除/拦截都归宿主。<code>role="alert"</code> 让内容出现即被读屏播报。',
    ),

    h('h2', null, 'API'),
    h('h3', null, 'x-alert · 属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['variant', '形态（反射）', "'soft' | 'solid'", "'soft'"],
        ['color', '语义色（反射，图标跟随它）', "'info' | 'success' | 'warning' | 'danger' | 'primary' | 'secondary' | 'default'", "'info'"],
        ['title', '标题文本（与正文分两层）', 'string', "''"],
        ['icon', '显示图标（反射）', 'boolean', 'true'],
        ['closable', '显示关闭钮（反射）', 'boolean', 'false'],
      ],
    ),
    h('h3', null, '事件 Events'),
    apiTable(
      ['事件', '说明', 'detail'],
      [['x-close', '点关闭钮派发（bubbles+composed+cancelable）；组件不自删，preventDefault 可拦截', '无']],
    ),
    h('h3', null, '插槽 Slots'),
    apiTable(
      ['插槽', '说明'],
      [['default', '提示正文（富内容随意放）']],
    ),
    h('h3', null, '样式部件 Parts'),
    apiTable(
      ['part', '所属', '说明'],
      [
        ['base', 'x-alert', '提示块外框'],
        ['icon', 'x-alert', '图标层'],
        ['title', 'x-alert', '标题层'],
        ['body', 'x-alert', '正文容器'],
        ['close', 'x-alert', '关闭钮（closable 时）'],
      ],
    ),
  );
}
