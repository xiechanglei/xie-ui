<script setup lang="ts">
// Avatar 头像：x-avatar 的图片 / 文字 / 姓名首字 / 占位、shape / size / color 演示。纯展示。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// 图片示例：为保持「渲染标记 == 展示源码」，直接用内联 SVG data URI（避免外链），含单引号须放脚本常量。
const AVATAR_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%236366f1'/%3E%3Ccircle cx='20' cy='15' r='7' fill='white'/%3E%3Cpath d='M6 38a14 14 0 0 1 28 0' fill='white'/%3E%3C/svg%3E";
const IMG_SOURCE = `<x-avatar src="${AVATAR_IMG}" alt="示例头像"></x-avatar>`;

// API 表数据（严格对齐 src/components/avatar/x-avatar.ts）
const AVATAR_PROPS_ROWS = [
  ['src', '图片地址（有且加载成功则显示图片）', 'string', "''"],
  ['alt', '图片无障碍名', 'string', "''"],
  ['text', '无图时显示的文字（首字母 / emoji）', 'string', "''"],
  ['name', 'text 为空时从姓名取第一个字（大写）', 'string', "''"],
  ['size', '尺寸：令牌别名或 CSS 长度', "'sm' | 'md' | 'lg' | <长度>", "'md'"],
  ['shape', '形状：default 跟随全局圆角档位（吃 --xie-radius-md）', "'default' | 'circle' | 'rounded' | 'square'", "'default'"],
  ['color', '文字态底色角色（default 为中性缺省态，非强调角色）', "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'", "'default'"],
];
const AVATAR_PARTS_ROWS = [
  ['base', '内部包裹盒（display:contents 定制钩子）'],
  ['image', '图片元素'],
  ['text', '文字元素'],
  ['placeholder', '占位图标（x-icon）'],
];
</script>

<template>
  <div>
    <h1>Avatar 头像</h1>
    <p class="lead">定尺寸、可圆角、带底色的头像方块。内容回退链：图片（src）&gt; 文字（text）&gt; 姓名首字（name）&gt; 占位图标。底色/文字吃角色令牌，随主题实时联动。logo 的标识方块即复用本组件。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-avatar</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="图片头像"
      desc="src 有值且加载成功则显示图片（object-fit:cover）"
      :source="IMG_SOURCE"
    />

    <Demo
      title="文字 / 姓名首字"
      desc="无图时显 text；仅有 name 时自动取第一个字（同 logo）"
      :source='`
<x-avatar text="AB" color="primary"></x-avatar>
<x-avatar name="Ada Lovelace" color="success"></x-avatar>
<x-avatar name="Linus Torvalds"></x-avatar>
`'
    />

    <Demo
      title="占位图标"
      desc="既无图又无文字/name 时显示内置 user 占位"
      :source='`
<x-avatar color="secondary"></x-avatar>
`'
    />

    <Demo
      title="加载失败回退"
      desc="src 加载失败自动回退到文字，保证不出现破图"
      :source='`
<x-avatar src="/no-such-image.png" text="ZP" color="danger"></x-avatar>
`'
    />

    <Demo
      title="形状 shape"
      desc="default（不写即是，跟随主题面板全局圆角档位）/ circle / rounded / square"
      :source='`
<x-avatar text="随"></x-avatar>
<x-avatar text="圆" shape="circle"></x-avatar>
<x-avatar text="角" shape="rounded" color="warning"></x-avatar>
<x-avatar text="方" shape="square" color="info"></x-avatar>
`'
    />

    <Demo
      title="尺寸 size"
      desc="令牌 sm / md（默认）/ lg 或任意长度（如 56px）"
      :source='`
<x-avatar text="S" size="sm" color="primary"></x-avatar>
<x-avatar text="M" size="md" color="primary"></x-avatar>
<x-avatar text="L" size="lg" color="primary"></x-avatar>
<x-avatar text="XL" size="56px" color="primary"></x-avatar>
`'
    />

    <Demo
      title="配色角色 color"
      desc="文字态底色吃 --xie-color-{role}/-fg 令牌"
      :source='`
<x-avatar text="D" color="default"></x-avatar>
<x-avatar text="P" color="primary"></x-avatar>
<x-avatar text="S" color="secondary"></x-avatar>
<x-avatar text="S" color="success"></x-avatar>
<x-avatar text="W" color="warning"></x-avatar>
<x-avatar text="D" color="danger"></x-avatar>
<x-avatar text="I" color="info"></x-avatar>
`'
    />

    <p>提示：图片加载失败、或 src 为空时，会依次回退到 <code>text</code> → <code>name</code> 首字母 → 占位图标；深浅色与主色切换时底色/字色自动联动。</p>

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="AVATAR_PROPS_ROWS" />
    <ApiTable title="CSS 部分 Part" :columns="['part', '说明']" :rows="AVATAR_PARTS_ROWS" />
  </div>
</template>
