import type { BrowserContext, Page } from '@playwright/test';
import { expect, test } from './support/fixtures';

// PWA: manifest, service worker (public/sw.js, solo en el build de producción) y la página /offline.
// Lo nativo (prompt de instalación de Chrome, la app abierta en standalone) no se puede automatizar.

/** Espera a que el service worker controle la página (en la primera visita hace falta recargar). */
const waitForServiceWorker = async (page: Page) => {
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  if (!(await page.evaluate(() => !!navigator.serviceWorker.controller))) {
    await page.reload();
  }
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
};

/** Cada entrada de Cache Storage con lo que importa para saber si es privada. */
const cachedEntries = (page: Page) =>
  page.evaluate(async () => {
    const entries: { cache: string; url: string; setCookie: boolean; cacheControl: string }[] = [];
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        const response = await cache.match(request);
        entries.push({
          cache: name,
          url: request.url,
          setCookie: !!response?.headers.has('set-cookie'),
          cacheControl: response?.headers.get('cache-control') ?? '',
        });
      }
    }
    return entries;
  });

const goOffline = (context: BrowserContext) => context.setOffline(true);

// El service worker y los cambios de red agregan cargas completas: más margen que el default.
test.describe.configure({ timeout: 90_000 });

test('the manifest describes an installable standalone app', async ({ request }) => {
  const response = await request.get('/manifest.webmanifest');
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest).toMatchObject({
    name: 'programaConNosotros',
    short_name: 'PCN',
    start_url: '/',
    display: 'standalone',
  });
  const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
  expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']));
  expect(manifest.icons.some((icon: { purpose?: string }) => icon.purpose === 'maskable')).toBe(
    true,
  );
  for (const icon of manifest.icons) {
    expect((await request.get(icon.src)).ok(), icon.src).toBe(true);
  }
});

test('the home links the manifest', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', /manifest/);
});

test('the service worker registers and precaches /offline', async ({ page }) => {
  await page.goto('/eventos');
  await waitForServiceWorker(page);
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  expect(scope).toMatch(/localhost:\d+\/$/);
  await expect
    .poll(async () => (await cachedEntries(page)).map((entry) => new URL(entry.url).pathname))
    .toEqual(expect.arrayContaining(['/offline', '/logo.webp', '/pwa-icon-192.png']));
});

test.skip('TC-PWA-001 Instalar la app en Android (Chrome)', () => {
  // El prompt nativo de instalación y la app abierta en standalone (con el splash) no se pueden
  // manejar desde Playwright. Lo que hace la página con `beforeinstallprompt` lo cubre
  // "a beforeinstallprompt makes instalarApp(); trigger the browser prompt".
});

test('a beforeinstallprompt makes instalarApp(); trigger the browser prompt', async ({ page }) => {
  await page.goto('/');
  const install = page.getByRole('button', { name: /instalarApp\(\);/ });
  await expect(install).toBeVisible();

  // Lo que Chrome manda cuando la app es instalable, con un prompt() falso que deja registro
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: string }>;
    };
    event.prompt = async () => {
      (window as unknown as { __prompted: number }).__prompted =
        ((window as unknown as { __prompted?: number }).__prompted ?? 0) + 1;
    };
    event.userChoice = Promise.resolve({ outcome: 'accepted' });
    window.dispatchEvent(event);
  });
  await install.click();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __prompted?: number }).__prompted))
    .toBe(1);
  // No abre la guía manual: el prompt ya se encargó
  await expect(page.getByRole('dialog', { name: 'Instalar PCN' })).toHaveCount(0);

  // Al instalarse, el botón de la home se va
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  await expect(install).toBeHidden();
});

test('without an install prompt, instalarApp(); opens the manual steps for Chrome', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: /instalarApp\(\);/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Instalar PCN' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Desde Chrome / Edge');
  await expect(dialog).toContainText('Instalar');
});

