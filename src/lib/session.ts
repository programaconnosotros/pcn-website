import { createHash, randomBytes } from 'node:crypto';
import { cache } from 'react';
import { cookies } from 'next/headers';
import type { Session, User } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';

/** El usuario logueado tal como lo devuelve la sesión: todo menos el hash de la contraseña. */
export type SessionUser = Omit<User, 'password' | 'twoFactorSecret' | 'twoFactorRecoveryCodes'>;
export type SessionWithUser = Session & { user: SessionUser };

export const SESSION_COOKIE = 'sessionId';

/** Cuánto dura una sesión. La cookie vence a la vez que la fila, que es la que manda. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/**
 * La cookie lleva un token aleatorio de 256 bits y la base guarda solo su hash como id de la
 * sesión: quien lea la tabla `Session` (un backup, un log de queries) no puede usar esos ids
 * para entrar como nadie.
 */
export const hashSessionToken = (token: string) => createHash('sha256').update(token).digest('hex');

/**
 * La sesión vigente para el token de la cookie, con su usuario. Todas las lecturas de sesión
 * pasan por acá para que una sesión vencida no sirva en ningún lado. Va con `cache` de React:
 * el layout, la página y sus componentes leen la sesión varias veces por request y así se
 * consulta la base una sola vez.
 */
export const findSession = cache((token: string) =>
  prisma.session.findUnique({
    where: { id: hashSessionToken(token), expires: { gt: new Date() } },
    include: { user: true },
  }),
);

/** Crea una sesión para el usuario y deja la cookie puesta. */
export const createSession = async (userId: string) => {
  // De paso se limpian las sesiones vencidas del usuario, que ya no sirven para nada
  await prisma.session.deleteMany({ where: { userId, expires: { lte: new Date() } } });

  const token = randomBytes(32).toString('base64url');
  const session = await prisma.session.create({
    data: {
      id: hashSessionToken(token),
      userId,
      expires: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
    },
  });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return session;
};

/** Cierra la sesión actual: borra la fila, así la cookie deja de servir aunque alguien la copie. */
export const deleteCurrentSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { id: hashSessionToken(token) } });
  }

  cookieStore.delete(SESSION_COOKIE);
};
