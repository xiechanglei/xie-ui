/** Drawer 抽屉文档：header/footer 为独立组件 <x-drawer-header show-close> / <x-drawer-footer>，与内容无分隔线 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

function button(label, attrs = {}) {
  const b = document.createElement('x-button');
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, String(v));
  b.textContent = label;
  return b;
}

/** 用 style 属性安全建元素（render.js 的 h 对 style 键无效） */
function box(style, ...kids) {
  const e = document.createElement('div');
  if (style) e.setAttribute('style', style);
  e.append(...kids);
  return e;
}

function makeDrawer(opts) {
  const d = document.createElement('x-drawer');
  if (opts.label) d.setAttribute('label', opts.label);
  if (opts.placement) d.setAttribute('placement', opts.placement);
  if (opts.width) d.setAttribute('width', opts.width);

  // 头部：独立组件；show-close 决定是否显示关闭按钮
  const header = document.createElement('x-drawer-header');
  if (opts.showClose) header.setAttribute('show-close', '');
  const head = box('display:flex;flex-direction:column;gap:2px',
    box('font-weight:600', opts.title || opts.label || ''),
    ...(opts.subtitle ? [box('font-size:12px;color:var(--xie-color-muted);font-weight:400', opts.subtitle)] : []),
  );
  header.append(head);
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
    h('p', { class: 'lead' }, '从视口边缘滑入的浮动面板，自带遮罩、Esc 关闭与滚动锁。头部与底部分解为独立子组件 <x-drawer-header> / <x-drawer-footer>，与内容之间无分隔线，中部内容自动滚动。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),
    demoCard({
      title: '基础用法（header + footer 子组件）',
      desc: '<x-drawer-header show-close> 带关闭按钮，<x-drawer-footer> 自动贴底',
      build: (c) => c.append(rightBtn, rightDrawer, evtLog),
      code:
        `<x-drawer label="右侧抽屉示例">\n` +
        `  <x-drawer-header show-close>通知设置</x-drawer-header>\n` +
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
        ['label', '无障碍标签（aria-label）', 'string', "''"],
      ],
    ),
    h('h3', null, 'x-drawer-header · 属性'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [['show-close', '显示右上角关闭按钮（点击关闭所属抽屉）', 'boolean', 'false']],
    ),
    h('h3', null, '结构 Composition'),
    apiTable(
      ['标签', '说明'],
      [
        ['x-drawer-header', '头部：默认插槽放标题；show-close 控制关闭按钮；与内容无分隔线'],
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
        ['title', 'x-drawer-header', '标题文字容器'],
        ['close', 'x-drawer-header', '关闭按钮'],
      ],
    ),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
