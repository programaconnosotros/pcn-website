'use server';

import { EmailVerificationEmail } from '@/components/auth/verification-email';
import prisma from '@/lib/prisma';
import {
  RATE_LIMIT_SECONDS,
  generateVerificationCode,
  getCodeExpirationDate,
  checkRateLimit,
  sendEmail,
  EmailQuotaError,
} from '@/lib/email';
import { render } from '@react-email/render';
import { RateLimitError, enforceRateLimit } from '@/lib/rate-limit';

const EMAIL_UNAVAILABLE = { success: false, error: 'EMAIL_UNAVAILABLE', waitSeconds: 0 } as const;

export const sendVerificationCode = async (
  email: string,
): Promise<{ success: true; waitSeconds: number } | typeof EMAIL_UNAVAILABLE> => {
  await enforceRateLimit('sendCode');

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Si el email no existe o ya está verificado no se envía nada, pero se responde igual que al
  // enviar: así esta action no sirve para averiguar qué emails tienen cuenta.
  if (!user || user.emailVerified) {
    return { success: true, waitSeconds: RATE_LIMIT_SECONDS };
  }

  // Verificar rate limiting: buscar el último token enviado
  const lastToken = await prisma.emailVerificationToken.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' },
  });

  const waitSeconds = checkRateLimit(lastToken?.createdAt ?? null);
  if (waitSeconds > 0) {
    throw new RateLimitError('sendCode', waitSeconds);
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
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verificá tu correo electrónico - programaConNosotros',
      html: emailHtml,
    });
  } catch (error) {
    // Sin cuota en Resend: se devuelve (en producción Next oculta el mensaje de lo que se lanza)
    // para que la página le explique al usuario qué pasa. Los admins ya tienen la alerta.
    if (error instanceof EmailQuotaError) return EMAIL_UNAVAILABLE;
    throw error;
  }

  return { success: true, waitSeconds: RATE_LIMIT_SECONDS };
};
