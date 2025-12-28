'use server';

import { EmailVerificationEmail } from '@/components/auth/verification-email';
import prisma from '@/lib/prisma';
import {
  RATE_LIMIT_SECONDS,
  generateVerificationCode,
  getCodeExpirationDate,
  checkRateLimit,
  sendEmail,
} from '@/lib/email';
import { render } from '@react-email/render';

export const sendVerificationCode = async (email: string) => {
  // Verificar que el usuario existe
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Si ya está verificado, no hacer nada
  if (user.emailVerified) {
    return { success: true, alreadyVerified: true, waitSeconds: 0 };
  }

  // Verificar rate limiting: buscar el último token enviado
  const lastToken = await prisma.emailVerificationToken.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' },
  });

  const waitSeconds = checkRateLimit(lastToken?.createdAt ?? null);
  if (waitSeconds > 0) {
    throw new Error(`RATE_LIMIT:${waitSeconds}`);
  }

  // Invalidar tokens anteriores para este email
  await prisma.emailVerificationToken.updateMany({
    where: {
      email,
      used: false,
    },
    data: {
      used: true,
    },
  });

  // Generar nuevo código
  const code = generateVerificationCode();
  const expiresAt = getCodeExpirationDate();

  // Guardar token en la base de datos
  await prisma.emailVerificationToken.create({
    data: {
      email,
      code,
      expiresAt,
    },
  });

  // Enviar email con el código
  const emailHtml = await render(EmailVerificationEmail({ userName: user.name, code }));
  await sendEmail({
    to: user.email,
    subject: 'Verificá tu correo electrónico - Programa Con Nosotros',
    html: emailHtml,
  });

  return { success: true, alreadyVerified: false, waitSeconds: RATE_LIMIT_SECONDS };
};
