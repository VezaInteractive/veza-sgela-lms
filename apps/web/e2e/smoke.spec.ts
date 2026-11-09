import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import sharp from "sharp";
import { settleAnimations } from "./helpers";

test("root redirects to home", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("navigation works at this viewport", async ({ page }, info) => {
  await page.goto("/home");
  const mobile = info.project.name.startsWith("mobile");
  const nav = page.getByTestId(mobile ? "bottom-nav" : "side-nav");
  await expect(nav).toBeVisible();
  await expect(page.getByTestId(mobile ? "side-nav" : "bottom-nav")).toBeHidden();
  await nav.getByRole("link", { name: "Learn" }).click();
  await expect(page).toHaveURL(/\/learn$/);
  await expect(nav.getByRole("link", { name: "Learn" })).toHaveAttribute("aria-current", "page");
});

test("language switch persists across reloads", async ({ page }) => {
  await page.goto("/home");
  await page.getByTestId("language-switcher").selectOption("zu");
  await expect(page.locator("html")).toHaveAttribute("lang", "zu");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zu");
  await expect(page.getByRole("link", { name: "Funda" }).first()).toBeVisible();
});

test("coach entry point is on every learner page", async ({ page }) => {
  for (const path of ["/home", "/explore", "/learn", "/opportunities", "/me"]) {
    await page.goto(path);
    await expect(page.getByTestId("coach-fab")).toBeVisible();
  }
});

test("home has no serious a11y violations", async ({ page }) => {
  await page.goto("/home");
  await settleAnimations(page);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious).toEqual([]);
});

test("home in dark theme has no serious a11y violations", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.goto("/home");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await settleAnimations(page);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious).toEqual([]);
});

test("learner pages never scroll sideways", async ({ page }) => {
  const sizes = [page.viewportSize()!, { width: 768, height: 1024 }];
  for (const size of sizes)
    for (const path of ["/home", "/explore", "/learn", "/opportunities", "/me"]) {
      await page.setViewportSize(size);
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path + " @" + size.width).toBeLessThanOrEqual(0);
    }
});

test("card photos load normally and are skipped under data saver", async ({ browser, page }) => {
  await page.goto("/learn");
  await expect(page.locator('main img[src*="photos"]').first()).toBeAttached();
  const context = await browser.newContext({ extraHTTPHeaders: { "Save-Data": "on" } });
  const lean = await context.newPage();
  await lean.goto("/learn");
  await expect(lean.locator("main h1")).toBeVisible();
  await expect(lean.locator("main img")).toHaveCount(0);
  await context.close();
});

test("home shows profile and calendar, and month links work", async ({ page }) => {
  await page.goto("/home");
  await expect(page.locator("[aria-current=date]")).toHaveCount(1);
  await page.getByRole("link", { name: "Next month" }).click();
  await expect(page).toHaveURL(/month=\d{4}-\d{2}/);
  await expect(page.locator("[aria-current=date]")).toHaveCount(0);
  await page.goto("/home?month=not-a-month");
  await expect(page.locator("[aria-current=date]")).toHaveCount(1);
});

test("learner uploads, sees and removes a private profile photo", async ({ page, browser }) => {
  // One project only: both projects share the same test learner, so parallel runs would race.
  test.skip(test.info().project.name !== "desktop-1440", "runs once");
  const png = await sharp({
    create: { width: 300, height: 300, channels: 3, background: { r: 79, g: 163, b: 255 } },
  })
    .png()
    .toBuffer();
  await page.goto("/me");
  await page.getByTestId("photo-input").setInputFiles({
    name: "me.png",
    mimeType: "image/png",
    buffer: png,
  });
  await page.getByRole("button", { name: "Save photo" }).click();
  await expect(page.getByRole("status")).toHaveText("Photo saved.");
  const img = page.locator('main img[src^="/api/v1/me/avatar"]').first();
  await expect(img).toBeVisible();

  const own = await page.request.get("/api/v1/me/avatar");
  expect(own.status()).toBe(200);
  expect(own.headers()["content-type"]).toBe("image/webp");

  // Signed-out visitors cannot fetch it.
  const anon = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  expect((await anon.request.get(new URL("/api/v1/me/avatar", page.url()).href)).status()).toBe(
    401,
  );
  await anon.close();

  await page.getByRole("button", { name: "Remove photo" }).click();
  await expect(page.getByRole("status")).toHaveText("Photo removed.");
  await expect(page.locator('main img[src^="/api/v1/me/avatar"]')).toHaveCount(0);
});
