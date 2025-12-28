'use server';

import { PasswordResetCodeEmail } from '@/components/auth/reset-password-email';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';

const RATE_LIMIT_SECONDS = 60; // 1 minuto entre envíos

const getTransporter = () => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    throw new Error(
      'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.',
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

// Genera un código de 6 dígitos
const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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

  if (lastToken) {
    const secondsSinceLastToken = Math.floor(
      (Date.now() - lastToken.createdAt.getTime()) / 1000,
    );

    if (secondsSinceLastToken < RATE_LIMIT_SECONDS) {
      const waitSeconds = RATE_LIMIT_SECONDS - secondsSinceLastToken;
      throw new Error(`RATE_LIMIT:${waitSeconds}`);
    }
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
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

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

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Código de verificación para restablecer contraseña',
      html: emailHtml,
    });
  } catch (error) {
    console.error(
      'Failed to send reset password email:',
      error instanceof Error ? error.message : 'Unknown error',
    );

    if (error instanceof Error && error.message.includes('SMTP credentials not configured')) {
      throw new Error('Error de configuración: Las credenciales de email no están configuradas');
    }

    throw new Error('Error al enviar el email. Por favor, contacta al administrador.');
  }

  return { success: true, waitSeconds: RATE_LIMIT_SECONDS };
};

