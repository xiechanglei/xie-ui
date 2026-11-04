<script setup lang="ts">
// Toast 轻提示：挂一个 <x-toast> 容器，调 add() 堆叠提示。纯 JS 驱动，各例的真实交互由 :setup 绑定按钮→add()。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

type ToastHandle = { close: () => void };
type ToastAddOpts = { color?: string; duration?: number; closable?: boolean };
type ToastHost = Element & { add: (message: string, opts?: ToastAddOpts) => ToastHandle; clear: () => void };

const BASE_SOURCE = `<x-button id="toast-base-btn" variant="solid">弹一条默认提示</x-button>
<x-toast id="toast-base"></x-toast>`;
const setupToastBase = (root: HTMLElement) => {
  const box = root.querySelector('#toast-base') as ToastHost | null;
  const btn = root.querySelector('#toast-base-btn');
  if (!box || !btn) return;
  btn.addEventListener('click', () => box.add('已保存草稿，可随时恢复'));
};

const COLOR_SOURCE = `<x-button id="tc-success" variant="soft" color="success">success</x-button>
<x-button id="tc-warning" variant="soft" color="warning">warning</x-button>
<x-button id="tc-danger" variant="soft" color="danger">danger</x-button>
<x-button id="tc-info" variant="soft" color="info">info</x-button>
<x-button id="tc-primary" variant="soft" color="primary">primary</x-button>
<x-toast id="toast-color"></x-toast>`;
const setupToastColors = (root: HTMLElement) => {
  const box = root.querySelector('#toast-color') as ToastHost | null;
  if (!box) return;
  const map: [string, string, string][] = [
    ['#tc-success', '操作成功', 'success'],
    ['#tc-warning', '存储空间不足 10%', 'warning'],
    ['#tc-danger', '网络异常，请重试', 'danger'],
    ['#tc-info', '新版本已就绪', 'info'],
    ['#tc-primary', '任务已加入队列', 'primary'],
  ];
  for (const [sel, text, color] of map) {
    root.querySelector(sel)?.addEventListener('click', () => box.add(text, { color }));
  }
};

const TIME_SOURCE = `<x-button id="tt-short" variant="outline">1.5s 短提示</x-button>
<x-button id="tt-pause" variant="outline" color="secondary">6s 长提示（悬停试试暂停）</x-button>
<x-button id="tt-sticky" variant="outline" color="danger">duration=0 常驻</x-button>
<x-toast id="toast-time"></x-toast>`;
const setupToastTime = (root: HTMLElement) => {
  const box = root.querySelector('#toast-time') as ToastHost | null;
  if (!box) return;
  root.querySelector('#tt-short')?.addEventListener('click', () => box.add('这条 1.5 秒后消失', { duration: 1500 }));
  root.querySelector('#tt-pause')?.addEventListener('click', () => box.add('鼠标移上去计时会暂停，移开续时', { duration: 6000, color: 'info' }));
  root.querySelector('#tt-sticky')?.addEventListener('click', () => box.add('我不会自动关，点 × 或调 handle.close()', { duration: 0, closable: true, color: 'warning' }));
};

const HANDLE_SOURCE = `<x-button id="th-open" variant="soft" color="success">弹一条可句柄关闭的提示</x-button>
<x-button id="th-kill" variant="soft" color="danger">handle.close()</x-button>
<x-toast id="toast-manual"></x-toast>`;
const setupToastHandle = (root: HTMLElement) => {
  const box = root.querySelector('#toast-manual') as ToastHost | null;
  if (!box) return;
  let handle: ToastHandle | null = null;
  root.querySelector('#th-open')?.addEventListener('click', () => {
    handle = box.add('拿好句柄，点右边按钮让我提前退场', { duration: 10000, color: 'success' });
  });
  root.querySelector('#th-kill')?.addEventListener('click', () => handle?.close());
};

