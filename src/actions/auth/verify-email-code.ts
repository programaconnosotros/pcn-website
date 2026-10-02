'use server';

import prisma from '@/lib/prisma';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createSession } from '@/lib/session';
import { findValidEmailVerificationToken } from '@/lib/verification-codes';

export const verifyEmailCode = async (email: string, code: string) => {
  await enforceRateLimit('verifyCode');

  // Buscar token válido
  const token = await findValidEmailVerificationToken(email, code);

  if (!token) {
    throw new Error('Código inválido o expirado');
  }

  // Buscar el usuario
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Marcar email como verificado y token como usado en una transacción
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    }),
    prisma.emailVerificationToken.update({
      where: { id: token.id },
      data: { used: true },
    }),
  ]);

  // Crear sesión automáticamente después de verificar
  await createSession(user.id);

  return { success: true };
};
