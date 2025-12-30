const CACHE_NAME = 'fitcheck-v4';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Install service worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Activate and clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch strategy: Network first, but NEVER cache API calls
self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // NEVER cache API calls - always go to network
    if (url.includes('api.openai.com') ||
        url.includes('openrouter.ai') ||
        url.includes('api.') ||
        event.request.method !== 'GET') {
        event.respondWith(fetch(event.request));
        return;
    }

    // For app files: Network first, fallback to cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Only cache successful GET requests for same-origin
                if (response.status === 200 && event.request.url.startsWith(self.location.origin)) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => cache.put(event.request, responseClone));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
