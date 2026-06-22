import { test as setup } from "@playwright/test";
import dbConnect from "@/app/lib/database";
import User from "@/app/lib/models/User";
import { SignJWT } from "jose";
import { IndexedDBEventTarget } from "@/app/lib/config/types/others";
import { setServers } from "node:dns/promises";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI || "";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

const languagePath = process.env.TEST_LANGUAGE_PATH || "";
const email = process.env.TEST_EMAIL || "";

setup("create new database", async ({ page, context }) => {
  console.log("creating new database...");

  // connect to database (MongoDB)
  if (!uri) console.error("Please define the MONGODB_URI environment variable");

  // setServers(["1.1.1.1", "8.8.8.8"]);
  // await mongoose.connect(uri);

  // later!! TYPEERROR: cannot read property of null (testUser._id)
  await dbConnect();
  const testUser = await User.findOne({ email }).select("_id");

  const session = await new SignJWT({
    userId: testUser._id.toString(),
    expiresAt,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey);

  await context.addCookies([
    { name: "session", value: session, path: "/", domain: "localhost" },
  ]);

  page.goto(languagePath);
  await page.waitForURL(languagePath);

  await page.evaluate(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const req = window.indexedDB.open("einc");

      req.onupgradeneeded = (e) => {
        const db = (e.target as IndexedDBEventTarget).result;
        const transaction = (e.target as IDBOpenDBRequest).transaction!;

        transaction.onerror = (e) =>
          console.error(
            `IndexedDB Error in transaction: ${(e.target as IDBTransaction).error}`,
          );

        transaction.oncomplete = () => resolve();

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
          const objectStore = db.createObjectStore("words", {
            keyPath: "_id",
          });

          objectStore.createIndex("collectionId", "collectionId", {
            unique: false,
          });
          objectStore.createIndex("name", "name", { unique: false });
          objectStore.createIndex("audio", "audio", { unique: false });

          objectStore.createIndex("definitions", "definitions", {
            unique: false,
          });
          objectStore.createIndex("examples", "examples", { unique: false });
          objectStore.createIndex(
            "pronunciationString",
            "pronunciationString",
            { unique: false },
          );
          objectStore.createIndex("synonyms", "synonyms", { unique: false });
          objectStore.createIndex("imageName", "imageName", {
            unique: false,
          });
          objectStore.createIndex("imageDefinitions", "imageDefinitions", {
            unique: false,
          });
          objectStore.createIndex("status", "status", { unique: false });
          objectStore.createIndex("nextReviewAt", "nextReviewAt", {
            unique: false,
          });
        }

        // If journals objectStore has not been created yet
        // if (!db.objectStoreNames.contains("journals")) {
        //   const objectStore = db.createObjectStore("journals", {
        //     keyPath: "_id",
        //   });

        //   objectStore.createIndex("collectionId", "collectionId", {
        //     unique: false,
        //   });
        //   objectStore.createIndex("journal", "journal", { unique: false });
        // }
      };

      req.onsuccess = (e) => {
        req.result.close();
        resolve();
      };

      req.onerror = (e) => {
        const error = `IndexedDB Error: ${(e.target as IDBOpenDBRequest).error}`;
        console.error(error);
        reject(error);
      };
    });
  });

  await page.evaluate(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("einc");

      req.onsuccess = (e) => {
        try {
          const db = (e.target as IndexedDBEventTarget).result;
          const transaction = db.transaction(["collections"], "readwrite");
          const objStore = transaction.objectStore("collections");

          [
            {
              _id: "123",
              name: "All",
              numberOfWords: 0,
            },
          ].forEach((data) => objStore.put(data));

          transaction.oncomplete = (e) => {
            resolve();
          };

          transaction.onerror = (e) => {
            const error = `IndexedDB error, adding data for collections failed: ${(e.target as IndexedDBEventTarget).error.message}`;
            console.error(error);
            reject(error);
          };
        } catch (err) {
          console.log(err);
          reject(err);
        }
      };

      req.onerror = (e) => {
        console.log("indexedDB Error", e);
        reject("indexedDB Error");
      };

      req.onblocked = () => {
        console.log("blocked");
        reject(new Error("blocked"));
      };
    });
  });

  await page.evaluate(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("einc");

      req.onsuccess = (e) => {
        try {
          const db = (e.target as IndexedDBEventTarget).result;
          const transaction = db.transaction(["words"], "readwrite");
          const objStore = transaction.objectStore("words");

          [
            {
              _id: "abcd",
              collectionId: "123",
              definitions: ["hi"],
              name: "Hey",
              examples: [],
              audio: null,
              imageDefinitions: null,
              imageName: null,
              status: 0,
              nextReviewAt: new Date().toISOString(),
            },
          ].forEach((data) => objStore.put(data));

          transaction.oncomplete = (e) => {
            resolve();
          };

          transaction.onerror = (e) => {
            const error = `IndexedDB error, adding data for words failed: ${(e.target as IndexedDBEventTarget).error.message}`;
            console.error(error);
            reject(error);
          };
        } catch (err) {
          console.log(err);
          reject(err);
        }
      };

      req.onerror = (e) => {
        console.log("indexedDB Error", e);
        reject("indexedDB Error");
      };

      req.onblocked = () => {
        console.log("blocked");
        reject(new Error("blocked"));
      };
    });
  });
});
