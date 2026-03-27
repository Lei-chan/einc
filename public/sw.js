self.addEventListener("install", () => {
  self.skipWaiting();
  //     self.registration.showNotification("App updated!", {
  //     body: "Reload the page to get the latest version.",
  //   });
});
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));

self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      url: data.url,
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  // for now
  const targetUrl = `https://einc.lei-chan.website`;

  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientLists) => {
      for (const client of clientLists) {
        if (client.url.includes(targetUrl) && "focus" in client)
          return client.focus();
      }

      return clients.openWindow(targetUrl);
    }),
  );
});
