import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

/**
 * demo-vue 独立配置（文档站 Vue 版）。
 * - root 指向 demo-vue/，index.html 为入口；产物单独输出到仓库根的 dist-demo-vue/（与库 dist/ 互不干扰）。
 * - @xie-work/xie-ui 别名直连库源码 src/index.ts：dev 随库改动热更新，build 时库被一并打进 dist-demo-vue（自包含产物）。
 *   因 src/ 在 root(demo-vue) 之外，需 server.fs.allow 放行仓库根。
 * - isCustomElement：让 Vue 把 <x-*> 当原生自定义元素渲染（走 attribute，不报未知组件警告），对齐本库 kebab attribute API。
 */
const demoVueDir = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = fileURLToPath(new URL('../', import.meta.url));

export default defineConfig({
  root: demoVueDir,
  base: './',
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('x-'),
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@xie-work/xie-ui': resolve(projectRoot, 'src/index.ts'),
    },
  },
  server: {
    fs: { allow: [projectRoot] },
    // 别名吃库源码：把 src 纳入监听，改组件即 HMR（node_modules 仍忽略）
    watch: { ignored: ['**/node_modules/**'] },
  },
  optimizeDeps: {
    // Start.vue 文档片段里展示用的 `import vue from '@vitejs/plugin-vue'`（模板字符串内）会被
    // dev 依赖扫描器 es-module-lexer 误判为真实浏览器导入（字符串态被模板里的反引号带偏），
    // 进而把 Node 端插件预构建成浏览器依赖，撞上 esbuild 不支持 `export {} as "module.exports"` 而崩。
    // 构建走 Rollup 无此扫描器，故只有 dev 受害；显式 exclude 挡掉误报。
    exclude: ['@vitejs/plugin-vue'],
  },
  build: {
    outDir: resolve(projectRoot, 'dist-demo-vue'),
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: true,
  },
});
