import AxeBuilder from "@axe-core/playwright";
import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const AUTH_FILE = "e2e/.auth/adult.json";

/** Random fictional SA mobile in local format (082 + 7 digits) and its E.164 form. */
export function randomPhone() {
  const rest = String(Math.floor(Math.random() * 10_000_000)).padStart(7, "0");
  return { local: "082" + rest, e164: "+2782" + rest };
}

/** Random fictional email for sign-up (D-039). */
export function randomEmail() {
  return "e2e-" + Math.floor(Math.random() * 1_000_000_000).toString(36) + "@example.test";
}

/** Poll the dev outbox for the newest email code sent to an address. */
export async function waitForOtpEmail(request: APIRequestContext, to: string): Promise<string> {
  let code: string | undefined;
  await expect
    .poll(
      async () => {
        const res = await request.get("/api/dev/sms-outbox?to=" + encodeURIComponent(to));
        const body = (await res.json()) as { messages: { channel: string; text: string }[] };
        code = body.messages
          .filter((m) => m.channel === "email")
          .map((m) => m.text.match(/\b\d{6}\b/)?.[0])
          .filter(Boolean)
          .reverse()[0] as string | undefined;
        return !!code;
      },
      { timeout: 15_000 },
    )
    .toBe(true);
  return code!;
}

export function dobForAge(age: number) {
  return new Date().getUTCFullYear() - age + "-01-15";
}

/** Poll the console SMS outbox (dev/test only) for the newest message to a number. */
export async function waitForSms(
  request: APIRequestContext,
  toE164: string,
  match: RegExp,
): Promise<string> {
  let found: string | undefined;
  await expect
    .poll(
      async () => {
        const res = await request.get("/api/dev/sms-outbox?to=" + encodeURIComponent(toE164));
        const body = (await res.json()) as { messages: { channel: string; text: string }[] };
        found = body.messages
          .filter((m) => m.channel === "sms")
          .map((m) => m.text)
          .reverse()
          .find((t) => match.test(t));
        return !!found;
      },
      { timeout: 15_000 },
    )
    .toBe(true);
  return found!;
}

/** Let entrance animations (fade-up) finish so axe measures the colours people actually see. */
export async function settleAnimations(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
}

export async function expectNoA11yViolations(page: Page) {
  await settleAnimations(page);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious.map((v) => v.id + ": " + v.nodes[0]?.target.join(" "))).toEqual([]);
}

/** Phone OTP sign-up up to the profile screen. */
export async function signUpWithEmail(page: Page, request: APIRequestContext) {
  const email = randomEmail();
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Send my code" }).click();
  await expect(page).toHaveURL(/\/start\/verify$/);
  const code = await waitForOtpEmail(request, email);
  // Typing the 6th digit submits the form on its own.
  await page.getByLabel("6-digit code").pressSequentially(code);
  await expect(page).toHaveURL(/\/start\/profile$/);
  return email;
}

export async function fillProfile(
  page: Page,
  p: { firstName: string; age: number; province: string; district: string },
) {
  await page.getByLabel("First name").fill(p.firstName);
  await page.getByLabel("Date of birth").fill(dobForAge(p.age));
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Where you live and study")).toBeVisible();
  await page.getByLabel("Province").selectOption({ label: p.province });
  await page.getByLabel("District or metro").selectOption({ label: p.district });
  await page.getByLabel("School", { exact: true }).fill(p.district + " Secondary School (sample)");
  await page.getByLabel("Grade", { exact: true }).selectOption({ label: "Grade 10" });
  await page.getByLabel("Mathematics", { exact: true }).check();
  await page.getByLabel("Physical Sciences").check();
  await page.getByRole("button", { name: "Continue" }).click();
}
