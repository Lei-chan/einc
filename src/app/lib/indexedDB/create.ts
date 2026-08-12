"use client";
import { IndexedDBEventTarget } from "../config/types/others";

export const createIndexedDBDatabase = (): Promise<void> =>
  new Promise((resolve, reject) => {
    // delete indexedDB first to make the data same as online database
    const deleteReq = window.indexedDB.deleteDatabase("einc");

    deleteReq.onsuccess = (e) =>
      console.log("indexedDB deleted successfully or it didn't exist!");

    deleteReq.onerror = (e) =>
      console.error(
        "Delete indexedDB failed: ",
        (e.target as IndexedDBEventTarget).error,
      );

    const openReq = window.indexedDB.open("einc", 1);

    openReq.onupgradeneeded = (e) => {
      const db = (e.target as IndexedDBEventTarget).result;
      const transaction = (e.target as IDBOpenDBRequest).transaction!;

      transaction.onerror = (e) =>
        console.error(
          `IndexedDB Error in transaction: ${(e.target as IDBTransaction).error}`,
        );

      // If collections has not been created yet
      if (!db.objectStoreNames.contains("collections")) {
        const objectStore = db.createObjectStore("collections", {
          keyPath: "_id",
        });

        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("numberOfWords", "numberOfWords", {
          unique: false,
        });
        objectStore.createIndex("allWords", "allWords", { unique: false });
      }

      // If words objectStore has not been created yet
      if (!db.objectStoreNames.contains("words")) {
        const objectStore = db.createObjectStore("words", { keyPath: "_id" });

        objectStore.createIndex("collectionId", "collectionId", {
          unique: false,
        });
        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("audio", "audio", { unique: false });
        objectStore.createIndex("definitions", "definitions", {
          unique: false,
        });
        objectStore.createIndex("examples", "examples", { unique: false });
        objectStore.createIndex("pronunciationString", "pronunciationString", {
          unique: false,
        });
        objectStore.createIndex("imageName", "imageName", { unique: false });
        objectStore.createIndex("imageDefinitions", "imageDefinitions", {
          unique: false,
        });
        objectStore.createIndex("synonyms", "synonyms", { unique: false });
        objectStore.createIndex("status", "status", { unique: false });
        objectStore.createIndex("nextReviewAt", "nextReviewAt", {
          unique: false,
        });
      }

      // If journals objectStore has not been created yet
      if (!db.objectStoreNames.contains("journals")) {
        const objectStore = db.createObjectStore("journals", {
          keyPath: "_id",
        });

        objectStore.createIndex("collectionId", "collectionId", {
          unique: false,
        });
        objectStore.createIndex("journal", "journal", { unique: false });
      }
    };

    openReq.onsuccess = (e) => {
      openReq.result.close();
      resolve();
    };

    openReq.onerror = (e) => {
      const error = `IndexedDB Error: ${(e.target as IDBOpenDBRequest).error}`;
      console.error(error);
      reject(error);
    };
  });
