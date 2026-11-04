<script setup lang="ts">
// Collapse 折叠区域：x-collapse 单件（触发钮 + 可折叠内容）。
// 「展开全文」与「程序化控制」两处含 JS 交互，由 :setup 实现；基础/自定义触发为静态。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

type CollapseHost = Element & {
  open: boolean;
  disabled: boolean;
  label: string;
  toggle: (force?: boolean) => void;
};

const READMORE_SOURCE = `<x-collapse placement="bottom" label="展开全文">
  <p style="margin: 0; color: var(--xie-color-fg)">订单支持三种交付方式：快递配送、门店自提与电子版直发。快递配送覆盖全国，一般 2–5 个工作日送达；门店自提下单后会收到取货码，凭码在营业时间内核销领取。</p>
  <p id="col-more" style="margin: 8px 0 0; color: var(--xie-color-fg)" hidden>退货政策：实物商品支持 7 天无理由退换（需保持吊牌完整），数字内容一经发出暂不支持退货，敬请谅解。</p>
</x-collapse>`;

const setupCollapseReadmore = (root: HTMLElement) => {
  const col = root.querySelector('x-collapse') as CollapseHost | null;
  const more = root.querySelector('#col-more') as HTMLElement | null;
  if (!col || !more) return;
  col.addEventListener('x-change', (e) => {
    const open = (e as CustomEvent<{ open: boolean }>).detail.open;
    more.hidden = !open;
    col.label = open ? '收起' : '展开全文';
  });
};

const PROG_SOURCE = `<x-collapse id="col-prog" label="受控折叠区">
  <p style="margin: 0; color: var(--xie-color-fg)">程序化写 open 即开合；事件只回报用户交互——与库内各组件的「程序化不派发」约定一致。</p>
</x-collapse>
<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 8px">
  <x-button id="col-open" variant="outline" size="sm">open = true</x-button>
  <x-button id="col-close" variant="outline" size="sm">open = false</x-button>
  <x-button id="col-toggle" variant="outline" size="sm">toggle()</x-button>
  <x-button id="col-disable" variant="outline" size="sm">disabled 开/关</x-button>
</div>
<div id="col-prog-log" style="margin-top: 8px; color: var(--xie-color-muted); font-size: 13px">x-change：等待…</div>`;

const setupCollapseProgram = (root: HTMLElement) => {
  const col = root.querySelector('#col-prog') as CollapseHost | null;
  const log = root.querySelector('#col-prog-log');
  if (!col || !log) return;
  col.addEventListener('x-change', (e) => {
    log.textContent = 'x-change：open = ' + (e as CustomEvent<{ open: boolean }>).detail.open;
  });
  const bind = (id: string, fn: () => void) => {
    const b = root.querySelector(id);
    if (b) b.addEventListener('click', fn);
  };
  bind('#col-open', () => (col.open = true));
  bind('#col-close', () => (col.open = false));
  bind('#col-toggle', () => col.toggle());
  bind('#col-disable', () => (col.disabled = !col.disabled));
};

// API
const COLL_PROPS_ROWS = [
  ['open', '展开态（反射）。写它即开合（程序化不派发事件）；用户点钮切换后派发 x-change', 'boolean', 'false'],
  ['label', '触发钮文本（不反射）：快捷路径，被 slot="trigger" 内容覆盖', 'string', "'展开全文'"],
  ['placement', '触发钮位置（反射）：top（钮在内容上方）/ bottom（内容在上、钮缀尾部——「展开全文」形态）', 'string', "'top'"],
  ['disabled', '禁用（反射）：触发钮不可点', 'boolean', 'false'],
];
const COLL_MEMBERS_ROWS = [
  ['toggle(force?)', '开/合（force 可强制指定）；disabled 忽略；同值幂等不动作'],
  ['x-change', '用户点触发钮切换后派发（bubbles+composed），detail:{ open }；程序化写 open 不派发'],
  ['part', 'trigger / content / content-inner'],
];
</script>

