/**
 * x-slider —— 离散选项滑块（表单分类）。
 *
 * 在若干等距档位间拖动/点选，手柄自动吸附到最近档位。`options` 为逗号分隔的档位标签，
 * `value` 为当前选中档位下标（反射）。仅承载离散选项（不做连续数值输入），契合主题面板的
 * 圆角/尺寸/阴影这类"少量预设档位"选择，比一排分段按钮更紧凑、可拖动。
 *
 * 交互：手柄聚焦后方向键微调（±1 档），轨道可点按/拖动定位。拖动过程实时派发 `x-input`，
 * 松手/键盘换档时派发 `x-change`（detail:{ index, value }）。程序化设置 value 不触发事件，可作受控组件。
 *
 * form 关联（FCCE）：`name` + `internals.setFormValue` 把当前档位标签（无标签则下标）计入外层 `<form>`。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import '../../tokens/index.js';
import sliderStyles from './x-slider.css?inline';

class XSlider extends XBaseElement {
  static tag = 'x-slider';
  /** 开启 form 关联（FCCE） */
  static formAssociated = true;

  static properties: Record<string, PropertyOptions> = {
    value: { type: 'Number', reflect: true, default: 0 },
    options: { type: 'String', reflect: true, default: '' },
    disabled: { type: 'Boolean', reflect: true, default: false },
    label: { type: 'String', default: '' },
    // name 反射：FCCE 的 FormData 键取自宿主 name attribute
    name: { type: 'String', reflect: true, default: '' },
  };

  static styles = [sliderStyles];

  declare value: number;
  declare options: string;
  declare disabled: boolean;
  declare label: string;
  declare name: string;

  /** FCCE 内部句柄 */
  protected internals!: ElementInternals;

  private __dragging = false;
  private __built = -1;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.internals = this.attachInternals();
  }

  /** 所属 form（FCCE） */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  /** FCCE：随 fieldset / form disabled 一起禁用 */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  /** 档位标签数组（options 逗号切分） */
  private __opts(): string[] {
    return this.options ? this.options.split(',') : [];
  }

  /** 选中下标（钳制到 [0, count-1]） */
  private __index(): number {
    const c = this.__opts().length;
    if (c === 0) return 0;
    return Math.min(Math.max(Math.round(this.value) || 0, 0), c - 1);
  }

  /** 某档位对应的横向百分比（首档 0%、末档 100%） */
  private __pct(i: number): number {
    const c = this.__opts().length;
    return c > 1 ? (i / (c - 1)) * 100 : 0;
  }

  protected render(): TemplateResult {
    return html`<div class="base" part="base">
      <div class="track" part="track">
        <div class="fill" part="fill" style=${this.derive(() => `width:${this.__pct(this.__index())}%`)}></div>
        <div class="stops" part="stops"></div>
        <div
          class="thumb"
          part="thumb"
          role="slider"
          style=${this.derive(() => `left:${this.__pct(this.__index())}%`)}
          tabindex=${this.derive(() => (this.disabled ? undefined : '0'))}
          aria-label=${this.derive(() => this.label || undefined)}
          aria-valuemin="0"
          aria-valuemax=${this.derive(() => String(Math.max(this.__opts().length - 1, 0)))}
          aria-valuenow=${this.derive(() => String(this.__index()))}
          aria-valuetext=${this.derive(() => this.__opts()[this.__index()] ?? '')}
          aria-disabled=${this.derive(() => (this.disabled ? 'true' : undefined))}
        ><div class="bubble" part="bubble">${this.derive(() => this.__opts()[this.__index()] ?? '')}</div></div>
      </div>
      <div class="labels" part="labels"></div>
    </div>`;
  }

  protected firstUpdated(): void {
    this.__built = this.__opts().length;
    this.__buildStops();
    this.__sync();

    const track = this.shadowRoot!.querySelector<HTMLElement>('.track')!;
    const thumb = this.shadowRoot!.querySelector<HTMLElement>('.thumb')!;
    track.addEventListener('pointerdown', this.__onPointerDown);
    track.addEventListener('pointermove', this.__onPointerMove);
    track.addEventListener('pointerup', this.__onPointerUp);
    track.addEventListener('pointercancel', this.__onPointerUp);
    thumb.addEventListener('keydown', this.__onKeyDown);
  }

  protected override updated(): void {
    const c = this.__opts().length;
    if (c !== this.__built) {
      this.__built = c;
      this.__buildStops();
    } else {
      this.__syncActive();
    }
    this.__sync();
  }

  /** 把当前档位（标签优先，无则下标）同步到 FormData（FCCE） */
  private __sync(): void {
    const label = this.__opts()[this.__index()] ?? '';
    this.internals.setFormValue(label !== '' ? label : String(this.__index()));
  }

  override disconnectedCallback(): void {
    const sr = this.shadowRoot;
    if (sr) {
      const track = sr.querySelector<HTMLElement>('.track');
      const thumb = sr.querySelector<HTMLElement>('.thumb');
      if (track) {
        track.removeEventListener('pointerdown', this.__onPointerDown);
        track.removeEventListener('pointermove', this.__onPointerMove);
        track.removeEventListener('pointerup', this.__onPointerUp);
        track.removeEventListener('pointercancel', this.__onPointerUp);
      }
      if (thumb) thumb.removeEventListener('keydown', this.__onKeyDown);
    }
    super.disconnectedCallback();
  }

  /** 命令式生成刻度点与档位标签（模板引擎不支持循环） */
  private __buildStops(): void {
    const sr = this.shadowRoot!;
    const opts = this.__opts();
    const stops = sr.querySelector<HTMLElement>('.stops')!;
    const labels = sr.querySelector<HTMLElement>('.labels')!;
    stops.textContent = '';
    labels.textContent = '';
    for (let i = 0; i < opts.length; i++) {
      const pct = this.__pct(i);
      // 参照 minimal：首/末档不画刻度点（中间档保留），标签仍全显
      if (i !== 0 && i !== opts.length - 1) {
        const dot = document.createElement('i');
        dot.dataset.i = String(i);
        dot.style.left = pct + '%';
        stops.appendChild(dot);
      }
      const lb = document.createElement('span');
      lb.className = 'label';
      lb.dataset.i = String(i);
      lb.style.left = pct + '%';
      lb.textContent = opts[i];
      labels.appendChild(lb);
    }
    this.__syncActive();
  }

  /** 高亮当前档位标签 + 点亮已过档刻度点 */
  private __syncActive(): void {
    const cur = this.__index();
    const sr = this.shadowRoot!;
    sr.querySelectorAll<HTMLElement>('.labels .label').forEach((el) => {
      el.toggleAttribute('data-active', Number(el.dataset.i) === cur);
    });
    sr.querySelectorAll<HTMLElement>('.stops i').forEach((el) => {
      el.toggleAttribute('data-passed', Number(el.dataset.i) <= cur);
    });
  }

  /** 换档：更新 value（受控、不在此派发） */
  private __goto(index: number): void {
    const c = this.__opts().length;
    if (c === 0) return;
    const clamped = Math.min(Math.max(index, 0), c - 1);
    if (clamped === this.__index()) {
      this.value = clamped;
      return;
    }
    this.value = clamped;
  }

  private __emit(type: 'x-input' | 'x-change'): void {
    const index = this.__index();
    this.dispatchEvent(
      new CustomEvent(type, {
        bubbles: true,
        composed: true,
        detail: { index, value: this.__opts()[index] ?? '' },
      }),
    );
  }

  /** 由指针横坐标算出最近档位 */
  private __indexFromX(clientX: number): number {
    const track = this.shadowRoot!.querySelector<HTMLElement>('.track')!;
    const rect = track.getBoundingClientRect();
    const c = this.__opts().length;
    if (c <= 1 || rect.width === 0) return 0;
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return Math.round(ratio * (c - 1));
  }

  private __onPointerDown = (event: PointerEvent): void => {
    if (this.disabled) return;
    event.preventDefault();
    this.__dragging = true;
    this.setAttribute('data-dragging', '');
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    const before = this.__index();
    this.__goto(this.__indexFromX(event.clientX));
    if (this.__index() !== before) this.__emit('x-input');
  };

  private __onPointerMove = (event: PointerEvent): void => {
    if (!this.__dragging || this.disabled) return;
    const before = this.__index();
    this.__goto(this.__indexFromX(event.clientX));
    if (this.__index() !== before) this.__emit('x-input');
  };

  private __onPointerUp = (event: PointerEvent): void => {
    if (!this.__dragging) return;
    this.__dragging = false;
    this.removeAttribute('data-dragging');
    const track = event.currentTarget as HTMLElement;
    if (track.hasPointerCapture?.(event.pointerId)) track.releasePointerCapture(event.pointerId);
    this.__emit('x-change');
  };

  private __onKeyDown = (event: KeyboardEvent): void => {
    if (this.disabled) return;
    let next = this.__index();
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next += 1;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next -= 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const c = this.__opts().length;
    const clamped = Math.min(Math.max(next, 0), Math.max(c - 1, 0));
    if (clamped === this.__index()) return;
    this.__goto(clamped);
    this.__emit('x-change');
  };

  /** 焦点委托给手柄 */
  override focus(options?: FocusOptions): void {
    const thumb = this.shadowRoot?.querySelector<HTMLElement>('.thumb');
    (thumb ?? this).focus(options);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-slider': XSlider;
  }
}

export { XSlider };
export default define(XSlider);
