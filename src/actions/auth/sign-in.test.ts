import bcrypt from 'bcryptjs';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { signIn } from './sign-in';

jest.mock('bcryptjs');

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
  it('returns INVALID_CREDENTIALS when no user is found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await signIn(validInput);

    expect(result).toEqual({ success: false, error: 'INVALID_CREDENTIALS' });
    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });

  it('returns INVALID_CREDENTIALS when password is wrong', async () => {
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    bcryptMock.compare.mockResolvedValue(false);

    const result = await signIn(validInput);

    expect(result).toEqual({ success: false, error: 'INVALID_CREDENTIALS' });
    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });

  it('returns EMAIL_NOT_VERIFIED when email is not yet verified', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...baseUser, emailVerified: false } as any);
    bcryptMock.compare.mockResolvedValue(true);

    const result = await signIn(validInput);

    expect(result).toEqual({
      success: false,
      error: 'EMAIL_NOT_VERIFIED',
      email: 'test@example.com',
    });
    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });

  it('creates a session, sets the cookie, and returns success', async () => {
    const { set } = mockCookies();
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    bcryptMock.compare.mockResolvedValue(true);
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
      'session-abc',
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('includes the redirectTo value from input in the success response', async () => {
    mockCookies();
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    bcryptMock.compare.mockResolvedValue(true);
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

  it('returns INVALID_CREDENTIALS on invalid input (zod failure)', async () => {
    const result = await signIn({ email: 'not-an-email', password: 'ok' } as any);

    expect(result).toEqual({ success: false, error: 'INVALID_CREDENTIALS' });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});
