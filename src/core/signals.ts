/**
 * 微型响应式系统（signals / computed / effect）
 *
 * 设计目标：细粒度依赖追踪 + microtask 批量调度，体积极小、无外部依赖。
 * 语义对齐 TC39 Signals 提案的常用子集，便于未来平滑迁移到原生信号。
 */

/** 只读信号：可读 value，不可写 */
export interface ReadonlySignal<T> {
  readonly value: T;
  /** 不建立依赖地读取当前值 */
  peek(): T;
}

/** 可写信号 */
export interface Signal<T> extends ReadonlySignal<T> {
  value: T;
}

type Subscriber = ReactiveNode;

/** 所有响应式节点的内部基类 */
abstract class ReactiveNode {
  /** 依赖的源信号集合，重算前会被清空并重新收集 */
  deps = new Set<SignalNode<unknown>>();
  active = true;

  /** 标记本节点需要重新计算 / 运行 */
  abstract propagate(): void;

  /** 清空本节点对上游信号的依赖订阅 */
  clearDeps(): void {
    for (const dep of this.deps) dep.subscribers.delete(this as Subscriber);
    this.deps.clear();
  }

  /** 从源信号的订阅表中移除自身 */
  dispose(): void {
    this.active = false;
    this.clearDeps();
  }
}

class SignalNode<T> extends ReactiveNode {
  currentValue: T;
  readonly subscribers = new Set<Subscriber>();

  constructor(initial: T) {
    super();
    this.currentValue = initial;
  }

  propagate(): void {
    // 源信号本身无需重算，通知由 write 触发
  }

  subscribe(): void {
    const current = activeObserver;
    if (current) {
      current.deps.add(this as unknown as SignalNode<unknown>);
      this.subscribers.add(current);
    }
  }

  get(): T {
    this.subscribe();
    return this.currentValue;
  }

  set(next: T): void {
    if (Object.is(next, this.currentValue)) return;
    this.currentValue = next;
    // 快照后通知，避免订阅者修改集合导致迭代异常
    for (const sub of [...this.subscribers]) sub.propagate();
    scheduleFlush();
  }
}

class ComputedNode<T> extends ReactiveNode {
  private cached: T | undefined;
  private dirty = true;
  private readonly compute: () => T;
  readonly subscribers = new Set<Subscriber>();

  constructor(compute: () => T) {
    super();
    this.compute = compute;
  }

  propagate(): void {
    if (this.dirty) return;
    this.dirty = true;
    for (const sub of [...this.subscribers]) sub.propagate();
  }

  private recompute(): void {
    this.dirty = false;
    this.clearDeps();
    const prev = activeObserver;
    activeObserver = this;
    try {
      this.cached = this.compute();
    } finally {
      activeObserver = prev;
    }
  }

  get(): T {
    if (this.dirty) this.recompute();
    const current = activeObserver;
    if (current && current !== this) {
      current.deps.add(this as unknown as SignalNode<unknown>);
      this.subscribers.add(current);
    }
    return this.cached as T;
  }

  peek(): T {
    if (this.dirty) {
      const prev = activeObserver;
      activeObserver = undefined;
      try {
        this.recompute();
      } finally {
        activeObserver = prev;
      }
    }
    return this.cached as T;
  }
}

class EffectNode extends ReactiveNode {
  private readonly fn: () => void | (() => void);
  private cleanup?: void | (() => void);
  scheduled = false;

  constructor(fn: () => void | (() => void)) {
    super();
    this.fn = fn;
    this.run();
  }

  propagate(): void {
    if (!this.scheduled) {
      this.scheduled = true;
      pendingEffects.add(this);
    }
  }

  run(): void {
    if (!this.active) return;
    if (typeof this.cleanup === 'function') this.cleanup();
    this.scheduled = false;
    this.clearDeps();
    const prev = activeObserver;
    activeObserver = this;
    try {
      this.cleanup = this.fn();
    } finally {
      activeObserver = prev;
    }
  }

  dispose(): void {
    if (typeof this.cleanup === 'function') this.cleanup();
    this.cleanup = undefined;
    super.dispose();
  }
}

/** 当前正在建立依赖的观察者（effect 或 computed） */
let activeObserver: ReactiveNode | undefined;
const pendingEffects = new Set<EffectNode>();
let flushScheduled = false;

function scheduleFlush(): void {
  if (flushScheduled) return;
  flushScheduled = true;
  queueMicrotask(() => {
    flushScheduled = false;
    // 迭代直到不再有新的待运行 effect（effect 可能触发新的写入）
    while (pendingEffects.size) {
      const effects = [...pendingEffects];
      pendingEffects.clear();
      for (const e of effects) e.run();
    }
  });
}

/** 在只读上下文中执行 fn（不收集依赖），返回其结果 */
function untracked<T>(fn: () => T): T {
  const prev = activeObserver;
  activeObserver = undefined;
  try {
    return fn();
  } finally {
    activeObserver = prev;
  }
}

/** 创建一个可写信号 */
export function signal<T>(initial: T): Signal<T> {
  const node = new SignalNode(initial);
  return {
    get value() {
      return node.get();
    },
    set value(next: T) {
      node.set(next);
    },
    peek: () => untracked(() => node.currentValue),
  };
}

/** 创建一个惰性、带缓存的派生信号 */
export function computed<T>(compute: () => T): ReadonlySignal<T> {
  const node = new ComputedNode(compute);
  return {
    get value() {
      return node.get();
    },
    peek: () => node.peek(),
  };
}

/**
 * 创建一个副作用：首次立即同步执行，依赖变化后在 microtask 批量重跑。
 * fn 可返回清理函数，下次重跑或 dispose 时调用。
 * 返回手动停止的 dispose 句柄。
 */
export function effect(fn: () => void | (() => void)): () => void {
  const node = new EffectNode(fn);
  return () => node.dispose();
}

/** 批量写入：聚合多信号变更，减少 effect 抖动（当前实现天然按 microtask 批量） */
export function batch<T>(fn: () => T): T {
  return untracked(fn);
}

/** 内部：供 element 基类在非追踪上下文中读写信号 */
export const __untracked = untracked;
