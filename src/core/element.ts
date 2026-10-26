/**
 * XBaseElement —— Web Component 基类
 *
 * 职责：
 *  1. attribute 观察：attribute <-> property <-> signal 三向桥接，支持类型转换与 reflect
 *  2. 统一更新调度：signal 变更 → microtask 合并 → 一次 update()
 *  3. 共享样式：CSSStyleSheet 实例在同类实例间通过 adoptedStyleSheets 复用
 *  4. 细粒度渲染：html 模板的文本/属性插值绑定到信号，变更时就地更新 DOM，无需整树 diff
 */

import {
  signal,
  effect,
  computed,
  type Signal,
  type ReadonlySignal,
} from './signals.js';

/* -------------------------------------------------------------------------- */
/*                                  样式工具                                    */
/* -------------------------------------------------------------------------- */

/** 全局构造器样式表缓存：相同 CSS 文本 → 同一个 CSSStyleSheet 实例（跨元素共享） */
const sheetCache = new Map<string, CSSStyleSheet>();
const supportsAdopted =
  typeof CSSStyleSheet !== 'undefined' && 'replaceSync' in CSSStyleSheet.prototype;

function getSharedSheet(css: string): CSSStyleSheet {
  let sheet = sheetCache.get(css);
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    sheetCache.set(css, sheet);
  }
  return sheet;
}

/**
 * 标签模板构造共享样式表。相同内容多次调用返回同一实例，
 * 从而可被多个 shadowRoot 的 adoptedStyleSheets 复用。
 */
export function css(strings: TemplateStringsArray, ...values: unknown[]): CSSStyleSheet | string {
  const text = strings.reduce((acc, s, i) => acc + String(values[i - 1] ?? '') + s, 0 as never as string);
  // 返回文本而非实例，实例在挂载时按文本从缓存获取，保证跨调用共享
  return text.trim();
}

const globalSheets = new Set<string>();

/**
 * 将一段样式一次性注入 document 的 adoptedStyleSheets（用于 :root tokens、全局 reset）。
 * 按 id 去重，重复调用无副作用。
 */
export function installGlobalStyle(cssText: string): void {
  if (globalSheets.has(cssText)) return;
  globalSheets.add(cssText);
  if (supportsAdopted && typeof document !== 'undefined') {
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, getSharedSheet(cssText)];
  } else if (typeof document !== 'undefined') {
    const el = document.createElement('style');
    el.textContent = cssText;
    document.head.appendChild(el);
  }
}

/* -------------------------------------------------------------------------- */
/*                                  模板引擎                                    */
/* -------------------------------------------------------------------------- */

/** 可绑定值：静态值、信号、或求值函数 */
type Bindable<T = unknown> = T | ReadonlySignal<T> | (() => T);

export interface TemplateResult {
  readonly strings: TemplateStringsArray;
  readonly values: unknown[];
  readonly isTemplate: true;
}

/** 标签模板：支持「文本插值」与「完整属性值插值」两类绑定 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): TemplateResult {
  return { strings, values, isTemplate: true };
}

/** 双向可清理的绑定句柄 */
type Disposer = () => void;

const TOKEN_PREFIX = '__xph_';
const TOKEN_SUFFIX = '_xph__';

/** 判断插值点是否处于标签内部（属性上下文） */
function isInTag(segment: string): boolean {
  return segment.lastIndexOf('<') > segment.lastIndexOf('>');
}

function resolveValue<T>(v: Bindable<T>): T {
  if (typeof v === 'function') return (v as () => T)();
  if (isReadonlySignal(v)) return v.value;
  return v as T;
}

function isReadonlySignal(v: unknown): v is ReadonlySignal<unknown> {
  return !!v && typeof v === 'object' && 'value' in (v as object) && 'peek' in (v as object);
}

/**
 * 应用一个值到 part。
 * 返回是否发生了变化（用于跳过无效写入）。
 */
