import { test as setup, expect } from "@playwright/test";

const languagePath = process.env.TEST_LANGUAGE_PATH || "";
const email = process.env.TEST_EMAIL || "";
const password = process.env.TEST_PASSWORD || "";

setup("create new database", async ({ page, context }) => {
  console.log("creating new database...");

  await page.goto(`${languagePath}/login`);

  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page
    .getByRole("button", {
      name: languagePath === "/en" ? "Log in" : "ログイン",
    })
    .click();

  // page.screenshot({ path: "screenshot.png" });
  await expect(page).toHaveURL(`${languagePath}/main`, { timeout: 10000 });

  await page.evaluate(() => {
    window.dispatchEvent(new Event("online"));
    window.dispatchEvent(new Event("offline"));
    window.dispatchEvent(new Event("resize"));
  });

  await context.storageState({
    path: "playwright/.auth/.user.json",
    indexedDB: true,
  });
});
