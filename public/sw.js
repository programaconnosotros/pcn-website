// Service worker de la PWA. Qué guarda y cómo:
//
// - Precache: /offline (con sus chunks, para que la trivia funcione sin red), el logo y los
//   íconos. Se baja al instalar.
// - /_next/static y fuentes: cache-first. Llevan hash en el nombre y nunca cambian.
// - Imágenes (las de /public, /_next/image y las de la CDN): la copia guardada al instante y
//   se actualiza en segundo plano (stale-while-revalidate), cada caché con un tope de entradas.
// - Páginas (HTML) y payloads RSC: solo si la respuesta es pública. Hoy el layout de la
//   plataforma lee la sesión, así que Next las manda `private, no-store` y no se guardan; si
//   una página pasa a ser estática, se cachea sola. El HTML va network-first (la copia
//   guardada o /offline cuando no hay red); el RSC, stale-while-revalidate.
//
// Nunca se guarda nada que dependa de la sesión: en un dispositivo compartido quedaría a la
// vista después de cerrar sesión. Por eso se saltean los pedidos que no son GET, las server
// actions, /api, /autenticacion, las URLs firmadas y toda respuesta con Set-Cookie o
// `Cache-Control: private/no-store`.

const VERSION = 'v3';
const PRECACHE = `pcn-precache-${VERSION}`;
const STATIC_CACHE = `pcn-static-${VERSION}`;
const IMAGE_CACHE = `pcn-images-${VERSION}`;
const CDN_CACHE = `pcn-cdn-${VERSION}`;
const PAGE_CACHE = `pcn-pages-${VERSION}`;
const CACHES = [PRECACHE, STATIC_CACHE, IMAGE_CACHE, CDN_CACHE, PAGE_CACHE];

const MAX_ENTRIES = {
  [STATIC_CACHE]: 300,
  [IMAGE_CACHE]: 150,
  // Las respuestas opacas (imágenes de otro dominio sin CORS) pesan mucho en la cuota.
  [CDN_CACHE]: 60,
  [PAGE_CACHE]: 40,
};

const OFFLINE_URL = '/offline';
const PRECACHE_URLS = [
  '/logo.webp',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
  '/pwa-icon-192-maskable.png',
  '/pwa-icon-512-maskable.png',
];

// Dominios de imágenes que se pueden guardar (los de next.config.mjs). Lo subido a S3 lleva
// un nombre único que nunca se reescribe; un avatar de GitHub, en cambio, puede cambiar.
const IMMUTABLE_IMAGE_HOSTS = [/\.cloudfront\.net$/, /\.s3(?:\.[a-z0-9-]+)?\.amazonaws\.com$/];
const MUTABLE_IMAGE_HOSTS = [/^avatars\.githubusercontent\.com$/, /^images\.unsplash\.com$/];
const matchesHost = (hosts, hostname) => hosts.some((host) => host.test(hostname));

const NEVER_CACHE_PATHS = /^\/(?:api|autenticacion|up)(?:\/|$)/;
const SIGNED_URL = /[?&](?:Signature|X-Amz-Signature|Key-Pair-Id|Policy)=/i;
const IMAGE_PATH = /\.(?:png|jpe?g|webp|avif|gif|svg|ico)$/i;
const FONT_PATH = /\.(?:woff2?|ttf|otf)$/i;

