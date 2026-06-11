import { prismaMock } from '@/test/prisma';
import { verifyResetCode } from './verify-reset-code';

const validToken = {
  id: 'token-reset-1',
  email: 'test@example.com',
  code: '654321',
  used: false,
  expiresAt: new Date('2027-01-01'),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

describe('verifyResetCode', () => {
  it('throws when the token is not found', async () => {
    prismaMock.passwordResetToken.findFirst.mockResolvedValue(null);

    await expect(verifyResetCode('test@example.com', '000000')).rejects.toThrow(
      'Código inválido o expirado',
    );
  });

  it('returns success with the tokenId when a valid token is found', async () => {
    prismaMock.passwordResetToken.findFirst.mockResolvedValue(validToken as any);

    const result = await verifyResetCode('test@example.com', '654321');

    expect(result).toEqual({ success: true, tokenId: 'token-reset-1' });
  });
});
