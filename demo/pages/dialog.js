/** Dialog 对话框文档：与 Drawer 同构的居中浮层。快捷用法 <x-dialog title subtitle>（自动生成带关闭按钮的头部），或显式 <x-dialog-header show-close> / <x-dialog-footer>，与内容无分隔线 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

function button(label, attrs = {}) {
  const b = document.createElement('x-button');
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, String(v));
  b.textContent = label;
  return b;
}

/** 用 style 属性安全建元素（render.js 的 h 对 style 键无效）；兼作主体包裹元素 */
function box(style, ...kids) {
  const e = document.createElement('div');
  if (style) e.setAttribute('style', style);
  e.append(...kids);
  return e;
}

/** 一段说明文字（主体内容用） */
function para(text) {
  const p = document.createElement('p');
  p.setAttribute('style', 'margin:0 0 12px;color:var(--xie-color-muted);line-height:1.7');
  p.textContent = text;
  return p;
}

/**
 * 建一个对话框：
 * opts.quick 走“只写 title/subtitle”的快捷用法；opts.closable === false 关掉用户关闭路径；
 * opts.width 面板宽度；opts.footer 补 x-dialog-footer（按钮文案走 ok/cancel）；opts.body 自定义主体。
 */
function makeDialog(opts) {
  const d = document.createElement('x-dialog');
  if (opts.label) d.setAttribute('label', opts.label);
  if (opts.width) d.setAttribute('width', opts.width);
  if (opts.closable === false) d.closable = false; // 布尔属性认字面量假值，写 closable="false" 也关；这里走 property 同样成立

  // 快捷用法：只给 title/subtitle，不放 header 子元素 —— 对话框自动生成带关闭按钮的头部
  if (opts.quick) {
    d.setAttribute('title', opts.title || '');
    if (opts.subtitle) d.setAttribute('subtitle', opts.subtitle);
  } else if (opts.title) {
    const header = document.createElement('x-dialog-header');
    if (opts.showClose !== false) header.setAttribute('show-close', '');
    if (opts.subtitle) header.setAttribute('subtitle', opts.subtitle);
    header.textContent = opts.title;
    d.append(header);
  }

  d.append(opts.body ? opts.body() : box(null, para(opts.text || '这里是对话框主体（默认插槽）。header / footer 是独立子组件，与内容之间没有分隔线；中部内容超高时自动滚动，footer 始终贴在底部。')));

  if (opts.footer) {
    const footer = document.createElement('x-dialog-footer');
    // 取消：不写一行监听，只声明 command，交给 x-dialog 认领后走 hide()
    const cancel = button(opts.cancel || '取消', { command: 'close' });
    // 确定：需要在关之前插自己的逻辑（打日志、提交）时，仍照旧绑 click 调 hide()
    const ok = button(opts.ok || '确定', { variant: 'solid', color: 'primary' });
    ok.addEventListener('click', () => (opts.onOk ? opts.onOk(d) : d.hide()));
    footer.append(cancel, ok);
    d.append(footer);
  }
  return d;
}

