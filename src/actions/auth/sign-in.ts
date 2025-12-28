'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const formSchema = z.object({
  email: z.string().email({
    message: 'Debe ser un email válido.',
  }),
  password: z.string().min(4, {
    message: 'La contraseña debe tener al menos 4 caracteres.',
  }),
  redirectTo: z.string().optional(),
});

export const signIn = async (data: z.infer<typeof formSchema>) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Credenciales incorrectas.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Credenciales incorrectas.');
  }

  // Verificar si el email está verificado
  if (!user.emailVerified) {
    throw new Error(`EMAIL_NOT_VERIFIED:${email}`);
  }

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });

  cookies().set('sessionId', session.id, {
    httpOnly: true, // Protege contra ataques XSS
    secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
    sameSite: 'lax',
    path: '/', // Disponible en toda la app
    maxAge: 60 * 60 * 24 * 365, // 1 año
  });

  // Redirigir a la URL especificada o a home por defecto
  const redirectTo = data.redirectTo || '/';
  redirect(redirectTo);
};
