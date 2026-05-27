import { test, expect } from "@playwright/test";

const languagePath = "/en";

test.describe("sign-up", async () => {
  test.beforeEach(({ page }) => {
    page.goto(languagePath);
  });
});
