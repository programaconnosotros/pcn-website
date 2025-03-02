'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// TODO: Improvement: Use same schema for client and server.

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 3 caracteres.',
  }),
  email: z.string().email({
    message: 'Debe ser un email válido.',
  }),
  password: z.string().min(8, {
    message: 'La contraseña debe tener al menos 8 caracteres.',
  }),
});

export const signUp = async (data: z.infer<typeof formSchema>) => {
  const cleanedData = formSchema.parse(data);

  const hashedPassword = await bcrypt.hash(cleanedData.password, 10);

  // TODO: Pedir que el usuario ingrese dos veces la contraseña para evitar errores de tipeo.

  const user = await prisma.user.create({
    data: { ...cleanedData, password: hashedPassword },
  });

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });

  cookies().set('sessionId', session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect('/home');

  // TODO: Validación del correo electrónico.
};
