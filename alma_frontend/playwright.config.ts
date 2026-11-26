import { defineConfig, devices } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

const secret = process.env.ALMA_E2E_AUTH_SECRET || randomBytes(32).toString("hex");
process.env.ALMA_E2E_AUTH_SECRET = secret;
process.env.ALMA_E2E_FIXTURE_PATH ||= join(tmpdir(), `alma-e2e-${randomBytes(8).toString("hex")}.json`);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: "list",
  use: { viewport: { width: 1440, height: 900 }, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3100" } },
    { name: "firefox", use: { ...devices["Desktop Firefox"], baseURL: "http://localhost:3100" } },
    { name: "webkit", use: { ...devices["Desktop Safari"], baseURL: "http://127.0.0.1:3100" } },
  ],
  webServer: [
    {
      command: "node ../tests/support/browser-backend.mjs",
      url: "http://127.0.0.1:5100/api/v1/health",
      timeout: 30_000,
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --port 3100",
      url: "http://localhost:3100/login",
      timeout: 90_000,
      reuseExistingServer: false,
      env: {
        ALMA_NEXT_DIST_DIR: ".next-e2e",
        BACKEND_API_URL: "http://127.0.0.1:5100/api/v1",
        NEXTAUTH_URL: "http://localhost:3100",
        NEXTAUTH_SECRET: secret,
        TOKEN_ENCRYPTION_KEY: randomBytes(32).toString("hex"),
      },
    },
  ],
});
