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
    const url = new URL(request.url);

    // 1. Handle navigation (HTML page) requests
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() => caches.match(OFFLINE_URL))
        );
        return;
    }

    // 2. Handle Actuator endpoints as "backend API"
    //    Adjust the prefix if your actuator base path is customized.
    const isSameOrigin = url.origin === self.location.origin;
    const isActuatorRequest = isSameOrigin && url.pathname.startsWith("/actuator");

    if (isActuatorRequest) {
        event.respondWith(
            fetch(request).catch(() => {
                // Backend (Actuator) not reachable → redirect to the offline page
                return Response.redirect(OFFLINE_URL, 302);
            })
        );
        return;
    }

    // 3. Other requests (CSS/JS/images): cache-first, then network
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(request).catch(() => {
                // No special fallback for non-HTML, non-actuator requests
            });
        })
    );
});