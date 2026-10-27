/**
 * x-file-input —— 文件选择（表单分类）。
 *
 * 包一个隐藏的原生 `<input type="file">`（选择框、accept 过滤、multiple、无障碍全白送），
 * 由自绘按钮触发它，并在旁边展示已选文件名。出于安全限制 `files` 不能程序化赋值，故本组件是「只读输出」：
 * 通过 `files` getter 读取、`reset()` 清空，不接受外部设值。
 *
 * FCCE form 关联：选中的每个文件以 `name` 为键 append 进 FormData 经 internals 计入外层 form。
 * 事件：选择/清空后派发 `x-change`（detail:{ files: File[] }）。语义色 color 驱动按钮，尺寸 size 三档。
 */

import { XBaseElement, html, define, type PropertyOptions, type TemplateResult } from '../../core/element.js';
import type { Signal } from '../../core/signals.js';
import '../../tokens/index.js';
import '../icon/x-icon.js';
import fileStyles from './x-file-input.css?inline';

export type FileInputColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type FileInputSize = 'sm' | 'md' | 'lg';

class XFileInput extends XBaseElement {
  static tag = 'x-file-input';
  static formAssociated = true;

  static properties: Record<string, PropertyOptions> = {
    accept: { type: 'String', default: '' },
    multiple: { type: 'Boolean', reflect: true, default: false },
    disabled: { type: 'Boolean', reflect: true, default: false },
    required: { type: 'Boolean', reflect: true, default: false },
    name: { type: 'String', reflect: true, default: '' },
    buttonLabel: { type: 'String', default: '选择文件' },
    placeholder: { type: 'String', default: '未选择任何文件' },
    color: { type: 'String', reflect: true, default: 'primary' },
    size: { type: 'String', reflect: true, default: 'md' },
    label: { type: 'String', default: '' },
  };

  static styles = [fileStyles];

  declare accept: string;
  declare multiple: boolean;
  declare disabled: boolean;
  declare required: boolean;
  declare name: string;
  declare buttonLabel: string;
  declare placeholder: string;
  declare color: FileInputColor;
  declare size: FileInputSize;
  declare label: string;

  private __files: File[] = [];
  private __display!: Signal<string>;
  private internals!: ElementInternals;

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this.internals = this.attachInternals();
    this.__display = this.__signal(this.placeholder);
  }

  /** 已选文件（只读） */
  get files(): File[] {
    return this.__files;
  }

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  /** 校验态只读接口（供 x-form / x-form-item 读取渲染错误） */
  get validity(): ValidityState {
    return this.internals.validity;
  }
  get validationMessage(): string {
    return this.internals.validationMessage;
  }
  get willValidate(): boolean {
    return this.internals.willValidate;
  }
  checkValidity(): boolean {
    return this.internals.checkValidity();
  }
  reportValidity(): boolean {
    return this.internals.reportValidity();
  }

  protected render(): TemplateResult {
    return html`<div class="field" part="field">
      <button class="btn" part="button" type="button" disabled=${this.derive(() => this.disabled)}>
        <x-icon name="upload" size="16px"></x-icon><span>${this.derive(() => this.buttonLabel)}</span>
      </button>
      <span class="text" part="text">${() => this.__display.value}</span>
      <input class="native" part="native" type="file" />
    </div>`;
  }

  protected firstUpdated(): void {
    const native = this.__el();
    native.multiple = this.multiple;
    if (this.accept) native.accept = this.accept;
    native.addEventListener('change', this.__onChange);
    this.shadowRoot!.querySelector('.btn')!.addEventListener('click', () => {
      if (!this.disabled) native.click();
    });
  }

  protected override updated(): void {
    const native = this.shadowRoot?.querySelector<HTMLInputElement>('.native');
    if (!native) return;
    native.multiple = this.multiple;
    native.accept = this.accept ?? '';
  }

  override disconnectedCallback(): void {
    const native = this.shadowRoot?.querySelector('input');
    if (native) native.removeEventListener('change', this.__onChange);
    super.disconnectedCallback();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  /** 清空选择（files 无法外部赋值，只能清空） */
  reset(): void {
    const native = this.__el();
    native.value = '';
    this.__apply([]);
  }

  private __el(): HTMLInputElement {
    return this.shadowRoot!.querySelector<HTMLInputElement>('.native')!;
  }

  private __onChange = (): void => {
    const native = this.__el();
    this.__apply(Array.from(native.files ?? []));
  };

  private __apply(files: File[]): void {
    this.__files = files;
    const text = !files.length
      ? this.placeholder
      : files.length === 1
        ? files[0].name
        : `${files[0].name} 等 ${files.length} 个文件`;
    this.__display.value = text;
    // FormData：每个文件以 name 为键；无选择则不提交
    if (files.length) {
      const fd = new FormData();
      const key = this.name || 'file';
      for (const f of files) fd.append(key, f, f.name);
      this.internals.setFormValue(fd);
    } else {
      this.internals.setFormValue(null);
    }
    if (this.required && !files.length) this.internals.setValidity({ valueMissing: true }, '请选择文件', this.__el());
    else this.internals.setValidity({});
    this.dispatchEvent(new CustomEvent('x-change', { bubbles: true, composed: true, detail: { files } }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-file-input': XFileInput;
  }
}

export { XFileInput };
export default define(XFileInput);
