import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { BCRYPT_COST } from '@/lib/password';
import { RateLimitError } from '@/lib/rate-limit';
import { hashSessionToken } from '@/lib/session';
import { MAX_CODE_ATTEMPTS } from '@/lib/verification-codes';
import { signUp } from '@/actions/auth/sign-up';
import { signIn } from '@/actions/auth/sign-in';
import { signOut } from '@/actions/auth/sign-out';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { sendVerificationCode } from '@/actions/auth/send-verification-code';
import { verifyEmailCode } from '@/actions/auth/verify-email-code';
import { requestPasswordReset } from '@/actions/auth/request-password-reset';
import { verifyResetCode } from '@/actions/auth/verify-reset-code';
import { completePasswordReset } from '@/actions/auth/complete-password-reset';
import { actAs, createUser } from '@/test/db/fixtures';
import { quickUser, sessionCookie, uid } from '@/test/db/actions-fixtures';

// Registro, login, verificación de email y reseteo de contraseña contra Postgres real: qué filas
// de usuario, sesión y token quedan después de cada paso.

// render() de react-email hace un import() dinámico que Jest no ejecuta; el HTML no importa acá
jest.mock('@react-email/render', () => ({ render: jest.fn().mockResolvedValue('<p>código</p>') }));

jest.spyOn(console, 'error').mockImplementation(() => {});

const passwordOf = async (userId: string) =>
  (
    await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      omit: { password: false },
    })
  ).password;

const signUpData = (email: string) => ({
  name: 'Ada Lovelace',
  email,
  password: 'una-clave-larga',
  confirmPassword: 'una-clave-larga',
  country: 'Uruguay',
  profession: 'Dev',
  enterprise: '',
  studyField: '',
  studyPlace: '',
  phoneNumber: '',
});

/** Un token vigente para `email` con un código conocido. */
const insertToken = (
  model: 'emailVerificationToken' | 'passwordResetToken',
  email: string,
  overrides: { code?: string; expiresAt?: Date; createdAt?: Date } = {},
) => {
  const data = {
    email,
    code: overrides.code ?? '123456',
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 15 * 60_000),
    ...(overrides.createdAt && { createdAt: overrides.createdAt }),
  };
  return model === 'emailVerificationToken'
    ? prisma.emailVerificationToken.create({ data })
    : prisma.passwordResetToken.create({ data });
};

beforeEach(() => actAs());

