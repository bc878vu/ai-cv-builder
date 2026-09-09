const CACHE='ai-cv-builder-shell-v2';
const APP_SHELL=['/','/manifest.webmanifest','/pdf.worker.mjs'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL).catch(()=>undefined)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();if(response.ok&&new URL(event.request.url).origin===self.location.origin){caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>undefined)}return response}).catch(()=>caches.match('/'))))});
