import { object } from "zod";
import {
  Collections,
  JournalData,
  JournalDatabase,
  WordData,
} from "./config/types/others";
interface IndexedDBEventTarget extends EventTarget {
  result: IDBDatabase;
  error: { message: string };
}

type IndexedDBType = "collections" | "words" | "journals";

export default function indexedDBDatabase(): null | undefined | IDBDatabase {
  let db;

  const request = indexedDB.open("einc");
  request.onerror = (e) => {
    console.log(
      `Connecting to indexedDB einc failed: `,
      (e.target as IndexedDBEventTarget).error?.message,
    );
    db = null;
  };

  request.onsuccess = (e) => {
    db = (e.target as IndexedDBEventTarget).result;
  };

  return db;
}

function registerCollections(collections: Collections) {
  const db = indexedDBDatabase();
  if (!db) return;

  const objectStore = db.createObjectStore("collections", { keyPath: "_id" });

  objectStore.createIndex("name", "name", { unique: false });
  objectStore.createIndex("numberOfWords", "numberOfWords", { unique: false });
  objectStore.createIndex("allWords", "allWords", { unique: false });

  objectStore.transaction.oncomplete = (e) => {
    const collectionObjectStore = db
      .transaction("collections", "readwrite")
      .objectStore("collections");

    collections.forEach((col) => {
      collectionObjectStore.add(col);
      console.log("Collections transaction completed");
    });
  };
}

function registerWords(words: WordData[]) {
  const db = indexedDBDatabase();
  if (!db) return;

  const objectStore = db.createObjectStore("words", { keyPath: "_id" });

  objectStore.createIndex("collectionId", "collectionId", { unique: false });
  objectStore.createIndex("name", "name", { unique: false });
  objectStore.createIndex("audio", "audio", { unique: false });
  objectStore.createIndex("definitions", "definitions", { unique: false });
  objectStore.createIndex("examples", "examples", { unique: false });
  objectStore.createIndex("imageName", "imageName", { unique: false });
  objectStore.createIndex("imageDefinitions", "imageDefinitions", {
    unique: false,
  });
  objectStore.createIndex("status", "status", { unique: false });
  objectStore.createIndex("nextReviewAt", "nextReviewAt", { unique: false });

  objectStore.transaction.oncomplete = (e) => {
    const wordObjectStore = db
      .transaction("words", "readwrite")
      .objectStore("words");

    words.forEach((word) => wordObjectStore.add(word));
    console.log("Words transaction completed");
  };
}

function registerJournals(journals: JournalDatabase[]) {
  const db = indexedDBDatabase();
  if (!db) return;

  const objectStore = db.createObjectStore("journals", { keyPath: "_id" });

  objectStore.createIndex("collectionId", "collectionId", { unique: false });
  objectStore.createIndex("journal", "journal", { unique: false });

  objectStore.transaction.oncomplete = (e) => {
    const journalObjectStore = db
      .transaction("journals", "readwrite")
      .objectStore("journals");
    journals.forEach((journal) => journalObjectStore.add(journal));

    console.log("Journals transaction completed");
  };
}

function removeData(type: "collections" | "words", dataIds: string[]) {
  const objStore = getObjectStore(type);
  if (!objStore) return;

  dataIds.forEach((id) => {
    const req = objStore.delete(id);

    req.onerror = (e) =>
      console.log(
        `IndexedDB Error while deleting ${type}: `,
        (e.target as IndexedDBEventTarget).error.message,
      );
  });
}

function getData(type: IndexedDBType, collectionIds: string[]) {
  const objStore = getObjectStore(type);
  if (!objStore) return;

  collectionIds.map((id) => {
    const req = objStore.get(id);

    let result;
    req.onerror = (e) => {
      console.log(
        `IndexedDB Error while getting ${type}: `,
        (e.target as IndexedDBEventTarget).error.message,
      );
    };
    req.onsuccess = (e) => {
      result = req.result;
    };

    return result;
  });
}

function updateData(
  type: IndexedDBType,
  newData: JournalDatabase[] | Collections | WordData[],
) {
  const objStore = getObjectStore(type);
  if (!objStore) return;

  newData.forEach((newD) => {
    if (!newD._id) return;

    const req = objStore.put(newD);
    req.onsuccess = (e) =>
      console.log(`IndexedDb ${type} updated successfully`);
    req.onerror = (e) => {
      console.log(
        `IndexedDB Error while updating ${type}: `,
        (e.target as IndexedDBEventTarget).error.message,
      );
    };
  });
}

const getObjectStore = (type: IndexedDBType) => {
  const db = indexedDBDatabase();
  if (!db) return null;

  const transaction = db.transaction([type]);
  return transaction.objectStore(type);
};
