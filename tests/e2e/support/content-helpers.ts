// Helpers para los specs de contenido (galería, perfil, consejos, testimonios, proyectos, lectura):
// usuarios propios por test, así los cambios no pisan los datos sembrados que comparten los specs.
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { Browser, Page } from '@playwright/test';
import type { PrismaClient } from '../../../src/generated/prisma/client';
import { PASSWORD, USERS, type Role } from './data';
import { E2E_BASE_URL } from './env';

/** Un id corto y único, prefijado por área (`e2e-con-…`). */
export const uniqueId = (prefix: string) => `${prefix}-${randomUUID().slice(0, 8)}`;

export type CreatedUser = { id: string; email: string; name: string; password: string };

/**
 * Crea un usuario verificado con email único (`<prefix>-xxxx@e2e.pcn`). Contraseña: PASSWORD.
 * `data` pisa los campos por defecto (rol, slogan…).
 */
export const createUser = async (
  db: PrismaClient,
  prefix: string,
  data: Partial<{
    name: string;
    role: 'ADMIN' | 'REGULAR';
    slogan: string;
    countryOfOrigin: string;
  }> = {},
): Promise<CreatedUser> => {
  const id = uniqueId(prefix);
  const email = `${id}@e2e.pcn`;
  const name = data.name ?? `Usuario ${id}`;
  const user = await db.user.create({
    data: {
      email,
      name,
      password: await bcrypt.hash(PASSWORD, 4),
      emailVerified: true,
      countryOfOrigin: 'Argentina',
      ...data,
    },
  });
  return { id: user.id, email, name: user.name, password: PASSWORD };
};

/** Inicia sesión con el formulario y espera a salir de /autenticacion. */
export const signIn = async (page: Page, user: { email: string; password?: string }) => {
  await page.goto('/autenticacion/iniciar-sesion');
  await page.getByLabel('Correo electrónico').fill(user.email);
  await page.getByLabel('Contraseña').fill(user.password ?? PASSWORD);
  await page.getByRole('button', { name: /ingresar/ }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/autenticacion'));
};

/** El id de un usuario sembrado (data.ts). */
export const seededUserId = async (db: PrismaClient, role: Role) =>
  (await db.user.findUniqueOrThrow({ where: { email: USERS[role].email }, select: { id: true } }))
    .id;

/**
 * Vence las lecturas cacheadas del servidor (src/lib/cache.ts) que dependen de User, como los
 * listados de consejos y proyectos. Lo que el test escribe con `db` no las vence; el primer login
 * de un usuario recién creado sí, porque la app regenera el hash de su contraseña (una escritura en
 * User). Inicia sesión en un contexto aparte, así no toca la sesión del test.
 */
export const expireCachedReads = async (browser: Browser, db: PrismaClient) => {
  const user = await createUser(db, 'e2e-cache');
  const octet = () => Math.floor(Math.random() * 256);
  const context = await browser.newContext({
    baseURL: E2E_BASE_URL,
    extraHTTPHeaders: { 'x-forwarded-for': `198.19.${octet()}.${octet()}` },
  });
  try {
    await signIn(await context.newPage(), user);
  } finally {
    await context.close();
  }
};
