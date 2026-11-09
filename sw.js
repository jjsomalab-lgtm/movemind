// 心動力 AI｜Service Worker：讓 APP 在網路不穩時也能打開
// 更新程式後，請把 VERSION 數字加 1，手機才會換成新版本。
const VERSION = 'mm-v11-1';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './css/app.css',
  './js/app.js', './js/store.js', './js/content.js', './js/garden.js', './js/speech.js', './js/walk.js', './js/share.js', './js/pose.js', './js/demos.js', './js/art.js', './js/places.js', './js/pet.js', './js/petsound.js', './js/weather.js', './js/meditate.js', './js/reminders.js',
  './icons/icon-192.png', './icons/icon-512.png',
];
// 第三方檔案（地圖程式、姿勢辨識程式與模型）：第一次下載後保存，之後離線也能用
const RUNTIME_CACHE = ['cdn.jsdelivr.net', 'storage.googleapis.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin === location.origin) {
    // 自己的檔案：先用網路拿新版，失敗再用快取
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
    return;
  }
  if (RUNTIME_CACHE.includes(url.hostname)) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })));
  }
  // 地圖圖磚（OpenStreetMap）依其使用規範不做大量快取，直接走網路
});
