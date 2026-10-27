/** x-input 输入框文档：形态×颜色双轴、尺寸档位、前后缀插槽、可清除/计数、受控事件 */
import { h, demoCard, apiTable } from '/demo/render.js';

function inp(attrs = {}, children = []) {
  const i = document.createElement('x-input');
  for (const [k, v] of Object.entries(attrs)) i.setAttribute(k, String(v));
  for (const c of children) i.append(c);
  return i;
}

/** 内置图标做前后缀（slot="prefix" / slot="suffix"） */
function icon(name, slot) {
  const el = document.createElement('x-icon');
  el.setAttribute('name', name);
  el.setAttribute('size', '16px');
  el.setAttribute('slot', slot);
  return el;
}

/** 行内文字单位：吃 x-text 角色 */
function unit(text) {
  const el = document.createElement('x-text');
  el.setAttribute('variant', 'caption');
  el.setAttribute('slot', 'suffix');
  el.textContent = text;
  return el;
}

export function render(el) {
  el.append(
    h('h1', null, 'Input 输入框'),
    h('p', { class: 'lead' }, '单行文本输入。内部包一个原生 <code>&lt;input&gt;</code>（键盘、输入法、复制粘贴、类型校验全部白送），外层由本库统一绘制度；形态 variant × 语义色 color 双轴正交，尺寸/圆角/颜色均吃全局令牌，随主题面板实时联动。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础用法',
      desc: 'placeholder 提示；value 为当前值（程序化赋值不会触发事件）',
      build: (c) => {
        c.append(inp({ placeholder: '请输入用户名' }), inp({ placeholder: '已有默认值', value: 'xie' }));
      },
      code: `<x-input placeholder="请输入用户名"></x-input>
<x-input placeholder="已有默认值" value="xie"></x-input>`,
    }),

    demoCard({
      title: '形态 variant',
      desc: 'outline（默认描边）/ filled（灰底聚焦显边）/ flush（下划线），与 color 正交',
      build: (c) => {
        c.append(
          inp({ placeholder: 'outline', value: '描边' }),
          inp({ placeholder: 'filled', variant: 'filled', value: '填充' }),
          inp({ placeholder: 'flush', variant: 'flush', value: '下划线' }),
        );
      },
      code: `<x-input variant="outline"></x-input>
<x-input variant="filled"></x-input>
<x-input variant="flush"></x-input>`,
    }),

    demoCard({
      title: '尺寸 size',
      desc: 'sm / md（默认）/ lg，吃 --xie-size-* 档位，随主题面板「尺寸」滑杆联动',
      build: (c) => {
        c.append(
          inp({ size: 'sm', placeholder: '小号' }),
          inp({ placeholder: '默认中号' }),
          inp({ size: 'lg', placeholder: '大号' }),
        );
      },
      code: `<x-input size="sm"></x-input>
<x-input></x-input>
<x-input size="lg"></x-input>`,
    }),

    demoCard({
      title: '语义色 color',
      desc: '聚焦描边、光环与光标取色；primary（默认）/ secondary / success / warning / danger / info',
      build: (c) => {
        for (const color of ['primary', 'secondary', 'success', 'warning', 'danger', 'info']) {
          c.append(inp({ color, value: color, style: 'width:120px' }));
        }
      },
      code: `<x-input color="success" value="success"></x-input>
<x-input color="danger" value="danger"></x-input>`,
    }),

    demoCard({
      title: '前后缀插槽',
      desc: 'slot="prefix" / slot="suffix" 放图标或单位，自动弱化色且不参与滚动',
      build: (c) => {
        c.append(inp({ placeholder: '搜索…' }, [icon('user', 'prefix')]));
        c.append(inp({ value: '128', style: 'width:160px' }, [unit('元')]));
      },
      code: `<x-input placeholder="搜索…">
  <x-icon slot="prefix" name="user" size="16px"></x-icon>
</x-input>
<x-input value="128">
  <x-text slot="suffix" variant="caption">元</x-text>
</x-input>`,
    }),

    demoCard({
      title: '可清除 & 计数',
      desc: 'clearable 有内容时才显出 ×；show-count 显示 n/maxlength',
      build: (c) => {
        c.append(inp({ clearable: '', value: '点右边的 × 清空', style: 'width:220px' }));
        c.append(inp({ 'show-count': '', maxlength: '12', placeholder: '最多 12 字', style: 'width:220px' }));
      },
      code: `<x-input clearable value="点右边的 × 清空"></x-input>
<x-input show-count maxlength="12" placeholder="最多 12 字"></x-input>`,
    }),

    demoCard({
      title: '状态 disabled / readonly / required',
      desc: '禁用半透明不可交互；只读灰底仍可选中复制；required 只做 aria 与样式钩子',
      build: (c) => {
        c.append(inp({ disabled: '', value: '禁用' }));
        c.append(inp({ readonly: '', value: '只读内容' }));
        c.append(inp({ required: '', placeholder: '必填' }));
      },
      code: `<x-input disabled value="禁用"></x-input>
<x-input readonly value="只读内容"></x-input>
<x-input required placeholder="必填"></x-input>`,
    }),

    demoCard({
      title: '类型 type',
      desc: '原生 type 透传：password / email / number / tel / url / search；show-password 显出眼睛钮切换明文/掩码（不抓焦点）',
      build: (c) => {
        c.append(inp({ type: 'password', value: 'secret', style: 'width:160px' }));
        c.append(inp({ type: 'password', 'show-password': '', value: 'abc12345', placeholder: '密码', style: 'width:200px' }));
        c.append(inp({ type: 'number', placeholder: '数量', style: 'width:120px' }));
        c.append(inp({ type: 'email', placeholder: 'name@example.com', style: 'width:220px' }));
      },
      code: `<x-input type="password" value="secret"></x-input>
<x-input type="password" show-password value="abc12345"></x-input>
<x-input type="number" placeholder="数量"></x-input>
<x-input type="email" placeholder="name@example.com"></x-input>`,
    }),

    demoCard({
      title: '事件与受控',
      desc: '输入逐字符派发 x-input；失焦/回车提交时派发可取消的 x-change（preventDefault 则回退旧值）',
      build: (c) => {
        const live = h('span', { class: 'demo-card__title' }, 'x-input：—');
        const committed = h('span', { class: 'demo-card__title' }, 'x-change：—');
        const box = h('div', { style: 'display:flex;gap:12px;align-items:center;width:100%' });
        const a = inp({ placeholder: '边打字边看下面', clearable: '', style: 'width:200px' });
        a.addEventListener('x-input', (e) => (live.textContent = 'x-input：' + e.detail.value));
        a.addEventListener('x-change', (e) => (committed.textContent = 'x-change：' + e.detail.value));
        const b = inp({ placeholder: '含 bad 会被拒绝', style: 'width:200px' });
        b.addEventListener('x-change', (e) => {
          if (e.detail.value.includes('bad')) {
            e.preventDefault();
            committed.textContent = 'x-change 被取消，回退到「' + e.detail.previousValue + '」';
          }
        });
        box.append(a, b);
        const log = h('div', { style: 'display:flex;gap:16px;margin-top:8px' }, live, committed);
        c.append(box, log);
      },
      code: `input.addEventListener('x-input', (e) => console.log('实时', e.detail.value));
input.addEventListener('x-change', (e) => {
  if (e.detail.value.includes('bad')) e.preventDefault(); // 拒绝本次提交 → 回退 previousValue
});`,
    }),

    h('h2', null, 'API'),
    h('h3', null, '属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['value', '当前值（程序化赋值不派发事件，作为受控数据源）', 'string', "''"],
        ['type', '原生类型透传（决定键盘/校验/掩码）', "'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'", "'text'"],
        ['variant', '形态（反射）：描边 / 灰底 / 下划线', "'outline' | 'filled' | 'flush'", "'outline'"],
        ['color', '语义色（反射）：聚焦描边、光环与光标取色', "'primary' | 'secondary' | … | 'info'", "'primary'"],
        ['size', '尺寸档位（反射，吃 --xie-size-*）', "'sm' | 'md' | 'lg'", "'md'"],
        ['placeholder', '占位提示', 'string', "''"],
        ['disabled', '禁用', 'boolean', 'false'],
        ['readonly', '只读（仍可聚焦、选中复制）', 'boolean', 'false'],
        ['required', '必填标记（透传原生 + aria-required）', 'boolean', 'false'],
        ['clearable', '有内容时显出清空按钮（禁用/只读时不显）', 'boolean', 'false'],
        ['show-password', '密码可见切换钮（仅 type=password 且非禁用时显；明文态为内部状态不外露）', 'boolean', 'false'],
        ['maxlength', '最大长度（透传原生；配合 show-count 显示 n/max）', 'number', 'undefined'],
        ['show-count', '显示字数计数', 'boolean', 'false'],
        ['label', '无障碍名称（aria-label）', 'string', "''"],
      ],
    ),
    h('h3', null, '方法 Methods'),
    apiTable(
      ['方法', '说明'],
      [['focus(options?)', '聚焦到内部原生 input'], ['select()', '全选输入内容']],
    ),
    h('h3', null, '事件 Events'),
    apiTable(
      ['事件', '说明', 'detail'],
      [
        ['x-input', '每次输入实时派发（同值不重复派）', '{ value: string }'],
        ['x-change', '提交时机（失焦 / 回车 / 点清空）派发，可 preventDefault 取消 → 回退到 previousValue', '{ value: string, previousValue: string }'],
      ],
    ),
    h('h3', null, '插槽 Slots'),
    apiTable(
      ['插槽', '说明'],
      [['prefix', '前缀（图标/文字），自动弱化色'], ['suffix', '后缀（单位/图标），排在清空按钮之前']],
    ),
    h('h3', null, 'CSS 部分 Part'),
    apiTable(
      ['part', '说明'],
      [['field', '外框（描边/圆角/背景都在这层）'], ['input', '内部原生 input'], ['reveal', '密码显隐按钮'], ['clear', '清空按钮'], ['count', '字数计数']],
    ),
    h('h3', null, '消费的 CSS 变量'),
    apiTable(
      ['变量', '用途'],
      [
        ['--xie-font-family', '字体族（置为 inherit 即跟随宿主页排版）'],
        ['--xie-size-sm / md / lg', '高度档位（= --xie-control-height 派生）'],
        ['--xie-radius-md', '外框圆角（随主题圆角滑杆）'],
        ['--xie-color-border / bg / surface / fg / muted', '描边、底色、文字、占位'],
        ['--xie-color-{color}', '聚焦描边、光环与光标（color 轴）'],
      ],
    ),
    h('h2', null, '设计约定'),
    h('p', null, 'shadow 内的原生 input 不参与外部 <form> 提交：取值走 value 属性 / x-input / x-change，需要 form 集成时在外层监听事件即可。number 步进箭头与 Edge 自绘的显示密码钮与本库观感不符，已在 CSS 中关闭；密码显隐由 show-password 自绘（眼睛图标切换 type=password/text，切换态不对外暴露、不抢输入焦点）。'),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
