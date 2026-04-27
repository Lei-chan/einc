/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
} from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Serwist (offline caching)
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    // {
    //   matcher: /\/_next\/static\/media\/.+\.woff2?$/i,
    //   handler: new CacheFirst({
    //     cacheName: "static-font-assets",
    //     plugins: [
    //       new ExpirationPlugin({
    //         maxEntries: 10,
    //         maxAgeSeconds: 365 * 24 * 60 * 60,
    //       }),
    //     ],
    //   }),
    // },
    // RSC prefetch requests (hovering over links)
    {
      matcher: ({ request, url: { pathname }, sameOrigin }) =>
        request.headers.get("RSC") === "1" &&
        request.headers.get("Next-Router-Prefetch") === "1" &&
        sameOrigin &&
        !pathname.startsWith("/api/"),
      handler: new StaleWhileRevalidate({
        cacheName: "pages-rsc-prefetch",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 24 * 60 * 60,
          }),
        ],
      }),
    },
    // RSC navigation requests (clicking links)
    {
      matcher: ({ request, url: { pathname }, sameOrigin }) =>
        request.headers.get("RSC") === "1" &&
        sameOrigin &&
        !pathname.startsWith("/api/"),
      handler: new StaleWhileRevalidate({
        cacheName: "pages-rsc",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 24 * 60 * 60,
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

export type Collection = {
  _id?: string;
  name: string;
  numberOfWords: number;
  allWords?: boolean;
};

export interface IndexedDBEventTarget extends EventTarget {
  result: IDBDatabase;
  error: { message: string };
}

export function getCollectionIdData() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("einc");

    req.onsuccess = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["collections"], "readonly");
      const objStore = transaction.objectStore("collections");

      const getReq = objStore.getAll();

      getReq.onsuccess = (e) => {
        const ids = (
          (e.target as IndexedDBEventTarget).result as unknown as Collection[]
        ).map((col) => col._id || "");

        resolve(ids);
      };

      getReq.onerror = (e) => {
        const error = `IndexedDB Error, getting all data failed: ${(e.target as IndexedDBEventTarget).error.message}`;
        reject(error);
      };
    };
    req.onerror = (e) => reject(req.error);
  });
}

serwist.addEventListeners();

const registerCollectionDataToIndexedDB = (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      let ids: string[] = [];

      try {
        ids = (await getCollectionIdData()) as string[];
      } catch (e) {
        // IndexedDB might be empty on first install — that's fine
        console.warn("Could not read IndexedDB during SW install:", e);
      }

      await Promise.all(
        ids.map((id) =>
          serwist.handleRequest({
            request: new Request(`/collection/${id}`),
            event,
          }),
        ),
      );

      await Promise.all(
        ids.map((id) =>
          serwist.handleRequest({
            request: new Request(`/collection/${id}/list`),
            event,
          }),
        ),
      );

      await Promise.all(
        ids.map((id) =>
          serwist.handleRequest({
            request: new Request(`/collection/${id}/flashcard`),
            event,
          }),
        ),
      );

      await Promise.all(
        ids.map((id) =>
          serwist.handleRequest({
            request: new Request(`/collection/${id}/quiz`),
            event,
          }),
        ),
      );
    })(),
  );
};

//  check if they work
self.addEventListener(
  "install",
  registerCollectionDataToIndexedDB,
  //   (event) => {
  //   event.waitUntil(
  //     (async () => {
  //       let ids: string[] = [];

  //       try {
  //         ids = (await getCollectionIdData()) as string[];
  //       } catch (e) {
  //         // IndexedDB might be empty on first install — that's fine
  //         console.warn("Could not read IndexedDB during SW install:", e);
  //       }

  //       await Promise.all(
  //         ids.map((id) =>
  //           serwist.handleRequest({
  //             request: new Request(`/collection/${id}`),
  //             event,
  //           }),
  //         ),
  //       );

  //       await Promise.all(
  //         ids.map((id) =>
  //           serwist.handleRequest({
  //             request: new Request(`/collection/${id}/list`),
  //             event,
  //           }),
  //         ),
  //       );

  //       await Promise.all(
  //         ids.map((id) =>
  //           serwist.handleRequest({
  //             request: new Request(`/collection/${id}/flashcard`),
  //             event,
  //           }),
  //         ),
  //       );

  //       await Promise.all(
  //         ids.map((id) =>
  //           serwist.handleRequest({
  //             request: new Request(`/collection/${id}/quiz`),
  //             event,
  //           }),
  //         ),
  //       );
  //     })(),
  //   );
  // }
);

self.addEventListener("activate", registerCollectionDataToIndexedDB);

// push notification
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      url: data.url,
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
  const targetUrl = "/";

  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientLists) => {
      for (const client of clientLists) {
        if (client.url.includes(targetUrl) && "focus" in client)
          return client.focus();
      }

      return self.clients.openWindow(targetUrl);
    }),
  );
});
