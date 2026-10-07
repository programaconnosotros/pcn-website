'use server';

import QRCode from 'qrcode';
import { z } from 'zod';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import prisma from '@/lib/prisma';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createSession } from '@/lib/session';
import {
  MAX_CHALLENGE_ATTEMPTS,
  checkSecondFactor,
  clearTwoFactorChallenge,
  consumeSecondFactor,
  findTwoFactorChallenge,
  secondFactorSelect,
  type SecondFactorCheck,
} from '@/lib/two-factor';
import {
  generateRecoveryCodes,
  generateTotpSecret,
  hashRecoveryCode,
  otpauthUri,
  verifyTotp,
} from '@/lib/totp';
import { decryptTwoFactorSecret, encryptTwoFactorSecret } from '@/lib/two-factor-crypto';

const codeSchema = z.string().trim().min(1, 'Ingresá el código').max(20);

async function requireUser() {
  const session = await getCurrentSession();
  if (!session) throw new Error('Debes estar autenticado');
  return prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: secondFactorSelect,
  });
}

const newRecoveryCodes = () => {
  const codes = generateRecoveryCodes();
  return { codes, hashes: codes.map(hashRecoveryCode) };
};

/** Second step of signing in: the code from the app, or a recovery code. */
export async function verifyTwoFactorSignIn(
  code: string,
): Promise<
  | { success: true; redirectTo: string; usedRecoveryCode: boolean; recoveryCodesLeft: number }
  | { success: false; error: 'INVALID_CODE' | 'EXPIRED' }
> {
  await enforceRateLimit('verifyCode');
  const challenge = await findTwoFactorChallenge();
  if (!challenge) return { success: false, error: 'EXPIRED' };

  const user = await prisma.user.findUnique({
    where: { id: challenge.userId },
    select: secondFactorSelect,
  });
  const check: SecondFactorCheck = user
    ? checkSecondFactor(user, codeSchema.catch('').parse(code))
    : { ok: false };
  if (!user || !check.ok) {
    const { attempts } = await prisma.twoFactorChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });
    // Too many wrong codes: back to the password.
    if (attempts >= MAX_CHALLENGE_ATTEMPTS) {
      await clearTwoFactorChallenge(challenge.id);
      return { success: false, error: 'EXPIRED' };
    }
    return { success: false, error: 'INVALID_CODE' };
  }

  await prisma.user.update({ where: { id: user.id }, data: consumeSecondFactor(check) });
  await clearTwoFactorChallenge(challenge.id);
  await createSession(user.id);
  return {
    success: true,
    redirectTo: challenge.redirectTo,
    usedRecoveryCode: check.kind === 'recovery',
    recoveryCodesLeft:
      check.kind === 'recovery' ? check.remaining.length : user.twoFactorRecoveryCodes.length,
  };
}

/** Start setting up the app: a new secret and the QR code to scan. Not on until confirmed. */
export async function startTwoFactorSetup() {
  const user = await requireUser();
  if (user.twoFactorEnabledAt) throw new Error('La verificación en dos pasos ya está activada');
  const secret = generateTotpSecret();
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: encryptTwoFactorSecret(secret, user.id) },
  });
  const uri = otpauthUri(secret, user.email);
  const qr = await QRCode.toString(uri, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' });
  return { secret, qr: `data:image/svg+xml;utf8,${encodeURIComponent(qr)}` };
}

/** Turn it on with a first code from the app; returns the recovery codes, shown only once. */
export async function confirmTwoFactorSetup(code: string) {
  const user = await requireUser();
  await enforceRateLimit('verifyCode');
  if (user.twoFactorEnabledAt) throw new Error('La verificación en dos pasos ya está activada');
  const secret = user.twoFactorSecret && decryptTwoFactorSecret(user.twoFactorSecret, user.id);
  if (!secret) throw new Error('Empezá la configuración de nuevo');
  const step = verifyTotp(secret, codeSchema.parse(code));
  if (step === null) throw new Error('El código no es válido. Revisá la hora del teléfono.');

  const { codes, hashes } = newRecoveryCodes();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabledAt: new Date(),
      twoFactorLastStep: step,
      twoFactorRecoveryCodes: hashes,
    },
  });
  return { recoveryCodes: codes };
}

/** Turn it off, proving it's you with a code from the app or a recovery code. */
export async function disableTwoFactor(code: string) {
  const user = await requireUser();
  await enforceRateLimit('verifyCode');
  if (!user.twoFactorEnabledAt) return;
  if (!checkSecondFactor(user, codeSchema.parse(code)).ok)
    throw new Error('El código no es válido');
  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorSecret: null,
      twoFactorEnabledAt: null,
      twoFactorRecoveryCodes: [],
      twoFactorLastStep: null,
    },
  });
  await prisma.twoFactorChallenge.deleteMany({ where: { userId: user.id } });
}

/** New recovery codes (the old ones stop working), with a code from the app. */
export async function regenerateRecoveryCodes(code: string) {
  const user = await requireUser();
  await enforceRateLimit('verifyCode');
  if (!user.twoFactorEnabledAt) throw new Error('La verificación en dos pasos no está activada');
  const check = checkSecondFactor(user, codeSchema.parse(code));
  if (!check.ok || check.kind !== 'totp') throw new Error('Usá un código de la app');
  const { codes, hashes } = newRecoveryCodes();
  await prisma.user.update({
    where: { id: user.id },
    data: { ...consumeSecondFactor(check), twoFactorRecoveryCodes: hashes },
  });
  return { recoveryCodes: codes };
}
