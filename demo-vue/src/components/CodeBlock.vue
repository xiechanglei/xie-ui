<script setup lang="ts">
import { ref, computed } from 'vue';
import { highlight, highlightAuto } from '../utils/highlight';

/** 纯代码块（无预览）：用于安装命令、框架配置、说明性片段等。带复制与语法高亮。 */
const props = defineProps<{
  code: string;
  /** 指定语言高亮；缺省则在 xml / javascript 内自动识别 */
  lang?: 'xml' | 'javascript';
}>();

const codeText = computed(() => props.code.trim());
const codeHtml = computed(() => (props.lang ? highlight(codeText.value, props.lang) : highlightAuto(codeText.value)));
const copied = ref(false);

async function copy() {
  try {
    await navigator.clipboard?.writeText(codeText.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1200);
  } catch {
    /* 无剪贴板权限时静默 */
  }
}
</script>

<template>
  <div class="demo-card">
    <div class="demo-card__code">
      <button class="demo-card__copy" @click="copy">{{ copied ? '已复制' : '复制' }}</button>
      <pre><code class="hljs" v-html="codeHtml"></code></pre>
    </div>
  </div>
</template>
