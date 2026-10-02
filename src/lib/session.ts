import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export const SESSION_COOKIE = 'sessionId';

/** Cuánto dura una sesión. La cookie vence a la vez que la fila, que es la que manda. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/**
 * La sesión vigente para el valor de la cookie, con su usuario. Todas las lecturas de sesión
 * pasan por acá para que una sesión vencida no sirva en ningún lado.
 */
export const findSession = (sessionId: string) =>
  prisma.session.findUnique({
    where: { id: sessionId, expires: { gt: new Date() } },
    include: { user: true },
  });

/** Crea una sesión para el usuario y deja la cookie puesta. */
export const createSession = async (userId: string) => {
  // De paso se limpian las sesiones vencidas del usuario, que ya no sirven para nada
  await prisma.session.deleteMany({ where: { userId, expires: { lte: new Date() } } });

  const session = await prisma.session.create({
    data: { userId, expires: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000) },
  });

  (await cookies()).set(SESSION_COOKIE, session.id, {
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
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    await prisma.session.deleteMany({ where: { id: sessionId } });
  }

  cookieStore.delete(SESSION_COOKIE);
};
