import { test, expect } from "@playwright/test";

const languagePath = process.env.TEST_LANGUAGE_PATH || "";

test.describe("collection page", () => {
  test.slow();
  test.use({ storageState: "playwright/.auth/.user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${languagePath}/main`);
    // wait for the page to load
    await page.waitForTimeout(10000);

    // go to collection "All" page
    await page.getByTestId("collection").first().click();
    await page.waitForURL(
      languagePath === "/en" ? /\/en\/collection\/.+/ : /\/ja\/collection\/.+/,
      { timeout: 10000 },
    );
  });

  test.describe("collection navigation", () => {
    test("navigate to list", async ({ page }) => {
      const collectionId = await page.evaluate(() =>
        window.location.pathname.split("/").at(-1),
      );

      await page.getByText(languagePath === "/en" ? "List" : "リスト").click();
      await expect(page).toHaveURL(
        `${languagePath}/collection/${collectionId}/list`,
        { timeout: 10000 },
      );
    });

    test("navigate to flashcard", async ({ page }) => {
      const collectionId = await page.evaluate(() =>
        window.location.pathname.split("/").at(-1),
      );

      await page
        .getByText(languagePath === "/en" ? "Flashcard" : "暗記帳")
        .click();
      await expect(page).toHaveURL(
        `${languagePath}/collection/${collectionId}/flashcard`,
        { timeout: 10000 },
      );
    });

    test("navigate to quiz", async ({ page }) => {
      const collectionId = await page.evaluate(() =>
        window.location.pathname.split("/").at(-1),
      );

      await page.getByText(languagePath === "/en" ? "Quiz" : "クイズ").click();
      await expect(page).toHaveURL(
        `${languagePath}/collection/${collectionId}/quiz`,
        { timeout: 10000 },
      );
    });

    test("navigate to journal", async ({ page }) => {
      const collectionId = await page.evaluate(() =>
        window.location.pathname.split("/").at(-1),
      );

      await page
        .getByText(languagePath === "/en" ? "Journal" : "ジャーナル")
        .click();
      await expect(page).toHaveURL(
        `${languagePath}/collection/${collectionId}/journal`,
        { timeout: 10000 },
      );
    });
  });

  test("display graph", async ({ page }) => {
    await expect(page.getByTestId("pie")).toBeVisible({ timeout: 7000 });
  });
});
