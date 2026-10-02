'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createSession } from '@/lib/session';
import { safeRedirectPath } from '@/lib/safe-redirect';

const formSchema = z.object({
  email: z.string().email({
    message: 'Debe ser un email válido.',
  }),
  password: z.string().min(1, 'Ingresá tu contraseña.').max(200),
  redirectTo: z.string().optional(),
});

export const signIn = async (
  data: z.infer<typeof formSchema>,
): Promise<
  | { success: true; redirectTo: string }
  | { success: false; error: 'INVALID_CREDENTIALS' }
  | { success: false; error: 'EMAIL_NOT_VERIFIED'; email: string }
> => {
  await enforceRateLimit('signIn');

  try {
    const validatedData = formSchema.parse(data);
    const { email, password } = validatedData;

    const user = await prisma.user.findUnique({
      where: { email },
      // El cliente de Prisma omite el hash por defecto; el login es el único que lo necesita
      omit: { password: false },
    });

    if (!user) {
      return { success: false, error: 'INVALID_CREDENTIALS' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: 'INVALID_CREDENTIALS' };
    }

    if (!user.emailVerified) {
      return { success: false, error: 'EMAIL_NOT_VERIFIED', email };
    }

    await createSession(user.id);

    const redirectTo = safeRedirectPath(validatedData.redirectTo);

    return { success: true, redirectTo };
  } catch {
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }
};
