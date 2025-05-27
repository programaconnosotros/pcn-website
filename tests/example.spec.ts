import { test, expect } from '@playwright/test';

test.use({
  headless: true,
});

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await expect(page).toHaveTitle('programaConNosotros');
});

test('has menu item', async ({ page }) => {
  await page.goto('http://localhost:3000');

  page.getByRole('listitem').filter({ hasText: 'menu-item' });
});

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
