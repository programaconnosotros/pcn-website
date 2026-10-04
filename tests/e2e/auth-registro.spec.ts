import type { Page } from '@playwright/test';
import { USERS } from './support/data';
import { expect, test, unique, SLOW_TEST_TIMEOUT } from './support/auth-helpers';

// Registro (TC-AUT-007…009). Las cuentas que crea el formulario se borran al terminar cada test.

test.use({ area: 'auth' });
test.describe.configure({ timeout: SLOW_TEST_TIMEOUT });

const SIGN_UP = '/autenticacion/registro';
const created: string[] = [];

test.afterEach(async ({ db }) => {
  const emails = created.splice(0);
  await db.emailVerificationToken.deleteMany({ where: { email: { in: emails } } });
  await db.user.deleteMany({ where: { email: { in: emails } } });
});

const newEmail = () => {
  const email = `e2e-auth-registro-${unique()}@e2e.pcn`;
  created.push(email);
  return email;
};

const choose = async (page: Page, label: string, option: string) => {
  await page.getByLabel(label).click();
  await page.getByRole('option', { name: option, exact: true }).click();
};

const fillAccount = async (
  page: Page,
  data: { name: string; email: string; password: string; confirm?: string },
) => {
  await page.getByLabel('Nombre completo').fill(data.name);
  await page.getByLabel('Correo electrónico').fill(data.email);
  await page.getByLabel('Contraseña', { exact: true }).fill(data.password);
  await page.getByLabel('Confirmar contraseña').fill(data.confirm ?? data.password);
};

const submit = (page: Page) => page.getByRole('button', { name: /crearCuenta/ }).click();

test('TC-AUT-007 Registro con datos válidos', async ({ page, db }) => {
  const email = newEmail();
  await page.goto(SIGN_UP);
  await fillAccount(page, { name: 'Ada Lovelace', email, password: 'una-clave-larga' });
  await choose(page, 'País', 'Argentina');
  await choose(page, 'Provincia', 'Tucumán');
  await submit(page);

  await expect(page.getByText('Usuario creado exitosamente! 🥳')).toBeVisible();
  await expect(page).toHaveURL(`/autenticacion/verificar-email?email=${encodeURIComponent(email)}`);

  const user = await db.user.findUniqueOrThrow({ where: { email } });
  expect(user).toMatchObject({
    name: 'Ada Lovelace',
    emailVerified: false,
    countryOfOrigin: 'Argentina',
    province: 'Tucumán',
  });
  // El email no sale en e2e: alcanza con que se haya generado el código que lleva
  expect(await db.emailVerificationToken.count({ where: { email, used: false } })).toBe(1);
});

test('TC-AUT-008 Validaciones del registro', async ({ page, db }) => {
  const email = newEmail();
  await page.goto(SIGN_UP);
  // Los mensajes debajo de cada campo (el primero también sale en un toast)
  const form = page.locator('form');

  await fillAccount(page, { name: 'A', email, password: 'corta77' });
  await submit(page);
  await expect(form.getByText('El nombre debe tener al menos 2 caracteres')).toBeVisible();
  await expect(form.getByText('La contraseña debe tener al menos 8 caracteres')).toBeVisible();

  await fillAccount(page, { name: 'Agus 2', email, password: 'x'.repeat(73) });
  await expect(form.getByText(/El nombre solo puede contener letras/)).toBeVisible();
  await expect(form.getByText('La contraseña no puede tener más de 72 caracteres')).toBeVisible();

  await fillAccount(page, {
    name: 'Agus',
    email,
    password: 'una-clave-larga',
    confirm: 'otra-clave-larga',
  });
  await choose(page, 'País', 'Argentina');
  await submit(page);
  await expect(form.getByText('Las contraseñas no coinciden')).toBeVisible();
  await expect(form.getByText('La provincia es requerida si el país es Argentina')).toBeVisible();

  await expect(page).toHaveURL(SIGN_UP);
  expect(await db.user.count({ where: { email } })).toBe(0);
});

