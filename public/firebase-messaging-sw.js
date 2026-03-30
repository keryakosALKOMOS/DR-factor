importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyC32dSq98l0b6M1KNBqD8RW9nUafwZygCk",
  authDomain: "dr-factor.firebaseapp.com",
  projectId: "dr-factor",
  storageBucket: "dr-factor.firebasestorage.app",
  messagingSenderId: "989194632754",
  appId: "1:989194632754:web:266b95e1060dfa5fbc862b"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192x192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// PWA Offline Caching
const CACHE_NAME = "dr-factor-cache-v1";
const urlsToCache = [
  "/"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened PWA cache");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  // Only intercept GET requests for caching
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) return;
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response or attempt to fetch fresh from network
      return response || fetch(event.request).catch(() => caches.match("/"));
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});
