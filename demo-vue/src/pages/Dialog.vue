<script setup lang="ts">
// Dialog 对话框：与 Drawer 同构的居中浮层（x-dialog + x-dialog-header / x-dialog-footer）。
// 五例都需外部按钮触发 show()；基础/协议例含 hide() 与 x-close 回显、表单例监听 x-submit / x-invalid，均由 :setup 实现。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

type DialogHost = Element & { show: () => void; hide: () => void; toggle: () => void; closable: boolean };

const P_STYLE = 'margin: 0 0 12px; color: var(--xie-color-muted); line-height: 1.7';

const QUICK_SOURCE = `<x-button id="dlg-quick-btn" variant="soft" color="primary">打开快捷对话框（只写 title）</x-button>
<x-dialog id="dlg-quick" title="快捷对话框" subtitle="仅靠 title / subtitle 自动生成头部" label="快捷对话框">
  <div>
    <p style="${P_STYLE}">这里只写了 title / subtitle 两个属性，没有手写 x-dialog-header：对话框自动补出一个带关闭按钮的头部（title 会被转入 property，故不会冒出原生 tooltip）。开合由 open 反射属性驱动：el.show() / el.hide() / el.toggle() / el.open = true。</p>
  </div>
</x-dialog>`;

const setupDialogQuick = (root: HTMLElement) => {
  const btn = root.querySelector('#dlg-quick-btn');
  const d = root.querySelector('#dlg-quick') as DialogHost | null;
  if (!btn || !d) return;
  btn.addEventListener('click', () => d.show());
};

const BASE_SOURCE = `<x-button id="dlg-base-btn" variant="solid">打开基础对话框</x-button>
<x-dialog id="dlg-base" label="示例对话框">
  <x-dialog-header show-close subtitle="改动在保存后生效">编辑资料</x-dialog-header>
  <div>
    <p style="${P_STYLE}">头部是显式写的 x-dialog-header（show-close + subtitle），底部是 x-dialog-footer：取消只写 command="close"，确定绑 click 在 hide() 前打日志。写了显式 header 后，自动生成的那个会让位。</p>
  </div>
  <x-dialog-footer>
    <x-button command="close">取消</x-button>
    <x-button id="dlg-base-ok" variant="solid" color="primary">确定</x-button>
  </x-dialog-footer>
</x-dialog>
<div id="dlg-base-log" style="margin-top: 8px; color: var(--xie-color-muted)">事件：无</div>`;

const setupDialogBase = (root: HTMLElement) => {
  const btn = root.querySelector('#dlg-base-btn');
  const ok = root.querySelector('#dlg-base-ok');
  const d = root.querySelector('#dlg-base') as DialogHost | null;
  const log = root.querySelector('#dlg-base-log');
  if (!btn || !d) return;
  btn.addEventListener('click', () => d.show());
  if (ok) ok.addEventListener('click', () => d.hide());
  if (log) d.addEventListener('x-close', () => (log.textContent = '事件：x-close 已触发（' + new Date().toLocaleTimeString() + '）'));
};

const STRICT_SOURCE = `<x-button id="dlg-strict-btn" variant="outline">打开不可关闭的对话框（closable=false）</x-button>
<x-dialog id="dlg-strict" label="必读协议" title="服务条款有更新" closable="false">
  <div>
    <p style="${P_STYLE}">本对话框写了 closable="false"：点遮罩、按 Esc 都不会关闭，头部那个关闭按钮也不再出现。只有点下面两个按钮（一个写 command="close"、一个调 hide()）才会关——命令式入口不受这个旋钮限制。</p>
  </div>
  <x-dialog-footer>
    <x-button command="close">稍后再说</x-button>
    <x-button id="dlg-strict-ok" variant="solid" color="primary">我已阅读并同意</x-button>
  </x-dialog-footer>
</x-dialog>`;

const setupDialogStrict = (root: HTMLElement) => {
  const btn = root.querySelector('#dlg-strict-btn');
  const ok = root.querySelector('#dlg-strict-ok');
  const d = root.querySelector('#dlg-strict') as DialogHost | null;
  if (!btn || !d) return;
  btn.addEventListener('click', () => d.show());
  if (ok) ok.addEventListener('click', () => d.hide());
};

const LONG_BODY = Array.from({ length: 12 }, (_, i) => `    <p style="${P_STYLE}">第 ${i + 1} 段：内容超出面板可用高度时，只有这一块滚动，顶部标题与底部按钮始终固定不跟着滚。</p>`).join('\n');
const LONG_SOURCE = `<x-button id="dlg-long-btn" variant="outline" color="secondary">打开长内容对话框（width=640px）</x-button>
<x-dialog id="dlg-long" title="版本更新说明" width="640px" label="版本更新说明">
  <div>
${LONG_BODY}
  </div>
  <x-dialog-footer>
    <x-button command="close" variant="solid">知道了</x-button>
  </x-dialog-footer>
</x-dialog>`;

