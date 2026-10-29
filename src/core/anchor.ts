/**
 * 锚定浮层的落位计算（库内部工具，不对外暴露）。
 *
 * 把「面板贴到触发件某一侧、空间不足翻转到对侧、交叉轴夹紧防溢出屏幕」这段纯几何逻辑
 * 收敛到一处，供 x-popover / x-dropdown 共用（x-select 弹层后续也可迁移到此，见 plan.md）。
 * 面板用 position:fixed 脱离祖先 overflow 裁剪，坐标以视口为准，故所有计算基于 getBoundingClientRect。
 */

export type AnchorPlacement = 'top' | 'bottom' | 'left' | 'right';
/** 交叉轴对齐：center 居中于锚点（气泡常用）/ start 贴锚点起边 / end 贴锚点止边（下拉菜单常用） */
export type AnchorAlign = 'center' | 'start' | 'end';

export interface AnchorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface AnchorSize {
  width: number;
  height: number;
}

export interface Placed {
  left: number;
  top: number;
  /** 实际落位方位（可能与请求相反——发生翻转时供调用方据此调整 transform-origin/箭头等） */
  placement: AnchorPlacement;
}

/** 面板与锚点的默认间距（px） */
export const ANCHOR_GAP = 8;
/** 面板与视口边缘的最小留白（px） */
const VIEWPORT_PAD = 8;

/**
 * 依据锚点矩形与面板尺寸，按 placement 计算 fixed 面板左上角视口坐标。
 * - 主轴（top/bottom 走竖直、left/right 走水平）空间不足时翻转到对侧；两侧都放不下则维持原侧、由夹紧兜住。
 * - 交叉轴按 align 对齐（center 居中 / start 贴起边 / end 贴止边），再按视口夹紧，避免超出屏幕边缘。
 * 纯计算、无副作用，便于探针直接核验数值。
 */
export function placePanel(
  anchor: AnchorRect,
  panel: AnchorSize,
  placement: AnchorPlacement,
  gap: number = ANCHOR_GAP,
  align: AnchorAlign = 'center',
): Placed {
  const vw = typeof window !== 'undefined' ? window.innerWidth : anchor.left + anchor.width;
  const vh = typeof window !== 'undefined' ? window.innerHeight : anchor.top + anchor.height;

  let p = placement;
  if (p === 'bottom' && anchor.top + anchor.height + gap + panel.height > vh && anchor.top - gap - panel.height >= 0) {
    p = 'top';
  } else if (p === 'top' && anchor.top - gap - panel.height < 0 && anchor.top + anchor.height + gap + panel.height <= vh) {
    p = 'bottom';
  } else if (p === 'right' && anchor.left + anchor.width + gap + panel.width > vw && anchor.left - gap - panel.width >= 0) {
    p = 'left';
  } else if (p === 'left' && anchor.left - gap - panel.width < 0 && anchor.left + anchor.width + gap + panel.width <= vw) {
    p = 'right';
  }

  let left: number;
  let top: number;
  if (p === 'top' || p === 'bottom') {
    left = alignMain(anchor.left, anchor.width, panel.width, align);
    top = p === 'bottom' ? anchor.top + anchor.height + gap : anchor.top - gap - panel.height;
    left = clamp(left, VIEWPORT_PAD, vw - panel.width - VIEWPORT_PAD);
  } else {
    top = alignMain(anchor.top, anchor.height, panel.height, align);
    left = p === 'right' ? anchor.left + anchor.width + gap : anchor.left - gap - panel.width;
    top = clamp(top, VIEWPORT_PAD, vh - panel.height - VIEWPORT_PAD);
  }
  return { left, top, placement: p };
}

/** 交叉轴求起点坐标：center 居中 / start 贴起边 / end 贴止边 */
function alignMain(anchorStart: number, anchorSize: number, panelSize: number, align: AnchorAlign): number {
  if (align === 'start') return anchorStart;
  if (align === 'end') return anchorStart + anchorSize - panelSize;
  return anchorStart + anchorSize / 2 - panelSize / 2;
}

function clamp(v: number, min: number, max: number): number {
  // 面板比视口还大时 max < min，退让为 min（贴边），不让 clamp 反向放大
  return Math.max(min, Math.min(v, Math.max(min, max)));
}
