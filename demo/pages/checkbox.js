/** x-checkbox 复选框文档：原子 / 带文字项 / 容器三段式，shape×color 双轴，form 关联 + 受控事件 */
import { h, demoCard, apiTable } from '/demo/render.js';

function cb(attrs = {}, children = []) {
  const el = document.createElement('x-checkbox');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  for (const c of children) el.append(c);
  return el;
}
function makeItem(attrs = {}) {
  const el = document.createElement('x-checkbox-item');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}
function group(attrs = {}, children = []) {
  const el = document.createElement('x-checkbox-group');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  for (const c of children) el.append(c);
  return el;
}

export function render(el) {
  el.append(
    h('h1', null, 'Checkbox 复选框'),
    h('p', { class: 'lead' }, '三段式：x-checkbox 是纯方框原子件，x-checkbox-item 附带文字标签（点整行即切换），x-checkbox-group 作容器统一下发公共属性、聚合选择结果并可做数量约束。内部包原生 input，键盘/无障碍/勾选态全部白送；首个支持 form 关联（FCCE）的组件。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础用法',
      desc: '带文字项用 label 属性；checked 反射，程序化赋值不派发事件',
      build: (c) => {
        c.append(makeItem({ label: '同意协议' }), makeItem({ label: '默认勾选', checked: '' }));
      },
      code: `<x-checkbox-item label="同意协议"></x-checkbox-item>
<x-checkbox-item label="默认勾选" checked></x-checkbox-item>`,
    }),

    demoCard({
      title: '原子 x-checkbox',
      desc: '只要方框、文字自己排；也可单独用 indeterminate 三方态',
      build: (c) => {
        const row = h('div', { style: 'display:flex;gap:16px;align-items:center' });
        row.append(cb({}), h('x-text', null, '裸方框'));
        row.append(cb({ indeterminate: '' }), h('x-text', null, '三方态'));
        c.append(row);
      },
      code: `<x-checkbox></x-checkbox>
<x-checkbox indeterminate></x-checkbox>`,
    }),

    demoCard({
      title: '容器 group',
      desc: '公共 size/color/name 写一次；监听 x-change 读聚合 value 数组',
      build: (c) => {
        const g = group({ name: 'fruit', color: 'success' }, [
          makeItem({ label: '苹果', value: 'apple', checked: '' }),
          makeItem({ label: '香蕉', value: 'banana' }),
          makeItem({ label: '橙子', value: 'orange' }),
        ]);
        const out = h('p', { class: 'lead', style: 'margin:12px 0 0' }, '已选：—');
        g.addEventListener('x-change', (e) => (out.textContent = '已选：' + (e.detail.value.join('、') || '—')));
        c.append(g, out);
      },
      code: `<x-checkbox-group name="fruit" color="success">
  <x-checkbox-item label="苹果" value="apple" checked></x-checkbox-item>
  <x-checkbox-item label="香蕉" value="banana"></x-checkbox-item>
</x-checkbox-group>`,
    }),

    demoCard({
      title: '数量约束 min / max',
      desc: '借子项 x-change 的可取消语义，越界直接挡下这次切换',
      build: (c) => {
        c.append(
          group({ min: '1', max: '2' }, [
            makeItem({ label: '最多选 2 个', value: 'a' }),
            makeItem({ label: '尝试第 3 个', value: 'b' }),
            makeItem({ label: '再多', value: 'c' }),
          ]),
        );
      },
      code: `<x-checkbox-group min="1" max="2">
  <x-checkbox-item label="选项" value="a"></x-checkbox-item>
</x-checkbox-group>`,
    }),

    demoCard({
      title: '形态 shape × 语义色 color',
      desc: 'shape: square/rounded(默认)/circle；color 决定选中底色',
      build: (c) => {
        for (const shape of ['square', 'rounded', 'circle']) {
          c.append(makeItem({ label: shape, shape, checked: '', color: 'primary' }));
        }
        const row = h('div', { style: 'display:flex;gap:16px;flex-wrap:wrap;margin-top:8px' });
        for (const color of ['primary', 'success', 'warning', 'danger', 'info']) {
          row.append(makeItem({ label: color, color, checked: '' }));
        }
        c.append(row);
      },
      code: `<x-checkbox-item shape="circle" color="success" checked></x-checkbox-item>`,
    }),

    demoCard({
      title: '尺寸 & 禁用',
      build: (c) => {
        c.append(
          makeItem({ label: 'sm', size: 'sm', checked: '' }),
          makeItem({ label: 'md', size: 'md', checked: '' }),
          makeItem({ label: 'lg', size: 'lg', checked: '' }),
          makeItem({ label: '禁用', disabled: '', checked: '' }),
        );
      },
      code: `<x-checkbox-item size="lg" checked></x-checkbox-item>
<x-checkbox-item disabled checked></x-checkbox-item>`,
    }),

    h('h2', null, 'API · x-checkbox / x-checkbox-item'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['checked', '是否选中（反射）', 'boolean', 'false'],
        ['indeterminate', '三方态（仅 x-checkbox 常用，反射）', 'boolean', 'false'],
        ['value', '选中时提交/聚合的值', 'string', "'on'"],
        ['name', '表单名（反射，作为 FormData 键）', 'string', "''"],
        ['label', 'item 的可见文字 / 原子的无障碍名', 'string', "''"],
        ['disabled', '禁用（反射）', 'boolean', 'false'],
        ['required', '必填（走原生校验）', 'boolean', 'false'],
        ['shape', '形态（反射）', "'square' | 'rounded' | 'circle'", "'rounded'"],
        ['color', '语义色（反射）', "'primary' | … | 'info'", "'primary'"],
        ['size', '尺寸（反射）', "'sm' | 'md' | 'lg'", "'md'"],
      ],
    ),
    h('h3', null, '方法 / 事件'),
    apiTable(
      ['名称', '说明'],
      [
        ['toggle(force?)', '受控切换，派发可取消的 x-change'],
        ['x-change', '用户切换时派发，detail:{ checked, value }，可 preventDefault 回退'],
      ],
    ),

    h('h2', null, 'API · x-checkbox-group'),
    apiTable(
      ['属性/成员', '说明', '类型'],
      [
        ['name/disabled/size/shape/color', '条件下沉给未显式设置该属性的子项', '—'],
        ['min / max', '勾选数量下限/上限（越界挡下切换）', 'number'],
        ['direction', '子项排布（反射）', "'column' | 'row'"],
        ['gap', '子项间距（CSS 长度）', 'string'],
        ['value（只读）', '当前选中项 value 数组', 'string[]'],
        ['checkedItems（只读）', '当前选中子项元素', 'Element[]'],
        ['setAllChecked(b)', '全选 / 全不选（受 min/max 约束）', '(boolean) => void'],
        ['x-change', '聚合选择变化，detail:{ value, checked }', 'Event'],
      ],
    ),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
