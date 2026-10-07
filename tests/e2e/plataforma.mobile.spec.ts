import { expect, test } from './support/fixtures';

// Navegación en el celular (Pixel 7): la barra de pestañas de abajo y el menú completo.

// Con el menú abierto el resto de la página queda aria-hidden (el Sheet es modal), pero la barra
// de pestañas sigue usable: por eso se la busca incluyendo lo oculto.
const tabBar = (page: import('@playwright/test').Page) =>
  page.getByRole('navigation', { name: 'Navegación principal', includeHidden: true });

test('the tab bar navigates between the main sections and marks the current one', async ({
  page,
}) => {
  await page.goto('/');
  await expect(tabBar(page)).toBeVisible();
  for (const name of ['Inicio', 'Eventos', 'Cursos', 'Conversaciones']) {
    await expect(tabBar(page).getByRole('link', { name })).toBeVisible();
  }
  await expect(tabBar(page).getByRole('link', { name: 'Inicio' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await tabBar(page).getByRole('link', { name: 'Eventos' }).click();
  await expect(page).toHaveURL(/\/eventos$/);
  await expect(tabBar(page).getByRole('link', { name: 'Eventos' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(tabBar(page).getByRole('link', { name: 'Inicio' })).not.toHaveAttribute(
    'aria-current',
    'page',
  );

  await tabBar(page).getByRole('link', { name: 'Conversaciones' }).click();
  await expect(page).toHaveURL(/\/conversaciones$/);
  await expect(page.getByRole('textbox', { name: 'Buscar conversaciones' })).toBeVisible();
});

test('the menu tab opens the full menu, filters sections and closes', async ({ page }) => {
  await page.goto('/eventos');
  const open = tabBar(page).getByRole('button', { name: 'Abrir menú' });
  await open.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(
    tabBar(page).getByRole('button', { name: 'Cerrar menú', includeHidden: true }),
  ).toHaveAttribute('aria-expanded', 'true');

  const search = page.getByRole('searchbox', { name: 'Buscar sección' });
  await expect(search).toBeVisible();
  // El buscador no se enfoca solo: no abre el teclado encima del menú
  await expect(search).not.toBeFocused();
  await search.fill('histo');
  await page
    .getByRole('dialog')
    .getByRole('link', { name: /historia/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/historia$/);
  await expect(tabBar(page).getByRole('button', { name: 'Abrir menú' })).toBeVisible();
});

test('another tab closes the open menu and navigates', async ({ page }) => {
  await page.goto('/');
  await tabBar(page).getByRole('button', { name: 'Abrir menú' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await tabBar(page).getByRole('link', { name: 'Feed', includeHidden: true }).click();
  await expect(page).toHaveURL(/\/feed$/);
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('main sections have no horizontal scroll on a phone and filters fold away', async ({
  page,
}) => {
  for (const path of ['/', '/eventos', '/cursos', '/conversaciones', '/miembros', '/changelog']) {
    await page.goto(path);
    await expect(page.getByRole('heading').first()).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), {
        message: path,
      })
      .toBeLessThanOrEqual(0);
  }
  // Las barras de filtros se pliegan detrás de "filtros"
  await page.goto('/conversaciones');
  const toggle = page
    .getByRole('button', { name: /filtros/ })
    .filter({ visible: true })
    .first();
  await expect(page.getByRole('button', { name: /--muchos-participantes/ })).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('button', { name: /--muchos-participantes/ })).toBeVisible();
});
