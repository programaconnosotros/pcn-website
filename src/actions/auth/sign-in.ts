'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createSession } from '@/lib/session';

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

    const redirectTo = data.redirectTo || '/';

    return { success: true, redirectTo };
  } catch {
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }
};
