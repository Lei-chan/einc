"use client";
import { resolve } from "path";
import { IndexedDBEventTarget, IndexedDBType } from "../config/types/others";
import {
  getOpeningDatabaseErrorMsg,
  handleOpeningDatabaseError,
} from "./database";

export function createTestDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open("test");

    req.onupgradeneeded = (e) => {
      const db = (e.target as IndexedDBEventTarget).result;

      // If test objectStore has been already created
      if (db.objectStoreNames.contains("test")) return;

      const objectStore = db.createObjectStore("test", { keyPath: "_id" });

      objectStore.createIndex("name", "name", { unique: false });
      objectStore.createIndex("password", "password", { unique: true });

      objectStore.transaction.oncomplete = (e) => {
        console.log("Test transaction completed");
        resolve();
      };

      objectStore.transaction.onerror = (e) => {
        handleTransactionError(e, "test");
        reject(getTransactionError(e, "test"));
      };
    };

    req.onsuccess = () => resolve();

    req.onerror = (e) => {
      handleOpeningDatabaseError(e, "test");
      reject(getOpeningDatabaseErrorMsg(e, "test"));
    };
  });
}

// export function createCollectionDB(db: IDBDatabase) {

// }

// export function createWordDB(db: IDBDatabase) {
//   // If words objectStore has been already created
//   if (db.objectStoreNames.contains("words")) return;

//   const objectStore = db.createObjectStore("words", { keyPath: "_id" });

//   objectStore.createIndex("collectionId", "collectionId", {
//     unique: false,
//   });
//   objectStore.createIndex("name", "name", { unique: false });
//   objectStore.createIndex("audio", "audio", { unique: false });
//   objectStore.createIndex("definitions", "definitions", { unique: false });
//   objectStore.createIndex("examples", "examples", { unique: false });
//   objectStore.createIndex("imageName", "imageName", { unique: false });
//   objectStore.createIndex("imageDefinitions", "imageDefinitions", {
//     unique: false,
//   });
//   objectStore.createIndex("status", "status", { unique: false });
//   objectStore.createIndex("nextReviewAt", "nextReviewAt", {
//     unique: false,
//   });
// }

// export function createJournalDB(db: IDBDatabase) {
//   // If journals objectStore has been already created
//   if (db.objectStoreNames.contains("journals")) return;

//   const objectStore = db.createObjectStore("journals", { keyPath: "_id" });

//   objectStore.createIndex("collectionId", "collectionId", {
//     unique: false,
//   });
//   objectStore.createIndex("journal", "journal", { unique: false });
// }

export const createIndexedDBDatabase = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const req = window.indexedDB.open("einc");

    req.onupgradeneeded = (e) => {
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
        objectStore.createIndex("imageName", "imageName", { unique: false });
        objectStore.createIndex("imageDefinitions", "imageDefinitions", {
          unique: false,
        });
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

    req.onsuccess = (e) => {
      console.log("success!");
      req.result.close();
      resolve();
    };

    req.onerror = (e) => {
      const error = `IndexedDB Error: ${(e.target as IDBOpenDBRequest).error}`;
      console.error(error);
      reject(error);
    };
  });

const getTransactionError = (e: Event, type: IndexedDBType) =>
  `IndexedDB Error, transaction for ${type} failed: ${(e.target as IndexedDBEventTarget).error.message}`;

const handleTransactionError = (e: Event, type: IndexedDBType) =>
  console.error(getTransactionError(e, type));
