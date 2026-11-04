/** x-collapse 折叠区域文档：用法 + API（独立折叠片段，触发钮可上可下） */
import { h, demoCard, apiTable } from '/demo/render.js';

/* ---- 轻量构建助手 ---- */
function collapse(props = {}, ...children) {
  return h('x-collapse', props, ...children);
}

function body(text) {
  return h('p', { style: 'margin:0;color:var(--xie-color-fg)' }, text);
}

function btn(label, onclick) {
  return h('x-button', { variant: 'outline', size: 'sm', onclick }, label);
}

function row(...children) {
  return h('div', { style: 'display:flex;align-items:center;gap:8px;flex-wrap:wrap' }, ...children);
}

function note(text) {
  return h('div', { style: 'margin-top:8px;color:var(--xie-color-muted);font-size:13px' }, text);
}

export function render(el) {
  el.append(
    h('h1', null, 'Collapse 折叠区域'),
    h('p', { class: 'lead' }, '<code>&lt;x-collapse&gt;</code> 是「触发钮 + 可折叠内容」的独立片段：点钮展开/收起，高度走 grid 轨道 <code>0fr↔1fr</code> 自适应动画，内容多长都不用报死像素。与 <code>&lt;x-accordion&gt;</code> 的分工：accordion-item 是自带分隔线、整行标题栏、可被根收编单开互斥的「面板行」；collapse 是容器不表态（无框无底，外观交消费方自理）的「正文自由片段」，触发钮可上可下，单独使用不与任何根协调。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础折叠',
      desc: 'label 是触发钮文本的快捷路径；默认插槽放可折叠内容。收起态内容被裁切且摘出 tab 序',
      build: (c) => {
        c.append(
          collapse({ label: '详细信息' }, body('适合 FAQ 片段、详情补充、高级选项这类「默认不打扰、需要时可展开」的内容。展开动画高度自适应，收起后不留一丝空隙。')),
          note('触发钮默认是「文本 + 尖角」的轻呈现（像链接不像实心按钮），要按钮外观经 part="trigger" 自理。'),
        );
      },
      code: `<x-collapse label="详细信息">
  <p>适合 FAQ 片段、详情补充……</p>
</x-collapse>`
    }),

    demoCard({
      title: '展开全文（Read more）',
      desc: 'placement="bottom" 把触发钮缀到内容尾部：正文在上、「展开全文/收起」在下，文章摘要与条款补全的经典形态',
      build: (c) => {
        const more = h('p', { style: 'margin:8px 0 0;color:var(--xie-color-fg)' }, '退货政策：实物商品支持 7 天无理由退换（需保持吊牌完整），数字内容一经发出暂不支持退货，敬请谅解。');
        more.hidden = true;
        const col = collapse({ placement: 'bottom', label: '展开全文' }, body('订单支持三种交付方式：快递配送、门店自提与电子版直发。快递配送覆盖全国，一般 2–5 个工作日送达；门店自提下单后会收到取货码，凭码在营业时间内核销领取。'), more);
        col.addEventListener('x-change', (e) => {
          more.hidden = !e.detail.open;
          col.label = e.detail.open ? '收起' : '展开全文';
        });
        c.append(col);
      },
      code: `<x-collapse placement="bottom" label="展开全文">
  <p>订单支持三种交付方式……</p>
  <p hidden>退货政策……（展开才放行）</p>
</x-collapse>
c.addEventListener('x-change', (e) => { /* 换 label、放行隐藏段 */ });`
    }),

    demoCard({
      title: '自定义触发 + 容器自理',
      desc: '复杂触发区（图标/加粗/任意呈现）直接放 slot="trigger"，覆盖 label 快捷路径；内容想带边框底色就自己包一层（或套 x-box）——容器不表态，外观自由组合',
      build: (c) => {
        const trg = h('span', { slot: 'trigger', style: 'display:inline-flex;align-items:center;gap:6px;font-weight:600' }, h('x-icon', { name: 'settings', size: '16' }), '高级设置');
        const inner = h('div', { style: 'margin-top:8px;border:1px solid var(--xie-color-border);border-radius:8px;padding:12px 14px;color:var(--xie-color-fg)' }, body('构建产物默认输出到 dist/；如需自定义入口、分包策略与静态资源基路径，在此展开配置项说明。'));
        c.append(collapse(null, trg, inner));
      },
      code: `<x-collapse>
  <span slot="trigger"><x-icon name="settings"></x-icon><b>高级设置</b></span>
  <div class="自己包的边框底色">构建产物默认输出到 dist/……</div>
</x-collapse>`
    }),

    demoCard({
      title: '程序化控制',
      desc: '写 open 属性即受控开合（不派发事件）；用户点触发钮才派发 x-change；disabled 时点钮无效',
      build: (c) => {
        const col = collapse({ label: '受控折叠区' }, body('程序化写 open 即开合；事件只回报用户交互——与库内各组件的「程序化不派发」约定一致。'));
        const log = note('x-change：等待…');
        col.addEventListener('x-change', (e) => (log.textContent = `x-change：open = ${e.detail.open}`));
        c.append(
          col,
          row(
            btn("open = true", () => (col.open = true)),
            btn("open = false", () => (col.open = false)),
            btn('toggle()', () => col.toggle()),
            btn('disabled 开/关', () => (col.disabled = !col.disabled)),
          ),
          log,
        );
      },
      code: `col.open = true;              // 程序化展开（不派发事件）
col.toggle();                 // 相对切换（force 参数可强制指定）
col.disabled = true;          // 禁用点钮
col.addEventListener('x-change', (e) => console.log(e.detail.open)); // 仅用户点钮时派发`,
    }),

    h('h2', null, 'API'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['open', '展开态（反射）。写它即开合（程序化不派发事件）；用户点钮切换后派发 x-change', 'boolean', 'false'],
        ['label', '触发钮文本（不反射）：快捷路径，被 slot="trigger" 内容覆盖', 'string', "'展开全文'"],
        ['placement', '触发钮位置（反射）：top（钮在内容上方）/ bottom（内容在上、钮缀尾部——「展开全文」形态；只翻视觉序，DOM/朗读序不变）', 'string', "'top'"],
        ['disabled', '禁用（反射）：触发钮不可点', 'boolean', 'false'],
      ],
    ),
    apiTable(
      ['方法 / 事件 / Part', '说明'],
      [
        ['toggle(force?)', '开/合（force 可强制指定）；disabled 忽略；同值幂等不动作'],
        ['x-change', '用户点触发钮切换后派发（bubbles+composed），detail:{ open }；程序化写 open 不派发'],
        ['part', 'trigger / content / content-inner'],
      ],
    ),

    h('h2', null, '说明'),
    h('p', null, '折叠动画走 grid 模板行 <code>0fr↔1fr</code>（复用 x-accordion-item 的经验）：高度自适应任意内容，无需报死像素；收起态内容经 overflow 裁切 + <code>visibility</code> 延迟收尾摘出 tab 序，隐藏内容不可被 Tab 聚焦。常驻留白请放进你自己的内容容器里——组件默认零留白（免踩 padding 抬高 0fr 轨道下限、收起回不了零的老坑）。无障碍：触发钮 <code>aria-expanded + aria-controls</code>，内容区 <code>role=region</code>；<code>prefers-reduced-motion: reduce</code> 下开合无动画（瞬变）。'),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
