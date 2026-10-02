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
