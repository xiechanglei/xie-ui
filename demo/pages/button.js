/** x-button 组件文档：使用示例 + API */
import { h, demoCard, apiTable } from '/demo/render.js';

function button(label, attrs = {}) {
  const b = document.createElement('x-button');
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, String(v));
  b.textContent = label;
  return b;
}

export function render(el) {
  el.append(
    h('h1', null, 'Button 按钮'),
    h('p', { class: 'lead' }, '触发操作行为的按钮。基于原生 <code>&lt;button&gt;</code> 封装，形态（variant）与语义色（color）两轴正交，另有尺寸、禁用与加载态。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '形态 variant',
      desc: 'solid / outline / ghost / soft 四种填充形态',
      build: (c) => c.append(
        button('Solid', { variant: 'solid' }),
        button('Outline', { variant: 'outline' }),
        button('Ghost', { variant: 'ghost' }),
        button('Soft', { variant: 'soft' }),
      ),
      code: `<x-button variant="solid">Solid</x-button>
<x-button variant="outline">Outline</x-button>
<x-button variant="ghost">Ghost</x-button>
<x-button variant="soft">Soft</x-button>`,
    }),

    demoCard({
      title: '语义色 color',
      desc: 'default（中性缺省态，次要/取消按钮）/ primary / secondary / success / warning / danger / info，与形态正交；强调色可在主题面板定制，default 随明暗翻转',
      build: (c) => c.append(
        button('Default', { color: 'default' }),
        button('Primary', { color: 'primary' }),
        button('Secondary', { color: 'secondary' }),
        button('Success', { color: 'success' }),
        button('Warning', { color: 'warning' }),
        button('Danger', { color: 'danger' }),
        button('Info', { color: 'info' }),
      ),
      code: `<x-button color="default">Default</x-button>
<x-button color="primary">Primary</x-button>
<x-button color="success">Success</x-button>
<x-button color="danger">Danger</x-button>
<x-button color="info">Info</x-button>`,
    }),

    demoCard({
      title: '形态 × 语义色 组合',
      desc: '两轴自由组合，如 outline+danger、ghost+success、soft+info',
      build: (c) => c.append(
        button('Outline Danger', { variant: 'outline', color: 'danger' }),
        button('Ghost Success', { variant: 'ghost', color: 'success' }),
        button('Soft Info', { variant: 'soft', color: 'info' }),
        button('Soft Warning', { variant: 'soft', color: 'warning' }),
      ),
      code: `<x-button variant="outline" color="danger">Outline Danger</x-button>
<x-button variant="ghost" color="success">Ghost Success</x-button>
<x-button variant="soft" color="info">Soft Info</x-button>`,
    }),

    demoCard({
      title: '按钮尺寸',
      desc: '通过 size 设置',
      build: (c) => c.append(
        button('Small', { size: 'sm' }),
        button('Medium', { size: 'md' }),
        button('Large', { size: 'lg' }),
      ),
      code: `<x-button size="sm">Small</x-button>
<x-button size="md">Medium</x-button>
<x-button size="lg">Large</x-button>`,
    }),

    demoCard({
      title: '禁用与加载',
      desc: 'disabled / loading 为布尔属性，存在即生效',
      build: (c) => c.append(
        button('Disabled', { disabled: '' }),
        button('Loading', { loading: '' }),
        button('Outline Loading', { variant: 'outline', loading: '' }),
      ),
      code: `<x-button disabled>Disabled</x-button>
<x-button loading>Loading</x-button>
<x-button variant="outline" loading>Outline Loading</x-button>`,
    }),

    formActionDemo(),

    eventDemo(),

    h('h2', null, 'API'),
    h('h3', null, '属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['variant', '形态（填充样式）', "'solid' | 'outline' | 'ghost' | 'soft'", "'solid'"],
        ['color', '语义色（与形态正交，任意组合）；default 为中性缺省态、非强调角色', "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'", "'primary'"],
        ['size', '按钮尺寸', "'sm' | 'md' | 'lg'", "'md'"],
        ['type', '原生按钮类型；submit / reset 自动归属所在 form（含 x-form），无需手写 click 派发', "'button' | 'submit' | 'reset'", "'button'"],
        ['disabled', '是否禁用', 'boolean', 'false'],
        ['loading', '是否加载中', 'boolean', 'false'],
      ],
    ),

    h('h3', null, '事件 Events'),
    apiTable(
      ['事件', '说明', 'detail'],
      [
        ['x-click', '点击按钮（禁用/加载态不触发，可 preventDefault 取消）', '{ originalEvent: MouseEvent }'],
      ],
    ),

    h('h3', null, '插槽 Slots'),
    apiTable(
      ['插槽', '说明'],
      [
        ['(默认)', '按钮文本内容'],
      ],
    ),

    h('h3', null, 'CSS 部分 Part'),
    apiTable(
      ['part', '说明'],
      [
        ['base', '内部原生 button 元素'],
        ['label', '文本容器'],
        ['spinner', '加载指示器'],
      ],
    ),

    h('h3', null, 'CSS 变量 Variables'),
    apiTable(
      ['变量', '说明'],
      [
        ['--xie-color-{color}', '对应语义色（本体 / hover / soft / fg）；color 属性决定取哪一支'],
        ['--xie-soft-mix', 'soft 淡底混合方向（随 light/dark 翻转）'],
        ['--xie-radius-md', '圆角'],
      ],
    ),
  );
}

