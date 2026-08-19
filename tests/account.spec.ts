import { test, expect } from "@playwright/test";

const languagePath = process.env.TEST_LANGUAGE_PATH || "";
const email = process.env.TEST_EMAIL || "";
const newEmailAddress = process.env.TEST_NEW_EMAIL || "";
const password = process.env.TEST_PASSWORD || "";
const newPassword = process.env.TEST_NEW_PASSWORD || "";

test.describe("account", () => {
  test.use({ storageState: "playwright/.auth/.user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${languagePath}/account`);
    // wait for contents to load
    await page.waitForTimeout(10000);

    page.screenshot({ path: "screenshot1.png" });
  });

  test.describe("email address", () => {
    test.beforeEach(async ({ page }) => {
      const btnChange = page.getByTestId("btnChangeEmail");
      await btnChange.waitFor();
      await btnChange.click();

      const inputEmail = page.getByPlaceholder(
        languagePath === "/en" ? "new email" : "新しいメールアドレス",
      );
      await expect(inputEmail).toBeVisible();
    });

    test("change email address", async ({ page }) => {
      test.slow();

      await page
        .getByPlaceholder(
          languagePath === "/en" ? "new email" : "新しいメールアドレス",
        )
        .fill(newEmailAddress);

      await page.getByTestId("btnSubmitEmail").click();

      await page.screenshot({ path: "screenshot2.png" });

      const btnChange = page.getByTestId("btnChangeEmail");
      await btnChange.waitFor();

      await expect(btnChange).toBeVisible();

      await page.goto(`${languagePath}/login`);

      //   expect error with former email
      await page.fill('[name="email"]', email);
      await page.fill('[name="password"]', password);
      await page.click('button[type="submit"]');

      await expect(
        page.getByTestId("error").or(page.getByTestId("errorMsgInput")),
      ).toBeVisible();

      //   expect successful login with new email
      await page.fill('[name="email"]', newEmailAddress);
      await page.fill('[name="password"]', password);

      await Promise.all([
        page.waitForURL(`${languagePath}/main`),
        page.click('button[type="submit"]'),
      ]);

      await expect(page).toHaveURL(`${languagePath}/main`);
    });
  });

  test.describe("password", () => {
    test.slow();

    test.beforeEach(async ({ page }) => {
      const btnChangePassword = page.getByTestId("btnChangePassword");
      await btnChangePassword.waitFor();
      await btnChangePassword.click();
    });

    test.describe("change password errors", () => {
      test("both blank error", async ({ page }) => {
        await page.fill('[name="currentPassword"]', "");
        await page.fill('[name="newPassword"]', "");
      });

      test("current password blank error", async ({ page }) => {
        await page.fill('[name="currentPassword"]', "");
        await page.fill('[name="newPassword"]', newPassword);
      });

      test("new password blank error", async ({ page }) => {
        await page.fill('[name="currentPassword"]', password);
        await page.fill('[name="newPassword"]', "");
      });

      test("wrong password error", async ({ page }) => {
        await page.fill('[name="currentPassword"]', newPassword);
        await page.fill('[name="newPassword"]', newPassword);
      });

      test.afterEach(async ({ page }) => {
        await page.locator("[type=submit]").click();

        await expect(
          page.getByTestId("error").or(page.getByTestId("errorMsgInput")),
        ).toBeVisible();
      });
    });

    test("change password with no errors", async ({ page }) => {
      await page.fill('[name="currentPassword"]', password);
      await page.fill('[name="newPassword"]', newPassword);

      await page.locator("[type=submit]").click();

      await expect(page.getByTestId("btnChangePassword")).toBeVisible({
        timeout: 7000,
      });

      await page.goto(`${languagePath}/login`);

      //   expect error with former password
      await page.fill('[name="email"]', email);
      await page.fill('[name="password"]', password);
      page.click('button[type="submit"]');

      await expect(
        page.getByTestId("error").or(page.getByTestId("errorMsgInput")),
      ).toBeVisible();

      //   expect successful login with new email
      await page.fill('[name="email"]', email);
      await page.fill('[name="password"]', newPassword);

      await Promise.all([
        page.waitForURL(`${languagePath}/main`),
        page.click('button[type="submit"]'),
      ]);

      await expect(page).toHaveURL(`${languagePath}/main`);
    });
  });

  test("close account", async ({ page }) => {
    test.slow();

    await page.getByTestId("btnCloseAccount").click();

    const btnCloseFinal = page.locator("[type=submit]");
    await expect(btnCloseFinal).toBeVisible();

    const url = `${languagePath}/account-closed`;
    await Promise.all([page.waitForURL(url), btnCloseFinal.click()]);
    await expect(page).toHaveURL(url);

    await page.goto(`${languagePath}/login`);

    // check if the user cannot log in anymore
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', newPassword);
    await page.click('button[type="submit"]');

    await expect(
      page.getByTestId("error").or(page.getByTestId("errorMsgInput")),
    ).toBeVisible();
    await page.screenshot({ path: "screenshot.png" });
  });
});
