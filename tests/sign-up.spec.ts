import { test, expect } from "@playwright/test";

const languagePath = process.env.TEST_LANGUAGE_PATH || "";
const password = process.env.TEST_PASSWORD || "";
const email = `test-${Date.now()}@example.com`;

test.describe("sign-up", async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${languagePath}/sign-up`);
  });

  test("register by email and password", async ({ page }) => {
    await page.check('[name="privacyPolicy"]');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);

    // wait for redirect
    await Promise.all([
      page.waitForURL(`${languagePath}/main`),
      await page.click('button[type="submit"]'),
    ]);

    await expect(page).toHaveURL(`${languagePath}/main`);
  });

  test.describe("error email and password", async () => {
    test("privacy policy not checked", async ({ page }) => {
      await page.fill('[name="email"]', email);
      await page.fill('[name="password"]', password);
    });

    test("email blank", async ({ page }) => {
      await page.check('[name="privacyPolicy"]');
      await page.fill('[name="password"]', password);
    });

    test("password blank", async ({ page }) => {
      await page.check('[name="privacyPolicy"]');
      await page.fill('[name="email"]', email);
    });

    test.afterEach(async ({ page }) => {
      await page.click('button[type="submit"]');

      // waits for React to render it
      await expect(
        page.getByTestId("error").or(page.getByTestId("errorMsgInput")),
      ).toBeVisible();
    });
  });

  // test("register by Google", async ({ page }) => {
  //   await page.check('[name="privacyPolicy"]');

  //   await page.getByRole("button", { name: /google/i }).click();

  //   // await page.waitForURL(`${languagePath}/main`); // wait for redirect
  //   // await expect(page).toHaveURL(`${languagePath}/main`);
  // });

  // test('error by Google', async ({page}) => {
  // await page.getByRole("button", { name: /google/i }).click();
  // })
});
