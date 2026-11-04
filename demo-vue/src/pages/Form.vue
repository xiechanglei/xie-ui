<script setup lang="ts">
// Form 表单：布局编排 + FCCE 数据收集 + 原生/自定义校验。
// 「基础用法」x-submit / x-invalid 回显、「校验与提交」命令式 validate(rules) 由 :setup 实现；布局各例为静态。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

type FormHost = Element & { validate: (rules?: Record<string, unknown>) => Promise<boolean>; values: Record<string, unknown> };

// 基础：x-submit detail { values }、x-invalid
const BASIC_SOURCE = `<x-form id="form-basic">
  <x-form-item label="用户名" name="username" required>
    <x-input placeholder="请输入用户名"></x-input>
  </x-form-item>
  <x-form-item label="邮箱" name="email" help="不会公开显示">
    <x-input type="email" placeholder="you@example.com"></x-input>
  </x-form-item>
  <x-form-footer>
    <x-button command="submit">提交</x-button>
    <x-button command="reset" variant="outline">重置</x-button>
  </x-form-footer>
</x-form>
<p id="form-basic-status" style="margin: 12px 0 0; color: var(--xie-color-muted)">尚未提交</p>`;

const setupFormBasic = (root: HTMLElement) => {
  const f = root.querySelector('#form-basic');
  const status = root.querySelector('#form-basic-status');
  if (!f) return;
  f.addEventListener('x-submit', (e) => {
    const val = (e as CustomEvent<{ values: Record<string, unknown> }>).detail.values;
    if (status) status.textContent = '提交成功：' + JSON.stringify(val);
  });
  f.addEventListener('x-invalid', () => {
    if (status) status.textContent = '校验未通过，请检查标红字段';
  });
};

// 校验与提交：命令式 validate(rules)
const VALIDATE_SOURCE = `<x-form id="form-validate" label-width="90px" label-align="end">
  <x-form-item label="账号" name="acc" required>
    <x-input placeholder="必填且≥ 3 位"></x-input>
  </x-form-item>
  <x-form-item label="邮箱" name="mail">
    <x-input type="email" placeholder="选填，填了需合法"></x-input>
  </x-form-item>
  <x-form-item label="验证码" name="code">
    <x-input placeholder="异步校验，输 123456"></x-input>
  </x-form-item>
  <x-form-footer label-offset>
    <x-button id="form-validate-btn" color="primary">校验并提交</x-button>
    <x-button command="reset" variant="outline">清空</x-button>
  </x-form-footer>
</x-form>
<p id="form-validate-out" style="margin: 12px 0 0; color: var(--xie-color-muted)">留空被原生 required 拦下；填了值再走自定义规则（账号≥ 3 位、邮箱合法、验证码试 123456）</p>`;

const setupFormValidate = (root: HTMLElement) => {
  const formEl = root.querySelector('#form-validate');
  const out = root.querySelector('#form-validate-out');
  const btn = root.querySelector('#form-validate-btn');
  if (!formEl || !btn) return;
  const form = formEl as unknown as FormHost;
  const rules: Record<string, unknown> = {
    acc: (v: string) => v.length >= 3 || '账号至少 3 位',
    mail: (v: string) => !v || /.+@.+\..+/.test(v) || '邮箱格式不正确',
    code: async (v: string) => {
      await new Promise((r) => setTimeout(r, 500));
      return v === '123456' || '验证码错误（试试 123456）';
    },
  };
  btn.addEventListener('click', async () => {
    if (out) out.textContent = '校验中…';
    const ok = await form.validate(rules);
    if (out) out.textContent = ok ? '通过 · values = ' + JSON.stringify(form.values) : '未通过，见字段下方提示';
  });
};

