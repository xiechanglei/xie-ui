<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <h1>{{ route.meta.label }}</h1>
  <p class="lead">
    该页
    <code v-if="route.meta.tag">&lt;{{ route.meta.tag }}&gt;</code>
    尚未迁移到 Vue 文档范式。当前骨架先以
    <router-link to="/start">介绍</router-link>
    与
    <router-link to="/button">Button 按钮</router-link>
    作为旗舰样例，待通用 <code>&lt;Demo&gt;</code> 组件（源码同时驱动预览与代码、二者绝对一致）的范式验收后，再按分类批量迁移其余页面。
  </p>
</template>
