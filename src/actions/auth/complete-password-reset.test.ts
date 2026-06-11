import bcrypt from 'bcryptjs';
import { prismaMock } from '@/test/prisma';
import { completePasswordReset } from './complete-password-reset';

jest.mock('bcryptjs');

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

const baseUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'old-hash',
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

const validToken = {
  id: 'token-reset-1',
  email: 'test@example.com',
  code: '654321',
  used: false,
  expiresAt: new Date('2027-01-01'),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

describe('completePasswordReset', () => {
  it('throws when the token is not found', async () => {
    prismaMock.passwordResetToken.findFirst.mockResolvedValue(null);

    await expect(completePasswordReset('test@example.com', '000000', 'NewP@ss1')).rejects.toThrow(
      'Código inválido o expirado. Solicitá un nuevo código.',
    );

    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('throws when the user is not found despite a valid token', async () => {
    prismaMock.passwordResetToken.findFirst.mockResolvedValue(validToken as any);
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(completePasswordReset('test@example.com', '654321', 'NewP@ss1')).rejects.toThrow(
      'Usuario no encontrado',
    );

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('hashes the password, runs the transaction, and returns success', async () => {
    prismaMock.passwordResetToken.findFirst.mockResolvedValue(validToken as any);
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    bcryptMock.hash.mockResolvedValue('new-hash' as never);
    prismaMock.$transaction.mockResolvedValue([undefined, undefined, undefined] as any);

    const result = await completePasswordReset('test@example.com', '654321', 'NewP@ss1');

    expect(result).toEqual({ success: true });
    expect(bcryptMock.hash).toHaveBeenCalledWith('NewP@ss1', 10);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });
});
