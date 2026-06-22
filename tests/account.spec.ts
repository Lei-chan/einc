import { test, expect } from "@playwright/test";

const languagePath = process.env.TEST_LANGUAGE_PATH || "";
const email = process.env.TEST_EMAIL || "";
const newEmailAddress = process.env.TEST_NEW_EMAIL || "";
const password = process.env.TEST_PASSWORD || "";
const newPassword = process.env.TEST_NEW_PASSWORD || "";

test.describe("account", () => {
  test.beforeEach(async ({ page }) => {
    page.goto(`${languagePath}/account`);
  });

  test.describe("email address", () => {
    test.beforeEach(async ({ page }) => {
      const btnChange = page.getByTestId("btnChangeEmail");
      await btnChange.waitFor();
      await btnChange.click();

      const inputEmail = page.getByPlaceholder(
        languagePath === "/en" ? "new email" : "新しいメールアドレス",
      );
      expect(inputEmail).toBeVisible();
    });

    test("change email address", async ({ page }) => {
      await page
        .getByPlaceholder(
          languagePath === "/en" ? "new email" : "新しいメールアドレス",
        )
        .fill(newEmailAddress);

      await page.locator("[type=submit]").click();

      const btnChange = page.getByTestId("btnChangeEmail");
      await btnChange.waitFor();

      expect(btnChange).toBeVisible();

      page.goto(`${languagePath}/login`);

      //   expect error with former email
      await page.fill('[name="email"]', email);
      await page.fill('[name="password"]', password);
      page.click('button[type="submit"]');

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

    test("change password", async ({ page }) => {
      await page.fill('[name="currentPassword"]', password);
      await page.fill('[name="newPassword"]', newPassword);

      await page.locator("[type=submit]").click();

      await expect(page.getByTestId("btnChangePassword")).toBeVisible();

      page.goto(`${languagePath}/login`);

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
    const btnCloseAccount = page.getByTestId("btnCloseAccount");
    await btnCloseAccount.waitFor();
    await btnCloseAccount.click();

    const btnCloseFinal = page.locator("[type=submit]");
    expect(btnCloseFinal).toBeVisible();

    const url = `${languagePath}/account-closed`;
    await Promise.all([page.waitForURL(url), btnCloseFinal.click()]);
    await expect(page).toHaveURL(url);
  });
});
