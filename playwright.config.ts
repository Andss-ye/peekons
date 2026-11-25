import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://localhost:5199', ...devices['Desktop Chrome'], channel: 'chrome' },
  webServer: { command: 'npx vite playground --config vite.config.ts', url: 'http://localhost:5199', reuseExistingServer: false },
});
