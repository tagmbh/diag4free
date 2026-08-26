/* diag4free — Service Worker
   Strategie:
     - App-Shell: precache (install)
     - Content JSON/MD: stale-while-revalidate
     - Third-party (Fonts, marked, Fuse): cache-first
     - Navigation: network-first mit App-Shell-Fallback (SPA)
*/

const VERSION = 'd4f-v0.2.0';
const SHELL_CACHE = `${VERSION}-shell`;
const CONTENT_CACHE = `${VERSION}-content`;
const VENDOR_CACHE = `${VERSION}-vendor`;

const SHELL_ASSETS = [
  './',
  './index.html',
  './base.css',
  './style.css',
  './mobile.css',
  './app.js',
  './manifest.webmanifest',
  './assets/icons/favicon.svg'
];

const VENDOR_ORIGINS = [
  'https://cdn.jsdelivr.net',
  'https://api.fontshare.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => !k.startsWith(VERSION))
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // SPA navigation: network-first, fallback to cached index
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Content (JSON / Markdown): stale-while-revalidate
  if (url.pathname.includes('/content/')) {
    event.respondWith(staleWhileRevalidate(req, CONTENT_CACHE));
    return;
  }

  // Vendor (fonts, libs from CDN): cache-first
  if (VENDOR_ORIGINS.some(origin => req.url.startsWith(origin))) {
    event.respondWith(cacheFirst(req, VENDOR_CACHE));
    return;
  }

  // Same-origin static: cache-first with fallback
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(req, SHELL_CACHE));
    return;
  }
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const resp = await fetch(req);
    if (resp.ok) cache.put(req, resp.clone());
    return resp;
  } catch (e) {
    return cached || Response.error();
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then(resp => {
    if (resp.ok) cache.put(req, resp.clone());
    return resp;
  }).catch(() => cached);
  return cached || fetchPromise;
}

// Message from page to force update
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
