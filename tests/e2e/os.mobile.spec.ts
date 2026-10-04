import { expect, test } from './support/fixtures';

// PCN OS en el celular (Pixel 7, 412 px): nunca carga el escritorio, aunque el modo elegido sea
// el completo.

test.use({ osMode: 'full' });

test('a phone never loads the PCN OS desktop, even in full mode', async ({ page }) => {
  const desktopChunks: string[] = [];
  page.on('request', (request) => {
    if (/os-desktop-parts/.test(request.url())) desktopChunks.push(request.url());
  });

  await page.goto('/eventos');
  await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('eventos');
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
  await expect(page.locator('html[data-app-ready]')).toBeAttached();

  await expect(page.getByRole('navigation', { name: 'Dock' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'PCN_OS' })).toBeHidden();
  await expect(page.locator('iframe')).toHaveCount(0);
  // Ni "Volver a PCN OS": el layout clásico es el único en el celular
  await expect(page.getByRole('button', { name: 'Volver a PCN OS' })).toBeHidden();
  expect(desktopChunks).toEqual([]);
});

test('rotating the phone to landscape still keeps the classic layout', async ({ page }) => {
  await page.goto('/cursos');
  await page.setViewportSize({ width: 915, height: 412 });
  await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('cursos');
  await expect(page.getByRole('navigation', { name: 'Dock' })).toHaveCount(0);
});