test.describe('on an iPhone', () => {
  test.use({
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test('TC-PWA-002 Instrucciones de instalación en iPhone', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /instalarApp\(\);/ }).click();
    const dialog = page.getByRole('dialog', { name: 'Instalar PCN' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Desde iPhone / iPad');
    await expect(dialog.getByText('Compartir', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Agregar a inicio', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});

test('TC-PWA-003 Navegar sin conexión', async ({ page, context }) => {
  await page.goto('/eventos');
  await waitForServiceWorker(page);
  await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('eventos');

  await goOffline(context);
  await expect(page.getByText('Sin conexión', { exact: true })).toBeVisible();
  // Lo que ya cargó sigue en pantalla
  await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('eventos');

  // Una página nunca visitada muestra /offline en esa misma URL
  await page.goto('/historia');
  await expect(page).toHaveURL(/\/historia$/);
  await expect(page.getByText('ping: sendto: Network is unreachable')).toBeVisible();
  await expect(page.getByRole('button', { name: './reintentar' })).toBeVisible();
  await expect(page).toHaveTitle('ping: network unreachable');

  // Volver a /eventos sin red no deja una página de error del navegador
  await page.goto('/eventos');
  await expect(page).toHaveURL(/\/eventos$/);
  await expect(
    page
      .getByText('ping: sendto: Network is unreachable')
      .or(page.getByRole('heading', { level: 1 }).filter({ hasText: 'eventos' })),
  ).toBeVisible();

  await context.setOffline(false);
});

test('./reintentar while still offline keeps the offline screen', async ({ page, context }) => {
  await page.goto('/eventos');
  await waitForServiceWorker(page);
  await goOffline(context);
  await page.goto('/podcast');
  const retry = page.getByRole('button', { name: './reintentar' });
  await retry.click();
  await expect(page.getByText('ping: sendto: Network is unreachable')).toBeVisible();
  await expect(retry).toBeEnabled();
  await context.setOffline(false);
});

test('TC-PWA-004 La página offline vuelve sola', async ({ page, context }) => {
  await page.goto('/offline');
  const start = page.getByRole('button', { name: /^\.\/trivia --preguntas \d+$/ });
  const total = Number((await start.textContent())!.match(/\d+/)![0]);
  await start.click();

  // Elige siempre la primera opción: si era incorrecta queda ✗ y la correcta ✓
  let correct = 0;
  for (let i = 0; i < total; i++) {
    await expect(page.getByText(`[${String(i + 1).padStart(2, '0')}/`)).toBeVisible();
    const options = page.getByRole('listitem').getByRole('button');
    await options.first().click();
    await expect(options.first()).toBeDisabled();
    const marks = await options.allTextContents();
    const picked = marks[0];
    expect(marks.filter((text) => text.startsWith('✓'))).toHaveLength(1);
    if (picked.startsWith('✓')) correct++;
    else expect(picked.startsWith('✗')).toBe(true);
    await page.getByRole('button', { name: 'siguiente →' }).click();
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  await expect(page.getByText(`${pad(correct)}/${pad(total)}`)).toBeVisible();
  await expect(
    page.getByText(/# nivel: (junior|semi-senior|senior|principal engineer)/),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: './trivia --otra-vez' })).toBeVisible();

  // Al volver la red la página se recarga sola
  await goOffline(context);
  const reloaded = page.waitForEvent('load');
  await context.setOffline(false);
  await reloaded;
  await expect(page.getByRole('button', { name: /^\.\/trivia --preguntas \d+$/ })).toBeVisible();
});

test('going offline and back shows both toasts', async ({ page, context }) => {
  await page.goto('/cursos');
  await expect(page.locator('html[data-app-ready]')).toBeAttached();
  await goOffline(context);
  await expect(page.getByText('Sin conexión', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Lo que ya cargó sigue disponible hasta que vuelva la red.'),
  ).toBeVisible();
  await context.setOffline(false);
  await expect(page.getByText('Conexión restablecida')).toBeVisible();
});

test.describe('signed in', () => {
  test.use({ as: 'member' });

  test('TC-PWA-005 No se cachea nada privado', async ({ page }) => {
    await page.goto('/perfil');
    await waitForServiceWorker(page);
    await page.goto('/perfil');
    await page.goto('/autenticacion/iniciar-sesion');
    // Con sesión, el login redirige solo: si eso pisa la navegación siguiente, se reintenta
    await expect(async () => {
      await page.goto('/eventos');
      await expect(page).toHaveURL(/\/eventos$/);
    }).toPass();
    const response = await page.request.get('/up');
    expect(response.ok()).toBe(true);

    const entries = await cachedEntries(page);
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      const { pathname } = new URL(entry.url);
      expect(pathname, entry.url).not.toMatch(/^\/(api|autenticacion|up)(\/|$)/);
      expect(entry.setCookie, entry.url).toBe(false);
      // /offline es la excepción a propósito: el worker la precachea al instalarse y no lee la
      // sesión (la página es estática), aunque Next la sirva con `private, no-store`
      if (pathname !== '/offline') {
        expect(entry.cacheControl, entry.url).not.toMatch(/private|no-store/);
      }
    }
    // Ninguna página quedó guardada: todas dependen de la sesión
    const pages = entries.filter((entry) => entry.cache.startsWith('pcn-pages-'));
    expect(pages.map((entry) => entry.url)).toEqual([]);
  });
});
