const CACHE_NAME = 'mymessage-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/chat.js',
  '/manifest.json',
  '/icons/chat-icon-192.png',
  '/icons/chat-icon-512.png',
  '/assets/notification-sound.mp3' 
];

// 1. INSTALL: Cache the UI Shell immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Installing MyMessageApp...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching Chat UI');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. ACTIVATE: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. FETCH: Stale-While-Revalidate Strategy
// This loads the cached UI immediately for speed, but checks the network 
// in the background to see if the UI code has been updated.
// Note: Actual chat messages should be fetched via WebSocket or API in your JS, not cached here.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});

// 4. PUSH NOTIFICATIONS: The key feature for chat apps
// This listens for push messages from your server (e.g., "New Message from Sarah")
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'New Message';
  const options = {
    body: data.body || 'You have a new message!',
    icon: '/icons/chat-icon-192.png',
    badge: '/icons/badge-icon.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 5. NOTIFICATION CLICK
// Opens the specific chat window when the user clicks the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});