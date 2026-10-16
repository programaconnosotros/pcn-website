'use server';

import { render } from '@react-email/render';
import { notifyUsers } from '@/actions/notifications/notify-users';
import { WelcomeEmail } from '@/components/auth/welcome-email';
import { sendEmail } from '@/lib/email';
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

  // La primera verificación es el alta: se le da la bienvenida por email y en la app. Ninguna de
  // las dos frena el ingreso si falla.
  const isNewMember = !user.emailVerified;
  if (isNewMember) {
    await notifyUsers([user.id], {
      type: 'welcome',
      title: '¡Bienvenida/o a la comunidad!',
      message: 'Tu cuenta está lista. Mirá los primeros pasos para arrancar.',
      href: '/bienvenida',
    });
    try {
      await sendEmail({
        to: user.email,
        subject: '¡Ya sos parte de programaConNosotros!',
        html: await render(WelcomeEmail({ userName: user.name })),
      });
    } catch (error) {
      console.error('No se pudo enviar el email de bienvenida:', error);
    }
  }

  return { success: true, isNewMember };
};
