import { defineConfig, devices } from '@playwright/test';
import { E2E_BASE_URL, e2eServerEnv } from './tests/e2e/support/env';

/**
 * Suite e2e de regresión (`pnpm test:e2e`), pensada para correr una vez por semana y antes de un
 * release grande. No corre en CI.
 *
 * El webServer recrea la base `<base>_e2e` (migraciones + seed), compila un build de producción en
 * .next-e2e y lo levanta en el puerto 3300, así nunca toca la base ni el build de desarrollo.
 * Cada test se nombra con el id del caso de /desarrollo/calidad que automatiza (`TC-AUT-001 …`).
 */
export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  // Los tests comparten la base: en paralelo por archivo, y cada archivo crea los datos que cambia
  fullyParallel: false,
  workers: process.env.E2E_WORKERS ? Number(process.env.E2E_WORKERS) : 2,
  forbidOnly: true,
  retries: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: E2E_BASE_URL,
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: /\.mobile\.spec\.ts/,
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      dependencies: ['setup'],
      testMatch: /\.mobile\.spec\.ts/,
    },
  ],
  webServer: {
    command:
      'pnpm exec tsx tests/e2e/support/prepare.ts && pnpm exec next build && pnpm exec next start',
    url: `${E2E_BASE_URL}/up`,
    env: e2eServerEnv(),
    reuseExistingServer: !!process.env.E2E_REUSE_SERVER,
    timeout: 10 * 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
