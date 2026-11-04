import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import { MENU, DEFAULT_ROUTE } from '../menu';
import Placeholder from '../pages/Placeholder.vue';

/** 归一化：去大小写/连字符，供文件名(PascalCase) ↔ 菜单 id(kebab) 互认。如 ChatBubble.vue↔chat-bubble→chatbubble */
const norm = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// pages/*.vue 懒加载表：basename 规范化 → 动态 import 工厂。新增页面丢进 pages/ 即自动接入，无需改此表。
const glob = import.meta.glob('../pages/*.vue');
const loaders = new Map<string, () => Promise<unknown>>();
for (const [path, loader] of Object.entries(glob)) {
  const base = path.split('/').pop()!.replace(/\.vue$/, '');
  loaders.set(norm(base), loader as () => Promise<unknown>);
}

const routes: RouteRecordRaw[] = [{ path: '/', redirect: '/' + DEFAULT_ROUTE }];

for (const group of MENU) {
  for (const item of group.items) {
    const loader = loaders.get(norm(item.id));
    routes.push({
      path: '/' + item.id,
      name: item.id,
      // 已迁页走真实组件；未迁页暂挂 Placeholder（meta 供其读取标题/标签）
      component: loader ? (loader as never) : (Placeholder as never),
      meta: { id: item.id, label: item.label, tag: item.tag, migrated: !!loader },
    });
  }
}

routes.push({ path: '/:pathMatch(.*)*', redirect: '/' + DEFAULT_ROUTE });

export default createRouter({ history: createWebHashHistory(), routes });
