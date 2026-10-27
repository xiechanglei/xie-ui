/** x-radio 单选框文档：radio/item/group，互斥由 group 维护，form 关联 + 受控事件 */
import { h, demoCard, apiTable } from '/demo/render.js';

function radio(attrs = {}) {
  const el = document.createElement('x-radio');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}
function rItem(attrs = {}) {
  const el = document.createElement('x-radio-item');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}
function rGroup(attrs = {}, children = []) {
  const el = document.createElement('x-radio-group');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  for (const c of children) el.append(c);
  return el;
}

export function render(el) {
  el.append(
    h('h1', null, 'Radio 单选框'),
    h('p', { class: 'lead' }, '与 Checkbox 同源：x-radio 原子件、x-radio-item 带文字、x-radio-group 容器。原生 radio 的同名互斥无法跨自定义元素边界，故互斥交由 group 统一维护；选中值以字符串聚合（区别于 checkbox 的数组）。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础用法',
      desc: 'group 里写一次 name，子项给 value；监听 x-change 读选中的 value',
      build: (c) => {
        const g = rGroup({ name: 'gender' }, [
          rItem({ label: '男', value: 'male', checked: '' }),
          rItem({ label: '女', value: 'female' }),
          rItem({ label: '保密', value: 'secret' }),
        ]);
        const out = h('p', { class: 'lead', style: 'margin:12px 0 0' }, '当前：male');
        g.addEventListener('x-change', (e) => (out.textContent = '当前：' + (e.detail.value || '—')));
        c.append(g, out);
      },
      code: `<x-radio-group name="gender">
  <x-radio-item label="男" value="male" checked></x-radio-item>
  <x-radio-item label="女" value="female"></x-radio-item>
</x-radio-group>`,
    }),

    demoCard({
      title: '横向排布 + 统一下发',
      desc: 'direction=row；group 的 size/color 自动下发给未自写的子项',
      build: (c) => {
        c.append(
          rGroup({ direction: 'row', color: 'danger', size: 'lg' }, [
            rItem({ label: '选项 A', value: 'a', checked: '' }),
            rItem({ label: '选项 B', value: 'b' }),
            rItem({ label: '选项 C', value: 'c' }),
          ]),
        );
      },
      code: `<x-radio-group direction="row" color="danger" size="lg">
  <x-radio-item label="选项 A" value="a" checked></x-radio-item>
</x-radio-group>`,
    }),

    demoCard({
      title: '语义色 color',
      build: (c) => {
        const row = h('div', { style: 'display:flex;gap:16px;flex-wrap:wrap' });
        for (const color of ['primary', 'success', 'warning', 'danger', 'info']) {
          row.append(rItem({ label: color, color, checked: '' }));
        }
        c.append(row);
      },
      code: `<x-radio-item color="success" checked></x-radio-item>`,
    }),

    demoCard({
      title: '原子 x-radio & 禁用',
      build: (c) => {
        const row = h('div', { style: 'display:flex;gap:16px;align-items:center' });
        row.append(radio({ checked: '' }), h('x-text', null, '裸圆点'), rItem({ label: '禁用', disabled: '', checked: '' }));
        c.append(row);
      },
      code: `<x-radio checked></x-radio>
<x-radio-item disabled checked></x-radio-item>`,
    }),

    h('h2', null, 'API · x-radio / x-radio-item'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['checked', '是否选中（反射）', 'boolean', 'false'],
        ['value', '选中时提交/聚合的值', 'string', "''"],
        ['name', '表单名（反射，作为 FormData 键）', 'string', "''"],
        ['label', 'item 的可见文字 / 原子的无障碍名', 'string', "''"],
        ['disabled', '禁用（反射）', 'boolean', 'false'],
        ['required', '必填（走原生校验）', 'boolean', 'false'],
        ['color', '语义色（反射）', "'primary' | … | 'info'", "'primary'"],
        ['size', '尺寸（反射）', "'sm' | 'md' | 'lg'", "'md'"],
      ],
    ),
    h('h3', null, '方法 / 事件'),
    apiTable(
      ['名称', '说明'],
      [
        ['select(force=true)', '选中/取消（force=false 供 group 清空他人）'],
        ['x-change', '用户选中时派发，detail:{ checked, value }，可取消回退'],
      ],
    ),

    h('h2', null, 'API · x-radio-group'),
    apiTable(
      ['属性/成员', '说明', '类型'],
      [
        ['name/disabled/size/color', '条件下沉给未显式设置该属性的子项', '—'],
        ['value', '当前选中项 value（双向：设置可回显）', 'string'],
        ['selectedValue（只读）', '同 value 的只读视图', 'string'],
        ['direction', '子项排布（反射）', "'column' | 'row'"],
        ['gap', '子项间距', 'string'],
        ['clear()', '清空选择', '() => void'],
        ['x-change', '选择变化，detail:{ value, checked }', 'Event'],
      ],
    ),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
