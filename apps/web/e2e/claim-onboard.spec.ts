import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";
import {
  expectNoA11yViolations,
  fillProfile,
  randomPhone,
  signUpWithEmail,
  waitForSms,
} from "./helpers";

/**
 * PRD 5.2 happy path, M1 acceptance: QR, claim preview, phone sign-up, profile, guardian
 * consent (in Sesotho), linked results; then a second person cannot reuse the code.
 * Runs at 360 px and 1440 px (playwright.config projects).
 */
test.use({ storageState: { cookies: [], origins: [] } });

let device: { id: string; key: string };

test.beforeAll(() => {
  // Register a test kiosk device with the same CLI the ops team uses.
  const out = execFileSync(
    process.execPath,
    [
      "--env-file-if-exists=.env",
      "--import",
      "tsx",
      "scripts/kiosk-create-device.ts",
      "--label",
      "e2e kiosk",
      "--headset",
      "QUEST_2",
      "--test",
    ],
    { encoding: "utf8" },
  );
  device = {
    id: out.match(/Device (\S+)/)![1]!,
    key: out.match(/(vk_test_[A-Za-z0-9_-]+)/)![1]!,
  };
});

test("QR to claim to onboarding to guardian consent links the results", async ({
  page,
  request,
  browser,
}) => {
  // Full journey with on-demand compilation in `next dev`: allow more than the 30 s default.
  test.setTimeout(120_000);
  // 1. Kiosk posts the run (Unity has no scoring yet, so this stands in for it).
  const end = new Date(Date.now() - 60_000);
  const kiosk = await request.post("/api/v1/kiosk/sessions", {
    headers: { authorization: "Bearer " + device.key, "idempotency-key": crypto.randomUUID() },
    data: {
      deviceId: device.id,
      startedAt: new Date(end.getTime() - 20 * 60_000).toISOString(),
      endedAt: end.toISOString(),
      results: [
        {
          worldCode: "AVI",
          scenarioId: "avi.preflight.v1",
          appVersion: "e2e",
          score: 78,
          durationSec: 410,
          completed: true,
        },
        {
          worldCode: "MED",
          scenarioId: "med.ward.v1",
          appVersion: "e2e",
          score: 66,
          durationSec: 500,
          completed: true,
        },
      ],
    },
  });
  expect(kiosk.status()).toBe(201);
  const { claimUrl, claimCode } = (await kiosk.json()) as { claimUrl: string; claimCode: string };
  const claimPath = new URL(claimUrl).pathname;

  // 2. Learner scans the QR: preview with worlds and scores.
  await page.goto(claimPath);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Welcome! You explored 2 career worlds today.",
  );
  const results = page.getByTestId("world-results");
  await expect(results.getByText("Aviation")).toBeVisible();
  await expect(results.getByText("Medical")).toBeVisible();
  await expectNoA11yViolations(page);
  await page.getByRole("button", { name: "Save my results" }).click();

  // 3. Phone OTP sign-up and the two profile screens (16 years old).
  await expect(page).toHaveURL(/\/start$/);
  await expectNoA11yViolations(page);
  await signUpWithEmail(page, request);
  await expectNoA11yViolations(page);
  await fillProfile(page, {
    firstName: "Thandeka",
    age: 16,
    province: "Limpopo",
    district: "Vhembe",
  });

  // 4. Under 18: guardian step, then done in restricted mode with results linked.
  await expect(page).toHaveURL(/\/start\/guardian$/);
  await expectNoA11yViolations(page);
  const mother = randomPhone();
  await page.getByLabel("Their name").fill("Mme Dikeledi");
  await page.getByLabel("Their mobile number").fill(mother.local);
  await page.getByRole("button", { name: "Send the link" }).click();
  await expect(page).toHaveURL(/\/start\/done/);
  await expect(page.getByTestId("restricted-note")).toContainText("once your guardian says yes");
  await expect(page.getByTestId("world-results").getByText("Aviation")).toBeVisible();
  await expectNoA11yViolations(page);

  await page.goto("/me");
  await expect(page.getByTestId("restricted-banner")).toBeVisible();

  // 5. Guardian opens the SMS link on their own phone and reads it in Sesotho.
  const sms = await waitForSms(request, mother.e164, /\/consent\//);
  const consentPath = new URL(sms.match(/https?:\/\/\S+/)![0]).pathname;
  const guardianContext = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const guardian = await guardianContext.newPage();
  await guardian.goto(consentPath);
  await guardian.getByTestId("language-switcher").selectOption("st");
  await expect(guardian.getByRole("heading", { level: 1 })).toHaveText(
    "Tumello bakeng sa Thandeka",
  );
  await expectNoA11yViolations(guardian);
  await guardian.getByRole("button", { name: "Ke a dumela" }).click();
  await expect(guardian.getByTestId("guardian-thanks")).toBeVisible();
  await guardianContext.close();

  // 6. Learner is no longer restricted; results stay linked; matching is on (by guardian).
  await page.goto("/me");
  await expect(page.getByTestId("restricted-banner")).toHaveCount(0);
  await expect(page.getByTestId("world-results").getByText("Medical")).toBeVisible();
  await page.goto("/me/privacy");
  await expect(page.getByTestId("consent-MATCHING")).toContainText("On");
  await expect(page.getByTestId("consent-MATCHING")).toContainText("set by your guardian");
  await expectNoA11yViolations(page);

  // 7. Someone else scanning the same code is told it was used.
  const otherContext = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const other = await otherContext.newPage();
  await other.goto("/claim/" + claimCode.toLowerCase());
  await expect(other.getByRole("heading", { level: 1 })).toHaveText(
    "This code was already used - ask a facilitator",
  );
  await otherContext.close();
});

test("organic sign-up without a code reaches the app (L-ON-8)", async ({ page, request }) => {
  await page.goto("/home");
  await expect(page).toHaveURL(/\/start$/);
  await signUpWithEmail(page, request);
  await fillProfile(page, {
    firstName: "Ayanda",
    age: 19,
    province: "KwaZulu-Natal",
    district: "eThekwini",
  });
  await expect(page).toHaveURL(/\/start\/consent$/);
  await expectNoA11yViolations(page);
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page).toHaveURL(/\/start\/done/);
  await expect(page.getByTestId("restricted-note")).toHaveText("Your account is ready.");
  await page.getByRole("link", { name: "Go to my Career Compass" }).click();
  await expect(page).toHaveURL(/\/home$/);
});

test("an unknown code shows a friendly error with Sign up anyway", async ({ page }) => {
  await page.goto("/claim/ZZZ-ZZZ");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("We could not find that code");
  await page.getByRole("link", { name: "Sign up anyway" }).click();
  await expect(page).toHaveURL(/\/start$/);
});

test("light is the default theme, even when the device prefers dark", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto("/start");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await context.close();
});

test.describe("dark theme", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  });

  test("onboarding and claim pages have no serious a11y violations", async ({ page }) => {
    for (const path of ["/start", "/claim/ZZZ-ZZZ", "/consent/unknown-token-000000000000"]) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expectNoA11yViolations(page);
    }
  });
});
