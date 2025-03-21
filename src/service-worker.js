// Simplified service worker that doesn't interfere with app functionality
self.addEventListener('install', (event) => {
  // Skip the waiting phase and activate immediately
  self.skipWaiting();
  console.log('Service worker: Installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service worker: Activated');
  // Take control of all clients immediately
  event.waitUntil(clients.claim());
});

// Handle fetch events by letting the browser handle all requests normally
self.addEventListener('fetch', (event) => {
  // Let the browser handle all requests by default
  // This prevents any service worker caching issues with auth
  return;
}); 