
const CACHE_NAME = 'linha36-cache-v1';
// Use relative paths so it works on GitHub Pages
const assetsToCache = [
    './',
    './index.html',
    './icon-192.svg',
    './icon-512.svg',
    './manifest.json' 
];

// Evento de instalação: guarda a "app shell" em cache
self.addEventListener('install', event => {
    console.log('Service Worker: A instalar...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: A guardar a app shell em cache');
                return cache.addAll(assetsToCache);
            })
    );
});

// Evento de ativação: limpa caches antigas
self.addEventListener('activate', event => {
    console.log('Service Worker: A ativar...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: A limpar cache antiga');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Evento de fetch: serve ficheiros da cache ou da rede
self.addEventListener('fetch', event => {
    // Apenas para pedidos de navegação
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('./index.html'))
        );
        return;
    }

    // Para todos os outros pedidos, usa a estratégia cache-first
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se a resposta estiver na cache, retorna-a. Senão, vai à rede.
                return response || fetch(event.request).then(networkResponse => {
                    // Opcional: guardar a nova resposta em cache
                    // const responseToCache = networkResponse.clone();
                    // caches.open(CACHE_NAME).then(cache => {
                    //     cache.put(event.request, responseToCache);
                    // });
                    return networkResponse;
                });
            })
    );
});
