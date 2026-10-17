import { defineConfig } from '@playwright/test';

// Override only when using an already installed Chromium (for example in cloud CI).
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  reporter: 'list',
  use: {
    browserName: 'chromium',
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    launchOptions: executablePath ? { executablePath } : {},
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
