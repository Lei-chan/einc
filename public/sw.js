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
      icon: data.icon || "/einc-logo.PNG",
      badge: "/einc-logo.PNG",
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
  event.notification.close();
  event.waitUntil(clients.openWindow("https://einc.lei-chan.website"));
});