test('TC-AUT-009 Registro con email ya usado', async ({ page, db }) => {
  await page.goto(SIGN_UP);
  await fillAccount(page, {
    name: 'Otra Persona',
    email: USERS.member.email,
    password: 'una-clave-larga',
  });
  await choose(page, 'País', 'Uruguay');
  await submit(page);

  await expect(page.getByText('Ya hay un usuario con ese correo electrónico.')).toBeVisible();
  await expect(page).toHaveURL(SIGN_UP);
  const users = await db.user.findMany({ where: { email: USERS.member.email } });
  expect(users).toHaveLength(1);
  expect(users[0].name).toBe(USERS.member.name);
});

test.describe('extra', () => {
  test('fuera de Argentina no pide provincia', async ({ page, db }) => {
    const email = newEmail();
    await page.goto(SIGN_UP);
    await fillAccount(page, { name: 'Grace Hopper', email, password: 'una-clave-larga' });
    await choose(page, 'País', 'Argentina');
    await expect(page.getByLabel('Provincia')).toBeVisible();
    await choose(page, 'País', 'Chile');
    await expect(page.getByLabel('Provincia')).toHaveCount(0);
    await submit(page);

    await expect(page).toHaveURL(/\/autenticacion\/verificar-email\?email=/);
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    expect(user).toMatchObject({ countryOfOrigin: 'Chile', province: null });
  });

  test('sin país no se puede crear la cuenta', async ({ page, db }) => {
    const email = newEmail();
    await page.goto(SIGN_UP);
    await fillAccount(page, { name: 'Grace Hopper', email, password: 'una-clave-larga' });
    await submit(page);
    await expect(page.locator('form').getByText('El país es requerido')).toBeVisible();
    expect(await db.user.count({ where: { email } })).toBe(0);
  });

  test('los datos opcionales se guardan en el perfil', async ({ page, db }) => {
    const email = newEmail();
    await page.goto(SIGN_UP);
    await fillAccount(page, { name: 'Linus Torvalds', email, password: 'una-clave-larga' });
    await page.getByLabel('Celular').fill('5493815123456');
    await choose(page, 'País', 'España');
    await page.getByLabel('¿De qué trabajás?').fill('Kernel Developer');
    await page.getByLabel('¿En qué empresa?').fill('Linux Foundation');
    await page.getByLabel('¿Qué estudiás o estudiaste?').fill('Ciencias de la Computación');
    await page.getByLabel('¿Dónde estudiás?').fill('Universidad de Helsinki');
    await submit(page);

    await expect(page).toHaveURL(/\/autenticacion\/verificar-email\?email=/);
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    expect(user).toMatchObject({
      phoneNumber: '5493815123456',
      jobTitle: 'Kernel Developer',
      enterprise: 'Linux Foundation',
      career: 'Ciencias de la Computación',
      studyPlace: 'Universidad de Helsinki',
    });
  });

  test('el redirect del registro pasa a la verificación', async ({ page }) => {
    const email = newEmail();
    await page.goto(`${SIGN_UP}?redirect=/eventos`);
    await fillAccount(page, { name: 'Ada Lovelace', email, password: 'una-clave-larga' });
    await choose(page, 'País', 'Perú');
    await submit(page);
    await expect(page).toHaveURL(
      `/autenticacion/verificar-email?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent('/eventos')}`,
    );
  });

  test('un redirect a otro dominio no llega a la verificación', async ({ page }) => {
    const email = newEmail();
    await page.goto(`${SIGN_UP}?redirect=${encodeURIComponent('https://evil.com')}`);
    await fillAccount(page, { name: 'Ada Lovelace', email, password: 'una-clave-larga' });
    await choose(page, 'País', 'Perú');
    await submit(page);
    await expect(page).toHaveURL(
      `/autenticacion/verificar-email?email=${encodeURIComponent(email)}`,
    );
  });
});
