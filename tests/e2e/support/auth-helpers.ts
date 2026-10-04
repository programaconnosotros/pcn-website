// Helpers de los specs de auth y charlas: usuarios y eventos propios (con ids y emails únicos, así
// no chocan con los otros specs que corren en paralelo contra la misma base) que se borran solos al
// terminar cada test, y sesiones creadas directo en la base para no gastar el rate limit del login.
import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { BrowserContext, Page } from '@playwright/test';
import type { PrismaClient } from '../../../src/generated/prisma/client';
import { expect as baseExpect, test as base } from './fixtures';
import { E2E_BASE_URL } from './env';

/**
 * El login, el registro y el reseteo hashean con bcrypt (costo 12) en el server, que comparte la
 * CPU con los demás specs: con la suite en paralelo una server action puede tardar varios
 * segundos, así que las esperas de estos specs son más largas que las del config.
 */
export const expect = baseExpect.configure({ timeout: 25_000 });

/** Timeout de los tests de estos specs, acorde a las esperas de `expect`. */
export const SLOW_TEST_TIMEOUT = 120_000;

export const unique = () => `${Date.now().toString(36)}${randomBytes(3).toString('hex')}`;

type UserInput = {
  name?: string;
  password?: string;
  emailVerified?: boolean;
  role?: 'ADMIN' | 'REGULAR';
  phoneNumber?: string | null;
  jobTitle?: string | null;
  enterprise?: string | null;
  career?: string | null;
  studyPlace?: string | null;
};

type EventInput = {
  name?: string;
  daysFromNow?: number;
  callForSpeakersEnabled?: boolean;
  createdById?: string | null;
  organizerIds?: string[];
};

export type Factory = {
  /** Prefijo del área (`auth` o `cha`) que va en los emails e ids que crea. */
  area: string;
  user: (
    _input?: UserInput,
  ) => Promise<{ id: string; email: string; name: string; password: string }>;
  event: (_input?: EventInput) => Promise<{ id: string; name: string }>;
  /** Una charla propia (se borra al final del test). */
  talk: (_data: Parameters<PrismaClient['talk']['create']>[0]['data']) => Promise<{ id: string }>;
  /** Una propuesta PENDING de `userId` para `eventId`, con un orador. */
  proposal: (
    _eventId: string,
    _userId: string,
    _title?: string,
  ) => Promise<{ id: string; title: string }>;
};

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

/**
 * Crea una sesión en la base para `userId` y deja la cookie en `context`, igual que `createSession`
 * pero sin pasar por el login.
 */
export const signInWithSession = async (
  db: PrismaClient,
  context: BrowserContext,
  userId: string,
) => {
  const token = randomBytes(32).toString('base64url');
  await db.session.create({
    data: { id: sha256(token), userId, expires: new Date(Date.now() + 30 * 86_400_000) },
  });
  await context.addCookies([
    { name: 'sessionId', value: token, url: E2E_BASE_URL, httpOnly: true, sameSite: 'Lax' },
  ]);
  return token;
};

/** Completa el formulario de login con cualquier email y contraseña. */
export const fillSignIn = async (page: Page, email: string, password: string) => {
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: /ingresar/ }).click();
};

/** Espera la respuesta de la próxima server action que haga la página. */
export const nextServerAction = (page: Page) =>
  page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && !!response.request().headers()['next-action'],
  );

/**
 * Retiene las server actions hasta llamar a `release`, para poder ver los estados de carga
 * ("ingresando...", "Enviando...") sin depender de que el servidor tarde.
 */
export const holdServerActions = async (page: Page) => {
  let release!: () => void;
  const released = new Promise<void>((resolve) => (release = resolve));
  await page.route('**/*', async (route) => {
    if (route.request().method() === 'POST' && route.request().headers()['next-action']) {
      await released;
    }
    await route.fallback();
  });
  return release;
};

export const test = base.extend<{ area: string; factory: Factory }>({
  area: ['e2e', { option: true }],
  factory: async ({ db, area }, use) => {
    const userIds: string[] = [];
    const eventIds: string[] = [];
    const talkIds: string[] = [];

    const factory: Factory = {
      area,
      user: async (input = {}) => {
        const id = unique();
        const password = input.password ?? `clave-${id}`;
        const name = input.name ?? `Persona ${area.toUpperCase()} ${id.replace(/\d/g, 'x')}`;
        const user = await db.user.create({
          data: {
            email: `e2e-${area}-${id}@e2e.pcn`,
            name,
            // Costo bajo para que sea rápido; el login lo regenera con el costo real
            password: await bcrypt.hash(password, 4),
            emailVerified: input.emailVerified ?? true,
            role: input.role ?? 'REGULAR',
            countryOfOrigin: 'Argentina',
            phoneNumber: input.phoneNumber ?? null,
            jobTitle: input.jobTitle ?? null,
            enterprise: input.enterprise ?? null,
            career: input.career ?? null,
            studyPlace: input.studyPlace ?? null,
          },
        });
        userIds.push(user.id);
        return { id: user.id, email: user.email, name, password };
      },
      event: async (input = {}) => {
        const id = `e2e-${area}-event-${unique()}`;
        const name = input.name ?? `Evento ${area.toUpperCase()} ${id.slice(-8)}`;
        await db.event.create({
          data: {
            id,
            name,
            description: `Descripción de ${name}.`,
            date: new Date(Date.now() + (input.daysFromNow ?? 30) * 86_400_000),
            isOnline: true,
            streamingUrl: 'https://www.youtube.com/watch?v=e2e',
            callForSpeakersEnabled: input.callForSpeakersEnabled ?? false,
            createdById: input.createdById ?? null,
            organizers: input.organizerIds?.length
              ? { create: input.organizerIds.map((userId) => ({ userId })) }
              : undefined,
          },
        });
        eventIds.push(id);
        return { id, name };
      },
      talk: async (data) => {
        const talk = await db.talk.create({ data });
        talkIds.push(talk.id);
        return { id: talk.id };
      },
      proposal: async (eventId, userId, title = `Propuesta ${area.toUpperCase()} ${unique()}`) => {
        const proposal = await db.talkProposal.create({
          data: {
            eventId,
            userId,
            title,
            description: 'Una propuesta creada por la suite e2e.',
            speakers: {
              create: [
                {
                  speakerName: 'Oradora Propuesta',
                  speakerPhone: '5493810000000',
                  isProfessional: true,
                  jobTitle: 'QA',
                  enterprise: 'PCN',
                  userId,
                },
              ],
            },
          },
        });
        return { id: proposal.id, title };
      },
    };

    await use(factory);

    // Las charlas sobreviven al evento y a la propuesta (SetNull): se borran primero
    await db.talk.deleteMany({
      where: { OR: [{ id: { in: talkIds } }, { eventId: { in: eventIds } }] },
    });
    await db.event.deleteMany({ where: { id: { in: eventIds } } });
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { email: true },
    });
    const emails = users.map((user) => user.email);
    await db.emailVerificationToken.deleteMany({ where: { email: { in: emails } } });
    await db.passwordResetToken.deleteMany({ where: { email: { in: emails } } });
    await db.user.deleteMany({ where: { id: { in: userIds } } });
  },
});
