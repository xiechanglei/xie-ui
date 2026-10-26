/** x-icon 内置图标文档：注册表约定 + 组件用法 + API */
import { h, demoCard, apiTable } from '/demo/render.js';

export function render(el) {
  el.append(
    h('h1', null, 'Icon 图标'),
    h('p', { class: 'lead' }, '本 UI 库自用图标的集中出口。x-icon 只渲染已在内部 icons.ts 注册表登记的 SVG，不派生更多图标以保持库体积精简。描边统一使用 currentColor，随文本色与主题联动。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '全部内置图标',
      desc: '当前注册：chevron-right / close / sun / moon（后续组件用到时统一在 icons.ts 追加）',
      build: (c) => {
        const row = h('div');
        row.style.cssText = 'display:flex;gap:24px;align-items:center;color:var(--xie-color-text-1)';
        for (const name of ['chevron-right', 'close', 'sun', 'moon']) {
          row.append(h('x-icon', { name, label: name, size: '24px' }));
        }
        c.append(row);
      },
      code: `<x-icon name="chevron-right" size="24px"></x-icon>
<x-icon name="close" size="24px"></x-icon>
<x-icon name="sun" size="24px"></x-icon>
<x-icon name="moon" size="24px"></x-icon>`,
    }),

    demoCard({
      title: '颜色跟随 currentColor',
      desc: '继承所在文字颜色；放进主题色容器即随主题色',
      build: (c) => {
        const row = h('div');
        row.style.cssText = 'display:flex;gap:20px;align-items:center;font-size:22px';
        for (const color of [
          'var(--xie-color-text-2)',
          'var(--xie-color-primary)',
          'var(--xie-color-success)',
          'var(--xie-color-danger)',
          'var(--xie-color-warning)',
        ]) {
          const s = h('span');
          s.style.color = color;
          s.append(h('x-icon', { name: 'moon', label: 'moon' }));
          row.append(s);
        }
        c.append(row);
      },
      code: `<span style="color:var(--xie-color-primary)">
  <x-icon name="sun"></x-icon>
</span>`,
    }),

    demoCard({
      title: '尺寸（size 属性）',
      desc: 'size 接收任意 CSS 长度；默认 1em 随字号',
      build: (c) => {
        const row = h('div');
        row.style.cssText = 'display:flex;gap:20px;align-items:center';
        for (const size of ['1em', '16px', '24px', '36px']) {
          row.append(h('x-icon', { name: 'sun', size, label: 'sun ' + size }));
        }
        c.append(row);
      },
      code: `<x-icon name="sun" size="1em"></x-icon>   <!-- 随字号 -->
<x-icon name="sun" size="16px"></x-icon>
<x-icon name="sun" size="24px"></x-icon>
<x-icon name="sun" size="36px"></x-icon>`,
    }),

    demoCard({
      title: '内部消费：单一图标源',
      desc: 'x-menu-group 折叠箭头 / x-theme-panel 关闭 & 太阳 & 月亮均改用 <x-icon>，路径不再重复',
      build: (c) => {
        const menu = h('x-menu');
        menu.style.maxWidth = '220px';
        const g = h('x-menu-group', { label: '分组', collapsible: true });
        g.append(h('x-menu-item', { value: 'a' }, '项目 A'), h('x-menu-item', { value: 'b' }, '项目 B'));
        menu.append(g);
        c.append(menu);
      },
      code: `<!-- x-menu-group 模板片段（折叠指示器）： -->
<span class="chevron" part="indicator" aria-hidden="true">
  <x-icon name="chevron-right"></x-icon>
</span>

<!-- x-theme-panel 抽屉头关闭 / 外观模式开关内嵌图标： -->
<x-icon name="close" size="18px"></x-icon>
<x-switch>
  <x-icon slot="off" name="sun"></x-icon>
  <x-icon slot="on" name="moon"></x-icon>
</x-switch>`,
    }),

    h('h2', null, 'API · x-icon'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['name', '注册表中的图标名；未登记渲染为空 svg（不报错）', 'string', "''"],
        ['size', 'CSS 长度，驱动宽高（写入内部 --_icon-size）', 'string', "''（= 1em）"],
        ['label', '无障碍名；留空视为装饰（aria-hidden="true"）', 'string', "''"],
      ],
    ),
    apiTable(
      ['Part', '说明'],
      [['part=svg', '内部 <svg>，供外部覆盖 stroke-width 等']],
    ),

    h('h2', null, '设计约定'),
    h('p', null, '注册表 icons.ts 为内部实现，不作为包公开 API 导出（仅 x-icon 组件是外部出口）。新增图标流程：先在 icons.ts 增加 name → 内部 SVG 条目，再在需要的组件模板里用 <x-icon name>。若某图标只服务于内部组件、外部无需使用，也可只登记不额外暴露。'),
    h('p', null, '统一约定：viewBox 0 0 24 24；fill="none"；stroke="currentColor"；stroke-width 2；stroke-linecap / stroke-linejoin round。所有条目均为单色描边图标，随主题明暗/主色即时联动。'),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
