import { prismaMock } from '@/test/prisma';
import { requestPasswordReset } from './request-password-reset';

jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  generateVerificationCode: jest.fn().mockReturnValue('654321'),
  getCodeExpirationDate: jest.fn().mockReturnValue(new Date('2027-01-01')),
  checkRateLimit: jest.fn().mockReturnValue(0),
  RATE_LIMIT_SECONDS: 60,
}));
jest.mock('@react-email/render', () => ({ render: jest.fn().mockResolvedValue('<html/>') }));
jest.mock('@/components/auth/reset-password-email', () => ({
  PasswordResetCodeEmail: jest.fn(),
}));

import * as emailLib from '@/lib/email';
const emailLibMock = emailLib as jest.Mocked<typeof emailLib>;

const baseUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hash',
  emailVerified: true,
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

describe('requestPasswordReset', () => {
  beforeEach(() => {
    emailLibMock.checkRateLimit.mockReturnValue(0);
  });

  it('returns success without revealing whether the email exists when the user is not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await requestPasswordReset('nobody@example.com');

    expect(result).toEqual({ success: true, waitSeconds: 0 });
    expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
    expect(emailLibMock.sendEmail).not.toHaveBeenCalled();
  });

  it('throws a RATE_LIMIT error when the user must wait', async () => {
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    prismaMock.passwordResetToken.findFirst.mockResolvedValue({
      id: 'token-old',
      email: 'test@example.com',
      code: '000000',
      used: false,
      expiresAt: new Date('2027-01-01'),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    emailLibMock.checkRateLimit.mockReturnValue(45);

    await expect(requestPasswordReset('test@example.com')).rejects.toThrow('RATE_LIMIT:45');

    expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
  });

  it('invalidates old tokens, creates a new token, sends the email, and returns success', async () => {
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    prismaMock.passwordResetToken.findFirst.mockResolvedValue(null);
    prismaMock.passwordResetToken.updateMany.mockResolvedValue({ count: 0 } as any);
    prismaMock.passwordResetToken.create.mockResolvedValue({} as any);

    const result = await requestPasswordReset('test@example.com');

    expect(result).toEqual({ success: true, waitSeconds: 60 });
    expect(prismaMock.passwordResetToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ email: 'test@example.com', used: false }),
        data: { used: true },
      }),
    );
    expect(prismaMock.passwordResetToken.create).toHaveBeenCalledTimes(1);
    expect(emailLibMock.sendEmail).toHaveBeenCalledTimes(1);
  });
});
