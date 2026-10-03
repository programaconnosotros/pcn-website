// Dock sizing the desktop needs before the dock itself has loaded (see os-desktop-parts.ts).

/**
 * Devices that can't hover (touch tablets wide enough for PCN OS) never see the tooltips, so the
 * dock shows each program's name under its icon there instead.
 */
export const NO_HOVER_QUERY = '(hover: none)';

export const wantsDockLabels = () =>
  typeof window !== 'undefined' && window.matchMedia(NO_HOVER_QUERY).matches;

/** Space the desktop keeps free at the bottom of the screen for the dock. */
export const dockReservedHeight = () => (wantsDockLabels() ? 76 : 64);
