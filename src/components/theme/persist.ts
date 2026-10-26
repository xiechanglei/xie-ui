/**
 * 主题配置的持久化 + :root 翻译公共逻辑。
 *
 * 单点维护「配置 ⇄ localStorage ⇄ <html> 令牌」三件事，供 x-theme-panel 复用，
 * 也让「刷新后尽早恢复主题」能脱离组件实例、在模块加载时就执行。
 */

/** 主题配置快照（颜色为空串表示跟随令牌默认） */
export interface ThemeConfig {
  theme: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  radius: string;
  size: string;
  shadow: string;
}

/** localStorage 存储键 */
export const STORAGE_KEY = 'xie-theme-config';

/** 各维度基准值：等于基准时移除对应 data 属性，回落令牌默认 */
const BASE_VALUE: Record<string, string> = {
  theme: 'light',
  radius: 'md',
  size: 'default',
  shadow: 'soft',
};

/** 维度 → <html> 上的 data 属性名 */
const DATA_ATTR: Record<string, string> = {
  theme: 'data-xie-theme',
  radius: 'data-xie-radius',
  size: 'data-xie-size',
  shadow: 'data-xie-shadow',
};

/** 基准配置（用于合并缺失字段 / 恢复默认） */
export const DEFAULT_CONFIG: ThemeConfig = {
  theme: 'light',
  primary: '',
  secondary: '',
  success: '',
  warning: '',
  danger: '',
  info: '',
  radius: 'md',
  size: 'default',
  shadow: 'soft',
};

/** 强调色角色（旋钮名 = --xie-<key>） */
export const ACCENT_KEYS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const;
export type AccentKey = (typeof ACCENT_KEYS)[number];

/** 强调色的浅色基准值（与 tokens.css 中 light 旋钮逐一对应；等于它时视为未定制 → removeProperty） */
export const ACCENT_DEFAULT: Record<AccentKey, string> = {
  primary: '#2563eb',
  secondary: '#475569',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0891b2',
};

/** 解析 #rgb / #rrggbb → [r,g,b]；非法返回 null */
function parseHex(hex: string): [number, number, number] | null {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** 按 WCAG 相对亮度，为给定背景选出对比度更高的前景（白 or 深黑）。*/
export function pickFg(hex: string): string {
  const rgb = parseHex(hex);
  if (!rgb) return '#ffffff';
  const lin = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const L = 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
  const contrastWhite = 1.05 / (L + 0.05);
  const contrastBlack = (L + 0.05) / 0.05;
  return contrastWhite >= contrastBlack ? '#ffffff' : '#18181b';
}

const canStore = (): boolean => {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    // 某些隐私模式下访问 localStorage 会抛异常
    return false;
  }
};

/** 读取持久化配置；无存储或异常时返回 null */
export function loadTheme(): ThemeConfig | null {
  if (!canStore()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ThemeConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return null;
  }
}

/** 写入持久化配置 */
export function saveTheme(config: ThemeConfig): void {
  if (!canStore()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* 忽略配额 / 隐私限制 */
  }
}

/** 清除持久化配置（恢复默认时调用） */
export function clearTheme(): void {
  if (!canStore()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** 把配置翻译成对 :root 的改写：预设档位走 data 属性；强调色走内联 --xie-<role> + 自动前景 */
export function applyConfigToRoot(config: ThemeConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // 布局类预设（theme/radius/size/shadow）：等于基准时移除 data 属性，回落令牌默认
  for (const key of Object.keys(DATA_ATTR)) {
    const attr = DATA_ATTR[key];
    const value = (config as unknown as Record<string, string>)[key];
    if (!value || value === BASE_VALUE[key]) root.removeAttribute(attr);
    else root.setAttribute(attr, value);
  }

  // 强调色：定制过则内联覆盖旋钮，并按亮度写对应 fg；否则清除内联（回落到 CSS，含深色提亮）
  for (const key of ACCENT_KEYS) {
    const value = (config as unknown as Record<string, string>)[key];
    const prop = `--xie-${key}`;
    const fgProp = `--xie-color-${key}-fg`;
    if (!value || value === ACCENT_DEFAULT[key]) {
      root.style.removeProperty(prop);
      root.style.removeProperty(fgProp);
    } else {
      root.style.setProperty(prop, value);
      root.style.setProperty(fgProp, pickFg(value));
    }
  }
}
