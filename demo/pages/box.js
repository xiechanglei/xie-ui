/** Box 通用容器文档：视觉表面件——variant×color 双轴、full/fit 宽度、padding/radius/shadow、hoverable */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

function box(attrs, ...children) {
  const b = document.createElement('x-box');
  for (const [k, v] of Object.entries(attrs || {})) b.setAttribute(k, String(v));
  b.append(...children);
  return b;
}

function text(str) {
  return document.createTextNode(str);
}

export function render(el) {
  /* —— 1. 形态四式 —— */
  const variants = h(
    'x-flex',
    { gap: 'md', wrap: true },
    box({}, h('strong', null, 'Solid'), h('p', { style: 'margin:6px 0 0' }, '缺省即中性卡面：surface 底 + 正文色，随主题翻转')),
    box({ variant: 'soft' }, h('strong', null, 'Soft'), h('p', { style: 'margin:6px 0 0' }, '淡色底，适合次级分区')),
    box({ variant: 'outline' }, h('strong', null, 'Outline'), h('p', { style: 'margin:6px 0 0' }, '透明底 + 描边，经典线框卡')),
    box({ variant: 'ghost' }, h('strong', null, 'Ghost'), h('p', { style: 'margin:6px 0 0' }, '全透明，只保留内边距与圆角')),
  );
  variants.style.flex = '1 1 100%';

  /* —— 2. 颜色轴 —— */
  const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'];
  const colorRow = h(
    'x-flex',
    { gap: 'sm', wrap: true, align: 'center' },
    ...colors.map((c) => box({ color: c, width: 'fit', padding: 'sm' }, text(c))),
  );
  const softRow = h(
    'x-flex',
    { gap: 'sm', wrap: true, align: 'center' },
    ...colors.map((c) => box({ color: c, variant: 'soft', width: 'fit', padding: 'sm' }, text(c + ' soft'))),
  );

  /* —— 3. 宽度：full vs fit —— */
  const widthWrap = h(
    'x-flex',
    { direction: 'column', gap: 'md' },
    box({}, text('width="full"（缺省）：block 横向充满父元素')),
    box({ width: 'fit' }, text('width="fit"：只包住子元素')),
  );

  /* —— 4. padding / radius / shadow —— */
  const padRow = h(
    'x-flex',
    { gap: 'sm', wrap: true, align: 'center' },
    box({ padding: 'none', variant: 'outline', width: 'fit' }, text('none')),
    box({ padding: 'xs', variant: 'outline', width: 'fit' }, text('xs')),
    box({ padding: 'sm', variant: 'outline', width: 'fit' }, text('sm')),
    box({ padding: 'md', variant: 'outline', width: 'fit' }, text('md')),
    box({ padding: 'lg', variant: 'outline', width: 'fit' }, text('lg（默认）')),
    box({ padding: '28px', variant: 'outline', width: 'fit' }, text('28px 任意长度')),
  );
  const radRow = h(
    'x-flex',
    { gap: 'sm', wrap: true, align: 'center' },
    box({ radius: 'none', color: 'primary', width: 'fit', padding: 'sm' }, text('none')),
    box({ radius: 'sm', color: 'primary', width: 'fit', padding: 'sm' }, text('sm')),
    box({ radius: 'md', color: 'primary', width: 'fit', padding: 'sm' }, text('md（默认）')),
    box({ radius: 'lg', color: 'primary', width: 'fit', padding: 'sm' }, text('lg')),
    box({ radius: 'full', color: 'primary', width: 'fit', padding: 'sm' }, text('full 胶囊')),
  );
  const shadowRow = h(
    'x-flex',
    { gap: 'lg', wrap: true, align: 'center' },
    box({ shadow: 'none', width: 'fit', padding: 'sm', variant: 'outline' }, text('none')),
    box({ shadow: 'sm', width: 'fit', padding: 'sm' }, text('sm')),
    box({ shadow: 'md', width: 'fit', padding: 'sm' }, text('md')),
    box({ shadow: 'lg', width: 'fit', padding: 'sm' }, text('lg')),
  );

  /* —— 5. hoverable —— */
  const hoverWrap = h(
    'x-flex',
    { gap: 'md', wrap: true },
    box({ hoverable: true, shadow: 'sm', width: 'fit', padding: 'md' }, h('strong', null, '悬停我'), h('p', { style: 'margin:6px 0 0' }, '阴影升档 + 微浮起，可点暗示')),
    box({ hoverable: true, variant: 'outline', color: 'primary', width: 'fit', padding: 'md' }, text('outline + hoverable')),
  );

  /* —— 6. 组合卡：box 出面、flex 排布、text 排版 —— */
  const combo = box({ shadow: 'md', padding: 'xl' },
    h('x-flex', { align: 'center', gap: 'sm' },
      h('x-avatar', { initials: '张' }),
      h('x-flex', { direction: 'column', gap: 'xs' },
        h('x-text', { variant: 'title' }, '张三'),
        h('x-text', { variant: 'caption' }, '前端工程师 · 在线'),
      ),
      h('x-flex', { style: 'margin-left:auto;gap:8px' },
        h('x-button', { size: 'sm', variant: 'outline', color: 'default' }, '发消息'),
        h('x-button', { size: 'sm' }, '关注'),
      ),
    ),
  );
  combo.style.flex = '1 1 100%';

  el.append(
    h('h1', null, 'Box 通用容器'),
    h(
      'p',
      { class: 'lead' },
      '一块「有外观的面」：背景、描边、圆角、内边距、阴影。外观沿用 Button 的双轴范式（variant × color 正交），横向可选充满父元素或只包住子元素。它不管内部怎么排（交给 x-flex）、不当页面骨架（交给 x-container），只负责把内容包成一张卡。',
    ),

    h('h2', null, '引入'),
    h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, `import '@xie-work/xie-ui';`)))),

    h('h2', null, '代码演示'),
    demoCard({
      title: '形态 variant',
      desc: 'solid（默认实底色面）/ soft（淡底）/ outline（描边）/ ghost（全透明只留间距），缺省即中性卡片',
      build: (c) => c.append(variants),
      code: `<x-box>Solid 中性卡面</x-box>
<x-box variant="soft">Soft 淡底</x-box>
<x-box variant="outline">Outline 描边</x-box>
<x-box variant="ghost">Ghost 透明</x-box>`,
    }),
    demoCard({
      title: '语义色 color',
      desc: 'default（缺省中性）+ 6 强调角色，与形态正交；solid 面自动配反色文字，soft/outline 卡内文字保持正文色',
      build: (c) => c.append(h('x-flex', { direction: 'column', gap: 'md' }, colorRow, softRow)),
      code: `<x-box color="primary">实底蓝面（白字）</x-box>
<x-box color="success" variant="soft">绿色淡底（正文色）</x-box>
<x-box color="danger" variant="outline">红色描边卡</x-box>`,
    }),
    demoCard({
      title: '宽度：充满 / 包住内容',
      desc: 'width="full"（默认）block 横向充满父元素；width="fit" 只包住子元素',
      build: (c) => c.append(widthWrap),
      code: `<x-box>我横向充满父元素（默认 full）</x-box>
<x-box width="fit">我只包住子元素</x-box>`,
    }),
    demoCard({
      title: '内边距 / 圆角 / 阴影',
      desc: 'padding、radius 吃令牌别名或任意 CSS 长度；shadow 三档吃全局阴影令牌（强度旋钮/主题联动）',
      build: (c) => c.append(h('x-flex', { direction: 'column', gap: 'md' }, padRow, radRow, shadowRow)),
      code: `<x-box padding="none">padding 别名 none|xs|sm|md|lg|xl 或 "28px"</x-box>
<x-box radius="full">胶囊面</x-box>
<x-box shadow="md">二级阴影</x-box>`,
    }),
    demoCard({
      title: '可点暗示 hoverable',
      desc: '悬停浮起（阴影升档 + 微位移）并置 cursor:pointer；只给视觉，点击语义/键盘可达仍由消费者自理',
      build: (c) => c.append(hoverWrap),
      code: `<x-box hoverable shadow="sm">
  <strong>悬停我</strong>
</x-box>`,
    }),
    demoCard({
      title: '组合：面 + 排布 + 排版',
      desc: '典型分工：x-box 出面，x-flex 排布，x-text/x-avatar/x-button 填内容',
      build: (c) => c.append(combo),
      code: `<x-box shadow="md" padding="xl">
  <x-flex align="center" gap="sm">
    <x-avatar initials="张"></x-avatar>
    <x-flex direction="column" gap="xs">
      <x-text variant="title">张三</x-text>
      <x-text variant="caption">前端工程师 · 在线</x-text>
    </x-flex>
    <x-button size="sm" style="margin-left:auto">关注</x-button>
  </x-flex>
</x-box>`,
    }),

    h('h2', null, '与其它布局件的边界'),
    rich(
      '<code>x-box</code> 只管<b>面</b>（背景/描边/圆角/间距/阴影），内部要弹性排布用 <code>x-flex</code> 套在 slot 里；页面级骨架（侧栏/头部）用 <code>x-container</code>。需要整张卡可点击时 <code>hoverable</code> 只给视觉暗示——语义上请再包一层 <code>&lt;a&gt;</code> 或自行绑事件补 <code>tabindex</code>，组件不接管点击。',
    ),

    h('h2', null, 'API'),
    h('h3', null, 'x-box · 属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['variant', '形态（填充样式，反射）', "'solid' | 'outline' | 'soft' | 'ghost'", "'solid'"],
        ['color', '语义色（与形态正交，反射）；default 为中性卡面', "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'", "'default'"],
        ['width', '横向尺寸（反射）：full 充满父元素 / fit 只包住子元素', "'full' | 'fit'", "'full'"],
        ['padding', '内边距：令牌别名或任意 CSS 长度', "'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | <length>", "'lg'（16px）"],
        ['radius', '圆角：别名或任意长度；默认吃 --xie-radius 旋钮，随主题面板联动', "'none' | 'sm' | 'md' | 'lg' | 'full' | <length>", "'md'"],
        ['shadow', '阴影档位（反射），吃全局阴影令牌', "'none' | 'sm' | 'md' | 'lg'", "'none'"],
        ['hoverable', '可点暗示：cursor:pointer + 悬停浮起（反射）', 'boolean', 'false'],
      ],
    ),
    h('h3', null, 'Slots'),
    apiTable(
      ['插槽', '说明'],
      [['default', '任意内容（文字、组件、x-flex 排布…）']],
    ),
    h('h3', null, '设计要点'),
    rich(
      '外观全部落在宿主元素本身（shadow 里只有一个 slot），所以消费者直接 <code>x-box {{...}}</code> 就能覆写，无需 part 穿透；组件不会往你的内容里塞任何 DOM。描边恒占 1px（不显描边的形态置 transparent），variant 切换不跳尺寸。',
    ),
  );
}
