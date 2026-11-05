<script setup lang="ts">
// Chat Bubble 聊天气泡：收/发对齐、三段结构（头像/名称时间/状态）、双轴配色、泡内富内容。全部静态。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// API 表数据（严格对齐 src/components/chat-bubble/x-chat-bubble.ts）
const CB_PROPS_ROWS = [
  ['side', '收/发对齐（反射）：start 靠左贴边，end 靠右并镜像整行布局（含头像落位）', 'string', "'start'"],
  ['variant', '气泡形态（反射）：与 x-box/x-button 同名同义；缺省 soft 中性面', 'string', "'soft'"],
  ['color', '气泡角色色（反射）：写 color 不会把 variant 推成 solid，两轴显式各写各', 'string', "'default'"],
  ['name', 'header 发送者名（不反射）：快捷路径，被 slot="header" 整体覆盖', 'string', "''"],
  ['time', 'header 时间戳（不反射）：跟名字右侧弱色；只有 time 无 name 也成立', 'string', "''"],
  ['footer', '状态行文本（不反射）：如 Seen/Delivered；被 slot="footer" 整体覆盖', 'string', "''"],
  ['read', '已读态（Boolean 反射）：状态行自动「已读 + ✓」（内置 check 图标、success 色）；与 footer 文本可叠加（footer 作标签、勾照带），slot="footer" 整体覆盖', 'boolean', 'false'],
];
const CB_SLOTS_ROWS = [
  ['default', '气泡正文（富内容自由组合）'],
  ['avatar / header / footer', '三段自定义，放内容即显示并覆盖快捷属性；缺省不占位'],
];
const CB_CUSTOM_ROWS = [
  ['part', 'row / avatar / header / bubble / footer'],
  ['--_bubble-maxw', '整行最大宽（宿主局部变量，缺省 80%）；覆写如 style="--_bubble-maxw:420px"'],
];
</script>

<template>
  <div>
    <h1>Chat Bubble 聊天气泡</h1>
    <p class="lead"><code>&lt;x-chat-bubble&gt;</code> 一条消息一个气泡：<code>side</code> 决定收/发贴边方向，avatar / header（名称+时间）/ footer（送达状态，<code>read</code> 一键已读态）三段全部可缺席，外观沿用库内 <code>variant</code> × <code>color</code> 双轴。图片、图集、文件附件这类富内容不是 API 维度——往气泡正文里自由组合原子件即可。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-chat-bubble</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="收 / 发对话"
      desc="side 缺省 start（接收方靠左），end 靠右并镜像布局；发送方经典配色显式写 variant=&quot;solid&quot; color=&quot;primary&quot;"
      :column="true"
      :source='`
<x-chat-bubble>度假的机票刚订好！</x-chat-bubble>
<x-chat-bubble side="end" variant="solid" color="primary">太棒了，等不及了！</x-chat-bubble>
<x-chat-bubble>酒店也在同一家，步行五分钟到海滩</x-chat-bubble>
<x-chat-bubble side="end" variant="solid" color="primary">安排 🎉</x-chat-bubble>
`'
    />

    <Demo
      title="头像 + 名称 + 时间 + 状态"
      desc="name/time 快捷拼 header、footer 快捷放状态行、read 一键已读态（自动「已读 ✓」）；avatar 只给 slot——x-avatar 一行即摆"
      :column="true"
      :source='`
<x-chat-bubble side="end" variant="solid" color="primary" name="阿强" time="12:45" footer="已送达">马拉松完赛了！</x-chat-bubble>
<x-chat-bubble name="Kenobi" time="12:46" read>
  <x-avatar slot="avatar" name="肯" color="secondary" size="38px"></x-avatar>
  下次一起跑个 10 公里
</x-chat-bubble>
<x-chat-bubble side="end" variant="solid" color="primary" footer="Seen" read>收到，辛苦啦</x-chat-bubble>
`'
    />

    <Demo
      title="双轴配色"
      desc="variant（solid/soft/outline/ghost）× color（7 角色）正交任意组合；solid 实底自动吃角色反色"
      :column="true"
      :source='`
<x-chat-bubble variant="solid" color="primary">primary 实底</x-chat-bubble>
<x-chat-bubble variant="solid" color="success">success 实底</x-chat-bubble>
<x-chat-bubble variant="soft" color="info">info 淡底</x-chat-bubble>
<x-chat-bubble variant="outline" color="danger">danger 描边</x-chat-bubble>
<x-chat-bubble side="end" variant="solid" color="warning">warning 实底 · 发送侧</x-chat-bubble>
`'
    />

    <Demo
      title="泡内富内容"
      desc="正文放任意组合：图片占位块、附件卡片都是原子件/自绘块拼——气泡只负责面与宽度约束"
      :column="true"
      :source='`
<x-chat-bubble side="end" variant="solid" color="primary">
  看看我的新表！🤩
  <div style="margin-top: 8px; height: 120px; border-radius: 8px; background: linear-gradient(135deg, #6366f1, #22d3ee); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600">照片占位</div>
</x-chat-bubble>
<x-chat-bubble>
  文档发你了
  <div style="margin-top: 8px; display: flex; align-items: center; gap: 10px; background: var(--xie-color-bg); border: 1px solid var(--xie-color-border); border-radius: 8px; padding: 8px 10px; max-width: 260px">
    <x-tag color="danger" size="sm">PDF</x-tag>
    <div style="min-width: 0; flex: 1">
      <div style="font-size: 13px; font-weight: 500; color: var(--xie-color-fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis">documentation.pdf</div>
      <div style="font-size: 12px; color: var(--xie-color-muted)">12 页 · 18 MB</div>
    </div>
    <x-button variant="ghost" size="sm" aria-label="下载"><x-icon name="upload" size="16"></x-icon></x-button>
  </div>
</x-chat-bubble>
`'
    />

    <h2>API</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="CB_PROPS_ROWS" />
    <ApiTable title="插槽 Slots" :columns="['插槽', '说明']" :rows="CB_SLOTS_ROWS" />
    <ApiTable title="Part / 变量" :columns="['定制', '说明']" :rows="CB_CUSTOM_ROWS" />

    <h2>说明</h2>
    <p>方向感设计：靠面朝头像侧的上角收小圆角（start 收左上、end 收右上），角圆差在任意底色下都成立，不依赖物理尾巴（页面底色遮罩式尾巴换主题即穿帮；实体尾巴方案多轮尝试后已按用户决定整体移除，见 design.md）。行宽为内容宽且封顶 <code>--_bubble-maxw</code>，长文自动折行不撑破。头像与行首对齐，多行气泡头像不跟着漂。</p>
  </div>
</template>
