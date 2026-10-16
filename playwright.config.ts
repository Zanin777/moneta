import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e', workers: 1, retries: 0,
  use: { baseURL: 'http://127.0.0.1:5180', channel: 'msedge', trace: 'retain-on-failure' },
  webServer: [
    {
      command: 'node --experimental-strip-types backend/index.ts',
      url: 'http://127.0.0.1:3003/api/health', reuseExistingServer: false,
      env: { SIMPLE_PORT: '3003', MONETA_SIMPLE_DATA_DIR: `work/e2e-${Date.now()}` },
    },
    {
      command: 'node node_modules/vite/bin/vite.js --config vite.simple.config.ts --port 5180',
      url: 'http://127.0.0.1:5180', reuseExistingServer: false,
      env: { SIMPLE_API_URL: 'http://127.0.0.1:3003' },
    },
  ],
});
