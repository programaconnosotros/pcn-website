'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { enforceRateLimit } from '@/lib/rate-limit';
import { newPasswordSchema } from '@/lib/validations/auth-schemas';
import { findValidPasswordResetToken } from '@/lib/verification-codes';

export const completePasswordReset = async (email: string, code: string, newPassword: string) => {
  await enforceRateLimit('verifyCode');

  // El formulario ya valida, pero la action se puede llamar directo
  const parsedPassword = newPasswordSchema.safeParse(newPassword);
  if (!parsedPassword.success) {
    throw new Error(parsedPassword.error.errors[0].message);
  }

  // Verificar el token nuevamente
  const token = await findValidPasswordResetToken(email, code);

  if (!token) {
    throw new Error('Código inválido o expirado. Solicitá un nuevo código.');
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
