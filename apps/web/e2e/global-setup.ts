import { chromium, expect, request as apiRequest, type FullConfig } from "@playwright/test";
import { AUTH_FILE, fillProfile, signUpWithEmail } from "./helpers";

/** Signs up one adult learner through the real UI and saves the session for smoke tests. */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]!.use.baseURL!;
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });
  const request = await apiRequest.newContext({ baseURL });

  await page.goto("/start");
  await signUpWithEmail(page, request);
  await fillProfile(page, {
    firstName: "Sipho",
    age: 22,
    province: "Gauteng",
    district: "City of Johannesburg",
  });
  await expect(page).toHaveURL(/\/start\/consent$/);
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page).toHaveURL(/\/start\/done/);
  await page.context().storageState({ path: AUTH_FILE });

  await request.dispose();
  await browser.close();
}