const setupDialogLong = (root: HTMLElement) => {
  const btn = root.querySelector('#dlg-long-btn');
  const d = root.querySelector('#dlg-long') as DialogHost | null;
  if (!btn || !d) return;
  btn.addEventListener('click', () => d.show());
};

const FORM_SOURCE = `<x-button id="dlg-form-btn" variant="soft" color="success">打开含表单的对话框</x-button>
<x-dialog id="dlg-form" title="新建标签" subtitle="提交后出现在列表里" label="新建标签">
  <x-form id="dlg-form-el">
    <x-form-item label="名称" name="tag" required>
      <x-input placeholder="必填"></x-input>
    </x-form-item>
    <x-dialog-footer>
      <x-button command="close">取消</x-button>
      <x-button command="submit" variant="solid" color="primary">保存</x-button>
    </x-dialog-footer>
  </x-form>
</x-dialog>
<div id="dlg-form-out" style="margin-top: 8px; color: var(--xie-color-muted)">提交结果：无</div>`;

const setupDialogForm = (root: HTMLElement) => {
  const btn = root.querySelector('#dlg-form-btn');
  const d = root.querySelector('#dlg-form') as DialogHost | null;
  const form = root.querySelector('#dlg-form-el');
  const out = root.querySelector('#dlg-form-out');
  if (!btn || !d) return;
  btn.addEventListener('click', () => d.show());
  if (form && out) {
    form.addEventListener('x-submit', (e) => {
      out.textContent = '提交结果：' + JSON.stringify((e as CustomEvent<{ values: Record<string, unknown> }>).detail.values);
      d.hide();
    });
    form.addEventListener('x-invalid', () => (out.textContent = '提交结果：校验未通过（见字段下方红字）'));
  }
};

// API
const DIALOG_PROPS_ROWS = [
  ['open', '是否展开（反射属性）', 'boolean', 'false'],
  ['width', '面板宽度（面板内超高由中部滚动消化）', 'string (CSS 长度)', "'480px'"],
  ['closable', '是否允许用户关闭：点遮罩 / 按 Esc / 头部关闭按钮一并生效；hide() 不受限制（反射；同时承认字面量假值 closable="false"）', 'boolean', 'true'],
  ['lock-scroll', '展开时锁定页面滚动', 'boolean', 'true'],
  ['label', '无障碍名称（aria-label）；留空时回退用 title', 'string', "''"],
  ['title', '快捷头部主标题：无显式 header 时自动生成带头部；属性会被转入 property', 'string', "''"],
  ['subtitle', '快捷头部副标题（自动头部内以 x-text caption 排于主标题下方）', 'string', "''"],
];
const HEADER_PROPS_ROWS = [
  ['show-close', '显示右侧关闭按钮（点击向上递交 close 命令，由所属对话框认领后关闭）', 'boolean', 'false'],
  ['subtitle', '主标题下方的次要说明行（复用 x-text variant="caption"）；留空不渲染', 'string', "''"],
];
const COMPOSITION_ROWS = [
  ['x-dialog-header', '头部：默认插槽放标题；subtitle 放副标题；show-close 控制关闭按钮；与内容无分隔线'],
  ['（普通元素）', '中部主体：作为 x-dialog 直接子元素，自动占据剩余高度并可滚动、留白（建议用单个包裹元素）'],
  ['x-dialog-footer', '底部操作区：内容右对齐、贴底；与内容无分隔线'],
];
const DIALOG_METHODS_ROWS = [
  ['show()', '打开对话框'],
  ['hide()', '关闭对话框（先派发可取消的 x-close）；不受 closable 限制'],
  ['toggle()', '切换'],
];
const DIALOG_EVENTS_ROWS = [['x-close', '遮罩点击 / Esc / header 关闭按钮 / hide() 时派发，cancelable', '无']];
const DIALOG_PARTS_ROWS = [
  ['scrim', 'x-dialog', '半透明遮罩（同时是居中容器）'],
  ['panel', 'x-dialog', '居中的面板容器'],
  ['header', 'x-dialog', '自动生成的头部（仅快捷用法）'],
  ['title', 'x-dialog-header', '标题文字容器'],
  ['subtitle', 'x-dialog-header', '副标题（x-text）'],
  ['close', 'x-dialog-header', '关闭按钮'],
];
</script>

<template>
  <div>
    <h1>Dialog 对话框</h1>
    <p class="lead">视口中央的模态浮层，自带遮罩、Esc 关闭与滚动锁。与 Drawer 同一套模式：快捷只给 title / subtitle（自动生成带关闭按钮的头部），或显式组合 <code>&lt;x-dialog-header&gt;</code> / <code>&lt;x-dialog-footer&gt;</code>（与内容无分隔线，中部内容自动滚动）。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-dialog / x-dialog-header / x-dialog-footer</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="快捷用法（title / subtitle）"
      desc="不放 header 子元素时，对话框自动生成一个 show-close 的头部；适合「一句话拉起一个对话框」"
      :source="QUICK_SOURCE"
      :script='`
