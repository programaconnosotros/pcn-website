'use client';

import { useSyncExternalStore } from 'react';
import { AUTO_ATTR, AUTO_KEY, MODE_ATTR, STORAGE_KEY } from './os-display-mode-script';

/**
 * How large screens show the site:
 * - `full`: PCN OS with every effect, widget and animation.
 * - `lite`: PCN OS without blur, desktop widgets, the hacker cursor, dock magnification or
 *   window animations, and with fewer live windows (see pcn-os.tsx).
 * - `classic`: no desktop at all, the sidebar + page layout tablets get. One app, no iframes.
 */
export type OsDisplayMode = 'full' | 'lite' | 'classic';

export const OS_DISPLAY_MODES: OsDisplayMode[] = ['full', 'lite', 'classic'];

const MODE_CHANGE = 'pcn-os-mode-change';
/** Asks the classic layout to open its sidebar the first time it mounts after the switch. */
const OPEN_SIDEBAR_KEY = 'pcn-open-sidebar';

const isMode = (value: unknown): value is OsDisplayMode =>
  OS_DISPLAY_MODES.includes(value as OsDisplayMode);

export const readDisplayMode = (): OsDisplayMode => {
  if (typeof document === 'undefined') return 'full';
  const value = document.documentElement.getAttribute(MODE_ATTR);
  return isMode(value) ? value : 'full';
};

/** Same hardware check as OS_MODE_SCRIPT. */
export const isLowEndHardware = () => {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return (
    (!!nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) ||
    (!!nav.deviceMemory && nav.deviceMemory <= 4) ||
    !!nav.connection?.saveData
  );
};

/** The visitor picked a mode themselves (detection and measurements no longer apply). */
export const hasChosenDisplayMode = () => {
  try {
    return isMode(localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
};

/** The current mode was picked by detection, not by the visitor. */
export const isAutoDisplayMode = () =>
  typeof document !== 'undefined' && document.documentElement.hasAttribute(AUTO_ATTR);

const applyMode = (mode: OsDisplayMode, auto: boolean) => {
  const root = document.documentElement;
  if (mode === 'full') root.removeAttribute(MODE_ATTR);
  else root.setAttribute(MODE_ATTR, mode);
  root.toggleAttribute(AUTO_ATTR, auto);
  window.dispatchEvent(new Event(MODE_CHANGE));
};

const store = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};

/** The visitor picked a mode: remembered, and applied here and in every open window. */
export const setDisplayMode = (mode: OsDisplayMode) => {
  store(STORAGE_KEY, mode);
  // People coming from the desktop never opened the sidebar, so its cookie says closed: the
  // classic layout would show up without its navigation.
  if (mode === 'classic' && readDisplayMode() !== 'classic') {
    try {
      sessionStorage.setItem(OPEN_SIDEBAR_KEY, '1');
    } catch {}
  }
  applyMode(mode, false);
};

/** True once after switching to the classic layout (see setDisplayMode). */
export const consumeOpenSidebarRequest = () => {
  try {
    const requested = sessionStorage.getItem(OPEN_SIDEBAR_KEY) === '1';
    sessionStorage.removeItem(OPEN_SIDEBAR_KEY);
    return requested;
  } catch {
    return false;
  }
};

/** The desktop measured itself running slow: switch to `lite` now and on the next visits. */
export const fallBackToLite = () => {
  store(AUTO_KEY, 'lite');
  applyMode('lite', true);
};

const subscribe = (onChange: () => void) => {
  // Windows are same-origin documents: a choice made on the desktop reaches them through the
  // `storage` event, and they re-apply it so their own effects follow.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && isMode(event.newValue)) applyMode(event.newValue, false);
    else if (event.key === AUTO_KEY && event.newValue === 'lite' && isAutoDisplayMode())
      applyMode('lite', true);
  };
  window.addEventListener(MODE_CHANGE, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(MODE_CHANGE, onChange);
    window.removeEventListener('storage', onStorage);
  };
};

/** Live display mode; `full` during SSR and hydration, like the server rendered it. */
export const useDisplayMode = () => useSyncExternalStore(subscribe, readDisplayMode, () => 'full');

/** Live: whether the current mode came from detection. */
export const useIsAutoDisplayMode = () =>
  useSyncExternalStore(subscribe, isAutoDisplayMode, () => false);

export const subscribeToDisplayMode = subscribe;
