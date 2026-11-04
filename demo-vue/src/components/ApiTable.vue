<script setup lang="ts">
/**
 * API 表格：首列按代码样式呈现（属性名/事件名等），其余列纯文本。
 * 对齐旧 demo/render.js 的 apiTable()，类名 .api-table。可选 title 渲染为小标题。
 */
defineProps<{
  title?: string;
  columns: string[];
  rows: string[][];
}>();
</script>

<template>
  <div>
    <h3 v-if="title">{{ title }}</h3>
    <table class="api-table">
      <thead>
        <tr>
          <th v-for="c in columns" :key="c">{{ c }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i">
          <td v-for="(cell, j) in row" :key="j">
            <code v-if="j === 0">{{ cell }}</code>
            <template v-else>{{ cell }}</template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
