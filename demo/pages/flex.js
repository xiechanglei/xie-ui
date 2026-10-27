/** x-flex 弹性布局原子文档：direction / gap / align / justify / wrap / inline */
import { h, demoCard, apiTable, rich } from '/demo/render.js';

/** 生成一个色块（演示用占位内容） */
function cell(text, bg) {
  return h(
    'div',
    {
      style: `width:48px;height:48px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;color:#fff;background:${bg || 'var(--xie-color-primary)'}`,
    },
    text,
  );
}

/** 生成 <x-flex ...attrs>，children 为已建元素 */
function flex(attrs, children) {
  const el = document.createElement('x-flex');
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === true) el.setAttribute(k, '');
    else if (v != null) el.setAttribute(k, v);
  }
  el.append(...children);
  return el;
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}

const C = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];

export function render(el) {
  el.append(
    h('h1', null, 'Flex 弹性布局'),
    h('p', { class: 'lead' }, '把常见的 display:flex 排布收敛为几个可配置属性；gap 可直接吃设计令牌别名（none/xs/sm/md/lg），随主题尺寸档位联动。默认往“开箱即用即常用”靠拢：默认带 sm 间距、justify 从首、align 不强加。用于替代各处手写的 display:flex;gap:… 样式。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '默认（横排）',
      desc: '不写任何属性：direction=row、默认 gap=sm（≈8px）、justify=flex-start、align=normal',
      build: (c) => c.append(flex(null, [cell('1', C[0]), cell('2', C[1]), cell('3', C[2]), cell('4', C[3])])),
      code: `<x-flex>
  <div>1</div><div>2</div><div>3</div><div>4</div>
</x-flex>`,
    }),

    demoCard({
      title: '横向 + 间距',
      desc: 'direction=row（默认），gap 用令牌别名 md',
      build: (c) => c.append(flex({ gap: 'md' }, [cell('1', C[0]), cell('2', C[1]), cell('3', C[2]), cell('4', C[3])])),
      code: `<x-flex gap="md">
  <div>1</div><div>2</div><div>3</div><div>4</div>
</x-flex>`,
    }),

    demoCard({
      title: '纵向',
      desc: 'direction=column，gap=sm',
      build: (c) => c.append(flex({ direction: 'column', gap: 'sm' }, [cell('A', C[0]), cell('B', C[1]), cell('C', C[2])])),
      code: `<x-flex direction="column" gap="sm">
  <div>A</div><div>B</div><div>C</div>
</x-flex>`,
    }),

    demoCard({
      title: '主轴对齐',
      desc: 'justify=between，撑满一行',
      build: (c) => {
        c.style.width = '100%';
        c.append(
          (() => {
            const f = flex({ justify: 'space-between', gap: 'md' }, [cell('L', C[0]), cell('R', C[3])]);
            f.style.width = '100%';
            return f;
          })(),
        );
      },
      code: `<x-flex justify="space-between" gap="md">
  <div>L</div><div>R</div>
</x-flex>`,
    }),

    demoCard({
      title: '交叉轴对齐 + 高度',
      desc: 'align=end，容器高 80px',
      build: (c) => {
        const f = flex({ align: 'flex-end', gap: 'sm' }, [
          cell('a', C[0]),
          h('div', { style: 'width:48px;height:64px;border-radius:8px;background:' + C[1] }),
          cell('c', C[2]),
        ]);
        f.style.height = '80px';
        f.style.border = '1px dashed var(--xie-color-border)';
        c.append(f);
      },
      code: `<x-flex align="flex-end" gap="sm" style="height:80px">
  <div>a</div><div class="tall">…</div><div>c</div>
</x-flex>`,
    }),

    demoCard({
      title: '换行',
      desc: 'wrap + gap=md，容器宽度受限',
      build: (c) => {
        const f = flex({ wrap: true, gap: 'md' }, [cell('1', C[0]), cell('2', C[1]), cell('3', C[2]), cell('4', C[3]), cell('5', C[0]), cell('6', C[1])]);
        f.style.width = '200px';
        c.append(f);
      },
      code: `<x-flex wrap gap="md" style="width:200px">
  <div>1</div><div>2</div>…<div>6</div>
</x-flex>`,
    }),

    rich('提示：x-flex 是<b>表现层</b>容器。gap 别名 <code>none/xs/sm/md/lg</code> 映射到 <code>--xie-space-1..4</code>；更大或自定义间距直接传 CSS 长度（如 <code>gap="20px"</code>）。'),

    h('h2', null, 'API'),
    h('h3', null, '属性 Attributes'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['direction', '主轴方向', "'row' | 'row-reverse' | 'column' | 'column-reverse'", "'row'"],
        ['align', '交叉轴对齐（align-items）', 'CSS 值，如 center / flex-end', "'normal'（=stretch，不强加 center）"],
        ['justify', '主轴对齐（justify-content）', 'CSS 值，如 space-between / center', "'flex-start'"],
        ['wrap', '是否换行（flex-wrap:wrap）', 'boolean', 'false'],
        ['inline', '行内盒（inline-flex 而非 flex）', 'boolean', 'false'],
        ['gap', '间距：令牌别名或 CSS 长度', "'none'|'xs'|'sm'|'md'|'lg' | <长度>", "'sm'（≈8px）"],
      ],
    ),
    h('h3', null, '插槽 Slots'),
    apiTable(['插槽', '说明'], [['(默认)', '弹性内容'],]),
    h('h3', null, 'CSS 部分 Part'),
    apiTable(['part', '说明'], [['base', '内部包裹盒（display:contents，仅作定制钩子）'],]),
  );
}
