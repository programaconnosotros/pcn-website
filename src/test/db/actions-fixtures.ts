import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';
import type { Role } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { DUMMY_PASSWORD_HASH } from '@/lib/password';
import { modelTag } from '@/lib/cache';
import type { ModelName } from '@/lib/prisma-models';
import { SESSION_COOKIE } from '@/lib/session';

// Helpers para los tests de integración de las server actions (src/actions/**/*.db.test.ts).
// Complementan src/test/db/fixtures.ts.

export const uid = () => randomBytes(6).toString('hex');

/**
 * Un usuario sin pasar por bcrypt (usa el hash falso del login): para los tests que necesitan
 * muchos usuarios y no van a iniciar sesión con contraseña.
 */
export const quickUser = (
  overrides: { role?: Role; name?: string; email?: string; isAmbassador?: boolean } = {},
) => {
  const id = uid();
  return prisma.user.create({
    data: {
      name: overrides.name ?? `Usuario ${id}`,
      email: overrides.email ?? `quick-${id}@test.pcn`,
      password: DUMMY_PASSWORD_HASH,
      emailVerified: true,
      role: overrides.role ?? 'REGULAR',
      isAmbassador: overrides.isAmbassador ?? false,
    },
  });
};

export const makeAdvise = (authorId: string, content = `Un consejo útil ${uid()}`) =>
  prisma.advise.create({ data: { authorId, content } });

/** El token que quedó en la cookie de sesión (después de `actAs` o de un `createSession`). */
export const sessionCookie = async () => (await cookies()).get(SESSION_COOKIE)?.value;

/** Si alguna escritura venció las lecturas cacheadas de `model` (ver src/lib/cache.ts). */
export const expiredModel = (model: ModelName) =>
  (revalidateTag as jest.Mock).mock.calls.some(([tag]) => tag === modelTag(model));
