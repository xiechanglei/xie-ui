/** x-status 状态灯文档：用法 + API（一颗小圆点表示状态，与文字并排使用） */
import { h, demoCard, apiTable } from '/demo/render.js';

/* ---- 轻量构建助手 ---- */
function st(props = {}) {
  return h('x-status', props);
}
function row(...children) {
  return h('div', { style: 'display:flex;align-items:center;gap:16px;flex-wrap:wrap' }, ...children);
}
function withText(color, text) {
  return row(st({ color }), h('span', null, text));
}
function note(text) {
  return h('div', { style: 'margin-top:8px;color:var(--xie-color-muted);font-size:13px' }, text);
}

export function render(el) {
  el.append(
    h('h1', null, 'Status 状态灯'),
    h('p', { class: 'lead' }, '<code>&lt;x-status&gt;</code> 是一颗表示当前状态的小圆点（在线/离线/运行中/异常），常与文字并排。颜色走全库统一 7 角色，缺省 <code>currentColor</code> 随上下文文字色联动；可选呼吸灯（pulse）与雷达波（halo）两种动画表达「活跃」与「强提醒」。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '语义色',
      desc: 'color 与 button/badge/spinner 同一套 7 角色；default 不强行染色，跟随上下文文字色',
      build: (c) => {
        c.append(
          row(
            withText('default', 'default'),
            withText('primary', 'primary'),
            withText('secondary', 'secondary'),
            withText('success', 'success'),
            withText('warning', 'warning'),
            withText('danger', 'danger'),
            withText('info', 'info'),
          ),
        );
      },
      code: `<x-status color="success"></x-status> 在线
<x-status color="warning"></x-status> 空闲
<x-status color="danger"></x-status> 离线
<x-status></x-status> 中性（随文字色）`
    }),

    demoCard({
      title: '尺寸 size',
      desc: 'xs(4px) / sm(6px) / md(缺省 8px) / lg(12px)，行内小点与文字基线居中对齐',
      build: (c) => {
        c.append(
          row(
            withText2('xs', 'xs · 密集列表'),
            withText2('sm', 'sm · 行内跟随'),
            withText2('md', 'md · 缺省'),
            withText2('lg', 'lg · 强调'),
          ),
        );
      },
      code: `<x-status size="xs"></x-status>
<x-status size="sm" color="success"></x-status>
<x-status size="lg" color="danger"></x-status>`,
    }),

    demoCard({
      title: '动画 pulse / halo',
      desc: 'pulse 呼吸灯=「活跃/正在发生」；halo 雷达波=「告警/呼叫」级强提醒；prefers-reduced-motion 下自动静止',
      build: (c) => {
        c.append(
          row(
            st({ color: 'info', pulse: 'true' }),
            h('span', null, '正在同步…'),
            st({ color: 'danger', halo: 'true' }),
            h('span', null, '服务器已离线'),
          ),
          note('动画只是锦上添花的状态强化——静态圆点本身已经传达状态，关掉动画语义不丢。'),
        );
      },
      code: `<x-status color="info" pulse></x-status> 正在同步…
<x-status color="danger" halo></x-status> 服务器已离线`,
    }),

    demoCard({
      title: '组合场景 · 成员列表',
      desc: '与 x-avatar / x-count-up 等其他基础件并排使用；label 属性给读屏的状态名（不写则纯装饰，语义交给旁边文字）',
      build: (c) => {
        const line = (name, color, statusText) =>
          h(
            'div',
            { style: 'display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--xie-color-border)' },
            h('x-avatar', { size: 'sm', name }),
            h('span', { style: 'min-width:64px' }, name),
            h('span', { style: 'display:inline-flex;align-items:center;gap:6px;color:var(--xie-color-muted);font-size:13px' }, st({ color, label: statusText }), statusText),
          );
        c.append(line('张三', 'success', '在线'), line('李四', 'warning', '忙碌'), line('王五', 'default', '离线'));
      },
      code: `<x-avatar size="sm" name="张三"></x-avatar> 张三
<x-status color="success" label="在线"></x-status> 在线`,
    }),

    h('h2', null, 'API · x-status'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['color', '语义色（反射）：default（currentColor 随上下文）/ primary / secondary / success / warning / danger / info', 'string', "'default'"],
        ['size', '直径档位（反射）：xs 4px / sm 6px / md 8px / lg 12px', 'string', "'md'"],
        ['pulse', '呼吸灯动画（反射 Boolean）：透明度脉动，表示「活跃/正在发生」', 'boolean', 'false'],
        ['halo', '雷达波动画（反射 Boolean）：向外扩散渐隐涟漪，强提醒', 'boolean', 'false'],
        ['label', '无障碍名：写了才有 role="img" + aria-label；缺省 aria-hidden 纯装饰', 'string', "''"],
      ],
    ),
    apiTable(
      ['定制', '说明'],
      [
        ['part', 'dot'],
        ['--_st-color', '任意色逃生舱：不占 color 属性位，`x-status{ --_st-color:#e11 }` 直接覆写'],
      ],
    ),

    h('h2', null, '说明'),
    h('p', null, '与 <code>x-badge</code> 的 <code>dot</code> 模式分工：badge 的圆点是「有未读/有更新」的角标信号（锚定在内容四角），status 是文档流里的状态灯，常与文字并排读作「● 在线」。动画实现为纯 CSS（<code>@keyframes x-st-pulse / x-st-halo</code>），零 JS 参与；<code>prefers-reduced-motion: reduce</code> 下自动静止。'),
  );
}

/** 尺寸卡助手：指定 size 与文案 */
function withText2(size, text) {
  return h('div', { style: 'display:flex;align-items:center;gap:8px' }, st({ size }), h('span', null, text));
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
