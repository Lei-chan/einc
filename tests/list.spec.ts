import { test, expect } from "@playwright/test";

const languagePath = process.env.TEST_LANGUAGE_PATH || "";
const searchWord = "apple";
// toggle wordToUpdate and wordAfterUpdate after every time you test "update word data"
const wordToUpdate = "mango";
const wordAfterUpdate = "cherry";
// change or create wordToDelete after every time you test list deletion
const wordToDelete = "banana";

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
    await page.locator("[type=search]").fill(searchWord);
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

  test.describe("test with search", () => {
    test.beforeEach(async ({ page }) => {
      // search for seachWord => check if searched word appears
      await page.locator("input[type=search]").fill(searchWord);
      await page.locator("button[type=submit]").click();

      await page.waitForTimeout(7000); // wait for the result to come up
    });

    test("turn word card", async ({ page }) => {
      const wordCard = page.getByTestId("wordCard").first();
      await expect(wordCard).toHaveText(searchWord);

      // click to turn the first word card to show definitions
      const clickPosition = { position: { x: 3, y: 3 } };
      await wordCard.click(clickPosition);

      await expect(
        page.getByText(languagePath === "/en" ? "Definitions" : "意味"),
      ).toBeVisible();

      // click to turn the first word card to show examples
      await wordCard.click(clickPosition);
      await expect(
        page.getByText(languagePath === "/en" ? "Examples" : "例文"),
      ).toBeVisible();

      // click to turn the first word card to go back to the word name
      await wordCard.click(clickPosition);
      await expect(page.getByText(searchWord)).toBeVisible();
    });

    test("toggle edit", async ({ page }) => {
      const wordCard = page.getByTestId("wordCard").first();
      expect(await wordCard.innerText()).toBe(searchWord);

      // toggle to editing form => check if edit form appears and the word name is displayed correctly in it
      const btnEdit = wordCard.getByTestId("btnEdit");
      await btnEdit.click();

      await page.screenshot({ path: "screenshot.png" });

      await expect(wordCard.getByTestId("form")).toBeVisible();
      expect(
        await wordCard
          .getByPlaceholder(languagePath === "/en" ? "word name" : "単語名")
          .inputValue(),
      ).toBe(searchWord);

      // toggle to go back to the word name
      await btnEdit.click();
      await expect(page.getByText(searchWord)).toBeVisible();
    });
  });

  test("list pagination", async ({ page }) => {
    // wait for the result to come up
    await page.waitForTimeout(7000);

    const totalNumberOfWordsStr = (
      await page.getByTestId("numberOfCards").innerText()
    ).split(" / ")[1]; // "(number of mached words) / (total number) words"
    const totalNumberOfWords = Number(totalNumberOfWordsStr.split(" ")[0]);

    if (totalNumberOfWords <= 20) {
      console.error("Please register more than 20 words to test pagination");
      return;
    }

    const firstWordFirstPage = page.getByTestId("wordCard").first();

    const paginationContainer = page.getByTestId("paginationContainer");
    const nextPageBtn = paginationContainer.getByText("2");
    await expect(paginationContainer).toBeVisible();
    await expect(nextPageBtn).toBeVisible();

    await nextPageBtn.click();

    // wait for the new page to load
    await page.waitForTimeout(3000);

    // compare the first word on the first page and the first word on the second page
    await expect(firstWordFirstPage).not.toHaveText(
      await page.getByTestId("wordCard").first().innerText(),
    );

    const backPageBtn = paginationContainer.getByText("1");
    await expect(backPageBtn).toBeVisible();
    await backPageBtn.click();

    // wait for the new page to load
    await page.waitForTimeout(3000);

    await expect(nextPageBtn).toBeVisible();
    // expect the first word is the same as the stored first word on the first page
    await expect(page.getByTestId("wordCard").first()).toHaveText(
      await firstWordFirstPage.innerText(),
    );
  });

  test("list selector", async ({ page }) => {
    // click select button
    const btnSelect = page.getByTestId("btnSelectAndFinish");

    await expect(btnSelect).toHaveText(
      languagePath === "/en" ? "Select" : "選択",
    );
    await btnSelect.click();

    // check select button text changes to 'Finish'
    await expect(page.getByTestId("btnSelectAndFinish")).toHaveText(
      languagePath === "/en" ? "Finish" : "終了",
    );

    // check if trash button and select all checkbox are visible
    const btnTrash = page.getByTestId("btnTrash");
    const selectAll = page.getByTestId("selectAll");
    await expect(btnTrash).toBeVisible();
    await expect(selectAll).toBeVisible();

    // check select all checkbox => check if all checkboxes are checked
    const checkboxSelectAll = selectAll.locator('input[type="checkbox"]');
    await checkboxSelectAll.check();

    await page.screenshot({ path: "screenshot1.png" });

    const allCheckboxes = await page.locator('input[type="checkbox"]').all();
    const boxesAreChecked = await Promise.all(
      allCheckboxes.map((box) => box.isChecked()),
    );
    boxesAreChecked.forEach((boolean) => expect(boolean).toBeTruthy());

    // uncheck select all checkbox => check if all checkboxes aren't checked
    await checkboxSelectAll.uncheck();

    const boxesAreUnchecked = await Promise.all(
      allCheckboxes.map((box) => box.isChecked()),
    );
    boxesAreUnchecked.forEach((boolean) => expect(boolean).toBeFalsy());

    // try to check first word checkbox => check if it's checked
    const wordsContainer = page.getByTestId("wordsContainer");
    const firstWordCheckbox = wordsContainer
      .locator('input[type="checkbox"]')
      .first();
    await firstWordCheckbox.check();
    await expect(firstWordCheckbox).toBeChecked();

    // click trash button => check if confirmation page appears
    await btnTrash.click();
    const confirmation = page.getByTestId("confirmation");
    await expect(confirmation).toBeVisible();
    expect(await confirmation.innerText()).toContain("1");
    await expect(confirmation).toHaveText(
      languagePath === "/en" ? "words" : "単語",
    );

    // click close confirmation button => check if confirmation page disappears
    await page.getByTestId("btnX").click();
    await expect(confirmation).toBeHidden();

    // uncheck first word checkbox again => check if the checkbox is unchecked
    await firstWordCheckbox.uncheck();
    await expect(firstWordCheckbox).not.toBeChecked();
  });

  // test one browser at a time
  test("update word data", async ({ page }) => {
    // search word to update
    await page.locator("input[type=search]").fill(wordToUpdate);
    await page.locator("button[type=submit]").click();
    await page.waitForTimeout(7000); // wait for the result to come up

    // expct word to update is visibpe
    const firstWordCard = page.getByTestId("wordCard").first();
    await expect(firstWordCard).toHaveText(wordToUpdate);

    // click edit button on the first card, expect form appears
    const btnEdit = firstWordCard.getByTestId("btnEdit");
    await btnEdit.click();
    await expect(firstWordCard.getByTestId("form")).toBeVisible();

    // change the current word name to the new word name and submit to update
    await firstWordCard
      .getByPlaceholder(languagePath === "/en" ? "word name" : "単語名")
      .fill(wordAfterUpdate);
    await firstWordCard.locator('button[type="submit"]').click();
    await page.waitForTimeout(7000); // wait for the word to be updated

    // search the updated word name, expct the updated word name appears
    await page.locator("input[type=search]").fill(wordAfterUpdate);
    await page.locator("button[type=submit]").click();
    await page.waitForTimeout(7000); // wait for the result to come up

    await expect(page.getByText(wordAfterUpdate)).toBeVisible();
  });

  // test one browser at a time
  test("list deletion", async ({ page }) => {
    // search for word to delete => expect the first word is the word to delete
    await page.locator("input[type=search]").fill(wordToDelete);
    await page.locator("button[type=submit]").click();
    await page.waitForTimeout(7000); // wait for the result to come up

    const firstWordCard = page.getByTestId("wordCard").first();
    await expect(firstWordCard).toHaveText(wordToDelete);

    const numberOfMatchedWordsStr = (
      await page.getByTestId("numberOfCards").innerText()
    ).split(" / ")[1]; // "(number of mached words) / (total number) words"
    const numberOfMatchedWords = Number(numberOfMatchedWordsStr.split(" ")[0]);

    // click select button
    await page.getByTestId("btnSelectAndFinish").click();

    // click checkbox of the word
    const wordsContainer = page.getByTestId("wordsContainer");
    await wordsContainer.locator('input[type="checkbox"]').first().click();

    // click delete button => check if confirmation appears
    await page.getByTestId("btnTrash").click();
    const confirmation = page.getByTestId("confirmation");
    await expect(confirmation).toBeVisible();

    // click OK button => check if confirmation page disappears and the deleted word disappears
    await page.getByTestId("btnDeleteWords").click();
    await page.waitForTimeout(7000); // wait for a while for the page to be updated
    await expect(confirmation).toBeHidden();

    if (numberOfMatchedWords === 1) {
      await expect(page.getByText(wordToDelete)).not.toBeVisible();

      await expect(
        page.getByText(
          languagePath === "/en"
            ? "No words found"
            : "単語が見つかりませんでした",
        ),
      ).toBeVisible();

      return;
    }

    // if numberOfMatched words were more than 1, expct displayed new number of matched words is less than original number of matched words
    const newNumberOfMatchedWordsStr = (
      await page.getByTestId("numberOfCards").innerText()
    ).split(" / ")[1];

    expect(Number(newNumberOfMatchedWordsStr.split(" ")[0])).toBeLessThan(
      numberOfMatchedWords,
    );
  });
});
