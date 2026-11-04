import { defineConfig, type Plugin } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'
import { transform } from 'esbuild'

/**
 * Vite 在 lib 模式下对 JS 只做 esbuild 的标识符/语法压缩，不压空白、保留注释，
 * 产物可读性太强（多行 + /** *\/ 注释）。这里在 renderChunk 末尾再跑一次完整 esbuild minify，
 * 把 JS 彻底压到单行、去注释、缩短标识符。CSS 仍由 Vite 的 cssMinify 管线压缩（?inline 生效）。
 */
function fullEsMinify(): Plugin {
  return {
    name: 'xie:full-es-minify',
    apply: 'build',
    renderChunk: {
      order: 'post',
      async handler(code) {
        const r = await transform(code, {
          minify: true,
          target: 'es2022',
          format: 'esm',
          legalComments: 'none',
          sourcemap: true,
          sourcefile: 'index.js',
        })
        return { code: r.code, map: r.map }
      },
    },
  }
}

// Vite library mode：单一全量产物（浏览器 ESM，已压缩）。
// import '@xie-work/xie-ui' 即注入令牌并注册所有组件，core/tokens/组件全部内联进一个文件，零额外请求。
export default defineConfig({
  plugins: [dts({ include: ['src'], entryRoot: 'src', outDir: 'dist' }), fullEsMinify()],
  server: {
    // 文档站直接消费 dist/index.js：vite dev 默认不 watch outDir，重构建后仍端旧模块缓存，
    // 需显式把 dist 纳入监听（改动即失效模块图并全页刷新），否则每次 build 后都得重启 dev 才见新码
    watch: { ignored: ['**/node_modules/**'] },
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'esbuild',
    cssMinify: 'esbuild',
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
  },
})
