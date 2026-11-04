<script setup lang="ts">
// CountUp 数字渐变：value 补间续滚 + 前后缀/小数/分组 + trigger + 手动方法。
// 「基础/前后缀/排版」为静态（mount 即自动滚）；「续滚语义」「手动方法」含交互：
// 渲染标记 == source，:script 展示原生写法、不执行，真实改值 / 调方法由 :setup 用 Vue 实现。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

type CountUp = {
  value: number;
  play: (target?: number) => void;
  reset: () => void;
  immediate: (target?: number) => void;
};
const setText = (el: Element | null, v: string) => { if (el) el.textContent = v; };

// 续滚语义：点按钮改 value（Element 上直接监听 x-finish）
const setupCountRoll = (root: HTMLElement) => {
  const numEl = root.querySelector('#cu-roll');
  if (!numEl) return;
  const num = numEl as unknown as CountUp;
  const status = root.querySelector('#cu-roll-status');
  numEl.addEventListener('x-finish', (e) => {
    const v = (e as CustomEvent<{ value: number }>).detail.value;
    setText(status, `已落定：${v}，再点下面按钮改目标值`);
  });
  root.querySelector('#cu-set1500')?.addEventListener('click', () => { num.value = 1500; setText(status, '500 → 1500 滚动中…'); });
  root.querySelector('#cu-random')?.addEventListener('click', () => {
    num.value = Math.round(1000 + Math.random() * 9999);
    setText(status, `目标改为 ${num.value}（从当前画面值续滚）`);
  });
};

// 手动方法：play / play(8888) / reset / immediate
const setupCountMethods = (root: HTMLElement) => {
  const numEl = root.querySelector('#cu-manual');
  if (!numEl) return;
  const num = numEl as unknown as CountUp;
  const log = root.querySelector('#cu-manual-log');
  numEl.addEventListener('x-finish', () => setText(log, 'x-finish 已到：' + num.value));
  root.querySelector('#cu-play')?.addEventListener('click', () => num.play());
  root.querySelector('#cu-play8888')?.addEventListener('click', () => num.play(8888));
  root.querySelector('#cu-reset')?.addEventListener('click', () => { num.reset(); setText(log, '已退回 0；此时 play() 重播，或改 value 也会自动滚'); });
  root.querySelector('#cu-immediate')?.addEventListener('click', () => { num.immediate(); setText(log, '直接落定（无动画）'); });
};

// API 表数据（严格对齐 src/components/*/x-count-up.ts）
const CU_PROPS_ROWS = [
  ['value', '目标数字（反射）。变更后从当前显示值续滚到新目标；首播固定从 0 滚起，初始不写即显示 0', 'number', '0'],
  ['duration', '滚动时长（ms）', 'number', '1500'],
  ['easing', '缓动：linear / ease-out（先快后慢）/ ease-in-out', 'string', "'ease-out'"],
  ['decimals', '小数位数；-1 = 自动跟随目标值小数位', 'number', '-1'],
  ['grouping', '千分位分隔开关（反射）', 'boolean', 'true'],
  ['separator', '千分位符', 'string', "','"],
  ['prefix / suffix', '前缀 / 后缀文本（如 ¥、%、人）', 'string', "''"],
  ['trigger', '起播方式（反射）：mount（缺省，即挂即滚）/ visible（首次进视口才滚）；未知值按 mount 兜底', 'string', "'mount'"],
];
const CU_API_ROWS = [
  ['play(target?)', '启动滚动：从当前显示值滚向 target（缺省取当前 value）。传 target 等价于先写 value 再滚（含反射）'],
  ['reset()', '无参数。退回 0 并停止；起播状态不丢，之后改 value 仍会自动续滚'],
  ['immediate(target?)', '无动画直接落定 target（缺省取当前 value）'],
  ['改目标', '两条等价路径：写属性 el.value = 1500（已起播则自动续滚）；或一步 el.play(1500)'],
  ['x-finish', '滚动落定时派发（bubbles+composed），detail:{ value }'],
  ['part', 'num'],
];
</script>

<template>
  <div>
    <h1>CountUp 数字渐变</h1>
    <p class="lead"><code>&lt;x-count-up&gt;</code> 把数字从起点快速补间到目标值（打开页面时「从 0 涨上去」的统计效果）。核心语义是监听 <code>value</code>：目标值变化时从当前显示值续滚到新目标，中途改值不回跳。零依赖，rAF 驱动，等宽数字不抖宽。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-count-up</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="挂载即从 0 滚到 value；落定派发 x-finish"
      :column="true"
      :source='`
