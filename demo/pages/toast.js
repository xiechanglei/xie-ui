/** Toast 轻提示文档：页面挂一个 <x-toast> 容器（不占布局），调 add() 即在其内堆叠出提示；纯文本、语义色自动配图标、hover 暂停自动关闭 */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

function button(label, attrs = {}) {
  const b = document.createElement('x-button');
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, String(v));
  b.textContent = label;
  return b;
}

/** 建一个容器元素（组件内部结构消费者看不到，demo 里只挂标签） */
function toastBox(placement) {
  const t = document.createElement('x-toast');
  if (placement) t.setAttribute('placement', placement);
  return t;
}

export function render(el) {
  /* —— 1. 基础 —— */
  const baseBox = toastBox();
  const baseBtn = button('弹一条默认提示', { variant: 'solid' });
  baseBtn.addEventListener('click', () => baseBox.add('已保存草稿，可随时恢复'));

  /* —— 2. 语义色（图标自动配） —— */
  const colorBox = toastBox();
  const COLORS = [
    ['success', '操作成功'],
    ['warning', '存储空间不足 10%'],
    ['danger', '网络异常，请重试'],
    ['info', '新版本已就绪'],
    ['primary', '任务已加入队列'],
  ];

  /* —— 3. 时长 / hover 暂停 / 不自动关 —— */
  const timeBox = toastBox();
  const shortBtn = button('1.5s 短提示', { variant: 'outline' });
  shortBtn.addEventListener('click', () => timeBox.add('这条 1.5 秒后消失', { duration: 1500 }));
  const pauseBtn = button('6s 长提示（悬停试试暂停）', { variant: 'outline', color: 'secondary' });
  pauseBtn.addEventListener('click', () => timeBox.add('鼠标移上去计时会暂停，移开续时', { duration: 6000, color: 'info' }));
  const stickyBtn = button('duration=0 常驻', { variant: 'outline', color: 'danger' });
  stickyBtn.addEventListener('click', () => timeBox.add('我不会自动关，点 × 或调 handle.close()', { duration: 0, closable: true, color: 'warning' }));

  /* —— 4. 手动关闭 —— */
  const manualBox = toastBox();
  let handle = null;
  const openBtn = button('弹一条可句柄关闭的提示', { variant: 'soft', color: 'success' });
  openBtn.addEventListener('click', () => {
    handle = manualBox.add('拿好句柄，点右边按钮让我提前退场', { duration: 10000, color: 'success' });
  });
  const killBtn = button('handle.close()', { variant: 'soft', color: 'danger' });
  killBtn.addEventListener('click', () => handle?.close());

  /* —— 5. placement 六向 + max 堆叠 —— */
  const PLACEMENTS = ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'];
  const placeItems = [];
  for (const p of PLACEMENTS) {
    const box = toastBox(p);
    const btn = button(p, { variant: 'outline', color: 'info' });
    // 连点同一按钮即在同列堆叠，超出 max（默认 5）挤掉最旧一条
    btn.addEventListener('click', () => box.add(`placement="${p}"`, { duration: 5000 }));
    placeItems.push(btn, box);
  }

  /* —— 6. 可取消的 x-close —— */
  const evtBox = toastBox();
  const evtOut = h('div', { class: 'demo-card__title' }, '事件：无');
  const evtBtn = button('弹一条并在关闭前拦一问', { variant: 'soft', color: 'warning' });
  evtBtn.addEventListener('click', () => evtBox.add('我关闭前会先派发 x-close（见下方日志）', { color: 'warning', duration: 2000 }));
  evtBox.addEventListener('x-close', (e) => {
    evtOut.textContent = '事件：x-close 已触发（message="' + e.detail.message + '"，' + new Date().toLocaleTimeString() + '）';
  });

  el.append(
    h('h1', null, 'Toast 轻提示'),
    h(
      'p',
      { class: 'lead' },
      '页面里挂一个 <x-toast>（不占布局），调 add() 即在其内堆叠出轻量提示：不锁滚动、不拦操作，自动消失，hover 暂停计时。内容只支持纯文本，富内容请改用对话框/抽屉。',
    ),

    h('h2', null, '引入'),
    h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, `import '@xie-work/xie-ui';`)))),

    h('h2', null, '代码演示'),
    demoCard({
      title: '基础用法',
      desc: '挂一个容器，add(文本) 即弹出一条中性提示（默认 3s 自动关）',
      build: (c) => c.append(baseBtn, baseBox),
      code: `<x-toast id="t"></x-toast>\n<script>t.add('已保存草稿，可随时恢复');</script>`,
    }),
    demoCard({
      title: '语义色（图标自动配）',
      desc: 'color 走全库统一的 6 个强调角色；非 default 自动配对应图标，default 中性无图标',
      build: (c) => {
        c.append(colorBox);
        for (const [color, text] of COLORS) {
          const btn = button(color, { variant: 'soft', color });
          btn.addEventListener('click', () => colorBox.add(text, { color }));
          c.append(btn);
        }
      },
      code: `t.add('操作成功', { color: 'success' });\nt.add('网络异常，请重试', { color: 'danger' });`,
    }),
    demoCard({
      title: '时长 / hover 暂停 / 常驻',
      desc: 'duration 毫秒、0 = 不自动关；自动关闭期间悬停暂停、移开续时',
      build: (c) => c.append(shortBtn, pauseBtn, stickyBtn, timeBox),
      code: `t.add('1.5 秒', { duration: 1500 });\nt.add('悬停暂停', { duration: 6000, color: 'info' });\nt.add('常驻', { duration: 0, closable: true, color: 'warning' });`,
    }),
    demoCard({
      title: '手动关闭（句柄）',
      desc: 'add() 返回 { close() }，可在任意时机提前关掉那一条',
      build: (c) => c.append(openBtn, killBtn, manualBox),
      code: `const handle = t.add('拿好句柄', { duration: 10000 });\nhandle.close(); // 提前关闭`,
    }),
    demoCard({
      title: '六向锚位（placement）与堆叠上限',
      desc: 'placement 支持四角 + 顶/底居中六向；连点同一按钮即在同列堆叠，超出 max（默认 5）挤掉最旧一条',
      build: (c) => c.append(...placeItems),
      code: `<x-toast placement="top-right"></x-toast>\n<!-- 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right' -->`,
    }),
    demoCard({
      title: '可取消的 x-close',
      desc: '每条关闭前派发 x-close（detail.message），preventDefault() 可拦下这次关闭',
      build: (c) => c.append(evtBtn, evtBox, evtOut),
      code: `t.addEventListener('x-close', (e) => {\n  // e.detail.message 是哪条；e.preventDefault() 可取消这次关闭\n});`,
    }),

    h('h2', null, '与其它浮层的边界'),
    rich(
      'Toast 是<b>不打断</b>的轻反馈：不锁滚动、不进 Esc 栈、整列 <code>pointer-events:none</code>（只有提示条本身可点），层级压过对话框/抽屉（z-index 1100）。需要用户表态、承载表单或长内容时，用 <code>x-dialog</code> / <code>x-drawer</code>。容器不渲染 <code>slot</code>，往 <code>&lt;x-toast&gt;</code> 里塞子元素不会显示。',
    ),

    h('h2', null, 'API'),
    h('h3', null, 'x-toast · 属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['placement', '堆叠列锚位：四角 + 顶/底居中（反射属性）', "'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right'", "'top'"],
        ['max', '同屏最多存活条数，超出挤掉最旧一条；0 = 不限', 'number', '5'],
      ],
    ),
    h('h3', null, '方法 Methods'),
    apiTable(
      ['方法', '说明'],
      [
        ['add(message, opts?)', '追加一条提示；opts 也可整包写成 add({ message, ... })。返回句柄 { close() }。空文本不弹'],
        ['clear()', '清空全部（各条照常派发可取消的 x-close，被取消的留下）'],
      ],
    ),
    h('h3', null, 'add() 选项'),
    apiTable(
      ['字段', '说明', '类型', '默认值'],
      [
        ['message', '提示文本（纯文本，无 HTML）', 'string', '—'],
        ['color', '语义色，非 default 自动配图标', "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'", "'default'"],
        ['duration', '自动关闭延时（毫秒），0 = 不自动关', 'number', '3000'],
        ['closable', '显示 × 关闭按钮', 'boolean', 'false'],
      ],
    ),
    h('h3', null, '事件 Events'),
    apiTable(
      ['事件', '说明', 'detail'],
      [['x-close', '某条关闭前派发，cancelable（preventDefault 则该条不关）；自动关/手动关/被 max 挤掉都会经过它', '{ message }']],
    ),
    h('h3', null, '样式部件 Parts'),
    apiTable(
      ['part', '所属', '说明'],
      [['list', 'x-toast', 'fixed 定位的堆叠列']],
    ),
  );
}
