/** Screens at least this wide render the site as PCN OS (a desktop with windows and a dock). */
export const OS_MEDIA_QUERY = '(min-width: 1024px)';

/** Tag on every postMessage exchanged between a PCN OS window and the desktop host. */
export const OS_MESSAGE_SOURCE = 'pcn-os';

export type OsMessage =
  | { source: typeof OS_MESSAGE_SOURCE; type: 'location'; path: string; title: string }
  | { source: typeof OS_MESSAGE_SOURCE; type: 'focus' };

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
