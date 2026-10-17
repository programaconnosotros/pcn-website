const BASE = 'http://pcn.invalid';

/**
 * `value` si es una ruta de este mismo sitio; si no, `fallback`. Los `?redirect=` llegan en la
 * URL, así que sin esto un link armado por cualquiera podría mandar a alguien a otro dominio
 * (`https://...`, `//...`, `/\...`) justo después de iniciar sesión.
 */
export const safeRedirectPath = (value: string | null | undefined, fallback = '/') => {
  if (!value || !value.startsWith('/')) return fallback;

  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
};

// Solo una ruta de este sitio: sin `//` ni `/\` al principio, sin query, hash ni espacios.
const SITE_PATH = /^\/(?![/\\])[\p{L}\p{N}\-._~%/]*$/u;

/**
 * `true` si `value` es solo una ruta de este sitio (lo que devuelve `usePathname`). Las rutas que
 * llegan de afuera (como las visitas que registra cualquiera en /metricas) se validan con esto
 * antes de guardarlas o de usarlas como link.
 */
export const isSitePath = (value: unknown, maxLength = 500): value is string =>
  typeof value === 'string' &&
  value.length <= maxLength &&
  SITE_PATH.test(value) &&
  safeRedirectPath(value, '') !== '';
