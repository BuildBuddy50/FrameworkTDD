import { defineConfig, devices } from '@playwright/test';
import { env } from './src/utils/env';

/**
 * Playwright configuration for the Nova Store POM framework.
 *
 * In local/dev/qa, `webServer` boots two processes automatically:
 *   1. The REST API (node server.js) on the env's API port.
 *   2. A static server hosting frontend.html on :8080.
 * Set REUSE_APP=1 to attach to already-running servers instead.
 *
 * Point at a deployed environment by setting BASE_URL/API_URL and
 * skipping the local servers (set NO_WEBSERVER=1).
 */

const useLocalServers = !process.env.NO_WEBSERVER && env.name !== 'prod';
const apiPort = new URL(env.apiURL).port || '4000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'results/junit.xml' }],
    ['json', { outputFile: 'results/results.json' }],
  ],

  use: {
    baseURL: env.baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
    headless:false,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },

  ],

  webServer: useLocalServers
    ? [
        {
          command: `node --env-file=app/.env.test app/server.js`,
          port: Number(apiPort),
          reuseExistingServer: !process.env.CI || !!process.env.REUSE_APP,
          timeout: 30_000,
          stdout: 'pipe',
          stderr: 'pipe',
        },
        {
          command: `node app/static-server.js`,
          port: 8080,
          reuseExistingServer: !process.env.CI || !!process.env.REUSE_APP,
          timeout: 30_000,
          stdout: 'pipe',
          stderr: 'pipe',
        },
      ]
    : undefined,
});
