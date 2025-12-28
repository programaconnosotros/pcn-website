'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const completePasswordReset = async (
  email: string,
  code: string,
  newPassword: string,
) => {
  // Verificar el token nuevamente
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
    throw new Error('Código inválido o expirado. Solicita un nuevo código.');
  }

  // Verificar que el usuario existe
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Hash de la nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Actualizar contraseña y marcar token como usado en una transacción
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { used: true },
    }),
    // Eliminar todas las sesiones del usuario por seguridad
    prisma.session.deleteMany({
      where: { userId: user.id },
    }),
  ]);

  return { success: true };
};

