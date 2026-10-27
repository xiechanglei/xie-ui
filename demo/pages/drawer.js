/** Drawer 抽屉文档：快捷用法 <x-drawer title subtitle>（自动生成带关闭按钮的头部），或显式 <x-drawer-header show-close> / <x-drawer-footer>，与内容无分隔线 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

function button(label, attrs = {}) {
  const b = document.createElement('x-button');
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, String(v));
  b.textContent = label;
  return b;
}

/** 用 style 属性安全建元素（render.js 的 h 对 style 键无效）；兼作主体包裹元素 */
function box(style, ...kids) {
  const e = document.createElement('div');
  if (style) e.setAttribute('style', style);
  e.append(...kids);
  return e;
}

/** 建一个抽屉：opts.quick 走“只写 title/subtitle”的快捷用法，否则显式组合 header/footer */
function makeDrawer(opts) {
  const d = document.createElement('x-drawer');
  if (opts.label) d.setAttribute('label', opts.label);
  if (opts.placement) d.setAttribute('placement', opts.placement);
  if (opts.width) d.setAttribute('width', opts.width);

  // 快捷用法：只给 title/subtitle，不放 header 子元素 —— 抽屉自动生成带关闭按钮的头部
  if (opts.quick) {
    d.setAttribute('title', opts.title || '');
    if (opts.subtitle) d.setAttribute('subtitle', opts.subtitle);
    const p = document.createElement('p');
    p.setAttribute('style', 'margin:0;color:var(--xie-color-muted);line-height:1.7');
    p.textContent =
      '这里只写了 title / subtitle 两个属性，没有手写 <x-drawer-header>：抽屉自动补出带关闭按钮的头部（title 不设 attribute，故不会冒原生 tooltip）。';
    d.append(box(null, p));
    return d;
  }

  // 头部：独立组件；show-close 决定是否显示关闭按钮，subtitle 自行补第二行
  const header = document.createElement('x-drawer-header');
  if (opts.showClose) header.setAttribute('show-close', '');
  if (opts.subtitle) header.setAttribute('subtitle', opts.subtitle);
  header.textContent = opts.title || opts.label || '';
  d.append(header);

  // 主体：单个包裹元素，抽屉自动让其占中部并滚动、留白
  const p = document.createElement('p');
  p.setAttribute('style', 'margin:0;color:var(--xie-color-muted);line-height:1.7');
  p.textContent =
    '这里是抽屉主体（默认内容）。header / footer 现在是独立子组件 <x-drawer-header> / <x-drawer-footer>，与内容之间没有分隔线；中部内容自动填满剩余高度并可滚动。';
  d.append(box(null, p));

  // 底部：独立组件，右对齐贴底
  if (opts.footer) {
    const footer = document.createElement('x-drawer-footer');
    const cancel = button('取消');
    cancel.addEventListener('click', () => d.hide());
    const ok = button('确定', { variant: 'solid' });
    ok.addEventListener('click', () => d.hide());
    footer.append(cancel, ok);
    d.append(footer);
  }
  return d;
}