function applyAttr(el: Element, name: string, value: unknown): void {
  if (value == null || value === false) {
    el.removeAttribute(name);
  } else if (value === true) {
    el.setAttribute(name, '');
  } else {
    el.setAttribute(name, String(value));
  }
}

/**
 * 渲染模板到 root（替换其内容），对每个动态值建立响应式绑定。
 * 返回清理函数（解除所有 effect 订阅）。
 */
export function render(result: TemplateResult, root: Element | ShadowRoot): Disposer {
  root.textContent = '';
  const disposers: Disposer[] = [];

  const { strings, values } = result;
  let combined = '';
  for (let i = 0; i < strings.length; i++) {
    combined += strings[i];
    if (i < values.length) {
      // 上下文判定必须基于「累积到当前的完整 HTML」，而非单个片段：
      // 多属性标签里，起始 `<` 只在第一个片段，后续片段（如 ` disabled=`）不含 `<`，
      // 若只看当前片段会被误判为文本上下文，从而在标签内部注入注释占位、破坏结构。
      combined += isInTag(combined)
        ? `${TOKEN_PREFIX}${i}${TOKEN_SUFFIX}`
        : `<!--${TOKEN_PREFIX}${i}${TOKEN_SUFFIX}-->`;
    }
  }

  const tpl = document.createElement('template');
  tpl.innerHTML = combined;
  const frag = tpl.content;

  // 收集占位 -> setter
  const binders = new Map<number, (value: unknown) => void>();
  const tw = document.createTreeWalker(frag, NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_ELEMENT);
  let n: Node | null = tw.currentNode as Node | null;
  while (n) {
    if (n.nodeType === Node.ELEMENT_NODE) {
      const el = n as Element;
      for (const attr of Array.from(el.attributes)) {
        if (attr.value.startsWith(TOKEN_PREFIX) && attr.value.endsWith(TOKEN_SUFFIX)) {
          const idx = Number(attr.value.slice(TOKEN_PREFIX.length, -TOKEN_SUFFIX.length));
          el.removeAttribute(attr.name);
          binders.set(idx, (value) => applyAttr(el, attr.name, value));
        }
      }
    } else if (n.nodeType === Node.COMMENT_NODE) {
      const data = (n as Comment).data;
      if (data.startsWith(TOKEN_PREFIX) && data.endsWith(TOKEN_SUFFIX)) {
        const idx = Number(data.slice(TOKEN_PREFIX.length, -TOKEN_SUFFIX.length));
        const textNode = document.createTextNode('');
        n.parentNode!.replaceChild(textNode, n);
        binders.set(idx, (value) => {
          textNode.data = value == null ? '' : String(value);
        });
      }
    }
    n = tw.nextNode();
  }

  // 初次写入 + 为动态值建立 effect（读取信号即追踪依赖，变更后自动重跑）
  values.forEach((value, i) => {
    const set = binders.get(i);
    if (!set) return;
    if (isBindableReactive(value)) {
      const dispose = effect(() => set(resolveValue(value)));
      disposers.push(dispose);
    } else {
      set(value);
    }
  });

  root.appendChild(frag);
  return () => {
    for (const d of disposers) d();
    disposers.length = 0;
  };
}

function isBindableReactive(v: unknown): boolean {
  return typeof v === 'function' || isReadonlySignal(v);
}

/* -------------------------------------------------------------------------- */
/*                              属性/信号桥接配置                                */
/* -------------------------------------------------------------------------- */

export type PropType = 'String' | 'Number' | 'Boolean';

export interface PropertyOptions {
  /** 关联的 attribute 名；false 表示不观察 attribute；缺省用属性名本身 */
  attribute?: string | false;
  /** 值类型，用于 attribute 解析与 reflect 序列化 */
  type?: PropType;
  /** 是否将 property 反射回 attribute */
  reflect?: boolean;
  /** 默认值 */
  default?: unknown;
}

