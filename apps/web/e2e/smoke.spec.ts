import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

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
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious).toEqual([]);
});
