/**
 * 分类入口 · 表单控件（form）
 *
 * 运行时：只做「注册」——import 本模块即注入令牌并注册该分类所有组件，无运行时导出。
 * 类型层：`export type` 把组件声明纳入类型图，使组件模块里的 `declare global`（标签增强）随入口生效。
 *
 * 新增表单组件时：在此 import 其注册模块，并 `export type` 其公开类型。
 */
import '../../tokens/index.js';
import '../../components/input/index.js';
import '../../components/textarea/index.js';
import '../../components/select/index.js';
import '../../components/file-input/index.js';
import '../../components/checkbox/index.js';
import '../../components/radio/index.js';
import '../../components/switch/index.js';
import '../../components/slider/index.js';
import '../../components/filter/index.js';
import '../../components/form/index.js';

export type {
  XInput,
  InputType,
  InputVariant,
  InputColor,
  InputSize,
} from '../../components/input/x-input.js';
export type {
  XTextarea,
  TextareaVariant,
  TextareaColor,
  TextareaSize,
  TextareaResize,
} from '../../components/textarea/x-textarea.js';
export type {
  XSelect,
  SelectVariant,
  SelectColor,
  SelectSize,
  SelectOption,
  SelectOptionInput,
} from '../../components/select/x-select.js';
export type {
  XFileInput,
  FileInputColor,
  FileInputSize,
} from '../../components/file-input/x-file-input.js';
export type {
  XCheckbox,
  XCheckboxItem,
  XCheckboxGroup,
  CheckboxShape,
  CheckboxColor,
  CheckboxSize,
  CheckboxGroupDirection,
} from '../../components/checkbox/index.js';
export type {
  XRadio,
  XRadioItem,
  XRadioGroup,
  RadioColor,
  RadioSize,
  RadioGroupDirection,
} from '../../components/radio/index.js';
export type { XSwitch } from '../../components/switch/x-switch.js';
export type { XSlider } from '../../components/slider/x-slider.js';
export type { XFilter, XFilterItem } from '../../components/filter/index.js';
export type {
  XForm,
  XFormItem,
  XFormFooter,
  FormLayout,
  FormFlow,
  FormLabelPosition,
  FormLabelAlign,
  FormFooterAlign,
} from '../../components/form/index.js';