const btn = document.querySelector("#dlg-quick-btn");
const dialog = document.querySelector("#dlg-quick");
btn.addEventListener("click", () => dialog.show());
`'
      :setup="setupDialogQuick"
    />

    <Demo
      title="基础用法（header + footer 子组件）"
      desc="需要定制头部内容或去掉关闭按钮时，回到显式 x-dialog-header；此时内部自动头部让位"
      :source="BASE_SOURCE"
      :script='`
const btn = document.querySelector("#dlg-base-btn");
const dialog = document.querySelector("#dlg-base");
btn.addEventListener("click", () => dialog.show());
document.querySelector("#dlg-base-ok").addEventListener("click", () => dialog.hide());
dialog.addEventListener("x-close", () => console.log("已关闭"));
`'
      :setup="setupDialogBase"
    />

    <Demo
      title="closable=false（只能由按钮关闭）"
      desc="点遮罩 / 按 Esc / 头部关闭按钮三条用户关闭路径一并禁用，适合必读协议、不可跳过的场景"
      :source="STRICT_SOURCE"
      :script='`
const dialog = document.querySelector("#dlg-strict");
// closable="false"：遮罩 / Esc / 关闭按钮都失效；hide() 与 command="close" 仍可用
document.querySelector("#dlg-strict-ok").addEventListener("click", () => dialog.hide());
`'
      :setup="setupDialogStrict"
    />

    <Demo
      title="长内容 + 自定义宽度"
      desc="width 决定面板宽度（默认 480px）；内容超高时只有中部滚动，header/footer 常驻"
      :source="LONG_SOURCE"
      :script='`
const btn = document.querySelector("#dlg-long-btn");
const dialog = document.querySelector("#dlg-long");
btn.addEventListener("click", () => dialog.show());
`'
      :setup="setupDialogLong"
    />

    <Demo
      title="装表单（配合 x-form）"
      desc="footer 要放进 x-form 里：命令沿冒泡链上传、只认祖先，兄弟节点够不着"
      :source="FORM_SOURCE"
      :script='`
const btn = document.querySelector("#dlg-form-btn");
const dialog = document.querySelector("#dlg-form");
const form = document.querySelector("#dlg-form-el");
btn.addEventListener("click", () => dialog.show());
form.addEventListener("x-submit", (e) => {
  console.log(e.detail.values);
  dialog.hide();
});
form.addEventListener("x-invalid", () => console.log("校验未通过"));
`'
      :setup="setupDialogForm"
    />

    <h2>与抽屉的关系</h2>
    <p><code>x-dialog</code> 与 <code>x-drawer</code> 共用同一套浮层基建：<code>x-dialog-header</code> / <code>x-dialog-footer</code> 直接继承抽屉的头部与底部（只换标签名）；滚动锁跨实例计数、按 <code>Esc</code> 只关「最上面那层」浮层——抽屉里再开对话框，一次 Esc 不会把两个一起关掉。二者的选择只在于内容量与是否打断主线流程：短确认/单字段用对话框，长设置/详情用抽屉。</p>

    <h2>命令只沿冒泡链找祖先</h2>
    <p><code>command</code> 是把意图包成事件<b>向上冒泡</b>，由链上第一个认领者接走——因此触发按钮必须是目标组件的<b>后代</b>。往对话框里塞表单时：<code>x-dialog → x-form → 字段 + x-dialog-footer</code> 可行（<code>submit</code> 被 x-form 就近认领，<code>close</code> 越过 x-form 继续上传被 x-dialog 认领）；而把 footer 与 form 写成兄弟节点时，<code>submit</code> 一路上行碰不到 form。代价是 footer 嵌进 form 后就不是对话框直接子元素，会跟正文一起在中部滚动区里滚。需按钮常驻时反过来写：footer 作为 <code>x-dialog</code> 直接子元素，提交钮改绑 click 调 <code>form.submit()</code>。</p>

    <h2>API</h2>
    <ApiTable title="x-dialog · 属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="DIALOG_PROPS_ROWS" />
    <ApiTable title="x-dialog-header · 属性" :columns="['属性', '说明', '类型', '默认值']" :rows="HEADER_PROPS_ROWS" />
    <ApiTable title="结构 Composition" :columns="['标签', '说明']" :rows="COMPOSITION_ROWS" />
    <ApiTable title="方法 Methods（x-dialog）" :columns="['方法', '说明']" :rows="DIALOG_METHODS_ROWS" />
    <ApiTable title="事件 Events" :columns="['事件', '说明', 'detail']" :rows="DIALOG_EVENTS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '所属', '说明']" :rows="DIALOG_PARTS_ROWS" />
  </div>
</template>
