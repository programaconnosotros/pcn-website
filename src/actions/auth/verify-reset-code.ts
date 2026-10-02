'use server';

import { getRateLimitWait } from '@/lib/rate-limit';
import { findValidPasswordResetToken } from '@/lib/verification-codes';

export type VerifyResetCodeResult =
  | { success: true }
  | { success: false; error: 'INVALID_CODE' }
  | { success: false; error: 'RATE_LIMIT'; waitSeconds: number };

/** Paso 2 del reseteo: confirma el código antes de pedir la contraseña nueva. */
export const verifyResetCode = async (
  email: string,
  code: string,
): Promise<VerifyResetCodeResult> => {
  const waitSeconds = await getRateLimitWait('verifyCode');
  if (waitSeconds > 0) return { success: false, error: 'RATE_LIMIT', waitSeconds };

  const token = await findValidPasswordResetToken(email, code);
  if (!token) return { success: false, error: 'INVALID_CODE' };

  return { success: true };
};
