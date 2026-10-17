import { prismaMock } from '@/test/prisma';
import {
  MAX_CODE_ATTEMPTS,
  findValidEmailVerificationToken,
  findValidPasswordResetToken,
} from './verification-codes';

const token = {
  id: 'token-1',
  email: 'test@example.com',
  code: '123456',
  used: false,
  attempts: 0,
  expiresAt: new Date('2027-01-01'),
  createdAt: new Date('2025-01-01'),
};

describe('findValidEmailVerificationToken', () => {
  it('returns null when there is no active token', async () => {
    prismaMock.emailVerificationToken.findFirst.mockResolvedValue(null);

    await expect(findValidEmailVerificationToken('test@example.com', '123456')).resolves.toBeNull();
    expect(prismaMock.emailVerificationToken.updateMany).not.toHaveBeenCalled();
  });

  it('reserves an attempt and returns the token when the code matches', async () => {
    prismaMock.emailVerificationToken.findFirst.mockResolvedValue(token);
    prismaMock.emailVerificationToken.updateMany.mockResolvedValue({ count: 1 });

    await expect(findValidEmailVerificationToken('test@example.com', '123456')).resolves.toEqual(
      token,
    );
    expect(prismaMock.emailVerificationToken.updateMany).toHaveBeenCalledWith({
      where: { id: 'token-1', used: false, attempts: { lt: MAX_CODE_ATTEMPTS } },
      data: { attempts: { increment: 1 } },
    });
  });

  it('gives the attempt back when the code matches', async () => {
    prismaMock.emailVerificationToken.findFirst.mockResolvedValue(token);
    prismaMock.emailVerificationToken.updateMany.mockResolvedValue({ count: 1 });

    await findValidEmailVerificationToken('test@example.com', '123456');

    expect(prismaMock.emailVerificationToken.update).toHaveBeenCalledWith({
      where: { id: 'token-1' },
      data: { attempts: { decrement: 1 } },
    });
  });

  it('returns null and keeps the attempt spent when the code is wrong', async () => {
    prismaMock.emailVerificationToken.findFirst.mockResolvedValue(token);
    prismaMock.emailVerificationToken.updateMany.mockResolvedValue({ count: 1 });

    await expect(findValidEmailVerificationToken('test@example.com', '000000')).resolves.toBeNull();
    expect(prismaMock.emailVerificationToken.updateMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.emailVerificationToken.update).not.toHaveBeenCalled();
  });

  it('rejects even the right code once the attempts are used up', async () => {
    prismaMock.emailVerificationToken.findFirst.mockResolvedValue({
      ...token,
      attempts: MAX_CODE_ATTEMPTS,
    });
    prismaMock.emailVerificationToken.updateMany.mockResolvedValue({ count: 0 });

    await expect(findValidEmailVerificationToken('test@example.com', '123456')).resolves.toBeNull();
  });
});

describe('findValidPasswordResetToken', () => {
  it('returns the token when the code matches and attempts remain', async () => {
    prismaMock.passwordResetToken.findFirst.mockResolvedValue(token);
    prismaMock.passwordResetToken.updateMany.mockResolvedValue({ count: 1 });

    await expect(findValidPasswordResetToken('test@example.com', '123456')).resolves.toEqual(token);
  });

  it('rejects the right code once the attempts are used up', async () => {
    prismaMock.passwordResetToken.findFirst.mockResolvedValue(token);
    prismaMock.passwordResetToken.updateMany.mockResolvedValue({ count: 0 });

    await expect(findValidPasswordResetToken('test@example.com', '123456')).resolves.toBeNull();
  });

  it('lets the same right code pass both reset steps after four wrong guesses', async () => {
    // Simula la fila real: el tope se aplica sobre `attempts` como lo haría Postgres
    const row = { ...token, attempts: 0 };
    (prismaMock.passwordResetToken.findFirst as jest.Mock).mockImplementation(async () => ({
      ...row,
    }));
    (prismaMock.passwordResetToken.updateMany as jest.Mock).mockImplementation(async () => {
      if (row.attempts >= MAX_CODE_ATTEMPTS) return { count: 0 };
      row.attempts += 1;
      return { count: 1 };
    });
    (prismaMock.passwordResetToken.update as jest.Mock).mockImplementation(async () => {
      row.attempts -= 1;
      return row;
    });

    for (const wrong of ['000001', '000002', '000003', '000004']) {
      await expect(findValidPasswordResetToken('test@example.com', wrong)).resolves.toBeNull();
    }

    // verifyResetCode y después completePasswordReset validan el mismo código
    await expect(findValidPasswordResetToken('test@example.com', '123456')).resolves.not.toBeNull();
    await expect(findValidPasswordResetToken('test@example.com', '123456')).resolves.not.toBeNull();

    // Un quinto error agota el código: después ni el correcto pasa
    await expect(findValidPasswordResetToken('test@example.com', '000005')).resolves.toBeNull();
    await expect(findValidPasswordResetToken('test@example.com', '123456')).resolves.toBeNull();
  });
});
