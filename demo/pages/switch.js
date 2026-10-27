/** x-switch 开关文档：用法示例 + API */
import { h, demoCard, apiTable } from '/demo/render.js';

function sw(attrs = {}, children = []) {
  const s = document.createElement('x-switch');
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, String(v));
  for (const c of children) s.append(c);
  return s;
}

function svg(slot, pathD, extra = '') {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  el.setAttribute('slot', slot);
  el.setAttribute('viewBox', '0 0 24 24');
  el.setAttribute('fill', 'none');
  el.setAttribute('stroke', 'currentColor');
  el.setAttribute('stroke-width', '2');
  el.setAttribute('stroke-linecap', 'round');
  el.setAttribute('stroke-linejoin', 'round');
  if (extra) el.innerHTML = extra;
  else el.innerHTML = pathD;
  return el;
}

const SUN = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>';
const MOON = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path>';

export function render(el) {
  el.append(
    h('h1', null, 'Switch 开关'),
    h('p', { class: 'lead' }, '用于在两种状态（开/关）之间切换的二元控件。基于原生 <code>&lt;button role="switch"&gt;</code>，可键盘聚焦、支持 Space/Enter 切换。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础用法',
      desc: 'checked 为布尔属性，存在即选中；交互切换派发 x-change',
      build: (c) => {
        c.append(
          sw({ label: '开关一' }),
          sw({ label: '开关二（默认开）', checked: '' }),
        );
      },
      code: `<x-switch label="开关一"></x-switch>
<x-switch label="开关二" checked></x-switch>`,
    }),

    demoCard({
      title: '禁用态',
      desc: 'disabled 为布尔属性，存在即禁用',
      build: (c) => {
        c.append(
          sw({ label: '禁用·关', disabled: '' }),
          sw({ label: '禁用·开', disabled: '', checked: '' }),
        );
      },
      code: `<x-switch disabled></x-switch>
<x-switch disabled checked></x-switch>`,
    }),

    demoCard({
      title: '图标插槽（明暗切换）',
      desc: '在滑块内放 slot="on" / slot="off" 图标，随状态自动显隐',
      build: (c) => {
        c.append(
          sw({ label: '深色模式' }, [svg('off', SUN), svg('on', MOON)]),
          sw({ label: '深色模式', checked: '' }, [svg('off', SUN), svg('on', MOON)]),
        );
      },
      code: `<x-switch label="深色模式">
  <svg slot="off" viewBox="0 0 24 24" ...>太阳</svg>
  <svg slot="on" viewBox="0 0 24 24" ...>月亮</svg>
</x-switch>`,
    }),

    demoCard({
      title: '事件监听',
      desc: 'x-change 为 composed 可取消事件，detail 携带最新 checked / value',
      build: (c) => {
        const status = h('span', { class: 'demo-card__title', style: 'margin-left:12px' }, '当前：关');
        const s = sw({ label: '受控示例', value: 'wifi' });
        s.addEventListener('x-change', (e) => {
          status.textContent = `当前：${e.detail.checked ? '开' : '关'}（value=${e.detail.value}）`;
        });
        c.append(s, status);
      },
      code: `const s = document.querySelector('x-switch');
s.addEventListener('x-change', (e) => {
  console.log(e.detail.checked, e.detail.value);
});`,
    }),

    h('h2', null, 'API'),
    h('h3', null, '属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['checked', '是否选中（反射，驱动滑块与配色）', 'boolean', 'false'],
        ['disabled', '是否禁用', 'boolean', 'false'],
        ['label', '无障碍名称（aria-label：屏幕阅读器朗读，无视觉表现）', 'string', "''"],
        ['value', '随事件回传的自定义值', 'string', "'on'"],
      ],
    ),
    h('h3', null, '方法 Methods'),
    apiTable(
      ['方法', '说明'],
      [['toggle(force?)', '切换开关；可传目标态。会派发可取消的 x-change']],
    ),
    h('h3', null, '事件 Events'),
    apiTable(
      ['事件', '说明', 'detail'],
      [
        ['x-change', '用户交互切换时派发（可 preventDefault 取消，程序化设值不触发）', '{ checked: boolean, value: string }'],
      ],
    ),
    h('h3', null, '插槽 Slots'),
    apiTable(
      ['插槽', '说明'],
      [
        ['on', '选中态滑块内图标（checked 时显示）'],
        ['off', '未选中态滑块内图标（未 checked 时显示）'],
      ],
    ),
    h('h3', null, 'CSS 部分 Part'),
    apiTable(
      ['part', '说明'],
      [['base', '内部原生 button'], ['track', '轨道'], ['thumb', '滑块']],
    ),
    h('h3', null, 'CSS 变量 Variables'),
    apiTable(
      ['变量', '说明', '默认'],
      [
        ['--xie-switch-width', '开关宽度', '44px'],
        ['--xie-switch-height', '开关高度（滑块/图标据此换算）', '24px'],
        ['--xie-color-primary', '选中态轨道配色', '—'],
      ],
    ),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
