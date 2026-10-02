/** Screens at least this wide render the site as PCN OS (a desktop with windows and a dock). */
export const OS_MEDIA_QUERY = '(min-width: 1024px)';

/** Tag on every postMessage exchanged between a PCN OS window and the desktop host. */
export const OS_MESSAGE_SOURCE = 'pcn-os';

export type OsMessage =
  | { source: typeof OS_MESSAGE_SOURCE; type: 'location'; path: string; title: string }
  | { source: typeof OS_MESSAGE_SOURCE; type: 'focus' }
  | { source: typeof OS_MESSAGE_SOURCE; type: 'open'; path: string }
  /** The user signed in (or out) inside a window, so the desktop has to reload who it shows. */
  | { source: typeof OS_MESSAGE_SOURCE; type: 'session' }
  /** Plays a music set in the desktop's player, so it keeps playing when the window closes. */
  | { source: typeof OS_MESSAGE_SOURCE; type: 'playMusic'; id: string }
  /** Opens the desktop's global search (⌘K pressed inside a window). */
  | { source: typeof OS_MESSAGE_SOURCE; type: 'search'; query: string }
  /**
   * Pointer activity inside a window (coordinates relative to the window's page), so the
   * desktop draws the one hacker cursor over every window.
   */
  | {
      source: typeof OS_MESSAGE_SOURCE;
      type: 'cursor';
      phase: 'move' | 'down' | 'up' | 'leave';
      x: number;
      y: number;
      label: string | null;
      inText: boolean;
    };

type OutgoingOsMessage = OsMessage extends infer M
  ? M extends OsMessage
    ? Omit<M, 'source'>
    : never
  : never;

/** Sends a message from a PCN OS window to the desktop host. */
export const postToOsHost = (message: OutgoingOsMessage) =>
  window.parent.postMessage({ source: OS_MESSAGE_SOURCE, ...message }, window.location.origin);

/** Tells the desktop the session changed from inside a window; no-op outside a window. */
export const notifyOsSessionChange = () => {
  if (isEmbedded()) postToOsHost({ type: 'session' });
};

/**
 * Detail pages that PCN OS opens in a window of their own instead of navigating the window the
 * link was clicked in: user profiles and event detail pages. An event picked from the /eventos
 * listing opens right there instead, like browsing a catalog.
 */
const OWN_WINDOW_PATHS = [/^\/perfil\/[^/]+$/, /^\/eventos\/(?!nuevo$)[^/]+$/];

export const opensInOwnWindow = (pathname: string, fromPathname: string) =>
  OWN_WINDOW_PATHS.some((pattern) => pattern.test(pathname)) &&
  !(fromPathname === '/eventos' && pathname.startsWith('/eventos/'));

/**
 * Inline script for the root layout `<head>`. It runs before paint and marks the document as
 * embedded when it is rendered inside a PCN OS window, so embedded pages never show the
 * sidebar and never render a nested desktop.
 */
export const EMBED_DETECTION_SCRIPT = `(function(){var d=document.documentElement;try{if(window.self!==window.top)d.setAttribute('data-embedded','')}catch(e){d.setAttribute('data-embedded','')}})();`;

export const isEmbedded = () =>
  typeof document !== 'undefined' && document.documentElement.hasAttribute('data-embedded');

/** True when this document is the PCN OS desktop host (large screen and not inside a window). */
export const isOsHost = () =>
  typeof window !== 'undefined' && !isEmbedded() && window.matchMedia(OS_MEDIA_QUERY).matches;

export const isOsMessage = (data: unknown): data is OsMessage =>
  typeof data === 'object' &&
  data !== null &&
  (data as { source?: unknown }).source === OS_MESSAGE_SOURCE;
