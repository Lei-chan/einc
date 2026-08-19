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

      await button.waitFor();

      await Promise.all([page.waitForURL(collectionUrl), button.click()]);

      await expect(page).toHaveURL(collectionUrl);
    });

    test("logout", async ({ page, context }) => {
      await page.goto(`${languagePath}/main`);
      // wait for the contents to load
      await page.waitForTimeout(5000);

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
