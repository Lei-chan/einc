import { test, expect } from "@playwright/test";
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

  test.describe("search", () => {
    test("searchEnglishByEnglish", async ({ page }) => {
      await page.getByTestId("searchLanguage").selectOption("en");
      await page.getByTestId("dictionaryLanguage").selectOption("en");

      await page.getByTestId("inputSearch").fill("apple");
    });

    // later!
    // only webkit fails (maybe because of the translation api limitation?)
    test("searchEnglishByJapanese", async ({ page }) => {
      await page.getByTestId("searchLanguage").selectOption("ja");
      await page.getByTestId("dictionaryLanguage").selectOption("en");

      await page.getByTestId("inputSearch").fill("りんご");
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

  test("add word", async ({ page }) => {
    await page.getByTestId("searchLanguage").selectOption("en");
    await page.getByTestId("dictionaryLanguage").selectOption("en");
    await page.getByTestId("inputSearch").fill("banana");
    await page.click('button[type="submit"]');

    await page.getByTestId("ulDictionary").waitFor();
    await page.getByTestId("closedWord").first().click();
    await page.getByTestId("openedWord").waitFor();

    const url = new URLPattern({ pathname: `${languagePath}/add-to*` });
    await Promise.all([
      page.waitForURL(url),
      page.getByTestId("buttonAdd").click(),
    ]);

    expect(page).toHaveURL(url);

    const mainUrl = `${languagePath}/main`;
    await Promise.all([
      page.waitForURL(mainUrl),
      page.getByText(languagePath === "/en" ? "All" : "全て").click(),
    ]);

    await expect(page).toHaveURL(mainUrl);

    // check if new word was added successfully
    const collectionUrl = `${languagePath}/collection/123`;
    const button = page.getByText(languagePath === "/en" ? "All" : "全て");
    await button.waitFor();

    await Promise.all([page.waitForURL(collectionUrl), button.click()]);

    await expect(page).toHaveURL(collectionUrl);

    const listUrl = `${collectionUrl}/list`;
    await Promise.all([
      await expect(page).toHaveURL(listUrl),
      page.getByText(languagePath === "/en" ? "List" : "リスト").click(),
    ]);

    await expect(page).toHaveURL(listUrl);

    await page.fill("[type=search]", "banana");
    await page.locator("[type=submit]").click();

    expect(await page.getByTestId("wordCard").count()).toBe(1);
  });
});
