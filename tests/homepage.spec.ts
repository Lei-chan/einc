import { test, expect } from "@playwright/test";
import { GITHUB_LINK, INSTAGRAM_LINK } from "@/app/lib/config/settings";

const languagePath = process.env.TEST_LANGUAGE_PATH || "";

test.describe("navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto(languagePath);
  });

  // Homepage
  test("To the sign-up page", async ({ page }) => {
    // Find an element with the text 'Login' and click on it
    await page.getByText(languagePath === "/en" ? "Sign-up" : "登録").click();
    // The new URL should be "/login" (baseURL is used there)
    await expect(page).toHaveURL(`${languagePath}/sign-up`);
  });

  test("To the login page", async ({ page }) => {
    await page.getByText(languagePath === "/en" ? "Login" : "ログイン").click();

    await expect(page).toHaveURL(`${languagePath}/login`);
  });

  test("To the English page", async ({ page }) => {
    await page.getByTestId("language-select").selectOption("en");

    await expect(page).toHaveURL("/en");
  });

  test("To the Japanese page", async ({ page }) => {
    await page.getByTestId("language-select").selectOption("ja");

    await expect(page).toHaveURL("/ja");
  });

  test("close the subscription form", async ({ page }) => {
    await page.getByTestId("close-notification-btn").click();

    await expect(page.getByTestId("notificatino-form")).toBeHidden();
  });

  // test("subscribe", async ({ page }) => {
  //   test.slow();

  //   await page.getByTestId("subscription-btn").click();

  //   await expect(page.getByTestId("unsubscription-btn")).toBeVisible();
  // });

  // test("To GitHub page", async ({ page }) => {
  //   await page.click("[data-testid='github-link']");

  //   await expect(page).toHaveURL(GITHUB_LINK);
  // });

  // test("To Instagram page", async ({ page }) => {
  //   await page.click("[data-testid='instagram-link']");

  //   await expect(page).toHaveURL(INSTAGRAM_LINK);
  // });
});
