/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Unfinished Works
 */
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', timeout: 30000, fullyParallel: false, workers: 1,
  reporter: 'list', use: { baseURL: 'http://127.0.0.1:5180', headless: true, viewport: { width: 1440, height: 1100 } },
  webServer: { command: 'npm run dev -- --port 5180 --strictPort', url: 'http://127.0.0.1:5180', reuseExistingServer: !process.env.CI },
});
