const CACHE_NAME = "spring-pwa-cache-v1";
const OFFLINE_URL = "/offline";

const ASSETS = [
    "/",
    OFFLINE_URL,
    "/css/main.css",
    "/js/app.js"
];

// Install event: pre-cache core assets and offline page
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event: take control of existing clients
self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

// Fetch event
self.addEventListener("fetch", (event) => {
    const request = event.request;

    // Handle navigation (HTML page) requests
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .catch(() => {
                    return caches.match(OFFLINE_URL);
                })
        );
        return;
    }

    // For other requests (CSS/JS/images), try cache first, then network
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(request).catch(() => {
                // As a last resort for non-navigation, just fail silently
                // (You could add specific fallbacks for images, etc.)
            });
        })
    );
});