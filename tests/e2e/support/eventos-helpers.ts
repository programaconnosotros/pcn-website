// Helpers para los specs de eventos, notificaciones y admin: usuarios y eventos propios por test,
// así las inscripciones, cupos y roles que cambian no pisan los datos sembrados que comparten los
// specs.
//
// Ojo con la caché de datos (src/lib/cache.ts): lo que se escribe acá va directo a la base y no
// expira las lecturas cacheadas del servidor. Por eso cada test crea todo lo que necesita ANTES de
// que la app lo lea, y después lo cambia solo a través de la app.
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { Browser, Page } from '@playwright/test';
import type { PrismaClient } from '../../../src/generated/prisma/client';
import { E2E_BASE_URL } from './env';
import { PASSWORD, USERS, type Role } from './data';

const DAY = 86_400_000;

/** Un id corto y único, prefijado por área (`e2e-evt-…`). */
export const uniqueId = (prefix: string) => `${prefix}-${randomUUID().slice(0, 8)}`;

export type CreatedUser = { id: string; email: string; name: string };

/** Crea un usuario verificado con email único (`<prefix>-xxxx@e2e.pcn`). Contraseña: PASSWORD. */
export const createUser = async (
  db: PrismaClient,
  prefix: string,
  data: Partial<{
    name: string;
    role: 'ADMIN' | 'REGULAR';
    isAmbassador: boolean;
    jobTitle: string;
    enterprise: string;
    career: string;
    studyPlace: string;
  }> = {},
): Promise<CreatedUser> => {
  const id = uniqueId(prefix);
  const email = `${id}@e2e.pcn`;
  const user = await db.user.create({
    data: {
      id,
      email,
      name: data.name ?? `Persona ${id}`,
      password: await bcrypt.hash(PASSWORD, 4),
      emailVerified: true,
      countryOfOrigin: 'Argentina',
      ...data,
    },
  });
  return { id: user.id, email, name: user.name };
};

export type EventInput = Partial<{
  name: string;
  daysFromNow: number;
  capacity: number | null;
  isOnline: boolean;
  externalRegistrationUrl: string;
  createdById: string;
  organizerIds: string[];
  callForSpeakersEnabled: boolean;
}>;

/** Crea un evento (por defecto presencial, en dos semanas y sin cupo) con id `<prefix>-xxxx`. */
export const createEvent = async (db: PrismaClient, prefix: string, input: EventInput = {}) => {
  const id = uniqueId(prefix);
  const isOnline = input.isOnline ?? false;
  return db.event.create({
    data: {
      id,
      name: input.name ?? `Evento ${id}`,
      description: `Descripción del evento ${id}.`,
      date: new Date(Date.now() + (input.daysFromNow ?? 14) * DAY),
      capacity: input.capacity ?? null,
      isOnline,
      city: isOnline ? null : 'Córdoba',
      placeName: isOnline ? null : 'Cowork E2E',
      address: isOnline ? null : 'Calle Falsa 123',
      externalRegistrationUrl: input.externalRegistrationUrl ?? null,
      callForSpeakersEnabled: input.callForSpeakersEnabled ?? false,
      createdById: input.createdById ?? null,
      organizers: input.organizerIds?.length
        ? { create: input.organizerIds.map((userId) => ({ userId })) }
        : undefined,
    },
  });
};

/** Inscribe a cada usuario al evento, en ese orden (directo en la base). */
export const register = async (db: PrismaClient, eventId: string, users: { id: string }[]) => {
  for (const user of users) {
    await db.eventRegistration.create({ data: { eventId, userId: user.id } });
  }
};

/** Anota a cada usuario en la lista de espera, en ese orden (un milisegundo entre cada uno). */
export const waitlist = async (db: PrismaClient, eventId: string, users: { id: string }[]) => {
  const start = Date.now() - 60_000;
  for (const [index, user] of users.entries()) {
    await db.eventWaitlistEntry.create({
      data: { eventId, userId: user.id, createdAt: new Date(start + index * 1000) },
    });
  }
};

/** El id de un usuario sembrado (data.ts). */
export const seededUserId = async (db: PrismaClient, role: Role) =>
  (await db.user.findUniqueOrThrow({ where: { email: USERS[role].email }, select: { id: true } }))
    .id;

/**
 * Inicia sesión con el formulario y espera a llegar a `to` (por defecto el inicio). Pasar la página
 * de destino ahorra renderizar el inicio, que es la página más pesada del sitio.
 */
export const signIn = async (page: Page, user: { email: string }, to = '/') => {
  await page.goto(
    to === '/' ? '/autenticacion/iniciar-sesion' : `/autenticacion/iniciar-sesion?redirect=${to}`,
  );
  await page.getByLabel('Correo electrónico').fill(user.email);
  await page.getByLabel('Contraseña').fill(PASSWORD);
  await page.getByRole('button', { name: /ingresar/ }).click();
  await page.waitForURL((url) => url.pathname === to);
};

/**
 * Una página nueva en su propio contexto (otro navegador), con la misma IP del test y el modo
 * clásico de PCN OS. Si se pasa `user`, inicia sesión con él.
 */
export const openBrowserAs = async (
  browser: Browser,
  clientIp: string,
  user?: { email: string },
  to = '/',
) => {
  const context = await browser.newContext({
    baseURL: E2E_BASE_URL,
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
    extraHTTPHeaders: { 'x-forwarded-for': clientIp },
  });
  await context.addInitScript(() => {
    try {
      localStorage.setItem('pcn-os-mode', 'classic');
    } catch {}
  });
  const page = await context.newPage();
  if (user) await signIn(page, user, to);
  return page;
};

/** Abre una página y espera a que termine de hidratar (sin requests pendientes). */
export const gotoReady = async (page: Page, path: string) => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
};
