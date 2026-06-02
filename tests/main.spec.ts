import { IndexedDBEventTarget } from "@/app/lib/config/types/others";
import { test, expect } from "@playwright/test";

const languagePath = process.env.TEST_LANGUAGE_PATH || "";
const password = process.env.TEST_PASSWORD || "";
const email = process.env.TEST_EMAIL || "";

test.describe("main", async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(languagePath);

    // await page.goto(`${languagePath}/login`);

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

    // await page.fill('[name="email"]', email);
    // await page.fill('[name="password"]', password);

    // // wait for redirect
    // await Promise.all([
    //   page.waitForURL(`${languagePath}/main`),
    //   page.click('button[type="submit"]'),
    // ]);

    // await expect(page).toHaveURL(`${languagePath}/main`);
    page.on("framenavigated", (frame) => {
      console.log("NAV:", frame.url());
    });

    await page.goto(`${languagePath}/main`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("navigate to dictionary", async ({ page }) => {
    const dictionaryUrl = `${languagePath}/dictionary`;

    await Promise.all([
      page.waitForURL(dictionaryUrl),
      page.getByText(languagePath === "/en" ? "Dictionary" : "辞書").click(),
    ]);

    await expect(page).toHaveURL(dictionaryUrl);
  });

  test("navigate to add", async ({ page }) => {
    const addUrl = `${languagePath}/add`;

    await Promise.all([
      page.waitForURL(addUrl),
      page.getByText(languagePath === "/en" ? "Add" : "追加").click(),
    ]);

    await expect(page).toHaveURL(addUrl);
  });

  test("navigate to account", async ({ page }) => {
    const accountUrl = `${languagePath}/account`;

    await Promise.all([
      page.waitForURL(accountUrl),
      page.getByText(languagePath === "/en" ? "Account" : "アカウント").click(),
    ]);

    await expect(page).toHaveURL(accountUrl);
  });

  test("navigate to collection page", async ({ page }) => {
    const collectionUrl = `${languagePath}/collection/123`;
    const button = page.getByText(languagePath === "/en" ? "All" : "全て");

    // await expect(button).toBeVisible();

    await button.waitFor();

    await Promise.all([page.waitForURL(collectionUrl), button.click()]);

    await expect(page).toHaveURL(collectionUrl);
  });

  test("create new collection", async ({ page }) => {
    const button = page.getByText(
      languagePath === "/en" ? "New collection" : "新しいコレクション",
    );
    const form = page.getByTestId("formCreateFolder");

    await button.waitFor();
    await button.click();

    await expect(form).toBeInViewport();

    await page.getByTestId("inputFolderName").fill("Example Name");
    await page.getByText("OK").click();

    await expect(form).not.toBeInViewport({ timeout: 10000 });
  });
});
