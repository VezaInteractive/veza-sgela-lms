import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = "http://localhost:" + PORT;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  // Signs up one adult through the UI; smoke tests reuse that session.
  globalSetup: "./e2e/global-setup.ts",
  use: { baseURL: BASE_URL, trace: "on-first-retry", storageState: "e2e/.auth/adult.json" },
  projects: [
    {
      name: "mobile-360",
      use: { ...devices["Galaxy S9+"], viewport: { width: 360, height: 740 } },
    },
    {
      name: "desktop-1440",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: process.env.CI ? "pnpm start" : "pnpm dev",
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      APP_URL: BASE_URL,
      SMS_PROVIDER: "console",
      WHATSAPP_PROVIDER: "console",
      // The console outbox lets tests read OTPs and consent links, also under `next start`.
      ENABLE_SMS_OUTBOX: "1",
      // All e2e traffic comes from one IP; keep L-ON-2 limits out of the way here
      // (they are covered by unit and DB tests).
      OTP_MAX_SENDS_PER_IP_PER_HOUR: "1000",
      OTP_MAX_SENDS_PER_PHONE_PER_HOUR: "1000",
    },
  },
});
