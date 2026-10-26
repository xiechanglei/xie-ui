/** Drawer 抽屉文档：右侧/左侧滑入浮层，承载设置、详情等内容 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

function button(label, attrs = {}) {
  const b = document.createElement('x-button');
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, String(v));
  b.textContent = label;
  return b;
}

/** 造一段抽屉内的占位内容 */
function drawerBody(title) {
  const box = h('div', { style: 'padding:24px;display:flex;flex-direction:column;gap:16px;height:100%;box-sizing:border-box' });
  const closeBtn = button('关闭', { variant: 'outline' });
  closeBtn.addEventListener('click', (e) => e.target.closest('x-drawer')?.hide());
  box.append(
    h('h3', { style: 'margin:0;font-size:18px' }, title),
    h('p', { style: 'margin:0;color:var(--xie-color-muted);line-height:1.7' }, '这是一个通用 x-drawer 浮层。遮罩点击或按 Esc 即可关闭；内容通过默认插槽传入，可放设置项、详情、表单等任意结构。'),
    h('div', { style: 'margin-top:auto' }, closeBtn),
  );
  return box;
}

export function render(el) {
  // 右抽屉
  const rightDrawer = document.createElement('x-drawer');
  rightDrawer.setAttribute('label', '右侧抽屉示例');
  rightDrawer.append(drawerBody('从右侧滑入'));
  const rightBtn = button('打开右侧抽屉', { variant: 'solid' });
  rightBtn.addEventListener('click', () => rightDrawer.show());

  // 左抽屉
  const leftDrawer = document.createElement('x-drawer');
  leftDrawer.setAttribute('placement', 'left');
  leftDrawer.setAttribute('width', '320px');
  leftDrawer.setAttribute('label', '左侧抽屉示例');
  leftDrawer.append(drawerBody('从左侧滑入'));
  const leftBtn = button('打开左侧抽屉（320px）', { variant: 'outline' });
  leftBtn.addEventListener('click', () => leftDrawer.show());

  // 关闭事件回显
  const evtLog = h('div', { class: 'demo-card__title' }, '事件：无');
  rightDrawer.addEventListener('x-close', () => {
    evtLog.textContent = '事件：x-close 已触发（' + new Date().toLocaleTimeString() + '）';
  });

  el.append(
    h('h1', null, 'Drawer 抽屉'),
    h('p', { class: 'lead' }, '从视口边缘滑入的浮动面板，自带遮罩、Esc 关闭与滚动锁。常用于设置面板、详情预览、筛选等浮层场景。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),
    demoCard({
      title: '基础用法',
      desc: '默认从右侧滑入，宽 440px',
      build: (c) => c.append(rightBtn, rightDrawer, evtLog),
      code: `<x-button id="open">打开</x-button>\n<x-drawer label="右侧抽屉示例">\n  <!-- 抽屉内容 -->\n</x-drawer>\n<script>\n  open.addEventListener('click', () => drawer.show());\n<\/script>`,
    }),
    demoCard({
      title: '左侧 & 自定义宽度',
      desc: 'placement="left" + width="320px"',
      build: (c) => c.append(leftBtn, leftDrawer),
      code: `<x-drawer placement="left" width="320px">\n  <!-- 内容 -->\n</x-drawer>`,
    }),

    h('h2', null, '配合主题面板'),
    rich('<code>x-theme-panel</code> 即基于本抽屉构建——见左侧「指南 · 主题定制」。通用抽屉 + 专用内容的组合，让浮层的显隐/遮罩/无障碍逻辑复用一处。'),

    h('h2', null, 'API'),
    h('h3', null, '属性 Attributes'),
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
    h('h3', null, '方法 Methods'),
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
      [['x-close', '遮罩点击 / Esc / hide() 时派发，cancelable，阻止默认则不关闭', '无']],
    ),
    h('h3', null, '样式部件 Parts'),
    apiTable(
      ['part', '说明'],
      [
        ['panel', '滑入的面板容器'],
        ['scrim', '半透明遮罩'],
      ],
    ),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
