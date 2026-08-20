import { test, expect } from "@playwright/test";

const languagePath = process.env.TEST_LANGUAGE_PATH || "";
// increase the number "Example Word (number)" every time you run test "register manually"
const newWordManually = "Example Word 8";
const newDefinitionManually = "Example Definition";
// change the word every time you run test "register dictionary"
// (used ones: apple, banana, mango, orange)
const newWordDictionary = "happy";

test.describe("add", () => {
  test.slow();
  test.use({ storageState: "playwright/.auth/.user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${languagePath}/add`);
  });

  test.describe("add navigation", () => {
    test("navigate to manual register page", async ({ page }) => {
      const collectionId = await page.evaluate(() =>
        window.location.hash.slice(1),
      );

      const baseUrl = `${languagePath}/add/manually`;

      await page.getByTestId("linkRegisterManually").click();
      // wait for the page to load
      await page.waitForTimeout(5000);
      await expect(page).toHaveURL((url) => {
        return (
          url.pathname === baseUrl ||
          url.pathname === `${baseUrl}#${collectionId}`
        );
      });
    });

    test("navigate to dictionary register page", async ({ page }) => {
      const collectionId = await page.evaluate(() =>
        window.location.hash.slice(1),
      );

      const baseUrl = `${languagePath}/dictionary`;

      await page.getByTestId("linkRegisterDictionary").click();

      await expect(page).toHaveURL(
        (url) =>
          url.pathname === baseUrl ||
          url.pathname === `${baseUrl}#${collectionId}`,
        { timeout: 5000 },
      );
    });
  });

  test.describe("register manually", () => {
    test.slow();

    test.beforeEach(async ({ page }) => {
      await page.goto(`${languagePath}/add/manually`);
      // wait for the page to load
      await page.waitForTimeout(5000);
    });

    test("increase register cards", async ({ page }) => {
      const originalNumberRegisterCard = await page
        .getByTestId("registerCard")
        .count();

      await page.getByTestId("btnPlus").click();

      expect(originalNumberRegisterCard).toBeLessThan(
        await page.getByTestId("registerCard").count(),
      );
    });

    test("decrease register cards", async ({ page }) => {
      const originalNumberRegisterCard = await page
        .getByTestId("registerCard")
        .count();

      await page.getByTestId("btnX").click();

      expect(originalNumberRegisterCard).toBeGreaterThan(
        await page.getByTestId("registerCard").count(),
      );
    });

    test.describe("add manually errors", () => {
      test("all blank", async ({ page }) => {
        await page.fill('[name="name 0"]', "");
        await page.fill('[name="definitions 0"]', "");
      });

      test("name blank", async ({ page }) => {
        await page.fill('[name="name 0"]', "");
        await page.fill('[name="definitions 0"]', newDefinitionManually);
      });

      test("definitions blank", async ({ page }) => {
        await page.fill('[name="name 0"]', newWordManually);
        await page.fill('[name="definitions 0"]', "");
      });

      test.afterEach(async ({ page }) => {
        await page.locator("[type=submit]").click();
        await expect(page.getByTestId("error")).toBeVisible();
      });
    });

    test("add successfully", async ({ page }) => {
      test.slow();
      await page.getByTestId("btnPlus").click();

      // first word
      await page.fill('[name="name 0"]', newWordManually);
      await page.fill('[name="definitions 0"]', newDefinitionManually);

      // second word
      await page.fill('[name="name 1"]', newWordManually);
      await page.fill('[name="definitions 1"]', newDefinitionManually);

      await page.locator("[type=submit]").click();

      await expect(page).toHaveURL(`${languagePath}/main`, { timeout: 10000 });
      await page.waitForTimeout(5000);

      await page
        .getByText(languagePath === "/en" ? "All" : "全て")
        .click({ timeout: 5000 });

      await expect(page).toHaveURL(
        languagePath === "/en"
          ? /\/en\/collection\/.+/
          : /\/ja\/collection\/.+/,
        { timeout: 7000 },
      );

      const collectionId = await page.evaluate(() =>
        window.location.pathname.split("/").at(-1),
      );

      await page.getByText(languagePath === "/en" ? "List" : "リスト").click();
      await expect(page).toHaveURL(
        `${languagePath}/collection/${collectionId}/list`,
      );

      await page.fill("[type=search]", newWordManually);
      await page.locator("[type=submit]").click();

      await page.waitForTimeout(7000);
      await page.screenshot({ path: "screenshot.png" });

      expect(await page.getByText(newWordManually).count()).toBe(2);
    });
  });

  test("register dictionary", async ({ page }) => {
    test.slow();

    await page.goto(`${languagePath}/main`);
    await page.waitForTimeout(10000);
    // await page.screenshot({ path: "screenshot.png" });

    await page.goto(`${languagePath}/dictionary`);
    // wait for the page to load
    await page.waitForTimeout(5000);

    // search word by dictionary
    await page.getByTestId("searchLanguage").selectOption("en");
    await page.getByTestId("dictionaryLanguage").selectOption("en");
    await page.getByTestId("inputSearch").fill(newWordDictionary);
    await page.click('button[type="submit"]');

    // wait for the result to come up
    await page.getByTestId("ulDictionary").waitFor({ timeout: 7000 });

    // click the first word
    await page.getByTestId("closedWord").first().click();
    // wait the first word to open
    await page.getByTestId("openedWord").waitFor({ timeout: 3000 });
    await page.getByTestId("buttonAdd").click();

    await page.waitForTimeout(3000);

    // redirect to add-to page
    await expect(page).toHaveURL(
      languagePath === "/en" ? /\/en\/add-to\?/ : /\/ja\/add-to\?/,
      { timeout: 10000 },
    );

    // click collection All on the add-to page
    await page.getByTestId("btnCheck").first().click();

    // redirect to dictionary
    await expect(page).toHaveURL(`${languagePath}/dictionary`, {
      timeout: 10000,
    });

    // check if new word was added successfully
    // navigate to main
    await page.goto(`${languagePath}/main`);
    // wait for the page to load
    await page.waitForTimeout(10000);

    // click collection All on the main page
    await page.getByTestId("collection").first().click({ timeout: 5000 });

    await expect(page).toHaveURL(
      languagePath === "/en" ? /\/en\/collection\/.+/ : /\/ja\/collection\/.+/,
      { timeout: 10000 },
    );

    const newCollectionId = await page.evaluate(() =>
      window.location.pathname.split("/").at(-1),
    );

    await page.getByText(languagePath === "/en" ? "List" : "リスト").click();
    await expect(page).toHaveURL(
      `${languagePath}/collection/${newCollectionId}/list`,
      { timeout: 7000 },
    );

    await page.fill("[type=search]", newWordDictionary);
    await page.locator("[type=submit]").click();

    // wait for the result to come up
    await page.waitForTimeout(7000);
    expect(await page.getByText(newWordDictionary).count()).toBe(1);
  });
});
