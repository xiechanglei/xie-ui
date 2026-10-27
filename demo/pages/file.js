/** x-file-input 文件上传文档：隐藏原生 file + 自绘按钮，多选/accept、files 只读、form 关联 */
import { h, demoCard, apiTable } from '/demo/render.js';

function fi(attrs = {}) {
  const el = document.createElement('x-file-input');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

export function render(el) {
  el.append(
    h('h1', null, 'FileUpload 文件上传'),
    h('p', { class: 'lead' }, '包一个隐藏的原生 input[type=file]：系统文件选择框、accept 过滤、多选、无障碍全白送，本库只画触发按钮与文件名展示。因浏览器安全限制 files 不能程序化写入，故组件是「只读输出」——用 files 读取、reset() 清空。选中的文件以 name 为键计入外层 form。'),

    h('h2', null, '引入'),
    codeInline(`import '@xie-work/xie-ui';`),

    h('h2', null, '代码演示'),

    demoCard({
      title: '基础用法',
      desc: '选完在按钮右侧显示文件名；监听 x-change 读 files',
      build: (c) => {
        const out = h('p', { class: 'demo-card__title' }, '未选择');
        const f = fi({ name: 'avatar' });
        f.addEventListener('x-change', (e) => (out.textContent = '已选 ' + e.detail.files.length + ' 个：' + e.detail.files.map((x) => x.name).join('、')));
        c.append(f, out);
      },
      code: `<x-file-input name="avatar"></x-file-input>
input.addEventListener('x-change', (e) => console.log(e.detail.files));`,
    }),

    demoCard({
      title: 'accept 过滤 + multiple 多选',
      desc: 'accept 限定类型；multiple 可多选，显示「xxx 等 N 个文件」',
      build: (c) => c.append(fi({ accept: 'image/*', multiple: '', 'button-label': '选图片' })),
      code: `<x-file-input accept="image/*" multiple button-label="选图片"></x-file-input>`,
    }),

    demoCard({
      title: '语义色 color & 尺寸 size',
      build: (c) => {
        const row = h('div', { style: 'display:flex;gap:12px;flex-wrap:wrap;align-items:center' });
        row.append(fi({ color: 'success' }), fi({ color: 'danger', size: 'sm' }), fi({ color: 'info', size: 'lg' }));
        c.append(row);
      },
      code: `<x-file-input color="success" size="lg"></x-file-input>`,
    }),

    demoCard({
      title: '禁用 & 自定义文案',
      build: (c) => {
        c.append(fi({ disabled: '' }));
        c.append(fi({ 'button-label': '上传附件', placeholder: '支持 pdf / doc，≤10MB' }));
      },
      code: `<x-file-input disabled></x-file-input>
<x-file-input button-label="上传附件" placeholder="支持 pdf / doc"></x-file-input>`,
    }),

    demoCard({
      title: '重置',
      desc: 'files 不可外部赋值，只能 reset() 清空',
      build: (c) => {
        const f = fi();
        const btn = h('x-button', null, '清空');
        btn.addEventListener('click', () => f.reset());
        c.append(f, btn);
      },
      code: `fileEl.reset(); // 清空已选文件`,
    }),

    h('h2', null, 'API'),
    apiTable(
      ['属性', '说明', '类型', '默认值'],
      [
        ['accept', '限定文件类型（透传原生，如 image/*、.pdf）', 'string', "''"],
        ['multiple', '允许多选（反射）', 'boolean', 'false'],
        ['name', '表单名（反射，FormData 中每个文件的键）', 'string', "'file'"],
        ['button-label', '按钮文案', 'string', "'选择文件'"],
        ['placeholder', '未选择时的提示文案', 'string', "'未选择任何文件'"],
        ['color', '按钮语义色（反射）', "'primary' | … | 'info'", "'primary'"],
        ['size', '尺寸（反射）', "'sm' | 'md' | 'lg'", "'md'"],
        ['disabled / required / label', '禁用 / 必填校验 / 无障碍名', '—', '—'],
      ],
    ),
    h('h3', null, '成员 / 方法 / 事件'),
    apiTable(
      ['名称', '说明'],
      [
        ['files（只读）', '已选文件数组 File[]（不可外部赋值）'],
        ['form（只读）', '所属 form（FCCE）'],
        ['reset()', '清空已选'],
        ['x-change', '选择/清空后派发，detail:{ files: File[] }'],
      ],
    ),
    h('h2', null, '设计约定'),
    h('p', null, '出于安全，浏览器禁止脚本设置 input[type=file] 的 value，因此本组件不提供 value 写入，只读 files、可 reset。form 关联时每个文件以 name 为键 append 进 FormData（multiple 会同名多次出现）。'),
  );
}

function codeInline(code) {
  return h('div', { class: 'demo-card' }, h('div', { class: 'demo-card__code' }, h('pre', null, h('code', null, code))));
}
