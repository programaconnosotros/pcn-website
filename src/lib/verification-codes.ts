import prisma from '@/lib/prisma';

/**
 * Intentos permitidos por código. Cada intento se reserva antes de comparar, así un código de 6
 * dígitos no se puede adivinar por fuerza bruta aunque los intentos lleguen en paralelo o
 * repartidos entre muchas IPs: pasado el tope, hay que pedir un código nuevo.
 */
export const MAX_CODE_ATTEMPTS = 5;

const activeTokenWhere = (email: string) => ({
  email,
  used: false,
  expiresAt: { gt: new Date() },
});

const reservedAttemptWhere = (id: string) => ({
  id,
  used: false,
  attempts: { lt: MAX_CODE_ATTEMPTS },
});

/** El token de verificación de email vigente si `code` es correcto; null si no. */
export const findValidEmailVerificationToken = async (email: string, code: string) => {
  const token = await prisma.emailVerificationToken.findFirst({
    where: activeTokenWhere(email),
    orderBy: { createdAt: 'desc' },
  });
  if (!token) return null;

  const { count } = await prisma.emailVerificationToken.updateMany({
    where: reservedAttemptWhere(token.id),
    data: { attempts: { increment: 1 } },
  });

  return count > 0 && token.code === code ? token : null;
};

/** El token de reseteo de contraseña vigente si `code` es correcto; null si no. */
export const findValidPasswordResetToken = async (email: string, code: string) => {
  const token = await prisma.passwordResetToken.findFirst({
    where: activeTokenWhere(email),
    orderBy: { createdAt: 'desc' },
  });
  if (!token) return null;

  const { count } = await prisma.passwordResetToken.updateMany({
    where: reservedAttemptWhere(token.id),
    data: { attempts: { increment: 1 } },
  });

  return count > 0 && token.code === code ? token : null;
};