// API · x-form
const FORM_PROPS_ROWS = [
  ['layout', '输入项之间的排列（不碰 label）', "'vertical' | 'horizontal'", "'vertical'"],
  ['label-position', 'label 与控件上下/左右（与 layout 无关，property labelPosition）', "'top' | 'left'", "'left'"],
  ['label-align', 'label 文本对齐（仅 left 时有意义，property labelAlign）', "'start' | 'end' | 'center'", "'start'"],
  ['label-width', 'label 列宽；不写时自动测量最宽 label 回填（property labelWidth）', 'CSS 长度', "'auto'（测量）"],
  ['columns', '等宽列数：item 走 grid 分发，文本类控件拉满格宽，footer 通栏', '数字串', "''"],
  ['gap', 'item 间距（别名 none/xs/sm/md/lg/xl 或长度）', 'string', "'20px'"],
  ['disabled', '禁用整个表单（显式置各控件 disabled）', 'boolean', 'false'],
];
const FORM_MEMBERS_ROWS = [
  ['values（读）', '聚合值对象；重复键（多选/复选组/多文件）自动收数组'],
  ['formData()', '原始 FormData（含 File 条目）'],
  ['setValues(obj)', '按 name 批量写入控件值（程序化、不派发）'],
  ['validate(rules?): Promise<boolean>', '校验全部字段（异步）；rules「字段名→断言函数」（返回非空字符串即错误消息，可异步），不传=仅原生约束'],
  ['submit()', '触发提交：校验通过派发可取消的 x-submit（默认不导航）'],
  ['x-button command="submit" / "reset"', '放在本 form 内即自动提交/重置，无需手写 click'],
  ['reset() / clearValidate()', '还原到初始快照并清错误态 / 仅清错误态'],
  ['x-submit', 'detail:{ values }，cancelable，preventDefault 可拦截后续'],
  ['x-change', '字段变化后转发，detail:{ values }'],
  ['x-invalid', '校验未通过时派发'],
];
const FORM_ITEM_PROPS_ROWS = [
  ['label', '标签文本（也可用 slot=label 放自定义内容）', 'string', "''"],
  ['name', '字段绑定键（权威声明处，强制下沉给控件）', 'string', "''"],
  ['required', '必填（下沉给控件 + 显示星号）', 'boolean', 'false'],
  ['help', '帮助文本（无错误时显示，muted 色）', 'string', "''"],
  ['error', '手动错误信息（强制显示，优先级最高）', 'string', "''"],
  ['label-position / label-align / label-width', '逐字段覆盖 form 的轴1 布局', 'string', "''（继承 form）"],
];
const FORM_ITEM_METHODS_ROWS = [
  ['control（读）/ value（读）/ fieldName（读）', '内部受控控件 / 其值 / 生效的绑定键'],
  ['validate(validator?): Promise<boolean>', '校验本字段：先控件原生 checkValidity，通过后跑可选断言函数'],
  ['clearValidate()', '清除本字段错误态'],
];
const FORM_FOOTER_PROPS_ROWS = [
  ['align', '按钮组对齐', "'start' | 'center' | 'end'", "'start'"],
  ['label-offset', 'label 在左时按列宽缩进，令按钮与控件列对齐（footer 本身无条件通栏沉底）', 'boolean', 'false'],
];
</script>

<template>
  <div>
    <h1>Form 表单</h1>
    <p class="lead"><code>x-form</code> 是布局编排 + 数据收集 + 校验调度的容器，<code>x-form-item</code> 把「label + 控件 + 错误/帮助文本」组成可统一排布的单元，<code>x-form-footer</code> 放操作按钮。布局属性两两正交：<code>layout</code> 管输入项之间怎么排，<code>label-position</code> 管 label 在控件上还是左，<code>label-width</code> 不写时自动测量最宽 label 对齐各行控件，<code>gap</code> 管间距；footer 不参与流向、永远独立沉底一行。校验走控件原生约束（required / type / pattern），并可叠加函数式自定义规则 <code>validate(rules)</code>。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-form*</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法（单列 + label 在左）"
      desc="默认组合：layout=vertical + label-position=left + label-width 自动测量对齐；提交/重置靠 command 递交，无需写 click"
      :column="true"
      :source="BASIC_SOURCE"
      :script='`
const form = document.querySelector("#form-basic");
form.addEventListener("x-submit", (e) => {
  console.log("提交成功", e.detail.values);
});
form.addEventListener("x-invalid", () => console.log("校验未通过"));
`'
      :setup="setupFormBasic"
    />

    <Demo
      title="label 在左 + 对齐/列宽 + 按钮缩进"
      desc="固定列宽 label-width、文本右对齐 label-align=end；footer label-offset 让按钮与控件列对齐"
      :column="true"
      :source='`
<x-form label-width="90px" label-align="end">
  <x-form-item label="用户名" name="u1" required><x-input></x-input></x-form-item>
  <x-form-item label="密码" name="p1"><x-input type="password" show-password></x-input></x-form-item>
  <x-form-item label="城市" name="c1">
    <x-select><option>北京</option><option>上海</option><option>广州</option><option>深圳</option></x-select>
  </x-form-item>
  <x-form-footer label-offset align="end"><x-button command="submit">登录</x-button></x-form-footer>
</x-form>
`'
    />

    <Demo
      title="label 左对齐 / 居中"
      desc="label-align 仅在 label-position=left（左右并排）时有意义：start 左、center 居中、end 右"
      :column="true"
      :source='`
<div style="display: flex; flex-direction: column; gap: 20px; width: 100%">
  <div style="font-weight: 600">label-align = start</div>
  <x-form label-position="left" label-width="80px" label-align="start">
    <x-form-item label="昵称" name="ns"><x-input></x-input></x-form-item>
    <x-form-item label="备注" name="rs"><x-input></x-input></x-form-item>
  </x-form>
  <div style="font-weight: 600">label-align = center</div>
  <x-form label-position="left" label-width="80px" label-align="center">
    <x-form-item label="昵称" name="nc"><x-input></x-input></x-form-item>
    <x-form-item label="备注" name="rc"><x-input></x-input></x-form-item>
  </x-form>
  <div style="font-weight: 600">label-align = end</div>
  <x-form label-position="left" label-width="80px" label-align="end">
    <x-form-item label="昵称" name="ne"><x-input></x-input></x-form-item>
    <x-form-item label="备注" name="re"><x-input></x-input></x-form-item>
  </x-form>
