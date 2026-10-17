import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import type { Prisma, Role } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { hashSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '@/lib/session';
import { DUMMY_PASSWORD_HASH } from '@/lib/password';

// Helpers de los tests de integración de eventos, charlas, anuncios, galería, métricas y logs.

export const uniqueId = () => randomBytes(6).toString('hex');

const DAY = 86_400_000;
export const daysFromNow = (days: number) => new Date(Date.now() + days * DAY);

/** Un evento real (presencial, a futuro salvo que se diga otra cosa). */
export const createTestEvent = (data: Partial<Prisma.EventUncheckedCreateInput> = {}) =>
  prisma.event.create({
    data: {
      name: `Evento ${uniqueId()}`,
      description: 'Un evento de prueba de la comunidad',
      date: daysFromNow(10),
      city: 'Ciudad',
      address: 'Calle Falsa 123',
      placeName: 'Lugar',
      ...data,
    },
  });

/**
 * Como `createUser` de fixtures.ts pero sin calcular un hash bcrypt por usuario (≈250 ms cada
 * uno): estos tests nunca inician sesión con contraseña y crean decenas de usuarios.
 */
export const createUser = (
  data: Partial<Prisma.UserUncheckedCreateInput> & { role?: Role } = {},
) => {
  const id = uniqueId();
  return prisma.user.create({
    data: {
      name: `Usuario ${id}`,
      email: `user-${id}@test.pcn`,
      password: DUMMY_PASSWORD_HASH,
      emailVerified: true,
      ...data,
    },
  });
};

export const createUsers = (count: number) =>
  Promise.all(Array.from({ length: count }, () => createUser()));

export const createAdmin = () => createUser({ role: 'ADMIN' });

export const createAmbassador = () => createUser({ isAmbassador: true });

/** Un organizador de `eventId` que no es admin ni ambassador. */
export const createOrganizer = async (eventId: string) => {
  const user = await createUser();
  await prisma.eventOrganizer.create({ data: { eventId, userId: user.id } });
  return user;
};

/**
 * La cookie de una sesión real de `userId`, para encolarla con `mockResolvedValueOnce` cuando
 * varias actions de distintos usuarios corren a la vez (cada action lee `cookies()` una vez).
 */
export const sessionCookiesFor = async (userId: string) => {
  const token = randomBytes(32).toString('base64url');
  await prisma.session.create({
    data: {
      id: hashSessionToken(token),
      userId,
      expires: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
    },
  });
  return {
    get: (name: string) => (name === SESSION_COOKIE ? { name, value: token } : undefined),
    has: (name: string) => name === SESSION_COOKIE,
    set: jest.fn(),
    delete: jest.fn(),
  };
};

/** Hace que las próximas llamadas a `cookies()` devuelvan, en orden, la sesión de cada usuario. */
export const queueSessions = async (userIds: string[]) => {
  const stores = await Promise.all(userIds.map(sessionCookiesFor));
  const mock = cookies as jest.Mock;
  for (const store of stores) mock.mockResolvedValueOnce(store);
};

export const professionalSpeaker = (overrides: Record<string, unknown> = {}) => ({
  speakerName: `Oradora ${uniqueId()}`,
  speakerPhone: '5493815123456',
  isProfessional: true,
  jobTitle: 'Backend developer',
  enterprise: 'Empresa',
  isStudent: false,
  ...overrides,
});

export const studentSpeaker = (overrides: Record<string, unknown> = {}) => ({
  speakerName: `Estudiante ${uniqueId()}`,
  speakerPhone: '5493815999999',
  isProfessional: false,
  isStudent: true,
  career: 'Ingeniería en Sistemas',
  studyPlace: 'UTN',
  ...overrides,
});
