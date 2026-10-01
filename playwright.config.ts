import { defineConfig } from '@playwright/test';

// Locally PW_CHANNEL=chrome reuses the installed Chrome (no browser download); CI installs Playwright's chromium.
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4173', channel: process.env.PW_CHANNEL, locale: 'fa-IR' },
  webServer: { command: 'npm run build && npx vite preview --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
