import { randomBytes } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import type { Role } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { hashSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '@/lib/session';

const unique = () => randomBytes(6).toString('hex');

/** Un usuario real en la base de tests, con email verificado. */
export const createUser = async (
  overrides: { role?: Role; password?: string; email?: string; name?: string } = {},
) => {
  const id = unique();
  return prisma.user.create({
    data: {
      name: overrides.name ?? `Usuario ${id}`,
      email: overrides.email ?? `user-${id}@test.pcn`,
      password: await hashPassword(overrides.password ?? 'contraseña-segura'),
      emailVerified: true,
      role: overrides.role ?? 'REGULAR',
    },
  });
};

/**
 * Deja `cookies()` y `headers()` como los de un request de `userId` (o anónimo sin argumento):
 * crea la sesión en la base, así las actions la validan igual que en producción.
 */
export const actAs = async (userId?: string) => {
  const values = new Map<string, string>();
  if (userId) {
    const token = randomBytes(32).toString('base64url');
    await prisma.session.create({
      data: {
        id: hashSessionToken(token),
        userId,
        expires: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
      },
    });
    values.set(SESSION_COOKIE, token);
  }
  (cookies as jest.Mock).mockResolvedValue({
    get: (name: string) => (values.has(name) ? { name, value: values.get(name) } : undefined),
    has: (name: string) => values.has(name),
    set: (name: string, value: string) => values.set(name, value),
    delete: (name: string) => values.delete(name),
  });
  (headers as jest.Mock).mockResolvedValue(
    new Headers({ 'user-agent': 'jest', 'x-forwarded-for': '203.0.113.7' }),
  );
};
