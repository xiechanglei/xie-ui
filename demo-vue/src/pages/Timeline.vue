<script setup lang="ts">
// Timeline 时间线：两件套（x-timeline / x-timeline-item）。
// 方向、首尾线段淡出、交替侧由容器以 data 标记单源扇出；全部示例为静态书写，无交互脚本。
import Demo from '../components/Demo.vue';
import CodeBlock from '../components/CodeBlock.vue';
import ApiTable from '../components/ApiTable.vue';

// API · x-timeline
const TL_PROPS_ROWS = [
  ['orientation', '流向（反射）：vertical(默认) | horizontal；水平时下发 data-tl-orient 给各项', 'string', "'vertical'"],
  ['alternate', '左右交替（反射布尔）：开启后容器对各项轮流指派 side=start/end，全体统一三列中轴布局', 'boolean', 'false'],
  ['line', '线段色（反射，扇出给各项）：border(缺省，淡边框色) | color（每段线由下端节点定色，即下一项的 color）| 直接写色名 primary/success…（整线统一）', 'string', "'border'"],
  ['label', '列表无障碍名（aria-label）', 'string', "'时间线'"],
];
const TL_MEMBERS_ROWS = [
  ['扇出标记', '对各项下发 data-tl-first / data-tl-last / data-tl-orient / data-tl-alt / data-tl-line / data-tl-next-color 与 side（幂等全量、slotchange 收敛）'],
  ['part', 'base'],
];
// API · x-timeline-item
const ITEM_PROPS_ROWS = [
  ['color', '节点语义色（反射，全库统一 7 角色）：primary(默认) / secondary / success / warning / danger / info / default(中性)', 'string', "'primary'"],
  ['icon', '节点图标（反射，吃内部登记名）：不写 = 小圆点；写了只换 glyph，节点体量与点档一致', 'string', "''"],
  ['time', '时间标签（内容上方 muted 小字，缺省不渲染行）', 'string', "''"],
  ['side', '内容侧（反射）：start | end；alternate 时由容器轮流指派，单独写也可强制某侧（自动切三列中轴布局）', 'string', "''"],
];
const ITEM_MEMBERS_ROWS = [
  ['插槽', 'default = 内容体（标题/正文/头像随便组合）；name="icon" = 覆盖节点本体（放 x-avatar 等，presence 即隐光晕）'],
  ['part', 'base / node / content / time'],
  ['定制变量', '--_tl-color（节点色，通常由 color 属性驱动）/ --_tl-line（线段色）'],
];
</script>

<template>
  <div>
    <h1>Timeline 时间线</h1>
    <p class="lead">事件序列两件套：<code>&lt;x-timeline&gt;</code> 协调流向 / 首尾线段淡出 / 左右交替，<code>&lt;x-timeline-item&gt;</code> 是其中一件事（节点 + 时间标签 + 任意内容体）。线段由节点列自绘，不用手写分隔符。</p>

    <h2>引入</h2>
    <p>入口只做注册，引入后可直接在模板里书写 <code>x-timeline / x-timeline-item</code> 标签（Vue 侧配置见「介绍」页）。</p>
    <CodeBlock code="import '@xie-work/xie-ui';" lang="javascript" />

    <h2>示例</h2>

    <Demo
      title="基础用法"
      desc="垂直排列，缺省小圆点节点；time 写在哪项哪行就出现，不写则整行不渲染"
      :source='`
<x-timeline>
  <x-timeline-item time="1984">Macintosh PC</x-timeline-item>
  <x-timeline-item time="1998">iMac</x-timeline-item>
  <x-timeline-item time="2001">iPod</x-timeline-item>
</x-timeline>
`'
    />

    <Demo
      title="图标节点"
      desc="icon 吃内部登记名，节点体量与点档一致只换图标；写 line=color 让每段线由下端节点定色（也可直接写 line=primary 这类色名整线统一）；也可用 slot=icon 放头像等任意内容覆盖节点"
      :source='`
<x-timeline line="color">
  <x-timeline-item icon="check" time="已验收">部署上线</x-timeline-item>
  <x-timeline-item icon="upload" time="进行中">上传资产</x-timeline-item>
  <x-timeline-item icon="settings">配置流水线</x-timeline-item>
</x-timeline>
`'
    />

    <Demo
      title="语义色"
      desc="color 走全库统一 7 角色，驱动节点光晕与实心点颜色"
      :source='`
