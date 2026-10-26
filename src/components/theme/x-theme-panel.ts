/**
 * x-theme-panel —— 可视化主题配置抽屉。
 *
 * 形态：内嵌通用 x-drawer，从右侧滑入的浮动设置面板；对外暴露 open 属性与 show/hide/toggle。
 * 职责：把用户对「主题/主色/圆角/尺寸/阴影」的选择，翻译成对 :root 令牌的改写：
 *  - 预设档位 → 在 <html> 上设/撤 data-xie-* 属性（纯 CSS 生效）；
 *  - 任意主色 → documentElement.style.setProperty('--xie-primary', 值)。
 * 因所有组件通过继承读取 CSS 自定义属性，改一次 :root 即全站实时联动，无需通知任何组件。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
// 依赖通用抽屉（副作用注册 x-drawer）
import '../../components/drawer/x-drawer.js';
// 依赖通用开关（副作用注册 x-switch），用于「外观模式」行
import '../../components/switch/x-switch.js';
// 依赖图标组件（副作用注册 x-icon）：关闭 / 太阳 / 月亮统一取自内置图标注册表
import '../../components/icon/x-icon.js';
// 依赖离散选项滑块（副作用注册 x-slider），用于圆角/尺寸/阴影三行
import '../../components/slider/x-slider.js';
import themePanelStyles from './x-theme-panel.css?inline';
import {
  ACCENT_DEFAULT,
  ACCENT_KEYS,
  applyConfigToRoot,
  clearTheme,
  loadTheme,
  saveTheme,
  type AccentKey,
  type ThemeConfig,
} from './persist.js';

export type ThemeMode = 'light' | 'dark';
export type RadiusPreset = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type SizePreset = 'compact' | 'default' | 'comfortable';
export type ShadowPreset = 'none' | 'soft' | 'strong';

/** 可持久化 / 可编辑的维度键（颜色为空串 = 跟随令牌默认） */
const CONFIG_KEYS = [
  'theme', 'primary', 'secondary', 'success', 'warning', 'danger', 'info',
  'radius', 'size', 'shadow',
] as const;

/** 强调色 UI 元数据：标签 + 预设色卡（默认值统一取自 persist 的 ACCENT_DEFAULT） */
const ROLE_META: { key: AccentKey; label: string; presets: string[] }[] = [
  { key: 'primary', label: '主色', presets: ['#2563eb', '#4f46e5', '#7c3aed', '#0ea5e9', '#db2777', '#059669'] },
  { key: 'secondary', label: '次要', presets: ['#475569', '#64748b', '#334155', '#6b7280', '#525252'] },
  { key: 'success', label: '成功', presets: ['#16a34a', '#059669', '#0d9488', '#65a30d', '#15803d'] },
  { key: 'warning', label: '警告', presets: ['#d97706', '#ea580c', '#ca8a04', '#f59e0b'] },
  { key: 'danger', label: '危险', presets: ['#dc2626', '#e11d48', '#b91c1c', '#9f1239'] },
  { key: 'info', label: '信息', presets: ['#0891b2', '#0284c7', '#0ea5e9', '#6366f1'] },
];

/** 离散档位维度 → 预设值数组（滑块下标映射回 data-xie-* 预设名） */
const DIM_OPTS: Record<string, string[]> = {
  radius: ['none', 'sm', 'md', 'lg', 'full'],
  size: ['compact', 'default', 'comfortable'],
  shadow: ['none', 'soft', 'strong'],
};

/** 离散档位维度 → 滑块展示标签（逗号分隔，与 DIM_OPTS 同序） */
const DIM_LABELS: Record<string, string> = {
  radius: '直角,小,中,大,圆',
  size: '紧凑,标准,宽松',
  shadow: '无,柔和,强烈',
};

class XThemePanel extends XBaseElement {
  static tag = 'x-theme-panel';

  static properties: Record<string, PropertyOptions> = {
    open: { type: 'Boolean', reflect: true, default: false },
    theme: { type: 'String', default: 'light' },
    primary: { type: 'String', default: '' },
    secondary: { type: 'String', default: '' },
    success: { type: 'String', default: '' },
    warning: { type: 'String', default: '' },
    danger: { type: 'String', default: '' },
    info: { type: 'String', default: '' },
    radius: { type: 'String', default: 'md' },
    size: { type: 'String', default: 'default' },
    shadow: { type: 'String', default: 'soft' },
  };

  static styles = [themePanelStyles];

  declare open: boolean;
  declare theme: ThemeMode;
  declare primary: string;
  declare secondary: string;
  declare success: string;
  declare warning: string;
  declare danger: string;
  declare info: string;
  declare radius: RadiusPreset;
  declare size: SizePreset;
  declare shadow: ShadowPreset;

