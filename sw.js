const CACHE_NAME = 'myfunmessages-v1';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon.svg',
  'https://cdn.tailwindcss.com' 
];

// Install: Cache files
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Fetch: Serve from Cache or Network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