/* 表单动作演示：type=submit/reset 自动归属所在 form */
function formActionDemo() {
  return demoCard({
    title: '表单提交 / 重置',
    desc: 'type="submit" | "reset" 会自动归属到所在的 form（x-form 或页面原生 form 都算）：按钮自己沿 composedPath 找最近 form 并代为 requestSubmit/reset，不写任何监听',
    build: (c) => {
      const f = document.createElement('x-form');
      const item = document.createElement('x-form-item');
      item.setAttribute('label', '关键词');
      item.setAttribute('name', 'kw');
      item.setAttribute('required', '');
      const inp = document.createElement('x-input');
      inp.setAttribute('placeholder', '留空会被校验拦下');
      item.append(inp);
      const footer = document.createElement('x-form-footer');
      footer.append(
        button('提交', { type: 'submit' }),
        button('重置', { type: 'reset', variant: 'outline', color: 'default' }),
      );
      const status = h('span', { class: 'demo-card__title' }, '尚未提交');
      f.append(item, footer);
      f.addEventListener('x-submit', (e) => (status.textContent = 'x-submit：' + JSON.stringify(e.detail.values)));
      f.addEventListener('x-invalid', () => (status.textContent = '校验未通过：关键词必填'));
      c.append(f, status);
    },
    code: `<x-form>
  <x-form-item label="关键词" name="kw" required><x-input></x-input></x-form-item>
  <x-form-footer>
    <x-button type="submit">提交</x-button>
    <x-button type="reset" variant="outline">重置</x-button>
  </x-form-footer>
</x-form>`,
  });
}

/* 事件交互演示：真实监听 x-click 并回显 */
function eventDemo() {
  const status = h('span', { class: 'demo-card__title' }, '点击按钮查看事件');
  return demoCard({
    title: '事件监听',
    desc: 'x-click 为 composed 自定义事件，可冒泡出 Shadow DOM',
    build: (c) => {
      const b = button('点我', { variant: 'solid' });
      let n = 0;
      b.addEventListener('x-click', (e) => {
        n += 1;
        status.textContent = `已触发 x-click ${n} 次（detail.originalEvent.clientX=${Math.round(e.detail.originalEvent.clientX)}）`;
      });
      c.append(b, status);
    },
    code: `const btn = document.querySelector('x-button');
btn.addEventListener('x-click', (e) => {
  console.log(e.detail.originalEvent);
});`,
  });
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
