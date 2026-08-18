import { test as setup, expect } from "@playwright/test";
import dbConnect from "@/app/lib/database";
import User from "@/app/lib/models/User";
import { SignJWT } from "jose";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

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

  await expect(page).toHaveURL(`${languagePath}/main`, { timeout: 10000 });

  await dbConnect();
  const testUser = await User.findOne({ email }).lean();
  const userId = testUser._id;

  const session = await new SignJWT({
    userId: userId.toString(),
    expiresAt,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey);

  await context.addCookies([
    { name: "session", value: session, path: "/", domain: "localhost" },
  ]);

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
