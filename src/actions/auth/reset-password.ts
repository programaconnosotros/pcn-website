'use server';

import { ResetPasswordEmail } from '@/components/auth/reset-password-email';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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
    await transporter.sendMail({
      to: user.email,
      subject: 'Contraseña restablecida',
      html: emailHtml,
    });
  } catch (error) {
    console.error(
      'Failed to send reset password email:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw new Error('Error sending email');
  }
};
