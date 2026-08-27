// test
import { test, expect } from "@playwright/test";
// mongoDB
import dbConnect from "@/app/lib/database";
import { ObjectId } from "mongoose";
import User from "@/app/lib/models/User";
// indexedDB
import { getAllData } from "@/app/lib/indexedDB/database";
// types
import { Collection, Collections } from "@/app/lib/config/types/others";

const email = process.env.TEST_EMAIL || "";
const languagePath = process.env.TEST_LANGUAGE_PATH || "";

test.describe("main", async () => {
  test.use({ storageState: "playwright/.auth/.user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${languagePath}/main`);
    // wait for the result to come up
    await page.waitForTimeout(10000);
  });

  test.describe("navigation", async () => {
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
        page
          .getByText(languagePath === "/en" ? "Account" : "アカウント")
          .click(),
      ]);

      await expect(page).toHaveURL(accountUrl);
    });

    test("navigate to collection page", async ({ page }) => {
      await dbConnect();
      const collections = (
        (await User.findOne({ email }).select("collections").lean()) as {
          _id: ObjectId;
          collections: Collections;
        }
      ).collections;
      const collectionId = collections
        .find((col: Collection) => col.allWords)
        ?._id?.toString();

      const collectionUrl = `${languagePath}/collection/${collectionId}`;
      const button = page.getByText(languagePath === "/en" ? "All" : "全て");

      await button.waitFor();

      await Promise.all([page.waitForURL(collectionUrl), button.click()]);

      await expect(page).toHaveURL(collectionUrl);
    });
  });

  test("main pagination", async ({ page }) => {
    test.slow();

    // get all user collections
    await dbConnect();
    const collections = (
      (await User.findOne({ email }).select("collections")) as {
        _id: ObjectId;
        collections: Collections;
      }
    ).collections;

    // if number of collections is less than 25, display error
    if (collections.length <= 25) {
      console.error(
        "Please register more than 25 collections to test pagination",
      );
      return;
    }

    // expect the first page has collection "All"
    const collectionAll = page.getByText(
      languagePath === "/en" ? "All" : "全て",
    );
    await expect(collectionAll).toBeVisible();

    //  expect pagination container and next page button are visible
    const paginationContainer = page.getByTestId("paginationContainer");
    const nextPageBtn = paginationContainer.getByText("2");

    await expect(paginationContainer).toBeVisible();
    await expect(nextPageBtn).toBeVisible();

    // click next page button and wait for the page to load
    await nextPageBtn.click();
    await page.waitForTimeout(3000);

    // expect the second page doesn't have collection "All"
    await expect(collectionAll).not.toBeVisible();

    //  expect back button is visible => click back button
    const backPageBtn = paginationContainer.getByText("1");
    await expect(backPageBtn).toBeVisible();
    await backPageBtn.click();

    // wait for the page to load
    await page.waitForTimeout(3000);

    // expct next button is visible
    await expect(nextPageBtn).toBeVisible();

    // await page.screenshot({ path: "screenshot2.png" });
    // expect the first page has collection "All" again
    await expect(collectionAll).toBeVisible();
  });

  test("logout", async ({ page, context }) => {
    await page
      .getByRole("button", {
        name: languagePath === "/en" ? "Logout" : "ログアウト",
      })
      .click();

    await page.waitForURL(languagePath, { timeout: 10000 });
    await expect(page).toHaveURL(languagePath);

    const cookies = await context.cookies();
    const sessionCookie = cookies.find((cookie) => cookie.name === "session");
    expect(sessionCookie).toBe(undefined);
  });

  test("create new collection", async ({ page }) => {
    test.slow();

    await page.goto(`${languagePath}/main`);
    // wait for the contents to load
    await page.waitForTimeout(8000);

    const curNumberOfCollections = await page.getByTestId("collection").count();

    const button = page.getByText(
      languagePath === "/en" ? "New collection" : "新しいコレクション",
    );
    const form = page.getByTestId("formCreateFolder");

    await button.waitFor();
    await button.click();

    await expect(form).toBeInViewport();

    await page.getByTestId("inputFolderName").fill("Example Name 3");
    await page.getByText("OK").click();

    await expect(form).not.toBeInViewport({ timeout: 10000 });

    expect(curNumberOfCollections).toBeLessThan(
      await page.getByTestId("collection").count(),
    );
    // await expect(
    //   page.getByText("Example Name 3", { exact: true }),
    // ).toBeVisible();
  });
});
