import { prismaMock } from '@/test/prisma';
import { enforceRateLimit } from '@/lib/rate-limit';
import { signUp } from './sign-up';

jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  generateVerificationCode: jest.fn().mockReturnValue('123456'),
  getCodeExpirationDate: jest.fn().mockReturnValue(new Date('2027-01-01')),
}));
jest.mock('@/lib/password', () => ({ hashPassword: jest.fn().mockResolvedValue('hashed') }));
jest.mock('@react-email/render', () => ({ render: jest.fn().mockResolvedValue('<html/>') }));
jest.mock('@/components/auth/verification-email', () => ({
  EmailVerificationEmail: jest.fn(),
}));

import * as emailLib from '@/lib/email';
const emailLibMock = emailLib as jest.Mocked<typeof emailLib>;

const input = {
  name: 'Ana Pérez',
  email: 'ana@example.com',
  password: 'supersecret',
  confirmPassword: 'supersecret',
  country: 'Uruguay',
};

const createdUser = { id: 'user-1', name: 'Ana Pérez', email: 'ana@example.com' };

const mockCreate = () => {
  prismaMock.user.findFirst.mockResolvedValue(null);
  prismaMock.user.create.mockResolvedValue(createdUser as never);
  prismaMock.emailVerificationToken.create.mockResolvedValue({} as never);
};

describe('signUp', () => {
  beforeEach(() => {
    emailLibMock.sendEmail.mockResolvedValue(undefined as never);
  });

  it('creates an unverified user, stores a code, emails it and returns the verify URL', async () => {
    mockCreate();

    const result = await signUp(input);

    expect(enforceRateLimit).toHaveBeenCalledWith('signUp');
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        name: 'Ana Pérez',
        email: 'ana@example.com',
        password: 'hashed',
        province: undefined,
        countryOfOrigin: 'Uruguay',
        jobTitle: null,
        career: null,
        enterprise: null,
        studyPlace: null,
        image: null,
        phoneNumber: null,
        emailVerified: false,
      },
    });
    expect(prismaMock.emailVerificationToken.create).toHaveBeenCalledWith({
      data: { email: 'ana@example.com', code: '123456', expiresAt: new Date('2027-01-01') },
    });
    expect(emailLibMock.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'ana@example.com', html: '<html/>' }),
    );
    expect(result).toEqual({
      success: true,
      redirectUrl: '/autenticacion/verificar-email?email=ana%40example.com',
    });
  });

  it('keeps the optional profile fields and a safe redirect target', async () => {
    mockCreate();

    const result = await signUp({
      ...input,
      country: 'Argentina',
      province: 'Córdoba',
      profession: 'Dev',
      studyField: 'Sistemas',
      enterprise: 'PCN',
      studyPlace: 'UTN',
      image: 'https://img/a.png',
      phoneNumber: '+54 11',
      redirectTo: '/eventos/1?x=1',
    });

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        province: 'Córdoba',
        jobTitle: 'Dev',
        career: 'Sistemas',
        enterprise: 'PCN',
        studyPlace: 'UTN',
        image: 'https://img/a.png',
        phoneNumber: '+54 11',
      }),
    });
    expect(result).toEqual({
      success: true,
      redirectUrl: `/autenticacion/verificar-email?email=ana%40example.com&redirect=${encodeURIComponent('/eventos/1?x=1')}`,
    });
  });

  it('drops an external redirect target', async () => {
    mockCreate();

    const result = await signUp({ ...input, redirectTo: 'https://evil.com' });

    expect(result).toEqual({
      success: true,
      redirectUrl: '/autenticacion/verificar-email?email=ana%40example.com',
    });
  });

  it('returns EMAIL_ALREADY_EXISTS when the email is taken', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: 'other' } as never);

    await expect(signUp(input)).resolves.toEqual({
      success: false,
      error: 'EMAIL_ALREADY_EXISTS',
    });
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('maps a P2002 unique violation on email to EMAIL_ALREADY_EXISTS', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockRejectedValue({ code: 'P2002', meta: { target: ['email'] } });

    await expect(signUp(input)).resolves.toEqual({
      success: false,
      error: 'EMAIL_ALREADY_EXISTS',
    });
  });

  it('returns UNKNOWN_ERROR for other database failures', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockRejectedValue({ code: 'P2002', meta: { target: ['name'] } });

    await expect(signUp(input)).resolves.toEqual({ success: false, error: 'UNKNOWN_ERROR' });

    prismaMock.user.create.mockRejectedValue(new Error('down'));
    await expect(signUp(input)).resolves.toEqual({ success: false, error: 'UNKNOWN_ERROR' });
  });

  it('still succeeds when the verification email fails to send', async () => {
    mockCreate();
    emailLibMock.sendEmail.mockRejectedValueOnce(new Error('SMTP down'));
    await expect(signUp(input)).resolves.toMatchObject({ success: true });

    mockCreate();
    emailLibMock.sendEmail.mockRejectedValueOnce('not an error');
    await expect(signUp(input)).resolves.toMatchObject({ success: true });
  });

  it('rejects invalid input before touching the database', async () => {
    await expect(signUp({ ...input, email: 'nope' })).rejects.toThrow();
    await expect(signUp({ ...input, confirmPassword: 'different' })).rejects.toThrow();
    await expect(signUp({ ...input, country: 'Argentina' })).rejects.toThrow(
      'La provincia es requerida',
    );
    await expect(
      signUp({ ...input, password: 'short', confirmPassword: 'short' }),
    ).rejects.toThrow();
    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
  });
});
