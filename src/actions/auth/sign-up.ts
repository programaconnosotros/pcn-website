'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// TODO: Improvement: Use same schema for client and server.

const formSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede tener más de 100 caracteres')
      .regex(
        /^[a-zA-ZÀ-ÿ\s]+$/,
        'El nombre solo puede contener letras (a-z, A-Z) y espacios. No se permiten números ni caracteres especiales',
      ),
    email: z.string().email('Correo electrónico inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const signUp = async (data: z.infer<typeof formSchema>) => {
  const cleanedData = formSchema.parse(data);

  const hashedPassword = await bcrypt.hash(cleanedData.password, 10);

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

  redirect('/');
};
