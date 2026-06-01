import { test, expect } from "@playwright/test";

const languagePath = process.env.TEST_LANGUAGE_PATH || "";
const password = process.env.TEST_PASSWORD || "";
const email = process.env.TEST_EMAIL || "";

//Error: locator.click: Test timeout of 30000ms exceeded.
// Call log:
//   - waiting for getByRole('link').filter({ hasText: '辞書' })
//     - waiting for" https://localhost:3000/en/main" navigation to finish...
//     - navigated to "https://localhost:3000/en/main"

test.describe("main", async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${languagePath}/main`);
  });

  test("navigate to dictionary", async ({ page }) => {
    await page
      .getByText(languagePath === "/en" ? "Dictionary" : "辞書")
      .click();

    await expect(page).toHaveURL(`${languagePath}/dictionary`);
  });

  test("navigate to add", async ({ page }) => {
    await page.getByText(languagePath === "/en" ? "Add" : "追加").click();

    await expect(page).toHaveURL(`${languagePath}/add`);
  });

  test("navigate to account", async ({ page }) => {
    await page
      .getByText(languagePath === "/en" ? "Account" : "アカウント")
      .click();

    await expect(page).toHaveURL(`${languagePath}/account`);
  });

  test("navigate to collection page", async ({ page }) => {
    await page.getByText(languagePath === "/en" ? "All" : "全て").click();

    await expect(page).toHaveURL(`${languagePath}/collection/`);
  });

  test("create new collection", async ({ page }) => {
    const form = page.getByTestId("formCreateFolder");

    await page
      .getByText(
        languagePath === "/en" ? "New collection" : "新しいコレクション",
      )
      .click();

    await expect(form).toBeInViewport();

    await page.getByTestId("inputFolderName").fill("Example Name");
    await page.getByText("OK").click();

    await expect(page.getByTestId("success")).toBeVisible();
    await expect(form).not.toBeInViewport();
  });
});
