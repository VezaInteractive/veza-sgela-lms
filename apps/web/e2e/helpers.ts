import AxeBuilder from "@axe-core/playwright";
import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const AUTH_FILE = "e2e/.auth/adult.json";

/** Random fictional SA mobile in local format (082 + 7 digits) and its E.164 form. */
export function randomPhone() {
  const rest = String(Math.floor(Math.random() * 10_000_000)).padStart(7, "0");
  return { local: "082" + rest, e164: "+2782" + rest };
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

export async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious.map((v) => v.id + ": " + v.nodes[0]?.target.join(" "))).toEqual([]);
}

/** Phone OTP sign-up up to the profile screen. */
export async function signUpWithPhone(page: Page, request: APIRequestContext) {
  const phone = randomPhone();
  await page.getByLabel("Mobile number").fill(phone.local);
  await page.getByRole("button", { name: "Send my code" }).click();
  await expect(page).toHaveURL(/\/start\/verify$/);
  const sms = await waitForSms(request, phone.e164, /code is \d{6}/);
  const code = sms.match(/\d{6}/)![0];
  // Typing the 6th digit submits the form on its own.
  await page.getByLabel("6-digit code").pressSequentially(code);
  await expect(page).toHaveURL(/\/start\/profile$/);
  return phone;
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
