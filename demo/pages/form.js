/** x-form 表单文档：三轴布局编排 + FCCE 数据收集 + 原生校验/提交 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

function form(attrs = {}) {
  const el = document.createElement('x-form');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}
function fi(label, attrs = {}, ...children) {
  const el = document.createElement('x-form-item');
  el.setAttribute('label', label);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  if (children.length) el.append(...children);
  return el;
}
function ctl(tag, attrs = {}) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}
function btn(label, attrs = {}) {
  const b = document.createElement('x-button');
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, String(v));
  b.textContent = label;
  return b;
}
function footer(attrs = {}, ...buttons) {
  const el = document.createElement('x-form-footer');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  el.append(...buttons);
  return el;
}

export function render(el) {
  el.append(
    h('h1', null, 'Form 表单'),
    h(
      'p',
      { class: 'lead' },
      'x-form 是布局编排 + 数据收集 + 校验调度的容器，x-form-item 把「label + 控件 + 错误/帮助文本」组成可统一排布的单元，x-form-footer 放操作按钮。布局拆成三条正交轴：label 与控件的关系（上下 / 左右 + 左右时 label 对齐与列宽）、item 之间的流向（纵向堆叠 / 横向换行）、按钮区对齐。数据收集依赖各控件自带的 FCCE 能力——x-form 内部放一个真正的 <form>，new FormData() 直接聚合出 values；校验走控件原生约束（required / type / pattern），错误信息渲染到字段下方。',
    ),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础用法（上下布局）',
      desc: 'layout 默认 vertical：label 在控件上方，item 纵向堆叠',
      build: (c) => {
        const f = form();
        const status = h('p', { class: 'demo-card__title' }, '尚未提交');
        f.append(
          fi('用户名', { name: 'username', required: '' }, ctl('x-input', { name: 'username', placeholder: '请输入用户名' })),
          fi('邮箱', { name: 'email', help: '不会公开显示' }, ctl('x-input', { name: 'email', type: 'email', placeholder: 'you@example.com' })),
          footer({}, btn('提交'), btn('重置', { variant: 'outline' })),
        );
        const [submit, reset] = [f.querySelector('x-button'), f.querySelectorAll('x-button')[1]];
        submit.addEventListener('click', () => f.submit());
        reset.addEventListener('click', () => {
          f.reset();
          status.textContent = '已重置';
        });
        f.addEventListener('x-submit', (e) => (status.textContent = '提交成功：' + JSON.stringify(e.detail.values)));
        f.addEventListener('x-invalid', () => (status.textContent = '校验未通过，请检查标红字段'));
        c.append(f, status);
      },
      code: `<x-form>
  <x-form-item label="用户名" name="username" required>
    <x-input name="username" placeholder="请输入用户名"></x-input>
  </x-form-item>
  <x-form-item label="邮箱" name="email" help="不会公开显示">
    <x-input name="email" type="email"></x-input>
  </x-form-item>
  <x-form-footer>
    <x-button onclick="form.submit()">提交</x-button>
    <x-button variant="outline" onclick="form.reset()">重置</x-button>
  </x-form-footer>
</x-form>`,
    }),

    demoCard({
      title: '左右布局 + label 对齐/列宽 + 按钮缩进',
      desc: 'layout=horizontal：label 在左、固定列宽 label-width、文本右对齐 label-align=end；footer label-offset 让按钮与控件列对齐',
      build: (c) => {
        const f = form({ layout: 'horizontal', 'label-width': '90px', 'label-align': 'end' });
        f.append(
          fi('用户名', { name: 'u1', required: '' }, ctl('x-input', { name: 'u1' })),
          fi('密码', { name: 'p1' }, ctl('x-input', { name: 'p1', type: 'password', 'show-password': '' })),
          fi('城市', { name: 'c1' }, ctl('x-select', { name: 'c1', options: '北京,上海,广州,深圳' })),
          footer({ 'label-offset': '', align: 'end' }, btn('登录')),
        );
        c.append(f);
      },
      code: `<x-form layout="horizontal" label-width="90px" label-align="end">
  <x-form-item label="用户名" name="u1" required><x-input name="u1"></x-input></x-form-item>
  <x-form-item label="密码" name="p1"><x-input name="p1" type="password" show-password></x-input></x-form-item>
  <x-form-footer label-offset align="end"><x-button>登录</x-button></x-form-footer>
</x-form>`,
    }),

    demoCard({
      title: 'label 左对齐 / 居中',
      desc: 'label-align 只在左右布局生效：start 左、center 居中、end 右',
      build: (c) => {
        const wrap = h('div', { style: 'display:flex;flex-direction:column;gap:20px;width:100%' });
        for (const align of ['start', 'center', 'end']) {
          const f = form({ layout: 'horizontal', 'label-width': '80px', 'label-align': align });
          f.append(
            fi('昵称', { name: 'n' + align }, ctl('x-input', { name: 'n' + align })),
            fi('备注', { name: 'r' + align }, ctl('x-input', { name: 'r' + align })),
          );
          wrap.append(h('div', { class: 'demo-card__title' }, 'label-align = ' + align), f);
        }
        c.append(wrap);
      },
      code: `<x-form layout="horizontal" label-width="80px" label-align="center">…</x-form>`,
    }),

    demoCard({
      title: '行内布局（横向排列、超出换行）',
      desc: 'layout=inline：label 在左 + item 横向排列、容器变窄自动换行；也可单独用 flow=row 覆盖任意 layout',
      build: (c) => {
        const f = form({ layout: 'inline' });
        f.append(
          fi('关键词', { name: 'kw' }, ctl('x-input', { name: 'kw', placeholder: '搜索' })),
          fi('类型', { name: 'tp' }, ctl('x-select', { name: 'tp', options: '全部,文章,问答' })),
          fi('状态', { name: 'st' }, ctl('x-select', { name: 'st', options: '全部,已发布,草稿' })),
          footer({}, btn('查询', { color: 'primary' }), btn('重置', { variant: 'ghost' })),
        );
        c.append(f);
      },
      code: `<x-form layout="inline">
  <x-form-item label="关键词" name="kw"><x-input name="kw"></x-input></x-form-item>
  <x-form-item label="类型" name="tp"><x-select name="tp" options="全部,文章,问答"></x-select></x-form-item>
  <x-form-footer><x-button>查询</x-button></x-form-footer>
</x-form>`,
    }),

    demoCard({
      title: '校验与提交',
      desc: 'required 必填 + type=email/pattern 正则走原生约束；submit() 校验通过后派发可取消的 x-submit（detail.values 为聚合值）',
      build: (c) => {
        const f = form({ layout: 'horizontal', 'label-width': '80px', 'label-align': 'end' });
        const out = h('p', { class: 'demo-card__title' }, '点“提交”试试：留空 / 非法邮箱会被拦下');
        f.append(
          fi('账号', { name: 'acc', required: '' }, ctl('x-input', { name: 'acc', placeholder: '必填' })),
          fi('邮箱', { name: 'mail', required: '' }, ctl('x-input', { name: 'mail', type: 'email', placeholder: '需合法邮箱' })),
          fi('验证码', { name: 'code', error: '' }, ctl('x-input', { name: 'code', maxlength: '6', placeholder: '最多 6 位' })),
          footer({ 'label-offset': '' }, btn('提交'), btn('清空', { variant: 'outline' })),
        );
        const buttons = f.querySelectorAll('x-button');
        buttons[0].addEventListener('click', () => f.submit());
        buttons[1].addEventListener('click', () => f.reset());
        f.addEventListener('x-submit', (e) => (out.textContent = '校验通过 · values = ' + JSON.stringify(e.detail.values)));
        f.addEventListener('x-invalid', () => (out.textContent = '存在未通过校验的字段'));
        c.append(f, out);
      },
      code: `form.addEventListener('x-submit', (e) => {
  console.log(e.detail.values); // 校验通过后的聚合值
});
form.submit();       // 触发校验：通过则派发 x-submit，失败聚焦首个非法项并派发 x-invalid
form.validate();     // 仅校验返回 boolean
form.values;         // 当前聚合值（不校验）
form.reset();        // 还原到初始快照 + 清错误态`,
    }),

    h('h2', null, '设计要点'),
    rich('三条布局轴正交：轴1 label↔控件（<code>label-position</code> top/left、<code>label-align</code> start/end/center、<code>label-width</code>）；轴2 item↔item（<code>flow</code> stack/row 换行、<code>gap</code>）；轴3 按钮区（<code>x-form-footer</code> 的 <code>align</code> + <code>label-offset</code>）。<code>layout</code> 预设一次性设好轴1+轴2，细调属性显式写出即覆盖。'),
    rich('数据收集不重复造轮子：x-form 内部是一个真正的 <code>&lt;form&gt;&lt;fieldset&gt;&lt;slot&gt;</code>，各控件自带 FCCE（Form-Associated Custom Element），经扁平树归属到它，<code>new FormData()</code> 直接聚合。因此 <code>x-input / x-switch / x-slider</code> 本轮也补齐了 FCCE + <code>name</code>；<code>disabled</code> 交给 <code>&lt;fieldset disabled&gt;</code> 的原生语义自动禁用全部控件。'),
    rich('校验以控件原生约束为权威：item 的 <code>required</code> 会下沉给控件，<code>validate()</code> 调控件 <code>checkValidity()</code> 并把 <code>validationMessage</code> 渲染到字段下方；手动 <code>error</code> 属性可强制显示自定义错误。'),

    h('h2', null, 'API · x-form'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['layout', '布局预设（一键设 label 位置 + item 流向）', "'vertical' | 'horizontal' | 'inline'", "'vertical'"],
        ['label-position', '轴1：label 与控件上下/左右（覆盖预设）', "'top' | 'left'", "''（由 layout 决定）"],
        ['label-align', '轴1：左右布局时 label 文本对齐', "'start' | 'end' | 'center'", "'start'"],
        ['label-width', '轴1：左右布局时 label 列宽（对齐各行控件）', 'CSS 长度', "'auto'"],
        ['flow', '轴2：item 之间纵向堆叠/横向换行（覆盖预设）', "'stack' | 'row'", "''（由 layout 决定）"],
        ['gap', '轴2：item 间距（令牌别名 none/xs/sm/md/lg 或长度）', 'string', "''（≈ --xie-space-4）"],
        ['disabled', '禁用整个表单（经 fieldset 原生语义下发所有控件）', 'boolean', 'false'],
      ],
    ),
    h('h3', null, '属性 / 方法 / 事件 · x-form'),
    apiTable(
      ['名称', '说明'],
      [
        ['values（读）', '聚合值对象；重复键（多选/复选组/多文件）自动收数组'],
        ['formData()', '原始 FormData（含 File 条目）'],
        ['setValues(obj)', '按 name 批量写入控件值（程序化、不派发）'],
        ['validate(): boolean', '校验全部字段，失败聚焦首个非法项并派发 x-invalid'],
        ['submit()', '触发提交：校验通过派发可取消的 x-submit（默认不导航）'],
        ['reset() / clearValidate()', '还原到初始快照并清错误态 / 仅清错误态'],
        ['x-submit', 'detail:{ values }，cancelable，preventDefault 可拦截后续'],
        ['x-change', '字段变化后转发，detail:{ values }'],
        ['x-invalid', '校验未通过时派发'],
      ],
    ),

    h('h2', null, 'API · x-form-item'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['label', '标签文本（也可用 slot=label 放自定义内容）', 'string', "''"],
        ['name', '绑定键；缺省回退控件自身 name', 'string', "''"],
        ['required', '必填（下沉给控件 + 显示星号）', 'boolean', 'false'],
        ['help', '帮助文本（无错误时显示，muted 色）', 'string', "''"],
        ['error', '手动错误信息（强制显示，优先级最高）', 'string', "''"],
        ['label-position / label-align / label-width', '逐字段覆盖 form 的轴1 布局', 'string', "''（继承 form）"],
      ],
    ),
    h('h3', null, '方法 · x-form-item'),
    apiTable(
      ['名称', '说明'],
      [
        ['control（读）/ value（读）/ fieldName（读）', '内部受控控件 / 其值 / 生效的绑定键'],
        ['validate(): boolean', '校验本字段（走控件原生 checkValidity），渲染错误'],
        ['clearValidate()', '清除本字段错误态'],
      ],
    ),

    h('h2', null, 'API · x-form-footer'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['align', '按钮组对齐', "'start' | 'center' | 'end'", "'start'"],
        ['label-offset', '左右布局下按 label 列宽缩进，令按钮与控件列对齐', 'boolean', 'false'],
      ],
    ),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
