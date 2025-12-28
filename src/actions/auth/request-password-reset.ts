'use server';

import { PasswordResetCodeEmail } from '@/components/auth/reset-password-email';
import prisma from '@/lib/prisma';
import {
  RATE_LIMIT_SECONDS,
  generateVerificationCode,
  getCodeExpirationDate,
  checkRateLimit,
  sendEmail,
} from '@/lib/email';
import { render } from '@react-email/render';

export const requestPasswordReset = async (email: string) => {
  // Verificar que el usuario existe
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // No revelar si el usuario existe o no por seguridad
    // Simular el mismo tiempo de respuesta
    return { success: true, waitSeconds: 0 };
  }

  // Verificar rate limiting: buscar el último token enviado
  const lastToken = await prisma.passwordResetToken.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' },
  });

  const waitSeconds = checkRateLimit(lastToken?.createdAt ?? null);
  if (waitSeconds > 0) {
    throw new Error(`RATE_LIMIT:${waitSeconds}`);
  }

  // Invalidar tokens anteriores para este email
  await prisma.passwordResetToken.updateMany({
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
  await prisma.passwordResetToken.create({
    data: {
      email,
      code,
      expiresAt,
    },
  });

  // Enviar email con el código
  const emailHtml = await render(PasswordResetCodeEmail({ userName: user.name, code }));
  await sendEmail({
    to: user.email,
    subject: 'Código de verificación para restablecer contraseña',
    html: emailHtml,
  });

  return { success: true, waitSeconds: RATE_LIMIT_SECONDS };
};
