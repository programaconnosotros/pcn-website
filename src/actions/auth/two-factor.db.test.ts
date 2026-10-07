import prisma from '@/lib/prisma';
import { actAs, createUser } from '@/test/db/fixtures';
import { timeStep, totpAt } from '@/lib/totp';
import { signIn } from './sign-in';
import {
  confirmTwoFactorSetup,
  disableTwoFactor,
  regenerateRecoveryCodes,
  startTwoFactorSetup,
  verifyTwoFactorSignIn,
} from './two-factor';

// Two-factor sign-in against Postgres: turning it on, signing in with the app's code or a
// recovery code, codes that can't be replayed, and turning it off.

const password = 'una-clave-segura';

const enable = async () => {
  const user = await createUser({ password });
  await actAs(user.id);
  const { secret, qr } = await startTwoFactorSetup();
  expect(qr).toMatch(/^data:image\/svg\+xml;utf8,/);
  const step = timeStep();
  const { recoveryCodes } = await confirmTwoFactorSetup(totpAt(secret, step));
  return { user, secret, step, recoveryCodes };
};

it('keeps the secret and recovery codes out of ordinary user reads', async () => {
  const { user } = await enable();
  const read = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  expect(read).not.toHaveProperty('twoFactorSecret');
  expect(read).not.toHaveProperty('twoFactorRecoveryCodes');
  expect(read.twoFactorEnabledAt).toBeInstanceOf(Date);
});

it('stores the secret encrypted, never as the app reads it', async () => {
  const { user, secret } = await enable();
  const { twoFactorSecret } = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { twoFactorSecret: true },
  });
  expect(twoFactorSecret).toMatch(/^v1:/);
  expect(twoFactorSecret).not.toContain(secret);
});

it('asks for the code after the password and signs in with it, once', async () => {
  const { user, secret, step } = await enable();
  await actAs();

  await expect(signIn({ email: user.email, password })).resolves.toEqual({
    success: false,
    error: 'TWO_FACTOR_REQUIRED',
  });
  expect(await prisma.session.count({ where: { userId: user.id } })).toBe(1); // only actAs's

  // The code used to turn it on was already spent
  await expect(verifyTwoFactorSignIn(totpAt(secret, step))).resolves.toEqual({
    success: false,
    error: 'INVALID_CODE',
  });
  const result = await verifyTwoFactorSignIn(totpAt(secret, step + 1));
  expect(result).toMatchObject({ success: true, redirectTo: '/', usedRecoveryCode: false });
  expect(await prisma.session.count({ where: { userId: user.id } })).toBe(2);
  expect(await prisma.twoFactorChallenge.count({ where: { userId: user.id } })).toBe(0);

  // Without a pending sign-in there's nothing to verify
  await expect(verifyTwoFactorSignIn(totpAt(secret, step + 1))).resolves.toEqual({
    success: false,
    error: 'EXPIRED',
  });
});

it('takes each recovery code once and drops the attempt after too many wrong codes', async () => {
  const { user, recoveryCodes } = await enable();
  expect(recoveryCodes).toHaveLength(10);

  await actAs();
  await signIn({ email: user.email, password });
  await expect(verifyTwoFactorSignIn(recoveryCodes[0].toUpperCase())).resolves.toMatchObject({
    success: true,
    usedRecoveryCode: true,
    recoveryCodesLeft: 9,
  });

  await actAs();
  await signIn({ email: user.email, password });
  for (let i = 0; i < 4; i++) {
    await expect(verifyTwoFactorSignIn(recoveryCodes[0])).resolves.toEqual({
      success: false,
      error: 'INVALID_CODE',
    });
  }
  await expect(verifyTwoFactorSignIn('000000')).resolves.toEqual({
    success: false,
    error: 'EXPIRED',
  });
  await expect(verifyTwoFactorSignIn(recoveryCodes[1])).resolves.toEqual({
    success: false,
    error: 'EXPIRED',
  });
});

it('regenerates recovery codes and turns off with a code', async () => {
  const { user, secret, step, recoveryCodes } = await enable();

  await expect(regenerateRecoveryCodes(recoveryCodes[0])).rejects.toThrow(
    'Usá un código de la app',
  );
  const { recoveryCodes: fresh } = await regenerateRecoveryCodes(totpAt(secret, step + 1));
  expect(fresh).not.toEqual(recoveryCodes);

  await expect(disableTwoFactor(recoveryCodes[0])).rejects.toThrow('El código no es válido');
  await disableTwoFactor(fresh[0]);
  const read = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { twoFactorEnabledAt: true, twoFactorSecret: true, twoFactorRecoveryCodes: true },
  });
  expect(read).toEqual({
    twoFactorEnabledAt: null,
    twoFactorSecret: null,
    twoFactorRecoveryCodes: [],
  });

  await actAs();
  await expect(signIn({ email: user.email, password })).resolves.toMatchObject({ success: true });
});

it('rejects a wrong first code and refuses to set it up twice', async () => {
  const user = await createUser({ password });
  await actAs(user.id);
  await expect(confirmTwoFactorSetup('123456')).rejects.toThrow('Empezá la configuración');
  const { secret } = await startTwoFactorSetup();
  const wrong = totpAt(secret, timeStep() + 5);
  await expect(confirmTwoFactorSetup(wrong)).rejects.toThrow('El código no es válido');
  await confirmTwoFactorSetup(totpAt(secret, timeStep()));
  await expect(startTwoFactorSetup()).rejects.toThrow('ya está activada');
});

it('signs in only once when the same code arrives twice at the same time', async () => {
  const { user, secret, step } = await enable();
  await actAs();
  await signIn({ email: user.email, password });

  const code = totpAt(secret, step + 1);
  const results = await Promise.all([verifyTwoFactorSignIn(code), verifyTwoFactorSignIn(code)]);
  expect(results.filter((result) => result.success)).toHaveLength(1);
  expect(await prisma.session.count({ where: { userId: user.id } })).toBe(2); // actAs's + one
});

it('checks no more than the allowed codes when they arrive all at once', async () => {
  const { user, secret, step } = await enable();
  await actAs();
  await signIn({ email: user.email, password });

  // Eight wrong codes and the right one, all in flight together: at most five are looked at
  const wrong = Array.from({ length: 8 }, (_, i) => String(100000 + i));
  const results = await Promise.all(
    [...wrong, totpAt(secret, step + 1)].map((code) => verifyTwoFactorSignIn(code)),
  );
  expect(
    results.filter((result) => result.success === false && result.error === 'INVALID_CODE').length,
  ).toBeLessThanOrEqual(5);
});

it('limits code guesses per account, not only per IP', async () => {
  const { user } = await enable();
  for (let i = 0; i < 2; i++) {
    await actAs();
    await signIn({ email: user.email, password });
    for (let j = 0; j < 5; j++) await verifyTwoFactorSignIn('000000');
  }
  await actAs();
  await signIn({ email: user.email, password });
  await expect(verifyTwoFactorSignIn('000000')).rejects.toThrow('RATE_LIMIT');
});

it('spends the code that turns it off, even against a request racing with it', async () => {
  const { secret, step } = await enable();
  const code = totpAt(secret, step + 1);
  const results = await Promise.allSettled([regenerateRecoveryCodes(code), disableTwoFactor(code)]);
  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
});
