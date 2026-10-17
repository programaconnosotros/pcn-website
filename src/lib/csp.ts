// Content Security Policy de las páginas, con un nonce nuevo por request (src/proxy.ts). Es la
// segunda barrera contra XSS: si alguna vez se cuela HTML de un usuario sin escapar, el navegador
// no ejecuta ningún <script> que no tenga el nonce de ese request, ni carga scripts de otros
// dominios. Next le pone el nonce a sus propios scripts al leerlo de este header.
//
// Solo se restringe lo que ejecuta código. Imágenes, estilos, iframes y conexiones quedan libres:
// el sitio embebe mapas, videos y webs de proyectos, y sube archivos directo a S3.

export const NONCE_HEADER = 'x-nonce';

export const buildContentSecurityPolicy = (nonce: string, { dev = false } = {}) =>
  [
    // 'strict-dynamic': los scripts con nonce pueden cargar los chunks de Next; nada más.
    // En desarrollo, React y el HMR de Next usan eval.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    // El service worker de la PWA (/sw.js); con 'strict-dynamic' no alcanza 'self' en script-src.
    // blob: para el worker que convierte fotos HEIC (src/lib/heic.ts): solo lo puede crear un
    // script que ya pasó el nonce.
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join('; ');

/** Un nonce de 128 bits en base64, distinto en cada request. */
export const createNonce = () =>
  Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
