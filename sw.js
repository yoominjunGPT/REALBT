/* REALBT service worker — 앱 셸만 캐시합니다. Supabase API / 스토리지 요청은 절대 캐시하지 않습니다. */
const CACHE = 'realbt-shell-v1';
const SHELL = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()).catch(() => {}));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;           // 외부(Supabase, CDN, YouTube 이미지)는 그대로 통과
  if (req.mode === 'navigate') {                         // 네트워크 우선, 오프라인이면 캐시된 셸
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return r; })
      .catch(() => caches.match('./index.html')));
  }
});
