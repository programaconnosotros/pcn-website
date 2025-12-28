'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const verifyEmailCode = async (email: string, code: string) => {
  // Buscar token válido
  const token = await prisma.emailVerificationToken.findFirst({
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
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 días
    },
  });

  cookies().set('sessionId', session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 año
  });

  return { success: true };
};

