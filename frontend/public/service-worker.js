/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'hacto-desk-pwa-v1';

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg?v=hacto-desk-2',
  '/favicon.ico?v=hacto-desk-2',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png'
];

// URLs/patterns that should always go to network (never cached or network-first)
const BYPASS_URL_PATTERNS = [
  /\/api\//,
  /\/socket\.io\//,
  /\/backend\//,
  /\/auth\//,
  /\/tickets\//,
  /\/messages\//,
  /\/whatsapp\//,
  /\/baileys\//,
  /\/contacts\//,
  /\/quick-messages\//,
  /\/queues\//,
  /\/users\//,
  /\/settings\//,
  /\/plans\//,
  /\/companies\//,
  /\/invoices\//,
  /\/chat\//,
  /\/announcements\//,
  /\/prompts\//
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA-SW] Some assets failed to precache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('hacto-desk-pwa-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Skip chrome-extension and unsupported schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Bypass real-time/API routes
  if (BYPASS_URL_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    return;
  }

  // For HTML navigations (SPA pages): Network-First with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const indexFallback = await caches.match('/');
          if (indexFallback) {
            return indexFallback;
          }
          return new Response('Offline - HACTO Desk', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        })
    );
    return;
  }

  // Static React bundles (/static/js, /static/css, images, fonts)
  // These files are hashed in production, so Cache-First / Stale-While-Revalidate is ideal
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/static/') ||
      url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf|eot|css|js)$/))
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached response and fetch update in background
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        // Otherwise fetch from network and cache
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // External fonts (Google Fonts)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
    );
  }
});

// Listen for messages from client (e.g. trigger update)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
