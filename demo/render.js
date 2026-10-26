/**
 * 文档渲染 helper（纯 JS，无框架）。
 * - h(): 轻量 hyperscript，创建元素
 * - demoCard(): 实时示例卡片（上：真实渲染的组件；下：可复制的用法代码）
 * - apiTable(): API 属性/事件表格
 */

/** h('div', {class:'x', onclick:fn}, childA, childB) */
export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  if (props) {
    for (const [key, val] of Object.entries(props)) {
      if (val == null || val === false) continue;
      if (key === 'class') el.className = val;
      else if (key === 'html') el.innerHTML = val;
      else if (key.startsWith('on') && typeof val === 'function') el.addEventListener(key.slice(2), val);
      else if (key in el && key !== 'list') el[key] = val;
      else el.setAttribute(key, val);
    }
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

/** 清空容器 */
export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

/**
 * 实时示例卡片。
 * @param {object} opts
 *   title  示例标题
 *   desc   示例说明
 *   code   展示的用法字符串（消费者可直接照抄）
 *   build  (container) => void，往预览容器里放真实组件
 */
export function demoCard({ title, desc, code, build }) {
  const preview = h('div', { class: 'demo-card__preview' });
  if (build) build(preview);

  const codeEl = h('pre', null, h('code', null, code.trim()));
  const copyBtn = h(
    'button',
    {
      class: 'demo-card__copy',
      onclick: () => {
        navigator.clipboard?.writeText(code.trim()).then(() => {
          copyBtn.textContent = '已复制';
          setTimeout(() => (copyBtn.textContent = '复制'), 1200);
        });
      },
    },
    '复制',
  );

  const codeWrap = h('div', { class: 'demo-card__code' }, copyBtn, codeEl);

  const card = h('div', { class: 'demo-card' }, preview);
  if (title || desc) {
    card.appendChild(h('div', { class: 'demo-card__title' }, title || '', desc ? h('span', null, ' — ' + desc) : null));
  }
  card.appendChild(codeWrap);
  return card;
}

/**
 * API 表格。
 * @param {string[]} columns 表头
 * @param {Array<string[]>} rows 每行单元格（字符串，首列建议为属性名）
 */
export function apiTable(columns, rows) {
  const thead = h(
    'thead',
    null,
    h('tr', null, ...columns.map((c) => h('th', null, c))),
  );
  const tbody = h(
    'tbody',
    null,
    ...rows.map((row) => h('tr', null, ...row.map((cell, i) => h('td', null, i === 0 ? h('code', null, cell) : cell)))),
  );
  return h('table', { class: 'api-table' }, thead, tbody);
}

/** 一段富文本（允许受控的内联 HTML，用于行内 code/加粗） */
export function rich(html) {
  return h('p', { html });
}
