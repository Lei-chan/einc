import { test, expect } from "@playwright/test";

const languagePath = process.env.TEST_LANGUAGE_PATH || "";
const searchWord = "apple";
const wordToUpdate = "mango";
const wordAfterUpdate = "cherry";
const wordToDelete = "banana";

// test from here!
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
    // search for seachWord => check if searched word appears
    await page.fill("[type=search]", searchWord);
    await page.locator("[type=submit]").click();

    await page.waitForTimeout(7000); // wait for the result to come up

    const wordCards = page.getByText(searchWord);
    await expect(wordCards).toBeVisible();

    // click to turn the first word card to show definitions
    const firstWordCard = wordCards.first();
    await firstWordCard.click();
    expect(page.getByText(languagePath === "/en" ? "Definitions" : "意味"));

    // click to turn the first word card to show examples
    await firstWordCard.click();
    expect(page.getByText(languagePath === "/en" ? "Examples" : "例文"));

    // click to turn the first word card to go back to the word name
    await firstWordCard.click();
    expect(page.getByText(searchWord)).toBeVisible();

    // toggle to editing form => check if edit form appears and the word name is displayed correctly in it
    const btnEdit = firstWordCard.getByRole("button", { name: "btnEdit" });
    await btnEdit.click();
    await expect(firstWordCard.getByRole("form")).toBeVisible();
    expect(
      await firstWordCard
        .getByPlaceholder(languagePath === "/en" ? "word name" : "単語名")
        .textContent(),
    ).toBe(searchWord);

    // toggle to go back to the word name
    await btnEdit.click();
    await expect(page.getByText(searchWord)).toBeVisible();
  });

  test("update word data", async ({ page }) => {
    await page.fill("[type=search]", wordToUpdate);
    await page.locator("[type=submit]").click();
    // wait for the result to come up
    await page.waitForTimeout(7000);

    const wordCards = page.getByText(wordToUpdate);
    await expect(wordCards).toBeVisible();

    const firstWordCard = wordCards.first();
    const btnEdit = firstWordCard.getByRole("button", { name: "btnEdit" });

    // toggle to editing form
    await btnEdit.click();
    await expect(firstWordCard.getByRole("form")).toBeVisible();

    await firstWordCard
      .getByPlaceholder(languagePath === "/en" ? "word name" : "単語名")
      .fill(wordAfterUpdate);

    await firstWordCard.getByRole("button", { name: "btnSubmit" }).click();

    // wait for the word to be updated
    await page.waitForTimeout(7000);

    await page.fill("[type=search]", wordAfterUpdate);
    await page.locator("[type=submit]").click();
    // wait for the result to come up
    await page.waitForTimeout(7000);

    expect(page.getByText(wordAfterUpdate)).toBeVisible();

    await page.screenshot({ path: "screenshot.png" });
  });

  test("list pagination", async ({ page }) => {
    // wait for the result to come up
    await page.waitForTimeout(7000);

    const totalNumberOfWords = Number(
      (await page.getByTestId("numberOfCards").innerText()).split(" / ")[1],
    ); // "(number of mached words) / (total number)"

    if (totalNumberOfWords <= 20) {
      console.error("Please register more than 20 words to test pagination");
      return;
    }

    const firstWordFirstPage = await page
      .getByTestId("wordCard")
      .first()
      .innerText();

    const paginationContainer = page.getByTestId("paginationContainer");
    const nextPageBtn = paginationContainer.getByText("2");
    expect(paginationContainer).toBeVisible();
    expect(nextPageBtn).toBeVisible();

    await nextPageBtn.click();

    // compare the first word on the first page and the first word on the second page
    expect(firstWordFirstPage).not.toEqual(
      await page.getByTestId("wordCard").first().innerText(),
    );

    const backPageBtn = paginationContainer.getByText("1");
    expect(backPageBtn).toBeVisible();
    await backPageBtn.click();

    expect(nextPageBtn).toBeVisible();
    // expect the first word is the same as the stored first word on the first page
    expect(await page.getByTestId("wordCard").first().innerText()).toEqual(
      firstWordFirstPage,
    );
  });

  test("list selector", async ({ page }) => {
    // click select button
    const btnSelect = page.getByRole("button", { name: "btnSelectAndFinish" });
    expect(await btnSelect.innerText()).toBe(
      languagePath === "/en" ? "Select" : "選択",
    );
    await btnSelect.click();

    // check select button text changes to 'Finish'
    expect(
      await page
        .getByRole("button", { name: "btnSelectAndFinish" })
        .innerText(),
    ).toBe(languagePath === "/en" ? "Finish" : "終了");

    // check if trash button and select all checkbox are visible
    const btnTrash = page.getByRole("button", { name: "btnTrash" });
    const selectAll = page.getByTestId("selectAll");
    expect(btnTrash).toBeVisible();
    expect(selectAll).toBeVisible();

    // check select all checkbox => check if all checkboxes are checked
    const checkboxSelectAll = selectAll.locator('input[type="checkbox"]');
    await checkboxSelectAll.check();
    (await page.locator('input[type="checkbox"]').all()).forEach((box) =>
      expect(box.isChecked).toBeTruthy(),
    );

    // uncheck select all checkbox => check if all checkboxes aren't checked
    await checkboxSelectAll.check();
    (await page.locator('input[type="checkbox"]').all()).forEach((box) =>
      expect(box.isChecked).toBeFalsy(),
    );

    // try to check first word checkbox => check if it's checked
    const wordsContainer = page.getByTestId("wordsContainer");
    const firstWordCheckbox = wordsContainer
      .locator('input[type="checkbox"]')
      .first();
    await firstWordCheckbox.check();
    expect(firstWordCheckbox.isChecked).toBeTruthy();

    // click trash button => check if confirmation page appears
    await btnTrash.click();
    const confirmation = page.getByTestId("confirmation");
    expect(confirmation).toBeVisible();
    expect(await confirmation.innerText()).toContain("1");
    expect(await confirmation.innerText()).toContain(
      languagePath === "/en" ? "words" : "単語",
    );

    // click close confirmation button => check if confirmation page disappears
    await page.getByRole("button", { name: "btnX" }).click();
    expect(confirmation).not.toBeVisible();

    // check first word checkbox again => check if the checkbox is unchecked
    await firstWordCheckbox.check();
    expect(firstWordCheckbox.isChecked).toBeFalsy();
  });

  test("list deletion", async ({ page }) => {
    // search for word to delete
    await page.fill("[type=search]", wordToDelete);
    await page.locator("[type=submit]").click();
    await page.waitForTimeout(7000); // wait for the result to come up
    expect(page.getByText(wordToDelete)).toBeVisible();

    const numberOfMatchedWords = Number(
      (await page.getByTestId("numberOfCards").innerText()).split(" / ")[1],
    ); // "(number of mached words) / (total number)"

    // click select button
    await page.getByRole("button", { name: "btnSelectAndFinish" }).click();

    // click checkbox of the word
    await page.locator('input[type="checkbox"]').first().click();

    // click delete button => check if confirmation appears
    await page.getByRole("button", { name: "btnTrash" }).click();
    const confirmation = page.getByTestId("confirmation");
    expect(confirmation).toBeVisible();

    // click OK button and wait for a while for the page to be updated => check if confirmation page disappears, the deleted word disappears, and the number of matched words decreases
    await page.getByRole("button", { name: "btnDeleteWords" }).click();
    await page.waitForTimeout(7000);
    expect(confirmation).not.toBeVisible();
    expect(page.getByText(wordToDelete)).not.toBeVisible();
    expect(
      Number(
        (await page.getByTestId("numberOfCards").innerText()).split(" / ")[1],
      ),
    ).toBeLessThan(numberOfMatchedWords);
  });
});
