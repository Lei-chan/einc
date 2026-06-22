import { test, expect } from "@playwright/test";

const languagePath = process.env.TEST_LANGUAGE_PATH || "";

test.describe("main", async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${languagePath}/main`);
  });

  test.describe("navigation", () => {
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
      const collectionUrl = `${languagePath}/collection/123`;
      const button = page.getByText(languagePath === "/en" ? "All" : "全て");

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
