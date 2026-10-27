/** x-textarea 文本域文档：复用 input 事件模型，variant×color 双轴 + 自适应高度 + form 关联 */
import { h, demoCard, apiTable } from '/demo/render.js';

function ta(attrs = {}, text = '') {
  const el = document.createElement('x-textarea');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  if (text) el.value = text;
  return el;
}

export function render(el) {
  el.append(
    h('h1', null, 'Textarea 文本域'),
    h('p', { class: 'lead' }, '与 Input 同源的多行版：shadow 内包原生 textarea，逐字符派发 x-input、失焦提交派发可取消的 x-change；形态 variant × 语义色 color 双轴，autosize 让高度随内容伸缩，同样支持 form 关联（FCCE）。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础用法',
      desc: 'rows 控制初始行数；程序化设 value 不派发事件',
      build: (c) => c.append(ta({ placeholder: '请输入备注…' })),
      code: `<x-textarea placeholder="请输入备注…"></x-textarea>`,
    }),

    demoCard({
      title: '自适应高度 autosize',
      desc: 'rows 作最小高度，max-rows 封顶，超出滚动',
      build: (c) => c.append(ta({ autosize: '', rows: '2', 'max-rows': '6', placeholder: '逐行输入看看高度变化' })),
      code: `<x-textarea autosize rows="2" max-rows="6"></x-textarea>`,
    }),

    demoCard({
      title: '计数 &  maxLength',
      build: (c) => c.append(ta({ 'show-count': '', maxlength: '50', rows: '3', placeholder: '最多 50 字' })),
      code: `<x-textarea show-count maxlength="50"></x-textarea>`,
    }),

    demoCard({
      title: '形态 variant',
      build: (c) => {
        c.append(ta({ variant: 'outline', rows: '2', placeholder: 'outline' }));
        c.append(ta({ variant: 'filled', rows: '2', placeholder: 'filled' }));
        c.append(ta({ variant: 'flush', rows: '2', placeholder: 'flush' }));
      },
      code: `<x-textarea variant="filled"></x-textarea>`,
    }),

    demoCard({
      title: '语义色 color & 尺寸 size',
      build: (c) => {
        const row = h('div', { style: 'display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start' });
        for (const color of ['primary', 'success', 'danger']) {
          row.append(ta({ color, rows: '2', placeholder: color }));
        }
        row.append(ta({ size: 'sm', rows: '2', placeholder: 'sm' }), ta({ size: 'lg', rows: '2', placeholder: 'lg' }));
        c.append(row);
      },
      code: `<x-textarea color="success" size="lg"></x-textarea>`,
    }),

    demoCard({
      title: '拖拽 resize & 状态',
      desc: 'resize：vertical(默认)/none/both/auto；禁用/只读',
      build: (c) => {
        c.append(ta({ resize: 'both', rows: '2', placeholder: '可拖拽 both' }));
        c.append(ta({ disabled: '', rows: '2', value: '禁用' }));
        c.append(ta({ readonly: '', rows: '2', value: '只读，仍可选中复制' }));
      },
      code: `<x-textarea resize="both"></x-textarea>
<x-textarea disabled value="禁用"></x-textarea>`,
    }),

    demoCard({
      title: '事件与受控',
      desc: '逐字符 x-input；失焦提交 x-change，含 bad 会被拒绝回退',
      build: (c) => {
        const live = h('span', { class: 'demo-card__title' }, 'x-input：—');
        const committed = h('span', { class: 'demo-card__title' }, 'x-change：—');
        const a = ta({ rows: '3', placeholder: '边打字边看下面' });
        a.addEventListener('x-input', (e) => (live.textContent = 'x-input：' + e.detail.value));
        a.addEventListener('x-change', (e) => (committed.textContent = 'x-change：' + e.detail.value));
        const b = ta({ rows: '3', placeholder: '含 bad 会被拒绝（失焦触发）' });
        b.addEventListener('x-change', (e) => {
          if (e.detail.value.includes('bad')) {
            e.preventDefault();
            committed.textContent = 'x-change 被取消，回退到「' + e.detail.previousValue + '」';
          }
        });
        const box = h('div', { style: 'display:flex;gap:12px;flex-wrap:wrap;width:100%' }, a, b);
        c.append(box, h('div', { style: 'display:flex;gap:16px;margin-top:8px' }, live, committed));
      },
      code: `ta.addEventListener('x-input', (e) => console.log('实时', e.detail.value));
ta.addEventListener('x-change', (e) => {
  if (e.detail.value.includes('bad')) e.preventDefault(); // 拒绝 → 回退 previousValue
});`,
    }),

    h('h2', null, 'API'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['value', '当前值（程序化赋值不派发事件）', 'string', "''"],
        ['rows', '可见行数（autosize 时作最小高度）', 'number', '3'],
        ['max-rows', 'autosize 最大高度对应的行数', 'number', 'undefined'],
        ['autosize', '高度随内容伸缩（反射）', 'boolean', 'false'],
        ['resize', '手动拖拽（反射）', "'none' | 'vertical' | 'both' | 'auto'", "'vertical'"],
        ['variant', '形态（反射）', "'outline' | 'filled' | 'flush'", "'outline'"],
        ['color', '语义色（反射，聚焦描边/光标）', "'primary' | … | 'info'", "'primary'"],
        ['size', '尺寸（反射，字号）', "'sm' | 'md' | 'lg'", "'md'"],
        ['placeholder / disabled / readonly / required', '同语义透传原生', '—', '—'],
        ['maxlength / show-count', '最大长度 / 显示 n(或 n/max) 计数', 'number | boolean', '—'],
        ['label', '无障碍名（aria-label）', 'string', "''"],
      ],
    ),
    h('h3', null, '方法 / 事件'),
    apiTable(
      ['名称', '说明'],
      [
        ['focus() / select()', '委托内部原生 textarea'],
        ['x-input', '逐字符，detail:{ value }'],
        ['x-change', '提交时机（失焦）派发，detail:{ value, previousValue }，可取消回退'],
      ],
    ),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
