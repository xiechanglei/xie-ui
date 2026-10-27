/** x-select 选择器文档：包原生 select（弹层/键盘白送），options 数组或 light DOM option 两种来源 */
import { h, demoCard, apiTable } from '/demo/render.js';

function mkSelect(attrs = {}) {
  const el = document.createElement('x-select');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}
function opt(value, label, selected) {
  const o = document.createElement('option');
  o.value = value;
  o.textContent = label;
  if (selected) o.selected = true;
  return o;
}

export function render(el) {
  el.append(
    h('h1', null, 'Select 选择器'),
    h('p', { class: 'lead' }, '包一个原生 select：展开弹层、方向键导航、移动端滚轮、无障碍全部由浏览器白送，本库只绘制外框与 chevron。选项来源二选一（数组优先）——light DOM 里写原生 <option>，或 JS 设 options 数组。未选中时显示 placeholder；支持 form 关联（FCCE）。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础用法（light DOM option）',
      desc: '直接写原生 <option>；placeholder 作未选占位',
      build: (c) => {
        const s = mkSelect({ placeholder: '请选择城市', style: 'width:200px' });
        s.append(opt('bj', '北京'), opt('sh', '上海'), opt('gz', '广州'));
        c.append(s);
      },
      code: `<x-select placeholder="请选择城市">
  <option value="bj">北京</option>
  <option value="sh">上海</option>
</x-select>`,
    }),

    demoCard({
      title: 'options 数组',
      desc: 'JS 传 { value, label, disabled } 数组，适合动态数据',
      build: (c) => {
        const s = mkSelect({ placeholder: '挑一个框架', style: 'width:220px' });
        s.options = [
          { value: 'vue', label: 'Vue' },
          { value: 'react', label: 'React' },
          { value: 'svelte', label: 'Svelte', disabled: true },
          '原生字符串项',
        ];
        c.append(s);
      },
      code: `select.options = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  '原生字符串项',
];`,
    }),

    demoCard({
      title: '受控默认值 & 事件',
      desc: '设 value 回显；变化派发可取消的 x-change（含 other 被拒绝回退）',
      build: (c) => {
        const out = h('p', { class: 'demo-card__title' }, 'x-change：—');
        const s = mkSelect({ value: 'sh', style: 'width:180px' });
        s.options = ['北京', '上海', '广州', 'other'];
        s.addEventListener('x-change', (e) => {
          if (e.detail.value === 'other') {
            e.preventDefault();
            out.textContent = 'x-change 被取消，回到「' + e.detail.previousValue + '」';
          } else {
            out.textContent = 'x-change：' + e.detail.value;
          }
        });
        c.append(s, out);
      },
      code: `<x-select value="sh"></x-select>
select.addEventListener('x-change', (e) => {
  if (e.detail.value === 'other') e.preventDefault(); // 拒绝 → 回退
});`,
    }),

    demoCard({
      title: '形态 variant & 尺寸 size',
      build: (c) => {
        const row = h('div', { style: 'display:flex;gap:12px;flex-wrap:wrap;align-items:center' });
        for (const variant of ['outline', 'filled', 'flush']) {
          const s = mkSelect({ variant, placeholder: variant, style: 'width:140px' });
          s.options = ['A', 'B'];
          row.append(s);
        }
        const sz = mkSelect({ size: 'sm', placeholder: 'sm', style: 'width:120px' });
        sz.options = ['A'];
        const lg = mkSelect({ size: 'lg', placeholder: 'lg', style: 'width:120px' });
        lg.options = ['A'];
        row.append(sz, lg);
        c.append(row);
      },
      code: `<x-select variant="filled" size="lg"></x-select>`,
    }),

    demoCard({
      title: '语义色 color & 状态',
      build: (c) => {
        const row = h('div', { style: 'display:flex;gap:12px;flex-wrap:wrap;align-items:center' });
        for (const color of ['primary', 'success', 'danger']) {
          const s = mkSelect({ color, placeholder: color, style: 'width:120px' });
          s.options = ['A', 'B'];
          row.append(s);
        }
        const dis = mkSelect({ disabled: '', placeholder: '禁用', style: 'width:120px' });
        dis.options = ['A'];
        row.append(dis);
        c.append(row);
      },
      code: `<x-select color="success"></x-select>
<x-select disabled></x-select>`,
    }),

    h('h2', null, 'API'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['value', '选中值（反射无关；程序化赋值回显，不派发事件）', 'string', "''"],
        ['options', '选项数组（JS 设置；优先于 light DOM option）', '({value,label,disabled}|string)[]', 'undefined'],
        ['placeholder', '未选占位（渲染为 disabled+hidden 空值项）', 'string', "''"],
        ['name', '表单名（反射，FormData 键）', 'string', "''"],
        ['variant', '形态（反射）', "'outline' | 'filled' | 'flush'", "'outline'"],
        ['color', '语义色（反射，聚焦描边）', "'primary' | … | 'info'", "'primary'"],
        ['size', '尺寸（反射）', "'sm' | 'md' | 'lg'", "'md'"],
        ['disabled / required / label', '禁用 / 必填校验 / 无障碍名', '—', '—'],
      ],
    ),
    h('h3', null, '方法 / 事件'),
    apiTable(
      ['名称', '说明'],
      [
        ['focus()', '委托内部原生 select'],
        ['x-change', '选择变化派发，detail:{ value, previousValue }，可取消回退'],
      ],
    ),
    h('h3', null, '选项来源'),
    apiTable(
      ['方式', '说明'],
      [
        ['light DOM <option>', '写原生 <option value=..>文本</option>，或 <x-select-option value label>'],
        ['options 数组', '元素可为字符串或 { value, label, disabled }；设置后覆盖 slot 来源'],
      ],
    ),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