describe('signUp', () => {
  it('creates an unverified user with a hashed password and a verification token', async () => {
    const email = `alta-${uid()}@test.pcn`;

    const result = await signUp({ ...signUpData(email), redirectTo: '/eventos' });

    expect(result).toEqual({
      success: true,
      redirectUrl: `/autenticacion/verificar-email?email=${encodeURIComponent(email)}&redirect=%2Feventos`,
    });
    const user = await prisma.user.findUniqueOrThrow({
      where: { email },
      omit: { password: false },
    });
    expect(user).toMatchObject({
      name: 'Ada Lovelace',
      emailVerified: false,
      role: 'REGULAR',
      countryOfOrigin: 'Uruguay',
      jobTitle: 'Dev',
      enterprise: null,
      career: null,
      phoneNumber: null,
    });
    expect(user.password).not.toBe('una-clave-larga');
    expect(await bcrypt.compare('una-clave-larga', user.password)).toBe(true);

    const tokens = await prisma.emailVerificationToken.findMany({ where: { email } });
    expect(tokens).toHaveLength(1);
    expect(tokens[0].code).toMatch(/^\d{6}$/);
    expect(tokens[0].used).toBe(false);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: email }));
    // No inicia sesión hasta verificar el email
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0);
  });

  it('drops an off-site redirect', async () => {
    const email = `alta-${uid()}@test.pcn`;

    const result = await signUp({ ...signUpData(email), redirectTo: '//evil.example' });

    expect(result).toEqual({
      success: true,
      redirectUrl: `/autenticacion/verificar-email?email=${encodeURIComponent(email)}`,
    });
  });

  it('refuses a duplicate email and leaves the existing account untouched', async () => {
    const existing = await createUser({ name: 'Dueña Original' });
    const before = await passwordOf(existing.id);

    const result = await signUp(signUpData(existing.email));

    expect(result).toEqual({ success: false, error: 'EMAIL_ALREADY_EXISTS' });
    expect(await prisma.user.count({ where: { email: existing.email } })).toBe(1);
    const after = await prisma.user.findUniqueOrThrow({ where: { id: existing.id } });
    expect(after.name).toBe('Dueña Original');
    expect(await passwordOf(existing.id)).toBe(before);
    expect(await prisma.emailVerificationToken.count({ where: { email: existing.email } })).toBe(0);
  });

  it('still registers the user when the verification email fails to send', async () => {
    (sendEmail as jest.Mock).mockRejectedValueOnce(new Error('SMTP caído'));
    const email = `alta-${uid()}@test.pcn`;

    const result = await signUp(signUpData(email));

    expect(result.success).toBe(true);
    expect(await prisma.user.count({ where: { email } })).toBe(1);
    expect(await prisma.emailVerificationToken.count({ where: { email } })).toBe(1);
  });

  it.each([
    ['mismatched passwords', { confirmPassword: 'otra-clave-larga' }],
    ['a short password', { password: 'corta', confirmPassword: 'corta' }],
    ['Argentina without a province', { country: 'Argentina' }],
    ['digits in the name', { name: 'R2D2' }],
  ])('rejects %s without creating anything', async (_case, override) => {
    const email = `alta-${uid()}@test.pcn`;

    await expect(signUp({ ...signUpData(email), ...override })).rejects.toThrow();
    expect(await prisma.user.count({ where: { email } })).toBe(0);
    expect(await prisma.emailVerificationToken.count({ where: { email } })).toBe(0);
  });

  it('ignores fields that are not part of the form, like role or emailVerified', async () => {
    const email = `alta-${uid()}@test.pcn`;

    await signUp({
      ...signUpData(email),
      role: 'ADMIN',
      emailVerified: true,
    } as unknown as Parameters<typeof signUp>[0]);

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(user.role).toBe('REGULAR');
    expect(user.emailVerified).toBe(false);
  });

  // BUG: el chequeo de email duplicado distingue mayúsculas. Con `ana@x` registrada, `Ana@x` crea
  // una segunda cuenta para la misma casilla (y el login con la otra capitalización falla).
  it.failing('treats an email that differs only in case as a duplicate', async () => {
    const lower = `caso-${uid()}@test.pcn`;
    await createUser({ email: lower });

    const result = await signUp(signUpData(lower.toUpperCase()));

    expect(result).toEqual({ success: false, error: 'EMAIL_ALREADY_EXISTS' });
    expect(
      await prisma.user.count({ where: { email: { equals: lower, mode: 'insensitive' } } }),
    ).toBe(1);
  });
});

describe('signIn', () => {
  it('creates a session row matching the cookie it sets', async () => {
    const user = await createUser({ password: 'mi-clave-secreta' });

    const result = await signIn({
      email: user.email,
      password: 'mi-clave-secreta',
      redirectTo: '/perfil',
    });

    expect(result).toEqual({ success: true, redirectTo: '/perfil' });
    const token = await sessionCookie();
    expect(token).toBeDefined();
    const session = await prisma.session.findUniqueOrThrow({
      where: { id: hashSessionToken(token!) },
    });
    expect(session.userId).toBe(user.id);
    expect(session.expires.getTime()).toBeGreaterThan(Date.now());
    // La base guarda el hash, nunca el token en claro
    expect(await prisma.session.findUnique({ where: { id: token! } })).toBeNull();
  });

  it('cleans up the user’s expired sessions when signing in', async () => {
    const user = await createUser({ password: 'mi-clave-secreta' });
    await prisma.session.create({
      data: { id: randomBytes(16).toString('hex'), userId: user.id, expires: new Date(0) },
    });

    await signIn({ email: user.email, password: 'mi-clave-secreta' });

    const sessions = await prisma.session.findMany({ where: { userId: user.id } });
    expect(sessions).toHaveLength(1);
    expect(sessions[0].expires.getTime()).toBeGreaterThan(Date.now());
  });

  it('refuses a wrong password without creating a session', async () => {
    const user = await createUser({ password: 'mi-clave-secreta' });

    const result = await signIn({ email: user.email, password: 'otra-cosa' });

    expect(result).toEqual({ success: false, error: 'INVALID_CREDENTIALS' });
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0);
    expect(await sessionCookie()).toBeUndefined();
  });

  it('answers the same for an unknown email', async () => {
    const result = await signIn({ email: `nadie-${uid()}@test.pcn`, password: 'lo-que-sea' });

    expect(result).toEqual({ success: false, error: 'INVALID_CREDENTIALS' });
  });

  it('does not sign in an unverified user', async () => {
    const user = await createUser({ password: 'mi-clave-secreta' });
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: false } });

    const result = await signIn({ email: user.email, password: 'mi-clave-secreta' });

    expect(result).toEqual({ success: false, error: 'EMAIL_NOT_VERIFIED', email: user.email });
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0);
  });

  it('rehashes a password stored with an old bcrypt cost', async () => {
    const user = await quickUser();
    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash('clave-vieja-123', 4) },
    });

    await expect(signIn({ email: user.email, password: 'clave-vieja-123' })).resolves.toMatchObject(
      { success: true },
    );

    const stored = await passwordOf(user.id);
    expect(bcrypt.getRounds(stored)).toBe(BCRYPT_COST);
    expect(await bcrypt.compare('clave-vieja-123', stored)).toBe(true);
  });

  it('falls back to / for an off-site redirect', async () => {
    const user = await createUser({ password: 'mi-clave-secreta' });

    const result = await signIn({
      email: user.email,
      password: 'mi-clave-secreta',
      redirectTo: 'https://evil.example',
    });

    expect(result).toEqual({ success: true, redirectTo: '/' });
  });
});

