'use server';

import prisma from '@/lib/prisma';

export const verifyResetCode = async (email: string, code: string) => {
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
    tokenId: token.id 
  };
};

