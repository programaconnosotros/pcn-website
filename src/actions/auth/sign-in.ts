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
  console.log('[signIn] 1. Inicio del server action');

  try {
    console.log('[signIn] 2. Validando datos...');
    const validatedData = formSchema.parse(data);
    const { email, password } = validatedData;
    console.log('[signIn] 3. Datos validados para email:', email);

    console.log('[signIn] 4. Buscando usuario en DB...');
    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log('[signIn] 5. Resultado búsqueda:', user ? 'Usuario encontrado' : 'No encontrado');

    if (!user) {
      console.log('[signIn] ERROR: Usuario no encontrado');
      throw new Error('Credenciales incorrectas.');
    }

    console.log('[signIn] 6. Verificando contraseña...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('[signIn] 7. Contraseña válida:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('[signIn] ERROR: Contraseña incorrecta');
      throw new Error('Credenciales incorrectas.');
    }

    console.log('[signIn] 8. Verificando email verificado:', user.emailVerified);
    if (!user.emailVerified) {
      console.log('[signIn] ERROR: Email no verificado');
      const error = new Error(`EMAIL_NOT_VERIFIED:${email}`);
      error.name = 'EMAIL_NOT_VERIFIED';
      throw error;
    }

    console.log('[signIn] 9. Creando sesión...');
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    });
    console.log('[signIn] 10. Sesión creada:', session.id);

    console.log('[signIn] 11. Estableciendo cookie...');
    cookies().set('sessionId', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    console.log('[signIn] 12. Cookie establecida');

    const redirectTo = data.redirectTo || '/';
    console.log('[signIn] 13. Retornando éxito, redirectTo:', redirectTo);

    return { success: true, redirectTo };
  } catch (error) {
    console.error('[signIn] CATCH ERROR:', error);
    console.error(
      '[signIn] Error message:',
      error instanceof Error ? error.message : String(error),
    );
    console.error('[signIn] Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
};