const PLACE_SOURCE = `<x-button id="tp-tl" variant="outline" color="info">top-left</x-button>
<x-button id="tp-t" variant="outline" color="info">top</x-button>
<x-button id="tp-tr" variant="outline" color="info">top-right</x-button>
<x-button id="tp-bl" variant="outline" color="info">bottom-left</x-button>
<x-button id="tp-b" variant="outline" color="info">bottom</x-button>
<x-button id="tp-br" variant="outline" color="info">bottom-right</x-button>
<x-toast id="toast-tl" placement="top-left"></x-toast>
<x-toast id="toast-t" placement="top"></x-toast>
<x-toast id="toast-tr" placement="top-right"></x-toast>
<x-toast id="toast-bl" placement="bottom-left"></x-toast>
<x-toast id="toast-b" placement="bottom"></x-toast>
<x-toast id="toast-br" placement="bottom-right"></x-toast>`;
const setupToastPlacement = (root: HTMLElement) => {
  const map: [string, string, string][] = [
    ['#tp-tl', '#toast-tl', 'top-left'],
    ['#tp-t', '#toast-t', 'top'],
    ['#tp-tr', '#toast-tr', 'top-right'],
    ['#tp-bl', '#toast-bl', 'bottom-left'],
    ['#tp-b', '#toast-b', 'bottom'],
    ['#tp-br', '#toast-br', 'bottom-right'],
  ];
  for (const [btnSel, boxSel, p] of map) {
    const box = root.querySelector(boxSel) as ToastHost | null;
    const b = root.querySelector(btnSel);
    if (box && b) b.addEventListener('click', () => box.add('placement="' + p + '"', { duration: 5000 }));
  }
};

const EVENT_SOURCE = `<x-button id="te-btn" variant="soft" color="warning">弹一条并在关闭前拦一问</x-button>
<x-toast id="toast-evt"></x-toast>
<div id="te-out" style="margin-top: 8px; color: var(--xie-color-muted)">事件：无</div>`;
const setupToastEvent = (root: HTMLElement) => {
  const box = root.querySelector('#toast-evt') as ToastHost | null;
  const btn = root.querySelector('#te-btn');
  const out = root.querySelector('#te-out');
  if (!box || !btn) return;
  btn.addEventListener('click', () => box.add('我关闭前会先派发 x-close（见下方日志）', { color: 'warning', duration: 2000 }));
  if (out)
    box.addEventListener('x-close', (e) => {
      const msg = (e as CustomEvent<{ message: string }>).detail.message;
      out.textContent = '事件：x-close 已触发（message="' + msg + '"，' + new Date().toLocaleTimeString() + '）';
    });
};

// API
const TOAST_PROPS_ROWS = [
  ['placement', '堆叠列锚位：四角 + 顶/底居中（反射属性）', "'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right'", "'top'"],
  ['max', '同屏最多存活条数，超出挤掉最旧一条；0 = 不限', 'number', '5'],
];
const TOAST_METHODS_ROWS = [
  ['add(message, opts?)', '追加一条提示；opts 也可整包写成 add({ message, ... })。返回句柄 { close() }。空文本不弹'],
  ['clear()', '清空全部（各条照常派发可取消的 x-close，被取消的留下）'],
];
const TOAST_OPTS_ROWS = [
  ['message', '提示文本（纯文本，无 HTML）', 'string', '—'],
  ['color', '语义色，非 default 自动配图标', "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'", "'default'"],
  ['duration', '自动关闭延时（毫秒），0 = 不自动关', 'number', '3000'],
  ['closable', '显示 × 关闭按钮', 'boolean', 'false'],
];
const TOAST_EVENTS_ROWS = [['x-close', '某条关闭前派发，cancelable（preventDefault 则该条不关）；自动关/手动关/被 max 挤掉都会经过它', '{ message }']];
const TOAST_PARTS_ROWS = [['list', 'x-toast', 'fixed 定位的堆叠列']];
</script>

<template>
  <div>
    <h1>Toast 轻提示</h1>
    <p class="lead">页面里挂一个 <code>&lt;x-toast&gt;</code>（不占布局），调 <code>add()</code> 即在其内堆叠出轻量提示：不锁滚动、不拦操作，自动消失，hover 暂停计时。内容只支持纯文本，富内容请改用对话框/抽屉。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可在页面挂一个 <code>x-toast</code> 容器，再命令式调用 <code>add()</code>（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="挂一个容器，add(文本) 即弹出一条中性提示（默认 3s 自动关）"
      :source="BASE_SOURCE"
      :script='`
