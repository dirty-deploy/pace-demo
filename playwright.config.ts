import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  use: { baseURL: 'http://127.0.0.1:4174/', viewport: { width: 1440, height: 900 } },
  webServer: {
    command: 'npx vite preview --port 4174 --strictPort --host 127.0.0.1',
    url: 'http://127.0.0.1:4174/',
    reuseExistingServer: false,
  },
});
