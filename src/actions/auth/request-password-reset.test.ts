import { prismaMock } from '@/test/prisma';
import { getRateLimitWait, resetRateLimits } from '@/lib/rate-limit';
import { requestPasswordReset } from './request-password-reset';

jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  generateVerificationCode: jest.fn().mockReturnValue('654321'),
  getCodeExpirationDate: jest.fn().mockReturnValue(new Date('2027-01-01')),
  RATE_LIMIT_SECONDS: 60,
}));
jest.mock('@react-email/render', () => ({ render: jest.fn().mockResolvedValue('<html/>') }));
jest.mock('@/components/auth/reset-password-email', () => ({
  PasswordResetCodeEmail: jest.fn(),
}));

import * as emailLib from '@/lib/email';
const emailLibMock = emailLib as jest.Mocked<typeof emailLib>;

const baseUser = { id: 'user-1', name: 'Test User', email: 'test@example.com' };

describe('requestPasswordReset', () => {
  beforeEach(() => {
    // El cooldown por email vive en memoria: cada test arranca sin envíos previos
    resetRateLimits();
    (getRateLimitWait as jest.Mock).mockResolvedValue(0);
    emailLibMock.sendEmail.mockResolvedValue(undefined);
  });

  it('answers exactly like a sent code when the email has no account', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await requestPasswordReset('unknown@example.com');

    expect(result).toEqual({ success: true, waitSeconds: 60 });
    expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
    expect(emailLibMock.sendEmail).not.toHaveBeenCalled();
  });

  it('invalidates old tokens, creates a new one, sends the email and returns success', async () => {
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    prismaMock.passwordResetToken.create.mockResolvedValue({} as any);

    const result = await requestPasswordReset('test@example.com');

    expect(result).toEqual({ success: true, waitSeconds: 60 });
    expect(prismaMock.passwordResetToken.updateMany).toHaveBeenCalledWith({
      where: { email: 'test@example.com', used: false },
      data: { used: true },
    });
    expect(prismaMock.passwordResetToken.create).toHaveBeenCalledWith({
      data: { email: 'test@example.com', code: '654321', expiresAt: new Date('2027-01-01') },
    });
    expect(emailLibMock.sendEmail).toHaveBeenCalledTimes(1);
  });

  it('returns RATE_LIMIT when the caller sent too many requests', async () => {
    (getRateLimitWait as jest.Mock).mockResolvedValue(120);

    await expect(requestPasswordReset('test@example.com')).resolves.toEqual({
      success: false,
      error: 'RATE_LIMIT',
      waitSeconds: 120,
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('allows one code per minute per email, whether or not the account exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await requestPasswordReset('unknown@example.com');
    const second = await requestPasswordReset('Unknown@Example.com');

    expect(second).toEqual({
      success: false,
      error: 'RATE_LIMIT',
      waitSeconds: expect.any(Number),
    });
  });

  it('returns SEND_FAILED when the email cannot be sent', async () => {
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    emailLibMock.sendEmail.mockRejectedValue(new Error('Error al enviar el email'));

    await expect(requestPasswordReset('test@example.com')).resolves.toEqual({
      success: false,
      error: 'SEND_FAILED',
    });
  });
});
