/** x-logo 品牌标识文档：full（mark+title+subtitle）/ rail（窄栏只显首字母）/ src（图片标） */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

/** 内置示例图（data URI SVG，避免外链网络） */
const DEMO_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%232563eb'/%3E%3Ctext x='20' y='27' font-size='22' font-weight='700' fill='white' text-anchor='middle'%3EX%3C/text%3E%3C/svg%3E";

/** 生成 <x-logo mark= title= subtitle= [rail] [src]> */
function logo({ mark = 'X', title = '', subtitle = '', rail = false, src = '' } = {}) {
  const el = document.createElement('x-logo');
  el.setAttribute('mark', mark);
  if (title) el.setAttribute('title', title);
  if (subtitle) el.setAttribute('subtitle', subtitle);
  if (src) el.setAttribute('src', src);
  if (rail) el.setAttribute('rail', '');
  return el;
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}

export function render(el) {
  el.append(
    h('h1', null, 'Logo 品牌标识'),
    h('p', { class: 'lead' }, '站点 / 侧栏顶部的品牌块：标识方块（mark）+ 名称（title）+ 副标题（subtitle）。mark 底色吃主色令牌随主题联动；rail 窄栏态只显首字母，配合 x-container 侧栏折叠使用。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '完整形态',
      desc: 'mark + title + subtitle',
      build: (c) => c.append(logo({ mark: 'X', title: 'xie-ui', subtitle: 'v0.0.1' })),
      code: `<x-logo mark="X" title="xie-ui" subtitle="v0.0.1"></x-logo>`,
    }),

    demoCard({
      title: '仅名称',
      desc: '省略 subtitle',
      build: (c) => c.append(logo({ mark: 'xie', title: 'xie-ui' })),
      code: `<x-logo mark="xie" title="xie-ui"></x-logo>`,
    }),

    demoCard({
      title: '图片标识 src',
      desc: 'logo 的 mark 复用 x-avatar，src 有值则显品牌图片（无图回退字母）',
      build: (c) => c.append(logo({ src: DEMO_IMG, title: 'xie-ui', subtitle: 'v0.0.1' })),
      code: `<x-logo src="…/logo.png" title="xie-ui" subtitle="v0.0.1"></x-logo>`,
    }),

    demoCard({
      title: '窄栏态 rail',
      desc: '隐藏 title/subtitle，mark 只显示首字母（大写）并居中',
      build: (c) => {
        c.append(logo({ mark: 'xie-ui', title: 'xie-ui', subtitle: 'v0.0.1', rail: true }));
        const hint = h('span', { style: 'font-size:12px;color:var(--xie-color-muted)' }, '← rail=true');
        c.append(hint);
      },
      code: `<x-logo mark="xie-ui" title="xie-ui" subtitle="v0.0.1" rail></x-logo>`,
    }),

    rich('说明：rail 通常<b>不由手写</b>，而由父级 <code>x-container</code> 在侧栏折叠时自动下沉；单独使用时手动加 <code>rail</code> 属性即可预览效果。'),

    h('h2', null, 'API'),
    h('h3', null, '属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['mark', '标识文字（方块内容；rail 时取其首字母）', 'string', "''"],
        ['src', '品牌图片地址（传给内部 x-avatar；留空显字母）', 'string', "''"],
        ['title', '名称', 'string', "''"],
        ['subtitle', '副标题（版本号 / 标语）', 'string', "''"],
        ['rail', '窄栏态：隐藏文字、只显首字母（一般由 x-container 设置）', 'boolean', 'false'],
      ],
    ),
    h('h3', null, 'CSS 部分 Part'),
    apiTable(
      ['part', '说明'],
      [
        ['mark', '标识方块'],
        ['text', '文字容器（title + subtitle）'],
        ['title', '名称文本'],
        ['subtitle', '副标题文本'],
      ],
    ),
  );
}
