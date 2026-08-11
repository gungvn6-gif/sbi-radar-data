// SBI Radar SW — kabuk cache-first, veri (radar_latest.json) network-first
const SHELL = "sbi-radar-v8";
const ASSETS = ["./", "index.html", "manifest.json", "icon.svg"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.pathname.endsWith("radar_latest.json")) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});

// R6 — Web Push: gece göndericisinden gelen bildirimi göster; dokununca radar açılır
self.addEventListener("push", e => {
  let d = { title: "🎯 SBI Radar", body: "Yeni sinyal" };
  try { d = e.data.json(); } catch (_) {}
  e.waitUntil(self.registration.showNotification(d.title, { body: d.body, icon: "icon.svg", badge: "icon.svg" }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window" }).then(ws => ws.length ? ws[0].focus() : clients.openWindow("./")));
});
