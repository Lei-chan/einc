import { test, expect } from "@playwright/test";

const languagePath = process.env.TEST_LANGUAGE_PATH || "";
const searchWord = "apple";

// From here!!
test.describe("list page", () => {
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

    // go to list page
    await page.getByText(languagePath === "/en" ? "List" : "リスト").click();
    await page.waitForURL(
      languagePath === "/en" ? /\/en\/collection\/.+/ : /\/ja\/collection\/.+/,
      { timeout: 10000 },
    );
  });

  test("list word search", async ({ page }) => {
    await page.fill("[type=search]", searchWord);
    await page.locator("[type=submit]").click();

    // wait for the result to come up
    await page.waitForTimeout(7000);

    const numberOfWords = await page.getByText(searchWord).count();
    const displayedNumberOfWords = Number(
      (await page.getByTestId("numberOfCards").innerText()).split(" / ")[0],
    ); // "(number of mached words) / (total number)"

    expect(numberOfWords).toBeGreaterThanOrEqual(1); // It should hit more than 1
    expect(displayedNumberOfWords).toBe(numberOfWords); //displayed number of matched words should be equals to the counted number of words
  });

  test("turn word card and toggle edit", async ({ page }) => {
    await page.fill("[type=search]", searchWord);
    await page.locator("[type=submit]").click();
    // wait for the result to come up
    await page.waitForTimeout(7000);

    const wordCards = page.getByText(searchWord);
    await expect(wordCards).toBeVisible();

    const firstWordCard = wordCards.first();

    // click to turn the card to show definitions
    await firstWordCard.click();
    expect(page.getByText(languagePath === "/en" ? "Definitions" : "意味"));

    // click to turn the card to show examples
    await firstWordCard.click();
    expect(page.getByText(languagePath === "/en" ? "Examples" : "例文"));

    // click to turn the card to go back to the word name
    await firstWordCard.click();
    expect(page.getByText(searchWord)).toBeVisible();

    const btnEdit = firstWordCard.getByRole("button", { name: "btnEdit" });
    // toggle to editing form
    await btnEdit.click();
    await expect(firstWordCard.getByRole("form")).toBeVisible();

    // toggle to go back to the word name
    await btnEdit.click();
    await expect(page.getByText(searchWord)).toBeVisible();
  });
});
