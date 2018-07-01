const cachedCurrencyName = 'currency';
const nameOfcached = 'currencyConverter-static';
const filesToCache = [
    '/',
    '/index.html',
    '/js/index.js',
    '/js/bootstrap.min.js',
    '/js/jquery.min.js',
    '/css/style.css',
    '/css/bootstrap.min.css',


];

self.addEventListener('install', (e) => {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(nameOfcached).then((cache) => {
            console.log('[ServiceWorker] Caching');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', (e) => {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== nameOfcached && key !== cachedCurrencyName) {
                    console.log('[ServiceWorker] expunging outdated caches ', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    console.log('[Service Worker] Fetch', e.request.url);
    const baseURL = 'https://free.currencyconverterapi.com/api/v5/currencies';
    if (e.request.url.indexOf(baseURL) > -1) {
        e.respondWith(
            caches.open(cachedCurrencyName).then((cache) => {
                return fetch(e.request).then((response) => {
                    cache.put(e.request.url, response.clone());
                    return response;
                });
            })
        );
        return;

    }
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );

});

self.addEventListener('message', function (event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
