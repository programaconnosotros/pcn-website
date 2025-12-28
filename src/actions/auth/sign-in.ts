'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
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

export const signIn = async (
  data: z.infer<typeof formSchema>,
): Promise<{ success: true; redirectTo: string }> => {
  // Validar datos
  const validatedData = formSchema.parse(data);
  const { email, password } = validatedData;

  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Credenciales incorrectas.');
  }

  // Verificar contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Credenciales incorrectas.');
  }

  // Verificar si el email está verificado
  if (!user.emailVerified) {
    throw new Error(`EMAIL_NOT_VERIFIED:${email}`);
  }

  // Crear sesión
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });

  // Establecer cookie
  cookies().set('sessionId', session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  // Devolver éxito con URL de redirección - el cliente hace el redirect
  return { success: true, redirectTo: data.redirectTo || '/' };
};
