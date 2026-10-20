import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run preview -- --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  projects: [
    {
      name: 'Mobile Chrome 360',
      use: {
        ...devices['Galaxy S8'],
        viewport: { width: 360, height: 740 },
      },
    },
    {
      name: 'Mobile Safari 390',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'Desktop 1440',
      use: {
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
