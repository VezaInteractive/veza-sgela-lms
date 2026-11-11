import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { settleAnimations, waitForOtpEmail } from "./helpers";

test("explore index lists DB worlds with a sponsor credit line", async ({ page }) => {
  await page.goto("/explore");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Explore career worlds");
  // Aviation is sponsored in the seed (fictional sponsor).
  await expect(page.getByText(/Aviation World presented by/)).toBeVisible();
  await page
    .getByRole("link", { name: /Aviation/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/explore\/avi$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Aviation");
});

test("career page highlights subjects the learner takes and is missing", async ({ page }) => {
  // The seeded adult takes Mathematics and Physical Sciences, not English.
  await page.goto("/explore/avi/careers/commercial-pilot");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Commercial pilot");
  const maths = page.getByRole("listitem").filter({ hasText: "Mathematics" }).first();
  await expect(maths.getByText("You take this")).toBeVisible();
  const english = page.getByRole("listitem").filter({ hasText: "English" }).first();
  await expect(english.getByText("Not in your subjects")).toBeVisible();
});

test("I'm interested toggles on and off", async ({ page }) => {
  await page.goto("/explore/eng");
  const toggle = page.getByTestId("interest-toggle");
  const start = await toggle.getAttribute("aria-pressed");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", start === "true" ? "false" : "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", start ?? "false");
});

test("the 3D model viewer loads from the poster after the size gate", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1440", "one WebGL load per run");
  await page.goto("/explore/avi");
  const viewer = page.getByTestId("model-viewer");
  await expect(viewer).toHaveAttribute("data-phase", "poster");
  const load = viewer.getByRole("button", { name: /View in 3D/ });
  await expect(load).toBeVisible();
  await page.waitForLoadState("networkidle");
  // Open the size gate once the handler is hydrated. Past it the model loads, or a friendly
  // note shows (no WebGL / load failed).
  await expect(async () => {
    await load.evaluate((el: HTMLButtonElement) => el.click());
    await expect(viewer).toHaveAttribute("data-phase", /live|nowebgl|failed/, { timeout: 3_000 });
  }).toPass({ timeout: 20_000 });
});

test("the Career Compass renders 3D at a usable frame rate on a throttled profile", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "desktop-1440", "fps check runs once");
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto("/home");
  const compass = page.getByTestId("career-compass");
  await expect(compass).toHaveAttribute("data-mode", "3d", { timeout: 15_000 });
  // data-fps updates once a second from the render loop; wait for a real sample, then assert >= 30.
  await expect
    .poll(async () => Number((await compass.getAttribute("data-fps")) ?? "0"), { timeout: 10_000 })
    .toBeGreaterThanOrEqual(30);
});

test("career page has no serious a11y violations and never scrolls sideways", async ({
  page,
}, info) => {
  await page.goto("/explore/agr/careers/hydroponics-technician");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hydroponics technician");
  await settleAnimations(page);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(
    results.violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
  ).toEqual([]);
  if (info.project.name.startsWith("mobile")) {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  }
});

test("an admin can edit a career and sees it saved", async ({ browser, request }, info) => {
  test.skip(info.project.name !== "desktop-1440", "one admin sign-in per run");
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  await page.goto("/start");
  await page.getByLabel("Email address").fill("admin@veza.africa");
  await page.getByRole("button", { name: "Send my code" }).click();
  await expect(page).toHaveURL(/\/start\/verify$/);
  const code = await waitForOtpEmail(request, "admin@veza.africa");
  await page.getByLabel("6-digit code").pressSequentially(code);
  await expect(page).toHaveURL(/\/admin\/insights$/);

  await page.goto("/admin/careers");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Worlds and careers");
  await page.getByRole("link", { name: "Edit", exact: true }).first().click();
  await expect(page).toHaveURL(/\/admin\/careers\/edit\//);
  const summary = page.getByLabel("Summary");
  const original = (await summary.inputValue()).trim();
  await summary.fill(original + " Edited by a test.");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page).toHaveURL(/\/admin\/careers\?ok=careerUpdated/);
  await expect(page.getByText("Saved.")).toBeVisible();

  // Put it back so the run is repeatable.
  await page.getByRole("link", { name: "Edit", exact: true }).first().click();
  await page.getByLabel("Summary").fill(original);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page).toHaveURL(/\/admin\/careers\?ok=careerUpdated/);
  await context.close();
});

test("a learner cannot open the worlds and careers admin", async ({ page }) => {
  const res = await page.goto("/admin/careers");
  expect(res?.status()).toBe(404);
});
