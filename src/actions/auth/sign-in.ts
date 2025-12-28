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
  try {
    console.log('[signIn] Iniciando proceso de autenticación');
    console.log('[signIn] Email recibido:', data.email);
    console.log('[signIn] RedirectTo:', data.redirectTo);

    // Validar datos
    const validatedData = formSchema.parse(data);
    const { email, password } = validatedData;

    console.log('[signIn] Datos validados correctamente');

    // Buscar usuario
    console.log('[signIn] Buscando usuario en la base de datos...');
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('[signIn] ERROR: Usuario no encontrado');
      throw new Error('Credenciales incorrectas.');
    }

    console.log('[signIn] Usuario encontrado:', user.id);

    // Verificar contraseña
    console.log('[signIn] Verificando contraseña...');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('[signIn] ERROR: Contraseña incorrecta');
      throw new Error('Credenciales incorrectas.');
    }

    console.log('[signIn] Contraseña válida');

    // Verificar si el email está verificado
    if (!user.emailVerified) {
      console.log('[signIn] ERROR: Email no verificado');
      throw new Error(`EMAIL_NOT_VERIFIED:${email}`);
    }

    console.log('[signIn] Email verificado');

    // Crear sesión
    console.log('[signIn] Creando sesión...');
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    });

    console.log('[signIn] Sesión creada:', session.id);

    // Establecer cookie
    console.log('[signIn] Estableciendo cookie...');
    try {
      const cookieStore = cookies();
      cookieStore.set('sessionId', session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });
      console.log('[signIn] Cookie establecida correctamente');
    } catch (cookieError) {
      console.error('[signIn] ERROR al establecer cookie:', cookieError);
      throw new Error('Error al establecer la sesión. Por favor, intenta nuevamente.');
    }

    // Redirigir a la URL especificada o a home por defecto
    const redirectTo = data.redirectTo || '/';
    console.log('[signIn] Proceso completado exitosamente, redirigiendo a:', redirectTo);

    // redirect() lanza una excepción especial en Next.js que no debe ser capturada
    // Esta es la forma correcta de redirigir desde un server action
    redirect(redirectTo);
  } catch (error) {
    console.error('[signIn] ERROR GENERAL:', error);
    console.error(
      '[signIn] Stack trace:',
      error instanceof Error ? error.stack : 'No stack available',
    );

    // Re-lanzar el error para que el cliente lo maneje
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error desconocido al iniciar sesión');
  }
};