  private __drawer!: import('../../components/drawer/x-drawer.js').XDrawer;
  private __modeSwitch!: import('../../components/switch/x-switch.js').XSwitch;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // 用持久化配置 hydrate 自身属性（仅覆盖未显式写 attribute 的维度），
    // 使抽屉打开时分段选中态、取色器颜色与上次一致。
    const stored = loadTheme();
    if (stored) {
      for (const key of CONFIG_KEYS) {
        if (!this.hasAttribute(key)) {
          (this as unknown as Record<string, string>)[key] = stored[key];
        }
      }
    }
  }

  protected render(): TemplateResult {
    return html`<x-drawer part="drawer" label="主题设置" width="380px">
      <div class="body">
        <header class="hd">
          <div class="hd__text">
            <span class="hd__title">主题设置</span>
            <span class="hd__desc">调整即全局实时生效</span>
          </div>
          <button class="hd__close" data-action="close" aria-label="关闭">
            <x-icon name="close" size="18px"></x-icon>
          </button>
        </header>

        <div class="bd">
          <section class="sec">
            <div class="sec__title">外观模式</div>
            <div class="mode">
              <x-switch part="mode-switch" label="深色模式">
                <x-icon slot="off" name="sun"></x-icon>
                <x-icon slot="on" name="moon"></x-icon>
              </x-switch>
              <span class="mode__text" part="mode-text">浅色</span>
            </div>
          </section>

          <section class="sec">
            <div class="sec__title">强调色</div>
            <div class="roles" part="roles"></div>
          </section>

          <section class="sec">
            <div class="sec__title">圆角</div>
            <x-slider data-key="radius" label="圆角" options=${DIM_LABELS.radius} value=${this.derive(() => DIM_OPTS.radius.indexOf(this.radius))}></x-slider>
          </section>

          <section class="sec">
            <div class="sec__title">控件尺寸</div>
            <x-slider data-key="size" label="控件尺寸" options=${DIM_LABELS.size} value=${this.derive(() => DIM_OPTS.size.indexOf(this.size))}></x-slider>
          </section>

          <section class="sec">
            <div class="sec__title">阴影</div>
            <x-slider data-key="shadow" label="阴影" options=${DIM_LABELS.shadow} value=${this.derive(() => DIM_OPTS.shadow.indexOf(this.shadow))}></x-slider>
          </section>

          <div class="actions">
            <button class="btn-reset" data-action="reset">恢复默认</button>
          </div>
        </div>
      </div>
    </x-drawer>`;
  }

  protected firstUpdated(): void {
    this.__drawer = this.shadowRoot!.querySelector('x-drawer')!;
    // 抽屉自带关闭（遮罩/Esc）：同步回本组件的 open，保持单一数据源
    this.__drawer.addEventListener('x-close', () => {
      this.open = false;
    });
    this.__drawer.open = this.open;

    const sr = this.shadowRoot!;
    this.__modeSwitch = sr.querySelector('x-switch')!;
    this.__modeSwitch.addEventListener('x-change', this.__onModeChange);
    this.__buildRoles(sr);
    sr.addEventListener('click', this.__onClick);
    sr.addEventListener('input', this.__onInput);
    // 离散滑块：拖动实时应用（x-input）、松手/换档持久化（x-change）
    sr.addEventListener('x-input', this.__onDimInput);
    sr.addEventListener('x-change', this.__onDimChange);
    this.__apply();
  }

  protected override updated(): void {
    if (this.__drawer) this.__drawer.open = this.open;
    this.__apply();
  }

  override disconnectedCallback(): void {
    const sr = this.shadowRoot;
    if (sr) {
      sr.removeEventListener('click', this.__onClick);
      sr.removeEventListener('input', this.__onInput);
      sr.removeEventListener('x-input', this.__onDimInput);
      sr.removeEventListener('x-change', this.__onDimChange);
    }
    super.disconnectedCallback();
  }

  show(): void {
    this.open = true;
  }
  hide(): void {
    this.open = false;
  }
  toggle(): void {
    this.open = !this.open;
  }

  /** 外观模式开关：交互切换时回写 theme（单一数据源，程序化回写不重触发） */
  private __onModeChange = (event: Event): void => {
    const checked = (event as CustomEvent<{ checked: boolean }>).detail.checked;
    this.theme = checked ? 'dark' : 'light';
  };

  /** 命令式构建「强调色」区：每角色一行（色卡 + 取色器）。模板引擎不支持列表，故用 DOM 生成 */
  private __buildRoles(sr: ShadowRoot): void {
    const host = sr.querySelector<HTMLElement>('.roles');
    if (!host) return;
    for (const role of ROLE_META) {
      const row = document.createElement('div');
      row.className = 'role';

      const name = document.createElement('div');
      name.className = 'role__name';
      name.textContent = role.label;

      const swatches = document.createElement('div');
      swatches.className = 'role__swatches';
      for (const hex of role.presets) {
        const b = document.createElement('button');
        b.className = 'swatch';
        b.dataset.key = role.key;
        b.dataset.val = hex;
        b.style.background = hex;
        b.title = hex;
        swatches.append(b);
      }

      const wrap = document.createElement('label');
      wrap.className = 'color-wrap';
      wrap.title = '自定义' + role.label;
      const input = document.createElement('input');
      input.className = 'color';
      input.type = 'color';
      input.dataset.key = role.key;
      input.value = ACCENT_DEFAULT[role.key];
      wrap.append(input);

      row.append(name, swatches, wrap);
      host.append(row);
    }
  }

  private __onClick = (event: Event): void => {
    const target = event.target as HTMLElement;
    const action = target.closest<HTMLElement>('[data-action]')?.dataset.action;
    if (action === 'close') return this.hide();
    if (action === 'reset') return this.__reset();

    const btn = target.closest<HTMLElement>('[data-key][data-val]');
    if (!btn) return;
    const key = btn.dataset.key as keyof XThemePanel;
    const val = btn.dataset.val as string;
    (this as unknown as Record<string, unknown>)[key] = val;
    this.__save();
  };

  private __onInput = (event: Event): void => {
    const el = event.target as HTMLInputElement;
    const key = el.dataset.key;
    if (key && (ACCENT_KEYS as readonly string[]).includes(key)) {
      (this as unknown as Record<string, string>)[key] = el.value;
      this.__save();
    }
  };

  /** 离散滑块换档：下标 → 预设名；save=false 仅实时预览，true 才落盘 */
  private __setDim = (event: Event, save: boolean): void => {
    const t = event.target as HTMLElement;
    const key = t?.dataset?.key;
    if (!key) return;
    const arr = DIM_OPTS[key];
    if (!arr) return; // 非维度滑块（如外观模式 switch 的 x-change）忽略
    const detail = (event as CustomEvent<{ index?: number }>).detail;
    const index = detail?.index;
    if (typeof index !== 'number') return;
    const preset = arr[index];
    if (preset != null) (this as unknown as Record<string, string>)[key] = preset;
    if (save) this.__save();
  };
  private __onDimInput = (event: Event): void => this.__setDim(event, false);
  private __onDimChange = (event: Event): void => this.__setDim(event, true);

  /** 变更即存：把当前配置快照写入 localStorage */
  private __save(): void {
    saveTheme(this.config());
  }

  /** 恢复所有维度到基准档位，并清除持久化（下次刷新回到库默认） */
  private __reset(): void {
    this.theme = 'light';
    this.primary = '';
    this.secondary = '';
    this.success = '';
    this.warning = '';
    this.danger = '';
    this.info = '';
    this.radius = 'md';
    this.size = 'default';
    this.shadow = 'soft';
    clearTheme();
  }

  /** 把当前配置翻译到 :root 令牌，并同步面板选中态、派发事件 */
  private __apply(): void {
    applyConfigToRoot(this.config());
    this.__syncUI();
    this.dispatchEvent(
      new CustomEvent('x-theme-change', { detail: this.config(), bubbles: true, composed: true }),
    );
  }

  private __syncUI(): void {
    const sr = this.shadowRoot!;
    // 预设档位 + 色卡的选中态（按 data-val 精确匹配）
    for (const key of ['theme', 'radius', 'size', 'shadow', ...ACCENT_KEYS]) {
      const current = (this as unknown as Record<string, string>)[key];
      sr.querySelectorAll<HTMLElement>(`[data-key="${key}"][data-val]`).forEach((b) => {
        if (b.dataset.val === current) b.setAttribute('data-active', '');
        else b.removeAttribute('data-active');
      });
    }
    // 取色器：无定制（空串）时显示该角色默认色，否则显示定制值
    for (const key of ACCENT_KEYS) {
      const input = sr.querySelector<HTMLInputElement>(`input[data-key="${key}"]`);
      const val = (this as unknown as Record<string, string>)[key];
      if (input) input.value = val || ACCENT_DEFAULT[key];
    }
    // 外观模式开关：回写选中态与文案（设 .checked 不触发 x-change，无回环）
    if (this.__modeSwitch) this.__modeSwitch.checked = this.theme === 'dark';
    const modeText = sr.querySelector('.mode__text');
    if (modeText) modeText.textContent = this.theme === 'dark' ? '深色' : '浅色';
  }

  /** 当前主题配置快照 */
  config(): ThemeConfig {
    return {
      theme: this.theme,
      primary: this.primary,
      secondary: this.secondary,
      success: this.success,
      warning: this.warning,
      danger: this.danger,
      info: this.info,
      radius: this.radius,
      size: this.size,
      shadow: this.shadow,
    };
  }
}

// 模块加载即尽早恢复上次主题：在首屏绘制前把持久化配置刷到 <html>，
// 避免刷新后先闪一下默认色再变主题。（无存储时为空操作，不影响未用面板的消费者）
if (typeof document !== 'undefined') {
  const stored = loadTheme();
  if (stored) applyConfigToRoot(stored);
}

declare global {
  interface HTMLElementTagNameMap {
    'x-theme-panel': XThemePanel;
  }
}

export { XThemePanel };
export default define(XThemePanel);
