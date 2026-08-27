import { FLASHCARD_QUIZ_ONE_TURN } from "@/app/lib/config/settings";
import { test, expect } from "@playwright/test";

const languagePath = process.env.TEST_LANGUAGE_PATH || "";

test.describe("flashcard page", () => {
  test.slow();
  test.use({ storageState: "playwright/.auth/.user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${languagePath}/main`);
    await page.waitForTimeout(10000);

    // go to collection "All" page
    await page.getByTestId("collection").first().click();

    await page.waitForURL(
      languagePath === "/en" ? /\/en\/collection\/.+/ : /\/ja\/collection\/.+/,
      { timeout: 10000 },
    );

    // go to list page
    await page
      .getByText(languagePath === "/en" ? "Flashcard" : "暗記帳")
      .click();
    await page.waitForURL(
      languagePath === "/en"
        ? /\/en\/collection\/.+\/flashcard/
        : /\/ja\/collection\/.+\/flashcard/,
      { timeout: 10000 },
    );
  });

  test("flashcard pagination", async ({ page }) => {
    // get remaining words
    const remainingWords = page.getByTestId("remainingWords"); // innerText is (number of completed words) / (total number of words)

    // expect total number of flashcard words is equal or less than decided number of flashcards one turn
    expect(
      Number((await remainingWords.innerText()).split(" / ")[1]),
    ).toBeLessThanOrEqual(FLASHCARD_QUIZ_ONE_TURN);

    // click next button => expect the completed words increased to 2
    const paginationContainer = page.getByTestId("paginationContainer");
    await paginationContainer.getByText("→").click();

    await page.waitForTimeout(3000); // wait for the page to update

    await page.screenshot({ path: "screenshot.png" });

    expect(Number((await remainingWords.innerText()).split(" / ")[0])).toBe(2);

    // click go back button => expect the completed words went back to 1
    await paginationContainer.getByText("←").click();
    await page.waitForTimeout(3000); // wait for the page to update
    expect(Number((await remainingWords.innerText()).split(" / ")[0])).toBe(1);
  });

  test("flashcard go back to collection", async ({ page }) => {
    await page.getByText(languagePath === "/en" ? "Exit" : "終了").click();

    await expect(page).toHaveURL(
      languagePath === "/en" ? /\/en\/collection\/.+/ : /\/ja\/collection\/.+/,
      { timeout: 10000 },
    );
  });

  test("toggle flashcard", async ({ page }) => {
    const wordCard = page.getByTestId("wordCard");
    const wordName = await wordCard.innerText();

    const clickPosition = { position: { x: 3, y: 3 } };
    await wordCard.click(clickPosition);

    await expect(wordCard).toContainText(
      languagePath === "/en" ? "Definitions" : "意味",
    );

    // click to turn the first word card to show examples
    await wordCard.click(clickPosition);
    await expect(wordCard).toContainText(
      languagePath === "/en" ? "Examples" : "例文",
    );

    // click to turn the first word card to go back to the word name
    await wordCard.click(clickPosition);
    await expect(wordCard).toHaveText(wordName);
  });

  test("renew flashcards", async ({ page }) => {
    // store the first word name
    const wordCard = page.getByTestId("wordCard");
    const originalWordName = await wordCard.innerText();

    // get remaining words
    const remainingWords = page.getByTestId("remainingWords"); // innerText is (number of completed words) / (total number of words)

    // click next button until amount of completed words reachs to the decided maximum number of flashcards per one turn
    while (
      Number((await remainingWords.innerText()).split(" / ")[0]) <
      FLASHCARD_QUIZ_ONE_TURN
    ) {
      await page.getByTestId("paginationContainer").getByText("→").click();

      await page.waitForTimeout(3000); // wait for the page to update
    }

    // click the next session button => expect the first word name is different from the one of the last session
    await page
      .getByText(
        languagePath === "/en" ? "Go to next session" : "次のセッションへ",
      )
      .click();

    await expect(wordCard).not.toHaveText(originalWordName, { timeout: 10000 });
  });
});
