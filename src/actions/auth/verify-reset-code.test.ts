import { getRateLimitWait } from '@/lib/rate-limit';
import { findValidPasswordResetToken } from '@/lib/verification-codes';
import { verifyResetCode } from './verify-reset-code';

// El tope de intentos por código está cubierto en src/lib/verification-codes.test.ts
jest.mock('@/lib/verification-codes', () => ({ findValidPasswordResetToken: jest.fn() }));

describe('verifyResetCode', () => {
  beforeEach(() => {
    (getRateLimitWait as jest.Mock).mockResolvedValue(0);
  });

  it('returns INVALID_CODE when the code does not match an active token', async () => {
    (findValidPasswordResetToken as jest.Mock).mockResolvedValue(null);

    await expect(verifyResetCode('test@example.com', '000000')).resolves.toEqual({
      success: false,
      error: 'INVALID_CODE',
    });
  });

  it('returns success when the code is valid', async () => {
    (findValidPasswordResetToken as jest.Mock).mockResolvedValue({ id: 'token-1' });

    await expect(verifyResetCode('test@example.com', '654321')).resolves.toEqual({
      success: true,
    });
    expect(findValidPasswordResetToken).toHaveBeenCalledWith('test@example.com', '654321');
  });

  it('returns RATE_LIMIT without checking the code when the caller is over the limit', async () => {
    (getRateLimitWait as jest.Mock).mockResolvedValue(90);

    await expect(verifyResetCode('test@example.com', '654321')).resolves.toEqual({
      success: false,
      error: 'RATE_LIMIT',
      waitSeconds: 90,
    });
    expect(findValidPasswordResetToken).not.toHaveBeenCalled();
  });
});
