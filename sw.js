/* Minnie & Tina PWA — offline/slow-network cache */
const CACHE = 'minnie-tina-v3';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/logo.webp',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isImage(request) {
  return request.destination === 'image' ||
    /\.(?:webp|png|jpe?g|gif|svg|ico)(?:\?.*)?$/i.test(new URL(request.url).pathname);
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // App navigation: cache-first for instant repeat opens, then refresh in background.
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(cached => {
        const network = fetch(request).then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put('./index.html', copy));
          }
          return response;
        }).catch(() => cached || caches.match('./index.html'));
        return cached || network;
      })
    );
    return;
  }

  // Food photos: cache-first. Lazy loading means only near-view images are fetched.
  if (isImage(request)) {
    event.respondWith(
      caches.match(request).then(cached =>
        cached || fetch(request).then(response => {
          if (response && (response.ok || response.type === 'opaque')) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        })
      )
    );
    return;
  }

  // Same-origin static files: stale-while-revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        const network = fetch(request).then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        }).catch(() => cached);
        return cached || network;
      })
    );
  }
});
