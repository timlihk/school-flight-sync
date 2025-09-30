// Service Worker for School Flight Sync PWA
// Provides offline support and caching

const CACHE_NAME = 'school-flight-sync-v1';
const RUNTIME_CACHE = 'runtime-cache-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png.svg',
  '/icons/icon-512x512.png.svg',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Network-first strategy for API calls (Supabase)
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/auth/v1/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first strategy for static assets
  if (
    request.url.includes('/assets/') ||
    request.url.includes('/icons/') ||
    request.url.match(/\.(css|js|png|jpg|jpeg|svg|woff|woff2)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Stale-while-revalidate for HTML pages
  event.respondWith(staleWhileRevalidate(request));
});

// Cache-first strategy
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[SW] Serving from cache:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    // Return offline page if available
    const offlinePage = await cache.match('/index.html');
    return offlinePage || new Response('Offline', { status: 503 });
  }
}

// Network-first strategy (for API calls)
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      // Cache successful API responses
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  // Fetch in background and update cache
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  // Return cached version immediately, or wait for network
  return cached || fetchPromise;
}

// Handle background sync (for future use)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Implement background data sync when connectivity is restored
  console.log('[SW] Syncing data...');
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'New notification',
    icon: '/icons/icon-192x192.png.svg',
    badge: '/icons/icon-72x72.png.svg',
    vibrate: [200, 100, 200],
    data: data,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'School Flight Sync', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});