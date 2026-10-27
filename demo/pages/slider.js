/** x-slider 离散选项滑块文档：档位吸附 + 拖动/点选 + 事件 + API */
import { h, demoCard, apiTable } from '/demo/render.js';

function row(...nodes) {
  const d = h('div');
  d.style.cssText = 'display:flex;align-items:center;gap:16px;flex-wrap:wrap';
  d.append(...nodes);
  return d;
}

export function render(el) {
  el.append(
    h('h1', null, 'Slider 滑块'),
    h('p', { class: 'lead' }, '离散选项滑块：在若干等距档位间拖动或点选，手柄自动吸附到最近档位。适合“少量预设档位”的选择（如主题面板的圆角 / 尺寸 / 阴影），比一排分段按钮更紧凑。value 是选中档位下标。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础用法',
      desc: 'options 逗号分隔档位标签，value 为下标；拖动实时 x-input、松手 x-change',
      build: (c) => {
        const out = h('span', null, '当前：标准');
        const s = h('x-slider', { options: '紧凑,标准,宽松', value: '1', label: '尺寸' });
        s.style.maxWidth = '260px';
        s.addEventListener('x-change', (e) => (out.textContent = '当前：' + e.detail.value));
        c.append(row(s, out));
      },
      code: `<x-slider options="紧凑,标准,宽松" value="1"></x-slider>`,
    }),

    demoCard({
      title: '多档位',
      desc: '档位数量不限，标签自动均分对齐到手柄下方',
      build: (c) => {
        const s = h('x-slider', { options: '直角,小,中,大,圆', value: '2', label: '圆角' });
        s.style.maxWidth = '300px';
        c.append(s);
      },
      code: `<x-slider options="直角,小,中,大,圆" value="2"></x-slider>`,
    }),

    demoCard({
      title: '禁用',
      desc: 'disabled 让手柄不可拖动/聚焦',
      build: (c) => {
        const s = h('x-slider', { options: 'A,B,C,D', value: '1', disabled: true, label: '禁用示例' });
        s.style.maxWidth = '240px';
        c.append(s);
      },
      code: `<x-slider options="A,B,C,D" value="1" disabled></x-slider>`,
    }),

    demoCard({
      title: '受控联动：拖动改整页圆角',
      desc: '监听 x-input 实时把档位映射到 data-xie-radius，所见即所得',
      build: (c) => {
        const s = h('x-slider', { options: '直角,小,中,大,圆', value: '2', label: '整页圆角' });
        s.style.maxWidth = '300px';
        s.addEventListener('x-input', (e) => {
          const map = ['none', 'sm', 'md', 'lg', 'full'];
          document.documentElement.setAttribute('data-xie-radius', map[e.detail.index]);
        });
        c.append(s);
      },
      code: `slider.addEventListener('x-input', (e) => {
  const map = ['none', 'sm', 'md', 'lg', 'full'];
  document.documentElement.dataset.xieRadius = map[e.detail.index];
});`,
    }),

    h('h2', null, 'API · x-slider'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['options', '档位标签，逗号分隔；项数即档位数', 'string', "''"],
        ['value', '选中档位下标（反射，0 ~ 项数-1）', 'number', '0'],
        ['disabled', '是否禁用（不可拖动/聚焦）', 'boolean', 'false'],
        ['label', '无障碍名称（aria-label：屏幕阅读器朗读，无视觉表现）', 'string', "''"],
      ],
    ),
    apiTable(
      ['事件 / Part', '说明'],
      [
        ['x-input', '拖动过程中档位变化实时派发，detail:{ index, value }'],
        ['x-change', '松手 / 键盘换档提交时派发，detail:{ index, value }'],
        ['程序化设值', '直接设 value 不派发事件，可作受控组件'],
        ['part', 'base / track / fill / stops / thumb / labels'],
      ],
    ),

    h('h2', null, '键盘与指针'),
    h('p', null, '手柄聚焦后方向键 ←/→/↑/↓ 逐档移动（首/末档停止）。指针：轨道点按定位、按住拖动跨档吸附。当前不做 PageUp/Down/Home/End（MVP）。'),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
