/** x-icon 内置图标文档：注册表约定 + 组件用法 + API */
import { h, demoCard, apiTable } from '/demo/render.js';
// 直接读内部注册表源文件：画廊与 icons.ts 永远同步（仅文档站自用，不改变“非公开 API”定位）
import { ICONS } from '/src/components/icon/icons.ts';

export function render(el) {
  el.append(
    h('h1', null, 'Icon 图标'),
    h('p', { class: 'lead' }, '本 UI 库自用图标的集中出口。x-icon 只渲染已在内部 icons.ts 注册表登记的 SVG，不派生更多图标以保持库体积精简。描边统一使用 currentColor，随文本色与主题联动。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '全部内置图标',
      desc: `实时读取内部 icons.ts 注册表，当前共 ${Object.keys(ICONS).length} 枚；名称即 name 属性取值，点击格子复制完整用法片段。新增图标在 icons.ts 登记后本页自动同步`,
      build: (c) => {
        const grid = h('div', { class: 'icon-gallery' });
        for (const name of Object.keys(ICONS)) {
          const cell = h('div', { class: 'icon-gallery__cell', title: '点击复制 <x-icon> 用法片段' });
          cell.append(h('x-icon', { name, label: name, size: '22px' }));
          const label = document.createElement('span');
          label.className = 'icon-gallery__name';
          label.textContent = name;
          cell.append(label);
          cell.addEventListener('click', () => copyName(name, label));
          grid.append(cell);
        }
        c.append(grid);
      },
      code: Object.keys(ICONS)
        .map((n) => `<x-icon name="${n}" size="24px"></x-icon>`)
        .join('\n'),
    }),

    demoCard({
      title: '颜色跟随 currentColor',
      desc: '继承所在文字颜色；放进主题色容器即随主题色',
      build: (c) => {
        const row = h('div');
        row.style.cssText = 'display:flex;gap:20px;align-items:center;font-size:22px';
        for (const color of [
          'var(--xie-color-fg)',
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
      desc: 'chevron-right→菜单分组折叠；chevrons-right→容器侧栏折叠钮；close→抽屉关闭；sun/moon→外观开关；user→头像占位。路径均不再重复',
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
</x-switch>

<!-- x-container 侧栏折叠按钮 / x-avatar 无图无字占位： -->
<x-icon name="chevrons-right"></x-icon>
<x-icon name="user"></x-icon>`,
    }),

    h('h2', null, 'API · x-icon'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['name', '注册表中的图标名；未登记渲染为空 svg（不报错）', 'string', "''"],
        ['size', 'CSS 长度，驱动宽高（写入内部 --_icon-size）', 'string', "''（= 1em）"],
        ['label', '无障碍名称（aria-label：屏幕阅读器朗读，无视觉表现）；留空视为装饰（aria-hidden="true"）', 'string', "''"],
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

/** 点击格子复制完整用法片段（非仅图标名），短暂回显状态后还原名称 */
async function copyName(name, labelEl) {
  try {
    await navigator.clipboard.writeText(`<x-icon name="${name}"></x-icon>`);
    labelEl.textContent = '片段已复制 ✓';
  } catch {
    labelEl.textContent = '复制失败';
  }
  setTimeout(() => {
    labelEl.textContent = name;
  }, 1000);
}