export function render(el) {
  /* —— 1. 快捷用法 —— */
  const quickDialog = makeDialog({
    quick: true,
    title: '快捷对话框',
    subtitle: '仅靠 title / subtitle 自动生成头部',
    label: '快捷对话框',
    text: '这里只写了 title / subtitle 两个属性，没有手写 <x-dialog-header>：对话框自动补出一个带关闭按钮的头部（title 会被转入 property，故不会冒出原生 tooltip）。',
  });
  const quickBtn = button('打开快捷对话框（只写 title）', { variant: 'soft', color: 'primary' });
  quickBtn.addEventListener('click', () => quickDialog.show());

  /* —— 2. 显式 header + footer —— */
  const evtLog = h('div', { class: 'demo-card__title' }, '事件：无');
  const baseDialog = makeDialog({
    label: '示例对话框',
    title: '编辑资料',
    subtitle: '改动在保存后生效',
    footer: true,
    text: '头部是显式写的 <x-dialog-header show-close subtitle="…">，底部是 <x-dialog-footer>（取消只写 command="close"，确定绑 click 在 hide() 前先打个日志）。需要富标题（图标、标签）时就这样写；写了显式 header 后，自动生成的那个会让位。',
  });
  const baseBtn = button('打开基础对话框', { variant: 'solid' });
  baseBtn.addEventListener('click', () => baseDialog.show());
  baseDialog.addEventListener('x-close', () => {
    evtLog.textContent = '事件：x-close 已触发（' + new Date().toLocaleTimeString() + '）';
  });

  /* —— 3. closable=false：强阻断，只能由按钮 hide() —— */
  const strictDialog = makeDialog({
    label: '必读协议',
    title: '服务条款有更新',
    closable: false,
    footer: true,
    ok: '我已阅读并同意',
    cancel: '稍后再说',
    text: '本对话框写了 closable="false"：点遮罩、按 Esc 都不会关闭，头部那个关闭按钮也不再出现。只有点下面两个按钮（一个写 command="close"、一个调 hide()）才会关——命令式入口不受这个旋钮限制。',
  });
  const strictBtn = button('打开不可关闭的对话框（closable=false）', { variant: 'outline' });
  strictBtn.addEventListener('click', () => strictDialog.show());

  /* —— 4. 长内容：中部滚动，header/footer 常驻 —— */
  const longBody = () =>
    box(
      null,
      ...Array.from({ length: 12 }, (_, i) => para(`第 ${i + 1} 段：内容超出面板可用高度时，只有这一块滚动，顶部标题与底部按钮始终固定不跟着滚。`)),
    );
  const longDialog = makeDialog({
    quick: true,
    title: '版本更新说明',
    width: '640px',
    footer: true,
    ok: '知道了',
    body: longBody,
  });
  const longBtn = button('打开长内容对话框（width=640px）', { variant: 'outline', color: 'secondary' });
  longBtn.addEventListener('click', () => longDialog.show());

  /* —— 5. 装表单：x-dialog + x-form，提交靠 x-button command=submit —— */
  const formDialog = document.createElement('x-dialog');
  formDialog.setAttribute('label', '新建标签');
  formDialog.setAttribute('title', '新建标签');
  formDialog.setAttribute('subtitle', '提交后出现在列表里');
  const formOut = h('div', { class: 'demo-card__title' }, '提交结果：无');
  const form = document.createElement('x-form');
  form.append(
    (() => {
      const item = document.createElement('x-form-item');
      item.setAttribute('label', '名称');
      item.setAttribute('name', 'tag');
      item.setAttribute('required', '');
      const input = document.createElement('x-input');
      input.setAttribute('placeholder', '必填');
      item.append(input);
      return item;
    })(),
  );
  const formFooter = document.createElement('x-dialog-footer');
  // 取消：向上递交 close，跳过中间的 x-form（它只认领 submit/reset）由 x-dialog 接走
  const formCancel = button('取消', { command: 'close' });
  // 提交：命令沿冒泡链上传、只认祖先，所以 footer 必须放进 x-form 里才打得到它（见下方「装表单」的说明）
  const formSubmit = button('保存', { command: 'submit', variant: 'solid', color: 'primary' });
  formFooter.append(formCancel, formSubmit);
  form.append(formFooter);
  formDialog.append(form);
  form.addEventListener('x-submit', (e) => {
    formOut.textContent = '提交结果：' + JSON.stringify(e.detail.values);
    formDialog.hide();
  });
  form.addEventListener('x-invalid', () => {
    formOut.textContent = '提交结果：校验未通过（见字段下方红字）';
  });
  const formBtn = button('打开含表单的对话框', { variant: 'soft', color: 'success' });
  formBtn.addEventListener('click', () => formDialog.show());

  el.append(
    h('h1', null, 'Dialog 对话框'),
    h(
      'p',
      { class: 'lead' },
      '视口中央的模态浮层，自带遮罩、Esc 关闭与滚动锁。与 Drawer 同一套模式：快捷只给 title / subtitle（自动生成带关闭按钮的头部），或显式组合 <x-dialog-header> / <x-dialog-footer>（与内容无分隔线，中部内容自动滚动）。',
    ),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),
    demoCard({
      title: '快捷用法（title / subtitle）',
      desc: '不放 header 子元素时，对话框自动生成一个 show-close 的 <x-dialog-header>；适合“一句话拉起一个对话框”',
      build: (c) => c.append(quickBtn, quickDialog),
      code:
        `<x-dialog title="快捷对话框" subtitle="仅靠 title / subtitle 自动生成头部">\n` +
        `  <div><!-- 主体内容 --></div>\n` +
        `</x-dialog>\n` +
        `<!-- 开合由 open 反射属性驱动：el.show() / el.hide() / el.toggle() / el.open = true -->`,
    }),
    demoCard({
      title: '基础用法（header + footer 子组件）',
      desc: '需要定制头部内容（富标题、标签、图标）或去掉关闭按钮时，回到显式 <x-dialog-header>；此时内部自动头部让位',
      build: (c) => c.append(baseBtn, baseDialog, evtLog),
      code:
        `<x-dialog label="示例对话框">\n` +
        `  <x-dialog-header show-close subtitle="改动在保存后生效">编辑资料</x-dialog-header>\n` +
        `  <div><!-- 主体内容 --></div>\n` +
        `  <x-dialog-footer>\n` +
        `    <x-button command="close">取消</x-button>\n` +
        `    <x-button command="close" variant="solid" color="primary">确定</x-button>\n` +
        `  </x-dialog-footer>\n` +
        `</x-dialog>`,
    }),
    demoCard({
      title: 'closable=false（只能由按钮关闭）',
      desc: '点遮罩 / 按 Esc / 头部关闭按钮三条用户关闭路径一并禁用，适合必读协议、不可跳过的场景',
      build: (c) => c.append(strictBtn, strictDialog),
      code:
        `<x-dialog label="必读协议">\n` +
        `  <x-dialog-header>服务条款有更新</x-dialog-header>\n` +
        `  <div>正文…</div>\n` +
        `  <x-dialog-footer><x-button command="close" variant="solid">我已阅读并同意</x-button></x-dialog-footer>\n` +
        `</x-dialog>\n` +
        `<script>// 布尔属性除「写了即 true」还认字面量假值：closable="false" 即关，等价于 dialog.closable = false</script>`,
    }),
    demoCard({
      title: '长内容 + 自定义宽度',
      desc: 'width 决定面板宽度（默认 480px）；内容超高时只有中部滚动，header/footer 常驻',
      build: (c) => c.append(longBtn, longDialog),
      code: `<x-dialog width="640px" title="版本更新说明">\n  <div><!-- 很长的内容，自动滚动 --></div>\n  <x-dialog-footer><x-button command="close" variant="solid">知道了</x-button></x-dialog-footer>\n</x-dialog>`,
    }),
    demoCard({
      title: '装表单（配合 x-form）',
      desc: 'footer 要放进 x-form 里：命令沿冒泡链上传、只认祖先，兄弟节点够不着',
      build: (c) => c.append(formBtn, formDialog, formOut),
      code:
        `<x-dialog title="新建标签" subtitle="提交后出现在列表里">\n` +
        `  <x-form>\n` +
        `    <x-form-item label="名称" name="tag" required>\n` +
        `      <x-input placeholder="必填"></x-input>\n` +
        `    </x-form-item>\n` +
        `    <x-dialog-footer>\n` +
        `      <x-button command="close">取消</x-button>\n` +
        `      <x-button command="submit" variant="solid" color="primary">保存</x-button>\n` +
        `    </x-dialog-footer>\n` +
        `  </x-form>\n` +
        `</x-dialog>`,
    }),

    h('h2', null, '与抽屉的关系'),
    rich(
      '<code>x-dialog</code> 与 <code>x-drawer</code> 共用同一套浮层基建：<code>x-dialog-header</code> / <code>x-dialog-footer</code> 直接继承抽屉的头部与底部（只换标签名，DOM/CSS 不重复一份）；滚动锁跨实例计数、按 <code>Esc</code> 只关「最上面那层」浮层——抽屉里再开对话框，一次 Esc 不会把两个一起关掉。二者的选择只在于内容量与是否打断主线流程：短确认/单字段用对话框，长设置/详情用抽屉。',
    ),

    h('h2', null, 'API'),
    h('h3', null, 'x-dialog · 属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['open', '是否展开（反射属性）', 'boolean', 'false'],
        ['width', '面板宽度（面板内超高由中部滚动消化）', 'string (CSS 长度)', "'480px'"],
        ['closable', '是否允许用户关闭：点遮罩 / 按 Esc / 头部关闭按钮一并生效；hide() 不受限制（反射属性；写了即 true，同时承认字面量假值 <code>closable="false"</code>）', 'boolean', 'true'],
        ['lock-scroll', '展开时锁定页面滚动', 'boolean', 'true'],
        ['label', '无障碍名称（aria-label：屏幕阅读器朗读标题，无视觉表现）；留空时回退用 title', 'string', "''"],
        ['title', '快捷头部主标题：无显式 header 时自动生成带头部；属性会被转入 property（不留原生 title attribute，避免浏览器 tooltip 泄漏）', 'string', "''"],
        ['subtitle', '快捷头部副标题（自动头部内以 x-text caption 角色排于主标题下方）', 'string', "''"],
      ],
    ),
    h('h3', null, 'x-dialog-header · 属性'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['show-close', '显示右侧关闭按钮（点击向上递交 close 命令，由所属对话框认领后关闭）', 'boolean', 'false'],
        ['subtitle', '主标题下方的次要说明行（复用 <x-text variant="caption">）；留空不渲染', 'string', "''"],
      ],
    ),
    h('h3', null, '结构 Composition'),
    apiTable(
      ['标签', '说明'],
      [
        ['x-dialog-header', '头部：默认插槽放标题；subtitle 放副标题；show-close 控制关闭按钮；与内容无分隔线'],
        ['（普通元素）', '中部主体：作为 x-dialog 直接子元素，自动占据剩余高度并可滚动、留白（建议用单个包裹元素）'],
        ['x-dialog-footer', '底部操作区：内容右对齐、贴底；与内容无分隔线'],
      ],
    ),
    h('h3', null, '方法 Methods（x-dialog）'),
    apiTable(
      ['方法', '说明'],
      [
        ['show()', '打开对话框'],
        ['hide()', '关闭对话框（先派发可取消的 x-close）；不受 closable 限制'],
        ['toggle()', '切换'],
      ],
    ),
    h('h3', null, '关闭的接线方式'),
    rich(
      'footer 里的按钮不必拿到对话框的引用、也不必绑 click：写 <code>command="close"</code> 即向上递交关闭意图，链上最近的 <code>x-dialog</code> / <code>x-drawer</code> 认领后走 <code>hide()</code>（所以仍会先派发可取消的 <code>x-close</code>）。命令式入口不受 <code>closable</code> 旋钮限制，因此必读协议场景（<code>closable=false</code>）里取消按钮照常可用。需要在关之前插自己的逻辑时，仍可直接绑 click 调 <code>hide()</code>。',
    ),
    h('h3', null, '命令只沿冒泡链找祖先'),
    rich(
      '<code>command</code> 是把意图包成事件<b>向上冒泡</b>，由链上第一个认领者接走——因此触发按钮必须是目标组件的<b>后代</b>。往对话框里塞表单时这点会直接决定结构：<code>&lt;x-dialog&gt; → &lt;x-form&gt; → 字段 + &lt;x-dialog-footer&gt;</code> 可行（<code>submit</code> 被 x-form 就近认领，<code>close</code> 越过 x-form 继续上传被 x-dialog 认领，两条命令互不打扰）；而把 footer 与 form 写成兄弟节点时，<code>submit</code> 一路上行碰不到 form，只能退回页面原生 <code>&lt;form&gt;</code>，链上再没有就静默什么都不做。代价是要清楚：footer 嵌进 form 后就不是对话框的直接子元素了，会跟正文一起在中部滚动区里滚（不常驻贴底）。需要按钮常驻时反过来写：footer 作为 <code>&lt;x-dialog&gt;</code> 直接子元素，取消钮仍写 <code>command="close"</code>，提交钮则改绑 click 调 <code>form.submit()</code>——常驻与命令接线在此不可兼得，按内容长短取舍。',
    ),
    h('h3', null, '事件 Events'),
    apiTable(
      ['事件', '说明', 'detail'],
      [['x-close', '遮罩点击 / Esc / header 关闭按钮 / hide() 时派发，cancelable', '无']],
    ),
    h('h3', null, '样式部件 Parts'),
    apiTable(
      ['part', '所属', '说明'],
      [
        ['scrim', 'x-dialog', '半透明遮罩（同时是居中容器）'],
        ['panel', 'x-dialog', '居中的面板容器'],
        ['header', 'x-dialog', '自动生成的头部（仅快捷用法；可 ::part(header) 微调）'],
        ['title', 'x-dialog-header', '标题文字容器'],
        ['subtitle', 'x-dialog-header', '副标题（x-text）'],
        ['close', 'x-dialog-header', '关闭按钮'],
      ],
    ),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
