/** x-chat-bubble 聊天气泡文档：收/发对齐、三段结构（头像/名称时间/状态）、双轴配色、泡内富内容 */
import { h, demoCard, apiTable } from '/demo/render.js';

/* ---- 轻量构建助手 ---- */
function bubble(props = {}, ...children) {
  return h('x-chat-bubble', props, ...children);
}

/** 会话列：纵向堆叠 + 行间距，收/发各贴一侧由气泡自管 */
function thread(...bubbles) {
  return h('div', { style: 'display:flex;flex-direction:column;gap:10px' }, ...bubbles);
}

function row(...children) {
  return h('div', { style: 'display:flex;align-items:center;gap:8px;flex-wrap:wrap' }, ...children);
}

function note(text) {
  return h('div', { style: 'margin-top:8px;color:var(--xie-color-muted);font-size:13px' }, text);
}

const GRAD = 'linear-gradient(135deg, #6366f1, #22d3ee)';

export function render(el) {
  el.append(
    h('h1', null, 'Chat Bubble 聊天气泡'),
    h('p', { class: 'lead' }, '<code>&lt;x-chat-bubble&gt;</code> 一条消息一个气泡：<code>side</code> 决定收/发贴边方向，avatar / header（名称+时间）/ footer（送达状态）三段全部可缺席，外观沿用库内 <code>variant</code> × <code>color</code> 双轴。图片、图集、文件附件这类富内容不是 API 维度——往气泡正文里自由组合原子件即可。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '收 / 发对话',
      desc: 'side 缺省 start（接收方靠左），end 靠右并镜像布局；发送方经典配色显式写 variant="solid" color="primary"（两轴不互相窥探，side 不带外观）',
      build: (c) => {
        c.append(
          thread(
            bubble(null, h('span', null, '度假的机票刚订好！')),
            bubble({ side: 'end', variant: 'solid', color: 'primary' }, h('span', null, '太棒了，等不及了！')),
            bubble(null, h('span', null, '酒店也在同一家，步行五分钟到海滩')),
            bubble({ side: 'end', variant: 'solid', color: 'primary' }, h('span', null, '安排 🎉')),
          ),
        );
      },
      code: `<x-chat-bubble>度假的机票刚订好！</x-chat-bubble>
<x-chat-bubble side="end" variant="solid" color="primary">太棒了，等不及了！</x-chat-bubble>`
    }),

    demoCard({
      title: '头像 + 名称 + 时间 + 状态',
      desc: 'name/time 快捷拼 header、footer 快捷放状态行（都是「属性快捷 / slot 整体覆盖」两段式）；avatar 只给 slot——x-avatar 一行即摆',
      build: (c) => {
        const av1 = h('x-avatar', { slot: 'avatar', name: '阿', color: 'info', size: '38px' });
        const av2 = h('x-avatar', { slot: 'avatar', name: '肯', color: 'secondary', size: '38px' });
        c.append(
          thread(
            bubble({ side: 'end', variant: 'solid', color: 'primary', name: '阿强', time: '12:45', footer: '已读' }, h('span', null, '马拉松完赛了！')),
            (() => {
              const b = bubble({ side: 'end', variant: 'solid', color: 'primary' }, h('span', null, '太厉害了，为你骄傲！'));
              const ft = h('span', { slot: 'footer', style: 'display:inline-flex;align-items:center;gap:4px' }, '已读 ', h('x-icon', { name: 'check', size: '12', style: 'color:var(--xie-color-success)' }));
              b.append(av2, ft);
              return b;
            })(),
            (() => {
              const b = bubble({ name: 'Kenobi', time: '12:46' }, h('span', null, '下次一起跑个 10 公里'));
              b.append(av1);
              return b;
            })(),
          ),
          note('已缺席的段（如没写 footer）自动不占位；三段都空时就是最简的一条气泡。'),
        );
      },
      code: `<x-chat-bubble side="end" variant="solid" color="primary" name="阿强" time="12:45" footer="已读">
  马拉松完赛了！
</x-chat-bubble>
<x-chat-bubble>
  <x-avatar slot="avatar" name="肯"></x-avatar>
  <span slot="footer">已读 <x-icon name="check"></x-icon></span>
  下次一起跑个 10 公里
</x-chat-bubble>`
    }),

    demoCard({
      title: '双轴配色',
      desc: 'variant（solid/soft/outline/ghost）× color（7 角色）正交任意组合；solid 实底自动吃角色反色，soft/outline 保持正文色',
      build: (c) => {
        c.append(
          thread(
            bubble({ variant: 'solid', color: 'primary' }, h('span', null, 'primary 实底')),
            bubble({ variant: 'solid', color: 'success' }, h('span', null, 'success 实底')),
            bubble({ variant: 'soft', color: 'info' }, h('span', null, 'info 淡底')),
            bubble({ variant: 'outline', color: 'danger' }, h('span', null, 'danger 描边')),
            bubble({ side: 'end', variant: 'solid', color: 'warning' }, h('span', null, 'warning 实底 · 发送侧')),
          ),
        );
      },
      code: `<x-chat-bubble variant="solid" color="primary">primary 实底</x-chat-bubble>
<x-chat-bubble variant="soft" color="info">info 淡底</x-chat-bubble>
<x-chat-bubble variant="outline" color="danger">danger 描边</x-chat-bubble>`
    }),

    demoCard({
      title: '泡内富内容',
      desc: '正文放任意组合：图片占位块、附件卡片都是原子件/自绘块拼——气泡只负责面与宽度约束',
      build: (c) => {
        const img = h('div', { style: `margin-top:8px;height:120px;border-radius:8px;background:${GRAD};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600` }, '照片占位');
        const file = h('div', { style: 'margin-top:8px;display:flex;align-items:center;gap:10px;background:var(--xie-color-bg);border:1px solid var(--xie-color-border);border-radius:8px;padding:8px 10px;max-width:260px' },
          h('x-tag', { color: 'danger', size: 'sm' }, 'PDF'),
          h('div', { style: 'min-width:0;flex:1' },
            h('div', { style: 'font-size:13px;font-weight:500;color:var(--xie-color-fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis' }, 'documentation.pdf'),
            h('div', { style: 'font-size:12px;color:var(--xie-color-muted)' }, '12 页 · 18 MB')));
        const dl = h('x-button', { variant: 'ghost', size: 'sm', 'aria-label': '下载' }, h('x-icon', { name: 'upload', size: '16' }));
        file.append(dl);
        c.append(
          thread(
            bubble({ side: 'end', variant: 'solid', color: 'primary' }, h('span', null, '看看我的新表！🤩'), img),
            bubble(null, h('span', null, '文档发你了'), file),
          ),
        );
      },
      code: `<x-chat-bubble side="end" variant="solid" color="primary">
  看看我的新表！🤩
  <div class="自己的图片块"></div>
</x-chat-bubble>
<x-chat-bubble>
  文档发你了
  <div class="自己的附件卡片">……x-tag + 文件名 + 下载钮随意拼</div>
</x-chat-bubble>`,
    }),

    h('h2', null, 'API'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['side', '收/发对齐（反射）：start 靠左贴边，end 靠右并镜像整行布局（含头像落位）', 'string', "'start'"],
        ['variant', '气泡形态（反射）：与 x-box/x-button 同名同义；缺省 soft 中性面', 'string', "'soft'"],
        ['color', '气泡角色色（反射）：写 color 不会把 variant 推成 solid，两轴显式各写各', 'string', "'default'"],
        ['name', 'header 发送者名（不反射）：快捷路径，被 slot="header" 整体覆盖', 'string', "''"],
        ['time', 'header 时间戳（不反射）：跟名字右侧弱色；只有 time 无 name 也成立', 'string', "''"],
        ['footer', '状态行文本（不反射）：如 Seen/Delivered；被 slot="footer" 整体覆盖', 'string', "''"],
      ],
    ),
    apiTable(
      ['插槽 / Part / 变量', '说明'],
      [
        ['默认插槽', '气泡正文（富内容自由组合）'],
        ['slot="avatar / header / footer"', '三段自定义，放内容即显示并覆盖快捷属性；缺省不占位'],
        ['part', 'row / avatar / header / bubble / footer'],
        ['--_bubble-maxw', '整行最大宽（宿主局部变量，缺省 80%）；覆写如 style="--_bubble-maxw:420px"'],
      ],
    ),

    h('h2', null, '说明'),
    h('p', null, '方向感设计：面朝头像侧的上角收小圆角（start 收左上、end 收右上），借 daisyUI 气泡的观感但不做物理尾巴——尾巴配色依赖页面底色，主题一换就穿帮，而角圆差在任意底色下都成立。行宽为内容宽且封顶 <code>--_bubble-maxw</code>，长文自动折行不撑破；<code>word-break</code> 兜底超长 URL。头像与行首对齐（<code>align-items:flex-start</code>），多行气泡头像不跟着漂。空段检测走 slotchange + updated 双路 presence 判定（幂等，静态解析期子件渐进挂入也收敛到正确终态）。'),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
