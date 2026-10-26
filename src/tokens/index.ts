import { installGlobalStyle } from '../core/element.js'
// 令牌以真实 .css 文件维护，构建时经 Vite CSS 管线压缩（源码保留可读性）
import tokensCss from './tokens.css?inline'

let installed = false

/** 注入设计令牌到 :root（全局仅一次） */
export function installTokens(): void {
  if (installed) return
  if (typeof document === 'undefined') return
  installed = true
  installGlobalStyle(tokensCss)
}

installTokens()