<x-timeline>
  <x-timeline-item color="success" time="完成">支付成功</x-timeline-item>
  <x-timeline-item color="warning" time="注意">配额接近上限</x-timeline-item>
  <x-timeline-item color="danger" time="失败">构建中断</x-timeline-item>
  <x-timeline-item color="info" time="提示">新版本可用</x-timeline-item>
  <x-timeline-item color="default" time="中性">归档旧日志</x-timeline-item>
</x-timeline>
`'
    />

    <Demo
      title="水平方向"
      desc="orientation=horizontal 节点横躺在内容上方，线段横向自绘；首尾淡出规则不变"
      :source='`
<x-timeline orientation="horizontal">
  <x-timeline-item time="1984">Macintosh</x-timeline-item>
  <x-timeline-item time="1998">iMac</x-timeline-item>
  <x-timeline-item time="2001">iPod</x-timeline-item>
  <x-timeline-item time="2007">iPhone</x-timeline-item>
  <x-timeline-item time="2015">Watch</x-timeline-item>
</x-timeline>
`'
    />

    <Demo
      title="左右交替"
      desc="容器写一行 alternate，各项自动轮流落中轴线两侧（side 由容器指派，单独写 side 也可强制某侧）"
      :source='`
<x-timeline alternate>
  <x-timeline-item time="2 个月前">
    <div style="display: flex; flex-direction: column; gap: 2px"><b>上传了 doc.pdf</b><span style="color: var(--xie-color-muted)">记录关键项目细节并产出文档</span></div>
  </x-timeline-item>
  <x-timeline-item time="1 个月前" color="success">
    <div style="display: flex; flex-direction: column; gap: 2px"><b>项目立项</b><span style="color: var(--xie-color-muted)">6 名成员进入项目</span></div>
  </x-timeline-item>
  <x-timeline-item time="2 周前" color="info">
    <div style="display: flex; flex-direction: column; gap: 2px"><b>中期评审</b><span style="color: var(--xie-color-muted)">进度 60%，风险可控</span></div>
  </x-timeline-item>
</x-timeline>
`'
    />

    <Demo
      title="活动日志"
      desc="slot=icon 放 x-avatar 覆盖节点本体（光晕自动退场），内容体不带 time 也可把时间写进正文"
      :source='`
<x-timeline>
  <x-timeline-item>
    <x-avatar slot="icon" size="32px">J</x-avatar>
    <div style="display: flex; flex-direction: column; gap: 2px"><b>John 添加了 @verreyne</b><span style="color: var(--xie-color-muted); font-size: 12px">刚刚</span></div>
  </x-timeline-item>
  <x-timeline-item>
    <x-avatar slot="icon" size="32px" color="success">L</x-avatar>
    <div style="display: flex; flex-direction: column; gap: 2px"><b>Lester 评论了设计稿</b><span>尾巴还是去掉吧，保持干净。</span><span style="color: var(--xie-color-muted); font-size: 12px">3 分钟前</span></div>
  </x-timeline-item>
  <x-timeline-item>
    <x-avatar slot="icon" size="32px" color="warning">M</x-avatar>
    <div style="display: flex; flex-direction: column; gap: 2px"><b>Mia 关闭了任务 #204</b><span style="color: var(--xie-color-muted); font-size: 12px">1 小时前</span></div>
  </x-timeline-item>
</x-timeline>
`'
    />

    <h2>说明</h2>
    <p>无障碍：容器 <code>.base</code> 挂 <code>role=list</code> 与 <code>aria-label</code>（label 属性联动），各 <code>x-timeline-item</code> 连上即自补 <code>role=listitem</code>（未自写 role 才补）。线段首尾淡出、方向与交替侧均为容器单源下发（幂等全量扇出，动态增删项自动收敛）；脱离容器单独用也成立——缺省垂直、线段画满。水平布局建议给容器一个固定宽度，超宽时由浏览器默认横向滚动兜底。</p>

    <h2>API · x-timeline</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="TL_PROPS_ROWS" />
    <ApiTable title="方法 / 事件 / Part" :columns="['名称', '说明']" :rows="TL_MEMBERS_ROWS" />

    <h2>API · x-timeline-item</h2>
    <ApiTable title="属性 Attributes" :columns="['属性', '说明', '类型', '默认值']" :rows="ITEM_PROPS_ROWS" />
    <ApiTable title="插槽 / Part / 变量" :columns="['名称', '说明']" :rows="ITEM_MEMBERS_ROWS" />
  </div>
</template>