describe('signOut and getCurrentSession', () => {
  it('returns the session of the cookie, without the password hash', async () => {
    const user = await quickUser();
    await actAs(user.id);

    const session = await getCurrentSession();

    expect(session?.userId).toBe(user.id);
    expect(session?.user.email).toBe(user.email);
    expect(session?.user).not.toHaveProperty('password');
  });

  it('returns null for an expired session', async () => {
    const user = await quickUser();
    await actAs(user.id);
    await prisma.session.updateMany({
      where: { userId: user.id },
      data: { expires: new Date(Date.now() - 1000) },
    });

    await expect(getCurrentSession()).resolves.toBeNull();
  });

  it('returns null without a cookie', async () => {
    await expect(getCurrentSession()).resolves.toBeNull();
  });

  it('deletes only the current session row and clears the cookie', async () => {
    const user = await quickUser();
    await actAs(user.id); // otro dispositivo
    await actAs(user.id);
    const token = await sessionCookie();

    await expect(signOut()).rejects.toThrow('NEXT_REDIRECT:/autenticacion/iniciar-sesion');

    expect(await prisma.session.findUnique({ where: { id: hashSessionToken(token!) } })).toBeNull();
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(1);
    expect(await sessionCookie()).toBeUndefined();
  });
});

describe('sendVerificationCode', () => {
  const unverifiedUser = async () => {
    const user = await quickUser();
    return prisma.user.update({ where: { id: user.id }, data: { emailVerified: false } });
  };

  it('replaces the previous unused code with a new one', async () => {
    const user = await unverifiedUser();
    const old = await insertToken('emailVerificationToken', user.email, {
      createdAt: new Date(Date.now() - 5 * 60_000),
    });

    await expect(sendVerificationCode(user.email)).resolves.toMatchObject({ success: true });

    const tokens = await prisma.emailVerificationToken.findMany({
      where: { email: user.email },
      orderBy: { createdAt: 'asc' },
    });
    expect(tokens).toHaveLength(2);
    expect(tokens[0]).toMatchObject({ id: old.id, used: true });
    expect(tokens[1].used).toBe(false);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: user.email }));
  });

  it('refuses a second code within the minute', async () => {
    const user = await unverifiedUser();
    await sendVerificationCode(user.email);

    await expect(sendVerificationCode(user.email)).rejects.toBeInstanceOf(RateLimitError);
    expect(await prisma.emailVerificationToken.count({ where: { email: user.email } })).toBe(1);
  });

  it('sends nothing for an unknown or already verified email, answering the same', async () => {
    const verified = await quickUser();
    const unknown = `nadie-${uid()}@test.pcn`;

    const a = await sendVerificationCode(verified.email);
    const b = await sendVerificationCode(unknown);

    expect(a).toEqual(b);
    expect(
      await prisma.emailVerificationToken.count({
        where: { email: { in: [verified.email, unknown] } },
      }),
    ).toBe(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe('verifyEmailCode', () => {
  const pendingUser = async () => {
    const user = await quickUser();
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: false } });
    const token = await insertToken('emailVerificationToken', user.email, { code: '424242' });
    return { user, token };
  };

  it('verifies the email, spends the code and signs the user in', async () => {
    const { user, token } = await pendingUser();

    await expect(verifyEmailCode(user.email, '424242')).resolves.toEqual({ success: true });

    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).emailVerified).toBe(
      true,
    );
    const spent = await prisma.emailVerificationToken.findUniqueOrThrow({
      where: { id: token.id },
    });
    expect(spent.used).toBe(true);
    expect(spent.attempts).toBe(0);
    const cookie = await sessionCookie();
    expect(
      (await prisma.session.findUniqueOrThrow({ where: { id: hashSessionToken(cookie!) } })).userId,
    ).toBe(user.id);
  });

  it('rejects a reused code', async () => {
    const { user } = await pendingUser();
    await verifyEmailCode(user.email, '424242');

    await expect(verifyEmailCode(user.email, '424242')).rejects.toThrow(
      'Código inválido o expirado',
    );
  });

  it('counts a wrong code as an attempt and leaves the user unverified', async () => {
    const { user, token } = await pendingUser();

    await expect(verifyEmailCode(user.email, '000000')).rejects.toThrow(
      'Código inválido o expirado',
    );

    expect(
      (await prisma.emailVerificationToken.findUniqueOrThrow({ where: { id: token.id } })).attempts,
    ).toBe(1);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).emailVerified).toBe(
      false,
    );
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0);
  });

  it('locks the code after too many wrong attempts, even for the right code', async () => {
    const { user } = await pendingUser();
    for (let i = 0; i < MAX_CODE_ATTEMPTS; i++) {
      await expect(verifyEmailCode(user.email, '000000')).rejects.toThrow();
    }

    await expect(verifyEmailCode(user.email, '424242')).rejects.toThrow(
      'Código inválido o expirado',
    );
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).emailVerified).toBe(
      false,
    );
  });

  it('caps the attempts when wrong codes arrive in parallel', async () => {
    const { user, token } = await pendingUser();

    await Promise.allSettled(
      Array.from({ length: MAX_CODE_ATTEMPTS * 3 }, () => verifyEmailCode(user.email, '000000')),
    );

    expect(
      (await prisma.emailVerificationToken.findUniqueOrThrow({ where: { id: token.id } })).attempts,
    ).toBe(MAX_CODE_ATTEMPTS);
  });

  it('rejects an expired code', async () => {
    const user = await quickUser();
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: false } });
    await insertToken('emailVerificationToken', user.email, {
      code: '111111',
      expiresAt: new Date(Date.now() - 1000),
    });

    await expect(verifyEmailCode(user.email, '111111')).rejects.toThrow(
      'Código inválido o expirado',
    );
  });

  it('only accepts the latest code', async () => {
    const { user } = await pendingUser();
    await insertToken('emailVerificationToken', user.email, {
      code: '999999',
      createdAt: new Date(Date.now() + 1000),
    });

    await expect(verifyEmailCode(user.email, '424242')).rejects.toThrow();
    await expect(verifyEmailCode(user.email, '999999')).resolves.toEqual({ success: true });
  });
});

