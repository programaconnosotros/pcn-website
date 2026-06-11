import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { verifyEmailCode } from './verify-email-code';

const baseUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hash',
  emailVerified: false,
  role: 'REGULAR' as const,
  phoneNumber: null,
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

const validToken = {
  id: 'token-1',
  email: 'test@example.com',
  code: '123456',
  used: false,
  expiresAt: new Date('2027-01-01'),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

describe('verifyEmailCode', () => {
  it('throws when the token is not found', async () => {
    prismaMock.emailVerificationToken.findFirst.mockResolvedValue(null);

    await expect(verifyEmailCode('test@example.com', '000000')).rejects.toThrow(
      'Código inválido o expirado',
    );

    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('throws when the user is not found despite a valid token', async () => {
    prismaMock.emailVerificationToken.findFirst.mockResolvedValue(validToken as any);
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(verifyEmailCode('test@example.com', '123456')).rejects.toThrow(
      'Usuario no encontrado',
    );

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('runs the transaction, creates a session, sets the cookie, and returns success', async () => {
    const store = mockCookies();
    prismaMock.emailVerificationToken.findFirst.mockResolvedValue(validToken as any);
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    prismaMock.$transaction.mockResolvedValue([undefined, undefined] as any);
    prismaMock.session.create.mockResolvedValue({
      id: 'session-new',
      userId: 'user-1',
      expires: new Date('2027-01-01'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    } as any);

    const result = await verifyEmailCode('test@example.com', '123456');

    expect(result).toEqual({ success: true });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.session.create).toHaveBeenCalledTimes(1);
    expect(store.set).toHaveBeenCalledWith(
      'sessionId',
      'session-new',
      expect.objectContaining({ httpOnly: true }),
    );
  });
});
