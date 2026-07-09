const CACHE_NAME = 'pcn-pwa-cache-v1';
const OFFLINE_URL = '/offline';

const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  '/',
  '/favicon.ico',
  '/logo.webp',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
  '/pwa-icon-192-maskable.png',
  '/pwa-icon-512-maskable.png',
];

// Instalar el Service Worker y cachear recursos críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[PCN Service Worker] Precaching critical assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[PCN Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Interceptar solicitudes fetch
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignorar peticiones que no sean GET, HMR de Next.js, APIs locales, o extensiones de navegador
  if (
    request.method !== 'GET' ||
    url.pathname.includes('_next/webpack-hmr') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.protocol === 'chrome-extension:'
  ) {
    return;
  }

  // 1. Estrategia para Navegación (Páginas HTML principales)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Guardar copia fresca en caché para posterior lectura offline
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
          return response;
        })
        .catch(() => {
          // Si falla (Offline), retornar la página desde caché o servir /offline
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // 2. Estrategia Cache-First con actualización de background para Assets Estáticos
  const isStaticAsset =
    url.pathname.match(/\.(js|css|woff2|png|jpg|jpeg|svg|webp|gif|ico)$/) ||
    url.pathname.includes('_next/static');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Retornar recurso cacheado inmediatamente para velocidad premium
          // y refrescar el cache en segundo plano de manera silenciosa
          fetch(request)
            .then((response) => {
              if (response.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
              }
            })
            .catch(() => {
              // Silenciar errores de conexión al revalidar offline
            });
          return cachedResponse;
        }

        // Si no está en caché, hacer fetch normal
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
          }
          return response;
        });
      })
    );
    return;
  }

  // 3. Estrategia por defecto: Network-First con fallback a cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Permitir forzar la actualización del Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
