import { test as base, expect, type Page } from '@playwright/test';
import { PrismaClient } from '../../../src/generated/prisma/client';
import { pgAdapter } from '../../../src/lib/database-url';
import { e2eDatabaseUrl } from './env';
import { PASSWORD, storageStatePath, USERS, type Role, type SignedInRole } from './data';

export { expect };

/** Modo de PCN OS para el test. Por defecto `classic`: el sitio sin escritorio ni ventanas. */
export type OsMode = 'classic' | 'lite' | 'full';

let prisma: PrismaClient | undefined;
const database = () => (prisma ??= new PrismaClient({ adapter: pgAdapter(e2eDatabaseUrl()) }));

type Fixtures = {
  /** Sesión con la que arranca el test: un rol con storage state, o `null` para anónimo. */
  as: SignedInRole | null;
  osMode: OsMode;
  /** Prisma contra la base e2e, para preparar datos o verificar lo que guardó la app. */
  db: PrismaClient;
};

export const test = base.extend<Fixtures>({
  as: [null, { option: true }],
  osMode: ['classic', { option: true }],
  storageState: async ({ as }, use) => {
    await use(as ? storageStatePath(as) : { cookies: [], origins: [] });
  },
  page: async ({ page, osMode }, use) => {
    await page.addInitScript((mode) => {
      try {
        localStorage.setItem('pcn-os-mode', mode);
      } catch {}
    }, osMode);
    await use(page);
  },
  db: async ({}, use) => {
    await use(database());
  },
});

/** Inicia sesión desde el formulario. Para tests de login; el resto usa `test.use({ as })`. */
export const signInThroughForm = async (page: Page, role: Role, password = PASSWORD) => {
  await page.goto('/autenticacion/iniciar-sesion');
  await page.getByLabel('Correo electrónico').fill(USERS[role].email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: /ingresar/ }).click();
};

/** El último código de verificación de email que se generó para `email`. */
export const latestVerificationCode = async (db: PrismaClient, email: string) => {
  const token = await db.emailVerificationToken.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' },
  });
  if (!token) throw new Error(`No hay código de verificación para ${email}`);
  return token.code;
};

/** El último código de recuperación de contraseña de `email`. */
export const latestResetCode = async (db: PrismaClient, email: string) => {
  const token = await db.passwordResetToken.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' },
  });
  if (!token) throw new Error(`No hay código de recuperación para ${email}`);
  return token.code;
};
