import type { Page } from '@playwright/test';
import type { PrismaClient } from '../../src/generated/prisma/client';
import { latestVerificationCode } from './support/fixtures';
import {
  expect,
  holdServerActions,
  nextServerAction,
  test,
  SLOW_TEST_TIMEOUT,
} from './support/auth-helpers';

// Verificación de email (TC-AUT-010…013). Los emails no salen en e2e: los códigos se leen de la base.

test.use({ area: 'auth' });
test.describe.configure({ timeout: SLOW_TEST_TIMEOUT });

const verifyUrl = (email: string, redirect?: string) =>
  `/autenticacion/verificar-email?email=${encodeURIComponent(email)}${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}`;

const INVALID = 'Código inválido o expirado. Intentá de nuevo.';

/** Espera a que la página mande sola el código al cargar y lo devuelve. */
const sentCode = async (page: Page, db: PrismaClient, email: string, count = 1) => {
  await expect.poll(() => db.emailVerificationToken.count({ where: { email } })).toBe(count);
  // La cuenta regresiva arranca cuando vuelve la respuesta: recién ahí terminó el envío
  await expect(page.getByRole('button', { name: /^Reenviar en \d+s$/ })).toBeVisible();
  return latestVerificationCode(db, email);
};

/** Envía un código y espera la respuesta del servidor. */
const submitCode = async (page: Page, code: string) => {
  await page.getByLabel('Código de verificación').fill(code);
  const response = nextServerAction(page);
  await page.getByRole('button', { name: /verificarEmail/ }).click();
  await response;
};

const wrongCode = (code: string) => (code === '000000' ? '111111' : '000000');

test('TC-AUT-010 Verificar email con el código correcto', async ({ page, factory, db }) => {
  const user = await factory.user({ emailVerified: false });
  await page.goto(verifyUrl(user.email));
  await expect(page.getByRole('heading', { name: 'Verificá tu email' })).toBeVisible();
  const code = await sentCode(page, db, user.email);

  await submitCode(page, code);
  await expect(page.getByRole('heading', { name: '¡Email verificado!' })).toBeVisible();
  await expect(page.getByText('¡Email verificado! Redirigiendo...')).toBeVisible();
  await expect(page).toHaveURL('/');

  expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).emailVerified).toBe(true);
  expect(await db.session.count({ where: { userId: user.id } })).toBe(1);
  expect((await page.context().cookies()).some((c) => c.name === 'sessionId')).toBe(true);
});

test('TC-AUT-011 El código se invalida después de 5 intentos fallidos', async ({
  page,
  factory,
  db,
}) => {
  const user = await factory.user({ emailVerified: false });
  await page.goto(verifyUrl(user.email));
  const code = await sentCode(page, db, user.email);
  const error = page.getByText(INVALID).first();

  for (let attempt = 1; attempt <= 5; attempt++) {
    await submitCode(page, wrongCode(code));
    await expect(error).toBeVisible();
    const token = await db.emailVerificationToken.findFirstOrThrow({
      where: { email: user.email },
    });
    expect(token.attempts).toBe(attempt);
  }

  // El correcto también falla: el código quedó quemado
  await submitCode(page, code);
  await expect(error).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Verificá tu email' })).toBeVisible();
  expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).emailVerified).toBe(false);
  expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
});