<x-count-up value="87654" style="font-size: 28px; font-weight: 600"></x-count-up>
`'
      :script='`
const el = document.querySelector("x-count-up");
el.addEventListener("x-finish", (e) => console.log("落定", e.detail.value));
`'
    />

    <Demo
      title="监听 value · 续滚语义"
      desc="改 value 即从当前显示值滚向新值；滚动中途再改也不回跳，从画面上接着走"
      :column="true"
      :source='`
<x-count-up id="cu-roll" value="500" duration="1200" style="font-size: 28px; font-weight: 600"></x-count-up>
<div class="demo-stage">
  <x-button id="cu-set1500" variant="outline" size="sm">改成 1500</x-button>
  <x-button id="cu-random" variant="outline" size="sm">快速连点看中途改值</x-button>
</div>
<div id="cu-roll-status" class="demo-status">当前 value = 500（等第一段落定）</div>
`'
      :script='`
const el = document.querySelector("#cu-roll");
el.value = 1500; // 从当前显示值（如已落定的 500）滚到 1500
el.value = 9999; // 滚动中途再改：从画面上的数字接着走，不回跳、不重播
`'
      :setup="setupCountRoll"
    />

    <Demo
      title="前后缀 · 小数 · 分组"
      desc="prefix/suffix 挂前后缀；decimals 缺省自动跟随目标值小数位；grouping 关掉千分位"
      :source='`
<div class="demo-stage" style="font-size: 28px; font-weight: 600">
  <x-count-up value="1289564" prefix="¥"></x-count-up>
  <x-count-up value="62.5" suffix="%" duration="1000"></x-count-up>
  <x-count-up value="-12345.6" duration="1000"></x-count-up>
  <x-count-up value="1234567" grouping="false" suffix=" 人次"></x-count-up>
</div>
`'
    />

    <Demo
      title="尺寸与排版随上下文"
      desc="组件是纯内联文本，字号/字重/颜色直接吃外层 CSS，可嵌进任何排版里"
      :column="true"
      :source='`
<div style="font-size: 34px; font-weight: 700"><x-count-up value="98.6" suffix=" 分"></x-count-up></div>
<div style="margin-top: 8px; color: var(--xie-color-muted)">今天访问 <x-count-up value="1024" style="color: var(--xie-color-primary); font-weight: 600"></x-count-up> 人</div>
`'
    />

    <Demo
      title="触发方式 trigger 与手动方法"
      desc="mount 缺省即挂即滚；visible 首次进入视口才滚。play / reset / immediate 三个方法可随时干预"
      :column="true"
      :source='`
<x-count-up id="cu-manual" value="2048" style="font-size: 28px; font-weight: 600"></x-count-up>
<div class="demo-stage">
  <x-button id="cu-play" variant="outline" size="sm">play()</x-button>
  <x-button id="cu-play8888" variant="outline" size="sm">play(8888)</x-button>
  <x-button id="cu-reset" variant="outline" size="sm">reset()</x-button>
  <x-button id="cu-immediate" variant="outline" size="sm">immediate()</x-button>
</div>
<div id="cu-manual-log" class="demo-status">mount 加载时已自动滚过一轮——先 reset 再 play 即可重播</div>
`'
      :script='`
el.play();       // visible 首播强启 / reset 后重播：滚向 value
el.play(8888);   // 带目标：等价于先 el.value = 8888 再滚，一步到位
el.reset();      // 退回 0 并停止（无参）；之后改 value 仍自动续滚
el.immediate();  // 无动画落定；也可 el.immediate(8888) 带目标
`'
      :setup="setupCountMethods"
    />

    <h2>API · x-count-up</h2>
    <ApiTable :columns="['属性', '说明', '类型', '默认值']" :rows="CU_PROPS_ROWS" />
    <ApiTable :columns="['方法 / 事件 / Part', '说明']" :rows="CU_API_ROWS" />

    <h2>说明</h2>
    <p>实现细节：requestAnimationFrame 补间、零依赖；数字用 <code>tabular-nums</code> 等宽渲染，滚动过程宽度不抖动；<code>prefers-reduced-motion: reduce</code> 下不做动画直接落定目标值（同样派发 <code>x-finish</code>）。首播总是从 0 起滚，需要「从旧值滚向新值」时用 <code>el.immediate(400); el.play(500)</code> 组合。</p>
  </div>
</template>
