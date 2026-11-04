<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MENU } from './menu';

const route = useRoute();
const router = useRouter();

const menuEl = ref<HTMLElement | null>(null);
const themePanel = ref<HTMLElement | null>(null);
const themeBtn = ref<HTMLElement | null>(null);

/** 菜单选中 → 驱动 hash 路由 */
function onMenuSelect(e: Event) {
  const id = (e as CustomEvent).detail?.value as string | undefined;
  if (id) router.push('/' + id);
}

/** 路由变化 → 回写菜单 value 高亮（程序化设值不触发 x-select，无回环） */
const currentId = () => String(route.name ?? '');
watch(currentId, (id) => {
  if (menuEl.value) (menuEl.value as unknown as { value: string }).value = id;
});

function toggleTheme() {
  (themePanel.value as unknown as { toggle?: () => void } | null)?.toggle?.();
  const b = themeBtn.value;
  if (b) {
    b.classList.remove('is-spinning');
    void b.offsetWidth; // 强制重排以重置 CSS 动画
    b.classList.add('is-spinning');
  }
}

onMounted(() => {
  if (menuEl.value) (menuEl.value as unknown as { value: string }).value = currentId();
});
</script>

<template>
  <x-container side="left" collapsible sidebar-width="300px">
    <div slot="sidebar" class="docs-side">
      <x-logo mark="X" title="xie-ui" subtitle="demo-vue" />
      <x-menu ref="menuEl" class="docs-menu" @x-select="onMenuSelect">
        <x-menu-group v-for="g in MENU" :key="g.id" :label="g.label" collapsible>
          <x-menu-item v-for="it in g.items" :key="it.id" :value="it.id" :note="it.tag || ''">
            {{ it.label }}
          </x-menu-item>
        </x-menu-group>
      </x-menu>
    </div>

    <article class="docs-page">
      <router-view />
    </article>
  </x-container>

  <!-- 全局主题配置面板（右侧抽屉）：全站唯一实例，右上角齿轮唤出 -->
  <x-theme-panel ref="themePanel" />
  <button
    ref="themeBtn"
    class="theme-toggle"
    type="button"
    aria-label="主题设置"
    title="主题设置"
    @click="toggleTheme"
  >
    <x-icon name="settings" size="20px" />
  </button>
</template>
