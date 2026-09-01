import { test, expect } from "@playwright/test";

const languagePath = process.env.TEST_LANGUAGE_PATH || "";
const journalText = "😊";

test.describe("journal page", () => {
  test.slow();
  test.use({ storageState: "playwright/.auth/.user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${languagePath}/main`);

    // go to collection "All" page
    const collectionAll = page.getByTestId("collection").first();
    await collectionAll.waitFor();
    await collectionAll.click();
    await page.waitForURL(
      languagePath === "/en" ? /\/en\/collection\/.+/ : /\/ja\/collection\/.+/,
      { timeout: 10000 },
    );

    // go to journal page
    await page
      .getByText(languagePath === "/en" ? "Journal" : "ジャーナル")
      .click();
    await page.waitForURL(
      languagePath === "/en"
        ? /\/en\/collection\/.+\/journal/
        : /\/ja\/collection\/.+\/journal/,
      { timeout: 10000 },
    );
  });

  test("journal go back to collection", async ({ page }) => {
    await page.getByTestId("btnGoBack").click();
    await expect(page).toHaveURL(
      languagePath === "/en" ? /\/en\/collection\/.+/ : /\/ja\/collection\/.+/,
      { timeout: 10000 },
    );
  });

  test("check date change", async ({ page }) => {
    // get today's date
    const today = new Date();
    const locale = languagePath.slice(1);

    // get date string for locale
    const dateStr = `${Intl.DateTimeFormat(locale).format(today)} (${Intl.DateTimeFormat(locale, { weekday: "short" }).format(today)})`;

    // expect the page to have the date string
    const dateP = page.getByTestId("date");
    await expect(dateP).toHaveText(dateStr);

    // click previous button to go to yesterday's journal
    const btnPrev = page.getByTestId("btnPrev");
    await btnPrev.click();

    // get yesterday's date string
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yesterdayStr = `${Intl.DateTimeFormat(locale).format(yesterday)} (${Intl.DateTimeFormat(locale, { weekday: "short" }).format(yesterday)})`;

    // expect button to go next day's journal and yesterday's date string are visible
    const btnNext = page.getByTestId("btnNext");

    await btnNext.waitFor();
    await dateP.waitFor();
    await expect(btnNext).toBeVisible();
    await expect(dateP).toHaveText(yesterdayStr);

    await btnNext.click();

    // expect the page to have the date string again
    await btnPrev.waitFor();
    await dateP.waitFor();
    await expect(btnPrev).toBeVisible();
    await expect(dateP).toHaveText(dateStr);
  });

  test("journal toggle dictionary", async ({ page }) => {
    // click open dictionary button
    const btnOpenDict = page.getByTestId("btnOpenDict");
    await btnOpenDict.click();

    // expect dictonary and button to close dictionary appear
    const dictionary = page.getByTestId("dictionary");
    const btnCloseDict = page.getByTestId("btnCloseDict");
    await dictionary.waitFor();
    await expect(dictionary).toBeVisible();
    await expect(btnCloseDict).toBeVisible();

    // click button to close dictionary
    await btnCloseDict.click();

    // wait for button to open dicitonary again, expect button to open dicitonary appears, and dictionary and button to close dictionary disappear
    await btnOpenDict.waitFor();
    await expect(btnOpenDict).toBeVisible();
    await expect(dictionary).toBeHidden();
    await expect(btnCloseDict).toBeHidden();
  });

  // one browser at a time by changing the journalText after every time you test it
  test("write journal", async ({ page }) => {
    // click previous button to go to yesterday's journal
    const btnPrev = page.getByTestId("btnPrev");
    const btnNext = page.getByTestId("btnNext");
    await btnPrev.click();

    await btnNext.waitFor();
    await expect(btnNext).toBeVisible();

    // fill textarea with journal text and unfocus it after the original journal in textarea is fetched
    const textarea = page.locator("textarea");
    await expect(textarea).not.toBeEmpty({ timeout: 5000 });
    await textarea.fill(journalText);
    await page.locator("h1").click();

    // click go back to previous page button to go to collection page
    await page.getByTestId("btnGoBack").click();
    await page.waitForURL(
      languagePath === "/en" ? /\/en\/collection\/.+/ : /\/ja\/collection\/.+/,
      { timeout: 10000 },
    );

    // go to journal page again
    await page.getByTestId("linkJournal").click();
    await page.waitForURL(
      languagePath === "/en"
        ? /\/en\/collection\/.+\/journal/
        : /\/ja\/collection\/.+\/journal/,
      { timeout: 10000 },
    );

    // go to yesterday's journal
    await btnPrev.waitFor();
    await btnPrev.click();

    // expect the added journal text is stored correctly
    await btnNext.waitFor();
    await expect(textarea).toHaveValue(journalText, { timeout: 10000 });
  });
});
