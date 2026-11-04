<script setup lang="ts">
// Icon 图标：注册表约定 + x-icon 用法 + API。画廊数据驱动，用 Vue v-for 渲染（属「交互/动态由 Vue 实现」）。
import { ref } from 'vue';
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';
// 直接读内部注册表源，画廊与 icons.ts 永远同步（仅文档站自用）
import { ICONS } from '../../../src/components/icon/icons';

const names = Object.keys(ICONS);
const copiedName = ref('');
async function copyUsage(name: string) {
  try {
    await navigator.clipboard?.writeText(`<x-icon name="${name}"></x-icon>`);
    copiedName.value = name;
    setTimeout(() => (copiedName.value = ''), 1000);
  } catch {
    copiedName.value = name + '__fail';
    setTimeout(() => (copiedName.value = ''), 1000);
  }
}

// 示例代码与 API 表数据（含引号，故放脚本常量；模板属性里写 " 或 &quot; 会被属性扫描截断）
const galleryCode = names.slice(0, 6).map((n) => `<x-icon name="${n}" size="24px"></x-icon>`).join('\n') + '\n…';
const ICON_PROPS_ROWS = [
  ['name', '注册表中的图标名；未登记渲染为空 svg（不报错）', 'string', "''"],
  ['size', 'CSS 长度，驱动宽高（写入内部 --_icon-size）', 'string', "''（= 1em）"],
  ['label', '无障碍名称（aria-label）；留空视为装饰（aria-hidden="true"）', 'string', "''"],
];
const ICON_PARTS_ROWS = [['svg', '内部 <svg>，供外部覆盖 stroke-width 等']];
</script>

<template>
  <div>
    <h1>Icon 图标</h1>
    <p class="lead">本 UI 库自用图标的集中出口。x-icon 只渲染已在内部 icons.ts 注册表登记的 SVG，不派生更多图标以保持库体积精简。描边统一使用 currentColor，随文本色与主题联动。</p>

    <h2>引入</h2>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <div class="demo-card">
      <div class="demo-card__preview">
        <div class="icon-gallery">
          <div
            v-for="n in names"
            :key="n"
            class="icon-gallery__cell"
            title="点击复制 <x-icon> 用法片段"
            @click="copyUsage(n)"
          >
            <x-icon :name="n" :label="n" size="22px"></x-icon>
            <span class="icon-gallery__name">{{ copiedName === n ? '片段已复制 ✓' : copiedName === n + '__fail' ? '复制失败' : n }}</span>
          </div>
        </div>
      </div>
      <div class="demo-card__title">全部内置图标 · 实时读取内部 icons.ts 注册表，当前共 {{ names.length }} 枚；名称即 name 属性取值，点击格子复制完整用法片段</div>
    </div>
    <CodeBlock :code="galleryCode" lang="xml" />

    <Demo
      title="颜色跟随 currentColor"
      desc="继承所在文字颜色；放进主题色容器即随主题色"
      :source='`
<div class="demo-stage" style="font-size: 22px">
  <span style="color: var(--xie-color-fg)"><x-icon name="moon"></x-icon></span>
  <span style="color: var(--xie-color-primary)"><x-icon name="moon"></x-icon></span>
  <span style="color: var(--xie-color-success)"><x-icon name="moon"></x-icon></span>
  <span style="color: var(--xie-color-danger)"><x-icon name="moon"></x-icon></span>
  <span style="color: var(--xie-color-warning)"><x-icon name="moon"></x-icon></span>
</div>
`'
    />

    <Demo
      title="尺寸 size"
      desc="size 接收任意 CSS 长度；默认 1em 随字号"
      :source='`
<div class="demo-stage">
  <x-icon name="sun" size="1em"></x-icon>
  <x-icon name="sun" size="16px"></x-icon>
  <x-icon name="sun" size="24px"></x-icon>
  <x-icon name="sun" size="36px"></x-icon>
</div>
`'
    />

    <Demo
      title="内部消费：单一图标源"
      desc="chevron-right→菜单分组折叠；close→抽屉关闭；sun/moon→外观开关；user→头像占位。此处 x-menu-group 折叠指示器即复用同一枚 chevron-right"
      :source='`
<x-menu style="max-width: 220px">
  <x-menu-group label="分组" collapsible>
    <x-menu-item value="a">项目 A</x-menu-item>
    <x-menu-item value="b">项目 B</x-menu-item>
  </x-menu-group>
</x-menu>
`'
    />

    <h2>API · x-icon</h2>
    <ApiTable title="属性 Properties" :columns="['属性', '说明', '类型', '默认值']" :rows="ICON_PROPS_ROWS" />
    <ApiTable title="样式部件 Parts" :columns="['part', '说明']" :rows="ICON_PARTS_ROWS" />

    <h2>设计约定</h2>
    <p>注册表 icons.ts 为内部实现，不作为包公开 API 导出（仅 x-icon 组件是外部出口）。新增图标流程：先在 icons.ts 增加 name → 内部 SVG 条目，再在需要的组件模板里用 <code>&lt;x-icon name&gt;</code>。</p>
    <p>统一约定：viewBox 0 0 24 24；fill="none"；stroke="currentColor"；stroke-width 2；stroke-linecap / stroke-linejoin round。所有条目均为单色描边图标，随主题明暗 / 主色即时联动。</p>
  </div>
</template>