describe('password reset', () => {
  it('requestPasswordReset stores a fresh code and invalidates the previous one', async () => {
    const user = await quickUser();
    const old = await insertToken('passwordResetToken', user.email);

    await expect(requestPasswordReset(user.email)).resolves.toMatchObject({ success: true });

    const tokens = await prisma.passwordResetToken.findMany({ where: { email: user.email } });
    expect(tokens).toHaveLength(2);
    expect(tokens.find((t) => t.id === old.id)?.used).toBe(true);
    expect(tokens.filter((t) => !t.used)).toHaveLength(1);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: user.email }));
  });

  it('requestPasswordReset limits one code per minute per email, case-insensitively', async () => {
    const user = await quickUser();
    await requestPasswordReset(user.email);

    const again = await requestPasswordReset(user.email.toUpperCase());

    expect(again).toMatchObject({ success: false, error: 'RATE_LIMIT' });
    expect(await prisma.passwordResetToken.count({ where: { email: user.email } })).toBe(1);
  });

  it('requestPasswordReset answers success for an unknown email without storing a code', async () => {
    const email = `nadie-${uid()}@test.pcn`;

    await expect(requestPasswordReset(email)).resolves.toMatchObject({ success: true });
    expect(await prisma.passwordResetToken.count({ where: { email } })).toBe(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('requestPasswordReset reports a failed email', async () => {
    const user = await quickUser();
    (sendEmail as jest.Mock).mockRejectedValueOnce(new Error('SMTP caído'));

    await expect(requestPasswordReset(user.email)).resolves.toEqual({
      success: false,
      error: 'SEND_FAILED',
    });
  });

  it('verifyResetCode accepts the right code without spending it or counting an attempt', async () => {
    const user = await quickUser();
    const token = await insertToken('passwordResetToken', user.email, { code: '654321' });

    await expect(verifyResetCode(user.email, '654321')).resolves.toEqual({ success: true });
    await expect(verifyResetCode(user.email, '111111')).resolves.toEqual({
      success: false,
      error: 'INVALID_CODE',
    });

    const stored = await prisma.passwordResetToken.findUniqueOrThrow({ where: { id: token.id } });
    expect(stored).toMatchObject({ used: false, attempts: 1 });
  });

  it('completePasswordReset changes the password, spends the code and ends every session', async () => {
    const user = await createUser({ password: 'clave-anterior' });
    await actAs(user.id);
    await actAs(user.id);
    const token = await insertToken('passwordResetToken', user.email, { code: '777777' });

    await expect(completePasswordReset(user.email, '777777', 'clave-nueva-123')).resolves.toEqual({
      success: true,
    });

    const stored = await passwordOf(user.id);
    expect(await bcrypt.compare('clave-nueva-123', stored)).toBe(true);
    expect(await bcrypt.compare('clave-anterior', stored)).toBe(false);
    expect(
      (await prisma.passwordResetToken.findUniqueOrThrow({ where: { id: token.id } })).used,
    ).toBe(true);
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0);

    // El mismo código no sirve dos veces
    await expect(completePasswordReset(user.email, '777777', 'otra-clave-123')).resolves.toEqual({
      success: false,
      error: 'INVALID_CODE',
    });
    expect(await bcrypt.compare('clave-nueva-123', await passwordOf(user.id))).toBe(true);
  });

  it('completePasswordReset rejects a weak password before checking the code', async () => {
    const user = await createUser({ password: 'clave-anterior' });
    const token = await insertToken('passwordResetToken', user.email, { code: '777777' });
    const before = await passwordOf(user.id);

    const result = await completePasswordReset(user.email, '777777', 'corta');

    expect(result).toMatchObject({ success: false, error: 'WEAK_PASSWORD' });
    expect(await passwordOf(user.id)).toBe(before);
    expect(
      await prisma.passwordResetToken.findUniqueOrThrow({ where: { id: token.id } }),
    ).toMatchObject({ used: false, attempts: 0 });
  });

  it('completePasswordReset rejects a wrong or expired code without touching the password', async () => {
    const user = await createUser({ password: 'clave-anterior' });
    await insertToken('passwordResetToken', user.email, {
      code: '888888',
      expiresAt: new Date(Date.now() - 1000),
    });
    const before = await passwordOf(user.id);
    await actAs(user.id);

    await expect(completePasswordReset(user.email, '888888', 'clave-nueva-123')).resolves.toEqual({
      success: false,
      error: 'INVALID_CODE',
    });
    expect(await passwordOf(user.id)).toBe(before);
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(1);
  });

  it('a code for one email does not reset another account', async () => {
    const victim = await createUser({ password: 'clave-de-la-victima' });
    const attacker = await quickUser();
    await insertToken('passwordResetToken', attacker.email, { code: '121212' });
    const before = await passwordOf(victim.id);

    await expect(completePasswordReset(victim.email, '121212', 'clave-robada-1')).resolves.toEqual({
      success: false,
      error: 'INVALID_CODE',
    });
    expect(await passwordOf(victim.id)).toBe(before);
  });
});
