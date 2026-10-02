import bcrypt from 'bcryptjs';
import { prismaMock } from '@/test/prisma';
import { getRateLimitWait } from '@/lib/rate-limit';
import { findValidPasswordResetToken } from '@/lib/verification-codes';
import { completePasswordReset } from './complete-password-reset';

jest.mock('bcryptjs');
jest.mock('@/lib/verification-codes', () => ({ findValidPasswordResetToken: jest.fn() }));

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('completePasswordReset', () => {
  beforeEach(() => {
    (getRateLimitWait as jest.Mock).mockResolvedValue(0);
    (findValidPasswordResetToken as jest.Mock).mockResolvedValue({ id: 'token-reset-1' });
  });

  it('rejects a new password shorter than 8 characters before touching the token', async () => {
    await expect(completePasswordReset('test@example.com', '654321', 'short')).resolves.toEqual({
      success: false,
      error: 'WEAK_PASSWORD',
      message: 'La contraseña debe tener al menos 8 caracteres',
    });
    expect(findValidPasswordResetToken).not.toHaveBeenCalled();
  });

  it('returns INVALID_CODE when the code is no longer valid', async () => {
    (findValidPasswordResetToken as jest.Mock).mockResolvedValue(null);

    await expect(completePasswordReset('test@example.com', '000000', 'NewP@ss12')).resolves.toEqual(
      { success: false, error: 'INVALID_CODE' },
    );
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('returns INVALID_CODE when the account no longer exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(completePasswordReset('test@example.com', '654321', 'NewP@ss12')).resolves.toEqual(
      { success: false, error: 'INVALID_CODE' },
    );
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('hashes the password at cost 12, uses the token, signs out everywhere and succeeds', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' } as any);
    bcryptMock.hash.mockResolvedValue('new-hash' as never);
    prismaMock.$transaction.mockResolvedValue([] as any);

    const result = await completePasswordReset('test@example.com', '654321', 'NewP@ss12');

    expect(result).toEqual({ success: true });
    expect(bcryptMock.hash).toHaveBeenCalledWith('NewP@ss12', 12);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { password: 'new-hash' },
    });
    expect(prismaMock.passwordResetToken.update).toHaveBeenCalledWith({
      where: { id: 'token-reset-1' },
      data: { used: true },
    });
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });

  it('returns RATE_LIMIT before doing anything when the caller is over the limit', async () => {
    (getRateLimitWait as jest.Mock).mockResolvedValue(30);

    await expect(completePasswordReset('test@example.com', '654321', 'NewP@ss12')).resolves.toEqual(
      { success: false, error: 'RATE_LIMIT', waitSeconds: 30 },
    );
    expect(findValidPasswordResetToken).not.toHaveBeenCalled();
  });
});
