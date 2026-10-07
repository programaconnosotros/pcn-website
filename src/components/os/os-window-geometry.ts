// Window geometry shared by the PCN OS desktop and its windows. Kept out of the component
// files so editing them keeps Fast Refresh working instead of reloading the page.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface OsWindowState extends Rect {
  id: string;
  /** URL the iframe was created with. It never changes, so the iframe never reloads on re-render. */
  src: string;
  /** Current location inside the window, reported by the embedded page. */
  path: string;
  title: string | null;
  minimized: boolean;
  maximized: boolean;
  /** Snapped to a half of the desktop (see os-snap.ts); moving or resizing it un-snaps it. */
  snap?: 'left' | 'right' | null;
}

export type ClampMode = 'move' | 'resize';

export const MIN_WINDOW_WIDTH = 420;
export const MIN_WINDOW_HEIGHT = 280;
