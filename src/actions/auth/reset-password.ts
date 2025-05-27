'use server';

import { ResetPasswordEmail } from '@/components/auth/reset-password-email';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

  const { error } = await resend.emails.send({
    from: 'Agus de PCN <agus@asz.software>',
    to: [user.email],
    subject: 'Contraseña restablecida',
    react: ResetPasswordEmail({ user, newPassword }),
  });

  if (error) {
    console.error('Failed to send reset password email:', error.message || 'Unknown error');
    throw new Error('Error sending email');
  }
};
