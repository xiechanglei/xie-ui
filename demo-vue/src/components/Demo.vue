<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { highlight } from '../utils/highlight';

/**
 * 通用演示块（文档站演示区的唯一封装）。
 * 两类演示、一条原则——「演示的标记」永远就是预览渲染出来的那段（所见即所渲染）：
 *  · 纯 HTML：只给 source，注入渲染与代码展示同源，天然一致。
 *  · 含交互：source 仍是渲染与展示的唯一标记来源；script 只是【展示用】的原生 JS 片段
 *    （文档案例以原生运行环境描述），不再被执行——真实交互效果由宿主页面 Vue 实现，经 setup(root) 绑定。
 */
const props = defineProps<{
  title?: string;
  desc?: string;
  /** 演示源码（自定义元素标记）——预览即注入它、代码即展示它 */
  source: string;
  /** 【仅展示】配套的原生 JS 片段，追加进代码面板；不参与运行 */
  script?: string;
  /** Vue 侧真实交互实现：注入完成后由本组件 onMounted 调用，root 为预览容器（元素 id 需整页唯一） */
  setup?: (root: HTMLElement) => void;
  /** 可选：预览区改为纵向排布（默认横排换行）；仅影响演示台布局，不进入展示源码 */
  column?: boolean;
}>();

const previewEl = ref<HTMLElement | null>(null);
const copied = ref(false);

/** 去掉多行字符串的公共缩进（首行留空由 trim 处理），让内联书写的示例展示/注入都整洁 */
function dedent(s: string): string {
  const text = s.replace(/\t/g, '  ');
  const lines = text.split('\n');
  const indents = lines
    .filter((l) => l.trim().length > 0)
    .map((l) => l.match(/^ */)![0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join('\n').trim();
}

const sourceHtml = computed(() => (props.source ? dedent(props.source) : ''));
const scriptBody = computed(() => (props.script ? dedent(props.script) : ''));

// 复制用纯文本（源码 + 空行 + 脚本）
const codeText = computed(() => {
  const src = sourceHtml.value;
  return props.script ? `${src}\n\n${scriptBody.value}` : src;
});
// 展示用高亮 HTML：源码按 xml、脚本按 javascript 分别分词后拼接（两种语言各回各家，混合也不错色）
const codeHtml = computed(() => {
  const src = highlight(sourceHtml.value, 'xml');
  return props.script ? `${src}\n\n${highlight(scriptBody.value, 'javascript')}` : src;
});

onMounted(() => {
  const root = previewEl.value!;
  // 先在游离容器里构建：自定义元素完成 upgrade（构造器执行），但因未接入文档而不触发 connectedCallback。
  // 再整体接入 → 子树就绪后自顶向下连接，父组件（如 x-form）刷新 footer 时子元素均已升级，避免时序异常。
  const holder = document.createElement('div');
  holder.innerHTML = sourceHtml.value;
  root.replaceChildren(...Array.from(holder.childNodes)); // 注入源码 → 效果与代码一致
  // 交互由宿主 Vue 实现绑定（script 只是展示用原生片段，不执行）
  props.setup?.(root);
});

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
    <div ref="previewEl" class="demo-card__preview" :class="{ 'is-column': column }"></div>

    <div v-if="title || desc" class="demo-card__title">
      {{ title }}<span v-if="desc"> — {{ desc }}</span>
    </div>

    <div class="demo-card__code">
      <button class="demo-card__copy" @click="copy">{{ copied ? '已复制' : '复制' }}</button>
      <pre><code class="hljs" v-html="codeHtml"></code></pre>
    </div>
  </div>
</template>
