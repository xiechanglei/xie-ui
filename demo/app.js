/**
 * 文档站入口。
 * 关键点：直接引入 dist 构建产物（模拟真实消费者环境），
 * 组件的注册与设计令牌注入全部来自 /dist/index.js。
 */
import '/dist/index.js';

import { MENU, DEFAULT_ROUTE, findItem } from '/demo/menu.js';
import { h, clear } from '/demo/render.js';

const navEl = document.getElementById('menu');
const pageEl = document.getElementById('page');

/** 侧边导航由一个 x-menu 承载：分类=x-menu-group（可折叠），组件项=x-menu-item。 */
let menuEl;

/* ------------------------- 菜单渲染（x-menu） ------------------------- */
function buildMenu() {
  clear(navEl);
  menuEl = h('x-menu', null);
  for (const group of MENU) {
    const items = group.items.map((item) => {
      const isPlanned = item.status !== 'done';
      return h(
        'x-menu-item',
        {
          value: item.id,
          note: isPlanned ? '规划中' : item.tag || '',
          disabled: isPlanned,
        },
        item.label,
      );
    });
    menuEl.append(h('x-menu-group', { label: group.label, collapsible: true }, ...items));
  }
  navEl.append(menuEl);
  // 选中菜单项 → 驱动 hash 路由
  menuEl.addEventListener('x-select', (e) => {
    const id = e.detail.value;
    if (findItem(id)) location.hash = '#/' + id;
  });
}

/** 依据路由 id 高亮对应菜单项（程序化设 value，不会触发 x-select，无回环） */
function setActive(id) {
  menuEl.value = id;
}

/* ----------------------------- 路由 ----------------------------- */
function currentRouteId() {
  const raw = location.hash.replace(/^#\/?/, '').trim();
  return raw || DEFAULT_ROUTE;
}

async function route() {
  const id = currentRouteId();
  if (!findItem(id)) {
    location.hash = '#/' + DEFAULT_ROUTE;
    return;
  }
  clear(pageEl);
  pageEl.textContent = '加载中…';
  try {
    // 浏览器原生动态 import（文档站以 vite dev 原生 ESM 运行，模拟真实环境）
    const url = `/demo/pages/${id}.js`;
    const mod = await import(/* @vite-ignore */ url);
    clear(pageEl);
    await mod.render(pageEl);
  } catch (err) {
    clear(pageEl);
    pageEl.append(h('h1', null, '404'), h('p', null, `页面 "${id}" 不存在或加载失败：` + String(err)));
    console.error(err);
  }
  setActive(id);
  document.querySelector('.docs-main')?.scrollTo({ top: 0 });
}

window.addEventListener('hashchange', route);

buildMenu();
if (!location.hash) location.hash = '#/' + DEFAULT_ROUTE;
route();
