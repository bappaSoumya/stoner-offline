const CACHE_NAME = 'stoner-offline-v3';  // Bump version so it updates!

const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './constants.js',
  './maps.js',
  './particle.js',
  './player.js',
  './projectile.js',
  './ui.js',
  './ai.js',
  './game.js',
  './soundtrack.mp3',
  './manifest.json',
  // icons if any
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('[SW] Install failed:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      // Try cache first
      if (cached) {
        // Special handling for audio/video files with Range requests
        if (event.request.headers.has('range') &&
            (event.request.url.endsWith('.mp3') || event.request.url.endsWith('.ogg'))) {
          
          return cached.then(response => {
            if (!response) return response;

            return response.arrayBuffer().then(buffer => {
              const bytes = /^bytes=(\d+)-(\d+)?$/.exec(event.request.headers.get('range'));
              if (!bytes) return response; // no valid range → full file

              const start = parseInt(bytes[1], 10);
              const end = bytes[2] ? parseInt(bytes[2], 10) : buffer.byteLength - 1;
              const slice = buffer.slice(start, end + 1);

              const newHeaders = new Headers(response.headers);
              newHeaders.set('Content-Range', `bytes ${start}-${end}/${buffer.byteLength}`);
              newHeaders.set('Content-Length', slice.byteLength.toString());
              newHeaders.set('Accept-Ranges', 'bytes');

              return new Response(slice, {
                status: 206,
                statusText: 'Partial Content',
                headers: newHeaders
              });
            });
          });
        }

        return cached;
      }

      // Network fallback + cache new responses
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Ultimate offline fallback (for HTML at least)
        return caches.match('./index.html');
      });
    })
  );
});