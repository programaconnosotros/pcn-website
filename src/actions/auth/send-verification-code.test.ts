import { prismaMock } from '@/test/prisma';
import { sendVerificationCode } from './send-verification-code';

jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  generateVerificationCode: jest.fn().mockReturnValue('123456'),
  getCodeExpirationDate: jest.fn().mockReturnValue(new Date('2027-01-01')),
  checkRateLimit: jest.fn().mockReturnValue(0),
  RATE_LIMIT_SECONDS: 60,
}));
jest.mock('@react-email/render', () => ({ render: jest.fn().mockResolvedValue('<html/>') }));
jest.mock('@/components/auth/verification-email', () => ({
  EmailVerificationEmail: jest.fn(),
}));

// Pull the mocked module so individual tests can override its return values.
import * as emailLib from '@/lib/email';
const emailLibMock = emailLib as jest.Mocked<typeof emailLib>;

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

describe('sendVerificationCode', () => {
  beforeEach(() => {
    // Reset rate limit to "not rate-limited" before each test.
    emailLibMock.checkRateLimit.mockReturnValue(0);
  });

  it('throws when the user is not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(sendVerificationCode('unknown@example.com')).rejects.toThrow(
      'Usuario no encontrado',
    );

    expect(prismaMock.emailVerificationToken.create).not.toHaveBeenCalled();
  });

  it('returns alreadyVerified when the user email is already verified', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...baseUser, emailVerified: true } as any);

    const result = await sendVerificationCode('test@example.com');

    expect(result).toEqual({ success: true, alreadyVerified: true, waitSeconds: 0 });
    expect(prismaMock.emailVerificationToken.create).not.toHaveBeenCalled();
  });

  it('throws a RATE_LIMIT error when the user must wait', async () => {
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    prismaMock.emailVerificationToken.findFirst.mockResolvedValue({
      id: 'token-old',
      email: 'test@example.com',
      code: '000000',
      used: false,
      expiresAt: new Date('2027-01-01'),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    emailLibMock.checkRateLimit.mockReturnValue(30);

    await expect(sendVerificationCode('test@example.com')).rejects.toThrow('RATE_LIMIT:30');

    expect(prismaMock.emailVerificationToken.create).not.toHaveBeenCalled();
  });

  it('invalidates old tokens, creates a new token, sends the email, and returns success', async () => {
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    prismaMock.emailVerificationToken.findFirst.mockResolvedValue(null);
    prismaMock.emailVerificationToken.updateMany.mockResolvedValue({ count: 0 } as any);
    prismaMock.emailVerificationToken.create.mockResolvedValue({} as any);

    const result = await sendVerificationCode('test@example.com');

    expect(result).toEqual({ success: true, alreadyVerified: false, waitSeconds: 60 });
    expect(prismaMock.emailVerificationToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ email: 'test@example.com', used: false }),
        data: { used: true },
      }),
    );
    expect(prismaMock.emailVerificationToken.create).toHaveBeenCalledTimes(1);
    expect(emailLibMock.sendEmail).toHaveBeenCalledTimes(1);
  });
});