const toast = document.querySelector("#toast-base");
btn.addEventListener("click", () => toast.add("已保存草稿，可随时恢复"));
`'
      :setup="setupToastBase"
    />

    <Demo
      title="语义色（图标自动配）"
      desc="color 走全库统一的强调角色；非 default 自动配对应图标，default 中性无图标"
      :source="COLOR_SOURCE"
      :script='`
const toast = document.querySelector("#toast-color");
toast.add("操作成功", { color: "success" });
toast.add("网络异常，请重试", { color: "danger" });
`'
      :setup="setupToastColors"
    />

    <Demo
      title="时长 / hover 暂停 / 常驻"
      desc="duration 毫秒、0 = 不自动关；自动关闭期间悬停暂停、移开续时"
      :source="TIME_SOURCE"
      :script='`
toast.add("这条 1.5 秒后消失", { duration: 1500 });
toast.add("鼠标移上去计时会暂停", { duration: 6000, color: "info" });
toast.add("我不会自动关", { duration: 0, closable: true, color: "warning" });
`'
      :setup="setupToastTime"
    />

    <Demo
      title="手动关闭（句柄）"
      desc="add() 返回 { close() }，可在任意时机提前关掉那一条"
      :source="HANDLE_SOURCE"
      :script='`
let handle = null;
openBtn.addEventListener("click", () => {
  handle = toast.add("拿好句柄", { duration: 10000, color: "success" });
});
killBtn.addEventListener("click", () => handle && handle.close());
`'
      :setup="setupToastHandle"
    />

    <Demo
      title="六向锚位（placement）与堆叠上限"
      desc="placement 支持四角 + 顶/底居中六向；连点同一按钮即在同列堆叠，超出 max（默认 5）挤掉最旧一条"
      :source="PLACE_SOURCE"
      :script='`
<!-- 每个锚位各挂一个容器 -->
<x-toast placement="top-right"></x-toast>
<!-- top | top-left | top-right | bottom | bottom-left | bottom-right -->
toast.add("placement=\"top-right\"", { duration: 5000 });
`'
      :setup="setupToastPlacement"
    />

    <Demo
      title="可取消的 x-close"
      desc="每条关闭前派发 x-close（detail.message），preventDefault() 可拦下这次关闭"
      :source="EVENT_SOURCE"
      :script='`
const toast = document.querySelector("#toast-evt");
toast.add("我关闭前会先派发 x-close", { color: "warning", duration: 2000 });
toast.addEventListener("x-close", (e) => {
  // e.detail.message 是哪条；e.preventDefault() 可取消这次关闭
});
`'
      :setup="setupToastEvent"
    />

    <h2>与其它浮层的边界</h2>
    <p>Toast 是<b>不打断</b>的轻反馈：不锁滚动、不进 Esc 栈、整列 <code>pointer-events:none</code>（只有提示条本身可点），层级压过对话框/抽屉（z-index 1100）。需要用户表态、承载表单或长内容时，用 <code>x-dialog</code> / <code>x-drawer</code>。容器不渲染 <code>slot</code>，往 <code>&lt;x-toast&gt;</code> 里塞子元素不会显示。</p>

    <h2>API</h2>
    <ApiTable title="x-toast · 属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="TOAST_PROPS_ROWS" />
    <ApiTable title="方法 Methods" :columns="['方法', '说明']" :rows="TOAST_METHODS_ROWS" />
    <ApiTable title="add() 选项" :columns="['字段', '说明', '类型', '默认值']" :rows="TOAST_OPTS_ROWS" />
    <ApiTable title="事件 Events" :columns="['事件', '说明', 'detail']" :rows="TOAST_EVENTS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '所属', '说明']" :rows="TOAST_PARTS_ROWS" />
  </div>
</template>
