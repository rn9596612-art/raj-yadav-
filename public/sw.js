const CACHE_NAME = 'sona-ai-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/launcher-icon.svg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First with Cache Fallback for dynamic voice app
self.addEventListener('fetch', (event) => {
  // Only attempt to handle GET requests (prevents error with ws:// and POST)
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // Do not cache API or WebSocket feeds
  if (url.pathname.startsWith('/api')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If successful, clone and put in cache for offline speedup
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network offline, fetch from cache
        return caches.match(event.request);
      })
  );
});