// Guarda /offline junto con cada script, estilo y fuente que referencia su HTML.
const precacheOfflinePage = async (cache) => {
  const response = await fetch(OFFLINE_URL, { cache: 'reload' });
  if (!response.ok) throw new Error(`${OFFLINE_URL} respondió ${response.status}`);

  const html = await response.clone().text();
  const assets = new Set(html.match(/\/_next\/static\/[^"'\s\\)]+/g) ?? []);

  await cache.put(OFFLINE_URL, response);
  await cache.addAll([...assets]);
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then(async (cache) => {
      await precacheOfflinePage(cache);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith('pcn-') && !CACHES.includes(key))
          .map((key) => caches.delete(key)),
      );
      // El pedido de la página arranca en paralelo con el arranque del worker.
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

// Cache API devuelve las claves en orden de inserción: se borran las más viejas.
const trimCache = async (cache, cacheName) => {
  const max = MAX_ENTRIES[cacheName];
  if (!max) return;
  const keys = await cache.keys();
  const excess = keys.slice(0, Math.max(0, keys.length - max));
  await Promise.all(excess.map((key) => cache.delete(key)));
};

// Una respuesta se puede compartir entre sesiones solo si el servidor no la marcó como privada.
const isPublicResponse = (response) => {
  if (!response.ok || response.status !== 200) return false;
  if (response.headers.has('set-cookie')) return false;
  const cacheControl = response.headers.get('cache-control') ?? '';
  return !/\b(?:private|no-store)\b/i.test(cacheControl);
};

// Para HTML y RSC no alcanza con que no sea privada: tiene que declararse compartible, como hace
// Next con las páginas estáticas (`s-maxage`). En dev todo sale `no-cache` y no se guarda.
const isSharedPage = (response) =>
  isPublicResponse(response) &&
  /\b(?:public|s-maxage=\d+)\b/i.test(response.headers.get('cache-control') ?? '');

const isStorable = (response, { allowOpaque = false, page = false } = {}) => {
  if (response.type === 'opaque') return allowOpaque;
  return page ? isSharedPage(response) : isPublicResponse(response);
};

const store = async (cacheName, request, response) => {
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  await trimCache(cache, cacheName);
};

const fetchAndStore = (event, cacheName, options) =>
  fetch(event.request).then((response) => {
    if (isStorable(response, options))
      event.waitUntil(store(cacheName, event.request, response.clone()));
    return response;
  });

// Los assets se buscan en todas las cachés (los chunks de /offline viven en el precache); las
// páginas, solo en la suya.
const lookup = (request, cacheName) =>
  cacheName === PAGE_CACHE ? caches.match(request, { cacheName }) : caches.match(request);

const cacheFirst = async (event, cacheName, options) =>
  (await lookup(event.request, cacheName)) ?? fetchAndStore(event, cacheName, options);

const staleWhileRevalidate = async (event, cacheName, options) => {
  const cached = await lookup(event.request, cacheName);
  const network = fetchAndStore(event, cacheName, options);
  if (!cached) return network;
  event.waitUntil(network.catch(() => undefined));
  return cached;
};

// HTML: la red primero (con navigation preload). Sin red, la copia pública guardada o /offline.
const networkFirstPage = async (event, canCache) => {
  try {
    const response = (await event.preloadResponse) ?? (await fetch(event.request));
    if (canCache && isSharedPage(response))
      event.waitUntil(store(PAGE_CACHE, event.request, response.clone()));
    return response;
  } catch {
    const cached = canCache && (await caches.match(event.request, { cacheName: PAGE_CACHE }));
    return cached || (await caches.match(OFFLINE_URL)) || Response.error();
  }
};

// /_next/image?url=... de una URL firmada (galería privada) no se guarda.
const isSignedImageProxy = (url) => SIGNED_URL.test(url.searchParams.get('url') ?? '');

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (request.headers.has('next-action') || request.headers.has('authorization')) return;
  if (request.headers.has('range')) return;

  const url = new URL(request.url);

  // Imágenes de la CDN y de los otros dominios permitidos, salvo las firmadas.
  if (url.origin !== self.location.origin) {
    if (request.destination !== 'image' || SIGNED_URL.test(url.search)) return;
    if (matchesHost(IMMUTABLE_IMAGE_HOSTS, url.hostname))
      event.respondWith(cacheFirst(event, CDN_CACHE, { allowOpaque: true }));
    else if (matchesHost(MUTABLE_IMAGE_HOSTS, url.hostname))
      event.respondWith(staleWhileRevalidate(event, CDN_CACHE, { allowOpaque: true }));
    return;
  }

  const canCache = !NEVER_CACHE_PATHS.test(url.pathname);

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(event, canCache));
    return;
  }

  if (!canCache) return;

  if (url.pathname.startsWith('/_next/static/') || FONT_PATH.test(url.pathname)) {
    event.respondWith(cacheFirst(event, STATIC_CACHE));
    return;
  }

  if (url.pathname === '/_next/image') {
    if (!isSignedImageProxy(url)) event.respondWith(staleWhileRevalidate(event, IMAGE_CACHE));
    return;
  }

  if (IMAGE_PATH.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event, IMAGE_CACHE));
    return;
  }

  // Payloads RSC de las navegaciones del cliente (`?_rsc=` identifica la variante). Solo se
  // guardan si son públicos, igual que el HTML.
  if (request.headers.get('rsc') === '1' || url.searchParams.has('_rsc')) {
    event.respondWith(staleWhileRevalidate(event, PAGE_CACHE, { page: true }));
  }
});
