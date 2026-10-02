import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { markErrorAsResolved } from './mark-as-resolved';

const adminUser = {
  id: 'user-admin',
  name: 'Admin',
  email: 'admin@pcn.com',
  password: 'hash',
  emailVerified: true,
  role: 'ADMIN' as const,
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
const adminSession = {
  id: 'session-admin',
  userId: 'user-admin',
  expires: new Date('2027-01-01'),
  user: adminUser,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};
const regularUser = { ...adminUser, id: 'user-regular', role: 'REGULAR' as const };
const regularSession = {
  ...adminSession,
  id: 'session-regular',
  userId: 'user-regular',
  user: regularUser,
};

describe('markErrorAsResolved', () => {
  it('throws when there is no session cookie', async () => {
    mockCookies();

    await expect(markErrorAsResolved('error-1')).rejects.toThrow('No autorizado');
    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'session-xxx' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(markErrorAsResolved('error-1')).rejects.toThrow(
      'Solo los administradores pueden marcar errores como resueltos',
    );
    expect(prismaMock.errorLog.update).not.toHaveBeenCalled();
  });

  it('throws when the session belongs to a non-admin user', async () => {
    mockCookies({ sessionId: regularSession.id });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);

    await expect(markErrorAsResolved('error-1')).rejects.toThrow(
      'Solo los administradores pueden marcar errores como resueltos',
    );
    expect(prismaMock.errorLog.update).not.toHaveBeenCalled();
  });

  it('updates the error log as resolved when called by an admin', async () => {
    mockCookies({ sessionId: adminSession.id });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.errorLog.update.mockResolvedValue({} as any);

    await markErrorAsResolved('error-42');

    expect(prismaMock.errorLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'error-42' },
        data: expect.objectContaining({
          resolved: true,
          resolvedBy: 'user-admin',
          resolvedAt: expect.any(Date),
        }),
      }),
    );
  });

  it('calls revalidatePath("/errores") after a successful update', async () => {
    mockCookies({ sessionId: adminSession.id });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.errorLog.update.mockResolvedValue({} as any);

    await markErrorAsResolved('error-42');

    expect(revalidatePath).toHaveBeenCalledWith('/errores');
  });
});
