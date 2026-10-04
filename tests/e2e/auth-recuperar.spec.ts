import bcrypt from 'bcryptjs';
import type { Page } from '@playwright/test';
import { E2E_BASE_URL } from './support/env';
import { latestResetCode } from './support/fixtures';
import {
  expect,
  fillSignIn,
  signInWithSession,
  test,
  SLOW_TEST_TIMEOUT,
} from './support/auth-helpers';

// Recuperar contraseña (TC-AUT-014 y 015). Los emails no salen en e2e: el código se lee de la base.

test.use({ area: 'auth' });
test.describe.configure({ timeout: SLOW_TEST_TIMEOUT });

const RESET = '/autenticacion/recuperar-clave';
const SENT = 'Código enviado. Revisá tu correo electrónico.';

const requestCode = async (page: Page, email: string) => {
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByRole('button', { name: /enviarCodigo/ }).click();
};

const enterCode = async (page: Page, code: string) => {
  await page.getByLabel('Código de verificación').fill(code);
  await page.getByRole('button', { name: /verificarCodigo/ }).click();
};

const choosePassword = async (page: Page, password: string, confirm = password) => {
  await page.getByLabel('Nueva contraseña').fill(password);
  await page.getByLabel('Confirmar contraseña').fill(confirm);
  await page.getByRole('button', { name: /actualizarClave/ }).click();
};

test('TC-AUT-014 Recuperar contraseña de punta a punta', async ({
  page,
  browser,
  clientIp,
  factory,
  db,
}) => {
  test.setTimeout(3 * 60_000);
  const user = await factory.user();

  // El "otro navegador", con la sesión abierta
  const other = await browser.newContext({ extraHTTPHeaders: { 'x-forwarded-for': clientIp } });
  await signInWithSession(db, other, user.id);
  const otherPage = await other.newPage();
  await otherPage.goto(`${E2E_BASE_URL}/perfil`);
  await expect(otherPage).toHaveURL(`${E2E_BASE_URL}/perfil`);

  await page.goto(RESET);
  await expect(page.getByRole('heading', { name: 'Restablecer contraseña' })).toBeVisible();
  await requestCode(page, user.email);
  await expect(page.getByText(SENT)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Verificar código' })).toBeVisible();

  await enterCode(page, await latestResetCode(db, user.email));
  await expect(
    page.getByText('Código verificado. Ahora podés crear tu nueva contraseña.'),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Nueva contraseña' })).toBeVisible();

  const newPassword = 'mi-clave-nueva-segura';
  await choosePassword(page, newPassword);
  await expect(page.getByRole('heading', { name: '¡Contraseña actualizada!' })).toBeVisible();
  expect(await db.session.count({ where: { userId: user.id } })).toBe(0);

  // El otro navegador quedó afuera: /perfil sin sesión manda al inicio
  await otherPage.reload();
  await expect(otherPage).toHaveURL(`${E2E_BASE_URL}/`);

  // La clave vieja ya no sirve y la nueva sí (la vieja se chequea contra el hash para no sumar
  // otro login, que con bcrypt de costo 12 es lo más lento del test)
  const stored = await db.user.findUniqueOrThrow({
    where: { id: user.id },
    omit: { password: false },
  });
  expect(await bcrypt.compare(user.password, stored.password)).toBe(false);
  await page.getByRole('link', { name: /iniciarSesion/ }).click();
  await expect(page).toHaveURL('/autenticacion/iniciar-sesion');
  await fillSignIn(page, user.email, newPassword);
  await expect(page).toHaveURL('/');
  await other.close();
});

test('TC-AUT-015 Recuperar contraseña de un email inexistente', async ({ page, db }) => {
  const email = `e2e-auth-sin-cuenta-${Date.now()}@e2e.pcn`;
  await page.goto(RESET);
  await requestCode(page, email);

  await expect(page.getByText(SENT)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Verificar código' })).toBeVisible();
  await expect(page.getByRole('main').getByText(email)).toBeVisible();
  expect(await db.passwordResetToken.count({ where: { email } })).toBe(0);
});

test.describe('extra', () => {
  test('un código incorrecto no deja pasar al paso de la clave', async ({ page, factory, db }) => {
    const user = await factory.user();
    await page.goto(RESET);
    await requestCode(page, user.email);
    await expect(page.getByText(SENT)).toBeVisible();

    const code = await latestResetCode(db, user.email);
    await enterCode(page, code === '000000' ? '111111' : '000000');
    await expect(
      page.getByText('Código inválido o vencido. Revisalo o pedí uno nuevo.'),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Verificar código' })).toBeVisible();
  });

  test('la clave nueva se valida antes de guardarla', async ({ page, factory, db }) => {
    const user = await factory.user();
    await page.goto(RESET);
    await requestCode(page, user.email);
    await expect(page.getByText(SENT)).toBeVisible();
    await enterCode(page, await latestResetCode(db, user.email));
    await expect(page.getByRole('heading', { name: 'Nueva contraseña' })).toBeVisible();

    await choosePassword(page, 'corta');
    await expect(page.getByText('La contraseña debe tener al menos 8 caracteres')).toBeVisible();
    await choosePassword(page, 'una-clave-larga', 'otra-clave-larga');
    await expect(page.getByText('Las contraseñas no coinciden')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Nueva contraseña' })).toBeVisible();
    const stored = await db.user.findUniqueOrThrow({
      where: { id: user.id },
      omit: { password: false },
    });
    expect(stored.password.startsWith('$2b$04$') || stored.password.startsWith('$2a$04$')).toBe(
      true,
    );
  });

  test('pedir otro código para el mismo email antes del minuto avisa la espera', async ({
    page,
    factory,
  }) => {
    const user = await factory.user();
    await page.goto(RESET);
    await requestCode(page, user.email);
    await expect(page.getByText(SENT)).toBeVisible();
    await expect(page.getByRole('button', { name: /^Reenviar en \d+s$/ })).toBeDisabled();

    await page.getByRole('button', { name: '← Cambiar email' }).click();
    await requestCode(page, user.email);
    await expect(
      page.getByText(/^Ya pediste varios códigos en los últimos minutos\./),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Restablecer contraseña' })).toBeVisible();
  });

  test('el email del reseteo tiene que ser válido', async ({ page }) => {
    await page.goto(RESET);
    await requestCode(page, 'agus@');
    await expect(page.getByText('Correo electrónico inválido')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Restablecer contraseña' })).toBeVisible();
  });
});
