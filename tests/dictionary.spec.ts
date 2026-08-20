import { test, expect } from "@playwright/test";

// adding word via dictionary test is in add.spec.ts

const languagePath = process.env.TEST_LANGUAGE_PATH || "";

test.describe("dictionary", () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto(`${languagePath}/dictionary`);
  });

  test("languageSelection", async ({ page }) => {
    await expect(page.getByTestId("searchLanguage")).toBeEditable();
    await expect(page.getByTestId("dictionaryLanguage")).toBeEditable();
  });

  test.describe("search without translation API", () => {
    test("searchEnglishByEnglish", async ({ page }) => {
      await page.getByTestId("searchLanguage").selectOption("en");
      await page.getByTestId("dictionaryLanguage").selectOption("en");

      await page.getByTestId("inputSearch").fill("apple");
    });

    test("searchJapaneseByJapanese", async ({ page }) => {
      await page.getByTestId("searchLanguage").selectOption("ja");
      await page.getByTestId("dictionaryLanguage").selectOption("ja");

      await page.getByTestId("inputSearch").fill("例");
    });

    test("searchJapaneseByEnglish", async ({ page }) => {
      await page.getByTestId("searchLanguage").selectOption("en");
      await page.getByTestId("dictionaryLanguage").selectOption("ja");

      await page.getByTestId("inputSearch").fill("example");
    });

    test.afterEach(async ({ page }) => {
      test.use({ storageState: "playwright/.auth/user.json" });

      await page.click('button[type="submit"]');

      const ulDictionary = page.getByTestId("ulDictionary");
      // page.screenshot({ path: "screenshot.png" });
      await ulDictionary.waitFor();
      expect(ulDictionary).toBeVisible();

      const firstWord = page.getByTestId("closedWord").first();
      await firstWord.click();

      const openedWord = page.getByTestId("openedWord");
      await openedWord.waitFor();
      expect(openedWord).toBeVisible();

      const audio = page.getByTestId("buttonAudio");

      if (await audio.isVisible()) {
        await audio.click();

        await page.waitForFunction(() => {
          // return new Promise((resolve) => {
          const audio = document.querySelector("audio");

          return audio && !audio.paused && audio.currentTime > 0;
        });
      }

      const url = new URLPattern({ pathname: `${languagePath}/add-to*` });

      await Promise.all([
        page.waitForURL(url),
        page.getByTestId("buttonAdd").click(),
      ]);

      expect(page).toHaveURL(url);
    });
  });

  // Check it!
  // only webkit fails (maybe because of the translation api limitation?)
  // took out from test.describe with other search tests
  test.describe("search with translation API", () => {
    // second worker process will start by retrying the failed test and continue from there.
    test.describe.configure({ retries: 2 });

    test("searchEnglishByJapanese", async ({ page }) => {
      test.slow(); //extend default timeout

      await page.getByTestId("searchLanguage").selectOption("ja");
      await page.getByTestId("dictionaryLanguage").selectOption("en");

      await page.getByTestId("inputSearch").fill("りんご");

      test.use({ storageState: "playwright/.auth/user.json" });

      await page.click('button[type="submit"]');

      const ulDictionary = page.getByTestId("ulDictionary");
      // Explicit generous timeout to absorb translation API latency,
      // instead of relying on the (shorter) shared default.
      await ulDictionary.waitFor({ timeout: 30_000 });
      await expect(ulDictionary).toBeVisible();

      const firstWord = page.getByTestId("closedWord").first();
      await firstWord.click();

      const openedWord = page.getByTestId("openedWord");
      await openedWord.waitFor();
      await expect(openedWord).toBeVisible();

      const audio = page.getByTestId("buttonAudio");

      if (await audio.isVisible()) {
        await audio.click();

        await page.waitForFunction(() => {
          const audio = document.querySelector("audio");
          return audio && !audio.paused && audio.currentTime > 0;
        });
      }

      const url = new URLPattern({ pathname: `${languagePath}/add-to*` });

      await Promise.all([
        page.waitForURL(url),
        page.getByTestId("buttonAdd").click(),
      ]);

      await expect(page).toHaveURL(url);
    });
  });
});
