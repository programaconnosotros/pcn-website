import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { hashSessionToken } from '@/lib/session';
import { hashRecoveryCode, verifyTotp } from '@/lib/totp';
import { decryptTwoFactorSecret } from '@/lib/two-factor-crypto';

// Server helpers for the optional second factor: the pending sign-in between the password and
// the code, and checking a code (from the app, or a recovery code).

export const TWO_FACTOR_COOKIE = 'twoFactorChallenge';
const CHALLENGE_TTL_SECONDS = 10 * 60;
export const MAX_CHALLENGE_ATTEMPTS = 5;

/** After a correct password: remember the sign-in for ten minutes until the code arrives. */
export const createTwoFactorChallenge = async (userId: string, redirectTo: string) => {
  await prisma.twoFactorChallenge.deleteMany({
    where: { OR: [{ userId }, { expiresAt: { lte: new Date() } }] },
  });
  const token = randomBytes(32).toString('base64url');
  await prisma.twoFactorChallenge.create({
    data: {
      id: hashSessionToken(token),
      userId,
      redirectTo,
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_SECONDS * 1000),
    },
  });
  (await cookies()).set(TWO_FACTOR_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CHALLENGE_TTL_SECONDS,
  });
};

/** The pending sign-in of this browser, if it's still valid. */
export const findTwoFactorChallenge = async () => {
  const token = (await cookies()).get(TWO_FACTOR_COOKIE)?.value;
  if (!token) return null;
  const challenge = await prisma.twoFactorChallenge.findUnique({
    where: { id: hashSessionToken(token) },
  });
  if (!challenge || challenge.expiresAt <= new Date()) return null;
  return challenge;
};

export const clearTwoFactorChallenge = async (id?: string) => {
  if (id) await prisma.twoFactorChallenge.deleteMany({ where: { id } });
  (await cookies()).delete(TWO_FACTOR_COOKIE);
};

type SecondFactorUser = {
  id: string;
  /** Encrypted, as `encryptTwoFactorSecret` stores it. */
  twoFactorSecret: string | null;
  twoFactorRecoveryCodes: string[];
  twoFactorLastStep: number | null;
};

export type SecondFactorCheck =
  | { ok: false }
  | { ok: true; kind: 'totp'; step: number }
  | { ok: true; kind: 'recovery'; remaining: string[] };

/**
 * A code from the authenticator app (not one already used) or one of the recovery codes. The
 * caller saves `step` or `remaining` so neither works twice.
 */
export const checkSecondFactor = (user: SecondFactorUser, code: string): SecondFactorCheck => {
  const trimmed = code.trim();
  if (!user.twoFactorSecret || !trimmed) return { ok: false };
  if (/^[\d\s]+$/.test(trimmed)) {
    const secret = decryptTwoFactorSecret(user.twoFactorSecret, user.id);
    if (!secret) return { ok: false };
    const step = verifyTotp(secret, trimmed);
    if (step === null || step <= (user.twoFactorLastStep ?? -1)) return { ok: false };
    return { ok: true, kind: 'totp', step };
  }
  const hash = hashRecoveryCode(trimmed);
  if (!user.twoFactorRecoveryCodes.includes(hash)) return { ok: false };
  return {
    ok: true,
    kind: 'recovery',
    remaining: user.twoFactorRecoveryCodes.filter((stored) => stored !== hash),
  };
};

/** What to store after a successful check, so the same code can't be used again. */
export const consumeSecondFactor = (check: Extract<SecondFactorCheck, { ok: true }>) =>
  check.kind === 'totp'
    ? { twoFactorLastStep: check.step }
    : { twoFactorRecoveryCodes: check.remaining };

export const secondFactorSelect = {
  id: true,
  email: true,
  twoFactorSecret: true,
  twoFactorRecoveryCodes: true,
  twoFactorLastStep: true,
  twoFactorEnabledAt: true,
} as const;
