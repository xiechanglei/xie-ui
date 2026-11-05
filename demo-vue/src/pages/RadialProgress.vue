<script setup lang="ts">
// Radial Progress 圆环进度：定值 / 不确定 / 语义色 / 尺寸厚度 / 中心内容。仅「动态推进」含交互：
// 渲染标记 == source，:script 展示原生写法、不执行，真实推进由 :setup 用 Vue 定时器实现。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// 交互的 Vue 侧实现：value 就是普通 property，点按钮用 setInterval 递增
const setupRadialRun = (root: HTMLElement) => {
  const ringEl = root.querySelector('#rp-live');
  if (!ringEl) return;
  const ring = ringEl as unknown as { value: number };
  root.querySelector('#rp-run')?.addEventListener('click', () => {
    let v = 0;
    ring.value = 0;
    const timer = setInterval(() => {
      v = Math.min(v + 6 + Math.round(Math.random() * 9), 100);
      ring.value = v;
      if (v >= 100) clearInterval(timer);
    }, 240);
  });
};

// API 表数据（严格对齐 src/components/radial-progress/x-radial-progress.ts）
const RP_PROPS_ROWS = [
  ['value', '完成度（反射，0–100，越界夹紧）；未设置 = 不确定模式；变化时默认 250ms 补间扫过去', 'number', '—'],
  ['indeterminate', '强制不确定（反射），忽略 value', 'boolean', 'false'],
  ['color', '语义色（反射）', "'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default'", "'primary'"],
  ['size', '圆环直径（写局部变量，纯数字按 px）', 'string', "'64px'"],
  ['thickness', '环带厚度（写局部变量，纯数字按 px）', 'string', "'size/10'"],
  ['duration', '值变化补间时长 ms；0 = 直接落定', 'number', '250'],
  ['label', '无障碍名（不确定模式自动改播「加载中」）', 'string', "'进度'"],
];
const RP_SLOTS_ROWS = [
  ['default', '中心内容：放任何东西即整体覆盖自动百分比（图标/自定义文本/留空）'],
];
const RP_PARTS_ROWS = [
  ['base', 'x-radial-progress', '定尺寸外壳'],
  ['ring', 'x-radial-progress', '进度环（conic + mask 抠出的环带）'],
  ['center', 'x-radial-progress', '中心层（插槽/自动百分比）'],
];
</script>

<template>
  <div>
    <h1>Radial Progress 圆环进度</h1>
    <p class="lead">圆形完成度指示。写 value（0–100）环从 12 点方向按比例上色，不写（或加 indeterminate）即不确定转环；中心默认显示百分比，放插槽内容即整体覆盖。值变化是个动态过程：弧段与中心百分比同帧补间到新值（同 x-count-up 语义，duration 可调）。与线性 <code>x-progress</code> 同一套语义——占地小、能塞中心内容，适合仪表盘与卡片角；颜色走全库统一 7 角色语义色。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-radial-progress</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="定值 value"
      desc="0–100，越界自动夹紧；中心自动显示百分比（tabular-nums 不抖宽）"
      :source='`
<x-radial-progress value="0"></x-radial-progress>
<x-radial-progress value="25"></x-radial-progress>
<x-radial-progress value="60"></x-radial-progress>
<x-radial-progress value="88"></x-radial-progress>
<x-radial-progress value="100" color="success"></x-radial-progress>
`'
    />

    <Demo
      title="动态推进"
      desc="value 就是普通 property：ring.value = 42 即更新，环与百分比自动补间过去（中途改值从画面上接着走，不回跳）"
      :column="true"
      :source='`
<x-radial-progress id="rp-live" value="0" color="warning"></x-radial-progress>
<div><x-button id="rp-run" variant="outline" size="sm">跑起来</x-button></div>
`'
      :script='`
