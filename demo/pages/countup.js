/** x-count-up 数字渐变文档：用法 + API（核心语义：监听 value，从当前显示值续滚到新目标） */
import { h, demoCard, apiTable } from '/demo/render.js';

/* ---- 轻量构建助手 ---- */
function cu(props = {}, text) {
  const el = h('x-count-up', props);
  if (text) el.style.fontSize = text;
  return el;
}
function big(v) { v.style.fontSize = '28px'; v.style.fontWeight = '600'; return v; }
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
    h('h1', null, 'CountUp 数字渐变'),
    h('p', { class: 'lead' }, '<code>&lt;x-count-up&gt;</code> 把数字从起点快速补间到目标值（打开页面时「从 0 涨上去」的统计效果）。核心语义是监听 <code>value</code>：目标值变化时从<strong>当前显示数字</strong>续滚到新目标，中途改值不回跳。零依赖，rAF 驱动，等宽数字不抖宽。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础用法',
      desc: '挂载即从 0 滚到 value；落定派发 x-finish',
      build: (c) => {
        const num = big(cu({ value: 87654 }));
        c.append(num, note('默认 ease-out：快速起步、减速着陆'));
      },
      code: `<x-count-up value="87654"></x-count-up>

const el = document.querySelector('x-count-up');
el.addEventListener('x-finish', (e) => console.log('落定', e.detail.value));`,
    }),

    demoCard({
      title: '监听 value · 续滚语义',
      desc: '改 value 即从当前显示值滚向新值；滚动中途再改也不回跳，从画面上接着走',
      build: (c) => {
        const num = big(cu({ value: 500, duration: 1200 }));
        const status = note('当前 value = 500（等第一段落定）');
        num.addEventListener('x-finish', (e) => (status.textContent = `已落定：${e.detail.value}，再点下面按钮改目标值`));
        c.append(
          num,
          row(
            btn('改成 1500', () => { num.value = 1500; status.textContent = '500 → 1500 滚动中…'; }),
            btn('快速连点看中途改值', () => { num.value = Math.round(1000 + Math.random() * 9999); status.textContent = `目标改为 ${num.value}（从当前画面值续滚）`; }),
          ),
          status,
        );
      },
      code: `el.value = 1500; // 从当前显示值（如已落定的 500）滚到 1500
el.value = 9999; // 滚动中途再改：从画面上的数字接着走，不回跳、不重播`,
    }),

    demoCard({
      title: '前后缀 · 小数 · 分组',
      desc: 'prefix/suffix 挂前后缀；decimals 缺省自动跟随目标值小数位；grouping 关掉千分位',
      build: (c) => {
        const noGroup = big(cu({ value: 1234567, suffix: ' 人次' }));
        noGroup.grouping = false; // h() 会跳过 false 值，布尔假须直接写属性
        c.append(
          row(
            big(cu({ value: 1289564, prefix: '¥' })),
            big(cu({ value: 62.5, suffix: '%', duration: 1000 })),
            big(cu({ value: -12345.6, duration: 1000 })),
            noGroup,
          ),
          note('62.5 自动滚出 1 位小数；-12345.6 负号不丢；grouping=false 时无千分位分隔'),
        );
      },
      code: `<x-count-up value="1289564" prefix="¥"></x-count-up>
<x-count-up value="62.5" suffix="%"></x-count-up>          <!-- 小数位自动 -->
<x-count-up value="-12345.6"></x-count-up>
<x-count-up value="1234567" grouping="false" suffix=" 人次"></x-count-up>
<x-count-up value="3.14159" decimals="2"></x-count-up>    <!-- 强制 2 位：3.14 -->`,
    }),

    demoCard({
      title: '尺寸与排版随上下文',
      desc: '组件是纯内联文本，字号/字重/颜色直接吃外层 CSS，可嵌进任何排版里',
      build: (c) => {
        c.append(
          h('div', { style: 'font-size:34px;font-weight:700' }, h('x-count-up', { value: '98.6', suffix: ' 分' })),
          h('div', { style: 'margin-top:8px;color:var(--xie-color-muted)' }, '今天访问 '), h('x-count-up', { value: '1024', style: 'color:var(--xie-color-primary);font-weight:600' }), h('span', { style: 'color:var(--xie-color-muted)' }, ' 人'),
        );
      },
      code: `<div style="font-size:34px;font-weight:700">
  <x-count-up value="98.6" suffix=" 分"></x-count-up>
</div>
<p>今天访问 <x-count-up value="1024" style="color:#1677ff"></x-count-up> 人</p>`,
    }),

    demoCard({
      title: '触发方式 trigger 与手动方法',
      desc: 'mount 缺省即挂即滚；visible 首次进入视口才滚（长页统计区常用）。没有 manual 档：等数据再滚就先不写 value，值到了自会滚',
      build: (c) => {
        const num = big(cu({ value: 2048 }));
        const finishLog = note('mount 加载时已自动滚过一轮——先 reset 再 play 即可重播');
        num.addEventListener('x-finish', () => (finishLog.textContent = 'x-finish 已到：' + num.value));
        c.append(
          num,
          row(
            btn('play()', () => num.play()),
            btn('play(8888)', () => num.play(8888)),
            btn('reset()', () => { num.reset(); finishLog.textContent = '已退回 0；此时 play() 重播，或改 value 也会自动滚'; }),
            btn('immediate()', () => { num.immediate(); finishLog.textContent = '直接落定（无动画）'; }),
          ),
          finishLog,
        );
      },
      code: `<x-count-up value="2048"></x-count-up>                     <!-- mount 缺省：即挂即滚 -->
<x-count-up value="2048" trigger="visible"></x-count-up>   <!-- 滚动进视口才首播(IntersectionObserver) -->
el.play();       // visible 首播强启 / reset 后重播：滚向 value
el.play(8888);   // 带目标：等价于先 el.value = 8888 再滚，一步到位
el.reset();      // 退回 0 并停止（无参）；之后改 value 仍自动续滚
el.immediate();  // 无动画落定；也可 el.immediate(8888) 带目标
el.value = 1500; // 纯状态写法：起播过之后改属性自动续滚，无需再调 play()
<!-- 想「等数据到达再滚」：HTML 先不写 value，到达后赋值即可（mount 下自动从 0 滚过去） -->`,
    }),

    h('h2', null, 'API · x-count-up'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['value', '目标数字（反射）。变更后从当前显示值续滚到新目标；首播固定从 0 滚起，初始不写即显示 0', 'number', '0'],
        ['duration', '滚动时长（ms）', 'number', '1500'],
        ['easing', '缓动：linear / ease-out（先快后慢）/ ease-in-out', 'string', "'ease-out'"],
        ['decimals', '小数位数；-1 = 自动跟随目标值小数位', 'number', '-1'],
        ['grouping', '千分位分隔开关（反射）', 'boolean', 'true'],
        ['separator', '千分位符', 'string', "','"],
        ['prefix / suffix', '前缀 / 后缀文本（如 ¥、%、人）', 'string', "''"],
        ['trigger', '起播方式（反射）：mount（缺省，即挂即滚）/ visible（首次进视口才滚）；未知值按 mount 兜底', 'string', "'mount'"],
      ],
    ),
    apiTable(
      ['方法 / 事件 / Part', '说明'],
      [
        ['play(target?)', '启动滚动：从当前显示值滚向 target（缺省取当前 value）。场景：visible 首播强启、reset 后重播、一步改目标；传 target 等价于先写 value 再滚（含反射）'],
        ['reset()', '无参数。退回 0 并停止；起播状态不丢，之后改 value 仍会自动续滚'],
        ['immediate(target?)', '无动画直接落定 target（缺省取当前 value）'],
        ['改目标', '两条等价路径：写属性 el.value = 1500（已起播则自动续滚）；或一步 el.play(1500)（visible 未进场时也能强启）'],
        ['x-finish', '滚动落定时派发（bubbles+composed），detail:{ value }'],
        ['part', 'num'],
      ],
    ),

    h('h2', null, '说明'),
    h('p', null, '实现细节：requestAnimationFrame 补间、零依赖；数字用 <code>tabular-nums</code> 等宽渲染，滚动过程宽度不抖动；<code>prefers-reduced-motion: reduce</code> 下不做动画直接落定目标值（同样派发 <code>x-finish</code>）。落定值精确等于目标（消除浮点残差）。首播总是从 0 起滚，需要「从旧值滚向新值」时用 <code>el.immediate(400); el.play(500)</code> 组合。适合放进 x-box / 排版容器里做仪表盘统计数字。'),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
