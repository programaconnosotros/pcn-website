'use server';

import { ResetPasswordEmail } from '@/components/auth/reset-password-email';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';

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

export const resetPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  await prisma.session.deleteMany({
    where: { userId: user.id },
  });

  const newPassword = Math.random().toString(36).substring(2, 15);
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  const emailHtml = await render(ResetPasswordEmail({ user, newPassword }));

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Contraseña restablecida',
      html: emailHtml,
    });
  } catch (error) {
    console.error(
      'Failed to send reset password email:',
      error instanceof Error ? error.message : 'Unknown error',
    );

    // Si el error es por credenciales faltantes, dar un mensaje más claro
    if (error instanceof Error && error.message.includes('SMTP credentials not configured')) {
      throw new Error('Error de configuración: Las credenciales de email no están configuradas');
    }

    throw new Error('Error al enviar el email. Por favor, contacta al administrador.');
  }
};
