"use client";
import { error } from "console";
import { IndexedDBEventTarget, IndexedDBType } from "../config/types/others";
import { Collections, JournalDatabase, WordData } from "../config/types/others";

const getDatabaseName = (type: IndexedDBType) =>
  type === "test" ? "test" : "einc";

const openTransaction = (
  type: IndexedDBType,
  mode: IDBTransactionMode = "readonly",
): Promise<{ objStore: IDBObjectStore; transaction: IDBTransaction }> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(getDatabaseName(type));

    req.onsuccess = (e) => {
      const db = (e.target as IndexedDBEventTarget).result;
      const transaction = db.transaction([type], mode);
      const objStore = transaction.objectStore(type);
      resolve({ objStore, transaction });
    };

    req.onerror = (e) => {
      handleOpeningDatabaseError(e, type);
      reject(getOpeningDatabaseErrorMsg(e, type));
    };
  });

export async function registerData(
  type: IndexedDBType | "test",
  dataArr:
    | Collections
    | WordData[]
    | JournalDatabase[]
    | { _id: string; name: string; password: string }[],
): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(getDatabaseName(type));

    req.onsuccess = (e) => {
      const db = (e.target as IndexedDBEventTarget).result;
      const transaction = db.transaction([type], "readwrite");
      const objStore = transaction.objectStore(type);

      dataArr.forEach((data) => objStore.add(data));

      transaction.oncomplete = (e) => {
        console.log(
          `Data for ${type} added in indexedDB ${getDatabaseName(type)}`,
        );
        resolve();
      };

      transaction.onerror = (e) => {
        const error = `IndexedDB error, adding data for ${type} failed: ${(e.target as IndexedDBEventTarget).error.message}`;
        console.error(error);
        reject(error);
      };
    };

    req.onerror = (e) => {
      handleOpeningDatabaseError(e, type);
      reject(getOpeningDatabaseErrorMsg(e, type));
    };
  });
}

export function removeData(
  type: "collections" | "words" | "test",
  dataIds: string[],
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const indexedDBData = await openTransaction(type, "readwrite");

    dataIds.forEach((id) => indexedDBData.objStore.delete(id));

    indexedDBData.transaction.oncomplete = (e) => {
      console.log(
        `Data for ${type} in indexedDB ${getDatabaseName(type)} removed successfully`,
      );
      resolve();
    };

    indexedDBData.transaction.onerror = (e) => {
      const error = `IndexedDB Error, deleting data for ${type} failed: ${(e.target as IndexedDBEventTarget).error.message}`;
      console.log(error);
      reject(error);
    };
  });
}

export function getAllData(type: IndexedDBType) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(getDatabaseName(type));

    req.onsuccess = (e) => {
      const db = (e.target as IndexedDBEventTarget).result;
      const transaction = db.transaction([type], "readonly");
      const objStore = transaction.objectStore(type);

      const getReq = objStore.getAll();

      getReq.onsuccess = (e) =>
        resolve((e.target as IndexedDBEventTarget).result);

      getReq.onerror = (e) => {
        const error = `IndexedDB Error, getting all data failed: ${(e.target as IndexedDBEventTarget).error.message}`;
        console.error(error);
        reject(error);
      };
    };
    req.onerror = (e) => {
      handleOpeningDatabaseError(e, type);
      reject(getOpeningDatabaseErrorMsg(e, type));
    };
  });
}

export function getDataForCollections(
  type: IndexedDBType,
  collectionIds: string[],
) {
  return new Promise(async (resolve) => {
    const indexedDBData = await openTransaction(type, "readonly");

    const promises = collectionIds.map(
      (id) =>
        new Promise((resolve, reject) => {
          const req = indexedDBData.objStore.get(id);
          req.onsuccess = (e) => resolve(req.result);

          req.onerror = (e) => {
            const error = `IndexedDB Error while getting ${type}: 
                  ${(e.target as IndexedDBEventTarget).error.message}`;
            console.error(error);
            reject(error);
          };
        }),
    );
    const results = await Promise.allSettled(promises);
    resolve(results);
  });
}

export function updateData(
  type: IndexedDBType,
  newData:
    | JournalDatabase[]
    | Collections
    | WordData[]
    | { _id: string; name: string; password: string }[],
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const indexedDBData = await openTransaction(type, "readwrite");

    newData.forEach((newD) => {
      if (!newD._id) return;

      const req = indexedDBData.objStore.put(newD);

      req.onsuccess = (e) => resolve();

      req.onerror = (e) => {
        const error = `IndexedDB Error, updating data for ${type} in indexedDB ${getDatabaseName(type)}:  ${(e.target as IndexedDBEventTarget).error.message}`;
        console.log(error);
        reject(error);
      };
    });
  });
}

export const getOpeningDatabaseErrorMsg = (e: Event, type: IndexedDBType) =>
  `IndexedDB Error, Opening database ${type === "test" ? "test" : "einc"} failed: ${(e.target as IndexedDBEventTarget).error.message}`;

export const handleOpeningDatabaseError = (e: Event, type: IndexedDBType) => {
  console.error(getOpeningDatabaseErrorMsg(e, type));
};
