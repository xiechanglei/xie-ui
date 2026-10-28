/** x-button 组件文档：使用示例 + API */
import { h, demoCard, apiTable } from '/demo/render.js';

function button(label, attrs = {}) {
  const b = document.createElement('x-button');
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, String(v));
  b.textContent = label;
  return b;
}

/** 图标件：name 为 icons.ts 注册表里的已登记名 */
function icon(name, attrs = {}) {
  const i = document.createElement('x-icon');
  i.setAttribute('name', name);
  for (const [k, v] of Object.entries(attrs)) i.setAttribute(k, String(v));
  return i;
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
      title: '图标 + 文字',
      desc: '把 x-icon 和文本一起放进默认插槽即可（前后缀皆可），间距由组件自带 gap 统一留白；只放图标即成图标钮',
      build: (c) => c.append(
        (() => { const b = button('', {}); b.append(icon('upload'), '上传文件'); return b; })(),
        (() => { const b = button('', { variant: 'outline', color: 'danger' }); b.append(icon('close'), '删除'); return b; })(),
        (() => { const b = button('', { variant: 'ghost', color: 'default' }); b.append('下一步', icon('chevron-right')); return b; })(),
        (() => { const b = button('', { variant: 'soft', color: 'success' }); b.append(icon('check'), '保存'); return b; })(),
        (() => { const b = button('', { variant: 'outline' }); b.append(icon('settings')); b.setAttribute('aria-label', '设置'); return b; })(),
        (() => { const b = button('', { size: 'sm' }); b.append(icon('user'), '小号'); return b; })(),
      ),
      code: `<x-button><x-icon name="upload"></x-icon>上传文件</x-button>
<x-button variant="outline" color="danger"><x-icon name="close"></x-icon>删除</x-button>
<x-button variant="ghost">下一步<x-icon name="chevron-right"></x-icon></x-button>
<x-button variant="outline" aria-label="设置"><x-icon name="settings"></x-icon></x-button>`,
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

    formCommandDemo(),

    commandDemo(),

    eventDemo(),

    h('h2', null, 'API'),
    h('h3', null, '属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['variant', '形态（填充样式）', "'solid' | 'outline' | 'ghost' | 'soft'", "'solid'"],
        ['color', '语义色（与形态正交，任意组合）；default 为中性缺省态、非强调角色', "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'", "'primary'"],
        ['size', '按钮尺寸', "'sm' | 'md' | 'lg'", "'md'"],
        ['command', '点击后向上递交的命令名，由链上最近的认领者处理（见下方「命令传递」示例）：x-form 认领 submit / reset，x-dialog / x-drawer 认领 close；链上无人认领则什么都不做', 'string', "''"],
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
        ['(默认)', '按钮内容：纯文本、x-icon + 文本（前后缀皆可，组件自带间距）或只放 x-icon 作图标钮'],
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

/* 表单命令演示：command=submit/reset 就近交给所在 form 认领 */
function formCommandDemo() {
  return demoCard({
    title: '表单提交 / 重置',
    desc: 'command="submit" | "reset" 向上递交，由所在的 x-form 就近认领（用页面原生 form 时也能接住），不写任何监听',
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
        button('提交', { command: 'submit' }),
        button('重置', { command: 'reset', variant: 'outline', color: 'default' }),
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
    <x-button command="submit">提交</x-button>
    <x-button command="reset" variant="outline">重置</x-button>
  </x-form-footer>
</x-form>`,
  });
}

/* 命令传递演示：command 把意图向上递交，由认领它的祖先组件处理 */
function commandDemo() {
  const dialog = document.createElement('x-dialog');
  dialog.setAttribute('title', '命令传递');
  dialog.setAttribute('subtitle', '下面两个按钮都没绑过 click');
  dialog.append(h('p', null, '开关靠 open / show()，关闭则根本不需要知道对话框的存在：取消按钮只写了 command="close"。'));
  const footer = document.createElement('x-dialog-footer');
  footer.append(
    button('取消', { command: 'close', variant: 'outline', color: 'default' }),
    button('确定', { command: 'close' }),
  );
  dialog.append(footer);
  return demoCard({
    title: '命令传递 command',
    desc: '按钮只声明意图、不认识任何宿主：命令沿祖先链冒泡（跨 shadow 边界），链上第一个认领它的组件接走并 preventDefault，外层组件自动让路',
    build: (c) => c.append(
      h('x-button', { onclick: () => dialog.show() }, '打开对话框'),
      dialog,
    ),
    code: `<x-dialog title="命令传递">
  <x-dialog-footer>
    <x-button command="close">取消</x-button>
    <x-button command="close" variant="solid">确定</x-button>
  </x-dialog-footer>
</x-dialog>
<!-- 内置命令：submit / reset → x-form；close → x-dialog / x-drawer -->`,
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
