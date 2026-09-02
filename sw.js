/* diag4free — Service Worker
   Strategie:
     - App-Shell: precache (install)
     - Content JSON/MD: stale-while-revalidate
     - Third-party (Fonts, Fuse): cache-first
     - Navigation: network-first mit App-Shell-Fallback (SPA)
*/

const VERSION = 'd4f-v0.51.0';
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
  './graphics.js',
  './obd.js',
  './symptome.js',
  './symptome.css',
  './glossar.js',
  './glossar.css',
  './md.js',
  './manifest.webmanifest',
  './assets/icons/favicon.svg'
];

// Inhalte, die die App zum Start braucht. Sie liegen im Content-Cache —
// dort, wo die Content-Route auch nachsieht. Vorher standen vier davon im
// Shell-Cache, den die Content-Route nie liest, und index.json in gar
// keinem: Nach jedem Versionswechsel war die App offline ohne Index, bis
// jemand einmal online neu geladen hatte. Einzeln, mit Fangnetz — eine
// fehlende Datei darf den Vorrat nicht kippen.
const CONTENT_ASSETS = [
  './content/index.json',
  './content/models.json',
  './content/engines.json',
  './content/measure.json',
  './content/software.json',
  './content/symptome.json',
  './content/gruppen.json',
  './content/glossar.json'
];

const VENDOR_ORIGINS = [
  'https://cdn.jsdelivr.net',
  'https://api.fontshare.com',
  'https://cdn.fontshare.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com'
];

// Freigestellte Fahrzeugfotos. Bewusst nicht in SHELL_ASSETS: addAll ist
// alles-oder-nichts, ein einziges fehlendes Bild wuerde den ganzen
// Vorrat kippen und die App offline unbrauchbar machen. Diese hier
// duerfen einzeln fehlschlagen — dann zeichnet graphics.js die Silhouette.
const BILD_ASSETS = [
  ...[
    'e28', 'e30', 'e34', 'e36', 'e38', 'e39', 'e46', 'e60', 'e70',
    'e87', 'e88', 'e90', 'f10', 'f15', 'f22', 'f30'
  ].map(id => `./assets/fahrzeuge/${id}.webp`),
  // Motor-Symbolbilder, eines je Bauform und Aufladung. Gleiche Regel:
  // einzeln vorgehalten, darf einzeln fehlen — dann steht das Schema.
  ...[
    'r3-turbo', 'r4-saug', 'r4-turbo',
    'r6-saug', 'r6-turbo', 'r6-biturbo',
    'v8-saug', 'v8-biturbo', 'v10-saug', 'v12-saug'
  ].map(id => `./assets/motoren/${id}.webp`)
];

// `cache: 'reload'` holt frisch vom Server statt aus dem HTTP-Cache des
// Browsers — sonst kann ein neuer Vorrat mit einer alten app.js gefuellt
// werden, die der Browser noch fuer zehn Minuten vorhaelt.
const frisch = (u) => new Request(u, { cache: 'reload' });

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL_CACHE);
    await shell.addAll(SHELL_ASSETS.map(frisch));
    await Promise.all(BILD_ASSETS.map(u => shell.add(u).catch(() => {})));
    const content = await caches.open(CONTENT_CACHE);
    await Promise.all(CONTENT_ASSETS.map(u => content.add(frisch(u)).catch(() => {})));
    await self.skipWaiting();
  })());
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
