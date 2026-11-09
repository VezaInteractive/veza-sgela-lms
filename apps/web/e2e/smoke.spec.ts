import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import sharp from "sharp";
import { expectNoA11yViolations, settleAnimations, waitForSms } from "./helpers";

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
    for (const path of [
      "/home",
      "/explore",
      "/learn",
      "/learn/agr-101",
      "/explore/avi",
      "/opportunities",
      "/me",
    ]) {
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

test("course page has no serious a11y violations", async ({ page }) => {
  await page.goto("/learn/eng-101");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Repair and Maintain Electrical Power Tools",
  );
  await settleAnimations(page);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(
    results.violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
  ).toEqual([]);
});

test("support pill opens help options and the help page works", async ({ page }) => {
  await page.goto("/home");
  await page.getByTestId("support-pill").click();
  const menu = page.getByRole("region", { name: "Support options" });
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await page.getByTestId("support-pill").click();
  await menu.getByRole("link", { name: "Help and FAQs" }).click();
  await expect(page).toHaveURL(/\/help$/);
  await page.getByText("I did not get my SMS code").click();
  await expect(page.getByText(/up to 5 codes an hour/)).toBeVisible();
  await settleAnimations(page);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(
    results.violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
  ).toEqual([]);
});

test("bell shows unread notices and remembers mark all as read", async ({ page }) => {
  await page.goto("/home");
  await page.evaluate(() => localStorage.removeItem("sgela.notices.seen"));
  await page.reload();
  const bell = page.getByTestId("notification-bell");
  await expect(bell).toHaveAccessibleName(/3 unread/);
  await bell.click();
  const panel = page.getByRole("region", { name: "Notifications" });
  await expect(panel.getByRole("listitem")).toHaveCount(3);
  await panel.getByRole("button", { name: "Mark all as read" }).click();
  await expect(bell).toHaveAccessibleName(/none unread/);
  await page.reload();
  await expect(page.getByTestId("notification-bell")).toHaveAccessibleName(/none unread/);
});

test("learners cannot open the admin dashboard", async ({ page }) => {
  const res = await page.goto("/admin/insights");
  expect(res?.status()).toBe(404);
});

test("admin dashboard shows aggregates with privacy note", async ({ browser, request }) => {
  test.skip(test.info().project.name !== "desktop-1440", "one sign-in per run");
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  await page.goto("/start");
  await page.getByLabel("Mobile number").fill("060 000 0001");
  await page.getByRole("button", { name: "Send my code" }).click();
  await expect(page).toHaveURL(/\/start\/verify$/);
  const sms = await waitForSms(request, "+27600000001", /code is \d{6}/);
  await page.getByLabel("6-digit code").pressSequentially(sms.match(/\d{6}/)![0]);
  await expect(page).toHaveURL(/\/admin\/insights$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Platform insights");
  await expect(page.getByText("Groups under 20 learners are hidden")).toBeVisible();
  await expectNoA11yViolations(page);
  await context.close();
});

test("career world page has no serious a11y violations", async ({ page }) => {
  await page.goto("/explore/med");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Medical");
  await settleAnimations(page);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(
    results.violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
  ).toEqual([]);
});

test("sign-up story advances, can be paused, and still changes under reduced motion", async ({
  browser,
}) => {
  test.skip(test.info().project.name !== "desktop-1440", "panel shows on wide screens");
  test.setTimeout(60_000);
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
      reducedMotion,
    });
    const page = await context.newPage();
    await page.goto("/consent/unknown-token-000000000000");
    const act = page.locator("aside [data-testid=story-act]");
    await expect(act).toHaveAttribute("data-act", "0");
    await expect(act).toHaveAttribute("data-act", "1", { timeout: 6000 });
    await page.locator("aside").getByRole("button", { name: "Pause animation" }).click();
    const held = await act.getAttribute("data-act");
    await page.waitForTimeout(5000);
    await expect(act).toHaveAttribute("data-act", held!);
    await expect(
      page.locator("aside").getByRole("button", { name: "Play animation" }),
    ).toBeVisible();
    await context.close();
  }
});