interface PropMeta extends Required<Omit<PropertyOptions, 'default' | 'attribute'>> {
  property: string;
  attributeName: string | false;
  defaultValue: unknown;
  reflect: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                  基类                                        */
/* -------------------------------------------------------------------------- */

export abstract class XBaseElement extends HTMLElement {
  /** 子类声明：标签名（用于 customElements.define） */
  static tag: string;
  /** 子类声明：响应式属性配置 */
  static properties: Record<string, PropertyOptions> = {};
  /** 子类声明：组件样式（共享 CSSStyleSheet 文本） */
  static styles: (CSSStyleSheet | string)[] = [];

  /** 属性名 -> 信号 */
  protected readonly __signals = new Map<string, Signal<unknown>>();
  private readonly __meta = new Map<string, PropMeta>();
  private __updateQueued = false;
  private __connected = false;
  private __renderDispose: Disposer | null = null;
  protected readonly __disposers: Disposer[] = [];

  /** 供子类在 render 表达式中安全读取信号 */
  protected readonly __computed = computed;
  protected readonly __signal = signal;

  constructor() {
    super();
    const ctor = this.constructor as typeof XBaseElement;
    // 建立属性信号与访问器
    for (const [prop, opts] of Object.entries(ctor.properties)) {
      const type = opts.type ?? 'String';
      const attributeName =
        opts.attribute === false ? false : opts.attribute ?? kebab(prop);
      const meta: PropMeta = {
        property: prop,
        attributeName,
        type,
        defaultValue: opts.default,
        reflect: opts.reflect ?? false,
      };
      this.__meta.set(prop, meta);
      this.__signals.set(prop, signal(opts.default));
      this.__defineAccessor(prop);
    }
  }

  /** 子类必须实现：返回模板结果（或 null 表示不自管渲染） */
  protected abstract render(): TemplateResult | null;

  /** 首次连接后的副作用注册钩子（事件监听等），断连时其返回值被调用清理 */
  protected firstUpdated?(): void;
  /** 每次更新调度后调用（在 DOM 已同步后） */
  protected updated?(): void;

  /* ------------------------------ attribute 桥接 ------------------------------ */

  static get observedAttributes(): string[] {
    const props = (this as unknown as typeof XBaseElement).properties;
    const out: string[] = [];
    for (const [prop, opts] of Object.entries(props)) {
      const attr = opts.attribute === false ? null : opts.attribute ?? kebab(prop);
      if (attr) out.push(attr);
    }
    return out;
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    const meta = this.__metaForAttribute(name);
    if (!meta) return;
    const parsed = this.__parseAttr(value, meta.type);
    // 来自 attribute 的写入不 reflect 回去，避免回环
    this.__setSignal(meta.property, parsed, /* fromAttr */ true);
  }

  private __metaForAttribute(attr: string): PropMeta | undefined {
    for (const meta of this.__meta.values()) {
      if (meta.attributeName === attr) return meta;
    }
    return undefined;
  }

  private __parseAttr(value: string | null, type: PropType): unknown {
    if (type === 'Boolean') return value !== null;
    if (value === null) return undefined;
    if (type === 'Number') return value === '' ? undefined : Number(value);
    return value;
  }

  /* ------------------------------ property 访问器 ------------------------------ */

  private __defineAccessor(prop: string): void {
    Object.defineProperty(this, prop, {
      configurable: true,
      enumerable: true,
      get: () => this.__signals.get(prop)!.value,
      set: (value: unknown) => this.__setSignal(prop, value, /* fromAttr */ false),
    });
  }

  private __setSignal(prop: string, value: unknown, fromAttr: boolean): void {
    const sig = this.__signals.get(prop)!;
    const meta = this.__meta.get(prop)!;
    const coerced = this.__coerce(value, meta);
    if (Object.is(sig.peek(), coerced)) return;
    sig.value = coerced; // 触发依赖该信号的模板 effect
    if (meta.reflect && !fromAttr) this.__reflect(coerced, meta);
    this.requestUpdate();
  }