test('TC-AUT-012 Reenvío del código con cuenta regresiva', async ({ page, factory, db }) => {
  const user = await factory.user({ emailVerified: false });
  await page.clock.install();
  await page.goto(verifyUrl(user.email));
  const oldCode = await sentCode(page, db, user.email);
  await expect(page.getByRole('button', { name: /^Reenviar en (60|5\d)s$/ })).toBeDisabled();

  // Pasa el minuto de espera: en el navegador y en el servidor (que mira cuándo se creó el código)
  await db.emailVerificationToken.updateMany({
    where: { email: user.email },
    data: { createdAt: new Date(Date.now() - 61_000) },
  });
  await page.clock.runFor('01:01');
  const resend = page.getByRole('button', { name: 'Reenviar código' });
  await expect(resend).toBeEnabled();

  const release = await holdServerActions(page);
  await resend.click();
  await expect(page.getByRole('button', { name: 'Enviando...' })).toBeDisabled();
  release();
  await expect(page.getByText('Nuevo código enviado. Revisá tu correo electrónico.')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Reenviar en (60|5\d)s$/ })).toBeDisabled();
  await page.unrouteAll();

  const newCode = await sentCode(page, db, user.email, 2);
  expect(
    (
      await db.emailVerificationToken.findFirstOrThrow({
        where: { email: user.email, code: oldCode },
      })
    ).used,
  ).toBe(true);

  // El código anterior ya no sirve (salvo que el nuevo haya salido igual, 1 en un millón)
  test.skip(newCode === oldCode, 'el código nuevo salió igual al anterior');
  await submitCode(page, oldCode);
  await expect(page.getByText(INVALID).first()).toBeVisible();
  expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).emailVerified).toBe(false);

  await submitCode(page, newCode);
  await expect(page.getByRole('heading', { name: '¡Email verificado!' })).toBeVisible();
});

test('TC-AUT-013 Verificar email sin parámetro', async ({ page }) => {
  await page.goto('/autenticacion/verificar-email');
  await expect(page.getByText('No se especificó un email para verificar.')).toBeVisible();
  const link = page.getByRole('link', { name: 'irAIniciarSesion();' });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL('/autenticacion/iniciar-sesion');
});

test.describe('extra', () => {
  test('después de verificar respeta el redirect del sitio', async ({ page, factory, db }) => {
    const user = await factory.user({ emailVerified: false });
    await page.goto(verifyUrl(user.email, '/eventos'));
    await submitCode(page, await sentCode(page, db, user.email));
    await expect(page).toHaveURL('/eventos');
  });

  test('un redirect a otro dominio después de verificar termina en el inicio', async ({
    page,
    factory,
    db,
  }) => {
    const user = await factory.user({ emailVerified: false });
    await page.goto(verifyUrl(user.email, 'https://evil.com'));
    await submitCode(page, await sentCode(page, db, user.email));
    await expect(page).toHaveURL('/');
  });

  test('un código vencido no verifica el email', async ({ page, factory, db }) => {
    const user = await factory.user({ emailVerified: false });
    await page.goto(verifyUrl(user.email));
    const code = await sentCode(page, db, user.email);
    await db.emailVerificationToken.updateMany({
      where: { email: user.email },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    await submitCode(page, code);
    await expect(page.getByText(INVALID)).toBeVisible();
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).emailVerified).toBe(false);
  });

  test('el código tiene que ser de 6 dígitos', async ({ page, factory, db }) => {
    const user = await factory.user({ emailVerified: false });
    await page.goto(verifyUrl(user.email));
    await sentCode(page, db, user.email);

    await page.getByLabel('Código de verificación').fill('123');
    await page.getByRole('button', { name: /verificarEmail/ }).click();
    await expect(page.getByText('El código debe tener 6 dígitos')).toBeVisible();

    await page.getByLabel('Código de verificación').fill('12a456');
    await page.getByRole('button', { name: /verificarEmail/ }).click();
    await expect(page.getByText('El código solo puede contener números')).toBeVisible();

    const token = await db.emailVerificationToken.findFirstOrThrow({
      where: { email: user.email },
    });
    expect(token.attempts).toBe(0);
  });

  test('no se manda código a un email ya verificado ni a uno sin cuenta', async ({
    page,
    factory,
    db,
  }) => {
    const verified = await factory.user();
    const missing = `e2e-auth-sin-cuenta-${Date.now()}@e2e.pcn`;

    for (const email of [verified.email, missing]) {
      const response = nextServerAction(page);
      await page.goto(verifyUrl(email));
      await response;
      // La pantalla es la misma, así no revela qué emails tienen cuenta
      await expect(page.getByRole('heading', { name: 'Verificá tu email' })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Reenviar en (60|5\d)s$/ })).toBeDisabled();
      expect(await db.emailVerificationToken.count({ where: { email } })).toBe(0);
    }
  });
});
