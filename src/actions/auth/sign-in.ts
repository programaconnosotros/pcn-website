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
  // Variable para almacenar la URL de redirección después del try/catch
  let redirectUrl: string | null = null;

  try {
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
    const cookieStore = cookies();
    cookieStore.set('sessionId', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });

    // Guardar URL de redirección para usar fuera del try/catch
    redirectUrl = data.redirectTo || '/';
  } catch (error) {
    // Re-lanzar el error para que el cliente lo maneje
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error desconocido al iniciar sesión');
  }

  // redirect() DEBE estar fuera del try/catch
  // porque lanza una excepción especial (NEXT_REDIRECT) que Next.js intercepta
  if (redirectUrl) {
    redirect(redirectUrl);
  }
};
