// Service worker de la PWA. Solo cachea lo que es igual para todos: la página /offline (con
// sus chunks, para que la trivia funcione sin red), los íconos y los assets estáticos. Las
// páginas y los datos nunca se cachean porque dependen de la sesión: en un dispositivo
// compartido quedarían a la vista después de cerrar sesión.

const VERSION = 'v2';
const PRECACHE = `pcn-precache-${VERSION}`;
const RUNTIME = `pcn-runtime-${VERSION}`;
const OFFLINE_URL = '/offline';
const RUNTIME_MAX_ENTRIES = 200;

const ICONS = [
  '/logo.webp',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
  '/pwa-icon-192-maskable.png',
  '/pwa-icon-512-maskable.png',
];

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
      await cache.addAll(ICONS);
      await self.skipWaiting();
    }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== PRECACHE && key !== RUNTIME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Cache API devuelve las claves en orden de inserción: se borran las más viejas.
const trimRuntimeCache = async (cache) => {
  const keys = await cache.keys();
  const excess = keys.slice(0, Math.max(0, keys.length - RUNTIME_MAX_ENTRIES));
  await Promise.all(excess.map((key) => cache.delete(key)));
};

const putInRuntimeCache = async (request, response) => {
  if (!response.ok || response.type !== 'basic') return;
  const cache = await caches.open(RUNTIME);
  await cache.put(request, response);
  await trimRuntimeCache(cache);
};

const fetchAndCache = (event) =>
  fetch(event.request).then((response) => {
    event.waitUntil(putInRuntimeCache(event.request, response.clone()));
    return response;
  });

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Páginas: siempre de la red; sin conexión, la pantalla /offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) ?? Response.error()),
    );
    return;
  }

  // Los archivos de /_next/static llevan hash en el nombre y nunca cambian: cache-first.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(caches.match(request).then((cached) => cached ?? fetchAndCache(event)));
    return;
  }

  // Imágenes y fuentes de /public: la copia guardada al instante, actualizada en segundo plano.
  if (/\.(?:png|jpe?g|webp|gif|svg|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetchAndCache(event);
        if (!cached) return network;
        event.waitUntil(network.catch(() => undefined));
        return cached;
      }),
    );
  }
});