export function render(el) {
  const quickDrawer = makeDrawer({ quick: true, title: '快捷抽屉', subtitle: '仅靠 title / subtitle 自动生成头部', label: '快捷抽屉' });
  const quickBtn = button('打开快捷抽屉（只写 title）', { variant: 'soft', color: 'primary' });
  quickBtn.addEventListener('click', () => quickDrawer.show());

  const rightDrawer = makeDrawer({ label: '右侧抽屉示例', title: '通知设置', subtitle: '管理此工作区的提醒方式', showClose: true, footer: true });
  const rightBtn = button('打开右侧抽屉', { variant: 'solid' });
  rightBtn.addEventListener('click', () => rightDrawer.show());

  const leftDrawer = makeDrawer({ label: '左侧抽屉', placement: 'left', width: '320px' });
  const leftBtn = button('打开左侧抽屉（无关闭按钮 · 320px）', { variant: 'outline' });
  leftBtn.addEventListener('click', () => leftDrawer.show());

  const evtLog = h('div', { class: 'demo-card__title' }, '事件：无');
  rightDrawer.addEventListener('x-close', () => {
    evtLog.textContent = '事件：x-close 已触发（' + new Date().toLocaleTimeString() + '）';
  });

  el.append(
    h('h1', null, 'Drawer 抽屉'),
    h('p', { class: 'lead' }, '从视口边缘滑入的浮动面板，自带遮罩、Esc 关闭与滚动锁。两种写法：快捷只给 title / subtitle（抽屉自动生成带关闭按钮的头部），或显式组合 <x-drawer-header> / <x-drawer-footer>（与内容无分隔线，中部内容自动滚动）。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),
    demoCard({
      title: '快捷用法（title / subtitle）',
      desc: '不放 header 子元素时，抽屉自动生成一个 show-close 的 <x-drawer-header>；适合“一句话拉起一个抽屉”的临时场景',
      build: (c) => c.append(quickBtn, quickDrawer),
      code:
        `<x-drawer title="快捷抽屉" subtitle="仅靠 title / subtitle 自动生成头部">\n` +
        `  <div><!-- 主体内容 --></div>\n` +
        `</x-drawer>`,
    }),
    demoCard({
      title: '基础用法（header + footer 子组件）',
      desc: '需要定制头部内容（富标题、标签、图标）或去掉关闭按钮时，回到显式 <x-drawer-header>；此时内部自动头部让位',
      build: (c) => c.append(rightBtn, rightDrawer, evtLog),
      code:
        `<x-drawer label="右侧抽屉示例">\n` +
        `  <x-drawer-header show-close subtitle="管理此工作区的提醒方式">通知设置</x-drawer-header>\n` +
        `  <div><!-- 主体内容 --></div>\n` +
        `  <x-drawer-footer>\n` +
        `    <x-button>取消</x-button>\n` +
        `    <x-button variant="solid">确定</x-button>\n` +
        `  </x-drawer-footer>\n` +
        `</x-drawer>`,
    }),
    demoCard({
      title: '左侧 & 不显示关闭按钮',
      desc: 'placement="left" + width，header 不加 show-close 即无关闭按钮、无 footer',
      build: (c) => c.append(leftBtn, leftDrawer),
      code: `<x-drawer placement="left" width="320px">\n  <x-drawer-header>左侧抽屉</x-drawer-header>\n  <div>内容</div>\n</x-drawer>`,
    }),

    h('h2', null, '配合主题面板'),
    rich('<code>x-theme-panel</code> 即基于本抽屉构建——标题与关闭按钮取自 <code>&lt;x-drawer-header show-close&gt;</code>，底部“恢复默认”取自 <code>&lt;x-drawer-footer&gt;</code>。见左侧「指南 · 主题定制」。'),

    h('h2', null, 'API'),
    h('h3', null, 'x-drawer · 属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['open', '是否展开（反射属性）', 'boolean', 'false'],
        ['placement', '滑入方向', "'left' | 'right'", "'right'"],
        ['width', '面板宽度', 'string (CSS 长度)', "'440px'"],
        ['lock-scroll', '展开时锁定页面滚动', 'boolean', 'true'],
        ['label', '无障碍名称（aria-label：屏幕阅读器朗读抽屉标题，无视觉表现）；留空时回退用 title', 'string', "''"],
        ['title', '快捷头部主标题：无显式 header 时自动生成带头部；属性会被转入 property（不留原生 title attribute，避免浏览器 tooltip 泄漏）', 'string', "''"],
        ['subtitle', '快捷头部副标题（自动头部内以 x-text caption 角色排于主标题下方）', 'string', "''"],
      ],
    ),
    h('h3', null, 'x-drawer-header · 属性'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['show-close', '显示右上角关闭按钮（点击关闭所属抽屉）', 'boolean', 'false'],
        ['subtitle', '主标题下方的次要说明行（复用 <x-text variant="caption">）；留空不渲染', 'string', "''"],
      ],
    ),
    h('h3', null, '结构 Composition'),
    apiTable(
      ['标签', '说明'],
      [
        ['x-drawer-header', '头部：默认插槽放标题；subtitle 放副标题；show-close 控制关闭按钮；与内容无分隔线'],
        ['（普通元素）', '中部主体：作为 x-drawer 直接子元素，自动占据剩余高度并可滚动、留白（建议用单个包裹元素）'],
        ['x-drawer-footer', '底部操作区：内容右对齐、贴底；与内容无分隔线'],
      ],
    ),
    h('h3', null, '方法 Methods（x-drawer）'),
    apiTable(
      ['方法', '说明'],
      [
        ['show()', '打开抽屉'],
        ['hide()', '关闭抽屉（先派发可取消的 x-close）'],
        ['toggle()', '切换'],
      ],
    ),
    h('h3', null, '事件 Events'),
    apiTable(
      ['事件', '说明', 'detail'],
      [['x-close', '遮罩点击 / Esc / header 关闭按钮 / hide() 时派发，cancelable', '无']],
    ),
    h('h3', null, '样式部件 Parts'),
    apiTable(
      ['part', '所属', '说明'],
      [
        ['panel', 'x-drawer', '滑入的面板容器'],
        ['scrim', 'x-drawer', '半透明遮罩'],
        ['header', 'x-drawer', '自动生成的头部（仅快捷用法；可 ::part(header) 微调）'],
        ['title', 'x-drawer-header', '标题文字容器'],
        ['subtitle', 'x-drawer-header', '副标题（x-text）'],
        ['close', 'x-drawer-header', '关闭按钮'],
      ],
    ),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
