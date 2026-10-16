import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { sendEmail } from '@/lib/email';
import { verifyEmailCode } from './verify-email-code';

jest.mock('@/lib/email', () => ({ sendEmail: jest.fn() }));
jest.mock('@react-email/render', () => ({ render: jest.fn().mockResolvedValue('<html/>') }));

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
  beforeEach(() => {
    prismaMock.emailVerificationToken.updateMany.mockResolvedValue({ count: 1 });
  });

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

    expect(result).toEqual({ success: true, isNewMember: true });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    // The first verification is the sign-up: a welcome email and notification go out.
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'test@example.com', subject: expect.stringMatching(/parte/) }),
    );
    expect(prismaMock.notification.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ userId: 'user-1', type: 'welcome' })],
    });
    expect(prismaMock.session.create).toHaveBeenCalledTimes(1);
    expect(store.set).toHaveBeenCalledWith(
      'sessionId',
      expect.any(String),
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('only welcomes once, and a failed welcome email does not block the sign-in', async () => {
    mockCookies();
    prismaMock.emailVerificationToken.findFirst.mockResolvedValue(validToken as any);
    prismaMock.$transaction.mockResolvedValue([undefined, undefined] as any);
    prismaMock.session.create.mockResolvedValue({
      id: 's',
      expires: new Date('2027-01-01'),
    } as any);

    prismaMock.user.findUnique.mockResolvedValue({ ...baseUser, emailVerified: true } as any);
    await expect(verifyEmailCode('test@example.com', '123456')).resolves.toEqual({
      success: true,
      isNewMember: false,
    });
    expect(sendEmail).not.toHaveBeenCalled();

    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    jest.mocked(sendEmail).mockRejectedValueOnce(new Error('Resend caído'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(verifyEmailCode('test@example.com', '123456')).resolves.toMatchObject({
      isNewMember: true,
    });
  });
});