<template>
  <div>
    <h1>Collapse 折叠区域</h1>
    <p class="lead"><code>&lt;x-collapse&gt;</code> 是「触发钮 + 可折叠内容」的独立片段：点钮展开/收起，高度走 grid 轨道 <code>0fr↔1fr</code> 自适应动画，内容多长都不用报死像素。与 <code>&lt;x-accordion&gt;</code> 的分工：accordion-item 是自带分隔线、整行标题栏、可被根收编单开互斥的「面板行」；collapse 是容器不表态（无框无底，外观交消费方自理）的「正文自由片段」，触发钮可上可下，单独使用不与任何根协调。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-collapse</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础折叠"
      desc="label 是触发钮文本的快捷路径；默认插槽放可折叠内容。收起态内容被裁切且摘出 tab 序。触发钮默认是「文本 + 尖角」的轻呈现，要按钮外观经 part=&quot;trigger&quot; 自理"
      :column="true"
      :source='`
<x-collapse label="详细信息">
  <p style="margin: 0; color: var(--xie-color-fg)">适合 FAQ 片段、详情补充、高级选项这类「默认不打扰、需要时可展开」的内容。展开动画高度自适应，收起后不留一丝空隙。</p>
</x-collapse>
`'
    />

    <Demo
      title="展开全文（Read more）"
      desc='placement="bottom" 把触发钮缀到内容尾部：正文在上、「展开全文/收起」在下，文章摘要与条款补全的经典形态'
      :column="true"
      :source="READMORE_SOURCE"
      :script='`
const col = document.querySelector("x-collapse");
const more = document.querySelector("#col-more");
col.addEventListener("x-change", (e) => {
  more.hidden = !e.detail.open;
  col.label = e.detail.open ? "收起" : "展开全文";
});
`'
      :setup="setupCollapseReadmore"
    />

    <Demo
      title="自定义触发 + 容器自理"
      desc='复杂触发区（图标/加粗/任意呈现）直接放 slot="trigger"，覆盖 label 快捷路径；内容想带边框底色就自己包一层（或套 x-box）——容器不表态，外观自由组合'
      :column="true"
      :source='`
<x-collapse>
  <span slot="trigger" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 600"><x-icon name="settings" size="16"></x-icon>高级设置</span>
  <div style="margin-top: 8px; border: 1px solid var(--xie-color-border); border-radius: 8px; padding: 12px 14px; color: var(--xie-color-fg)">
    <p style="margin: 0; color: var(--xie-color-fg)">构建产物默认输出到 dist/；如需自定义入口、分包策略与静态资源基路径，在此展开配置项说明。</p>
  </div>
</x-collapse>
`'
    />

    <Demo
      title="程序化控制"
      desc="写 open 属性即受控开合（不派发事件）；用户点触发钮才派发 x-change；disabled 时点钮无效"
      :column="true"
      :source="PROG_SOURCE"
      :script='`
col.open = true;              // 程序化展开（不派发事件）
col.toggle();                 // 相对切换（force 参数可强制指定）
col.disabled = true;          // 禁用点钮
col.addEventListener("x-change", (e) => console.log(e.detail.open)); // 仅用户点钮时派发
`'
      :setup="setupCollapseProgram"
    />

    <h2>说明</h2>
    <p>折叠动画走 grid 模板行 <code>0fr↔1fr</code>（复用 x-accordion-item 的经验）：高度自适应任意内容，无需报死像素；收起态内容经 overflow 裁切 + <code>visibility</code> 延迟收尾摘出 tab 序，隐藏内容不可被 Tab 聚焦。常驻留白请放进你自己的内容容器里——组件默认零留白。无障碍：触发钮 <code>aria-expanded + aria-controls</code>，内容区 <code>role=region</code>；<code>prefers-reduced-motion: reduce</code> 下开合无动画（瞬变）。</p>

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="COLL_PROPS_ROWS" />
    <ApiTable title="方法 / 事件 / Part" :columns="['名称', '说明']" :rows="COLL_MEMBERS_ROWS" />
  </div>
</template>
