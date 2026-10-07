'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { DUMMY_PASSWORD_HASH, hashPassword, needsRehash } from '@/lib/password';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createSession } from '@/lib/session';
import { safeRedirectPath } from '@/lib/safe-redirect';
import { createTwoFactorChallenge } from '@/lib/two-factor';

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
  | { success: false; error: 'TWO_FACTOR_REQUIRED' }
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

    // Sin usuario se compara igual contra un hash falso: responder antes delataría por el tiempo
    // que el email no está registrado.
    const isPasswordValid = await bcrypt.compare(password, user?.password ?? DUMMY_PASSWORD_HASH);

    if (!user || !isPasswordValid) {
      return { success: false, error: 'INVALID_CREDENTIALS' };
    }

    // Los hashes con un costo viejo se regeneran ahora, que tenemos la contraseña en claro.
    // Si falla, el login sigue: se reintenta la próxima vez.
    if (needsRehash(user.password)) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { password: await hashPassword(password) },
        });
      } catch (error) {
        console.error('Failed to rehash password:', error instanceof Error ? error.message : error);
      }
    }

    if (!user.emailVerified) {
      return { success: false, error: 'EMAIL_NOT_VERIFIED', email };
    }

    const redirectTo = safeRedirectPath(validatedData.redirectTo);

    // With two-factor on, the password only opens the second step (src/lib/two-factor.ts).
    if (user.twoFactorEnabledAt) {
      await createTwoFactorChallenge(user.id, redirectTo);
      return { success: false, error: 'TWO_FACTOR_REQUIRED' };
    }

    await createSession(user.id);

    return { success: true, redirectTo };
  } catch {
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }
};
