/** 主题定制指南：令牌分层、全局切换原理、x-theme-panel 用法 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

function button(label, attrs = {}) {
  const b = document.createElement('x-button');
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, String(v));
  b.textContent = label;
  return b;
}

export function render(el) {
  el.append(
    h('h1', null, '主题定制'),
    h('p', { class: 'lead' }, '字体大小、控件尺寸、圆角（直角/圆角）、颜色、阴影等可全局定义与切换的风格维度，都由设计令牌（CSS 自定义属性）驱动。'),

    h('h2', null, '原理：为什么改一次就全站联动'),
    rich('所有组件通过 <code>var(--xie-*)</code> 读取令牌，而自定义属性可<strong>穿透 Shadow DOM 边界继承</strong>。因此改写 <code>:root</code> 上的令牌，页面上所有组件会<strong>立即</strong>跟随，无需任何 JS 逐个通知或重渲染。'),
    rich('令牌分三层：<strong>primitive</strong>（原始调色板）→ <strong>knob 旋钮</strong>（6 个强调色 primary/secondary/success/warning/danger/info + 圆角/尺寸/字号/阴影强度）→ <strong>derived 派生</strong>（经 <code>calc</code>/<code>color-mix</code> 自动算出的语义令牌，组件消费这一层）。'),

    h('h2', null, '实时演示'),
    rich('面板以<b>右侧滑入抽屉</b>形式呈现（内嵌通用组件 <code>x-drawer</code>）。点下面的按钮唤出，调整任一维度都会改写 <code>:root</code> 令牌，本页所有示例（含整个文档站）实时变化；配置会<strong>自动记在 localStorage</strong>，刷新后仍保持。'),
    demoCard({
      title: '可视化配置抽屉',
      desc: 'x-theme-panel：点按钮从右侧滑入，选择即写入全局令牌',
      build: (c) => {
        const panel = document.createElement('x-theme-panel');
        const openBtn = button('打开主题设置', { variant: 'solid' });
        openBtn.addEventListener('click', () => panel.show());
        const stage = h(
          'div',
          { style: 'display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:16px' },
          button('Solid', { variant: 'solid' }),
          button('Outline', { variant: 'outline' }),
          button('Soft Info', { variant: 'soft', color: 'info' }),
          button('Danger', { color: 'danger' }),
          button('Success', { color: 'success' }),
          button('Ghost Warning', { variant: 'ghost', color: 'warning' }),
          button('Loading', { variant: 'solid', loading: '' }),
        );
        const box = h('div', { style: 'margin-top:16px;padding:16px;border-radius:var(--xie-radius-lg);border:1px solid var(--xie-color-border);background:var(--xie-color-surface);box-shadow:var(--xie-shadow-2);color:var(--xie-color-fg);max-width:320px' }, '一个跟随圆角/阴影/配色的容器');
        const status = h('div', { class: 'demo-card__title', style: 'margin-top:12px' }, '当前配置：默认');
        panel.addEventListener('x-theme-change', (e) => {
          status.textContent = '当前配置：' + JSON.stringify(e.detail);
        });
        c.append(openBtn, stage, box, status, panel);
      },
      code: `<x-button onclick="panel.show()">打开主题设置</x-button>\n<x-theme-panel></x-theme-panel>\n\n// 也可用属性直接默认展开：<x-theme-panel open></x-theme-panel>`,
    }),

    h('h2', null, '两种切换方式'),
    h('h3', null, '1. 预设档位（纯 CSS，零 JS）'),
    rich('在 <code>&lt;html&gt;</code> 上设置 data 属性即可，各维度正交、互不干扰：'),
    codeBlock(`<html data-xie-theme="dark" data-xie-radius="none" data-xie-size="compact" data-xie-shadow="strong">`),

    h('h3', null, '2. 任意值（直接覆盖旋钮）'),
    rich('取色器、自定义 px 等，直接改旋钮令牌，派生层自动重算：'),
    codeBlock(`document.documentElement.style.setProperty('--xie-primary', '#8b5cf6');\ndocument.documentElement.style.setProperty('--xie-radius', '10px');`),

    h('h2', null, 'API · x-theme-panel'),
    h('h3', null, '属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['open', '抽屉是否展开（反射属性）', 'boolean', 'false'],
        ['theme', '明暗主题', "'light' | 'dark'", "'light'"],
        ['primary', '主色（空=跟随令牌默认）', 'string (色值)', "''"],
        ['secondary', '次要色', 'string (色值)', "''"],
        ['success', '成功色', 'string (色值)', "''"],
        ['warning', '警告色', 'string (色值)', "''"],
        ['danger', '危险色', 'string (色值)', "''"],
        ['info', '信息色', 'string (色值)', "''"],
        ['radius', '圆角档位', "'none' | 'sm' | 'md' | 'lg' | 'full'", "'md'"],
        ['size', '控件尺寸档位', "'compact' | 'default' | 'comfortable'", "'default'"],
        ['shadow', '阴影强度档位', "'none' | 'soft' | 'strong'", "'soft'"],
      ],
    ),
    h('h3', null, '方法 Methods'),
    apiTable(
      ['方法', '说明'],
      [
        ['show()', '展开抽屉'],
        ['hide()', '收起抽屉'],
        ['toggle()', '切换展开/收起'],
      ],
    ),
    h('h3', null, '事件 Events'),
    apiTable(
      ['事件', '说明', 'detail'],
      [
        ['x-theme-change', '任一配置项变化时派发（composed，可冒泡）', '{ theme, primary, secondary, success, warning, danger, info, radius, size, shadow }'],
      ],
    ),

    h('h2', null, '可覆盖的旋钮令牌'),
    apiTable(
      ['令牌', '说明', '影响'],
      [
        ['--xie-primary', '主色基准', '按钮/选中态背景；hover/active/soft 自动派生，前景色按亮度自动取黑/白'],
        ['--xie-secondary', '次要色基准', 'secondary 按钮'],
        ['--xie-success', '成功色基准', 'success 按钮'],
        ['--xie-warning', '警告色基准', 'warning 按钮'],
        ['--xie-danger', '危险色基准', 'danger 按钮'],
        ['--xie-info', '信息色基准', 'info 按钮'],
        ['--xie-radius', '圆角基准（0=直角）', '所有圆角 sm/md/lg'],
        ['--xie-control-height', '控件高度基准', '组件 sm/md/lg 尺寸'],
        ['--xie-font-size', '字号基准', '文本 sm/md/lg'],
        ['--xie-shadow-strength', '阴影强度 0~2', '阴影 1/2/3 档'],
      ],
    ),
  );
}

function codeBlock(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
