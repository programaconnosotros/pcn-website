import bcrypt from 'bcryptjs';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { DUMMY_PASSWORD_HASH } from '@/lib/password';
import { createTwoFactorChallenge } from '@/lib/two-factor';
import { signIn } from './sign-in';

jest.mock('bcryptjs');
jest.mock('@/lib/two-factor', () => ({ createTwoFactorChallenge: jest.fn() }));

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

// Minimal User fixture — only fields accessed by signIn
const baseUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashed-password',
  emailVerified: true,
  phoneNumber: null,
  role: 'REGULAR' as const,
  image: null,
  countryOfOrigin: null,
  province: null,
  xAccountUrl: null,
  linkedinUrl: null,
  gitHubUrl: null,
  slogan: null,
  jobTitle: null,
  enterprise: null,
  career: null,
  studyPlace: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const validInput = { email: 'test@example.com', password: 'pass1234' };

describe('signIn', () => {
  it('opens the second step instead of a session when two-factor is on', async () => {
    mockCookies();
    prismaMock.user.findUnique.mockResolvedValue({
      ...baseUser,
      twoFactorEnabledAt: new Date(),
    } as never);
    bcryptMock.compare.mockResolvedValue(true as never);

    const result = await signIn({ ...validInput, redirectTo: '/eventos' });

    expect(result).toEqual({ success: false, error: 'TWO_FACTOR_REQUIRED' });
    expect(createTwoFactorChallenge).toHaveBeenCalledWith('user-1', '/eventos');
    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });

  it('returns INVALID_CREDENTIALS when no user is found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await signIn(validInput);

    expect(result).toEqual({ success: false, error: 'INVALID_CREDENTIALS' });
    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });

  it('still runs bcrypt when no user is found, so the timing does not reveal the email', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    (bcryptMock.compare as jest.Mock).mockResolvedValue(true);

    const result = await signIn(validInput);

    expect(bcryptMock.compare).toHaveBeenCalledWith(validInput.password, DUMMY_PASSWORD_HASH);
    expect(result).toEqual({ success: false, error: 'INVALID_CREDENTIALS' });
  });

  it('returns INVALID_CREDENTIALS when password is wrong', async () => {
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    (bcryptMock.compare as jest.Mock).mockResolvedValue(false);

    const result = await signIn(validInput);

    expect(result).toEqual({ success: false, error: 'INVALID_CREDENTIALS' });
    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });

  it('returns EMAIL_NOT_VERIFIED when email is not yet verified', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...baseUser, emailVerified: false } as any);
    (bcryptMock.compare as jest.Mock).mockResolvedValue(true);

    const result = await signIn(validInput);

    expect(result).toEqual({
      success: false,
      error: 'EMAIL_NOT_VERIFIED',
      email: 'test@example.com',
    });
    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });

  it('returns ACCOUNT_SUSPENDED for a suspended account, only with the right password', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...baseUser, suspendedAt: new Date() } as any);
    (bcryptMock.compare as jest.Mock).mockResolvedValue(true);

    expect(await signIn(validInput)).toEqual({ success: false, error: 'ACCOUNT_SUSPENDED' });
    expect(prismaMock.session.create).not.toHaveBeenCalled();

    (bcryptMock.compare as jest.Mock).mockResolvedValue(false);
    expect(await signIn(validInput)).toEqual({ success: false, error: 'INVALID_CREDENTIALS' });
  });

  it('creates a session, sets the cookie, and returns success', async () => {
    const { set } = mockCookies();
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
    prismaMock.session.create.mockResolvedValue({
      id: 'session-abc',
      userId: 'user-1',
      expires: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await signIn(validInput);

    expect(result).toEqual({ success: true, redirectTo: '/' });
    expect(prismaMock.session.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'user-1' }),
      }),
    );
    expect(set).toHaveBeenCalledWith(
      'sessionId',
      expect.any(String),
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('includes the redirectTo value from input in the success response', async () => {
    mockCookies();
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
    prismaMock.session.create.mockResolvedValue({
      id: 'session-xyz',
      userId: 'user-1',
      expires: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await signIn({ ...validInput, redirectTo: '/dashboard' });

    expect(result).toEqual({ success: true, redirectTo: '/dashboard' });
  });

  it('rehashes a password stored with an older bcrypt cost', async () => {
    mockCookies();
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
    (bcryptMock.getRounds as jest.Mock).mockReturnValue(10);
    (bcryptMock.hash as jest.Mock).mockResolvedValue('new-hash');
    prismaMock.session.create.mockResolvedValue({ id: 'session-xyz' } as any);

    const result = await signIn(validInput);

    expect(result).toEqual({ success: true, redirectTo: '/' });
    expect(bcryptMock.hash).toHaveBeenCalledWith(validInput.password, 12);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { password: 'new-hash' },
    });
  });

  it('does not rehash a password that already uses the current cost', async () => {
    mockCookies();
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
    (bcryptMock.getRounds as jest.Mock).mockReturnValue(12);
    prismaMock.session.create.mockResolvedValue({ id: 'session-xyz' } as any);

    await signIn(validInput);

    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('falls back to the home page when redirectTo points to another site', async () => {
    mockCookies();
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
    prismaMock.session.create.mockResolvedValue({ id: 'session-xyz' } as any);

    const result = await signIn({ ...validInput, redirectTo: '//evil.example' });

    expect(result).toEqual({ success: true, redirectTo: '/' });
  });

  it('returns INVALID_CREDENTIALS on invalid input (zod failure)', async () => {
    const result = await signIn({ email: 'not-an-email', password: 'ok' } as any);

    expect(result).toEqual({ success: false, error: 'INVALID_CREDENTIALS' });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});
