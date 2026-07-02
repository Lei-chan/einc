import { Collection, Collections } from "@/app/lib/config/types/others";
import dbConnect from "@/app/lib/database";
import User from "@/app/lib/models/User";
import { test, expect } from "@playwright/test";
import { ObjectId } from "mongoose";

const email = process.env.TEST_EMAIL || "";
const languagePath = process.env.TEST_LANGUAGE_PATH || "";

test.describe("main", async () => {
  test.use({ storageState: "playwright/.auth/.user.json" });

  test.describe("navigation", () => {
    test("navigate to dictionary", async ({ page }) => {
      await page.goto(`${languagePath}/main`);

      const dictionaryUrl = `${languagePath}/dictionary`;

      await Promise.all([
        page.waitForURL(dictionaryUrl),
        page.getByText(languagePath === "/en" ? "Dictionary" : "辞書").click(),
      ]);

      await expect(page).toHaveURL(dictionaryUrl);
    });

    test("navigate to add", async ({ page }) => {
      await page.goto(`${languagePath}/main`);
      const addUrl = `${languagePath}/add`;

      await Promise.all([
        page.waitForURL(addUrl),
        page.getByText(languagePath === "/en" ? "Add" : "追加").click(),
      ]);

      await expect(page).toHaveURL(addUrl);
    });

    test("navigate to account", async ({ page }) => {
      await page.goto(`${languagePath}/main`);
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
      await page.goto(`${languagePath}/main`);

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

      page.screenshot({ path: "screenshot.png" });
      await button.waitFor();

      await Promise.all([page.waitForURL(collectionUrl), button.click()]);

      await expect(page).toHaveURL(collectionUrl);
    });

    // check next time!
    test("logout", async ({ page }) => {
      await Promise.all([
        page.waitForURL(languagePath),
        page
          .getByText(languagePath === "/en" ? "Logout" : "ログアウト")
          .click(),
      ]);

      expect(page).toHaveURL(languagePath);
    });
  });

  // Later!!
  // Sometimes work but sometimes doesn't work
  test("create new collection", async ({ page }) => {
    await page.goto(`${languagePath}/main`);

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
