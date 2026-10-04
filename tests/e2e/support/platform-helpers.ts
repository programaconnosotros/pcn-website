// Helpers de los specs de plataforma (entrevistas, búsqueda, PCN OS, PWA, navegación): usuarios
// propios con sesión creada directo en la base, así no pasan por el formulario de login ni pisan
// los datos sembrados que comparten los demás specs.
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { BrowserContext, Page } from '@playwright/test';
import type { PrismaClient } from '../../../src/generated/prisma/client';
import { E2E_BASE_URL } from './env';
import { PASSWORD } from './data';

/** Un id corto y único, prefijado por área (`e2e-plt-…`). */
export const platformId = (prefix: string) => `${prefix}-${randomUUID().slice(0, 8)}`;

export type PlatformUser = { id: string; email: string; name: string };

/** Crea un usuario verificado con email único (`<prefix>-xxxx@e2e.pcn`) y contraseña PASSWORD. */
export const createPlatformUser = async (
  db: PrismaClient,
  prefix: string,
  data: Partial<{ name: string; role: 'ADMIN' | 'REGULAR' }> = {},
): Promise<PlatformUser> => {
  const id = platformId(prefix);
  const email = `${id}@e2e.pcn`;
  const user = await db.user.create({
    data: {
      email,
      name: data.name ?? `Usuario ${id}`,
      password: await bcrypt.hash(PASSWORD, 4),
      emailVerified: true,
      countryOfOrigin: 'Argentina',
      role: data.role ?? 'REGULAR',
    },
  });
  return { id: user.id, email, name: user.name };
};

/**
 * Deja al contexto logueado como `userId`: crea la fila de Session (la base guarda el sha256 del
 * token, como src/lib/session.ts) y pone la cookie `sessionId` con el token.
 */
export const signInAs = async (context: BrowserContext, db: PrismaClient, userId: string) => {
  const token = randomBytes(32).toString('base64url');
  await db.session.create({
    data: {
      id: createHash('sha256').update(token).digest('hex'),
      userId,
      expires: new Date(Date.now() + 86_400_000),
    },
  });
  await context.addCookies([
    { name: 'sessionId', value: token, url: E2E_BASE_URL, httpOnly: true, sameSite: 'Lax' },
  ]);
};

/** Borra el usuario (y en cascada sus sesiones y marcas). */
export const deletePlatformUser = (db: PrismaClient, userId: string) =>
  db.user.deleteMany({ where: { id: userId } });

/**
 * Junta los errores de consola, las excepciones sin atrapar y las violaciones de CSP de la página.
 * `ignore` filtra ruido conocido (p. ej. recursos externos bloqueados en el entorno de test).
 */
export const collectPageErrors = (page: Page, ignore: RegExp[] = []) => {
  const errors: string[] = [];
  const keep = (text: string) => !ignore.some((pattern) => pattern.test(text));
  const origin = new URL(E2E_BASE_URL).origin;
  page.on('console', (message) => {
    if (message.type() !== 'error' || !keep(message.text())) return;
    // Lo que loguean los iframes de otros sitios (el reproductor de YouTube) no es del sitio
    const { url } = message.location();
    if (url && !url.startsWith(origin)) return;
    errors.push(message.text());
  });
  page.on('pageerror', (error) => {
    if (keep(error.message)) errors.push(`pageerror: ${error.message}`);
  });
  return errors;
};
