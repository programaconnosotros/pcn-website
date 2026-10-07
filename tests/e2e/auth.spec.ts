import type { Page } from '@playwright/test';
import {
  expect,
  fillSignIn,
  holdServerActions,
  nextServerAction,
  signInWithSession,
  test,
  SLOW_TEST_TIMEOUT,
} from './support/auth-helpers';

// Login, redirect después del login, rate limit y cierre de sesión (TC-AUT-001…006 y 016).
// Cada test usa un usuario propio: iniciar o cerrar sesión con los del seed tocaría las sesiones
// que comparten los demás specs.

test.use({ area: 'auth' });
test.describe.configure({ timeout: SLOW_TEST_TIMEOUT });

const SIGN_IN = '/autenticacion/iniciar-sesion';

/** Cierra sesión desde el menú de usuario del sidebar (que arranca colapsado, solo con el avatar). */
const signOutFromUserMenu = async (page: Page, name: string) => {
  await page.getByRole('button', { name: 'Mostrar barra lateral' }).first().click();
  await page.getByRole('button', { name: new RegExp(name) }).click();
  await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
};

test('TC-AUT-001 Iniciar sesión con credenciales válidas', async ({ page, factory, db }) => {
  const user = await factory.user();
  await page.goto(SIGN_IN);

  const release = await holdServerActions(page);
  await fillSignIn(page, user.email, user.password);
  await expect(page.getByRole('button', { name: /ingresando\.\.\./ })).toBeVisible();
  release();

  await expect(page.getByText('Hola! 👋')).toBeVisible();
  await expect(page).toHaveURL('/');

  const cookie = (await page.context().cookies()).find((c) => c.name === 'sessionId');
  expect(cookie).toBeDefined();
  expect(cookie!.httpOnly).toBe(true);
  const days = (cookie!.expires * 1000 - Date.now()) / 86_400_000;
  expect(days).toBeGreaterThan(29.9);
  expect(days).toBeLessThanOrEqual(30);
  expect(await db.session.count({ where: { userId: user.id } })).toBe(1);
});

test('TC-AUT-002 Credenciales incorrectas no revelan si el email existe', async ({
  page,
  factory,
}) => {
  const user = await factory.user();
  await page.goto(SIGN_IN);
  const error = page.getByText('Credenciales incorrectas.', { exact: true });

  await fillSignIn(page, `no-existe-${Date.now()}@e2e.pcn`, 'una-clave-cualquiera');
  await expect(error).toBeVisible();
  await expect(page).toHaveURL(SIGN_IN);

  await page.reload();
  await fillSignIn(page, user.email, 'clave-equivocada');
  await expect(error).toBeVisible();
  await expect(page).toHaveURL(SIGN_IN);
  expect((await page.context().cookies()).some((c) => c.name === 'sessionId')).toBe(false);
});

test('TC-AUT-003 Validación del formulario de login', async ({ page }) => {
  await page.goto(SIGN_IN);
  const actions: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST') actions.push(request.url());
  });

  await page.getByLabel('Correo electrónico').fill('agus@');
  await page.getByRole('button', { name: /ingresar/ }).click();

  await expect(page.getByText('Correo electrónico inválido')).toBeVisible();
  await expect(page.getByText('Ingresá tu contraseña')).toBeVisible();
  expect(actions).toEqual([]);
});

test('TC-AUT-004 Login con email sin verificar redirige a verificación', async ({
  page,
  factory,
}) => {
  const user = await factory.user({ emailVerified: false });
  await page.goto(`${SIGN_IN}?redirect=/eventos`);
  await fillSignIn(page, user.email, user.password);

  await expect(page.getByText(/Detectamos que tu email no está verificado/)).toBeVisible();
  await expect(page).toHaveURL(
    `/autenticacion/verificar-email?email=${encodeURIComponent(user.email)}&redirect=${encodeURIComponent('/eventos')}`,
  );
  expect((await page.context().cookies()).some((c) => c.name === 'sessionId')).toBe(false);
});