const ring = document.querySelector("#rp-live");
document.querySelector("#rp-run").addEventListener("click", () => {
  let v = 0;
  ring.value = 0;
  const timer = setInterval(() => {
    v = Math.min(v + 6 + Math.round(Math.random() * 9), 100);
    ring.value = v;
    if (v >= 100) clearInterval(timer);
  }, 240);
});
`'
      :setup="setupRadialRun"
    />

    <Demo
      title="不确定模式"
      desc="不写 value 即转环；或显式 indeterminate 忽略 value。与 spinner 分工：进度未知用它、纯「在忙」用 spinner"
      :source='`
<x-radial-progress></x-radial-progress>
<x-radial-progress indeterminate color="danger"></x-radial-progress>
`'
    />

    <Demo
      title="语义色 color"
      desc="7 角色与 progress/spinner 同族；default 为中性前景色"
      :source='`
<x-radial-progress value="70" color="default"></x-radial-progress>
<x-radial-progress value="70" color="primary"></x-radial-progress>
<x-radial-progress value="70" color="secondary"></x-radial-progress>
<x-radial-progress value="70" color="success"></x-radial-progress>
<x-radial-progress value="70" color="warning"></x-radial-progress>
<x-radial-progress value="70" color="danger"></x-radial-progress>
<x-radial-progress value="70" color="info"></x-radial-progress>
`'
    />

    <Demo
      title="尺寸 size 与厚度 thickness"
      desc="任意 CSS 长度或纯数字（按 px）；厚度缺省 = 直径/10，细粗两向都撑得住"
      :source='`
<x-radial-progress value="72" size="96" thickness="3"></x-radial-progress>
<x-radial-progress value="72" size="96" thickness="14" color="secondary"></x-radial-progress>
<x-radial-progress value="72" size="40" color="success"></x-radial-progress>
<x-radial-progress value="72" size="4rem" thickness="0.6rem" color="info"></x-radial-progress>
`'
    />

    <Demo
      title="中心内容"
      desc="默认插槽放任何东西即整体覆盖自动百分比——完成态放勾、自定义文案都行"
      :source='`
<x-radial-progress value="100" color="success">
  <x-icon name="check" size="22"></x-icon>
</x-radial-progress>
<x-radial-progress value="45" color="warning">
  <div style="text-align:center; line-height:1.25">上传中<br><b>45%</b></div>
</x-radial-progress>
<x-radial-progress value="72"></x-radial-progress>
`'
    />

    <h2>设计要点</h2>
    <p>画法用 <b>conic-gradient 扇形 + radial-gradient mask 抠洞</b>，不依赖 SVG 周长——任意 size/thickness 组合零数学，环带厚度就是 mask 挖掉的半径差。起点 12 点方向（<code>from -90deg</code>），轨道余量色自动取主色 18% 淡染（覆写 <code>--_rp-track</code>）。<b>抗锯齿</b>：mask/conic 硬停点的 alpha 二值跳变不享几何 AA，内壁圆（小半径大曲率）会现阶梯毛刺——故 mask 抠洞两停点错开 1px、conic 弧头留 0.6% 过渡带，让渐变插值自己当抗锯齿用。<b>动态过程</b>：value 变化由 rAF 从当前显示值补间到新目标（ease-out，缺省 250ms，<code>duration="0"</code> 直接落定），弧与中心百分比逐帧同步行走，首次挂载从 0 扫上去（同 x-count-up）；百分比经宿主局部变量 <code>--_rp-pct</code> 逐帧直写，不重渲结构。<code>role="progressbar"</code> + <code>aria-valuenow/min/max</code> 挂在环上且始终直报目标值（读屏不被逐帧中间态轰炸），不确定模式自动省略 valuenow 并改播「加载中」。<code>prefers-reduced-motion: reduce</code> 下转环停为静态半弧、补间直接落定。</p>

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="RP_PROPS_ROWS" />
    <ApiTable title="插槽 Slots" :columns="['插槽', '说明']" :rows="RP_SLOTS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '所属', '说明']" :rows="RP_PARTS_ROWS" />
  </div>
</template>
