<script setup lang="ts">
// Logo 品牌标识：x-logo 的 full / src / rail 演示。纯展示（rail 显隐由属性驱动，非 JS 交互）。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// 图片标识示例：为遵循「渲染标记 == 展示源码」，示例里直接用内联 SVG data URI（避免外链网络），
// 故代码面板会显示完整 URI；含单引号，须放脚本常量（模板属性里写单引号会被截断）。
const LOGO_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%232563eb'/%3E%3Ctext x='20' y='27' font-size='22' font-weight='700' fill='white' text-anchor='middle'%3EX%3C/text%3E%3C/svg%3E";
const SRC_SOURCE = `<x-logo src="${LOGO_IMG}" title="xie-ui" subtitle="v0.0.1"></x-logo>`;

// API 表数据（严格对齐 src/components/logo/x-logo.ts：mark / src / title / subtitle / rail）
const LOGO_PROPS_ROWS = [
  ['mark', '标识文字（方块内容；rail 时取其首字母）', 'string', "''"],
  ['src', '品牌图片地址（传给内部 x-avatar；留空显字母）', 'string', "''"],
  ['title', '名称', 'string', "''"],
  ['subtitle', '副标题（版本号 / 标语）', 'string', "''"],
  ['rail', '窄栏态：隐藏文字、只显首字母（一般由 x-container 设置）', 'boolean', 'false'],
];
const LOGO_PARTS_ROWS = [
  ['mark', '标识方块（内嵌 x-avatar）'],
  ['text', '文字容器（title + subtitle）'],
  ['title', '名称文本'],
  ['subtitle', '副标题文本'],
];
</script>

<template>
  <div>
    <h1>Logo 品牌标识</h1>
    <p class="lead">站点 / 侧栏顶部的品牌块：标识方块（mark）+ 名称（title）+ 副标题（subtitle）。mark 底色吃主色令牌随主题联动；rail 窄栏态只显首字母，配合 x-container 侧栏折叠使用。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-logo</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="完整形态"
      desc="mark + title + subtitle"
      :source='`
<x-logo mark="X" title="xie-ui" subtitle="v0.0.1"></x-logo>
`'
    />

    <Demo
      title="仅名称"
      desc="省略 subtitle"
      :source='`
<x-logo mark="xie" title="xie-ui"></x-logo>
`'
    />

    <Demo
      title="图片标识 src"
      desc="logo 的 mark 复用 x-avatar，src 有值则显品牌图片（无图回退字母）"
      :source="SRC_SOURCE"
    />

    <Demo
      title="窄栏态 rail"
      desc="隐藏 title/subtitle，mark 只显示首字母（大写）并居中"
      :source='`
<x-logo mark="xie-ui" title="xie-ui" subtitle="v0.0.1" rail></x-logo>
`'
    />

    <p>说明：rail 通常<b>不由手写</b>，而由父级 <code>x-container</code> 在侧栏折叠时自动下沉；单独使用时手动加 <code>rail</code> 属性即可预览效果。折叠动画期内侧栏轨道宽度是缓动的，而文字块的显隐是一帧切换的，因此 title/subtitle 固定单行不折行、文字块 <code>overflow:hidden</code> 随轨道宽裁切。</p>

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="LOGO_PROPS_ROWS" />
    <ApiTable title="CSS 部分 Part" :columns="['part', '说明']" :rows="LOGO_PARTS_ROWS" />
  </div>
</template>
