/* ============================================================
   AquaShield AI — Service Worker (Offline-First PWA)
   Caches all critical assets for disaster scenarios with no network
   ============================================================ */

const CACHE_NAME = 'aquashield-v1.0';
const OFFLINE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/mesh_broadcast.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
];

// Install — Pre-cache all critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing AquaShield AI Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching critical offline assets');
      return cache.addAll(OFFLINE_ASSETS).catch((err) => {
        console.warn('[SW] Some assets failed to cache (CDN offline?). Continuing...', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate — Clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — Cache-first for assets, network-first for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API calls: network-first, then offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache API responses for offline use
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // Return cached API response or offline JSON
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return new Response(JSON.stringify({
              status: 'offline',
              message: '⚠️ You are offline. This data was last synced when you had connectivity.',
              offline: true
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Final fallback: return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Background Sync — Queue SOS alerts for when connectivity returns
self.addEventListener('sync', (event) => {
  if (event.tag === 'sos-sync') {
    event.waitUntil(sendQueuedSOS());
  }
});

async function sendQueuedSOS() {
  try {
    const cache = await caches.open('aquashield-sos-queue');
    const keys = await cache.keys();
    for (const request of keys) {
      const cached = await cache.match(request);
      const body = await cached.text();
      try {
        await fetch('/api/sos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body
        });
        await cache.delete(request);
        console.log('[SW] Queued SOS alert sent successfully');
      } catch (e) {
        console.warn('[SW] SOS sync failed, will retry later');
      }
    }
  } catch (e) {
    console.warn('[SW] Background sync error:', e);
  }
}

// Push Notification support for disaster alerts
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: '🚨 AquaShield Alert', body: 'New disaster alert in your area' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      vibrate: [200, 100, 200, 100, 200],
      tag: 'disaster-alert',
      requireInteraction: true,
      actions: [
        { action: 'view', title: '📍 View Alert' },
        { action: 'sos', title: '🚨 Send SOS' }
      ]
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'sos') {
    event.waitUntil(clients.openWindow('/#sos'));
  } else {
    event.waitUntil(clients.openWindow('/#dashboard'));
  }
});
