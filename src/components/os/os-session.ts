// The PCN OS session: which windows were open, where, and in what order, so a reload brings all
// of them back instead of only the one in the address bar. It lives in sessionStorage: it
// survives reloads of this tab, while a new tab (or a shared link) starts a fresh desktop.

import type { OsWindowState, Rect } from './os-window-geometry';

export const SESSION_KEY = 'pcn-os-session';
/** Every window is a whole copy of the site: a session never brings back more than this. */
export const MAX_RESTORED_WINDOWS = 12;

export interface SessionViewport {
  w: number;
  h: number;
}

export interface SavedWindow extends Rect {
  path: string;
  minimized: boolean;
  maximized: boolean;
}

export interface OsSession {
  /** Screen size when it was saved, to scale the windows if the screen changed since. */
  viewport: SessionViewport;
  /** From back to front. */
  windows: SavedWindow[];
}

/** Only pages of this site: a path like `//other.site` would load another origin. */
export const isSafePath = (path: unknown): path is string =>
  typeof path === 'string' &&
  path.length < 2048 &&
  path.startsWith('/') &&
  !path.startsWith('//') &&
  !path.startsWith('/\\');

const isPositive = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const isCoordinate = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const parseWindow = (value: unknown): SavedWindow | null => {
  if (!value || typeof value !== 'object') return null;
  const win = value as Record<string, unknown>;
  if (!isSafePath(win.path)) return null;
  if (!isCoordinate(win.x) || !isCoordinate(win.y) || !isPositive(win.w) || !isPositive(win.h))
    return null;
  return {
    path: win.path,
    x: Math.round(win.x),
    y: Math.round(win.y),
    w: Math.round(win.w),
    h: Math.round(win.h),
    minimized: win.minimized === true,
    maximized: win.maximized === true,
  };
};

/** Reads a stored session, dropping any window that doesn't look right. */
export const parseSession = (raw: string | null): OsSession | null => {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;
  const { viewport, windows } = data as Record<string, unknown>;
  if (!viewport || typeof viewport !== 'object' || !Array.isArray(windows)) return null;
  const { w, h } = viewport as Record<string, unknown>;
  if (!isPositive(w) || !isPositive(h)) return null;
  const parsed = windows
    .map(parseWindow)
    .filter((win): win is SavedWindow => win !== null)
    .slice(-MAX_RESTORED_WINDOWS);
  return parsed.length ? { viewport: { w, h }, windows: parsed } : null;
};

/** The desktop as it should be saved: its windows from back to front. */
export const toSession = (
  windows: OsWindowState[],
  order: string[],
  viewport: SessionViewport,
): OsSession => ({
  viewport,
  windows: order
    .map((id) => windows.find((win) => win.id === id))
    .filter((win): win is OsWindowState => !!win && isSafePath(win.path))
    .map(({ path, x, y, w, h, minimized, maximized }) => ({
      path,
      x,
      y,
      w,
      h,
      minimized,
      maximized,
    })),
});

/**
 * The windows to reopen, from back to front. The one showing the page in the address bar goes
 * to the front (visible) so it keeps the focus; `matched` is false when none of them shows it.
 */
export const restoreOrder = (
  windows: SavedWindow[],
  currentPath: string,
): { windows: SavedWindow[]; matched: boolean } => {
  const index = windows.findLastIndex((win) => win.path === currentPath);
  if (index === -1) return { windows, matched: false };
  return {
    windows: [
      ...windows.slice(0, index),
      ...windows.slice(index + 1),
      { ...windows[index], minimized: false },
    ],
    matched: true,
  };
};

export const readSession = (): OsSession | null => {
  try {
    return parseSession(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};

export const writeSession = (session: OsSession) => {
  try {
    if (session.windows.length) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage full or blocked: the next reload just opens the current page, as before.
  }
};
