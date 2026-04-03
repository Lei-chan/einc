"use client";
import { IndexedDBEventTarget, IndexedDBType } from "../config/types/others";
import {
  getOpeningDatabaseErrorMsg,
  handleOpeningDatabaseError,
} from "./database";

export function createTestDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("test");

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

export function createCollectionDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("einc");

    req.onupgradeneeded = (e) => {
      const db = (e.target as IndexedDBEventTarget).result;

      // If collections objectStore has been already created
      if (db.objectStoreNames.contains("collections")) return;

      const objectStore = db.createObjectStore("collections", {
        keyPath: "_id",
      });

      objectStore.createIndex("name", "name", { unique: false });
      objectStore.createIndex("numberOfWords", "numberOfWords", {
        unique: false,
      });
      objectStore.createIndex("allWords", "allWords", { unique: false });

      objectStore.transaction.oncomplete = (e) => {
        console.log("Collection transaction completed");
        resolve();
      };

      objectStore.transaction.onerror = (e) => {
        handleTransactionError(e, "collections");
        reject(getTransactionError(e, "collections"));
      };
    };

    req.onerror = (e) => {
      handleOpeningDatabaseError(e, "collections");
      reject(getOpeningDatabaseErrorMsg(e, "collections"));
    };
  });
}

export function createWordDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("einc");

    req.onupgradeneeded = (e) => {
      const db = (e.target as IndexedDBEventTarget).result;

      // If words objectStore has been already created
      if (db.objectStoreNames.contains("words")) return;
      const objectStore = db.createObjectStore("words", { keyPath: "_id" });

      objectStore.createIndex("collectionId", "collectionId", {
        unique: false,
      });
      objectStore.createIndex("name", "name", { unique: false });
      objectStore.createIndex("audio", "audio", { unique: false });
      objectStore.createIndex("definitions", "definitions", { unique: false });
      objectStore.createIndex("examples", "examples", { unique: false });
      objectStore.createIndex("imageName", "imageName", { unique: false });
      objectStore.createIndex("imageDefinitions", "imageDefinitions", {
        unique: false,
      });
      objectStore.createIndex("status", "status", { unique: false });
      objectStore.createIndex("nextReviewAt", "nextReviewAt", {
        unique: false,
      });

      objectStore.transaction.oncomplete = (e) => {
        console.log("Words transaction completed");
        resolve();
      };

      objectStore.transaction.onerror = (e) => {
        handleTransactionError(e, "words");
        reject(getTransactionError(e, "words"));
      };
    };

    req.onerror = (e) => {
      handleOpeningDatabaseError(e, "words");
      reject(getOpeningDatabaseErrorMsg(e, "words"));
    };
  });
}

export function createJournalDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("einc");

    req.onupgradeneeded = (e) => {
      const db = (e.target as IndexedDBEventTarget).result;

      // If journals objectStore has been already created
      if (db.objectStoreNames.contains("journals")) return;
      const objectStore = db.createObjectStore("journals", { keyPath: "_id" });

      objectStore.createIndex("collectionId", "collectionId", {
        unique: false,
      });
      objectStore.createIndex("journal", "journal", { unique: false });

      objectStore.transaction.oncomplete = (e) => {
        console.log("Journals transaction completed");
        resolve();
      };

      objectStore.transaction.onerror = (e) => {
        handleTransactionError(e, "journals");
        reject(getTransactionError(e, "journals"));
      };
    };

    req.onerror = (e) => {
      handleOpeningDatabaseError(e, "journals");
      reject(getOpeningDatabaseErrorMsg(e, "journals"));
    };
  });
}

const getTransactionError = (e: Event, type: IndexedDBType) =>
  `IndexedDB Error, transaction for ${type} failed: ${(e.target as IndexedDBEventTarget).error.message}`;

const handleTransactionError = (e: Event, type: IndexedDBType) =>
  console.error(getTransactionError(e, type));