  private __coerce(value: unknown, meta: PropMeta): unknown {
    if (value === undefined || value === null) {
      return meta.type === 'Boolean' ? false : undefined;
    }
    if (meta.type === 'Boolean') return !!value;
    if (meta.type === 'Number') return typeof value === 'number' ? value : Number(value);
    return String(value);
  }

  private __reflect(value: unknown, meta: PropMeta): void {
    if (meta.attributeName === false) return;
    if (meta.type === 'Boolean') {
      this.toggleAttribute(meta.attributeName, !!value);
    } else if (value == null) {
      this.removeAttribute(meta.attributeName);
    } else {
      this.setAttribute(meta.attributeName, String(value));
    }
  }

  /* -------------------------------- 更新调度 -------------------------------- */

  /** 读取某属性的当前信号（供子类模板/逻辑使用） */
  protected prop<T = unknown>(name: string): T {
    return this.__signals.get(name)!.value as T;
  }

  /** 创建一个派生只读信号 */
  protected derive<T>(fn: () => T): ReadonlySignal<T> {
    return computed(fn);
  }

  /** 取得某声明属性的底层信号（供模板做响应式绑定） */
  protected signalOf<T = unknown>(name: string): ReadonlySignal<T> {
    const sig = this.__signals.get(name);
    if (!sig) throw new Error(`[x-ui] 未声明的属性: ${name}`);
    return sig as ReadonlySignal<T>;
  }

  requestUpdate(): void {
    if (this.__updateQueued || !this.__connected) return;
    this.__updateQueued = true;
    queueMicrotask(() => {
      this.__updateQueued = false;
      this.__performUpdate();
    });
  }

  private __performUpdate(): void {
    // 细粒度渲染下，模板绑定由 signal 驱动自动更新；
    // 此处仅处理结构变化（如整体重渲）与 updated 钩子
    this.updated?.();
  }

  /* -------------------------------- 生命周期 -------------------------------- */

  connectedCallback(): void {
    if (this.__connected) return;
    this.__connected = true;
    // 先渲染结构，再注入样式：兼容 fallback 下 <style> 作为子节点被 textContent 清空的问题
    this.__initialRender();
    this.__adoptStyles();
    this.firstUpdated?.();
  }

  disconnectedCallback(): void {
    this.__connected = false;
    this.__renderDispose?.();
    this.__renderDispose = null;
    while (this.__disposers.length) this.__disposers.pop()!();
  }

  private __adoptStyles(): void {
    if (!this.shadowRoot) return;
    const ctor = this.constructor as typeof XBaseElement;
    const sheets = ctor.styles.map((s) => (typeof s === 'string' ? getSharedSheet(s) : s));
    if (!sheets.length) return;
    if (supportsAdopted) {
      const existing = new Set(this.shadowRoot.adoptedStyleSheets);
      this.shadowRoot.adoptedStyleSheets = [
        ...this.shadowRoot.adoptedStyleSheets,
        ...sheets.filter((s) => !existing.has(s)),
      ];
    } else {
      const style = document.createElement('style');
      style.textContent = ctor.styles.filter((s) => typeof s === 'string').join('\n');
      this.shadowRoot.appendChild(style);
    }
  }

  private __initialRender(): void {
    const target = this.shadowRoot ?? this;
    const result = this.render();
    if (!result) return;
    this.__renderDispose = render(result, target);
  }

  /** 子类调用：为组件开启 shadow DOM（在构造早期调用） */
  protected attachShadowRoot(): ShadowRoot {
    return this.shadowRoot ?? this.attachShadow({ mode: 'open' });
  }
}

/** camelCase -> kebab-case */
export function kebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}

/** 注册自定义元素（幂等），返回类本身 */
export function define<C extends typeof XBaseElement>(cls: C): C {
  const tag = cls.tag;
  if (tag && !customElements.get(tag)) {
    customElements.define(tag, cls as unknown as CustomElementConstructor);
  }
  return cls;
}
