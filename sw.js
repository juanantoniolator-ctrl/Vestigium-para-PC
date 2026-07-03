// Vestigium Service Worker - Network First
// Cambiá el número de versión cada vez que actualices la app
const CACHE_NAME = 'vestigium-v2.4';
const URLS_TO_CACHE = ['/'];

// Instalación: guardar en caché
self.addEventListener('install', function(event) {
  self.skipWaiting(); // Activarse inmediatamente sin esperar
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Activación: eliminar cachés viejas
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    }).then(function() {
      return self.clients.claim(); // Tomar control inmediato de todas las pestañas
    })
  );
});

// Fetch: Network First (siempre intentar red, caché solo si falla)
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Guardar respuesta fresca en caché
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(function() {
        // Sin red: usar caché
        return caches.match(event.request);
      })
  );
});
