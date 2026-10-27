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
/** x-select 的 options 是 JS 数组属性（非 attribute），且优先于 light DOM <option>；演示里统一用属性赋值 */
function sel(items) {
  const el = document.createElement('x-select');
  el.options = items;
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
      'x-form 是布局编排 + 数据收集 + 校验调度的容器，x-form-item 把「label + 控件 + 错误/帮助文本」组成可统一排布的单元，x-form-footer 放操作按钮。布局属性两两正交：layout 管输入项之间怎么排（vertical 纵列（默认）/ horizontal 横排换行），label-position 管 label 在控件上还是左（默认左，与 layout 无关），label-width 不写时自动测量最宽 label 对齐各行控件，gap 管间距；footer 不参与流向、永远独立沉底一行。数据收集由 x-form 统一遍历内部控件、按各自公开的值面聚合出 values（重复键自动收数组）；校验走控件原生约束（required / type / pattern），错误信息渲染到字段下方。',
    ),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础用法（单列 + label 在左）',
      desc: '默认组合：layout=vertical（item 逐行堆叠）+ label-position=left + label-width 自动测量对齐，单列长表单直接用最简写法；label 在上需显式写 label-position=top',
      build: (c) => {
        const f = form();
        const status = h('p', { class: 'demo-card__title' }, '尚未提交');
        f.append(
          fi('用户名', { name: 'username', required: '' }, ctl('x-input', { placeholder: '请输入用户名' })),
          fi('邮箱', { name: 'email', help: '不会公开显示' }, ctl('x-input', { type: 'email', placeholder: 'you@example.com' })),
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
    <x-input placeholder="请输入用户名"></x-input>
  </x-form-item>
  <x-form-item label="邮箱" name="email" help="不会公开显示">
    <x-input type="email"></x-input>
  </x-form-item>
  <x-form-footer>
    <x-button onclick="form.submit()">提交</x-button>
    <x-button variant="outline" onclick="form.reset()">重置</x-button>
  </x-form-footer>
</x-form>`,
    }),

    demoCard({
      title: 'label 在左 + 对齐/列宽 + 按钮缩进',
      desc: 'label-position=left（已是默认）下固定列宽 label-width、文本右对齐 label-align=end；footer label-offset 让按钮与控件列对齐（layout 保持默认 vertical 逐行）',
      build: (c) => {
        const f = form({ 'label-width': '90px', 'label-align': 'end' });
        f.append(
          fi('用户名', { name: 'u1', required: '' }, ctl('x-input')), 
          fi('密码', { name: 'p1' }, ctl('x-input', { type: 'password', 'show-password': '' })),
          fi('城市', { name: 'c1' }, sel(['北京', '上海', '广州', '深圳'])),
          footer({ 'label-offset': '', align: 'end' }, btn('登录')),
        );
        c.append(f);
      },
      code: `<x-form label-width="90px" label-align="end">
  <x-form-item label="用户名" name="u1" required><x-input></x-input></x-form-item>
  <x-form-item label="密码" name="p1"><x-input type="password" show-password></x-input></x-form-item>
  <x-form-footer label-offset align="end"><x-button>登录</x-button></x-form-footer>
</x-form>`,
    }),

    demoCard({
      title: 'label 左对齐 / 居中',
      desc: 'label-align 只在 label-position=left（左右并排）时有意义：start 左、center 居中、end 右',
      build: (c) => {
        const wrap = h('div', { style: 'display:flex;flex-direction:column;gap:20px;width:100%' });
        for (const align of ['start', 'center', 'end']) {
          const f = form({ 'label-position': 'left', 'label-width': '80px', 'label-align': align });
          f.append(
            fi('昵称', { name: 'n' + align }, ctl('x-input')),
            fi('备注', { name: 'r' + align }, ctl('x-input')),
          );
          wrap.append(h('div', { class: 'demo-card__title' }, 'label-align = ' + align), f);
        }
        c.append(wrap);
      },
      code: `<x-form label-position="left" label-width="80px" label-align="center">…</x-form>`,
    }),

    demoCard({
      title: '横排筛选栏（超出自动换行）',
      desc: 'layout=horizontal：输入项横排、容器变窄自动换行；配默认的 label-position=left 即筛选栏经典形态，footer 永远独立沉底一行',
      build: (c) => {
        const f = form({ layout: 'horizontal' });
        f.append(
          fi('关键词', { name: 'kw' }, ctl('x-input', { placeholder: '搜索' })),
          fi('类型', { name: 'tp' }, sel(['全部', '文章', '问答'])),
          fi('状态', { name: 'st' }, sel(['全部', '已发布', '草稿'])),
          footer({}, btn('查询', { color: 'primary' }), btn('重置', { variant: 'ghost' })),
        );
        c.append(f);
      },
      code: `<x-form layout="horizontal">
  <x-form-item label="关键词" name="kw"><x-input></x-input></x-form-item>
  <x-form-item label="类型" name="tp">
    <x-select>
      <option>全部</option><option>文章</option><option>问答</option>
    </x-select>
  </x-form-item>
  <x-form-footer><x-button>查询</x-button></x-form-footer>
</x-form>
<!-- 横排需显式写 layout=horizontal（默认 vertical）；绑定键只写在 x-form-item 的 name 上（自动下沉给控件）；选项二选一：light DOM <option>（如上）或 JS 赋数组 s.options = ['全部','文章','问答'] -->`,
    }),

    demoCard({
      title: '等宽列（columns）',
      desc: 'columns=N：item 改走 grid 等宽分发，根治横排长短不齐；文本类控件（input/textarea/select/file）自动拉满格宽，footer 自动通栏。horizontal+columns=3 即三列筛选栏；纵向+columns=2 即双列桌面表单',
      build: (c) => {
        const f = form({ layout: 'horizontal', columns: '3', 'label-width': '70px', 'label-align': 'end' });
        f.append(
          fi('关键词', { name: 'kw' }, ctl('x-input', { placeholder: '搜索' })),
          fi('类型', { name: 'tp' }, sel(['全部', '文章', '问答'])),
          fi('状态', { name: 'st' }, sel(['全部', '已发布', '草稿'])),
          fi('优先级', { name: 'pri' }, ctl('x-slider', { options: '低,中,高' })),
          fi('通知', { name: 'ntf' }, ctl('x-switch')),
          footer({}, btn('查询', { color: 'primary' }), btn('重置', { variant: 'ghost' })),
        );
        c.append(f);
      },
      code: `<x-form layout="horizontal" columns="3" label-width="70px" label-align="end">
  <x-form-item label="关键词" name="kw"><x-input></x-input></x-form-item>
  <x-form-item label="类型" name="tp"><x-select>…</x-select></x-form-item>
  <x-form-item label="状态" name="st"><x-select>…</x-select></x-form-item>
  <x-form-footer><x-button>查询</x-button></x-form-footer>
</x-form>
<!-- 双列桌面表单：<x-form columns="2" label-width="90px"> -->`,
    }),

    demoCard({
      title: '校验与提交',
      desc: 'required 必填 + type=email/pattern 正则走原生约束；submit() 校验通过后派发可取消的 x-submit（detail.values 为聚合值）',
      build: (c) => {
        const f = form({ 'label-width': '80px', 'label-align': 'end' });
        const out = h('p', { class: 'demo-card__title' }, '点“提交”试试：留空 / 非法邮箱会被拦下');
        f.append(
          fi('账号', { name: 'acc', required: '' }, ctl('x-input', { placeholder: '必填' })),
          fi('邮箱', { name: 'mail', required: '' }, ctl('x-input', { type: 'email', placeholder: '需合法邮箱' })),
          fi('验证码', { name: 'code', error: '' }, ctl('x-input', { maxlength: '6', placeholder: '最多 6 位' })),
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
    rich('布局属性两两正交、各管一轴：<code>layout</code> 只管输入项之间（vertical 纵列（默认）/ horizontal 横排换行）；<code>label-position</code> 只管 label 与控件（top / left，默认左，与 layout 无关）；<code>label-width</code> 定 label 列宽——<b>不写时 x-form 自动测量最宽 label 回填</b>（等全部 item 首渲染就绪后测自然宽，动态增删字段会重测收敛），<code>label-align</code> 定 label 文本对齐（仅 left 模式有意义）；<code>gap</code> 管间距（默认 20px）；轴3 按钮区（<code>x-form-footer</code> 的 <code>align</code> + <code>label-offset</code>）。开箱即单列桌面表单（label 在左自动对齐）；加 layout=horizontal 得筛选栏，label-position=top 得 label 在上形态。<code>columns</code>=N 时 item 改走 grid 等宽分发（长短不齐的根治方案）：文本类控件自动拉满格宽，纵向用它得双列表单，横排用它得 N 列筛选栏。footer 不参与流向：无论 flex/grid、横排/纵排，<code>x-form-footer</code> 永远无条件通栏、独立在表单最下面一行（它是全表单的动作区，不是又一个输入项）。'),
    rich('字段信息集中在 <code>x-form-item</code>：label / <code>name</code> / required / help 都写在 item 上，一个字段一个声明处。<code>name</code> 是权威绑定键，自动下沉给内部控件（覆盖控件自写的）；控件自己的 name 仅在 item 未写时生效，所以把控件脱离 form-item 放进页面原生 <code>&lt;form&gt;</code> 时照常工作。'),
    rich('数据收集：x-form 统一遍历「最外层」控件，按各控件公开的值面（<code>value</code>/<code>checked</code>/<code>files</code>/<code>values</code>）聚合出 <code>values</code> / <code>formData()</code>，重复键自动收数组、禁用项与未勾选不计入。为何不靠 <code>new FormData()</code>：表单归属是「节点树」概念，x-form shadow 内的 <code>&lt;form&gt;</code> 关联不到被 slot 投影进来的控件（实测连原生 <code>&lt;input&gt;</code> 也不行）；而控件自带的 FCCE 仍在——你把它们直接放进页面原生 <code>&lt;form&gt;</code> 时仍能自动计入。<code>disabled</code> 同样因跨树无法靠 <code>&lt;fieldset&gt;</code> 原生下发，改由 x-form 显式置各控件。'),
    rich('校验以控件原生约束为权威：item 的 <code>required</code> 会下沉给控件，<code>validate()</code> 调控件 <code>checkValidity()</code> 并把 <code>validationMessage</code> 渲染到字段下方；手动 <code>error</code> 属性可强制显示自定义错误。'),

    h('h2', null, 'API · x-form'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['layout', '输入项之间的排列（不碰 label）', "'vertical' | 'horizontal'", "'vertical'"],
        ['label-position', 'label 与控件上下/左右（与 layout 无关）', "'top' | 'left'", "'left'"],
        ['label-align', 'label 文本对齐（仅 label-position=left 时有意义）', "'start' | 'end' | 'center'", "'start'"],
        ['label-width', 'label 列宽（对齐各行控件）；不写时自动测量最宽 label 回填', 'CSS 长度', "'auto'（测量）"],
        ['columns', '等宽列数：item 改走 grid 分发，文本类控件拉满格宽，footer 通栏；空=保持 flex 自然宽', '数字串', "''"],
        ['gap', 'item 间距（令牌别名 none/xs/sm/md/lg/xl 或长度）', 'string', "'20px'（--xie-space-5）"],
        ['disabled', '禁用整个表单（显式置每个控件 disabled）', 'boolean', 'false'],
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
        ['name', '字段绑定键（权威声明处，强制下沉给控件；控件自写的仅在 item 未写时生效）', 'string', "''"],
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
        ['label-offset', 'label 在左模式下按 label 列宽缩进，令按钮与控件列对齐（footer 本身无条件通栏沉底）', 'boolean', 'false'],
      ],
    ),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
