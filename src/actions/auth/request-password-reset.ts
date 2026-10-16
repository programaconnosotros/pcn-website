'use server';

import { PasswordResetCodeEmail } from '@/components/auth/reset-password-email';
import prisma from '@/lib/prisma';
import {
  RATE_LIMIT_SECONDS,
  generateVerificationCode,
  getCodeExpirationDate,
  sendEmail,
  EmailQuotaError,
} from '@/lib/email';
import { render } from '@react-email/render';
import { consumeRateLimit, getRateLimitWait } from '@/lib/rate-limit';
import { verifyCaptcha } from '@/lib/captcha';

// Los errores esperados se devuelven, no se lanzan: en producción Next no le pasa al navegador
// el mensaje de un error lanzado por una server action.
export type RequestPasswordResetResult =
  | { success: true; waitSeconds: number }
  | { success: false; error: 'RATE_LIMIT'; waitSeconds: number }
  | { success: false; error: 'CAPTCHA_FAILED' }
  | { success: false; error: 'SEND_FAILED' }
  | { success: false; error: 'EMAIL_UNAVAILABLE' };

export const requestPasswordReset = async (
  email: string,
  /** What the captcha widget submits (src/lib/captcha.ts). */
  captcha?: string,
): Promise<RequestPasswordResetResult> => {
  const ipWait = await getRateLimitWait('sendCode');
  if (ipWait > 0) return { success: false, error: 'RATE_LIMIT', waitSeconds: ipWait };

  // Antes de gastar el límite por email: sin captcha no se le manda nada a nadie.
  if (!(await verifyCaptcha(captcha))) return { success: false, error: 'CAPTCHA_FAILED' };

  // Un código por minuto por email, exista o no la cuenta: así la espera tampoco revela qué
  // emails están registrados.
  const emailWait = consumeRateLimit(`passwordReset:${email.trim().toLowerCase()}`, {
    limit: 1,
    windowSeconds: RATE_LIMIT_SECONDS,
  });
  if (emailWait > 0) return { success: false, error: 'RATE_LIMIT', waitSeconds: emailWait };

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // No revelar si el usuario existe: se responde igual que cuando se envía el código. Una cuenta
  // suspendida tampoco puede cambiar la contraseña, y se responde igual para no revelarlo.
  if (!user || user.suspendedAt) {
    return { success: true, waitSeconds: RATE_LIMIT_SECONDS };
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

  try {
    const emailHtml = await render(PasswordResetCodeEmail({ userName: user.name, code }));
    await sendEmail({
      to: user.email,
      subject: 'Código de verificación para restablecer contraseña',
      html: emailHtml,
    });
  } catch (error) {
    // sendEmail ya registra el detalle en el log del servidor; sin cuota en Resend, los admins ya
    // tienen la alerta y al usuario se le explica que lo estamos solucionando.
    if (error instanceof EmailQuotaError) return { success: false, error: 'EMAIL_UNAVAILABLE' };
    return { success: false, error: 'SEND_FAILED' };
  }

  return { success: true, waitSeconds: RATE_LIMIT_SECONDS };
};
