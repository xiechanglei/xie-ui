/** x-filter 筛选器文档：单选 chip 行，选中项留下、其余横向折叠退场，行尾重置钮展开 */
import { h, demoCard, apiTable } from '/demo/render.js';

function mkFilter(attrs = {}) {
  const el = document.createElement('x-filter');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}
function item(label, value, disabled) {
  const it = document.createElement('x-filter-item');
  it.textContent = label;
  if (value != null) it.setAttribute('value', value);
  if (disabled) it.setAttribute('disabled', '');
  return it;
}

export function render(el) {
  el.append(
    h('h1', null, 'Filter 筛选器'),
    h('p', { class: 'lead' }, '单选式筛选：点一个选项（chip）后它进入选中态留在原地，其余选项横向折叠退场（grid 0fr→1fr 动画，不占位、不可聚焦）；再点选中项、或点行尾出现的重置钮（× ），全部选项展开恢复。观感直接复用 x-button：未选 soft（淡底）、选中 solid（accent 填充）、重置钮 solid。语义类似 radio 但刻意不做表单关联——筛选器多用于视图过滤而非提交。选项值取 value 属性，缺省回退文本内容；变化派发可取消的 x-change。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础用法',
      desc: '点选后其余折叠，行尾出现 × 重置钮；再点选中项或 × 展开全部',
      build: (c) => {
        const f = mkFilter();
        f.append(item('咖啡'), item('茶'), item('可乐'), item('果汁'));
        c.append(f);
      },
      code: `<x-filter>
  <x-filter-item>咖啡</x-filter-item>
  <x-filter-item>茶</x-filter-item>
  <x-filter-item>可乐</x-filter-item>
</x-filter>`,
    }),

    demoCard({
      title: '受控值 & 事件',
      desc: 'value 读写当前选中；变化派发可取消的 x-change（这里拒绝 "禁用项外" 的 other 并回退）',
      build: (c) => {
        const out = h('p', { class: 'demo-card__title' }, 'x-change：—');
        const f = mkFilter();
        f.append(item('全部', 'all'), item('进行中', 'doing'), item('已完成', 'done'), item('other'));
        f.addEventListener('x-change', (e) => {
          if (e.detail.value === 'other') {
            e.preventDefault();
            out.textContent = 'x-change 被取消，回到「' + (e.detail.previousValue || '未选') + '」';
          } else {
            out.textContent = 'x-change：' + (e.detail.value || '（已清空）');
          }
        });
        c.append(f, out);
      },
      code: `filter.addEventListener('x-change', (e) => {
  // e.detail: { value, previousValue }
  if (e.detail.value === 'other') e.preventDefault(); // 拒绝 → 回退
});
filter.value;            // 当前选中值
filter.select('done');   // 命令式选中（不派发）
filter.reset();          // 清空、展开全部`,
    }),

    demoCard({
      title: '语义色 color & 禁用',
      desc: 'color 下沉子项（选中填充色随主题语义色）；disabled 整体禁用',
      build: (c) => {
        const row = h('div', { style: 'display:flex;flex-direction:column;gap:16px;align-items:flex-start' });
        for (const color of ['primary', 'success', 'danger']) {
          const f = mkFilter({ color });
          f.append(item('Jungle'), item('Beach'), item('Mountain'));
          row.append(f);
        }
        const dis = mkFilter({ disabled: '' });
        dis.append(item('不可点 A'), item('不可点 B'));
        row.append(dis);
        c.append(row);
      },
      code: `<x-filter color="success">…</x-filter>
<x-filter disabled>…</x-filter>`,
    }),

    h('h2', null, 'API'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['value', '当前选中值（程序化赋值回显、不派发；空串=未选/全部展开）', 'string', "''"],
        ['color', '语义色（反射，下沉子项选中填充）', "'primary' | … | 'info'", "'primary'"],
        ['size', '尺寸（反射，下沉子项 chip）', "'sm' | 'md' | 'lg'", "'md'"],
        ['disabled', '整体禁用（反射，下沉子项）', 'boolean', 'false'],
        ['gap', '子项间距（CSS 长度，缺省 --xie-space-2）', 'string', "''"],
      ],
    ),
    h('h3', null, '方法 / 事件'),
    apiTable(
      ['名称', '说明'],
      [
        ['select(value)', '命令式选中某项（不派发 x-change）；传空串等价 reset'],
        ['reset()', '清空选中、展开全部（不派发 x-change）'],
        ['x-change', '用户交互变化派发，detail:{ value, previousValue }；可取消回退'],
      ],
    ),
    h('h3', null, 'x-filter-item'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['value', '选项值；缺省回退文本内容（由 filter 读取）', 'string', "''"],
        ['active', '选中态（由 filter 单源驱动，反射；true=solid false=soft）', 'boolean', 'false'],
        ['color / size', 'chip 语义色 / 尺寸（一般由 filter 下沉，未下沉时吃自身缺省）', 'string', "'primary' / 'md'"],
        ['disabled', '禁用该项', 'boolean', 'false'],
      ],
    ),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
