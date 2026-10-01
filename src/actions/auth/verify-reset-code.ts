'use server';

import prisma from '@/lib/prisma';
import { enforceRateLimit } from '@/lib/rate-limit';

export const verifyResetCode = async (email: string, code: string) => {
  await enforceRateLimit('verifyCode');

  // Buscar token válido
  const token = await prisma.passwordResetToken.findFirst({
    where: {
      email,
      code,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!token) {
    throw new Error('Código inválido o expirado');
  }

  // Retornar el token id para usarlo en el siguiente paso
  return {
    success: true,
    tokenId: token.id,
  };
};
