import { FLASHCARD_QUIZ_ONE_TURN } from "@/app/lib/config/settings";
import { test, expect } from "@playwright/test";

const languagePath = process.env.TEST_LANGUAGE_PATH || "";
const correctAnswer = "test";

test.describe("quiz page", () => {
  test.slow();
  test.use({ storageState: "playwright/.auth/.user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${languagePath}/main`);
    // wait for the page to load
    await page.waitForTimeout(10000);

    // go to collection "Test" page
    await page.getByTestId("collection").filter({ hasText: "Test" }).click();
    await page.waitForURL(
      languagePath === "/en" ? /\/en\/collection\/.+/ : /\/ja\/collection\/.+/,
      { timeout: 10000 },
    );

    // go to quiz page
    await page.getByText(languagePath === "/en" ? "Quiz" : "クイズ").click();
    await page.waitForURL(
      languagePath === "/en"
        ? /\/en\/collection\/.+\/quiz/
        : /\/ja\/collection\/.+\/quiz/,
      { timeout: 10000 },
    );
  });

  test("back to previous page button", async ({ page }) => {
    // click go back to previous page button => expect it navigates to collection page
    await page.getByTestId("btnGoBack").click();
    await expect(page).toHaveURL(
      languagePath === "/en" ? /\/en\/collection\/.+/ : /\/ja\/collection\/.+/,
      { timeout: 10000 },
    );
  });

  test("check if number of completed words increases", async ({ page }) => {
    await page.locator('button[type="submit"]').click();

    const numberOfWords = page.getByTestId("numberOfWords"); // innerText is (number of completed words) / (total number of quiz in this turn)
    const numberOfWordsText = (await numberOfWords.innerText()).split(" / ");
    const numberOfCompletedQuiz = Number(numberOfWordsText[0]);
    const totalNumberOfQuiz = Number(numberOfWordsText[1]);

    expect(totalNumberOfQuiz).toBeLessThanOrEqual(FLASHCARD_QUIZ_ONE_TURN);

    // if it's the last quiz => do nothing
    if (numberOfCompletedQuiz === totalNumberOfQuiz) {
      console.log(
        "Please add more words to check if number of completed words increases",
      );
      return;
    }

    await page.getByTestId("btnNext").click();

    await page.waitForTimeout(3000); // wait for the page to load

    expect(
      Number((await numberOfWords.innerText()).split(" / ")[0]),
    ).toBeGreaterThan(numberOfCompletedQuiz);
  });

  test("empty answer", async ({ page }) => {
    // click submit button
    await page.locator('button[type="submit"]').click();

    // expect test "Wrong", cross image, mark as correct, and next button are displayed
    await expect(page.getByTestId("quizResult")).toContainText(
      languagePath === "/en" ? "Wrong" : "不正解",
    );
    console.log(await page.getByTestId("imgBackground").getAttribute("src"));
    expect(
      await page.getByTestId("imgBackground").getAttribute("src"),
    ).toContain("cross");
    await expect(page.getByTestId("btnMarkCorrect")).toBeVisible();
    await expect(page.getByTestId("btnNext")).toBeVisible();
  });

  test("quiz incorrect answer", async ({ page }) => {
    // fill textarea or input with wrong answer and submit
    await page
      .getByPlaceholder(
        languagePath === "/en" ? "Your answer here" : "答えを入力",
      )
      .fill("!");
    await page.locator('button[type="submit"]').click();

    // expect test "Wrong", cross image, mark as correct, and next button are displayed
    const quizResult = page.getByTestId("quizResult");
    await expect(quizResult).toContainText(
      languagePath === "/en" ? "Wrong" : "不正解",
    );
    expect(
      await page.getByTestId("imgBackground").getAttribute("src"),
    ).toContain("cross");

    const btnMarkCorrect = page.getByTestId("btnMarkCorrect");
    const btnNext = page.getByTestId("btnNext");
    await expect(btnMarkCorrect).toBeVisible();
    await expect(btnNext).toBeVisible();

    // click mark as correct button
    await btnMarkCorrect.click();

    // expect test "Correct", circle image, mark as wrong, and next button are displayed
    await expect(page.getByTestId("quizResult")).toContainText(
      languagePath === "/en" ? "Correct" : "正解",
    );
    expect(
      await page.getByTestId("imgBackground").getAttribute("src"),
    ).toContain("circle");

    const btnMarkWrong = page.getByTestId("btnMarkWrong");
    await expect(btnMarkWrong).toBeVisible();
    await expect(btnNext).toBeVisible();

    // click mark as wrong button
    await btnMarkWrong.click();

    // expect test "Wrong", cross image, mark as correct, and next button are displayed again
    await expect(quizResult).toContainText(
      languagePath === "/en" ? "Wrong" : "不正解",
    );
    expect(
      await page.getByTestId("imgBackground").getAttribute("src"),
    ).toContain("cross");
    await expect(btnMarkCorrect).toBeVisible();
    await expect(btnNext).toBeVisible();
  });

  test("quiz correct answer", async ({ page }) => {
    // fill textarea/input with correct answer and submit
    await page.getByTestId("textbox").fill(correctAnswer);
    await page.locator('button[type="submit"]').click();

    // expect test "Correct", circle image, mark as wrong, and next button are displayed
    await expect(page.getByTestId("quizResult")).toContainText(
      languagePath === "/en" ? "Correct" : "正解",
    );
    expect(
      await page.getByTestId("imgBackground").getAttribute("src"),
    ).toContain("circle");
    await expect(page.getByTestId("btnMarkWrong")).toBeVisible();
    await expect(page.getByTestId("btnNext")).toBeVisible();
  });

  test("quiz finish", async ({ page }) => {
    // store total number of quiz
    const numberOfWords = page.getByTestId("numberOfWords"); // innerText is (number of completed words) / (total number of quiz in this turn)
    const totalNumberOfQuiz = Number(
      (await numberOfWords.innerText()).split(" / ")[1],
    );

    // while number of completed quiz is less than the total number of quiz, keep going
    const btnSubmit = page.locator('button[type="submit"]');

    while (
      Number((await numberOfWords.innerText()).split(" / ")[0]) <
      totalNumberOfQuiz
    ) {
      await btnSubmit.waitFor();
      await btnSubmit.click();

      const btnNext = page.getByTestId("btnNext");
      await btnNext.waitFor();
      await btnNext.click();
      await page.waitForTimeout(3000); // wait for the page to load
    }

    await btnSubmit.click();

    expect(Number((await numberOfWords.innerText()).split(" / ")[0])).toBe(
      totalNumberOfQuiz,
    );
    const linkFinish = page.getByTestId("linkFinish");
    await expect(linkFinish).toBeVisible();

    await linkFinish.click();
    await expect(page).toHaveURL(
      languagePath === "/en" ? /\/en\/collection\/.+/ : /\/ja\/collection\/.+/,
      { timeout: 10000 },
    );
  });
});
