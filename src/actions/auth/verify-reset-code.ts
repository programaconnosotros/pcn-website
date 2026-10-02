'use server';

import { enforceRateLimit } from '@/lib/rate-limit';
import { findValidPasswordResetToken } from '@/lib/verification-codes';

export const verifyResetCode = async (email: string, code: string) => {
  await enforceRateLimit('verifyCode');

  // Buscar token válido
  const token = await findValidPasswordResetToken(email, code);

  if (!token) {
    throw new Error('Código inválido o expirado');
  }

  // Retornar el token id para usarlo en el siguiente paso
  return {
    success: true,
    tokenId: token.id,
  };
};
