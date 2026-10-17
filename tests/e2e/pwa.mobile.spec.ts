import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';

// Pull to refresh de la app instalada (Pixel 7). La app instalada se simula: `navigator.standalone`
// en true, como en iOS; el puntero ya es táctil. El gesto se arma con TouchEvents.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(Navigator.prototype, 'standalone', {
      get: () => true,
      configurable: true,
    }),
  );
});

/** Arrastra un dedo hacia abajo desde arriba de la página, sin soltar. */
const pullDown = (page: Page, distance: number) =>
  page.evaluate((d) => {
    const x = 200;
    const startY = 200;
    const target = document.elementFromPoint(x, startY) ?? document.body;
    const touch = (y: number) => new Touch({ identifier: 1, target, clientX: x, clientY: y });
    const fire = (type: string, y: number, active = true) =>
      target.dispatchEvent(
        new TouchEvent(type, {
          touches: active ? [touch(y)] : [],
          changedTouches: [touch(y)],
          bubbles: true,
          cancelable: true,
        }),
      );
    fire('touchstart', startY);
    for (let y = startY + 10; y <= startY + d; y += 10) fire('touchmove', y);
    (window as unknown as { __release: () => void }).__release = () =>
      fire('touchend', startY + d, false);
  }, distance);

const release = (page: Page) =>
  page.evaluate(() => (window as unknown as { __release: () => void }).__release());

/** Cuánto bajó el indicador (su translateY sin el offset de -44 px con que arranca escondido). */
const indicatorPull = (page: Page) =>
  page.evaluate(() => {
    const indicator = [...document.querySelectorAll<HTMLElement>('[role="status"]')].find((el) =>
      el.style.transform.includes('translateY'),
    );
    if (!indicator) return null;
    const px = Number(indicator.style.transform.match(/\+ (-?[\d.]+)px/)?.[1]);
    return px + 44;
  });

const ready = (page: Page) => expect(page.locator('html[data-app-ready]')).toBeAttached();

test('TC-PWA-006 Pull to refresh en la app instalada', async ({ page }) => {
  // /eventos lee la base: tirar y soltar re-renderiza la página (router.refresh)
  await page.goto('/eventos');
  await ready(page);
  await expect.poll(() => indicatorPull(page)).toBe(0);
  await pullDown(page, 300);
  await expect.poll(() => indicatorPull(page)).toBeGreaterThanOrEqual(72);
  const refresh = page.waitForRequest(
    (request) =>
      request.headers()['rsc'] === '1' &&
      !request.headers()['next-router-prefetch'] &&
      new URL(request.url()).pathname === '/eventos',
  );
  await release(page);
  await refresh;
  await expect(page.getByText('Actualizando…')).toBeAttached();
  await expect.poll(() => indicatorPull(page)).toBe(0);

  // /cursos es estática: no hay pull to refresh
  await page.goto('/cursos');
  await ready(page);
  expect(await indicatorPull(page)).toBeNull();

  // Con un diálogo abierto el gesto es del diálogo
  await page.goto('/eventos');
  await ready(page);
  await expect(async () => {
    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.getByRole('dialog', { name: 'Buscar en todo el sitio' })).toBeVisible({
      timeout: 1_000,
    });
  }).toPass();
  await pullDown(page, 300);
  await expect.poll(() => indicatorPull(page)).toBe(0);
  await release(page);
  await expect(page.getByText('Actualizando…')).toHaveCount(0);
});

test('a short pull springs back without refreshing', async ({ page }) => {
  await page.goto('/eventos');
  await ready(page);
  await pullDown(page, 80);
  await expect.poll(() => indicatorPull(page)).toBeGreaterThan(0);
  await release(page);
  await expect.poll(() => indicatorPull(page)).toBe(0);
  await expect(page.getByText('Actualizando…')).toHaveCount(0);
});

test.describe('in the browser (not installed)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() =>
      Object.defineProperty(Navigator.prototype, 'standalone', {
        get: () => false,
        configurable: true,
      }),
    );
  });

  test('there is no pull to refresh: the browser has its own', async ({ page }) => {
    await page.goto('/eventos');
    await ready(page);
    expect(await indicatorPull(page)).toBeNull();
  });
});
