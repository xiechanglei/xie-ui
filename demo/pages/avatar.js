/** x-avatar 头像文档：图片 / 文字 / 姓名首字 / 占位、shape / size / color、加载失败回退 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

/** 内置占位图（data URI SVG，避免外链网络） */
const DEMO_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%236366f1'/%3E%3Ccircle cx='20' cy='15' r='7' fill='white'/%3E%3Cpath d='M6 38a14 14 0 0 1 28 0' fill='white'/%3E%3C/svg%3E";

/** 生成 <x-avatar ...> */
function avatar({ src = '', alt = '', text = '', name = '', size = '', shape = '', color = '' } = {}) {
  const el = document.createElement('x-avatar');
  if (src) el.setAttribute('src', src);
  if (alt) el.setAttribute('alt', alt);
  if (text) el.setAttribute('text', text);
  if (name) el.setAttribute('name', name);
  if (size) el.setAttribute('size', size);
  if (shape) el.setAttribute('shape', shape);
  if (color) el.setAttribute('color', color);
  return el;
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}

export function render(el) {
  el.append(
    h('h1', null, 'Avatar 头像'),
    h('p', { class: 'lead' }, '定尺寸、可圆角、带底色的头像方块。内容回退链：图片（src）> 文字（text）> 姓名首字（name）> 占位图标。底色/文字吃角色令牌，随主题实时联动。logo 的标识方块即复用本组件。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '图片头像',
      desc: 'src 有值且加载成功则显示图片（object-fit:cover）',
      build: (c) => c.append(avatar({ src: DEMO_IMG, alt: '示例头像' })),
      code: `<x-avatar src="…/avatar.png" alt="示例头像"></x-avatar>`,
    }),

    demoCard({
      title: '文字 / 姓名首字',
      desc: '无图时显 text；仅有 name 时自动取第一个字（同 logo）',
      build: (c) => {
        c.append(avatar({ text: 'AB', color: 'primary' }));
        c.append(avatar({ name: 'Ada Lovelace', color: 'success' }));
        c.append(avatar({ name: 'Linus Torvalds' }));
      },
      code: `<x-avatar text="AB" color="primary"></x-avatar>
<x-avatar name="Ada Lovelace" color="success"></x-avatar>
<x-avatar name="Linus Torvalds"></x-avatar>`,
    }),

    demoCard({
      title: '占位图标',
      desc: '既无图又无文字/name 时显示内置 user 占位',
      build: (c) => c.append(avatar({ color: 'secondary' })),
      code: `<x-avatar color="secondary"></x-avatar>`,
    }),

    demoCard({
      title: '加载失败回退',
      desc: 'src 加载失败自动回退到文字，保证不出现破图',
      build: (c) => c.append(avatar({ src: '/no-such-image.png', text: 'ZP', color: 'danger' })),
      code: `<x-avatar src="/no-such-image.png" text="ZP" color="danger"></x-avatar>`,
    }),

    demoCard({
      title: '形状 shape',
      desc: 'default（不写即是，跟随主题面板全局圆角档位）/ circle / rounded / square',
      build: (c) => {
        c.append(avatar({ text: '随', color: 'primary' }));
        c.append(avatar({ text: '圆', color: 'primary', shape: 'circle' }));
        c.append(avatar({ text: '角', color: 'warning', shape: 'rounded' }));
        c.append(avatar({ text: '方', color: 'info', shape: 'square' }));
      },
      code: `<x-avatar text="随"></x-avatar><!-- default：吃 --xie-radius-md，随全局圆角联动 -->
<x-avatar text="圆" shape="circle"></x-avatar>
<x-avatar text="角" shape="rounded" color="warning"></x-avatar>
<x-avatar text="方" shape="square" color="info"></x-avatar>`,
    }),

    demoCard({
      title: '尺寸 size',
      desc: '令牌 sm / md（默认）/ lg 或任意长度（如 56px）',
      build: (c) => {
        c.style.alignItems = 'center';
        c.append(avatar({ text: 'S', size: 'sm', color: 'primary' }));
        c.append(avatar({ text: 'M', size: 'md', color: 'primary' }));
        c.append(avatar({ text: 'L', size: 'lg', color: 'primary' }));
        c.append(avatar({ text: 'XL', size: '56px', color: 'primary' }));
      },
      code: `<x-avatar size="sm"></x-avatar>
<x-avatar size="md"></x-avatar>
<x-avatar size="lg"></x-avatar>
<x-avatar size="56px"></x-avatar>`,
    }),

    demoCard({
      title: '配色角色 color',
      desc: '文字态底色吃 --xie-color-{role}/-fg 令牌',
      build: (c) => {
        for (const role of ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info']) {
          c.append(avatar({ text: role[0].toUpperCase(), color: role }));
        }
      },
      code: `<x-avatar color="primary">…</x-avatar>
<!-- default | primary | secondary | success | warning | danger | info -->`,
    }),

    rich('提示：图片加载失败、或 src 为空时，会依次回退到 <code>text</code> → <code>name</code> 首字母 → 占位图标；深浅色与主色切换时底色/字色自动联动。'),

    h('h2', null, 'API'),
    h('h3', null, '属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['src', '图片地址（有且加载成功则显示图片）', 'string', "''"],
        ['alt', '图片无障碍名', 'string', "''"],
        ['text', '无图时显示的文字（首字母 / emoji）', 'string', "''"],
        ['name', 'text 为空时从姓名取第一个字（大写）', 'string', "''"],
        ['size', "尺寸：令牌别名或 CSS 长度", "'sm' | 'md' | 'lg' | <长度>", "'md'"],
        ['shape', "形状：default 跟随全局圆角档位（吃 --xie-radius-md）", "'default' | 'circle' | 'rounded' | 'square'", "'default'"],
        ['color', '文字态底色角色（default 为中性缺省态，非强调角色）', "'default' | 'primary' | … | 'info'", "'default'"],
      ],
    ),
    h('h3', null, 'CSS 部分 Part'),
    apiTable(
      ['part', '说明'],
      [
        ['base', '内部包裹盒（display:contents 定制钩子）'],
        ['image', '图片元素'],
        ['text', '文字元素'],
        ['placeholder', '占位图标（x-icon）'],
      ],
    ),
  );
}