test('TC-AUT-005 El redirect después del login solo acepta rutas del sitio', async ({
  page,
  factory,
}) => {
  const user = await factory.user();
  const attempts = [
    ['https://evil.com', '/'],
    ['//evil.com', '/'],
    ['/\\evil', '/'],
    ['/eventos', '/eventos'],
  ] as const;

  for (const [redirect, expected] of attempts) {
    await page.context().clearCookies();
    await page.goto(`${SIGN_IN}?redirect=${encodeURIComponent(redirect)}`);
    await fillSignIn(page, user.email, user.password);
    await expect(page, `redirect=${redirect}`).toHaveURL(expected);
    expect((await page.context().cookies()).some((c) => c.name === 'sessionId')).toBe(true);
  }
});

test('TC-AUT-006 Rate limit de intentos de login', async ({ page, factory }) => {
  test.setTimeout(4 * 60_000);
  const user = await factory.user();
  await page.goto(SIGN_IN);

  // 20 intentos fallidos permitidos por IP en 15 minutos (cada test tiene su propia IP)
  for (let attempt = 1; attempt <= 20; attempt++) {
    const response = nextServerAction(page);
    await fillSignIn(page, user.email, `clave-equivocada-${attempt}`);
    await response;
    await expect(page.getByRole('button', { name: /ingresar\(\);/ })).toBeEnabled();
  }

  // El intento 21 se frena aunque la contraseña sea la correcta
  await fillSignIn(page, user.email, user.password);
  await expect(
    page.getByText(
      /^Hubo demasiados intentos de inicio de sesión seguidos\. Para proteger tu cuenta pausamos los intentos por un rato: probá de nuevo en \d+ minutos\.$/,
    ),
  ).toBeVisible();
  await expect(page).toHaveURL(SIGN_IN);
  expect((await page.context().cookies()).some((c) => c.name === 'sessionId')).toBe(false);
});

test('TC-AUT-016 Cerrar sesión', async ({ page, factory, db }) => {
  const user = await factory.user();
  await signInWithSession(db, page.context(), user.id);

  // /perfil es privada: muestra el email de quien inició sesión
  await page.goto('/perfil');
  await expect(page).toHaveURL('/perfil');
  await signOutFromUserMenu(page, user.name);

  await expect(page).toHaveURL(SIGN_IN);
  expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
  expect((await page.context().cookies()).some((c) => c.name === 'sessionId')).toBe(false);

  await page.goBack();
  await expect(page).not.toHaveURL(/\/perfil/);
  await expect(page.getByText(user.email)).toHaveCount(0);
  await expect(page.getByRole('link', { name: /iniciarSesion/ }).first()).toBeVisible();
});

test.describe('extra', () => {
  test('el email del query string viene precargado en el login', async ({ page }) => {
    await page.goto(`${SIGN_IN}?email=${encodeURIComponent('alguien@e2e.pcn')}`);
    await expect(page.getByLabel('Correo electrónico')).toHaveValue('alguien@e2e.pcn');
  });

  test('el login lleva a registro y a recuperar contraseña conservando el redirect', async ({
    page,
  }) => {
    await page.goto(`${SIGN_IN}?redirect=/eventos`);
    await page.getByRole('link', { name: '¿No tenés cuenta? Creá una' }).click();
    await expect(page).toHaveURL(
      `/autenticacion/registro?redirect=${encodeURIComponent('/eventos')}`,
    );
    await page.getByRole('link', { name: 'Olvidé mi contraseña' }).click();
    await expect(page).toHaveURL('/autenticacion/recuperar-clave');
  });

  test('una cookie de sesión vieja deja de servir después de cerrar sesión', async ({
    page,
    factory,
    db,
  }) => {
    const user = await factory.user();
    const token = await signInWithSession(db, page.context(), user.id);
    await page.goto('/perfil');
    await signOutFromUserMenu(page, user.name);
    await expect(page).toHaveURL(SIGN_IN);

    // Alguien que se copió la cookie no puede volver a usarla: la fila de la sesión ya no existe
    await page
      .context()
      .addCookies([
        { name: 'sessionId', value: token, url: page.url(), httpOnly: true, sameSite: 'Lax' },
      ]);
    await page.goto('/perfil');
    await expect(page).toHaveURL('/');
  });
});
