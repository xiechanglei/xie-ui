<script setup lang="ts">
// Slider 离散滑块：档位吸附 + 拖动/点选。基础/受控联动两例含交互（x-change / x-input 由 :setup 实现），多档位/禁用为静态。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// 基础：x-change 提交时回显档位标签（detail { index, value }）
const BASE_SOURCE = `<x-slider id="slider-base" options="紧凑,标准,宽松" value="1" label="尺寸" style="max-width: 260px"></x-slider>
<span id="slider-base-out" style="margin-left: 16px; font-size: 13px; color: var(--xie-color-muted)">当前：标准</span>`;

const setupSliderBase = (root: HTMLElement) => {
  const s = root.querySelector('#slider-base');
  const out = root.querySelector('#slider-base-out');
  if (!s) return;
  s.addEventListener('x-change', (e) => {
    const v = (e as CustomEvent<{ index: number; value: string }>).detail.value;
    if (out) out.textContent = '当前：' + v;
  });
};

// 受控联动：x-input 拖动实时映射整页圆角 data-xie-radius
const RADIUS_SOURCE = `<x-slider id="slider-radius" options="直角,小,中,大,圆" value="2" label="整页圆角" style="max-width: 300px"></x-slider>`;

const setupSliderRadius = (root: HTMLElement) => {
  const s = root.querySelector('#slider-radius');
  if (!s) return;
  const map = ['none', 'sm', 'md', 'lg', 'full'];
  s.addEventListener('x-input', (e) => {
    const idx = (e as CustomEvent<{ index: number; value: string }>).detail.index;
    document.documentElement.setAttribute('data-xie-radius', map[idx]);
  });
};

// API 表数据（严格对齐 src/components/slider/x-slider.ts）
const SLIDER_PROPS_ROWS = [
  ['options', '档位标签，逗号分隔；项数即档位数（反射）', 'string', "''"],
  ['value', '选中档位下标（反射，0 ~ 项数-1）', 'number', '0'],
  ['disabled', '是否禁用（不可拖动/聚焦）', 'boolean', 'false'],
  ['label', '无障碍名称（aria-label，无视觉表现）', 'string', "''"],
  ['name', '表单字段名（FCCE 的 FormData 键，反射）', 'string', "''"],
];
const SLIDER_EVENTS_ROWS = [
  ['x-input', '拖动过程中档位变化实时派发（composed）', '{ index, value }'],
  ['x-change', '松手 / 键盘换档提交时派发（composed）', '{ index, value }'],
];
const SLIDER_PARTS_ROWS = [['part', 'base / track / fill / stops / thumb / labels']];
</script>

<template>
  <div>
    <h1>Slider 滑块</h1>
    <p class="lead">离散选项滑块：在若干等距档位间拖动或点选，手柄自动吸附到最近档位。适合「少量预设档位」的选择（如主题面板的圆角 / 尺寸 / 阴影），比一排分段按钮更紧凑。<code>value</code> 是选中档位下标。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-slider</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="options 逗号分隔档位标签，value 为下标；拖动实时 x-input、松手 x-change"
      :source="BASE_SOURCE"
      :script='`
const s = document.querySelector("#slider-base");
const out = document.querySelector("#slider-base-out");
s.addEventListener("x-change", (e) => {
  out.textContent = "当前：" + e.detail.value;
});
`'
      :setup="setupSliderBase"
    />

    <Demo
      title="多档位"
      desc="档位数量不限，标签自动均分对齐到手柄下方"
      :source='`<x-slider options="直角,小,中,大,圆" value="2" label="圆角" style="max-width: 300px"></x-slider>`'
    />

    <Demo
      title="禁用"
      desc="disabled 让手柄不可拖动/聚焦"
      :source='`<x-slider options="A,B,C,D" value="1" disabled label="禁用示例" style="max-width: 240px"></x-slider>`'
    />

    <Demo
      title="受控联动：拖动改整页圆角"
      desc="监听 x-input 实时把档位映射到 data-xie-radius，所见即所得"
      :source="RADIUS_SOURCE"
      :script='`
const slider = document.querySelector("#slider-radius");
slider.addEventListener("x-input", (e) => {
  const map = ["none", "sm", "md", "lg", "full"];
  document.documentElement.setAttribute("data-xie-radius", map[e.detail.index]);
});
`'
      :setup="setupSliderRadius"
    />

    <h2>键盘与指针</h2>
    <p>手柄聚焦后方向键 ←/→/↑/↓ 逐档移动（首/末档停止）。指针：轨道点按定位、按住拖动跨档吸附。程序化设置 <code>value</code> 不派发事件，可作受控组件。当前不做 PageUp/Down/Home/End（MVP）。</p>

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="SLIDER_PROPS_ROWS" />
    <ApiTable title="事件 Events" :columns="['事件', '说明', '回调参数']" :rows="SLIDER_EVENTS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '说明']" :rows="SLIDER_PARTS_ROWS" />
  </div>
</template>
