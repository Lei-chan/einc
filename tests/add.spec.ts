import { test, expect } from "@playwright/test";

const languagePath = process.env.TEST_LANGUAGE_PATH || "";

// Next!!
test.describe("add", () => {
  test.use({ storageState: "playwright/.auth/.user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${languagePath}/add`);
  });

  test.describe("registerManually", () => {
    test.beforeEach(async ({ page }) => {
      const collectionId = await page.evaluate(() =>
        window.location.hash.slice(1),
      );

      const url = `${languagePath}/add/manually#${collectionId}`;

      await page.getByTestId("linkRegisterManually").click();
      await page.waitForURL(url);
      await expect(page).toHaveURL(url);
    });

    test("increase register cards", async ({ page }) => {
      const originalNumberRegisterCards = page
        .getByTestId("registerCards")
        .count();

      await page.getByTestId("btnPlus").click();

      expect(originalNumberRegisterCards).toBeLessThan(
        await page.getByTestId("registerCards").count(),
      );
    });

    test("decrease register cards", async ({ page }) => {
      const originalNumberRegisterCards = page
        .getByTestId("registerCards")
        .count();

      await page.getByTestId("btnX").click();

      expect(originalNumberRegisterCards).toBeGreaterThan(
        await page.getByTestId("RegisterCards").count(),
      );
    });

    test.describe("add manually errors", () => {
      test("all blank", async ({ page }) => {
        await page.fill('[name="name 0"]', "");
        await page.fill('[name="definitions 0"]', "");
      });

      test("name blank", async ({ page }) => {
        await page.fill('[name="name 0"]', "");
        await page.fill('[name="definitions 0"]', "S");
      });

      test("definitions blank", async ({ page }) => {
        await page.fill('[name="name 0"]', "S");
        await page.fill('[name="definitions 0"]', "");
      });

      test.afterEach(async ({ page }) => {
        await page.locator("[type=submit]").click();
        await expect(page.getByTestId("error")).toBeVisible();
      });
    });

    test("add successfully", async ({ page }) => {
      await page.getByTestId("btnX").click();

      // first word
      await page.fill('[name="name 0"]', "S");
      await page.fill('[name="definitions 0"]', "S");

      // second word
      await page.fill('[name="name 0"]', "S");
      await page.fill('[name="definitions 0"]', "S");

      await page.locator("[type=submit]").click();

      const url = `${languagePath}/main`;
      await page.waitForURL(url);
      await expect(page).toHaveURL(url);

      const collectionUrl = `${languagePath}/collection**`;
      await page
        .getByText(languagePath === "/en" ? "All" : "全て")
        .click({ timeout: 5000 });

      await page.waitForURL(collectionUrl);
      await expect(page).toHaveURL(collectionUrl);

      const collectionId = await page.evaluate(() => {
        console.log(window.location.pathname);
        return window.location.pathname.at(-1);
      });

      console.log(collectionId);
      const listUrl = `${languagePath}/${collectionId}/list`;

      await page.getByText(languagePath === "/en" ? "List" : "リスト").click();

      await expect(page).toHaveURL(listUrl);

      await page.fill("[type=search]", "S");
      await page.locator("[type=submit]").click();

      expect(await page.getByTestId("wordCard").count()).toBe(2);
    });
  });

  test("registerDictionary", async ({ page }) => {
    const collectionId = await page.evaluate(() =>
      window.location.hash.slice(1),
    );
    const dictionaryUrl = `${languagePath}/dictionary#${collectionId}`;

    await page.getByTestId("linkRegisterDictionary").click();

    await page.waitForURL(dictionaryUrl);
    await expect(page).toHaveURL(dictionaryUrl);

    // search word by dictionary
    await page.getByTestId("searchLanguage").selectOption("en");
    await page.getByTestId("dictionaryLanguage").selectOption("en");
    await page.getByTestId("inputSearch").fill("apple");
    await page.click('button[type="submit"]');

    const ulDictionary = page.getByTestId("ulDictionary");
    await ulDictionary.waitFor();

    const firstWord = page.getByTestId("closedWord").first();
    await firstWord.click();

    const openedWord = page.getByTestId("openedWord");
    await openedWord.waitFor();

    // redirect to main
    const mainUrl = `${languagePath}/main`;
    await page.waitForURL(mainUrl);
    await expect(page).toHaveURL(mainUrl);

    // check if new word was added successfully
    const collectionUrl = `${languagePath}/collection**`;
    await page
      .getByText(languagePath === "/en" ? "All" : "全て")
      .click({ timeout: 5000 });

    await page.waitForURL(collectionUrl);
    await expect(page).toHaveURL(collectionUrl);

    const newCollectionId = await page.evaluate(() => {
      console.log(window.location.pathname);
      return window.location.pathname.at(-1);
    });

    console.log(newCollectionId);

    const listUrl = `${languagePath}/${newCollectionId}/list`;
    await page.getByText(languagePath === "/en" ? "List" : "リスト").click();

    await expect(page).toHaveURL(listUrl);

    await page.fill("[type=search]", "apple");
    await page.locator("[type=submit]").click();

    expect(await page.getByTestId("wordCard").count()).toBe(1);
  });
});