</div>
`'
    />

    <Demo
      title="横排筛选栏（超出自动换行）"
      desc="layout=horizontal：输入项横排、容器变窄自动换行；footer 永远独立沉底一行"
      :column="true"
      :source='`
<x-form layout="horizontal">
  <x-form-item label="关键词" name="kw"><x-input placeholder="搜索"></x-input></x-form-item>
  <x-form-item label="类型" name="tp">
    <x-select><option>全部</option><option>文章</option><option>问答</option></x-select>
  </x-form-item>
  <x-form-item label="状态" name="st">
    <x-select><option>全部</option><option>已发布</option><option>草稿</option></x-select>
  </x-form-item>
  <x-form-footer><x-button command="submit" color="primary">查询</x-button><x-button command="reset" variant="ghost">重置</x-button></x-form-footer>
</x-form>
`'
    />

    <Demo
      title="等宽列（columns）"
      desc="columns=N：item 走 grid 等宽分发，文本类控件自动拉满格宽，footer 自动通栏"
      :column="true"
      :source='`
<x-form layout="horizontal" columns="3" label-width="70px" label-align="end">
  <x-form-item label="关键词" name="kw"><x-input placeholder="搜索"></x-input></x-form-item>
  <x-form-item label="类型" name="tp">
    <x-select><option>全部</option><option>文章</option><option>问答</option></x-select>
  </x-form-item>
  <x-form-item label="状态" name="st">
    <x-select><option>全部</option><option>已发布</option><option>草稿</option></x-select>
  </x-form-item>
  <x-form-item label="优先级" name="pri"><x-slider options="低,中,高"></x-slider></x-form-item>
  <x-form-item label="通知" name="ntf"><x-switch></x-switch></x-form-item>
  <x-form-footer><x-button command="submit" color="primary">查询</x-button><x-button command="reset" variant="ghost">重置</x-button></x-form-footer>
</x-form>
`'
    />

    <Demo
      title="校验与提交"
      desc="底层走控件原生约束（required / type=email），叠加 validate(rules) 传「字段名 → 断言函数」（返回非空字符串即错误消息，支持异步）；validate() 统一返回 Promise&lt;boolean&gt;"
      :column="true"
      :source="VALIDATE_SOURCE"
      :script='`
const form = document.querySelector("#form-validate");
document.querySelector("#form-validate-btn").addEventListener("click", async () => {
  const ok = await form.validate({
    acc: (v) => v.length >= 3 || "账号至少 3 位",
    mail: (v) => !v || /.+@.+\..+/.test(v) || "邮箱格式不正确",
    code: async (v) => {
      await new Promise((r) => setTimeout(r, 500));
      return v === "123456" || "验证码错误";
    },
  });
  console.log(ok ? "通过" : "未通过", form.values);
});
`'
      :setup="setupFormValidate"
    />

    <h2>设计要点</h2>
    <p>布局属性两两正交：<code>layout</code> 只管输入项之间（vertical 纵列（默认）/ horizontal 横排换行）；<code>label-position</code> 只管 label 与控件（top / left，默认左）；<code>label-width</code> 不写时 x-form 自动测量最宽 label 回填；<code>columns</code>=N 时 item 改走 grid 等宽分发。<code>x-form-footer</code> 永远无条件通栏、独立在表单最下面一行。</p>
    <p>数据收集：x-form 统一遍历「最外层」控件，按各控件公开值面（<code>value</code>/<code>checked</code>/<code>files</code>/<code>values</code>）聚合出 <code>values</code> / <code>formData()</code>，重复键自动收数组、禁用项与未勾选不计入。提交入口不写监听：footer 里放 <code>&lt;x-button command="submit"&gt;</code> / <code>command="reset"</code> 即可，命令沿祖先链上传由第一个认领者（x-form）接走。</p>

    <h2>API · x-form</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="FORM_PROPS_ROWS" />
    <ApiTable title="属性 / 方法 / 事件" :columns="['名称', '说明']" :rows="FORM_MEMBERS_ROWS" />

    <h2>API · x-form-item</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="FORM_ITEM_PROPS_ROWS" />
    <ApiTable title="方法 Methods" :columns="['名称', '说明']" :rows="FORM_ITEM_METHODS_ROWS" />

    <h2>API · x-form-footer</h2>
    <ApiTable :columns="['属性', '说明', '类型', '默认值']" :rows="FORM_FOOTER_PROPS_ROWS" />
  </div>
</template>
