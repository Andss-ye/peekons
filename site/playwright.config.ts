import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://localhost:4322', ...devices['Desktop Chrome'], channel: 'chrome' },
  webServer: { command: 'npx vite preview --outDir dist --port 4322 --strictPort', url: 'http://localhost:4322', reuseExistingServer: false },
});
