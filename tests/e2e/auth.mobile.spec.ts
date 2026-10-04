import {
  expect,
  fillSignIn,
  signInWithSession,
  test,
  SLOW_TEST_TIMEOUT,
} from './support/auth-helpers';

// Login y cierre de sesión en el celular (Pixel 7): el menú de usuario vive en el sidebar que se
// abre como panel.

test.use({ area: 'auth' });
test.describe.configure({ timeout: SLOW_TEST_TIMEOUT });

test('iniciar sesión desde el celular', async ({ page, factory, db }) => {
  const user = await factory.user();
  await page.goto('/autenticacion/iniciar-sesion');
  await fillSignIn(page, user.email, user.password);
  await expect(page.getByText('Hola! 👋')).toBeVisible();
  await expect(page).toHaveURL('/');
  expect(await db.session.count({ where: { userId: user.id } })).toBe(1);
});

test('cerrar sesión desde el menú del celular', async ({ page, factory, db }) => {
  const user = await factory.user();
  await signInWithSession(db, page.context(), user.id);
  await page.goto('/eventos');

  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page.getByRole('button', { name: new RegExp(user.name) }).click();
  await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();

  await expect(page).toHaveURL('/autenticacion/iniciar-sesion');
  expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
});

test('el registro entra en la pantalla del celular sin scroll horizontal', async ({ page }) => {
  await page.goto('/autenticacion/registro');
  await expect(page.getByRole('button', { name: /crearCuenta/ })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
