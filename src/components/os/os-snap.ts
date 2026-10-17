// Snapping windows to the halves of the desktop: drag a window against the left or right edge
// of the screen and it takes that half; against the menu bar, it maximizes. Two windows snapped
// side by side share a divider that resizes both at once.

import { MIN_WINDOW_WIDTH, type OsWindowState, type Rect } from './os-window-geometry';

export type SnapSide = 'left' | 'right';
export type SnapZone = SnapSide | 'top';

/** How close to the edge of the screen the pointer has to get to snap. */
export const SNAP_EDGE = 12;
/** Space between two snapped windows, where the divider sits. */
export const SNAP_GAP = 8;

/** Where a window dragged with the pointer at (x, y) would snap, if anywhere. */
export const snapZoneAt = (
  x: number,
  y: number,
  screenWidth: number,
  menuBarHeight: number,
): SnapZone | null => {
  if (x <= SNAP_EDGE) return 'left';
  if (x >= screenWidth - 1 - SNAP_EDGE) return 'right';
  if (y <= menuBarHeight + 2) return 'top';
  return null;
};

/** Keeps a divider position so both halves stay at least the minimum window width. */
export const clampDivider = (x: number, area: Rect) =>
  Math.round(
    Math.max(
      area.x + MIN_WINDOW_WIDTH + SNAP_GAP / 2,
      Math.min(x, area.x + area.w - MIN_WINDOW_WIDTH - SNAP_GAP / 2),
    ),
  );

/** The two halves of the desktop split at `dividerX` (the middle of the gap). */
export const splitRects = (area: Rect, dividerX = area.x + area.w / 2) => {
  const divider = clampDivider(dividerX, area);
  const left: Rect = {
    x: area.x,
    y: area.y,
    w: divider - SNAP_GAP / 2 - area.x,
    h: area.h,
  };
  const rightX = divider + SNAP_GAP / 2;
  const right: Rect = { x: rightX, y: area.y, w: area.x + area.w - rightX, h: area.h };
  return { left, right };
};

/** The visible window snapped to `side` closest to the front, if any. */
const snappedTo = (windows: OsWindowState[], order: string[], side: SnapSide, except?: string) =>
  [...order]
    .reverse()
    .map((id) => windows.find((win) => win.id === id))
    .find((win) => win && win.id !== except && win.snap === side && !win.minimized) ?? null;

/**
 * The rect a window snapping to `side` takes. If another window is already snapped to the other
 * side, it fills what that one leaves, so the two meet at the same divider.
 */
export const snapRect = (
  side: SnapSide,
  area: Rect,
  windows: OsWindowState[],
  order: string[],
  id: string,
): Rect => {
  const other = snappedTo(windows, order, side === 'left' ? 'right' : 'left', id);
  const divider = other
    ? side === 'left'
      ? other.x - SNAP_GAP / 2
      : other.x + other.w + SNAP_GAP / 2
    : undefined;
  return splitRects(area, divider)[side];
};

/** The pair of windows snapped side by side, for the shared divider; null without both. */
export const snappedPair = (windows: OsWindowState[], order: string[]) => {
  const left = snappedTo(windows, order, 'left');
  const right = snappedTo(windows, order, 'right');
  if (!left || !right) return null;
  // Only when they actually meet (give or take the rounding of a screen resize).
  if (Math.abs(left.x + left.w + SNAP_GAP - right.x) > 3) return null;
  return { left, right, dividerX: left.x + left.w + SNAP_GAP / 2 };
};
